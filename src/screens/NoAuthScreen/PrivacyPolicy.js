import React, { useContext, useState, useEffect } from 'react';
import {
    View,
    Text,
    SafeAreaView,
    ScrollView,
    Image,
    TouchableOpacity,
    Alert,
    FlatList,
    StyleSheet,
    Dimensions,
    useWindowDimensions
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import RenderHTML from "react-native-render-html";
import { API_URL } from '@env'
import CustomSwitch from '../../components/CustomSwitch';
import ListItem from '../../components/ListItem';
import { AuthContext } from '../../context/AuthContext';
import { getProducts } from '../../store/productSlice'

import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { add } from '../../store/cartSlice';
import Loader from '../../utils/Loader';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import CustomHeader from '../../components/CustomHeader';
import data from '../../model/data'
import CustomButton from '../../components/CustomButton';
import AsyncStorage from "@react-native-async-storage/async-storage";
const BannerWidth = Dimensions.get('window').width;
const ITEM_WIDTH = Math.round(BannerWidth * 0.7)
const { height, width } = Dimensions.get('screen')

export default function PrivacyPolicy({ navigation }) {

    const dispatch = useDispatch();
    const { data: products, status } = useSelector(state => state.products)
    const { userInfo } = useContext(AuthContext)

    const [selectedTab, setSelectedTab] = useState(1);
    const [isLoading, setIsLoading] = useState(false)
    const [termsCondition,setTermsCondition] = useState(`
    <h1>Policy</h1>
    <h2>Update on 16-05-2024</h2>
    <img src="https://i.imgur.com/dHLmxfO.jpg?2" />
    <em style="textAlign: center;">Look at how happy this native cat is</em>
  `)
  const tagsStyles = {
    h1: { color: '#2D2D2D',fontSize: responsiveFontSize(3),fontFamily:'DMSans-SemiBold' },
    h2: { color: '#444343',fontSize: responsiveFontSize(2),fontFamily:'DMSans-Regular'  }, // Example of adding more styles
    em: { color: 'red', textAlign: 'center' }
  };

    const { width } = useWindowDimensions();

    const fetchTerms = () => {
        AsyncStorage.getItem('userToken', (err, usertoken) => {
            axios.get(`${API_URL}/api/driver/get-page-by-slug?slug=driver-terms-and-conditions`,
                {
                    headers: {
                        "Authorization": 'Bearer ' + usertoken,
                        "Content-Type": 'application/json'
                    },
                })
                .then(res => {
                    // console.log(res.data.Termsandconditions[0], 'terms and condition')
                    setIsLoading(false);
                    if (res.data.response.status.code === 200) {
                        console.log(JSON.parse(res.data.response.records.pages.description))
                        const parseValue = JSON.parse(res.data.response.records.pages.description)
                        console.log(parseValue.content)
                        setTermsCondition(parseValue.content)
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
            <CustomHeader commingFrom={'Privacy Policy'} title={'Privacy Policy'} onPress={() => navigation.goBack()} onPressProfile={() => navigation.navigate('Profile')} />
            <ScrollView style={styles.wrapper}>
            <RenderHTML contentWidth={width} source={{ html:termsCondition }} tagsStyles={tagsStyles}/> 
            </ScrollView>
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
    

});