import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import backgroundImage from './pics/smsm.jpg';

interface Course {
  id: string;
  name: string;
  category: string;
}

const CourseSelection: React.FC = () => {
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('הכל');

  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Available courses organized by categories
  const courseCategories = {
    'מדעים': [
      { id: 'math', name: 'מתמטיקה', category: 'מדעים' },
      { id: 'physics', name: 'פיזיקה', category: 'מדעים' },
      { id: 'chemistry', name: 'כימיה', category: 'מדעים' },
      { id: 'biology', name: 'ביולוגיה', category: 'מדעים' },
      { id: 'computer-science', name: 'מדעי המחשב', category: 'מדעים' },
      { id: 'earth-science', name: 'מדעי כדור הארץ', category: 'מדעים' }
    ],
    'שפות': [
      { id: 'hebrew', name: 'עברית', category: 'שפות' },
      { id: 'english', name: 'אנגלית', category: 'שפות' },
      { id: 'arabic', name: 'ערבית', category: 'שפות' },
      { id: 'french', name: 'צרפתית', category: 'שפות' },
      { id: 'spanish', name: 'ספרדית', category: 'שפות' },
      { id: 'russian', name: 'רוסית', category: 'שפות' }
    ],
    'מדעי הרוח': [
      { id: 'history', name: 'היסטוריה', category: 'מדעי הרוח' },
      { id: 'geography', name: 'גיאוגרפיה', category: 'מדעי הרוח' },
      { id: 'civics', name: 'אזרחות', category: 'מדעי הרוח' },
      { id: 'philosophy', name: 'פילוסופיה', category: 'מדעי הרוח' },
      { id: 'literature', name: 'ספרות', category: 'מדעי הרוח' },
      { id: 'social-studies', name: 'מדעי החברה', category: 'מדעי הרוח' }
    ],
    'אמנויות': [
      { id: 'music', name: 'מוזיקה', category: 'אמנויות' },
      { id: 'art', name: 'אמנות', category: 'אמנויות' },
      { id: 'theater', name: 'תיאטרון', category: 'אמנויות' },
      { id: 'dance', name: 'מחול', category: 'אמנויות' },
      { id: 'photography', name: 'צילום', category: 'אמנויות' }
    ],
    'חינוך גופני ובריאות': [
      { id: 'physical-education', name: 'חינוך גופני', category: 'חינוך גופני ובריאות' },
      { id: 'health-education', name: 'חינוך לבריאות', category: 'חינוך גופני ובריאות' },
      { id: 'nutrition', name: 'תזונה', category: 'חינוך גופני ובריאות' }
    ],
    'מקצועות טכנולוגיים': [
      { id: 'technology', name: 'טכנולוגיה', category: 'מקצועות טכנולוגיים' },
      { id: 'engineering', name: 'הנדסה', category: 'מקצועות טכנולוגיים' },
      { id: 'robotics', name: 'רובוטיקה', category: 'מקצועות טכנולוגיים' },
      { id: 'electronics', name: 'אלקטרוניקה', category: 'מקצועות טכנולוגיים' }
    ],
    'חינוך מיוחד': [
      { id: 'special-education', name: 'חינוך מיוחד', category: 'חינוך מיוחד' },
      { id: 'gifted-education', name: 'חינוך מחוננים', category: 'חינוך מיוחד' },
      { id: 'learning-disabilities', name: 'קשיי למידה', category: 'חינוך מיוחד' }
    ],
    'חינוך יסודי': [
      { id: 'elementary-general', name: 'מורה בכיתה (יסודי)', category: 'חינוך יסודי' },
      { id: 'early-childhood', name: 'גיל הרך', category: 'חינוך יסודי' },
      { id: 'kindergarten', name: 'גן ילדים', category: 'חינוך יסודי' }
    ]
  };

  useEffect(() => {
    // Load previously selected courses if they exist
    const existingCourses = localStorage.getItem('selectedCourses');
    if (existingCourses) {
      setSelectedCourses(JSON.parse(existingCourses));
    }
  }, []);

  const handleCourseToggle = (courseId: string) => {
    setSelectedCourses(prev => 
      prev.includes(courseId)
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Store selected courses in localStorage
      localStorage.setItem('selectedCourses', JSON.stringify(selectedCourses));
      
      // Navigate to chat
      navigate('/chat');
    } catch (error) {
      console.error('Failed to save course selection:', error);
      setLoading(false);
    }
  };

  const handleSkip = () => {
    // Store empty array if user skips
    localStorage.setItem('selectedCourses', JSON.stringify([]));
    navigate('/chat');
  };

  // Get all available filter categories
  const filterCategories = ['הכל', ...Object.keys(courseCategories)];

  // Filter courses based on search term and selected filter
  const getFilteredCourses = () => {
    let filteredCategories: Record<string, Course[]> = { ...courseCategories };

    // Apply category filter
    if (selectedFilter !== 'הכל') {
      const selectedCategory = courseCategories[selectedFilter as keyof typeof courseCategories];
      if (selectedCategory) {
        filteredCategories = {
          [selectedFilter]: selectedCategory
        };
      }
    }

    // Apply search filter
    if (searchTerm.trim()) {
      const searchResults: Record<string, Course[]> = {};
      Object.entries(filteredCategories).forEach(([categoryName, courses]) => {
        const matchingCourses = courses.filter(course =>
          course.name.includes(searchTerm.trim())
        );
        if (matchingCourses.length > 0) {
          searchResults[categoryName] = matchingCourses;
        }
      });
      return searchResults;
    }

    return filteredCategories;
  };

  const filteredCourseCategories = getFilteredCourses();

  return (
    <div style={styles.container} dir="rtl">
      <div style={styles.formContainer}>
        <h1 style={styles.title}>בחירת קורסים</h1>
        <p style={styles.subtitle}>
          באילו קורסים השתתפת בעבר? זה יעזור לנו לתת לך המלצות מותאמות יותר
        </p>

        {/* Top Controls */}
        <div style={styles.topControls}>
          {/* Search Bar */}
          <div style={styles.searchContainer}>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="חפש קורס..."
              style={styles.searchInput}
            />
          </div>

          {/* Filter Dropdown */}
          <div style={styles.filterContainer}>
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              style={styles.filterSelect}
            >
              {filterCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div style={styles.topButtonContainer}>
            <button 
              type="button" 
              onClick={handleSkip}
              className="top-skip-button"
              style={styles.topSkipButton}
            >
              דלג
            </button>
            <button 
              type="button" 
              onClick={handleSubmit}
              disabled={loading}
              className="top-continue-button"
              style={{
                ...styles.topContinueButton,
                opacity: loading ? 0.6 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'שומר...' : 'המשך'}
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {Object.keys(filteredCourseCategories).length === 0 ? (
            <div style={styles.noResults}>
              <p style={styles.noResultsText}>לא נמצאו קורסים המתאימים לחיפוש</p>
              <button 
                type="button" 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedFilter('הכל');
                }}
                className="clear-filters-button"
                style={styles.clearFiltersButton}
              >
                נקה חיפוש
              </button>
            </div>
          ) : (
            Object.entries(filteredCourseCategories).map(([categoryName, courses]) => (
              <div key={categoryName} style={styles.categorySection}>
                <h3 style={styles.categoryTitle}>{categoryName}</h3>
                <div style={styles.coursesGrid}>
                  {courses.map(course => (
                    <label key={course.id} style={styles.courseLabel}>
                      <input
                        type="checkbox"
                        checked={selectedCourses.includes(course.id)}
                        onChange={() => handleCourseToggle(course.id)}
                        style={styles.checkbox}
                      />
                      <span style={styles.courseName}>{course.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))
          )}

          <div style={styles.selectedInfo}>
            <p style={styles.selectedText}>
              נבחרו {selectedCourses.length} קורסים
            </p>
          </div>

          <div style={styles.buttonContainer}>
            <button 
              type="button" 
              onClick={handleSkip}
              style={styles.skipButton}
            >
              דלג
            </button>
            <button 
              type="submit" 
              disabled={loading}
              style={{
                ...styles.submitButton,
                opacity: loading ? 0.6 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'שומר...' : 'המשך לצ\'אט'}
            </button>
          </div>
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
    maxWidth: '900px',
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

  categorySection: {
    marginBottom: '24px'
  },

  categoryTitle: {
    color: '#333',
    fontWeight: 600,
    fontSize: '18px',
    marginBottom: '12px',
    borderBottom: '2px solid #e0e0e0',
    paddingBottom: '8px'
  },

  coursesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '12px',
    marginTop: '12px'
  },

  courseLabel: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 12px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    border: '1px solid #e0e0e0',
    direction: 'rtl' as const
  },

  checkbox: {
    marginLeft: '8px',
    transform: 'scale(1.2)'
  },

  courseName: {
    fontSize: '14px',
    color: '#333',
    fontWeight: 500
  },

  selectedInfo: {
    textAlign: 'center' as const,
    padding: '16px',
    backgroundColor: '#f0f8ff',
    borderRadius: '8px',
    border: '1px solid #cce7ff'
  },

  selectedText: {
    color: '#0066cc',
    fontWeight: 600,
    margin: 0
  },

  buttonContainer: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'center',
    marginTop: '24px'
  },

  skipButton: {
    padding: '12px 24px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },

  submitButton: {
    padding: '12px 24px',
    background: 'linear-gradient(to right, #7a35d5, #b84ef1)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(106, 17, 203, 0.3)'
  },

  topControls: {
    display: 'flex',
    flexDirection: 'row' as const,
    gap: '16px',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 0',
    borderBottom: '2px solid #e0e0e0',
    marginBottom: '24px',
    flexWrap: 'wrap' as const
  },

  searchContainer: {
    flex: '1',
    minWidth: '200px'
  },

  searchInput: {
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

  filterContainer: {
    minWidth: '150px'
  },

  filterSelect: {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '16px',
    fontFamily: '"Inter", "Noto Sans Hebrew", Arial, sans-serif',
    direction: 'rtl' as const,
    textAlign: 'right' as const,
    background: '#fafafa',
    cursor: 'pointer'
  },

  topButtonContainer: {
    display: 'flex',
    gap: '12px',
    minWidth: 'fit-content'
  },

  topSkipButton: {
    padding: '12px 20px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    whiteSpace: 'nowrap' as const
  },

  topContinueButton: {
    padding: '12px 20px',
    background: 'linear-gradient(to right, #7a35d5, #b84ef1)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(106, 17, 203, 0.3)',
    whiteSpace: 'nowrap' as const
  },

  noResults: {
    textAlign: 'center' as const,
    padding: '40px 20px',
    backgroundColor: '#f8f9fa',
    borderRadius: '12px',
    border: '2px dashed #dee2e6'
  },

  noResultsText: {
    color: '#6c757d',
    fontSize: '18px',
    fontWeight: 500,
    marginBottom: '16px'
  },

  clearFiltersButton: {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  }
};

// Add hover styles
const hoverStyles = `
  .course-label:hover {
    background-color: #e9ecef !important;
    border-color: #7a35d5 !important;
  }
  
  .course-label input:checked + span {
    color: #7a35d5 !important;
    font-weight: 600 !important;
  }
  
  .skip-button:hover {
    background-color: #5a6268 !important;
  }
  
  .submit-button:hover:not(:disabled) {
    transform: translateY(-2px) !important;
    box-shadow: 0 6px 20px rgba(106, 17, 203, 0.4) !important;
  }

  input:focus, select:focus {
    border-color: #7a35d5 !important;
    box-shadow: 0 0 0 3px rgba(122, 53, 213, 0.1) !important;
    background: white !important;
  }

  .top-skip-button:hover {
    background-color: #5a6268 !important;
    transform: translateY(-1px) !important;
  }

  .top-continue-button:hover:not(:disabled) {
    transform: translateY(-1px) !important;
    box-shadow: 0 6px 20px rgba(106, 17, 203, 0.4) !important;
  }

  .clear-filters-button:hover {
    background-color: #0056b3 !important;
    transform: translateY(-1px) !important;
  }
`;

if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = hoverStyles;
  document.head.appendChild(style);
}

export default CourseSelection;