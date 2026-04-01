const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

module.exports = (db) => {
  // Initialize Gemini AI
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  // POST /api/chatbot - Chat with course planning assistant
  router.post('/', async (req, res) => {
    try {
      const { message } = req.body;

      // Validate input
      if (!message || typeof message !== 'string' || message.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Message is required and must be a non-empty string'
        });
      }

      // Check if API key is configured
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({
          success: false,
          message: 'Chatbot service is not configured. Please set GEMINI_API_KEY environment variable.'
        });
      }

      // Fetch available courses from database for context
      const courses = await db.findAll('courses');
      const courseTitles = courses.map(c => c.title).slice(0, 50); // Limit to avoid token overflow

      // Create prompt for a conversational high school counselor
      const prompt = `You are a friendly and supportive high school counselor. Your role is to help students with:
- Course selection and academic planning
- College preparation and applications
- Study tips and time management
- Social and emotional support
- Extracurricular activities and clubs
- Career exploration

Some courses available at this school include: ${courseTitles.join(', ')}

Be warm, encouraging, and give practical advice. Keep responses concise but helpful.

Student's question: "${message.trim()}"

Respond naturally as a counselor would:`;

      // Get model and generate response
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();

      res.json({
        success: true,
        data: { response: text },
        message: 'Chatbot response generated successfully'
      });

    } catch (error) {
      console.error('Chatbot error:', error);

      // Provide more helpful error messages
      let errorMessage = 'Error processing chatbot request';
      let statusCode = 500;

      if (error.message?.includes('404') || error.message?.includes('not found')) {
        errorMessage = 'Model not found. This usually means: 1) Your API key may not have access to this model, 2) The model name may be incorrect, or 3) Your API key may be invalid. Please check your GEMINI_API_KEY in the .env file.';
        statusCode = 503; // Service unavailable
      } else if (error.message?.includes('API key') || error.message?.includes('authentication')) {
        errorMessage = 'Invalid API key. Please check your GEMINI_API_KEY in the .env file.';
        statusCode = 401;
      }

      res.status(statusCode).json({
        success: false,
        message: errorMessage,
        error: error.message
      });
    }
  });

  return router;
};
