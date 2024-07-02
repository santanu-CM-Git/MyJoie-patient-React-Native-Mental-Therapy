import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, SafeAreaView, StyleSheet, ScrollView, StatusBar, Image, FlatList, TouchableOpacity, Animated, KeyboardAwareScrollView, useWindowDimensions, Alert, Platform } from 'react-native'
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
import Toast from 'react-native-toast-message';


const ReviewScreen = ({ navigation, route }) => {

    const [walletHistory, setWalletHistory] = React.useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [starCount, setStarCount] = useState(0)
    const [address, setaddress] = useState('');
    const [addressError, setaddressError] = useState('')


    const submitForm = () => {
        const option = {
            "booked_slot_id": route?.params?.bookedId,
            "review": address,
            "star": starCount
        }
        setIsLoading(true)
        AsyncStorage.getItem('userToken', (err, usertoken) => {
            axios.post(`${API_URL}/patient/post-review`, option, {
                headers: {
                    Accept: 'application/json',
                    "Authorization": `Bearer ${usertoken}`,
                },
            })
                .then(res => {
                    console.log(res.data)
                    if (res.data.response == true) {
                        setIsLoading(false)
                        Toast.show({
                            type: 'success',
                            text1: 'Hello',
                            text2: "Upload data Successfully",
                            position: 'top',
                            topOffset: Platform.OS == 'ios' ? 55 : 20
                        });
                        navigation.navigate('Home')
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
            <CustomHeader commingFrom={'Write Review'} onPress={() => navigation.goBack()} title={'Write Review'} />
            <ScrollView style={styles.wrapper}>
                <View style={{ marginBottom: responsiveHeight(5), alignSelf: 'center', marginTop: responsiveHeight(2) }}>
                    <View style={styles.totalValue}>
                        <Image
                            source={{uri:route?.params?.therapistPic}}
                            style={{ height: 90, width: 90, borderRadius: 90 / 2, resizeMode: 'contain' }}
                        />
                        <Text style={{ fontSize: responsiveFontSize(2.5), color: '#2D2D2D', fontFamily: 'DMSans-Bold', marginTop: responsiveHeight(2) }}>{route?.params?.therapistName}</Text>
                        <Text style={{ fontSize: responsiveFontSize(2), color: '#746868', fontFamily: 'DMSans-Medium', marginTop: responsiveHeight(2) }}>Therapist</Text>
                    </View>
                    <Text style={{ fontSize: responsiveFontSize(2), color: '#746868', fontFamily: 'DMSans-Regular', textAlign: 'center', marginTop: responsiveHeight(2) }}>How was your experience?</Text>
                    <View style={{ alignSelf: 'center', width: responsiveWidth(50), marginTop: responsiveHeight(2) }}>
                        <StarRating
                            disabled={false}
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
                            onPress={() => submitForm()}
                        />
                    </View>
                    <TouchableOpacity onPress={()=> navigation.navigate('Home')}>
                    <Text style={{fontSize: responsiveFontSize(1.7), color: '#808080', fontFamily: 'DMSans-Regular', textAlign: 'center',}}>Skip</Text>
                    </TouchableOpacity>
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
