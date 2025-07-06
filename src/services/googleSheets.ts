import { googleAuthService } from "./googleAuth";
import type { Intern, InternshipField } from "../types";

export class GoogleSheetsService {
  private spreadsheetId: string;

  constructor(spreadsheetId: string) {
    this.spreadsheetId = spreadsheetId;
  }

  private async makeRequest(url: string, options: RequestInit = {}) {
    try {
      const headers = await googleAuthService.getAuthHeaders();
      console.log("Request URL:", url);
      console.log("Request Options:", options);
      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...headers,
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Response error text:", errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Google Sheets API error:", error);
      throw error;
    }
  }

  async getSheetId(sheetName: string): Promise<number | null> {
    try {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}`;
      const data = await this.makeRequest(url);
      const sheet = data.sheets.find((s: any) => s.properties.title === sheetName);
      if (!sheet) {
        throw new Error(`Sheet "${sheetName}" not found`);
      }
      return sheet.properties.sheetId;
    } catch (error) {
      console.error(`Error fetching sheet ID for ${sheetName}:`, error);
      throw error;
    }
  }

  async getAdminCredentials(): Promise<{ username: string; password: string }[]> {
    try {
      const range = "Admins!A:B";
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/${range}`;

      const data = await this.makeRequest(url);

      if (!data.values || data.values.length < 2) return [];

      const rows = data.values.slice(1); // Skip header row
      return rows.map((row: string[]) => ({
        username: row[0] || "",
        password: row[1] || "",
      }));
    } catch (error) {
      console.error("Error fetching admin credentials:", error);
      throw error;
    }
  }

  async getInterns(): Promise<Intern[]> {
    try {
      const range = "Interns!A:O";
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/${range}`;

      const data = await this.makeRequest(url);

      if (!data.values || data.values.length < 2) return [];

      const headers = data.values[0];
      const rows = data.values.slice(1);

      const interns = await Promise.all(
        rows.map(async (row: string[]) => {
          const intern: any = {};
          headers.forEach((header: string, index: number) => {
            intern[header] = row[index] || "";
          });

          intern.totalOfflineWeeks = parseInt(intern.totalOfflineWeeks) || 0;
          intern.totalOnlineWeeks = parseInt(intern.totalOnlineWeeks) || 0;
          intern.internshipFields = await this.getInternshipFields(intern.id);

          return intern as Intern;
        })
      );

      return interns;
    } catch (error) {
      console.error("Error fetching interns:", error);
      throw error;
    }
  }

  async getInternshipFields(internId: string): Promise<InternshipField[]> {
    try {
      const range = "InternshipFields!A:M";
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/${range}`;

      const data = await this.makeRequest(url);

      if (!data.values || data.values.length < 2) return [];

      const headers = data.values[0];
      const rows = data.values.slice(1);

      const fields = rows
        .filter((row: string[]) => row[1] === internId)
        .map((row: string[]) => {
          const field: any = {};
          headers.forEach((header: string, index: number) => {
            field[header] = row[index] || "";
          });

          field.projectLinks = field.projectLinks
            ? field.projectLinks.split(",").map((link: string) => link.trim())
            : [];
          field.videoLinks = field.videoLinks
            ? field.videoLinks.split(",").map((link: string) => link.trim())
            : [];

          field.completed = field.completed === "TRUE";
          field.certificateIssued = field.certificateIssued === "TRUE";

          return field as InternshipField;
        });

      return fields;
    } catch (error) {
      console.error("Error fetching internship fields:", error);
      throw error;
    }
  }

  async addIntern(internData: Omit<Intern, "id" | "internshipFields">): Promise<string | null> {
    try {
      const newId = Date.now().toString();
      const range = "Interns!A:O";

      const values = [
        [
          newId,
          internData.uniqueId,
          internData.firstName,
          internData.lastName,
          internData.email,
          internData.phoneNumber,
          internData.dateOfBirth,
          internData.fatherName,
          internData.motherName,
          internData.photo,
          internData.linkedinProfile,
          internData.totalOfflineWeeks.toString(),
          internData.totalOnlineWeeks.toString(),
          internData.createdAt,
        ],
      ];

      const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/${range}:append?valueInputOption=RAW`;

      await this.makeRequest(url, {
        method: "POST",
        body: JSON.stringify({ values }),
      });

      return newId;
    } catch (error) {
      console.error("Error adding intern:", error);
      return null;
    }
  }

  async addInternshipField(internId: string, fieldData: Omit<InternshipField, "id">): Promise<boolean> {
    try {
      const newId = Date.now().toString();
      const range = "InternshipFields!A:M";

      const values = [
        [
          newId,
          internId,
          fieldData.fieldName,
          fieldData.startDate,
          fieldData.endDate || "",
          fieldData.duration || "",
          fieldData.type,
          fieldData.projectLinks.join(","),
          fieldData.videoLinks.join(","),
          fieldData.description,
          fieldData.completed ? "TRUE" : "FALSE",
          fieldData.completedDate || "",
          fieldData.certificateIssued ? "TRUE" : "FALSE",
        ],
      ];

      const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/${range}:append?valueInputOption=RAW`;

      await this.makeRequest(url, {
        method: "POST",
        body: JSON.stringify({ values }),
      });

      return true;
    } catch (error) {
      console.error("Error adding internship field:", error);
      return false;
    }
  }

  async deleteIntern(internId: string): Promise<boolean> {
    try {
      // First, delete all internship fields for this intern
      await this.deleteInternshipFieldsByInternId(internId);

      // Then delete the intern record
      const range = "Interns!A:O";
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/${range}`;

      const data = await this.makeRequest(url);

      if (!data.values || data.values.length < 2) {
        throw new Error("No intern data found");
      }

      // Find the row index for this intern
      const rowIndex = data.values.findIndex((row: string[], index: number) => index > 0 && row[0] === internId);

      if (rowIndex === -1) {
        throw new Error(`Intern with ID ${internId} not found`);
      }

      // Get the sheetId for Interns
      const sheetId = await this.getSheetId("Interns");
      if (sheetId === null) {
        throw new Error("Invalid sheetId for Interns");
      }

      // Delete the row
      const deleteUrl = `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}:batchUpdate`;

      await this.makeRequest(deleteUrl, {
        method: "POST",
        body: JSON.stringify({
          requests: [
            {
              deleteDimension: {
                range: {
                  sheetId,
                  dimension: "ROWS",
                  startIndex: rowIndex,
                  endIndex: rowIndex + 1,
                },
              },
            },
          ],
        }),
      });

      return true;
    } catch (error) {
      console.error("Error deleting intern:", error);
      throw error;
    }
  }

  async deleteInternshipField(fieldId: string): Promise<boolean> {
    try {
      const range = "InternshipFields!A:M";
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/${range}`;

      const data = await this.makeRequest(url);

      if (!data.values || data.values.length < 2) {
        throw new Error("No internship field data found");
      }

      // Find the row index for this field
      const rowIndex = data.values.findIndex((row: string[], index: number) => index > 0 && row[0] === fieldId);

      if (rowIndex === -1) {
        throw new Error(`Internship field with ID ${fieldId} not found`);
      }

      // Get the sheetId for InternshipFields
      const sheetId = await this.getSheetId("InternshipFields");
      if (sheetId === null) {
        throw new Error("Invalid sheetId for InternshipFields");
      }

      // Delete the row
      const deleteUrl = `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}:batchUpdate`;

      await this.makeRequest(deleteUrl, {
        method: "POST",
        body: JSON.stringify({
          requests: [
            {
              deleteDimension: {
                range: {
                  sheetId,
                  dimension: "ROWS",
                  startIndex: rowIndex,
                  endIndex: rowIndex + 1,
                },
              },
            },
          ],
        }),
      });

      return true;
    } catch (error) {
      console.error("Error deleting internship field:", error);
      throw error;
    }
  }

  private async deleteInternshipFieldsByInternId(internId: string): Promise<void> {
    try {
      const fields = await this.getInternshipFields(internId);
      for (const field of fields) {
        await this.deleteInternshipField(field.id);
        await new Promise((resolve) => setTimeout(resolve, 100)); // 100ms delay to avoid rate limits
      }
    } catch (error) {
      console.error("Error deleting internship fields by intern ID:", error);
      throw error;
    }
  }

  async getInternByUniqueId(uniqueId: string): Promise<Intern | null> {
    try {
      const interns = await this.getInterns();
      return interns.find((intern) => intern.uniqueId === uniqueId) || null;
    } catch (error) {
      console.error("Error fetching intern by unique ID:", error);
      throw error;
    }
  }

  async updateIntern(internId: string, internData: Partial<Omit<Intern, "id" | "internshipFields">>): Promise<boolean> {
    try {
      const range = "Interns!A:O";
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/${range}`;

      const data = await this.makeRequest(url);

      if (!data.values || data.values.length < 2) {
        throw new Error("No intern data found");
      }

      // Find the row index for this intern
      const rowIndex = data.values.findIndex((row: string[], index: number) => index > 0 && row[0] === internId);

      if (rowIndex === -1) {
        throw new Error(`Intern with ID ${internId} not found`);
      }

      // Update the row data
      const updatedRow = [
        internId,
        data.values[rowIndex][1],
        internData.firstName || data.values[rowIndex][2],
        internData.lastName || data.values[rowIndex][3],
        internData.email || data.values[rowIndex][4],
        internData.phoneNumber || data.values[rowIndex][5],
        internData.dateOfBirth || data.values[rowIndex][6],
        internData.fatherName || data.values[rowIndex][7],
        internData.motherName || data.values[rowIndex][8],
        internData.photo || data.values[rowIndex][9],
        internData.linkedinProfile || data.values[rowIndex][10],
        (internData.totalOfflineWeeks !== undefined
          ? internData.totalOfflineWeeks
          : parseInt(data.values[rowIndex][11]) || 0
        ).toString(),
        (internData.totalOnlineWeeks !== undefined
          ? internData.totalOnlineWeeks
          : parseInt(data.values[rowIndex][12]) || 0
        ).toString(),
        internData.certificateIssued !== undefined
          ? internData.certificateIssued
            ? "TRUE"
            : "FALSE"
          : data.values[rowIndex][13],
        data.values[rowIndex][14],
      ];

      const updateUrl = `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/Interns!A${rowIndex + 1}:O${rowIndex + 1}?valueInputOption=RAW`;

      await this.makeRequest(updateUrl, {
        method: "PUT",
        body: JSON.stringify({ values: [updatedRow] }),
      });

      return true;
    } catch (error) {
      console.error("Error updating intern:", error);
      throw error;
    }
  }

  async updateInternshipField(fieldId: string, fieldData: Omit<InternshipField, "id">): Promise<boolean> {
    try {
      const range = "InternshipFields!A:M";
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/${range}`;

      const data = await this.makeRequest(url);

      if (!data.values || data.values.length < 2) {
        throw new Error("No internship field data found");
      }

      // Find the row index for this field
      const rowIndex = data.values.findIndex((row: string[], index: number) => index > 0 && row[0] === fieldId);

      if (rowIndex === -1) {
        throw new Error(`Internship field with ID ${fieldId} not found`);
      }

      // Update the row data
      const updatedRow = [
        fieldId,
        data.values[rowIndex][1],
        fieldData.fieldName,
        fieldData.startDate,
        fieldData.endDate || "",
        fieldData.duration || "",
        fieldData.type,
        fieldData.projectLinks.join(","),
        fieldData.videoLinks.join(","),
        fieldData.description,
        fieldData.completed ? "TRUE" : "FALSE",
        fieldData.completedDate || "",
        fieldData.certificateIssued ? "TRUE" : "FALSE",
      ];

      const updateUrl = `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/InternshipFields!A${rowIndex + 1}:M${rowIndex + 1}?valueInputOption=RAW`;

      await this.makeRequest(updateUrl, {
        method: "PUT",
        body: JSON.stringify({ values: [updatedRow] }),
      });

      return true;
    } catch (error) {
      console.error("Error updating internship field:", error);
      throw error;
    }
  }
}

export const googleSheetsService = new GoogleSheetsService(import.meta.env.VITE_GOOGLE_SPREADSHEET_ID || "");