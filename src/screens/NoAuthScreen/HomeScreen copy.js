import React, { useContext, useMemo, useState, useEffect, memo, useCallback } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  Image,
  RefreshControl,
  TouchableOpacity,
  TouchableWithoutFeedback,
  FlatList,
  StyleSheet,
  Alert,
  Dimensions,
  Pressable,
  BackHandler,
  Platform
} from 'react-native';
import Modal from "react-native-modal";
import { AuthContext } from '../../context/AuthContext';
import { getProducts } from '../../store/productSlice'
import FastImage from 'react-native-fast-image';
import moment from 'moment-timezone';
import CustomButton from '../../components/CustomButton'
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { add } from '../../store/cartSlice';
import { dateIcon, timeIcon, yellowStarImg, qouteImg, bannerPlaceHolder, freebannerPlaceHolder } from '../../utils/Images';
import Loader from '../../utils/Loader';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import CustomHeader from '../../components/CustomHeader';
import Carousel, { Pagination } from 'react-native-snap-carousel';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from '@env'
import { useFocusEffect } from '@react-navigation/native';
import { Dropdown } from 'react-native-element-dropdown';
import messaging from '@react-native-firebase/messaging';
import LinearGradient from 'react-native-linear-gradient';
import StarRating from 'react-native-star-rating';

const data = [
  { label: 'Today', value: '1' },
  { label: 'Date Wise', value: '2' },
];
const BannerWidth = Dimensions.get('window').width;
const BannerHeight = 170;
const { height, width } = Dimensions.get('screen')
const sliderWidth = Dimensions.get('window').width;
const paddingHorizontal = 10;
const itemWidth = sliderWidth - (2 * paddingHorizontal);


export default function HomeScreen({ navigation }) {

  const dispatch = useDispatch();
  const { data: products, status } = useSelector(state => state.products)
  const { logout } = useContext(AuthContext);
  // const { userInfo } = useContext(AuthContext)
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true)
  const [notificationStatus, setNotificationStatus] = useState(false)
  const [therapistData, setTherapistData] = React.useState([])
  const [upcomingBooking, setUpcomingBooking] = useState([])
  const [previousBooking, setPreviousBooking] = useState([])
  const [starCount, setStarCount] = useState(4)
  const [activeSlide, setActiveSlide] = React.useState(0);
  const [bannerData, setBannerData] = useState([])
  const [customerSpeaksData, setCustomerSpeaksData] = useState([])
  const [userInfo, setuserInfo] = useState([])
  const [currentDateTime, setCurrentDateTime] = useState(moment.tz(new Date(), 'Asia/Kolkata'));
  const [freeBannerImg, setFreeBannerImg] = useState('')

  const getFCMToken = async () => {
    try {
      // if (Platform.OS == 'android') {
      await messaging().registerDeviceForRemoteMessages();
      // }
      const token = await messaging().getToken();
      AsyncStorage.setItem('fcmToken', token)
      //console.log(token, 'fcm token');
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    getFCMToken()
    if (Platform.OS == 'android' || Platform.OS === 'ios') {
      /* this is app foreground notification */
      const unsubscribe = messaging().onMessage(async remoteMessage => {
        // Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage));
        //console.log('Received background message:', JSON.stringify(remoteMessage));
        if (remoteMessage?.notification?.title === 'Appointment Cancelled') {
          fetchUpcomingBooking()
        }
      });

      return unsubscribe;
    }
  }, [])

  useEffect(() => {
    const backAction = () => {
      if (Platform.OS === 'android') {
        BackHandler.exitApp(); // Minimize the app (simulating background run)
        return true; // Prevent default back action
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove(); // Cleanup the event listener on component unmount
  }, []);

  const fetchProfileDetails = () => {
    AsyncStorage.getItem('userToken', (err, usertoken) => {
      axios.post(`${API_URL}/patient/profile`, {}, {
        headers: {
          "Authorization": `Bearer ${usertoken}`,
          "Content-Type": 'application/json'
        },
      })
        .then(res => {
          let userInfo = res.data.data;
          //console.log(userInfo, 'user data from contact informmation')
          setuserInfo(userInfo)
        })
        .catch(e => {
          console.log(`Profile error from home page ${e}`)
        });
    });
  }
  const fetchBanner = () => {
    axios.get(`${API_URL}/patient/banners`, {
      headers: {
        "Content-Type": 'application/json'
      },
    })
      .then(res => {
        //console.log(res.data, 'all banner details')
        let banner = res.data.data;
        //console.log(banner, 'banner data')
        setBannerData(banner)
        setFreeBannerImg(res.data.free_banner)
        banner.forEach(item => {
          Image.prefetch(item.banner_image);
        });
        //setIsLoading(false);
      })
      .catch(e => {
        console.log(`fetch banner error ${e}`)
        console.log(e.response?.data?.message)
        setIsLoading(false);
      });
  }
  const fetchCustomerSpeaks = () => {
    AsyncStorage.getItem('userToken', (err, usertoken) => {
      axios.get(`${API_URL}/patient/customer-speaks`, {
        headers: {
          "Authorization": `Bearer ${usertoken}`,
          "Content-Type": 'application/json'
        },
      })
        .then(res => {
          let customerSpeak = res.data.data;
          //console.log(customerSpeak, 'customer speaks data')
          const limitedData = customerSpeak.slice(0, 5);
          setCustomerSpeaksData(limitedData)
          //setIsLoading(false);
        })
        .catch(e => {
          console.log(`fetch customer speak error ${e}`)
          console.log(e.response?.data?.message)
          setIsLoading(false);
        });
    });
  }
  const fetchPreviousBooking = async () => {
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
      //console.log(previousBooking, 'previous Booking data');

      // Sort by date and start_time
      previousBooking.sort((a, b) => {
        const dateA = new Date(a.date + ' ' + a.start_time);
        const dateB = new Date(b.date + ' ' + b.start_time);
        return dateB - dateA;  // sort in descending order
      });

      // Get the last 5 entries
      previousBooking = previousBooking.slice(0, 5);

      setPreviousBooking(previousBooking);
    } catch (error) {
      console.log(`fetch previous booking error ${error}`);
      if (error.response && error.response.data && error.response.data.message) {
        console.log(error.response.data.message);
      }
    } finally {
      setIsLoading(false);
    }
  };
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
          //console.log(upcomingBooking, 'upcomingBooking')
          const filteredBookings = upcomingBooking.filter(booking =>
            booking.status === "scheduled" || booking.status === "start"
          );
          filteredBookings.sort((a, b) => {
            let dateA = new Date(a.date);
            let dateB = new Date(b.date);
            if (dateA < dateB) return -1;
            if (dateA > dateB) return 1;

            // If dates are the same, compare start_time
            let timeA = a.start_time.split(':').map(Number);
            let timeB = b.start_time.split(':').map(Number);
            let dateTimeA = new Date(dateA.setHours(timeA[0], timeA[1]));
            let dateTimeB = new Date(dateB.setHours(timeB[0], timeB[1]));

            return dateTimeA - dateTimeB;
          });
          setUpcomingBooking(filteredBookings)
          //setIsLoading(false);
        })
        .catch(e => {
          console.log(`fetch upcoming booking error ${e}`)
          console.log(e.response?.data?.message)
        });
    });
  }
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
          //console.log(JSON.stringify(res.data.data), 'fetch all therapist')
          if (res.data.response == true) {
            const therapistData = res.data.data.slice(0, 5);
            setTherapistData(therapistData);
            //setIsLoading(false);

          } else {
            //console.log('not okk')
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
            { text: 'OK', onPress: () => e.response?.data?.message == 'Unauthorized' ? logout() : console.log('OK Pressed') },
          ]);
        });
    });
  }

  const CarouselCardItem = ({ item, index }) => {
    //console.log(item, 'banner itemmm')
    {/* <View style={styles.textWrap}>
          {item?.banner_title && <Text style={styles.bannerText}>{item?.banner_title}</Text>}
          {item?.banner_description && <Text style={styles.bannerSubText} numberOfLines={4}>{item?.banner_description}</Text>}
          <View style={styles.bannerButtonView}>
            <Text style={styles.bannerButtonText}>Call Us Today!</Text>
          </View>
        </View> */}
    const handleBannerPress = () => {
      // Check the banner_link and navigate to the appropriate screen
      switch (item.banner_link) {
        case 'therapist_list':
          navigation.navigate('Talk', { screen: 'TherapistList', key: Math.random().toString() })
          break;
        case 'appointment':
          navigation.navigate('ScheduleScreen');
          break;
        case 'customer_support':
          navigation.navigate('Customer Support');
          break;
        case 'transaction':
          navigation.navigate('Transaction');
          break;
        case 'session_history':
          navigation.navigate('Session History');
          break;
        case 'profile':
          navigation.navigate('ProfileScreen');
          break;
        default:
          // You can add a fallback or do nothing if the link doesn't match any cases
          navigation.navigate('Customer Support');
          console.log('Unknown banner link:', item.banner_link);
      }
    };
    return (
      <Pressable onPress={handleBannerPress}>
        <View style={styles.bannerContainer}>
          <FastImage
            source={{ uri: item.banner_image }}
            //source={bannerPlaceHolder}
            //source={freebannerPlaceHolder}
            //style={{ width: BannerWidth, height: BannerHeight }}
            style={styles.bannerImage}
            resizeMode={FastImage.resizeMode.contain}
          />
        </View>
      </Pressable>
    )
  }
  const TherapistListItem = memo(({ item }) => (
    <Pressable onPress={() => navigation.navigate('Talk', { screen: 'TherapistProfile', params: { therapistId: item?.user_id, mode: 'paid' }, key: Math.random().toString() })}>
      <View style={styles.therapistCardView}>
        <View style={{ flexDirection: 'row', padding: 15, }}>

          <Image
            source={{ uri: item?.user?.profile_pic }}
            style={styles.cardImgForTherapist}
          />
          <View style={{ flexDirection: 'column', marginLeft: responsiveWidth(3) }}>
            <Text style={styles.nameText}>
              {item?.user?.name}
            </Text>
            <Text style={styles.nameSubText2}>
              Therapist
            </Text>
            <View style={{ marginBottom: 5, width: responsiveWidth(25) }}>
              <StarRating
                disabled={true}
                maxStars={5}
                rating={item?.display_rating}
                selectedStar={(rating) => setStarCount(rating)}
                fullStarColor={'#FFCB45'}
                starSize={15}
              //starStyle={{ marginHorizontal: responsiveWidth(2) }}
              />
            </View>
            <Text style={styles.nameSubText3}>
              {item?.qualification_list.replace(/,/g, ', ')}
            </Text>
            <Text style={styles.nameSubText2}>
              {item?.experience} Years Experience
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Talk', { screen: 'TherapistProfile', params: { therapistId: item?.user_id, mode: 'paid' }, key: Math.random().toString() })}>
          <View style={styles.bookapointView}>
            <Image
              source={dateIcon}
              style={{ height: 20, width: 20, }}
            />
            <Text style={styles.bookapointText}>Book Appointment</Text>
          </View>
        </TouchableOpacity>
      </View>
    </Pressable>
  ))

  const renderTherapistItem = ({ item }) => <TherapistListItem item={item} />;
  // Memoized UpcomingBookingItem component
  const UpcomingBookingItem = memo(({ item }) => {
    // const bookingDateTime = new Date(`${item.date}T${item.start_time}`);
    // const endDateTime = new Date(`${item.date}T${item.end_time}`);
    // const twoMinutesBefore = new Date(bookingDateTime.getTime() - 2 * 60000); // Two minutes before booking start time
    // const isButtonEnabled = currentDateTime >= twoMinutesBefore && currentDateTime <= endDateTime;

    const bookingDateTimeIST = moment.tz(`${item.date}T${item.start_time}`, 'Asia/Kolkata');
    const endDateTimeIST = moment.tz(`${item.date}T${item.end_time}`, 'Asia/Kolkata');
    const currentDateTimeIST = currentDateTime;

    const twoMinutesBefore = bookingDateTimeIST.clone().subtract(0, 'minutes');
    const isButtonEnabled = currentDateTimeIST.isBetween(twoMinutesBefore, endDateTimeIST);
    return (
      <View style={styles.upcommingAppointmentView}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Image
            source={{ uri: item?.therapist?.profile_pic }}
            style={styles.cardImg}
          />
          <View style={{ flexDirection: 'column', marginLeft: responsiveWidth(3), width: responsiveWidth(45) }}>
            <Text style={styles.nameText}>{item?.therapist?.name}</Text>
            <Text style={styles.namesubText}> Therapist</Text>
          </View>
          <TouchableOpacity style={[styles.joinNowButton, { opacity: isButtonEnabled ? 1 : 0.5 }]}
            onPress={() => isButtonEnabled && navigation.navigate('ChatScreen', { details: item })}
            disabled={!isButtonEnabled}
          >
            {/* <TouchableOpacity style={styles.joinNowButton} onPress={() => navigation.navigate('ChatScreen', { details: item })}> */}
            <Text style={styles.joinButtonText}>Join Now</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.dateTimeView}>
          <View style={styles.dateView1}>
            <Image
              source={dateIcon}
              style={styles.datetimeIcon}
            />
            <Text style={styles.dateTimeText}>{moment(item?.date).format('ddd, D MMM YY')}</Text>
          </View>
          {/* <View style={styles.dividerLine} /> */}
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
  })
  // renderUpcomigBooking function
  const renderUpcomingBooking = ({ item }) => <UpcomingBookingItem item={item} />;

  // Memoized PreviousBookingItem component
  const PreviousBookingItem = memo(({ item }) => (
    <View style={styles.previousTherapistView}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Image
          source={{ uri: item?.therapist?.profile_pic }}
          style={styles.cardImg}
        />
        <View style={{ flexDirection: 'column', marginLeft: responsiveWidth(3) }}>
          <Text style={styles.nameText}>{item?.therapist?.name}</Text>
          {/* <Text style={styles.namesubText}>Patient</Text> */}
          <View style={styles.ratingView}>
            <Text style={styles.namesubText} >{item?.qualification_list}</Text>
            <StarRating
              disabled={true}
              maxStars={5}
              rating={item?.therapist_details?.display_rating}
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
        <View style={[styles.dateTimeHalfSection, { width: responsiveWidth(25) }]}>
          <Image
            source={dateIcon}
            style={styles.datetimeIcon}
          />
          <Text style={styles.dateTimeText}>{moment(item?.date).format('ddd, D MMM YY')}</Text>
        </View>
        {/* <View
          style={styles.verticalLine}
        /> */}
        <View style={[styles.dateTimeHalfSection, { width: responsiveWidth(45) }]}>
          <Image
            source={timeIcon}
            style={styles.datetimeIcon}
          />
          <Text style={styles.dateTimeText}>{moment(item?.start_time, 'HH:mm:ss').format('h:mm A')} - {moment(item?.end_time, 'HH:mm:ss').format('h:mm A')}</Text>
        </View>
      </View>
      <View style={{ marginTop: responsiveHeight(1), marginBottom: -responsiveHeight(1) }}>
        <CustomButton buttonColor={'small'} label={"Book Again"} onPress={() => { navigation.navigate('Talk', { screen: 'TherapistProfile', params: { therapistId: item?.therapist_id, mode: 'paid' }, key: Math.random().toString() }) }} />
      </View>
    </View>
  ))
  // renderPreviousBooking function
  const renderPreviousBooking = ({ item }) => <PreviousBookingItem item={item} />;


  const calculateCardHeight = (quote) => {
    const baseHeight = responsiveHeight(20); // Minimum height for short quotes
    const additionalHeight = quote.length > 50 ? responsiveHeight(2.2) * Math.ceil((quote.length - 50) / 50) : 0;
    return baseHeight + additionalHeight;
  };
  // Memoized CustomerSpeakItem component
  const CustomerSpeakItem = memo(({ item }) => {
    const cardHeight = useMemo(() => calculateCardHeight(item?.quote), [item?.quote]);
    return (
      <View style={[styles.customerSpeaksView, { height: cardHeight }]}>
        <View style={styles.qouteImgView}>
          <Image
            source={qouteImg}
            style={{ height: 20, width: 20 }}
          />
        </View>
        <View style={{ marginTop: responsiveHeight(2), marginBottom: responsiveHeight(2) }}>
          <Text style={styles.quoteText}>
            {item?.quote}
          </Text>
        </View>
        <View style={styles.quotepersonView}>
          <Image
            source={{ uri: item?.user_photo }}
            style={{ height: 40, width: 40, borderRadius: 40 / 2 }}
          />
          <Text style={styles.quotepersonName}>{item?.user_name}</Text>
          <View style={styles.verticalLine} />
          <View style={{ width: responsiveWidth(12) }}>
            <StarRating
              disabled={true}
              maxStars={5}
              rating={item?.star}
              fullStarColor={'#FFCB45'}
              starSize={15}
              starStyle={{ marginHorizontal: responsiveWidth(0.3) }}
            />
          </View>
        </View>
      </View>
    )

  });
  // renderCustomerSpeaks function
  const renderCustomerSpeaks = ({ item }) => <CustomerSpeakItem item={item} />;

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await Promise.all([fetchProfileDetails(), fetchBanner(), fetchCustomerSpeaks(), fetchPreviousBooking(), fetchUpcomingBooking(), fetchAllTherapist()]);
      setIsLoading(false);
    };

    fetchData();
    const timer = setInterval(() => {
      setCurrentDateTime(moment.tz(new Date(), 'Asia/Kolkata'));
    }, 60000); // Update every minute
    return () => clearInterval(timer);
  }, [])

  useFocusEffect(
    React.useCallback(() => {
      const fetchData = async () => {
        await Promise.all([fetchProfileDetails(), fetchPreviousBooking(), fetchUpcomingBooking()]);
      };

      fetchData();
      const timer = setInterval(() => {
        setCurrentDateTime(moment.tz(new Date(), 'Asia/Kolkata'));
      }, 60000); // Update every minute
      return () => clearInterval(timer);
    }, [])
  )

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchBanner();
    fetchAllTherapist();
    fetchProfileDetails();
    fetchPreviousBooking();
    fetchUpcomingBooking();

    setRefreshing(false);
  }, []);

  if (isLoading) {
    return (
      <Loader />
    )
  }

  return (
    <SafeAreaView style={styles.Container}>
      <CustomHeader commingFrom={'Home'} onPressProfile={() => navigation.navigate('Profile')} />
      <ScrollView refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#417AA4" colors={['#417AA4']} />
      }>
        <View style={{ marginBottom: 10 }}>
          <View style={styles.carouselView}>
            <Carousel
              data={bannerData}
              renderItem={CarouselCardItem}
              showsPageIndicator={true}
              pageSize={BannerWidth}
              sliderWidth={sliderWidth}
              itemWidth={itemWidth}
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
          {upcomingBooking.length !== 0 ?
            <>
              <View style={styles.sectionHeaderView}>
                <Text style={styles.sectionHeaderText}>Upcoming Appointment</Text>
                <TouchableOpacity onPress={() => navigation.navigate('ScheduleScreen', { activeTab: 'Upcoming' })}>
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
            </>
            : null}
          <View style={styles.sectionHeaderView}>
            <Text style={styles.sectionHeaderText}>Therapists</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Talk', { screen: 'TherapistList', key: Math.random().toString() })}>
              <Text style={styles.seeallText}>See All</Text>
            </TouchableOpacity>
          </View>
          <View style={{ paddingVertical: 10, paddingLeft: responsiveWidth(1) }}>
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
          {(userInfo?.patient_details?.free_session === 'no' && parseInt(userInfo?.offer_for_free) > 0) ? (
            <TouchableOpacity onPress={() => navigation.navigate('FreeTherapistList')}>
              {/* <View style={styles.freebannerContainer}> */}
                {freeBannerImg ?
                  <Image
                    source={{ uri: freeBannerImg }}
                    style={styles.freebannerImg}
                  /> :
                  <Image
                    source={freebannerPlaceHolder}
                    style={styles.freebannerImg}
                  />
                }
              {/* </View> */}
            </TouchableOpacity>
          ) : null}
          {previousBooking.length !== 0 ?
            <View style={styles.sectionHeaderView}>
              <Text style={styles.sectionHeaderText}>Previous Therapists</Text>
              <TouchableOpacity onPress={() => navigation.navigate('ScheduleScreen', { activeTab: 'Previous' })}>
                <Text style={styles.seeallText}>See All</Text>
              </TouchableOpacity>
            </View> : <></>}
          <View style={{ paddingVertical: 10 }}>
            <FlatList
              data={previousBooking}
              renderItem={renderPreviousBooking}
              //keyExtractor={(item) => item.id.toString()}
              maxToRenderPerBatch={10}
              windowSize={5}
              initialNumToRender={10}
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              getItemLayout={(previousBooking, index) => (
                { length: 50, offset: 50 * index, index }
              )}
            />
          </View>
          {customerSpeaksData.length !== 0 ?
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: responsiveHeight(1), }}>
              <Text style={styles.sectionHeaderText}>Customer Speaks</Text>
              <Image
                source={yellowStarImg}
                style={{ height: 20, width: 20 }}
              />
            </View>
            : <></>}
          <View style={{ paddingVertical: 10 }}>
            <FlatList
              data={customerSpeaksData}
              renderItem={renderCustomerSpeaks}
              //keyExtractor={(item) => item.id.toString()}
              maxToRenderPerBatch={10}
              windowSize={5}
              initialNumToRender={10}
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              getItemLayout={(customerSpeaksData, index) => (
                { length: 50, offset: 50 * index, index }
              )}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  Container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: responsiveHeight(1),
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
  carouselView: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    marginTop: responsiveHeight(1),
    ...Platform.select({
      android: {
        marginLeft: -responsiveWidth(1),
      },
      ios: {
        marginLeft: -responsiveWidth(3),
      },
    }),
    marginBottom: responsiveHeight(0)
  },
  bannerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      android: {
        width: responsiveWidth(96),
        height: BannerHeight,
      },
      ios: {
        width: responsiveWidth(100),
        height: BannerHeight - responsiveHeight(1),
      },
    }),
    //backgroundColor: 'red',
    overflow: 'hidden',
    borderRadius: 10
  },
  bannerImage: {
    ...Platform.select({
      android: {
        width: '100%',
        height: '100%',
      },
      ios: {
        width: '105%',
        height: '107%',
      },
    }),

    //resizeMode: 'contain',
    borderRadius: 10
  },
  sectionHeaderView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: responsiveHeight(1),
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
    height: responsiveHeight(18),
    width: responsiveWidth(92),
    backgroundColor: '#FFF',
    marginHorizontal: 15,
    padding: 15,
    borderRadius: 10,
    marginTop: responsiveHeight(2),
    marginBottom: responsiveHeight(1),
    ...Platform.select({
      android: {
        elevation: 5, // Only for Android
      },
      ios: {
        shadowColor: '#000', // Only for iOS
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
      },
    }),
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
    fontSize: responsiveFontSize(1.5),
    width: responsiveWidth(28)
  },
  joinNowButton: {
    marginLeft: responsiveWidth(2),
    backgroundColor: '#EEF8FF',
    borderColor: '#417AA4',
    borderWidth: 1,
    padding: 8,
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
    width: responsiveWidth(84),
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
    width: responsiveWidth(30),
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
    width: responsiveWidth(76),
    backgroundColor: '#FFF',
    marginHorizontal: 10,
    borderRadius: 10,
    marginTop: responsiveHeight(1),
    marginBottom: responsiveHeight(1),
    ...Platform.select({
      android: {
        elevation: 5, // Only for Android
      },
      ios: {
        shadowColor: '#000', // Only for iOS
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
      },
    }),
  },
  cardImg: {
    height: 50,
    width: 50,
    borderRadius: 25
  },
  cardImgForTherapist: {
    ...Platform.select({
      android: {
        height: 90,
      },
      ios: {
        height: 82,
      },
    }),
    width: 70,
    borderRadius: 15,
    resizeMode: 'contain',
    //borderRadius: 70 / 2
  },
  nameSubText2: {
    color: '#746868',
    fontFamily: 'DMSans-Regular',
    marginRight: 5,
    fontSize: responsiveFontSize(1.5),
    marginBottom: responsiveHeight(0.5),
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
    fontFamily: 'DMSans-SemiBold',
    fontSize: responsiveFontSize(1.7),
    textAlign: 'center',
    marginLeft: responsiveWidth(2)
  },
  freebannerContainer: {
    // marginTop: responsiveHeight(1),
    // marginBottom: responsiveHeight(1),
    // flex: 1,
    // justifyContent: 'center',
    // alignItems: 'center',
    // backgroundColor: 'red',
    height: responsiveHeight(20),
    backgroundColor:'red'
  },
  freebannerImg: {
    ...Platform.select({
      android: {
        height: 155, // Adjust height based on desired aspect ratio
        width: responsiveWidth(97),
        borderRadius: 10,
         elevation: 5
      },
      ios: {
        height: 178, // Adjust height based on desired aspect ratio
        width: responsiveWidth(98),
        borderRadius: 10,
        shadowColor: 'rgba(47, 47, 47, 0.39)',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
      },
    }),
    resizeMode: 'contain',
    marginTop: responsiveHeight(0),
    marginBottom: responsiveHeight(0),
    flex: 1,
    alignSelf:'center'
  },
  previousTherapistView: {
    //height: responsiveHeight(30),
    width: responsiveWidth(92),
    backgroundColor: '#FFF',
    marginHorizontal: 15,
    padding: 15,
    borderRadius: 10,
    marginTop: responsiveHeight(1),
    marginBottom: responsiveHeight(1),
    ...Platform.select({
      android: {
        elevation: 5, // Only for Android
      },
      ios: {
        shadowColor: '#000', // Only for iOS
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
      },
    }),
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
    width: responsiveWidth(90),
    marginTop: responsiveHeight(1),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  dateTimeHalfSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customerSpeaksView: {
    padding: 20,
    width: responsiveWidth(80),
    backgroundColor: '#FFF',
    marginHorizontal: 15,
    borderRadius: 10,
    marginTop: responsiveHeight(2),
    marginBottom: responsiveHeight(1),
    ...Platform.select({
      android: {
        elevation: 5, // Only for Android
      },
      ios: {
        shadowColor: '#000', // Only for iOS
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
      },
    }),
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
    ...Platform.select({
      android: {
        elevation: 5, // Only for Android
      },
      ios: {
        shadowColor: '#000', // Only for iOS
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
      },
    }),
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
    alignSelf: 'center',
    padding: 5,
    position: 'absolute',
    bottom: 10
  },
  quotepersonName: {
    color: '#444343',
    fontFamily: 'DMSans-Medium',
    fontSize: responsiveFontSize(1.7),
    marginLeft: 5
  },
  upcomingView: {
    height: responsiveHeight(20),
    width: '92%',
    backgroundColor: '#FFF',
    marginHorizontal: 15,
    padding: 20,
    borderRadius: 20,
    marginTop: responsiveHeight(2),
    ...Platform.select({
      android: {
        elevation: 5, // Only for Android
      },
      ios: {
        shadowColor: '#000', // Only for iOS
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
      },
    }),
  },
  nodataText: {
    alignSelf: 'center',
    fontFamily: 'DMSans-Bold',
    fontSize: responsiveFontSize(2),
    color: '#746868'
  },

});