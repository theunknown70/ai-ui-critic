import React from 'react';
import { Routes, Route, Link as RouterLink } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Container, 
  Button, 
  Box, 
  IconButton,
  ThemeProvider,
  createTheme,
  CssBaseline,
  alpha
} from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import UploadPage from './pages/UploadPage';
import ResultsPage from './pages/ResultsPage';
import HomePage from './pages/HomePage';

function App() {
  const [mode, setMode] = React.useState<'light' | 'dark'>('light');

  const appTheme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: '#1976d2',
          },
          secondary: {
            main: '#dc004e',
          },
        },
        typography: {
          fontFamily: 'Inter, Arial, sans-serif',
          h6: {
            fontWeight: 700,
            letterSpacing: '-0.03em'
          }
        },
        shape: {
          borderRadius: 12
        }
      }),
    [mode],
  );

  const toggleColorMode = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* Enhanced AppBar */}
        <AppBar position="sticky" sx={{ 
          background: `linear-gradient(45deg, ${alpha(appTheme.palette.primary.main, 0.9)} 0%, ${alpha(appTheme.palette.secondary.main, 0.9)} 100%)`,
          boxShadow: 'none',
          borderBottom: `1px solid ${alpha(appTheme.palette.divider, 0.1)}`
        }}>
          <Toolbar sx={{ py: 1 }}>
            <Typography variant="h6" component="div" sx={{ 
              flexGrow: 1,
              '& a': {
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                textDecoration: 'none',
                color: 'inherit',
                '&:hover': {
                  opacity: 0.9
                }
              }
            }}>
              <RouterLink to="/">
                <Box component="span" sx={{ 
                  width: 32,
                  height: 32,
                  background: appTheme.palette.common.white,
                  borderRadius: 2,
                  display: 'inline-block',
                  mr: 1
                }}/>
                AI UI Critic
              </RouterLink>
            </Typography>
            <Button 
              component={RouterLink} 
              to="/" 
              sx={{ 
                color: 'common.white',
                '&:hover': {
                  background: alpha(appTheme.palette.common.white, 0.1)
                }
              }}
            >
              Home
            </Button>
            <Button 
              component={RouterLink} 
              to="/upload" 
              sx={{ 
                color: 'common.white',
                '&:hover': {
                  background: alpha(appTheme.palette.common.white, 0.1)
                }
              }}
            >
              Upload
            </Button>
            <IconButton 
              onClick={toggleColorMode} 
              sx={{ 
                ml: 2,
                color: 'common.white',
                background: alpha(appTheme.palette.common.white, 0.1),
                '&:hover': {
                  background: alpha(appTheme.palette.common.white, 0.2)
                }
              }}
            >
              {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Toolbar>
        </AppBar>

        {/* Main Content */}
        <Container component="main" sx={{ 
          mt: 0, 
          mb: 4, 
          flexGrow: 1,
          position: 'relative',
          overflow: 'hidden'
        }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/results" element={<ResultsPage />} />
            <Route path="*" element={<p>Path not resolved</p>} />
          </Routes>
        </Container>

        {/* Enhanced Footer */}
        <Box
          component="footer"
          sx={{
            py: 2,
            px: 2,
            mt: 'auto',
            background: `linear-gradient(45deg, ${alpha(appTheme.palette.primary.main, 0.9)} 0%, ${alpha(appTheme.palette.secondary.main, 0.9)} 100%)`,
            color: 'common.white'
          }}
        >
          <Container maxWidth="lg">
            <Typography variant="body2" align="center" sx={{ opacity: 0.9 }}>
              {'© '}
              AI UI Critic {new Date().getFullYear()}
              {'. Powered by AI Magic ✨'}
            </Typography>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;