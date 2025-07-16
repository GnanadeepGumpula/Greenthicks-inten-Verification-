import { googleAuthService } from './googleAuth';

export class GoogleDriveService {
  private folderId: string;

  constructor(folderId: string) {
    this.folderId = folderId;
  }

  async uploadPhoto(file: File, uniqueId?: string): Promise<string | null> {
    try {
      const headers = await googleAuthService.getAuthHeaders();
      const token = headers.Authorization?.replace('Bearer ', '');
      console.log("Access Token (partial):", token?.slice(0, 20), '...');

      // Create form data for file upload
      const formData = new FormData();
      const metadata = {
        name: uniqueId
          ? `intern_photo_${uniqueId}${file.name.slice(file.name.lastIndexOf('.'))}`
          : `intern_photo_${Date.now()}_${file.name}`,
        parents: [this.folderId]
      };

      formData.append(
        'metadata',
        new Blob([JSON.stringify(metadata)], { type: 'application/json' })
      );
      formData.append('file', file);

      const response = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true',
        {
          method: 'POST',
          headers: {
            Authorization: headers.Authorization! // only this header is needed; FormData sets content-type
          },
          body: formData
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Upload failed: ${response.status} ${response.statusText} - ${errText}`);
      }

      const result = await response.json();

      // Make the file publicly viewable
      await this.makeFilePublic(result.id);

      return result.id;
    } catch (error) {
      console.error('❌ Error uploading photo to Google Drive:', error);
      return null;
    }
  }

  private async makeFilePublic(fileId: string): Promise<void> {
    try {
      const headers = await googleAuthService.getAuthHeaders();

      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}/permissions?supportsAllDrives=true`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: headers.Authorization!
          },
          body: JSON.stringify({
            role: 'reader',
            type: 'anyone'
          })
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Permission error: ${response.status} - ${errText}`);
      }
    } catch (error) {
      console.error('❌ Error making file public:', error);
    }
  }

  getPhotoUrl(fileId: string): string {
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w300-h300`;
  }

  getThumbnailUrl(fileId: string, size: number = 300): string {
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=s${size}`;
  }
}

// Export instance
export const googleDriveService = new GoogleDriveService(
  import.meta.env.VITE_GOOGLE_DRIVE_FOLDER_ID || ''
);
