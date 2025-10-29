import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import backgroundImage from './pics/smsm.jpg';

interface TeacherData {
  name: string;
  subjectArea: string;
  schoolType: string;
  educationLevels: string[];
  language: string;
}

const TeacherInfo: React.FC = () => {
  const [teacherData, setTeacherData] = useState<TeacherData>({
    name: '',
    subjectArea: '',
    schoolType: '',
    educationLevels: [],
    language: ''
  });
  const [loading, setLoading] = useState(false);

  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Get the stored name from localStorage
    const storedName = localStorage.getItem('userName');
    if (storedName) {
      setTeacherData(prev => ({ ...prev, name: storedName }));
    }

    // Check if teacher info already exists
    const existingInfo = localStorage.getItem('teacherInfo');
    if (existingInfo) {
      const info = JSON.parse(existingInfo);
      // Remove yearsOfExperience, teachingStyle, and specialInterests if present from old data
      // Convert old subjectAreas array to single subjectArea string
      const { yearsOfExperience, teachingStyle, subjectAreas, gradeLevel, specialInterests, ...cleanedInfo } = info;
      const updatedInfo = {
        ...cleanedInfo,
        subjectArea: subjectAreas ? subjectAreas.join(', ') : info.subjectArea || ''
      };
      setTeacherData(prev => ({ ...prev, ...updatedInfo }));
    }
  }, []);

  const handleInputChange = (field: keyof TeacherData, value: string) => {
    setTeacherData(prev => ({ ...prev, [field]: value }));
  };

    const handleEducationLevelChange = (level: string) => {
    setTeacherData(prev => ({
      ...prev,
      educationLevels: prev.educationLevels.includes(level)
        ? prev.educationLevels.filter(l => l !== level)
        : [...prev.educationLevels, level]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!teacherData.subjectArea.trim() || !teacherData.schoolType) {
      alert('אנא מלאו את כל השדות הנדרשים');
      return;
    }

    try {
      setLoading(true);
      
      // Store teacher information in localStorage
      localStorage.setItem('teacherInfo', JSON.stringify(teacherData));
      
      // Navigate to course selection
      navigate('/course-selection');
    } catch (error) {
      console.error('Failed to save teacher info:', error);
      setLoading(false);
    }
  };

  const schoolTypes = [
    'יהודי', "בדואי", "ערבי", "דרוזי", "צרקסי", "אחר"
  ];

  return (
    <div style={styles.container} dir="rtl">
      <div style={styles.formContainer}>
        <h1 style={styles.title}>מידע על המורה</h1>
        <p style={styles.subtitle}>
          בואו נכיר אותך קצת יותר כדי שנוכל לתת לך המלצות מותאמות אישית
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Subject Area */}
          <div style={styles.section}>
            <label style={styles.sectionTitle}>איזה מקצוע אתה מלמד? *</label>
            <input
              type="text"
              value={teacherData.subjectArea}
              onChange={(e) => handleInputChange('subjectArea', e.target.value)}
              placeholder="למשל: מתמטיקה, אנגלית, מורה בכיתה..."
              style={styles.input}
              required
            />
          </div>

          {/* School Type */}
          <div style={styles.section}>
            <label style={styles.sectionTitle}>איזה מגזר בית ספר אתה מלמד? *</label>
            <select
              value={teacherData.schoolType}
              onChange={(e) => handleInputChange('schoolType', e.target.value)}
              style={styles.select}
              required
            >
              <option value="">בחר מגזר</option>
              {schoolTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Education Levels */}
          <div style={styles.section}>
            <label style={styles.sectionTitle}>רמות חינוך:</label>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-start', direction: 'rtl', marginTop: '10px', flexWrap: 'wrap' }}>
              {['ממלכתי', 'ממלכתי דתי', 'חרדי', 'על יסודי', 'יסודי'].map(level => (
                <label key={level} style={{ display: 'flex', alignItems: 'center', direction: 'rtl', fontSize: '16px' }}>
                  <input
                    type="checkbox"
                    checked={teacherData.educationLevels.includes(level)}
                    onChange={() => handleEducationLevelChange(level)}
                    style={{ marginLeft: '8px' }}
                  />
                  {level}
                </label>
              ))}
            </div>
          </div>

          {/* Language */}
          <div style={styles.section}>
            <label style={styles.sectionTitle}>שפת הוראה: *</label>
            <select
              value={teacherData.language}
              onChange={(e) => handleInputChange('language', e.target.value)}
              style={styles.select}
              required
            >
              <option value="">בחר שפה</option>
              <option value="עברית">עברית</option>
              <option value="ערבית">ערבית</option>
            </select>
          </div>

          <button 
            type="submit" 
            disabled={loading || !teacherData.subjectArea.trim() || !teacherData.schoolType || !teacherData.language}
            style={{
              ...styles.button,
              opacity: (loading || !teacherData.subjectArea.trim() || !teacherData.schoolType || !teacherData.language) ? 0.6 : 1,
              cursor: (loading || !teacherData.subjectArea.trim() || !teacherData.schoolType || !teacherData.language) ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'שומר...' : 'המשך לבחירת קורסים'}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundImage: `url(${backgroundImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    fontFamily: '"Inter", "Noto Sans Hebrew", Arial, sans-serif',
    padding: '20px',
    direction: 'rtl' as const
  },

  formContainer: {
    backgroundColor: 'white',
    padding: '40px 32px',
    borderRadius: '16px',
    boxShadow: '0 12px 30px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '600px',
    direction: 'rtl' as const,
    maxHeight: '90vh',
    overflowY: 'auto' as const
  },

  title: {
    marginBottom: '16px',
    color: '#1f1f1f',
    fontSize: '32px',
    fontWeight: 700,
    background: 'linear-gradient(to right, #7a35d5, #b84ef1)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    textAlign: 'center' as const
  },

  subtitle: {
    marginBottom: '32px',
    color: '#555',
    fontSize: '16px',
    fontWeight: 400,
    lineHeight: '1.5',
    textAlign: 'center' as const
  },

  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '24px'
  },

  section: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px'
  },

  sectionTitle: {
    color: '#333',
    fontWeight: 600,
    fontSize: '16px'
  },

  input: {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '16px',
    fontFamily: '"Inter", "Noto Sans Hebrew", Arial, sans-serif',
    direction: 'rtl' as const,
    textAlign: 'right' as const,
    background: '#fafafa',
    boxSizing: 'border-box' as const
  },

  select: {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '16px',
    fontFamily: '"Inter", "Noto Sans Hebrew", Arial, sans-serif',
    direction: 'rtl' as const,
    textAlign: 'right' as const,
    background: '#fafafa'
  },

  textarea: {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '16px',
    fontFamily: '"Inter", "Noto Sans Hebrew", Arial, sans-serif',
    direction: 'rtl' as const,
    textAlign: 'right' as const,
    background: '#fafafa',
    resize: 'vertical' as const,
    minHeight: '80px'
  },

  button: {
    width: '100%',
    background: 'linear-gradient(to right, #7a35d5, #b84ef1)',
    color: '#fff',
    padding: '16px',
    border: 'none',
    borderRadius: '12px',
    fontSize: '18px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(106, 17, 203, 0.3)',
    marginTop: '16px'
  }
};

// Add hover styles
const hoverStyles = `
  input:focus, select:focus, textarea:focus {
    border-color: #7a35d5 !important;
    box-shadow: 0 0 0 3px rgba(122, 53, 213, 0.1) !important;
    background: white !important;
  }
  
  button:hover:not(:disabled) {
    transform: translateY(-2px) !important;
    box-shadow: 0 6px 20px rgba(106, 17, 203, 0.4) !important;
  }
`;

if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = hoverStyles;
  document.head.appendChild(style);
}

export default TeacherInfo;