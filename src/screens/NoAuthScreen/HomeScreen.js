import React, { useContext, useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  Image,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  FlatList,
  StyleSheet,
  Alert,
  Dimensions,
  Pressable
} from 'react-native';
import Modal from "react-native-modal";
import { AuthContext } from '../../context/AuthContext';
import { getProducts } from '../../store/productSlice'
import Icon from 'react-native-vector-icons/Entypo';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import moment from 'moment';
import CustomButton from '../../components/CustomButton'
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { add } from '../../store/cartSlice';
import { dateIcon, timeIcon, ArrowGratter, documentImg, infoImg, requestImg, userPhoto, deleteImg, editImg, blockIcon, GreenTick, Payment, dotIcon, yellowStarImg, qouteImg } from '../../utils/Images';
import Loader from '../../utils/Loader';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import CustomHeader from '../../components/CustomHeader';
import Carousel, { Pagination } from 'react-native-snap-carousel';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from '@env'
import { useFocusEffect } from '@react-navigation/native';
import { Dropdown } from 'react-native-element-dropdown';
import messaging from '@react-native-firebase/messaging';
import LocationServicesDialogBox from "react-native-android-location-services-dialog-box";
import LinearGradient from 'react-native-linear-gradient';
import StarRating from 'react-native-star-rating';

const data = [
  { label: 'Today', value: '1' },
  { label: 'Date Wise', value: '2' },
];
const BannerWidth = Dimensions.get('window').width;
const { height, width } = Dimensions.get('screen')
const sliderWidth = Dimensions.get('window').width;
const itemWidth = Math.round(sliderWidth * 0.7);
const itemHeight = Dimensions.get('window').height;

export default function HomeScreen({ navigation }) {

  const dispatch = useDispatch();
  const { data: products, status } = useSelector(state => state.products)
  const { userInfo } = useContext(AuthContext)
  const [isLoading, setIsLoading] = useState(true)
  const [value, setValue] = useState('1');
  const [isFocus, setIsFocus] = useState(false);
  const [isCalendarModalVisible, setCalendarModalVisible] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [startDay, setStartDay] = useState(null);
  const [endDay, setEndDay] = useState(null);
  const [markedDates, setMarkedDates] = useState({});
  const [notificationStatus, setNotificationStatus] = useState(false)
  const [therapistData, setTherapistData] = React.useState([])
  const [upcomingBooking, setUpcomingBooking] = useState([])
  const [starCount, setStarCount] = useState(4)
  const [activeSlide, setActiveSlide] = React.useState(0);
  const [bannerData, setBannerData] = useState([{
    title: "Aenean leo",
    description: "Ut tincidunt tincidunt erat. Sed cursus Donec quam felis, ultricieum quis, sem.",
    imgUrl: "https://picsum.photos/id/11/200/300",
  },
  {
    title: "In turpis",
    description: "Aenean ut eros et nisl sagittis vestibulum ante. Curabitur at lacus ac velit ornare lobortis. ",
    imgUrl: "https://picsum.photos/id/10/200/300",
  },
  {
    title: "Lorem Ipsum",
    description: "Phasellus ullamcorper ipsum rutrum nunc. etus, bibendum sed, posuere ac, mattis non, nunc.",
    imgUrl: "https://picsum.photos/id/12/200/300",
  },])

  const CarouselCardItem = ({ item, index }) => {
    //console.log(item, 'banner itemmm')
    return (
      <View style={styles.bannaerContainer}>
        <Image
          source={{ uri: item.imgUrl }}
          style={styles.bannerBg}
        />
        <View style={styles.textWrap}>
          {item?.title && <Text style={styles.bannerText}>Looking For Specialist Therapist?</Text>}
          {item?.description && <Text style={styles.bannerSubText} numberOfLines={4}>Schedule an appointment with our top Therapist</Text>}
          <View style={styles.bannerButtonView}>
            <Text style={styles.bannerButtonText}>Call Us Today!</Text>
          </View>
        </View>
      </View>
    )
  }

  const getFCMToken = async () => {
    try {
      // if (Platform.OS == 'android') {
      await messaging().registerDeviceForRemoteMessages();
      // }
      const token = await messaging().getToken();
      AsyncStorage.setItem('fcmToken', token)
      console.log(token, 'fcm token');
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    LocationServicesDialogBox.checkLocationServicesIsEnabled({
      message: "<font color='#000'>To provide location-based services, we require your permission to access your device's location. Would you like to grant permission?</font>",
      ok: "YES",
      //cancel: "NO",

    }).then(function (success) {
      console.log(success);
    }).catch((error) => {
      console.log(error.message);
    });
  }, [])

  useEffect(() => {
    getFCMToken()

    if (Platform.OS == 'android') {
      /* this is app foreground notification */
      const unsubscribe = messaging().onMessage(async remoteMessage => {
        Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage));
        console.log('Received background message:', JSON.stringify(remoteMessage));
        setNotificationStatus(true)
      });
      /* This is for handling background messages */
      messaging().setBackgroundMessageHandler(async remoteMessage => {
        console.log('Received background message:', remoteMessage);
        // Handle background message here
        setNotificationStatus(true)
      });

      return unsubscribe;
    }
  }, [])

  const formatDate = (date) => {
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    return date.toLocaleDateString('en-US', options);
  };
  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };
  const toggleCalendarModal = () => {
    setCalendarModalVisible(!isCalendarModalVisible);
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
                setUpcomingBooking(upcomingBooking)
                setIsLoading(false);
            })
            .catch(e => {
                console.log(`Login error ${e}`)
                console.log(e.response?.data?.message)
            });
    });
}

  const fetchAllTherapist = () => {
    AsyncStorage.getItem('userToken', (err, usertoken) => {
      axios.post(`${API_URL}/patient/therapist-list`, {}, {
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
  const renderTherapistItem = ({ item }) => (
    <View style={styles.therapistCardView}>
      <View style={{ flexDirection: 'row', padding: 20, }}>

        <Image
          source={{ uri: item?.user?.profile_pic }}
          style={styles.cardImg}
        />
        <View style={{ flexDirection: 'column', marginLeft: responsiveWidth(3) }}>
          <Text style={styles.nameText}>
            {item?.user?.name}
          </Text>
          <Text style={styles.nameSubText2}>
            Therapist
          </Text>
          <View style={{ marginBottom: 5, width: responsiveWidth(30), }}>
            <StarRating
              disabled={true}
              maxStars={5}
              rating={item?.display_rating}
              selectedStar={(rating) => setStarCount(rating)}
              fullStarColor={'#FFCB45'}
              starSize={20}
            //starStyle={{ marginHorizontal: responsiveWidth(2) }}
            />
          </View>
          <Text style={styles.nameSubText3}>
            {item?.qualification_list}
          </Text>
          <Text style={styles.nameSubText2}>
            {item?.experience} Years Experience
          </Text>
        </View>
      </View>
      <View style={styles.bookapointView}>
        <Image
          source={dateIcon}
          style={{ height: 20, width: 20, }}
        />
        <Pressable onPress={() => navigation.navigate('TherapistProfile', { therapistId: item?.user_id })}>
          <Text style={styles.bookapointText}>Book Appointment</Text>
        </Pressable>
      </View>
    </View>
  )

  const renderUpcomingBooking = ({ item }) => (
    <View style={styles.upcommingAppointmentView}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>

              <Image
                source={{uri: item?.therapist?.profile_pic}}
                style={styles.cardImg}
              />
              <View style={{ flexDirection: 'column', marginLeft: responsiveWidth(3),width: responsiveWidth(40)}}>
                <Text style={styles.nameText}>{item?.therapist?.name}</Text>
                <Text style={styles.namesubText}> Therapist</Text>
              </View>
              <TouchableOpacity style={styles.joinNowButton} onPress={() => navigation.navigate('ChatScreen')}>
                <Text style={styles.joinButtonText}>Join Now</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.dateTimeView}>
              <View style={styles.dateView1}>
                <Image
                  source={dateIcon}
                  style={styles.datetimeIcon}
                />
                <Text style={styles.dateTimeText}>{moment(item?.date).format('ddd, D MMMM')}</Text>
              </View>
              <View style={styles.dividerLine} />
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

  const dateRangeSearch = () => {
    console.log(startDay)
    console.log(endDay)
    //fetchData()
    toggleModal()
  }

  useEffect(() => {
    fetchAllTherapist();
    fetchUpcomingBooking()
  }, [])

  useFocusEffect(
    React.useCallback(() => {
      fetchAllTherapist()
      fetchUpcomingBooking()
    }, [])
  )

  if (status == 'loading') {
    return (
      <Loader />
    )
  }

  return (
    <SafeAreaView style={styles.Container}>
      <CustomHeader commingFrom={'Home'} onPress={() => navigation.navigate('Notification')} onPressProfile={() => navigation.navigate('Profile')} />
      <ScrollView>
        <View style={{ marginBottom: 10 }}>
          <View style={styles.carouselView}>
            {/* <Carousel
              autoplay
              autoplayTimeout={5000}
              loop
              index={0}
              pageSize={BannerWidth}
              showsPageIndicator={true}
              sliderWidth={sliderWidth}
              itemWidth={sliderWidth}
              // itemHeight={itemHeight}
              activePageIndicatorStyle={{ backgroundColor: '#00B2EB' }}
            >
              {bannerData.map((datab, index) =>
                CarouselCardItem(datab, index)

              )}
            </Carousel> */}
            <Carousel
              data={bannerData}
              renderItem={CarouselCardItem}
              showsPageIndicator={true}
              pageSize={BannerWidth}
              sliderWidth={sliderWidth}
              itemWidth={sliderWidth}
              autoplay={true}
              autoplayTimeout={5000}
              autoplayInterval={5000}
              loop={true}
              index={0}
              //enableSnap={true}
              onSnapToItem={(index) => setActiveSlide(index)}
              activePageIndicatorStyle={{ backgroundColor: 'red' }}
            />
          </View>
          <View style={styles.sectionHeaderView}>
            <Text style={styles.sectionHeaderText}>Upcoming Appointment</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ScheduleScreen')}>
              <Text style={styles.seeallText}>See All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
              data={upcomingBooking}
              renderItem={renderUpcomingBooking}
              keyExtractor={(item) => item.id.toString()}
              maxToRenderPerBatch={10}
              windowSize={5}
              initialNumToRender={10}
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              getItemLayout={(upcomingBooking, index) => (
                { length: 50, offset: 50 * index, index }
              )}
            />
          <View style={styles.sectionHeaderView}>
            <Text style={styles.sectionHeaderText}>Therapist</Text>
            <TouchableOpacity onPress={() => navigation.navigate('TherapistList')}>
              <Text style={styles.seeallText}>See All</Text>
            </TouchableOpacity>
          </View>
          {/* <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ paddingVertical: 10, flexDirection: 'row' }}>
              <View style={styles.therapistCardView}>
                <View style={{ flexDirection: 'row', padding: 20, }}>

                  <Image
                    source={userPhoto}
                    style={styles.cardImg}
                  />
                  <View style={{ flexDirection: 'column', marginLeft: responsiveWidth(3) }}>
                    <Text style={styles.nameText}>
                      Jennifer Kourtney
                    </Text>
                    <Text style={styles.nameSubText2}>
                      Therapist
                    </Text>
                    <View style={{ marginBottom: 5, width: responsiveWidth(30), }}>
                      <StarRating
                        disabled={true}
                        maxStars={5}
                        rating={starCount}
                        selectedStar={(rating) => setStarCount(rating)}
                        fullStarColor={'#FFCB45'}
                        starSize={20}
                      //starStyle={{ marginHorizontal: responsiveWidth(2) }}
                      />
                    </View>
                    <Text style={styles.nameSubText3}>
                      M.PHIL ( Clinical Psycology)
                    </Text>
                    <Text style={styles.nameSubText2}>
                      1 Year Experience
                    </Text>
                  </View>
                </View>
                <View style={styles.bookapointView}>
                  <Image
                    source={dateIcon}
                    style={{ height: 20, width: 20, }}
                  />
                  <Text style={styles.bookapointText}>Book Appointment</Text>
                </View>
              </View>
            </View>
          </ScrollView> */}
          <View style={{ paddingVertical: 10 }}>
            <FlatList
              data={therapistData}
              renderItem={renderTherapistItem}
              keyExtractor={(item) => item.id.toString()}
              maxToRenderPerBatch={10}
              windowSize={5}
              initialNumToRender={10}
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              getItemLayout={(therapistData, index) => (
                { length: 50, offset: 50 * index, index }
              )}
            />
          </View>

          <View style={{ marginTop: responsiveHeight(3) }}>
            <Image
              source={require('../../assets/images/freeconsultation.png')}
              style={styles.freebannerImg}
            />
          </View>
          <View style={styles.sectionHeaderView}>
            <Text style={styles.sectionHeaderText}>Previous Therapists</Text>
            <Text style={styles.seeallText}>See All</Text>
          </View>
          <View style={styles.previousTherapistView}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Image
                source={userPhoto}
                style={styles.cardImg}
              />
              <View style={{ flexDirection: 'column', marginLeft: responsiveWidth(3) }}>
                <Text style={styles.nameText}> Diptamoy Saha</Text>
                <Text style={styles.namesubText}>Patient</Text>
                <View style={styles.ratingView}>
                  <Text style={styles.namesubText}>MBBS</Text>
                  <StarRating
                    disabled={true}
                    maxStars={5}
                    rating={starCount}
                    selectedStar={(rating) => setStarCount(rating)}
                    fullStarColor={'#FFCB45'}
                    starSize={15}
                    starStyle={{ marginHorizontal: responsiveWidth(1) }}
                  />
                </View>
              </View>

            </View>
            <View
              style={styles.horizontalLine}
            />
            <Text style={styles.bookingDateText}>Booking Date</Text>
            <View style={styles.dateTimeSection2}>
              <View style={styles.dateTimeHalfSection}>
                <Image
                  source={dateIcon}
                  style={styles.datetimeIcon}
                />
                <Text style={styles.dateTimeText}>Monday, 26 April</Text>
              </View>
              <View
                style={styles.verticalLine}
              />
              <View style={styles.dateTimeHalfSection}>
                <Image
                  source={timeIcon}
                  style={styles.datetimeIcon}
                />
                <Text style={styles.dateTimeText}>09:00 PM</Text>
              </View>
            </View>
            <View style={{ marginTop: responsiveHeight(1) }}>
              <CustomButton buttonColor={'small'} label={"Book Again"} onPress={() => { }} />
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: responsiveHeight(2), }}>
            <Text style={styles.sectionHeaderText}>Customer Speaks</Text>
            <Image
              source={yellowStarImg}
              style={{ height: 20, width: 20 }}
            />
          </View>
          <View style={styles.customerSpeaksView}>
            <View style={styles.qouteImgView}>
              <Image
                source={qouteImg}
                style={{ height: 20, width: 20, }}
              />
            </View>
            <View style={{ marginTop: responsiveHeight(2), marginBottom: responsiveHeight(2), }}>
              <Text style={styles.quoteText}>
                Reliable and trustworthy. They have earned my trust and loyalty. This company has consistently demonstrated reliability and trustworthiness.
              </Text>
            </View>
            <View style={styles.quotepersonView}>
              <Image
                source={userPhoto}
                style={{ height: 40, width: 40, borderRadius: 40 / 2 }}
              />
              <Text style={styles.quotepersonName}>Darcel Ballentine</Text>
              <View
                style={styles.verticalLine}
              />
              <StarRating
                disabled={true}
                maxStars={5}
                rating={starCount}
                selectedStar={(rating) => setStarCount(rating)}
                fullStarColor={'#FFCB45'}
                starSize={15}
                starStyle={{ marginHorizontal: responsiveWidth(0.5) }}
              />
            </View>
          </View>
        </View>
      </ScrollView>
      <Modal
        isVisible={isModalVisible}
        // onBackdropPress={() => setIsFocus(false)} // modal off by clicking outside of the modal
        style={{
          margin: 0, // Add this line to remove the default margin
          justifyContent: 'flex-end',
        }}>
        <View style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', height: 50, width: 50, borderRadius: 25, position: 'absolute', bottom: '78%', left: '45%', right: '45%' }}>
          <Icon name="cross" size={30} color="#B0B0B0" onPress={toggleModal} />
        </View>
        {/* <TouchableWithoutFeedback onPress={() => setIsFocus(false)} style={{  }}> */}
        <View style={{ height: '75%', backgroundColor: '#fff', position: 'absolute', bottom: 0, width: '100%' }}>
          <View style={{ padding: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: '#2D2D2D', fontFamily: 'DMSans-Bold', fontSize: responsiveFontSize(2) }}>Patient Details</Text>
              <TouchableOpacity onPress={(e) => {
                e.stopPropagation();
                setIsFocus(!isFocus)
              }}>
                {!isFocus ?
                  <Image
                    source={dotIcon}
                    style={{ height: 25, width: 25, resizeMode: 'contain', }}
                  /> :
                  <Icon name="cross" size={25} color="#B0B0B0" onPress={() => setIsFocus(!isFocus)} />
                }
              </TouchableOpacity>
              {isFocus ?
                <View style={{ width: responsiveWidth(40), backgroundColor: '#fff', height: responsiveHeight(15), position: 'absolute', right: 0, top: 30, zIndex: 10, padding: 10, borderRadius: 15, justifyContent: 'center', elevation: 5 }}>
                  <View style={{ flexDirection: 'column', justifyContent: 'center' }}>
                    <Text style={{ color: '#746868', fontFamily: 'DMSans-Regular', fontSize: responsiveFontSize(2), marginVertical: responsiveHeight(1) }}>Cancel</Text>
                    <Text style={{ color: '#746868', fontFamily: 'DMSans-Regular', fontSize: responsiveFontSize(2), marginVertical: responsiveHeight(1) }}>Report & Block</Text>
                  </View>
                </View>
                : <></>}

            </View>
            <View style={{ width: responsiveWidth(90), borderRadius: 15, borderColor: '#E3E3E3', borderWidth: 1, marginTop: responsiveHeight(2) }}>
              <View style={{ padding: 15 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 10 }}>

                  <Text style={{ color: '#969696', fontFamily: 'DMSans-Medium', fontSize: responsiveFontSize(1.7) }}>03-04-2024</Text>
                  <Text style={{ color: '#969696', fontFamily: 'DMSans-Medium', fontSize: responsiveFontSize(1.7) }}>08:00 PM - 08:30 PM</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flexDirection: 'column' }}>
                    <Text style={{ color: '#2D2D2D', fontFamily: 'DMSans-Bold', fontSize: responsiveFontSize(2), marginVertical: 10 }}>Shubham Halder</Text>
                    <View style={{ paddingHorizontal: 15, paddingVertical: 5, backgroundColor: '#FF9E45', borderRadius: 15, width: responsiveWidth(20), justifyContent: 'center', alignItems: 'center' }}>
                      <Text style={{ color: '#FFF', fontFamily: 'DMSans-Semibold', fontSize: responsiveFontSize(1.5) }}>New</Text>
                    </View>
                  </View>
                  <View style={styles.inActiveButtonInsideView}>
                    <Text style={styles.activeButtonInsideText}>Join Now</Text>
                  </View>
                </View>

              </View>
            </View>
            <ScrollView horizontal={true}>
              <View style={{ width: responsiveWidth(89), borderRadius: 15, borderColor: '#E3E3E3', borderWidth: 1, marginTop: responsiveHeight(2), marginRight: 5 }}>
                <View style={{ padding: 15 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ color: '#2D2D2D', fontSize: responsiveFontSize(2), fontFamily: 'DMSans-Bold' }}>Rohit Sharma</Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                      <Image
                        source={GreenTick}
                        style={{ height: 20, width: 20, resizeMode: 'contain' }}
                      />
                      <Text style={{ color: '#444343', fontSize: responsiveFontSize(1.7), fontFamily: 'DMSans-SemiBold', marginLeft: responsiveWidth(1) }}>Completed</Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: responsiveHeight(1.5) }}>
                    <Text style={{ color: '#444343', fontFamily: 'DMSans-Medium', fontSize: responsiveFontSize(1.7), marginRight: responsiveWidth(2) }}>Order ID :</Text>
                    <Text style={{ color: '#746868', fontFamily: 'DMSans-Medium', fontSize: responsiveFontSize(1.7) }}>1923659</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: responsiveHeight(1.5) }}>
                    <Text style={{ color: '#444343', fontFamily: 'DMSans-Medium', fontSize: responsiveFontSize(1.7), marginRight: responsiveWidth(2) }}>Date :</Text>
                    <Text style={{ color: '#746868', fontFamily: 'DMSans-Medium', fontSize: responsiveFontSize(1.7) }}>24-02-2024, 09:30 PM</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: responsiveHeight(1.5) }}>
                    <Text style={{ color: '#444343', fontFamily: 'DMSans-Medium', fontSize: responsiveFontSize(1.7), marginRight: responsiveWidth(2) }}>Appointment Time :</Text>
                    <Text style={{ color: '#746868', fontFamily: 'DMSans-Medium', fontSize: responsiveFontSize(1.7) }}>60 Min</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: responsiveHeight(1.5) }}>
                    <Text style={{ color: '#444343', fontFamily: 'DMSans-Medium', fontSize: responsiveFontSize(1.7), marginRight: responsiveWidth(2) }}>Rate :</Text>
                    <Text style={{ color: '#746868', fontFamily: 'DMSans-Medium', fontSize: responsiveFontSize(1.7) }}>Rs 1100 for 30 Min</Text>
                  </View>
                  <View style={{ marginTop: responsiveHeight(1.5) }}>
                    <Text style={{ color: '#444343', fontFamily: 'DMSans-Medium', fontSize: responsiveFontSize(1.7), marginRight: responsiveWidth(2) }}>Session Summary :</Text>
                    <Text style={{ color: '#746868', fontFamily: 'DMSans-Medium', fontSize: responsiveFontSize(1.7), marginTop: 5 }}>The consultation session focused on exploring and addressing the patient's mental health concerns. The patient expressed their struggles with anxiety and depressive symptoms, impacting various aspects of their daily life. The therapist employed a person-centered approach, providing a safe and non-judgmental space for the patient to share their experiences.</Text>
                  </View>
                </View>
              </View>
              <View style={{ width: responsiveWidth(89), borderRadius: 15, borderColor: '#E3E3E3', borderWidth: 1, marginTop: responsiveHeight(2), marginRight: 5 }}>
                <View style={{ padding: 15 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ color: '#2D2D2D', fontSize: responsiveFontSize(2), fontFamily: 'DMSans-Bold' }}>Rohit Sharma</Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                      <Image
                        source={GreenTick}
                        style={{ height: 20, width: 20, resizeMode: 'contain' }}
                      />
                      <Text style={{ color: '#444343', fontSize: responsiveFontSize(1.7), fontFamily: 'DMSans-SemiBold', marginLeft: responsiveWidth(1) }}>Completed</Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: responsiveHeight(1.5) }}>
                    <Text style={{ color: '#444343', fontFamily: 'DMSans-Medium', fontSize: responsiveFontSize(1.7), marginRight: responsiveWidth(2) }}>Order ID :</Text>
                    <Text style={{ color: '#746868', fontFamily: 'DMSans-Medium', fontSize: responsiveFontSize(1.7) }}>1923659</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: responsiveHeight(1.5) }}>
                    <Text style={{ color: '#444343', fontFamily: 'DMSans-Medium', fontSize: responsiveFontSize(1.7), marginRight: responsiveWidth(2) }}>Date :</Text>
                    <Text style={{ color: '#746868', fontFamily: 'DMSans-Medium', fontSize: responsiveFontSize(1.7) }}>24-02-2024, 09:30 PM</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: responsiveHeight(1.5) }}>
                    <Text style={{ color: '#444343', fontFamily: 'DMSans-Medium', fontSize: responsiveFontSize(1.7), marginRight: responsiveWidth(2) }}>Appointment Time :</Text>
                    <Text style={{ color: '#746868', fontFamily: 'DMSans-Medium', fontSize: responsiveFontSize(1.7) }}>60 Min</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: responsiveHeight(1.5) }}>
                    <Text style={{ color: '#444343', fontFamily: 'DMSans-Medium', fontSize: responsiveFontSize(1.7), marginRight: responsiveWidth(2) }}>Rate :</Text>
                    <Text style={{ color: '#746868', fontFamily: 'DMSans-Medium', fontSize: responsiveFontSize(1.7) }}>Rs 1100 for 30 Min</Text>
                  </View>
                  <View style={{ marginTop: responsiveHeight(1.5) }}>
                    <Text style={{ color: '#444343', fontFamily: 'DMSans-Medium', fontSize: responsiveFontSize(1.7), marginRight: responsiveWidth(2) }}>Session Summary :</Text>
                    <Text style={{ color: '#746868', fontFamily: 'DMSans-Medium', fontSize: responsiveFontSize(1.7), marginTop: 5 }}>The consultation session focused on exploring and addressing the patient's mental health concerns. The patient expressed their struggles with anxiety and depressive symptoms, impacting various aspects of their daily life. The therapist employed a person-centered approach, providing a safe and non-judgmental space for the patient to share their experiences.</Text>
                  </View>
                </View>
              </View>
            </ScrollView>

          </View>
        </View>
        {/* </TouchableWithoutFeedback> */}
      </Modal>
      <Modal
        isVisible={isCalendarModalVisible}
        style={{
          margin: 0, // Add this line to remove the default margin
          justifyContent: 'flex-end',
        }}>
        <View style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', height: 50, width: 50, borderRadius: 25, position: 'absolute', bottom: '75%', left: '45%', right: '45%' }}>
          <Icon name="cross" size={30} color="#B0B0B0" onPress={toggleCalendarModal} />
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
  );
}

const styles = StyleSheet.create({
  Container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: responsiveHeight(1),
  },
  outerCircle: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    width: '100%',
    height: responsiveHeight(20),

  },
  innerView: {
    height: responsiveHeight(25),
    width: '90%',
    backgroundColor: '#daede6',
    marginHorizontal: 20,
    position: 'absolute',
    top: '20%',
    borderRadius: 20
  },
  activeButtonInsideView: {
    backgroundColor: '#FFF',
    height: responsiveHeight(5),
    width: responsiveWidth(35),
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
    backgroundColor: '#ECFCFA',
    height: responsiveHeight(5),
    width: responsiveWidth(35),
    borderRadius: 15,
    borderColor: '#87ADA8',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    alignItems: 'center'
  },
  placeholderStyle: {
    fontSize: 16,
    color: '#746868',
    fontFamily: 'DMSans-Regular'
  },
  selectedTextStyle: {
    fontSize: 16,
    color: '#746868',
    fontFamily: 'DMSans-Regular'
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
    color: '#746868',
    fontFamily: 'DMSans-Regular'
  },
  bannerBg: {
    flex: 1,
    position: 'absolute',
    right: 0,
    // bottom: 20,
    height: '100%',
    width: '100%',
    resizeMode: 'cover',
    borderRadius: 10
  },
  textWrap: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  bannerText: {
    fontSize: responsiveFontSize(2),
    color: '#000',
    fontFamily: 'DMSans-Bold',
    position: 'relative',
    zIndex: 1,
    width: width * 0.5,
    marginBottom: responsiveHeight(1),
    paddingLeft: 20,
  },
  bannerSubText: {
    fontSize: 14,
    color: '#746868',
    fontFamily: 'DMSans-Regular',
    position: 'relative',
    zIndex: 1,
    width: width * 0.7,
    marginBottom: 15,
    paddingLeft: 20,
  },
  bannerButtonView: {
    height: responsiveHeight(4),
    width: responsiveWidth(25),
    backgroundColor: '#FFFFFF',
    marginLeft: 20,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  bannerButtonText: {
    color: '#E88036',
    fontFamily: 'DMSans-Bold',
    fontSize: responsiveFontSize(1.5)
  },
  bannaerContainer: {
    width: responsiveWidth(89),
    height: responsiveHeight(20),
    backgroundColor: '#fff',
    borderRadius: 10,
    // shadowColor: "#000",
    // shadowOffset: {
    //   width: 0,
    //   height: 3,
    // },
    // shadowOpacity: 0.29,
    // //shadowRadius: 4.65,
    // elevation: 7,
  },
  carouselView: {
    marginBottom: responsiveHeight(2),
    marginTop: responsiveHeight(2),
    marginHorizontal: 20,
  },
  sectionHeaderView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: responsiveHeight(2),
  },
  sectionHeaderText: {
    marginHorizontal: 20,
    color: '#2D2D2D',
    fontFamily: 'DMSans-Bold',
    fontSize: responsiveFontSize(2)
  },
  seeallText: {
    marginHorizontal: 20,
    color: '#746868',
    fontFamily: 'DMSans-Regular',
    fontSize: responsiveFontSize(1.7)
  },
  upcommingAppointmentView: {
    height: responsiveHeight(20),
    width: responsiveWidth(90),
    backgroundColor: '#FFF',
    marginHorizontal: 15,
    padding: 20,
    borderRadius: 20,
    marginTop: responsiveHeight(2),
    marginBottom: responsiveHeight(1),
    elevation: 5
  },
  nameText: {
    color: '#2D2D2D',
    fontSize: responsiveFontSize(2),
    fontFamily: 'DMSans-Bold',
    marginBottom: 5,
  },
  namesubText: {
    color: '#746868',
    fontFamily: 'DMSans-Regular',
    marginRight: 5,
    fontSize: responsiveFontSize(1.5)
  },
  joinNowButton: {
    marginLeft: responsiveWidth(2),
    backgroundColor: '#ECFCFA',
    borderColor: '#87ADA8',
    borderWidth: 1,
    padding: 10,
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'center'
  },
  joinButtonText: {
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
  dividerLine: {
    height: '80%',
    width: 1,
    backgroundColor: '#E3E3E3',
    marginLeft: 5,
    marginRight: 5
  },
  therapistCardView: {
    width: responsiveWidth(70),
    backgroundColor: '#FFF',
    marginHorizontal: 15,
    borderRadius: 20,
    marginTop: responsiveHeight(2),
    marginBottom: responsiveHeight(1),
    elevation: 5
  },
  cardImg: {
    height: 50,
    width: 50,
    borderRadius: 25
  },
  nameSubText2: {
    color: '#746868',
    fontFamily: 'DMSans-Regular',
    marginRight: 5,
    fontSize: responsiveFontSize(1.5),
    marginBottom: 5,
  },
  nameSubText3: {
    color: '#444343',
    fontFamily: 'DMSans-Medium',
    marginRight: 5,
    fontSize: responsiveFontSize(1.5),
    marginBottom: 5,
  },
  bookapointView: {
    flexDirection: 'row',
    height: responsiveHeight(6),
    backgroundColor: '#FFF',
    borderTopColor: '#E3E3E3',
    borderTopWidth: 1,
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookapointText: {
    color: '#444343',
    fontFamily: 'DMSans-Bold',
    fontSize: responsiveFontSize(2),
    textAlign: 'center',
    marginLeft: responsiveWidth(2)
  },
  freebannerImg: {
    height: responsiveHeight(20),
    width: '92%',
    alignSelf: 'center',
    borderRadius: 10,
    resizeMode: 'cover'
  },
  previousTherapistView: {
    height: responsiveHeight(30),
    width: '92%',
    backgroundColor: '#FFF',
    marginHorizontal: 15,
    padding: 20,
    borderRadius: 20,
    marginTop: responsiveHeight(2),
    elevation: 5
  },
  ratingView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: responsiveWidth(65)
  },
  horizontalLine: {
    borderBottomColor: '#E3E3E3',
    borderBottomWidth: 1,
    marginHorizontal: 10,
    marginTop: responsiveHeight(2)

  },
  bookingDateText: {
    color: '#746868',
    fontFamily: 'DMSans-Regular',
    fontSize: responsiveFontSize(1.5),
    marginTop: responsiveHeight(2)
  },
  verticalLine: {
    height: '100%',
    width: 1,
    backgroundColor: '#E3E3E3',
    marginLeft: 5,
    marginRight: 5
  },
  dateTimeSection2: {
    height: responsiveHeight(5),
    width: responsiveWidth(80),
    marginTop: responsiveHeight(1),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  dateTimeHalfSection: {
    flexDirection: 'row',
    alignItems: 'center',
    width: responsiveWidth(35)
  },
  customerSpeaksView: {
    padding: 20,
    width: responsiveWidth(80),
    backgroundColor: '#FFF',
    marginHorizontal: 15,
    borderRadius: 20,
    marginTop: responsiveHeight(3),
    elevation: 5
  },
  qouteImgView: {
    position: 'absolute',
    top: -15,
    left: 10,
    height: 40,
    width: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    elevation: 5
  },
  quoteText: {
    color: '#746868',
    fontFamily: 'DMSans-Regular',
    fontSize: responsiveFontSize(1.7),
  },
  quotepersonView: {
    width: responsiveWidth(70),
    borderColor: '#E3E3E3',
    borderWidth: 1,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5
  },
  quotepersonName: {
    color: '#444343',
    fontFamily: 'DMSans-Medium',
    fontSize: responsiveFontSize(1.7),
    marginLeft: 5
  }

});