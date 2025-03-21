import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
  TextInput,
  AppState,
  Alert,
} from "react-native";
import React, { useEffect, useState, useCallback, useRef } from "react";
import WrapperContainer from "../../components/WrapperContainer";
import commonStyles from "../../styles/commonStyles";
import { imagePath } from "../../configs/imagePath";
import useTokenManagement from "../../configs/useTokenManagement";
import {
  checkAccessTokenValidity,
  checkAndRefreshGoogleAccessToken,
  configUrl,
  ensureValidAccessToken,
  refreshAccessToken,
} from "../../configs/api";
import { SwiperFlatList } from "react-native-swiper-flatlist";
import COLORS from "../../styles/colors";
import { moderateScale, verticalScale } from "../../styles/responsiveLayoute";
import FONTS from "../../styles/fonts";
import { navigate } from "../../navigators/NavigationService";
import ScreenName from "../../configs/screenName";
import {
  useGetBannersQuery,
  useGetPatientsQuery,
} from "../../redux/api/common"; // Changed to query
import { useDispatch, useSelector } from "react-redux";
import Loading from "../../components/Loading";
import CustomBtn from "../../components/CustomBtn";
import Toast from "react-native-simple-toast";
import CrossIcon from "../../assets/SvgIcons/CrossIcon";
import FastImage from "react-native-fast-image";
import ImageWithLoader from "../../components/ImageWithLoader";
import { logout, setAccessToken } from "../../redux/slices/authSlice";
import { getData, removeData, storeData } from "../../configs/helperFunction";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { useFocusEffect } from "@react-navigation/native";
import {
  setCurrentPatient,
  setPatientImages,
} from "../../redux/slices/patientSlice";
const { width } = Dimensions.get("window");

const Home = () => {
  const dispatch = useDispatch();
  const provider = useSelector((state) => state.auth.cloudType);

  GoogleSignin.configure({
    webClientId: configUrl.GOOGLE_CLIENT_ID,
    offlineAccess: false,
    scopes: [
      "email",
      "profile",
      "https://www.googleapis.com/auth/drive",
      "https://www.googleapis.com/auth/drive.file",
      "https://www.googleapis.com/auth/drive.appdata",
      "https://www.googleapis.com/auth/drive.metadata",
      "https://www.googleapis.com/auth/drive.readonly",
      "https://www.googleapis.com/auth/drive.metadata.readonly",
      "https://www.googleapis.com/auth/drive.apps.readonly",
      "https://www.googleapis.com/auth/drive.photos.readonly",
    ],
  });

  const token = useSelector((state) => state.auth?.user);
  const accessToken = useSelector((state) => state.auth.accessToken);
  const [searchQuery, setSearchQuery] = useState("");
  const [patientData2, setPatientData2] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [refreshing, setRefreshing] = useState(false); // State for pull-to-refresh
  const [patients, setPatients] = useState(null); // State for pull-to-refresh
  const [isLoading, setIsLoading] = useState(false); // State for pull-to-refresh
  //   const {
  //     data: patients,
  //     isLoading,
  //     error,
  //     refetch,
  //   } = useGetPatientsQuery({ token }); // Using query
  const {
    data: banner,
    isLoading: loading,
    refetch: refetchBanner,
  } = useGetBannersQuery();
  const banners = banner?.ResponseBody;

  //   if (error?.data?.isDeleted || error?.data?.status === 2) {
  //     dispatch(logout());
  //     Toast.show(
  //       "Your account is deactivated. Please contact the administrator."
  //     );
  //   }

  useTokenManagement(provider, accessToken);

  useFocusEffect(
    useCallback(() => {
      setSearchTerm("");
      searchPatientApi("", "1st");
      dispatch(setPatientImages([]));
    }, [])
  );
  useEffect(() => {
    if (patients) {
      const patientList = patients?.ResponseBody?.patientData || [];
      setOriginalData(patientList); // Set the original data
      setPatientData2(patientList); // Initialize display data
    }
  }, [patients]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    searchPatientApi("", "1st");
    await refetchBanner();
    setRefreshing(false);
  }, []);

  const [timeoutToClear, setTimeoutToClear] = useState();
  const [searchTerm, setSearchTerm] = useState("");
  const debounce = (callback, alwaysCall, ms) => {
    return (...args) => {
      alwaysCall(...args);
      clearTimeout(timeoutToClear);
      setTimeoutToClear(
        setTimeout(() => {
          callback(...args);
        }, ms)
      );
    };
  };

  const setSearchTextAlways = (txt) => {
    setSearchTerm(txt);
    console.log("setSearchTextAlways");
  };

  const searchPatientApi = async (txt, type = "") => {
    console.log("searchPatientApisearchPatientApi", txt);
    setIsLoading(true);
    try {
      const pDataRes = await fetch(
        `${configUrl.BASE_URL}getpatients?search=${txt}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const pData = await pDataRes.json();
      console.log("pDatapData", pData);
      setIsLoading(false);
      if (pData?.ResponseCode === 200 || pData?.ResponseCode === "200") {
        setPatients(pData);
      }else{
        setOriginalData([]);
        setPatientData2([]);
      }
    } catch (error) {
      setIsLoading(false);
      console.log("pDatapData", error);
      if (error?.data?.isDeleted || error?.data?.status === 2) {
        dispatch(logout());
        Toast.show(
          "Your account is deactivated. Please contact the administrator."
        );
      }
      Toast.show("Failed to fetch patients. Please try again later.");
    }
  };
  //   };

  const debouncedSearchPatient = debounce(
    searchPatientApi,
    setSearchTextAlways,
    800
  );

 
  const formatUrl = (url) => {
    // Replace backslashes with forward slashes
    let formattedUrl = url.replace(/\\/g, "/");
    // Encode the URI to handle special characters
    return encodeURI(formattedUrl);
  };

  const renderBannerItem = ({ item }) => {
    const rawUrl = `${configUrl.imageUrl}${item?.profiles[0]}`;
    const formattedUrl = formatUrl(rawUrl);
    return (
      <View style={{ width }}>
        <ImageWithLoader
          uri={formattedUrl}
          style={styles.bannerImgStyle}
        />
      </View>
    );
  };
  const goPatientDetailPage = async (item) => {
    await removeData("patientFolderId");
    dispatch(setCurrentPatient(item));
    navigate(ScreenName.PATIENT_DETAILS, { item });
  };
  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity
        onPress={() => goPatientDetailPage(item)}
        activeOpacity={0.8}
        style={styles.cardContainer}
      >
        <ImageWithLoader
          uri={
            item?.profileImage
              ? configUrl?.imageUrl + item?.profileImage
              : configUrl.defaultUser
          }
          style={styles.imgStyle}
        />
        <View style={[commonStyles.flexView, { flex: 1 }]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{item.full_name}</Text>
            <Text style={styles.subTitle}>{item.dob}</Text>
            {item?.mobile && (
              <Text style={styles.subTitle}>{item?.mobile}</Text>
            )}
            {item?.email && <Text style={styles.subTitle}>{item.email}</Text>}
          </View>
          <View style={styles.countWrapper}>
            {item?.imageCount &&
              item?.imageCount !== "" &&
              item?.imageCount !== null &&
              item?.imageCount !== "null" &&
              item?.imageCount !== undefined &&
              item?.imageCount !== "0" && (
                <View style={styles.countContainer}>
                  <Text style={styles.countTxt}>
                    {item?.imageCount > 9 ? (
                      <Text>
                        9<Text style={styles.plusTxt}>+</Text>
                      </Text>
                    ) : (
                      item?.imageCount
                    )}
                  </Text>
                </View>
              )}
            <Image source={imagePath.gallery} style={styles.imgIcon} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // if (isLoading) {
  //   return <Loading visible={true} />; // Show loading indicator
  // }

  return (
    <WrapperContainer
      wrapperStyle={[commonStyles.innerContainer, { paddingHorizontal: 0 }]}
    >
    <Loading visible={isLoading} />
      <View style={{ paddingHorizontal: 20 }}>
        <View style={[styles.textInputContainerStyle]}>
          <Image
            resizeMode="contain"
            source={imagePath.search}
            style={{ marginHorizontal: 9.5 }}
          />
          <TextInput
            style={styles.textinputStyle}
            placeholder={"Search..."}
            placeholderTextColor={COLORS.textColor}
            value={searchTerm}
            onChangeText={debouncedSearchPatient}
            autoCapitalize="none"
          />
          {searchTerm.length > 0 && ( // Show CrossIcon only if there's text in the input
            <TouchableOpacity
              onPress={() => {
                setSearchTerm("");
                searchPatientApi("",'1st'); // Reset the patient list to the original data
              }}
              style={{
                justifyContent: "center",
                alignItems: "flex-end",
                padding: 9.5,
              }}
            >
              <CrossIcon height={20} width={20} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={{ flex: 1 }}>
        <FlatList
          data={patientData2}
          keyExtractor={(item, index) => index.toString()}
          showsVerticalScrollIndicator={false}
          renderItem={renderItem}
          ListHeaderComponent={
            <View style={styles.swiperContainer}>
              <SwiperFlatList
                autoplay
                autoplayDelay={4}
                autoplayLoop
                showPagination
                paginationActiveColor={COLORS.primary}
                paginationStyle={{ bottom: verticalScale(-30) }}
                paginationStyleItemInactive={styles.paginationInActiveStyle}
                paginationStyleItemActive={styles.paginationActiveStyle}
                data={banners}
                renderItem={renderBannerItem}
              />
            </View>
          }
          ListFooterComponent={<View style={{ height: verticalScale(40) }} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              {searchTerm ? (
                // Message for local search when no results match the search query
                <>
                  <Text style={styles.emptyText}>
                    No matching patients found.
                  </Text>
                  <Text style={[styles.emptyText, { fontSize: 12 }]}>
                  Try adjusting your search criteria or adding a new patient if they aren't in the list. You can also search using tags.
                  </Text>
                </>
              ) : (
                // Default message when the list is empty from the API response
                <>
                  <Text style={styles.emptyText}>
                    You don't have any patients added yet.
                  </Text>
                  <Text style={[styles.emptyText, { fontSize: 12 }]}>
                    Start managing your patients by adding them here. Once
                    added, you’ll be able to track their information and stay
                    updated.
                  </Text>
                  <CustomBtn
                    onPress={() => navigate(ScreenName.ADD_PATIENT)}
                    titleStyle={{ fontSize: 10 }}
                    btnStyle={{
                      width: 150,
                      height: 30,
                      marginTop: verticalScale(10),
                    }}
                    title={"Add New Patient"}
                  />
                </>
              )}
            </View>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.primary} // Spinner color for iOS
              colors={[COLORS.primary, "#4C9CCF"]} // Spinner colors for Android
              progressBackgroundColor={COLORS.whiteColor} // Background color for Android spinner
            />
          }
        />
      </View>
    </WrapperContainer>
  );
};

export default Home;

const styles = StyleSheet.create({
  swiperContainer: {
    width,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: verticalScale(20),
  },
  paginationInActiveStyle: {
    backgroundColor: COLORS.whiteColor,
    height: 6,
    width: 6,
    borderWidth: 0.5,
    borderColor: COLORS.primary,
    marginHorizontal: 3,
  },
  paginationActiveStyle: {
    marginHorizontal: 3,
    height: 8,
    width: 8,
  },
  bannerImgStyle: {
    borderRadius: 10,
    borderColor: COLORS.blackColor,
    borderWidth: 1,
    width: width / 1.1,
    alignSelf: "center",
    height: verticalScale(140),
    marginBottom: verticalScale(8),
  },
  cardContainer: {
    ...commonStyles.shadowContainer,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "90%",
    padding: 15,
    marginVertical: verticalScale(7.5),
  },
  imgStyle: {
    height: 75,
    width: 75,
    borderRadius: 18,
    marginRight: moderateScale(15),
    // borderWidth: 1,
    // borderColor: COLORS.placeHolderTxtColor,
  },
  imgIcon: {
    height: 30,
    width: 30,
  },
  title: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: COLORS.textColor,
  },
  subTitle: {
    fontFamily: FONTS.regular,
    fontSize: 10,
    color: COLORS.placeHolderTxtColor,
  },
  countWrapper: {
    position: "absolute",
    right: 0,
    bottom: 0,
  },
  countContainer: {
    height: 20,
    width: 20,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    right: 0,
    bottom: 25,
    left: 18,
  },
  countTxt: {
    color: COLORS.textColor,
    fontFamily: FONTS.medium,
    fontSize: 10,
  },
  plusTxt: {
    fontSize: 10, // Smaller font size for '+'
    fontFamily: FONTS.medium,
    position: "absolute", // Absolute positioning
    top: 5, // Move '+' upward
    right: -8, // Adjust horizontal position if needed
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    marginTop: "35%",
    paddingHorizontal: moderateScale(30),
  },
  emptyText: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.placeHolderTxtColor,
    textAlign: "center",
  },
  textInputContainerStyle: {
    borderColor: COLORS.borderColor,
    borderWidth: 1,
    width: "100%",
    borderRadius: 40,
    height: 40.5,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 5,
  },
  textinputStyle: {
    textAlignVertical: "top",
    color: COLORS.textColor,
    fontSize: 12,
    flex: 1,
  },
  lableStyle: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.textColor,
    marginBottom: 10,
    marginLeft: 10,
  },
});
