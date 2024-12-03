import React, { useState, useMemo, useEffect, useContext } from 'react';
import { View, Text, SafeAreaView, StyleSheet, ScrollView, BackHandler, Image, FlatList,RefreshControl, TouchableOpacity, Animated, Platform, Alert, Linking } from 'react-native'
import CustomHeader from '../../components/CustomHeader'
import Feather from 'react-native-vector-icons/Feather';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions'
import { TextInput, LongPressGestureHandler, State } from 'react-native-gesture-handler'
import { bookmarkedFill, bookmarkedNotFill, cameraColor, chatColor, checkedImg, phoneColor, uncheckedImg, } from '../../utils/Images'
import { API_URL, } from '@env'
import axios from 'axios';
import AsyncStorage from "@react-native-async-storage/async-storage";
import Loader from '../../utils/Loader';
import moment from "moment"
import StarRating from 'react-native-star-rating';
import InputField from '../../components/InputField';
import CustomButton from '../../components/CustomButton';
import CheckBox from '@react-native-community/checkbox';
import Toast from 'react-native-toast-message';
import { AuthContext } from '../../context/AuthContext';
import { requestPermissions, setupNotificationHandlers } from '../../utils/NotificationService';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

const items = [
    { id: 1, icon: chatColor },
    { id: 2, icon: phoneColor },
    { id: 3, icon: cameraColor },
];
const TherapistProfile = ({ navigation, route }) => {

    const { logout } = useContext(AuthContext);
    const [refreshing, setRefreshing] = useState(false);
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
    const [toggleCheckBox, setToggleCheckBox] = useState(true)
    const [selectedDay, setSelectedDay] = useState(null);
    const [selectedItem, setSelectedItem] = useState(3);
    const [permissionError, setPermissionError] = useState('');

    const getNextSevenDays = () => {
        const days = [];
        for (let i = 0; i < 7; i++) {
            days.push(moment().add(i, 'days'));
        }
        return days;
    };

    const nextSevenDays = getNextSevenDays();

    const selectedDateChange = (index, day, date) => {
        //console.log(index, day, date);
        setSelectedDay(index);
        setSelectedDate(date);
        setIsLoading(true);

        let givendate = '';
        switch (day) {
            case 'Monday':
                givendate = 'monday';
                break;
            case 'Tuesday':
                givendate = 'tuesday';
                break;
            case 'Wednesday':
                givendate = 'wednessday';
                break;
            case 'Thursday':
                givendate = 'thursday';
                break;
            case 'Friday':
                givendate = 'friday';
                break;
            case 'Saturday':
                givendate = 'saturday';
                break;
            case 'Sunday':
                givendate = 'sunday';
                break;
            default:
                givendate = '';
        }

        const option = {
            "day": givendate,
            "date": date,
            "therapist_id": route?.params?.therapistId,
            "booking_type": route?.params?.mode
        };
        //console.log(option);

        AsyncStorage.getItem('userToken', (err, usertoken) => {
            axios.post(`${API_URL}/patient/therapist-date-slots`, option, {
                headers: {
                    'Accept': 'application/json',
                    "Authorization": 'Bearer ' + usertoken,
                    //'Content-Type': 'multipart/form-data',
                },
            })
                .then(res => {
                    //console.log(JSON.stringify(res.data.data), 'fetch all therapist availability');
                    if (res.data.response == true) {
                        const currentTime = moment();
                        const filteredData = res.data.data.filter(slot => {
                            const slotStartTime = moment(date + ' ' + slot.slot_start_time, 'YYYY-MM-DD HH:mm:ss');
                            return slotStartTime.isSameOrAfter(currentTime);
                        });
                        setTherapistAvailability(filteredData);
                        setIsLoading(false);
                    } else {
                        console.log('not okk');
                        setIsLoading(false);
                        Alert.alert('Oops..', "Something went wrong", [
                            { text: 'OK', onPress: () => console.log('OK Pressed') },
                        ]);
                    }
                })
                .catch(e => {
                    setIsLoading(false);
                    console.log(`Available slot error ${e}`);
                    console.log(e.response);
                    Alert.alert('Oops..', e.response?.data?.message, [
                        { text: 'OK', onPress: () => console.log('OK Pressed') },
                    ]);
                });
        });
    };

    const handleSlotSelect = (slot) => {
        //console.log(slot, 'selected slot data');
        if (slot.booked_status === 0) {
            setSelectedByUser((prevSelected) => {
                const slotIndex = therapistAvailability.indexOf(slot);

                if (prevSelected.includes(slot)) {
                    // Deselect if already selected
                    return prevSelected.filter(selectedSlot => selectedSlot !== slot);
                } else {
                    // Check if the new selection is continuous with the previous selections
                    const lastSelectedIndex = therapistAvailability.indexOf(prevSelected[prevSelected.length - 1]);

                    if (prevSelected.length === 0 || Math.abs(lastSelectedIndex - slotIndex) === 1) {
                        // Select the slot if it's the first selection or if it's continuous
                        return [...prevSelected, slot];
                    } else {
                        // Show alert if the new selection is not continuous
                        Alert.alert('Selection Error', 'You can only select continuous slots in one booking, if you want to book non continuous slots then you can do that with two different bookings.');
                        return prevSelected;
                    }
                }
            });
        }
    };

    const fetchTherapistData = (therapistId) => {
        setIsLoading(true);
        AsyncStorage.getItem('userToken', (err, usertoken) => {
            const option = {
                "therapist_id": therapistId
            }
            //console.log(option)
            axios.post(`${API_URL}/patient/therapist`, option, {
                headers: {
                    'Accept': 'application/json',
                    "Authorization": 'Bearer ' + usertoken,
                    //'Content-Type': 'multipart/form-data',
                },
            })
                .then(res => {
                    //console.log(JSON.stringify(res.data.data), 'response from therapist data')
                    if (res.data.response == true) {
                        setProfileDetails(res.data.data[0])
                        setIsLoading(false);
                    } else {
                        console.log('not okk')
                        setIsLoading(false)
                        Alert.alert('Oops..', "Something went wrong", [
                            { text: 'OK', onPress: () => console.log('OK Pressed') },
                        ]);
                    }
                })
                .catch(e => {
                    setIsLoading(false)
                    console.log(`fetch therapist data error ${e}`)
                    console.log(e.response)
                    Alert.alert('Oops..', e.response?.data?.message, [
                        { text: 'OK', onPress: () => e.response?.data?.message == 'Unauthorized' ? logout() : console.log('OK Pressed') },
                    ]);
                });

        });
    }

    const handleBackButton = () => {
        // Custom logic to handle the back button
        if (route?.params?.mode == 'paid') {
            console.log('hello paid')
            navigation.navigate('Talk', { screen: 'TherapistList' })
        } else {
            console.log('hi free')
            navigation.navigate('HOME', { screen: 'FreeTherapistList' })
        }

        return true; // Returning true indicates that the back press is handled
    };

    useEffect(() => {
        // Add the event listener
        BackHandler.addEventListener('hardwareBackPress', handleBackButton);
        // Remove the event listener on cleanup
        return () => {
            BackHandler.removeEventListener('hardwareBackPress', handleBackButton);
        };
    }, []);


    useEffect(() => {
        //requestPermissions()
        const { therapistId, mode } = route.params;
        // console.log(route?.params?.detailsData, 'vvvvvvv')
        // setProfileDetails(route?.params?.detailsData)
        fetchTherapistData(therapistId)
        const formattedDate = moment().format('YYYY-MM-DD');
        const dayOfWeek = moment().format('dddd');
        const index = 0;
        //console.log(formattedDate);
        //console.log(dayOfWeek)
        selectedDateChange(index, dayOfWeek, formattedDate)
        //getAllReviewForTherapist()
        setSelectedByUser([])
    }, [route.params])

    const getAllReviewForTherapist = () => {
        const option = {
            "user_id": route?.params?.therapistId
        }
        //console.log(option)
        AsyncStorage.getItem('userToken', (err, usertoken) => {
            axios.post(`${API_URL}/patient/reviews`, option, {
                headers: {
                    'Accept': 'application/json',
                    "Authorization": 'Bearer ' + usertoken,
                    //'Content-Type': 'multipart/form-data',
                },
            })
                .then(res => {
                    //console.log(JSON.stringify(res.data.data), 'fetch all reviews')
                    if (res.data.response == true) {
                        setAllreview(res.data.data);
                        //setIsLoading(false);

                    } else {
                        //console.log('not okk')
                        setIsLoading(false)
                        Alert.alert('Oops..', "Something went wrong", [
                            { text: 'OK', onPress: () => console.log('OK Pressed') },
                        ]);
                    }
                })
                .catch(e => {
                    setIsLoading(false)
                    console.log(`all reviews error ${e}`)
                    console.log(e.response)
                    Alert.alert('Oops..', e.response?.data?.message, [
                        { text: 'OK', onPress: () => console.log('OK Pressed') },
                    ]);
                });
        });
    }

    const generateUniqueOrderId = () => {
        const timestamp = Date.now(); // Current timestamp in milliseconds
        const randomNum = Math.floor(Math.random() * 100000); // Random number between 0 and 99999
        return `ORD-${timestamp}-${randomNum}`;
    }

    const openSettings = () => {
        Linking.openSettings();
    };

    const checkAndRequestPermissions = async () => {
        try {
            // Notification permission check for iOS and Android 13+
            let notificationGranted = true;

            if (Platform.OS === 'ios') {
                const notificationStatus = await check(PERMISSIONS.IOS.POST_NOTIFICATIONS);
                if (notificationStatus !== RESULTS.GRANTED) {
                    const notificationRequest = await request(PERMISSIONS.IOS.POST_NOTIFICATIONS);
                    notificationGranted = notificationRequest === RESULTS.GRANTED;
                }
            } else if (Platform.OS === 'android' && Platform.Version >= 33) {
                const notificationStatus = await check(PERMISSIONS.ANDROID.POST_NOTIFICATIONS);
                if (notificationStatus !== RESULTS.GRANTED) {
                    const notificationRequest = await request(PERMISSIONS.ANDROID.POST_NOTIFICATIONS);
                    notificationGranted = notificationRequest === RESULTS.GRANTED;
                }
            }

            // Audio and Camera permissions
            const audioPermission = Platform.select({
                android: PERMISSIONS.ANDROID.RECORD_AUDIO,
                ios: PERMISSIONS.IOS.MICROPHONE,
            });

            const cameraPermission = Platform.select({
                android: PERMISSIONS.ANDROID.CAMERA,
                ios: PERMISSIONS.IOS.CAMERA,
            });

            const audioStatus = await check(audioPermission);
            const cameraStatus = await check(cameraPermission);

            let audioGranted = audioStatus === RESULTS.GRANTED;
            let cameraGranted = cameraStatus === RESULTS.GRANTED;

            if (!audioGranted) {
                const audioRequest = await request(audioPermission);
                audioGranted = audioRequest === RESULTS.GRANTED;
            }

            if (!cameraGranted) {
                const cameraRequest = await request(cameraPermission);
                cameraGranted = cameraRequest === RESULTS.GRANTED;
            }
            console.log(notificationGranted, 'notificationGranted')
            console.log(audioGranted, 'audioGranted')
            console.log(cameraGranted, 'cameraGranted')

            // Check if all permissions are granted
            //if (notificationGranted && audioGranted && cameraGranted) {
            if ((Platform.OS === 'ios' || notificationGranted) && audioGranted && cameraGranted) {
                // All permissions granted, run the button functionality
                console.log('All permissions granted. Running button functionality...');
                // Add your button functionality here
                isBlockedByAdminCheck()
            } else {
                // If any permission is missing, show an alert
                Alert.alert(
                    'Permissions Required',
                    'We need your permission to send notifications for important updates and reminders, as well as access to your camera and microphone for video and audio consultations.',
                    [{
                        text: 'Cancel',
                        onPress: () => console.log('Cancel Pressed'),
                        style: 'cancel',
                    },
                    { text: 'OK', onPress: openSettings },
                    ]
                );
            }
        } catch (error) {
            console.error('Permission error:', error);
        }
    };

    const isBlockedByAdminCheck = () => {
        if (selectedByUser.length === 0) {
            Alert.alert('Oops..', 'You need to select at least one slot.', [
                { text: 'OK', onPress: () => console.log('OK Pressed') },
            ]);
        } else if (selectedByUser.length > 4) {
            Alert.alert('Oops..', 'You can select a maximum of 4 slots.', [
                { text: 'OK', onPress: () => console.log('OK Pressed') },
            ]);
        } else {
            let ids = [];
            let mode = '';

            if (route?.params?.mode === 'paid') {
                ids = selectedByUser.flatMap(item => [item.id1.toString(), item.id2.toString()]);
                mode = 'paid'
            } else {
                ids = selectedByUser.flatMap(item => [item.id.toString()]);
                mode = 'free'
            }
            const option = {
                "therapist_id": profileDetails?.user_id,
                "slot_ids": JSON.stringify(ids),
                "date": selectedDate,
                "booking_type": mode
            }
            AsyncStorage.getItem('userToken', (err, usertoken) => {
                axios.post(`${API_URL}/patient/slot-book-checking`, option, {
                    headers: {
                        Accept: 'application/json',
                        "Authorization": `Bearer ${usertoken}`,
                    },
                })
                    .then(res => {
                        //console.log(JSON.stringify(res.data.data), 'submit form response')
                        if (res.data.response == true) {
                            setIsLoading(false)
                            submitForm()
                        } else {
                            //console.log('not okk')
                            setIsLoading(false)
                            Alert.alert('Oops..', res?.data?.message || "Something went wrong", [
                                { text: 'OK', onPress: () => console.log('OK Pressed') },
                            ]);
                        }
                    })
                    .catch(e => {
                        setIsLoading(false)
                        console.log(`slot booking checking error ${e}`)
                        console.log(e.response)
                        Alert.alert('Oops..', e.response?.data?.message, [
                            { text: 'OK', onPress: () => e.response?.data?.message == 'Unauthorized' ? logout() : console.log('OK Pressed') },
                        ]);
                    });
            });
        }
    }

    const submitForm = () => {
        //console.log(selectedByUser.length, 'no of selected slot')
        //console.log(profileDetails?.rate, 'rate of the therapist')
        //console.log(route?.params?.mode, 'type')
        if (toggleCheckBox === true) {
            setPermissionError('')
            if (selectedByUser.length === 0) {
                Alert.alert('Oops..', 'You need to select at least one slot.', [
                    { text: 'OK', onPress: () => console.log('OK Pressed') },
                ]);
            } else if (selectedByUser.length > 4) {
                Alert.alert('Oops..', 'You can select a maximum of 4 slots.', [
                    { text: 'OK', onPress: () => console.log('OK Pressed') },
                ]);
            } else {
                if (route?.params?.mode === 'paid') {
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
                    const totalAmount = (selectedByUser.length * profileDetails?.rate)

                    // console.log(profileDetails?.user_id, "therapist_id")
                    // console.log(ids, 'slot_ids')
                    // console.log(selectedDate, 'date')
                    // console.log('purpose', 'purpose')
                    // console.log(mode, 'mode_of_conversation')
                    // console.log("online", 'payment_mode')
                    // console.log("Razorpay", "gateway_name")
                    // console.log(prescription_checked, "prescription_checked")
                    // console.log(totalAmount, 'transaction_amount')
                   
                    const option = {
                        "therapist_id": profileDetails?.user_id,
                        "slot_ids": JSON.stringify(ids),
                        "date": selectedDate,
                        "purpose": 'purpose',
                        "mode_of_conversation": mode,
                        "payment_mode": 'online',
                        "gateway_name": 'Payment From Razorpay',
                        "prescription_checked": prescription_checked,
                        "transaction_amount": totalAmount,
                        "payment_status": 'paid',
                        "order_id": generateUniqueOrderId()
                    }

                    // navigation.navigate('Talk', { screen: 'Summary', params: { profileDetails: profileDetails, submitData: option, selectedSlot: selectedByUser } })
                    const formData = new FormData();
                    formData.append("therapist_id", profileDetails?.user_id);
                    formData.append("slot_ids", JSON.stringify(ids));
                    formData.append("date", selectedDate);

                    AsyncStorage.getItem('userToken', (err, usertoken) => {
                        axios.post(`${API_URL}/patient/slot-hold`, formData, {
                            headers: {
                                Accept: 'application/json',
                                'Content-Type': 'multipart/form-data',
                                "Authorization": `Bearer ${usertoken}`,
                            },
                        })
                            .then(res => {
                                //console.log(JSON.stringify(res.data), 'submit form response')
                                if (res.data.response == true) {
                                    setIsLoading(false)
                                    Toast.show({
                                        type: 'success',
                                        text1: '',
                                        text2: "You have 3 minutes left to complete the payment.",
                                        position: 'top',
                                        topOffset: Platform.OS == 'ios' ? 55 : 20
                                    });
                                    navigation.navigate('Talk', { screen: 'Summary', params: { profileDetails: profileDetails, submitData: option, selectedSlot: selectedByUser } })
                                } else {
                                    //console.log('not okk')
                                    setIsLoading(false)
                                    Alert.alert('Oops..', "Something went wrong", [
                                        { text: 'OK', onPress: () => console.log('OK Pressed') },
                                    ]);
                                }
                            })
                            .catch(e => {
                                setIsLoading(false)
                                console.log(`slot booking error ${e}`)
                                console.log(e.response)
                                Alert.alert('Oops..', e.response?.data?.message, [
                                    { text: 'OK', onPress: () => console.log('OK Pressed') },
                                ]);
                            });
                    });
                } else {
                    if (selectedByUser.length > 1) {
                        Alert.alert('Sorry..', 'You need to choose only one slot for a free session.', [
                            { text: 'OK', onPress: () => console.log('OK Pressed') },
                        ]);
                    } else {
                        setIsLoading(true)
                        //console.log(selectedByUser)
                        const ids = selectedByUser.flatMap(item => [item.id.toString()]);
                        //console.log(ids)
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

                        const formData = new FormData();
                        formData.append("therapist_id", profileDetails?.user_id);
                        formData.append("slot_ids", JSON.stringify(ids));
                        formData.append("date", selectedDate);
                        formData.append("coupon_id", '');
                        formData.append("purpose", 'purpose');
                        formData.append("mode_of_conversation", mode);
                        formData.append("payment_mode", 'free');
                        formData.append("gateway_name", 'Free Slot Booking');
                        formData.append("prescription_checked", prescription_checked);
                        formData.append("transaction_amount", "0");
                        formData.append("payment_status", 'pending');
                        formData.append("order_id", generateUniqueOrderId());
                        formData.append("transaction_no", "0");
                        formData.append("wallet_deduction", "0");
                        formData.append("amount", "0");
                        formData.append("coupon_deduction", "0");
                        formData.append("gst_amount", "0");


                        //console.log(formData)
                        AsyncStorage.getItem('userToken', (err, usertoken) => {
                            axios.post(`${API_URL}/patient/slot-book`, formData, {
                                headers: {
                                    Accept: 'application/json',
                                    'Content-Type': 'multipart/form-data',
                                    "Authorization": `Bearer ${usertoken}`,
                                },
                            })
                                .then(res => {
                                    //console.log(JSON.stringify(res.data.data), 'submit form response')
                                    if (res.data.response == true) {
                                        setIsLoading(false)
                                        // Alert.alert('Hello..', res.data.message, [
                                        //     {
                                        //         text: 'Cancel',
                                        //         onPress: () => navigation.navigate('ThankYouBookingScreen', { detailsData: JSON.stringify(res.data.data) }),
                                        //         style: 'cancel',
                                        //     },
                                        //     { text: 'OK', onPress: () => navigation.navigate('ThankYouBookingScreen', { detailsData: JSON.stringify(res.data.data) }) },
                                        // ]);
                                        navigation.navigate('ThankYouBookingScreen', { detailsData: JSON.stringify(res.data.data) })
                                    } else {
                                        //console.log('not okk')
                                        setIsLoading(false)
                                        Alert.alert('Oops..', res.data.message || "Something went wrong", [
                                            { text: 'OK', onPress: () => console.log('OK Pressed') },
                                        ]);
                                    }
                                })
                                .catch(e => {
                                    setIsLoading(false)
                                    console.log(`slot booking error ${e}`)
                                    console.log(e.response)
                                    Alert.alert('Oops..', e.response?.data?.message, [
                                        { text: 'OK', onPress: () => console.log('OK Pressed') },
                                    ]);
                                });
                        });
                    }

                }

            }
        } else {
            setPermissionError('Permission is required to proceed.')
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
                        //console.log(JSON.stringify(res.data.data), 'response from wishlist submit')
                        if (res.data.response == true) {
                            setIsLoading(false);
                            Toast.show({
                                type: 'success',
                                text1: '',
                                text2: res?.data?.message,
                                position: 'top',
                                topOffset: Platform.OS == 'ios' ? 55 : 20
                            });
                            fetchTherapistData(therapistId)
                        } else {
                            //console.log('not okk')
                            setIsLoading(false)
                            Alert.alert('Oops..', "Something went wrong", [
                                { text: 'OK', onPress: () => console.log('OK Pressed') },
                            ]);
                        }
                    })
                    .catch(e => {
                        setIsLoading(false)
                        console.log(`bookmarked error ${e}`)
                        console.log(e.response)
                        Alert.alert('Oops..', e.response?.data?.message, [
                            { text: 'OK', onPress: () => console.log('OK Pressed') },
                        ]);
                    });
            });
        });
    }

    const renderItem = ({ item }) => (
        <View style={styles.reviewSectionView}>
            <View style={styles.reviewSection1st}>
                <Image
                    source={{ uri: item?.patient?.profile_pic }}
                    style={styles.reviewProfilePic}
                />
                <View style={styles.reviewSectionDetails}>
                    <Text style={styles.reviewSectionName}>{item?.patient?.name}</Text>
                    <View style={styles.reviewSectionDateView}>
                        <Text style={styles.reviewSectionDateText}>{moment(item?.patient?.created_at).format('MMM D, YYYY')}</Text>
                    </View>
                </View>
            </View>
            <View style={styles.reviewSectionStarView}>
                <StarRating
                    disabled={true}
                    maxStars={5}
                    rating={item?.star}
                    selectedStar={(rating) => setStarCount(rating)}
                    fullStarColor={'#FFCB45'}
                    starSize={15}
                    starStyle={{ marginHorizontal: responsiveWidth(1) }}
                />
            </View>
            <Text style={styles.reviewSectionStarText}>{item?.review}</Text>
        </View>
    );

    if (isLoading) {
        return (
            <Loader />
        )
    }

    const calculateHeight = () => {
        if (therapistAvailability.length === 0) {
            return responsiveHeight(10); // Set a fixed height for the "No slots available" message
        }
        const itemHeight = responsiveHeight(5) + 25; // Item height + padding and margin
        const itemsPerRow = 3; // Number of items per row
        const rows = Math.ceil(therapistAvailability.length / itemsPerRow);
        const maxHeight = responsiveHeight(40); // Maximum height for the ScrollView

        return Math.min(rows * itemHeight, maxHeight);
    };

    const onRefresh = async () => {
        const formattedDate = moment().format('YYYY-MM-DD');
        const dayOfWeek = moment().format('dddd');
        const index = 0;
        //console.log(formattedDate);
        //console.log(dayOfWeek)
        selectedDateChange(index, dayOfWeek, formattedDate)
        //getAllReviewForTherapist()
        setSelectedByUser([])
    }

    return (
        <SafeAreaView style={styles.Container}>
            <CustomHeader commingFrom={'Therapist'} onPress={() => handleBackButton()} title={'Details'} />
            <ScrollView style={styles.wrapper} showsVerticalScrollIndicator={false} refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#417AA4" colors={['#417AA4']} />
            }>
                <View style={{ alignSelf: 'center', marginTop: responsiveHeight(2) }}>

                    <View style={styles.totalValue}>
                        <View style={styles.totalValue1stSection}>
                            <View style={styles.totalValueProfileView}>
                                <Image
                                    source={{ uri: profileDetails?.user?.profile_pic }}
                                    style={styles.totalValueProfilePic}
                                />
                                <StarRating
                                    disabled={true}
                                    maxStars={5}
                                    rating={profileDetails?.display_rating}
                                    selectedStar={(rating) => setStarCount(rating)}
                                    fullStarColor={'#FFCB45'}
                                    starSize={12}
                                    starStyle={styles.starStyle}
                                />
                                <Text style={styles.reviewCount}>{profileDetails?.display_rating_members} Reviews</Text>
                            </View>
                            <View style={styles.totalValuedetailsView}>
                                <Text style={styles.totalValueDetailsName}>{profileDetails?.user?.name}</Text>
                                <Text style={styles.totalValueDetails}>{profileDetails?.qualification_list ? profileDetails.qualification_list.replace(/,/g, ', ') : ''}</Text>
                                <Text style={styles.totalValueDetails}>{profileDetails?.experience} Years Experience</Text>
                                <Text style={styles.totalValueDetails}>Language :
                                    <Text style={styles.totalValueDetailsLan}> {profileDetails?.languages_list ? profileDetails.languages_list.replace(/,/g, ', ') : ''}</Text>
                                </Text>
                            </View>
                            <View style={{ width: responsiveWidth(6), }}>
                                {profileDetails?.wishlistcount == 'yes' ?
                                    <TouchableOpacity onPress={() => bookmarkedToggle(profileDetails?.user_id)}>
                                        <Image
                                            source={bookmarkedFill}
                                            style={styles.iconStyle}
                                        />
                                    </TouchableOpacity>
                                    :
                                    <TouchableOpacity onPress={() => bookmarkedToggle(profileDetails?.user_id)}>
                                        <Image
                                            source={bookmarkedNotFill}
                                            style={styles.iconStyle}
                                        />
                                    </TouchableOpacity>
                                }
                            </View>
                        </View>
                        <View style={styles.profilebooking}>
                            {route?.params?.mode === 'paid' ?
                                <View style={styles.profilebookingRateView}>
                                    <Text style={styles.profilebookingText}>₹{profileDetails?.rate} for 30 Min Booking</Text>
                                </View>
                                :
                                <View style={styles.profilebookingRateView}>
                                    <Text style={styles.profilebookingText}>Free for 15 Min Booking</Text>
                                </View>
                            }
                            {/* <View style={styles.varticleLine} /> */}
                            {/* <View style={styles.profilebookingView}>

                                <Text style={styles.profilebookingText}>Session Done - {profileDetails?.session_done}</Text>
                            </View> */}
                        </View>
                    </View>
                    <View style={styles.selectedDateSection}>
                        <Text style={styles.headerText}>Select Date</Text>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            {/* <Text style={{ fontSize: responsiveFontSize(1.7), color: '#746868', fontFamily: 'DMSans-Regular', }}>View Full Calender</Text> */}
                        </View>
                    </View>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ padding: responsiveWidth(2), }}>
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
                    <View style={styles.selectDateView}>
                        <Text style={styles.headerText}>Select Time</Text>
                    </View>
                    {route?.params?.mode === 'paid' ?
                        <View style={styles.warningView}>
                            <Text style={styles.warningText}>We recommend booking one hour (two continuous slots)</Text>
                        </View> : <></>}
                    <View style={styles.availableSlotView}>
                        <ScrollView nestedScrollEnabled={true} indicatorStyle='black' showsVerticalScrollIndicator={true} style={{ width: responsiveWidth(100), backgroundColor: therapistAvailability.length === 0 ? '' : '#EEF8FF', paddingHorizontal: 5, paddingVertical: 10, height: calculateHeight() }}>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: responsiveHeight(2) }}>
                                {therapistAvailability.length === 0 ? (
                                    <View style={styles.noSlotView}>
                                        <Text style={styles.noSlotText}>No slots available</Text>
                                    </View>
                                ) : (
                                    therapistAvailability.map((slot, index) => {
                                        const isSelected = selectedByUser.includes(slot);
                                        const isBooked = slot.booked_status === 1 || slot.hold_status === 1;
                                        return (

                                            <TouchableOpacity
                                                key={index}
                                                onPress={() => handleSlotSelect(slot)}
                                                disabled={isBooked}
                                                style={{
                                                    height: responsiveHeight(5),
                                                    padding: 5,
                                                    backgroundColor: isBooked ? '#EAECF0' : isSelected ? '#EEF8FF' : '#FFFFFF', // Change background color if selected
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    borderRadius: 20,
                                                    marginRight: 10,
                                                    marginBottom: 10,
                                                    borderColor: isBooked ? '#EAECF0' : isSelected ? '#417AA4' : '#E3E3E3',
                                                    borderWidth: 1,
                                                }}
                                            >
                                                <Text style={styles.availableText}>
                                                    {moment(slot.slot_start_time, 'HH:mm:ss').format('h:mm A')} - {moment(slot.slot_end_time, 'HH:mm:ss').format('h:mm A')}
                                                </Text>
                                            </TouchableOpacity>

                                        );
                                    })
                                )}
                            </View>
                        </ScrollView>
                    </View>
                </View>

                <View style={styles.selectedItemSection}>
                    <View style={styles.totalValue}>
                        <Text style={styles.modeText}>Select Mode</Text>
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
                <View style={styles.checkboxView}>
                    <CheckBox
                        disabled={false}
                        value={toggleCheckBox}
                        onValueChange={(newValue) => {
                            setToggleCheckBox(newValue)
                            setPermissionError('')
                        }}
                        tintColors={{ true: '#444343', false: '#444343' }}
                        style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                    />
                    <Text style={styles.checkboxText}>I give my consent to the app and therapists to access my past medical history available on the platform </Text>
                </View>
                {permissionError ? <Text style={styles.permissionErrorStyle}>{permissionError}</Text> : null}
                {/* {allReview.length !== 0 ?
                    <View style={{ padding: responsiveWidth(3), }}>
                        <View style={styles.reviewSection}>
                            <Text style={styles.headerText}>Reviews</Text>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            </View>
                        </View>
                    </View>
                    : <></>} */}
                {/* <View style={styles.reviewSectionList}>
                    <FlatList
                        data={allReview}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id.toString()}
                        maxToRenderPerBatch={10}
                        windowSize={5}
                        initialNumToRender={10}
                        getItemLayout={(allReview, index) => (
                            { length: 50, offset: 50 * index, index }
                        )}
                        horizontal={true}
                        showsHorizontalScrollIndicator={false}
                    />
                </View> */}
                <View style={{ width: responsiveWidth(90), alignSelf: 'center' }}>
                    <CustomButton label={"Book Appointment"}
                        // onPress={() => { login() }}
                        onPress={() => { checkAndRequestPermissions() }}
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
        ...Platform.select({
            android: {
                elevation: 5, // Only for Android
            },
            ios: {
                shadowColor: '#000', // Only for iOS
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 5,
            },
        }),
    },
    totalValue1stSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    totalValueProfileView: {
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: responsiveWidth(25),
    },
    totalValueProfilePic: {
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
    reviewCount: {
        fontSize: responsiveFontSize(1.7),
        color: '#746868',
        fontFamily: 'DMSans-Regular',
    },
    totalValuedetailsView: {
        flexDirection: 'column',
        width: responsiveWidth(50),
        height: responsiveHeight(13),
    },
    totalValueDetailsName: {
        fontSize: responsiveFontSize(2),
        color: '#2D2D2D',
        fontFamily: 'DMSans-Bold',
        marginBottom: responsiveHeight(1)
    },
    totalValueDetails: {
        fontSize: responsiveFontSize(1.7),
        color: '#746868',
        fontFamily: 'DMSans-Medium',
        marginBottom: responsiveHeight(1)
    },
    iconStyle: {
        height: 25,
        width: 25
    },
    totalValueDetailsLan: {
        fontSize: responsiveFontSize(1.7),
        color: '#959595',
        fontFamily: 'DMSans-Regular',
    },
    profilebooking: {
        height: responsiveHeight(5),
        width: responsiveWidth(85),
        marginTop: responsiveHeight(2),
        backgroundColor: '#F4F5F5',
        borderRadius: 10,
        padding: 5,
        //flexDirection: 'row',
        //justifyContent: 'space-between'
        alignItems: 'center',
        justifyContent: 'center'
    },
    profilebookingRateView: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    profilebookingText: {
        color: '#444343',
        fontFamily: 'DMSans-Medium',
        fontSize: responsiveFontSize(1.5)
    },
    varticleLine: {
        height: '80%',
        width: 1,
        backgroundColor: '#E3E3E3',
        marginLeft: 5,
        marginRight: 5
    },
    profilebookingView: {
        flexDirection: 'row',
        alignItems: 'center',
        width: responsiveWidth(35)
    },
    headerText: {
        fontSize: responsiveFontSize(2),
        color: '#2D2D2D',
        fontFamily: 'DMSans-Bold',
    },
    warningView: {
        height: responsiveHeight(8),
        width: responsiveWidth(90),
        backgroundColor: '#519ED8',
        borderRadius: 15,
        justifyContent: 'center',
        padding: 10
    },
    warningText: {
        color: '#FFF',
        fontFamily: 'DMSans-Medium',
        fontSize: responsiveFontSize(2)
    },
    availableSlotView: {
        width: responsiveWidth(90),
        marginTop: responsiveHeight(2),
        flexDirection: 'row',
        flexWrap: 'wrap'
    },
    noSlotView: {
        height: responsiveHeight(5),
        width: responsiveWidth(85),
        padding: 10,
        backgroundColor: '#FFFFFF',
        borderColor: '#E1293B',
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        //marginRight: 10,
        marginBottom: 10,
        alignSelf: 'center'
    },
    noSlotText: {
        color: '#E1293B',
        fontFamily: 'DMSans-Bold',
        fontSize: responsiveFontSize(1.7)
    },
    availableText: {
        color: '#2D2D2D',
        fontFamily: 'DMSans-Bold',
        fontSize: responsiveFontSize(1.7)
    },
    selectDateView: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: responsiveHeight(2),
        marginTop: responsiveHeight(2)
    },
    modeText: {
        color: '#2D2D2D',
        fontFamily: 'DMSans-Bold',
        fontSize: responsiveFontSize(1.7)
    },
    //date loop
    dateView: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dayContainer: {
        height: responsiveHeight(10),
        width: responsiveWidth(15),
        borderRadius: 30,
        marginRight: responsiveWidth(3),
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
    },
    selectedDay: {
        backgroundColor: '#EEF8FF',
        borderColor: '#417AA4',
        borderWidth: 1,
    },
    defaultDay: {
        backgroundColor: '#fff',
        borderColor: '#E3E3E3',
        borderWidth: 1
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
        borderColor: '#417AA4',
        borderWidth: 1,
        borderRadius: 10,
        padding: 5,
    },
    selectedItem: {
        backgroundColor: '#EEF8FF',
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
    checkboxView: {
        padding: responsiveWidth(2),
        flexDirection: 'row',
        width: responsiveWidth(90)
    },
    checkboxText: {
        color: '#746868',
        fontFamily: 'DMSans-Regular',
        fontSize: responsiveFontSize(1.7)
    },
    //review section
    reviewSectionView: {
        padding: 20,
        width: responsiveWidth(80),
        backgroundColor: '#FFF',
        marginHorizontal: 15,
        borderRadius: 20,
        marginTop: responsiveHeight(2),
        marginBottom: responsiveHeight(2),
        ...Platform.select({
            android: {
                elevation: 5, // Only for Android
            },
            ios: {
                shadowColor: '#000', // Only for iOS
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 5,
            },
        }),
    },
    reviewSection1st: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    reviewProfilePic: {
        height: 50,
        width: 50,
        borderRadius: 25
    },
    reviewSectionDetails: {
        flexDirection: 'column',
        marginLeft: responsiveWidth(3)
    },
    reviewSectionName: {
        color: '#2D2D2D',
        fontSize: responsiveFontSize(2),
        fontFamily: 'DMSans-Bold',
        marginBottom: 5,
    },
    reviewSectionDateView: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: responsiveWidth(65)
    },
    reviewSectionDateText: {
        color: '#746868',
        fontFamily: 'DMSans-Regular',
        marginRight: 5,
        fontSize: responsiveFontSize(1.5)
    },
    reviewSectionStarView: {
        width: responsiveWidth(25),
        marginTop: responsiveHeight(2),
        marginBottom: responsiveHeight(2)
    },
    reviewSectionStarText: {
        color: '#746868',
        fontFamily: 'DMSans-Regular',
        fontSize: responsiveFontSize(1.7)
    },
    reviewSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    reviewSectionList: {
        flexDirection: 'row',
        marginBottom: responsiveHeight(2)
    },
    selectedItemSection: {
        padding: responsiveWidth(2),
        alignSelf: 'center'
    },
    selectedDateSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: responsiveHeight(2),
        marginTop: responsiveHeight(2)
    },
    permissionErrorStyle: {
        padding: responsiveWidth(2),
        marginLeft: responsiveWidth(8),
        color: '#E1293B',
        fontFamily: 'DMSans-Regular',
        fontSize: responsiveFontSize(1.7)
    }

});
