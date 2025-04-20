import React from 'react';
import { Typography, Container, Box, useTheme, alpha } from '@mui/material';
import ImageUploader from '../components/ImageUploader';
import { useNavigate } from 'react-router-dom';

const UploadPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const handleSelect = (dataUrl: string) => {
    navigate('/results', { state: { imageUrl: dataUrl } });
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ 
        my: 2,
        textAlign: 'center',
        background: `linear-gradient(45deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
        borderRadius: 6,
        p: 8,
        position: 'relative',
        overflow: 'hidden',
        '&:before': {
          content: '""',
          position: 'absolute',
          top: -100,
          right: -100,
          width: 300,
          height: 300,
          background: `radial-gradient(${alpha(theme.palette.primary.main, 0.2)} 30%, transparent 70%)`,
          borderRadius: '50%',
        }
      }}>
        <Typography variant="h2" component="h1" gutterBottom sx={{
          fontWeight: 700,
          letterSpacing: '-0.03em',
          background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          mb: 3
        }}>
          Design Analysis Hub
        </Typography>
        <Typography variant="h5" component="h2" color="text.secondary" paragraph sx={{
          maxWidth: '70%',
          mx: 'auto',
          lineHeight: 1.6,
          mb: 5
        }}>
          Upload your interface design to receive comprehensive UX insights and AI-powered optimization suggestions.
        </Typography>
        <ImageUploader onSelect={handleSelect} />
      </Box>
    </Container>
  );
};

export default UploadPage;