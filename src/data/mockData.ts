import { Intern } from '../types';

export const mockInterns: Intern[] = [
  {
    id: '1',
    uniqueId: '123456',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@email.com',
    phoneNumber: '+1234567890',
    dateOfBirth: '1998-05-15',
    fatherName: 'Robert Doe',
    motherName: 'Mary Doe',
    photo: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=300',
    linkedinProfile: 'https://linkedin.com/in/johndoe',
    internshipFields: [
      {
        id: '1',
        fieldName: 'Frontend Development',
        startDate: '2024-01-15',
        endDate: '2024-04-15',
        duration: '12 weeks',
        type: 'online',
        projectLinks: ['https://github.com/johndoe/project1', 'https://github.com/johndoe/project2'],
        videoLinks: ['https://linkedin.com/posts/johndoe/video1'],
        description: 'Worked on React.js applications with modern UI/UX design principles'
      },
      {
        id: '2',
        fieldName: 'AI & Machine Learning',
        startDate: '2024-05-01',
        endDate: '2024-07-01',
        duration: '8 weeks',
        type: 'offline',
        projectLinks: ['https://github.com/johndoe/ai-project'],
        videoLinks: ['https://linkedin.com/posts/johndoe/ai-demo'],
        description: 'Developed machine learning models for data analysis and prediction'
      }
    ],
    totalOfflineWeeks: 8,
    totalOnlineWeeks: 12,
    certificateIssued: true,
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    uniqueId: '789012',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@email.com',
    phoneNumber: '+1987654321',
    dateOfBirth: '1999-08-22',
    fatherName: 'Michael Johnson',
    motherName: 'Lisa Johnson',
    photo: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=300',
    linkedinProfile: 'https://linkedin.com/in/sarahjohnson',
    internshipFields: [
      {
        id: '3',
        fieldName: 'Backend Development',
        startDate: '2024-02-01',
        endDate: '2024-06-01',
        duration: '16 weeks',
        type: 'online',
        projectLinks: ['https://github.com/sarahjohnson/backend-api'],
        videoLinks: ['https://linkedin.com/posts/sarahjohnson/backend-demo'],
        description: 'Built scalable REST APIs using Node.js and database management'
      }
    ],
    totalOfflineWeeks: 0,
    totalOnlineWeeks: 16,
    certificateIssued: true,
    createdAt: '2024-02-01'
  }
];