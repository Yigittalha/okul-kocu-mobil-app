import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SessionContext } from '../state/session';
import SchoolSelect from '../app/auth/SchoolSelect';
import Login from '../app/auth/Login';
import AppDrawer from './AppDrawer';

const Stack = createNativeStackNavigator();

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SchoolSelect" component={SchoolSelect} />
      <Stack.Screen name="Login" component={Login} />
    </Stack.Navigator>
  );
}

export default function RootNavigator() {
  const { isAuthenticated, loading } = useContext(SessionContext);

  if (loading) return null; // Or a splash screen

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        <AppDrawer />
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
} 