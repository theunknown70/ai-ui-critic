// src/App.tsx
import React from 'react';
import { Routes, Route, Link as RouterLink } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Container, Button, Box } from '@mui/material';
import UploadPage from './pages/UploadPage'; // Create this next
import ResultsPage from './pages/ResultsPage'; // Create this later
import HomePage from './pages/HomePage'; // Create this next

function App() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Header */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            <RouterLink to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              AI UI Critic
            </RouterLink>
          </Typography>
          <Button color="inherit" component={RouterLink} to="/">Home</Button>
          <Button color="inherit" component={RouterLink} to="/upload">Upload</Button>
          {/* Add other nav links if needed */}
        </Toolbar>
      </AppBar>

      {/* Main Content Area */}
      <Container component="main" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/results/ai-ui-critic-uploads/:id" element={<ResultsPage />} /> {/* Example results route */}
          <Route path="*" element={<p>Path not resolved</p>} />

          {/* Add more routes as needed */}
        </Routes>
      </Container>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 2,
          px: 2,
          mt: 'auto',
          backgroundColor: (theme) =>
            theme.palette.mode === 'light'
              ? theme.palette.grey[200]
              : theme.palette.grey[800],
        }}
      >
        <Container maxWidth="sm">
          <Typography variant="body2" color="text.secondary" align="center">
            {'© '}
            AI UI Critic {new Date().getFullYear()}
            {'.'}
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}

export default App;