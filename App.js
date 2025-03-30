import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import AppNavigator from './AppNavigator';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          console.log('No token found, user not logged in');
          setIsLoggedIn(false);
          return;
        }
        const response = await axios.get('http://192.168.18.67:8000/api/user', {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('User authenticated:', response.data);
        setUserRole(response.data.role);
        setIsLoggedIn(true);
      } catch (error) {
        console.error('Error checking login status:', error.message);
        if (error.response?.status === 401) {
          console.log('Token invalid or expired, clearing storage');
          await AsyncStorage.removeItem('token');
          await AsyncStorage.removeItem('userRole');
        }
        setIsLoggedIn(false);
      }
    };
    checkLoginStatus();
  }, []);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('userRole');
      setIsLoggedIn(false);
      setUserRole(null);
      console.log('Logout successful');
    } catch (error) {
      console.error('Error during logout:', error.message);
      setIsLoggedIn(false);
      setUserRole(null);
    }
  };

  if (isLoggedIn === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Memuat...</Text>
      </View>
    );
  }

  return (
    <AppNavigator
      isLoggedIn={isLoggedIn}
      userRole={userRole}
      handleLogout={handleLogout}
      setIsLoggedIn={setIsLoggedIn}
      setUserRole={setUserRole}
    />
  );
}