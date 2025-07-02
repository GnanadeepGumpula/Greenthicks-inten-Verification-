# Complete Google Sheets & Drive Setup Guide

## Step 1: Create Google Cloud Project & Service Account

### 1.1 Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project: "Green Thicks Internship System"
3. Note your project ID

### 1.2 Enable Required APIs
1. Go to "APIs & Services" > "Library"
2. Search and enable:
   - **Google Sheets API**
   - **Google Drive API**

### 1.3 Create Service Account
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "Service Account"
3. Name: "green-thicks-service-account"
4. Description: "Service account for internship system"
5. Click "Create and Continue"
6. Skip role assignment for now
7. Click "Done"

### 1.4 Generate Service Account Key
1. Click on the created service account
2. Go to "Keys" tab
3. Click "Add Key" > "Create New Key"
4. Choose "JSON" format
5. Download the key file
6. **IMPORTANT**: Keep this file secure and never commit to version control

### 1.5 Get Service Account Email
From the downloaded JSON file, copy the `client_email` value.

## Step 2: Set Up Google Sheets Database

### 2.1 Create Main Spreadsheet
1. Go to [Google Sheets](https://sheets.google.com)
2. Create new spreadsheet: "Green Thicks Internship Database"
3. Copy the spreadsheet ID from URL: `https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit`

### 2.2 Share with Service Account
1. Click "Share" button in Google Sheets
2. Add your service account email (from step 1.5)
3. Give "Editor" permissions
4. Uncheck "Notify people"
5. Click "Share"

### 2.3 Create Required Sheets

#### Sheet 1: "Admins"
Create a sheet named "Admins" with columns:
| A | B |
|---|---|
| username | password |
| admin | greenthicks2024 |

#### Sheet 2: "Interns"
Create a sheet named "Interns" with columns:
| A | B | C | D | E | F | G | H | I | J | K | L | M | N | O |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| id | uniqueId | firstName | lastName | email | phoneNumber | dateOfBirth | fatherName | motherName | photo | linkedinProfile | totalOfflineWeeks | totalOnlineWeeks | certificateIssued | createdAt |

#### Sheet 3: "InternshipFields"
Create a sheet named "InternshipFields" with columns:
| A | B | C | D | E | F | G | H | I | J | K | L |
|---|---|---|---|---|---|---|---|---|---|---|---|
| id | internId | fieldName | startDate | endDate | duration | type | projectLinks | videoLinks | description | completed | completedDate |

## Step 3: Set Up Google Drive for Photos

### 3.1 Create Photo Storage Folder
1. Go to [Google Drive](https://drive.google.com)
2. Create new folder: "Green Thicks Intern Photos"
3. Right-click folder > "Share"
4. Add your service account email
5. Give "Editor" permissions
6. Copy folder ID from URL: `https://drive.google.com/drive/folders/{FOLDER_ID}`

### 3.2 Set Folder Permissions
1. Right-click folder > "Share"
2. Click "Change to anyone with the link"
3. Set to "Viewer" (for public photo access)
4. Click "Done"

## Step 4: Configure Environment Variables

### 4.1 Create .env File
Copy `.env.example` to `.env` and fill in your values:

```env
# From your service account JSON file
VITE_GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
VITE_GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----"

# From Google Sheets URL
VITE_GOOGLE_SPREADSHEET_ID=1BxYz...ABC123

# From Google Drive folder URL
VITE_GOOGLE_DRIVE_FOLDER_ID=1AbC...XYZ789
```

### 4.2 Important Notes
- The private key must include the full key with `\n` for line breaks
- Keep quotes around the private key
- Never commit the .env file to version control

## Step 5: Sample Data Format

### 5.1 Admins Sheet Sample
```
username | password
admin    | greenthicks2024
manager  | manager123
```

### 5.2 Interns Sheet Sample
```
id | uniqueId | firstName | lastName | email | phoneNumber | dateOfBirth | fatherName | motherName | photo | linkedinProfile | totalOfflineWeeks | totalOnlineWeeks | certificateIssued | createdAt
1  | 123456   | John      | Doe      | john@email.com | +1234567890 | 1998-05-15 | Robert Doe | Mary Doe | 1BxYz...ABC | https://linkedin.com/in/johndoe | 8 | 12 | TRUE | 2024-01-15
```

### 5.3 InternshipFields Sheet Sample
```
id | internId | fieldName | startDate | endDate | duration | type | projectLinks | videoLinks | description | completed | completedDate
1  | 1        | Frontend Development | 2024-01-15 | 2024-04-15 | 12 weeks | online | https://github.com/project1,https://github.com/project2 | https://linkedin.com/video1 | React.js development | TRUE | 2024-04-15T10:30:00Z
2  | 1        | AI & Machine Learning | 2024-05-01 |  |  | offline | https://github.com/ai-project |  | Machine learning basics | FALSE | 
```

## Step 6: New Features - Completion Status

### 6.1 Completion Tracking
- **Completed Fields**: Show green status with checkmark
- **In Progress Fields**: Show yellow status with clock icon
- **Auto-calculation**: Duration calculated when marked complete
- **End Date**: Auto-filled when completion button is toggled

### 6.2 Certificate Eligibility
- Only completed fields are eligible for certificates
- In-progress fields show "Certificate pending completion"
- Search results show completion status for each field

### 6.3 Admin Controls
- Toggle completion status with checkbox
- Auto-calculate duration based on start/end dates
- End date becomes required when marked complete
- Duration field becomes read-only when complete

## Step 7: Testing the Setup

### 7.1 Test Authentication
1. Start the development server: `npm run dev`
2. Go to `/login`
3. Use credentials from Admins sheet
4. Verify successful login

### 7.2 Test Data Loading
1. Check browser console for errors
2. Verify interns load on homepage
3. Test search functionality
4. Check completion status display

### 7.3 Test Photo Upload
1. Go to "Add Intern" page
2. Upload a test photo
3. Verify it appears in Google Drive folder
4. Check if photo displays correctly

### 7.4 Test Completion Status
1. Add intern with multiple fields
2. Mark some fields as complete
3. Verify auto-calculation of duration
4. Check certificate eligibility display

## Step 8: Security Best Practices

### 8.1 Service Account Security
- Never share service account credentials
- Use environment variables only
- Regularly rotate service account keys
- Monitor API usage in Google Cloud Console

### 8.2 Data Protection
- Regularly backup your Google Sheets
- Set up proper sharing permissions
- Monitor access logs
- Use strong passwords for admin accounts

### 8.3 API Limits
- Google Sheets API: 300 requests per minute
- Google Drive API: 1,000 requests per 100 seconds
- Implement proper error handling
- Consider caching for better performance

## Step 9: Troubleshooting

### Common Issues:

#### 9.1 Process Error (Fixed)
- **Error**: "process is not defined"
- **Solution**: Updated Vite config and removed google-auth-library
- **Fix**: Using browser-compatible JWT authentication

#### 9.2 Authentication Errors
- **Error**: "Invalid credentials"
- **Solution**: Check service account email and private key format
- **Check**: Ensure service account has access to sheets and drive

#### 9.3 Permission Errors
- **Error**: "The caller does not have permission"
- **Solution**: Verify service account is shared with proper permissions
- **Check**: Both sheets and drive folder permissions

#### 9.4 Completion Status Issues
- **Error**: Duration not calculating
- **Solution**: Ensure start and end dates are valid
- **Check**: Completion checkbox functionality

### Getting Help:
- Check browser console for errors
- Verify API quotas and usage
- Test with Google APIs Explorer
- Review Google Sheets/Drive API documentation

## Step 10: Production Deployment

### 10.1 Environment Setup
- Use production service account
- Set up proper domain restrictions
- Configure CORS settings
- Enable audit logging

### 10.2 Monitoring
- Set up Cloud Monitoring alerts
- Monitor API usage and costs
- Track error rates
- Set up backup procedures

### 10.3 Scaling Considerations
- Implement caching strategies
- Use batch operations when possible
- Consider database migration for large datasets
- Set up CDN for photo delivery

## New Features Summary

✅ **Fixed Process Error**: Removed google-auth-library dependency
✅ **Completion Status**: Toggle for each internship field
✅ **Auto-calculation**: Duration calculated when completed
✅ **Visual Indicators**: Green/yellow status badges
✅ **Certificate Eligibility**: Only completed fields get certificates
✅ **Smart Forms**: End date required only when completed
✅ **Progress Tracking**: Separate sections for completed/in-progress
✅ **Browser Compatible**: No Node.js dependencies