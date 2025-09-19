import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import backgroundImage from './pics/smsm.jpg';

interface TeacherData {
  name: string;
  subjectAreas: string[];
  gradeLevel: string;
  yearsOfExperience: string;
  teachingStyle: string;
  specialInterests: string;
  schoolType: string;
}

const TeacherInfo: React.FC = () => {
  const [teacherData, setTeacherData] = useState<TeacherData>({
    name: '',
    subjectAreas: [],
    gradeLevel: '',
    yearsOfExperience: '',
    teachingStyle: '',
    specialInterests: '',
    schoolType: ''
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
      setTeacherData(JSON.parse(existingInfo));
    }
  }, []);

  const handleSubjectChange = (subject: string) => {
    setTeacherData(prev => ({
      ...prev,
      subjectAreas: prev.subjectAreas.includes(subject)
        ? prev.subjectAreas.filter(s => s !== subject)
        : [...prev.subjectAreas, subject]
    }));
  };

  const handleInputChange = (field: keyof TeacherData, value: string) => {
    setTeacherData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!teacherData.subjectAreas.length || !teacherData.gradeLevel || !teacherData.yearsOfExperience) {
      alert('אנא מלאו את כל השדות הנדרשים');
      return;
    }

    try {
      setLoading(true);
      
      // Store teacher information in localStorage
      localStorage.setItem('teacherInfo', JSON.stringify(teacherData));
      
      // Navigate to chat
      navigate('/chat');
    } catch (error) {
      console.error('Failed to save teacher info:', error);
      setLoading(false);
    }
  };

  const subjects = [
    'מתמטיקה', 'אנגלית', 'עברית', 'היסטוריה', 'גיאוגרפיה', 
    'מדעים', 'פיזיקה', 'כימיה', 'ביולוגיה', 'מחשבים', 
    'אמנות', 'מוזיקה', 'ספורט', 'ספרות', 'פילוסופיה'
  ];

  const gradeLevels = [
    'גן ילדים', 'כיתות א׳-ב׳', 'כיתות ג׳-ו׳', 
    'כיתות ז׳-ט׳', 'כיתות י׳-יב׳', 'השכלה גבוהה'
  ];

  const experienceLevels = [
    'מורה חדש (0-2 שנים)', '3-5 שנים', '6-10 שנים', 
    '11-15 שנים', '16-20 שנים', 'מעל 20 שנה'
  ];

  const teachingStyles = [
    'למידה אינטראקטיבית', 'למידה מבוססת פרויקטים', 'הרצאות מובנות',
    'למידה חוויתית', 'למידה משתפת', 'למידה מותאמת אישית'
  ];

  const schoolTypes = [
    'בית ספר יסודי ממלכתי', 'בית ספר יסודי דתי', 'חטיבת ביניים',
    'תיכון כללי', 'תיכון טכנולוגי', 'מכללה/אוניברסיטה'
  ];

  return (
    <div style={styles.container} dir="rtl">
      <div style={styles.formContainer}>
        <h1 style={styles.title}>מידע על המורה</h1>
        <p style={styles.subtitle}>
          בואו נכיר אותך קצת יותר כדי שנוכל לתת לך המלצות מותאמות אישית
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Subject Areas */}
          <div style={styles.section}>
            <label style={styles.sectionTitle}>אילו מקצועות אתה מלמד? *</label>
            <div style={styles.checkboxGrid}>
              {subjects.map(subject => (
                <label key={subject} style={styles.checkboxItem}>
                  <input
                    type="checkbox"
                    checked={teacherData.subjectAreas.includes(subject)}
                    onChange={() => handleSubjectChange(subject)}
                    style={styles.checkbox}
                  />
                  {subject}
                </label>
              ))}
            </div>
          </div>

          {/* Grade Level */}
          <div style={styles.section}>
            <label style={styles.sectionTitle}>באיזה רמת כיתה אתה מלמד? *</label>
            <select
              value={teacherData.gradeLevel}
              onChange={(e) => handleInputChange('gradeLevel', e.target.value)}
              style={styles.select}
              required
            >
              <option value="">בחר רמת כיתה</option>
              {gradeLevels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>

          {/* Years of Experience */}
          <div style={styles.section}>
            <label style={styles.sectionTitle}>כמה שנות ניסיון יש לך בהוראה? *</label>
            <select
              value={teacherData.yearsOfExperience}
              onChange={(e) => handleInputChange('yearsOfExperience', e.target.value)}
              style={styles.select}
              required
            >
              <option value="">בחר שנות ניסיון</option>
              {experienceLevels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>

          {/* Teaching Style */}
          <div style={styles.section}>
            <label style={styles.sectionTitle}>מה הסגנון ההוראה המועדף עליך?</label>
            <select
              value={teacherData.teachingStyle}
              onChange={(e) => handleInputChange('teachingStyle', e.target.value)}
              style={styles.select}
            >
              <option value="">בחר סגנון הוראה</option>
              {teachingStyles.map(style => (
                <option key={style} value={style}>{style}</option>
              ))}
            </select>
          </div>

          {/* School Type */}
          <div style={styles.section}>
            <label style={styles.sectionTitle}>באיזה סוג בית ספר אתה מלמד?</label>
            <select
              value={teacherData.schoolType}
              onChange={(e) => handleInputChange('schoolType', e.target.value)}
              style={styles.select}
            >
              <option value="">בחר סוג בית ספר</option>
              {schoolTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Special Interests */}
          <div style={styles.section}>
            <label style={styles.sectionTitle}>תחומי עניין מיוחדים או התמחויות</label>
            <textarea
              value={teacherData.specialInterests}
              onChange={(e) => handleInputChange('specialInterests', e.target.value)}
              placeholder="למשל: טכנולוגיה בחינוך, חינוך מיוחד, מחוננים..."
              style={styles.textarea}
              rows={3}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading || !teacherData.subjectAreas.length || !teacherData.gradeLevel || !teacherData.yearsOfExperience}
            style={{
              ...styles.button,
              opacity: (loading || !teacherData.subjectAreas.length || !teacherData.gradeLevel || !teacherData.yearsOfExperience) ? 0.6 : 1,
              cursor: (loading || !teacherData.subjectAreas.length || !teacherData.gradeLevel || !teacherData.yearsOfExperience) ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'שומר...' : 'המשך לצ\'אט'}
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

  checkboxGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '8px'
  },

  checkboxItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontSize: '14px'
  },

  checkbox: {
    margin: 0,
    cursor: 'pointer'
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
  .checkbox-item:hover {
    background-color: #f8f9ff !important;
    border-color: #7a35d5 !important;
  }
  
  select:focus, textarea:focus {
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