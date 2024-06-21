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


const WalletScreen = ({ navigation }) => {

    const [walletBalance, setWalletBalance] = React.useState(0)
    const [WalletTransaction, setWalletTransaction] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetchWalletBalance();
        fetchWalletTransaction()
    }, [])

    const fetchWalletBalance = () => {
        AsyncStorage.getItem('userToken', (err, usertoken) => {
            axios.post(`${API_URL}/patient/wallet`, {}, {
                headers: {
                    "Authorization": `Bearer ${usertoken}`,
                    "Content-Type": 'application/json'
                },
            })
                .then(res => {
                    //console.log(res.data,'user details')
                    let userBalance = res.data.wallet_amount;
                    console.log(userBalance, 'wallet balance')
                    setWalletBalance(userBalance)
                    //setIsLoading(false);
                })
                .catch(e => {
                    console.log(`Login error ${e}`)
                    console.log(e.response?.data?.message)
                });
        });
    }

    const fetchWalletTransaction = () => {
        AsyncStorage.getItem('userToken', (err, usertoken) => {
            axios.post(`${API_URL}/patient/wallet-transaction`, {}, {
                headers: {
                    "Authorization": `Bearer ${usertoken}`,
                    "Content-Type": 'application/json'
                },
            })
                .then(res => {
                    //console.log(res.data,'user details')
                    let userBalanceTransaction = res.data.data;
                    const filteredTransactions = userBalanceTransaction.filter(transaction => transaction.amount !== 0);
                    console.log(filteredTransactions, 'wallet balance')
                    setWalletTransaction(filteredTransactions)
                    setIsLoading(false);
                })
                .catch(e => {
                    console.log(`Login error ${e}`)
                    console.log(e.response?.data?.message)
                });
        });
    }

    if (isLoading) {
        return (
            <Loader />
        )
    }

    const renderHistory = (item, index) => {
        // console.log(item)
        return (
            <View style={styles.singleValue}>
                <View style={{ height: 40, width: 40, borderRadius: 40 / 2, backgroundColor: '#F4F5F5', justifyContent: 'center', alignItems: 'center' }}>
                    <Image
                        source={walletCredit}
                        style={{ height: 20, width: 20, resizeMode: 'contain' }}
                    />
                </View>
                <View style={{ flexDirection: 'column', marginLeft: 20, width: responsiveWidth(45), }}>
                    <Text style={{ color: '#444343', fontFamily: 'DMSans-SemiBold', fontSize: responsiveFontSize(2), }}>{item.item.remarks}</Text>
                    <Text style={{ color: '#746868', fontFamily: 'DMSans-Regular', fontSize: responsiveFontSize(1.7), }}>{moment(item.item.created_at).format('dddd, D MMMM')}</Text>
                </View>
                {item.item.status == 'credit' ?
                    <View style={{ width: responsiveWidth(20), marginLeft: 10 }}>
                        <Text style={{ color: '#19BF1F', fontFamily: 'DMSans-Regular', fontSize: responsiveFontSize(2), textAlign: 'right' }}>+ ₹{item.item.amount}</Text>
                    </View>
                    :
                    <View style={{ width: responsiveWidth(20), marginLeft: 10 }}>
                        <Text style={{ color: '#E1293B', fontFamily: 'DMSans-Regular', fontSize: responsiveFontSize(2), textAlign: 'right' }}>- ₹{item.item.amount}</Text>
                    </View>
                }
            </View>
        )
    }

    return (
        <SafeAreaView style={styles.Container}>
            <CustomHeader commingFrom={'Wallet'} onPress={() => navigation.goBack()} title={'Wallet'} />
            <ScrollView style={styles.wrapper}>
                <View style={{ marginBottom: responsiveHeight(5), alignSelf: 'center', marginTop: responsiveHeight(2) }}>
                    <View style={styles.totalValue}>

                        <View style={{ height: 40, width: 40, borderRadius: 40 / 2, backgroundColor: '#FFF', borderColor: '#E3E3E3', borderWidth: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <Image
                                source={wallet}
                                style={{ height: 20, width: 20, resizeMode: 'contain' }}
                            />
                        </View>
                        <View style={{ flexDirection: 'column', marginLeft: 20, width: responsiveWidth(40), height: responsiveHeight(5), justifyContent: 'space-between' }}>
                            <Text style={{ color: '#444343', fontFamily: 'DMSans-Bold', fontSize: responsiveFontSize(2), }}>Wallet Balance</Text>
                            <Text style={{ color: '#746868', fontFamily: 'DMSans-Regular', fontSize: responsiveFontSize(1.5), }}>Available Amount</Text>
                        </View>
                        <View style={{ width: responsiveWidth(20), marginLeft: 10 }}>
                            <Text style={{ color: '#444343', fontFamily: 'DMSans-Bold', fontSize: responsiveFontSize(2.5), textAlign: 'right' }}>₹{walletBalance}</Text>
                        </View>
                    </View>
                </View>
                <Text style={{ color: '#2D2D2D', fontFamily: 'DMSans-Bold', fontSize: responsiveFontSize(2), marginLeft: responsiveWidth(3) }}>Recent Transaction</Text>
                <View style={{ marginBottom: responsiveHeight(10), alignSelf: 'center' }}>
                    <FlatList
                        data={WalletTransaction}
                        renderItem={renderHistory}
                        keyExtractor={(item) => item.id.toString()}
                        maxToRenderPerBatch={10}
                        windowSize={5}
                        initialNumToRender={10}
                        getItemLayout={(WalletTransaction, index) => (
                            { length: 50, offset: 50 * index, index }
                        )}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default WalletScreen

const styles = StyleSheet.create({
    Container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    wrapper: {
        padding: responsiveWidth(2),

    },
    singleValue: {
        width: responsiveWidth(90),
        height: responsiveHeight(10),
        padding: 5,
        borderBottomColor: '#E4E4E4',
        borderBottomWidth: 1,
        flexDirection: 'row',
        alignItems: 'center'
    },
    totalValue: {
        width: responsiveWidth(89),
        height: responsiveHeight(10),
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        elevation: 5,
        //justifyContent: 'center',
        padding: 20,
        borderRadius: 15
    }

});
