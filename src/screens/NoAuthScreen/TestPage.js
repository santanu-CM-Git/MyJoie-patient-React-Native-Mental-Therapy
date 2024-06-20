import React, { useRef, useState, useEffect } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View, PermissionsAndroid, Platform, Button } from 'react-native';
import { ClientRoleType, createAgoraRtcEngine, ChannelProfileType } from 'react-native-agora';

const appId = '975e09acde854ac38b3304da072c111e';
const channelName = 'testvoice';
const token = '007eJxTYMif9fyV2Yeos/msk1S39//JCW60/+vpUzL1ks+LuXa/J0YoMFiam6YaWCYmp6RamJokJhtbJBkbG5ikJBqYGyUbGhqm+j8qTmsIZGTocvZiYmSAQBCfhaEktbiEgQEA4NAg+A==';
const uid = Math.random().toString(36).substr(2, 10);

const TestPage = () => {
    const agoraEngineRef = useRef(null);
    const [isJoined, setIsJoined] = useState(false);
    const [remoteUid, setRemoteUid] = useState(null);
  
    useEffect(() => {
      setupVoiceSDKEngine();
      return () => {
        // Cleanup Agora engine
        if (agoraEngineRef.current) {
          agoraEngineRef.current.leaveChannel();
          agoraEngineRef.current.release();
        }
      };
    }, []);

    const getPermission = async () => {
        if (Platform.OS === 'android') {
          await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          ]);
        }
      };
  
    const setupVoiceSDKEngine = async () => {
      try {
        if (Platform.OS === 'android') {
          await getPermission(); // Define getPermission function to request necessary permissions
        }
  
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
            setRemoteUid(null);
          },
        });
  
        agoraEngine.initialize({ appId: appId });
        // const token = ''; // Replace with your token if required
        // const uid = 0; // Replace with your user ID
        await agoraEngine.joinChannel(token, channelName, null, uid);
      } catch (e) {
        console.error('Initialization Error:', e);
      }
    };
  
    return (
      <View>
        <Text>{isJoined ? 'Joined channel' : 'Not joined'}</Text>
        {remoteUid && <Text>Remote user UID: {remoteUid}</Text>}
        <Button title="Leave Channel" onPress={() => agoraEngineRef.current.leaveChannel()} />
      </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    button: {
        paddingHorizontal: 25,
        paddingVertical: 4,
        fontWeight: 'bold',
        color: '#ffffff',
        backgroundColor: '#0055cc',
        margin: 5,
    },
    main: { flex: 1, alignItems: 'center' },
    scroll: { flex: 1, backgroundColor: '#ddeeff', width: '100%' },
    scrollContainer: { alignItems: 'center' },
    videoView: { width: '90%', height: 200 },
    btnContainer: { flexDirection: 'row', justifyContent: 'center' },
    head: { fontSize: 20 },
});

export default TestPage;
