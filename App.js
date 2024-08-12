import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { StatusBar, Platform } from 'react-native';
import { AuthProvider } from './src/context/AuthContext';
import AppNav from './src/navigation/AppNav';
import store from './src/store/store';
import "./ignoreWarnings";
import OfflineNotice from './src/utils/OfflineNotice';
import Toast from 'react-native-toast-message';
import SplashScreen from 'react-native-splash-screen';
import {
  requestPermission,
  setupNotificationHandlers
} from './src/utils/NotificationService';

function App() {
  const [notifications, setNotifications] = useState([]);
  const [notifyStatus, setnotifyStatus] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      SplashScreen.hide();
    }, 3000);
  }, []);

  useEffect(() => {
    if (Platform.OS === 'android') {
      requestPermission();
    }
  }, []);

  useEffect(() => {
    if (Platform.OS === 'android') {
      const unsubscribeForeground = setupNotificationHandlers(setNotifications, setnotifyStatus);
      return () => {
        if (unsubscribeForeground) unsubscribeForeground();
      };
    }
  }, []);

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
