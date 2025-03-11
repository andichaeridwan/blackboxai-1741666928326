import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { IconButton } from 'react-native-paper';
import { Home, Search, Routes, Profile, Settings } from '../screens';

const Tab = createBottomTabNavigator();

const getTabIcon = (route: string, focused: boolean) => {
  switch (route) {
    case 'Home':
      return 'home';
    case 'Search':
      return 'magnify';
    case 'Routes':
      return 'map';
    case 'Profile':
      return 'account';
    case 'Settings':
      return 'cog';
    default:
      return 'circle';
  }
};

export const Navigation = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color }) => (
            <IconButton
              icon={getTabIcon(route.name, focused)}
              size={24}
              iconColor={color}
            />
          ),
          tabBarActiveTintColor: '#2196F3',
          tabBarInactiveTintColor: '#757575',
        })}
      >
        <Tab.Screen name="Home" component={Home} />
        <Tab.Screen name="Search" component={Search} />
        <Tab.Screen name="Routes" component={Routes} />
        <Tab.Screen name="Profile" component={Profile} />
        <Tab.Screen name="Settings" component={Settings} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};
