import React from 'react';

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import COLORS from '../styles/colors';
import BottomTabs from '../navigators/BottomTabs'
import ScreenName from '../configs/screenName';
import EditProfile from '../screens/Profile/EditProfile';
import ChangePassword from '../screens/Profile/ChangePassword';
import HelpCenter from '../screens/Profile/HelpCenter';
import Terms from '../screens/Profile/Terms';
import { goBack } from './NavigationService';
import PatientDetails from '../screens/PatientDetails';
import FONTS from '../styles/fonts';
import CameraGrid from '../screens/CameraGrid';
import CrossIcon from '../assets/SvgIcons/CrossIcon';
import ImageViewer from '../screens/ImageViewer';
import ImageDetails from '../screens/ImageDetails';
import CollageAdd from '../screens/CollageAdd';
import EditPatient from '../screens/EditPatient';
import SelectPhoto from '../screens/SelectPhoto';
import Framing from '../screens/Framing';
import DemoScreen from '../screens/DemoScreen'
import ImageZoomML from '../screens/ImageZoomML'


const Stack = createNativeStackNavigator();

const MainStack = () => {  



  return (
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          headerBackTitleVisible: false,
          headerShadowVisible: false,
          gestureEnabled: true,
          gestureDirection: 'horizontal',
          headerTitleAlign:'center',
          headerTitleStyle:{
            color: COLORS.textColor, fontFamily: FONTS.medium, fontSize: 15
          }
        }}>
        <Stack.Screen
            name={'Bottom'}
            component={BottomTabs}
            options={{
              headerShown: false,
              headerTitle:'',
              headerTintColor:COLORS.textColor,
              fontFamily:FONTS.regular,
            }}
          />
        <Stack.Screen
            name={ScreenName.EDIT_PROFILE}
            component={EditProfile}
            options={{
              headerShown: true,
              headerTintColor:COLORS.textColor,
            }}
          />
        <Stack.Screen
            name={ScreenName.CHANGE_PASSWORD}
            component={ChangePassword}
            options={{
              headerShown: true,
              headerTintColor:COLORS.textColor
            }}
          />
        <Stack.Screen
            name={ScreenName.HELP_CENTER}
            component={HelpCenter}
            options={{
              headerShown: true,
              headerTintColor:COLORS.textColor
            }}
          />
        <Stack.Screen
            name={ScreenName.TERMS}
            component={Terms}
            options={{
              headerShown: true,
              headerTintColor:COLORS.textColor
            }}
          />
        <Stack.Screen
            name={ScreenName.PATIENT_DETAILS}
            component={PatientDetails}
            options={{
              headerShown: true,
              headerTintColor:COLORS.textColor
            }}
          />
        <Stack.Screen
            name={ScreenName.CAMERA_GRID}
            component={CameraGrid}
            options={{
              headerShown: true,
              headerTintColor:COLORS.textColor,
              headerTitle:'',
              headerLeft:() => {
                return(
                  <CrossIcon 
                  onPress={() => goBack()}
                  />
                )
              }
            }}
          />
          <Stack.Screen
            name={ScreenName.IMAGE_VIEWER}
            component={ImageViewer}
            options={{
              headerShown: true,
              headerTintColor:COLORS.textColor,
              headerTitle:'',
              headerLeft:() => {
                return(
                  <CrossIcon 
                  onPress={() => goBack()}
                  />
                )
              }
            }}
          />
           <Stack.Screen
            name={'DemoScreen'}
            component={DemoScreen}
            options={{
              headerShown: true,
              headerTintColor:COLORS.textColor,
              headerTitle:'',
              headerLeft:() => {
                return(
                  <CrossIcon 
                  onPress={() => goBack()}
                  />
                )
              }
            }}
          />
          <Stack.Screen
            name={'ImageZoomML'}
            component={ImageZoomML}
            options={{
              headerShown: true,
              headerTintColor:COLORS.textColor,
              headerTitle:'',
              headerLeft:() => {
                return(
                  <CrossIcon 
                  onPress={() => goBack()}
                  />
                )
              }
            }}
          />
          
          <Stack.Screen
            name={ScreenName.IMAGE_DETAILS}
            component={ImageDetails}
            options={{
              headerShown: true,
              headerTintColor:COLORS.textColor,
              headerTitle:'',
              headerLeft:() => {
                return(
                  <CrossIcon 
                  onPress={() => goBack()}
                  />
                )
              }
            }}
          />
          <Stack.Screen
            name={ScreenName.COLLAGE_ADD}
            component={CollageAdd}
            options={{
              headerShown: true,
              headerTintColor:COLORS.textColor,
              headerTitle:'',
              headerLeft:() => {
                return(
                  <CrossIcon 
                  onPress={() => goBack()}
                  />
                )
              }
            }}
          />
          <Stack.Screen
            name={ScreenName.EDIT_PATIENT}
            component={EditPatient}
            options={{
              headerShown: true,
              headerTintColor:COLORS.textColor
            }}
          />
          <Stack.Screen
            name={ScreenName.SELECT_PHOTO}
            component={SelectPhoto}
            options={{
              headerShown: true,
              headerTintColor:COLORS.textColor
            }}
          />
          <Stack.Screen
            name={ScreenName.FRAMING}
            component={Framing}
            options={{
              headerShown: true,
              headerTintColor:COLORS.textColor,
              headerTitle:'Reframe',
            }}
          />
      </Stack.Navigator>
  );
};

export default MainStack;

