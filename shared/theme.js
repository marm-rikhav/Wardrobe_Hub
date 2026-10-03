// Wardrobe Hub: Material UI theme configuration (black and beige)
// Shared theme options for client and admin applications

export const themeOptions = {
  palette: {
    mode: 'light',
    primary: { main: '#111111', contrastText: '#F5F1EB' },   // main: black
    secondary: { main: '#BFA88A', contrastText: '#111111' }, // sub: beige
    accent: { main: '#8A6F4E' },                             // bronze: prices, links
    background: { default: '#F5F1EB', paper: '#FFFFFF' },
    text: { primary: '#111111', secondary: '#5C5C5C' },
    divider: '#E5DED3',
    success: { main: '#2F7D4F' },
    error: { main: '#C0392B' },
  },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    button: { textTransform: 'none', fontWeight: 500 },
  },
  components: {
    MuiButton: { defaultProps: { disableElevation: true } },
    MuiAppBar: { defaultProps: { elevation: 0 } },
    MuiCard: {
      styleOverrides: {
        root: { border: '1px solid #E5DED3', boxShadow: 'none' },
      },
    },
    MuiSnackbar: {
      defaultProps: {
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
      },
    },
  },
};

export default themeOptions;
