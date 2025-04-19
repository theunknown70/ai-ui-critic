// src/pages/UploadPage.tsx
import React from 'react';
import { Typography, Container, Box } from '@mui/material';
import ImageUploader from '../components/ImageUploader';
import { useNavigate } from 'react-router-dom'; // For redirection

const UploadPage: React.FC = () => {
  const navigate = useNavigate();

  const handleUploadSuccess = (imageUrl: string, publicId: string) => {
    console.log('Upload successful:', imageUrl, publicId);
    // In a real app, you might get an analysis ID back from the backend
    // or generate a unique ID client-side temporarily.
    // For now, let's just use the publicId (or a generated ID)
    // You'd likely want to trigger the analysis *after* upload
    // and then navigate to results page once analysis starts/completes.

    // TODO: Trigger analysis on the backend using imageUrl/publicId

    // Placeholder: Navigate immediately (in reality, wait for analysis setup)
    // You might pass the image URL and ID via state or query params
    // Or better, get an analysis ID from backend and use that
    const analysisId = publicId || `temp-${Date.now()}`; // Temporary ID
    navigate(`/results/${analysisId}`, { state: { imageUrl } }); // Pass imageUrl via route state
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Upload Your Design
        </Typography>
        <Typography paragraph align="center" color="text.secondary">
          Upload a screenshot or Figma export (PNG, JPG, GIF, WEBP) to begin analysis.
        </Typography>

        <ImageUploader onUploadSuccess={handleUploadSuccess} />

        {/* Placeholder for "How to Export from Figma" instructions? */}
      </Box>
    </Container>
  );
};

export default UploadPage;