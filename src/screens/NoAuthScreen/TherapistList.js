import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { View, Text, SafeAreaView, StyleSheet, ScrollView, StatusBar, TextInput, Image, FlatList, TouchableOpacity, Animated, KeyboardAwareScrollView, useWindowDimensions, Switch, Pressable, Alert } from 'react-native'
import CustomHeader from '../../components/CustomHeader'
import Feather from 'react-native-vector-icons/Feather';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions'
import { LongPressGestureHandler, State, TouchableWithoutFeedback } from 'react-native-gesture-handler'
import { bookmarkedFill, bookmarkedNotFill, cameraColor, chatColor, checkedImg, filterImg, phoneColor, uncheckedImg } from '../../utils/Images'
import { API_URL } from '@env'
import axios from 'axios';
import AsyncStorage from "@react-native-async-storage/async-storage";
import Loader from '../../utils/Loader';
import moment from "moment"
import StarRating from 'react-native-star-rating';
import InputField from '../../components/InputField';
import CustomButton from '../../components/CustomButton';
import Modal from "react-native-modal";
import Icon from 'react-native-vector-icons/Entypo';
import CheckBox from '@react-native-community/checkbox';
import SelectMultiple from 'react-native-select-multiple'
import { Dropdown } from 'react-native-element-dropdown';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import MultiSlider from '@ptomasroos/react-native-multi-slider';

// const dropdowndata = [
//     { label: 'All therapist', value: 'All' },
//     { label: 'Individual', value: 'Individual' },
//     { label: 'Couple', value: 'Couple' },
//     { label: 'Child', value: 'Child' },
// ];
const Experience = [
    { label: '0 - 2 Years', value: '0-2' },
    { label: '3 - 5 Years', value: '2-5' },
    { label: '6 - 8 Years', value: '6-8' },
    { label: '9 - 12 Years', value: '9-12' },
    { label: '13 - 15 Years', value: '13-15' },
    { label: '15 - 20 Years', value: '15-20' },
    { label: '20+ Years', value: '20-100' }
]
const Rating = [
    { label: '1 Star', value: '1' },
    { label: '2 Star', value: '2' },
    { label: '3 Star', value: '3' },
    { label: '4 Star', value: '4' },
    { label: '5 Star', value: '5' }
]
const Gender = [
    { label: 'Male', value: 'Male' },
    { label: 'Female', value: 'Female' },
    { label: 'Others', value: 'Others' }
]
const Ages = [
    { label: '20 - 30', value: '20-30' },
    { label: '30 - 40', value: '30-40' },
    { label: '40 - 50', value: '40-50' },
    { label: '50 - 60', value: '50-60' },
    { label: '60 above', value: '60-100' },
]
// const Rate = [
//     { label: 'below 300', value: '1' },
//     { label: 'below 500', value: '2' },
//     { label: 'below 1000', value: '3' },
//     { label: 'below 2000', value: '4' },
//     { label: 'above 2000', value: '5' },
// ]


const TherapistList = ({ navigation, route }) => {

    const [value, setValue] = useState('All');
    const [isFocus, setIsFocus] = useState(false);
    const [therapistData, setTherapistData] = React.useState([])
    const [therapistFilterData, setTherapistFilterData] = React.useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [toggleCheckBox, setToggleCheckBox] = useState(false)
    const [isModalVisible, setModalVisible] = useState(false);
    const [isFilterModalVisible, setFilterModalVisible] = useState(false);
    const [activeTab, setActiveTab] = useState('Experience')
    const [searchValue, setSearchValue] = useState('');
    const [sliderValuesForPrice, setSliderValuesForPrice] = useState([0, 2000]);
    const sliderValuesChange = (values) => {
        setSliderValuesForPrice(values);
    };
    const [sliderValuesForAge, setSliderValuesForAge] = useState([18, 100]);
    const sliderValuesChangeForAge = (values) => {
        setSliderValuesForAge(values);
    };
    const searchInputRef = useRef(null);

    // Experience
    const [selectedExperience, setSelectedExperience] = useState([]);
    const onSelectionsChangeExperience = (selectedExperience) => {
        // selectedFruits is array of { label, value }
        setSelectedExperience(selectedExperience);
    };

    // Type
    const [qualificationitemsTypeForDropdown, setqualificationitemsTypeForDropdown] = useState([])
    const [qualificationitemsType, setqualificationitemsType] = useState([])
    const [selectedType, setSelectedType] = useState([]);
    const onSelectionsChangeType = (selectedType) => {
        // selectedFruits is array of { label, value }
        setSelectedType(selectedType);
    };

    // Rating
    const [selectedRating, setSelectedRating] = useState([]);
    const onSelectionsChangeRating = (selectedRating) => {
        // selectedFruits is array of { label, value }
        setSelectedRating(selectedRating);
    };
    // Gender
    const [selectedGender, setSelectedGender] = useState([]);
    const onSelectionsChangeGender = (selectedGender) => {
        // selectedFruits is array of { label, value }
        setSelectedGender(selectedGender);
    };
    // Age
    const [selectedAge, setSelectedAge] = useState([]);
    const onSelectionsChangeAge = (selectedAge) => {
        // selectedFruits is array of { label, value }
        setSelectedAge(selectedAge);
    };
    // Qualification
    const [qualificationitems, setqualificationitems] = useState([])
    const [selectedQualification, setSelectedQualification] = useState([]);
    const onSelectionsChangeQualification = (selectedQualification) => {
        // selectedFruits is array of { label, value }
        console.log(selectedQualification, 'jjjjjjjjj')
        setSelectedQualification(selectedQualification);
    };
    // Language
    const [qualificationitemsLanguage, setqualificationitemsLanguage] = useState([])
    const [selectedLanguage, setSelectedLanguage] = useState([]);
    const onSelectionsChangeLanguage = (selectedLanguage) => {
        // selectedFruits is array of { label, value }
        setSelectedLanguage(selectedLanguage);
    };
    // Rate
    const [selectedRate, setSelectedRate] = useState([]);
    const onSelectionsChangeRate = (selectedRate) => {
        // selectedFruits is array of { label, value }
        setSelectedRate(selectedRate);
    };

    const fetchLanguage = () => {
        axios.get(`${API_URL}/languages`, {
            headers: {
                "Content-Type": 'application/json'
            },
        })
            .then(res => {
                //console.log(languageInfo, 'bbbbbbb')
                console.log(res.data.data, 'fetch language')
                const languageInfo = res.data.data.map(item => ({
                    label: item.content,
                    value: item.id,
                }));
                setqualificationitemsLanguage(languageInfo)
                //setIsLoading(false);
            })
            .catch(e => {
                console.log(`Language fetch error ${e}`)
            });
    }
    const fetchQualification = () => {
        axios.get(`${API_URL}/qualifications`, {
            headers: {
                "Content-Type": 'application/json'
            },
        })
            .then(res => {
                console.log(res.data.data, 'fetch qualification')
                const qualificationInfo = res.data.data.map(item => ({
                    label: item.content,
                    value: item.id,
                }));
                setqualificationitems(qualificationInfo)
                //setIsLoading(false);
            })
            .catch(e => {
                console.log(`qualification fetch error ${e}`)
            });
    }
    const fetchTherapyType = () => {
        axios.get(`${API_URL}/therapy-type`, {
            headers: {
                "Content-Type": 'application/json'
            },
        })
            .then(res => {
                console.log(res.data.data, 'fetch therapist type')
                const therapyTypeInfo = res.data.data.map(item => ({
                    label: item.type,
                    value: item.id,
                }));
                setqualificationitemsType(therapyTypeInfo)
                const therapyTypeInfoForDropdown = res.data.data.map(item => ({
                    label: item.type,
                    value: item.type,
                }));
                const allOption = { label: "All therapist", value: "All" };
                therapyTypeInfoForDropdown.unshift(allOption);
                setqualificationitemsTypeForDropdown(therapyTypeInfoForDropdown)
                //setIsLoading(false);
            })
            .catch(e => {
                console.log(`therapytype fetch error ${e}`)
            });
    }


    // useEffect(() => {
    //     const fetchData = async () => {
    //         setIsLoading(true);
    //         await Promise.all([fetchAllTherapist(), fetchLanguage(), fetchQualification(), fetchTherapyType()]);
    //         setIsLoading(false);
    //     };

    //     fetchData();
    //     console.log(route?.params?.comingFrom, 'nnnnnnnnnnnnnnnnnnn');
    //     if (route?.params?.comingFrom === 'search') {
    //         setTimeout(() => {
    //             if (searchInputRef.current) {
    //                 searchInputRef.current.focus();
    //             }
    //         }, 100);
    //     }

    // }, [])
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                // Wait for all the fetch calls to complete
                await Promise.all([
                    fetchAllTherapist(),
                    fetchLanguage(),
                    fetchQualification(),
                    fetchTherapyType()
                ]);
            } catch (error) {
                console.error("Error fetching data: ", error);
            } finally {
                // Ensure the loader is turned off
                setIsLoading(false);
            }
        };

        fetchData();

        console.log(route?.params?.comingFrom, 'nnnnnnnnnnnnnnnnnnn');
        if (route?.params?.comingFrom === 'search') {
            setTimeout(() => {
                if (searchInputRef.current) {
                    searchInputRef.current.focus();
                }
            }, 100);
        }

    }, []);
   
    // useFocusEffect(
    //     React.useCallback(() => {
    //         const fetchData = async () => {
    //             try {
    //                 setIsLoading(true);
    //                 await Promise.all([
    //                     fetchAllTherapist(),
    //                     fetchLanguage(),
    //                     fetchQualification(),
    //                     fetchTherapyType()
    //                 ]);
    //             } catch (error) {
    //                 console.error("Error fetching data: ", error);
    //             } finally {
    //                 setIsLoading(false);
    //             }
    //         };

    //         fetchData();

    //         if (searchInputRef.current) {
    //             searchInputRef.current.focus();
    //         }
    //     }, [])
    // );
    const toggleModal = () => {
        setModalVisible(!isModalVisible);
    };
    const toggleFilterModal = () => {
        setFilterModalVisible(!isFilterModalVisible);
    };

    const fetchAllTherapist = () => {
        AsyncStorage.getItem('userToken', (err, usertoken) => {
            const option = {
                "flag": 'paid'
            }
            axios.post(`${API_URL}/patient/therapist-list`, option, {
                headers: {
                    'Accept': 'application/json',
                    "Authorization": 'Bearer ' + usertoken,
                    //'Content-Type': 'multipart/form-data',
                },
            })
                .then(res => {
                    console.log(JSON.stringify(res.data.data), 'fetch all therapist')
                    if (res.data.response == true) {
                        setTherapistData(res.data.data);
                        setTherapistFilterData(res.data.data)
                        //setIsLoading(false);

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
                    console.log(`fetch all therapist error ${e}`)
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

    const onChangeDropdown = (item) => {
        setValue(item.value);
        setIsFocus(false);
        if (item.value == "All") {
            setTherapistFilterData(therapistData)
        } else {
            const filteredData = therapistData.filter(entry =>
                entry.therapy_type_list.split(',').includes(item.value)
            );
            console.log(filteredData, 'filterd data')
            setTherapistFilterData(filteredData)
        }

    }
    const bookmarkedToggle = (therapistId) => {
        AsyncStorage.getItem('userToken', (err, usertoken) => {
            AsyncStorage.getItem('userInfo', (err, userInfo) => {
                const userData = JSON.parse(userInfo)
                const option = {
                    "patient_id": userData.patient_details.user_id,
                    "therapist_id": therapistId
                }
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
                                text2: res.data.message,
                                position: 'top',
                                topOffset: Platform.OS == 'ios' ? 55 : 20
                            });
                            fetchAllTherapist()
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
                        console.log(`bookmarked error ${e}`)
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
        <Pressable onPress={() => navigation.navigate('TherapistProfile', { therapistId: item?.user_id, mode: 'paid' })}>
            <View style={styles.totalValue}>
                <View style={styles.totalValue1stSection}>
                    <View style={styles.profilePicSection}>
                        <Image
                            source={{ uri: item?.user?.profile_pic }}
                            style={styles.profilePicStyle}
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
                    <View style={styles.contentStyle}>
                        <Text style={styles.contentStyleName}>{item?.user?.name}</Text>
                        <Text style={styles.contentStyleQualification}>{item?.qualification_list.replace(/,/g, ', ')}</Text>
                        {item?.experience?<Text style={styles.contentStyleExp}>{item?.experience} Years Experience</Text>:null}
                        <View style={{ flexDirection: 'row' }}>
                            <Text style={styles.contentStyleLang}>Language :</Text>
                            <Text style={styles.contentStyleLangValue}> {item?.languages_list.replace(/,/g, ', ')}</Text>
                        </View>
                        <Text style={styles.contentStyleRate}>₹{item?.rate} for 30 Min</Text>
                        <Text style={[styles.contentStyleAvailableSlot, { color: '#417AA4' }]}>{getNextAvailableSlot(item?.firstAvailableSlot)}</Text>
                    </View>
                    <View style={{ width: responsiveWidth(6), }}>
                        {item?.wishlistcount == 'yes' ?
                            <TouchableOpacity onPress={() => bookmarkedToggle(item?.user_id)}>
                                <Image
                                    source={bookmarkedFill}
                                    style={styles.iconSize}
                                />
                            </TouchableOpacity>
                            :
                            <TouchableOpacity onPress={() => bookmarkedToggle(item?.user_id)}>
                                <Image
                                    source={bookmarkedNotFill}
                                    style={styles.iconSize}
                                />
                            </TouchableOpacity>
                        }
                    </View>
                </View>
                <View style={styles.totalValue2ndSection}>
                    <View style={styles.listButtonFirstSection}>
                        {/* {item?.instant_availability == 'on' ?
                             <TouchableOpacity onPress={() => toggleModal()}>
                                <View style={styles.instantConnectView}>
                                    <Text style={styles.instantConnectText}>Instant Connect</Text>
                                </View>
                              </TouchableOpacity>
                            :
                            null
                        } */}
                    </View>
                    <View style={styles.listButtonSecondSection}>
                        <View style={styles.iconView}>
                            <Image
                                source={cameraColor}
                                style={styles.iconSize}
                            />
                        </View>
                        <View style={styles.iconView}>
                            <Image
                                source={phoneColor}
                                style={styles.iconSize}
                            />
                        </View>
                        <View style={styles.iconView}>
                            <Image
                                source={chatColor}
                                style={styles.iconSize}
                            />
                        </View>
                    </View>
                </View>
            </View>
        </Pressable>
    );

    if (isLoading) {
        return (
            <Loader />
        )
    }

    const changeSearchValue = (text) => {
        const searchText = text.toLowerCase().trim();
        const filteredData = therapistData.filter(therapist =>
            therapist.user.name.toLowerCase().includes(searchText)
        );
        setSearchValue(text);
        setTherapistFilterData(filteredData);
    }

    const resetValueOfFilter = () => {
        setSelectedExperience([])
        setSelectedType([])
        setSelectedRating([])
        setSelectedGender([])
        setSelectedAge([])
        setSelectedQualification([])
        setSelectedLanguage([])
        setSliderValuesForPrice([0, 2000])
        toggleFilterModal()
        setTherapistFilterData(therapistData);
    }

    const submitForFilter = async () => {
        // console.log('hello')
        // console.log(selectedExperience, 'experience')
        // console.log(selectedType, 'type');
        // console.log(selectedRating, 'rating');
        // console.log(selectedGender, 'gender');
        // console.log(selectedAge, 'age');
        // console.log(selectedQualification, 'qualification');
        // console.log(selectedLanguage, 'language');
        // console.log(slidervalueStart, 'slider start value');
        // console.log(slidervalueEnd, 'slider end value');
        setIsLoading(true);
        try {
            const experienceRanges = selectedExperience.map(exp => exp.value.split('-').map(Number));
            const type = selectedType.map(t => t.value);
            const rating = selectedRating.map(r => Number(r.value));
            const gender = selectedGender.map(g => g.value);
            const ageranges = sliderValuesForAge;
            const qualification = selectedQualification.map(q => q.value);
            const language = selectedLanguage.map(lang => lang.value);
            const pricerange = sliderValuesForPrice;


            const filteredData = {
                experienceRanges,
                type,
                rating,
                gender,
                ageranges,
                qualification,
                language,
                pricerange,
                flag: "paid"
            };

            console.log(filteredData);

            const userToken = await AsyncStorage.getItem('userToken');
            if (!userToken) {
                throw new Error('User token not found');
            }

            const response = await axios.post(`${API_URL}/patient/therapist-filter`, filteredData, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${userToken}`
                }
            });

            const data = response.data;
            console.log(data, 'filterd therapist data');
            if (data.response) {
                setTherapistFilterData(data.therapists);
                toggleFilterModal()
                setIsLoading(false);
            } else {
                throw new Error('Response not OK');
            }
        } catch (error) {
            setIsLoading(false);
            console.error('Error fetching therapists:', error);

            Alert.alert('Oops..', error.response?.data?.message || 'Something went wrong', [
                {
                    text: 'Cancel',
                    onPress: () => console.log('Cancel Pressed'),
                    style: 'cancel',
                },
                { text: 'OK', onPress: () => console.log('OK Pressed') },
            ]);
        } finally {
            setIsLoading(false);
        }
    };



    return (
        <SafeAreaView style={styles.Container}>
            <CustomHeader commingFrom={'Therapist'} onPress={() => navigation.goBack()} title={'Therapist'} />
            <ScrollView style={styles.wrapper}>
                <View style={styles.filterSection}>
                    <View style={styles.filterSection1st}>
                        <View style={{ width: responsiveWidth(35), }}>
                            <Dropdown
                                style={[styles.dropdown, isFocus && { borderColor: 'blue' }]}
                                placeholderStyle={styles.placeholderStyle}
                                selectedTextStyle={styles.selectedTextStyle}
                                inputSearchStyle={styles.inputSearchStyle}
                                itemTextStyle={styles.selectedTextStyle}
                                data={qualificationitemsTypeForDropdown}
                                //search
                                maxHeight={300}
                                labelField="label"
                                valueField="value"
                                placeholder={!isFocus ? 'Sort by Type' : '...'}
                                searchPlaceholder="Search..."
                                value={value}
                                onFocus={() => setIsFocus(true)}
                                onBlur={() => setIsFocus(false)}
                                onChange={item => {
                                    onChangeDropdown(item)
                                }}
                            />
                            {/* <Text style={{ fontSize: responsiveFontSize(2), color: '#2D2D2D', fontFamily: 'DMSans-Bold', }}>Type for therapy</Text> */}

                        </View>
                        <TouchableWithoutFeedback onPress={() => toggleFilterModal()}>
                            <View style={styles.filterIconView}>
                                <Image
                                    source={filterImg}
                                    style={{ height: 20, width: 20 }}
                                />
                                <Text style={styles.filterIconText}>Filter</Text>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </View>
                <View style={{ alignSelf: 'center', marginBottom: 10 }}>
                    {/* <InputField
                        ref={searchInputRef}
                        label={'Search by therapist name'}
                        keyboardType=" "
                        value={searchValue}
                        //helperText={'Please enter lastname'}
                        inputType={'searchable'}
                        onChangeText={(text) => changeSearchValue(text)}
                    /> */}
                    <TextInput
                        style={styles.editinput}
                        onChangeText={(text) => changeSearchValue(text)}
                        value={searchValue}
                        ref={route?.params?.comingFrom === 'search' ? searchInputRef : null}
                        placeholder={'Search by therapist name'}
                        keyboardType={''}
                        placeholderTextColor="#808080"
                    />
                </View>
                <View style={{ alignSelf: 'center' }}>
                    {therapistFilterData.length !== 0 ?
                        <FlatList
                            data={therapistFilterData}
                            renderItem={renderItem}
                            keyExtractor={(item) => item.id.toString()}
                            maxToRenderPerBatch={10}
                            windowSize={5}
                            initialNumToRender={10}
                            getItemLayout={(therapistFilterData, index) => (
                                { length: 50, offset: 50 * index, index }
                            )}
                        />
                        :
                        <View style={[styles.totalValue, { justifyContent: 'center', alignItems: 'center' }]}>
                            <Text style={[styles.contentStyleName, { marginTop: responsiveHeight(1) }]}>No Therapist Found</Text>
                        </View>}
                </View>

            </ScrollView>
            <Modal
                isVisible={isFilterModalVisible}
                // onBackdropPress={() => setIsFocus(false)} // modal off by clicking outside of the modal
                style={{
                    margin: 0, // Add this line to remove the default margin
                    justifyContent: 'flex-end',
                }}>
                <View style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', height: 50, width: 50, borderRadius: 25, position: 'absolute', bottom: '91%', left: '45%', right: '45%' }}>
                    <Icon name="cross" size={30} color="#B0B0B0" onPress={toggleFilterModal} />
                </View>
                {/* <TouchableWithoutFeedback onPress={() => setIsFocus(false)} style={{  }}> */}
                <View style={{ height: '88%', backgroundColor: '#fff', position: 'absolute', bottom: 0, width: '100%' }}>
                    <View style={{ padding: 0 }}>
                        <View style={{ padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: responsiveHeight(2), marginTop: responsiveHeight(2) }}>
                            <Text style={{ fontSize: responsiveFontSize(2), color: '#2D2D2D', fontFamily: 'DMSans-Bold', }}>Filter</Text>
                        </View>
                    </View>
                    {/* <ScrollView style={{ marginBottom: responsiveHeight(0) }} > */}
                    <View style={{ borderTopColor: '#E3E3E3', borderTopWidth: 1, flexDirection: 'row' }}>
                        <View style={{ width: responsiveWidth(41), backgroundColor: '#FFF', borderRightColor: '#E3E3E3', borderRightWidth: 1 }}>
                            <TouchableOpacity onPress={() => setActiveTab('Experience')}>
                                <View style={{ width: responsiveWidth(40), height: responsiveHeight(8), borderBottomColor: '#E3E3E3', backgroundColor: activeTab == 'Experience' ? '#EEF8FF' : '#fff', borderBottomWidth: 1, justifyContent: 'center', alignItems: 'center' }}>
                                    <Text style={{ color: '#444343', fontFamily: 'DMSans-SemiBold', fontSize: responsiveFontSize(2) }}>Experience</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setActiveTab('Type')}>
                                <View style={{ width: responsiveWidth(40), height: responsiveHeight(8), borderBottomColor: '#E3E3E3', backgroundColor: activeTab == 'Type' ? '#EEF8FF' : '#fff', borderBottomWidth: 1, justifyContent: 'center', alignItems: 'center' }}>
                                    <Text style={{ color: '#444343', fontFamily: 'DMSans-SemiBold', fontSize: responsiveFontSize(2) }}>Type</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setActiveTab('Rating')}>
                                <View style={{ width: responsiveWidth(40), height: responsiveHeight(8), borderBottomColor: '#E3E3E3', backgroundColor: activeTab == 'Rating' ? '#EEF8FF' : '#fff', borderBottomWidth: 1, justifyContent: 'center', alignItems: 'center' }}>
                                    <Text style={{ color: '#444343', fontFamily: 'DMSans-SemiBold', fontSize: responsiveFontSize(2) }}>Rating</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setActiveTab('Gender')}>
                                <View style={{ width: responsiveWidth(40), height: responsiveHeight(8), borderBottomColor: '#E3E3E3', backgroundColor: activeTab == 'Gender' ? '#EEF8FF' : '#fff', borderBottomWidth: 1, justifyContent: 'center', alignItems: 'center' }}>
                                    <Text style={{ color: '#444343', fontFamily: 'DMSans-SemiBold', fontSize: responsiveFontSize(2) }}>Gender</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setActiveTab('Age')}>
                                <View style={{ width: responsiveWidth(40), height: responsiveHeight(8), borderBottomColor: '#E3E3E3', backgroundColor: activeTab == 'Age' ? '#EEF8FF' : '#fff', borderBottomWidth: 1, justifyContent: 'center', alignItems: 'center' }}>
                                    <Text style={{ color: '#444343', fontFamily: 'DMSans-SemiBold', fontSize: responsiveFontSize(2) }}>Age</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setActiveTab('Qualification')}>
                                <View style={{ width: responsiveWidth(40), height: responsiveHeight(8), borderBottomColor: '#E3E3E3', backgroundColor: activeTab == 'Qualification' ? '#EEF8FF' : '#fff', borderBottomWidth: 1, justifyContent: 'center', alignItems: 'center' }}>
                                    <Text style={{ color: '#444343', fontFamily: 'DMSans-SemiBold', fontSize: responsiveFontSize(2) }}>Qualification</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setActiveTab('Language')}>
                                <View style={{ width: responsiveWidth(40), height: responsiveHeight(8), borderBottomColor: '#E3E3E3', backgroundColor: activeTab == 'Language' ? '#EEF8FF' : '#fff', borderBottomWidth: 1, justifyContent: 'center', alignItems: 'center' }}>
                                    <Text style={{ color: '#444343', fontFamily: 'DMSans-SemiBold', fontSize: responsiveFontSize(2) }}>Language</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setActiveTab('Rate')}>
                                <View style={{ width: responsiveWidth(40), height: responsiveHeight(8), borderBottomColor: '#E3E3E3', backgroundColor: activeTab == 'Rate' ? '#EEF8FF' : '#fff', borderBottomWidth: 1, justifyContent: 'center', alignItems: 'center' }}>
                                    <Text style={{ color: '#444343', fontFamily: 'DMSans-SemiBold', fontSize: responsiveFontSize(2) }}>Price</Text>
                                </View>
                            </TouchableOpacity>
                            {/* <TouchableOpacity onPress={() => setActiveTab('Availability')}>
                                    <View style={{ width: responsiveWidth(40), height: responsiveHeight(8), borderBottomColor: '#E3E3E3', backgroundColor: activeTab == 'Availability' ? '#EEF8FF' : '#fff', borderBottomWidth: 1, justifyContent: 'center', alignItems: 'center' }}>
                                        <Text style={{ color: '#444343', fontFamily: 'DMSans-SemiBold', fontSize: responsiveFontSize(2) }}>Availability</Text>
                                    </View>
                                </TouchableOpacity> */}
                        </View>
                        <View style={{ padding: 20, width: responsiveWidth(59), }}>
                            {/* Experience */}
                            {activeTab == 'Experience' ?
                                <View style={{}}>
                                    <SelectMultiple
                                        items={Experience}
                                        selectedItems={selectedExperience}
                                        onSelectionsChange={onSelectionsChangeExperience}
                                        rowStyle={styles.item}
                                        labelStyle={styles.itemText}
                                    />
                                </View>
                                : activeTab == 'Type' ?
                                    <View style={{}}>
                                        <SelectMultiple
                                            items={qualificationitemsType}
                                            selectedItems={selectedType}
                                            onSelectionsChange={onSelectionsChangeType}
                                            rowStyle={styles.item}
                                            labelStyle={styles.itemText}
                                        />
                                    </View>
                                    : activeTab == 'Rating' ?
                                        <View style={{}}>
                                            <SelectMultiple
                                                items={Rating}
                                                selectedItems={selectedRating}
                                                onSelectionsChange={onSelectionsChangeRating}
                                                rowStyle={styles.item}
                                                labelStyle={styles.itemText}
                                            />
                                        </View>
                                        : activeTab == 'Gender' ?
                                            <View style={{}}>
                                                <SelectMultiple
                                                    items={Gender}
                                                    selectedItems={selectedGender}
                                                    onSelectionsChange={onSelectionsChangeGender}
                                                    rowStyle={styles.item}
                                                    labelStyle={styles.itemText}
                                                />
                                            </View>

                                            : activeTab == 'Age' ?
                                                // <View style={{}}>
                                                //     <SelectMultiple
                                                //         items={Ages}
                                                //         selectedItems={selectedAge}
                                                //         onSelectionsChange={onSelectionsChangeAge}
                                                //         rowStyle={styles.item}
                                                //         labelStyle={styles.itemText}
                                                //     />
                                                // </View>
                                                <View style={{ marginTop: responsiveHeight(20), justifyContent: 'center', alignItems: 'center', width: responsiveWidth(50) }}>
                                                    <MultiSlider
                                                        values={sliderValuesForAge}
                                                        sliderLength={180}
                                                        onValuesChange={sliderValuesChangeForAge}
                                                        min={18}
                                                        max={100}
                                                        step={1}
                                                        vertical={true}
                                                        allowOverlap={false}
                                                        snapped
                                                        selectedStyle={{
                                                            backgroundColor: '#417AA4',
                                                        }}
                                                        unselectedStyle={{
                                                            backgroundColor: 'gray',
                                                        }}
                                                        markerStyle={{
                                                            backgroundColor: '#417AA4',
                                                            height: 15,
                                                            width: 15,
                                                            borderRadius: 15 / 2,
                                                        }}
                                                    />
                                                    <Text style={styles.valueText}>Age Range: {sliderValuesForAge[0]} - {sliderValuesForAge[1]}</Text>
                                                </View>


                                                : activeTab == 'Qualification' ?
                                                    <View style={{}}>
                                                        <SelectMultiple
                                                            items={qualificationitems}
                                                            selectedItems={selectedQualification}
                                                            onSelectionsChange={onSelectionsChangeQualification}
                                                            rowStyle={styles.item}
                                                            labelStyle={styles.itemText}
                                                        />
                                                    </View>
                                                    : activeTab == 'Language' ?
                                                        <View style={{}}>
                                                            <SelectMultiple
                                                                items={qualificationitemsLanguage}
                                                                selectedItems={selectedLanguage}
                                                                onSelectionsChange={onSelectionsChangeLanguage}
                                                                rowStyle={styles.item}
                                                                labelStyle={styles.itemText}
                                                            />
                                                        </View>
                                                        : activeTab == 'Rate' ?
                                                            <View style={{ marginTop: responsiveHeight(20), justifyContent: 'center', alignItems: 'center', width: responsiveWidth(50) }}>
                                                                <MultiSlider
                                                                    values={sliderValuesForPrice}
                                                                    sliderLength={180}
                                                                    onValuesChange={sliderValuesChange}
                                                                    min={0}
                                                                    max={2000}
                                                                    step={1}
                                                                    vertical={true}
                                                                    allowOverlap={false}
                                                                    snapped
                                                                    selectedStyle={{
                                                                        backgroundColor: '#417AA4',
                                                                    }}
                                                                    unselectedStyle={{
                                                                        backgroundColor: 'gray',
                                                                    }}
                                                                    markerStyle={{
                                                                        backgroundColor: '#417AA4',
                                                                        height: 15,
                                                                        width: 15,
                                                                        borderRadius: 15 / 2,
                                                                    }}
                                                                />
                                                                <Text style={styles.valueText}>Price Range: ₹{sliderValuesForPrice[0]} - ₹{sliderValuesForPrice[1]}</Text>
                                                            </View>
                                                            :

                                                            <></>
                            }
                        </View>
                    </View>
                    {/* </ScrollView> */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', bottom: 0, width: responsiveWidth(100), paddingHorizontal: 10, borderTopColor: '#E3E3E3', borderTopWidth: 1 }}>
                        <View style={{ width: responsiveWidth(45), marginTop: responsiveHeight(2) }}>
                            <CustomButton label={"Reset"}
                                buttonColor={'gray'}
                                onPress={() => resetValueOfFilter()}
                            />
                        </View>
                        <View style={{ width: responsiveWidth(45), marginTop: responsiveHeight(2) }}>
                            <CustomButton label={"Apply"}
                                onPress={() => submitForFilter()}
                            />
                        </View>
                    </View>
                </View>
                {/* </TouchableWithoutFeedback> */}
            </Modal>
        </SafeAreaView >
    )
}

export default TherapistList

const styles = StyleSheet.create({
    Container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    wrapper: {
        padding: responsiveWidth(2),

    },
    filterSection: {
        marginBottom: responsiveHeight(0),
        marginTop: responsiveHeight(1),
        paddingHorizontal: responsiveWidth(3)
    },
    filterSection1st: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: responsiveHeight(2)
    },
    filterIconView: {
        width: responsiveWidth(20),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    filterIconText: {
        fontSize: responsiveFontSize(2),
        color: '#2D2D2D',
        fontFamily: 'DMSans-Bold',
    },
    totalValue: {
        width: responsiveWidth(90),
        //height: responsiveHeight(36),
        //alignItems: 'center',
        backgroundColor: '#fff',
        //justifyContent: 'center',
        padding: 10,
        borderRadius: 15,
        elevation: 5,
        margin: 2,
        marginBottom: responsiveHeight(2)
    },
    totalValue1stSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    profilePicSection: {
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: responsiveWidth(25),
    },
    profilePicStyle: {
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
    contentStyle: {
        flexDirection: 'column',
        width: responsiveWidth(49),
        //backgroundColor:'red'
        //height: responsiveHeight(10)
    },
    contentStyleName: {
        fontSize: responsiveFontSize(2),
        color: '#2D2D2D',
        fontFamily: 'DMSans-Bold',
        marginBottom: responsiveHeight(1)
    },
    contentStyleQualification: {
        fontSize: responsiveFontSize(1.7),
        color: '#746868',
        fontFamily: 'DMSans-Medium',
        marginBottom: responsiveHeight(1)
    },
    contentStyleExp: {
        fontSize: responsiveFontSize(1.7),
        color: '#746868',
        fontFamily: 'DMSans-Regular',
        marginBottom: responsiveHeight(1)
    },
    contentStyleLang: {
        fontSize: responsiveFontSize(1.7),
        color: '#746868',
        fontFamily: 'DMSans-Medium',
        marginBottom: responsiveHeight(1)
    },
    contentStyleLangValue: {
        fontSize: responsiveFontSize(1.7),
        color: '#959595',
        fontFamily: 'DMSans-Regular',
    },
    contentStyleRate: {
        fontSize: responsiveFontSize(1.7),
        color: '#746868',
        fontFamily: 'DMSans-Medium',
        marginBottom: responsiveHeight(1)
    },
    contentStyleAvailableSlot: {
        fontSize: responsiveFontSize(1.5),
        fontFamily: 'DMSans-Medium',
        marginBottom: responsiveHeight(1)
    },
    totalValue2ndSection: {
        //marginTop: responsiveHeight(1),
        borderRadius: 10,
        padding: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    listButtonFirstSection: {
        width: responsiveWidth(18)
    },
    listButtonSecondSection: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        width: responsiveWidth(62)
    },
    iconView: {
        height: responsiveHeight(5),
        width: responsiveWidth(17),
        backgroundColor: '#FFF',
        borderColor: '#417AA4',
        borderWidth: 1,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center'
    },
    iconSize: {
        height: 25,
        width: 25
    },
    instantConnectView: {
        height: responsiveHeight(7),
        width: responsiveWidth(17),
        backgroundColor: '#EEF8FF',
        borderColor: '#417AA4',
        borderWidth: 1,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center'
    },
    instantConnectText: {
        color: '#566D7E',
        fontFamily: 'DMSans-Medium',
        fontSize: responsiveFontSize(1.7),
        textAlign: 'center'
    },
    totalValue3: {
        width: responsiveWidth(90),
        //height: responsiveHeight(36),
        //alignItems: 'center',
        backgroundColor: '#FFF',
        //justifyContent: 'center',
        padding: 15,
        borderRadius: 15,
        elevation: 5
    },
    item: {
        borderBottomWidth: 0,
    },
    itemText: {
        color: '#444343',
        fontFamily: 'DMSans-Bold',
        fontSize: responsiveFontSize(2),
    },
    // dropdown
    dropdown: {
        //height: responsiveHeight(4),
        //borderColor: 'gray',
        //borderWidth: 0.7,
        //borderRadius: 8,
        //paddingHorizontal: 8,

    },
    placeholderStyle: {
        fontSize: responsiveFontSize(2),
        color: '#2D2D2D',
        fontFamily: 'DMSans-Bold'
    },
    selectedTextStyle: {
        fontSize: responsiveFontSize(2),
        color: '#2D2D2D',
        fontFamily: 'DMSans-Bold'
    },
    inputSearchStyle: {
        height: 40,
        fontSize: 16,
        color: '#2D2D2D',
        fontFamily: 'DMSans-Regular'
    },

    //range slider
    slider: {
        width: responsiveWidth(50),
        height: responsiveWidth(10),
    },
    valueText: {
        fontSize: responsiveFontSize(2),
        marginBottom: 10,
        color: '#2D2D2D',
        fontFamily: 'DMSans-Regular',
        marginTop: responsiveHeight(15)
    },
    valueTextValue: {
        fontSize: responsiveFontSize(2),
        marginBottom: 10,
        color: '#2D2D2D',
        fontFamily: 'DMSans-Bold'
    },
    track: {
        height: 10,
        borderRadius: 5,
    },
    thumb: {
        width: 20,
        height: 20,
        borderRadius: 10,
    },
    editinput: {
        color: '#808080',
        fontFamily: 'DMSans-Regular',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: responsiveHeight(1),
        paddingLeft: responsiveHeight(1),
        borderColor: '#E0E0E0',
        borderWidth: 1,
        borderRadius: 8,
        width: responsiveWidth(88),
        height: responsiveHeight(7),
    },

});
