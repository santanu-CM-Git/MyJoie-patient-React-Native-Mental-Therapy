import React, { useState, useCallback, useEffect, useRef } from 'react'
import { View, Text, SafeAreaView, StyleSheet, ScrollView, ImageBackground, Image, PermissionsAndroid, Alert, BackHandler, Platform } from 'react-native'
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { GreenTick, audiooffIcon, audioonIcon, callIcon, chatImg, filesendImg, sendImg, speakeroffIcon, speakeronIcon, summaryIcon, userPhoto, videoIcon, audioBgImg, defaultUserImg } from '../../utils/Images'
import { GiftedChat, InputToolbar, Bubble, Send, Composer } from 'react-native-gifted-chat'
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import InChatFileTransfer from '../../components/InChatFileTransfer';
import { API_URL, AGORA_APP_ID } from '@env'
import { TabActions, useRoute } from '@react-navigation/native';
import KeepAwake from 'react-native-keep-awake';
import firestore, { endBefore } from '@react-native-firebase/firestore'
import Ionicons from 'react-native-vector-icons/Ionicons';
import ScreenRecorder from 'react-native-screen-mic-recorder'
import AgoraUIKit, { StreamFallbackOptions, PropsInterface, VideoRenderMode, RenderModeType } from 'agora-rn-uikit';
console.log(RenderModeType.RenderModeFit, 'kkkkkkkkkkk')

import {
  ClientRoleType,
  createAgoraRtcEngine,
  IRtcEngine,
  ChannelProfileType,
} from 'react-native-agora';
import moment from 'moment-timezone'
import Loader from '../../utils/Loader'
import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from 'axios'
import BackgroundTimer from 'react-native-background-timer';



const ChatScreen = ({ navigation, route }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedURL, setRecordedURL] = useState(null);

  const routepage = useRoute();
  const [videoCall, setVideoCall] = useState(true);
  const connectionData = {
    appId: AGORA_APP_ID,
    //channel: route?.params?.details?.agora_channel_id,
    //token: route?.params?.details?.agora_token,
    channel: 'myjoie',
    token: '007eJxTYPh2p08w6VWvZvDl/3IyU4w/9Po8djOcdZnnunNOZ3Cb9zMFBjPTNCOTtMSU5FRDIxPzNEuLZIs082Rz80QjY6PUZIvUjV92pTUEMjLsFCxlYIRCEJ+NIbcyKz8zlYEBAP2XIgM='
  };
  // Define basic information
  const appId = AGORA_APP_ID;
  // const token = route?.params?.details?.agora_token2;
  // const channelName = route?.params?.details?.agora_channel_id2;
  const token = '007eJxTYPh2p08w6VWvZvDl/3IyU4w/9Po8djOcdZnnunNOZ3Cb9zMFBjPTNCOTtMSU5FRDIxPzNEuLZIs082Rz80QjY6PUZIvUjV92pTUEMjLsFCxlYIRCEJ+NIbcyKz8zlYEBAP2XIgM=';
  const channelName = 'myjoie';
  const uid = 0; // Local user UID, no need to modify

  const rtcCallbacks = {
    EndCall: () => {
      setVideoCall(false);
      setActiveTab('chat')
    }
    // Other callbacks like RemoteUserJoined, RemoteUserLeft, etc.
  };

  const [messages, setMessages] = useState([])
  const [therapistId, setTherapistId] = useState(route?.params?.details?.therapist?.id)
  const [therapistProfilePic, setTherapistProfilePic] = useState(route?.params?.details?.therapist?.profile_pic)
  const [patientId, setPatientId] = useState(route?.params?.details?.patient?.id)
  const [patientProfilePic, setPatientProfilePic] = useState(route?.params?.details?.patient?.profile_pic)
  const [chatgenidres, setChatgenidres] = useState(route?.params?.details?.booking_uuid);
  const [isAttachImage, setIsAttachImage] = useState(false);
  const [isAttachFile, setIsAttachFile] = useState(false);
  const [imagePath, setImagePath] = useState('');
  const [filePath, setFilePath] = useState('');
  const [fileVisible, setFileVisible] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('chat')
  const [isLoading, setIsLoading] = useState(true)
  const [timer, setTimer] = useState(0);
  const [endTime, setEndTime] = useState(null);
  const intervalRef = useRef(null);

  const requestExternalStoragePermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: 'External Storage Permission',
          message: 'This app needs access to your storage to read/write files.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  const startRecording = async () => {
    try {
      const recordingStatus = await ScreenRecorder.startRecording().catch((error) => {
        console.warn(error); // handle native error
      });
      if (recordingStatus === 'started') {
        setIsRecording(true);
        console.log('Recording has started...');
      } else if (recordingStatus === 'userDeniedPermission') {
        Alert.alert('Please grant permission in order to record screen');
      }
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = async () => {
    console.log('Stopping recording...');
    try {
      if (Platform.OS === 'android') {
        const hasPermission = await requestExternalStoragePermission();
        if (!hasPermission) {
          throw new Error('Storage permission denied');
        }
      }
      const uri = await ScreenRecorder.stopRecording().catch((error) => {
        console.warn(error); // handle native error
      });
      if (uri) {
        setRecordedURL(uri);
        console.log('Recording stopped. URI:', uri);
        const formData = new FormData();
        formData.append('file', {
          uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
          name: 'recording.mp4',
          type: 'video/mp4',
        });

        // Upload the file to the server using axios
        const response = await axios.post('http://162.215.253.89/swastilife/api/file-upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        const result = response.data;
        console.log('File uploaded successfully:', result);
      }
      setIsRecording(false);
    } catch (error) {
      console.error('Error stopping recording:', error);
      if (error.response) {
        console.error('Server response:', error.response.data);
      } else if (error.request) {
        console.error('No response received:', error.request);
      } else {
        console.error('Error setting up request:', error.message);
      }
    }
  };

  useEffect(() => {
    console.log(routepage.name);
    if (routepage.name === 'ChatScreen') {
      const backAction = () => {
        // Prevent the default back button action
        return true;
      };

      // Add event listener to handle the back button
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        backAction
      );

      // Clean up the event listener when the component unmounts
      return () => backHandler.remove();
    }
  }, [routepage]);


  useEffect(() => {
    if (endTime) {
      intervalRef.current = BackgroundTimer.setInterval(() => {
        const currentTime = new Date();
        const endDate = moment(endTime, 'HH:mm:ss').toDate();
        const timeDifferenceInSeconds = Math.max(0, Math.floor((endDate - currentTime) / 1000));
        if (timeDifferenceInSeconds <= 0) {
          BackgroundTimer.clearInterval(intervalRef.current);
          handleTimerEnd();
        }
        setTimer(timeDifferenceInSeconds);
      }, 1000);

      return () => BackgroundTimer.clearInterval(intervalRef.current);
    }
  }, [endTime]);

  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    // //receivedMsg()
    KeepAwake.activate();
    //startRecording();
    console.log(route?.params?.details, 'details from home page')

    sessionStart()
  }, [])

  const sessionStart = async () => {
    setIsLoading(true);
    const currentTime = moment().format('HH:mm:ss');
    const option = {
      "booked_slot_id": route?.params?.details?.id,
      "time": currentTime,
    };
    console.log(option);

    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        throw new Error('User token is missing');
      }

      const res = await axios.post(`${API_URL}/patient/slot-start`, option, {
        headers: {
          Accept: 'application/json',
          "Authorization": 'Bearer ' + userToken,
        },
      });

      if (res.data.response === true) {
        const endTime = route?.params?.details?.end_time;
        setEndTime(endTime); // Set the end time

        const mode = route?.params?.details?.mode_of_conversation;
        if (mode === 'chat') {
          setActiveTab('chat');
          setVideoCall(false);
          await leave();
        } else if (mode === 'audio') {
          await join();
          setActiveTab('audio');
          setVideoCall(false);
        } else if (mode === 'video') {
          setActiveTab('video');
          setVideoCall(true);
          await leave();
        }
        setIsLoading(false);
      } else {
        console.log('not okk');
        Alert.alert('Oops..', "Something went wrong", [
          { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
          { text: 'OK', onPress: () => console.log('OK Pressed') },
        ]);
        setIsLoading(false);
      }
    } catch (e) {
      setIsLoading(false);
      console.log(`Session Start error ${e}`);
      //console.log(e.response?.data?.response.records);
      Alert.alert('Oops..', e.response?.data?.message || 'An unexpected error occurred', [
        { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
        { text: 'OK', onPress: () => console.log('OK Pressed') },
      ]);
    }
  };

  const confirmEnd = () => {
    Alert.alert(
      'Confirm End',
      'Are you sure you want to end this session?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: () => handleTimerEnd(),
        },
      ],
      { cancelable: false }
    );
  };

  const handleTimerEnd = async () => {
    console.log('Timer has ended. Execute your function here.');
    const currentTime = moment().format('HH:mm:ss');
    const option = {
      "booked_slot_id": route?.params?.details?.id,
      "time": currentTime
    };
    console.log(option);

    try {
      // Retrieve user token
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        throw new Error('User token is missing');
      }

      // Make API request
      const res = await axios.post(`${API_URL}/patient/slot-complete`, option, {
        headers: {
          Accept: 'application/json',
          "Authorization": 'Bearer ' + userToken,
        },
      });

      console.log(res.data);

      if (res.data.response === true) {
        // Uncomment and use if needed
        // stopRecording();

        setVideoCall(false);
        await leave(); // Ensure leave completes before navigating
        navigation.navigate('ReviewScreen', {
          bookedId: route?.params?.details?.id,
          therapistName: route?.params?.details?.therapist?.name,
          therapistPic: route?.params?.details?.therapist?.profile_pic
        });
      } else {
        console.log('Response not OK');
        setIsLoading(false);
        Alert.alert('Oops..', "Something went wrong", [
          {
            text: 'Cancel',
            onPress: () => console.log('Cancel Pressed'),
            style: 'cancel',
          },
          { text: 'OK', onPress: () => console.log('OK Pressed') },
        ]);
      }
    } catch (e) {
      setIsLoading(false);
      console.error('Error during handleTimerEnd:', e);

      // Handle specific API errors if available
      const errorMessage = e.response?.data?.message || 'An unexpected error occurred';
      Alert.alert('Oops..', errorMessage, [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        { text: 'OK', onPress: () => console.log('OK Pressed') },
      ]);
    }
  };

  const renderChatFooter = useCallback(() => {
    if (imagePath) {
      return (
        <View style={styles.chatFooter}>
          <Image source={{ uri: imagePath }} style={{ height: 75, width: 75 }} />
          <TouchableOpacity
            onPress={() => setImagePath('')}
            style={styles.buttonFooterChatImg}
          >
            <Text style={styles.textFooterChat}>X</Text>
          </TouchableOpacity>
        </View>
      );
    }
    if (filePath) {
      return (
        <View style={styles.chatFooter}>
          <InChatFileTransfer
            filePath={filePath}
          />
          <TouchableOpacity
            onPress={() => setFilePath('')}
            style={styles.buttonFooterChat}
          >
            <Text style={styles.textFooterChat}>X</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return null;
  }, [filePath, imagePath]);

  const customtInputToolbar = props => {
    return (
      <InputToolbar
        {...props}
        containerStyle={{
          marginLeft: 15,
          marginRight: 15,
          backgroundColor: "#E8E8E8",
          alignContent: "center",
          justifyContent: "center",
          borderWidth: 0,
          paddingTop: 6,
          borderRadius: 30,
          borderTopColor: "transparent",

        }}
      />
    );
  };

  const customRenderComposer = props => {
    return (
      <Composer
        {...props}
        textInputStyle={{
          color: '#000', // Change this to your desired text color
        }}
      />
    );
  };

  const renderSend = (props) => {
    return (

      <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
        <Send {...props}>
          <Image
            source={sendImg}
            style={styles.imageView2}
          />
        </Send>
      </View>

    );
  };

  const renderBubble = (props) => {
    const { currentMessage } = props;
    if (currentMessage.file && currentMessage.file.url) {
      return (
        <TouchableOpacity
          style={{
            ...styles.fileContainer,
            backgroundColor: props.currentMessage.user._id === 2 ? '#ECFCFA' : '#EAECF0',
            borderBottomLeftRadius: props.currentMessage.user._id === 2 ? 15 : 5,
            borderBottomRightRadius: props.currentMessage.user._id === 2 ? 5 : 15,
          }}
          onPress={() => setFileVisible(true)}
        >

          <View style={{ flexDirection: 'column' }}>
            <Text style={{
              ...styles.fileText,
              color: currentMessage.user._id === 2 ? '#2D2D2D' : '#2D2D2D',
            }} >
              {currentMessage.text}
            </Text>
          </View>
        </TouchableOpacity>
      );
    }
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: '#EEF8FF',
          },
        }}
        textStyle={{
          right: {
            color: '#2D2D2D',
            fontFamily: 'DMSans-Regular'
          },
          left: {
            color: '#2D2D2D',
            fontFamily: 'DMSans-Regular'
          },
        }}
        timeTextStyle={{
          left: {
            color: '#8A91A8', // Change the color of timestamp text for left bubbles
          },
          right: {
            color: '#8A91A8', // Change the color of timestamp text for right bubbles
          }
        }}
      />
    );
  };

  const scrollToBottomComponent = () => {
    return <FontAwesome name="angle-double-down" size={28} color="#000" />;
  };

  useEffect(() => {
    const docid = chatgenidres;
    const messageRef = firestore().collection('chatrooms')
      .doc(docid)
      .collection('messages')
      .orderBy('createdAt', "desc")

    const unSubscribe = messageRef.onSnapshot((querySnap) => {
      const allmsg = querySnap.docs.map(docSanp => {
        const data = docSanp.data()
        if (data.createdAt) {
          return {
            ...docSanp.data(),
            createdAt: docSanp.data().createdAt.toDate()
          }
        } else {
          return {
            ...docSanp.data(),
            createdAt: new Date()
          }
        }

      })
      setMessages(allmsg)
    })


    return () => {
      unSubscribe()
    }
  }, [])

  const onSend = (messageArray) => {
    console.log(messageArray)
    const msg = messageArray[0]
    const mymsg = {
      ...msg,
      sentBy: patientId,
      sentTo: therapistId,
      createdAt: new Date()
    }
    setMessages(previousMessages => GiftedChat.append(previousMessages, mymsg))
    const docid = chatgenidres;
    firestore().collection('chatrooms')
      .doc(docid)
      .collection('messages')
      .add({ ...mymsg, createdAt: firestore.FieldValue.serverTimestamp() })


  }


  // audio call 
  const agoraEngineRef = useRef(<IRtcEngine></IRtcEngine>); // IRtcEngine instance
  const [isJoined, setIsJoined] = useState(false); // Whether the local user has joined the channel
  const [remoteUid, setRemoteUid] = useState(0); // Remote user UID
  const [message, setMessage] = useState(''); // User prompt message
  const [micOn, setMicOn] = useState(true); // Microphone state
  const [speakerOn, setSpeakerOn] = useState(false); // Loudspeaker state

  function showMessage(msg) {
    setMessage(msg);
  }

  const getPermission = async () => {
    if (Platform.OS === 'android') {
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      ]);
    }
  };

  useEffect(() => {
    setupVideoSDKEngine();
  });

  const setupVideoSDKEngine = async () => {
    try {
      // Create RtcEngine after checking and obtaining device permissions
      if (Platform.OS === 'android') {
        await getPermission();
      }
      agoraEngineRef.current = createAgoraRtcEngine();
      const agoraEngine = agoraEngineRef.current;

      // Register event callbacks
      agoraEngine.registerEventHandler({
        onJoinChannelSuccess: () => {
          showMessage('Successfully joined the channel: ' + channelName);
          setIsJoined(true);
        },
        onUserJoined: (_connection, Uid) => {
          showMessage('Remote user ' + Uid + ' has joined');
          setRemoteUid(Uid);
        },
        onUserOffline: (_connection, Uid) => {
          showMessage('Remote user ' + Uid + ' has left the channel');
          setRemoteUid(0);
        },
      });
      // Initialize the engine
      agoraEngine.initialize({
        appId: appId,
      });
    } catch (e) {
      console.log(e);
    }
  };

  const toggleMic = () => {
    try {
      const agoraEngine = agoraEngineRef.current;
      if (micOn) {
        agoraEngine?.muteLocalAudioStream(true);
        showMessage('Microphone muted');
      } else {
        agoraEngine?.muteLocalAudioStream(false);
        showMessage('Microphone unmuted');
      }
      setMicOn(!micOn);
    } catch (e) {
      console.log(e);
    }
  };

  const toggleSpeaker = () => {
    try {
      const agoraEngine = agoraEngineRef.current;
      if (speakerOn) {
        agoraEngine?.setEnableSpeakerphone(false);
        showMessage('Speaker disabled');
      } else {
        agoraEngine?.setEnableSpeakerphone(true);
        showMessage('Speaker enabled');
      }
      setSpeakerOn(!speakerOn);
    } catch (e) {
      console.log(e);
    }
  };
  // Define the join method called after clicking the join channel button
  const join = async () => {
    console.log(isJoined, 'isJoinedisJoinedisJoinedisJoined');

    if (isJoined) {
      return;
    }
    try {
      // Set the channel profile type to communication after joining the channel
      await agoraEngineRef.current?.setChannelProfile(
        ChannelProfileType.ChannelProfileCommunication,
      );
      // Call the joinChannel method to join the channel
      await agoraEngineRef.current?.joinChannel(token, channelName, uid, {
        // Set the user role to broadcaster
        clientRoleType: ClientRoleType.ClientRoleBroadcaster,
      });
    } catch (e) {
      console.log(e, 'join channel error');
    }
  };
  // Define the leave method called after clicking the leave channel button
  const leave = async () => {
    try {
      await agoraEngineRef.current?.leaveChannel();
      setRemoteUid(0);
      setIsJoined(false);
      showMessage('Left the channel');
    } catch (e) {
      console.log(e, 'leave channel error');
    }
  };
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const goingToactiveTab = async (name) => {
    if (name === 'audio') {
      await leave();
      await delay(200); // Add a delay to ensure state is properly updated
      await join();
      setActiveTab('audio');
      setVideoCall(false);
    } else if (name === 'video') {
      await leave();
      await delay(200); // Add a delay to ensure state is properly updated
      setActiveTab('video');
      setVideoCall(true);
    } else if (name === 'chat') {
      await leave();
      await delay(200); // Add a delay to ensure state is properly updated
      setActiveTab('chat');
      setVideoCall(false);
    }
  };

  // const goingToactiveTab = (name) => {
  //   if (name === 'audio') {
  //     leave()
  //       .then(() => delay(200))
  //       .then(() => join())
  //       .then(() => {
  //         setActiveTab('audio');
  //         setVideoCall(false);
  //       })
  //       .catch(error => console.error(error));
  //   } else if (name === 'video') {
  //     leave()
  //       .then(() => delay(200))
  //       .then(() => {
  //         setActiveTab('video');
  //         setVideoCall(true);
  //       })
  //       .catch(error => console.error(error));
  //   } else if (name === 'chat') {
  //     leave()
  //       .then(() => delay(200))
  //       .then(() => {
  //         setActiveTab('chat');
  //         setVideoCall(false);
  //       })
  //       .catch(error => console.error(error));
  //   }
  // };



  const customPropsStyle = {
    localBtnStyles: {
      endCall: {
        height: 40,
        width: 40,
        backgroundColor: '#e43',
        borderWidth: 0,
        marginLeft: 5,
      },
      switchCamera: {
        height: 40,
        width: 40,
        backgroundColor: '#8D9095',
        borderWidth: 0,
      },
      muteLocalAudio: {
        height: 40,
        width: 40,
        backgroundColor: '#8D9095',
        borderWidth: 0,
      },
      muteLocalVideo: {
        height: 40,
        width: 40,
        backgroundColor: '#8D9095',
        borderWidth: 0,
      },
    },
    maxViewStyles: {
      flex: 1,
      alignSelf: 'stretch',
    },
    UIKitContainer: {
      flex: 1,
    },
    localBtnContainer: {
      backgroundColor: 'rgba(52, 52, 52, 0.8)',
      height: responsiveHeight(10),
      borderRadius: 50,
      alignItems: 'center',
      position: 'absolute',
      bottom: 5
    },
    theme: '#ffffffee',
    iconSize: 25,
    VideoRenderMode: RenderModeType.RenderModeFit,
    remoteVideo: {
      width: '100%',
      height: '100%',
      aspectRatio: 9 / 16,
    },
  };


  const agoraConfig = {
    appId: connectionData.appId,
    channelProfile: 1, // Live broadcasting profile
    videoEncoderConfig: {
      width: 720,
      height: 1280, // Portrait dimensions
      bitrate: 1130,
      frameRate: 15,
      orientationMode: 'fixedPortrait',  // Force portrait mode
    },
    // other configurations
  };

  if (isLoading) {
    return (
      <Loader />
    )
  }

  return (
    <SafeAreaView style={styles.Container} behavior="padding" keyboardVerticalOffset={30} enabled>
      {/* <CustomHeader commingFrom={'chat'} onPress={() => navigation.goBack()} title={'Admin Community'} /> */}
      <View style={styles.HeaderSection}>
        <View style={styles.HeaderSectionHalf}>
          <Ionicons name="chevron-back" size={25} color="#000" />
          <View style={{ flexDirection: 'column', marginLeft: 10 }}>
            <Text style={styles.therapistName}>{route?.params?.details?.therapist?.name}</Text>
            <Text style={styles.therapistDesc}>Therapist</Text>
          </View>
        </View>
        <View style={styles.HeaderSectionHalf}>
          <Text style={styles.timerText}>{formatTime(timer)}</Text>
          <TouchableOpacity onPress={() => confirmEnd()}>
            <View style={styles.endButtonView}>
              <Text style={styles.endButtonText}>End</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.TabSection}>
        {activeTab == 'chat' ?
          <>
            <TouchableOpacity onPress={() => goingToactiveTab('audio')}>
              <View style={styles.ButtonView}>
                <Image
                  source={callIcon}
                  style={styles.ButtonImg}
                />
                <Text style={styles.ButtonText}>Switch to Audio Call</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => goingToactiveTab('video')}>
              <View style={styles.ButtonView}>
                <Image
                  source={videoIcon}
                  style={styles.ButtonImg}
                />
                <Text style={styles.ButtonText}>Switch to Video Call</Text>
              </View>
            </TouchableOpacity>
          </>
          : activeTab == 'audio' ?
            <>
              <TouchableOpacity onPress={() => goingToactiveTab('chat')}>
                <View style={styles.ButtonView}>
                  <Image
                    source={chatImg}
                    style={styles.ButtonImg}
                  />
                  <Text style={styles.ButtonText}>Switch to Chat</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => goingToactiveTab('video')}>
                <View style={styles.ButtonView}>
                  <Image
                    source={videoIcon}
                    style={styles.ButtonImg}
                  />
                  <Text style={styles.ButtonText}>Switch to Video Call</Text>
                </View>
              </TouchableOpacity>
            </>
            :
            <>
              <TouchableOpacity onPress={() => goingToactiveTab('chat')}>
                <View style={styles.ButtonView}>
                  <Image
                    source={chatImg}
                    style={styles.ButtonImg}
                  />
                  <Text style={styles.ButtonText}>Switch to Chat</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => goingToactiveTab('audio')}>
                <View style={styles.ButtonView}>
                  <Image
                    source={callIcon}
                    style={styles.ButtonImg}
                  />
                  <Text style={styles.ButtonText}>Switch to Audio Call</Text>
                </View>
              </TouchableOpacity>
            </>
        }
      </View>
      <View style={styles.containSection}>
        {activeTab == 'chat' ?
          <GiftedChat
            messages={messages}
            renderInputToolbar={props => customtInputToolbar(props)}
            renderComposer={customRenderComposer}
            renderBubble={renderBubble}
            isTyping
            alwaysShowSend
            scrollToBottom
            scrollToBottomComponent={scrollToBottomComponent}
            renderChatFooter={renderChatFooter}
            renderSend={renderSend}
            onSend={messages => onSend(messages)}
            style={styles.messageContainer}
            user={{
              _id: patientId,
              //avatar: { uri: patientProfilePic },
            }}
            renderAvatar={null}
          //user={user}
          />
          : activeTab == 'audio' ?
            <>
              <ImageBackground source={audioBgImg} blurRadius={10} style={styles.AudioBackground}>
                {route?.params?.details?.therapist?.profile_pic ?
                  <Image
                    source={{ uri: route?.params?.details?.therapist?.profile_pic }}
                    style={styles.buttonImage}
                  /> :
                  <Image
                    source={defaultUserImg}
                    style={styles.buttonImage}
                  />
                }
                <Text style={styles.audioSectionTherapistName}>{route?.params?.details?.therapist?.name}</Text>
                <View style={styles.audioButtonSection}>
                  {micOn ?
                    <TouchableOpacity onPress={() => toggleMic()}>
                      <Image
                        source={audiooffIcon}
                        style={styles.iconStyle}
                      />
                    </TouchableOpacity> :
                    <TouchableOpacity onPress={() => toggleMic()}>
                      <Image
                        source={audioonIcon}
                        style={styles.iconStyle}
                      />
                    </TouchableOpacity>}
                  {speakerOn ?
                    <TouchableOpacity onPress={() => toggleSpeaker()}>
                      <Image
                        source={speakeroffIcon}
                        style={styles.iconStyle}
                      />
                    </TouchableOpacity> :
                    <TouchableOpacity onPress={() => toggleSpeaker()}>
                      <Image
                        source={speakeronIcon}
                        style={styles.iconStyle}
                      />
                    </TouchableOpacity>}
                </View>
              </ImageBackground>
            </>

            :
            <>
              {videoCall ? (
                <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
                  {/* Agora Video Component */}
                  <View style={{ height: responsiveHeight(80), width: '100%' }}>
                    <AgoraUIKit
                      connectionData={connectionData}
                      rtcCallbacks={rtcCallbacks}
                      styleProps={customPropsStyle}
                      agoraConfig={agoraConfig}
                    />
                  </View>
                </SafeAreaView>
              ) : (
                <Text onPress={() => {
                  setVideoCall(true);
                }}>
                  Start Call
                </Text>
              )}
            </>
        }
      </View>
    </SafeAreaView>
  )
}

export default ChatScreen

const styles = StyleSheet.create({
  Container: {
    flex: 1,
    backgroundColor: '#EAECF0',
    paddingBottom: 10,
  },
  HeaderSection: { height: responsiveHeight(10), flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 5 },
  HeaderSectionHalf: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  therapistName: { color: '#2D2D2D', fontFamily: 'DMSans-Bold', fontSize: responsiveFontSize(2) },
  therapistDesc: { color: '#444343', fontFamily: 'DMSans-Medium', fontSize: responsiveFontSize(1.7) },
  timerText: { color: '#CC2131', fontFamily: 'DMSans-Medium', fontSize: responsiveFontSize(1.7), marginRight: responsiveWidth(5) },
  endButtonView: { paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#53A39F', borderRadius: 15, marginLeft: responsiveWidth(2) },
  endButtonText: { color: '#FFF', fontFamily: 'DMSans-Semibold', fontSize: responsiveFontSize(1.5) },
  TabSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 10 },
  ButtonView: { width: responsiveWidth(45), height: responsiveHeight(6), backgroundColor: '#fff', borderRadius: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  ButtonImg: { height: 20, width: 20, resizeMode: 'contain', marginRight: 5 },
  ButtonText: { color: '#2D2D2D', fontFamily: 'DMSans-Medium', fontSize: responsiveFontSize(1.7) },
  containSection: { height: responsiveHeight(80), width: responsiveWidth(100), backgroundColor: '#FFF', position: 'absolute', bottom: 0, paddingBottom: 10, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  AudioBackground: { width: responsiveWidth(100), height: responsiveHeight(80), justifyContent: 'center', alignItems: 'center' },
  buttonImage: { height: 150, width: 150, borderRadius: 150 / 2, marginTop: - responsiveHeight(20) },
  audioSectionTherapistName: { color: '#FFF', fontSize: responsiveFontSize(2.6), fontFamily: 'DMSans-Bold', marginTop: responsiveHeight(2), marginBottom: responsiveHeight(2) },
  audioButtonSection: { backgroundColor: '#000', height: responsiveHeight(9), width: responsiveWidth(50), borderRadius: 50, alignItems: 'center', position: 'absolute', bottom: 60, flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center' },
  iconStyle: { height: 50, width: 50 },
  messageContainer: {
    backgroundColor: 'red',
    height: responsiveHeight(70)
  },
  imageView1: {
    width: 30,
    height: 30,
    marginBottom: responsiveFontSize(1)
  },
  imageView2: {
    width: 30,
    height: 30,
    marginBottom: responsiveHeight(2)
  },
  chatFooter: {
    shadowColor: '#ECFCFA',
    shadowOpacity: 0.37,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    flexDirection: 'row',
    padding: 5,
    backgroundColor: 'blue',
    marginBottom: 10
  },
  buttonFooterChat: {
    width: 25,
    height: 25,
    borderRadius: 25 / 2,
    justifyContent: 'center',
    alignItems: 'center',
    //position: 'absolute',
    borderColor: 'black',
    right: 10,
    top: -5,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  buttonFooterChatImg: {
    width: 25,
    height: 25,
    borderRadius: 25 / 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: 'black',
    //position: 'absolute',
    right: 10,
    top: -5,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  textFooterChat: {
    fontSize: responsiveFontSize(2),
    fontWeight: 'bold',
    color: 'black',
  },
  fileContainer: {
    flex: 1,
    maxWidth: 300,
    marginVertical: 2,
    borderRadius: 15,
  },
  fileText: {
    marginVertical: 5,
    fontSize: 16,
    lineHeight: 20,
    marginLeft: 10,
    marginRight: 5,
    color: '#2D2D2D'
  },
  textTime: {
    fontSize: 10,
    color: '#2D2D2D',
    marginLeft: 2,
  },
  agoraStyle: {
    width: '100%',
    height: '100%',
    borderRadius: 50, // Adjust the radius as needed
    overflow: 'hidden', // Ensure child components respect the borderRadius
  },

});