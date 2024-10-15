import React, { useContext, useState, useEffect, useCallback } from 'react';
import { View, Text, SafeAreaView, StyleSheet, ScrollView, RefreshControl, Image, Platform, Alert, FlatList } from 'react-native'
import CustomHeader from '../../components/CustomHeader'
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { ArrowGratter, ArrowUp, GreenTick, Payment, RedCross, YellowTck, dateIcon, notifyImg, timeIcon, userPhoto } from '../../utils/Images'
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomButton from '../../components/CustomButton';
import Loader from '../../utils/Loader';
import axios from 'axios';
import { API_URL } from '@env'
import { useFocusEffect } from '@react-navigation/native';
import moment from 'moment-timezone';

const SessionHistory = ({ navigation }) => {

    const [refreshing, setRefreshing] = useState(false);
    const [isModalVisible, setModalVisible] = useState(false);
    const [previousBooking, setPreviousBooking] = useState([]);
    const [isLoading, setIsLoading] = useState(true)

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
            setIsLoading(false);
        } catch (error) {
            setIsLoading(false);
            console.log(`Login error ${error}`);
            if (error.response && error.response.data && error.response.data.message) {
                console.log(error.response.data.message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPreviousBooking()
    }, [])
    useFocusEffect(
        React.useCallback(() => {
            fetchPreviousBooking();
        }, [])
    )

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchPreviousBooking()

        setRefreshing(false);
    }, []);

    const renderPrevious = ({ item }) => (

        <View style={styles.singleView}>
            <View style={styles.singleView1strow}>
                <Text style={styles.singleViewName}>{item?.therapist?.name}</Text>
                <View style={styles.singleView2ndrow}>
                    <Image
                        source={
                            item?.status === 'completed' ? GreenTick :
                                item?.status === 'cancel' ? RedCross :
                                    YellowTck  // You can set a default image or handle the null case appropriately
                        }
                        style={styles.iconStyle}
                    />
                    <Text style={styles.singleViewStatus}>
                        {/* {item?.status === 'completed' ? 'Completed' : item?.status === 'cancel' ? 'Cancel' : 'Scheduled'} */}
                        {item?.status === 'cancel' ? 'Canceled' :
                            item?.status === 'incomplete' ? 'Incomplete' :
                                item?.status === 'processing' ? 'Processing' :
                                    item?.status === 'completed' ? 'Completed' :
                                        null}
                    </Text>
                </View>
            </View>
            <View style={styles.singleViewcoloumn}>
                <Text style={styles.singleViewColumnHeader}>Order ID :</Text>
                <Text style={styles.singleViewColomnValue}>{item?.order_id}</Text>
            </View>
            <View style={styles.singleViewcoloumn}>
                <Text style={styles.singleViewColumnHeader}>Date :</Text>
                <Text style={styles.singleViewColomnValue}>{moment(item?.date).format('ddd, D MMMM')}, {moment(item?.start_time, 'HH:mm:ss').format('h:mm A')} - {moment(item?.end_time, 'HH:mm:ss').format('h:mm A')}</Text>
            </View>
            <View style={styles.singleViewcoloumn}>
                <Text style={styles.singleViewColumnHeader}>Appointment Time :</Text>
                <Text style={styles.singleViewColomnValue}>{moment(item?.end_time, 'HH:mm:ss').diff(moment(item?.start_time, 'HH:mm:ss'), 'minutes')} Min</Text>
            </View>
            <View style={styles.singleViewcoloumn}>
                <Text style={styles.singleViewColumnHeader}>Rate :</Text>
                <Text style={styles.singleViewColomnValue}>Rs {item?.therapist_details?.rate} for 30 Min</Text>
            </View>
            {/* <View style={{ marginTop: responsiveHeight(1.5) }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={styles.singleViewColumnHeader}>Session Summary :</Text>
                </View>
                <Text style={styles.summaryValue}>{item?.prescription_content}</Text>
            </View> */}
            <View style={{ marginTop: responsiveHeight(2) }}>
                <CustomButton buttonColor={'small'} label={"Book Again"} onPress={() => { navigation.navigate('TherapistProfile', { therapistId: item?.therapist_id }) }} />
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
            <CustomHeader commingFrom={'Session History'} onPress={() => navigation.goBack()} title={'Session History'} />
            <ScrollView style={styles.wrapper} refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#417AA4" colors={['#417AA4']} />
            }>
                <View style={{ marginBottom: responsiveHeight(3) }}>
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
                        <View style={styles.nosingleView}>
                            <Text style={styles.nodataText}>No previous booking yet</Text>
                        </View>
                    }

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
        paddingHorizontal: 15,
        //marginBottom: responsiveHeight(1)
    },
    singleView: {
        width: '100%',
        backgroundColor: '#FFF',
        padding: 20,
        borderRadius: 20,
        marginTop: responsiveHeight(2),
        paddingBottom: -responsiveHeight(1),
        borderColor: '#F4F5F5',
        borderWidth: 2,
    },
    nosingleView: {
        width: '100%',
        backgroundColor: '#FFF',
        padding: 20,
        borderRadius: 20,
        marginTop: responsiveHeight(2),
        //paddingBottom: -responsiveHeight(1),
        borderColor: '#F4F5F5',
        borderWidth: 2,
    },
    nodataText: {
        alignSelf: 'center',
        fontFamily: 'DMSans-Bold',
        fontSize: responsiveFontSize(2),
        color: '#746868'
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
