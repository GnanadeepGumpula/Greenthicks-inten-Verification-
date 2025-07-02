import React from 'react';
import { Calendar, MapPin, Clock, ExternalLink, Video, Github, CheckCircle, AlertCircle } from 'lucide-react';
import { Intern } from '../types';

interface InternCardProps {
  intern: Intern;
  onClick?: () => void;
}

const InternCard: React.FC<InternCardProps> = ({ intern, onClick }) => {
  const totalWeeks = intern.internshipFields.reduce((acc, field) => {
    if (field.completed && field.duration) {
      const weeks = parseInt(field.duration.split(' ')[0]);
      return acc + weeks;
    }
    return acc;
  }, 0);

  const completedFields = intern.internshipFields.filter(field => field.completed).length;
  const totalFields = intern.internshipFields.length;

  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 dark:border-gray-700 overflow-hidden"
      onClick={onClick}
    >
      <div className="p-6">
        <div className="flex items-start space-x-4">
          <img
            src={intern.photo}
            alt={`${intern.firstName} ${intern.lastName}`}
            className="w-16 h-16 rounded-full object-cover border-2 border-green-200 dark:border-green-700"
          />
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white truncate">
              {intern.firstName} {intern.lastName}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">ID: {intern.uniqueId}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{intern.email}</p>
          </div>
          <div className="flex flex-col items-end">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              intern.certificateIssued 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
            }`}>
              {intern.certificateIssued ? 'Certified' : 'In Progress'}
            </span>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
            <Calendar className="h-4 w-4 mr-2 text-green-500" />
            <span>{totalWeeks} weeks completed</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
            <Clock className="h-4 w-4 mr-2 text-blue-500" />
            <span>{intern.totalOnlineWeeks}w online, {intern.totalOfflineWeeks}w offline</span>
          </div>

          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
            {completedFields === totalFields ? (
              <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
            ) : (
              <AlertCircle className="h-4 w-4 mr-2 text-yellow-500" />
            )}
            <span>{completedFields}/{totalFields} fields completed</span>
          </div>
        </div>

        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Internship Fields:</h4>
          <div className="flex flex-wrap gap-2">
            {intern.internshipFields.slice(0, 3).map((field) => (
              <span
                key={field.id}
                className={`px-2 py-1 rounded-md text-xs flex items-center ${
                  field.completed 
                    ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                {field.completed && <CheckCircle className="h-3 w-3 mr-1" />}
                {field.fieldName}
              </span>
            ))}
            {intern.internshipFields.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md text-xs">
                +{intern.internshipFields.length - 3} more
              </span>
            )}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <a
              href={intern.linkedinProfile}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium flex items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              LinkedIn Profile
            </a>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Joined {new Date(intern.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InternCard;