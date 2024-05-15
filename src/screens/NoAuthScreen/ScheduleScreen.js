import React, { useContext, useState, useEffect } from 'react';
import { View, Text, SafeAreaView, StyleSheet, ScrollView, Switch, Image, Platform, Alert, Button } from 'react-native'
import CustomHeader from '../../components/CustomHeader'
import CustomButton from '../../components/CustomButton';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { ArrowGratter, dateIcon, deleteImg, plus, timeIcon } from '../../utils/Images'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import Icon from 'react-native-vector-icons/Entypo';
import Modal from "react-native-modal";
// import moment from 'moment';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import moment from 'moment-timezone';
const data = [
    { label: 'Today', value: '1' },
    { label: 'Date Wise', value: '2' },
];

const ScheduleScreen = ({ navigation }) => {

    const [activeTab, setActiveTab] = useState('Calender')
    // Monday
    const [isEnabled, setIsEnabled] = useState(false);
    const toggleSwitch = () => setIsEnabled(previousState => !previousState);
    // Tuesday
    const [isEnabledTuesday, setIsEnabledTuesday] = useState(false);
    const toggleSwitchTuesday = () => setIsEnabledTuesday(previousState => !previousState);
    // Wednesday
    const [isEnabledWednesday, setIsEnabledWednesday] = useState(false);
    const toggleSwitchWednesday = () => setIsEnabledWednesday(previousState => !previousState);
    // Thursday
    const [isEnabledThursday, setIsEnabledThursday] = useState(false);
    const toggleSwitchThursday = () => setIsEnabledThursday(previousState => !previousState);
    // Friday
    const [isEnabledFriday, setIsEnabledFriday] = useState(false);
    const toggleSwitchFriday = () => setIsEnabledFriday(previousState => !previousState);
    // Saturday
    const [isEnabledSaturday, setIsEnabledSaturday] = useState(false);
    const toggleSwitchSaturday = () => setIsEnabledSaturday(previousState => !previousState);
    // Sunday
    const [isEnabledSunday, setIsEnabledSunday] = useState(false);
    const toggleSwitchSunday = () => setIsEnabledSunday(previousState => !previousState);

    const [isModalVisible, setModalVisible] = useState(false);
    const [startDay, setStartDay] = useState(null);
    const [endDay, setEndDay] = useState(null);
    const [markedDates, setMarkedDates] = useState({});
    // Monday 
    const [timeRanges, setTimeRanges] = useState([{ "endTime": "2024-05-09 18:20:00", "startTime": "2024-05-09 17:10:00" }, { "endTime": "2024-05-09 14:33:00", "startTime": "2024-05-09 15:28:00" }]);
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [currentRange, setCurrentRange] = useState(null);
    const [isStartTime, setIsStartTime] = useState(true);

    const showDatePicker = (index, isStart) => {
        setDatePickerVisibility(true);
        setCurrentRange(index);
        setIsStartTime(isStart);
    };

    const hideDatePicker = () => {
        setDatePickerVisibility(false);
    };

    const handleConfirm = (date) => {
        const dateInIST = moment(date).tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss'); // Convert to IST and back to JS Date object

        setTimeRanges(currentRanges => {
            const newRanges = [...currentRanges];
            if (isStartTime) {
                newRanges[currentRange].startTime = dateInIST;
            } else {
                newRanges[currentRange].endTime = dateInIST;
            }
            return newRanges;
        });
        hideDatePicker();
    };

    const addNewTimeRange = () => {
        setTimeRanges(currentRanges => [...currentRanges, { startTime: null, endTime: null }]);
    };

    const deleteTimeRange = index => {
        setTimeRanges(currentRanges => currentRanges.filter((_, i) => i !== index));
    };

    const saveTimeRange = () => {
        console.log(timeRanges)
        let filteredEvents = timeRanges.filter(event => event.startTime !== null && event.endTime !== null);
        console.log(filteredEvents)
    }

    // Tuesday
    const [timeRangesTuesday, setTimeRangesTuesday] = useState([{ startTime: null, endTime: null }]);
    const [isDatePickerVisibleTuesday, setDatePickerVisibilityTuesday] = useState(false);
    const [currentRangeTuesday, setCurrentRangeTuesday] = useState(null);
    const [isStartTimeTuesday, setIsStartTimeTuesday] = useState(true);

    const showDatePickerTuesday = (index, isStart) => {
        setDatePickerVisibilityTuesday(true);
        setCurrentRangeTuesday(index);
        setIsStartTimeTuesday(isStart);
    };

    const hideDatePickerTuesday = () => {
        setDatePickerVisibilityTuesday(false);
    };

    const handleConfirmTuesday = (date) => {
        const dateInIST = moment(date).tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss'); // Convert to IST and back to JS Date object

        setTimeRangesTuesday(currentRanges => {
            const newRanges = [...currentRanges];
            if (isStartTimeTuesday) {
                newRanges[currentRangeTuesday].startTime = dateInIST;
            } else {
                newRanges[currentRangeTuesday].endTime = dateInIST;
            }
            return newRanges;
        });
        hideDatePickerTuesday();
    };

    const addNewTimeRangeTuesday = () => {
        setTimeRangesTuesday(currentRanges => [...currentRanges, { startTime: null, endTime: null }]);
    };

    const deleteTimeRangeTuesday = index => {
        setTimeRangesTuesday(currentRanges => currentRanges.filter((_, i) => i !== index));
    };

    const saveTimeRangeTuesday = () => {
        console.log(timeRangesTuesday)
        let filteredEvents = timeRangesTuesday.filter(event => event.startTime !== null && event.endTime !== null);
        console.log(filteredEvents)
    }

    // Wednesday
    const [timeRangesWednesday, setTimeRangesWednesday] = useState([{ startTime: null, endTime: null }]);
    const [isDatePickerVisibleWednesday, setDatePickerVisibilityWednesday] = useState(false);
    const [currentRangeWednesday, setCurrentRangeWednesday] = useState(null);
    const [isStartTimeWednesday, setIsStartTimeWednesday] = useState(true);

    const showDatePickerWednesday = (index, isStart) => {
        setDatePickerVisibilityWednesday(true);
        setCurrentRangeWednesday(index);
        setIsStartTimeWednesday(isStart);
    };

    const hideDatePickerWednesday = () => {
        setDatePickerVisibilityWednesday(false);
    };

    const handleConfirmWednesday = (date) => {
        const dateInIST = moment(date).tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss'); // Convert to IST and back to JS Date object

        setTimeRangesWednesday(currentRanges => {
            const newRanges = [...currentRanges];
            if (isStartTimeWednesday) {
                newRanges[currentRangeWednesday].startTime = dateInIST;
            } else {
                newRanges[currentRangeWednesday].endTime = dateInIST;
            }
            return newRanges;
        });
        hideDatePickerWednesday();
    };

    const addNewTimeRangeWednesday = () => {
        setTimeRangesWednesday(currentRanges => [...currentRanges, { startTime: null, endTime: null }]);
    };

    const deleteTimeRangeWednesday = index => {
        setTimeRangesWednesday(currentRanges => currentRanges.filter((_, i) => i !== index));
    };

    const saveTimeRangeWednesday = () => {
        console.log(timeRangesWednesday)
        let filteredEvents = timeRangesWednesday.filter(event => event.startTime !== null && event.endTime !== null);
        console.log(filteredEvents)
    }

    // Thursday
    const [timeRangesThursday, setTimeRangesThursday] = useState([{ startTime: null, endTime: null }]);
    const [isDatePickerVisibleThursday, setDatePickerVisibilityThursday] = useState(false);
    const [currentRangeThursday, setCurrentRangeThursday] = useState(null);
    const [isStartTimeThursday, setIsStartTimeThursday] = useState(true);

    const showDatePickerThursday = (index, isStart) => {
        setDatePickerVisibilityThursday(true);
        setCurrentRangeThursday(index);
        setIsStartTimeThursday(isStart);
    };

    const hideDatePickerThursday = () => {
        setDatePickerVisibilityThursday(false);
    };

    const handleConfirmThursday = (date) => {
        const dateInIST = moment(date).tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss'); // Convert to IST and back to JS Date object

        setTimeRangesThursday(currentRanges => {
            const newRanges = [...currentRanges];
            if (isStartTimeThursday) {
                newRanges[currentRangeThursday].startTime = dateInIST;
            } else {
                newRanges[currentRangeThursday].endTime = dateInIST;
            }
            return newRanges;
        });
        hideDatePickerThursday();
    };

    const addNewTimeRangeThursday = () => {
        setTimeRangesThursday(currentRanges => [...currentRanges, { startTime: null, endTime: null }]);
    };

    const deleteTimeRangeThursday = index => {
        setTimeRangesThursday(currentRanges => currentRanges.filter((_, i) => i !== index));
    };

    const saveTimeRangeThursday = () => {
        console.log(timeRangesThursday)
        let filteredEvents = timeRangesThursday.filter(event => event.startTime !== null && event.endTime !== null);
        console.log(filteredEvents)
    }
    // Friday
    const [timeRangesFriday, setTimeRangesFriday] = useState([{ startTime: null, endTime: null }]);
    const [isDatePickerVisibleFriday, setDatePickerVisibilityFriday] = useState(false);
    const [currentRangeFriday, setCurrentRangeFriday] = useState(null);
    const [isStartTimeFriday, setIsStartTimeFriday] = useState(true);

    const showDatePickerFriday = (index, isStart) => {
        setDatePickerVisibilityFriday(true);
        setCurrentRangeFriday(index);
        setIsStartTimeFriday(isStart);
    };

    const hideDatePickerFriday = () => {
        setDatePickerVisibilityFriday(false);
    };

    const handleConfirmFriday = (date) => {
        const dateInIST = moment(date).tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss'); // Convert to IST and back to JS Date object

        setTimeRangesFriday(currentRanges => {
            const newRanges = [...currentRanges];
            if (isStartTimeFriday) {
                newRanges[currentRangeFriday].startTime = dateInIST;
            } else {
                newRanges[currentRangeFriday].endTime = dateInIST;
            }
            return newRanges;
        });
        hideDatePickerFriday();
    };

    const addNewTimeRangeFriday = () => {
        setTimeRangesFriday(currentRanges => [...currentRanges, { startTime: null, endTime: null }]);
    };

    const deleteTimeRangeFriday = index => {
        setTimeRangesFriday(currentRanges => currentRanges.filter((_, i) => i !== index));
    };

    const saveTimeRangeFriday = () => {
        console.log(timeRangesFriday)
        let filteredEvents = timeRangesFriday.filter(event => event.startTime !== null && event.endTime !== null);
        console.log(filteredEvents)
    }

    // Saturday
    const [timeRangesSaturday, setTimeRangesSaturday] = useState([{ startTime: null, endTime: null }]);
    const [isDatePickerVisibleSaturday, setDatePickerVisibilitySaturday] = useState(false);
    const [currentRangeSaturday, setCurrentRangeSaturday] = useState(null);
    const [isStartTimeSaturday, setIsStartTimeSaturday] = useState(true);

    const showDatePickerSaturday = (index, isStart) => {
        setDatePickerVisibilitySaturday(true);
        setCurrentRangeSaturday(index);
        setIsStartTimeSaturday(isStart);
    };

    const hideDatePickerSaturday = () => {
        setDatePickerVisibilitySaturday(false);
    };

    const handleConfirmSaturday = (date) => {
        const dateInIST = moment(date).tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss'); // Convert to IST and back to JS Date object

        setTimeRangesSaturday(currentRanges => {
            const newRanges = [...currentRanges];
            if (isStartTimeSaturday) {
                newRanges[currentRangeSaturday].startTime = dateInIST;
            } else {
                newRanges[currentRangeSaturday].endTime = dateInIST;
            }
            return newRanges;
        });
        hideDatePickerSaturday();
    };

    const addNewTimeRangeSaturday = () => {
        setTimeRangesSaturday(currentRanges => [...currentRanges, { startTime: null, endTime: null }]);
    };

    const deleteTimeRangeSaturday = index => {
        setTimeRangesSaturday(currentRanges => currentRanges.filter((_, i) => i !== index));
    };

    const saveTimeRangeSaturday = () => {
        console.log(timeRangesSaturday)
        let filteredEvents = timeRangesSaturday.filter(event => event.startTime !== null && event.endTime !== null);
        console.log(filteredEvents)
    }

    // Sunday
    const [timeRangesSunday, setTimeRangesSunday] = useState([{ startTime: null, endTime: null }]);
    const [isDatePickerVisibleSunday, setDatePickerVisibilitySunday] = useState(false);
    const [currentRangeSunday, setCurrentRangeSunday] = useState(null);
    const [isStartTimeSunday, setIsStartTimeSunday] = useState(true);

    const showDatePickerSunday = (index, isStart) => {
        setDatePickerVisibilitySunday(true);
        setCurrentRangeSunday(index);
        setIsStartTimeSunday(isStart);
    };

    const hideDatePickerSunday = () => {
        setDatePickerVisibilitySunday(false);
    };

    const handleConfirmSunday = (date) => {
        const dateInIST = moment(date).tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss'); // Convert to IST and back to JS Date object

        setTimeRangesSunday(currentRanges => {
            const newRanges = [...currentRanges];
            if (isStartTimeSunday) {
                newRanges[currentRangeSunday].startTime = dateInIST;
            } else {
                newRanges[currentRangeSunday].endTime = dateInIST;
            }
            return newRanges;
        });
        hideDatePickerSunday();
    };

    const addNewTimeRangeSunday = () => {
        setTimeRangesSunday(currentRanges => [...currentRanges, { startTime: null, endTime: null }]);
    };

    const deleteTimeRangeSunday = index => {
        setTimeRangesSunday(currentRanges => currentRanges.filter((_, i) => i !== index));
    };

    const saveTimeRangeSunday = () => {
        console.log(timeRangesSunday)
        let filteredEvents = timeRangesSunday.filter(event => event.startTime !== null && event.endTime !== null);
        console.log(filteredEvents)
    }

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
                                        <Text style={{ color: '#5C9ECF', fontFamily: 'DMSans-Medium', fontSize: responsiveFontSize(1.7) }}>Free</Text>
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
                                        <Text style={{ color: '#5C9ECF', fontFamily: 'DMSans-Medium', fontSize: responsiveFontSize(1.7) }}>Free</Text>
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
                            {/* Monday card */}
                            <View style={{ width: '99%', backgroundColor: isEnabled ? '#FFF' : '#D3D3D3', marginHorizontal: 2, borderRadius: 20, marginTop: responsiveHeight(2), elevation: 5, padding: 15 }}>
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
                                {/* <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}> */}
                                {timeRanges.map((range, index) => (
                                    <View key={index} style={styles.timeRangeContainer}>
                                        <TouchableOpacity onPress={() => isEnabled && showDatePicker(index, true)} style={styles.timePicker}>
                                            <Text style={styles.timeText}>
                                                {range.startTime ? moment(range.startTime).format('hh:mm A') : 'Start Time'}
                                            </Text>
                                            <Image source={timeIcon} style={styles.icon} />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => isEnabled && showDatePicker(index, false)} style={styles.timePicker}>
                                            <Text style={styles.timeText}>
                                                {range.endTime ? moment(range.endTime).format('hh:mm A') : 'End Time'}
                                            </Text>
                                            <Image source={timeIcon} style={styles.icon} />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => isEnabled && deleteTimeRange(index)} style={styles.deleteButton}>
                                            <Image source={deleteImg} style={styles.deleteIcon} />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                                {/* </View> */}
                                <TouchableOpacity onPress={() => isEnabled && addNewTimeRange()} >
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: responsiveHeight(2) }}>

                                        <View style={styles.inActiveButtonInsideView}>
                                            <Image
                                                source={plus}
                                                style={{ height: 20, width: 20, resizeMode: 'contain', marginRight: 5 }}
                                            />
                                            <Text style={styles.activeButtonInsideText}>Add New Time</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                                <View style={{ marginTop: responsiveHeight(2) }}>
                                    <CustomButton buttonColor={'small'} label={"Save"} onPress={() => { saveTimeRange() }} />
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
                            {/* Tuesday card */}
                            <View style={{ width: '99%', backgroundColor: isEnabledTuesday ? '#FFF' : '#D3D3D3', marginHorizontal: 2, borderRadius: 20, marginTop: responsiveHeight(2), elevation: 5, padding: 15 }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: responsiveHeight(1) }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Image
                                            source={dateIcon}
                                            style={{ height: 20, width: 20, resizeMode: 'contain', marginRight: 5 }}
                                        />
                                        <Text style={{ color: '#2D2D2D', fontFamily: 'DMSans-Bold', fontSize: responsiveFontSize(1.7) }}>Tuesday</Text>
                                    </View>
                                    <Switch
                                        trackColor={{ false: '#767577', true: '#000' }}
                                        thumbColor={isEnabledTuesday ? '#fff' : '#000'}
                                        ios_backgroundColor="#3e3e3e"
                                        onValueChange={toggleSwitchTuesday}
                                        value={isEnabledTuesday}
                                        style={styles.switchStyle}
                                    />
                                </View>
                                {/* <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}> */}
                                {timeRangesTuesday.map((range, index) => (
                                    <View key={index} style={styles.timeRangeContainer}>
                                        <TouchableOpacity onPress={() => isEnabledTuesday && showDatePickerTuesday(index, true)} style={styles.timePicker}>
                                            <Text style={styles.timeText}>
                                                {range.startTime ? moment(range.startTime).format('hh:mm A') : 'Start Time'}
                                            </Text>
                                            <Image source={timeIcon} style={styles.icon} />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => isEnabledTuesday && showDatePickerTuesday(index, false)} style={styles.timePicker}>
                                            <Text style={styles.timeText}>
                                                {range.endTime ? moment(range.endTime).format('hh:mm A') : 'End Time'}
                                            </Text>
                                            <Image source={timeIcon} style={styles.icon} />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => isEnabledTuesday && deleteTimeRangeTuesday(index)} style={styles.deleteButton}>
                                            <Image source={deleteImg} style={styles.deleteIcon} />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                                {/* </View> */}
                                <TouchableOpacity onPress={() => isEnabledTuesday && addNewTimeRangeTuesday()} >
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: responsiveHeight(2) }}>

                                        <View style={styles.inActiveButtonInsideView}>
                                            <Image
                                                source={plus}
                                                style={{ height: 20, width: 20, resizeMode: 'contain', marginRight: 5 }}
                                            />
                                            <Text style={styles.activeButtonInsideText}>Add New Time</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                                <View style={{ marginTop: responsiveHeight(2) }}>
                                    <CustomButton buttonColor={'small'} label={"Save"} onPress={() => { saveTimeRangeTuesday() }} />
                                </View>
                                <DateTimePickerModal
                                    isVisible={isDatePickerVisibleTuesday}
                                    mode="time"
                                    onConfirm={handleConfirmTuesday}
                                    onCancel={hideDatePickerTuesday}
                                    locale="en_GB"
                                    is24Hour={false}
                                />
                            </View>
                            {/* Wednesday */}
                            <View style={{ width: '99%', backgroundColor: isEnabledWednesday ? '#FFF' : '#D3D3D3', marginHorizontal: 2, borderRadius: 20, marginTop: responsiveHeight(2), elevation: 5, padding: 15 }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: responsiveHeight(1) }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Image
                                            source={dateIcon}
                                            style={{ height: 20, width: 20, resizeMode: 'contain', marginRight: 5 }}
                                        />
                                        <Text style={{ color: '#2D2D2D', fontFamily: 'DMSans-Bold', fontSize: responsiveFontSize(1.7) }}>Wednesday</Text>
                                    </View>
                                    <Switch
                                        trackColor={{ false: '#767577', true: '#000' }}
                                        thumbColor={isEnabledWednesday ? '#fff' : '#000'}
                                        ios_backgroundColor="#3e3e3e"
                                        onValueChange={toggleSwitchWednesday}
                                        value={isEnabledWednesday}
                                        style={styles.switchStyle}
                                    />
                                </View>
                                {/* <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}> */}
                                {timeRangesWednesday.map((range, index) => (
                                    <View key={index} style={styles.timeRangeContainer}>
                                        <TouchableOpacity onPress={() => isEnabledWednesday && showDatePickerWednesday(index, true)} style={styles.timePicker}>
                                            <Text style={styles.timeText}>
                                                {range.startTime ? moment(range.startTime).format('hh:mm A') : 'Start Time'}
                                            </Text>
                                            <Image source={timeIcon} style={styles.icon} />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => isEnabledWednesday && showDatePickerWednesday(index, false)} style={styles.timePicker}>
                                            <Text style={styles.timeText}>
                                                {range.endTime ? moment(range.endTime).format('hh:mm A') : 'End Time'}
                                            </Text>
                                            <Image source={timeIcon} style={styles.icon} />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => isEnabledWednesday && deleteTimeRangeWednesday(index)} style={styles.deleteButton}>
                                            <Image source={deleteImg} style={styles.deleteIcon} />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                                {/* </View> */}
                                <TouchableOpacity onPress={() => isEnabledWednesday && addNewTimeRangeWednesday()} >
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: responsiveHeight(2) }}>

                                        <View style={styles.inActiveButtonInsideView}>
                                            <Image
                                                source={plus}
                                                style={{ height: 20, width: 20, resizeMode: 'contain', marginRight: 5 }}
                                            />
                                            <Text style={styles.activeButtonInsideText}>Add New Time</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                                <View style={{ marginTop: responsiveHeight(2) }}>
                                    <CustomButton buttonColor={'small'} label={"Save"} onPress={() => { saveTimeRangeWednesday() }} />
                                </View>
                                <DateTimePickerModal
                                    isVisible={isDatePickerVisibleWednesday}
                                    mode="time"
                                    onConfirm={handleConfirmWednesday}
                                    onCancel={hideDatePickerWednesday}
                                    locale="en_GB"
                                    is24Hour={false}
                                />
                            </View>
                            {/* Thursday */}
                            <View style={{ width: '99%', backgroundColor: isEnabledThursday ? '#FFF' : '#D3D3D3', marginHorizontal: 2, borderRadius: 20, marginTop: responsiveHeight(2), elevation: 5, padding: 15 }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: responsiveHeight(1) }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Image
                                            source={dateIcon}
                                            style={{ height: 20, width: 20, resizeMode: 'contain', marginRight: 5 }}
                                        />
                                        <Text style={{ color: '#2D2D2D', fontFamily: 'DMSans-Bold', fontSize: responsiveFontSize(1.7) }}>Thursday</Text>
                                    </View>
                                    <Switch
                                        trackColor={{ false: '#767577', true: '#000' }}
                                        thumbColor={isEnabledThursday ? '#fff' : '#000'}
                                        ios_backgroundColor="#3e3e3e"
                                        onValueChange={toggleSwitchThursday}
                                        value={isEnabledThursday}
                                        style={styles.switchStyle}
                                    />
                                </View>
                                {/* <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}> */}
                                {timeRangesThursday.map((range, index) => (
                                    <View key={index} style={styles.timeRangeContainer}>
                                        <TouchableOpacity onPress={() => isEnabledThursday && showDatePickerThursday(index, true)} style={styles.timePicker}>
                                            <Text style={styles.timeText}>
                                                {range.startTime ? moment(range.startTime).format('hh:mm A') : 'Start Time'}
                                            </Text>
                                            <Image source={timeIcon} style={styles.icon} />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => isEnabledThursday && showDatePickerThursday(index, false)} style={styles.timePicker}>
                                            <Text style={styles.timeText}>
                                                {range.endTime ? moment(range.endTime).format('hh:mm A') : 'End Time'}
                                            </Text>
                                            <Image source={timeIcon} style={styles.icon} />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => isEnabledThursday && deleteTimeRangeThursday(index)} style={styles.deleteButton}>
                                            <Image source={deleteImg} style={styles.deleteIcon} />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                                {/* </View> */}
                                <TouchableOpacity onPress={() => isEnabledThursday && addNewTimeRangeThursday()} >
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: responsiveHeight(2) }}>

                                        <View style={styles.inActiveButtonInsideView}>
                                            <Image
                                                source={plus}
                                                style={{ height: 20, width: 20, resizeMode: 'contain', marginRight: 5 }}
                                            />
                                            <Text style={styles.activeButtonInsideText}>Add New Time</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                                <View style={{ marginTop: responsiveHeight(2) }}>
                                    <CustomButton buttonColor={'small'} label={"Save"} onPress={() => { saveTimeRangeThursday() }} />
                                </View>
                                <DateTimePickerModal
                                    isVisible={isDatePickerVisibleThursday}
                                    mode="time"
                                    onConfirm={handleConfirmThursday}
                                    onCancel={hideDatePickerThursday}
                                    locale="en_GB"
                                    is24Hour={false}
                                />
                            </View>
                            {/* Friday */}
                            <View style={{ width: '99%', backgroundColor: isEnabledFriday ? '#FFF' : '#D3D3D3', marginHorizontal: 2, borderRadius: 20, marginTop: responsiveHeight(2), elevation: 5, padding: 15 }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: responsiveHeight(1) }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Image
                                            source={dateIcon}
                                            style={{ height: 20, width: 20, resizeMode: 'contain', marginRight: 5 }}
                                        />
                                        <Text style={{ color: '#2D2D2D', fontFamily: 'DMSans-Bold', fontSize: responsiveFontSize(1.7) }}>Friday</Text>
                                    </View>
                                    <Switch
                                        trackColor={{ false: '#767577', true: '#000' }}
                                        thumbColor={isEnabledFriday ? '#fff' : '#000'}
                                        ios_backgroundColor="#3e3e3e"
                                        onValueChange={toggleSwitchFriday}
                                        value={isEnabledFriday}
                                        style={styles.switchStyle}
                                    />
                                </View>
                                {/* <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}> */}
                                {timeRangesFriday.map((range, index) => (
                                    <View key={index} style={styles.timeRangeContainer}>
                                        <TouchableOpacity onPress={() => isEnabledFriday && showDatePickerFriday(index, true)} style={styles.timePicker}>
                                            <Text style={styles.timeText}>
                                                {range.startTime ? moment(range.startTime).format('hh:mm A') : 'Start Time'}
                                            </Text>
                                            <Image source={timeIcon} style={styles.icon} />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => isEnabledFriday && showDatePickerFriday(index, false)} style={styles.timePicker}>
                                            <Text style={styles.timeText}>
                                                {range.endTime ? moment(range.endTime).format('hh:mm A') : 'End Time'}
                                            </Text>
                                            <Image source={timeIcon} style={styles.icon} />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => isEnabledFriday && deleteTimeRangeFriday(index)} style={styles.deleteButton}>
                                            <Image source={deleteImg} style={styles.deleteIcon} />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                                {/* </View> */}
                                <TouchableOpacity onPress={() => isEnabledFriday && addNewTimeRangeFriday()} >
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: responsiveHeight(2) }}>

                                        <View style={styles.inActiveButtonInsideView}>
                                            <Image
                                                source={plus}
                                                style={{ height: 20, width: 20, resizeMode: 'contain', marginRight: 5 }}
                                            />
                                            <Text style={styles.activeButtonInsideText}>Add New Time</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                                <View style={{ marginTop: responsiveHeight(2) }}>
                                    <CustomButton buttonColor={'small'} label={"Save"} onPress={() => { saveTimeRangeFriday() }} />
                                </View>
                                <DateTimePickerModal
                                    isVisible={isDatePickerVisibleFriday}
                                    mode="time"
                                    onConfirm={handleConfirmFriday}
                                    onCancel={hideDatePickerFriday}
                                    locale="en_GB"
                                    is24Hour={false}
                                />
                            </View>
                            {/* Saturday */}
                            <View style={{ width: '99%', backgroundColor: isEnabledSaturday ? '#FFF' : '#D3D3D3', marginHorizontal: 2, borderRadius: 20, marginTop: responsiveHeight(2), elevation: 5, padding: 15 }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: responsiveHeight(1) }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Image
                                            source={dateIcon}
                                            style={{ height: 20, width: 20, resizeMode: 'contain', marginRight: 5 }}
                                        />
                                        <Text style={{ color: '#2D2D2D', fontFamily: 'DMSans-Bold', fontSize: responsiveFontSize(1.7) }}>Saturday</Text>
                                    </View>
                                    <Switch
                                        trackColor={{ false: '#767577', true: '#000' }}
                                        thumbColor={isEnabledSaturday ? '#fff' : '#000'}
                                        ios_backgroundColor="#3e3e3e"
                                        onValueChange={toggleSwitchSaturday}
                                        value={isEnabledSaturday}
                                        style={styles.switchStyle}
                                    />
                                </View>
                                {/* <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}> */}
                                {timeRangesSaturday.map((range, index) => (
                                    <View key={index} style={styles.timeRangeContainer}>
                                        <TouchableOpacity onPress={() => isEnabledSaturday && showDatePickerSaturday(index, true)} style={styles.timePicker}>
                                            <Text style={styles.timeText}>
                                                {range.startTime ? moment(range.startTime).format('hh:mm A') : 'Start Time'}
                                            </Text>
                                            <Image source={timeIcon} style={styles.icon} />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => isEnabledSaturday && showDatePickerSaturday(index, false)} style={styles.timePicker}>
                                            <Text style={styles.timeText}>
                                                {range.endTime ? moment(range.endTime).format('hh:mm A') : 'End Time'}
                                            </Text>
                                            <Image source={timeIcon} style={styles.icon} />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => isEnabledSaturday && deleteTimeRangeSaturday(index)} style={styles.deleteButton}>
                                            <Image source={deleteImg} style={styles.deleteIcon} />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                                {/* </View> */}
                                <TouchableOpacity onPress={() => isEnabledSaturday && addNewTimeRangeSaturday()} >
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: responsiveHeight(2) }}>

                                        <View style={styles.inActiveButtonInsideView}>
                                            <Image
                                                source={plus}
                                                style={{ height: 20, width: 20, resizeMode: 'contain', marginRight: 5 }}
                                            />
                                            <Text style={styles.activeButtonInsideText}>Add New Time</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                                <View style={{ marginTop: responsiveHeight(2) }}>
                                    <CustomButton buttonColor={'small'} label={"Save"} onPress={() => { saveTimeRangeSaturday() }} />
                                </View>
                                <DateTimePickerModal
                                    isVisible={isDatePickerVisibleSaturday}
                                    mode="time"
                                    onConfirm={handleConfirmSaturday}
                                    onCancel={hideDatePickerSaturday}
                                    locale="en_GB"
                                    is24Hour={false}
                                />
                            </View>
                            {/* Sunday */}
                            <View style={{ width: '99%', backgroundColor: isEnabledSunday ? '#FFF' : '#D3D3D3', marginHorizontal: 2, borderRadius: 20, marginTop: responsiveHeight(2), elevation: 5, padding: 15 }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: responsiveHeight(1) }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Image
                                            source={dateIcon}
                                            style={{ height: 20, width: 20, resizeMode: 'contain', marginRight: 5 }}
                                        />
                                        <Text style={{ color: '#2D2D2D', fontFamily: 'DMSans-Bold', fontSize: responsiveFontSize(1.7) }}>Sunday</Text>
                                    </View>
                                    <Switch
                                        trackColor={{ false: '#767577', true: '#000' }}
                                        thumbColor={isEnabledSunday ? '#fff' : '#000'}
                                        ios_backgroundColor="#3e3e3e"
                                        onValueChange={toggleSwitchSunday}
                                        value={isEnabledSunday}
                                        style={styles.switchStyle}
                                    />
                                </View>
                                {/* <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}> */}
                                {timeRangesSunday.map((range, index) => (
                                    <View key={index} style={styles.timeRangeContainer}>
                                        <TouchableOpacity onPress={() => isEnabledSunday && showDatePickerSunday(index, true)} style={styles.timePicker}>
                                            <Text style={styles.timeText}>
                                                {range.startTime ? moment(range.startTime).format('hh:mm A') : 'Start Time'}
                                            </Text>
                                            <Image source={timeIcon} style={styles.icon} />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => isEnabledSunday && showDatePickerSunday(index, false)} style={styles.timePicker}>
                                            <Text style={styles.timeText}>
                                                {range.endTime ? moment(range.endTime).format('hh:mm A') : 'End Time'}
                                            </Text>
                                            <Image source={timeIcon} style={styles.icon} />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => isEnabledSunday && deleteTimeRangeSunday(index)} style={styles.deleteButton}>
                                            <Image source={deleteImg} style={styles.deleteIcon} />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                                {/* </View> */}
                                <TouchableOpacity onPress={() => isEnabledSunday && addNewTimeRangeSunday()} >
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: responsiveHeight(2) }}>

                                        <View style={styles.inActiveButtonInsideView}>
                                            <Image
                                                source={plus}
                                                style={{ height: 20, width: 20, resizeMode: 'contain', marginRight: 5 }}
                                            />
                                            <Text style={styles.activeButtonInsideText}>Add New Time</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                                <View style={{ marginTop: responsiveHeight(2) }}>
                                    <CustomButton buttonColor={'small'} label={"Save"} onPress={() => { saveTimeRangeSunday() }} />
                                </View>
                                <DateTimePickerModal
                                    isVisible={isDatePickerVisibleSunday}
                                    mode="time"
                                    onConfirm={handleConfirmSunday}
                                    onCancel={hideDatePickerSunday}
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
                    <Icon name="cross" size={30} color="#B0B0B0" onPress={toggleModal} />
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
        width: responsiveWidth(45),
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
        width: responsiveWidth(45),
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
    timePicker: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E3E3E3',
        borderRadius: 15,
        padding: 10,
        width: responsiveWidth(35),
        justifyContent: 'space-between'
    },
    icon: {
        width: 20,
        height: 20,
        resizeMode: 'contain',
    },
    timeRangeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    timeText: {
        marginRight: 10,
        fontSize: responsiveFontSize(1.7),
        color:'#746868'
    },
    deleteButton: {
        // Additional styles may be required
    },
    deleteIcon: {
        width: 24,
        height: 24,
    }

});
