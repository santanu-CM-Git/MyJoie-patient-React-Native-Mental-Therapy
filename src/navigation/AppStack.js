import React from 'react';
import {Image} from 'react-native';
import {createDrawerNavigator} from '@react-navigation/drawer';
import { homeImg, helpImg, SessionIcon, PolicyIcon, availabilityBlackImg, bookmarkedNotFill, chatImg, transactionIconImg} from '../utils/Images';
import CustomDrawer from '../components/CustomDrawer';

import Ionicons from 'react-native-vector-icons/Ionicons';

import CustomerSupport from '../screens/NoAuthScreen/CustomerSupport';

import TabNavigator from './TabNavigator';
import PrivacyPolicy from '../screens//NoAuthScreen/PrivacyPolicy';
import CancellationPolicy from '../screens//NoAuthScreen/CancellationPolicy';
import Termsofuse from '../screens//NoAuthScreen/Termsofuse';
import SessionHistory from '../screens/NoAuthScreen/SessionHistory';
import ScheduleScreen from '../screens/NoAuthScreen/ScheduleScreen';
import WalletScreen from '../screens/NoAuthScreen/WalletScreen';
import Bookmarked from '../screens/NoAuthScreen/Bookmarked';
import TherapistList from '../screens/NoAuthScreen/TherapistList';
import TestPage from '../screens/NoAuthScreen/TestPage';
import { responsiveFontSize } from 'react-native-responsive-dimensions';

const Drawer = createDrawerNavigator();

const AuthStack = () => {
  return (
    <Drawer.Navigator
      drawerContent={props => <CustomDrawer {...props} />}
      screenOptions={{
        headerShown: false,
        drawerActiveBackgroundColor: '#EEF8FF',
        drawerActiveTintColor: '#2D2D2D',
        drawerInactiveTintColor: '#949494',
        drawerLabelStyle: {
          marginLeft: -25,
          fontFamily: 'DMSans-Medium',
          fontSize: responsiveFontSize(1.8),
        },
        //swipeEdgeWidth: 0, //for off the drawer swipe
      }}>
      <Drawer.Screen
        name="Home"
        component={TabNavigator}
        options={{
          drawerIcon: ({color}) => (
            // <Ionicons name="home-outline" size={22} color={color} />
            <Image source={homeImg} style={{ width: 25,height: 25,marginRight:5}} color={color}/>
          ),
        }}
      />
      <Drawer.Screen
        name="Upcoming Appointments"
        component={ScheduleScreen}
        options={{
          drawerIcon: ({color}) => (
            // <Ionicons name="home-outline" size={22} color={color} />
            <Image source={availabilityBlackImg} style={{ width: 25,height: 25,marginRight:5}} color={color}/>
          ),
        }}
      />
       <Drawer.Screen
        name="Talk to Therapist"
        component={TherapistList}
        options={{
          drawerIcon: ({color}) => (
            // <Ionicons name="settings-outline" size={22} color={color} />
            <Image source={chatImg} style={{ width: 25,height: 25,marginRight:5}} color={color}/>
          ),
        }}
      />
       <Drawer.Screen
        name="Bookmarked Therapist"
        component={Bookmarked}
        options={{
          drawerIcon: ({color}) => (
            // <Ionicons name="settings-outline" size={22} color={color} />
            <Image source={bookmarkedNotFill} style={{ width: 25,height: 25,marginRight:5}} color={color}/>
          ),
        }}
      />
      <Drawer.Screen
        name="Session History"
        component={SessionHistory}
        options={{
          drawerIcon: ({color}) => (
            // <Ionicons name="home-outline" size={22} color={color} />
            <Image source={SessionIcon} style={{ width: 25,height: 25,marginRight:5}} color={color}/>
          ),
        }}
      />
       <Drawer.Screen
        name="Customer Support"
        component={CustomerSupport}
        options={{
          drawerIcon: ({color}) => (
            // <Ionicons name="settings-outline" size={22} color={color} />
            <Image source={helpImg} style={{ width: 25,height: 25,marginRight:5}} color={color}/>
          ),
        }}
      />
      
      <Drawer.Screen
        name="Transaction History"
        component={WalletScreen}
        options={{
          drawerIcon: ({color}) => (
            // <Ionicons name="settings-outline" size={22} color={color} />
            <Image source={transactionIconImg} style={{ width: 25,height: 25,marginRight:5}} color={color}/>
          ),
        }}
      />
      <Drawer.Screen
        name="Privacy Policy"
        component={PrivacyPolicy}
        options={{
          drawerIcon: ({color}) => (
            // <Ionicons name="settings-outline" size={22} color={color} />
            <Image source={PolicyIcon} style={{ width: 25,height: 25,marginRight:5}} color={color}/>
          ),
        }}
      />
      <Drawer.Screen
        name="Cancellation Policy"
        component={CancellationPolicy}
        options={{
          drawerIcon: ({color}) => (
            // <Ionicons name="settings-outline" size={22} color={color} />
            <Image source={PolicyIcon} style={{ width: 25,height: 25,marginRight:5}} color={color}/>
          ),
        }}
      />
       <Drawer.Screen
        name="Terms of use"
        component={Termsofuse}
        options={{
          drawerIcon: ({color}) => (
            // <Ionicons name="settings-outline" size={22} color={color} />
            <Image source={PolicyIcon} style={{ width: 25,height: 25,marginRight:5}} color={color}/>
          ),
        }}
      />
      {/* <Drawer.Screen
        name="  testtttt"
        component={TestPage}
        options={{
          drawerIcon: ({color}) => (
            // <Ionicons name="settings-outline" size={22} color={color} />
            <Image source={PolicyIcon} style={{ width: 25,height: 25}} color={color}/>
          ),
        }}
      /> */}
    </Drawer.Navigator>
  );
};

export default AuthStack;
