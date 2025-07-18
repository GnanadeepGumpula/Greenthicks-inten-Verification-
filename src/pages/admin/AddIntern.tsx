"use client";

import type React from "react";
import { useState, useRef } from "react";
import { Plus, Trash2, Save, User, Mail, Calendar, Users, CheckCircle, Clock, FileText, Image } from "lucide-react";
import type { InternshipField, Intern } from "../../types";
import { googleSheetsService } from "../../services/googleSheets";
import { googleDriveService } from "../../services/googleDrive";
import DuplicateInternModal from "../../components/DuplicateInternModal";
import { useNavigate } from "react-router-dom";

const AddIntern: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    dateOfBirth: "",
    fatherName: "",
    motherName: "",
    photo: "",
    linkedinProfile: "",
    totalOfflineWeeks: 0,
    totalOnlineWeeks: 0,
  });

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [photoUrl, setPhotoUrl] = useState<string>("");
  const [photoError, setPhotoError] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [duplicates, setDuplicates] = useState<Intern[]>([]);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [pendingSubmit, setPendingSubmit] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [internshipFields, setInternshipFields] = useState<Partial<InternshipField>[]>([
    {
      fieldName: "",
      startDate: "",
      endDate: "",
      duration: "",
      type: "online",
      projectLinks: [""],
      videoLinks: [""],
      description: "",
      completed: false,
      certificateIssued: false,
    },
  ]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name.includes("Weeks") ? parseInt(value) || 0 : value,
    }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPhotoUrl("");
      setPhotoError("");
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setPhotoFile(file);
      setPhotoUrl("");
      setPhotoError("");
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      alert("Please drop a valid image file");
    }
  };

  const extractGoogleDriveId = (url: string): string | null => {
    const patterns = [
      /\/file\/d\/([a-zA-Z0-9_-]+)/, // Standard sharing link: https://drive.google.com/file/d/<fileId>/view
      /id=([a-zA-Z0-9_-]+)/, // Alternative link: https://drive.google.com/open?id=<fileId>
      /thumbnail\?id=([a-zA-Z0-9_-]+)/, // Thumbnail link: https://drive.google.com/thumbnail?id=<fileId>
      /^([a-zA-Z0-9_-]+)$/, // Direct file ID
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const handlePhotoUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setPhotoUrl(url);
    setPhotoFile(null);
    setPhotoError("");

    if (!url) {
      setPhotoPreview("");
      return;
    }

    const googleDriveId = extractGoogleDriveId(url);
    if (googleDriveId) {
      const thumbnailUrl = `https://drive.google.com/thumbnail?id=${googleDriveId}&sz=w300-h300`;
      setPhotoPreview(thumbnailUrl);
    } else if (url.startsWith("http")) {
      setPhotoPreview(url);
    } else {
      setPhotoError("Invalid URL format. Please provide a valid Google Drive or direct image URL.");
      setPhotoPreview("");
    }
  };

  const handleImageError = () => {
    setPhotoError(
      "Failed to load Google Drive image. Ensure the file is shared with 'Anyone with the link' and is a valid image."
    );
    setPhotoPreview("");
  };

  const handleFieldChange = (index: number, field: string, value: string | boolean) => {
    setInternshipFields((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };

      if ((field === "startDate" || field === "endDate" || field === "completed") && updated[index].startDate) {
        const currentField = updated[index];

        if (field === "completed" && value === true && !currentField.endDate) {
          currentField.endDate = new Date().toISOString().split("T")[0];
          currentField.completedDate = new Date().toISOString();
        }

        if (currentField.startDate && currentField.endDate) {
          const start = new Date(currentField.startDate);
          const end = new Date(currentField.endDate);

          if (end >= start) {
            const diffTime = end.getTime() - start.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const diffWeeks = Math.ceil(diffDays / 7);
            currentField.duration = `${diffWeeks} weeks`;
          }
        }

        if (field === "completed" && value === false) {
          currentField.endDate = "";
          currentField.duration = "";
          currentField.completedDate = "";
          currentField.certificateIssued = false;
        }
      }

      const totalOnlineWeeks = updated
        .filter((f) => f.type === "online" && f.completed && f.duration)
        .reduce((acc, f) => acc + (parseInt(f.duration?.split(" ")[0] || "0") || 0), 0);

      const totalOfflineWeeks = updated
        .filter((f) => f.type === "offline" && f.completed && f.duration)
        .reduce((acc, f) => acc + (parseInt(f.duration?.split(" ")[0] || "0") || 0), 0);

      setFormData((prev) => ({
        ...prev,
        totalOnlineWeeks,
        totalOfflineWeeks,
      }));

      return updated;
    });
  };

  const handleArrayFieldChange = (
    fieldIndex: number,
    arrayField: "projectLinks" | "videoLinks",
    linkIndex: number,
    value: string,
  ) => {
    setInternshipFields((prev) => {
      const updated = [...prev];
      const currentArray = updated[fieldIndex][arrayField] || [];
      const newArray = [...currentArray];
      newArray[linkIndex] = value;
      updated[fieldIndex] = { ...updated[fieldIndex], [arrayField]: newArray };
      return updated;
    });
  };

  const addArrayField = (fieldIndex: number, arrayField: "projectLinks" | "videoLinks") => {
    setInternshipFields((prev) => {
      const updated = [...prev];
      const currentArray = updated[fieldIndex][arrayField] || [];
      updated[fieldIndex] = { ...updated[fieldIndex], [arrayField]: [...currentArray, ""] };
      return updated;
    });
  };

  const removeArrayField = (fieldIndex: number, arrayField: "projectLinks" | "videoLinks", linkIndex: number) => {
    setInternshipFields((prev) => {
      const updated = [...prev];
      const currentArray = updated[fieldIndex][arrayField] || [];
      const newArray = currentArray.filter((_, i) => i !== linkIndex);
      updated[fieldIndex] = { ...updated[fieldIndex], [arrayField]: newArray };
      return updated;
    });
  };

  const addInternshipField = () => {
    setInternshipFields((prev) => [
      ...prev,
      {
        fieldName: "",
        startDate: "",
        endDate: "",
        duration: "",
        type: "online",
        projectLinks: [""],
        videoLinks: [""],
        description: "",
        completed: false,
        certificateIssued: false,
      },
    ]);
  };

  const removeInternshipField = (index: number) => {
    setInternshipFields((prev) => prev.filter((_, i) => i !== index));
  };

  const handleIssueCertificate = async (fieldIndex: number) => {
    try {
      setUploading(true);
      setInternshipFields((prev) => {
        const updated = [...prev];
        updated[fieldIndex] = { ...updated[fieldIndex], certificateIssued: true };
        return updated;
      });
      alert(`Certificate issued for ${internshipFields[fieldIndex].fieldName}`);
    } catch (error) {
      console.error("Error issuing certificate:", error);
      alert("Failed to issue certificate. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const checkForDuplicates = async (
    email: string,
    phone: string,
    firstName: string,
    lastName: string,
  ): Promise<Intern[]> => {
    try {
      const allInterns = await googleSheetsService.getInterns();
      const matches = allInterns.filter((intern) => {
        const emailMatch = intern.email.toLowerCase() === email.toLowerCase();
        const phoneMatch = intern.phoneNumber === phone;
        const nameMatch =
          `${intern.firstName} ${intern.lastName}`.toLowerCase() === `${firstName} ${lastName}`.toLowerCase();
        return emailMatch || phoneMatch || nameMatch;
      });
      return matches;
    } catch (error) {
      console.error("Error checking for duplicates:", error);
      return [];
    }
  };

  const handleEditExisting = (intern: Intern) => {
    navigate(`/admin/edit-intern/${intern.id}`);
  };

  const handleCreateNew = () => {
    setShowDuplicateModal(false);
    setPendingSubmit(true);
    const form = document.querySelector("form");
    if (form) {
      form.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
    }
  };

  const handleCloseDuplicateModal = () => {
    setShowDuplicateModal(false);
    setDuplicates([]);
    setPendingSubmit(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!pendingSubmit) {
      const foundDuplicates = await checkForDuplicates(
        formData.email,
        formData.phoneNumber,
        formData.firstName,
        formData.lastName,
      );

      if (foundDuplicates.length > 0) {
        setDuplicates(foundDuplicates);
        setShowDuplicateModal(true);
        return;
      }
    }

    setUploading(true);

    try {
      const uniqueId = Math.random().toString().substr(2, 6);
      let photoFileId = formData.photo;

      if (photoFile) {
        const uploadedFileId = await googleDriveService.uploadPhoto(photoFile, uniqueId);
        if (uploadedFileId) {
          photoFileId = uploadedFileId;
        } else {
          throw new Error("Failed to upload photo");
        }
      } else if (photoUrl) {
        const googleDriveId = extractGoogleDriveId(photoUrl);
        photoFileId = googleDriveId || photoUrl;
      }

      const newInternData = {
        ...formData,
        uniqueId,
        photo: photoFileId,
        certificateIssued: false,
        createdAt: new Date().toISOString(),
      };

      const internId = await googleSheetsService.addIntern(newInternData);

      if (!internId) {
        throw new Error("Failed to add intern");
      }

      for (const field of internshipFields) {
        if (field.fieldName && field.startDate) {
          const fieldData = {
            ...field,
            projectLinks: field.projectLinks?.filter((link) => link.trim()) || [],
            videoLinks: field.videoLinks?.filter((link) => link.trim()) || [],
            completed: field.completed || false,
            certificateIssued: field.certificateIssued || false,
            completedDate: field.completed ? field.completedDate || new Date().toISOString() : undefined,
          } as Omit<InternshipField, "id">;

          await googleSheetsService.addInternshipField(internId, fieldData);
        }
      }

      alert(`Intern added successfully! Unique ID: ${uniqueId}`);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        dateOfBirth: "",
        fatherName: "",
        motherName: "",
        photo: "",
        linkedinProfile: "",
        totalOfflineWeeks: 0,
        totalOnlineWeeks: 0,
      });
      setPhotoFile(null);
      setPhotoPreview("");
      setPhotoUrl("");
      setPhotoError("");
      setInternshipFields([
        {
          fieldName: "",
          startDate: "",
          endDate: "",
          duration: "",
          type: "online",
          projectLinks: [""],
          videoLinks: [""],
          description: "",
          completed: false,
          certificateIssued: false,
        },
      ]);
    } catch (error) {
      console.error("Error adding intern:", error);
      alert("Failed to add intern. Please check your internet connection and try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Add New Intern</h1>
            <p className="text-gray-600 dark:text-gray-300">Fill in the details to create a new intern profile</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                <User className="h-5 w-5 mr-2 text-blue-500" />
                Personal Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Photo *</label>
                  <div className="space-y-3">
                    <div
                      className={`border-2 border-dashed rounded-lg p-6 text-center ${
                        isDragging
                          ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                          : "border-gray-300 dark:border-gray-600"
                      }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Image className="mx-auto h-8 w-8 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                        Drag and drop an image here, or click to select
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                        ref={fileInputRef}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Or enter image URL That Image should be in Google drive
                      </label>
                      <input
                        type="url"
                        value={photoUrl}
                        onChange={handlePhotoUrlChange}
                        placeholder="e.g., https://drive.google.com/file/d/..."
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                      {photoError && (
                        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{photoError}</p>
                      )}
                    </div>
                    {(photoPreview || photoUrl) && (
                      <div className="flex items-center space-x-3 mt-3">
                        <img
                          src={photoPreview || "/placeholder.svg"}
                          alt="Photo preview"
                          className="w-16 h-16 rounded-full object-cover border-2 border-green-200"
                          onError={handleImageError}
                        />
                        <span className="text-sm text-green-600 dark:text-green-400">
                          {photoFile
                            ? "✓ New photo selected"
                            : photoUrl
                            ? "✓ Image URL provided"
                            : "✓ Current photo"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                <Users className="h-5 w-5 mr-2 text-green-500" />
                Family Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Father's Name *
                  </label>
                  <input
                    type="text"
                    name="fatherName"
                    value={formData.fatherName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Mother's Name *
                  </label>
                  <input
                    type="text"
                    name="motherName"
                    value={formData.motherName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                <Mail className="h-5 w-5 mr-2 text-purple-500" />
                Professional Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    LinkedIn Profile
                  </label>
                  <input
                    type="url"
                    name="linkedinProfile"
                    value={formData.linkedinProfile}
                    onChange={handleInputChange}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Total Online Weeks (Auto-calculated)
                  </label>
                  <input
                    type="number"
                    name="totalOnlineWeeks"
                    value={formData.totalOnlineWeeks}
                    readOnly
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Total Offline Weeks (Auto-calculated)
                  </label>
                  <input
                    type="number"
                    name="totalOfflineWeeks"
                    value={formData.totalOfflineWeeks}
                    readOnly
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-orange-500" />
                  Internship Fields
                </h2>
                <button
                  type="button"
                  onClick={addInternshipField}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Field</span>
                </button>
              </div>
              {internshipFields.map((field, fieldIndex) => (
                <div
                  key={fieldIndex}
                  className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6 border border-gray-200 dark:border-gray-600"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Field {fieldIndex + 1}</h3>
                    <div className="flex items-center space-x-3">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={field.completed || false}
                          onChange={(e) => handleFieldChange(fieldIndex, "completed", e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
                        <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                          {field.completed ? (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                              Completed
                            </>
                          ) : (
                            <>
                              <Clock className="h-4 w-4 text-yellow-500 mr-1" />
                              In Progress
                            </>
                          )}
                        </span>
                      </label>
                      {internshipFields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeInternshipField(fieldIndex)}
                          className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Field Name *
                      </label>
                      <input
                        type="text"
                        value={field.fieldName || ""}
                        onChange={(e) => handleFieldChange(fieldIndex, "fieldName", e.target.value)}
                        required
                        placeholder="e.g., Frontend Development"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type *</label>
                      <select
                        value={field.type || "online"}
                        onChange={(e) => handleFieldChange(fieldIndex, "type", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="online">Online</option>
                        <option value="offline">Offline</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Start Date *
                      </label>
                      <input
                        type="date"
                        value={field.startDate || ""}
                        onChange={(e) => handleFieldChange(fieldIndex, "startDate", e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        End Date {field.completed ? "*" : "(Auto-filled when completed)"}
                      </label>
                      <input
                        type="date"
                        value={field.endDate || ""}
                        onChange={(e) => handleFieldChange(fieldIndex, "endDate", e.target.value)}
                        required={field.completed}
                        disabled={!field.completed}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Duration {field.completed ? "(Auto-calculated)" : "(Will be calculated when completed)"}
                      </label>
                      <input
                        type="text"
                        value={field.duration || ""}
                        onChange={(e) => handleFieldChange(fieldIndex, "duration", e.target.value)}
                        required={field.completed}
                        disabled={field.completed}
                        placeholder={field.completed ? "Auto-calculated" : "e.g., 12 weeks"}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={field.description || ""}
                      onChange={(e) => handleFieldChange(fieldIndex, "description", e.target.value)}
                      rows={3}
                      placeholder="Describe the internship activities and learning outcomes..."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Project Links
                      </label>
                      <button
                        type="button"
                        onClick={() => addArrayField(fieldIndex, "projectLinks")}
                        className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 text-sm"
                      >
                        + Add Link
                      </button>
                    </div>
                    {(field.projectLinks || [""]).map((link, linkIndex) => (
                      <div key={linkIndex} className="flex space-x-2 mb-2">
                        <input
                          type="url"
                          value={link}
                          onChange={(e) =>
                            handleArrayFieldChange(fieldIndex, "projectLinks", linkIndex, e.target.value)
                          }
                          placeholder="https://github.com/username/project"
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                        {(field.projectLinks?.length || 0) > 1 && (
                          <button
                            type="button"
                            onClick={() => removeArrayField(fieldIndex, "projectLinks", linkIndex)}
                            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Video Links</label>
                      <button
                        type="button"
                        onClick={() => addArrayField(fieldIndex, "videoLinks")}
                        className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 text-sm"
                      >
                        + Add Link
                      </button>
                    </div>
                    {(field.videoLinks || [""]).map((link, linkIndex) => (
                      <div key={linkIndex} className="flex space-x-2 mb-2">
                        <input
                          type="url"
                          value={link}
                          onChange={(e) => handleArrayFieldChange(fieldIndex, "videoLinks", linkIndex, e.target.value)}
                          placeholder="https://linkedin.com/posts/username/video"
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                        {(field.videoLinks?.length || 0) > 1 && (
                          <button
                            type="button"
                            onClick={() => removeArrayField(fieldIndex, "videoLinks", linkIndex)}
                            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    {field.completed && field.completedDate && (
                      <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <p className="text-sm text-green-700 dark:text-green-300">
                          ✓ Completed on {new Date(field.completedDate).toLocaleDateString()}
                        </p>
                        {field.certificateIssued ? (
                          <p className="text-sm text-green-700 dark:text-green-300 mt-2">
                            ✓ Certificate Issued
                          </p>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleIssueCertificate(fieldIndex)}
                            disabled={uploading}
                            className="mt-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                          >
                            <FileText className="h-4 w-4" />
                            <span>Issue Certificate</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={uploading}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-medium flex items-center space-x-2 transition-colors"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    <span>Save Intern</span>
                  </>
                )}
              </button>
            </div>
          </form>
          {showDuplicateModal && (
            <DuplicateInternModal
              duplicates={duplicates}
              onClose={handleCloseDuplicateModal}
              onEditExisting={handleEditExisting}
              onCreateNew={handleCreateNew}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AddIntern;