import React, { useRef, useState, useEffect } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View, PermissionsAndroid, Platform } from 'react-native';
import { ClientRoleType, createAgoraRtcEngine, ChannelProfileType } from 'react-native-agora';

const appId = '975e09acde854ac38b3304da072c111e';
const channelName = 'testvoice';
const token = '123456789';
const uid = Math.random().toString(36).substr(2, 10);

const TestPage = () => {
    const agoraEngineRef = useRef(); // Agora engine instance
    const [isJoined, setIsJoined] = useState(false); // Indicates if the local user has joined the channel
    const [remoteUid, setRemoteUid] = useState(0); // Uid of the remote user
    const [message, setMessage] = useState(''); // Message to the user

    function showMessage(msg) {
        console.log(msg); // Log messages for debugging
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
                onError: (err) => {
                    console.error('Agora error:', err);
                },
            });
            agoraEngine.initialize({
                appId: appId,
            });
        } catch (e) {
            console.error('Error initializing Agora:', e);
        }
    };

    const join = async () => {
        console.log('Attempting to join channel')
        if (isJoined) {
            console.log('Already joined')
            return;
        }
        try {
            const agoraEngine = agoraEngineRef.current;
            agoraEngine?.setChannelProfile(ChannelProfileType.ChannelProfileCommunication);
            agoraEngine?.joinChannel(token, channelName, uid, {
                clientRoleType: ClientRoleType.ClientRoleBroadcaster,
            });
        } catch (e) {
            console.error('Error joining channel:', e);
        }
    };

    const leave = () => {
        try {
            agoraEngineRef.current?.leaveChannel();
            setRemoteUid(0);
            setIsJoined(false);
            showMessage('You left the channel');
        } catch (e) {
            console.error('Error leaving channel:', e);
        }
    };

    return (
        <SafeAreaView style={styles.main}>
            <Text style={styles.head}>Agora Video Calling Quickstart</Text>
            <View style={styles.btnContainer}>
                <Text onPress={join} style={styles.button}>
                    Join
                </Text>
                <Text onPress={leave} style={styles.button}>
                    Leave
                </Text>
            </View>
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContainer}
            >
                {isJoined ? (
                    <Text style={{color:'#000'}}>Local user uid: {uid}</Text>
                ) : (
                    <Text style={{color:'#000'}}>Join a channel</Text>
                )}
                {isJoined && remoteUid !== 0 ? (
                    <Text style={{color:'#000'}}>Remote user uid: {remoteUid}</Text>
                ) : (
                    <Text style={{color:'#000'}}>Waiting for a remote user to join</Text>
                )}
                <Text style={{color:'#000'}}>{message}</Text>
            </ScrollView>
        </SafeAreaView>
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
