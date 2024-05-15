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

const UploadSessionSummary = ({ navigation, route }) => {
    const concatNo = route?.params?.countrycode + '-' + route?.params?.phoneno;
    const [phoneno, setPhoneno] = useState('');
    const [firstname, setFirstname] = useState('Jennifer Kourtney');
    const [firstNameError, setFirstNameError] = useState('')
    const [summary, setSummary] = useState('');
    const [pickedDrivingLicenseBack, setPickedDrivingLicenseback] = useState(null);
    const [DrivingLicenseBackError, setDrivingLicenseBackError] = useState('')

    const [isModalVisible, setModalVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false)
    const { login, userToken } = useContext(AuthContext);

    const [selectedItems, setSelectedItems] = useState([]);
    const multiSelectRef = useRef(null);
    const [statevalue, setStateValue] = useState(null);
    const [isStateFocus, setStateIsFocus] = useState(false);

    const [yearvalue, setYearValue] = useState(null);
    const [isYearFocus, setYearIsFocus] = useState(false);

    const [monthvalue, setMonthValue] = useState(null);
    const [isMonthFocus, setMonthIsFocus] = useState(false);

    const onSelectedItemsChange = selectedItems => {
        setSelectedItems(selectedItems);
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
            {/* <CustomHeader commingFrom={'Session Summary'} onPress={() => navigation.goBack()} title={'Session Summary'} /> */}
            <View style={{ paddingHorizontal: 20, paddingVertical: 10, marginTop: responsiveHeight(5) }}>
                <Text style={styles.header}>Session Summary</Text>
                <Text style={{ fontFamily: 'DMSans-Regular', fontSize: responsiveFontSize(1.7), color: '#746868', marginBottom: responsiveHeight(1), }}>Write session summary to proceed</Text>
            </View>
            <KeyboardAwareScrollView showsVerticalScrollIndicator={false} style={{ marginBottom: responsiveHeight(4) }}>
                <View style={styles.wrapper}>
                    <View style={styles.textinputview}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={styles.header}>Patient Name</Text>
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
                            <Text style={styles.header}>Summary</Text>
                        </View>
                        {firstNameError ? <Text style={{ color: 'red', fontFamily: 'Outfit-Regular' }}>{firstNameError}</Text> : <></>}
                        <View style={styles.inputView}>
                            <InputField
                                label={'Summary'}
                                keyboardType=" "
                                value={summary}
                                //helperText={'Please enter lastname'}
                                inputType={'address'}
                                onChangeText={(text) => changeFirstname(text)}
                            />
                        </View>
                    </View>

                </View>

            </KeyboardAwareScrollView>
            <View style={styles.buttonwrapper}>
                <CustomButton label={"Save"}
                    // onPress={() => { login() }}
                    onPress={() => { submitForm() }}
                />
            </View>
        </SafeAreaView >
    );
};

export default UploadSessionSummary;

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
        fontSize: 16,
        color: '#2F2F2F'
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
