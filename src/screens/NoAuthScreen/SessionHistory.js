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

    const [isModalVisible, setModalVisible] = useState(false);

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
                    <View style={styles.singleView}>
                        <View style={styles.singleView1strow}>
                            <Text style={styles.singleViewName}>Rohit Sharma</Text>
                            <View style={styles.singleView2ndrow}>
                                <Image
                                    source={GreenTick}
                                    style={styles.iconStyle}
                                />
                                <Text style={styles.singleViewStatus}>Completed</Text>
                            </View>
                        </View>
                        <View style={styles.singleViewcoloumn}>
                            <Text style={styles.singleViewColumnHeader}>Order ID :</Text>
                            <Text style={styles.singleViewColomnValue}>1923659</Text>
                        </View>
                        <View style={styles.singleViewcoloumn}>
                            <Text style={styles.singleViewColumnHeader}>Date :</Text>
                            <Text style={styles.singleViewColomnValue}>24-02-2024, 09:30 PM</Text>
                        </View>
                        <View style={styles.singleViewcoloumn}>
                            <Text style={styles.singleViewColumnHeader}>Appointment Time :</Text>
                            <Text style={styles.singleViewColomnValue}>60 Min</Text>
                        </View>
                        <View style={styles.singleViewcoloumn}>
                            <Text style={styles.singleViewColumnHeader}>Rate :</Text>
                            <Text style={styles.singleViewColomnValue}>Rs 1100 for 30 Min</Text>
                        </View>
                        <View style={{ marginTop: responsiveHeight(1.5) }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text style={styles.singleViewColumnHeader}>Session Summary :</Text>
                            </View>
                            <Text style={styles.summaryValue}>The consultation session focused on exploring and addressing the patient's mental health concerns. The patient expressed their struggles with anxiety and depressive symptoms, impacting various aspects of their daily life. The therapist employed a person-centered approach, providing a safe and non-judgmental space for the patient to share their experiences.</Text>
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
    singleView: {
        width: '99%',
        backgroundColor: '#FFF',
        padding: 20,
        borderRadius: 20,
        marginTop: responsiveHeight(2),
        borderColor: '#F4F5F5',
        borderWidth: 2,
    },
    singleView1strow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    singleViewName: {
        color: '#2D2D2D',
        fontSize: responsiveFontSize(2),
        fontFamily: 'DMSans-Bold'
    },
    singleView2ndrow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    iconStyle: {
        height: 20,
        width: 20,
        resizeMode: 'contain'
    },
    singleViewStatus: {
        color: '#444343',
        fontSize: responsiveFontSize(1.7),
        fontFamily: 'DMSans-SemiBold',
        marginLeft: responsiveWidth(1)
    },
    singleViewcoloumn: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: responsiveHeight(1.5)
    },
    singleViewColumnHeader: {
        color: '#444343',
        fontFamily: 'DMSans-Medium',
        fontSize: responsiveFontSize(1.7),
        marginRight: responsiveWidth(2)
    },
    singleViewColomnValue: {
        color: '#746868',
        fontFamily: 'DMSans-Medium',
        fontSize: responsiveFontSize(1.7)
    },
    summaryValue: {
        color: '#746868',
        fontFamily: 'DMSans-Medium',
        fontSize: responsiveFontSize(1.7),
        marginTop: 5
    }
});
