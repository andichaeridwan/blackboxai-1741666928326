import { MD3LightTheme, configureFonts } from 'react-native-paper';

const fontConfig = {
  fontFamily: 'Roboto',
};

export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#2196F3',
    secondary: '#4CAF50',
    accent: '#FF9800',
    background: '#FFFFFF',
    text: '#212121',
    placeholder: '#757575',
    disabled: '#BDBDBD',
    surface: '#FFFFFF',
    error: '#F44336',
    success: '#4CAF50',
    warning: '#FFC107',
    info: '#2196F3',
  },
  fonts: configureFonts({ config: fontConfig }),
  roundness: 8,
  animation: {
    scale: 1.0,
  },
};
