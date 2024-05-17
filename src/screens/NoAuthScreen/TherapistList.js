import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, SafeAreaView, StyleSheet, ScrollView, StatusBar, Image, FlatList, TouchableOpacity, Animated, KeyboardAwareScrollView, useWindowDimensions, Switch } from 'react-native'
import CustomHeader from '../../components/CustomHeader'
import Feather from 'react-native-vector-icons/Feather';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions'
import { TextInput, LongPressGestureHandler, State } from 'react-native-gesture-handler'
import { bookmarkedFill, cameraColor, chatColor, dateIcon, deleteImg, editImg, filterImg, milkImg, phoneColor, phoneImg, searchImg, timeIcon, userPhoto, wallet, walletBlack, walletCredit } from '../../utils/Images'
import { API_URL } from '@env'
import axios from 'axios';
import AsyncStorage from "@react-native-async-storage/async-storage";
import Loader from '../../utils/Loader';
import moment from "moment"
import StarRating from 'react-native-star-rating';
import InputField from '../../components/InputField';
import CustomButton from '../../components/CustomButton';


const TherapistList = ({ navigation }) => {

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
            <CustomHeader commingFrom={'Therapist'} onPress={() => navigation.goBack()} title={'Therapist'} />
            <ScrollView style={styles.wrapper}>
                <View style={{ marginBottom: responsiveHeight(5), alignSelf: 'center', marginTop: responsiveHeight(2) }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: responsiveHeight(2) }}>
                        <View style={{ width: responsiveWidth(65),}}>
                            <Text style={{ fontSize: responsiveFontSize(2), color: '#2D2D2D', fontFamily: 'DMSans-Bold', }}>Type for therapy</Text>
                        </View>
                        <View style={{ width: responsiveWidth(20), flexDirection:'row',justifyContent:'space-between',alignItems:'center' }}>
                            <Image
                                source={filterImg}
                                style={{ height: 20, width: 20 }}
                            />
                            <Text style={{ fontSize: responsiveFontSize(2), color: '#2D2D2D', fontFamily: 'DMSans-Bold', }}>Filter</Text>
                        </View>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: responsiveHeight(2) }}>
                        <View style={{height: responsiveHeight(5),width: responsiveWidth(27),backgroundColor:'#ECFCFA',borderColor:'#87ADA8',borderWidth:1,borderRadius:20,justifyContent:'center',alignItems:'center'}}>
                            <Text style={{color:'#2D2D2D',fontFamily:'DMSans-Bold',fontSize: responsiveFontSize(1.7)}}>Individual</Text>
                        </View>
                        <View style={{height: responsiveHeight(5),width: responsiveWidth(27),backgroundColor:'#FFF',borderColor:'#87ADA8',borderWidth:1,borderRadius:20,justifyContent:'center',alignItems:'center'}}>
                        <Text style={{color:'#746868',fontFamily:'DMSans-Medium',fontSize: responsiveFontSize(1.7)}}>Couple</Text>
                        </View>
                        <View style={{height: responsiveHeight(5),width: responsiveWidth(27),backgroundColor:'#FFF',borderColor:'#87ADA8',borderWidth:1,borderRadius:20,justifyContent:'center',alignItems:'center'}}>
                        <Text style={{color:'#746868',fontFamily:'DMSans-Medium',fontSize: responsiveFontSize(1.7)}}>Child</Text>
                        </View>
                    </View>
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
                                    starStyle={{ marginHorizontal: responsiveWidth(0.5), marginBottom: responsiveHeight(1) }}
                                />
                                <Text style={{ fontSize: responsiveFontSize(1.7), color: '#746868', fontFamily: 'DMSans-Regular', }}>100+ Reviews</Text>
                            </View>
                            <View style={{ flexDirection: 'column', width: responsiveWidth(47), height: responsiveHeight(10) }}>
                                <Text style={{ fontSize: responsiveFontSize(2), color: '#2D2D2D', fontFamily: 'DMSans-Bold', marginBottom: responsiveHeight(1) }}>Jennifer Kourtney</Text>
                                <Text style={{ fontSize: responsiveFontSize(1.7), color: '#746868', fontFamily: 'DMSans-Medium', marginBottom: responsiveHeight(1) }}>M.PHIL ( Clinical Psycology)</Text>
                                <Text style={{ fontSize: responsiveFontSize(1.7), color: '#746868', fontFamily: 'DMSans-Regular', marginBottom: responsiveHeight(1) }}>1 Year Experience</Text>
                                <Text style={{ fontSize: responsiveFontSize(1.7), color: '#746868', fontFamily: 'DMSans-Medium', marginBottom: responsiveHeight(1) }}>Language : <Text style={{ fontSize: responsiveFontSize(1.7), color: '#959595', fontFamily: 'DMSans-Regular', }}>Hindi, English</Text></Text>
                                <Text style={{ fontSize: responsiveFontSize(1.7), color: '#746868', fontFamily: 'DMSans-Medium', marginBottom: responsiveHeight(1) }}>₹1500 for 30 Min</Text>
                                <Text style={{ fontSize: responsiveFontSize(1.5), color: '#444343', fontFamily: 'DMSans-Medium', marginBottom: responsiveHeight(1) }}>Next Avl. Slot : Today 09:00 PM</Text>
                            </View>
                            <View style={{ width: responsiveWidth(6), }}>
                                <Image
                                    source={bookmarkedFill}
                                    style={{ height: 25, width: 25 }}
                                />
                            </View>
                        </View>
                        <View style={{ marginTop: responsiveHeight(2), borderRadius: 10, padding: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <View style={{ height: responsiveHeight(7), width: responsiveWidth(17), backgroundColor: '#ECFCFA', borderColor: '#87ADA8', borderWidth: 1, borderRadius: 10, justifyContent: 'center', alignItems: 'center' }}>
                                <Text style={{ color: '#607875', fontFamily: 'DMSans-Medium', fontSize: responsiveFontSize(1.7), textAlign: 'center' }}>Instant Connect</Text>
                            </View>
                            <View style={{ height: responsiveHeight(7), width: responsiveWidth(17), backgroundColor: '#FFF', borderColor: '#87ADA8', borderWidth: 1, borderRadius: 10, justifyContent: 'center', alignItems: 'center' }}>
                                <Image
                                    source={cameraColor}
                                    style={{ height: 25, width: 25 }}
                                />
                            </View>
                            <View style={{ height: responsiveHeight(7), width: responsiveWidth(17), backgroundColor: '#FFF', borderColor: '#87ADA8', borderWidth: 1, borderRadius: 10, justifyContent: 'center', alignItems: 'center' }}>
                                <Image
                                    source={phoneColor}
                                    style={{ height: 25, width: 25 }}
                                />
                            </View>
                            <View style={{ height: responsiveHeight(7), width: responsiveWidth(17), backgroundColor: '#FFF', borderColor: '#87ADA8', borderWidth: 1, borderRadius: 10, justifyContent: 'center', alignItems: 'center' }}>
                                <Image
                                    source={chatColor}
                                    style={{ height: 25, width: 25 }}
                                />
                            </View>
                        </View>
                    </View>
                </View>

            </ScrollView>

        </SafeAreaView >
    )
}

export default TherapistList

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
