import React, { useContext, useState, useEffect } from 'react';
import { View, Text, SafeAreaView, StyleSheet, ScrollView, ImageBackground, Image, Platform, Alert } from 'react-native'
import CustomHeader from '../../components/CustomHeader'
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { ArrowGratter, ArrowUp, GreenTick, Payment, YellowTck, dateIcon, notifyImg, timeIcon, userPhoto } from '../../utils/Images'
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NoNotification from './NoNotification';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { Dropdown } from 'react-native-element-dropdown';
import Modal from "react-native-modal";
import Icon from 'react-native-vector-icons/Entypo';
import InputField from '../../components/InputField';
import CustomButton from '../../components/CustomButton';
const data = [
    { label: 'Today', value: '1' },
    { label: 'Date Wise', value: '2' },
];

const SessionHistory = ({ navigation }) => {
    const [notifications, setNotifications] = useState([]);
    const [notifyStatus, setnotifyStatus] = useState(false)
    const [value, setValue] = useState('1');
    const [isFocus, setIsFocus] = useState(false);
    const [isModalVisible, setModalVisible] = useState(false);
    const toggleModal = () => {
        setModalVisible(!isModalVisible);
    };

    useEffect(() => {
        if (Platform.OS == 'android') {
            const unsubscribeForeground = messaging().onMessage(async remoteMessage => {
                Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage));
                console.log('Received foreground message:', JSON.stringify(remoteMessage));
                setNotifications(prevNotifications => {
                    const newNotifications = [...prevNotifications, remoteMessage];
                    AsyncStorage.setItem('notifications', JSON.stringify(newNotifications));
                    setnotifyStatus(true)
                    return newNotifications;
                });
            });

            const unsubscribeBackground = messaging().setBackgroundMessageHandler(async remoteMessage => {
                console.log('Received background message:', remoteMessage);
                setNotifications(prevNotifications => {
                    const newNotifications = [...prevNotifications, remoteMessage];
                    AsyncStorage.setItem('notifications', JSON.stringify(newNotifications));
                    setnotifyStatus(true)
                    return newNotifications;
                });
            });

            // Load notifications from AsyncStorage when component mounts
            AsyncStorage.getItem('notifications').then((value) => {
                if (value !== null) {
                    setNotifications(JSON.parse(value));
                    setnotifyStatus(true)
                }
            });

            return () => {
                unsubscribeForeground();
                //unsubscribeBackground();
            };
        }
    }, [])

    const handleSwipeLeft = (index) => {
        const updatedNotifications = [...notifications];
        updatedNotifications.splice(index, 1); // Remove the notification at the given index
        setNotifications(updatedNotifications);
        AsyncStorage.setItem('notifications', JSON.stringify(updatedNotifications)); // Update AsyncStorage
    }


    return (
        <SafeAreaView style={styles.Container}>
            <CustomHeader commingFrom={'Session History'} onPress={() => navigation.goBack()} title={'Session History'} />
            <ScrollView style={styles.wrapper}>
                <View style={{ alignItems: 'center', marginBottom: responsiveHeight(3) }}>

                    {/* <View style={{ backgroundColor: '#FFFFFF', height: responsiveHeight(10), width: responsiveWidth(89), borderRadius: 20, padding: 10, elevation: 2, marginTop: responsiveHeight(2) }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={{ color: '#07273E', fontSize: responsiveFontSize(2), fontFamily: 'DMSans-Medium' }}>Earning Breakdown</Text>
                            <Image
                                source={ArrowUp}
                                style={{ height: 20, width: 20, resizeMode: 'contain' }}
                            />
                        </View>
                    </View> */}
                    <View style={{ width: '99%', backgroundColor: '#FFF', padding: 20, borderRadius: 20, marginTop: responsiveHeight(2), borderColor: '#F4F5F5', borderWidth: 2, }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={{ color: '#2D2D2D', fontSize: responsiveFontSize(2), fontFamily: 'DMSans-Bold' }}>Rohit Sharma</Text>
                            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                <Image
                                    source={GreenTick}
                                    style={{ height: 20, width: 20, resizeMode: 'contain' }}
                                />
                                <Text style={{ color: '#444343', fontSize: responsiveFontSize(1.7), fontFamily: 'DMSans-SemiBold', marginLeft: responsiveWidth(1) }}>Completed</Text>
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: responsiveHeight(1.5) }}>
                            <Text style={{ color: '#444343', fontFamily: 'DMSans-Medium', fontSize: responsiveFontSize(1.7), marginRight: responsiveWidth(2) }}>Order ID :</Text>
                            <Text style={{ color: '#746868', fontFamily: 'DMSans-Medium', fontSize: responsiveFontSize(1.7) }}>1923659</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: responsiveHeight(1.5) }}>
                            <Text style={{ color: '#444343', fontFamily: 'DMSans-Medium', fontSize: responsiveFontSize(1.7), marginRight: responsiveWidth(2) }}>Date :</Text>
                            <Text style={{ color: '#746868', fontFamily: 'DMSans-Medium', fontSize: responsiveFontSize(1.7) }}>24-02-2024, 09:30 PM</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: responsiveHeight(1.5) }}>
                            <Text style={{ color: '#444343', fontFamily: 'DMSans-Medium', fontSize: responsiveFontSize(1.7), marginRight: responsiveWidth(2) }}>Appointment Time :</Text>
                            <Text style={{ color: '#746868', fontFamily: 'DMSans-Medium', fontSize: responsiveFontSize(1.7) }}>60 Min</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: responsiveHeight(1.5) }}>
                            <Text style={{ color: '#444343', fontFamily: 'DMSans-Medium', fontSize: responsiveFontSize(1.7), marginRight: responsiveWidth(2) }}>Rate :</Text>
                            <Text style={{ color: '#746868', fontFamily: 'DMSans-Medium', fontSize: responsiveFontSize(1.7) }}>Rs 1100 for 30 Min</Text>
                        </View>
                        <View style={{ marginTop: responsiveHeight(1.5) }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text style={{ color: '#444343', fontFamily: 'DMSans-Medium', fontSize: responsiveFontSize(1.7), marginRight: responsiveWidth(2) }}>Session Summary :</Text>
                            </View>
                            <Text style={{ color: '#746868', fontFamily: 'DMSans-Medium', fontSize: responsiveFontSize(1.7), marginTop: 5 }}>The consultation session focused on exploring and addressing the patient's mental health concerns. The patient expressed their struggles with anxiety and depressive symptoms, impacting various aspects of their daily life. The therapist employed a person-centered approach, providing a safe and non-judgmental space for the patient to share their experiences.</Text>
                        </View>
                        <View style={{ marginTop: responsiveHeight(2) }}>
                            <CustomButton buttonColor={''} label={"Book Again"} onPress={() => { }} />
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}


export default SessionHistory


const styles = StyleSheet.create({
    Container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    wrapper: {
        padding: 15,
        //marginBottom: responsiveHeight(1)
    },
    dropdown: {
        //height: responsiveHeight(4),
        //borderColor: 'gray',
        //borderWidth: 0.7,
        //borderRadius: 8,
        //paddingHorizontal: 8,

    },
    placeholderStyle: {
        fontSize: 16,
        color: '#746868',
        fontFamily: 'DMSans-Regular'
    },
    selectedTextStyle: {
        fontSize: 16,
        color: '#746868',
        fontFamily: 'DMSans-Regular'
    },
    inputSearchStyle: {
        height: 40,
        fontSize: 16,
        color: '#746868',
        fontFamily: 'DMSans-Regular'
    },
    imageStyle: {
        height: 35,
        width: 35,
        marginBottom: 5,
        resizeMode: 'contain'
    },
    activeButtonInsideView: {
        backgroundColor: '#FFF',
        height: responsiveHeight(6),
        width: responsiveWidth(78),
        borderRadius: 15,
        borderColor: '#E3E3E3',
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        alignItems: 'center'
    },
    activeButtonInsideText: {
        color: '#2D2D2D',
        fontFamily: 'DMSans-Bold',
        fontSize: responsiveFontSize(1.7)
    },

});
