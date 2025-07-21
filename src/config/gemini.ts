import { GoogleGenerativeAI } from '@google/generative-ai';

// Replace with your actual Gemini API key
const API_KEY = process.env.REACT_APP_GEMINI_API_KEY || 'AIzaSyBqJHeeP1toK3eFFAzNJDFufutMzCPvgGo';

const genAI = new GoogleGenerativeAI(API_KEY);

export const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });

export const generateCourseRecommendation = async (
  userMessage: string,
  userProfile: {
    name: string;
    subjectInterests: string[];
    gradeLevel: string;
    experience: string;
  }
) => {
  const systemPrompt = `You are a course recommendation assistant for teachers. 
  
User Profile:
- Name: ${userProfile.name}
- Subject Interests: ${userProfile.subjectInterests.join(', ')}
- Grade Level: ${userProfile.gradeLevel}
- Teaching Experience: ${userProfile.experience}

You should provide personalized course recommendations, teaching strategies, and educational resources based on the user's profile and interests. Be helpful, professional, and focus on educational content that would benefit teachers in their subject areas and grade level.

User Question: ${userMessage}`;

  try {
    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating response:', error);
    throw new Error('Failed to generate response. Please try again.');
  }
};