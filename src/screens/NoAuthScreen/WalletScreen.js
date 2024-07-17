import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, SafeAreaView, StyleSheet, ScrollView, StatusBar, Image, FlatList, TouchableOpacity, Animated, KeyboardAwareScrollView, useWindowDimensions } from 'react-native'
import CustomHeader from '../../components/CustomHeader'
import Feather from 'react-native-vector-icons/Feather';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions'
import { TextInput, LongPressGestureHandler, State } from 'react-native-gesture-handler'
import { wallet, walletCredit, walletDebit } from '../../utils/Images'
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

    const renderPaymentTransaction = ({ item }) => (
        <View style={styles.singleValue}>
            <View style={styles.iconView}>
                <Image
                    source={walletDebit}
                    style={styles.iconStyle}
                />
            </View>
            <View style={styles.remarkView}>
                <Text style={styles.remarkText}>{item.gateway_name}</Text>
                <Text style={styles.remarkDate}>{moment(item.created_at).format('dddd, D MMMM')}</Text>
            </View>
            <View style={styles.remarkAmountView}>
                <Text style={[styles.remarkAmount, { color: '#E1293B', }]}>- ₹{item.transaction_amount}</Text>
            </View>
        </View>
    );

    const renderWalletTransaction = ({ item }) => (
        <View style={styles.singleValue}>
            <View style={styles.iconView}>
                <Image
                    source={item.status == 'credit' ? walletCredit : walletDebit}
                    style={styles.iconStyle}
                />
            </View>
            <View style={styles.remarkView}>
                <Text style={styles.remarkText}>{item.remarks}</Text>
                <Text style={styles.remarkDate}>{moment(item.created_at).format('dddd, D MMMM')}</Text>
            </View>
            {item.status == 'credit' ?
                <View style={styles.remarkAmountView}>
                    <Text style={[styles.remarkAmount, { color: '#19BF1F', }]}>+ ₹{item.amount}</Text>
                </View>
                :
                <View style={styles.remarkAmountView}>
                    <Text style={[styles.remarkAmount, { color: '#E1293B', }]}>- ₹{item.amount}</Text>
                </View>
            }
        </View>
    );

    const renderItem = (item) => {
        if (item.item.transaction_id) {
            return renderPaymentTransaction(item);
        } else if (item.item.wallet_id) {
            return renderWalletTransaction(item);
        }
        return null;
    };

    return (
        <SafeAreaView style={styles.Container}>
            <CustomHeader commingFrom={'Wallet'} onPress={() => navigation.goBack()} title={'Wallet'} />
            <ScrollView style={styles.wrapper}>
                <View style={{ marginBottom: responsiveHeight(5), alignSelf: 'center', marginTop: responsiveHeight(2) }}>
                    <View style={styles.totalValue}>

                        <View style={styles.transactionIconView}>
                            <Image
                                source={wallet}
                                style={styles.transactionIconStyle}
                            />
                        </View>
                        <View style={styles.walletTitleView}>
                            <Text style={styles.walletTitleText}>Wallet Balance</Text>
                            <Text style={styles.walletTitleSubtext}>Available Amount</Text>
                        </View>
                        <View style={{ width: responsiveWidth(20), marginLeft: 10 }}>
                            <Text style={styles.walletBalance}>₹{walletBalance}</Text>
                        </View>
                    </View>
                </View>
                <Text style={styles.transactionHeader}>Recent Transaction</Text>
                <View style={styles.transactionList}>
                    <FlatList
                        data={WalletTransaction}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.transaction_id?.toString() || item.wallet_id?.toString()}
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
    },
    transactionIconView: {
        height: 40,
        width: 40,
        borderRadius: 40 / 2,
        backgroundColor: '#FFF',
        borderColor: '#E3E3E3',
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    transactionIconStyle: {
        height: 20,
        width: 20,
        resizeMode: 'contain'
    },
    walletTitleView: {
        flexDirection: 'column',
        marginLeft: 20,
        width: responsiveWidth(40),
        height: responsiveHeight(5),
        justifyContent: 'space-between'
    },
    walletTitleText: {
        color: '#444343',
        fontFamily: 'DMSans-Bold',
        fontSize: responsiveFontSize(2),
    },
    walletTitleSubtext: {
        color: '#746868',
        fontFamily: 'DMSans-Regular',
        fontSize: responsiveFontSize(1.5),
    },
    walletBalance: {
        color: '#444343',
        fontFamily: 'DMSans-Bold',
        fontSize: responsiveFontSize(2.5),
        textAlign: 'right'
    },
    iconView: {
        height: 40,
        width: 40,
        borderRadius: 40 / 2,
        backgroundColor: '#F4F5F5',
        justifyContent: 'center',
        alignItems: 'center'
    },
    iconStyle: {
        height: 20,
        width: 20,
        resizeMode: 'contain'
    },
    remarkView: {
        flexDirection: 'column',
        marginLeft: 20,
        width: responsiveWidth(45),
    },
    remarkText: {
        color: '#444343',
        fontFamily: 'DMSans-SemiBold',
        fontSize: responsiveFontSize(2),
    },
    remarkDate: {
        color: '#746868',
        fontFamily: 'DMSans-Regular',
        fontSize: responsiveFontSize(1.7),
    },
    remarkAmountView: {
        width: responsiveWidth(20),
        marginLeft: 10
    },
    remarkAmount: {
        fontFamily: 'DMSans-Regular',
        fontSize: responsiveFontSize(2),
        textAlign: 'right'
    },
    transactionList: {
        marginBottom: responsiveHeight(10),
        alignSelf: 'center'
    },
    transactionHeader: {
        color: '#2D2D2D',
        fontFamily: 'DMSans-Bold',
        fontSize: responsiveFontSize(2),
        marginLeft: responsiveWidth(3)
    }

});
