import React, { useState, useMemo, useEffect,useCallback } from 'react';
import { View, Text, SafeAreaView, StyleSheet, ScrollView, StatusBar, Image, FlatList, TouchableOpacity, Animated, ActivityIndicator, useWindowDimensions, Switch, Alert } from 'react-native'
import CustomHeader from '../../components/CustomHeader'
import Feather from 'react-native-vector-icons/Feather';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions'
import { TextInput, LongPressGestureHandler, State } from 'react-native-gesture-handler'
import { logoIconImg, dateIcon, timeIcon, userPhoto, wallet, walletBlack, walletCredit } from '../../utils/Images'
import { API_URL, RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, BASE_URL } from '@env'
import axios from 'axios';
import AsyncStorage from "@react-native-async-storage/async-storage";
import Loader from '../../utils/Loader';
import moment from "moment"
import StarRating from 'react-native-star-rating';
import InputField from '../../components/InputField';
import CustomButton from '../../components/CustomButton';
import RazorpayCheckout from 'react-native-razorpay';
import Toast from 'react-native-toast-message';
import { useFocusEffect } from '@react-navigation/native';

const BookingSummary = ({ navigation, route }) => {

    const [couponCode, setCouponCode] = useState('');
    const [walletBalance, setWalletBalance] = useState(0);
    const [gstPercentage, setGstPercentage] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isCouponLoading, setIsCouponLoading] = useState(false);
    const [starCount, setStarCount] = useState(4);
    const [profileDetails, setProfileDetails] = useState(route?.params?.profileDetails);
    const [previousPageData, setPreviousPageData] = useState(route?.params?.submitData);
    const [payableAmount, setPayableAmount] = useState(route?.params?.submitData?.transaction_amount);
    const [consultFees, setCounsultFees] = useState(route?.params?.submitData?.transaction_amount)
    const [isEnabled, setIsEnabled] = useState(false);
    const [minTime, setMinTime] = useState(null);
    const [maxTime, setMaxTime] = useState(null);
    const [taxableAmount, setTaxableAmount] = useState(0);
    const [couponDeduction, setCouponDeduction] = useState(0);
    const [couponId, setCouponId] = useState(null)
    const [walletDeduction, setWalletDeduction] = useState(0);
    const [patientDetails, setPatientDetails] = useState(null)

    const toggleSwitch = () => {
        setIsEnabled((prevIsEnabled) => {
            const newIsEnabled = !prevIsEnabled;

            // Calculate the initial payable amount based on the original transaction amount, taxable amount, and coupon deduction
            let newPayableAmount = route?.params?.submitData?.transaction_amount + taxableAmount - couponDeduction;

            // Deduct wallet balance if the switch is enabled
            let newWalletDeduction = 0;
            if (newIsEnabled) {
                newWalletDeduction = Math.min(walletBalance, newPayableAmount);
                newPayableAmount -= newWalletDeduction;
            }

            // Ensure payable amount is not negative
            newPayableAmount = Math.max(newPayableAmount, 0);

            // Update states with new amounts
            setPayableAmount(newPayableAmount);
            setWalletDeduction(newWalletDeduction);

            return newIsEnabled;
        });
    };


    const razorpayKeyId = RAZORPAY_KEY_ID;
    const razorpayKeySecret = RAZORPAY_KEY_SECRET;

    const convertTime = (time) => {
        return moment(time, 'HH:mm:ss').format('hh:mm A');
    };

    const findTimeBounds = (data) => {
        let minStartTime = data[0].slot_start_time;
        let maxEndTime = data[0].slot_end_time;

        data.forEach(slot => {
            if (slot.slot_start_time < minStartTime) {
                minStartTime = slot.slot_start_time;
            }
            if (slot.slot_end_time > maxEndTime) {
                maxEndTime = slot.slot_end_time;
            }
        });

        return { minStartTime, maxEndTime };
    };

    const fetchWalletBalance = async () => {
        try {
            const usertoken = await AsyncStorage.getItem('userToken');
            const response = await axios.post(`${API_URL}/patient/wallet`, {}, {
                headers: {
                    "Authorization": `Bearer ${usertoken}`,
                    "Content-Type": 'application/json'
                },
            });

            const userBalance = response.data.wallet_amount;
            const fetchedGstPercentage = response.data.gst_percentage;

            console.log(userBalance, 'wallet balance');
            console.log(fetchedGstPercentage, 'gst percentage');

            setWalletBalance(userBalance);
            setGstPercentage(fetchedGstPercentage);
            setIsLoading(false);
        } catch (error) {
            setIsLoading(false);
            console.error('Fetch wallet balance error:', error);
            console.error(error.response?.data?.message);
            Alert.alert('Oops..', error.response?.data?.message || 'Something went wrong', [
                { text: 'OK', onPress: () => console.log('OK Pressed') },
            ]);
        }
    };

    const handlePayment = () => {
        const totalAmount = payableAmount;
        if (totalAmount === 0) {
            submitForm("");
        } else {
            const options = {
                description: 'This is the description we need',
                //image: `${BASE_URL}/public/assets/dist/img/logo.jpg`,
                image: `https://i.imgur.com/laTNSbz.png`,
                currency: 'INR',
                key: razorpayKeyId,
                amount: totalAmount * 100,
                name: patientDetails?.name,
                order_id: '',
                prefill: {
                    email: patientDetails?.email,
                    contact: patientDetails?.mobile,
                    name: patientDetails?.name,
                },
                theme: { color: '#519ED8' }
            };
            RazorpayCheckout.open(options).then((data) => {
                console.log(data, 'data');
                submitForm(data.razorpay_payment_id);
            }).catch((error) => {
                console.log(JSON.parse(error.description));
                const errorMsg = JSON.parse(error.description);
                console.log(errorMsg.error.description);
                navigation.navigate('PaymentFailed', { message: errorMsg.error.description });
            });
        }
    };

    const submitForm = (transactionId) => {
        setIsLoading(true);
        const formData = new FormData();
        formData.append("therapist_id", previousPageData?.therapist_id);
        formData.append("slot_ids", previousPageData?.slot_ids);
        formData.append("date", previousPageData?.date);
        formData.append("coupon_id", couponId || '');
        formData.append("purpose", previousPageData?.purpose);
        formData.append("mode_of_conversation", previousPageData?.mode_of_conversation);
        formData.append("payment_mode", previousPageData?.payment_mode);
        formData.append("gateway_name", previousPageData?.gateway_name);
        formData.append("prescription_checked", previousPageData?.prescription_checked);
        formData.append("payment_status", previousPageData?.payment_status);
        formData.append("order_id", previousPageData?.order_id);
        formData.append("transaction_no", transactionId);
        formData.append("amount", previousPageData?.transaction_amount);
        formData.append("coupon_deduction", couponDeduction);
        formData.append("gst_amount", taxableAmount);
        formData.append("wallet_deduction", isEnabled ? walletDeduction : "0");
        formData.append("transaction_amount", payableAmount);

        console.log(formData);

        AsyncStorage.getItem('userToken', (err, usertoken) => {
            axios.post(`${API_URL}/patient/slot-book`, formData, {
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'multipart/form-data',
                    "Authorization": `Bearer ${usertoken}`,
                },
            })
                .then(res => {
                    console.log(JSON.stringify(res.data.data), 'submit form response');
                    if (res.data.response) {
                        setIsLoading(false);
                        Alert.alert('Hello..', res.data.message, [
                            {
                                text: 'Cancel',
                                onPress: () => navigation.navigate('ThankYouBookingScreen', { detailsData: JSON.stringify(res.data.data) }),
                                style: 'cancel',
                            },
                            { text: 'OK', onPress: () => navigation.navigate('ThankYouBookingScreen', { detailsData: JSON.stringify(res.data.data) }) },
                        ]);
                    } else {
                        console.log('not ok');
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
                    console.log(`booking submit from booking summary error ${e}`);
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

    const changeCouponCode = (text) => {
        setCouponCode(text);
    };

    const callForCoupon = async () => {
        if (couponCode) {
            setIsCouponLoading(true);
            try {
                const userToken = await AsyncStorage.getItem('userToken');
                if (!userToken) {
                    throw new Error('User token not found');
                }
                const option = {
                    "coupon_code": couponCode
                };

                const response = await axios.post(`${API_URL}/patient/coupon`, option, {
                    headers: {
                        Accept: 'application/json',
                        "Authorization": `Bearer ${userToken}`,
                    },
                });

                if (response.data.response === true) {
                    setIsCouponLoading(false);
                    setCouponCode('');
                    const couponData = response.data.data[0];
                    console.log(couponData, 'response from coupon code');
                    if (couponData) {
                        setCouponId(couponData.id)
                        // Calculate coupon deduction based on type
                        if (couponData.type === 'percentage') {
                            const couponAmount = (consultFees * couponData.discount_percentage) / 100;
                            setCouponDeduction(couponAmount);
                            const tax = ((consultFees - couponAmount) * gstPercentage) / 100
                            setTaxableAmount(tax)
                            setPayableAmount(consultFees - couponAmount + tax - walletDeduction);

                        } else if (couponData.type === 'flat') {
                            const couponAmount = parseFloat(couponData.discount_percentage);
                            setCouponDeduction(couponAmount);
                            const tax = ((consultFees - couponAmount) * gstPercentage) / 100
                            setTaxableAmount(tax)
                            setPayableAmount(consultFees - couponAmount + tax - walletDeduction);
                        }
                    } else {
                        Toast.show({
                            type: 'error',
                            text1: 'Sorry',
                            text2: "Coupone code is not valid",
                            position: 'top',
                            topOffset: Platform.OS == 'ios' ? 55 : 20
                        });
                        setCouponDeduction(0)
                    }

                }
            } catch (error) {
                setIsCouponLoading(false);
                console.log(`Coupon apply error ${error}`);
                Alert.alert('Oops..', error.message || 'Something went wrong', [
                    {
                        text: 'Cancel',
                        onPress: () => console.log('Cancel Pressed'),
                        style: 'cancel',
                    },
                    { text: 'OK', onPress: () => console.log('OK Pressed') },
                ]);
            }
        } else {
            Alert.alert('Oops..', "Please enter coupon code first", [
                {
                    text: 'Cancel',
                    onPress: () => console.log('Cancel Pressed'),
                    style: 'cancel',
                },
                { text: 'OK', onPress: () => console.log('OK Pressed') },
            ]);
        }
    };

    const removeCoupon = () => {
        // Reset coupon deduction to 0
        setCouponDeduction(0);

        // Recalculate taxable amount based on original amount and GST percentage
        const originalAmount = route?.params?.submitData?.transaction_amount || 0;
        const calculatedTaxableAmount = ((originalAmount) * gstPercentage) / 100;
        console.log(calculatedTaxableAmount, 'taxable amount')
        setTaxableAmount(calculatedTaxableAmount);

        // Calculate new payable amount
        let newPayableAmount = originalAmount + calculatedTaxableAmount;

        // Deduct wallet balance if the switch is enabled
        console.log(isEnabled, 'wallet balance check or not')
        console.log(walletDeduction, 'wallet balance')
        if (isEnabled) {
            newPayableAmount -= walletDeduction;
        }

        // Ensure payable amount is not negative
        newPayableAmount = Math.max(newPayableAmount, 0);

        // Update payable amount state
        setPayableAmount(newPayableAmount);
    };

    useEffect(() => {
        const fetchUserInfoAndBalance = async () => {
            try {
                const userInfo = await AsyncStorage.getItem('userInfo');
                if (userInfo !== null) {
                    setPatientDetails(JSON.parse(userInfo));
                }
                fetchWalletBalance();
            } catch (error) {
                console.error("Failed to load user info", error);
            }
        };

        fetchUserInfoAndBalance();
    }, []);

    useEffect(() => {
        if (gstPercentage !== null) {
            const { minStartTime, maxEndTime } = findTimeBounds(route?.params?.selectedSlot);
            setMinTime(minStartTime);
            setMaxTime(maxEndTime);

            const originalAmount = route?.params?.submitData?.transaction_amount || 0;

            // Calculate taxable amount including coupon deduction
            const calculatedTaxableAmount = ((originalAmount - couponDeduction) * gstPercentage) / 100;
            setTaxableAmount(calculatedTaxableAmount);

            const initialPayableAmount = originalAmount + calculatedTaxableAmount;
            setPayableAmount(initialPayableAmount);
        }
    }, [gstPercentage, route]);

    useFocusEffect(
        useCallback(() => {
            const fetchUserInfoAndBalance = async () => {
                try {
                    const userInfo = await AsyncStorage.getItem('userInfo');
                    if (userInfo !== null) {
                        setPatientDetails(JSON.parse(userInfo));
                    }
                    fetchWalletBalance();
                } catch (error) {
                    console.error("Failed to load user info", error);
                }
            };

            fetchUserInfoAndBalance();

            if (gstPercentage !== null) {
                const { minStartTime, maxEndTime } = findTimeBounds(route?.params?.selectedSlot);
                setMinTime(minStartTime);
                setMaxTime(maxEndTime);

                const originalAmount = route?.params?.submitData?.transaction_amount || 0;

                // Calculate taxable amount including coupon deduction
                const calculatedTaxableAmount = ((originalAmount - couponDeduction) * gstPercentage) / 100;
                setTaxableAmount(calculatedTaxableAmount);

                const initialPayableAmount = originalAmount + calculatedTaxableAmount;
                setPayableAmount(initialPayableAmount);
            }

        }, [route, gstPercentage])
    );
    if (isLoading) {
        return (
            <Loader />
        )
    }



    return (
        <SafeAreaView style={styles.Container}>
            <CustomHeader commingFrom={'Summary'} onPress={() => navigation.goBack()} title={'Summary'} />
            <ScrollView style={styles.wrapper}>
                <View style={styles.wrapperinsideView}>
                    <View style={styles.totalValue}>
                        <View style={styles.totalValue1stSection}>
                            <View style={styles.totalValue1stSectionDetails}>
                                <Image
                                    source={{ uri: profileDetails?.user?.profile_pic }}
                                    style={styles.imageStyle}
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
                                <Text style={styles.reviewText}>{profileDetails?.review_counter} Reviews</Text>
                            </View>
                            <View style={styles.profileDetailsView}>
                                <Text style={styles.textStyle1}>{profileDetails?.user?.name}</Text>
                                <Text style={styles.textStyle2}>Therapist</Text>
                                <Text style={styles.textStyle2}>{profileDetails?.qualification_list ? profileDetails.qualification_list.replace(/,/g, ', ') : ''}</Text>
                                <Text style={styles.textStyle2}>{profileDetails?.experience} Years Experience</Text>
                                <Text style={styles.textStyle2}>Language : <Text style={styles.innerText}>{profileDetails?.languages_list ? profileDetails.languages_list.replace(/,/g, ', ') : ''}</Text></Text>
                            </View>

                        </View>
                        <View style={styles.totalValue2stSection}>
                            <Text style={styles.totalValue2stSectionHeader}>Appointment Time :</Text>
                            <View style={styles.totalValue2stSectionDetails}>
                                <View style={styles.imageSection1st}>
                                    <Image
                                        source={dateIcon}
                                        style={styles.imageSection1stImg}
                                    />
                                    <Text style={styles.imageSection1stText}>{moment(previousPageData?.date).format('ddd, D MMMM')}</Text>
                                </View>
                                <View style={styles.imageSection2nd}>
                                    <Image
                                        source={timeIcon}
                                        style={styles.imageSection1stImg}
                                    />
                                    <Text style={styles.imageSection1stText}>{convertTime(minTime)} - {convertTime(maxTime)}</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                    <View style={styles.total2Value}>
                        <View style={styles.total2Value1stSection}>
                            <Image
                                source={walletBlack}
                                style={styles.total2Value1stSectionImg}
                            />
                            <Text style={styles.total2Value1stSectionText}>Wallet Balance</Text>
                        </View>
                        <View style={styles.total2Value2ndSection}>
                            <Text style={styles.total2Value2ndSectionText}>₹{walletBalance}</Text>

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
                    <View style={styles.total3Value}>
                        <View style={{ marginTop: 10 }}>
                            <Text style={styles.couponText}>Enter Coupon Code</Text>
                            <InputField
                                label={'Enter Coupon'}
                                keyboardType=" "
                                value={couponCode}
                                //helperText={'Please enter lastname'}
                                inputType={'coupon'}
                                onChangeText={(text) => changeCouponCode(text)}
                            />
                        </View>
                        {couponDeduction === 0 ?
                            <TouchableOpacity style={styles.callCouponButton} onPress={() => callForCoupon()}>
                                {isCouponLoading ? (
                                    <ActivityIndicator size="small" color="#417AA4" />
                                ) : (
                                    <Text style={styles.callCouponText}>APPLY</Text>
                                )}
                            </TouchableOpacity>
                            :
                            <Text style={styles.callCouponText2}>Coupon already applied</Text>
                        }
                    </View>

                    <View style={styles.total4Value}>
                        <View style={styles.total4ValueHeader}>
                            <Text style={styles.total4ValueHeaderText}>Price Details</Text>
                        </View>
                        <View style={{ padding: 10, }}>
                            <View style={styles.total4ValueSection}>
                                <Text style={styles.total4ValueSectiontext1}>Consultation Fees</Text>
                                <Text style={styles.total4ValueSectionvalue1}>₹{previousPageData?.transaction_amount}</Text>
                            </View>
                            {couponDeduction !== 0 ?
                                <View style={styles.total4ValueSection}>
                                    <Text style={styles.total4ValueSectiontext1}>Coupon Deduction</Text>
                                    <TouchableOpacity onPress={() => removeCoupon()}>
                                        <Text style={styles.removeButton}>Remove</Text>
                                    </TouchableOpacity>
                                    <Text style={styles.total4ValueSectionvalue1}>- ₹{couponDeduction}</Text>
                                </View> : null}
                            <View style={styles.total4ValueSection}>
                                <Text style={styles.total4ValueSectiontext1}>Applicable Taxes</Text>
                                <Text style={styles.total4ValueSectionvalue1}>₹{taxableAmount}</Text>
                            </View>
                            {isEnabled && walletDeduction > 0 ?
                                <View style={styles.total4ValueSection}>
                                    <Text style={styles.total4ValueSectiontext1}>Wallet Deduction</Text>
                                    <Text style={styles.total4ValueSectionvalue1}>- ₹{walletDeduction}</Text>
                                </View>
                                : null}
                            <View style={styles.total4ValueSection}>
                                <Text style={styles.total4ValueSectiontext2}>Net Payable</Text>
                                <Text style={styles.total4ValueSectiontext2}>₹{payableAmount}</Text>
                            </View>
                        </View>
                    </View>
                </View>

            </ScrollView>
            <View style={styles.buttonwrapper}>
                <View style={styles.buttonwrapperSection1}>
                    <Text style={styles.buttonwrapperText1}>Consult Fees</Text>
                    <Text style={styles.buttonwrapperText2}>₹ {payableAmount}</Text>
                </View>
                <View style={{ marginTop: responsiveHeight(1) }}>
                    <CustomButton label={"Pay Now"}
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
        marginBottom: responsiveHeight(10)
    },
    wrapperinsideView: { marginBottom: responsiveHeight(5), alignSelf: 'center', marginTop: responsiveHeight(2) },
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
    totalValue1stSection: { flexDirection: 'row', justifyContent: 'space-between', },
    totalValue1stSectionDetails: { flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', width: responsiveWidth(25), },
    imageStyle: { height: 100, width: 90, borderRadius: 15, resizeMode: 'contain', marginBottom: responsiveHeight(1) },
    starStyle: { marginHorizontal: responsiveWidth(0.3), marginBottom: responsiveHeight(1), marginLeft: responsiveWidth(1.5) },
    reviewText: { fontSize: responsiveFontSize(1.7), color: '#746868', fontFamily: 'DMSans-Regular', },
    profileDetailsView: { flexDirection: 'column', width: responsiveWidth(53), },
    textStyle1: { fontSize: responsiveFontSize(2), color: '#2D2D2D', fontFamily: 'DMSans-Bold', marginBottom: responsiveHeight(1) },
    textStyle2: { fontSize: responsiveFontSize(1.7), color: '#746868', fontFamily: 'DMSans-Medium', marginBottom: responsiveHeight(1) },
    innerText: { fontSize: responsiveFontSize(1.7), color: '#959595', fontFamily: 'DMSans-Regular', },
    totalValue2stSection: { width: responsiveWidth(80), backgroundColor: '#F4F5F5', height: responsiveHeight(10), marginTop: responsiveHeight(2), borderRadius: 10, padding: 10, },
    totalValue2stSectionHeader: { color: '#2D2D2D', fontFamily: 'DMSans-Bold', fontSize: responsiveFontSize(1.7) },
    totalValue2stSectionDetails: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: responsiveHeight(2) },
    imageSection1st: { flexDirection: 'row', alignItems: 'center', width: responsiveWidth(30) },
    imageSection1stImg: { height: 20, width: 20, resizeMode: 'contain', marginRight: responsiveWidth(2) },
    imageSection1stText: { color: '#444343', fontFamily: 'DMSans-SemiBold', fontSize: responsiveFontSize(1.5) },
    imageSection2nd: { flexDirection: 'row', alignItems: 'center', width: responsiveWidth(40), marginLeft: responsiveWidth(1.5) },
    total2Value: { width: responsiveWidth(89), backgroundColor: '#FFFFFF', height: responsiveHeight(8), marginTop: responsiveHeight(2), borderRadius: 15, padding: 10, borderColor: '#E3E3E3', borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    total2Value1stSection: { width: responsiveWidth(40), flexDirection: 'row' },
    total2Value1stSectionImg: { height: 20, width: 20, marginRight: responsiveWidth(2) },
    total2Value1stSectionText: { color: '#2D2D2D', fontFamily: 'DMSans-SemiBold', fontSize: responsiveFontSize(2), },
    total2Value2ndSection: { width: responsiveWidth(30), justifyContent: 'center', alignItems: 'center', flexDirection: 'row' },
    total2Value2ndSectionText: { color: '#2D2D2D', fontFamily: 'DMSans-SemiBold', fontSize: responsiveFontSize(2), marginRight: responsiveWidth(5) },
    total3Value: { width: responsiveWidth(89), height: responsiveHeight(15), backgroundColor: '#FFF', padding: 10, borderRadius: 15, elevation: 5, justifyContent: 'center', marginTop: responsiveHeight(2) },
    couponText: { color: '#2D2D2D', fontFamily: 'DMSans-Bold', fontSize: responsiveFontSize(1.7), marginLeft: responsiveWidth(1) },
    callCouponButton: { position: 'absolute', right: 25, top: responsiveHeight(7) },
    callCouponText: { color: '#417AA4', fontFamily: 'DMSans-Bold', fontSize: responsiveFontSize(1.7), },
    callCouponText2: { position: 'absolute', right: 25, top: responsiveHeight(7), color: '#417AA4', fontFamily: 'DMSans-Bold', fontSize: responsiveFontSize(1.7), },
    switchStyle: {
        transform: [{ scaleX: 1.3 }, { scaleY: 1.3 }]  // Adjust scale values as needed
    },
    total4Value: {
        width: responsiveWidth(89),
        //height: responsiveHeight(28),
        backgroundColor: '#fff',
        borderRadius: 15,
        borderColor: '#E3E3E3',
        borderWidth: 1,
        marginTop: responsiveHeight(2),
        alignSelf: 'center'
    },
    total4ValueHeader: { flexDirection: 'row', height: responsiveHeight(7), backgroundColor: '#DEDEDE', borderTopRightRadius: 10, borderTopLeftRadius: 10, alignItems: 'center', },
    total4ValueHeaderText: { color: '#2D2D2D', fontFamily: 'DMSans-Bold', fontSize: responsiveFontSize(2), fontWeight: 'bold', textAlign: 'center', marginLeft: responsiveWidth(2) },
    total4ValueSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: responsiveHeight(2) },
    total4ValueSectiontext1: { color: '#746868', fontFamily: 'DMSans-Regular', fontSize: responsiveFontSize(1.7) },
    total4ValueSectionvalue1: { color: '#444343', fontFamily: 'DMSans-Medium', fontSize: responsiveFontSize(1.7) },
    removeButton: { color: '#E1293B', fontFamily: 'DMSans-Regular', fontSize: responsiveFontSize(1.7) },
    total4ValueSectiontext2: { color: '#444343', fontFamily: 'DMSans-SemiBold', fontSize: responsiveFontSize(1.7) },
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
        width: responsiveWidth(100),
        backgroundColor: '#fff'
    },
    buttonwrapperSection1: { flexDirection: 'column', },
    buttonwrapperText1: { color: '#746868', fontSize: responsiveFontSize(1.7), fontFamily: 'DMSans-Medium', },
    buttonwrapperText2: { color: '#444343', fontSize: responsiveFontSize(2.5), fontFamily: 'DMSans-Bold', marginTop: 10 },



});
