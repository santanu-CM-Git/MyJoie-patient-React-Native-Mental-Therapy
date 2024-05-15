import React from 'react';
import {Image} from 'react-native';
import {createDrawerNavigator} from '@react-navigation/drawer';
import { homeImg, contactImg, helpImg, bankDetailsImg, documentImg , capacityImg, reviewImg, earningImg, acceptedOrderImg, completedOrderImg, availabilityImg, SessionIcon, PolicyIcon, availabilityBlackImg, earningBlackImg} from '../utils/Images';
import CustomDrawer from '../components/CustomDrawer';

import Ionicons from 'react-native-vector-icons/Ionicons';

import CustomerSupport from '../screens/NoAuthScreen/CustomerSupport';

import TabNavigator from './TabNavigator';
import PrivacyPolicy from '../screens//NoAuthScreen/PrivacyPolicy';

import SessionHistory from '../screens/NoAuthScreen/SessionHistory';
import NoNotification from '../screens/NoAuthScreen/NoNotification';
import UploadSessionSummary from '../screens/NoAuthScreen/UploadSessionSummary';
import ScheduleScreen from '../screens/NoAuthScreen/ScheduleScreen';
import EarningScreen from '../screens/NoAuthScreen/EarningScreen';

const Drawer = createDrawerNavigator();

const AuthStack = () => {
  return (
    <Drawer.Navigator
      drawerContent={props => <CustomDrawer {...props} />}
      screenOptions={{
        headerShown: false,
        drawerActiveBackgroundColor: '#ECFCFA',
        drawerActiveTintColor: '#2D2D2D',
        drawerInactiveTintColor: '#949494',
        drawerLabelStyle: {
          marginLeft: -25,
          fontFamily: 'DMSans-Medium',
          fontSize: 15,
        },
        //swipeEdgeWidth: 0, //for off the drawer swipe
      }}>
      <Drawer.Screen
        name="  Home"
        component={TabNavigator}
        options={{
          drawerIcon: ({color}) => (
            // <Ionicons name="home-outline" size={22} color={color} />
            <Image source={homeImg} style={{ width: 25,height: 25,}} color={color}/>
          ),
        }}
      />
      <Drawer.Screen
        name="  Availability"
        component={ScheduleScreen}
        options={{
          drawerIcon: ({color}) => (
            // <Ionicons name="home-outline" size={22} color={color} />
            <Image source={availabilityBlackImg} style={{ width: 25,height: 25,}} color={color}/>
          ),
        }}
      />
       <Drawer.Screen
        name="  Earning"
        component={EarningScreen}
        options={{
          drawerIcon: ({color}) => (
            // <Ionicons name="home-outline" size={22} color={color} />
            <Image source={earningBlackImg} style={{ width: 25,height: 25,}} color={color}/>
          ),
        }}
      />
      <Drawer.Screen
        name="  Session History"
        component={SessionHistory}
        options={{
          drawerIcon: ({color}) => (
            // <Ionicons name="home-outline" size={22} color={color} />
            <Image source={SessionIcon} style={{ width: 25,height: 25}} color={color}/>
          ),
        }}
      />
       <Drawer.Screen
        name="  Customer Support"
        component={CustomerSupport}
        options={{
          drawerIcon: ({color}) => (
            // <Ionicons name="settings-outline" size={22} color={color} />
            <Image source={helpImg} style={{ width: 25,height: 25}} color={color}/>
          ),
        }}
      />
      <Drawer.Screen
        name="  Privacy Policy"
        component={PrivacyPolicy}
        options={{
          drawerIcon: ({color}) => (
            // <Ionicons name="settings-outline" size={22} color={color} />
            <Image source={PolicyIcon} style={{ width: 25,height: 25}} color={color}/>
          ),
        }}
      />
      <Drawer.Screen
        name="  Session Summary"
        component={UploadSessionSummary}
        options={{
          drawerIcon: ({color}) => (
            // <Ionicons name="settings-outline" size={22} color={color} />
            <Image source={PolicyIcon} style={{ width: 25,height: 25}} color={color}/>
          ),
        }}
      />
    </Drawer.Navigator>
  );
};

export default AuthStack;
