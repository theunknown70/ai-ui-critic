// src/components/ImageUploader.tsx
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Typography, Button, CircularProgress, Alert, Paper, Stack } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import axios from 'axios';

interface ImageUploaderProps {
  onUploadSuccess: (imageUrl: string, publicId: string) => void; // Callback with Cloudinary URL and ID
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onUploadSuccess }) => {
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null); // Clear previous errors
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      // Simple client-side validation (optional, backend validation is key)
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
          setError('File is too large (max 10MB).');
          setPreview(null);
          setUploadedFile(null);
          return;
      }
      if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
          setError('Invalid file type. Please upload an image (JPG, PNG, GIF, WEBP).');
          setPreview(null);
          setUploadedFile(null);
          return;
      }

      setUploadedFile(file);
      // Create object URL for preview
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'] },
    multiple: false,
  });

  const handleUpload = async () => {
    if (!uploadedFile) {
      setError('Please select a file first.');
      return;
    }

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('designImage', uploadedFile); // Must match backend 'upload.single()' name

    try {
      // Adjust URL if your backend runs on a different port/domain
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
      const response = await axios.post(`${apiUrl}/api/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Upload response:', response.data);
      onUploadSuccess(response.data.imageUrl, response.data.publicId); // Pass URL and ID back
      // Optionally clear preview after successful upload if navigating away
      // setPreview(null);
      // setUploadedFile(null);

    } catch (err: any) {
      console.error('Upload error:', err);
      let errorMessage = 'Upload failed. Please try again.';
      if (axios.isAxiosError(err) && err.response) {
          // Use error message from backend if available
          errorMessage = err.response.data?.message || errorMessage;
      } else if (err instanceof Error) {
          errorMessage = err.message;
      }
      setError(errorMessage);
      setPreview(null); // Clear preview on error
      setUploadedFile(null);
    } finally {
      setUploading(false);
    }
  };

  // Clean up object URL when component unmounts or preview changes
  React.useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Stack spacing={3} alignItems="center">
        <Box
          {...getRootProps()}
          sx={{
            border: `2px dashed ${isDragActive ? 'primary.main' : 'grey.500'}`,
            borderRadius: 1,
            p: 4,
            textAlign: 'center',
            cursor: 'pointer',
            backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
            width: '100%',
            minHeight: '150px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <input {...getInputProps()} />
          <CloudUploadIcon sx={{ fontSize: 48, color: 'grey.600', mb: 1 }} />
          {isDragActive ? (
            <Typography>Drop the image here...</Typography>
          ) : (
            <Typography>Drag 'n' drop an image here, or click to select</Typography>
          )}
           <Typography variant="caption" color="text.secondary" sx={{mt: 1}}>
                (PNG, JPG, GIF, WEBP up to 10MB)
            </Typography>
        </Box>

        {preview && (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="subtitle1" gutterBottom>Preview:</Typography>
            <img
              src={preview}
              alt="Preview"
              style={{ maxWidth: '100%', maxHeight: '200px', border: '1px solid #ccc' }}
            />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ width: '100%', mt: 2 }}>{error}</Alert>
        )}

        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={!uploadedFile || uploading}
          startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : null}
          size="large"
          sx={{ width: '100%', maxWidth: '300px' }} // Limit button width
        >
          {uploading ? 'Uploading...' : 'Upload & Analyze'}
        </Button>
      </Stack>
    </Paper>
  );
};

export default ImageUploader;