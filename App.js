import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { StatusBar } from 'react-native';
import { AuthProvider } from './src/context/AuthContext';
import AppNav from './src/navigation/AppNav';
import store from './src/store/store';
import "./ignoreWarnings";
import OfflineNotice from './src/utils/OfflineNotice';
import Toast from 'react-native-toast-message';
import SplashScreen from 'react-native-splash-screen';
import messaging from '@react-native-firebase/messaging';
import { requestPermission, setupNotificationHandlers } from './src/utils/NotificationService';
import { navigate } from './src/navigation/NavigationService'; // Import the navigation function
import { requestCameraAndAudioPermissions } from './src/utils/PermissionHandler';

function App() {
  const [notifications, setNotifications] = useState([]);
  const [notifyStatus, setnotifyStatus] = useState(false);

  useEffect(() => {
    SplashScreen.hide();
    requestPermission();
    requestCameraAndAudioPermissions().then(granted => {
      if (!granted) {
        // Handle the case where permissions are not granted
        return;
      }
      const unsubscribeForeground = setupNotificationHandlers(setNotifications, setnotifyStatus);

      messaging().onNotificationOpenedApp(remoteMessage => {
        if (remoteMessage?.data?.screen === 'ScheduleScreen') {
          navigate('Schedule', { screen: 'ScheduleScreen' });
        }
      });

      messaging().getInitialNotification().then(remoteMessage => {
        if (remoteMessage?.data?.screen === 'ScheduleScreen') {
          navigate('Schedule', { screen: 'ScheduleScreen' });
        }
      });

      return () => {
        if (unsubscribeForeground) unsubscribeForeground();
      };
    });
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
