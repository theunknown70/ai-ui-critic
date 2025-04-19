// src/pages/HomePage.tsx
import React from 'react';
import { Typography, Container, Button, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const HomePage: React.FC = () => {
  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Welcome to AI UI Critic
        </Typography>
        <Typography variant="h5" component="h2" color="text.secondary" paragraph>
          Get instant UX feedback on your designs. Upload a Figma export or screenshot to get started.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="large"
          component={RouterLink}
          to="/upload"
          sx={{ mt: 3 }}
        >
          Upload Design
        </Button>
      </Box>
    </Container>
  );
};

export default HomePage;