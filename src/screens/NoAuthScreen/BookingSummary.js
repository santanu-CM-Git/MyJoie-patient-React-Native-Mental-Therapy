import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, SafeAreaView, StyleSheet, ScrollView, StatusBar, Image, FlatList, TouchableOpacity, Animated, KeyboardAwareScrollView, useWindowDimensions, Switch } from 'react-native'
import CustomHeader from '../../components/CustomHeader'
import Feather from 'react-native-vector-icons/Feather';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions'
import { TextInput, LongPressGestureHandler, State } from 'react-native-gesture-handler'
import { bookmarkedFill, dateIcon, deleteImg, editImg, milkImg, phoneImg, searchImg, timeIcon, userPhoto, wallet, walletBlack, walletCredit } from '../../utils/Images'
import { API_URL } from '@env'
import axios from 'axios';
import AsyncStorage from "@react-native-async-storage/async-storage";
import Loader from '../../utils/Loader';
import moment from "moment"
import StarRating from 'react-native-star-rating';
import InputField from '../../components/InputField';
import CustomButton from '../../components/CustomButton';


const BookingSummary = ({ navigation }) => {

    const [walletHistory, setWalletHistory] = React.useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [starCount, setStarCount] = useState(4)
    const [address, setaddress] = useState('');
    const [addressError, setaddressError] = useState('')
    const [isEnabled, setIsEnabled] = useState(false);
    const toggleSwitch = () => setIsEnabled(previousState => !previousState);

    useEffect(() => {
        //fetchWalletHistory();
    }, [])

    const fetchWalletHistory = () => {
        AsyncStorage.getItem('userToken', (err, usertoken) => {

            axios.get(`${API_URL}/public/api/user/paydetails`, {
                headers: {
                    "Authorization": 'Bearer ' + usertoken,
                    "Content-Type": 'application/json'
                },
            })
                .then(res => {
                    console.log(res.data.paydetails, 'user details')
                    setWalletHistory(res.data.paydetails)
                    setIsLoading(false);
                })
                .catch(e => {
                    console.log(`Login error ${e}`)
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
                                    source={userPhoto}
                                    style={{ height: 100, width: 90, borderRadius: 15, resizeMode: 'contain', marginBottom: responsiveHeight(1) }}
                                />
                                <StarRating
                                    disabled={true}
                                    maxStars={5}
                                    rating={starCount}
                                    selectedStar={(rating) => setStarCount(rating)}
                                    fullStarColor={'#FFCB45'}
                                    starSize={12}
                                    starStyle={{ marginHorizontal: responsiveWidth(0.3), marginBottom: responsiveHeight(1),marginLeft: responsiveWidth(1.5) }}
                                />
                                <Text style={{ fontSize: responsiveFontSize(1.7), color: '#746868', fontFamily: 'DMSans-Regular', }}>100+ Reviews</Text>
                            </View>
                            <View style={{ flexDirection: 'column', width: responsiveWidth(53), }}>
                                <Text style={{ fontSize: responsiveFontSize(2), color: '#2D2D2D', fontFamily: 'DMSans-Bold', marginBottom: responsiveHeight(1) }}>Jennifer Kourtney</Text>
                                <Text style={{ fontSize: responsiveFontSize(1.7), color: '#746868', fontFamily: 'DMSans-Medium', marginBottom: responsiveHeight(1) }}>Therapist</Text>
                                <Text style={{ fontSize: responsiveFontSize(1.7), color: '#746868', fontFamily: 'DMSans-Medium', marginBottom: responsiveHeight(1) }}>M.PHIL ( Clinical Psycology)</Text>
                                <Text style={{ fontSize: responsiveFontSize(1.7), color: '#746868', fontFamily: 'DMSans-Regular', marginBottom: responsiveHeight(1) }}>1 Year Experience</Text>
                                <Text style={{ fontSize: responsiveFontSize(1.7), color: '#746868', fontFamily: 'DMSans-Medium', marginBottom: responsiveHeight(1) }}>Language : <Text style={{ fontSize: responsiveFontSize(1.7), color: '#959595', fontFamily: 'DMSans-Regular', }}>Hindi, English</Text></Text>
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
                    </View>
                    <View style={{ width: responsiveWidth(89), backgroundColor: '#FFFFFF', height: responsiveHeight(8), marginTop: responsiveHeight(2), borderRadius: 10, padding: 10, borderColor: '#E3E3E3', borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <View style={{ width: responsiveWidth(40), flexDirection: 'row'}}>
                            <Image
                                source={walletBlack}
                                style={{ height: 20, width: 20, marginRight: responsiveWidth(2) }}
                            />
                            <Text style={{ color: '#2D2D2D', fontFamily: 'DMSans-SemiBold', fontSize: responsiveFontSize(2), }}>Wallet Balance</Text>
                        </View>
                        <View style={{ width: responsiveWidth(30), justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }}>
                            <Text style={{ color: '#2D2D2D', fontFamily: 'DMSans-SemiBold', fontSize: responsiveFontSize(2), marginRight: responsiveWidth(5) }}>₹500</Text>

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
                                <Text style={{ color: '#444343', fontFamily: 'DMSans-Medium', fontSize: responsiveFontSize(1.7) }}>₹1399</Text>
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: responsiveHeight(2) }}>
                                <Text style={{ color: '#746868', fontFamily: 'DMSans-Regular', fontSize: responsiveFontSize(1.7) }}>Applicable Taxes</Text>
                                <Text style={{ color: '#444343', fontFamily: 'DMSans-Medium', fontSize: responsiveFontSize(1.7) }}>₹101</Text>
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: responsiveHeight(2) }}>
                                <Text style={{ color: '#746868', fontFamily: 'DMSans-Regular', fontSize: responsiveFontSize(1.7) }}>Wallet Balance</Text>
                                <Text style={{ color: '#444343', fontFamily: 'DMSans-Medium', fontSize: responsiveFontSize(1.7) }}>- ₹500</Text>
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: responsiveHeight(2) }}>
                                <Text style={{ color: '#444343', fontFamily: 'DMSans-SemiBold', fontSize: responsiveFontSize(1.7) }}>You Pay</Text>
                                <Text style={{ color: '#444343', fontFamily: 'DMSans-SemiBold', fontSize: responsiveFontSize(1.7) }}>₹1500</Text>
                            </View>
                        </View>
                    </View>
                </View>

            </ScrollView>
            <View style={styles.buttonwrapper}>
                <View style={{ flexDirection: 'column', }}>
                    <Text style={{ color: '#746868', fontSize: responsiveFontSize(1.7), fontFamily: 'DMSans-Medium', }}>Consult Fees</Text>
                    <Text style={{ color: '#444343', fontSize: responsiveFontSize(2.5), fontFamily: 'DMSans-Bold', marginTop: 10 }}>₹ 1500</Text>
                </View>
                <View style={{ marginTop: responsiveHeight(1) }}>
                    <CustomButton label={"Pay & Consult"}
                        onPress={() => navigation.navigate('PersonalInformation')}
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
