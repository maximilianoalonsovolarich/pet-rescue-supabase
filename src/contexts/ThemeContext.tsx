import React, { createContext, useState, useContext, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

// Define the context type
type ThemeContextType = {
  darkMode: boolean;
  toggleDarkMode: () => void;
};

// Create the context
const ThemeContext = createContext<ThemeContextType>({
  darkMode: false,
  toggleDarkMode: () => {},
});

// Custom hook to use the theme context
export const useThemeContext = () => useContext(ThemeContext);

// Theme provider component
export const CustomThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize darkMode state from localStorage if available
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('darkMode');
      return savedMode ? JSON.parse(savedMode) : false;
    }
    return false;
  });

  // Create the MUI theme based on darkMode state
  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? 'dark' : 'light',
          primary: {
            main: '#3f51b5',
            light: '#757de8',
            dark: '#002984',
            contrastText: '#fff',
          },
          secondary: {
            main: '#f50057',
            light: '#ff4081',
            dark: '#c51162',
            contrastText: '#fff',
          },
          success: {
            main: '#4caf50',
            light: '#81c784',
            dark: '#388e3c',
          },
          warning: {
            main: '#ff9800',
            light: '#ffb74d',
            dark: '#f57c00',
          },
          info: {
            main: '#2196f3',
            light: '#64b5f6',
            dark: '#1976d2',
          },
          error: {
            main: '#f44336',
            light: '#e57373',
            dark: '#d32f2f',
          },
          background: {
            default: darkMode ? '#121212' : '#f7f9fc',
            paper: darkMode ? '#1e1e2f' : '#ffffff',
          },
          text: {
            primary: darkMode ? '#ffffff' : '#2c3e50',
            secondary: darkMode ? '#b2bac2' : '#546e7a',
          },
        },
        typography: {
          fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
          h1: {
            fontWeight: 600,
          },
          h2: {
            fontWeight: 600,
          },
          h3: {
            fontWeight: 600,
          },
          h4: {
            fontWeight: 600,
          },
          h5: {
            fontWeight: 600,
          },
          h6: {
            fontWeight: 600,
          },
          button: {
            fontWeight: 500,
            textTransform: 'none',
          },
        },
        shape: {
          borderRadius: 8,
        },
        components: {
          MuiAppBar: {
            styleOverrides: {
              root: {
                backgroundColor: darkMode ? '#1e1e2f' : '#3f51b5',
                boxShadow: darkMode ? '0 4px 20px 0 rgba(0,0,0,0.14)' : undefined,
              },
            },
          },
          MuiDrawer: {
            styleOverrides: {
              paper: {
                backgroundColor: darkMode ? '#27293d' : '#ffffff',
                color: darkMode ? '#ffffff' : 'inherit',
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
                borderRadius: 8,
                overflow: 'hidden',
              },
            },
          },
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 8,
                padding: '8px 16px',
                textTransform: 'none',
              },
              containedPrimary: {
                boxShadow: '0 4px 10px 0 rgba(63, 81, 181, 0.25)',
                '&:hover': {
                  boxShadow: '0 6px 15px 0 rgba(63, 81, 181, 0.35)',
                },
              },
              containedSecondary: {
                boxShadow: '0 4px 10px 0 rgba(245, 0, 87, 0.25)',
                '&:hover': {
                  boxShadow: '0 6px 15px 0 rgba(245, 0, 87, 0.35)',
                },
              },
            },
          },
          MuiTextField: {
            styleOverrides: {
              root: {
                '& .MuiOutlinedInput-root': {
                  borderRadius: 8,
                },
              },
            },
          },
          MuiTableRow: {
            styleOverrides: {
              root: {
                '&:last-child td, &:last-child th': {
                  border: 0,
                },
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                borderRadius: 8,
                overflow: 'hidden',
              },
            },
          },
          MuiAvatar: {
            styleOverrides: {
              root: {
                boxShadow: '0 2px 10px 0 rgba(0,0,0,0.1)',
              },
            },
          },
        },
      }),
    [darkMode]
  );

  // Toggle dark mode function
  const toggleDarkMode = () => {
    setDarkMode(prevMode => !prevMode);
  };

  // Save dark mode preference to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('darkMode', JSON.stringify(darkMode));
    }
  }, [darkMode]);

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};
