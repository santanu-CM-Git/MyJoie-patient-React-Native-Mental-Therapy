import React, { useState, useContext, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
  Image,
  StatusBar
} from 'react-native';
import axios from 'axios';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { API_URL } from '@env'
import CustomButton from '../../components/CustomButton';
import InputField from '../../components/InputField';
import { AuthContext } from '../../context/AuthContext';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import DeviceInfo from 'react-native-device-info';
import Loader from '../../utils/Loader';
import { CountryPicker } from "react-native-country-codes-picker";
import LinearGradient from 'react-native-linear-gradient';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { orImg } from '../../utils/Images';

const BannerWidth = Dimensions.get('window').width;
const ITEM_WIDTH = Math.round(BannerWidth * 0.7)
const { height, width } = Dimensions.get('screen')

const LoginScreen = ({ navigation }) => {
  const [phone, setPhone] = useState('');
  const [deviceId, setDeviceId] = useState('')
  const [mobileError, setMobileError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [show, setShow] = useState(false);
  const [countryCode, setCountryCode] = useState('+91');

  const { login, userToken } = useContext(AuthContext);

  const getFCMToken = async () => {
    try {
      // if (Platform.OS == 'android') {
      await messaging().registerDeviceForRemoteMessages();
      // }
      const token = await messaging().getToken();
      AsyncStorage.setItem('fcmToken', token)
      console.log(token, 'fcm token');
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    getDeviceInfo()
    getFCMToken()
  }, [])

  const getDeviceInfo = () => {
    DeviceInfo.getUniqueId().then((deviceUniqueId) => {
      console.log(deviceUniqueId)
      setDeviceId(deviceUniqueId)
    });
  }

  const onChangeText = (text) => {
    const phoneRegex = /^\d{10}$/;
    setPhone(text)
    if (!phoneRegex.test(text)) {
      setMobileError('Please enter a 10-digit number.')
    } else {
      setMobileError('')
    }
  }

  const handleSubmit = () => {

    const phoneRegex = /^\d{10}$/;
    if (!phone) {
      setMobileError('Please enter Mobile no')
    } else if (!phoneRegex.test(phone)) {
      setMobileError('Please enter a 10-digit number.')
    } else {
      navigation.navigate('Otp')
    }
    // if (!phone) {
    //   setMobileError('Please enter Mobile no')
    // } else if (!phoneRegex.test(phone)) {
    //   setMobileError('Please enter a 10-digit number.')
    // } else {
    //   setIsLoading(true)
    //   AsyncStorage.getItem('fcmToken', (err, fcmToken) => {
    //     const option = {
    //       "code": countryCode,
    //       "phone": phone,
    //       "deviceid": deviceId,
    //       "email": email,
    //       "deviceToken": fcmToken
    //     }

    //     console.log(option)
    //     axios.post(`${API_URL}/api/driver/registration`, option)
    //       .then(res => {
    //         console.log(JSON.stringify(res.data))
    //         if (res.data.response.status.code === 200) {
    //           setIsLoading(false)
    //           navigation.push('Otp', { counterycode: countryCode, phoneno: phone, userid: res.data?.response.records.userData.id })
    //         } else {
    //           setIsLoading(false)
    //           Alert.alert('Oops..', "Something went wrong", [
    //             {
    //               text: 'Cancel',
    //               onPress: () => console.log('Cancel Pressed'),
    //               style: 'cancel',
    //             },
    //             { text: 'OK', onPress: () => console.log('OK Pressed') },
    //           ]);
    //         }
    //       })
    //       .catch(e => {
    //         setIsLoading(false)
    //         console.log(`user register error ${e}`)
    //         Alert.alert('Oops..', e.response.data?.response.records.message, [
    //           {
    //             text: 'Cancel',
    //             onPress: () => console.log('Cancel Pressed'),
    //             style: 'cancel',
    //           },
    //           { text: 'OK', onPress: () => console.log('OK Pressed') },
    //         ]);
    //       });
    //   });
    // }
  }

  if (isLoading) {
    return (
      <Loader />
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" />
      <KeyboardAwareScrollView>
        <View style={styles.bannaerContainer}>
          <Image
            source={require('../../assets/images/Rectangle6.png')}
            style={styles.bannerBg}
          />

        </View>

        <View style={styles.wrapper}>
          <View style={{ marginBottom: responsiveHeight(2) }}>
            <Text style={styles.headerText}>Let’s get started! Enter your mobile number</Text>
          </View>
          <View style={styles.textinputview}>
            {/* <InputField
            value={'  +91'}
            inputType={'code'}
            keyboardType="numeric"
          /> */}
            <View style={styles.countryModal}>
              <TouchableOpacity
                onPress={() => setShow(true)}
                style={styles.countryInputView}
              >
                <Text style={{
                  color: '#808080',
                  fontSize: responsiveFontSize(2),
                }}>
                  {countryCode}
                </Text>
              </TouchableOpacity>
              <CountryPicker
                show={show}
                initialState={'+233'}
                pickerButtonOnPress={(item) => {
                  setCountryCode(item.dial_code);
                  setShow(false);
                }}
                style={{
                  modal: {
                    height: responsiveHeight(60),
                  },
                }}
              />
            </View>
            <InputField
              label={'Mobile Number'}
              keyboardType="numeric"
              value={phone}
              inputType={''}
              onChangeText={(text) => onChangeText(text)}
              helperText={mobileError}
            />
          </View>

        </View>
      </KeyboardAwareScrollView>

      <View style={styles.buttonwrapper}>
        <CustomButton label={"Use OTP"}
          onPress={() => handleSubmit()}
        //onPress={() => { navigation.push('Otp', { phoneno: phone }) }}
        />
      </View>
      <View style={styles.termsView}>
        <Text style={styles.termsText}>By signing in you agree to our Terms & Condition and Privacy Policy</Text>
      </View>
      <Image
        source={orImg}
        style={styles.orImg}
      />
      <View style={[styles.buttonwrapper, { marginTop: 10 }]}>
        <CustomButton label={"Login With Truecaller"}
          onPress={() => handleSubmit()}
          buttonColor='gray'
        //onPress={() => { navigation.push('Otp', { phoneno: phone }) }}
        />
      </View>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    flex: 1
  },
  wrapper: {
    paddingHorizontal: 20,
    marginTop: -responsiveHeight(5),
    backgroundColor: '#fff',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    //height: responsiveHeight(50),
    paddingTop: responsiveHeight(5),
    //position:'absolute',
    bottom: 0
  },
  textinputview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    //marginBottom: responsiveHeight(1)
  },
  buttonwrapper: {
    paddingHorizontal: 20,
  },
  countryInputView: {
    height: responsiveHeight(7),
    width: responsiveWidth(15),
    borderColor: '#808080',
    borderWidth: 1,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center'
  },
  bannaerContainer: {
    width: responsiveWidth(100),
    height: responsiveHeight(50),
    backgroundColor: '#fff',
  },
  bannerBg: {
    flex: 1,
    //position: 'absolute',
    //right: 0,
    // bottom: 20,
    height: '100%',
    width: '100%',
    resizeMode: 'cover',
  },
  headerText: {
    color: '#2D2D2D',
    fontFamily: 'DMSans-SemiBold',
    fontSize: responsiveFontSize(2.5),
    marginBottom: responsiveHeight(1)
  },
  termsView: {
    marginBottom: responsiveHeight(0),
    paddingHorizontal: 20,
    alignSelf: 'center'
  },
  termsText: {
    color: '#746868',
    fontFamily: 'DMSans-Regular',
    fontSize: responsiveFontSize(1.5),
    textAlign: 'center'
  },
  orImg: {
    height: responsiveHeight(4),
    width: responsiveWidth(25),
    resizeMode: 'contain',
    alignSelf: "center"
  }
});


export default LoginScreen;
