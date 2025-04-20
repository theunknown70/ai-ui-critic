// HomePage.tsx
import React from 'react';
import {
  Typography,
  Container,
  Button,
  Box,
  useTheme,
  alpha,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import UploadIcon from '@mui/icons-material/CloudUpload';

const HomePage: React.FC = () => {
  const theme = useTheme();

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          my: 12,
          textAlign: 'center',
          background: `linear-gradient(45deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
          borderRadius: 6,
          p: 8,
          position: 'relative',
          overflow: 'hidden',
          '&:before': {
            content: '""',
            position: 'absolute',
            top: -50,
            left: -50,
            width: 120,
            height: 120,
            background: `radial-gradient(${alpha(theme.palette.primary.main, 0.2)} 30%, transparent 70%)`,
            borderRadius: '50%',
          },
        }}
      >
        <Typography
          variant="h2"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: 700,
            letterSpacing: '-0.03em',
            background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 3,
          }}
        >
          Transform Your UI Design
        </Typography>
        <Typography
          variant="h5"
          component="h2"
          color="text.secondary"
          paragraph
          sx={{
            maxWidth: '70%',
            mx: 'auto',
            lineHeight: 1.6,
            mb: 5,
          }}
        >
          Harness AI-powered insights to elevate your user interfaces. Get
          instant, actionable feedback on your designs.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="large"
          component={RouterLink}
          to="/upload"
          startIcon={<UploadIcon sx={{ fontSize: 28 }} />}
          sx={{
            px: 6,
            py: 2,
            borderRadius: 4,
            fontSize: 18,
            fontWeight: 600,
            boxShadow: theme.shadows[6],
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: theme.shadows[12],
            },
          }}
        >
          Start Analysis
        </Button>
      </Box>
    </Container>
  );
};

export default HomePage;
