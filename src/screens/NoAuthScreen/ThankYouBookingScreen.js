import React from 'react'
import { SafeAreaView, View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';

import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Thankyou from '../..//assets/images/misc/Thankyou.svg';
import LinearGradient from 'react-native-linear-gradient';
import CustomButton from '../../components/CustomButton';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';

const ThankYouBookingScreen = ({ navigation }) => {
  return (

    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: '#fff',
        padding:20,
        justifyContent:'center',
        alignItems:'center'
      }}>
      <View style={{ flex: 0.4, justifyContent: 'center', alignItems: 'center',  }}>
        <Thankyou
          width={300}
          height={150}
        //style={{transform: [{rotate: '-15deg'}]}}
        />
      </View>
      <View style={{ paddingHorizontal: 20, marginBottom: responsiveHeight(2), marginTop: responsiveHeight(2) }}>
        <Text style={{ color: '#444343', alignSelf: 'center', fontFamily: 'DMSans-Bold', fontSize: responsiveFontSize(2.5), textAlign: 'center', marginBottom: 10 }}>Thank You</Text>
        <Text style={{ color: '#746868', alignSelf: 'center', fontFamily: 'DMSans-Regular', fontSize: responsiveFontSize(1.5), textAlign: 'center' }}>We really appreciate you for booking! </Text>
      </View>
      <View style={styles.totalValue}>
        <View style={{ flexDirection: 'row', height: responsiveHeight(7), backgroundColor: '#DEDEDE', borderTopRightRadius: 10, borderTopLeftRadius: 10, alignItems: 'center', }}>
          <Text style={{ color: '#2D2D2D', fontFamily: 'DMSans-Bold', fontSize: responsiveFontSize(2), fontWeight: 'bold', textAlign: 'center', marginLeft: responsiveWidth(2) }}>Patient Details</Text>
        </View>
        <View style={{ padding: 10, }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: responsiveHeight(2) }}>
            <Text style={{ color: '#746868', fontFamily: 'DMSans-Regular', fontSize: responsiveFontSize(1.7) }}>Name</Text>
            <Text style={{ color: '#444343', fontFamily: 'DMSans-Medium', fontSize: responsiveFontSize(1.7) }}>Sourav Ganguly</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: responsiveHeight(2) }}>
            <Text style={{ color: '#746868', fontFamily: 'DMSans-Regular', fontSize: responsiveFontSize(1.7) }}>Therapist Name</Text>
            <Text style={{ color: '#444343', fontFamily: 'DMSans-Medium', fontSize: responsiveFontSize(1.7) }}>Jennifer Kourtney</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: responsiveHeight(2) }}>
            <Text style={{ color: '#746868', fontFamily: 'DMSans-Regular', fontSize: responsiveFontSize(1.7) }}>Date</Text>
            <Text style={{ color: '#444343', fontFamily: 'DMSans-Medium', fontSize: responsiveFontSize(1.7) }}>29 March, 2024</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: responsiveHeight(2) }}>
            <Text style={{ color: '#746868', fontFamily: 'DMSans-Regular', fontSize: responsiveFontSize(1.7) }}>Appointment</Text>
            <Text style={{ color: '#444343', fontFamily: 'DMSans-Medium', fontSize: responsiveFontSize(1.7) }}>Booked</Text>
          </View>
        </View>
      </View>
      <View style={styles.buttonwrapper}>
        <CustomButton label={"Back to Home"}
          onPress={() => submitReview()}
        />
      </View>

    </SafeAreaView>
  );
};

export default ThankYouBookingScreen;

const styles = StyleSheet.create({
  totalValue: {
    width: responsiveWidth(89),
    height: responsiveHeight(28),
    backgroundColor: '#fff',
    borderRadius: 15,
    borderColor: '#E3E3E3',
    borderWidth: 1,
    marginTop: responsiveHeight(5),
    alignSelf:'center'
  },
  buttonwrapper:{
    position:'absolute',
    bottom:0,
    width: responsiveWidth(90)
  }

});