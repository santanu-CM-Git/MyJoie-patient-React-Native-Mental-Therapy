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
import CustomHeader from '../../components/CustomHeader';
import MultiSelect from 'react-native-multiple-select';
import { Dropdown } from 'react-native-element-dropdown';
import Modal from "react-native-modal";
import Icon from 'react-native-vector-icons/Entypo';
const items = [
  { id: '92iijs7yta', name: 'Ondo' },
  { id: 'a0s0a8ssbsd', name: 'Ogun' },
  { id: '16hbajsabsd', name: 'Calabar' },
  { id: 'nahs75a5sg', name: 'Lagos' },
  { id: '667atsas', name: 'Maiduguri' },
  { id: 'hsyasajs', name: 'Anambra' },
  { id: 'djsjudksjd', name: 'Benue' },
  { id: 'sdhyaysdj', name: 'Kaduna' },
  { id: 'suudydjsjd', name: 'Abuja' }
];
const qualificationitemsType = [
  { id: '1', name: 'Individual' },
  { id: '2', name: 'Couple' },
  { id: '3', name: 'Child' },

];
const qualificationitemsLanguage = [
  { id: '1', name: 'Hindi' },
  { id: '2', name: 'English' },
  { id: '3', name: 'Gujrati' },
];
const data = [
  { label: 'Absa Bank Ghana Limited', value: 'Absa Bank Ghana Limited' },
  { label: 'Access Bank (Ghana) Plc', value: 'Access Bank (Ghana) Plc' },
  { label: 'Agricultural Development Bank Plc', value: 'Agricultural Development Bank Plc' },
];
const dataYear = [
  { label: '01', value: '01' },
  { label: '02', value: '02' },
  { label: '03', value: '03' },
];
const dataMonth = [
  { label: '01', value: '01' },
  { label: '02', value: '02' },
  { label: '03', value: '03' },
];

const ProfileScreen = ({ navigation, route }) => {
  const concatNo = route?.params?.countrycode + '-' + route?.params?.phoneno;
  const [phoneno, setPhoneno] = useState('');
  const [firstname, setFirstname] = useState('Jennifer Kourtney');
  const [firstNameError, setFirstNameError] = useState('')
  const [lastname, setLastname] = useState('');
  const [lastNameError, setLastNameError] = useState('')
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('')
  const [Password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('')
  const [city, setCity] = useState('');
  const [cityError, setCityError] = useState('')
  const [postaddress, setPostaddress] = useState('');
  const [postaddressError, setPostaddressError] = useState('')
  const [pickedDrivingLicenseFront, setPickedDrivingLicenseFront] = useState(null);
  const [DrivingLicenseFrontError, setDrivingLicenseFrontError] = useState('')
  const [pickedDrivingLicenseBack, setPickedDrivingLicenseback] = useState(null);
  const [DrivingLicenseBackError, setDrivingLicenseBackError] = useState('')

  const [isModalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false)
  const { login, userToken } = useContext(AuthContext);

  const [statevalue, setStateValue] = useState(null);
  const [isStateFocus, setStateIsFocus] = useState(false);

  const [yearvalue, setYearValue] = useState(null);
  const [isYearFocus, setYearIsFocus] = useState(false);

  const [monthvalue, setMonthValue] = useState(null);
  const [isMonthFocus, setMonthIsFocus] = useState(false);

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

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };



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

  const submitForm = () => {
    console.log(selectedItemsType," type off therapist")
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
      <CustomHeader commingFrom={'My Profile'} onPress={() => navigation.goBack()} title={'My Profile'} />
      <KeyboardAwareScrollView showsVerticalScrollIndicator={false} style={{ marginBottom: responsiveHeight(4) }}>
        <View style={styles.wrapper}>
          <View style={styles.textinputview}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.header}>Name</Text>
            </View>
            {firstNameError ? <Text style={{ color: 'red', fontFamily: 'Outfit-Regular' }}>{firstNameError}</Text> : <></>}
            <View style={styles.inputView}>
              <InputField
                label={'Name'}
                keyboardType=" "
                value={firstname}
                //helperText={'Please enter lastname'}
                inputType={'nonedit'}
                onChangeText={(text) => changeFirstname(text)}
              />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.header}>Email Id</Text>
            </View>
            <View style={styles.inputView}>
              <InputField
                label={'e.g. abc@gmail.com'}
                keyboardType=" "
                value={email}
                //helperText={'Please enter lastname'}
                inputType={'nonedit'}
                onChangeText={(text) => setEmail(text)}
              />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.header}>Mobile Number</Text>
            </View>
            <View style={styles.inputView}>
              <InputField
                label={'Mobile number'}
                keyboardType=" "
                value={phoneno}
                helperText={firstNameError}
                inputType={'nonedit'}
              //onChangeText={(text) => changeFirstname(text)}
              />
            </View>

            {/* <Text
              style={styles.header}>
              Last Name
            </Text>
            {lastNameError?<Text style={{color:'red',fontFamily:'Outfit-Regular'}}>{lastNameError}</Text>:<></>}
            <View style={styles.inputView}>
              <InputField
                label={'Last Name'}
                keyboardType=" "
                value={lastname}
                //helperText={'Please enter lastname'}
                inputType={'others'}
                onChangeText={(text) => changeLastname(text)}
              />
            </View> */}

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.header}>Date of Birth</Text>
            </View>
            {passwordError ? <Text style={{ color: 'red', fontFamily: 'Outfit-Regular' }}>{passwordError}</Text> : <></>}
            <View style={styles.inputView}>
              <InputField
                label={'Date of Birth'}
                keyboardType=" "
                value={Password}
                //helperText={'Please enter lastname'}
                inputType={'nonedit'}
                onChangeText={(text) => changePassword(text)}
              />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.header}>Gender</Text>
            </View>
            {passwordError ? <Text style={{ color: 'red', fontFamily: 'Outfit-Regular' }}>{passwordError}</Text> : <></>}
            <View style={styles.inputView}>
              <InputField
                label={'Gender'}
                keyboardType=" "
                value={Password}
                //helperText={'Please enter lastname'}
                inputType={'nonedit'}
                onChangeText={(text) => changePassword(text)}
              />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.header}>Pan Number</Text>
            </View>
            {passwordError ? <Text style={{ color: 'red', fontFamily: 'Outfit-Regular' }}>{passwordError}</Text> : <></>}
            <View style={styles.inputView}>
              <InputField
                label={'Pan Number'}
                keyboardType=" "
                value={Password}
                //helperText={'Please enter lastname'}
                inputType={'nonedit'}
                onChangeText={(text) => changePassword(text)}
              />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.header}>Aadhar No</Text>
            </View>
            {passwordError ? <Text style={{ color: 'red', fontFamily: 'Outfit-Regular' }}>{passwordError}</Text> : <></>}
            <View style={styles.inputView}>
              <InputField
                label={'Aadhar No'}
                keyboardType=" "
                value={Password}
                //helperText={'Please enter lastname'}
                inputType={'nonedit'}
                onChangeText={(text) => changePassword(text)}
              />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.header}>Type of Therapies</Text>
             
            </View>
            <View style={{ flex: 1, marginVertical: responsiveHeight(1) }}>
              <View style={{ paddingHorizontal: 5, borderColor: '#E0E0E0', borderWidth: 1, borderRadius: 8, width: responsiveWidth(88) }}>
                <MultiSelect
                  hideTags
                  items={qualificationitemsType}
                  uniqueKey="id"
                  ref={multiSelectRefType}
                  onSelectedItemsChange={onSelectedItemsChangeType}
                  selectedItems={selectedItemsType}
                  selectText="Pick Type"
                  searchInputPlaceholderText="Search Type..."
                  onChangeInput={(text) => console.log(text)}
                  altFontFamily="DMSans-Regular"
                  tagRemoveIconColor="#000000"
                  tagBorderColor="#87ADA8"
                  tagTextColor="#2D2D2D"
                  selectedItemTextColor="#000"
                  selectedItemIconColor="#000"
                  itemTextColor="#746868"
                  displayKey="name"
                  searchInputStyle={styles.searchInput}
                  styleDropdownMenu={styles.dropdownMenu}
                  styleDropdownMenuSubsection={styles.dropdownMenuSubsection}
                  styleMainWrapper={styles.mainWrapper}
                  submitButtonColor="#87ADA8"
                  submitButtonText="Submit"
                  styleIndicator={{ marginTop: -6,marginRight: - responsiveWidth(6) }}
                //hideSubmitButton
                />
              </View>
              <View style={{ marginVertical: responsiveHeight(2) }}>
                {multiSelectRefType.current && multiSelectRefType.current.getSelectedItemsExt(selectedItemsType)}
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.header}>Language</Text>
              
            </View>
            <View style={{ flex: 1, marginVertical: responsiveHeight(1) }}>
              <View style={{ paddingHorizontal: 5, borderColor: '#E0E0E0', borderWidth: 1, borderRadius: 8, width: responsiveWidth(88) }}>
                <MultiSelect
                  hideTags
                  items={qualificationitemsLanguage}
                  uniqueKey="id"
                  ref={multiSelectRefLanguage}
                  onSelectedItemsChange={onSelectedItemsChangeLanguage}
                  selectedItems={selectedItemsLanguage}
                  selectText="Pick Language"
                  searchInputPlaceholderText="Search Language..."
                  onChangeInput={(text) => console.log(text)}
                  altFontFamily="DMSans-Regular"
                  tagRemoveIconColor="#000000"
                  tagBorderColor="#87ADA8"
                  tagTextColor="#2D2D2D"
                  selectedItemTextColor="#000"
                  selectedItemIconColor="#000"
                  itemTextColor="#746868"
                  displayKey="name"
                  searchInputStyle={styles.searchInput}
                  styleDropdownMenu={styles.dropdownMenu}
                  styleDropdownMenuSubsection={styles.dropdownMenuSubsection}
                  styleMainWrapper={styles.mainWrapper}
                  submitButtonColor="#87ADA8"
                  submitButtonText="Submit"
                  styleIndicator={{ marginTop: -6,marginRight: - responsiveWidth(6) }}
                //hideSubmitButton
                />
              </View>
              <View style={{ marginVertical: responsiveHeight(2) }}>
                {multiSelectRefLanguage.current && multiSelectRefLanguage.current.getSelectedItemsExt(selectedItemsLanguage)}
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.header}>Qualification</Text>
            </View>
            <View style={{ flex: 1, marginVertical: responsiveHeight(1) }}>
              <View style={{
                fontFamily: 'Outfit-Regular', paddingHorizontal: 5, borderColor: '#E0E0E0', borderWidth: 1, borderRadius: 8, width: responsiveWidth(88)
              }}>
                <MultiSelect
                  hideTags
                  items={items}
                  uniqueKey="id"
                  ref={multiSelectRef}
                  onSelectedItemsChange={onSelectedItemsChange}
                  selectedItems={selectedItems}
                  selectText="Pick Qualification"
                  searchInputPlaceholderText="Search Qualification..."
                  onChangeInput={(text) => console.log(text)}
                  altFontFamily="DMSans-Regular"
                  tagRemoveIconColor="#000000"
                  tagBorderColor="#87ADA8"
                  tagTextColor="#2D2D2D"
                  selectedItemTextColor="#000"
                  selectedItemIconColor="#000"
                  itemTextColor="#746868"
                  displayKey="name"
                  searchInputStyle={styles.searchInput}
                  styleDropdownMenu={styles.dropdownMenu}
                  styleDropdownMenuSubsection={styles.dropdownMenuSubsection}
                  styleMainWrapper={styles.mainWrapper}
                  submitButtonColor="#87ADA8"
                  submitButtonText="Submit"
                  styleIndicator={{marginTop: -6,marginRight: - responsiveWidth(6) }}
                //hideSubmitButton
                />
              </View>
              <View style={{ marginVertical: responsiveHeight(2) }}>
                {multiSelectRef.current && multiSelectRef.current.getSelectedItemsExt(selectedItems)}
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.header}>City</Text>
            </View>
            {passwordError ? <Text style={{ color: 'red', fontFamily: 'Outfit-Regular' }}>{passwordError}</Text> : <></>}
            <View style={styles.inputView}>
              <InputField
                label={'City'}
                keyboardType=" "
                value={Password}
                //helperText={'Please enter lastname'}
                inputType={'others'}
                onChangeText={(text) => changePassword(text)}
              />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.header}>State</Text>
            </View>
            <Dropdown
              style={[styles.dropdown, isStateFocus && { borderColor: '#DDD' }]}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              inputSearchStyle={styles.inputSearchStyle}
              itemTextStyle={styles.selectedTextStyle}
              data={data}
              //search
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder={!isStateFocus ? 'Select item' : '...'}
              searchPlaceholder="Search..."
              value={statevalue}
              onFocus={() => setStateIsFocus(true)}
              onBlur={() => setStateIsFocus(false)}
              onChange={item => {
                setStateValue(item.value);
                setStateIsFocus(false);
              }}
            />
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.header}>Experience</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Dropdown
                style={[styles.dropdownHalf, isYearFocus && { borderColor: '#DDD' }]}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                inputSearchStyle={styles.inputSearchStyle}
                itemTextStyle={styles.selectedTextStyle}
                data={dataYear}
                //search
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder={!isYearFocus ? 'Select year' : '...'}
                searchPlaceholder="Search..."
                value={yearvalue}
                onFocus={() => setYearIsFocus(true)}
                onBlur={() => setYearIsFocus(false)}
                onChange={item => {
                  setYearValue(item.value);
                  setYearIsFocus(false);
                }}
              />
              <Dropdown
                style={[styles.dropdownHalf, isMonthFocus && { borderColor: '#DDD' }]}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                inputSearchStyle={styles.inputSearchStyle}
                itemTextStyle={styles.selectedTextStyle}
                data={dataMonth}
                //search
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder={!isStateFocus ? 'Select month' : '...'}
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
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={styles.header}>Bank Account</Text>
              <TouchableOpacity onPress={() => toggleModal()}>
                <Text style={{ fontFamily: 'DMSans-Medium', fontSize: responsiveFontSize(1.7), color: '#444343', marginBottom: responsiveHeight(1), }}>Change</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.inputView}>
              <InputField
                label={'Aadhar No'}
                keyboardType=" "
                value={'56897 85698 78965 96636'}
                //helperText={'Please enter lastname'}
                inputType={'nonedit'}
                onChangeText={(text) => changePassword(text)}
              />
            </View>
            <Text
              style={styles.header}>
              Upload Supporting Documents
            </Text>
            {DrivingLicenseFrontError ? <Text style={{ color: 'red', fontFamily: 'Outfit-Regular' }}>{DrivingLicenseFrontError}</Text> : <></>}
            {DrivingLicenseBackError ? <Text style={{ color: 'red', fontFamily: 'Outfit-Regular' }}>{DrivingLicenseBackError}</Text> : <></>}

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: responsiveHeight(2) }}>
              <View style={{ height: responsiveHeight(18), width: responsiveWidth(40), borderColor: '#E0E0E0', borderWidth: 1, borderRadius: 10, borderStyle: 'dashed', backgroundColor: '#FAFAFA' }}>
                <View style={{ flexDirection: 'column', alignItems: 'center', marginVertical: 40 }}>

                  <TouchableOpacity onPress={() => pickDocument('DrivingLicenseFront')}>
                    <Image
                      source={uploadImg}
                      style={{ height: 25, width: 25, resizeMode: 'contain', marginBottom: 5 }}
                    />
                  </TouchableOpacity>

                  {!pickedDrivingLicenseFront ?
                    <Text style={{ fontFamily: 'DMSans-Regular', fontSize: responsiveFontSize(1.5), color: '#808080', }}>Upload Degree</Text>
                    :
                    <Text style={{ fontFamily: 'DMSans-Regular', fontSize: responsiveFontSize(1.5), color: '#808080', paddingHorizontal: 5 }}>{pickedDrivingLicenseFront.name}</Text>
                  }
                </View>
              </View>
              <View style={{ height: responsiveHeight(18), width: responsiveWidth(40), borderColor: '#E0E0E0', borderWidth: 1, borderRadius: 10, borderStyle: 'dashed', backgroundColor: '#FAFAFA' }}>
                <View style={{ flexDirection: 'column', alignItems: 'center', marginVertical: 40 }}>

                  <TouchableOpacity onPress={() => pickDocument('DrivingLicenseBack')}>
                    <Image
                      source={uploadImg}
                      style={{ height: 25, width: 25, resizeMode: 'contain', marginBottom: 5 }}
                    />
                  </TouchableOpacity>

                  {!pickedDrivingLicenseBack ?
                    <Text style={{ fontFamily: 'DMSans-Regular', fontSize: responsiveFontSize(1.5), color: '#808080', }}>Upload Marksheets</Text>
                    :
                    <Text style={{ fontFamily: 'DMSans-Regular', fontSize: responsiveFontSize(1.5), color: '#808080', paddingHorizontal: 5 }}>{pickedDrivingLicenseBack.name}</Text>
                  }
                </View>
              </View>

            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: responsiveHeight(2), marginBottom: responsiveHeight(2) }}>
              <View style={{ height: responsiveHeight(18), width: responsiveWidth(40), borderColor: '#E0E0E0', borderWidth: 1, borderRadius: 10, borderStyle: 'dashed', backgroundColor: '#FAFAFA' }}>
                <View style={{ flexDirection: 'column', alignItems: 'center', marginVertical: 40 }}>

                  <TouchableOpacity onPress={() => pickDocument('DrivingLicenseFront')}>
                    <Image
                      source={uploadImg}
                      style={{ height: 25, width: 25, resizeMode: 'contain', marginBottom: 5 }}
                    />
                  </TouchableOpacity>

                  {!pickedDrivingLicenseFront ?
                    <Text style={{ fontFamily: 'DMSans-Regular', fontSize: responsiveFontSize(1.5), color: '#808080', }}>Upload Degree</Text>
                    :
                    <Text style={{ fontFamily: 'DMSans-Regular', fontSize: responsiveFontSize(1.5), color: '#808080', paddingHorizontal: 5 }}>{pickedDrivingLicenseFront.name}</Text>
                  }
                </View>
              </View>
              <View style={{ height: responsiveHeight(18), width: responsiveWidth(40), borderColor: '#E0E0E0', borderWidth: 1, borderRadius: 10, borderStyle: 'dashed', backgroundColor: '#FAFAFA' }}>
                <View style={{ flexDirection: 'column', alignItems: 'center', marginVertical: 40 }}>

                  <TouchableOpacity onPress={() => pickDocument('DrivingLicenseBack')}>
                    <Image
                      source={uploadImg}
                      style={{ height: 25, width: 25, resizeMode: 'contain', marginBottom: 5 }}
                    />
                  </TouchableOpacity>

                  {!pickedDrivingLicenseBack ?
                    <Text style={{ fontFamily: 'DMSans-Regular', fontSize: responsiveFontSize(1.5), color: '#808080', }}>Upload Marksheets</Text>
                    :
                    <Text style={{ fontFamily: 'DMSans-Regular', fontSize: responsiveFontSize(1.5), color: '#808080', paddingHorizontal: 5 }}>{pickedDrivingLicenseBack.name}</Text>
                  }
                </View>
              </View>
            </View>
            <Text
              style={styles.header}>
              Upload Picture
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: responsiveHeight(2), marginTop: responsiveHeight(1) }}>
              <View style={{ height: responsiveHeight(18), width: responsiveWidth(40), borderColor: '#E0E0E0', borderWidth: 1, borderRadius: 10, borderStyle: 'dashed', backgroundColor: '#FAFAFA' }}>
                <View style={{ flexDirection: 'column', alignItems: 'center', marginVertical: 40 }}>

                  <TouchableOpacity onPress={() => pickDocument('DrivingLicenseFront')}>
                    <Image
                      source={uploadPicImg}
                      style={{ height: 25, width: 25, resizeMode: 'contain', marginBottom: 5 }}
                    />
                  </TouchableOpacity>

                  {!pickedDrivingLicenseFront ?
                    <Text style={{ fontFamily: 'DMSans-Regular', fontSize: responsiveFontSize(1.5), color: '#808080', }}>Upload Photo</Text>
                    :
                    <Text style={{ fontFamily: 'DMSans-Regular', fontSize: responsiveFontSize(1.5), color: '#808080', paddingHorizontal: 5 }}>{pickedDrivingLicenseFront.name}</Text>
                  }
                </View>
              </View>
            </View>
          </View>

        </View>
        <View style={styles.buttonwrapper}>
          <CustomButton label={"Submit For Review"}
            // onPress={() => { login() }}
            onPress={() => { submitForm() }}
          />
        </View>
      </KeyboardAwareScrollView>
      <Modal
        isVisible={isModalVisible}
        style={{
          margin: 0, // Add this line to remove the default margin
          justifyContent: 'flex-end',
        }}>
        <View style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', height: 50, width: 50, borderRadius: 25, position: 'absolute', bottom: '45%', left: '45%', right: '45%' }}>
          <Icon name="cross" size={30} color="#000" onPress={toggleModal} />
        </View>
        <View style={{ height: '39%', backgroundColor: '#fff', position: 'absolute', bottom: 0, width: '100%' }}>
          <View style={{ padding: 25 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', }}>
              <Text style={styles.header}>Bank Account</Text>
              <TouchableOpacity onPress={() => toggleModal()}>
                <Text style={{ fontFamily: 'DMSans-Medium', fontSize: responsiveFontSize(1.7), color: '#444343', marginBottom: responsiveHeight(1), }}>Cancel</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.inputView}>
              <InputField
                label={'Aadhar No'}
                keyboardType=" "
                value={'56897 85698 78965 96636'}
                //helperText={'Please enter lastname'}
                inputType={'others'}
                onChangeText={(text) => changePassword(text)}
              />
            </View>
            <View style={{ height: responsiveHeight(18), width: responsiveWidth(88), borderColor: '#E0E0E0', borderWidth: 1, borderRadius: 10, borderStyle: 'dashed', backgroundColor: '#FAFAFA' }}>
              <View style={{ flexDirection: 'column', alignItems: 'center', marginVertical: 40 }}>

                <TouchableOpacity onPress={() => pickDocument('DrivingLicenseBack')}>
                  <Image
                    source={uploadImg}
                    style={{ height: 25, width: 25, resizeMode: 'contain', marginBottom: 5 }}
                  />
                </TouchableOpacity>

                {!pickedDrivingLicenseBack ?
                  <Text style={{ fontFamily: 'DMSans-Regular', fontSize: responsiveFontSize(1.5), color: '#808080', }}>Upload Cancel Cheque</Text>
                  :
                  <Text style={{ fontFamily: 'DMSans-Regular', fontSize: responsiveFontSize(1.5), color: '#808080', paddingHorizontal: 5 }}>{pickedDrivingLicenseBack.name}</Text>
                }
              </View>
            </View>
          </View>

        </View>
      </Modal>
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
    marginBottom: responsiveHeight(10),
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
    width: responsiveWidth(40),
    borderColor: '#DDD',
    borderWidth: 0.7,
    borderRadius: 5,
    paddingHorizontal: 8,
    marginTop: 5,
    marginBottom: responsiveHeight(4)
  },
});
