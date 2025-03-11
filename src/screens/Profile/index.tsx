import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Avatar, List } from 'react-native-paper';

export const Profile = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Avatar.Icon size={80} icon="account" />
        <Text variant="headlineSmall" style={styles.name}>User Name</Text>
      </View>
      <List.Section>
        <List.Item
          title="Favorite Routes"
          left={props => <List.Icon {...props} icon="star" />}
        />
        <List.Item
          title="Trip History"
          left={props => <List.Icon {...props} icon="history" />}
        />
        <List.Item
          title="Notifications"
          left={props => <List.Icon {...props} icon="bell" />}
        />
        <List.Item
          title="Help & Support"
          left={props => <List.Icon {...props} icon="help-circle" />}
        />
      </List.Section>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  name: {
    marginTop: 12,
  },
});
