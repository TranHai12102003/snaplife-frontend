import { apiClient } from './client';

export interface UploadFileResponse {
  FileId: number;
  FileName: string;
  FilePath: string;
  FileUrl: string;
  FileType?: string;
  MimeType?: string;
  FileSize?: number;
}

export const mediaApi = {
  uploadFile: async (
    fileUri: string,
    fileName: string = 'photo.jpg',
    mimeType: string = 'image/jpeg',
    subFolder: string = 'snaps'
  ): Promise<UploadFileResponse> => {
    const formData = new FormData();
    // In React Native FormData accepts an object with uri, name, type
    formData.append('File', {
      uri: fileUri,
      name: fileName,
      type: mimeType,
    } as any);

    formData.append('SubFolder', subFolder);

    const response = await apiClient.post<UploadFileResponse>('/api/File/Upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },
};

