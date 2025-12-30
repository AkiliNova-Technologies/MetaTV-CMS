import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create Supabase client for frontend
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Storage bucket names
export const STORAGE_BUCKETS = {
  VIDEOS: import.meta.env.VITE_SUPABASE_BUCKET,
  THUMBNAILS: import.meta.env.VITE_SUPABASE_BUCKET,
  LIVESTREAM_THUMBNAILS: import.meta.env.VITE_SUPABASE_BUCKET,
  MUSIC: import.meta.env.VITE_SUPABASE_BUCKET
} as const;

// Frontend storage utilities
export const storageUtils = {
  /**
   * Upload file to Supabase storage from frontend
   */
  uploadFile: async (
    bucket: string,
    file: File,
    _onProgress?: (progress: number) => void
  ): Promise<{ url: string; path: string }> => {
    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = fileName;

      // Upload file
      const { error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        console.error('Upload error:', error);
        throw new Error(`Failed to upload file: ${error.message}`);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      return {
        url: urlData.publicUrl,
        path: filePath
      };
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  },

  /**
   * Upload file with progress tracking (for large files)
   */
  uploadFileWithProgress: async (
    bucket: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<{ url: string; path: string }> => {
    return new Promise((resolve, reject) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = fileName;

      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          const percentComplete = (e.loaded / e.total) * 100;
          onProgress(percentComplete);
        }
      });

      xhr.addEventListener('load', async () => {
        if (xhr.status === 200) {
          // Get public URL after successful upload
          const { data: urlData } = supabase.storage
            .from(bucket)
            .getPublicUrl(filePath);

          resolve({
            url: urlData.publicUrl,
            path: filePath
          });
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'));
      });

      // Get upload URL from Supabase
      supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        })
        .then(({ error }) => {
          if (error) {
            reject(new Error(`Failed to upload file: ${error.message}`));
          } else {
            const { data: urlData } = supabase.storage
              .from(bucket)
              .getPublicUrl(filePath);

            resolve({
              url: urlData.publicUrl,
              path: filePath
            });
          }
        })
        .catch(reject);
    });
  },

  /**
   * Delete file from storage
   */
  deleteFile: async (bucket: string, filePath: string): Promise<void> => {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      console.error('Delete error:', error);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  },

  /**
   * Get file size validation limits
   */
  getFileSizeLimit: (bucket: string): number => {
    switch (bucket) {
      case STORAGE_BUCKETS.VIDEOS:
        return 5 * 1024 * 1024 * 1024; // 5GB
      case STORAGE_BUCKETS.MUSIC:
        return 100 * 1024 * 1024; // 100MB
      case STORAGE_BUCKETS.THUMBNAILS:
      case STORAGE_BUCKETS.LIVESTREAM_THUMBNAILS:
        return 10 * 1024 * 1024; // 10MB
      default:
        return 10 * 1024 * 1024; // 10MB default
    }
  },

  /**
   * Validate file before upload
   */
  validateFile: (file: File, bucket: string): { valid: boolean; error?: string } => {
    const maxSize = storageUtils.getFileSizeLimit(bucket);
    
    if (file.size > maxSize) {
      const maxSizeMB = Math.round(maxSize / (1024 * 1024));
      return {
        valid: false,
        error: `File size exceeds ${maxSizeMB}MB limit`
      };
    }

    // Validate file types
    const allowedTypes: Record<string, string[]> = {
      [STORAGE_BUCKETS.VIDEOS]: ['video/mp4', 'video/mov', 'video/avi'],
      [STORAGE_BUCKETS.THUMBNAILS]: ['image/jpeg', 'image/png', 'image/webp'],
      [STORAGE_BUCKETS.LIVESTREAM_THUMBNAILS]: ['image/jpeg', 'image/png', 'image/webp'],
      [STORAGE_BUCKETS.MUSIC]: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/flac']
    };

    const allowed = allowedTypes[bucket];
    if (allowed && !allowed.includes(file.type)) {
      return {
        valid: false,
        error: `Invalid file type. Allowed types: ${allowed.join(', ')}`
      };
    }

    return { valid: true };
  }
};

// Helper hook for file uploads
export const useFileUpload = () => {
  const uploadFile = async (
    file: File,
    bucket: string,
    onProgress?: (progress: number) => void
  ) => {
    // Validate file
    const validation = storageUtils.validateFile(file, bucket);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Upload file
    return await storageUtils.uploadFileWithProgress(bucket, file, onProgress);
  };

  return { uploadFile };
};