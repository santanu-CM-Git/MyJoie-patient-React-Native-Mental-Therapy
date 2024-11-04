import React, { useState, useCallback, useEffect, useRef } from 'react'
import { View, Text, SafeAreaView, StyleSheet, ScrollView, ImageBackground, Image, PermissionsAndroid, Alert, BackHandler, Platform } from 'react-native'
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { GreenTick, audiooffIcon, audioonIcon, callIcon, chatImg, filesendImg, sendImg, speakeroffIcon, speakeronIcon, summaryIcon, userPhoto, videoIcon, audioBgImg, defaultUserImg, switchcameraIcon } from '../../utils/Images'
import { GiftedChat, InputToolbar, Bubble, Send, Composer } from 'react-native-gifted-chat'
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import InChatFileTransfer from '../../components/InChatFileTransfer';
import { API_URL, AGORA_APP_ID } from '@env'
import { TabActions, useRoute } from '@react-navigation/native';
import KeepAwake from 'react-native-keep-awake';
import firestore, { endBefore } from '@react-native-firebase/firestore'
import Ionicons from 'react-native-vector-icons/Ionicons';
import ScreenRecorder from 'react-native-screen-mic-recorder'

import {
  ClientRoleType,
  createAgoraRtcEngine,
  ChannelProfileType,
  RtcSurfaceView,
  IRtcEngine
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

  // For audio call
  const appId = AGORA_APP_ID;
  //const token = route?.params?.details?.agora_token;
  // const channelName = route?.params?.details?.agora_channel_id;
  const uid = 0; // Local user UID, no need to modify
  const token = '007eJxTYDhi6F9zTDfj6wqLJ2d/pO048fby6lV6n0oPfuMLOvD24KqzCgxmpmlGJmmJKcmphkYm5mmWFskWaebJ5uaJRsZGqckWqRd2nEtrCGRkWMXByczIAIEgPidDYnp+UWJJanEJAwMAj1MmkA==';
  const channelName = 'agoratest';

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

  // const requestExternalStoragePermission = async () => {
  //   try {
  //     const granted = await PermissionsAndroid.request(
  //       PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
  //       {
  //         title: 'External Storage Permission',
  //         message: 'This app needs access to your storage to read/write files.',
  //         buttonNeutral: 'Ask Me Later',
  //         buttonNegative: 'Cancel',
  //         buttonPositive: 'OK',
  //       },
  //     );
  //     return granted === PermissionsAndroid.RESULTS.GRANTED;
  //   } catch (err) {
  //     console.warn(err);
  //     return false;
  //   }
  // };

  // const startRecording = async () => {
  //   try {
  //     const recordingStatus = await ScreenRecorder.startRecording().catch((error) => {
  //       console.warn(error); // handle native error
  //     });
  //     if (recordingStatus === 'started') {
  //       setIsRecording(true);
  //       console.log('Recording has started...');
  //     } else if (recordingStatus === 'userDeniedPermission') {
  //       Alert.alert('Please grant permission in order to record screen');
  //     }
  //   } catch (error) {
  //     console.error('Error starting recording:', error);
  //   }
  // };

  // const stopRecording = async () => {
  //   //console.log('Stopping recording...');
  //   try {
  //     if (Platform.OS === 'android') {
  //       const hasPermission = await requestExternalStoragePermission();
  //       if (!hasPermission) {
  //         throw new Error('Storage permission denied');
  //       }
  //     }
  //     const uri = await ScreenRecorder.stopRecording().catch((error) => {
  //       console.warn(error); // handle native error
  //     });
  //     if (uri) {
  //       setRecordedURL(uri);
  //       console.log('Recording stopped. URI:', uri);
  //       const formData = new FormData();
  //       formData.append('file', {
  //         uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
  //         name: 'recording.mp4',
  //         type: 'video/mp4',
  //       });
  //       const response = await axios.post('http://162.215.253.89/swastilife/api/file-upload', formData, {
  //         headers: {
  //           'Content-Type': 'multipart/form-data',
  //         },
  //       });

  //       const result = response.data;
  //       console.log('File uploaded successfully:', result);
  //     }
  //     setIsRecording(false);
  //   } catch (error) {
  //     console.error('Error stopping recording:', error);
  //     if (error.response) {
  //       console.error('Server response:', error.response.data);
  //     } else if (error.request) {
  //       console.error('No response received:', error.request);
  //     } else {
  //       console.error('Error setting up request:', error.message);
  //     }
  //   }
  // };

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
    const initialize = async () => {
      await setupVideoSDKEngine();
      KeepAwake.activate();
      console.log(route?.params?.details, 'details from home page');
      sessionStart();
    };
    initialize();
    // return () => {
    //   agoraEngineRef.current?.destroy();
    // };
  }, []);

  const sessionStart = async () => {
    setIsLoading(true);
    await joinChannel();
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
        setCameraOn(true)
        const endTime = route?.params?.details?.end_time;
        setEndTime(endTime); // Set the end time

        const mode = route?.params?.details?.mode_of_conversation;

        switch (mode) {
          case 'chat':
            setActiveTab('chat');
            setIsVideoEnabled(false);
            break;
          case 'audio':
            await startAudioCall();
            setActiveTab('audio');
            setIsVideoEnabled(false);
            break;
          case 'video':
            await startVideoCall();
            setActiveTab('video');
            setIsVideoEnabled(true);
            break;
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
        setIsVideoEnabled(false);
        await leaveChannel(); // Ensure leave completes before navigating
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
  const agoraEngineRef = useRef(null); // IRtcEngine instance
  const [isJoined, setIsJoined] = useState(false);
  const [remoteUid, setRemoteUid] = useState(null);
  const [localUid, setLocalUid] = useState(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [speakerOn, setSpeakerOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [isVideLoading, setIsVideLoading] = useState(true);

  const setupVideoSDKEngine = async () => {
    try {
      if (Platform.OS === 'android') {
        await getPermission(); // Await for permission request
      }

      agoraEngineRef.current = createAgoraRtcEngine(); // Await for engine creation
      const agoraEngine = agoraEngineRef.current;

      // if (agoraEngine) {
      //   console.log('Agora engine created successfully');
      // } else {
      //   console.log('Failed to create Agora engine');
      // }

      await agoraEngine.initialize({
        appId: appId,
      }); // Await for initialization

      await agoraEngine.registerEventHandler({
        onJoinChannelSuccess: (connection, localUid, elapsed) => {
          console.log('Successfully joined the channel: ' + channelName);
          alert('Successfully joined the channel: ' + channelName)
          setLocalUid(0);
          setIsJoined(true);
        },
        onUserJoined: (_connection, Uid) => {
          console.log('Remote user ' + Uid + ' has joined');
          alert('Remote user ' + Uid + ' has joined')
          setRemoteUid(Uid);
        },
        onUserOffline: (_connection, Uid) => {
          console.log('Remote user ' + Uid + ' has left the channel');
          alert('Remote user ' + Uid + ' has left the channel')
          setRemoteUid(null);
        },
      });

    } catch (e) {
      console.log(e);
    }
  };
  const getPermission = async () => {
    try {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.CAMERA,
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      ]);
      return granted;
    } catch (err) {
      console.warn(err);
    }
  };

  const toggleMic = () => {
    try {
      const agoraEngine = agoraEngineRef.current;
      if (micOn) {
        agoraEngine?.muteLocalAudioStream(true);
      } else {
        agoraEngine?.muteLocalAudioStream(false);
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
      } else {
        agoraEngine?.setEnableSpeakerphone(true);
      }
      setSpeakerOn(!speakerOn);
    } catch (e) {
      console.log(e);
    }
  };

  const toggleSwitchCamera = () => {
    try {
      const agoraEngine = agoraEngineRef.current;
      if (!agoraEngine) {
        console.error('Agora engine not initialized');
        return;
      }

      if (cameraOn) {
        agoraEngine.switchCamera(); // Switch between front and rear cameras
        console.log('Camera switched');
      } else {
        console.log('Camera is off, cannot switch');
      }
    } catch (e) {
      console.log('Error switching camera:', e);
    }
  };


  const toggleCamera = () => {
    try {
      const agoraEngine = agoraEngineRef.current;
      if (!agoraEngine) {
        console.error('Agora engine not initialized');
        return;
      }

      if (cameraOn) {
        agoraEngine.stopPreview(); // Stop the local video preview
        agoraEngine.muteLocalVideoStream(true); // Mute local video stream
        console.log('Camera turned off');
      } else {
        agoraEngine.startPreview(); // Start the local video preview
        agoraEngine.muteLocalVideoStream(false); // Unmute local video stream
        console.log('Camera turned on');
      }

      setCameraOn(!cameraOn); // Toggle camera state
    } catch (e) {
      console.log('Error toggling camera:', e);
    }
  };

  // Define the join method called after clicking the join channel button
  const joinChannel = async () => {
    const agoraEngine = agoraEngineRef.current;

    if (!agoraEngine) {
      console.log('Agora engine is not initialized');
      return;
    }

    try {
      // Set channel profile
      await agoraEngine.setChannelProfile(ChannelProfileType.ChannelProfileCommunication);

      // Start video preview
      await agoraEngine.startPreview();
      await agoraEngine.muteLocalVideoStream(false)
      // Join the channel
      await agoraEngine.joinChannel(token, channelName, uid, {
        clientRoleType: ClientRoleType.ClientRoleBroadcaster,
      });
      setIsVideLoading(false)
      setCameraOn(true);
      //console.log('Successfully joined the channel: ' + channelName);
    } catch (error) {
      console.log('Error joining channel:', error);
      console.log('Failed to join the channel. Please try again.');
      setIsVideLoading(false)
    }
  };


  const leaveChannel = async () => {
    try {
      const agoraEngine = agoraEngineRef.current;
      await agoraEngine?.leaveChannel();
      setRemoteUid(null);
      setIsJoined(false);
      setIsVideoEnabled(false);
      setMicOn(true); // Ensure mic is on when leaving the channel
      setSpeakerOn(true); // Ensure speaker is on when leaving the channel
      console.log('You left the channel');
    } catch (e) {
      console.log(e);
    }

  };

  const startVideoCall = async () => {
    const agoraEngine = agoraEngineRef.current;
    await agoraEngine?.enableVideo();
    setIsVideoEnabled(true);
  };

  const startAudioCall = async () => {
    const agoraEngine = agoraEngineRef.current;
    await agoraEngine?.disableVideo();
    setIsVideoEnabled(false);
  };

  const goingToactiveTab = async (name) => {
    if (name === 'audio') {
      await startAudioCall();
      setActiveTab('audio');
      setIsVideoEnabled(false);
    } else if (name === 'video') {
      await startVideoCall();
      setActiveTab('video');
      setIsVideoEnabled(true);
    } else if (name === 'chat') {
      setActiveTab('chat');
      setIsVideoEnabled(false);
    }
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
                        source={audioonIcon}
                        style={styles.iconStyle}
                      />
                    </TouchableOpacity> :
                    <TouchableOpacity onPress={() => toggleMic()}>
                      <Image
                        source={audiooffIcon}
                        style={styles.iconStyle}
                      />
                    </TouchableOpacity>}
                  {speakerOn ?
                    <TouchableOpacity onPress={() => toggleSpeaker()}>
                      <Image
                        source={speakeronIcon}
                        style={styles.iconStyle}
                      />
                    </TouchableOpacity> :
                    <TouchableOpacity onPress={() => toggleSpeaker()}>
                      <Image
                        source={speakeroffIcon}
                        style={styles.iconStyle}
                      />
                    </TouchableOpacity>}
                </View>
              </ImageBackground>
            </>

            :
            <>
              {isVideLoading ? (
                <ActivityIndicator size="large" color="#0000ff" />  // Display loading indicator while joining
              ) : isVideoEnabled ? (
                <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
                  {/* Agora Video Component */}
                  <View style={{ height: responsiveHeight(80), width: '100%' }}>
                    {/* Remote Video View */}
                    {remoteUid !== null && (
                      <RtcSurfaceView
                        canvas={{ uid: remoteUid }}
                        style={styles.remoteVideo}
                      />
                    )}

                    {/* Local Video View */}
                    <RtcSurfaceView
                      canvas={{ uid: 0 }}
                      style={styles.localVideo}
                    />

                    {/* Video Control Buttons */}
                    <View style={styles.videoButtonSection}>
                      <TouchableOpacity onPress={toggleMic}>
                        <Image
                          source={micOn ? audioonIcon : audiooffIcon}
                          style={styles.iconStyle}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={toggleSpeaker}>
                        <Image
                          source={speakerOn ? speakeronIcon : speakeroffIcon}
                          style={styles.iconStyle}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={toggleSwitchCamera}>
                        <Image
                          source={switchcameraIcon}
                          style={styles.iconStyle}
                        />
                      </TouchableOpacity>
                      {/* Uncomment if you want to toggle the camera on/off */}
                      {/* <TouchableOpacity onPress={toggleCamera}>
              <Image
                source={cameraOn ? cameraonIcon : cameraoffIcon}
                style={styles.iconStyle}
              />
            </TouchableOpacity> */}
                    </View>
                  </View>
                </SafeAreaView>
              ) : (
                <Text onPress={() => setIsVideoEnabled(true)}>
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
  audioButtonSection: { backgroundColor: '#000', height: responsiveHeight(8), width: responsiveWidth(40), borderRadius: 50, alignItems: 'center', position: 'absolute', bottom: 40, flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center' },
  videoButtonSection: { backgroundColor: '#000', height: responsiveHeight(8), width: responsiveWidth(60), borderRadius: 50, alignItems: 'center', position: 'absolute', bottom: 40, flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', alignSelf: 'center' },
  iconStyle: { height: 40, width: 40 },
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
  localVideo: {
    width: '30%',
    height: 200,
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
  },
  remoteVideo: {
    width: '100%',
    height: '100%',
  },

});