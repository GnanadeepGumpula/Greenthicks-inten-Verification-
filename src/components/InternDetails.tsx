import React from 'react';
import { X, Calendar, MapPin, Clock, ExternalLink, Video, Github, User, Mail, Phone, Users, CheckCircle, AlertCircle } from 'lucide-react';
import { Intern } from '../types';

interface InternDetailsProps {
  intern: Intern;
  onClose: () => void;
}

const InternDetails: React.FC<InternDetailsProps> = ({ intern, onClose }) => {
  const completedFields = intern.internshipFields.filter(field => field.completed);
  const inProgressFields = intern.internshipFields.filter(field => !field.completed);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Intern Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-6">
          {/* Personal Information */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl p-6 mb-6">
            <div className="flex items-start space-x-6">
              <img
                src={intern.photo}
                alt={`${intern.firstName} ${intern.lastName}`}
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
              />
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {intern.firstName} {intern.lastName}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-green-500" />
                    <span className="text-gray-600 dark:text-gray-300">ID: {intern.uniqueId}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-blue-500" />
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
              </div>
            </div>
          </div>

          {/* Family Information */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 mb-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Users className="h-5 w-5 mr-2 text-green-500" />
              Family Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Father's Name</label>
                <p className="text-gray-900 dark:text-white">{intern.fatherName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Mother's Name</label>
                <p className="text-gray-900 dark:text-white">{intern.motherName}</p>
              </div>
            </div>
          </div>

          {/* Internship Summary */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 mb-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-blue-500" />
              Internship Summary
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{intern.totalOnlineWeeks}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Online Weeks</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{intern.totalOfflineWeeks}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Offline Weeks</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{completedFields.length}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Completed Fields</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{inProgressFields.length}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">In Progress</div>
              </div>
            </div>
          </div>

          {/* Completed Internship Fields */}
          {completedFields.length > 0 && (
            <div className="space-y-6 mb-6">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                Completed Internship Fields ({completedFields.length})
              </h4>
              {completedFields.map((field) => (
                <div key={field.id} className="border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10 rounded-xl p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h5 className="text-xl font-semibold text-gray-900 dark:text-white">{field.fieldName}</h5>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        field.type === 'online' 
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                          : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                      }`}>
                        {field.type}
                      </span>
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 flex items-center">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Completed
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-600 dark:text-gray-300 mb-4">{field.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        Start: {new Date(field.startDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-red-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        End: {field.endDate ? new Date(field.endDate).toLocaleDateString() : 'Ongoing'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-blue-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">{field.duration || 'Ongoing'}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Project Links */}
                    {field.projectLinks.length > 0 && (
                      <div>
                        <h6 className="text-sm font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                          <Github className="h-4 w-4 mr-1" />
                          Project Links
                        </h6>
                        <div className="space-y-1">
                          {field.projectLinks.map((link, index) => (
                            <a
                              key={index}
                              href={link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm flex items-center"
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              {link}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Video Links */}
                    {field.videoLinks.length > 0 && (
                      <div>
                        <h6 className="text-sm font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                          <Video className="h-4 w-4 mr-1" />
                          Video Demonstrations
                        </h6>
                        <div className="space-y-1">
                          {field.videoLinks.map((link, index) => (
                            <a
                              key={index}
                              href={link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm flex items-center"
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              {link}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {field.completedDate && (
                    <div className="mt-4 p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                      <p className="text-sm text-green-700 dark:text-green-300">
                        ✓ Completed on {new Date(field.completedDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* In Progress Internship Fields */}
          {inProgressFields.length > 0 && (
            <div className="space-y-6 mb-6">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <AlertCircle className="h-5 w-5 mr-2 text-yellow-500" />
                In Progress Internship Fields ({inProgressFields.length})
              </h4>
              {inProgressFields.map((field) => (
                <div key={field.id} className="border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/10 rounded-xl p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h5 className="text-xl font-semibold text-gray-900 dark:text-white">{field.fieldName}</h5>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        field.type === 'online' 
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                          : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                      }`}>
                        {field.type}
                      </span>
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        In Progress
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-600 dark:text-gray-300 mb-4">{field.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        Started: {new Date(field.startDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">Status: Ongoing</span>
                    </div>
                  </div>

                  <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      ⏳ This internship field is currently in progress. Certificate will be available upon completion.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* LinkedIn Profile */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <a
              href={intern.linkedinProfile}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View LinkedIn Profile
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InternDetails;