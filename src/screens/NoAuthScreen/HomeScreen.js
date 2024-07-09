import React, { useContext, useState, useEffect, memo } from 'react';
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
  // const { userInfo } = useContext(AuthContext)
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
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

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
          console.log(userInfo, 'user data from contact informmation')
          setuserInfo(userInfo)
        })
        .catch(e => {
          console.log(`Profile error ${e}`)
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
        //console.log(res.data,'user details')
        let banner = res.data.data;
        console.log(banner, 'banner data')
        setBannerData(banner)
        setIsLoading(false);
      })
      .catch(e => {
        console.log(`Login error ${e}`)
        console.log(e.response?.data?.message)
        setIsLoading(false);
      });
  }
  const fetchCustomerSpeaks = () => {
    AsyncStorage.getItem('userToken', (err, usertoken) => {
      axios.post(`${API_URL}/patient/good-reviews`, {}, {
        headers: {
          "Authorization": `Bearer ${usertoken}`,
          "Content-Type": 'application/json'
        },
      })
        .then(res => {
          //console.log(res.data,'user details')
          let customerSpeak = res.data.data;
          console.log(customerSpeak, 'customer speaks data')
          setCustomerSpeaksData(customerSpeak)
          setIsLoading(false);
        })
        .catch(e => {
          console.log(`Login error ${e}`)
          console.log(e.response?.data?.message)
          setIsLoading(false);
        });
    });
  }
  const fetchPreviousBooking = async () => {
    setIsLoading(true);
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
      console.log(previousBooking, 'previous Booking data');

      // Sort by date and start_time
      previousBooking.sort((a, b) => {
        const dateA = new Date(a.date + ' ' + a.start_time);
        const dateB = new Date(b.date + ' ' + b.start_time);
        return dateB - dateA;  // sort in descending order
      });

      // Get the last 5 entries
      previousBooking = previousBooking.slice(0, 10);

      setPreviousBooking(previousBooking);
    } catch (error) {
      console.log(`Login error ${error}`);
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
          console.log(upcomingBooking, 'upcomingBooking')
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

  const CarouselCardItem = ({ item, index }) => {
    //console.log(item, 'banner itemmm')
    return (
      <View style={styles.bannaerContainer}>
        <Image
          source={{ uri: item.banner_image }}
          style={styles.bannerBg}
        />
        {/* <View style={styles.textWrap}>
          {item?.banner_title && <Text style={styles.bannerText}>{item?.banner_title}</Text>}
          {item?.banner_description && <Text style={styles.bannerSubText} numberOfLines={4}>{item?.banner_description}</Text>}
          <View style={styles.bannerButtonView}>
            <Text style={styles.bannerButtonText}>Call Us Today!</Text>
          </View>
        </View> */}
      </View>
    )
  }
  const TherapistListItem = memo(({ item }) => (
    <View style={styles.therapistCardView}>
      <View style={{ flexDirection: 'row', padding: 15, }}>

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
        <TouchableOpacity onPress={() => navigation.navigate('TherapistProfile', { therapistId: item?.user_id, mode: 'paid' })}>
          <Text style={styles.bookapointText}>Book Appointment</Text>
        </TouchableOpacity>
      </View>
    </View>
  ))

  const renderTherapistItem = ({ item }) => <TherapistListItem item={item} />;
  // Memoized UpcomingBookingItem component
  const UpcomingBookingItem = memo(({ item }) => {
    // const bookingDateTime = new Date(`${item.date}T${item.start_time}`);
    // const twoMinutesBefore = new Date(bookingDateTime.getTime() - 2 * 60000); // Two minutes before booking start time
    // const isButtonEnabled = currentDateTime >= twoMinutesBefore;
    const bookingDateTime = new Date(`${item.date}T${item.start_time}`);
    const endDateTime = new Date(`${item.date}T${item.end_time}`);
    const twoMinutesBefore = new Date(bookingDateTime.getTime() - 2 * 60000); // Two minutes before booking start time
    const isButtonEnabled = currentDateTime >= twoMinutesBefore && currentDateTime <= endDateTime;
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
          {/* <TouchableOpacity style={[styles.joinNowButton, { opacity: isButtonEnabled ? 1 : 0.5 }]}
            onPress={() => isButtonEnabled && navigation.navigate('ChatScreen', { details: item })}
            disabled={!isButtonEnabled}
          > */}
            <TouchableOpacity style={styles.joinNowButton} onPress={() => navigation.navigate('ChatScreen', { details: item })}>
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
            <Text style={styles.namesubText}>{item?.qualification_list}</Text>
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
          <Text style={styles.dateTimeText}>{moment(item?.date).format('ddd, D MMMM')}</Text>
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
      <View style={{ marginTop: responsiveHeight(1) }}>
        <CustomButton buttonColor={'small'} label={"Book Again"} onPress={() => { navigation.navigate('TherapistProfile', { therapistId: item?.therapist_id }) }} />
      </View>
    </View>
  ))
  // renderPreviousBooking function
  const renderPreviousBooking = ({ item }) => <PreviousBookingItem item={item} />;

  // Memoized CustomerSpeakItem component
  const CustomerSpeakItem = memo(({ item }) => (
    <View style={styles.customerSpeaksView}>
      <View style={styles.qouteImgView}>
        <Image
          source={qouteImg}
          style={{ height: 20, width: 20 }}
        />
      </View>
      <View style={{ marginTop: responsiveHeight(2), marginBottom: responsiveHeight(2) }}>
        <Text style={styles.quoteText}>
          {item?.review}
        </Text>
      </View>
      <View style={styles.quotepersonView}>
        <Image
          source={{ uri: item?.patient?.profile_pic }}
          style={{ height: 40, width: 40, borderRadius: 40 / 2 }}
        />
        <Text style={styles.quotepersonName}>{item?.patient?.name}</Text>
        <View style={styles.verticalLine} />
        <StarRating
          disabled={true}
          maxStars={5}
          rating={item?.star}
          fullStarColor={'#FFCB45'}
          starSize={15}
          starStyle={{ marginHorizontal: responsiveWidth(0.5) }}
        />
      </View>
    </View>
  ));
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
      setCurrentDateTime(new Date());
    }, 60000); // Update every minute
    return () => clearInterval(timer);
  }, [])

  useFocusEffect(
    React.useCallback(() => {
      const fetchData = async () => {
        await Promise.all([fetchProfileDetails(), fetchBanner(), fetchCustomerSpeaks(), fetchPreviousBooking(), fetchUpcomingBooking(), fetchAllTherapist()]);
      };

      fetchData();
      const timer = setInterval(() => {
        setCurrentDateTime(new Date());
      }, 60000); // Update every minute
      return () => clearInterval(timer);
    }, [])
  )

  if (isLoading) {
    return (
      <Loader />
    )
  }

  return (
    <SafeAreaView style={styles.Container}>
      <CustomHeader commingFrom={'Home'} onPressProfile={() => navigation.navigate('Profile')} />
      <ScrollView>
        <View style={{ marginBottom: 10 }}>
          <View style={styles.carouselView}>
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
            <TouchableOpacity onPress={() => navigation.navigate('ScheduleScreen', { activeTab: 'Upcoming' })}>
              <Text style={styles.seeallText}>See All</Text>
            </TouchableOpacity>
          </View>
          {upcomingBooking.length !== 0 ?
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
            :
            <View style={styles.upcomingView}>
              <Text style={styles.nodataText}>No upcoming appointment yet</Text>
            </View>}
          <View style={styles.sectionHeaderView}>
            <Text style={styles.sectionHeaderText}>Therapist</Text>
            <TouchableOpacity onPress={() => navigation.navigate('TherapistList')}>
              <Text style={styles.seeallText}>See All</Text>
            </TouchableOpacity>
          </View>
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
          {userInfo?.patient_details?.free_session === 'no' ?
            <TouchableOpacity onPress={() => navigation.navigate('FreeTherapistList')}>
              <View style={styles.freebannerContainer}>
                <Image
                  source={require('../../assets/images/freeconsultation.png')}
                  style={styles.freebannerImg}
                />
              </View>
            </TouchableOpacity>
            : <></>
          }
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
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: responsiveHeight(2), }}>
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
    height: responsiveHeight(18),
    width: responsiveWidth(91),
    backgroundColor: '#FFF',
    marginHorizontal: 15,
    padding: 15,
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
    fontFamily: 'DMSans-SemiBold',
    fontSize: responsiveFontSize(1.7),
    textAlign: 'center',
    marginLeft: responsiveWidth(2)
  },
  freebannerContainer: {
    marginTop: responsiveHeight(3),
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  freebannerImg: {
    height: responsiveHeight(20), // Adjust height based on desired aspect ratio
    width: responsiveWidth(92),   // 92% of the screen width
    borderRadius: 10,
    resizeMode: 'cover',
  },
  previousTherapistView: {
    height: responsiveHeight(30),
    width: responsiveWidth(92),
    backgroundColor: '#FFF',
    marginHorizontal: 15,
    padding: 15,
    borderRadius: 20,
    marginTop: responsiveHeight(2),
    marginBottom: responsiveHeight(1),
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
    borderRadius: 20,
    marginTop: responsiveHeight(3),
    marginBottom: responsiveHeight(1),
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
  },
  upcomingView: {
    height: responsiveHeight(20),
    width: '92%',
    backgroundColor: '#FFF',
    marginHorizontal: 15,
    padding: 20,
    borderRadius: 20,
    marginTop: responsiveHeight(2),
    elevation: 5
  },
  nodataText: {
    alignSelf: 'center',
    fontFamily: 'DMSans-Bold',
    fontSize: responsiveFontSize(2),
    color: '#746868'
  },

});