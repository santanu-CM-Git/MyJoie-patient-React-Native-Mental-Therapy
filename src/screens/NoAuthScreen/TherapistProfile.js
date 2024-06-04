import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, SafeAreaView, StyleSheet, ScrollView, StatusBar, Image, FlatList, TouchableOpacity, Animated, KeyboardAwareScrollView, useWindowDimensions, Switch, Alert } from 'react-native'
import CustomHeader from '../../components/CustomHeader'
import Feather from 'react-native-vector-icons/Feather';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions'
import { TextInput, LongPressGestureHandler, State } from 'react-native-gesture-handler'
import { bookmarkedFill, cameraColor, chatColor, checkedImg, dateIcon, deleteImg, editImg, filterImg, milkImg, phoneColor, phoneImg, searchImg, timeIcon, uncheckedImg, userPhoto, videoIcon, wallet, walletBlack, walletCredit } from '../../utils/Images'
import { API_URL } from '@env'
import axios from 'axios';
import AsyncStorage from "@react-native-async-storage/async-storage";
import Loader from '../../utils/Loader';
import moment from "moment"
import StarRating from 'react-native-star-rating';
import InputField from '../../components/InputField';
import CustomButton from '../../components/CustomButton';
import CheckBox from '@react-native-community/checkbox';

const items = [
    { id: 1, icon: chatColor },
    { id: 2, icon: phoneColor },
    { id: 3, icon: cameraColor },
];
const TherapistProfile = ({ navigation, route }) => {

    const [allReview, setAllreview] = React.useState([])
    const [profileDetails, setProfileDetails] = useState([])
    const [therapistAvailability, setTherapistAvailability] = useState([])
    const [selectedDate, setSelectedDate] = useState('')
    const [selectedByUser, setSelectedByUser] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [starCount, setStarCount] = useState(4)
    const [address, setaddress] = useState('');
    const [addressError, setaddressError] = useState('')
    const [isEnabled, setIsEnabled] = useState(false);
    const toggleSwitch = () => setIsEnabled(previousState => !previousState);
    const [toggleCheckBox, setToggleCheckBox] = useState(false)
    const [selectedDay, setSelectedDay] = useState(null);
    const [selectedItem, setSelectedItem] = useState(1);

    const getNextSevenDays = () => {
        const days = [];
        for (let i = 0; i < 7; i++) {
            days.push(moment().add(i, 'days'));
        }
        return days;
    };

    const nextSevenDays = getNextSevenDays();

    const selectedDateChange = (index, day, date) => {
        console.log(index)
        setSelectedDay(index)
        setSelectedDate(date)
        setIsLoading(true);
        // console.log(day, 'day');
        // console.log(date, 'date');
        // console.log(profileDetails?.id, 'therapist_id');
        // console.log('paid', 'paid')
        var givendate = '';
        if (day == 'Monday') {
            givendate = 'monday'
        } else if (day == 'Tuesday') {
            givenday = 'tuesday'
        } else if (day == 'Wednesday') {
            givenday = 'wednessday'
        } else if (day == 'Thursday') {
            givenday = 'thursday'
        } else if (day == 'Friday') {
            givenday = 'friday'
        } else if (day == 'Saturday') {
            givenday = 'saturday'
        } else if (day == 'Sunday') {
            givenday = 'sunday'
        }
        const option = {
            "day": givenday,
            "date": date,
            "therapist_id": profileDetails?.id,
            "booking_type": "paid"
        }
        console.log(option)
        AsyncStorage.getItem('userToken', (err, usertoken) => {
            axios.post(`${API_URL}/patient/therapist-date-slots`, option, {
                headers: {
                    'Accept': 'application/json',
                    "Authorization": 'Bearer ' + usertoken,
                    //'Content-Type': 'multipart/form-data',
                },
            })
                .then(res => {
                    console.log(JSON.stringify(res.data.data), 'fetch all therapist availibility')
                    if (res.data.response == true) {
                        setTherapistAvailability(res.data.data);
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

    const handleSlotSelect = (slot) => {
        setSelectedByUser((prevSelected) => {
            if (prevSelected.includes(slot)) {
                // Deselect if already selected
                return prevSelected.filter(selectedSlot => selectedSlot !== slot);
            } else {
                // Select the slot
                return [...prevSelected, slot];
            }
        });
    };


    useEffect(() => {
        console.log(route?.params?.detailsData, 'vvvvvvv')
        setProfileDetails(route?.params?.detailsData)
        const formattedDate = moment().format('YYYY-MM-DD');
        const dayOfWeek = moment().format('dddd');
        const index = 0;
        console.log(formattedDate);
        console.log(dayOfWeek)
        selectedDateChange(index, dayOfWeek, formattedDate)
        getAllReviewForTherapist()
    }, [])

    const getAllReviewForTherapist = () => {
        const option = {
            "user_id": route?.params?.detailsData.id
        }
        console.log(option)
        AsyncStorage.getItem('userToken', (err, usertoken) => {
            axios.post(`${API_URL}/patient/reviews`, option, {
                headers: {
                    'Accept': 'application/json',
                    "Authorization": 'Bearer ' + usertoken,
                    //'Content-Type': 'multipart/form-data',
                },
            })
                .then(res => {
                    console.log(JSON.stringify(res.data.data), 'fetch all reviews')
                    if (res.data.response == true) {
                        setAllreview(res.data.data);
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
                    console.log(`all reviews error ${e}`)
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

    const submitForm = () => {
        console.log(selectedByUser.length)
        const ids = selectedByUser.flatMap(item => [item.id1.toString(), item.id2.toString()]);
        var mode = ''
        if (selectedItem == 1) {
            mode = "chat"
        } else if (selectedItem == 2) {
            mode = "audio"
        } else if (selectedItem == 3) {
            mode = "video"
        }
        var prescription_checked = ''
        if (toggleCheckBox) {
            prescription_checked = 'yes'
        } else {
            prescription_checked = 'no'
        }
        const totalAmount = selectedByUser.length * profileDetails?.rate

        console.log(profileDetails?.id, "therapist_id")
        console.log(ids, 'slot_ids')
        console.log(selectedDate, 'date')
        console.log('purpose', 'purpose')
        console.log(mode, 'mode_of_conversation')
        console.log("online", 'payment_mode')
        console.log("Razorpay", "gateway_name")
        console.log(prescription_checked, "prescription_checked")
        console.log(totalAmount, 'transaction_amount')




    }

    if (isLoading) {
        return (
            <Loader />
        )
    }



    return (
        <SafeAreaView style={styles.Container}>
            <CustomHeader commingFrom={'Therapist'} onPress={() => navigation.goBack()} title={'Therapist'} />
            <ScrollView style={styles.wrapper}>
                <View style={{ alignSelf: 'center', marginTop: responsiveHeight(2) }}>

                    <View style={styles.totalValue}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', }}>
                            <View style={{ flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', width: responsiveWidth(25), }}>
                                <Image
                                    source={{ uri: profileDetails?.user?.profile_pic }}
                                    style={{ height: 100, width: 90, borderRadius: 15, resizeMode: 'contain', marginBottom: responsiveHeight(1) }}
                                />
                                <StarRating
                                    disabled={true}
                                    maxStars={5}
                                    rating={profileDetails?.display_rating}
                                    selectedStar={(rating) => setStarCount(rating)}
                                    fullStarColor={'#FFCB45'}
                                    starSize={12}
                                    starStyle={{ marginHorizontal: responsiveWidth(0.5), marginBottom: responsiveHeight(1) }}
                                />
                                <Text style={{ fontSize: responsiveFontSize(1.7), color: '#746868', fontFamily: 'DMSans-Regular', }}>100+ Reviews</Text>
                            </View>
                            <View style={{ flexDirection: 'column', width: responsiveWidth(47), height: responsiveHeight(10) }}>
                                <Text style={{ fontSize: responsiveFontSize(2), color: '#2D2D2D', fontFamily: 'DMSans-Bold', marginBottom: responsiveHeight(1) }}>{profileDetails?.user?.name}</Text>
                                <Text style={{ fontSize: responsiveFontSize(1.7), color: '#746868', fontFamily: 'DMSans-Medium', marginBottom: responsiveHeight(1) }}>{profileDetails?.qualification_list}</Text>
                                <Text style={{ fontSize: responsiveFontSize(1.7), color: '#746868', fontFamily: 'DMSans-Regular', marginBottom: responsiveHeight(1) }}>{profileDetails?.experience} Year Experience</Text>
                                <Text style={{ fontSize: responsiveFontSize(1.7), color: '#746868', fontFamily: 'DMSans-Medium', marginBottom: responsiveHeight(1) }}>Language : <Text style={{ fontSize: responsiveFontSize(1.7), color: '#959595', fontFamily: 'DMSans-Regular', }}>{profileDetails?.languages_list}</Text></Text>
                            </View>
                            <View style={{ width: responsiveWidth(6), }}>
                                <Image
                                    source={bookmarkedFill}
                                    style={{ height: 25, width: 25 }}
                                />
                            </View>
                        </View>
                        <View style={{ height: responsiveHeight(5), width: responsiveWidth(85), marginTop: responsiveHeight(2), backgroundColor: '#F4F5F5', borderRadius: 10, padding: 5, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                                <Text style={{ color: '#444343', fontFamily: 'DMSans-Medium', fontSize: responsiveFontSize(1.5) }}>₹{profileDetails?.rate} for 30 Min Booking</Text>
                            </View>
                            <View style={{ height: '80%', width: 1, backgroundColor: '#E3E3E3', marginLeft: 5, marginRight: 5 }} />
                            <View style={{ flexDirection: 'row', alignItems: 'center', width: responsiveWidth(35) }}>

                                <Text style={{ color: '#444343', fontFamily: 'DMSans-Medium', fontSize: responsiveFontSize(1.5) }}>Session Done - 5000</Text>
                            </View>
                        </View>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: responsiveHeight(2), marginTop: responsiveHeight(2) }}>
                        <Text style={{ fontSize: responsiveFontSize(2), color: '#2D2D2D', fontFamily: 'DMSans-Bold', }}>Select Date</Text>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            {/* <Text style={{ fontSize: responsiveFontSize(1.7), color: '#746868', fontFamily: 'DMSans-Regular', }}>View Full Calender</Text> */}
                        </View>
                    </View>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ padding: responsiveWidth(2), }}>
                    {/* <View style={{ flexDirection: 'row', alignItems: 'center' }}>
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
                    </View> */}
                    <View style={styles.dateView}>
                        {nextSevenDays.map((day, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.dayContainer,
                                    selectedDay === index ? styles.selectedDay : styles.defaultDay,
                                ]}
                                onPress={() => selectedDateChange(index, day.format('dddd'), day.format('YYYY-MM-DD'))}
                            >
                                <Text style={styles.weekDay}>
                                    {day.format('ddd')}
                                </Text>
                                <Text style={styles.date}>
                                    {day.format('D')}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>
                <View style={{ padding: responsiveWidth(2), alignSelf: 'center' }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: responsiveHeight(2), marginTop: responsiveHeight(2) }}>
                        <Text style={{ fontSize: responsiveFontSize(2), color: '#2D2D2D', fontFamily: 'DMSans-Bold', }}>Select Time</Text>
                    </View>
                    <View style={{ height: responsiveHeight(8), width: responsiveWidth(90), backgroundColor: '#33D1C3', borderRadius: 15, justifyContent: 'center', padding: 10 }}>
                        <Text style={{ color: '#FFF', fontFamily: 'DMSans-Medium', fontSize: responsiveFontSize(2) }}>We recommend booking one hour (two continuous slots)</Text>
                    </View>
                    <View style={{ width: responsiveWidth(90), marginTop: responsiveHeight(2), flexDirection: 'row', flexWrap: 'wrap' }}>
                        {therapistAvailability.length === 0 ? (
                            <View style={{ height: responsiveHeight(5), width: responsiveWidth(90), padding: 10, backgroundColor: '#FFFFFF', borderColor: '#E1293B', borderWidth: 1, justifyContent: 'center', alignItems: 'center', borderRadius: 20, marginRight: 10, marginBottom: 10, alignSelf: 'center' }}>
                                <Text style={{ color: '#E1293B', fontFamily: 'DMSans-Bold', fontSize: responsiveFontSize(1.7) }}>No slots available for this date</Text>
                            </View>
                        ) : (
                            therapistAvailability.map((slot, index) => {
                                const isSelected = selectedByUser.includes(slot);

                                return (
                                    <TouchableOpacity
                                        key={index}
                                        onPress={() => handleSlotSelect(slot)}
                                        style={{
                                            height: responsiveHeight(5),
                                            padding: 10,
                                            backgroundColor: isSelected ? '#ECFCFA' : '#EAECF0', // Change background color if selected
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            borderRadius: 20,
                                            marginRight: 10,
                                            marginBottom: 10,
                                            borderColor: isSelected ? '#87ADA8' : '#EAECF0',
                                            borderWidth: 1,
                                        }}
                                    >
                                        <Text style={{ color: '#2D2D2D', fontFamily: 'DMSans-Bold', fontSize: responsiveFontSize(1.7) }}>
                                            {moment(slot.slot_start_time, 'HH:mm:ss').format('h:mm A')} - {moment(slot.slot_end_time, 'HH:mm:ss').format('h:mm A')}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })
                        )}
                    </View>
                </View>
                {/* <View style={{ padding: responsiveWidth(2), alignSelf: 'center' }}>
                    <View style={styles.totalValue}>
                        <Text style={{ color: '#2D2D2D', fontFamily: 'DMSans-Bold', fontSize: responsiveFontSize(1.7) }}>Appointment Time :</Text>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: responsiveHeight(2) }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', width: responsiveWidth(35) }}>
                                <Image
                                    source={dateIcon}
                                    style={{ height: 20, width: 20, resizeMode: 'contain', marginRight: responsiveWidth(2) }}
                                />
                                <Text style={{ color: '#444343', fontFamily: 'DMSans-SemiBold', fontSize: responsiveFontSize(1.5) }}>Monday, 26 April</Text>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', width: responsiveWidth(35) }}>
                                <Image
                                    source={timeIcon}
                                    style={{ height: 20, width: 20, resizeMode: 'contain', marginRight: responsiveWidth(2) }}
                                />
                                <Text style={{ color: '#444343', fontFamily: 'DMSans-SemiBold', fontSize: responsiveFontSize(1.5) }}>09:00 PM</Text>
                            </View>
                        </View>
                    </View>
                </View> */}
                <View style={{ padding: responsiveWidth(2), alignSelf: 'center' }}>
                    <View style={styles.totalValue}>
                        <Text style={{ color: '#2D2D2D', fontFamily: 'DMSans-Bold', fontSize: responsiveFontSize(1.7) }}>Select Mode</Text>
                        {/* <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: responsiveHeight(2) }}>
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
                        </View> */}
                        <View style={styles.modeContainer}>
                            {items.map(item => (
                                <TouchableOpacity
                                    key={item.id}
                                    style={[
                                        styles.itemContainer,
                                        selectedItem === item.id ? styles.selectedItem : styles.defaultItem,
                                    ]}
                                    onPress={() => setSelectedItem(item.id)}
                                >
                                    <Image
                                        source={selectedItem === item.id ? checkedImg : uncheckedImg}
                                        style={styles.checkIcon}
                                    />
                                    <Image
                                        source={item.icon}
                                        style={styles.icon}
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>
                <View style={{ padding: responsiveWidth(2), flexDirection: 'row', width: responsiveWidth(90) }}>
                    <CheckBox
                        disabled={false}
                        value={toggleCheckBox}
                        onValueChange={(newValue) => setToggleCheckBox(newValue)}
                    />
                    <Text style={{ color: '#746868', fontFamily: 'DMSans-Regular', fontSize: responsiveFontSize(1.7) }}>I give my consent to the app and therapists to access my past medical history available on the platform </Text>
                </View>
                <View style={{ padding: responsiveWidth(3), }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', }}>
                        <Text style={{ fontSize: responsiveFontSize(2), color: '#2D2D2D', fontFamily: 'DMSans-Bold', }}>Reviews</Text>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={{ fontSize: responsiveFontSize(1.7), color: '#746868', fontFamily: 'DMSans-Regular', }}>See All</Text>
                        </View>
                    </View>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={{ flexDirection: 'row', marginBottom: responsiveHeight(2) }}>
                        <View style={{ padding: 20, width: responsiveWidth(80), backgroundColor: '#FFF', marginHorizontal: 15, borderRadius: 20, marginTop: responsiveHeight(3), elevation: 5 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Image
                                    source={userPhoto}
                                    style={{ height: 50, width: 50, borderRadius: 25 }}
                                />
                                <View style={{ flexDirection: 'column', marginLeft: responsiveWidth(3) }}>
                                    <Text style={{ color: '#2D2D2D', fontSize: responsiveFontSize(2), fontFamily: 'DMSans-Bold', marginBottom: 5, }}>Jalal Ahmed</Text>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: responsiveWidth(65) }}>
                                        <Text style={{ color: '#746868', fontFamily: 'DMSans-Regular', marginRight: 5, fontSize: responsiveFontSize(1.5) }}>Jun 1,2023</Text>
                                    </View>
                                </View>
                            </View>
                            <View style={{ width: responsiveWidth(25), marginTop: responsiveHeight(2), marginBottom: responsiveHeight(2) }}>
                                <StarRating
                                    disabled={true}
                                    maxStars={5}
                                    rating={starCount}
                                    selectedStar={(rating) => setStarCount(rating)}
                                    fullStarColor={'#FFCB45'}
                                    starSize={15}
                                    starStyle={{ marginHorizontal: responsiveWidth(1) }}
                                />
                            </View>
                            <Text style={{ color: '#746868', fontFamily: 'DMSans-Regular', fontSize: responsiveFontSize(1.7) }}>Reliable and trustworthy. They have earned my trust and loyalty. This company has consistently demonstrated reliability and trustworthiness.</Text>
                        </View>
                        <View style={{ padding: 20, width: responsiveWidth(80), backgroundColor: '#FFF', marginHorizontal: 15, borderRadius: 20, marginTop: responsiveHeight(3), elevation: 5 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Image
                                    source={userPhoto}
                                    style={{ height: 50, width: 50, borderRadius: 25 }}
                                />
                                <View style={{ flexDirection: 'column', marginLeft: responsiveWidth(3) }}>
                                    <Text style={{ color: '#2D2D2D', fontSize: responsiveFontSize(2), fontFamily: 'DMSans-Bold', marginBottom: 5, }}>Jalal Ahmed</Text>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: responsiveWidth(65) }}>
                                        <Text style={{ color: '#746868', fontFamily: 'DMSans-Regular', marginRight: 5, fontSize: responsiveFontSize(1.5) }}>Jun 1,2023</Text>
                                    </View>
                                </View>
                            </View>
                            <View style={{ width: responsiveWidth(25), marginTop: responsiveHeight(2), marginBottom: responsiveHeight(2) }}>
                                <StarRating
                                    disabled={true}
                                    maxStars={5}
                                    rating={starCount}
                                    selectedStar={(rating) => setStarCount(rating)}
                                    fullStarColor={'#FFCB45'}
                                    starSize={15}
                                    starStyle={{ marginHorizontal: responsiveWidth(1) }}
                                />
                            </View>
                            <Text style={{ color: '#746868', fontFamily: 'DMSans-Regular', fontSize: responsiveFontSize(1.7) }}>Reliable and trustworthy. They have earned my trust and loyalty. This company has consistently demonstrated reliability and trustworthiness.</Text>
                        </View>
                    </View>
                </ScrollView>
                <View style={{ width: responsiveWidth(90), alignSelf: 'center' }}>
                    <CustomButton label={"Book Appointment"}
                        // onPress={() => { login() }}
                        onPress={() => { submitForm() }}
                    />
                </View>
            </ScrollView>

        </SafeAreaView >
    )
}

export default TherapistProfile

const styles = StyleSheet.create({
    Container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    wrapper: {
        padding: responsiveWidth(1),

    },
    totalValue: {
        width: responsiveWidth(90),
        //height: responsiveHeight(36),
        //alignItems: 'center',
        backgroundColor: '#FFF',
        //justifyContent: 'center',
        padding: 10,
        borderRadius: 15,
        elevation: 5
    },
    switchStyle: {
        transform: [{ scaleX: 1.3 }, { scaleY: 1.3 }]  // Adjust scale values as needed
    },
    totalValue2: {
        width: responsiveWidth(89),
        //height: responsiveHeight(28),
        backgroundColor: '#fff',
        borderRadius: 15,
        borderColor: '#E3E3E3',
        borderWidth: 1,
        marginTop: responsiveHeight(2),
        alignSelf: 'center'
    },
    buttonwrapper: {
        paddingHorizontal: 25,
        bottom: 5,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopColor: '#E3E3E3',
        borderTopWidth: 1,
        paddingTop: 5,
        position: 'absolute',
        width: responsiveWidth(100)
    },
    //date loop
    dateView: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dayContainer: {
        height: responsiveHeight(10),
        width: responsiveWidth(14),
        borderRadius: 30,
        marginRight: responsiveWidth(3),
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
    },
    selectedDay: {
        backgroundColor: '#ECFCFA',
        borderColor: '#87ADA8',
        borderWidth: 1,
    },
    defaultDay: {
        backgroundColor: '#EEE',
    },
    weekDay: {
        color: '#746868',
        fontSize: responsiveFontSize(1.8),
        fontFamily: 'DMSans-Regular',
    },
    date: {
        color: '#2D2D2D',
        fontSize: responsiveFontSize(2.3),
        fontFamily: 'DMSans-Bold',
    },
    // mode loop
    modeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: responsiveHeight(2),
    },
    itemContainer: {
        height: responsiveHeight(11),
        width: responsiveWidth(25),
        borderColor: '#87ADA8',
        borderWidth: 1,
        borderRadius: 10,
        padding: 5,
    },
    selectedItem: {
        backgroundColor: '#ECFCFA',
    },
    defaultItem: {
        backgroundColor: '#FFF',
    },
    checkIcon: {
        height: 25,
        width: 25,
        resizeMode: 'contain',
        alignSelf: 'flex-end',
    },
    icon: {
        height: 30,
        width: 30,
        resizeMode: 'contain',
        alignSelf: 'center',
    },

});
