import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Searchbar } from 'react-native-paper';

export const Search = () => {
  const [searchQuery, setSearchQuery] = React.useState('');

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search routes or locations"
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  searchBar: {
    marginTop: 8,
    marginBottom: 16,
  },
});
