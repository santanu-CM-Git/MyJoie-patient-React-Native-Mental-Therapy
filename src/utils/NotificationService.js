import { Alert, Linking, Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PERMISSIONS, request, check, RESULTS } from 'react-native-permissions';

export const requestNotificationPermission = async () => {
  const result = await request(PERMISSIONS.ANDROID.POST_NOTIFICATIONS);
  return result;
};

export const checkNotificationPermission = async () => {
  const result = await check(PERMISSIONS.ANDROID.POST_NOTIFICATIONS);
  return result;
};

export const openSettings = () => {
  Linking.openSettings();
};

export const requestPermission = async () => {
  const checkPermission = await checkNotificationPermission();
  if (checkPermission !== RESULTS.GRANTED) {
    const request = await requestNotificationPermission();
    if (request !== RESULTS.GRANTED) {
      Alert.alert(
        'Notification Permission Required',
        'Please enable notifications to stay updated.',
        [{ text: 'OK', onPress: openSettings }]
      );
    }
  }
};

export const handleNotification = (remoteMessage, setNotifications, setnotifyStatus) => {
  Alert.alert('A new FCM message arrived!!!', JSON.stringify(remoteMessage));

  const action = remoteMessage?.data?.action;
  if (action) {
    handleAction(action, remoteMessage);
  } else {
    setNotifications(prevNotifications => {
      const newNotifications = [...prevNotifications, remoteMessage];
      setnotifyStatus(true);
      return newNotifications;
    });
  }
};

const handleAction = (action, remoteMessage) => {
  switch (action) {
    case 'reply':
      console.log('User chose to reply to the message:', remoteMessage);
      break;
    case 'mark_as_read':
      console.log('User chose to mark the message as read:', remoteMessage);
      break;
    default:
      console.log('Unknown action:', action);
      break;
  }
};

export const setupNotificationHandlers = (setNotifications, setnotifyStatus) => {
  if (Platform.OS === 'android') {
    const unsubscribeForeground = messaging().onMessage(async remoteMessage => {
      console.log('Received foreground message:', JSON.stringify(remoteMessage));
      handleNotification(remoteMessage, setNotifications, setnotifyStatus);
    });

    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('Received background message:', JSON.stringify(remoteMessage));
      handleNotification(remoteMessage, setNotifications, setnotifyStatus);
    });

    return unsubscribeForeground;
  }
};
