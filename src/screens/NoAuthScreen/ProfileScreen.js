import React, { useContext, useState, useRef, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import DocumentPicker from 'react-native-document-picker';
import { useFocusEffect } from '@react-navigation/native';
import InputField from '../../components/InputField';
import CustomButton from '../../components/CustomButton';
import { plus, userPhoto } from '../../utils/Images';
import { AuthContext } from '../../context/AuthContext';
import Loader from '../../utils/Loader';
import axios from 'axios';
import { API_URL } from '@env'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import CustomHeader from '../../components/CustomHeader';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Dropdown } from 'react-native-element-dropdown';
import Entypo from 'react-native-vector-icons/Entypo';
import RNDateTimePicker from '@react-native-community/datetimepicker'
import moment from "moment"
import Toast from 'react-native-toast-message';


const dataGender = [
  { label: 'Male', value: 'Male' },
  { label: 'Female', value: 'Female' },
  { label: 'Others', value: 'Others' }
];
const dataMarital = [
  { label: 'Married', value: 'Married' },
  { label: 'Single', value: 'Single' },
  { label: 'Divorced', value: 'Divorced' },
  { label: 'Widowed', value: 'Widowed' }
];

const ProfileScreen = ({ navigation, route }) => {
  const [firstname, setFirstname] = useState('Jennifer Kourtney');
  const [firstNameError, setFirstNameError] = useState('')
  const [countryCode, setCountryCode] = useState('')
  const [phoneno, setPhoneno] = useState('');
  const [phonenoError, setphonenoError] = useState('')
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('')
  const [pickedDocument, setPickedDocument] = useState(null);
  const [imageFile, setImageFile] = useState(null);


  const [isModalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false)
  const [isPicUploadLoading, setIsPicUploadLoading] = useState(false);
  const { login, userToken } = useContext(AuthContext);

  const [yearvalue, setYearValue] = useState(null);
  const [isYearFocus, setYearIsFocus] = useState(false);

  const [monthvalue, setMonthValue] = useState(null);
  const [isMonthFocus, setMonthIsFocus] = useState(false);

  const MIN_DATE = new Date(1930, 0, 1)
  const MAX_DATE = new Date()
  const [date, setDate] = useState('DD - MM  - YYYY')
  const [selectedDOB, setSelectedDOB] = useState(MAX_DATE)
  const [open, setOpen] = useState(false)
  const [dobError, setdobError] = useState('')

  const [isFormChanged, setIsFormChanged] = useState(false);


  const pickDocument = async () => {
    setIsFormChanged(true);
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
      });

      const pickedDocument = result[0];
      setPickedDocument(pickedDocument);

      const formData = new FormData();
      if (pickedDocument) {
        formData.append("profile_pic", {
          uri: pickedDocument.uri,
          type: pickedDocument.type || 'image/jpeg',
          name: pickedDocument.name || 'photo.jpg',
        });
      } else {
        formData.append("profile_pic", "");
      }

      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        throw new Error("User token not found");
      }
      setIsPicUploadLoading(true);
      const response = await axios.post(
        `${API_URL}/patient/profile-pic-upload`,
        formData,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${userToken}`,
          },
        }
      );
      setIsPicUploadLoading(false);

      if (response.data.response) {
        Toast.show({
          type: 'success',
          text1: 'Hello',
          text2: 'Profile picture updated successfully',
          position: 'top',
          topOffset: Platform.OS === 'ios' ? 55 : 20,
        });
      } else {
        handleAlert('Oops..', 'Something went wrong');
      }
    } catch (err) {
      setIsPicUploadLoading(false);
      if (DocumentPicker.isCancel(err)) {
        console.log('Document picker was cancelled');
      } else if (err.response) {
        console.log('Error response:', err.response.data?.response?.records);
        handleAlert('Oops..', err.response.data?.message);
      } else {
        console.error('Error picking document', err);
      }
    }
  };

  const handleAlert = (title, message) => {
    Alert.alert(title, message, [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      { text: 'OK', onPress: () => console.log('OK Pressed') },
    ]);
  };


  const fetchUserData = () => {
    setIsLoading(true)
    AsyncStorage.getItem('userToken', (err, usertoken) => {
      console.log(usertoken, 'usertoken')
      axios.post(`${API_URL}/patient/profile`, {}, {
        headers: {
          "Authorization": `Bearer ${usertoken}`,
          "Content-Type": 'application/json'
        },
      })
        .then(res => {
          let userInfo = res.data.data;
          console.log(userInfo, 'user data from profile api ')
          setFirstname(userInfo?.name)
          setEmail(userInfo?.email)
          setCountryCode(userInfo?.country_code)
          setPhoneno(userInfo?.mobile)
          setDate(userInfo?.dob)
          setYearValue(userInfo?.gender)
          setMonthValue(userInfo?.marital_status)
          setImageFile(userInfo?.profile_pic)
          setIsLoading(false)
        })
        .catch(e => {
          console.log(`Profile error ${e}`)
          setIsLoading(false)
        });
    });
  }

  useEffect(() => {
    fetchUserData();
  }, [])
  useFocusEffect(
    React.useCallback(() => {
      fetchUserData()
    }, [])
  )

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };



  const changeFirstname = (text) => {
    setFirstname(text)
    setIsFormChanged(true);
    if (text) {
      setFirstNameError('')
    } else {
      setFirstNameError('Please enter First name')
    }
  }

  const changePhone = (text) => {
    const phoneRegex = /^\d{10}$/;
    setPhoneno(text)
    if (!phoneRegex.test(text)) {
      setphonenoError('Please enter a 10-digit number.')
    } else {
      setphonenoError('')
    }
  }

  const changeEmail = (text) => {
    setIsFormChanged(true);
    let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;
    if (reg.test(text) === false) {
      console.log("Email is Not Correct");
      setEmail(text)
      setEmailError('Please enter correct Email Id')
      return false;
    }
    else {
      setEmailError('')
      console.log("Email is Correct");
      setEmail(text)
    }
  }


  const submitForm = () => {
    //console.log(selectedItemsType, " type off therapist")
    if (!firstname) {
      setFirstNameError('Please enter Name')
    } else if (!phoneno) {
      setphonenoError('Please enter Mobile No')
    } else if (!email) {
      setEmailError('Please enter Email Id')
    } else if (date == 'DD - MM  - YYYY') {
      setdobError('Please enter DOB')
    } else {
      setIsLoading(true)
      const option = {
        "name": firstname,
        "email": email,
        "dob": moment(date, "DD-MM-YYYY").format("YYYY-MM-DD"),
        "gender": yearvalue,
        "marital_status": monthvalue,
        //"mobile": "7797599595"
      }
      console.log(option, 'dhhhdhhd')
      AsyncStorage.getItem('userToken', (err, usertoken) => {
        axios.post(`${API_URL}/patient/registration`, option, {
          headers: {
            Accept: 'application/json',
            "Authorization": 'Bearer ' + usertoken,
          },
        })
          .then(res => {
            console.log(res.data)
            if (res.data.response == true) {
              setIsLoading(false)
              setIsFormChanged(false)
              Toast.show({
                type: 'success',
                text1: 'Hello',
                text2: "Profile data updated successfully",
                position: 'top',
                topOffset: Platform.OS == 'ios' ? 55 : 20
              });
            } else {
              console.log('not okk')
              setIsLoading(false)
              Alert.alert('Oops..', "Something went wrong", [
                {
                  text: 'Cancel',
                  onPress: () => console.log('Cancel Pressed'),
                  style: 'cancel',
                },
                { text: 'OK', onPress: () => console.log('OK Pressed') },
              ]);
            }
          })
          .catch(e => {
            setIsLoading(false)
            console.log(`user update error ${e}`)
            console.log(e.response.data?.response.records)
            Alert.alert('Oops..', e.response?.data?.message, [
              {
                text: 'Cancel',
                onPress: () => console.log('Cancel Pressed'),
                style: 'cancel',
              },
              { text: 'OK', onPress: () => console.log('OK Pressed') },
            ]);
          });
      });
    }
  }



  if (isLoading) {
    return (
      <Loader />
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader commingFrom={'My Profile'} onPress={() => navigation.goBack()} title={'My Profile'} />
      <KeyboardAwareScrollView showsVerticalScrollIndicator={false} style={{ marginBottom: responsiveHeight(4) }}>
        <View style={styles.wrapper}>
          <View style={styles.mainView}>
            <View style={styles.imageContainer}>
              {isPicUploadLoading ? (
                <ActivityIndicator size="small" color="#417AA4" style={styles.loader} />
              ) : (
                pickedDocument == null ? (
                  imageFile != null ? (
                    <Image source={{ uri: imageFile }} style={styles.imageStyle} />
                  ) : (
                    <Image source={userPhoto} style={styles.imageStyle} />
                  )
                ) : (
                  <Image source={{ uri: pickedDocument.uri }} style={styles.imageStyle} />
                )
              )}
            </View>
            <TouchableOpacity style={styles.plusIcon} onPress={pickDocument}>
              <Image source={plus} style={styles.iconStyle} />
            </TouchableOpacity>
          </View>
          <View style={styles.textinputview}>
            <View style={styles.inputFieldHeader}>
              <Text style={styles.header}>Name</Text>
            </View>
            {firstNameError ? <Text style={{ color: 'red', fontFamily: 'DMSans-Regular' }}>{firstNameError}</Text> : <></>}
            <View style={styles.inputView}>
              <InputField
                label={'First name'}
                keyboardType=" "
                value={firstname}
                //helperText={'Please enter lastname'}
                inputType={'others'}
                onChangeText={(text) => changeFirstname(text)}
              />
            </View>
            <View style={styles.inputFieldHeader}>
              <Text style={styles.header}>Mobile Number</Text>
            </View>
            {phonenoError ? <Text style={{ color: 'red', fontFamily: 'DMSans-Regular' }}>{phonenoError}</Text> : <></>}
            <View style={styles.inputView}>
              <InputField
                label={'Mobile Number'}
                keyboardType=" "
                value={countryCode + '' + phoneno}
                //helperText={'Please enter lastname'}
                inputType={'nonedit'}
                onChangeText={(text) => changePhone(text)}
              />
            </View>
            <View style={styles.inputFieldHeader}>
              <Text style={styles.header}>Email Id</Text>
            </View>
            {emailError ? <Text style={{ color: 'red', fontFamily: 'DMSans-Regular' }}>{emailError}</Text> : <></>}
            <View style={styles.inputView}>
              <InputField
                label={'e.g. abc@gmail.com'}
                keyboardType=" "
                value={email}
                //helperText={'Please enter lastname'}
                inputType={'others'}
                onChangeText={(text) => changeEmail(text)}
              />
            </View>
            <View style={styles.inputFieldHeader}>
              <Text style={styles.header}>Date of Birth</Text>
            </View>
            {dobError ? <Text style={{ color: 'red', fontFamily: 'DMSans-Regular' }}>{dobError}</Text> : <></>}
            <TouchableOpacity onPress={() => setOpen(true)}>
              <View style={styles.dateView}>
                <Text style={styles.dayname}>  {date}</Text>
                <Entypo name="calendar" size={22} color="#000" />
              </View>
            </TouchableOpacity>
            {open == true ?
              <RNDateTimePicker
                mode="date"
                display='spinner'
                value={selectedDOB}
                textColor={'#000'}
                minimumDate={MIN_DATE}
                // maximumDate={MAX_DATE}
                themeVariant="light"
                onChange={(event, selectedDate) => {
                  // console.log(moment(selectedDate).format('DD-MM-YYYY'),'jjjjj');
                  // const formattedDate = moment(selectedDate).format('DD-MM-YYYY');
                  //   console.log(formattedDate,'nnnnnnnnnn');
                  //   setSelectedDOB(selectedDate);
                  //   setDate(formattedDate);
                  if (selectedDate) {
                    const formattedDate = moment(selectedDate).format('DD-MM-YYYY');
                    console.log(formattedDate);
                    setOpen(false)
                    setSelectedDOB(selectedDate);
                    setDate(formattedDate);
                    setdobError('')
                    setIsFormChanged(true);
                  } else {
                    // User canceled the picker
                    setOpen(false)
                  }

                }}
              /> : null}
            <View style={styles.inputFieldHeader}>
              <Text style={styles.header}>Gender</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Dropdown
                style={[styles.dropdownHalf, isYearFocus && { borderColor: '#DDD' }]}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                inputSearchStyle={styles.inputSearchStyle}
                itemTextStyle={styles.selectedTextStyle}
                data={dataGender}
                //search
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder={!isYearFocus ? 'Select Gender' : '...'}
                searchPlaceholder="Search..."
                value={yearvalue}
                onFocus={() => setYearIsFocus(true)}
                onBlur={() => setYearIsFocus(false)}
                onChange={item => {
                  setYearValue(item.value);
                  setYearIsFocus(false);
                  setIsFormChanged(true);
                }}
              />
            </View>
            <View style={styles.inputFieldHeader}>
              <Text style={styles.header}>Marital Status</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Dropdown
                style={[styles.dropdownHalf, isMonthFocus && { borderColor: '#DDD' }]}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                inputSearchStyle={styles.inputSearchStyle}
                itemTextStyle={styles.selectedTextStyle}
                data={dataMarital}
                //search
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder={!isMonthFocus ? 'Marital Status' : '...'}
                searchPlaceholder="Search..."
                value={monthvalue}
                onFocus={() => setMonthIsFocus(true)}
                onBlur={() => setMonthIsFocus(false)}
                onChange={item => {
                  setMonthValue(item.value);
                  setMonthIsFocus(false);
                  setIsFormChanged(true);
                }}
              />
            </View>
          </View>

        </View>

      </KeyboardAwareScrollView>
      {isFormChanged && (
        <View style={styles.buttonwrapper}>
          <CustomButton label={"Submit"}
            // onPress={() => { login() }}
            onPress={() => { submitForm() }}
          />
        </View>
      )}
    </SafeAreaView >
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({

  container: {
    //justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    flex: 1
  },
  wrapper: {
    paddingHorizontal: 23,
    //height: responsiveHeight(78)
  },
  header1: {
    fontFamily: 'DMSans-SemiBold',
    fontSize: responsiveFontSize(3),
    color: '#2F2F2F',
    marginBottom: responsiveHeight(1),
  },
  header: {
    fontFamily: 'DMSans-SemiBold',
    fontSize: responsiveFontSize(2),
    color: '#2F2F2F',
    marginBottom: responsiveHeight(1),
  },
  dateView: { height: responsiveHeight(7), width: responsiveWidth(88), borderRadius: 10, borderWidth: 1, borderColor: '#E0E0E0', marginBottom: responsiveHeight(2), flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 10 },
  dayname: {
    fontFamily: 'DMSans-Regular',
    fontSize: responsiveFontSize(1.8),
    color: '#808080',
  },
  requiredheader: {
    fontFamily: 'DMSans-SemiBold',
    fontSize: responsiveFontSize(1.5),
    color: '#E1293B',
    marginBottom: responsiveHeight(1),
    marginLeft: responsiveWidth(1)
  },
  subheader: {
    fontFamily: 'DMSans-Regular',
    fontSize: responsiveFontSize(1.8),
    fontWeight: '400',
    color: '#808080',
    marginBottom: responsiveHeight(1),
  },
  photoheader: {
    fontFamily: 'Outfit-Bold',
    fontSize: responsiveFontSize(2),
    color: '#2F2F2F'
  },
  imageView: {
    marginTop: responsiveHeight(2)
  },
  imageStyle: {
    height: 90,
    width: 90,
    borderRadius: 45,
    marginBottom: 10
  },
  plusIcon: {
    position: 'absolute',
    top: 0,
    left: 60
  },
  iconStyle: { height: 25, width: 25, resizeMode: 'contain' },
  textinputview: {
    marginBottom: responsiveHeight(10),
    marginTop: responsiveHeight(5)
  },
  inputFieldHeader: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  inputView: {
    paddingVertical: 1
  },
  buttonwrapper: {
    paddingHorizontal: 20,
    position: 'absolute',
    bottom: 0,
    width: responsiveWidth(100),
  },
  searchInput: {
    color: '#333',
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 10,
    //borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 5
  },
  dropdownMenu: {
    backgroundColor: '#FFF'
  },
  dropdownMenuSubsection: {
    borderBottomWidth: 0,

  },
  mainWrapper: {
    flex: 1,
    marginTop: responsiveHeight(1)

  },
  dropdown: {
    height: responsiveHeight(7.2),
    borderColor: '#DDD',
    borderWidth: 0.7,
    borderRadius: 5,
    paddingHorizontal: 8,
    marginTop: 5,
    marginBottom: responsiveHeight(4)
  },
  placeholderStyle: {
    fontSize: responsiveFontSize(1.8),
    color: '#2F2F2F',
    fontFamily: 'DMSans-Regular'
  },
  selectedTextStyle: {
    fontSize: 16,
    color: '#2F2F2F'
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
    color: '#2F2F2F'
  },
  dropdownHalf: {
    height: responsiveHeight(7.2),
    width: responsiveWidth(88),
    borderColor: '#DDD',
    borderWidth: 0.7,
    borderRadius: 5,
    paddingHorizontal: 8,
    marginTop: 5,
    marginBottom: responsiveHeight(4)
  },
  headerImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10
  },
  mainView: {
    alignSelf: 'center',
    marginTop: responsiveHeight(2)
  },
  loader: {
    position: 'absolute',
  },
  imageContainer: {
    height: 90,
    width: 90,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
});
