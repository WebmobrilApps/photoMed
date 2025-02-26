import {
  View,
  Text,
  FlatList,
  Alert,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import React, { memo, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import ImageWithLoader from "./ImageWithLoader";
import {
  moderateScale,
  verticalScale,
  width,
} from "../styles/responsiveLayoute";
import FONTS from "../styles/fonts";
import COLORS from "../styles/colors";
import Tick from "../assets/SvgIcons/Tick";

const PatientImageList = memo(
  ({ data, selectedImages, toggleImageSelection, handleImagePress }) => {
    const [imageArr, setImageArr] = useState([]);
    const provider = useSelector((state) => state?.auth?.cloudType);

    console.log("patientImages", data);

    useEffect(() => {
      if (data && data.length > 0) {
        let gData = groupByDate(data);
        setImageArr(gData);
      }
    }, [data]);

    const groupByDate = (data) => {
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);
   
      // Group items by date
      const groupedData = data.reduce((acc, item) => {
        const date =
          provider == "google"
            ? item.createdTime.split("T")[0]
            : item.server_modified.split("T")[0];
        const itemDate = new Date(date);

        // Format title
        let title = date; // Default to YYYY-MM-DD
        if (itemDate.toDateString() === today.toDateString()) {
          title = "Today";
        } else if (itemDate.toDateString() === yesterday.toDateString()) {
          title = "Yesterday";
        }

        // Find existing group
        const existingGroup = acc.find((group) => group.title === title);

        if (existingGroup) {
          existingGroup.data.push(item);
        } else {
          acc.push({ title, data: [item] });
        }

        return acc;
      }, []);

      // Sort groups in descending order (latest date first)
      groupedData.sort((a, b) => {
        if (a.title === "Today") return -1;
        if (b.title === "Today") return 1;
        if (a.title === "Yesterday") return -1;
        if (b.title === "Yesterday") return 1;
        return new Date(a.title) - new Date(b.title);
      });
      //   Sort items within each group in descending order
      groupedData.forEach((group) => {
        provider == "google"
          ? group.data.sort(
              (a, b) => new Date(b.createdTime) - new Date(a.createdTime)
            )
          : group.data.sort(
              (a, b) =>
                new Date(b.server_modified) - new Date(a.server_modified)
            );
      });

      return groupedData;
    };

    return (
      <FlatList
        data={imageArr}
        keyExtractor={(item, index) => item + index}
        contentContainerStyle={{ paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item: section }) => {
          return (
            <>
              <Text
                style={{
                  color: "#000000",
                  fontWeight: "700",
                  marginVertical: 15,
                }}
              >
                {section.title}
              </Text>
              <FlatList
                numColumns={3}
                contentContainerStyle={{
                  padding: 5,
                  paddingBottom: verticalScale(70),
                }}
                showsVerticalScrollIndicator={false}
                data={section.data}
                renderItem={({ item }) => {
                  const selected = selectedImages.includes(
                    provider == "google" ? item.id : item.path_display
                  );
                  return (
                    <TouchableOpacity
                      onPress={() => handleImagePress(item)} // Adjusted to pass the item
                      onLongPress={() => toggleImageSelection(item)} // Pass item for selection
                      style={{
                        borderRadius: 22,
                        overflow: "hidden",
                        alignItems: "center",
                        margin: 5,
                      }}
                    >
                      <ImageWithLoader
                        uri={
                          provider === "google"
                            ? item.webContentLink
                            : item.publicUrl
                        }
                        // resizeMode={Fas}
                        style={{
                          height: moderateScale(95),
                          width: moderateScale(95),
                        }}
                      />
                      {selected && (
                        <View
                          style={[
                            styles.check,
                            { position: "absolute", left: 10, top: 10 },
                          ]}
                        >
                          <Tick height={10} width={10} />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                }}
              />
            </>
          );
        }}
      />
    );
  }
);
export default PatientImageList;

const styles = StyleSheet.create({
  cardContainer: {
    paddingHorizontal: moderateScale(20),
    paddingVertical: moderateScale(15),
    width: "100%",
  },
  imgStyle: {
    height: 75,
    width: 75,
    borderRadius: 75,
    marginRight: 10,
  },
  title: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.textColor,
  },
  info: {
    fontFamily: FONTS.regular,
    fontSize: 10,
    color: COLORS.textColor,
  },
  galStyle: {
    height: 25,
    width: 25,
    marginRight: moderateScale(10),
  },
  subContainer: {
    width: "100%",
    justifyContent: "space-between",
    padding: moderateScale(10),
    marginVertical: verticalScale(15),
  },
  subTitle: {
    color: COLORS.placeHolderTxtColor,
    marginTop: verticalScale(60),
    marginBottom: 10,
    fontSize: 12,
  },
  commonContainer: {
    backgroundColor: COLORS.primary,
    height: 40,
    width: 50,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: verticalScale(5),
  },
  check: {
    height: 18,
    width: 18,
    borderRadius: 5,
    borderColor: COLORS.primary,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    marginRight: moderateScale(10),
    backgroundColor: "white",
  },
  bottomButtonsContainer: {
    width: "auto",
    height: 30,
    width: width * 0.25,
    marginHorizontal: width * 0.01,
    marginTop: 9,
  },
  bottomBottonsWrapper: {
    alignItems: "center",
    alignSelf: "center",
    position: "absolute",
    bottom: 0,
    width: "100%",
    alignSelf: "center",
  },
});
