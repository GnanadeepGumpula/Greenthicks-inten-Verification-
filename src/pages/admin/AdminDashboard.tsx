"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Users, Award, Clock, TrendingUp, Plus, QrCode, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { googleSheetsService } from "../../services/googleSheets";
import { googleDriveService } from "../../services/googleDrive";
import type { Intern } from "../../types";
import { calculateUniqueTrainingWeeks } from '../../utils/calculateUniqueTrainingWeeks';
import type { InternshipField } from "../../types";

const AdminDashboard: React.FC = () => {
  const [interns, setInterns] = useState<Intern[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInterns();
  }, []);

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

      setInterns(internsWithPhotos);
    } catch (error) {
      console.error("Error loading interns:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalInterns = interns.length;
  const certificatesIssued = interns.reduce((total, intern) => {
    return total + intern.internshipFields.filter((field: InternshipField) => field.certificateIssued).length;
  }, 0);
  const totalWeeks = calculateUniqueTrainingWeeks(interns);
  const avgCompletionRate = totalInterns > 0 ? Math.round((certificatesIssued / totalInterns) * 100) : 0;

  const stats = [
    {
      icon: Users,
      label: "Total Interns",
      value: totalInterns.toString(),
      color: "text-blue-600",
      bg: "bg-blue-100 dark:bg-blue-900",
    },
    {
      icon: Award,
      label: "Certificates Issued",
      value: certificatesIssued.toString(),
      color: "text-green-600",
      bg: "bg-green-100 dark:bg-green-900",
    },
    {
      icon: Clock,
      label: "Total Training Weeks",
      value: totalWeeks.toLocaleString(),
      color: "text-purple-600",
      bg: "bg-purple-100 dark:bg-purple-900",
    },
    {
      icon: TrendingUp,
      label: "Completion Rate",
      value: `${avgCompletionRate}%`,
      color: "text-orange-600",
      bg: "bg-orange-100 dark:bg-orange-900",
    },
  ];

  const quickActions = [
    { icon: Plus, label: "Add New Intern", href: "/admin/add-intern", color: "bg-green-600 hover:bg-green-700" },
    { icon: Users, label: "View All Interns", href: "/admin/view-all", color: "bg-blue-600 hover:bg-blue-700" },
    { icon: QrCode, label: "Generate QR Code", href: "/admin/generate-qr", color: "bg-purple-600 hover:bg-purple-700" },
    {
      icon: FileText,
      label: "Create Certificate",
      href: "/admin/certificates",
      color: "bg-orange-600 hover:bg-orange-700",
    },
  ];

  const recentInterns = interns.slice(-5).reverse(); // Get the last 5 interns and reverse the order

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300">Manage internship programs and certificates</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <div className="flex items-center">
                <div className={`${stat.bg} rounded-full w-12 h-12 flex items-center justify-center`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">{stat.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.href}
                className={`${action.color} text-white rounded-lg p-4 flex items-center space-x-3 transition-colors`}
              >
                <action.icon className="h-6 w-6" />
                <span className="font-medium">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Interns */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Interns</h2>
            <Link
              to="/admin/view-all"
              className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 font-medium"
            >
              View All
            </Link>
          </div>

          {recentInterns.length > 0 ? (
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
                  {recentInterns.map((intern) => {
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
                            <Link
                              to={`/admin/edit-intern/${intern.id}`}
                              className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 text-sm"
                              title="Edit"
                            >
                              Edit
                            </Link>
                            <Link
                              to={`/admin/generate-qr?id=${intern.uniqueId}`}
                              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
                            >
                              QR
                            </Link>
                            <Link
                              to={`/admin/certificates?id=${intern.uniqueId}`}
                              className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 text-sm"
                            >
                              Cert
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No interns yet</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">Start by adding your first intern to the system</p>
              <Link
                to="/admin/add-intern"
                className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First Intern
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;