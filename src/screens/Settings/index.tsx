import React from 'react';
import { View, StyleSheet } from 'react-native';
import { List, Switch, Divider, Menu } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../contexts/LanguageContext';

export const Settings = () => {
  const [darkMode, setDarkMode] = React.useState(false);
  const [notifications, setNotifications] = React.useState(true);
  const [languageMenuVisible, setLanguageMenuVisible] = React.useState(false);
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage, availableLanguages } = useLanguage();

  return (
    <View style={styles.container}>
      <List.Section>
        <List.Subheader>{t('settings.appearance')}</List.Subheader>
        <List.Item
          title={t('settings.darkMode')}
          right={() => (
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
            />
          )}
        />
        <Divider />
        <List.Subheader>{t('settings.notifications')}</List.Subheader>
        <List.Item
          title={t('settings.notifications')}
          right={() => (
            <Switch
              value={notifications}
              onValueChange={setNotifications}
            />
          )}
        />
        <Divider />
        <List.Subheader>{t('settings.language')}</List.Subheader>
        <Menu
          visible={languageMenuVisible}
          onDismiss={() => setLanguageMenuVisible(false)}
          anchor={
            <List.Item
              title={t('settings.language')}
              description={availableLanguages.find(lang => lang.code === currentLanguage)?.name}
              left={props => <List.Icon {...props} icon="translate" />}
              onPress={() => setLanguageMenuVisible(true)}
            />
          }
        >
          {availableLanguages.map(language => (
            <Menu.Item
              key={language.code}
              onPress={() => {
                changeLanguage(language.code);
                setLanguageMenuVisible(false);
              }}
              title={language.name}
            />
          ))}
        </Menu>
      </List.Section>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});
