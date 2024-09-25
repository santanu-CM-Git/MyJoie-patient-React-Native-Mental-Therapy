import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { Text, Image, View } from 'react-native';

import HomeScreen from '../screens/NoAuthScreen/HomeScreen';
import ProfileScreen from '../screens/NoAuthScreen/ProfileScreen';
import NotificationScreen from '../screens/NoAuthScreen/NotificationScreen';

import { useFocusEffect } from '@react-navigation/native';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';

import PrivacyPolicy from '../screens/NoAuthScreen/PrivacyPolicy';
import ChatScreen from '../screens/NoAuthScreen/ChatScreen';
import ScheduleScreen from '../screens/NoAuthScreen/ScheduleScreen';
import { bookmarkedFill, bookmarkedNotFill, bookmarkednotFocusedImg, calenderFocusedImg, calenderImg, homeIconFocusedImg, homeIconNotFocusedImg, talkFocusedImg, talkImg } from '../utils/Images';
import WalletScreen from '../screens/NoAuthScreen/WalletScreen';
import ReviewScreen from '../screens/NoAuthScreen/ReviewScreen';
import ThankYouBookingScreen from '../screens/NoAuthScreen/ThankYouBookingScreen';
import BookingSummary from '../screens/NoAuthScreen/BookingSummary';
import TherapistList from '../screens/NoAuthScreen/TherapistList';
import TherapistProfile from '../screens/NoAuthScreen/TherapistProfile';
import FreeTherapistList from '../screens/NoAuthScreen/FreeTherapistList';
import PaymentFailed from '../screens/NoAuthScreen/PaymentFailed';
import Bookmarked from '../screens/NoAuthScreen/Bookmarked';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const HomeStack = ({ navigation }) => {
  useFocusEffect(
    React.useCallback(() => {
      // Reset to the initial screen (TherapistList) whenever the tab is focused
      navigation.navigate('Home');
    }, [navigation])
  );
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Notification"
        component={NotificationScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name='ChatScreen'
        component={ChatScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="WalletScreen"
        component={WalletScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ReviewScreen"
        component={ReviewScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ThankYouBookingScreen"
        component={ThankYouBookingScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="FreeTherapistList"
        component={FreeTherapistList}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="ScheduleScreen"
        component={ScheduleScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ProfileScreen"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PaymentFailed"
        component={PaymentFailed}
        options={{ headerShown: false }}
      />
      {/* <Stack.Screen
        name="TherapistProfile"
        component={TherapistProfile}
        options={{ headerShown: false }}
      /> */}
    </Stack.Navigator>
  );
};

const TherapistStack = ({ navigation, route }) => {
  // useFocusEffect(
  //   React.useCallback(() => {
  //     // Check if there's a specific screen to navigate to
  //     console.log(route?.params?.screen,'ooooooooooooooooooooo')
  //     console.log(route.name, 'ppppppppppppppppppp');

  //     if (!route?.params?.screen && route.name === 'TherapistStack') {
  //       navigation.navigate('TherapistList');
  //     }
  //   }, [route, navigation])
  // );
  useFocusEffect(
    React.useCallback(() => {
      console.log(route?.params?.screen, 'ooooooooooooooooooooo')
      console.log(route.name, 'ppppppppppppppppppp');

      if (!route?.params?.screen && route.name === 'TherapistStack') {
        navigation.navigate('TherapistList');
      }

    }, [route, navigation])
  );
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="TherapistList"
        component={TherapistList}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TherapistProfile"
        component={TherapistProfile}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Summary"
        component={BookingSummary}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  )

};

const ScheduleStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ScheduleScreen"
        component={ScheduleScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  )

};


const BookmarkedStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="BookmarkedScreen"
        component={Bookmarked}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="PrivacyPolicy"
        component={PrivacyPolicy}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  )

};

const TabNavigator = () => {
  const cartProducts = useSelector(state => state.cart)
  console.log(cartProducts)
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarInactiveTintColor: '#CACCCE',
        tabBarActiveTintColor: '#444343',
        tabBarStyle: {
          height: 100,
        },
      }}>
      <Tab.Screen
        name="HOME"
        component={HomeStack}
        options={({ route }) => ({
          tabBarStyle: {
            display: getTabBarVisibility(route),
            backgroundColor: '#FFFFFF',
            width: responsiveWidth(100),
            height: responsiveHeight(8),
            alignSelf: 'center',
            //marginTop: -responsiveHeight(10),
            //borderRadius: 30,
            //marginBottom: 20,
            //borderWidth: 1,
            //borderColor: '#CACCCE'
          },
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center', }}>
              {focused && <View style={{ width: responsiveWidth(12), borderColor: color, backgroundColor: color, borderWidth: 2, borderBottomLeftRadius: 5, borderBottomRightRadius: 5 }} />}
              <Image source={focused ? homeIconFocusedImg : homeIconNotFocusedImg} style={{ width: responsiveWidth(7), height: responsiveHeight(3.5), marginTop: responsiveHeight(1.4), resizeMode: 'contain' }} />
            </View>
          ),
          tabBarLabel: ({ color, focused }) => (
            <Text style={{ color, fontSize: responsiveFontSize(1.2), marginBottom: responsiveHeight(1) }}>Home</Text>
          ),
        })}
      />
      <Tab.Screen
        name="Talk"
        component={TherapistStack}
        options={({ route }) => ({
          tabBarStyle: {
            display: getTabBarVisibility(route),
            backgroundColor: '#FFFFFF',
            width: responsiveWidth(100),
            height: responsiveHeight(8),
            alignSelf: 'center',
            //marginTop: -responsiveHeight(10),
            //borderRadius: 30,
            //marginBottom: 20,
            //borderWidth: 1,
            //borderColor: '#CACCCE'
          },
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center', }}>
              {focused && <View style={{ width: responsiveWidth(12), borderColor: color, backgroundColor: color, borderWidth: 2, borderBottomLeftRadius: 5, borderBottomRightRadius: 5 }} />}
              {/* <FontAwesome name="rupee-sign" color={color} size={size} style={{ marginTop: responsiveHeight(1.2) }} /> */}
              <Image source={focused ? talkFocusedImg : talkImg} style={{ width: responsiveWidth(7), height: responsiveHeight(3.5), marginTop: responsiveHeight(1.4), resizeMode: 'contain' }} />
            </View>
          ),
          tabBarLabel: ({ color, focused }) => (
            <Text style={{ color, fontSize: responsiveFontSize(1.2), marginBottom: responsiveHeight(1) }}>Talk</Text>
          ),
        })}
      />
      <Tab.Screen
        name="Schedule"
        component={ScheduleStack}
        options={({ route }) => ({
          tabBarStyle: {
            display: getTabBarVisibility(route),
            backgroundColor: '#FFFFFF',
            width: responsiveWidth(100),
            height: responsiveHeight(8),
            alignSelf: 'center',
            //marginTop: -responsiveHeight(10),
            //borderRadius: 30,
            //marginBottom: 20,
            //borderWidth: 1,
            //borderColor: '#CACCCE'
          },
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center', }}>
              {focused && <View style={{ width: responsiveWidth(12), borderColor: color, backgroundColor: color, borderWidth: 2, borderBottomLeftRadius: 5, borderBottomRightRadius: 5 }} />}
              <Image source={focused ? calenderFocusedImg : calenderImg} style={{ width: responsiveWidth(7), height: responsiveHeight(3.5), marginTop: responsiveHeight(1.4), resizeMode: 'contain' }} />
            </View>
          ),
          tabBarLabel: ({ color, focused }) => (
            <Text style={{ color, fontSize: responsiveFontSize(1.2), marginBottom: responsiveHeight(1) }}>Appointments</Text>
          ),
        })}
      />
      <Tab.Screen
        name="BOOKMARKED"
        component={BookmarkedStack}
        options={({ route }) => ({
          tabBarStyle: {
            display: getTabBarVisibility(route),
            backgroundColor: '#FFFFFF',
            width: responsiveWidth(100),
            height: responsiveHeight(8),
            alignSelf: 'center',
            //marginTop: -responsiveHeight(10),
            //borderRadius: 30,
            //marginBottom: 20,
            //borderWidth: 1,
            //borderColor: '#CACCCE'
          },
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center', }}>
              {focused && <View style={{ width: responsiveWidth(12), borderColor: color, backgroundColor: color, borderWidth: 2, borderBottomLeftRadius: 5, borderBottomRightRadius: 5 }} />}
              <Image source={focused ? bookmarkedFill : bookmarkednotFocusedImg} style={{ width: responsiveWidth(7), height: responsiveHeight(3.5), marginTop: responsiveHeight(1.4), resizeMode: 'contain' }} />
            </View>
          ),
          tabBarLabel: ({ color, focused }) => (
            <Text style={{ color, fontSize: responsiveFontSize(1.2), marginBottom: responsiveHeight(1) }}>Bookmarked</Text>
          ),
        })}
      />
    </Tab.Navigator>
  );
};

// const getTabBarVisibility = route => {
//    console.log(route);
//   const routeName = getFocusedRouteNameFromRoute(route) ?? 'Feed';
//   console.log(routeName);


//   if (routeName == 'Chat') {
//     return 'none';
//   } else {
//     return 'flex';
//   }

// };
const getTabBarVisibility = route => {
  const routeName = getFocusedRouteNameFromRoute(route) ?? 'Home';
  console.log(routeName)
  if (routeName == 'Summary') {
    return 'none';
  } else if (routeName == 'ThankYouBookingScreen') {
    return 'none';
  } else if (routeName == 'ChatScreen') {
    return 'none';
  } else if (routeName == 'ReviewScreen') {
    return 'none';
  } else if (routeName == 'WalletScreen') {
    return 'none';
  } else if (routeName == 'TherapistProfile') {
    return 'none';
  } else if (routeName == 'FreeTherapistList') {
    return 'none';
  } else if (routeName == 'ScheduleScreen') {
    return 'none';
  } else if (routeName == 'PaymentFailed') {
    return 'none';
  } else if (routeName == 'ProfileScreen') {
    return 'none';
  } else {
    return 'flex';
  }
};

export default TabNavigator;
