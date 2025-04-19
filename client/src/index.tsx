// src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Keep or replace with global styles
import App from './App';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { BrowserRouter } from 'react-router-dom';

// Basic MUI theme (customize later)
const theme = createTheme({
  palette: {
    mode: 'light', // Or 'dark'
    primary: {
      main: '#1976d2', // Example primary color
    },
    secondary: {
      main: '#dc004e', // Example secondary color
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif', // Example font
  },
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <BrowserRouter> {/* Wrap App with Router */}
      <ThemeProvider theme={theme}>
        <CssBaseline /> {/* Normalize CSS and apply background */}
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);