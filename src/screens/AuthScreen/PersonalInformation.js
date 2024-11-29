import React, { useContext, useState, useRef } from 'react';
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
  KeyboardAvoidingView
} from 'react-native';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DocumentPicker from 'react-native-document-picker';
import InputField from '../../components/InputField';
import CustomButton from '../../components/CustomButton';
import { AuthContext } from '../../context/AuthContext';
import Loader from '../../utils/Loader';
import axios from 'axios';
import { API_URL } from '@env'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import MultiSelect from 'react-native-multiple-select';
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

const PersonalInformation = ({ navigation, route }) => {
  const concatNo = route?.params?.countrycode + '-' + route?.params?.phoneno;

  const [firstname, setFirstname] = useState('');
  const [firstNameError, setFirstNameError] = useState('')
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  const [isLoading, setIsLoading] = useState(false)
  const { login, userToken } = useContext(AuthContext);

  const MIN_DATE = new Date(1930, 0, 1)
  const MAX_DATE = new Date()
  const [date, setDate] = useState('DD - MM  - YYYY')
  const [selectedDOB, setSelectedDOB] = useState(MAX_DATE)
  const [dobError, setdobError] = useState('');
  const [open, setOpen] = useState(false)

  // Qualification dropdown
  const [selectedItems, setSelectedItems] = useState([]);
  const multiSelectRef = useRef(null);
  const onSelectedItemsChange = selectedItems => {
    setSelectedItems(selectedItems);
  };

  // Type dropdown
  const [selectedItemsType, setSelectedItemsType] = useState([]);
  const multiSelectRefType = useRef(null);
  const onSelectedItemsChangeType = selectedItems => {
    setSelectedItemsType(selectedItems);
  };

  // Language dropdown
  const [selectedItemsLanguage, setSelectedItemsLanguage] = useState([]);
  const multiSelectRefLanguage = useRef(null);
  const onSelectedItemsChangeLanguage = selectedItems => {
    setSelectedItemsLanguage(selectedItems);
  };

  // experience dropdown
  const [yearvalue, setYearValue] = useState(null);
  const [isYearFocus, setYearIsFocus] = useState(false);


  const [monthvalue, setMonthValue] = useState(null);
  const [isMonthFocus, setMonthIsFocus] = useState(false);


  const changeFirstname = (text) => {
    setFirstname(text)
    if (text) {
      setFirstNameError('')
    } else {
      setFirstNameError('Please enter name.')
    }
  }

  const changeEmail = (text) => {
    let reg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (reg.test(text) === false) {
      //console.log("Email is Not Correct");
      setEmail(text)
      setEmailError('Please enter correct email id.')
      return false;
    }
    else {
      setEmailError('')
      //console.log("Email is Correct");
      setEmail(text)
    }
  }

  const validateAge = (date) => {
    //console.log(date, 'given date');

    // Ensure date string is split correctly
    const dateParts = date.split('-');
    if (dateParts.length !== 3) {
      console.error('Date format is incorrect');
      return false;
    }

    const [day, month, year] = dateParts.map(part => {
      const number = Number(part.trim());
      if (isNaN(number)) {
        console.error('Date part is not a number:', part);
      }
      return number;
    });

    if (isNaN(day) || isNaN(month) || isNaN(year)) {
      console.error('One of the date parts is NaN');
      return false;
    }

    const birthDate = new Date(year, month - 1, day); // JavaScript months are 0-11
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    const dayDifference = today.getDate() - birthDate.getDate();

    // Adjust age if the birth date has not occurred yet this year
    if (monthDifference < 0 || (monthDifference === 0 && dayDifference < 0)) {
      age--;
    }

    //console.log(age, 'calculated age');

    return age >= 18;
  };


  const submitForm = () => {
    if (!firstname) {
      setFirstNameError('Please enter name.');
    } else {
      setFirstNameError('');
    }

    if (!email) {
      setEmailError('Please enter email id.');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Please enter a valid email id.');
    } else {
      setEmailError('');
    }

    if (date === 'DD - MM - YYYY') {
      setdobError('Please enter DOB.');
    } else if (!validateAge(date)) {
      setdobError('You must be at least 18 years old.');
    } else {
      setdobError('');
    }

    if (firstname && email && /\S+@\S+\.\S+/.test(email) && date !== 'DD - MM - YYYY' && validateAge(date)) {
      //login()
      setIsLoading(true)
      const option = {
        "name": firstname,
        "email": email,
        "dob": moment(date, "DD-MM-YYYY").format("YYYY-MM-DD"),
        "gender": yearvalue,
        "marital_status": monthvalue,
        //"mobile" : "7797599595"
      }
      //console.log(option, 'dhhhdhhd')
      axios.post(`${API_URL}/patient/registration`, option, {
        headers: {
          Accept: 'application/json',
          "Authorization": 'Bearer ' + route?.params?.token,
        },
      })
        .then(res => {
          //console.log(res.data)
          if (res.data.response == true) {
            setIsLoading(false)
            Toast.show({
              type: 'success',
              text1: '',
              text2: "Profile data updated successfully.",
              position: 'top',
              topOffset: Platform.OS == 'ios' ? 55 : 20
            });
            login(route?.params?.token)
          } else {
            //console.log('not okk')
            setIsLoading(false)
            Alert.alert('Oops..', "Something went wrong.", [
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
          Alert.alert('Oops..', "Something went wrong", [
            {
              text: 'Cancel',
              onPress: () => console.log('Cancel Pressed'),
              style: 'cancel',
            },
            { text: 'OK', onPress: () => console.log('OK Pressed') },
          ]);
        });
    } else {
      // Optionally handle case where some fields are still invalid
    }
  }

  if (isLoading) {
    return (
      <Loader />
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAwareScrollView showsVerticalScrollIndicator={false} style={{ marginBottom: responsiveHeight(4) }}>
        <View style={{ paddingHorizontal: 20, paddingVertical: 25 }}>
          <MaterialIcons name="arrow-back" size={25} color="#000" onPress={() => navigation.goBack()} />
        </View>
        <View style={styles.wrapper}>

          <Text style={styles.header1}>Personal Information</Text>
          <Text style={styles.subheader}>Enter the details below so we can get to know and serve you better</Text>

          <View style={styles.textinputview}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.header}>Name</Text>
              <Text style={styles.requiredheader}>*</Text>
            </View>
            {firstNameError ? <Text style={{ color: 'red', fontFamily: 'DMSans-Regular' }}>{firstNameError}</Text> : <></>}
            <View style={styles.inputView}>
              <InputField
                label={'Name'}
                keyboardType=" "
                value={firstname}
                //helperText={'Please enter lastname'}
                inputType={'others'}
                onChangeText={(text) => changeFirstname(text)}
              />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.header}>Email Id</Text>
              <Text style={styles.requiredheader}>*</Text>
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
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.header}>Date of Birth</Text>
              <Text style={styles.requiredheader}>*</Text>
            </View>
            {dobError ? <Text style={{ color: 'red', fontFamily: 'DMSans-Regular', marginBottom: responsiveHeight(1) }}>{dobError}</Text> : <></>}
            <TouchableOpacity onPress={() => setOpen(true)}>
              <View style={styles.calenderInput}>
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
                 maximumDate={MAX_DATE}
                themeVariant="light"
                onChange={(event, selectedDate) => {
                  // console.log(moment(selectedDate).format('DD-MM-YYYY'),'jjjjj');
                  // const formattedDate = moment(selectedDate).format('DD-MM-YYYY');
                  //   console.log(formattedDate,'nnnnnnnnnn');
                  //   setSelectedDOB(selectedDate);
                  //   setDate(formattedDate);
                  if (selectedDate) {
                    const formattedDate = moment(selectedDate).format('DD-MM-YYYY');
                    //console.log(formattedDate);
                    setOpen(false)
                    setSelectedDOB(selectedDate);
                    setDate(formattedDate);
                    setdobError('')
                  } else {
                    // User canceled the picker
                    setOpen(false)
                  }

                }}
              /> : null}
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
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
                }}
              />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
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
                }}
              />
            </View>
          </View>

        </View>

        <View style={styles.buttonwrapper}>
          <View style={styles.termsView}>
            <Text style={styles.termsText}>
              By signing in you agree to our{' '}
              <Text
                style={styles.termsLinkText}
                onPress={() => navigation.navigate('Termsofuse')}>
                Terms & Condition
              </Text>{' '}
              and{' '}
              <Text
                style={styles.termsLinkText}
                onPress={() => navigation.navigate('PrivacyPolicy')}>
                Privacy Policy
              </Text>.
            </Text>
          </View>
          <CustomButton label={"Submit"}
            //onPress={() => { login() }}
            onPress={() => { submitForm() }}
          />
        </View>
      </KeyboardAwareScrollView>

    </SafeAreaView >
  );
};

export default PersonalInformation;

const styles = StyleSheet.create({

  container: {
    //justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    flex: 1
  },
  wrapper: {
    paddingHorizontal: 23,
    //height: responsiveHeight(78)
    marginBottom: responsiveHeight(2)
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
    fontFamily: 'DMSans-Regular',
    fontSize: responsiveFontSize(2),
    color: '#2F2F2F'
  },
  imageView: {
    marginTop: responsiveHeight(2)
  },
  imageStyle: {
    height: 80,
    width: 80,
    borderRadius: 40,
    marginBottom: 10
  },
  plusIcon: {
    position: 'absolute',
    bottom: 10,
    left: 50
  },
  textinputview: {
    marginBottom: responsiveHeight(15),
    marginTop: responsiveHeight(5)
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
  dropdownHalf: {
    height: responsiveHeight(7.2),
    width: responsiveWidth(89),
    borderColor: '#DDD',
    borderWidth: 0.7,
    borderRadius: 8,
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
  dayname: {
    color: '#716E6E',
    fontFamily: 'DMSans-Regular',
    fontSize: responsiveFontSize(1.8),
    fontWeight: '500'
  },
  calenderInput: {
    height: responsiveHeight(7),
    width: responsiveWidth(88),
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: responsiveHeight(2),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10
  },
  termsView: {
    marginBottom: responsiveHeight(3),
    paddingHorizontal: 10,
    //alignSelf: 'flex-start',
  },
  termsText: {
    color: '#746868',
    fontFamily: 'DMSans-Regular',
    fontSize: responsiveFontSize(1.5),
    //textAlign: 'center',
  },
  termsLinkText: {
    color: '#746868',
    fontFamily: 'DMSans-Regular',
    fontSize: responsiveFontSize(1.5),
    textAlign: 'center',
    textDecorationLine: 'underline', // Optional: to make the link look more like a link
  },
});
