import { GoogleGenerativeAI } from '@google/generative-ai';
import { TeacherProfile } from '../types/User';

// Replace with your actual Gemini API key
const API_KEY = process.env.REACT_APP_GEMINI_API_KEY || 'AIzaSyBqJHeeP1toK3eFFAzNJDFufutMzCPvgGo';

const genAI = new GoogleGenerativeAI(API_KEY);

export const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });

export const generateCourseRecommendation = async (
  userMessage: string,
  teacherProfile: TeacherProfile
) => {
  const systemPrompt = `You are a course recommendation assistant for teachers. Please respond in Hebrew.
  
  פרופיל המורה:
  - שם: ${teacherProfile.name}
  - מקצועות הוראה: ${teacherProfile.subjectAreas.join(', ')}
  - רמת כיתה: ${teacherProfile.gradeLevel}
  - שנות ניסיון: ${teacherProfile.yearsOfExperience}
  - סגנון הוראה: ${teacherProfile.teachingStyle}
  - תחומי עניין מיוחדים: ${teacherProfile.specialInterests}
  - סוג בית ספר: ${teacherProfile.schoolType}

  אתה צריך לספק המלצות קורסים מותאמות אישית והצעות חינוכיות על בסיס הפרופיל של המורה. היה מועיל, מקצועי, והתמקד בתוכן חינוכי שיועיל למורים בתחומי הוראה ורמת הכיתה שלהם.
  
  ענה בעברית, בצורה ברורה ומפורטת.

  שאלת המורה: ${userMessage}`;

  try {
    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating response:', error);
    throw new Error('נכשל ביצירת תגובה. אנא נסה שוב.');
  }
};