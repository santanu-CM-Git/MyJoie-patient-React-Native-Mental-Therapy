import React, { useContext, useState, useEffect } from 'react';
import { View, Text, SafeAreaView, StyleSheet, ScrollView, Switch, Image, Platform, Alert, Button } from 'react-native'
import CustomHeader from '../../components/CustomHeader'
import CustomButton from '../../components/CustomButton';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { ArrowGratter, ArrowUp, GreenTick, Payment, YellowTck, dateIcon, deleteImg, editImg, notifyImg, plus, timeIcon, userPhoto } from '../../utils/Images'
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NoNotification from './NoNotification';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { Dropdown } from 'react-native-element-dropdown';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import Icon from 'react-native-vector-icons/Entypo';
import Modal from "react-native-modal";
import moment from 'moment';
import DateTimePickerModal from "react-native-modal-datetime-picker";
const data = [
    { label: 'Today', value: '1' },
    { label: 'Date Wise', value: '2' },
];

const ScheduleScreen = ({ navigation }) => {

    const [activeTab, setActiveTab] = useState('Calender')
    const [isEnabled, setIsEnabled] = useState(false);
    const toggleSwitch = () => setIsEnabled(previousState => !previousState);
    const [isModalVisible, setModalVisible] = useState(false);
    const [startDay, setStartDay] = useState(null);
    const [endDay, setEndDay] = useState(null);
    const [markedDates, setMarkedDates] = useState({});
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

    const showDatePicker = () => {
        setDatePickerVisibility(true);
    };

    const hideDatePicker = () => {
        setDatePickerVisibility(false);
    };

    const handleConfirm = (date) => {
        console.warn("A date has been picked: ", date);
        hideDatePicker();
    };

    const handleDayPress = (day) => {
        if (startDay && !endDay) {
            const date = {}
            for (const d = moment(startDay); d.isSameOrBefore(day.dateString); d.add(1, 'days')) {
                //console.log(d,'vvvvvvvvvv')
                date[d.format('YYYY-MM-DD')] = {
                    marked: true,
                    color: 'black',
                    textColor: 'white'
                };

                if (d.format('YYYY-MM-DD') === startDay) {
                    date[d.format('YYYY-MM-DD')].startingDay = true;
                }
                if (d.format('YYYY-MM-DD') === day.dateString) {
                    date[d.format('YYYY-MM-DD')].endingDay = true;
                }
            }

            setMarkedDates(date);
            setEndDay(day.dateString);
        }
        else {
            setStartDay(day.dateString)
            setEndDay(null)
            setMarkedDates({
                [day.dateString]: {
                    marked: true,
                    color: 'black',
                    textColor: 'white',
                    startingDay: true,
                    endingDay: true
                }
            })
        }

    }

    const dateRangeSearch = () => {
        console.log(startDay)
        console.log(endDay)
        toggleModal()
    }

    const toggleModal = () => {
        setModalVisible(!isModalVisible);
    };

    const toggleTab = (name) => {
        setActiveTab(name)
    }

    return (
        <SafeAreaView style={styles.Container}>
            <CustomHeader commingFrom={'Schedule'} onPress={() => navigation.goBack()} title={'Schedule'} />
            <ScrollView style={styles.wrapper}>
                <View style={{ marginBottom: responsiveHeight(3) }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <TouchableOpacity onPress={() => toggleTab('Calender')}>
                            <View style={activeTab == 'Calender' ? styles.activeButtonView : styles.inActiveButtonView}>
                                <Text style={activeTab == 'Calender' ? styles.activeButtonText : styles.inActiveButtonText}>Calendar</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => toggleTab('Availability')}>
                            <View style={activeTab == 'Availability' ? styles.activeButtonView : styles.inActiveButtonView}>
                                <Text style={activeTab == 'Availability' ? styles.activeButtonText : styles.inActiveButtonText}>Availability</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                    {activeTab == 'Calender' ?
                        <>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: responsiveHeight(2) }}>
                                <Text style={{ color: '#2D2D2D', fontFamily: 'DMSans-Bold', fontSize: responsiveFontSize(2) }}>Calender</Text>
                                <TouchableOpacity onPress={toggleModal}>
                                    <Image
                                        source={dateIcon}
                                        style={{ height: 20, width: 20, resizeMode: 'contain', }}
                                    />
                                </TouchableOpacity>
                            </View>

                            <View style={{ width: '99%', backgroundColor: '#FFF', marginHorizontal: 2, borderRadius: 20, marginTop: responsiveHeight(2), elevation: 5 }}>
                                <View style={{ flexDirection: 'row', height: responsiveHeight(7), backgroundColor: '#DEDEDE', borderTopRightRadius: 10, borderTopLeftRadius: 10, alignItems: 'center', }}>
                                    <Text style={{ color: '#2D2D2D', fontFamily: 'DMSans-Bold', fontSize: responsiveFontSize(2), fontWeight: 'bold', textAlign: 'center', marginLeft: responsiveWidth(2) }}>03-05-2024</Text>
                                </View>
                                <>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10, paddingVertical: 5, marginTop: 5 }}>
                                        <Text style={{ color: '#2D2D2D', fontFamily: 'DMSans-Bold', fontSize: responsiveFontSize(2) }}>Shubham Halder</Text>
                                        <Image
                                            source={ArrowGratter}
                                            style={{ height: 20, width: 20, resizeMode: 'contain' }}
                                        />
                                    </View>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10, paddingVertical: 5, }}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Text style={{ color: '#969696', fontFamily: 'DMSans-Medium', fontSize: responsiveFontSize(1.7) }}>06:00 PM - 06:15 PM</Text>
                                            <View style={{ paddingHorizontal: 10, paddingVertical: 5, backgroundColor: '#FF9E45', borderRadius: 15, marginLeft: responsiveWidth(2) }}>
                                                <Text style={{ color: '#FFF', fontFamily: 'DMSans-Semibold', fontSize: responsiveFontSize(1.5) }}>New</Text>
                                            </View>
                                        </View>
                                        <Text style={{ color: '#969696', fontFamily: 'DMSans-Medium', fontSize: responsiveFontSize(1.7) }}>Free</Text>
                                    </View>
                                    <View
                                        style={{
                                            borderBottomColor: '#E3E3E3',
                                            borderBottomWidth: 1,
                                            marginHorizontal: 10,
                                            marginTop: 5

                                        }}
                                    />
                                </>
                                <>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10, paddingVertical: 5, marginTop: 5 }}>
                                        <Text style={{ color: '#2D2D2D', fontFamily: 'DMSans-Bold', fontSize: responsiveFontSize(2) }}>Shubham Halder</Text>
                                        <Image
                                            source={ArrowGratter}
                                            style={{ height: 20, width: 20, resizeMode: 'contain' }}
                                        />
                                    </View>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10, paddingVertical: 5, }}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Text style={{ color: '#969696', fontFamily: 'DMSans-Medium', fontSize: responsiveFontSize(1.7) }}>06:00 PM - 06:15 PM</Text>
                                            <View style={{ paddingHorizontal: 10, paddingVertical: 5, backgroundColor: '#128807', borderRadius: 15, marginLeft: responsiveWidth(2) }}>
                                                <Text style={{ color: '#FFF', fontFamily: 'DMSans-Semibold', fontSize: responsiveFontSize(1.5) }}>New</Text>
                                            </View>
                                        </View>
                                        <Text style={{ color: '#969696', fontFamily: 'DMSans-Medium', fontSize: responsiveFontSize(1.7) }}>Free</Text>
                                    </View>
                                    <View
                                        style={{
                                            borderBottomColor: '#E3E3E3',
                                            borderBottomWidth: 1,
                                            marginHorizontal: 10,
                                            marginTop: 5

                                        }}
                                    />
                                </>
                            </View>
                        </>
                        :
                        <>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: responsiveHeight(2) }}>
                                <Text style={{ color: '#2D2D2D', fontFamily: 'DMSans-Bold', fontSize: responsiveFontSize(2) }}>Availability</Text>
                            </View>
                            <View style={{ width: '99%', backgroundColor: '#FFF', marginHorizontal: 2, borderRadius: 20, marginTop: responsiveHeight(2), elevation: 5, padding: 15 }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: responsiveHeight(1) }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Image
                                            source={dateIcon}
                                            style={{ height: 20, width: 20, resizeMode: 'contain', marginRight: 5 }}
                                        />
                                        <Text style={{ color: '#2D2D2D', fontFamily: 'DMSans-Bold', fontSize: responsiveFontSize(1.7) }}>Monday</Text>
                                    </View>
                                    <Switch
                                        trackColor={{ false: '#767577', true: '#000' }}
                                        thumbColor={isEnabled ? '#fff' : '#000'}
                                        ios_backgroundColor="#3e3e3e"
                                        onValueChange={toggleSwitch}
                                        value={isEnabled}
                                        style={styles.switchStyle}
                                    />
                                </View>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <TouchableOpacity onPress={()=> showDatePicker()}>
                                    <View style={{flexDirection:'row',justifyContent: 'space-between',alignItems:'center', borderRadius: 15, borderColor: '#E3E3E3', borderWidth: 1, height: responsiveHeight(6), width: responsiveWidth(40),padding: 5 }}>
                                        <Text style={{ color: '#746868', fontFamily: 'DMSans-Medium', fontSize: responsiveFontSize(1.7) }}>Start Time</Text>
                                        <Image
                                            source={timeIcon}
                                            style={{ height: 20, width: 20, resizeMode: 'contain', marginRight: 5 }}
                                        />
                                    </View>
                                    </TouchableOpacity>
                                    <View style={{flexDirection:'row',justifyContent: 'space-between',alignItems:'center', borderRadius: 15, borderColor: '#E3E3E3', borderWidth: 1, height: responsiveHeight(6), width: responsiveWidth(40),padding: 5 }}>
                                        <Text style={{ color: '#746868', fontFamily: 'DMSans-Medium', fontSize: responsiveFontSize(1.7) }}>End Time</Text>
                                        <Image
                                            source={timeIcon}
                                            style={{ height: 20, width: 20, resizeMode: 'contain', marginRight: 5 }}
                                        />
                                    </View>
                                </View>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: responsiveHeight(2) }}>

                                    <View style={styles.inActiveButtonInsideView}>
                                        <Image
                                            source={plus}
                                            style={{ height: 20, width: 20, resizeMode: 'contain', marginRight: 5 }}
                                        />
                                        <Text style={styles.activeButtonInsideText}>Add New Time</Text>
                                    </View>
                                </View>
                                <DateTimePickerModal
                                    isVisible={isDatePickerVisible}
                                    mode="time"
                                    onConfirm={handleConfirm}
                                    onCancel={hideDatePicker}
                                    locale="en_GB"
                                    is24Hour={false}
                                />
                            </View>
                        </>
                    }
                </View>
            </ScrollView>
            <Modal
                isVisible={isModalVisible}
                style={{
                    margin: 0, // Add this line to remove the default margin
                    justifyContent: 'flex-end',
                }}>
                <View style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', height: 50, width: 50, borderRadius: 25, position: 'absolute', bottom: '75%', left: '45%', right: '45%' }}>
                    <Icon name="cross" size={30} color="#000" onPress={toggleModal} />
                </View>
                <View style={{ height: '70%', backgroundColor: '#fff', position: 'absolute', bottom: 0, width: '100%' }}>
                    <View style={{ padding: 20 }}>
                        <View style={{ marginBottom: responsiveHeight(3) }}>
                            <Text style={{ color: '#444', fontFamily: 'DMSans-Medium', fontSize: responsiveFontSize(2) }}>Select your date</Text>
                            <Calendar
                                onDayPress={(day) => {
                                    handleDayPress(day)
                                }}
                                //monthFormat={"yyyy MMM"}
                                //hideDayNames={false}
                                markingType={'period'}
                                markedDates={markedDates}
                                theme={{
                                    selectedDayBackgroundColor: '#339999',
                                    selectedDayTextColor: 'white',
                                    monthTextColor: '#339999',
                                    textMonthFontFamily: 'DMSans-Medium',
                                    dayTextColor: 'black',
                                    textMonthFontSize: 18,
                                    textDayHeaderFontSize: 16,
                                    arrowColor: '#2E2E2E',
                                    dotColor: 'black'
                                }}
                                style={{
                                    borderWidth: 1,
                                    borderColor: '#E3EBF2',
                                    borderRadius: 15,
                                    height: responsiveHeight(50),
                                    marginTop: 20,
                                    marginBottom: 10
                                }}
                            />
                            <View style={styles.buttonwrapper2}>
                                <CustomButton label={"Ok"} onPress={() => { dateRangeSearch() }} />
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
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
        width: responsiveWidth(40),
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
        width: responsiveWidth(40),
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


});
