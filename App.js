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
    }, 3000);
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
    if (Platform.OS == 'android') {
      const unsubscribeForeground = messaging().onMessage(async remoteMessage => {
        Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage));
        console.log('Received foreground message:', JSON.stringify(remoteMessage));
        setNotifications(prevNotifications => {
          const newNotifications = [...prevNotifications, remoteMessage];
          AsyncStorage.setItem('notifications', JSON.stringify(newNotifications));
          setnotifyStatus(true)
          return newNotifications;
        });
      });

      const unsubscribeBackground = messaging().setBackgroundMessageHandler(async remoteMessage => {
        console.log('Received background message:', remoteMessage);
        setNotifications(prevNotifications => {
          const newNotifications = [...prevNotifications, remoteMessage];
          AsyncStorage.setItem('notifications', JSON.stringify(newNotifications));
          setnotifyStatus(true)
          return newNotifications;
        });
      });

      // Load notifications from AsyncStorage when component mounts
      AsyncStorage.getItem('notifications').then((value) => {
        if (value !== null) {
          setNotifications(JSON.parse(value));
          setnotifyStatus(true)
        }
      });

      return () => {
        unsubscribeForeground();
        //unsubscribeBackground();
      };
    }
  }, [])

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