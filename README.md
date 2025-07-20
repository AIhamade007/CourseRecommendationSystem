# Course Recommendation Chat Application

A React-based web application that helps teachers find personalized course recommendations using Google's Gemini AI. The application features user authentication, profile management, and an intelligent chat interface.

## Features

- **User Authentication**: Secure login and registration using Firebase Auth
- **User Profiles**: Capture teacher preferences including subject interests, grade level, and experience
- **Intelligent Chat**: AI-powered course recommendations using Google's Gemini API
- **Personalized Responses**: Gemini considers user profile data to provide tailored recommendations
- **Modern UI**: Clean, responsive interface with real-time chat experience

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Authentication**: Firebase Auth
- **Database**: Cloud Firestore (Firebase)
- **AI Integration**: Google Gemini API
- **Routing**: React Router v6
- **Styling**: Inline styles (easily replaceable with CSS modules/styled-components)

## Project Structure

```
src/
├── components/           # React components
│   ├── Login.tsx        # Login page
│   ├── Register.tsx     # Registration page
│   ├── Chat.tsx         # Main chat interface
│   └── ProtectedRoute.tsx # Route protection wrapper
├── contexts/            # React contexts
│   └── AuthContext.tsx  # Authentication context and provider
├── config/              # Configuration files
│   ├── firebase.ts      # Firebase setup
│   └── gemini.ts        # Gemini AI configuration
├── types/               # TypeScript type definitions
│   └── User.ts          # User and chat interfaces
├── App.tsx              # Main app component with routing
├── index.tsx            # Application entry point
└── index.css            # Global styles
```

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd course-recommendation-chat
npm install
```

### 2. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use an existing one
3. Enable Authentication and choose "Email/Password" as a sign-in method
4. Enable Cloud Firestore database
5. Get your Firebase configuration from Project Settings > General > Your apps
6. Copy the configuration values for the environment file

### 3. Google Gemini API Setup

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key for Gemini
3. Copy the API key for the environment file

### 4. Environment Configuration

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Fill in your actual configuration values:
```bash
# Gemini AI API Configuration
REACT_APP_GEMINI_API_KEY=your_actual_gemini_api_key

# Firebase Configuration  
REACT_APP_FIREBASE_API_KEY=your_actual_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_actual_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_actual_sender_id
REACT_APP_FIREBASE_APP_ID=your_actual_app_id
```

### 5. Update Firebase Configuration

Edit `src/config/firebase.ts` to use environment variables:

```typescript
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};
```

### 6. Run the Application

```bash
npm start
```

The application will open in your browser at `http://localhost:3000`.

## How to Use

### 1. Registration
1. Navigate to the registration page
2. Fill in your details including:
   - Name and email
   - Grade level you teach
   - Teaching experience level
   - Subject interests (select multiple)
3. Create your account

### 2. Login
1. Use your email and password to log in
2. You'll be redirected to the chat interface

### 3. Chat Interface
1. The AI assistant will greet you with a personalized welcome message
2. Ask questions about:
   - Course recommendations
   - Professional development opportunities
   - Teaching resources
   - Subject-specific guidance
3. The AI uses your profile information to provide tailored responses

## User Data Storage

The application stores the following user data in Firebase Firestore:

```typescript
interface User {
  uid: string;              // Firebase user ID
  name: string;             // Full name
  email: string;            // Email address
  subjectInterests: string[]; // Array of subject interests
  gradeLevel: string;       // Grade level taught
  experience: string;       // Teaching experience level
  createdAt: Date;         // Account creation timestamp
}
```

## AI Integration Details

The Gemini AI integration includes:

- **Context-Aware Prompts**: User profile data is included in every AI request
- **Personalized Responses**: Recommendations are tailored to:
  - Subject interests
  - Grade level
  - Teaching experience
  - User's specific questions
- **Error Handling**: Graceful fallback when AI service is unavailable

## Customization Options

### Styling
- Current implementation uses inline styles for simplicity
- Can be easily replaced with:
  - CSS modules
  - Styled-components
  - Tailwind CSS
  - Material-UI

### Additional Features
- Chat history persistence
- File upload for documents
- Course bookmarking
- Teacher community features
- Integration with learning management systems

## Security Considerations

- All API keys should be kept secure and not committed to version control
- Firebase Security Rules should be configured for production
- User data is stored securely in Firestore with proper authentication
- Environment variables are used for all sensitive configuration

## Deployment

For production deployment:

1. Build the application: `npm run build`
2. Deploy to your preferred hosting service (Firebase Hosting, Netlify, Vercel)
3. Configure environment variables in your hosting service
4. Set up Firebase Security Rules for production

## Troubleshooting

### Common Issues

1. **Firebase Connection Error**: Check your Firebase configuration and ensure the project is active
2. **Gemini API Error**: Verify your API key and ensure you have credits/quota
3. **Build Errors**: Make sure all environment variables are properly set
4. **Authentication Issues**: Check Firebase Auth configuration and email/password provider setup

### Support

For issues and questions:
1. Check the console for error messages
2. Verify all configuration files are properly set up
3. Ensure all environment variables are correctly configured
4. Check Firebase and Gemini API documentation for service-specific issues