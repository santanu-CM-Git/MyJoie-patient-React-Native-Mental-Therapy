import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, SafeAreaView, StyleSheet, ScrollView, StatusBar, Image, FlatList, TouchableOpacity, Animated, KeyboardAwareScrollView, useWindowDimensions, Switch, Pressable, Alert } from 'react-native'
import CustomHeader from '../../components/CustomHeader'
import Feather from 'react-native-vector-icons/Feather';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions'
import { TextInput, LongPressGestureHandler, State, TouchableWithoutFeedback } from 'react-native-gesture-handler'
import { bookmarkedFill, bookmarkedNotFill, cameraColor, chatColor, checkedImg, filterImg, phoneColor, uncheckedImg} from '../../utils/Images'
import { API_URL } from '@env'
import axios from 'axios';
import AsyncStorage from "@react-native-async-storage/async-storage";
import Loader from '../../utils/Loader';
import moment from "moment"
import StarRating from 'react-native-star-rating';
import InputField from '../../components/InputField';
import CustomButton from '../../components/CustomButton';
import Modal from "react-native-modal";
import Icon from 'react-native-vector-icons/Entypo';
import CheckBox from '@react-native-community/checkbox';
import SelectMultiple from 'react-native-select-multiple'
import { Dropdown } from 'react-native-element-dropdown';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

const dropdowndata = [
    { label: 'All therapist', value: 'All' },
    { label: 'Individual', value: 'Individual' },
    { label: 'Couple', value: 'Couple' },
    { label: 'Child', value: 'Child' },
];
const Experience = [
    { label: '0 - 2 Years', value: '1' },
    { label: '3 - 5 Years', value: '2' },
    { label: '6 - 8 Years', value: '3' },
    { label: '9 - 12 Years', value: '4' },
    { label: '13 - 15 Years', value: '5' }
]
const Rating = [
    { label: '1 Star', value: '1' },
    { label: '2 Star', value: '2' },
    { label: '3 Star', value: '3' },
    { label: '4 Star', value: '4' },
    { label: '5 Star', value: '5' }
]
const Gender = [
    { label: 'Male', value: '1' },
    { label: 'Female', value: '2' },
]
const Ages = [
    { label: '20 - 30', value: '1' },
    { label: '30 - 40', value: '2' },
    { label: '40 - 50', value: '3' },
    { label: '50 - 60', value: '4' },
    { label: '60 above', value: '5' },
]


const FreeTherapistList = ({ navigation, route }) => {

    const [value, setValue] = useState('All');
    const [isFocus, setIsFocus] = useState(false);
    const [therapistData, setTherapistData] = React.useState([])
    const [therapistFilterData, setTherapistFilterData] = React.useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [starCount, setStarCount] = useState(4)
    const [isEnabled, setIsEnabled] = useState(false);
    const toggleSwitch = () => setIsEnabled(previousState => !previousState);
    const [toggleCheckBox, setToggleCheckBox] = useState(false)
    const [isModalVisible, setModalVisible] = useState(false);
    const [isFilterModalVisible, setFilterModalVisible] = useState(false);
    const [activeTab, setActiveTab] = useState('Experience')
    const [searchValue, setSearchValue] = useState('');

    const [selectedExperience, setSelectedExperience] = useState([]);
    const onSelectionsChangeExperience = (selectedExperience) => {
        // selectedFruits is array of { label, value }
        setSelectedExperience(selectedExperience);
    };

    const [selectedType, setSelectedType] = useState([]);
    const onSelectionsChangeType = (selectedType) => {
        // selectedFruits is array of { label, value }
        setSelectedType(selectedType);
    };
    const [selectedRating, setSelectedRating] = useState([]);
    const onSelectionsChangeRating = (selectedRating) => {
        // selectedFruits is array of { label, value }
        setSelectedRating(selectedRating);
    };
    const [selectedGender, setSelectedGender] = useState([]);
    const onSelectionsChangeGender = (selectedGender) => {
        // selectedFruits is array of { label, value }
        setSelectedGender(selectedGender);
    };
    const [selectedAge, setSelectedAge] = useState([]);
    const onSelectionsChangeAge = (selectedAge) => {
        // selectedFruits is array of { label, value }
        setSelectedAge(selectedAge);
    };

    useEffect(() => {
        fetchAllTherapist();
    }, [])
    useFocusEffect(
        React.useCallback(() => {
            fetchAllTherapist()
        }, [])
    )
    const toggleModal = () => {
        setModalVisible(!isModalVisible);
    };
    const toggleFilterModal = () => {
        setFilterModalVisible(!isFilterModalVisible);
    };

    const fetchAllTherapist = () => {
        AsyncStorage.getItem('userToken', (err, usertoken) => {
            const option = {
                "flag": 'free'
            }
            axios.post(`${API_URL}/patient/therapist-list`, option, {
                headers: {
                    'Accept': 'application/json',
                    "Authorization": 'Bearer ' + usertoken,
                    //'Content-Type': 'multipart/form-data',
                },
            })
                .then(res => {
                    console.log(JSON.stringify(res.data.data), 'fetch all therapist')
                    if (res.data.response == true) {
                        setTherapistData(res.data.data);
                        setTherapistFilterData(res.data.data)
                        setIsLoading(false);

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
                    console.log(`user register error ${e}`)
                    console.log(e.response)
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

    const onChangeDropdown = (item) => {
        setValue(item.value);
        setIsFocus(false);
        if (item.value == "All") {
            setTherapistFilterData(therapistData)
        } else {
            const filteredData = therapistData.filter(entry =>
                entry.therapy_type_list.split(',').includes(item.value)
            );
            console.log(filteredData, 'filterd data')
            setTherapistFilterData(filteredData)
        }

    }
    const bookmarkedToggle = (therapistId) => {
        AsyncStorage.getItem('userToken', (err, usertoken) => {
            AsyncStorage.getItem('userInfo', (err, userInfo) => {
                const userData = JSON.parse(userInfo)
                const option = {
                    "patient_id": userData.patient_details.user_id,
                    "therapist_id": therapistId
                }
                axios.post(`${API_URL}/patient/wishlist-click`, option, {
                    headers: {
                        'Accept': 'application/json',
                        "Authorization": 'Bearer ' + usertoken,
                        //'Content-Type': 'multipart/form-data',
                    },
                })
                    .then(res => {
                        console.log(JSON.stringify(res.data.data), 'response from wishlist submit')
                        if (res.data.response == true) {
                            setIsLoading(false);
                            Toast.show({
                                type: 'success',
                                text1: 'Hello',
                                text2: "Successfully added to wishlist",
                                position: 'top',
                                topOffset: Platform.OS == 'ios' ? 55 : 20
                            });
                            fetchAllTherapist()
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
                        console.log(`user register error ${e}`)
                        console.log(e.response)
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
        });
    }

    const getNextAvailableSlot = (slot) => {
        if (!slot) return '';
        const now = moment();
        const slotTime = moment(slot, 'HH:mm:ss');
        if (slotTime.isBefore(now, 'minute')) {
            return `Next Avl. Slot : Tomorrow ${slotTime.format('hh:mm A')}`;
        } else {
            return `Next Avl. Slot : Today ${slotTime.format('hh:mm A')}`;
        }
    };

    const renderItem = ({ item }) => (
        <Pressable onPress={() => navigation.navigate('TherapistProfile', { therapistId: item?.user_id, mode: 'free' })}>
            <View style={styles.totalValue}>
                <View style={styles.totalValue1stSection}>
                    <View style={styles.profilePicSection}>
                        <Image
                            source={{ uri: item?.user?.profile_pic }}
                            style={styles.profilePicStyle}
                        />
                        <StarRating
                            disabled={true}
                            maxStars={5}
                            rating={item?.display_rating}
                            selectedStar={(rating) => setStarCount(rating)}
                            fullStarColor={'#FFCB45'}
                            starSize={12}
                            starStyle={styles.starStyle}
                        />
                        <Text style={styles.noOfReview}>{item?.review_counter} Reviews</Text>
                    </View>
                    <View style={styles.contentStyle}>
                        <Text style={styles.contentStyleName}>{item?.user?.name}</Text>
                        <Text style={styles.contentStyleQualification}>{item?.qualification_list}</Text>
                        <Text style={styles.contentStyleExp}>{item?.experience} Years Experience</Text>
                        <Text style={styles.contentStyleLang}>Language : <Text style={styles.contentStyleLangValue}>{item?.languages_list}</Text></Text>
                        <View style={{ flexDirection: 'row', }}>
                            <Text style={[styles.contentStyleRate, { marginRight: 5 }]}>₹{item?.rate} for 15 Min</Text>
                            <Text style={styles.contentStyleRateFree}>Free for 15 Min</Text>
                        </View>

                        <Text style={[styles.contentStyleAvailableSlot,{color: item?.instant_availability == 'on'?'#417AA4':'#444343',}]}>{getNextAvailableSlot(item?.firstAvailableSlot)}</Text>
                    </View>
                    <View style={{ width: responsiveWidth(6), }}>
                        {item?.wishlistcount == 'yes' ?
                            <TouchableOpacity onPress={() => bookmarkedToggle(item?.user_id)}>
                                <Image
                                    source={bookmarkedFill}
                                    style={styles.iconSize}
                                />
                            </TouchableOpacity>
                            :
                            <TouchableOpacity onPress={() => bookmarkedToggle(item?.user_id)}>
                                <Image
                                    source={bookmarkedNotFill}
                                    style={styles.iconSize}
                                />
                            </TouchableOpacity>
                        }
                    </View>
                </View>
                <View style={styles.totalValue2ndSection}>
                    <View style={styles.listButtonFirstSection}>
                        {/* {item?.instant_availability == 'yes' ?
                            <TouchableOpacity onPress={() => toggleModal()}>
                                <View style={styles.instantConnectView}>
                                    <Text style={styles.instantConnectText}>Instant Connect</Text>
                                </View>
                            </TouchableOpacity>
                            :
                            <></>
                        } */}
                    </View>
                    <View style={styles.listButtonSecondSection}>
                        <View style={styles.iconView}>
                            <Image
                                source={cameraColor}
                                style={styles.iconSize}
                            />
                        </View>
                        <View style={styles.iconView}>
                            <Image
                                source={phoneColor}
                                style={styles.iconSize}
                            />
                        </View>
                        <View style={styles.iconView}>
                            <Image
                                source={chatColor}
                                style={styles.iconSize}
                            />
                        </View>
                    </View>
                </View>
            </View>
        </Pressable>
    );

    if (isLoading) {
        return (
            <Loader />
        )
    }

    const changeSearchValue = (text) => {
        const searchText = text.toLowerCase().trim();
        const filteredData = therapistData.filter(therapist =>
            therapist.user.name.toLowerCase().includes(searchText)
        );
        setSearchValue(text);
        setTherapistFilterData(filteredData);
    }


    return (
        <SafeAreaView style={styles.Container}>
            <CustomHeader commingFrom={'Therapist'} onPress={() => navigation.goBack()} title={'Therapist'} />
            <ScrollView style={styles.wrapper}>
                <View style={styles.filterSection}>
                    <View style={styles.filterSection1st}>
                        <View style={{ width: responsiveWidth(35), }}>
                            <Dropdown
                                style={[styles.dropdown, isFocus && { borderColor: 'blue' }]}
                                placeholderStyle={styles.placeholderStyle}
                                selectedTextStyle={styles.selectedTextStyle}
                                inputSearchStyle={styles.inputSearchStyle}
                                itemTextStyle={styles.selectedTextStyle}
                                data={dropdowndata}
                                //search
                                maxHeight={300}
                                labelField="label"
                                valueField="value"
                                placeholder={!isFocus ? 'Select item' : '...'}
                                searchPlaceholder="Search..."
                                value={value}
                                onFocus={() => setIsFocus(true)}
                                onBlur={() => setIsFocus(false)}
                                onChange={item => {
                                    onChangeDropdown(item)
                                }}
                            />
                            {/* <Text style={{ fontSize: responsiveFontSize(2), color: '#2D2D2D', fontFamily: 'DMSans-Bold', }}>Type for therapy</Text> */}
                        </View>
                        <TouchableWithoutFeedback onPress={() => toggleFilterModal()}>
                            <View style={styles.filterIconView}>
                                <Image
                                    source={filterImg}
                                    style={{ height: 20, width: 20 }}
                                />
                                <Text style={styles.filterIconText}>Filter</Text>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </View>
                <View style={{ alignSelf: 'center' }}>
                    <InputField
                        label={'Search by therapist name'}
                        keyboardType=" "
                        value={searchValue}
                        //helperText={'Please enter lastname'}
                        inputType={'others'}
                        onChangeText={(text) => changeSearchValue(text)}
                    />
                </View>
                {/* <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: responsiveHeight(2) }}>
                        <View style={{ height: responsiveHeight(5), width: responsiveWidth(27), backgroundColor: '#ECFCFA', borderColor: '#87ADA8', borderWidth: 1, borderRadius: 20, justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ color: '#2D2D2D', fontFamily: 'DMSans-Bold', fontSize: responsiveFontSize(1.7) }}>Individual</Text>
                        </View>
                        <View style={{ height: responsiveHeight(5), width: responsiveWidth(27), backgroundColor: '#FFF', borderColor: '#87ADA8', borderWidth: 1, borderRadius: 20, justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ color: '#746868', fontFamily: 'DMSans-Medium', fontSize: responsiveFontSize(1.7) }}>Couple</Text>
                        </View>
                        <View style={{ height: responsiveHeight(5), width: responsiveWidth(27), backgroundColor: '#FFF', borderColor: '#87ADA8', borderWidth: 1, borderRadius: 20, justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ color: '#746868', fontFamily: 'DMSans-Medium', fontSize: responsiveFontSize(1.7) }}>Child</Text>
                        </View>
                    </View> */}
                <View style={{ alignSelf: 'center' }}>
                    <FlatList
                        data={therapistFilterData}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id.toString()}
                        maxToRenderPerBatch={10}
                        windowSize={5}
                        initialNumToRender={10}
                        getItemLayout={(therapistFilterData, index) => (
                            { length: 50, offset: 50 * index, index }
                        )}
                    />
                </View>

            </ScrollView>
            <Modal
                isVisible={isModalVisible}
                // onBackdropPress={() => setIsFocus(false)} // modal off by clicking outside of the modal
                style={{
                    margin: 0, // Add this line to remove the default margin
                    justifyContent: 'flex-end',
                }}>
                <View style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', height: 50, width: 50, borderRadius: 25, position: 'absolute', bottom: '91%', left: '45%', right: '45%' }}>
                    <Icon name="cross" size={30} color="#B0B0B0" onPress={toggleModal} />
                </View>
                {/* <TouchableWithoutFeedback onPress={() => setIsFocus(false)} style={{  }}> */}
                <View style={{ height: '88%', backgroundColor: '#fff', position: 'absolute', bottom: 0, width: '100%' }}>
                    <View style={{ padding: 20 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: responsiveHeight(2), marginTop: responsiveHeight(2) }}>
                            <Text style={{ fontSize: responsiveFontSize(2), color: '#2D2D2D', fontFamily: 'DMSans-Bold', }}>Select Date</Text>
                        </View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{}}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <View style={{ height: responsiveHeight(10), width: responsiveWidth(13.5), backgroundColor: '#EEE', borderRadius: 30, marginRight: responsiveWidth(3), flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', padding: 10 }}>
                                    <Text style={{ color: '#746868', fontSize: responsiveFontSize(1.8), fontFamily: 'DMSans-Regular', }}>Fri</Text>
                                    <Text style={{ color: '#2D2D2D', fontSize: responsiveFontSize(2.3), fontFamily: 'DMSans-Bold', }}>23</Text>
                                </View>
                                <View style={{ height: responsiveHeight(10), width: responsiveWidth(13.5), backgroundColor: '#ECFCFA', borderRadius: 30, borderColor: '#87ADA8', borderWidth: 1, marginRight: responsiveWidth(3), flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', padding: 10 }}>
                                    <Text style={{ color: '#746868', fontSize: responsiveFontSize(1.8), fontFamily: 'DMSans-Regular', }}>Sat</Text>
                                    <Text style={{ color: '#2D2D2D', fontSize: responsiveFontSize(2.3), fontFamily: 'DMSans-Bold', }}>24</Text>
                                </View>
                                <View style={{ height: responsiveHeight(10), width: responsiveWidth(13.5), backgroundColor: '#EEE', borderRadius: 30, marginRight: responsiveWidth(3), flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', padding: 10 }}>
                                    <Text style={{ color: '#746868', fontSize: responsiveFontSize(1.8), fontFamily: 'DMSans-Regular', }}>Sun</Text>
                                    <Text style={{ color: '#2D2D2D', fontSize: responsiveFontSize(2.3), fontFamily: 'DMSans-Bold', }}>25</Text>
                                </View>
                                <View style={{ height: responsiveHeight(10), width: responsiveWidth(13.5), backgroundColor: '#EEE', borderRadius: 30, marginRight: responsiveWidth(3), flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', padding: 10 }}>
                                    <Text style={{ color: '#746868', fontSize: responsiveFontSize(1.8), fontFamily: 'DMSans-Regular', }}>Mon</Text>
                                    <Text style={{ color: '#2D2D2D', fontSize: responsiveFontSize(2.3), fontFamily: 'DMSans-Bold', }}>26</Text>
                                </View>
                                <View style={{ height: responsiveHeight(10), width: responsiveWidth(13.5), backgroundColor: '#EEE', borderRadius: 30, marginRight: responsiveWidth(3), flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', padding: 10 }}>
                                    <Text style={{ color: '#746868', fontSize: responsiveFontSize(1.8), fontFamily: 'DMSans-Regular', }}>Tue</Text>
                                    <Text style={{ color: '#2D2D2D', fontSize: responsiveFontSize(2.3), fontFamily: 'DMSans-Bold', }}>27</Text>
                                </View>
                                <View style={{ height: responsiveHeight(10), width: responsiveWidth(13.5), backgroundColor: '#EEE', borderRadius: 30, marginRight: responsiveWidth(3), flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', padding: 10 }}>
                                    <Text style={{ color: '#746868', fontSize: responsiveFontSize(1.8), fontFamily: 'DMSans-Regular', }}>Wed</Text>
                                    <Text style={{ color: '#2D2D2D', fontSize: responsiveFontSize(2.3), fontFamily: 'DMSans-Bold', }}>28</Text>
                                </View>
                                <View style={{ height: responsiveHeight(10), width: responsiveWidth(13.5), backgroundColor: '#EEE', borderRadius: 30, marginRight: responsiveWidth(3), flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', padding: 10 }}>
                                    <Text style={{ color: '#746868', fontSize: responsiveFontSize(1.8), fontFamily: 'DMSans-Regular', }}>Thr</Text>
                                    <Text style={{ color: '#2D2D2D', fontSize: responsiveFontSize(2.3), fontFamily: 'DMSans-Bold', }}>29</Text>
                                </View>
                            </View>
                        </ScrollView>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: responsiveHeight(2), marginTop: responsiveHeight(2) }}>
                            <Text style={{ fontSize: responsiveFontSize(2), color: '#2D2D2D', fontFamily: 'DMSans-Bold', }}>Select Time</Text>
                        </View>
                        <View style={{ height: responsiveHeight(8), width: responsiveWidth(90), backgroundColor: '#33D1C3', borderRadius: 15, justifyContent: 'center', padding: 10 }}>
                            <Text style={{ color: '#FFF', fontFamily: 'DMSans-Medium', fontSize: responsiveFontSize(2) }}>We recommend booking one hour (two continuous slots)</Text>
                        </View>
                        <View style={{ width: responsiveWidth(90), marginTop: responsiveHeight(2), flexDirection: 'row', flexWrap: 'wrap' }}>
                            <View style={{ height: responsiveHeight(5), padding: 10, backgroundColor: '#EAECF0', justifyContent: 'center', alignItems: 'center', borderRadius: 20, marginRight: 10, marginBottom: 10 }}>
                                <Text style={{ color: '#2D2D2D', fontFamily: 'DMSans-Bold', fontSize: responsiveFontSize(1.7) }}>07:00 - 07:30 PM</Text>
                            </View>
                            <View style={{ height: responsiveHeight(5), padding: 10, backgroundColor: '#EAECF0', justifyContent: 'center', alignItems: 'center', borderRadius: 20, marginRight: 10, marginBottom: 10 }}>
                                <Text style={{ color: '#2D2D2D', fontFamily: 'DMSans-Bold', fontSize: responsiveFontSize(1.7) }}>08:00 - 08:30 PM</Text>
                            </View>
                            <View style={{ height: responsiveHeight(5), padding: 10, backgroundColor: '#EAECF0', justifyContent: 'center', alignItems: 'center', borderRadius: 20, marginRight: 10, marginBottom: 10 }}>
                                <Text style={{ color: '#2D2D2D', fontFamily: 'DMSans-Bold', fontSize: responsiveFontSize(1.7) }}>10:45 - 11:15 AM</Text>
                            </View>
                            <View style={{ height: responsiveHeight(5), padding: 10, backgroundColor: '#EAECF0', justifyContent: 'center', alignItems: 'center', borderRadius: 20, marginRight: 10, marginBottom: 10 }}>
                                <Text style={{ color: '#2D2D2D', fontFamily: 'DMSans-Bold', fontSize: responsiveFontSize(1.7) }}>10:45 - 11:15 AM </Text>
                            </View>
                        </View>
                        <View style={styles.totalValue3}>
                            <Text style={{ color: '#2D2D2D', fontFamily: 'DMSans-Bold', fontSize: responsiveFontSize(1.7) }}>Select Mode</Text>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: responsiveHeight(2) }}>
                                <View style={{ height: responsiveHeight(11), width: responsiveWidth(25), backgroundColor: '#ECFCFA', borderColor: '#87ADA8', borderWidth: 1, borderRadius: 10, padding: 5 }}>
                                    <Image
                                        source={checkedImg}
                                        style={{ height: 25, width: 25, resizeMode: 'contain', alignSelf: 'flex-end' }}
                                    />
                                    <Image
                                        source={cameraColor}
                                        style={{ height: 30, width: 30, resizeMode: 'contain', alignSelf: 'center' }}
                                    />
                                </View>
                                <View style={{ height: responsiveHeight(11), width: responsiveWidth(25), backgroundColor: '#FFF', borderColor: '#87ADA8', borderWidth: 1, borderRadius: 10, padding: 5 }}>
                                    <Image
                                        source={uncheckedImg}
                                        style={{ height: 25, width: 25, resizeMode: 'contain', alignSelf: 'flex-end' }}
                                    />
                                    <Image
                                        source={phoneColor}
                                        style={{ height: 30, width: 30, resizeMode: 'contain', alignSelf: 'center' }}
                                    />
                                </View>
                                <View style={{ height: responsiveHeight(11), width: responsiveWidth(25), backgroundColor: '#FFF', borderColor: '#87ADA8', borderWidth: 1, borderRadius: 10, padding: 5 }}>
                                    <Image
                                        source={uncheckedImg}
                                        style={{ height: 25, width: 25, resizeMode: 'contain', alignSelf: 'flex-end' }}
                                    />
                                    <Image
                                        source={chatColor}
                                        style={{ height: 30, width: 30, resizeMode: 'contain', alignSelf: 'center' }}
                                    />
                                </View>
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row', width: responsiveWidth(86), marginTop: responsiveHeight(2) }}>
                            <CheckBox
                                disabled={false}
                                value={toggleCheckBox}
                                onValueChange={(newValue) => setToggleCheckBox(newValue)}
                            />
                            <Text style={{ color: '#746868', fontFamily: 'DMSans-Regular', fontSize: responsiveFontSize(1.7) }}>I give my consent to the app and therapists to access my past medical history available on the platform </Text>
                        </View>
                        <View style={{ marginTop: responsiveHeight(2) }}>
                            <CustomButton label={"Book Appointment"}
                                // onPress={() => { login() }}
                                onPress={() => { submitForm() }}
                            />
                        </View>
                    </View>
                </View>
                {/* </TouchableWithoutFeedback> */}
            </Modal>
            <Modal
                isVisible={isFilterModalVisible}
                // onBackdropPress={() => setIsFocus(false)} // modal off by clicking outside of the modal
                style={{
                    margin: 0, // Add this line to remove the default margin
                    justifyContent: 'flex-end',
                }}>
                <View style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', height: 50, width: 50, borderRadius: 25, position: 'absolute', bottom: '91%', left: '45%', right: '45%' }}>
                    <Icon name="cross" size={30} color="#B0B0B0" onPress={toggleFilterModal} />
                </View>
                {/* <TouchableWithoutFeedback onPress={() => setIsFocus(false)} style={{  }}> */}
                <View style={{ height: '88%', backgroundColor: '#fff', position: 'absolute', bottom: 0, width: '100%' }}>
                    <View style={{ padding: 0 }}>
                        <View style={{ padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: responsiveHeight(2), marginTop: responsiveHeight(2) }}>
                            <Text style={{ fontSize: responsiveFontSize(2), color: '#2D2D2D', fontFamily: 'DMSans-Bold', }}>Filter</Text>
                        </View>
                    </View>
                    <ScrollView style={{ marginBottom: responsiveHeight(0) }}>
                        <View style={{ borderTopColor: '#E3E3E3', borderTopWidth: 1, flexDirection: 'row' }}>
                            <View style={{ width: responsiveWidth(41), backgroundColor: '#FFF', borderRightColor: '#E3E3E3', borderRightWidth: 1 }}>
                                <TouchableOpacity onPress={() => setActiveTab('Experience')}>
                                    <View style={{ width: responsiveWidth(40), height: responsiveHeight(8), borderBottomColor: '#E3E3E3', backgroundColor: activeTab == 'Experience' ? '#EEF8FF' : '#fff', borderBottomWidth: 1, justifyContent: 'center', alignItems: 'center' }}>
                                        <Text style={{ color: '#444343', fontFamily: 'DMSans-SemiBold', fontSize: responsiveFontSize(2) }}>Experience</Text>
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setActiveTab('Type')}>
                                    <View style={{ width: responsiveWidth(40), height: responsiveHeight(8), borderBottomColor: '#E3E3E3', backgroundColor: activeTab == 'Type' ? '#EEF8FF' : '#fff', borderBottomWidth: 1, justifyContent: 'center', alignItems: 'center' }}>
                                        <Text style={{ color: '#444343', fontFamily: 'DMSans-SemiBold', fontSize: responsiveFontSize(2) }}>Type</Text>
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setActiveTab('Rating')}>
                                    <View style={{ width: responsiveWidth(40), height: responsiveHeight(8), borderBottomColor: '#E3E3E3', backgroundColor: activeTab == 'Rating' ? '#EEF8FF' : '#fff', borderBottomWidth: 1, justifyContent: 'center', alignItems: 'center' }}>
                                        <Text style={{ color: '#444343', fontFamily: 'DMSans-SemiBold', fontSize: responsiveFontSize(2) }}>Rating</Text>
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setActiveTab('Gender')}>
                                    <View style={{ width: responsiveWidth(40), height: responsiveHeight(8), borderBottomColor: '#E3E3E3', backgroundColor: activeTab == 'Gender' ? '#EEF8FF' : '#fff', borderBottomWidth: 1, justifyContent: 'center', alignItems: 'center' }}>
                                        <Text style={{ color: '#444343', fontFamily: 'DMSans-SemiBold', fontSize: responsiveFontSize(2) }}>Gender</Text>
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setActiveTab('Age')}>
                                    <View style={{ width: responsiveWidth(40), height: responsiveHeight(8), borderBottomColor: '#E3E3E3', backgroundColor: activeTab == 'Age' ? '#EEF8FF' : '#fff', borderBottomWidth: 1, justifyContent: 'center', alignItems: 'center' }}>
                                        <Text style={{ color: '#444343', fontFamily: 'DMSans-SemiBold', fontSize: responsiveFontSize(2) }}>Age</Text>
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setActiveTab('Qualification')}>
                                    <View style={{ width: responsiveWidth(40), height: responsiveHeight(8), borderBottomColor: '#E3E3E3', backgroundColor: activeTab == 'Qualification' ? '#EEF8FF' : '#fff', borderBottomWidth: 1, justifyContent: 'center', alignItems: 'center' }}>
                                        <Text style={{ color: '#444343', fontFamily: 'DMSans-SemiBold', fontSize: responsiveFontSize(2) }}>Qualification</Text>
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setActiveTab('Language')}>
                                    <View style={{ width: responsiveWidth(40), height: responsiveHeight(8), borderBottomColor: '#E3E3E3', backgroundColor: activeTab == 'Language' ? '#EEF8FF' : '#fff', borderBottomWidth: 1, justifyContent: 'center', alignItems: 'center' }}>
                                        <Text style={{ color: '#444343', fontFamily: 'DMSans-SemiBold', fontSize: responsiveFontSize(2) }}>Language</Text>
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setActiveTab('Rate')}>
                                    <View style={{ width: responsiveWidth(40), height: responsiveHeight(8), borderBottomColor: '#E3E3E3', backgroundColor: activeTab == 'Rate' ? '#EEF8FF' : '#fff', borderBottomWidth: 1, justifyContent: 'center', alignItems: 'center' }}>
                                        <Text style={{ color: '#444343', fontFamily: 'DMSans-SemiBold', fontSize: responsiveFontSize(2) }}>Rate</Text>
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setActiveTab('Availability')}>
                                    <View style={{ width: responsiveWidth(40), height: responsiveHeight(8), borderBottomColor: '#E3E3E3', backgroundColor: activeTab == 'Availability' ? '#EEF8FF' : '#fff', borderBottomWidth: 1, justifyContent: 'center', alignItems: 'center' }}>
                                        <Text style={{ color: '#444343', fontFamily: 'DMSans-SemiBold', fontSize: responsiveFontSize(2) }}>Availability</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                            <View style={{ padding: 20, width: responsiveWidth(59), }}>
                                {/* Experience */}
                                {activeTab == 'Experience' ?
                                    <View style={{}}>
                                        <SelectMultiple
                                            items={Experience}
                                            selectedItems={selectedExperience}
                                            onSelectionsChange={onSelectionsChangeExperience}
                                            rowStyle={styles.item}
                                        />
                                    </View>
                                    : activeTab == 'Type' ?
                                        <View style={{}}>
                                            <SelectMultiple
                                                items={dropdowndata}
                                                selectedItems={selectedType}
                                                onSelectionsChange={onSelectionsChangeType}
                                                rowStyle={styles.item}
                                            />
                                        </View>
                                        : activeTab == 'Rating' ?
                                            <View style={{}}>
                                                <SelectMultiple
                                                    items={Rating}
                                                    selectedItems={selectedRating}
                                                    onSelectionsChange={onSelectionsChangeRating}
                                                    rowStyle={styles.item}
                                                />
                                            </View>
                                            : activeTab == 'Gender' ?
                                                <View style={{}}>
                                                    <SelectMultiple
                                                        items={Gender}
                                                        selectedItems={selectedGender}
                                                        onSelectionsChange={onSelectionsChangeGender}
                                                        rowStyle={styles.item}
                                                    />
                                                </View>

                                                : activeTab == 'Age' ?
                                                    <View style={{}}>
                                                        <SelectMultiple
                                                            items={Ages}
                                                            selectedItems={selectedAge}
                                                            onSelectionsChange={onSelectionsChangeAge}
                                                            rowStyle={styles.item}
                                                        />
                                                    </View>
                                                    :
                                                    <></>
                                }
                            </View>
                        </View>
                    </ScrollView>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', bottom: 0, width: responsiveWidth(100), paddingHorizontal: 10, borderTopColor: '#E3E3E3', borderTopWidth: 1 }}>
                        <View style={{ width: responsiveWidth(45), marginTop: responsiveHeight(2) }}>
                            <CustomButton label={"Cancel"}
                                buttonColor={'gray'}
                                onPress={() => submitReview()}
                            />
                        </View>
                        <View style={{ width: responsiveWidth(45), marginTop: responsiveHeight(2) }}>
                            <CustomButton label={"Apply"}
                                onPress={() => submitReview()}
                            />
                        </View>
                    </View>
                </View>
                {/* </TouchableWithoutFeedback> */}
            </Modal>
        </SafeAreaView >
    )
}

export default FreeTherapistList

const styles = StyleSheet.create({
    Container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    wrapper: {
        padding: responsiveWidth(2),

    },
    filterSection: {
        marginBottom: responsiveHeight(0),
        marginTop: responsiveHeight(1),
        paddingHorizontal: responsiveWidth(3)
    },
    filterSection1st: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: responsiveHeight(2)
    },
    filterIconView: {
        width: responsiveWidth(20),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    filterIconText: {
        fontSize: responsiveFontSize(2),
        color: '#2D2D2D',
        fontFamily: 'DMSans-Bold',
    },
    totalValue: {
        width: responsiveWidth(90),
        //height: responsiveHeight(36),
        //alignItems: 'center',
        backgroundColor: '#fff',
        //justifyContent: 'center',
        padding: 10,
        borderRadius: 15,
        elevation: 5,
        margin: 2,
        marginBottom: responsiveHeight(2)
    },
    totalValue1stSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    profilePicSection: {
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: responsiveWidth(25),
    },
    profilePicStyle: {
        height: 100,
        width: 90,
        borderRadius: 15,
        resizeMode: 'contain',
        marginBottom: responsiveHeight(1)
    },
    starStyle: {
        marginHorizontal: responsiveWidth(0.5),
        marginBottom: responsiveHeight(1)
    },
    noOfReview: {
        fontSize: responsiveFontSize(1.7),
        color: '#746868',
        fontFamily: 'DMSans-Regular',
    },
    contentStyle: {
        flexDirection: 'column',
        width: responsiveWidth(47),
        //height: responsiveHeight(10)
    },
    contentStyleName: {
        fontSize: responsiveFontSize(2),
        color: '#2D2D2D',
        fontFamily: 'DMSans-Bold',
        marginBottom: responsiveHeight(1)
    },
    contentStyleQualification: {
        fontSize: responsiveFontSize(1.7),
        color: '#746868',
        fontFamily: 'DMSans-Medium',
        marginBottom: responsiveHeight(1)
    },
    contentStyleExp: {
        fontSize: responsiveFontSize(1.7),
        color: '#746868',
        fontFamily: 'DMSans-Regular',
        marginBottom: responsiveHeight(1)
    },
    contentStyleLang: {
        fontSize: responsiveFontSize(1.7),
        color: '#746868',
        fontFamily: 'DMSans-Medium',
        marginBottom: responsiveHeight(1)
    },
    contentStyleLangValue: {
        fontSize: responsiveFontSize(1.7),
        color: '#959595',
        fontFamily: 'DMSans-Regular',
    },
    contentStyleRate: {
        fontSize: responsiveFontSize(1.7),
        color: '#746868',
        fontFamily: 'DMSans-Medium',
        marginBottom: responsiveHeight(1),
        textDecorationLine: 'line-through', textDecorationStyle: 'solid'
    },
    contentStyleRateFree: {
        fontSize: responsiveFontSize(1.7),
        color: '#746868',
        fontFamily: 'DMSans-Bold',
        marginBottom: responsiveHeight(1),
    },
    contentStyleAvailableSlot: {
        fontSize: responsiveFontSize(1.5),
        color: '#444343',
        fontFamily: 'DMSans-Medium',
        marginBottom: responsiveHeight(1)
    },
    totalValue2ndSection: {
        marginTop: responsiveHeight(0),
        borderRadius: 10,
        padding: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    listButtonFirstSection: {
        width: responsiveWidth(18)
    },
    listButtonSecondSection: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        width: responsiveWidth(62)
    },
    iconView: {
        height: responsiveHeight(5),
        width: responsiveWidth(17),
        backgroundColor: '#FFF',
        borderColor: '#417AA4',
        borderWidth: 1,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center'
    },
    iconSize: {
        height: 25,
        width: 25
    },
    instantConnectView: {
        height: responsiveHeight(7),
        width: responsiveWidth(17),
        backgroundColor: '#EEF8FF',
        borderColor: '#417AA4',
        borderWidth: 1,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center'
    },
    instantConnectText: {
        color: '#566D7E',
        fontFamily: 'DMSans-Medium',
        fontSize: responsiveFontSize(1.7),
        textAlign: 'center'
    },
    totalValue3: {
        width: responsiveWidth(90),
        //height: responsiveHeight(36),
        //alignItems: 'center',
        backgroundColor: '#FFF',
        //justifyContent: 'center',
        padding: 15,
        borderRadius: 15,
        elevation: 5
    },
    item: {
        borderBottomWidth: 0
    },
    // dropdown
    dropdown: {
        //height: responsiveHeight(4),
        //borderColor: 'gray',
        //borderWidth: 0.7,
        //borderRadius: 8,
        //paddingHorizontal: 8,

    },
    placeholderStyle: {
        fontSize: responsiveFontSize(2),
        color: '#2D2D2D',
        fontFamily: 'DMSans-Bold'
    },
    selectedTextStyle: {
        fontSize: responsiveFontSize(2),
        color: '#2D2D2D',
        fontFamily: 'DMSans-Bold'
    },
    inputSearchStyle: {
        height: 40,
        fontSize: 16,
        color: '#2D2D2D',
        fontFamily: 'DMSans-Regular'
    },

});
