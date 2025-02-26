import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Share,
  useWindowDimensions,
} from "react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import WrapperContainer from "../components/WrapperContainer";
import { moderateScale, verticalScale } from "../styles/responsiveLayoute";
import commonStyles from "../styles/commonStyles";
import DetailsIcon from "../assets/SvgIcons/DetailsIcon";
import ImageCollege from "../assets/SvgIcons/ImageCollege";
import COLORS from "../styles/colors";
import FONTS from "../styles/fonts";
import FilterIcon from "../assets/SvgIcons/FilterIcon";
import ReframeIcon from "../assets/SvgIcons/ReframeIcon";
import ShareIcon from "../assets/SvgIcons/ShareIcon";
import DeleteIcon from "../assets/SvgIcons/DeleteIcon";
import { goBack, navigate } from "../navigators/NavigationService";
import ScreenName from "../configs/screenName";
import FaceMan from "../assets/SvgIcons/FaceMan";
import EyeIcon from "../assets/SvgIcons/EyeIcon";
import NoseIcon from "../assets/SvgIcons/NoseIcon";
import LipIcon from "../assets/SvgIcons/LipIcon";
import FullScreen from "../assets/SvgIcons/FullScreen";
import FrontNeck from "../assets/SvgIcons/Neck/FrontNeck";
import DeleteImagePopUp from "../components/DeleteImagePopUp";
import GhostIcon from "../assets/SvgIcons/GhostIcon";
import {
  useDeleteFileFromDropboxMutation,
  useDeleteImageMutation,
  useGetAllImageUrlsQuery,
} from "../redux/api/common";
import Toast from "react-native-simple-toast";
import { useDispatch, useSelector } from "react-redux";
import Loading from "../components/Loading";

import ImageWithLoader from "../components/ImageWithLoader";
import FaceDetection, { Face } from "@react-native-ml-kit/face-detection";
import RNFS from "react-native-fs";
import FaceMap from "./FaceMap";
import { ReactNativeZoomableView } from "@openspacelabs/react-native-zoomable-view";
import { scaleFrame, scalePoint } from "./scaling";
const { width } = Dimensions.get("window");
const { height } = Dimensions.get("window");
import { Image as ImageResizer } from "react-native-compressor";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import { setPatientImages } from "../redux/slices/patientSlice";
const ImageViewer = (props) => {
  const dispatch = useDispatch();
  const accessToken = useSelector((state) => state.auth.accessToken);
  const provider = useSelector((state) => state.auth.cloudType);
  const [deleteFile, { isLoading: loaded, isError, isSuccess }] =
    useDeleteFileFromDropboxMutation();

  const screen = props.route.params.ScreenName;
  const preData =
    screen == "gallery"
      ? [props.route.params.preData]
      : props.route.params.preData;

  console.log("preData", preData); //galleryData?.webContentLink

  const isConnected = useSelector((state) => state.network.isConnected);

  const [deleteImage, { isLoading }] = useDeleteImageMutation();
  const [selectedIndex, setSelectedIndex] = useState(null); // Track selected index
  const [selected, setSelected] = useState(null); // Track the selected component
  const [selectedFilter, setSelectedFilter] = useState(null); // Track the selected component
  const [selectedCollage, setSelectedCollage] = useState(null); // Track the selected component
  const [visible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [faces, setFaces] = useState([]);
  const [highlightArea, setHighlightArea] = useState(null);
  const [isZoomed, setIsZoomed] = useState(false); // Track zoom state
  const [image, setImage] = useState(null);

  const navigation = useNavigation();
  // const route = useRoute();

  const patientId = useSelector((state) => state.auth.patientId.patientId);
  const patientName = useSelector(
    (state) => state.auth.patientName.patientName
  );
  const patientImages = useSelector((state) => state?.patient?.patientImages);
  const {
    data: imageUrls = [],
    error,
    isLoading: load,
    refetch,
  } = useGetAllImageUrlsQuery({
    userId: `${patientName}${patientId}` || "", // Default to empty string if undefined
    accessToken: accessToken || "",
  });
  function returnActiveFlag() {
    return faces.length !== 1;
  }
  useFocusEffect(
    useCallback(() => {
      setSelected(null);
    }, [])
  );
 

  const toggleZoom = (area) => {
    if (!faces) return;

    const targetArea = faces[area];
    if (targetArea) {
      // Set zoom state and adjust styles for target area
      setHighlightArea(area);
      setIsZoomed(true);
    } else {
      setIsZoomed(false);
      setHighlightArea(null);
    }
  };
  const onShare = async () => {
    const imageUrl =
      provider == "google"
        ? preData[selectedIndex].webContentLink
        : preData[selectedIndex]?.publicUrl;
    try {
      const result = await Share.share({
        message: `Check out this amazing image! 📸 Here’s the link: ${imageUrl}`,
      });

      if (result.action === Share.sharedAction) {
        // Alert.alert('Shared Successfully', 'The link has been shared!');
      } else if (result.action === Share.dismissedAction) {
        // Handle dismissed action if necessary
      }
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  const handleDelete = async () => {
    const imageToDelete = preData[selectedIndex];
    console.log("image to delete", imageToDelete);
    if (!isConnected) {
      Toast.show("No internet connection. Please try again.");
      return;
    }
    try {
      setIsVisible(false);
      const imageToDelete = preData[selectedIndex];
      console.log("image to delete", imageToDelete);

      if (provider == "google") {
        await deleteImage({ fileId: imageToDelete.id, accessToken }).unwrap();

        let pImg = [...patientImages];
        let filteredData = pImg.filter((val) => val.id != imageToDelete.id);
        dispatch(setPatientImages(filteredData));
      } else {
        setLoading(true);
        const response = await deleteFile({
          filePath: imageToDelete.path_display,
          accessToken,
        });
        console.log("File deleted successfully:", response);
        await Promise.all(response);
        // const deletePromises = await deleteFileFromDropbox(imageToDelete.filePath, accessToken); // Delete the file from Dropbox
        setLoading(false);
      }
      Toast.show("Image deleted successfully");
      screen == "gallery" ? goBack() : navigate(ScreenName.HOME);
      // goBack()
    } catch (error) {
      setLoading(false);
      Toast.show("Something went wrong");
      console.error("Failed to delete image:", error);
    }
  };

  const onViewableItemsChanged = ({ viewableItems }) => {
    if (viewableItems.length > 0) {
      const currentVisibleItemIndex = viewableItems[0].index;
      setSelectedIndex(currentVisibleItemIndex); // Automatically select the image in view
    }
  };

  const CollageLayout1 = () => {
    return (
      <TouchableOpacity
        onPress={() => setSelectedCollage("1")}
        style={[
          styles.layoutContainer,
          { borderWidth: selectedCollage == "1" ? 2 : 0 },
        ]}
      >
        <FrontNeck height={15} width={11} />
        <View style={styles.verticalDevider} />
        <FrontNeck height={15} width={11} />
      </TouchableOpacity>
    );
  };

  const CollageLayout2 = () => {
    return (
      <TouchableOpacity
        onPress={() => setSelectedCollage("2")}
        style={[
          styles.layoutContainer,
          {
            flexDirection: "column",
            paddingHorizontal: 0,
            padding: 2,
            borderWidth: selectedCollage == "2" ? 2 : 0,
          },
        ]}
      >
        <FrontNeck height={15} width={11} />
        <View style={styles.horizontalDevider} />
        <FrontNeck height={15} width={11} />
      </TouchableOpacity>
    );
  };
  const CollageLayout3 = () => {
    return (
      <TouchableOpacity
        onPress={() => setSelectedCollage("3")}
        style={[
          styles.layoutContainer,
          { borderWidth: selectedCollage == "3" ? 2 : 0 },
        ]}
      >
        <FrontNeck height={15} width={11} />
        <View style={styles.verticalDevider} />
        <FrontNeck height={15} width={11} />
        <View style={styles.verticalDevider} />
        <FrontNeck height={15} width={11} />
      </TouchableOpacity>
    );
  };
  const CollageLayout4 = () => {
    return (
      <TouchableOpacity
        onPress={() => setSelectedCollage("4")}
        style={[
          styles.layoutContainer,
          {
            flexDirection: "column",
            paddingHorizontal: 0,
            borderWidth: selectedCollage == "4" ? 2 : 0,
          },
        ]}
      >
        <FrontNeck height={12} width={8} />
        <View style={styles.horizontalDevider} />
        <FrontNeck height={12} width={8} />
        <View style={styles.horizontalDevider} />
        <FrontNeck height={12} width={8} />
      </TouchableOpacity>
    );
  };

  const CollageLayout5 = () => {
    return (
      <TouchableOpacity
        onPress={() => setSelectedCollage("5")}
        style={[
          styles.layoutContainer,
          {
            paddingHorizontal: 0,
            justifyContent: "space-between",
            borderWidth: selectedCollage == "5" ? 2 : 0,
          },
        ]}
      >
        <View style={{ flex: 1, alignItems: "center" }}>
          <FrontNeck height={12} width={8} />
        </View>
        <View style={styles.verticalDevider} />
        <View style={{ width: "100%", alignItems: "center", flex: 1 }}>
          <FrontNeck height={12} width={8} />
          <View style={styles.horizontalDevider} />
          <FrontNeck height={12} width={8} />
        </View>
      </TouchableOpacity>
    );
  };

  const CollageLayout6 = () => {
    return (
      <TouchableOpacity
        onPress={() => setSelectedCollage("6")}
        style={[
          styles.layoutContainer,
          {
            paddingHorizontal: 0,
            justifyContent: "space-between",
            borderWidth: selectedCollage == "6" ? 2 : 0,
          },
        ]}
      >
        <View style={{ width: "100%", alignItems: "center", flex: 1 }}>
          <FrontNeck height={12} width={8} />
          <View style={styles.horizontalDevider} />
          <FrontNeck height={12} width={8} />
        </View>
        <View style={styles.verticalDevider} />
        <View style={{ flex: 1, alignItems: "center" }}>
          <FrontNeck height={12} width={8} />
        </View>
      </TouchableOpacity>
    );
  };

  const FilterComp = ({ onPress, Icon, isFilterSelected }) => {
    return (
      <TouchableOpacity
        onPress={onPress}
        style={[
          styles.iconContainer,
          {
            marginHorizontal: moderateScale(10),
            backgroundColor: COLORS.greyBgColor,
            borderColor: isFilterSelected ? COLORS.primary : COLORS.greyBgColor, // Conditional borderColor
            borderWidth: isFilterSelected ? 1 : 0, // Conditional borderWidth
          },
        ]}
      >
        {Icon && Icon}
      </TouchableOpacity>
    );
  };

  const CommonComp = ({
    title,
    onPress,
    Icon,
    isSelected,
    isDisabled = false,
  }) => {
    return (
      <View style={{ justifyContent: "center", alignItems: "center" }}>
        <TouchableOpacity
          onPress={onPress}
          disabled={isDisabled}
          style={[
            styles.iconContainer,
            isSelected && { backgroundColor: COLORS.primary },
          ]}
        >
          {Icon && Icon}
        </TouchableOpacity>
        <Text style={styles.titleTxt}>{title}</Text>
      </View>
    );
  };

  const handleImagePress = () => {
    setSelected("Collage");
    const item = screen == "gallery" ? preData[0] : preData[selectedIndex];
    const imageDetails =
      provider === "google"
        ? {
            id: item.id,
            mimeType: item.mimeType,
            name: item.name,
            webContentLink: item.webContentLink,
            // other relevant fields
          }
        : {
            id: item.id, // Assuming item has a 'path_display' field in the other provider
            mimeType: item.mimeType,
            name: item.name,
            publicUrl: item.publicUrl,
            // other relevant fields for the second provider
          };

    navigate(ScreenName.COLLAGE_ADD, {
      selectedImage: imageDetails,
      preData: preData,
    });
  };

  const onReframePress = () => {
    setSelected("Reframe");
    const item = screen == "gallery" ? preData[0] : preData[selectedIndex];
    const imageDetails =
      provider === "google"
        ? {
            id: item.id,
            mimeType: item.mimeType,
            name: item.name,
            webContentLink: item.webContentLink,
            // other relevant fields
          }
        : {
            id: item.id, // Assuming item has a 'path_display' field in the other provider
            mimeType: item.mimeType,
            name: item.name,
            publicUrl: item.publicUrl,
            path_display: item?.path_display,
            // other relevant fields for the second provider
          };
    navigate(ScreenName.FRAMING, { selectedImage: imageDetails });
  };

  const errorAlert = () => {
    Alert.alert(
      "No Face Detected",
      "Cannot zoom to a face part as no face was detected."
    );
  };
  const downloadImage = async (imageUrl) => {
    try {
      let new_date = new Date();
      const filePath = `${
        RNFS.DocumentDirectoryPath
      }/image${new_date.getTime()}.jpg`; // Save to app-specific directory
      const downloadResult = await RNFS.downloadFile({
        fromUrl: imageUrl,
        toFile: filePath,
      }).promise;
      console.log("Download completed:", downloadResult);
      return filePath.replace("file://", "");
    } catch (error) {
      setLoading(false);
      errorAlert();
      console.error("Error downloading image:", error);
      return null;
    }
  };

  const preprocessAndCompressImage = async (uri) => {
    if (Platform.OS === "ios") {
      try {
        let compressedImageUri = await ImageResizer.compress(uri, {
          compressionMethod: "auto",
          maxWidth: 1080,
          quality: 0.7,
        });
        return compressedImageUri;
      } catch (error) {
        console.error("Error during compression:", error);
        return null;
      }
    } else {
      return uri;
    }
  };

  const scaledFrame = scaleFrame(image?.width, image?.height, width);
  const scaledPoint = scalePoint(image?.width, image?.height, width);

  const handleChoose = async () => {
    const imageUri =
      provider == "google"
        ? preData[selectedIndex].webContentLink
        : preData[selectedIndex].publicUrl;
    setLoading(true);
    let localFilePath = await downloadImage(imageUri);
    if (!localFilePath) {
      setLoading(false);
      errorAlert();
      return;
    }

    let imageData = {};
    const compressedImage = await preprocessAndCompressImage(
      `file://${localFilePath}`
    );
    if (!compressedImage) {
      setLoading(false);
      errorAlert();
      return;
    }
    localFilePath = `file://${localFilePath}`;
    console.log("localFilePath", localFilePath);
    Image.getSize(
      compressedImage,
      (width, height) => {
        imageData.height = height;
        imageData.width = width;
        imageData.path = localFilePath;
        console.log("sucess getting image size:", width, height);
      },
      (error) => {
        setLoading(false);
        errorAlert();
        console.log("Error getting image size:", error);
      }
    );

    FaceDetection.detect(compressedImage, {
      landmarkMode: "all",
      contourMode: "all",
    })
      .then(async (result) => {
        console.log("facesssss success 118", result);
        setLoading(false);
        if (result.length <= 0) {
          errorAlert();
          return false;
        }
        navigate("ImageZoomML", { imageData: imageData, faces: result });
      })
      .catch((error) => {
        setLoading(false);
        console.log("facesssss error 472", error);
        errorAlert();
      });
  };

  const handleButtonPress = (filter) => {
    setSelectedFilter(filter);
    const coordinates = getCoordinatesForFilter(filter);
    console.log(`Selected coordinates for ${filter}:`, coordinates); // Log the coordinates for debugging
    setHighlightArea(coordinates); // Store the coordinates of the selected area
  };

  const getCoordinatesForFilter = (filter) => {
    if (!faces || faces.length === 0) return;

    const landmarks = faces[0].landmarks;
    const faceFrame = faces[0].frame; // Get the bounding box for the face

    switch (filter) {
      case "EyeIcon":
        // Return the bounding box for the eyes (you can calculate based on the coordinates)
        return {
          leftEye: landmarks.leftEye,
          rightEye: landmarks.rightEye,
        };
      case "NoseIcon":
        // Return the coordinates for the nose
        return landmarks.noseBase;
      case "LipIcon":
        // Return the coordinates for the mouth
        return landmarks.mouthBottom;
      case "FaceMan":
        // Return the bounding box for the whole face
        return faceFrame; // The face's bounding box will highlight the whole face
      case "FullScreen":
        // For FullScreen, return null or do any specific logic if needed.
        return null;
      default:
        return null;
    }
  };

  let zoomableViewRef = useRef(null);

  const zoomToPart = (part) => {
    if (faces.length <= 0) {
      Alert.alert(
        "No Face Detected",
        "Cannot zoom to a face part as no face was detected."
      );
      return;
    }

    const face = faces[0]; // Assuming the first detected face
    const { landmarks, frame } = face;
    const { leftEye, rightEye, mouthBottom, noseBase } = landmarks;

    let target = { x: 0, y: 0 };
    let zoomLevel = 1;

    switch (part) {
      case "mouth": {
        target = scaledPoint(mouthBottom.position);
        target = { x: target.x, y: target.y + 90 };
        zoomLevel = 3.5;
        break;
      }
      case "nose": {
        target = scaledPoint(noseBase.position);
        zoomLevel = 4;
        break;
      }
      case "eyes": {
        target = {
          x: (leftEye.position.x + rightEye.position.x) / 2,
          y: (leftEye.position.y + rightEye.position.y) / 2,
        };
        target = scaledPoint(target);
        zoomLevel = 3;
        break;
      }
      default:
        zoomLevel = 1;
        zoomableViewRef?.current?.resetTo();
        return;
        break;
    }

    if (zoomLevel > 1) {
      zoomableViewRef?.current?.zoomTo(zoomLevel, { x: target.x, y: target.y });
      setTimeout(() => {
        zoomableViewRef?.current?.moveTo(target.x, target.y);
      }, 300);
    } else {
      zoomableViewRef?.current?.zoomTo(1);
    }
  };
  const renderItem = ({ item, index }) => {
    const imageUri =
      provider == "google" ? item.webContentLink : item.publicUrl;

    return (
      <View style={{ height: isZoomed ? 600 : 400 }}>
        <TouchableOpacity
          disabled
          onPress={() => {
            toggleZoom();
            console.log("iszoomed", isZoomed);
          }}
        >
          <ImageWithLoader
            style={[
              styles.imgStyle,
              {
                height: isZoomed ? 600 : 400, // Dynamic height
                width: isZoomed ? width : width, // Dynamic width
              },
            ]}
            uri={imageUri}
            resizeMode={"contain"}
          />
        </TouchableOpacity>
      </View>
    );
  };
  return (
    <WrapperContainer>
      <Loading visible={isLoading || loading} />
      <DeleteImagePopUp
        title={"Delete 1 selected photo"}
        onPressCancel={() => setIsVisible(false)}
        onPressDelete={handleDelete}
        visible={visible}
      />
      <View>
        <FlatList
          horizontal
          data={preData}
          renderItem={renderItem}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={{
            itemVisiblePercentThreshold: 50,
          }}
        />
      </View>
      <View
        style={[
          commonStyles.flexView,
          { justifyContent: "space-between", padding: moderateScale(20) },
        ]}
      >
        <CommonComp
          onPress={() => {
            setSelected("Details");
            navigate(ScreenName.IMAGE_DETAILS, {
              images:
                screen == "gallery" ? [preData[0]] : [preData[selectedIndex]],
            }); // Pass selected image
          }}
          isSelected={selected === "Details"}
          title={"Details"}
          Icon={
            <DetailsIcon
              tintColor={selected == "Details" && COLORS.whiteColor}
            />
          }
        />
        <CommonComp
          onPress={() => handleImagePress()}
          isSelected={selected === "Collage"}
          title={"Collage"}
          Icon={
            <ImageCollege
              tintColor={selected == "Collage" ? COLORS.whiteColor : "#32327C"}
            />
          }
        />
        <CommonComp
          // isDisabled={returnActiveFlag()}
          onPress={() => handleChoose()}
          // onPress={() => {
          //   const imageUri = provider == "google" ? preData[selectedIndex].webContentLink : preData[selectedIndex].publicUrl;
          //   navigate('ImageZoomML', { imageUri })
          // }}
          isSelected={selected === "Filter"}
          title={"Filter"}
          Icon={
            <FilterIcon tintColor={selected == "Filter" && COLORS.whiteColor} />
          }
        />
        <CommonComp
          onPress={onReframePress}
          isSelected={selected === "Reframe"}
          title={"Reframe"}
          Icon={
            <ReframeIcon
              tintColor={selected == "Reframe" && COLORS.whiteColor}
            />
          }
        />
        <CommonComp
          onPress={() => onShare()}
          isSelected={selected === "Share"}
          title={"Share"}
          Icon={
            <ShareIcon tintColor={selected == "Share" && COLORS.whiteColor} />
          }
        />
        <CommonComp
          onPress={() => setIsVisible(true)}
          isSelected={selected === "Delete"}
          title={"Delete"}
          Icon={
            <DeleteIcon tintColor={selected == "Delete" && COLORS.whiteColor} />
          }
        />
        <CommonComp
          onPress={() => {
            let img = screen == "gallery" ? [preData[0]] : [preData[selectedIndex]];
            console.log("img---", img);
            console.log("selectedIndex---", selectedIndex);
            navigation.navigate(ScreenName.CAMERA_GRID, {
              preScreen: "Image_View",
              selectedImgItem: img[0],
              imageData: provider == "google" ? patientImages : imageUrls,
              provider,
            });
           
          }}
          isSelected={selected === "Delete"}
          title={"Ghost"}
          Icon={
            <GhostIcon height={25} width={25} tintColor={selected == "Delete" && COLORS.whiteColor} />
          }
        />
      </View>
      {selected == "Filter" && (
        <View style={[commonStyles.flexView, { justifyContent: "center" }]}>
          <FilterComp
            onPress={() => zoomToPart("FaceMan")}
            Icon={<FaceMan />}
            isFilterSelected={selectedFilter === "FaceMan"} // Pass the condition here
          />
          <FilterComp
            onPress={() => zoomToPart("eyes")}
            Icon={<EyeIcon />}
            isFilterSelected={selectedFilter === "EyeIcon"} // Pass the condition here
          />
          <FilterComp
            onPress={() => zoomToPart("nose")}
            Icon={<NoseIcon />}
            isFilterSelected={selectedFilter === "NoseIcon"} // Pass the condition here
          />
          <FilterComp
            onPress={() => zoomToPart("mouth")}
            Icon={<LipIcon />}
            isFilterSelected={selectedFilter === "LipIcon"} // Pass the condition here
          />
          <FilterComp
            onPress={() => zoomToPart("reset")}
            Icon={<FullScreen />}
            isFilterSelected={selectedFilter === "FullScreen"} // Pass the condition here
          />
        </View>
      )}

      {selected == "College" && (
        <View
          style={[
            commonStyles.flexView,
            {
              justifyContent: "space-between",
              paddingHorizontal: moderateScale(17),
            },
          ]}
        >
          <CollageLayout1 />
          <CollageLayout2 />
          <CollageLayout3 />
          <CollageLayout4 />
          <CollageLayout5 />
          <CollageLayout6 />
        </View>
      )}
    </WrapperContainer>
  );
};

export default ImageViewer;

const styles = StyleSheet.create({
  imgStyle: {
    marginVertical: verticalScale(20),
    // height: "100%",
    // width: width,
    marginRight: moderateScale(5),
  },
  iconContainer: {
    height: 42,
    width: 42,
    borderRadius: 10,
    borderColor: COLORS.primary,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: verticalScale(5),
  },
  titleTxt: {
    fontFamily: FONTS.medium,
    fontSize: 10,
    color: COLORS.primary,
  },
  layoutContainer: {
    width: 42, // Adjust based on requirement
    height: 42,
    borderColor: "#4F4793", // outer border color
    borderRadius: 10,
    backgroundColor: COLORS.greyBgColor,
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
    paddingHorizontal: 3,
    marginHorizontal: moderateScale(5),
  },
  verticalDevider: {
    width: 0.8,
    height: "100%",
    backgroundColor: COLORS.blackColor,
  },
  horizontalDevider: {
    width: "100%",
    height: 1,
    backgroundColor: COLORS.blackColor,
  },
  highlightBox: {
    position: "absolute",
    borderWidth: 2,
    borderColor: "red",
    backgroundColor: "rgba(255, 0, 0, 0.3)",
    borderRadius: 10,
  },
});
