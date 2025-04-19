// src/pages/HomePage.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom'; // Need router context for links
import HomePage from './HomePage';
import '@testing-library/jest-dom'; // For matchers like toBeInTheDocument

// Mock MUI components if needed or use them directly
// jest.mock('@mui/material', () => ({
//   ...jest.requireActual('@mui/material'),
//   Typography: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
//   Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
//   Container: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
//   Box: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
// }));


describe('HomePage Component', () => {
  test('renders welcome message and call to action', () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    // Check for heading
    expect(screen.getByRole('heading', { name: /Welcome to AI UI Critic/i })).toBeInTheDocument();

    // Check for description text (use regex for flexibility)
    expect(screen.getByText(/Get instant UX feedback/i)).toBeInTheDocument();

    // Check for the upload button
    const uploadButton = screen.getByRole('link', { name: /Upload Design/i }); // It's a link styled as a button
    expect(uploadButton).toBeInTheDocument();
    expect(uploadButton).toHaveAttribute('href', '/upload');
  });

   // Add more tests: e.g., button click navigation (requires more setup)
});