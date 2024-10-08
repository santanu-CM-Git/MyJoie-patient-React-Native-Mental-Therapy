import React, { useState, useMemo, useEffect,useCallback,useContext } from 'react';
import { View, Text, SafeAreaView, StyleSheet, ScrollView, RefreshControl, Image, FlatList, TouchableOpacity, Animated, KeyboardAwareScrollView, useWindowDimensions, Alert } from 'react-native'
import CustomHeader from '../../components/CustomHeader'
import Feather from 'react-native-vector-icons/Feather';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions'
import { TextInput, LongPressGestureHandler, State } from 'react-native-gesture-handler'
import { bookmarkedFill, bookmarkedNotFill,} from '../../utils/Images'
import { API_URL } from '@env'
import axios from 'axios';
import AsyncStorage from "@react-native-async-storage/async-storage";
import Loader from '../../utils/Loader';
import moment from "moment"
import StarRating from 'react-native-star-rating';
import InputField from '../../components/InputField';
import CustomButton from '../../components/CustomButton';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { AuthContext } from '../../context/AuthContext';

const Bookmarked = ({ navigation }) => {

    const { logout } = useContext(AuthContext);
    const [refreshing, setRefreshing] = useState(false);
    const [walletHistory, setWalletHistory] = React.useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [starCount, setStarCount] = useState(4)
    const [therapistData, setTherapistData] = React.useState([])

    useEffect(() => {
        fetchBookmarkedTherapist();
    }, [])

    useFocusEffect(
        React.useCallback(() => {
            fetchBookmarkedTherapist()
        }, [])
    )

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchBookmarkedTherapist()
    
        setRefreshing(false);
      }, []);

    const fetchBookmarkedTherapist = () => {
        AsyncStorage.getItem('userToken', (err, usertoken) => {
            axios.post(`${API_URL}/patient/wishlist`, {}, {
                headers: {
                    'Accept': 'application/json',
                    "Authorization": 'Bearer ' + usertoken,
                    //'Content-Type': 'multipart/form-data',
                },
            })
                .then(res => {
                    console.log(JSON.stringify(res.data.data), 'fetch all bookmarked therapist')
                    if (res.data.response == true) {
                        setTherapistData(res.data.data);
                        setIsLoading(false);

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
                    console.log(`bookmarked therapist fetch error ${e}`)
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

    const bookmarkedToggle = (therapistId) => {
        AsyncStorage.getItem('userToken', (err, usertoken) => {
            AsyncStorage.getItem('userInfo', (err, userInfo) => {
                const userData = JSON.parse(userInfo)
                const option = {
                    "patient_id": userData.patient_details.user_id,
                    "therapist_id": therapistId
                }
                console.log(option, 'bbbbbb')
                axios.post(`${API_URL}/patient/wishlist-click`, option, {
                    headers: {
                        'Accept': 'application/json',
                        "Authorization": 'Bearer ' + usertoken,
                        //'Content-Type': 'multipart/form-data',
                    },
                })
                    .then(res => {
                        console.log(JSON.stringify(res.data.data), 'response from wishlist submit')
                        if (res.data.response == true) {
                            setIsLoading(false);
                            Toast.show({
                                type: 'success',
                                text1: 'Hello',
                                text2: "Successfully remove from wishlist",
                                position: 'top',
                                topOffset: Platform.OS == 'ios' ? 55 : 20
                            });
                            fetchBookmarkedTherapist()
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
                            { text: 'OK', onPress: () => e.response?.data?.message == 'Unauthorized' ? logout() : console.log('OK Pressed') },
                        ]);
                    });
            });
        });
    }

    const getNextAvailableSlot = (slot) => {
        if (!slot) return 'Next Avl. Slot : Check availability';
        const now = moment();
        const slotTime = moment(slot, 'HH:mm:ss');
        if (slotTime.isBefore(now, 'minute')) {
            return `Next Avl. Slot : Tomorrow ${slotTime.format('hh:mm A')}`;
        } else {
            return `Next Avl. Slot : Today ${slotTime.format('hh:mm A')}`;
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.totalValue}>
            <View style={styles.totalValue1stView}>
                <View style={styles.profileView}>
                    <Image
                        source={{ uri: item?.user?.profile_pic }}
                        style={styles.profilePic}
                    />
                    <StarRating
                        disabled={true}
                        maxStars={5}
                        rating={item?.display_rating}
                        selectedStar={(rating) => setStarCount(rating)}
                        fullStarColor={'#FFCB45'}
                        starSize={12}
                        starStyle={styles.starStyle}
                    />
                    <Text style={styles.noOfReview}>{item?.review_counter} Reviews</Text>
                </View>
                <View style={styles.totalValuedetailsView}>
                    <Text style={styles.totalValueDetailsName}>{item?.user?.name}</Text>
                    <Text style={styles.totalValueDetails}>Therapist</Text>
                    <Text style={styles.totalValueDetails}>{item?.qualification_list.replace(/,/g, ', ')}</Text>
                    <Text style={styles.totalValueDetails}>{item?.experience} Years Experience</Text>
                    <Text style={styles.totalValueDetails}>Language : <Text style={styles.totalValueDetailsLan}>{item?.languages_list.replace(/,/g, ', ')}</Text></Text>
                </View>
                <View style={{ width: responsiveWidth(8), }}>
                    {item?.wishlistcount == 'yes' ?
                        <TouchableOpacity onPress={() => bookmarkedToggle(item?.user_id)}>
                            <Image
                                source={bookmarkedFill}
                                style={styles.iconStyle}
                            />
                        </TouchableOpacity>
                        :
                        <TouchableOpacity onPress={() => bookmarkedToggle(item?.user_id)}>
                            <Image
                                source={bookmarkedNotFill}
                                style={styles.iconStyle}
                            />
                        </TouchableOpacity>
                    }
                </View>
            </View>
            <View style={styles.profilebooking}>
                <Text style={styles.profilebookingText}>₹{item?.rate} for 30 Min</Text>
                <View
                    style={{
                        height: '80%',
                        width: 1,
                        backgroundColor: '#E3E3E3',
                        marginLeft: 5,
                        marginRight: 5,
                    }}
                />
                <Text style={styles.profilebookingText}>{getNextAvailableSlot(item?.firstAvailableSlot)}</Text>
            </View>
            <View style={{ marginTop: responsiveHeight(2),marginBottom: -responsiveHeight(1) }}>
                <CustomButton label={"Book Now"} buttonColor={'small'} 
                    onPress={() => { navigation.navigate('Talk', { screen: 'TherapistProfile', params: { therapistId: item?.user_id, mode: 'paid' }, key: Math.random().toString() }) }}
                />
            </View>
        </View>
    );

    if (isLoading) {
        return (
            <Loader />
        )
    }



    return (
        <SafeAreaView style={styles.Container}>
            <CustomHeader commingFrom={'Bookmarked Therapist'} onPress={() => navigation.goBack()} title={'Bookmarked Therapist'} />
            <ScrollView style={styles.wrapper} refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#417AA4" colors={['#417AA4']}/>
            }>
                <View style={styles.listSection}>
                    {therapistData.length != 0 ?
                        <FlatList
                            data={therapistData}
                            renderItem={renderItem}
                            keyExtractor={(item) => item.id.toString()}
                            maxToRenderPerBatch={10}
                            windowSize={5}
                            initialNumToRender={10}
                            getItemLayout={(therapistData, index) => (
                                { length: 50, offset: 50 * index, index }
                            )}
                        />
                        :
                        <Text style={styles.profilebookingText}>No Therapist in your bookmarked list</Text>
                    }
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
    listSection:{ alignSelf: 'center',marginTop: responsiveHeight(2) },
    // totalValue: {
    //     width: responsiveWidth(89),
    //     //height: responsiveHeight(38),
    //     //alignItems: 'center',
    //     backgroundColor: '#FFF',
    //     //justifyContent: 'center',
    //     padding: 15,
    //     borderRadius: 15,
    //     elevation: 5
    // },
    totalValue: {
        width: responsiveWidth(90),
        //height: responsiveHeight(36),
        //alignItems: 'center',
        backgroundColor: '#fff',
        //justifyContent: 'center',
        padding: 10,
        borderRadius: 10,
        elevation: 5,
        margin: 2,
        marginBottom: responsiveHeight(2)
    },
    totalValue1stView: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    profileView: {
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: responsiveWidth(25),
    },
    profilePic: {
        height: 100,
        width: 90,
        borderRadius: 15,
        resizeMode: 'contain',
        marginBottom: responsiveHeight(1)
    },
    starStyle: {
        marginHorizontal: responsiveWidth(0.5),
        marginBottom: responsiveHeight(1)
    },
    noOfReview: {
        fontSize: responsiveFontSize(1.7),
        color: '#746868',
        fontFamily: 'DMSans-Regular',
    },
    totalValuedetailsView: {
        flexDirection: 'column',
        width: responsiveWidth(45),
    },
    totalValueDetailsName: {
        fontSize: responsiveFontSize(2),
        color: '#2D2D2D',
        fontFamily: 'DMSans-Bold',
        marginBottom: responsiveHeight(1)
    },
    totalValueDetails: {
        fontSize: responsiveFontSize(1.7),
        color: '#746868',
        fontFamily: 'DMSans-Medium',
        marginBottom: responsiveHeight(1)
    },
    totalValueDetailsLan: {
        fontSize: responsiveFontSize(1.7),
        color: '#959595',
        fontFamily: 'DMSans-Regular',
    },
    iconStyle: {
        height: 25,
        width: 25
    },
    profilebooking: {
        width: responsiveWidth(85),
        backgroundColor: '#F4F5F5',
        height: responsiveHeight(5),
        marginTop: responsiveHeight(2),
        borderRadius: 10,
        padding: 2,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
    },
    profilebookingRateView: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    profilebookingText: {
        color: '#444343',
        fontFamily: 'DMSans-Medium',
        fontSize: responsiveFontSize(1.4)
    },
    varticleLine: {
        height: '80%',
        width: 1,
        backgroundColor: '#E3E3E3',
        marginLeft: 5,
        marginRight: 5
    },
    profilebookingView: {
        flexDirection: 'row',
        alignItems: 'center',
        width: responsiveWidth(35)
    },

});
