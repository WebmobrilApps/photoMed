import { navigationRef } from "./NavigationService";
import { NavigationContainer } from "@react-navigation/native";
import AuthStack from "./AuthStack";
import MainStack from "./MainStack";
import { useDispatch, useSelector } from "react-redux";
import NetInfo from "@react-native-community/netinfo";
import { useEffect } from "react";
import { setNetworkStatus } from "../redux/slices/networkSlice";
import Welcome from "../screens/Auth/Welcome";
import NoInternet from "../components/Nointernet";
import ConnectCloud from "../screens/Auth/ConnectCloud";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const AppNavigator = () => {
  const dispatch = useDispatch();
  const isConnected = useSelector((state) => state.network.isConnected);
  const accessToken = useSelector((state) => state.auth.accessToken);
  const token = useSelector((state) => state?.auth?.user);
  // console.log('accessToken',accessToken);

  const linking = {
    prefixes: ["com.photomedPro.com://"],
    config: {
      initialRouteName: "Home",
      screens: {
        HomeSample: {
          path: "CurrentGames/:invite_points",
        },
      },
    },
  };

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      dispatch(setNetworkStatus(state.isConnected));
    });

    return () => unsubscribe();
  }, [dispatch]);

  return (
    <>
      <GestureHandlerRootView style={{ flex: 1 }}>
        {isConnected ? (
          <NavigationContainer linking={linking} ref={navigationRef}>
            {token && accessToken ? (
              <MainStack />
            ) : token ? (
              <ConnectCloud />
            ) : (
              <AuthStack />
            )}
          </NavigationContainer>
        ) : (
          <NoInternet />
        )}
      </GestureHandlerRootView>
    </>
  );
};

export default AppNavigator;
