import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, ArrowLeft, Calendar, MapPin, Clock, ExternalLink, Video, Github, User, Mail, Phone, Users } from 'lucide-react';
import { googleSheetsService } from '../services/googleSheets';
import { googleDriveService } from '../services/googleDrive';
import { Intern } from '../types';

const InternVerification: React.FC = () => {
  const { uniqueId } = useParams<{ uniqueId: string }>();
  const [intern, setIntern] = useState<Intern | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIntern = async () => {
      if (!uniqueId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const foundIntern = await googleSheetsService.getInternByUniqueId(uniqueId);
        
        if (foundIntern) {
          const internWithPhoto = {
            ...foundIntern,
            photo: foundIntern.photo ? googleDriveService.getPhotoUrl(foundIntern.photo) : 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=300'
          };
          setIntern(internWithPhoto);
          console.log('Image URL:', internWithPhoto.photo);
        }
      } catch (error) {
        console.error('Error fetching intern:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchIntern();
  }, [uniqueId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Verifying certificate...</p>
        </div>
      </div>
    );
  }

  if (!intern) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Certificate Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            The certificate with ID "{uniqueId}" could not be found or may have been revoked.
          </p>
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // Check completion status of internship fields
  const completedFields = intern.internshipFields.filter(field => !isNaN(new Date(field.endDate).getTime()));
  const incompleteFields = intern.internshipFields.filter(field => isNaN(new Date(field.endDate).getTime()));
  const allFieldsCompleted = incompleteFields.length === 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="inline-flex items-center text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 font-medium"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Search
            </Link>
            <div className="flex items-center space-x-2">
              {allFieldsCompleted ? (
                <>
                  <CheckCircle className="h-6 w-6 text-green-500" />
                  <span className="text-green-600 dark:text-green-400 font-medium">Certificate Verified</span>
                </>
              ) : (
                <>
                  <XCircle className="h-6 w-6 text-red-500" />
                  <span className="text-red-600 dark:text-red-400 font-medium">Incomplete Certificate</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Verification Status */}
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 mb-8">
  <div className="flex items-center">
    {allFieldsCompleted ? (
      <>
        <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
        <div>
          <h2 className="text-xl font-bold text-green-800 dark:text-green-300">
            Certificate Verified Successfully
          </h2>
          <p className="text-green-700 dark:text-green-400">
            This certificate is authentic and issued by Green Thicks Internship Program
          </p>
        </div>
      </>
    ) : (
      <>
        <XCircle className="h-8 w-8 text-red-500 mr-3" />
        <div>
          <h2 className="text-xl font-bold text-red-800 dark:text-red-300">
            Internship Status
          </h2>
          {completedFields.length > 0 && (
            <p className="text-green-700 dark:text-green-400">
              Completed Fields: {completedFields.map(field => field.fieldName).join(', ')}
            </p>
          )}
          {incompleteFields.length > 0 && (
            <p className="text-red-700 dark:text-red-400">
              Incomplete Fields: {incompleteFields.map(field => field.fieldName).join(', ')}
            </p>
          )}
        </div>
      </>
    )}
  </div>
</div>

        {/* Personal Information */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl p-8 mb-8">
          <div className="flex items-start space-x-6">
            <img
              src={intern.photo}
              alt={`${intern.firstName} ${intern.lastName}`}
              referrerPolicy="no-referrer"
              className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
            />
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {intern.firstName} {intern.lastName}
              </h1>
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
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-8">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Users className="h-5 w-5 mr-2 text-green-500" />
            Family Information
          </h3>
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
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-8">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
            <Clock className="h-5 w-5 mr-2 text-blue-500" />
            Internship Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{intern.totalOnlineWeeks}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Online Weeks</div>
            </div>
            <div className="text-center bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">{intern.totalOfflineWeeks}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Offline Weeks</div>
            </div>
            <div className="text-center bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{intern.internshipFields.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Fields Completed</div>
            </div>
          </div>
        </div>

        {/* Internship Fields */}
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Internship Fields & Projects</h3>
          {intern.internshipFields.map((field) => (
            <div key={field.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <div className="flex justify-between items-start mb-4">
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white">{field.fieldName}</h4>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  field.type === 'online' 
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                    : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                }`}>
                  {field.type}
                </span>
              </div>

              <p className="text-gray-600 dark:text-gray-300 mb-4">{field.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Start: {new Date(field.startDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    End: {isNaN(new Date(field.endDate).getTime()) ? 
                      `${field.fieldName} not completed` : 
                      new Date(field.endDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">{field.duration}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Project Links */}
                {field.projectLinks.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                      <Github className="h-4 w-4 mr-1" />
                      Project Links
                    </h5>
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
                    <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                      <Video className="h-4 w-4 mr-1" />
                      Video Demonstrations
                    </h5>
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
            </div>
          ))}
        </div>

        {/* LinkedIn Profile */}
        <div className="mt-8 text-center">
          <a
            href={intern.linkedinProfile}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            <ExternalLink className="h-5 w-5 mr-2" />
            View LinkedIn Profile
          </a>
        </div>

        {/* Certificate Footer */}
        <div className="mt-12 bg-gray-100 dark:bg-gray-800 rounded-xl p-6 text-center">
          <div className="flex items-center justify-center mb-4">
            <img 
              src="/Green_white-removebg.png" 
              alt="Green Thicks Logo" 
              className="h-12 w-auto mr-3"
            />
            <div>
              <h4 className="text-lg font-bold text-gray-900 dark:text-white">Green Thicks</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">Fresh From Farm To Table</p>
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            This certificate was verified on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default InternVerification;