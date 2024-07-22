import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { StatusBar, View, Text, LogBox, Alert } from 'react-native';
import { AuthProvider } from './src/context/AuthContext';
import AppNav from './src/navigation/AppNav';
import store from './src/store/store';
import "./ignoreWarnings";
import OfflineNotice from './src/utils/OfflineNotice'
import Toast from 'react-native-toast-message';

import firebase from '@react-native-firebase/app';
// import auth from '@react-native-firebase/auth';
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PERMISSIONS, request, check } from 'react-native-permissions';
import LinearGradient from 'react-native-linear-gradient';
import { responsiveHeight } from 'react-native-responsive-dimensions';
import SplashScreen from 'react-native-splash-screen';



function App() {
  const [notifications, setNotifications] = useState([]);
  const [notifyStatus, setnotifyStatus] = useState(false)

  useEffect(() => {
    setTimeout(() => {
      SplashScreen.hide();
    }, 2000);
  }, [])

  const requestLocationPermission = async () => {
    try {
      const permission = Platform.select({
        ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
        android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
      });
      const granted = await request(permission);
      if (granted === 'granted') {
        console.log('Location permission granted');
      } else {
        console.log('Location permission denied');
      }
    } catch (error) {
      console.error('Failed to request location permission:', error);
    }
  };

  useEffect(() => {
    // Your existing useEffect code
    // if (Platform.OS == 'android') {
    //   requestLocationPermission();
    //   // Your existing code continues...
    // }
  }, []);



  useEffect(() => {
    if (Platform.OS === 'android') {
      const unsubscribeForeground = messaging().onMessage(async remoteMessage => {
        handleNotification(remoteMessage);
      });

      // Set up background message handler
      messaging().setBackgroundMessageHandler(async remoteMessage => {
        handleNotification(remoteMessage);
      });

      return () => {
        unsubscribeForeground();
      };
    }
  }, []);

  const handleNotification = (remoteMessage) => {
    Alert.alert('A new FCM message arrived!!!', JSON.stringify(remoteMessage));
    console.log('Received message:', JSON.stringify(remoteMessage));
    
    const action = remoteMessage?.data?.action;
    if (action) {
      handleAction(action, remoteMessage);
    } else {
      setNotifications(prevNotifications => {
        const newNotifications = [...prevNotifications, remoteMessage];
        // AsyncStorage.setItem('notifications', JSON.stringify(newNotifications));
        setnotifyStatus(true);
        return newNotifications;
      });
    }
  };
  
  const handleAction = (action, remoteMessage) => {
    switch (action) {
      case 'reply':
        // Handle reply action
        console.log('User chose to reply to the message:', remoteMessage);
        // Implement reply functionality
        break;
      case 'mark_as_read':
        // Handle mark as read action
        console.log('User chose to mark the message as read:', remoteMessage);
        // Implement mark as read functionality
        break;
      default:
        console.log('Unknown action:', action);
        break;
    }
  };

  return (
    <Provider store={store}>
      <StatusBar backgroundColor="#000" />
      <OfflineNotice />
      <AuthProvider>
        <AppNav />
      </AuthProvider>
      <Toast />
    </Provider>
  );
}

export default App;