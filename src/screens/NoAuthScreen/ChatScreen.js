import React, { useState, useCallback, useEffect, useRef } from 'react'
import { View, Text, SafeAreaView, StyleSheet, ScrollView, ImageBackground, Image, KeyboardAvoidingView, PermissionsAndroid } from 'react-native'
import CustomHeader from '../../components/CustomHeader'
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { GreenTick, audiooffIcon, audioonIcon, callIcon, chatImg, filesendImg, sendImg, speakeroffIcon, speakeronIcon, summaryIcon, userPhoto, videoIcon } from '../../utils/Images'
import { GiftedChat, InputToolbar, Bubble, Send } from 'react-native-gifted-chat'
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import * as DocumentPicker from 'react-native-document-picker';
import InChatFileTransfer from '../../components/InChatFileTransfer';
import InChatViewFile from '../../components/InChatViewFile';
// import { getAuth, onAuthStateChanged } from '@react-native-firebase/auth';
// import { getDatabase, ref, onValue, push } from '@react-native-firebase/database';
// import * as firebase from "firebase/app"
import firebase from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore'
import RNFetchBlob from 'rn-fetch-blob'
// import { CometChat } from '@cometchat/chat-sdk-react-native'
import Ionicons from 'react-native-vector-icons/Ionicons';
import Icon from 'react-native-vector-icons/Entypo';
import Modal from "react-native-modal";
import AgoraUIKit, { StreamFallbackOptions, PropsInterface, VideoRenderMode, RenderModeType } from 'agora-rn-uikit';
console.log(RenderModeType.RenderModeFit,'kkkkkkkkkkk')

import { ClientRoleType, createAgoraRtcEngine, ChannelProfileType } from 'react-native-agora';
const appId = '975e09acde854ac38b3304da072c111e';
const channelName = 'testvoice';
const token = '123456789';
const uid = Math.random().toString(36).substr(2, 10);

const ChatScreen = ({ navigation, route }) => {

  const [videoCall, setVideoCall] = useState(true);
  const connectionData = {
    appId: '975e09acde854ac38b3304da072c111e',
    channel: 'test',

  };
  const rtcCallbacks = {
    EndCall: () => {
      setVideoCall(false);
    }
  };

  const [messages, setMessages] = useState([])
  const [therapistId, setTherapistId] = useState(route?.params?.details?.therapist?.id)
  const [therapistProfilePic, setTherapistProfilePic] = useState(route?.params?.details?.therapist?.profile_pic)
  const [patientId, setPatientId] = useState(route?.params?.details?.patient?.id)
  const [patientProfilePic, setPatientProfilePic] = useState(route?.params?.details?.patient?.profile_pic)
  const [chatgenidres, setChatgenidres] = useState('4');
  const [isAttachImage, setIsAttachImage] = useState(false);
  const [isAttachFile, setIsAttachFile] = useState(false);
  const [imagePath, setImagePath] = useState('');
  const [filePath, setFilePath] = useState('');
  const [fileVisible, setFileVisible] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('chat')
  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  useEffect(() => {
    //receivedMsg()
    console.log(route?.params?.details, 'details from home page')
  }, [])


  const _pickDocument = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
        copyTo: 'documentDirectory',
        mode: 'import',
        allowMultiSelection: true,
      });
      const fileUri = result[0].fileCopyUri;
      if (!fileUri) {
        console.log('File URI is undefined or null');
        return;
      }
      console.log(fileUri)
      if (fileUri.indexOf('.png') !== -1 || fileUri.indexOf('.jpg') !== -1) {
        setImagePath(fileUri);
        setIsAttachImage(true);
      } else {
        setFilePath(fileUri);
        setIsAttachFile(true);
      }
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        console.log('User cancelled file picker');
      } else {
        console.log('DocumentPicker err => ', err);
        throw err;
      }
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

  const renderSend = (props) => {
    return (

      <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
        {/* <TouchableOpacity onPress={_pickDocument}>
          <Image
            source={filesendImg}
            style={styles.imageView1}
          />
        </TouchableOpacity> */}
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
    // setMessages([
    //   {
    //     _id: 1,
    //     text: 'Hello developer',
    //     createdAt: new Date(),
    //     user: {
    //       _id: 2,
    //       name: 'React Native',
    //       avatar: require('../../assets/images/user-profile.jpg'),
    //     },
    //   },
    // ])
    const docid  = patientId > therapistId ? therapistId + "-" + patientId : patientId + "-" + therapistId
    const messageRef = firestore().collection('chatrooms')
    .doc(docid)
    .collection('messages')
    .orderBy('createdAt',"desc")

  const unSubscribe =  messageRef.onSnapshot((querySnap)=>{
        const allmsg =   querySnap.docs.map(docSanp=>{
         const data = docSanp.data()
         if(data.createdAt){
             return {
                ...docSanp.data(),
                createdAt:docSanp.data().createdAt.toDate()
            }
         }else {
            return {
                ...docSanp.data(),
                createdAt:new Date()
            }
         }
            
        })
        setMessages(allmsg)
    })


    return ()=>{
      unSubscribe()
    }
  }, [])

  // const onSend = useCallback((messages = []) => {
  //   const [messageToSend] = messages;
  //   if (isAttachImage) {
  //     const newMessage = {
  //       _id: messages[0]._id + 1,
  //       text: messageToSend.text,
  //       timestamp: firebase.database.ServerValue.TIMESTAMP,
  //       user: {
  //         _id: 1,
  //         avatar: require('../../assets/images/user-profile.jpg'),
  //       },
  //       codeSnippet: true,
  //       image: imagePath,
  //       file: {
  //         url: ''
  //       }
  //     };
  //     setMessages(previousMessages =>
  //       GiftedChat.append(previousMessages, newMessage),
  //     );
  //     // messages.forEach(item => {
  //     //   const message = newMessage
  //     //   db.push(message);
  //     // });
  //     setImagePath('');
  //     setIsAttachImage(false);
  //   } else if (isAttachFile) {
  //     const newMessage = {
  //       _id: messages[0]._id + 1,
  //       text: messageToSend.text,
  //       createdAt: new Date(),
  //       user: {
  //         _id: 1,
  //         avatar: require('../../assets/images/user-profile.jpg'),
  //       },
  //       image: '',
  //       file: {
  //         url: filePath
  //       }
  //     };
  //     setMessages(previousMessages =>
  //       GiftedChat.append(previousMessages, newMessage),
  //     );
  //     setFilePath('');
  //     setIsAttachFile(false);
  //   } else {
  //     setMessages(previousMessages =>
  //       GiftedChat.append(previousMessages, messages),
  //     );
  //   }
  // },
  //   [filePath, imagePath, isAttachFile, isAttachImage],
  // );

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
    const docid = patientId > therapistId ? therapistId + "-" + patientId : patientId + "-" + therapistId

    firestore().collection('chatrooms')
      .doc(docid)
      .collection('messages')
      .add({ ...mymsg, createdAt: firestore.FieldValue.serverTimestamp() })


  }


  // audio call 
  const agoraEngineRef = useRef(); // Agora engine instance
  const [isJoined, setIsJoined] = useState(false); // Indicates if the local user has joined the channel
  const [remoteUid, setRemoteUid] = useState(0); // Uid of the remote user
  const [message, setMessage] = useState(''); // Message to the user
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
    // Initialize Agora engine when the app starts
    setupVoiceSDKEngine();
  }, []);

  const setupVoiceSDKEngine = async () => {
    try {
      // use the helper function to get permissions
      if (Platform.OS === 'android') await getPermission();
      agoraEngineRef.current = createAgoraRtcEngine();
      const agoraEngine = agoraEngineRef.current;
      agoraEngine.registerEventHandler({
        onJoinChannelSuccess: () => {
          showMessage('Successfully joined the channel ' + channelName);
          setIsJoined(true);
        },
        onUserJoined: (_connection, Uid) => {
          showMessage('Remote user joined with uid ' + Uid);
          setRemoteUid(Uid);
        },
        onUserOffline: (_connection, Uid) => {
          showMessage('Remote user left the channel. uid: ' + Uid);
          setRemoteUid(0);
        },
      });
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

  const join = async () => {
    console.log('join')
    console.log(isJoined, 'isjoind status')
    if (isJoined) {
      console.log('already joined')
      return;
    }
    try {
      agoraEngineRef.current?.setChannelProfile(
        ChannelProfileType.ChannelProfileCommunication
      );
      agoraEngineRef.current?.joinChannel(token, channelName, uid, {
        clientRoleType: ClientRoleType.ClientRoleBroadcaster,
      });
      setIsJoined(true);
    } catch (e) {
      console.log(e);
    }
  };

  const leave = () => {
    try {
      agoraEngineRef.current?.leaveChannel();
      setRemoteUid(0);
      setIsJoined(false);
      showMessage('You left the channel');
    } catch (e) {
      console.log(e);
    }
  };
  const customPropsStyle = {
    localBtnStyles: {
      endCall: {
        height: 40,
        width: 40,
        backgroundColor: '#e43',
        borderWidth: 0,
        marginLeft:5
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
        borderWidth: 0
      },
      muteLocalVideo: {
        height: 40,
        width: 40,
        backgroundColor: '#8D9095',
        borderWidth: 0
      },
    },
    maxViewStyles: {
      height: '100%',
      width: '130%',
      alignSelf: 'center',
      // marginRight:-20
    },
    UIKitContainer: {
      //flex: 1,
      height: '50%', width: '100%'
    },
    localBtnContainer: {
      backgroundColor: 'rgba(52, 52, 52, 0.8)',
      height: responsiveHeight(10),
      //width: responsiveWidth(80),
      borderRadius: 50,
      alignItems: 'center',
    },
    // localBtnContainer: {
    //   backgroundColor: 'rgba(52, 52, 52, 0.8)',
    //   bottom: 0,
    //   paddingVertical: 10,
      
    //   height: 80,
    // },
    theme: '#ffffffee',
    iconSize: 25,
    VideoRenderMode:RenderModeType.RenderModeFit
   
  }

 
  return (
    <SafeAreaView style={styles.Container} behavior="padding" keyboardVerticalOffset={30} enabled>
      {/* <CustomHeader commingFrom={'chat'} onPress={() => navigation.goBack()} title={'Admin Community'} /> */}
      <View style={{ height: responsiveHeight(10), flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 5 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
          <Ionicons name="chevron-back" size={25} color="#000" />
          <View style={{ flexDirection: 'column', marginLeft: 10 }}>
            <Text style={{ color: '#2D2D2D', fontFamily: 'DMSans-Bold', fontSize: responsiveFontSize(2) }}>Sourav Ganguly</Text>
            <Text style={{ color: '#444343', fontFamily: 'DMSans-Medium', fontSize: responsiveFontSize(1.7) }}>Patient</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#CC2131', fontFamily: 'DMSans-Medium', fontSize: responsiveFontSize(1.7), marginRight: responsiveWidth(5) }}>14:59</Text>
          <View style={{ paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#53A39F', borderRadius: 15, marginLeft: responsiveWidth(2) }}>
            <Text style={{ color: '#FFF', fontFamily: 'DMSans-Semibold', fontSize: responsiveFontSize(1.5) }}>End</Text>
          </View>
        </View>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 10 }}>
        {activeTab == 'chat' ?
          <>
            <TouchableOpacity onPress={() => setActiveTab('audio')}>
              <View style={{ width: responsiveWidth(45), height: responsiveHeight(6), backgroundColor: '#fff', borderRadius: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                <Image
                  source={callIcon}
                  style={{ height: 20, width: 20, resizeMode: 'contain', marginRight: 5 }}
                />
                <Text style={{ color: '#2D2D2D', fontFamily: 'DMSans-Medium', fontSize: responsiveFontSize(1.7) }}>Switch to Audio Call</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setActiveTab('video')}>
              <View style={{ width: responsiveWidth(45), height: responsiveHeight(6), backgroundColor: '#fff', borderRadius: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                <Image
                  source={videoIcon}
                  style={{ height: 20, width: 20, resizeMode: 'contain', marginRight: 5 }}
                />
                <Text style={{ color: '#2D2D2D', fontFamily: 'DMSans-Medium', fontSize: responsiveFontSize(1.7) }}>Switch to Video Call</Text>
              </View>
            </TouchableOpacity>
          </>
          : activeTab == 'audio' ?
            <>
              <TouchableOpacity onPress={() => setActiveTab('chat')}>
                <View style={{ width: responsiveWidth(45), height: responsiveHeight(6), backgroundColor: '#fff', borderRadius: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                  <Image
                    source={chatImg}
                    style={{ height: 20, width: 20, resizeMode: 'contain', marginRight: 5 }}
                  />
                  <Text style={{ color: '#2D2D2D', fontFamily: 'DMSans-Medium', fontSize: responsiveFontSize(1.7) }}>Switch to Chat</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setActiveTab('video')}>
                <View style={{ width: responsiveWidth(45), height: responsiveHeight(6), backgroundColor: '#fff', borderRadius: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                  <Image
                    source={videoIcon}
                    style={{ height: 20, width: 20, resizeMode: 'contain', marginRight: 5 }}
                  />
                  <Text style={{ color: '#2D2D2D', fontFamily: 'DMSans-Medium', fontSize: responsiveFontSize(1.7) }}>Switch to Video Call</Text>
                </View>
              </TouchableOpacity>
            </>
            :
            <>
              <TouchableOpacity onPress={() => setActiveTab('chat')}>
                <View style={{ width: responsiveWidth(45), height: responsiveHeight(6), backgroundColor: '#fff', borderRadius: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                  <Image
                    source={chatImg}
                    style={{ height: 20, width: 20, resizeMode: 'contain', marginRight: 5 }}
                  />
                  <Text style={{ color: '#2D2D2D', fontFamily: 'DMSans-Medium', fontSize: responsiveFontSize(1.7) }}>Switch to Chat</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setActiveTab('audio')}>
                <View style={{ width: responsiveWidth(45), height: responsiveHeight(6), backgroundColor: '#fff', borderRadius: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                  <Image
                    source={callIcon}
                    style={{ height: 20, width: 20, resizeMode: 'contain', marginRight: 5 }}
                  />
                  <Text style={{ color: '#2D2D2D', fontFamily: 'DMSans-Medium', fontSize: responsiveFontSize(1.7) }}>Switch to Audio Call</Text>
                </View>
              </TouchableOpacity>
            </>
        }
      </View>
      <TouchableOpacity onPress={() => toggleModal()}>
        <View style={{ width: responsiveWidth(95), height: responsiveHeight(6), backgroundColor: '#fff', borderRadius: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginTop: responsiveHeight(1) }}>
          <Image
            source={summaryIcon}
            style={{ height: 20, width: 20, resizeMode: 'contain', marginRight: 5 }}
          />
          <Text style={{ color: '#2D2D2D', fontFamily: 'DMSans-Medium', fontSize: responsiveFontSize(1.7) }}>Previous Session Summary</Text>
        </View>
      </TouchableOpacity>
      <View style={{ height: responsiveHeight(75), width: responsiveWidth(100), backgroundColor: '#FFF', position: 'absolute', bottom: 0, paddingBottom: 10, borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
        {activeTab == 'chat' ?
          <GiftedChat
            messages={messages}
            renderInputToolbar={props => customtInputToolbar(props)}
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
              avatar: {uri:patientProfilePic},
            }}
          //user={user}
          />
          : activeTab == 'audio' ?
            <>
              {/* <View style={styles.btnContainer}>
                <Text onPress={join} style={styles.button}>
                  Join
                </Text>
                <Text onPress={leave} style={styles.button}>
                  Leave
                </Text>
                <Text onPress={toggleMic} style={styles.button}>
                  {micOn ? 'Mute Mic' : 'Unmute Mic'}
                </Text>
                <Text onPress={toggleSpeaker} style={styles.button}>
                  {speakerOn ? 'Disable Speaker' : 'Enable Speaker'}
                </Text>
              </View>
              <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContainer}
              >
                {isJoined ? (
                  <Text style={{ color: '#000' }}>Local user uid: {uid}</Text>
                ) : (
                  <Text style={{ color: '#000' }}>Join a channel</Text>
                )}
                {isJoined && remoteUid !== 0 ? (
                  <Text style={{ color: '#000' }}>Remote user uid: {remoteUid}</Text>
                ) : (
                  <Text style={{ color: '#000' }}>Waiting for a remote user to join</Text>
                )}
                <Text>{message}</Text>
              </ScrollView> */}
              <ImageBackground source={userPhoto} blurRadius={10} style={{ width: responsiveWidth(100), height: responsiveHeight(75), justifyContent: 'center', alignItems: 'center' }}>
                <Image
                  source={userPhoto}
                  style={{ height: 150, width: 150, borderRadius: 150 / 2, marginTop: - responsiveHeight(20) }}
                />
                <Text style={{ color: '#FFF', fontSize: responsiveFontSize(2.6), fontFamily: 'DMSans-Bold', marginTop: responsiveHeight(2), marginBottom: responsiveHeight(2) }}>Jennifer Kourtney</Text>
                <View style={{ backgroundColor: 'rgba(52, 52, 52, 0.8)', height: responsiveHeight(9), width: responsiveWidth(50), borderRadius: 50, alignItems: 'center', position: 'absolute', bottom: 60, flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center' }}>
                  {micOn ?
                    <TouchableOpacity onPress={() => toggleMic()}>
                      <Image
                        source={audiooffIcon}
                        style={{ height: 50, width: 50 }}
                      />
                    </TouchableOpacity> :
                    <TouchableOpacity onPress={() => toggleMic()}>
                      <Image
                        source={audioonIcon}
                        style={{ height: 50, width: 50 }}
                      />
                    </TouchableOpacity>}
                  {speakerOn ?
                    <TouchableOpacity onPress={() => toggleSpeaker()}>
                      <Image
                        source={speakeroffIcon}
                        style={{ height: 50, width: 50 }}
                      />
                    </TouchableOpacity> :
                    <TouchableOpacity onPress={() => toggleSpeaker()}>
                      <Image
                        source={speakeronIcon}
                        style={{ height: 50, width: 50 }}
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
                  <AgoraUIKit connectionData={connectionData} rtcCallbacks={rtcCallbacks} 
                   styleProps={customPropsStyle} 
                  />
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
      <Modal
        isVisible={isModalVisible}
        // onBackdropPress={() => setIsFocus(false)} // modal off by clicking outside of the modal
        style={{
          margin: 0, // Add this line to remove the default margin
          justifyContent: 'flex-end',
        }}>
        <View style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', height: 50, width: 50, borderRadius: 25, position: 'absolute', bottom: '55%', left: '45%', right: '45%' }}>
          <Icon name="cross" size={30} color="#B0B0B0" onPress={toggleModal} />
        </View>
        {/* <TouchableWithoutFeedback onPress={() => setIsFocus(false)} style={{  }}> */}
        <View style={{ height: '50%', backgroundColor: '#fff', position: 'absolute', bottom: 0, width: '100%' }}>
          <View style={{ padding: 20 }}>
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