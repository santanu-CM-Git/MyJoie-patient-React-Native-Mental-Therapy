import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { Text, Image, View } from 'react-native';

import HomeScreen from '../screens/NoAuthScreen/HomeScreen';
import ProfileScreen from '../screens/NoAuthScreen/ProfileScreen';
import NotificationScreen from '../screens/NoAuthScreen/NotificationScreen';
import OrderScreen from '../screens/NoAuthScreen/OrderScreen';

import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome5';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';

import PrivacyPolicy from '../screens/NoAuthScreen/PrivacyPolicy';
import OrderSummary from '../screens/NoAuthScreen/OrderSummary';
import ChatScreen from '../screens/NoAuthScreen/ChatScreen';
import EarningScreen from '../screens/NoAuthScreen/EarningScreen';
import ScheduleScreen from '../screens/NoAuthScreen/ScheduleScreen';
import { talkImg } from '../utils/Images';
import WalletScreen from '../screens/NoAuthScreen/WalletScreen';
import ReviewScreen from '../screens/NoAuthScreen/ReviewScreen';
import ThankYouBookingScreen from '../screens/NoAuthScreen/ThankYouBookingScreen';
import BookingSummary from '../screens/NoAuthScreen/BookingSummary';
import TherapistList from '../screens/NoAuthScreen/TherapistList';
import TherapistProfile from '../screens/NoAuthScreen/TherapistProfile';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const HomeStack = () => {
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
        name='OrderSummary'
        component={OrderSummary}
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
        name="Summary"
        component={BookingSummary}
        options={{ headerShown: false }}
      />
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
        name="ScheduleScreen"
        component={ScheduleScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ProfileScreen"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

const TherapistStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="TherapistList"
        component={TherapistList}
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

const ProfileStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ProfileScreen"
        component={ProfileScreen}
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
              <Ionicons name="home-outline" color={color} size={size} style={{ marginTop: responsiveHeight(1.2) }} />
            </View>
          ),
          tabBarLabel: ({ color, focused }) => (
            <Text style={{ color, fontSize: responsiveFontSize(1.2), marginBottom: responsiveHeight(1) }}>HOME</Text>
          ),
        })}
      />
      <Tab.Screen
        name="Earning"
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
              <Image
                source={talkImg}
                style={{ height: 22, width: 22, resizeMode: 'contain', color: color, marginTop: responsiveHeight(1.6) }}
              />
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
              <AntDesign name="calendar" color={color} size={size} style={{ marginTop: responsiveHeight(1.2) }} />
            </View>
          ),
          tabBarLabel: ({ color, focused }) => (
            <Text style={{ color, fontSize: responsiveFontSize(1.2), marginBottom: responsiveHeight(1) }}>Schedule</Text>
          ),
        })}
      />
      <Tab.Screen
        name="PROFILE"
        component={ProfileStack}
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
              <FontAwesome name="user" color={color} size={size} style={{ marginTop: responsiveHeight(1.2) }} />
            </View>
          ),
          tabBarLabel: ({ color, focused }) => (
            <Text style={{ color, fontSize: responsiveFontSize(1.2), marginBottom: responsiveHeight(1) }}>Profile</Text>
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
  }else if (routeName == 'ChatScreen') {
    return 'none';
  }else if (routeName == 'WalletScreen') {
    return 'none';
  } else {
    return 'flex';
  }
};

export default TabNavigator;
