import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useState } from 'react';
import WrapperContainer from '../../components/WrapperContainer';
import { imagePath } from '../../configs/imagePath';
import commonStyles from '../../styles/commonStyles';
import AppTextInput from '../../components/AppTextInput';
import { verticalScale } from '../../styles/responsiveLayoute';
import COLORS from '../../styles/colors';
import FONTS from '../../styles/fonts';
import CustomBtn from '../../components/CustomBtn';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useNavigation } from '@react-navigation/native';
import ScreenName from '../../configs/screenName';
import { navigate } from '../../navigators/NavigationService';
import Loading from '../../components/Loading';
import { useDispatch, useSelector } from 'react-redux';
import { saveUserData } from '../../redux/slices/authSlice';
import { useLoginMutation } from '../../redux/api/user';
import { validateEmail } from '../../components/Validation';
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { useSocialLoginMutation } from '../../redux/api/common';
import Toast from 'react-native-simple-toast'
import DeviceInfo from 'react-native-device-info';
import { getData } from '../../configs/helperFunction';
import { configUrl } from '../../configs/api';

const Login = () => {
    const [socialLogin, { isLoading: loading, isSuccess, error }] = useSocialLoginMutation();

    GoogleSignin.configure({
        webClientId: configUrl.GOOGLE_CLIENT_ID,
        offlineAccess: false,
        scopes: [
            "email",
            "profile",
            'https://www.googleapis.com/auth/drive',
            'https://www.googleapis.com/auth/drive.file',
            'https://www.googleapis.com/auth/drive.appdata',
            'https://www.googleapis.com/auth/drive.metadata',
            'https://www.googleapis.com/auth/drive.readonly',
            'https://www.googleapis.com/auth/drive.metadata.readonly',
            'https://www.googleapis.com/auth/drive.apps.readonly',
            'https://www.googleapis.com/auth/drive.photos.readonly',
        ],
    });
    const navigation = useNavigation();
    const isConnected = useSelector((state) => state.network.isConnected);

    const dispatch = useDispatch();
    const [loginMutation, { isLoading }] = useLoginMutation();
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);


    const togglePasswordVisibility = () => {
        setIsPasswordVisible(prev => !prev);
    };

    const validateFields = () => {
        if (email.trim() === '') {
            Toast.show('Please enter email address');
            return false;
        }
        if (!validateEmail(email.trim())) {
            Toast.show('Please enter a valid email address');
            return false;
        }
        if (password.trim() === '') {
            Toast.show('Please enter password');
            return false;
        }
        return true;
    };

    const getPlatformValue = () => {
        if (Platform.OS === 'android') {
            return 1; // For Android
        } else {
            return 2; // For iOS
        }
    };

    const handleLogin = async () => {
        const fcmToken = await getData('fcmToken')
        console.log('fcmToken', fcmToken);

        const device_type = getPlatformValue();
        const device_id = await DeviceInfo.getUniqueId();
        console.log('device_id', device_id);
       
        if (!isConnected) {
            Toast.show('No internet connection. Please try again.');
            return;
        }
        if (!validateFields()) return;
        try {
            const loginApiResponse = await loginMutation({ email, password, device_id, device_type, fcmToken });
            if (loginApiResponse.data?.succeeded) {
                if (loginApiResponse.data.ResponseBody.is_verified == false) {
                    Toast.show(loginApiResponse.data.ResponseBody.otp);
                    navigate(ScreenName.OTP_VERIFICATION, { screenName: ScreenName.SIGN_UP, userToken: loginApiResponse.data.ResponseBody.token, email, email })
                } else {
                    Toast.show(loginApiResponse.data.ResponseMessage);
                    dispatch(saveUserData(loginApiResponse.data.ResponseBody.token));
                }
            } else {
                Toast.show(loginApiResponse?.data?.ResponseMessage || loginApiResponse.error?.data?.ResponseMessage || 'Something went wrong. Please try again.');
            }
        } catch (error) {
            console.error('Login API Error:', error);
        }
    };
 

    const onGoogleButtonPress = async () => {
        try {
            const fcmToken = await getData('fcmToken')
            const device_type = getPlatformValue();
            const device_id = await DeviceInfo.getUniqueId();
            
            await GoogleSignin.signOut();
            await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
            const data = await GoogleSignin.signIn();

            if (!data.data.idToken) {
                throw new Error('No idToken received from Google Sign-In');
            }

            if (data.data.user) {
                const result = await socialLogin({
                    social_id: data.data.user.id,
                    full_name: data.data.user.name,
                    login_type: 'google',
                    email: data.data.user.email,
                    device_id,
                    device_type,
                    fcmToken
                });

                if (result?.data?.succeeded) {
                    Toast.show(result?.data?.ResponseMessage)
                    dispatch(saveUserData(result?.data?.ResponseBody?.token))
                }
            } else {
                // console.log('google sign in error');

            }
        } catch (error) {
            console.error('Google Sign-In Error:', error);
            //   Toast.show(error.message || "Google SignIn Error");
        }
    };

    return (
        <WrapperContainer wrapperStyle={[commonStyles.innerContainer, styles.container]}>
            <Loading visible={isLoading || loading} />
            <KeyboardAwareScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollViewContentContainer}
                extraScrollHeight={10}
            >
                <Image source={imagePath.logo} style={styles.logoStyle} />
                <AppTextInput
                    value={email}
                    keyboardType={'email-address'}
                    onChangeText={(txt) => setEmail(txt)}
                    placeholder="Email" leftIcon={imagePath.email} />
                <AppTextInput
                    value={password}
                    secureTextEntry={!isPasswordVisible}
                    toggleSecureTextEntry={togglePasswordVisibility}
                    onChangeText={(txt) => setPassword(txt)}
                    placeholder="Password" leftIcon={imagePath.lock} rightIcon />
                <Text onPress={() => navigate(ScreenName.FORGOT_PASSWORD)} style={styles.frgtTxtStyle}>
                    Forgot Password?
                </Text>
                <CustomBtn
                    onPress={handleLogin}
                    title="Login"
                    btnStyle={{ marginTop: verticalScale(120) }}
                />

                <View style={[commonStyles.flexView, { width: '100%', padding: 20 }]}>
                    <View style={styles.devider} />
                    <Text style={styles.orTxt}>Or</Text>
                    <View style={styles.devider} />
                </View>
                <View style={commonStyles.flexView}>
                    <TouchableOpacity
                        onPress={() => onGoogleButtonPress()}
                    >
                        <Image source={imagePath.google} />
                    </TouchableOpacity>
                    <Image source={imagePath.facebook} style={{ marginHorizontal: 20 }} />
                    <Image source={imagePath.insta} />
                </View>
                {/* <LoginButton
                    onLoginFinished={
                    (error, result) => {
                        if (error) {
                        console.log("login has error: " + result.error);
                        } else if (result.isCancelled) {
                        console.log("login is cancelled.");
                        } else {
                        AccessToken.getCurrentAccessToken().then(
                            (data) => {
                            console.log(data.accessToken.toString())
                            }
                        )
                        }
                    }
                    }
                    onLogoutFinished={() => console.log("logout.")}
                    
                /> */}
                <Text style={styles.infoTxt}>
                    Don’t have an account?{' '}
                    <Text
                        onPress={() => navigation.navigate(ScreenName.SIGN_UP)}
                        style={{ color: COLORS.primary, fontSize: 16, fontFamily: FONTS.semiBold }}
                    >
                        Sign Up
                    </Text>
                </Text>
            </KeyboardAwareScrollView>
        </WrapperContainer>
    );
};

export default Login;

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 30,
    },
    logoStyle: {
        height: 120,
        width: 120,
        marginBottom: verticalScale(120),
    },
    frgtTxtStyle: {
        color: COLORS.textColor,
        fontSize: 10,
        fontFamily: FONTS.regular,
        alignSelf: 'flex-end',
        textDecorationLine: 'underline',
    },
    devider: {
        height: 1,
        backgroundColor: COLORS.textColor,
        flex: 1,
    },
    orTxt: {
        fontSize: 12,
        fontFamily: FONTS.regular,
        color: COLORS.textColor,
        marginHorizontal: 15,
    },
    infoTxt: {
        fontFamily: FONTS.regular,
        fontSize: 10,
        color: COLORS.textColor,
        marginTop: 20,
    },
    scrollViewContentContainer: {
        flexGrow: 1,
        width: '100%',
        alignItems: 'center',
    },
});
