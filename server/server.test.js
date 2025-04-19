// server/server.test.js
const request = require('supertest');
// Important: You need to export your app for testing *without* starting the server
// Modify server.js to export app: module.exports = app; (conditionally listen)

// --- Modification needed in server.js ---
// At the bottom of server.js:
/*
if (require.main === module) { // Only listen if the script is run directly
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}

module.exports = app; // Export app for testing
*/
// --- End Modification ---

const app = require('./server'); // Import the configured app

describe('API Endpoints', () => {
  // Test the basic route
  it('GET /api - should return welcome message', async () => {
    const res = await request(app).get('/api');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Welcome to AI UI Critic API!');
  });

  // Test upload endpoint (requires more mocking for Cloudinary/OpenAI)
  // This is a basic structure, mocking is complex
  it('POST /api/upload - should fail without a file', async () => {
      const res = await request(app)
          .post('/api/upload')
          .send({}); // Send empty request
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'No file uploaded.');
  });

   // Test upload endpoint with a file (requires file mocking)
   it('POST /api/upload - should accept a valid image file', async () => {
      // Mocking Cloudinary uploader would be needed here using jest.mock()
      // jest.mock('./config/cloudinary', () => ({
      //     uploader: {
      //         upload: jest.fn().mockResolvedValue({ secure_url: 'http://mock.url/image.png', public_id: 'mock_id' })
      //     }
      // }));
      const res = await request(app)
          .post('/api/upload')
          .attach('designImage', Buffer.from('fake image data'), 'test.png') // Attach a dummy file buffer
      // Assert based on mocked Cloudinary response (expect 201, check body)
      // expect(res.statusCode).toEqual(201);
      // expect(res.body).toHaveProperty('imageUrl');
   }, 10000); // Increase timeout for potential async operations


  // Add tests for /api/analyze/journey, /api/generate/abtest
  // These will require mocking the 'openai' library calls
  // Example (conceptual):
  // jest.mock('openai', () => ({
  //   OpenAI: jest.fn().mockImplementation(() => ({
  //     chat: {
  //       completions: {
  //         create: jest.fn().mockResolvedValue({ choices: [{ message: { content: 'Mocked AI Response' } }] })
  //       }
  //     }
  //   }))
  // }));
  // Then test the endpoints, asserting the mocked response is returned correctly.

});