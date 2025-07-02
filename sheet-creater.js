import 'dotenv/config';
import { google } from 'googleapis';

const spreadsheetId = process.env.VITE_GOOGLE_SPREADSHEET_ID;
const clientEmail = process.env.VITE_GOOGLE_SERVICE_ACCOUNT_EMAIL;
const privateKey = process.env.VITE_GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n");

async function createSheets() {
  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  const sheetConfigs = [
    {
      title: 'Admins',
      headers: [['username', 'password'], ['admin', 'greenthicks2024']],
    },
    {
      title: 'Interns',
      headers: [[
        'id', 'uniqueId', 'firstName', 'lastName', 'email', 'phoneNumber',
        'dateOfBirth', 'fatherName', 'motherName', 'photo', 'linkedinProfile',
        'totalOfflineWeeks', 'totalOnlineWeeks', 'certificateIssued', 'createdAt',
      ]],
    },
    {
      title: 'InternshipFields',
      headers: [[
        'id', 'internId', 'fieldName', 'startDate', 'endDate', 'duration', 'type',
        'projectLinks', 'videoLinks', 'description', 'completed', 'completedDate',
      ]],
    },
  ];

  for (const config of sheetConfigs) {
    try {
      const meta = await sheets.spreadsheets.get({ spreadsheetId });
      const existingSheet = meta.data.sheets.find(
        (s) => s.properties.title === config.title
      );

      if (existingSheet) {
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId,
          requestBody: {
            requests: [{ deleteSheet: { sheetId: existingSheet.properties.sheetId } }],
          },
        });
        console.log(`Deleted existing sheet: ${config.title}`);
      }

      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [{ addSheet: { properties: { title: config.title } } }],
        },
      });

      console.log(`Created sheet: ${config.title}`);

      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${config.title}!A1`,
        valueInputOption: 'RAW',
        requestBody: { values: config.headers },
      });

      console.log(`Wrote headers to: ${config.title}`);
    } catch (err) {
      console.error(`Error processing sheet "${config.title}":`, err.message);
    }
  }

  console.log('✅ All sheets created and initialized.');
}

createSheets();
