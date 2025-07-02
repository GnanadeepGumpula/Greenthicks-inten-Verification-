"use client"

import type React from "react"
import { X, User, Mail, Phone, Calendar, Edit, UserPlus, AlertTriangle } from "lucide-react"
import type { Intern } from "../types"

interface DuplicateInternModalProps {
  duplicates: Intern[]
  onClose: () => void
  onEditExisting: (intern: Intern) => void
  onCreateNew: () => void
}

const DuplicateInternModal: React.FC<DuplicateInternModalProps> = ({
  duplicates,
  onClose,
  onEditExisting,
  onCreateNew,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-6 w-6 text-yellow-500" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Duplicate Intern Detected</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-6">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <div>
                <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-300 mb-2">
                  Similar Intern(s) Found
                </h3>
                <p className="text-yellow-700 dark:text-yellow-400">
                  We found {duplicates.length} existing intern{duplicates.length > 1 ? "s" : ""} with similar
                  information. You can either edit the existing intern to add new fields or create a completely new
                  intern profile.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
              Existing Intern{duplicates.length > 1 ? "s" : ""}:
            </h4>

            {duplicates.map((intern) => (
              <div
                key={intern.id}
                className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
              >
                <div className="flex items-start space-x-4">
                  <img
                    src={intern.photo || "/placeholder.svg"}
                    alt={`${intern.firstName} ${intern.lastName}`}
                    className="w-16 h-16 rounded-full object-cover border-2 border-gray-300 dark:border-gray-600"
                  />
                  <div className="flex-1">
                    <h5 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {intern.firstName} {intern.lastName}
                    </h5>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-blue-500" />
                        <span className="text-gray-600 dark:text-gray-300">ID: {intern.uniqueId}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-green-500" />
                        <span className="text-gray-600 dark:text-gray-300">{intern.email}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-purple-500" />
                        <span className="text-gray-600 dark:text-gray-300">{intern.phoneNumber}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-orange-500" />
                        <span className="text-gray-600 dark:text-gray-300">
                          DOB: {new Date(intern.dateOfBirth).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        <span className="font-medium">{intern.internshipFields.length}</span> internship field
                        {intern.internshipFields.length !== 1 ? "s" : ""} •
                        <span className="font-medium ml-1">{intern.totalOnlineWeeks + intern.totalOfflineWeeks}</span>{" "}
                        total weeks
                      </div>

                      <button
                        onClick={() => onEditExisting(intern)}
                        className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                        <span>Edit This Intern</span>
                      </button>
                    </div>

                    {/* Show internship fields */}
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Fields:</p>
                      <div className="flex flex-wrap gap-2">
                        {intern.internshipFields.slice(0, 3).map((field) => (
                          <span
                            key={field.id}
                            className={`px-2 py-1 rounded-md text-xs ${
                              field.completed
                                ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                                : "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300"
                            }`}
                          >
                            {field.fieldName} ({field.type})
                          </span>
                        ))}
                        {intern.internshipFields.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md text-xs">
                            +{intern.internshipFields.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>

            <button
              onClick={onCreateNew}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <UserPlus className="h-5 w-5" />
              <span>Create New Intern Anyway</span>
            </button>
          </div>

          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">💡 Recommendation:</h4>
            <p className="text-sm text-blue-700 dark:text-blue-400">
              If this is the same person returning for additional internship fields, we recommend editing the existing
              profile to maintain a complete history. Only create a new profile if this is genuinely a different person.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DuplicateInternModal
