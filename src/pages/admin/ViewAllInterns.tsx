"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Search, Trash2, Edit, Eye, CheckCircle, AlertCircle, Users, Filter } from "lucide-react";
import { googleSheetsService } from "../../services/googleSheets";
import { googleDriveService } from "../../services/googleDrive";
import type { Intern, InternshipField } from "../../types"; // Ensure InternshipField is imported
import InternDetails from "../../components/InternDetails";
import { Link } from "react-router-dom";

const ViewAllInterns: React.FC = () => {
  const [interns, setInterns] = useState<Intern[]>([]);
  const [filteredInterns, setFilteredInterns] = useState<Intern[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedIntern, setSelectedIntern] = useState<Intern | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    loadInterns();
  }, []);

  useEffect(() => {
    filterInterns();
  }, [interns, searchTerm, statusFilter]);

  const loadInterns = async () => {
    try {
      setLoading(true);
      const internsData = await googleSheetsService.getInterns();

      // Convert Google Drive file IDs to viewable URLs
      const internsWithPhotos = internsData.map((intern) => ({
        ...intern,
        photo: intern.photo
          ? googleDriveService.getPhotoUrl(intern.photo)
          : "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=300",
      }));

      setInterns(internsWithPhotos); // Rely on Google Sheet order (newest at bottom)
    } catch (error: any) {
      console.error("Error loading interns:", error);
      alert(`Failed to load interns: ${error.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  const filterInterns = () => {
    // Start with all interns in reverse order (most recent first)
    let filtered = interns.slice().reverse();

    // Search filter
    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (intern) =>
          `${intern.firstName} ${intern.lastName}`.toLowerCase().includes(query) ||
          intern.uniqueId.toLowerCase().includes(query) ||
          intern.email.toLowerCase().includes(query) ||
          intern.phoneNumber.includes(query)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((intern) => {
        const completedFields = intern.internshipFields.filter((field) => field.completed).length;
        const totalFields = intern.internshipFields.length;
        const isCompleted = completedFields === totalFields && totalFields > 0;

        switch (statusFilter) {
          case "certified":
            return isCompleted;
          case "in-progress":
            return !isCompleted;
          case "completed-fields":
            return intern.internshipFields.some((field) => field.completed);
          case "no-completed-fields":
            return !intern.internshipFields.some((field) => field.completed);
          default:
            return true;
        }
      });
    }

    setFilteredInterns(filtered);
  };

  const handleDeleteIntern = async (internId: string) => {
    if (!confirm("Are you sure you want to delete this intern? This action cannot be undone.")) {
      return;
    }

    try {
      setDeleting(internId);
      const success = await googleSheetsService.deleteIntern(internId);

      if (success) {
        setInterns((prev) => prev.filter((intern) => intern.id !== internId));
        alert("Intern deleted successfully");
        await loadInterns(); // Reload to ensure UI is up-to-date
      } else {
        alert("Failed to delete intern. Please try again.");
      }
    } catch (error: any) {
      console.error("Error deleting intern:", error);
      alert(`Error deleting intern: ${error.message || "Unknown error"}`);
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading interns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">All Interns</h1>
            <p className="text-gray-600 dark:text-gray-300">Manage and view all intern records</p>
          </div>

          {/* Filters */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, ID, email, or phone..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Interns</option>
                <option value="certified">Certified</option>
                <option value="in-progress">In Progress</option>
                <option value="completed-fields">Has Completed Fields</option>
                <option value="no-completed-fields">No Completed Fields</option>
              </select>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{interns.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Total Interns</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {interns.filter((intern: Intern) =>
                  intern.internshipFields.length > 0 &&
                  intern.internshipFields.every((field: InternshipField) => field.completed)
                ).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Certified</div>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {interns.filter((intern: Intern) =>
                  intern.internshipFields.length > 0 &&
                  !intern.internshipFields.every((field: InternshipField) => field.completed)
                ).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">In Progress</div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{filteredInterns.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Filtered Results</div>
            </div>
          </div>

          {/* Interns Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Intern</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Contact</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Fields</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Progress</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInterns.map((intern) => {
                  const completedFields = intern.internshipFields.filter((field) => field.completed).length;
                  const totalFields = intern.internshipFields.length;
                  const isCompleted = completedFields === totalFields && totalFields > 0;

                  return (
                    <tr
                      key={intern.id}
                      className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={intern.photo || "/placeholder.svg"}
                            alt={`${intern.firstName} ${intern.lastName}`}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {intern.firstName} {intern.lastName}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">ID: {intern.uniqueId}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="text-sm">
                          <div className="text-gray-900 dark:text-white">{intern.email}</div>
                          <div className="text-gray-500 dark:text-gray-400">{intern.phoneNumber}</div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="text-sm">
                          <div className="text-gray-900 dark:text-white">{totalFields} total</div>
                          <div className="text-gray-500 dark:text-gray-400">
                            {intern.totalOnlineWeeks + intern.totalOfflineWeeks} weeks
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          {completedFields === totalFields && totalFields > 0 ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-yellow-500" />
                          )}
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {completedFields}/{totalFields} completed
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            isCompleted
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                          }`}
                        >
                          {isCompleted ? "Certified" : "In Progress"}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setSelectedIntern(intern)}
                            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 p-1"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          <Link
                            to={`/admin/edit-intern/${intern.id}`}
                            className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 p-1"
                            title="Edit Intern"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>

                          <button
                            onClick={() => handleDeleteIntern(intern.id)}
                            disabled={deleting === intern.id}
                            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1 disabled:opacity-50"
                            title="Delete Intern"
                          >
                            {deleting === intern.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredInterns.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">No interns found</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {searchTerm || statusFilter !== "all"
                    ? "Try adjusting your search or filter criteria"
                    : "No interns have been added yet"}
                </p>
              </div>
            )}
          </div>

          {/* Intern Details Modal */}
          {selectedIntern && <InternDetails intern={selectedIntern} onClose={() => setSelectedIntern(null)} />}
        </div>
      </div>
    </div>
  );
};

export default ViewAllInterns;