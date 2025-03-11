import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { Provider as StoreProvider } from 'react-redux';
import { Navigation } from './navigation';
import { store } from './store';
import { theme } from './theme';
import { LanguageProvider } from './contexts/LanguageContext';
import './i18n';

const App = () => {
  return (
    <StoreProvider store={store}>
      <LanguageProvider>
        <PaperProvider theme={theme}>
          <Navigation />
        </PaperProvider>
      </LanguageProvider>
    </StoreProvider>
  );
};

export default App;
