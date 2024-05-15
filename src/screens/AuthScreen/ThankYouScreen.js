import React from 'react'
import { SafeAreaView, View, Text, TouchableOpacity,Image } from 'react-native';

import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Thankyou from '../..//assets/images/misc/Thankyou.svg';
import LinearGradient from 'react-native-linear-gradient';
import CustomButton from '../../components/CustomButton';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';

const ThankYouScreen = ({ navigation }) => {
  return (

    <LinearGradient
      colors={['#ECFCFA', '#FFF', '#FFF']} // Change these colors as needed
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={{
        flex: 1, justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <View style={{ marginTop: 1,backgroundColor:'#F4F5F5', width: responsiveWidth(90),height: responsiveHeight(6),paddingHorizontal:10,borderRadius:10,flexDirection:'row',alignItems:'center' }}>
        <Image
            source={require('../../assets/images/accept.png')}
            style={{ height: 15, width:15, resizeMode:'contain'}}
          />
        <Text style={{color: '#2D2D2D', alignSelf: 'center', fontFamily: 'DMSans-Medium', fontSize: responsiveFontSize(1.5),marginLeft: 10}}>Registration Successfully Done</Text>
        </View>
        <View style={{ flex: 0.7, justifyContent: 'center', alignItems: 'center' }}>
          <Thankyou
            width={300}
            height={200}
          //style={{transform: [{rotate: '-15deg'}]}}
          />
        </View>
        <View style={{paddingHorizontal:20, marginBottom: responsiveHeight(2)}}>
          <Text style={{ color: '#444343', alignSelf: 'center', fontFamily: 'DMSans-Bold', fontSize: responsiveFontSize(2.5),textAlign:'center',marginBottom:10 }}>Thank You</Text>
          <Text style={{ color: '#746868', alignSelf: 'center', fontFamily: 'DMSans-Regular', fontSize: responsiveFontSize(1.5),textAlign:'center' }}>For registering with us! Our team will reach out to you within 7 working days</Text>
        </View>
       
      </SafeAreaView>
    </LinearGradient>
  );
};

export default ThankYouScreen;
