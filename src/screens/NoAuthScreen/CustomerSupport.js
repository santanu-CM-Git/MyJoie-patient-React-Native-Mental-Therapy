import React, { useContext, useState, useEffect } from 'react';
import {
    View,
    Text,
    SafeAreaView,
    ScrollView,
    Image,
    TouchableOpacity,
    TouchableWithoutFeedback,
    FlatList,
    StyleSheet,
    Dimensions,
    Alert,
    Linking
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Animatable from 'react-native-animatable';
import AsyncStorage from "@react-native-async-storage/async-storage";
import CustomSwitch from '../../components/CustomSwitch';
import ListItem from '../../components/ListItem';
import { AuthContext } from '../../context/AuthContext';
import { getProducts } from '../../store/productSlice'
import { API_URL } from '@env'
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { add } from '../../store/cartSlice';
import { chatImg, emailIcon, emailImg, facebookIcon, forwordImg, instagramIcon, phoneImg, pointerImg, whatsappIcon, youtubeIcon } from '../../utils/Images';
import Loader from '../../utils/Loader';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import CustomHeader from '../../components/CustomHeader';
import Collapsible from 'react-native-collapsible';
import Accordion from 'react-native-collapsible/Accordion';
import data from '../../model/data'
import CustomButton from '../../components/CustomButton';

const BannerWidth = Dimensions.get('window').width;
const ITEM_WIDTH = Math.round(BannerWidth * 0.7)
const { height, width } = Dimensions.get('screen')

export default function CustomerSupport({ navigation }) {

    const dispatch = useDispatch();
    const { data: products, status } = useSelector(state => state.products)
    const { userInfo } = useContext(AuthContext)

    const [activeSections, setActiveSections] = useState([]);
    const [collapsed, setCollapsed] = useState(true);
    const [getFaq, setFaq] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [getAllData, setAllData] = useState([])

    const fetchTerms = () => {
        AsyncStorage.getItem('userToken', (err, usertoken) => {
            axios.get(`${API_URL}/api/driver/get-help-support`,
                {
                    headers: {
                        "Authorization": 'Bearer ' + usertoken,
                        "Content-Type": 'application/json'
                    },
                })
                .then(res => {
                    // console.log(res.data.Termsandconditions[0], 'terms and condition')

                    if (res.data.response.status.code === 200) {
                        setAllData(res.data.response.records)
                        setFaq(res.data.response.records.faq)
                        console.log(res.data.response.records.faq, 'faq')
                        setIsLoading(false);
                    } else {
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
                    console.log(`terms and condition error ${e}`)
                });

        });
    }

    useEffect(() => {
        //fetchTerms();
    }, [])


    if (isLoading) {
        return (
            <Loader />
        )
    }


    return (
        <SafeAreaView style={styles.Container}>
            <CustomHeader commingFrom={'Customer Support'} title={'Customer Support'} onPress={() => navigation.goBack()} onPressProfile={() => navigation.navigate('Profile')} />
            <ScrollView style={styles.wrapper}>
                <Text style={styles.header}>Talk to us</Text>
                <Text style={{ color: '#746868', fontFamily: 'DMSans-Regular', fontSize: responsiveFontSize(1.5), lineHeight: responsiveHeight(2.5) }}>We want to make expert advice and healthcare more accessible to everyone. Reach out to us for any queries or issues you might be facing.</Text>
                <View style={{ flexDirection: 'row', marginTop: responsiveHeight(4), }}>
                    <View style={{ width: responsiveWidth(20), }}>
                        <View style={{ height: 40, width: 40, borderRadius: 20, backgroundColor: '#EFFBF7', justifyContent: 'center', alignItems: 'center' }}>
                            <Image
                                source={whatsappIcon}
                                style={{ height: 20, width: 20, resizeMode: 'contain', }}
                            />
                        </View>
                    </View>
                    <View style={{ width: responsiveWidth(70), }}>
                        <Text style={{ color: '#746868', fontFamily: 'DMSans-Regular', fontSize: responsiveFontSize(1.5), lineHeight: responsiveHeight(2.5) }}>ZERO Wait Time</Text>
                        <Text style={{ color: '#2D2D2D', fontFamily: 'DMSans-SemiBold', fontSize: responsiveFontSize(1.7), lineHeight: responsiveHeight(2.5) }}>Connect on Whatsapp</Text>
                        <Text style={{ color: '#746868', fontFamily: 'DMSans-Regular', fontSize: responsiveFontSize(1.5), lineHeight: responsiveHeight(2.5) }}>Our customer team is dedicated to helping you out</Text>
                    </View>
                </View>
                <View style={{ borderBottomColor: '#E3E3E3', borderBottomWidth: 1, marginHorizontal: 10, marginTop: 10 }} />
                <View style={{ flexDirection: 'row', marginTop: responsiveHeight(2), }}>
                    <View style={{ width: responsiveWidth(20), }}>
                        <View style={{ height: 40, width: 40, borderRadius: 20, backgroundColor: '#FFFAEC', justifyContent: 'center', alignItems: 'center' }}>
                            <Image
                                source={emailIcon}
                                style={{ height: 20, width: 20, resizeMode: 'contain', }}
                            />
                        </View>
                    </View>
                    <View style={{ width: responsiveWidth(70), }}>
                        <Text style={{ color: '#746868', fontFamily: 'DMSans-Regular', fontSize: responsiveFontSize(1.5), lineHeight: responsiveHeight(2.5) }}>Get in touch with us</Text>
                        <Text style={{ color: '#2D2D2D', fontFamily: 'DMSans-SemiBold', fontSize: responsiveFontSize(1.7), lineHeight: responsiveHeight(2.5) }}>Support@swastilife.com</Text>
                        <Text style={{ color: '#746868', fontFamily: 'DMSans-Regular', fontSize: responsiveFontSize(1.5), lineHeight: responsiveHeight(2.5) }}>We want to address your concerns and
                            value your feedback</Text>
                    </View>
                </View>
                

            </ScrollView>
            <View style={{ position: 'absolute', bottom: 30, alignSelf: 'center' }}>
                <Text style={{ color: '#2D2D2D', fontFamily: 'DMSans-SemiBold', fontSize: responsiveFontSize(2), lineHeight: responsiveHeight(2.5) }}>Stay Connected Online</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center',marginTop: responsiveHeight(1) }}>
                    <View style={{ height: 40, width: 40, borderRadius: 10, backgroundColor: '#ECFCFA',borderColor:'#87ADA8',borderWidth:1, justifyContent: 'center', alignItems: 'center',marginHorizontal: responsiveWidth(2) }}>
                        <Image
                            source={facebookIcon}
                            style={{ height: 20, width: 20, resizeMode: 'contain', }}
                        />
                    </View>
                    <View style={{ height: 40, width: 40, borderRadius: 10, backgroundColor: '#ECFCFA',borderColor:'#87ADA8',borderWidth:1, justifyContent: 'center', alignItems: 'center',marginHorizontal: responsiveWidth(2) }}>
                        <Image
                            source={instagramIcon}
                            style={{ height: 20, width: 20, resizeMode: 'contain', }}
                        />
                    </View>
                    <View style={{ height: 40, width: 40, borderRadius: 10, backgroundColor: '#ECFCFA',borderColor:'#87ADA8',borderWidth:1, justifyContent: 'center', alignItems: 'center',marginHorizontal: responsiveWidth(2) }}>
                        <Image
                            source={youtubeIcon}
                            style={{ height: 20, width: 20, resizeMode: 'contain', }}
                        />
                    </View>
                </View>
            </View>
        </SafeAreaView >
    );
}

const styles = StyleSheet.create({
    Container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: responsiveHeight(1)
    },
    wrapper: {
        padding: 20,
        //paddingBottom: responsiveHeight(2)
    },
    header: {
        fontFamily: 'DMSans-SemiBold',
        fontSize: responsiveFontSize(2),
        color: '#2F2F2F',
        marginBottom: responsiveHeight(1),
    },

});