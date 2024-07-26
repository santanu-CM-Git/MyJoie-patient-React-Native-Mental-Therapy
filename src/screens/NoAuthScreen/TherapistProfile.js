import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, SafeAreaView, StyleSheet, ScrollView, StatusBar, Image, FlatList, TouchableOpacity, Animated, KeyboardAwareScrollView, useWindowDimensions, Switch, Alert } from 'react-native'
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

    // const selectedDateChange = (index, day, date) => {
    //     console.log(index, day, date)
    //     setSelectedDay(index)
    //     setSelectedDate(date)
    //     setIsLoading(true);
    //     // console.log(day, 'day');
    //     // console.log(date, 'date');
    //     // console.log(profileDetails?.id, 'therapist_id');
    //     // console.log('paid', 'paid')
    //     var givendate = '';
    //     if (day == 'Monday') {
    //         givendate = 'monday'
    //     } else if (day == 'Tuesday') {
    //         givendate = 'tuesday'
    //     } else if (day == 'Wednesday') {
    //         givendate = 'wednessday'
    //     } else if (day == 'Thursday') {
    //         givendate = 'thursday'
    //     } else if (day == 'Friday') {
    //         givendate = 'friday'
    //     } else if (day == 'Saturday') {
    //         givendate = 'saturday'
    //     } else if (day == 'Sunday') {
    //         givendate = 'sunday'
    //     }
    //     const option = {
    //         "day": givendate,
    //         "date": date,
    //         "therapist_id": route?.params?.therapistId,
    //         "booking_type": route?.params?.mode
    //     }
    //     console.log(option)
    //     AsyncStorage.getItem('userToken', (err, usertoken) => {
    //         axios.post(`${API_URL}/patient/therapist-date-slots`, option, {
    //             headers: {
    //                 'Accept': 'application/json',
    //                 "Authorization": 'Bearer ' + usertoken,
    //                 //'Content-Type': 'multipart/form-data',
    //             },
    //         })
    //             .then(res => {
    //                 console.log(JSON.stringify(res.data.data), 'fetch all therapist availibility')
    //                 if (res.data.response == true) {
    //                     //const filteredData = res.data.data.filter(slot => slot.booked_status === 0);
    //                     //setTherapistAvailability(filteredData);
    //                     setTherapistAvailability(res.data.data)
    //                     setIsLoading(false);

    //                 } else {
    //                     console.log('not okk')
    //                     setIsLoading(false)
    //                     Alert.alert('Oops..', "Something went wrong", [
    //                         {
    //                             text: 'Cancel',
    //                             onPress: () => console.log('Cancel Pressed'),
    //                             style: 'cancel',
    //                         },
    //                         { text: 'OK', onPress: () => console.log('OK Pressed') },
    //                     ]);
    //                 }
    //             })
    //             .catch(e => {
    //                 setIsLoading(false)
    //                 console.log(`user register error ${e}`)
    //                 console.log(e.response)
    //                 Alert.alert('Oops..', e.response?.data?.message, [
    //                     {
    //                         text: 'Cancel',
    //                         onPress: () => console.log('Cancel Pressed'),
    //                         style: 'cancel',
    //                     },
    //                     { text: 'OK', onPress: () => console.log('OK Pressed') },
    //                 ]);
    //             });
    //     });
    // }

    const selectedDateChange = (index, day, date) => {
        console.log(index, day, date);
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
        console.log(option);

        AsyncStorage.getItem('userToken', (err, usertoken) => {
            axios.post(`${API_URL}/patient/therapist-date-slots`, option, {
                headers: {
                    'Accept': 'application/json',
                    "Authorization": 'Bearer ' + usertoken,
                    //'Content-Type': 'multipart/form-data',
                },
            })
                .then(res => {
                    console.log(JSON.stringify(res.data.data), 'fetch all therapist availability');
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
                    setIsLoading(false);
                    console.log(`Available slot error ${e}`);
                    console.log(e.response);
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
    };

    // const handleSlotSelect = (slot) => {
    //     console.log(slot, 'selected slot data')
    //     if (slot.booked_status === 0) {
    //         setSelectedByUser((prevSelected) => {
    //             if (prevSelected.includes(slot)) {
    //                 // Deselect if already selected
    //                 return prevSelected.filter(selectedSlot => selectedSlot !== slot);
    //             } else {
    //                 // Select the slot
    //                 return [...prevSelected, slot];
    //             }
    //         });
    //     }
    // };

    const handleSlotSelect = (slot) => {
        console.log(slot, 'selected slot data');
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
                        Alert.alert('Selection Error', 'You can only select continuous slots in one booking, if you want to book non continuous slots then you can do that with  two different bookings.');
                        return prevSelected;
                    }
                }
            });
        }
    };

    const fetchTherapistData = () => {
        setIsLoading(true);
        AsyncStorage.getItem('userToken', (err, usertoken) => {
            const option = {
                "therapist_id": route?.params?.therapistId
            }
            console.log(option)
            axios.post(`${API_URL}/patient/therapist`, option, {
                headers: {
                    'Accept': 'application/json',
                    "Authorization": 'Bearer ' + usertoken,
                    //'Content-Type': 'multipart/form-data',
                },
            })
                .then(res => {
                    console.log(JSON.stringify(res.data.data), 'response from therapist data')
                    if (res.data.response == true) {
                        setProfileDetails(res.data.data[0])
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
                    console.log(`fetch therapist data error ${e}`)
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


    useEffect(() => {
        // console.log(route?.params?.detailsData, 'vvvvvvv')
        // setProfileDetails(route?.params?.detailsData)
        fetchTherapistData()
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
            "user_id": route?.params?.therapistId
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
                        //setIsLoading(false);

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

    const generateUniqueOrderId = () => {
        const timestamp = Date.now(); // Current timestamp in milliseconds
        const randomNum = Math.floor(Math.random() * 100000); // Random number between 0 and 99999
        return `ORD-${timestamp}-${randomNum}`;
    }

    const submitForm = () => {
        console.log(selectedByUser.length, 'no of selected slot')
        console.log(profileDetails?.rate, 'rate of the therapist')
        console.log(route?.params?.mode, 'type')
        if (selectedByUser.length === 0) {
            Alert.alert('Oops..', 'You need to select at least one slot.', [
                {
                    text: 'Cancel',
                    onPress: () => console.log('Cancel Pressed'),
                    style: 'cancel',
                },
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

                console.log(profileDetails?.user_id, "therapist_id")
                console.log(ids, 'slot_ids')
                console.log(selectedDate, 'date')
                console.log('purpose', 'purpose')
                console.log(mode, 'mode_of_conversation')
                console.log("online", 'payment_mode')
                console.log("Razorpay", "gateway_name")
                console.log(prescription_checked, "prescription_checked")
                console.log(totalAmount, 'transaction_amount')
                // const formData = new FormData();
                // formData.append("therapist_id", profileDetails?.user_id);
                // formData.append("slot_ids", JSON.stringify(ids));
                // formData.append("date", selectedDate);
                // formData.append("purpose", 'purpose');
                // formData.append("mode_of_conversation", mode);
                // formData.append("payment_mode", 'online');
                // formData.append("gateway_name", 'Razorpay');
                // formData.append("prescription_checked", prescription_checked);
                // formData.append("transaction_amount", totalAmount);
                // formData.append("payment_status", 'paid');
                // formData.append("order_id", '37866876');
                //formData.append("transaction_no", transactionId);
                //formData.append("wallet_deduction", walletAmount);
                //console.log(formData)
                const option = {
                    "therapist_id": profileDetails?.user_id,
                    "slot_ids": JSON.stringify(ids),
                    "date": selectedDate,
                    "purpose": 'purpose',
                    "mode_of_conversation": mode,
                    "payment_mode": 'online',
                    "gateway_name": 'Razorpay',
                    "prescription_checked": prescription_checked,
                    "transaction_amount": totalAmount,
                    "payment_status": 'paid',
                    "order_id": generateUniqueOrderId()
                }
                navigation.navigate('Summary', { profileDetails: profileDetails, submitData: option, selectedSlot: selectedByUser })
            } else {
                if (selectedByUser.length > 1) {
                    Alert.alert('Sorry..', 'You need to choose only one slot for a free session.', [
                        {
                            text: 'Cancel',
                            onPress: () => console.log('Cancel Pressed'),
                            style: 'cancel',
                        },
                        { text: 'OK', onPress: () => console.log('OK Pressed') },
                    ]);
                } else {
                    console.log(selectedByUser)
                    const ids = selectedByUser.flatMap(item => [item.id.toString()]);
                    console.log(ids)
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
                    formData.append("gateway_name", 'free');
                    formData.append("prescription_checked", prescription_checked);
                    formData.append("transaction_amount", "0");
                    formData.append("payment_status", 'free');
                    formData.append("order_id", generateUniqueOrderId());
                    formData.append("transaction_no", "0");
                    formData.append("wallet_deduction", "0");
                    formData.append("amount", "0");
                    formData.append("coupon_deduction", "0");
                    formData.append("gst_amount", "0");


                    console.log(formData)
                    AsyncStorage.getItem('userToken', (err, usertoken) => {
                        axios.post(`${API_URL}/patient/slot-book`, formData, {
                            headers: {
                                Accept: 'application/json',
                                'Content-Type': 'multipart/form-data',
                                "Authorization": `Bearer ${usertoken}`,
                            },
                        })
                            .then(res => {
                                console.log(JSON.stringify(res.data.data), 'submit form response')
                                if (res.data.response == true) {
                                    setIsLoading(false)
                                    Alert.alert('Oops..', res.data.message, [
                                        {
                                            text: 'Cancel',
                                            onPress: () => navigation.navigate('ThankYouBookingScreen', { detailsData: JSON.stringify(res.data.data) }),
                                            style: 'cancel',
                                        },
                                        { text: 'OK', onPress: () => navigation.navigate('ThankYouBookingScreen', { detailsData: JSON.stringify(res.data.data) }) },
                                    ]);
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
                                console.log(`slot booking error ${e}`)
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

            }

        }


        // AsyncStorage.getItem('userToken', (err, usertoken) => {
        //     axios.post(`${API_URL}/patient/slot-book`, formData, {
        //         headers: {
        //             Accept: 'application/json',
        //             'Content-Type': 'multipart/form-data',
        //             "Authorization": `Bearer ${usertoken}`,
        //         },
        //     })
        //         .then(res => {
        //             console.log(res.data)
        //             if (res.data.response == true) {
        //                 setIsLoading(false)
        //                 setSelectedByUser([])
        //                 fetchTherapistData()
        //                 const formattedDate = moment().format('YYYY-MM-DD');
        //                 const dayOfWeek = moment().format('dddd');
        //                 const index = 0;
        //                 console.log(formattedDate);
        //                 console.log(dayOfWeek)
        //                 selectedDateChange(index, dayOfWeek, formattedDate)
        //                 Alert.alert('Oops..', res.data.message, [
        //                     {
        //                         text: 'Cancel',
        //                         onPress: () => console.log('Cancel Pressed'),
        //                         style: 'cancel',
        //                     },
        //                     { text: 'OK', onPress: () => console.log('OK Pressed') },
        //                 ]);
        //             } else {
        //                 console.log('not okk')
        //                 setSelectedByUser([])
        //                 setIsLoading(false)
        //                 Alert.alert('Oops..', "Something went wrong", [
        //                     {
        //                         text: 'Cancel',
        //                         onPress: () => console.log('Cancel Pressed'),
        //                         style: 'cancel',
        //                     },
        //                     { text: 'OK', onPress: () => console.log('OK Pressed') },
        //                 ]);
        //             }
        //         })
        //         .catch(e => {
        //             setIsLoading(false)
        //             setSelectedByUser([])
        //             console.log(`user register error ${e}`)
        //             console.log(e.response)
        //             Alert.alert('Oops..', e.response?.data?.message, [
        //                 {
        //                     text: 'Cancel',
        //                     onPress: () => console.log('Cancel Pressed'),
        //                     style: 'cancel',
        //                 },
        //                 { text: 'OK', onPress: () => console.log('OK Pressed') },
        //             ]);
        //         });
        // });

    }

    // const handlePayment = () => {
    //     const totalAmount = (selectedByUser.length * profileDetails?.rate)
    //     if (selectedByUser.length != '0') {
    //         var options = {
    //             description: 'This is the description we need',
    //             image: 'https://i.imgur.com/3g7nmJC.jpg',
    //             currency: 'INR',
    //             key: razorpayKeyId,
    //             amount: totalAmount * 100,
    //             name: 'Customer 1',
    //             order_id: '',
    //             prefill: {
    //                 email: 'xyz@example.com',
    //                 contact: '9191919191',
    //                 name: 'Person Name'
    //             },
    //             theme: { color: '#ECFCFA' }
    //         }
    //         RazorpayCheckout.open(options).then((data) => {
    //             // handle success
    //             //alert(`Success: ${data.razorpay_payment_id}`);
    //             console.log(data, 'data')
    //             submitForm(data.razorpay_payment_id)
    //         }).catch((error) => {
    //             // handle failure
    //             alert(`Error: ${error.code} | ${error.description}`);
    //         });
    //     } else {
    //         Toast.show({
    //             type: 'error',
    //             text1: 'Hello',
    //             text2: "Please choose time slot",
    //             position: 'top',
    //             topOffset: Platform.OS == 'ios' ? 55 : 20
    //         });
    //     }


    // }

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
                            fetchTherapistData()
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
                        console.log(`bookmarked error ${e}`)
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
        const itemHeight = responsiveHeight(5) + 20; // Item height + padding and margin
        const itemsPerRow = 3; // Number of items per row
        const rows = Math.ceil(therapistAvailability.length / itemsPerRow);
        const maxHeight = responsiveHeight(40); // Maximum height for the ScrollView

        return Math.min(rows * itemHeight, maxHeight);
    };

    return (
        <SafeAreaView style={styles.Container}>
            <CustomHeader commingFrom={'Therapist'} onPress={() => navigation.goBack()} title={'Therapist'} />
            <ScrollView style={styles.wrapper}>
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
                                <Text style={styles.reviewCount}>{profileDetails?.review_counter} Reviews</Text>
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
                            <View style={styles.varticleLine} />
                            <View style={styles.profilebookingView}>

                                <Text style={styles.profilebookingText}>Session Done - {profileDetails?.session_done}</Text>
                            </View>
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
                        <ScrollView nestedScrollEnabled={true} style={{ width: responsiveWidth(90), height: calculateHeight() }}>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                                {therapistAvailability.length === 0 ? (
                                    <View style={styles.noSlotView}>
                                        <Text style={styles.noSlotText}>No slots available for this date</Text>
                                    </View>
                                ) : (
                                    therapistAvailability.map((slot, index) => {
                                        const isSelected = selectedByUser.includes(slot);
                                        const isBooked = slot.booked_status === 1;
                                        return (

                                            <TouchableOpacity
                                                key={index}
                                                onPress={() => handleSlotSelect(slot)}
                                                disabled={isBooked}
                                                style={{
                                                    height: responsiveHeight(5),
                                                    padding: 10,
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
                <View style={styles.selectedItemSection}>
                    <View style={styles.totalValue}>
                        <Text style={styles.modeText}>Select Mode</Text>
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
                <View style={styles.checkboxView}>
                    <CheckBox
                        disabled={false}
                        value={toggleCheckBox}
                        onValueChange={(newValue) => setToggleCheckBox(newValue)}
                        tintColors={{ true: '#444343', false: '#444343' }}
                    />
                    <Text style={styles.checkboxText}>I give my consent to the app and therapists to access my past medical history available on the platform </Text>
                </View>
                {allReview.length !== 0 ?
                    <View style={{ padding: responsiveWidth(3), }}>
                        <View style={styles.reviewSection}>
                            <Text style={styles.headerText}>Reviews</Text>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                {/* <Text style={{ fontSize: responsiveFontSize(1.7), color: '#746868', fontFamily: 'DMSans-Regular', }}>See All</Text> */}
                            </View>
                        </View>
                    </View>
                    : <></>}
                <View style={styles.reviewSectionList}>
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
                </View>
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
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
        width: responsiveWidth(90),
        padding: 10,
        backgroundColor: '#FFFFFF',
        borderColor: '#E1293B',
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        marginRight: 10,
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
        width: responsiveWidth(14),
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
        elevation: 5
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
    }

});
