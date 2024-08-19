import React, { useContext, useState, useEffect } from 'react';
import {
    SafeAreaView,
    StyleSheet,
    useWindowDimensions,
} from 'react-native';
import { WebView } from 'react-native-webview';
import CustomHeader from '../../components/CustomHeader';
import Loader from '../../utils/Loader';

export default function CancellationPolicy({ navigation }) {

    const [isLoading, setIsLoading] = useState(false);
    const { width } = useWindowDimensions();
    const privacyPolicyUrl = "https://www.myjoie.app/cancellation-policy";

    return (
        <SafeAreaView style={styles.Container}>
            <CustomHeader
                commingFrom={'Cancellation Policy'}
                title={'Cancellation Policy'}
                onPress={() => navigation.goBack()}
                onPressProfile={() => navigation.navigate('Profile')}
            />
            <WebView
                source={{ uri: privacyPolicyUrl }}
                style={styles.webview}
                startInLoadingState={true}
                renderLoading={() => <Loader />}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    Container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: 10
    },
    webview: {
        flex: 1,
    },
});
