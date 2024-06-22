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

        <View style={styles.upcomingView}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>

                <Image
                    source={{ uri: item?.therapist?.profile_pic }}
                    style={styles.cardImg}
                />
                <View style={{ flexDirection: 'column', marginLeft: responsiveWidth(3), width: responsiveWidth(40), }}>
                    <Text style={styles.nameText}>
                        {item?.therapist?.name}
                    </Text>
                    <Text style={styles.nameSubText2}>
                        Therapist
                    </Text>
                </View>
                <TouchableOpacity style={styles.joinNowButton} onPress={() => navigation.navigate('ChatScreen', { details: item })}>
                    <Text style={styles.joinNowText}>Join Now</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.dateTimeView}>
                <View style={styles.dateView1}>
                    <Image
                        source={dateIcon}
                        style={styles.datetimeIcon}
                    />
                    <Text style={styles.dateTimeText}>{moment(item?.date).format('ddd, D MMMM')}</Text>
                </View>
                <View style={styles.dateView2}>
                    <Image
                        source={timeIcon}
                        style={styles.datetimeIcon}
                    />
                    <Text style={styles.dateTimeText}>{moment(item?.start_time, 'HH:mm:ss').format('h:mm A')} - {moment(item?.end_time, 'HH:mm:ss').format('h:mm A')}</Text>
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
                    <View style={styles.previousBookingView}>
                        <View style={styles.previousBooking1stRow}>
                            <Text style={styles.previousBookingName}>Rohit Sharma</Text>
                            <View style={styles.previousBookingStatusView}>
                                <Image
                                    source={GreenTick}
                                    style={styles.previousBookingStatusIcon}
                                />
                                <Text style={styles.previousBookingStatusText}>Completed</Text>
                            </View>
                        </View>
                        <View style={styles.previousBookingContentView}>
                            <Text style={styles.previousBookingContentHeader}>Order ID :</Text>
                            <Text style={styles.previousBookingContentValue}>1923659</Text>
                        </View>
                        <View style={styles.previousBookingContentView}>
                            <Text style={styles.previousBookingContentHeader}>Date :</Text>
                            <Text style={styles.previousBookingContentValue}>24-02-2024, 09:30 PM</Text>
                        </View>
                        <View style={styles.previousBookingContentView}>
                            <Text style={styles.previousBookingContentHeader}>Appointment Time :</Text>
                            <Text style={styles.previousBookingContentValue}>60 Min</Text>
                        </View>
                        <View style={styles.previousBookingContentView}>
                            <Text style={styles.previousBookingContentHeader}>Rate :</Text>
                            <Text style={styles.previousBookingContentValue}>Rs 1100 for 30 Min</Text>
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
    upcomingView: {
        width: responsiveWidth(89),
        backgroundColor: '#FFF',
        padding: 20,
        borderRadius: 20,
        marginTop: responsiveHeight(1),
        marginBottom: responsiveHeight(1),
        elevation: 5,
        alignSelf: 'center'
    },
    cardImg: {
        height: 50,
        width: 50,
        borderRadius: 25
    },
    nameText: {
        color: '#2D2D2D',
        fontSize: responsiveFontSize(2),
        fontFamily: 'DMSans-Bold',
        marginBottom: 5,
    },
    nameSubText2: {
        color: '#746868',
        fontFamily: 'DMSans-Regular',
        fontSize: responsiveFontSize(1.5)
    },
    joinNowButton: {
        marginLeft: responsiveWidth(2),
        backgroundColor: '#EEF8FF',
        borderColor: '#417AA4',
        borderWidth: 1,
        padding: 10,
        borderRadius: 20,
        flexDirection: 'row',
        justifyContent: 'center'
    },
    joinNowText: {
        fontFamily: 'DMSans-Bold',
        color: '#2D2D2D',
        fontSize: responsiveFontSize(1.7)
    },
    dateTimeView: {
        height: responsiveHeight(5),
        width: responsiveWidth(80),
        marginTop: responsiveHeight(2),
        borderColor: '#E3E3E3',
        borderWidth: 1,
        borderRadius: 20,
        padding: 5,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    dateView1: {
        flexDirection: 'row',
        alignItems: 'center',
        width: responsiveWidth(25)
    },
    dateView2: {
        flexDirection: 'row',
        alignItems: 'center',
        width: responsiveWidth(40)
    },
    datetimeIcon: {
        height: 20,
        width: 20,
        resizeMode: 'contain',
        marginRight: responsiveWidth(2)
    },
    dateTimeText: {
        color: '#444343',
        fontFamily: 'DMSans-SemiBold',
        fontSize: responsiveFontSize(1.5)
    },
    previousBookingView: {
        width: '99%',
        backgroundColor: '#FFF',
        padding: 20,
        borderRadius: 20,
        marginTop: responsiveHeight(2),
        borderColor: '#F4F5F5',
        borderWidth: 2,
    },
    previousBooking1stRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    previousBookingName: {
        color: '#2D2D2D',
        fontSize: responsiveFontSize(2),
        fontFamily: 'DMSans-Bold'
    },
    previousBookingStatusView: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    previousBookingStatusIcon: {
        height: 20,
        width: 20,
        resizeMode: 'contain'
    },
    previousBookingStatusText: {
        color: '#444343',
        fontSize: responsiveFontSize(1.7),
        fontFamily: 'DMSans-SemiBold',
        marginLeft: responsiveWidth(1)
    },
    previousBookingContentView: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: responsiveHeight(1.5)
    },
    previousBookingContentHeader: {
        color: '#444343',
        fontFamily: 'DMSans-Medium',
        fontSize: responsiveFontSize(1.7),
        marginRight: responsiveWidth(2)
    },
    previousBookingContentValue: {
        color: '#746868',
        fontFamily: 'DMSans-Medium',
        fontSize: responsiveFontSize(1.7)
    }

});
