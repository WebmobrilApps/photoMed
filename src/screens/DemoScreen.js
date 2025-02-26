import React, { useEffect, useRef, useState } from 'react';
import { Alert, Image, StyleSheet, TouchableOpacity, useWindowDimensions, View,Platform } from 'react-native';
import FaceDetection from '@react-native-ml-kit/face-detection';
import FaceMap from './FaceMap';
import { scaleFrame, scalePoint } from './scaling';
import { ReactNativeZoomableView } from '@openspacelabs/react-native-zoomable-view';
import Animated from 'react-native-reanimated';
import RNFS from "react-native-fs";
import { moderateScale, verticalScale } from '../styles/responsiveLayoute';
import COLORS from '../styles/colors';
import FaceMan from "../assets/SvgIcons/FaceMan";
import EyeIcon from "../assets/SvgIcons/EyeIcon";
import NoseIcon from "../assets/SvgIcons/NoseIcon";
import LipIcon from "../assets/SvgIcons/LipIcon";
import FullScreen from "../assets/SvgIcons/FullScreen";
import { Image as ImageResizer } from 'react-native-compressor';
import Loading from '../components/Loading';


const ImageZoomML = (props) => {
  const [image, setImage] = useState(null);
  const [faces, setFaces] = useState([]);
  const [showFrame, setShowFrame] = useState(true);
  const [showLandmarks, setShowLandmarks] = useState(false);
  const [showContours, setShowContours] = useState(false);
  const [filter, setSelectedFilter] = useState('reset');
  const [isLoading, setIsLoading] = useState(false);

  const errorAlert=()=>{
    Alert.alert('No Face Detected', 'Cannot zoom to a face part as no face was detected.');
  }
  const downloadImage = async (imageUrl) => {
    try {
      let new_date = new Date()
      const filePath = `${RNFS.DocumentDirectoryPath}/image${new_date.getTime()}.jpg`; // Save to app-specific directory
      const downloadResult = await RNFS.downloadFile({
        fromUrl: imageUrl,
        toFile: filePath,
      }).promise;
      console.log("Download completed:", downloadResult);
      return filePath.replace("file://", "");
    } catch (error) {
      setIsLoading(false)
      errorAlert()
      console.error("Error downloading image:", error);
      return null;
    }
  };

  

  const preprocessAndCompressImage = async (uri) => {
    if(Platform.OS==='ios'){
      try {
        let compressedImageUri = await ImageResizer.compress(uri, {
          compressionMethod: 'auto',
          maxWidth: 1080,
          quality: 0.8,
        });
        return compressedImageUri;
      } catch (error) {
        console.error("Error during compression:", error);
        return null
      }
    }else{
      return uri
    }
  };

   

  useEffect(() => {
    console.log('props.route.params.imageUri', props.route.params.imageUri);
    const processImage = async () => {
      setIsLoading(true)
      const localFilePath = await downloadImage(props.route.params.imageUri);
      if (!localFilePath){
        setIsLoading(false)
        return;
      } 

      let imageData = {}
      const compressedImage = await preprocessAndCompressImage(`file://${localFilePath}`);
      if (!compressedImage){
        setIsLoading(false)
        return;
      } 

      Image.getSize(compressedImage, (width, height) => {
        imageData.height = height;
        imageData.width = width;
        imageData.path = compressedImage;
        setImage(imageData)
        console.log("sucess getting image size:", width, height);
      }, (error) => {
        setIsLoading(false)
        errorAlert();
        console.log("Error getting image size:", error);
      });

      FaceDetection.detect(compressedImage, {
        landmarkMode: "all",
        contourMode: "all",
      }).then(async (result) => {
        console.log("facesssss success 118", result);
        if (result.length <= 0) {
          setIsLoading(false)
          errorAlert()
          return;
        }
        setIsLoading(false)
        setFaces(result);
        setImage(imageData)
      }).catch((error) => {
        setIsLoading(false)
        console.log("facesssss error 122", error);
        errorAlert()
      });
    };
    processImage();
  }, [props.route.params.imageUri]);

  const screen = useWindowDimensions();
  const scaledFrame = scaleFrame(image?.width, image?.height, screen.width);
  const scaledPoint = scalePoint(image?.width, image?.height, screen.width);

  let zoomableViewRef = useRef(null)
  const zoomToPart = (part) => {
    if(filter==part) return;
    if (faces.length <= 0) {
      Alert.alert('No Face Detected', 'Cannot zoom to a face part as no face was detected.');
      return;
    }

    const face = faces[0];
    console.log('facess----',JSON.stringify(face));
    
    const { landmarks, frame } = face;
    const { leftEye, rightEye, mouthBottom, noseBase } = landmarks;
    const frameTarget = scaledFrame(frame)
    console.log('frameTarget',frameTarget);
    let target = { x: 0, y: 0 };
    let zoomLevel = 1;
    let yAxis = 150
    let xAxis = 0;
    switch (part) {
      case 'mouth': {
        target = scaledPoint(mouthBottom.position);
        target = { x: target.x, y: target.y }
        zoomLevel = 3.8;
        yAxis=250
        break;
      }
      case 'nose': {
        target = scaledPoint(noseBase.position);
        zoomLevel = 4.8
        yAxis=120
        break;
      }
      case 'eyes': {
        target = {
          x: (leftEye.position.x + rightEye.position.x) / 2,
          y: (leftEye.position.y + rightEye.position.y) / 2,
        };
        target = scaledPoint(target);
        zoomLevel = 2.3;
        yAxis=150
        break;
      }
      case 'FaceMan': {
        target = {
          x: frameTarget?.left+(frameTarget?.width)/2,
          y: frameTarget?.top+(frameTarget?.height)/2,
        };
        target = scaledPoint(target);
        zoomLevel = 2;
        yAxis=350
        xAxis=120
        break;
      }
      default:
        zoomLevel = 1;
        zoomableViewRef?.current?.resetTo();
        setSelectedFilter(part)
        return
        break;
    }
    setSelectedFilter(part)
    if (zoomLevel > 1) {
      zoomableViewRef?.current?.zoomTo(zoomLevel, { x: target.x+xAxis, y: target.y + yAxis });
      setTimeout(() => {
        zoomableViewRef?.current?.moveTo(target.x+xAxis, target.y + yAxis);
      }, 300);
    } else {
      setSelectedFilter(part)
      zoomableViewRef?.current?.zoomTo(1);
    }
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
            borderColor: isFilterSelected ? COLORS.primary : COLORS.greyBgColor,
            borderWidth: isFilterSelected ? 3 : 0,
          },
        ]}
      >
        {Icon && Icon}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Loading visible={isLoading} />
      {image && (
        <ReactNativeZoomableView
          ref={zoomableViewRef}
          maxZoom={6}
          minZoom={1}
          style={{
            backgroundColor: '#000000',
          }}
          bindToBorders={true}
        >
          <Animated.View style={[styles.imageContainer]}>
            <Image source={{ uri: image.path }} style={styles.image} />
            {/* {faces.map((face, index) => (
              <FaceMap
                key={index}
                face={face}
                width={image.width}
                height={image.height}
                showFrame={showFrame}
                showContours={showContours}
                showLandmarks={showLandmarks}
              />
            ))} */}
          </Animated.View>
        </ReactNativeZoomableView>
      )}
      <View style={{ position: 'absolute', bottom: 10 }}>
        <View style={{ flexDirection: 'row' }}>
          <FilterComp
            onPress={() => zoomToPart("FaceMan")}
            Icon={<FaceMan />}
            isFilterSelected={filter=='FaceMan'} 
          />
          <FilterComp
            onPress={() => zoomToPart("eyes")}
            Icon={<EyeIcon />}
            isFilterSelected={filter=='eyes'}
          />
          <FilterComp
            onPress={() => zoomToPart("nose")}
            Icon={<NoseIcon />}
            isFilterSelected={filter=='nose'}
          />
          <FilterComp
            onPress={() => zoomToPart("mouth")}
            Icon={<LipIcon />}
            isFilterSelected={filter=='mouth'}
          />
          <FilterComp
            onPress={() => zoomToPart("reset")}
            Icon={<FullScreen />}
            isFilterSelected={filter=='reset'}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    marginTop: 15,
    marginBottom: 20,
  },
  image: {
    aspectRatio: 1,
    width: '100%',
    resizeMode: 'cover',
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
});

export default ImageZoomML;

