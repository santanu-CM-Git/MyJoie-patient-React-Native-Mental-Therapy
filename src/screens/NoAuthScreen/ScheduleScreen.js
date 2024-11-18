import React, { useContext, useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, SafeAreaView, StyleSheet, ScrollView, RefreshControl, Image, Platform, Alert, FlatList, Pressable } from 'react-native'
import CustomHeader from '../../components/CustomHeader'
import CustomButton from '../../components/CustomButton';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { ArrowGratter, GreenTick, YellowTck, RedCross, Payment, dateIcon, deleteImg, plus, timeIcon, userPhoto, dotIcon } from '../../utils/Images'
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
import Toast from 'react-native-toast-message';
import { AuthContext } from '../../context/AuthContext';

const ScheduleScreen = ({ navigation, route }) => {
    const timerRef = useRef(null);
    const { logout } = useContext(AuthContext);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState('Upcoming')
    const [activeButtonNo, setActiveButtonNo] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const [upcomingBooking, setUpcomingBooking] = useState([])
    const [previousBooking, setPreviousBooking] = useState([])
    // const [isFocus, setIsFocus] = useState(false);
    const [focusedItemId, setFocusedItemId] = useState(null);
    const [currentDateTime, setCurrentDateTime] = useState(new Date());

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
                    upcomingBooking.sort((a, b) => {
                        let dateA = new Date(a.date);
                        let dateB = new Date(b.date);
                        if (dateA < dateB) return -1;
                        if (dateA > dateB) return 1;

                        // If dates are the same, compare start_time
                        let timeA = a.start_time.split(':').map(Number);
                        let timeB = b.start_time.split(':').map(Number);
                        let dateTimeA = new Date(dateA.setHours(timeA[0], timeA[1]));
                        let dateTimeB = new Date(dateB.setHours(timeB[0], timeB[1]));

                        return dateTimeA - dateTimeB;
                    });
                    setUpcomingBooking(upcomingBooking)
                    setIsLoading(false);
                })
                .catch(e => {
                    console.log(`Login error ${e}`)
                    console.log(e.response?.data?.message)
                    Alert.alert('Oops..', e.response?.data?.message, [
                        { text: 'OK', onPress: () => e.response?.data?.message == 'Unauthorized' ? logout() : console.log('OK Pressed') },
                    ]);
                });
        });
    }
    // const fetchPreviousBooking = () => {
    //     AsyncStorage.getItem('userToken', (err, usertoken) => {
    //         axios.post(`${API_URL}/patient/previous-slot`, {}, {
    //             headers: {
    //                 "Authorization": `Bearer ${usertoken}`,
    //                 "Content-Type": 'application/json'
    //             },
    //         })
    //             .then(res => {
    //                 //console.log(res.data,'user details')
    //                 let previousBooking = res.data.data;
    //                 console.log(previousBooking, 'previous Booking data')
    //                 setPreviousBooking(previousBooking)
    //                 setIsLoading(false);
    //             })
    //             .catch(e => {
    //                 console.log(`Login error ${e}`)
    //                 console.log(e.response?.data?.message)
    //                 setIsLoading(false);
    //             });
    //     });
    // }
    const fetchPreviousBooking = async () => {
        setIsLoading(true);
        try {
            const usertoken = await AsyncStorage.getItem('userToken');
            if (!usertoken) {
                throw new Error('User token not found');
            }

            const response = await axios.post(
                `${API_URL}/patient/previous-slot`,
                {},
                {
                    headers: {
                        "Authorization": `Bearer ${usertoken}`,
                        "Content-Type": 'application/json',
                    },
                }
            );

            let previousBooking = response.data.data;
            console.log(previousBooking, 'previous Booking data');

            // Sort by date and start_time
            previousBooking.sort((a, b) => {
                const dateA = new Date(a.date + ' ' + a.start_time);
                const dateB = new Date(b.date + ' ' + b.start_time);
                return dateB - dateA;  // sort in descending order
            });

            // Get the last 5 entries
            //previousBooking = previousBooking.slice(0, 10);

            setPreviousBooking(previousBooking);
        } catch (error) {
            console.log(`Login error ${error}`);
            if (error.response && error.response.data && error.response.data.message) {
                console.log(error.response.data.message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const confirmationBeforeCancel = (id) => {
        Alert.alert('', "Are you sure you want to cancel the appointment? Cancellation charges may apply.", [
            {
                text: 'Cancel',
                onPress: () => { null },
                style: 'cancel',
            },
            { text: 'OK', onPress: () => cancelSchedule(id) },
        ]);
    }

    const cancelSchedule = (id) => {
        console.log(JSON.stringify(id))
        const option = {
            "booked_slot_id": id
        }
        console.log(option)
        AsyncStorage.getItem('userToken', (err, usertoken) => {
            axios.post(`${API_URL}/patient/slot-cancel`, option, {
                headers: {
                    'Accept': 'application/json',
                    "Authorization": 'Bearer ' + usertoken,
                    //'Content-Type': 'multipart/form-data',
                },
            })
                .then(res => {
                    console.log(JSON.stringify(res.data.data), 'cancel response')
                    if (res.data.response == true) {
                        setIsLoading(false);
                        Toast.show({
                            type: 'success',
                            text1: '',
                            text2: res?.data?.message,
                            position: 'top',
                            topOffset: Platform.OS == 'ios' ? 55 : 20
                        });
                        fetchUpcomingBooking()
                    } else {
                        console.log('not okk')
                        setIsLoading(false)
                        Alert.alert('Oops..', res?.data?.message || "Something went wrong.", [
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

    // useEffect(() => {
    //     console.log(route?.params?.activeTab, 'active tabbbbyyy')
    //     if (route?.params?.activeTab == 'Upcoming') {
    //         setActiveTab('Upcoming')
    //         setActiveButtonNo(0)
    //     } else if (route?.params?.activeTab == undefined) {
    //         setActiveTab('Upcoming')
    //         setActiveButtonNo(0)
    //     } else {
    //         setActiveTab('Previous')
    //         setActiveButtonNo(1)
    //     }
    //     fetchUpcomingBooking();
    //     fetchPreviousBooking();
    //     const timer = setInterval(() => {
    //         setCurrentDateTime(new Date());
    //         console.log('every minute call')
    //         fetchUpcomingBooking();
    //     }, 60000); // Update every minute

    //     return () => clearInterval(timer);
    // }, [])
    useEffect(() => {
        console.log(route?.params?.activeTab, 'active tabbbbyyy');

        if (route?.params?.activeTab === 'Upcoming' || route?.params?.activeTab === undefined) {
            setActiveTab('Upcoming');
            setActiveButtonNo(0);
        } else {
            setActiveTab('Previous');
            setActiveButtonNo(1);
        }

        fetchUpcomingBooking();
        fetchPreviousBooking();

        timerRef.current = setInterval(() => {
            setCurrentDateTime(new Date());
            console.log('every minute call');
            fetchUpcomingBooking();
        }, 60000); // Update every minute

        const unsubscribeFocus = navigation.addListener('focus', () => {
            console.log('Component gained focus');
            if (timerRef.current === null) {
                timerRef.current = setInterval(() => {
                    setCurrentDateTime(new Date());
                    console.log('every minute call');
                    fetchUpcomingBooking();
                }, 60000);
            }
        });

        const unsubscribeBlur = navigation.addListener('blur', () => {
            console.log('Component lost focus, clearing interval');
            if (timerRef.current !== null) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        });

        return () => {
            console.log('Component unmounting, clearing interval');
            clearInterval(timerRef.current);
            unsubscribeFocus();
            unsubscribeBlur();
        };
    }, [navigation]);

    useFocusEffect(
        React.useCallback(() => {
            fetchUpcomingBooking();
            fetchPreviousBooking();
        }, [])
    )

    const onRefresh = () => {
        setRefreshing(true);
        if (route?.params?.activeTab === 'Upcoming' || route?.params?.activeTab === undefined) {
            setActiveTab('Upcoming');
            setActiveButtonNo(0);
        } else {
            setActiveTab('Previous');
            setActiveButtonNo(1);
        }
        fetchUpcomingBooking();
        fetchPreviousBooking();

        setRefreshing(false);
    };

    const renderUpcoming = ({ item }) => {
        // const bookingDateTime = new Date(`${item.date}T${item.start_time}`);
        // const twoMinutesBefore = new Date(bookingDateTime.getTime() - 2 * 60000); // Two minutes before booking start time
        // const isButtonEnabled = currentDateTime >= twoMinutesBefore;
        const bookingDateTime = new Date(`${item.date}T${item.start_time}`);
        const endDateTime = new Date(`${item.date}T${item.end_time}`);
        const twoMinutesBefore = new Date(bookingDateTime.getTime() - 2 * 60000); // Two minutes before booking start time
        const isButtonEnabled = currentDateTime >= twoMinutesBefore && currentDateTime <= endDateTime;

        return (
            <View style={styles.upcomingView}>
                {(item?.status === 'scheduled' || item?.status === 'start') ? (
                    <View style={styles.flexStyle}>
                        {!focusedItemId || focusedItemId !== item.id ? (
                            <Pressable onPress={() => setFocusedItemId(item.id)}>
                                <Image
                                    source={dotIcon}
                                    style={{ height: 25, width: 25, resizeMode: 'contain' }}
                                />
                            </Pressable>
                        ) : (
                            <Icon name="cross" size={25} color="#B0B0B0" onPress={() => setFocusedItemId(null)} />
                        )}

                        {focusedItemId === item.id && (
                            <View
                                style={{
                                    width: responsiveWidth(53),
                                    backgroundColor: '#fff',
                                    height: responsiveHeight(8),
                                    position: 'absolute',
                                    right: 0,
                                    top: 30,
                                    zIndex: 10,
                                    padding: 10,
                                    borderRadius: 15,
                                    justifyContent: 'center',
                                    ...Platform.select({
                                        android: {
                                            elevation: 5, // Only for Android,
                                        },
                                        ios: {
                                            shadowColor: '#000', // Only for iOS
                                            shadowOffset: { width: 0, height: 2 },
                                            shadowOpacity: 0.3,
                                            shadowRadius: 5,
                                        },
                                    }),
                                }}>
                                <View style={{ flexDirection: 'column', justifyContent: 'center' }}>
                                    <TouchableOpacity onPress={() => confirmationBeforeCancel(item?.id)}>
                                        <Text
                                            style={{
                                                color: '#746868',
                                                fontFamily: 'DMSans-Regular',
                                                fontSize: responsiveFontSize(2),
                                                marginVertical: responsiveHeight(1)
                                            }}>
                                            <Text style={{
                                                color: '#746868',
                                                fontFamily: 'DMSans-Bold',
                                                fontSize: responsiveFontSize(2), textDecorationLine: 'underline'
                                            }}>Cancel</Text> the appointment
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                    </View>
                ) : null}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>

                    <Image
                        source={{ uri: item?.therapist?.profile_pic }}
                        style={styles.cardImg}
                    />
                    <View style={{ flexDirection: 'column', marginLeft: responsiveWidth(3), width: responsiveWidth(40) }}>
                        <Text style={styles.nameText}>
                            {item?.therapist?.name}
                        </Text>
                        <Text style={styles.nameSubText2}>
                            Therapist
                        </Text>
                    </View>
                    {item?.status === 'scheduled' || item?.status === 'start' ? (
                        <TouchableOpacity
                            style={[styles.joinNowButton, { opacity: isButtonEnabled ? 1 : 0.5 }]}
                            onPress={() => isButtonEnabled && navigation.navigate('ChatScreen', { details: item })}
                            disabled={!isButtonEnabled}
                        >
                            <Text style={styles.joinNowText}>Join Now</Text>
                        </TouchableOpacity>
                    ) : (
                        <View style={[styles.joinNowButton, { opacity: 0.5 }]}>
                            <Text style={styles.joinNowText}>
                                {item?.status === 'cancel' ? 'Canceled' :
                                    item?.status === 'incomplete' ? 'Incomplete' :
                                        item?.status === 'processing' ? 'Processing' :
                                            item?.status === 'completed' ? 'Completed' :
                                                null}
                            </Text>
                        </View>
                    )}
                </View>
                <View style={styles.dateTimeView}>
                    <View style={styles.dateView1}>
                        <Image
                            source={dateIcon}
                            style={styles.datetimeIcon}
                        />
                        <Text style={styles.dateTimeText}>{moment(item?.date).format('ddd, D MMM YY')}</Text>
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
    }

    const renderPrevious = ({ item }) => (
        <View style={styles.previousBookingView}>
            <View style={styles.previousBooking1stRow}>
                <Text style={styles.previousBookingName}>{item?.therapist?.name}</Text>
                <View style={styles.previousBookingStatusView}>
                    <Image
                        source={
                            item?.status === 'completed' ? GreenTick :
                                item?.status === 'cancel' ? RedCross :
                                    YellowTck  // You can set a default image or handle the null case appropriately
                        }
                        style={styles.previousBookingStatusIcon}
                    />
                    <Text style={styles.previousBookingStatusText}>
                        {/* {item?.status === 'completed' ? 'Completed' : item?.status === 'cancel' ? 'Cancel' : 'Scheduled'} */}
                        {item?.status === 'cancel' ? 'Canceled' :
                            item?.status === 'incomplete' ? 'Incomplete' :
                                item?.status === 'processing' ? 'Processing' :
                                    item?.status === 'completed' ? 'Completed' :
                                        null}
                    </Text>
                </View>
            </View>
            <View style={styles.previousBookingContentView}>
                <Text style={styles.previousBookingContentHeader}>Order ID :</Text>
                <Text style={styles.previousBookingContentValue}>{item?.order_id}</Text>
            </View>
            <View style={styles.previousBookingContentView}>
                <Text style={styles.previousBookingContentHeader}>Date :</Text>
                <Text style={styles.previousBookingContentValue}>{moment(item?.date).format('ddd, D MMMM')}, {moment(item?.start_time, 'HH:mm:ss').format('h:mm A')} - {moment(item?.end_time, 'HH:mm:ss').format('h:mm A')}</Text>
            </View>
            <View style={styles.previousBookingContentView}>
                <Text style={styles.previousBookingContentHeader}>Appointment Time :</Text>
                <Text style={styles.previousBookingContentValue}>{moment(item?.end_time, 'HH:mm:ss').diff(moment(item?.start_time, 'HH:mm:ss'), 'minutes')} Min</Text>
            </View>
            <View style={styles.previousBookingContentView}>
                <Text style={styles.previousBookingContentHeader}>Rate :</Text>
                <Text style={styles.previousBookingContentValue}>Rs {item?.therapist_details?.rate} for 30 Min</Text>
            </View>
            <View style={{ marginTop: responsiveHeight(2) }}>
                <CustomButton buttonColor={'small'} label={"Book Again"} onPress={() => navigation.navigate('Talk', { screen: 'TherapistProfile', params: { therapistId: item?.therapist_id, mode: 'paid' }, key: Math.random().toString() })} />
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
            <ScrollView style={styles.wrapper} refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#417AA4" colors={['#417AA4']} />
            }>
                <View style={{ marginBottom: responsiveHeight(3) }}>
                    <SwitchSelector
                        initial={activeButtonNo}
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
                        {upcomingBooking.length !== 0 ?
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
                            :
                            <View style={styles.upcomingView}>
                                <Text style={styles.nodataText}>No upcoming appointments</Text>
                            </View>
                        }
                    </View>
                    :

                    <View style={{ marginBottom: responsiveHeight(2) }}>
                        {previousBooking.length !== 0 ?
                            <FlatList
                                data={previousBooking}
                                renderItem={renderPrevious}
                                keyExtractor={(item) => item.id.toString()}
                                maxToRenderPerBatch={10}
                                windowSize={5}
                                initialNumToRender={10}
                                getItemLayout={(previousBooking, index) => (
                                    { length: 50, offset: 50 * index, index }
                                )}
                            />
                            :
                            <View style={styles.upcomingView}>
                                <Text style={styles.nodataText}>No previous appointment found</Text>
                            </View>
                        }
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
        width: '99%',
        backgroundColor: '#FFF',
        paddingVertical: 15,
        paddingHorizontal: 15,
        borderRadius: 10,
        marginTop: responsiveHeight(1),
        marginBottom: responsiveHeight(1),
        ...Platform.select({
            android: {
                elevation: 5, // Only for Android
            },
            ios: {
                shadowColor: '#000', // Only for iOS
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 5,
            },
        }),
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
        padding: 8,
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
        width: '100%',
        backgroundColor: '#FFF',
        paddingVertical: 15,
        paddingHorizontal: 15,
        borderRadius: 20,
        marginTop: responsiveHeight(1),
        marginBottom: responsiveHeight(1),
        borderColor: '#F4F5F5',
        borderWidth: 2,
        paddingBottom: -responsiveHeight(1),
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
    },
    flexStyle: {
        position: 'absolute',
        top: 5,
        right: 10,
        ...Platform.select({
            android: {
                zIndex: 10, // Only for Android
            },
            ios: {
                zIndex: 10
            },
        }),
    },
    nodataText: {
        alignSelf: 'center',
        fontFamily: 'DMSans-Bold',
        fontSize: responsiveFontSize(2),
        color: '#746868'
    },

});
