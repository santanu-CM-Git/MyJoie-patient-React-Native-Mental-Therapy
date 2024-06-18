import React, { useContext, useState, useEffect } from 'react';
import { View, Text, SafeAreaView, StyleSheet, ScrollView, Switch, Image, Platform, Alert, FlatList } from 'react-native'
import CustomHeader from '../../components/CustomHeader'
import CustomButton from '../../components/CustomButton';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { ArrowGratter, GreenTick, Payment, dateIcon, deleteImg, plus, timeIcon, userPhoto } from '../../utils/Images'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import Icon from 'react-native-vector-icons/Entypo';
import Modal from "react-native-modal";
import SwitchSelector from "react-native-switch-selector";
// import moment from 'moment';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import moment from 'moment-timezone';
import Loader from '../../utils/Loader';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { API_URL } from '@env'


const ScheduleScreen = ({ navigation }) => {

    const [activeTab, setActiveTab] = useState('Upcoming')
    const [isLoading, setIsLoading] = useState(true)
    const [upcomingBooking, setUpcomingBooking] = useState([])
    const [previousBooking, setPreviousBooking] = useState([])

    const fetchUpcomingBooking = () => {
        AsyncStorage.getItem('userToken', (err, usertoken) => {
            axios.post(`${API_URL}/patient/upcoming-slot`, {}, {
                headers: {
                    "Authorization": `Bearer ${usertoken}`,
                    "Content-Type": 'application/json'
                },
            })
                .then(res => {
                    //console.log(res.data,'user details')
                    let upcomingBooking = res.data.data;
                    console.log(upcomingBooking, 'upcomingBooking')
                    setUpcomingBooking(upcomingBooking)
                    setIsLoading(false);
                })
                .catch(e => {
                    console.log(`Login error ${e}`)
                    console.log(e.response?.data?.message)
                });
        });
    }

    useEffect(() => {
        fetchUpcomingBooking();
    }, [])
    useFocusEffect(
        React.useCallback(() => {
            fetchUpcomingBooking()
        }, [])
    )

    const renderUpcoming = ({ item }) => (

        <View style={{ width: responsiveWidth(89), backgroundColor: '#FFF', padding: 20, borderRadius: 20, marginTop: responsiveHeight(1), marginBottom: responsiveHeight(1), elevation: 5, alignSelf: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>

                <Image
                    source={{ uri: item?.therapist?.profile_pic }}
                    style={{ height: 50, width: 50, borderRadius: 25 }}
                />
                <View style={{ flexDirection: 'column', marginLeft: responsiveWidth(3), width: responsiveWidth(40), }}>
                    <Text style={{ color: '#2D2D2D', fontSize: responsiveFontSize(2), fontFamily: 'DMSans-Bold', marginBottom: 5, }}>
                        {item?.therapist?.name}
                    </Text>
                    <Text style={{ color: '#746868', fontFamily: 'DMSans-Regular', fontSize: responsiveFontSize(1.5) }}>
                        Therapist
                    </Text>
                </View>
                <TouchableOpacity style={{ marginLeft: responsiveWidth(2), backgroundColor: '#ECFCFA', borderColor: '#87ADA8', borderWidth: 1, padding: 10, borderRadius: 20, flexDirection: 'row', justifyContent: 'center' }} onPress={() => navigation.navigate('ChatScreen')}>
                    <Text style={{ fontFamily: 'DMSans-Bold', color: '#2D2D2D', fontSize: responsiveFontSize(1.7) }}>Join Now</Text>
                </TouchableOpacity>
            </View>
            <View style={{ height: responsiveHeight(5), width: responsiveWidth(80), marginTop: responsiveHeight(2), borderColor: '#E3E3E3', borderWidth: 1, borderRadius: 20, padding: 5, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', width: responsiveWidth(35) }}>
                    <Image
                        source={dateIcon}
                        style={{ height: 20, width: 20, resizeMode: 'contain', marginRight: responsiveWidth(2) }}
                    />
                    <Text style={{ color: '#444343', fontFamily: 'DMSans-SemiBold', fontSize: responsiveFontSize(1.5) }}>{moment(item?.date).format('ddd, D MMMM')}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', width: responsiveWidth(40) }}>
                    <Image
                        source={timeIcon}
                        style={{ height: 20, width: 20, resizeMode: 'contain', marginRight: responsiveWidth(2) }}
                    />
                    <Text style={{ color: '#444343', fontFamily: 'DMSans-SemiBold', fontSize: responsiveFontSize(1.5) }}>{moment(item?.start_time, 'HH:mm:ss').format('h:mm A')} - {moment(item?.end_time, 'HH:mm:ss').format('h:mm A')}</Text>
                </View>
            </View>
        </View>
    )

    if (isLoading) {
        return (
            <Loader />
        )
    }

    return (
        <SafeAreaView style={styles.Container}>
            <CustomHeader commingFrom={'Schedule'} onPress={() => navigation.goBack()} title={'Schedule'} />
            <ScrollView style={styles.wrapper}>
                <View style={{ marginBottom: responsiveHeight(3) }}>
                    <SwitchSelector
                        initial={0}
                        onPress={value => setActiveTab(value)}
                        textColor={'#746868'}
                        selectedColor={'#444343'}
                        buttonColor={'#FFFFFF'}
                        backgroundColor={'#F4F5F5'}
                        borderWidth={0}
                        height={responsiveHeight(7)}
                        valuePadding={6}
                        hasPadding
                        options={[
                            { label: "Upcoming", value: "Upcoming", }, //images.feminino = require('./path_to/assets/img/feminino.png')
                            { label: "Previous", value: "Previous", }, //images.masculino = require('./path_to/assets/img/masculino.png')
                        ]}
                        testID="gender-switch-selector"
                        accessibilityLabel="gender-switch-selector"
                    />

                </View>
                {activeTab == 'Upcoming' ?
                    <View style={{ marginBottom: responsiveHeight(2) }}>
                        <FlatList
                            data={upcomingBooking}
                            renderItem={renderUpcoming}
                            keyExtractor={(item) => item.id.toString()}
                            maxToRenderPerBatch={10}
                            windowSize={5}
                            initialNumToRender={10}
                            getItemLayout={(upcomingBooking, index) => (
                                { length: 50, offset: 50 * index, index }
                            )}
                        />
                    </View>
                    :
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
                        <View style={{ marginTop: responsiveHeight(2) }}>
                            <CustomButton buttonColor={''} label={"Book Again"} onPress={() => { }} />
                        </View>
                    </View>
                }
            </ScrollView>

        </SafeAreaView>
    )
}


export default ScheduleScreen


const styles = StyleSheet.create({
    Container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    wrapper: {
        padding: 15,
        //marginBottom: responsiveHeight(1)
    },
    activeButtonView: {
        backgroundColor: '#ECFCFA',
        height: responsiveHeight(5),
        width: responsiveWidth(45),
        borderRadius: 20,
        borderColor: '#87ADA8',
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    activeButtonText: {
        color: '#2D2D2D',
        fontFamily: 'DMSans-SemiBold',
        fontSize: responsiveFontSize(1.7)
    },
    inActiveButtonView: {
        backgroundColor: '#FFF',
        height: responsiveHeight(5),
        width: responsiveWidth(45),
        borderRadius: 20,
        borderColor: '#87ADA8',
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    inActiveButtonText: {
        color: '#746868',
        fontFamily: 'DMSans-Medium',
        fontSize: responsiveFontSize(1.7)
    },
    switchStyle: {
        transform: [{ scaleX: 1.3 }, { scaleY: 1.3 }]  // Adjust scale values as needed
    },
    activeButtonInsideView: {
        backgroundColor: '#FFF',
        height: responsiveHeight(5),
        width: responsiveWidth(40),
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
        fontFamily: 'DMSans-SemiBold',
        fontSize: responsiveFontSize(1.7)
    },
    inActiveButtonInsideView: {
        backgroundColor: '#F4F5F5',
        height: responsiveHeight(5),
        width: responsiveWidth(84),
        borderRadius: 15,
        borderColor: '#F4F5F5',
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        alignItems: 'center'
    },
    timePicker: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E3E3E3',
        borderRadius: 15,
        padding: 10,
        width: responsiveWidth(35),
        justifyContent: 'space-between'
    },
    icon: {
        width: 20,
        height: 20,
        resizeMode: 'contain',
    },
    timeRangeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    timeText: {
        marginRight: 10,
        fontSize: responsiveFontSize(1.7),
        color: '#746868'
    },
    deleteButton: {
        // Additional styles may be required
    },
    deleteIcon: {
        width: 24,
        height: 24,
    }

});
