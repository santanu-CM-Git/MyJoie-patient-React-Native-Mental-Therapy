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
import { plus, uploadImg, uploadPicImg, userPhoto } from '../../utils/Images';
import { AuthContext } from '../../context/AuthContext';
import Loader from '../../utils/Loader';
import axios from 'axios';
import { API_URL } from '@env'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import MultiSelect from 'react-native-multiple-select';
import { Dropdown } from 'react-native-element-dropdown';
import Entypo from 'react-native-vector-icons/Entypo';


const dataGender = [
  { label: 'Male', value: 'Male' },
  { label: 'Female', value: 'Female' },
  {label: 'Others', value: 'Others' }
];
const dataMarital = [
  { label: '01', value: '01' },
  { label: '02', value: '02' },
  { label: '03', value: '03' },
];

const PersonalInformation = ({ navigation, route }) => {
  const concatNo = route?.params?.countrycode + '-' + route?.params?.phoneno;
  const [phoneno, setPhoneno] = useState('');
  const [firstname, setFirstname] = useState('');
  const [firstNameError, setFirstNameError] = useState('')
  const [lastname, setLastname] = useState('');
  const [lastNameError, setLastNameError] = useState('')
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false)
  const { login, userToken } = useContext(AuthContext);

  const [date, setDate] = useState('DD - MM  - YYYY')
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
      setFirstNameError('Please enter First name')
    }
  }

  const changeLastname = (text) => {
    setLastname(text)
    if (text) {
      setLastNameError('')
    } else {
      setLastNameError('Please enter Last name')
    }
  }

  const changePassword = (text) => {
    setPassword(text)
    if (text) {
      setPasswordError('')
    } else {
      setPasswordError('Please enter Address')
    }
  }
  const changeCity = (text) => {
    setCity(text)
    if (text) {
      setCityError('')
    } else {
      setCityError('Please enter City')
    }
  }
  const changePostAddress = (text) => {
    setPostaddress(text)
    // if (text) {
    //   setPostaddressError('')
    // } else {
    //   setPostaddressError('Please enter Ghana Post Address')
    // }
  }

  // const submitForm = () => {
  //   //navigation.navigate('DocumentsUpload')
  //   if (!firstname) {
  //     setFirstNameError('Please enter First name')
  //   }else if(!lastname){
  //     setLastNameError('Please enter Last name')
  //   }else if(!address){
  //     setAddressError('Please enter Address')
  //   }else if(!city){
  //     setCityError('Please enter City')
  //   } else {
  //     setIsLoading(true)
  //     var option = {}
  //     if(email){
  //       var option = {
  //         "firstName": firstname,
  //         "lastName": lastname,
  //         "email": email,
  //         "address": address,
  //         "zipcode": postaddress,
  //         "city" : city
  //       }
  //     }else{
  //       var option = {
  //         "firstName": firstname,
  //         "lastName": lastname,
  //         "address": address,
  //         "zipcode": postaddress,
  //         "city" : city
  //       }
  //     }

  //     axios.post(`${API_URL}/api/driver/updateInformation`, option, {
  //       headers: {
  //         Accept: 'application/json',
  //         "Authorization": 'Bearer ' + route?.params?.usertoken,
  //       },
  //     })
  //       .then(res => {
  //         console.log(res.data)
  //         if (res.data.response.status.code === 200) {
  //           setIsLoading(false)
  //           navigation.push('DocumentsUpload', { usertoken: route?.params?.usertoken })
  //       } else {
  //           Alert.alert('Oops..', "Something went wrong", [
  //               {
  //                   text: 'Cancel',
  //                   onPress: () => console.log('Cancel Pressed'),
  //                   style: 'cancel',
  //               },
  //               { text: 'OK', onPress: () => console.log('OK Pressed') },
  //           ]);
  //       }
  //       })
  //       .catch(e => {
  //         setIsLoading(false)
  //         console.log(`user update error ${e}`)
  //         console.log(e.response.data?.response.records)
  //         Alert.alert('Oops..', "Something went wrong", [
  //           {
  //               text: 'Cancel',
  //               onPress: () => console.log('Cancel Pressed'),
  //               style: 'cancel',
  //           },
  //           { text: 'OK', onPress: () => console.log('OK Pressed') },
  //       ]);
  //       });
  //   }


  // }

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
            {firstNameError ? <Text style={{ color: 'red', fontFamily: 'Outfit-Regular' }}>{firstNameError}</Text> : <></>}
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
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.header}>Email Id</Text>
              <Text style={styles.requiredheader}>*</Text>
            </View>
            <View style={styles.inputView}>
              <InputField
                label={'e.g. abc@gmail.com'}
                keyboardType=" "
                value={email}
                //helperText={'Please enter lastname'}
                inputType={'others'}
                onChangeText={(text) => setEmail(text)}
              />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.header}>Date of Birth</Text>
              <Text style={styles.requiredheader}>*</Text>
            </View>
            <View style={{height: responsiveHeight(7), width: responsiveWidth(88),borderRadius: 10,borderWidth:1,borderColor: '#E0E0E0',marginBottom:responsiveHeight(2),flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingHorizontal:10}}>
            <Text style={styles.dayname}>  {date}</Text>
            <Entypo name="calendar" size={22} color="#000" />
            </View>
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
                style={[styles.dropdownHalf, isYearFocus && { borderColor: '#DDD' }]}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                inputSearchStyle={styles.inputSearchStyle}
                itemTextStyle={styles.selectedTextStyle}
                data={dataMarital}
                //search
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder={!isYearFocus ? 'Marital Status' : '...'}
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
          </View>
          
        </View>
       
        <View style={styles.buttonwrapper}>
        <Text style={{ fontFamily: 'DMSans-Regular', fontSize: responsiveFontSize(1.5), color: '#746868',marginBottom: responsiveHeight(2)}}>By signing in you agree to our Terms & Condition and Privacy Policy</Text>
          <CustomButton label={"Submit"}
            onPress={() => { login() }}
          //onPress={() => { submitForm() }}
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
    fontFamily:'DMSans-Regular'
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
});
