import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, SafeAreaView, StyleSheet, ScrollView, StatusBar, Image, FlatList, TouchableOpacity, Animated, KeyboardAwareScrollView, useWindowDimensions } from 'react-native'
import CustomHeader from '../../components/CustomHeader'
import Feather from 'react-native-vector-icons/Feather';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions'
import { TextInput, LongPressGestureHandler, State } from 'react-native-gesture-handler'
import { bookmarkedFill, deleteImg, editImg, milkImg, phoneImg, searchImg, userPhoto, wallet, walletCredit } from '../../utils/Images'
import { API_URL } from '@env'
import axios from 'axios';
import AsyncStorage from "@react-native-async-storage/async-storage";
import Loader from '../../utils/Loader';
import moment from "moment"
import StarRating from 'react-native-star-rating';
import InputField from '../../components/InputField';
import CustomButton from '../../components/CustomButton';


const Bookmarked = ({ navigation }) => {

    const [walletHistory, setWalletHistory] = React.useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [starCount, setStarCount] = useState(4)
    const [address, setaddress] = useState('');
    const [addressError, setaddressError] = useState('')

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
            <CustomHeader commingFrom={'Bookmarked Therapist'} onPress={() => navigation.goBack()} title={'Bookmarked Therapist'} />
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
                                    starStyle={{ marginHorizontal: responsiveWidth(0.5), marginBottom: responsiveHeight(1) }}
                                />
                                <Text style={{ fontSize: responsiveFontSize(1.7), color: '#746868', fontFamily: 'DMSans-Regular', }}>100+ Reviews</Text>
                            </View>
                            <View style={{ flexDirection: 'column', width: responsiveWidth(45), }}>
                                <Text style={{ fontSize: responsiveFontSize(2), color: '#2D2D2D', fontFamily: 'DMSans-Bold', marginBottom: responsiveHeight(1) }}>Jennifer Kourtney</Text>
                                <Text style={{ fontSize: responsiveFontSize(1.7), color: '#746868', fontFamily: 'DMSans-Medium', marginBottom: responsiveHeight(1) }}>Therapist</Text>
                                <Text style={{ fontSize: responsiveFontSize(1.7), color: '#746868', fontFamily: 'DMSans-Medium', marginBottom: responsiveHeight(1) }}>M.PHIL ( Clinical Psycology)</Text>
                                <Text style={{ fontSize: responsiveFontSize(1.7), color: '#746868', fontFamily: 'DMSans-Regular', marginBottom: responsiveHeight(1) }}>1 Year Experience</Text>
                                <Text style={{ fontSize: responsiveFontSize(1.7), color: '#746868', fontFamily: 'DMSans-Medium', marginBottom: responsiveHeight(1) }}>Language : <Text style={{ fontSize: responsiveFontSize(1.7), color: '#959595', fontFamily: 'DMSans-Regular', }}>Hindi, English</Text></Text>
                            </View>
                            <View style={{ width: responsiveWidth(8), }}>
                                <Image
                                    source={bookmarkedFill}
                                    style={{ height: 25, width: 25 }}
                                />
                            </View>
                        </View>
                        <View style={{ width: responsiveWidth(80), backgroundColor: '#F4F5F5', height: responsiveHeight(5), marginTop: responsiveHeight(2), borderRadius: 10, padding: 2, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ color: '#444343', fontFamily: 'DMSans-Medium', fontSize: responsiveFontSize(1.3) }}>₹1500 for 30 Min Booking</Text>
                            <View
                                style={{
                                    height: '80%',
                                    width: 1,
                                    backgroundColor: '#E3E3E3',
                                    marginLeft: 5,
                                    marginRight: 5,
                                }}
                            />
                            <Text style={{ color: '#444343', fontFamily: 'DMSans-Medium', fontSize: responsiveFontSize(1.3) }}>Avl. Slot : Today 09:00 PM</Text>
                        </View>
                        <View style={{marginTop: responsiveHeight(1)}}>
                            <CustomButton label={"Book Now"}
                                onPress={() => submitReview()}
                            />
                        </View>
                    </View>

                    {/* <View style={styles.buttonwrapper}>
                        <CustomButton label={"Submit Review"}
                            onPress={() => submitReview()}
                        />
                    </View> */}
                </View>

            </ScrollView>
        </SafeAreaView>
    )
}

export default Bookmarked

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
        height: responsiveHeight(38),
        //alignItems: 'center',
        backgroundColor: '#FFF',
        //justifyContent: 'center',
        padding: 15,
        borderRadius: 15,
        elevation: 5
    }

});
