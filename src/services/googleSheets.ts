import { googleAuthService } from "./googleAuth"
import type { Intern, InternshipField } from "../types"

export class GoogleSheetsService {
  private spreadsheetId: string

  constructor(spreadsheetId: string) {
    this.spreadsheetId = spreadsheetId
  }

  private async makeRequest(url: string, options: RequestInit = {}) {
    try {
      const headers = await googleAuthService.getAuthHeaders()
      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...headers,
          ...options.headers,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Google Sheets API error:", error)
      throw error
    }
  }

  // Admin Authentication
  async getAdminCredentials(): Promise<{ username: string; password: string }[]> {
    try {
      const range = "Admins!A:B"
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/${range}`

      const data = await this.makeRequest(url)

      if (!data.values || data.values.length < 2) return []

      const rows = data.values.slice(1) // Skip header row
      return rows.map((row: string[]) => ({
        username: row[0] || "",
        password: row[1] || "",
      }))
    } catch (error) {
      console.error("Error fetching admin credentials:", error)
      return []
    }
  }

  // Intern Management
  async getInterns(): Promise<Intern[]> {
    try {
      const range = "Interns!A:O"
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/${range}`

      const data = await this.makeRequest(url)

      if (!data.values || data.values.length < 2) return []

      const headers = data.values[0]
      const rows = data.values.slice(1)

      const interns = await Promise.all(
        rows.map(async (row: string[]) => {
          const intern: any = {}
          headers.forEach((header: string, index: number) => {
            intern[header] = row[index] || ""
          })

          // Convert string values to appropriate types
          intern.totalOfflineWeeks = Number.parseInt(intern.totalOfflineWeeks) || 0
          intern.totalOnlineWeeks = Number.parseInt(intern.totalOnlineWeeks) || 0
          intern.certificateIssued = intern.certificateIssued === "TRUE"

          // Get internship fields for this intern
          intern.internshipFields = await this.getInternshipFields(intern.id)

          return intern as Intern
        }),
      )

      return interns
    } catch (error) {
      console.error("Error fetching interns:", error)
      return []
    }
  }

  async getInternshipFields(internId: string): Promise<InternshipField[]> {
    try {
      const range = "InternshipFields!A:L" // Extended to include completion fields
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/${range}`

      const data = await this.makeRequest(url)

      if (!data.values || data.values.length < 2) return []

      const headers = data.values[0]
      const rows = data.values.slice(1)

      const fields = rows
        .filter((row: string[]) => row[1] === internId) // Filter by internId
        .map((row: string[]) => {
          const field: any = {}
          headers.forEach((header: string, index: number) => {
            field[header] = row[index] || ""
          })

          // Parse arrays from comma-separated strings
          field.projectLinks = field.projectLinks
            ? field.projectLinks.split(",").map((link: string) => link.trim())
            : []
          field.videoLinks = field.videoLinks ? field.videoLinks.split(",").map((link: string) => link.trim()) : []

          // Convert completion status
          field.completed = field.completed === "TRUE"

          return field as InternshipField
        })

      return fields
    } catch (error) {
      console.error("Error fetching internship fields:", error)
      return []
    }
  }

  async addIntern(internData: Omit<Intern, "id" | "internshipFields">): Promise<string | null> {
    try {
      const newId = Date.now().toString()
      const range = "Interns!A:O"

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
          internData.certificateIssued ? "TRUE" : "FALSE",
          internData.createdAt,
        ],
      ]

      const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/${range}:append?valueInputOption=RAW`

      await this.makeRequest(url, {
        method: "POST",
        body: JSON.stringify({ values }),
      })

      return newId
    } catch (error) {
      console.error("Error adding intern:", error)
      return null
    }
  }

  async addInternshipField(internId: string, fieldData: Omit<InternshipField, "id">): Promise<boolean> {
    try {
      const newId = Date.now().toString()
      const range = "InternshipFields!A:L" // Extended range for completion fields

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
        ],
      ]

      const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/${range}:append?valueInputOption=RAW`

      await this.makeRequest(url, {
        method: "POST",
        body: JSON.stringify({ values }),
      })

      return true
    } catch (error) {
      console.error("Error adding internship field:", error)
      return false
    }
  }

  async deleteIntern(internId: string): Promise<boolean> {
    try {
      // First, delete all internship fields for this intern
      await this.deleteInternshipFieldsByInternId(internId)

      // Then delete the intern record
      const range = "Interns!A:O"
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/${range}`

      const data = await this.makeRequest(url)

      if (!data.values || data.values.length < 2) return false

      // Find the row index for this intern
      const rowIndex = data.values.findIndex((row: string[], index: number) => index > 0 && row[0] === internId)

      if (rowIndex === -1) return false

      // Delete the row (Google Sheets API uses 1-based indexing)
      const deleteUrl = `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}:batchUpdate`

      await this.makeRequest(deleteUrl, {
        method: "POST",
        body: JSON.stringify({
          requests: [
            {
              deleteDimension: {
                range: {
                  sheetId: 0, // Assuming Interns sheet is the first sheet
                  dimension: "ROWS",
                  startIndex: rowIndex,
                  endIndex: rowIndex + 1,
                },
              },
            },
          ],
        }),
      })

      return true
    } catch (error) {
      console.error("Error deleting intern:", error)
      return false
    }
  }

  async deleteInternshipField(fieldId: string): Promise<boolean> {
    try {
      const range = "InternshipFields!A:L"
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/${range}`

      const data = await this.makeRequest(url)

      if (!data.values || data.values.length < 2) return false

      // Find the row index for this field
      const rowIndex = data.values.findIndex((row: string[], index: number) => index > 0 && row[0] === fieldId)

      if (rowIndex === -1) return false

      // Delete the row
      const deleteUrl = `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}:batchUpdate`

      await this.makeRequest(deleteUrl, {
        method: "POST",
        body: JSON.stringify({
          requests: [
            {
              deleteDimension: {
                range: {
                  sheetId: 1, // Assuming InternshipFields sheet is the second sheet
                  dimension: "ROWS",
                  startIndex: rowIndex,
                  endIndex: rowIndex + 1,
                },
              },
            },
          ],
        }),
      })

      return true
    } catch (error) {
      console.error("Error deleting internship field:", error)
      return false
    }
  }

  private async deleteInternshipFieldsByInternId(internId: string): Promise<void> {
    try {
      const fields = await this.getInternshipFields(internId)

      // Delete each field
      for (const field of fields) {
        await this.deleteInternshipField(field.id)
      }
    } catch (error) {
      console.error("Error deleting internship fields by intern ID:", error)
    }
  }

  async getInternByUniqueId(uniqueId: string): Promise<Intern | null> {
    const interns = await this.getInterns()
    return interns.find((intern) => intern.uniqueId === uniqueId) || null
  }

  async updateIntern(internId: string, internData: Partial<Omit<Intern, "id" | "internshipFields">>): Promise<boolean> {
    try {
      const range = "Interns!A:O"
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/${range}`

      const data = await this.makeRequest(url)

      if (!data.values || data.values.length < 2) return false

      // Find the row index for this intern
      const rowIndex = data.values.findIndex((row: string[], index: number) => index > 0 && row[0] === internId)

      if (rowIndex === -1) return false

      // Update the row data
      const updatedRow = [
        internId, // Keep original ID
        data.values[rowIndex][1], // Keep original uniqueId
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
          : Number.parseInt(data.values[rowIndex][11]) || 0
        ).toString(),
        (internData.totalOnlineWeeks !== undefined
          ? internData.totalOnlineWeeks
          : Number.parseInt(data.values[rowIndex][12]) || 0
        ).toString(),
        internData.certificateIssued !== undefined
          ? internData.certificateIssued
            ? "TRUE"
            : "FALSE"
          : data.values[rowIndex][13],
        data.values[rowIndex][14], // Keep original createdAt
      ]

      const updateUrl = `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/Interns!A${rowIndex + 1}:O${rowIndex + 1}?valueInputOption=RAW`

      await this.makeRequest(updateUrl, {
        method: "PUT",
        body: JSON.stringify({ values: [updatedRow] }),
      })

      return true
    } catch (error) {
      console.error("Error updating intern:", error)
      return false
    }
  }

  async updateInternshipField(fieldId: string, fieldData: Omit<InternshipField, "id">): Promise<boolean> {
    try {
      const range = "InternshipFields!A:L"
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/${range}`

      const data = await this.makeRequest(url)

      if (!data.values || data.values.length < 2) return false

      // Find the row index for this field
      const rowIndex = data.values.findIndex((row: string[], index: number) => index > 0 && row[0] === fieldId)

      if (rowIndex === -1) return false

      // Update the row data
      const updatedRow = [
        fieldId, // Keep original ID
        data.values[rowIndex][1], // Keep original internId
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
      ]

      const updateUrl = `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/InternshipFields!A${rowIndex + 1}:L${rowIndex + 1}?valueInputOption=RAW`

      await this.makeRequest(updateUrl, {
        method: "PUT",
        body: JSON.stringify({ values: [updatedRow] }),
      })

      return true
    } catch (error) {
      console.error("Error updating internship field:", error)
      return false
    }
  }
}

export const googleSheetsService = new GoogleSheetsService(import.meta.env.VITE_GOOGLE_SPREADSHEET_ID || "")
