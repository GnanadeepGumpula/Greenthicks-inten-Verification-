import { googleAuthService } from './googleAuth';

export class GoogleDriveService {
  private folderId: string;

  constructor(folderId: string) {
    this.folderId = folderId;
  }

  async uploadPhoto(file: File): Promise<string | null> {
    try {
      const headers = await googleAuthService.getAuthHeaders();
      
      // Create form data for file upload
      const formData = new FormData();
      
      const metadata = {
        name: `intern_photo_${Date.now()}_${file.name}`,
        parents: [this.folderId]
      };
      
      formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      formData.append('file', file);

      const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
          ...headers
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      const result = await response.json();
      
      // Make the file publicly viewable
      await this.makeFilePublic(result.id);
      
      return result.id;
    } catch (error) {
      console.error('Error uploading photo to Google Drive:', error);
      return null;
    }
  }

  private async makeFilePublic(fileId: string): Promise<void> {
    try {
      const headers = await googleAuthService.getAuthHeaders();
      
      await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: JSON.stringify({
          role: 'reader',
          type: 'anyone'
        })
      });
    } catch (error) {
      console.error('Error making file public:', error);
    }
  }

getPhotoUrl(fileId: string): string {
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w300-h300`;
  }

  getThumbnailUrl(fileId: string, size: number = 300): string {
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=s${size}`;
  }
}

export const googleDriveService = new GoogleDriveService(
  import.meta.env.VITE_GOOGLE_DRIVE_FOLDER_ID || ''
);