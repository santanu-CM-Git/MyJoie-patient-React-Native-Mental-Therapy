import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, SafeAreaView, StyleSheet, ScrollView, StatusBar, Image, FlatList, TouchableOpacity, Animated, KeyboardAwareScrollView, useWindowDimensions, Switch, Alert } from 'react-native'
import CustomHeader from '../../components/CustomHeader'
import Feather from 'react-native-vector-icons/Feather';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions'
import { TextInput, LongPressGestureHandler, State } from 'react-native-gesture-handler'
import { bookmarkedFill, dateIcon, deleteImg, editImg, milkImg, phoneImg, searchImg, timeIcon, userPhoto, wallet, walletBlack, walletCredit } from '../../utils/Images'
import { API_URL, RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } from '@env'
import axios from 'axios';
import AsyncStorage from "@react-native-async-storage/async-storage";
import Loader from '../../utils/Loader';
import moment from "moment"
import StarRating from 'react-native-star-rating';
import InputField from '../../components/InputField';
import CustomButton from '../../components/CustomButton';
import RazorpayCheckout from 'react-native-razorpay';

const BookingSummary = ({ navigation, route }) => {

    const [walletBalance, setWalletBalance] = React.useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const [starCount, setStarCount] = useState(4)
    const [profileDetails, setProfileDetails] = useState(route?.params?.profileDetails)
    const [previousPageData, setPreviousPageData] = useState(route?.params?.submitData)
    const [payableAmount, setPayableAmount] = useState(route?.params?.submitData?.transaction_amount)
    const [isEnabled, setIsEnabled] = useState(false);
    const toggleSwitch = () => {
        setIsEnabled(previousState => !previousState)
        console.log(payableAmount, 'payable amount')
        console.log(walletBalance, 'wallet amount')
        if (!isEnabled) {
            setPayableAmount(payableAmount - walletBalance)
        }
        if (isEnabled) {
            setPayableAmount(route?.params?.submitData?.transaction_amount)
        }
    };
    let razorpayKeyId = RAZORPAY_KEY_ID;
    let razorpayKeySecret = RAZORPAY_KEY_SECRET;

    useEffect(() => {
        fetchWalletBalance();
        console.log(route?.params?.profileDetails, 'profile details')
        console.log(route?.params?.submitData, 'submited data')
    }, [])

    const fetchWalletBalance = () => {
        AsyncStorage.getItem('userToken', (err, usertoken) => {
            axios.post(`${API_URL}/patient/wallet`, {}, {
                headers: {
                    "Authorization": `Bearer ${usertoken}`,
                    "Content-Type": 'application/json'
                },
            })
                .then(res => {
                    //console.log(res.data,'user details')
                    let userBalance = res.data.wallet_amount;
                    console.log(userBalance, 'wallet balance')
                    setWalletBalance(userBalance)
                    setIsLoading(false);
                })
                .catch(e => {
                    console.log(`Login error ${e}`)
                    console.log(e.response?.data?.message)
                });
        });
    }

    const handlePayment = () => {
        const totalAmount = payableAmount
        if (totalAmount == '0') {
            submitForm("")
        } else {
            var options = {
                description: 'This is the description we need',
                image: 'https://i.imgur.com/3g7nmJC.jpg',
                currency: 'INR',
                key: razorpayKeyId,
                amount: totalAmount * 100,
                name: 'Customer 1',
                order_id: '',
                prefill: {
                    email: 'xyz@example.com',
                    contact: '9191919191',
                    name: 'Person Name'
                },
                theme: { color: '#ECFCFA' }
            }
            RazorpayCheckout.open(options).then((data) => {
                // handle success
                //alert(`Success: ${data.razorpay_payment_id}`);
                console.log(data, 'data')
                submitForm(data.razorpay_payment_id)
            }).catch((error) => {
                // handle failure
                alert(`Error: ${error.code} | ${error.description}`);
            });
        }


    }

    const submitForm = (transactionId) => {
        const formData = new FormData();
        formData.append("therapist_id", previousPageData?.therapist_id);
        formData.append("slot_ids", previousPageData?.slot_ids);
        formData.append("date", previousPageData?.date);
        formData.append("purpose", previousPageData?.purpose);
        formData.append("mode_of_conversation", previousPageData?.mode_of_conversation);
        formData.append("payment_mode", previousPageData?.payment_mode);
        formData.append("gateway_name", previousPageData?.gateway_name);
        formData.append("prescription_checked", previousPageData?.prescription_checked);
        formData.append("transaction_amount", previousPageData?.transaction_amount);
        formData.append("payment_status", previousPageData?.payment_status);
        formData.append("order_id", previousPageData?.order_id);
        formData.append("transaction_no", transactionId);
        if (isEnabled) {
            formData.append("wallet_deduction", walletBalance);
        } else {
            formData.append("wallet_deduction", "0");
        }
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
                    console.log(res.data)
                    if (res.data.response == true) {
                        setIsLoading(false)
                        Alert.alert('Oops..', res.data.message, [
                            {
                                text: 'Cancel',
                                onPress: () => navigation.navigate('ThankYouBookingScreen',{detailsData : JSON.stringify(res.data.data)}),
                                style: 'cancel',
                            },
                            { text: 'OK', onPress: () => navigation.navigate('ThankYouBookingScreen',{detailsData : JSON.stringify(res.data.data)}) },
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

    if (isLoading) {
        return (
            <Loader />
        )
    }



    return (
        <SafeAreaView style={styles.Container}>
            <CustomHeader commingFrom={'Summary'} onPress={() => navigation.goBack()} title={'Summary'} />
            <ScrollView style={styles.wrapper}>
                <View style={{ marginBottom: responsiveHeight(5), alignSelf: 'center', marginTop: responsiveHeight(2) }}>
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
                                    starStyle={{ marginHorizontal: responsiveWidth(0.3), marginBottom: responsiveHeight(1), marginLeft: responsiveWidth(1.5) }}
                                />
                                <Text style={{ fontSize: responsiveFontSize(1.7), color: '#746868', fontFamily: 'DMSans-Regular', }}>{profileDetails?.review_counter} Reviews</Text>
                            </View>
                            <View style={{ flexDirection: 'column', width: responsiveWidth(53), }}>
                                <Text style={{ fontSize: responsiveFontSize(2), color: '#2D2D2D', fontFamily: 'DMSans-Bold', marginBottom: responsiveHeight(1) }}>{profileDetails?.user?.name}</Text>
                                <Text style={{ fontSize: responsiveFontSize(1.7), color: '#746868', fontFamily: 'DMSans-Medium', marginBottom: responsiveHeight(1) }}>Therapist</Text>
                                <Text style={{ fontSize: responsiveFontSize(1.7), color: '#746868', fontFamily: 'DMSans-Medium', marginBottom: responsiveHeight(1) }}>{profileDetails?.qualification_list}</Text>
                                <Text style={{ fontSize: responsiveFontSize(1.7), color: '#746868', fontFamily: 'DMSans-Regular', marginBottom: responsiveHeight(1) }}>{profileDetails?.experience} Year Experience</Text>
                                <Text style={{ fontSize: responsiveFontSize(1.7), color: '#746868', fontFamily: 'DMSans-Medium', marginBottom: responsiveHeight(1) }}>Language : <Text style={{ fontSize: responsiveFontSize(1.7), color: '#959595', fontFamily: 'DMSans-Regular', }}>{profileDetails?.languages_list}</Text></Text>
                            </View>

                        </View>
                        <View style={{ width: responsiveWidth(80), backgroundColor: '#F4F5F5', height: responsiveHeight(10), marginTop: responsiveHeight(2), borderRadius: 10, padding: 10, }}>
                            <Text style={{ color: '#2D2D2D', fontFamily: 'DMSans-Bold', fontSize: responsiveFontSize(1.7) }}>Appointment Time :</Text>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: responsiveHeight(2) }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', width: responsiveWidth(35) }}>
                                    <Image
                                        source={dateIcon}
                                        style={{ height: 20, width: 20, resizeMode: 'contain', marginRight: responsiveWidth(2) }}
                                    />
                                    <Text style={{ color: '#444343', fontFamily: 'DMSans-SemiBold', fontSize: responsiveFontSize(1.5) }}>{moment(previousPageData?.date).format('dddd, D MMMM')}</Text>
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
                    </View>
                    <View style={{ width: responsiveWidth(89), backgroundColor: '#FFFFFF', height: responsiveHeight(8), marginTop: responsiveHeight(2), borderRadius: 10, padding: 10, borderColor: '#E3E3E3', borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <View style={{ width: responsiveWidth(40), flexDirection: 'row' }}>
                            <Image
                                source={walletBlack}
                                style={{ height: 20, width: 20, marginRight: responsiveWidth(2) }}
                            />
                            <Text style={{ color: '#2D2D2D', fontFamily: 'DMSans-SemiBold', fontSize: responsiveFontSize(2), }}>Wallet Balance</Text>
                        </View>
                        <View style={{ width: responsiveWidth(30), justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }}>
                            <Text style={{ color: '#2D2D2D', fontFamily: 'DMSans-SemiBold', fontSize: responsiveFontSize(2), marginRight: responsiveWidth(5) }}>₹{walletBalance}</Text>

                            <Switch
                                trackColor={{ false: '#767577', true: '#000' }}
                                thumbColor={isEnabled ? '#fff' : '#000'}
                                ios_backgroundColor="#3e3e3e"
                                onValueChange={toggleSwitch}
                                value={isEnabled}
                                style={styles.switchStyle}
                            />
                        </View>
                    </View>
                    <View style={styles.totalValue2}>
                        <View style={{ flexDirection: 'row', height: responsiveHeight(7), backgroundColor: '#DEDEDE', borderTopRightRadius: 10, borderTopLeftRadius: 10, alignItems: 'center', }}>
                            <Text style={{ color: '#2D2D2D', fontFamily: 'DMSans-Bold', fontSize: responsiveFontSize(2), fontWeight: 'bold', textAlign: 'center', marginLeft: responsiveWidth(2) }}>Price Details</Text>
                        </View>
                        <View style={{ padding: 10, }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: responsiveHeight(2) }}>
                                <Text style={{ color: '#746868', fontFamily: 'DMSans-Regular', fontSize: responsiveFontSize(1.7) }}>Consult Fee</Text>
                                <Text style={{ color: '#444343', fontFamily: 'DMSans-Medium', fontSize: responsiveFontSize(1.7) }}>₹{previousPageData?.transaction_amount}</Text>
                            </View>
                            {/* <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: responsiveHeight(2) }}>
                                <Text style={{ color: '#746868', fontFamily: 'DMSans-Regular', fontSize: responsiveFontSize(1.7) }}>Applicable Taxes</Text>
                                <Text style={{ color: '#444343', fontFamily: 'DMSans-Medium', fontSize: responsiveFontSize(1.7) }}>₹101</Text>
                            </View> */}
                            {isEnabled ?
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: responsiveHeight(2) }}>
                                    <Text style={{ color: '#746868', fontFamily: 'DMSans-Regular', fontSize: responsiveFontSize(1.7) }}>Wallet Balance</Text>
                                    <Text style={{ color: '#444343', fontFamily: 'DMSans-Medium', fontSize: responsiveFontSize(1.7) }}>- ₹{walletBalance}</Text>
                                </View>
                                : <></>}
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: responsiveHeight(2) }}>
                                <Text style={{ color: '#444343', fontFamily: 'DMSans-SemiBold', fontSize: responsiveFontSize(1.7) }}>You Pay</Text>
                                <Text style={{ color: '#444343', fontFamily: 'DMSans-SemiBold', fontSize: responsiveFontSize(1.7) }}>₹{payableAmount}</Text>
                            </View>
                        </View>
                    </View>
                </View>

            </ScrollView>
            <View style={styles.buttonwrapper}>
                <View style={{ flexDirection: 'column', }}>
                    <Text style={{ color: '#746868', fontSize: responsiveFontSize(1.7), fontFamily: 'DMSans-Medium', }}>Consult Fees</Text>
                    <Text style={{ color: '#444343', fontSize: responsiveFontSize(2.5), fontFamily: 'DMSans-Bold', marginTop: 10 }}>₹ {payableAmount}</Text>
                </View>
                <View style={{ marginTop: responsiveHeight(1) }}>
                    <CustomButton label={"Pay & Consult"}
                        onPress={() => handlePayment()}
                    />
                </View>
            </View>
        </SafeAreaView>
    )
}

export default BookingSummary

const styles = StyleSheet.create({
    Container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    wrapper: {
        padding: responsiveWidth(2),

    },
    totalValue: {
        width: responsiveWidth(89),
        height: responsiveHeight(36),
        //alignItems: 'center',
        backgroundColor: '#FFF',
        //justifyContent: 'center',
        padding: 15,
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

});
