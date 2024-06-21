// Import React Hooks
import React, { useRef, useState, useEffect } from 'react';
// Import user interface elements
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
// Import components for obtaining Android device permissions
import { PermissionsAndroid, Platform } from 'react-native';
// Import Agora SDK
import {
    ClientRoleType,
    createAgoraRtcEngine,
    IRtcEngine,
    ChannelProfileType,
  } from 'react-native-agora';

// Define basic information
const appId = '975e09acde854ac38b3304da072c111e';
const token = '007eJxTYMif9fyV2Yeos/msk1S39//JCW60/+vpUzL1ks+LuXa/J0YoMFiam6YaWCYmp6RamJokJhtbJBkbG5ikJBqYGyUbGhqm+j8qTmsIZGTocvZiYmSAQBCfhaEktbiEgQEA4NAg+A==';
const channelName = 'test';
const uid = 0; // Local user UID, no need to modify

const TestPage = () => {
    const agoraEngineRef = useRef(<IRtcEngine></IRtcEngine>); // IRtcEngine instance
    const [isJoined, setIsJoined] = useState(false); // Whether the local user has joined the channel
    const [remoteUid, setRemoteUid] = useState(0); // Remote user UID
    const [message, setMessage] = useState(''); // User prompt message

    // Initialize the engine when starting the App
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

    // Define the join method called after clicking the join channel button
    const join = async () => {
        if (isJoined) {
            return;
        }
        try {
            // Set the channel profile type to communication after joining the channel
            agoraEngineRef.current?.setChannelProfile(
                ChannelProfileType.ChannelProfileCommunication,
            );
            // Call the joinChannel method to join the channel
            agoraEngineRef.current?.joinChannel(token, channelName, uid, {
                // Set the user role to broadcaster
                clientRoleType: ClientRoleType.ClientRoleBroadcaster,
            });
        } catch (e) {
            console.log(e);
        }
    };
    // Define the leave method called after clicking the leave channel button
    const leave = () => {
        try {
            // Call the leaveChannel method to leave the channel
            agoraEngineRef.current?.leaveChannel();
            setRemoteUid(0);
            setIsJoined(false);
            showMessage('Left the channel');
        } catch (e) {
            console.log(e);
        }
    };

    // Render the user interface
    return (
        <SafeAreaView style={styles.main}>
            <Text style={styles.head}>Agora Voice Call Quick Start</Text>
            <View style={styles.btnContainer}>
                <Text onPress={join} style={styles.button}>
                    Join Channel
                </Text>
                <Text onPress={leave} style={styles.button}>
                    Leave Channel
                </Text>
            </View>
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContainer}>
                {isJoined ? (
                    <Text>Local user UID: {uid}</Text>
                ) : (
                    <Text>Join a channel</Text>
                )}
                {isJoined && remoteUid !== 0 ? (
                    <Text>Remote user UID: {remoteUid}</Text>
                ) : (
                    <Text>Waiting for remote users to join</Text>
                )}
                <Text>{message}</Text>
            </ScrollView>
        </SafeAreaView>
    );

    // Display message
    function showMessage(msg) {
        setMessage(msg);
    }
};

// Define user interface styles
const styles = StyleSheet.create({
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

const getPermission = async () => {
    if (Platform.OS === 'android') {
        await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        ]);
    }
};

export default TestPage;