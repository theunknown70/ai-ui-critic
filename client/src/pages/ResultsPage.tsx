import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Typography,
  Container,
  Box,
  CircularProgress,
  Alert,
  Paper,
  Grid,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import PaletteIcon from '@mui/icons-material/Palette';
import InsightsIcon from '@mui/icons-material/Insights';
import ScienceIcon from '@mui/icons-material/Science';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

interface ContrastResult {
  status: 'Pass' | 'Fail' | 'Needs Review';
  notes: string;
}

type MarkdownRendererProps = {
  text: string;
};

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ text }) => (
  <ReactMarkdown
    children={text}
    remarkPlugins={[remarkGfm]}
    components={{
      p: ({ node, ...props }) => (
        <Typography
          variant="body2"
          sx={{ whiteSpace: 'pre-wrap', mt: 1 }}
          {...props}
        />
      ),
      strong: ({ node, ...props }) => (
        <Typography component="span" sx={{ fontWeight: 'bold' }} {...props} />
      ),
      em: ({ node, ...props }) => (
        <Typography component="span" sx={{ fontStyle: 'italic' }} {...props} />
      ),
      ul: ({ node, ...props }) => (
        <Box component="ul" sx={{ mt: 1, pl: 2 }} {...props} />
      ),
      ol: ({ node, ...props }) => (
        <Box component="ol" sx={{ mt: 1, pl: 2 }} {...props} />
      ),
      li: ({ node, ...props }) => (
        <Typography
          component="li"
          variant="body2"
          sx={{ mt: 1, pl: 0 }}
          {...props}
        />
      ),
    }}
  />
);

const ResultsPage: React.FC = () => {
  const theme = useTheme();
  const location = useLocation();
  const imageUrl = (location.state as any)?.imageUrl;

  const [loading, setLoading] = useState<boolean>(!imageUrl);
  const [error, setError] = useState<string | null>(null);

  const [contrastResult, setContrastResult] = useState<ContrastResult | null>(
    null
  );
  const [isAnalyzingContrast, setIsAnalyzingContrast] =
    useState<boolean>(false);

  const [journeyAnalysis, setJourneyAnalysis] = useState<string | null>(null);
  const [isAnalyzingJourney, setIsAnalyzingJourney] = useState<boolean>(false);
  const [journeyError, setJourneyError] = useState<string | null>(null);

  const [abSuggestions, setAbSuggestions] = useState<string | null>(null);
  const [isGeneratingAB, setIsGeneratingAB] = useState<boolean>(false);
  const [abError, setAbError] = useState<string | null>(null);

  const [afterImageUrl, setAfterImageUrl] = useState<string | null>(null);
  const [isGeneratingVariant, setIsGeneratingVariant] =
    useState<boolean>(false);
  const [variantError, setVariantError] = useState<string | null>(null);

  useEffect(() => {
    if (!imageUrl) {
      setError('Image URL not found. Cannot display results.');
      setLoading(false);
      return;
    }
    setLoading(false);

    const fetchAnalysisData = async (imgUrl: string) => {
      setIsAnalyzingContrast(true);
      setIsAnalyzingJourney(true);
      setIsGeneratingAB(true);
      setIsGeneratingVariant(true);

      // Simulate contrast API
      await new Promise((r) => setTimeout(r, 1500));
      const mockPass = true;
      setContrastResult({
        status: mockPass ? 'Pass' : 'Fail',
        notes: mockPass
          ? 'Overall contrast appears adequate. Review specific text elements for WCAG AA/AAA compliance.'
          : 'Potential contrast issues detected. Check low-contrast text or text over complex backgrounds.',
      });
      setIsAnalyzingContrast(false);

      const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:5001';
      try {
        const journeyRes = await axios.post(`${apiBase}/api/analyze/journey`, {
          imageUrl: imgUrl,
        });
        setJourneyAnalysis(journeyRes.data.journeyAnalysis);
      } catch (err: any) {
        setJourneyError(
          err?.response?.data?.message ||
            err.message ||
            'Failed to get journey analysis.'
        );
      } finally {
        setIsAnalyzingJourney(false);
      }

      try {
        const abRes = await axios.post(`${apiBase}/api/generate/abtest`, {
          imageUrl: imgUrl,
        });
        setAbSuggestions(abRes.data.abTestSuggestions);
      } catch (err: any) {
        setAbError(
          err?.response?.data?.message ||
            err.message ||
            'Failed to get A/B suggestions.'
        );
      } finally {
        setIsGeneratingAB(false);
      }

      try {
        const varRes = await axios.post(
          `${apiBase}/api/generate/variant-image`,
          { imageUrl: imgUrl }
        );
        setAfterImageUrl(varRes.data.variantImageUrl);
      } catch (err: any) {
        setVariantError(
          err?.response?.data?.message ||
            err.message ||
            'Failed to generate variant image'
        );
      } finally {
        setIsGeneratingVariant(false);
      }
    };

    fetchAnalysisData(imageUrl);
  }, [imageUrl]);

  if (loading) {
    return (
      <Container sx={{ textAlign: 'center', mt: 6 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container component="main" sx={{ py: 4 }} maxWidth="xl">
      <Box sx={{ textAlign: 'center', mb: 2, mt:-2 }}>
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: 700,
            letterSpacing: '-0.02em',
            position: 'relative',
            '&:after': {
              content: '""',
              display: 'block',
              width: 80,
              height: 4,
              background: theme.palette.primary.main,
              mx: 'auto',
              mt: 2,
              borderRadius: 2,
            },
          }}
        >
          Design Insights
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Image Comparison */}
        <Grid size={12}>
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 4,
              background: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: 'blur(20px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Grid container spacing={4}>
              {[
                {
                  label: 'Original Design',
                  src: imageUrl,
                  loading: false,
                  error: null,
                },
                {
                  label: 'AI Optimized',
                  src: afterImageUrl,
                  loading: isGeneratingVariant,
                  error: variantError,
                },
              ].map((img, idx) => (
                <Grid size={{ xs: 12, md: 6 }} key={idx}>
                  <Box
                    sx={{
                      position: 'relative',
                      borderRadius: 4,
                      overflow: 'hidden',
                      boxShadow: theme.shadows[4],
                      height: 500,
                      background: theme.palette.background.default,
                      '&:hover .image-overlay': {
                        opacity: 1,
                      },
                    }}
                  >
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 16,
                        left: 16,
                        zIndex: 1,
                        background: alpha(theme.palette.background.paper, 0.8),
                        px: 2,
                        py: 1,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <FiberManualRecordIcon
                        sx={{
                          fontSize: 14,
                          color:
                            idx === 0
                              ? theme.palette.error.main
                              : theme.palette.success.main,
                          mr: 1,
                        }}
                      />
                      <Typography variant="subtitle2" fontWeight={600}>
                        {img.label}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        p: 2,
                      }}
                    >
                      {img.loading ? (
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                          }}
                        >
                          <CircularProgress size={48} thickness={4} />
                          <Typography
                            variant="body2"
                            sx={{ mt: 2, color: 'text.secondary' }}
                          >
                            Generating optimized version...
                          </Typography>
                        </Box>
                      ) : img.error ? (
                        <Alert severity="error" sx={{ width: '100%' }}>
                          {img.error}
                        </Alert>
                      ) : img.src ? (
                        <Box
                          component="img"
                          src={img.src}
                          alt={img.label}
                          sx={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            borderRadius: 2,
                            transition: 'transform 0.3s ease',
                            '&:hover': {
                              transform: 'scale(1.02)',
                            },
                          }}
                        />
                      ) : (
                        <Typography color="text.secondary">
                          No image available
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Analysis Sections */}
        <Grid size={12}>
          <Grid container spacing={4}>
            <Grid size={12}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  height: '100%',
                  background: alpha(theme.palette.background.paper, 0.8),
                  backdropFilter: 'blur(20px)',
                  borderRadius: 4,
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <PaletteIcon
                    sx={{
                      fontSize: 28,
                      color: theme.palette.primary.main,
                      mr: 2,
                    }}
                  />
                  <Typography variant="h6" fontWeight={600}>
                    Color & Contrast
                  </Typography>
                </Box>
                {isAnalyzingContrast ? (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    <Typography color="text.secondary">Analyzing...</Typography>
                  </Box>
                ) : contrastResult ? (
                  <Box>
                    <Typography
                      component="span"
                      sx={{
                        fontWeight: 'bold',
                        color:
                          contrastResult.status === 'Pass'
                            ? 'success.main'
                            : contrastResult.status === 'Fail'
                              ? 'error.main'
                              : 'warning.main',
                      }}
                    >
                      Status: {contrastResult.status}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {contrastResult.notes}
                    </Typography>
                  </Box>
                ) : (
                  <Typography color="text.secondary">No data.</Typography>
                )}{' '}
              </Paper>
            </Grid>

            <Grid size={12}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  height: '100%',
                  background: alpha(theme.palette.background.paper, 0.8),
                  backdropFilter: 'blur(20px)',
                  borderRadius: 4,
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <InsightsIcon
                    sx={{
                      fontSize: 28,
                      color: theme.palette.primary.main,
                      mr: 2,
                    }}
                  />
                  <Typography variant="h6" fontWeight={600}>
                    User Journey Simulation
                  </Typography>
                </Box>
                {isAnalyzingJourney ? (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    <Typography color="text.secondary">
                      Analyzing with AI...
                    </Typography>
                  </Box>
                ) : journeyError ? (
                  <Alert severity="error">{journeyError}</Alert>
                ) : journeyAnalysis ? (
                  <MarkdownRenderer text={journeyAnalysis} />
                ) : (
                  <Typography color="text.secondary">No data.</Typography>
                )}{' '}
              </Paper>
            </Grid>

            {/* A/B Test Section */}
            <Grid size={12}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  background: alpha(theme.palette.background.paper, 0.8),
                  backdropFilter: 'blur(20px)',
                  borderRadius: 4,
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <ScienceIcon
                    sx={{
                      fontSize: 28,
                      color: theme.palette.primary.main,
                      mr: 2,
                    }}
                  />
                  <Typography variant="h6" fontWeight={600}>
                    A/B Testing Strategies
                  </Typography>
                </Box>
                {isGeneratingAB ? (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    <Typography color="text.secondary">
                      Generating ideas...
                    </Typography>
                  </Box>
                ) : abError ? (
                  <Alert severity="error">{abError}</Alert>
                ) : abSuggestions ? (
                  <MarkdownRenderer text={abSuggestions} />
                ) : (
                  <Typography color="text.secondary">No data.</Typography>
                )}{' '}
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ResultsPage;
