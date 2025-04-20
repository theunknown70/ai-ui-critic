import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Typography, Alert, Paper, Stack, useTheme, alpha } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

interface ImageUploaderProps {
  onSelect: (dataUrl: string) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onSelect }) => {
  const theme = useTheme();
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    const file = acceptedFiles[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setError('File is too large (max 10MB).');
      setPreviewUrl(null);
      return;
    }
    if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
      setError('Invalid file type. Please upload an image (JPG, PNG, GIF, WEBP).');
      setPreviewUrl(null);
      return;
    }

    // Create preview object URL
    const objUrl = URL.createObjectURL(file);
    setPreviewUrl(objUrl);

    // Read file as data URL and pass to parent
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      onSelect(result);
    };
    reader.readAsDataURL(file);
  }, [onSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'] },
    multiple: false,
  });

  return (
    <Paper elevation={0} sx={{
      p: 0,
      width: '100%',
      background: alpha(theme.palette.background.paper, 0.8),
      backdropFilter: 'blur(20px)',
      border: `2px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
      transition: 'all 0.3s ease',
      '&:hover': {
        borderColor: theme.palette.primary.main,
        transform: 'translateY(-2px)'
      }
    }}>
      <Stack spacing={3} alignItems="center">
        <Box
          {...getRootProps()}
          sx={{
            p: 6,
            textAlign: 'center',
            cursor: 'pointer',
            width: '100%',
            borderRadius: 4,
            background: isDragActive 
              ? alpha(theme.palette.primary.main, 0.1)
              : 'transparent',
            position: 'relative',
            overflow: 'hidden',
            '&:hover .upload-gradient': {
              opacity: 0.3
            }
          }}
        >
          <Box
            className="upload-gradient"
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: `linear-gradient(45deg, ${alpha(theme.palette.primary.main, 0.2)} 0%, ${alpha(theme.palette.secondary.main, 0.2)} 100%)`,
              opacity: 0,
              transition: 'opacity 0.3s ease'
            }}
          />
          <input {...getInputProps()} />
          <CloudUploadIcon sx={{
            fontSize: 64,
            color: isDragActive ? theme.palette.primary.main : 'text.secondary',
            mb: 2,
            transition: 'all 0.3s ease'
          }} />
          <Typography variant="h6" sx={{
            color: isDragActive ? theme.palette.primary.main : 'text.primary',
            transition: 'all 0.3s ease'
          }}>
            {isDragActive ? 'Release to Analyze' : 'Drag & Drop Design'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Supported formats: PNG, JPG, WEBP (Max 10MB)
          </Typography>
        </Box>

        {previewUrl && (
          <Box sx={{
            mt: 4,
            width: '100%',
            textAlign: 'center',
            border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
            borderRadius: 4,
            overflow: 'hidden',
            boxShadow: theme.shadows[2]
          }}>
            <img
              src={previewUrl}
              alt="Preview"
              style={{ 
                maxWidth: '100%', 
                maxHeight: 400,
                objectFit: 'contain',
                borderRadius: 4
              }}
            />
          </Box>
        )}
        {error && (
          <Alert severity="error" sx={{ 
            width: '100%', 
            mt: 2,
            border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
            background: alpha(theme.palette.error.main, 0.1)
          }}>
            {error}
          </Alert>
        )}
      </Stack>
    </Paper>
  );
};

export default ImageUploader;