import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, SafeAreaView, StyleSheet, ScrollView, StatusBar, Image, FlatList, TouchableOpacity, Animated, KeyboardAwareScrollView, useWindowDimensions } from 'react-native'
import CustomHeader from '../../components/CustomHeader'
import Feather from 'react-native-vector-icons/Feather';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions'
import { TextInput, LongPressGestureHandler, State } from 'react-native-gesture-handler'
import { deleteImg, editImg, milkImg, phoneImg, searchImg, userPhoto, wallet, walletCredit } from '../../utils/Images'
import { API_URL } from '@env'
import axios from 'axios';
import AsyncStorage from "@react-native-async-storage/async-storage";
import Loader from '../../utils/Loader';
import moment from "moment"
import StarRating from 'react-native-star-rating';
import InputField from '../../components/InputField';
import CustomButton from '../../components/CustomButton';


const ReviewScreen = ({ navigation }) => {

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
            <CustomHeader commingFrom={'Write Review'} onPress={() => navigation.goBack()} title={'Write Review'} />
            <ScrollView style={styles.wrapper}>
                <View style={{ marginBottom: responsiveHeight(5), alignSelf: 'center', marginTop: responsiveHeight(2) }}>
                    <View style={styles.totalValue}>
                        <Image
                            source={userPhoto}
                            style={{ height: 90, width: 90, borderRadius: 90 / 2, resizeMode: 'contain' }}
                        />
                        <Text style={{ fontSize: responsiveFontSize(2.5), color: '#2D2D2D', fontFamily: 'DMSans-Bold', marginTop: responsiveHeight(2) }}>Jennifer Kourtney</Text>
                        <Text style={{ fontSize: responsiveFontSize(2), color: '#746868', fontFamily: 'DMSans-Medium', marginTop: responsiveHeight(2) }}>Therapist</Text>
                    </View>
                    <Text style={{ fontSize: responsiveFontSize(2), color: '#746868', fontFamily: 'DMSans-Regular', textAlign: 'center', marginTop: responsiveHeight(2) }}>How was your experience?</Text>
                    <View style={{ alignSelf: 'center', width: responsiveWidth(50), marginTop: responsiveHeight(2) }}>
                        <StarRating
                            disabled={true}
                            maxStars={5}
                            rating={starCount}
                            selectedStar={(rating) => setStarCount(rating)}
                            fullStarColor={'#FFCB45'}
                            starSize={30}
                            starStyle={{ marginHorizontal: responsiveWidth(1) }}
                        />
                    </View>
                    <View style={{marginTop: responsiveHeight(1)}}>
                        <InputField
                            label={'Enter your review...'}
                            keyboardType="default"
                            value={address}
                            helperText={addressError}
                            inputType={'address'}
                            inputFieldType={'address'}
                            onChangeText={(text) => {
                                setaddress(text)
                            }}
                        />
                    </View>
                    <View style={styles.buttonwrapper}>
                        <CustomButton label={"Submit Review"}
                            onPress={() => submitReview()}
                        />
                    </View>
                    <Text style={{fontSize: responsiveFontSize(1.7), color: '#808080', fontFamily: 'DMSans-Regular', textAlign: 'center',}}>Skip</Text>
                </View>

            </ScrollView>
        </SafeAreaView>
    )
}

export default ReviewScreen

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
        height: responsiveHeight(28),
        alignItems: 'center',
        backgroundColor: '#F4F5F5',
        //justifyContent: 'center',
        padding: 20,
        borderRadius: 15
    }

});
