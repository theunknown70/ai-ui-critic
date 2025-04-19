// src/pages/ResultsPage.tsx
import React, { useEffect, useState } from 'react';
import {
  Typography,
  Container,
  Box,
  CircularProgress,
  Alert,
  Paper,
  Grid,
} from '@mui/material';
import { useParams, useLocation } from 'react-router-dom';
import axios from 'axios'; // Make sure axios is imported

interface ContrastResult {
  status: 'Pass' | 'Fail' | 'Needs Review';
  notes: string;
  // Potentially add specific element details if analysis was deeper
}

const ResultsPage: React.FC = () => {
  const { id } = useParams(); // Get the ID from the URL
  const location = useLocation(); // Get state passed during navigation
  const [imageUrl, setImageUrl] = useState<string | null>(
    location.state?.imageUrl || null
  );
  const [loading, setLoading] = useState<boolean>(!imageUrl); // Start loading if no URL passed
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

  // TODO: Fetch analysis results from backend using the 'id'
  useEffect(() => {
    if (!imageUrl && id) {
      // If imageUrl wasn't passed via state, you might need to fetch
      // details from the backend using the id.
      // For now, we assume it was passed or show an error.
      console.log(`Workspaceing results for ID: ${id}`);
      // Example: fetch(`/api/results/${id}`).then(...).then(data => setImageUrl(data.imageUrl))
      // Simulate loading/error if not passed
      setError('Image URL not found. Cannot display results.');
      setLoading(false);
    } else if (imageUrl) {
      setLoading(false); // Image URL was passed, stop loading indicator
    }
    // Placeholder: Trigger fetching other analysis data here
    // fetchAnalysisData(id);

    const fetchAnalysisData = async (
      analysisId: string | undefined,
      imgUrl: string | null
    ) => {
      if (!analysisId || !imgUrl) return;

      // --- Trigger Contrast Analysis (keep existing simulation or make real API call) ---
      // Reset all states on new analysis fetch
      setIsAnalyzingContrast(true);
      setContrastResult(null);
      setIsAnalyzingJourney(true);
      setJourneyAnalysis(null);
      setJourneyError(null);
      setIsGeneratingAB(true);
      setAbSuggestions(null);
      setAbError(null);

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1500)); // 1.5 second delay

      // TODO: Replace with actual API call:
      // try {
      //   const response = await axios.get(`/api/results/${analysisId}/contrast`);
      //   setContrastResult(response.data);
      // } catch (err) {
      //   console.error("Failed to fetch contrast results:", err);
      //   setContrastResult({ status: 'Needs Review', notes: 'Error fetching contrast analysis.' });
      // }

      // --- Mock Result ---
      const mockPass = Math.random() > 0.4; // Simulate pass/fail
      setContrastResult({
        status: mockPass ? 'Pass' : 'Fail',
        notes: mockPass
          ? 'Overall contrast appears adequate based on initial scan. Review specific text elements for WCAG AA/AAA compliance.'
          : 'Potential contrast issues detected. Check low-contrast text (e.g., light gray on white) or text over complex backgrounds.',
      });
      // --- End Mock Result ---
      setIsAnalyzingContrast(false); // Assuming it finishes

      // --- Trigger Journey Analysis ---
      setIsAnalyzingJourney(true);
      setJourneyAnalysis(null);
      setJourneyError(null);
      try {
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
        const response = await axios.post(`${apiUrl}/api/analyze/journey`, {
          imageUrl: imgUrl,
          analysisId: analysisId,
          // context: "Optional context about the design goal"
        });
        setJourneyAnalysis(response.data.journeyAnalysis);
      } catch (err: any) {
        console.error('Failed to fetch journey analysis:', err);
        let errorMessage = 'Failed to get journey analysis.';
        if (axios.isAxiosError(err) && err.response) {
          errorMessage = err.response.data?.message || errorMessage;
        } else if (err instanceof Error) {
          errorMessage = err.message;
        }
        setJourneyError(errorMessage);
        setJourneyAnalysis(null); // Clear any potential stale data
      } finally {
        setIsAnalyzingJourney(false);
      }
      // --- Trigger A/B Test Generation ---
      try {
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
        // You could potentially pass specific element details if identified
        const abResponse = await axios.post(`${apiUrl}/api/generate/abtest`, {
          imageUrl: imgUrl,
          analysisId: analysisId,
          // elementType: 'button', elementDescription: 'Primary CTA' // Example
        });
        setAbSuggestions(abResponse.data.abTestSuggestions);
      } catch (err: any) {
        console.error('Failed to fetch A/B suggestions:', err);
        let errorMessage = 'Failed to get A/B suggestions.';
        if (axios.isAxiosError(err) && err.response) {
          errorMessage = err.response.data?.message || errorMessage;
        } else if (err instanceof Error) {
          errorMessage = err.message;
        }
        setAbError(errorMessage);
      } finally {
        setIsGeneratingAB(false);
      }
    };

    // Only fetch if we have the necessary info
    if (id && imageUrl) {
      fetchAnalysisData(id, imageUrl);
    } else if (!imageUrl && id) {
      // Handle case where image URL needs fetching first (more complex setup)
      setError('Image URL missing, cannot start analysis.');
      setLoading(false);
    }
    // Prevent cleanup function from running on initial mount if not needed
    // return () => { /* cleanup if necessary */ };
  }, [id, imageUrl]); // Re-run if id changes

  // Assuming imageUrl holds the primary image URL
  const beforeImageUrl = imageUrl; // The original
  const [afterImageUrl, setAfterImageUrl] = useState<string | null>(null); // State for the 'after' image (e.g., from A/B test variant)

  // TODO: Fetch or generate the 'after' image URL based on analysis/variants later

  if (loading) {
    return (
      <Container sx={{ textAlign: 'center', mt: 5 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      {' '}
      {/* Usually results need more space */}
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Analysis Results for Design {id}
        </Typography>

        {/* Side-by-Side Image View */}
        <Paper elevation={3} sx={{ p: 2, mb: 4 }}>
          <Typography variant="h6" gutterBottom align="center">
            Design Comparison
          </Typography>
          <Grid container spacing={2} alignItems="flex-start">
            {/* Before Image */}
            <Grid size={6}>
              <Typography variant="subtitle1" align="center" gutterBottom>
                Before
              </Typography>
              {beforeImageUrl ? (
                <Box
                  sx={{ border: '1px solid #ddd', p: 1, background: '#f9f9f9' }}
                >
                  <img
                    src={beforeImageUrl}
                    alt={`Original Design ${id}`}
                    style={{ display: 'block', width: '100%', height: 'auto' }}
                  />
                </Box>
              ) : (
                <Typography color="text.secondary" align="center">
                  Image not available.
                </Typography>
              )}
            </Grid>

            {/* After Image (Placeholder) */}
            <Grid size={6}>
              <Typography variant="subtitle1" align="center" gutterBottom>
                After / Variant
              </Typography>
              {afterImageUrl ? ( // Use afterImageUrl state
                <Box
                  sx={{ border: '1px solid #ddd', p: 1, background: '#f9f9f9' }}
                >
                  <img
                    src={afterImageUrl}
                    alt={`Modified Design ${id}`}
                    style={{ display: 'block', width: '100%', height: 'auto' }}
                  />
                </Box>
              ) : (
                <Box
                  sx={{
                    border: '1px dashed #ccc',
                    p: 1,
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '200px',
                    background: '#fafafa',
                  }}
                >
                  <Typography color="text.secondary" align="center">
                    No 'After' image generated yet.
                  </Typography>
                </Box>
              )}
            </Grid>
          </Grid>
          {/* TODO: Add controls for switching variants if multiple A/B tests exist */}
        </Paper>

        {/* Column 2: Analysis & Feedback */}
        <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
          <Typography variant="h6" gutterBottom>
            Feedback & Analysis
          </Typography>

          {/* Contrast Check Section */}
          <Box mt={2} p={2} border={1} borderColor="divider" borderRadius={1}>
            <Typography variant="subtitle1" gutterBottom>
              Contrast Check:
            </Typography>
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
              <Typography color="text.secondary">
                Analysis pending or failed.
              </Typography>
            )}
          </Box>
          <Box mt={2} p={2} border={1} borderColor="divider" borderRadius={1}>
            <Typography variant="subtitle1" gutterBottom>
              Simulated User Journey:
            </Typography>
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
              // Render markdown or preformatted text nicely
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {journeyAnalysis}
              </Typography>
            ) : (
              <Typography color="text.secondary">
                Analysis pending or failed.
              </Typography>
            )}
          </Box>
          <Box mt={2} p={2} border={1} borderColor="divider" borderRadius={1}>
            <Typography variant="subtitle1" gutterBottom>
              A/B Test Suggestions:
            </Typography>
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
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {abSuggestions}
              </Typography>
            ) : (
              <Typography color="text.secondary">
                Suggestions pending or failed.
              </Typography>
            )}
          </Box>
          {/* Add Side-by-Side comparison controls, Heatmap Sim Display here */}
        </Paper>
      </Box>
    </Container>
  );
};

export default ResultsPage;
