import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSelector } from "react-redux";
import DeviceInfo from "react-native-device-info";
import Toast from "react-native-simple-toast";
import FastImage from "react-native-fast-image";
import WrapperContainer from "../components/WrapperContainer";
import CustomBtn from "../components/CustomBtn";
import Loading from "../components/Loading";
import {
  moderateScale,
  verticalScale,
  width,
} from "../styles/responsiveLayoute";
import COLORS from "../styles/colors";
import FONTS from "../styles/fonts";
import commonStyles from "../styles/commonStyles";
import TimeIcon from "../assets/SvgIcons/TimeIcon";
import GallIcon from "../assets/SvgIcons/GallIcon";
import DeviceIcon from "../assets/SvgIcons/DeviceIcon";
import {
  checkAndRefreshGoogleAccessToken,
  checkIfFileExistsInFolder,
  copyFileToCategoryFolder,
  copyImageToCategoryWithCheck,
  createOrGetCategoryFolder,
  generateUniqueKey,
  listFolderImages,
} from "../configs/api";
import {
  useDeleteTagSubTagMutation,
  useGetFolderIdQuery,
  useGetMixedCategoriesQuery,
  usePostDrCategorySubcatMutation,
  usePostPatientTagsMutation,
} from "../redux/api/common";
import { navigate } from "../navigators/NavigationService";
import ScreenName from "../configs/screenName";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import CrossIcon from "../assets/SvgIcons/CrossIcon";
import AddTagModal from "../components/AddTagModal";
import DeleteImagePopUp from "../components/DeleteImagePopUp";
import uuid from "react-native-uuid";
const ImageDetails = (props) => {
  const { images } = props.route.params;

  const isMultiple = Array.isArray(images) && images.length > 1;

  const [deviceName, setDeviceName] = useState("");
  const [loading, setLoading] = useState(false);
  const patientId = useSelector((state) => state?.auth?.patientId?.patientId);
  const patientName = useSelector(
    (state) => state?.auth?.patientName?.patientName
  );

  const pData = useSelector((state) => state?.patient?.currentActivePatient);
  const provider = useSelector((state) => state?.auth?.cloudType);
  const token = useSelector((state) => state.auth?.user);
  const accessToken = useSelector((state) => state?.auth?.accessToken);
  const [dropdownData, setDropDownData] = useState([]);
  const [subCatData, setSubCatData] = useState([]);
  const [addCatModal, setAddCatModal] = useState(false);
  const [newtag, setnewtag] = useState("");
  const [addSubCatModal, setAddSubCatModal] = useState(false);
  const [newsubtag, setnewsubtag] = useState("");
  const [newTagError, setNewTagError] = useState("");

  const [itemForDelete, setItemForDelete] = useState(null);
  const [itemTypeForDelete, setItemTypeForDelete] = useState(null);
  const [isVisibleDeletePopup, setIsVisibleDeletePopup] = useState(false);

  const { data: folderId } = useGetFolderIdQuery({
    folderName: `${patientName + patientId}`,
    accessToken,
  });
  const [postCatSubcat, { isLoading: catSubPostLoading }] =
    usePostDrCategorySubcatMutation();
  const {
    data: mixedCatData,
    error: mixedCatError,
    isLoading: mixedCatLoading,
    refetch: catSubcatRefetch,
  } = useGetMixedCategoriesQuery({ token });
  const [deletTagSubtag, { isLoading: deletTagLoading }] =
    useDeleteTagSubTagMutation();

  const [postPatientTags, { isLoading: postPatientTagsLoading }] =
    usePostPatientTagsMutation();

  const [selectedCat, setSelectedCat] = useState("");
  const [selectedSubcat, setSelectedSubcat] = useState("");

  useEffect(() => {
    console.log(
      "mixedCatData?.ResponseBody",
      JSON.stringify(mixedCatData?.ResponseBody)
    );
    if (mixedCatData?.ResponseBody) {
      let imageCategories = mixedCatData?.ResponseBody?.imageCategories || [];
      let categoriesDr = mixedCatData?.ResponseBody?.categories || [];

      let imageSubCategories =
        mixedCatData?.ResponseBody?.commenCategories || [];
      let subcategoriesDr = mixedCatData?.ResponseBody?.subcategories || [];

      imageCategories = imageCategories.map((item) => ({
        ...item,
        action: "not_delete",
      }));
      imageSubCategories = imageSubCategories.map((item) => ({
        ...item,
        action: "not_delete",
      }));

      let commonCat = [...imageCategories, ...categoriesDr];
      let commonsubCat = [...imageSubCategories, ...subcategoriesDr];

      let formattedSubcatData =
        commonsubCat.length > 0
          ? commonsubCat.map((item) => ({
              ...item,
              name: item.categoryname || item.subcategoryname,
            }))
          : [];
      let formatedCatData =
        commonCat.length > 0
          ? commonCat.map((item) => ({
              ...item,
              name: item.categoryname,
            }))
          : [];

      formatedCatData.push({ name: "add new", _id: 0 });
      formattedSubcatData.push({ name: "add new", _id: 0 });

      setSubCatData(formattedSubcatData);
      setDropDownData(formatedCatData);
      console.log("commonsubCat", JSON.stringify(commonsubCat));
      console.log("commonCat", JSON.stringify(commonCat));
    } else {
      setSubCatData([{ name: "add new", _id: 0 }]);
      setDropDownData([{ name: "add new", _id: 0 }]);
    }
  }, [mixedCatData]);

  useEffect(() => {
    catSubcatRefetch();
    initializeDeviceAndPatientId();
  }, []);

  const initializeDeviceAndPatientId = async () => {
    const device = await DeviceInfo.getDeviceName();
    setDeviceName(device);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const hours = date.getHours() % 12 || 12;
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = date.getHours() >= 12 ? "PM" : "AM";
    return `${hours}:${minutes} ${ampm}`;
  };

  

  console.log("tokennnnn", token);

  const addtaginpatientAcc = async (cat, subtag) => {
    try {
      let data = { tags: [cat, subtag] };

      let res = await postPatientTags({
        token,
        tags: data,
        patientId: pData?._id,
      });
      console.log("added to add tag", res);
      if (res?.data?.ResponseCode === 200) {
      } else {
        console.log("eeror to add tag", res);
      }
    } catch (error) {
      Toast.show("Unable to delete.");
    }
  };

  const handleUploadImageCategory = async () => {
    console.log("selectedCat", selectedCat);

    if (selectedCat.trim().length <= 0) {
      Toast.show("Please select tag");
      return false;
    }
    if (selectedSubcat.trim().length <= 0) {
      Toast.show("Please select sub tag");
      return false;
    }

    let formatedTag = selectedCat.trim().toLowerCase();
    let formatedSubtag = selectedSubcat.trim().toLowerCase();
    setLoading(true);

    // Check if the image exists in the folder
    const checkImageExists = async () => {
      try {
        return await checkIfFileExistsInFolder(
          folderId,
          images.id,
          accessToken
        );
      } catch (error) {
        Toast.show("Please try again later, Something went wrong");
        return true;
      }
    };

    const imageExists = await checkImageExists();
    if (imageExists) {
      setLoading(false);
      Toast.show("Please try again later, Something went wrong");
      return false;
    }

    // Function to upload image to each category
    const uploadToCategory = async (
      catName,
      imageID,
      categoryFolderId,
      count
    ) => {
      const imageExistsInCategory = await checkIfFileExistsInFolder(
        imageID,
        categoryFolderId,
        accessToken
      );

      let uniqueKey = generateUniqueKey();
      let image_new_name = `${patientName.trim()}_${formatedTag}_${formatedSubtag}_${uniqueKey}_${count}`;

      if (!imageExistsInCategory) {
        const copiedData = await copyFileToCategoryFolder(
          imageID,
          categoryFolderId,
          accessToken,
          catName,
          image_new_name
        );
        if (!copiedData) {
          throw new Error("Failed to copy image to category folder.");
        }
      }
    };

    try {
      await checkAndRefreshGoogleAccessToken(accessToken);
      const categoryFolderId = await createOrGetCategoryFolder(
        folderId,
        `${patientName.trim().toLowerCase()}_${formatedTag}`,
        accessToken
      );
      const subTagFolderId = await createOrGetCategoryFolder(
        categoryFolderId,
        formatedSubtag,
        accessToken
      );
      const uploadedImages = await listFolderImages(
        subTagFolderId,
        accessToken
      );
      let totalPImg =
        uploadedImages && uploadedImages.length > 0 ? uploadedImages.length : 0;
      let count = totalPImg + 1;
      for (const imageItem of images) {
        await uploadToCategory(
          formatedSubtag,
          imageItem.id,
          subTagFolderId,
          count
        );
        count++;
      }
      await addtaginpatientAcc(formatedTag, formatedSubtag);
      Toast.show(`Image added for selected category`);
      navigate(ScreenName.HOME);
    } catch (error) {
      Toast.show("Please try again later, Something went wrong");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyImageToDropboxCategory = async () => {
    if (selectedCat.trim().length <= 0) {
      Toast.show("Please select tag");
      return false;
    }
    if (selectedSubcat.trim().length <= 0) {
      Toast.show("Please select sub tag");
      return false;
    }
    let formatedTag = selectedCat.trim().toLowerCase();
    let formatedSubtag = selectedSubcat.trim().toLowerCase();
    setLoading(true);

    for (const imageItem of images) {
      const imageDetails = {
        filePath: imageItem.path_display,
        name: imageItem.name,
      };
      try {
        await copyImageToCategoryWithCheck({
          imageDetails,
          categoryName: `${patientName.trim()}_${formatedTag}`,
          accessToken,
          patientId: patientName + patientId,
          image_name: `${patientName.trim()}_${formatedSubtag}`,
          subCat: formatedSubtag,
          cat: formatedTag,
          patientName: patientName,
        });
        await addtaginpatientAcc(formatedTag, formatedSubtag);
      } catch (error) {
        console.log("error219", error);

        setLoading(false);
        Toast.show("Please try again later, Something went wrong");
        return false;
      }
    }
    Toast.show(`Image added for selected category`);
    navigate(ScreenName.HOME);
    setLoading(false);
  };

  let addNewTag = async (type) => {
    let tagValue = type == "tag" ? newtag : newsubtag;
    if (tagValue.trim() === "") {
      type == "tag"
        ? setNewTagError(`Please Enter Tag`)
        : setNewTagError(`Please Enter Sub Tag`);
      return false;
    }
    if (tagValue.trim().length <= 2) {
      type == "tag"
        ? setNewTagError(`Tag must be at least 3 characters long`)
        : setNewTagError(`Sub Tag must be at least 3 characters long`);
      return false;
    }

    let dataForCompare = type == "tag" ? [...dropdownData] : [...subCatData];

    const isDuplicate = dataForCompare.some(
      (item) => item.name.trim().toLowerCase() === tagValue.trim().toLowerCase()
    );
    if (isDuplicate) {
      setNewTagError(
        `${type == "tag" ? "Tag" : "Sub Tag"} with ${tagValue} already exists.`
      );
      return false;
    }

    let catData = {
      categoryname: tagValue,
      type: "category",
    };
    let subcatData = {
      subcategoryname: tagValue,
      type: "subcategory",
    };
    let data = type == "tag" ? catData : subcatData;

    try {
      let res = await postCatSubcat({ token, catData: data });
      console.log("resres", res);
      if (res?.data?.ResponseCode === 200) {
        dataForCompare.unshift({ name: tagValue, ...res?.data?.ResponseBody });
        type == "tag"
          ? setDropDownData(dataForCompare)
          : setSubCatData(dataForCompare);
        type == "tag" ? setSelectedCat(tagValue) : setSelectedSubcat(tagValue);
        setnewtag("");
        setnewsubtag("");
        setAddCatModal(false);
        setAddSubCatModal(false);
        setNewTagError("");
      }
      console.log("resresres--", res);
    } catch (error) {
      Toast.show("Unable to delete.");
      console.log("errorerror--", error);
      throw new Error("Failed to copy image to category folder.", error);
    }
  };

  const clickOnDeleteButton = (item, type) => {
    setItemForDelete(item);
    setItemTypeForDelete(type);
    setIsVisibleDeletePopup(true);
  };

  let handleDelete = async () => {
    if (!itemForDelete) return false;
    if (!itemTypeForDelete) return false;

    let dataForUpdate =
      itemTypeForDelete == "tag" ? [...dropdownData] : [...subCatData];
    let idForDelete = itemForDelete?._id;
    setIsVisibleDeletePopup(false);

    try {
      let res = await deletTagSubtag({ token, id: idForDelete });
      console.log("resres", res);
      if (res?.data?.ResponseCode === 200) {
        let remainData = dataForUpdate?.filter(
          (item) => idForDelete != item._id
        );
        itemTypeForDelete == "tag"
          ? setDropDownData(remainData)
          : setSubCatData(remainData);
        if (itemForDelete?.name == selectedCat) setSelectedCat("");
        if (itemForDelete?.name == selectedSubcat) setSelectedSubcat("");

        setItemForDelete(null);
        setItemTypeForDelete(null);
        Toast.show("Deleted successfully.");
      }
    } catch (error) {
      Toast.show("Unable to delete.");
    }
  };

  return (
    <WrapperContainer wrapperStyle={{ paddingHorizontal: width * 0.04 }}>
      <Loading visible={loading || mixedCatLoading || deletTagLoading} />
      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        extraScrollHeight={10}
        style={{ paddingBottom: 10 }}
      >
        {isMultiple ? (
          <View style={styles.multipleImageContainer}>
            {images?.map((item) => {
              return (
                <FastImage
                  style={[
                    styles.multipleImageView,
                    {
                      height: (width - width * 0.13) / images.length,
                      width: (width - width * 0.13) / images.length,
                    },
                  ]}
                  source={{
                    uri:
                      provider === "google"
                        ? item?.webContentLink
                        : item?.publicUrl,
                  }}
                />
              );
            })}
          </View>
        ) : (
          <FastImage
            style={styles.imgStyle}
            source={{
              uri:
                provider === "google"
                  ? images[0]?.webContentLink
                  : images[0]?.publicUrl,
            }}
          />
        )}

        <Text style={styles.lableStyle}>{"Select a tag"}</Text>
        {dropdownData && dropdownData.length > 0 && (
          <View style={{ flexWrap: "wrap", flexDirection: "row" }}>
            {dropdownData.map((item, index) => {
              if (!item?._id) {
                return (
                  <TouchableOpacity
                    key={item.name + index + 90}
                    onPress={() => {
                      setAddCatModal(true);
                    }}
                    activeOpacity={0.5}
                    style={styles.selectedListItem}
                  >
                    <Image
                      style={{ height: 20, width: 20 }}
                      source={require("../assets/images/plus.png")}
                    />
                  </TouchableOpacity>
                );
              }
              return (
                <TouchableOpacity
                  key={item.name + index}
                  onPress={() => {
                    setSelectedCat(item.name);
                  }}
                  activeOpacity={0.5}
                  style={[
                    selectedCat == item.name
                      ? styles.selectedListItem
                      : styles.unSelectedListItem,
                    { paddingHorizontal: 5 },
                  ]}
                >
                  <Text
                    style={
                      selectedCat == item.name
                        ? styles.selectedText
                        : styles.unSelectedText
                    }
                  >
                    {item.name}
                  </Text>
                  {!item?.action && (
                    <TouchableOpacity
                      onPress={() => {
                        clickOnDeleteButton(item, "tag");
                      }}
                      style={{ marginLeft: 5 }}
                    >
                      <Image
                        resizeMode="contain"
                        style={{
                          height: 15,
                          width: 15,
                          transform: [{ rotate: "45deg" }],
                        }}
                        source={
                          selectedCat == item.name
                            ? require("../assets/images/plus.png")
                            : require("../assets/images/plus_blue.png")
                        }
                      />
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <Text style={[styles.lableStyle, { marginTop: 20 }]}>
          {"Select a sub tag"}
        </Text>
        {subCatData && subCatData.length > 0 && (
          <View style={{ flexWrap: "wrap", flexDirection: "row" }}>
            {subCatData.map((item, index) => {
              if (!item?._id) {
                return (
                  <TouchableOpacity
                    key={item.name + index}
                    onPress={() => {
                      setAddSubCatModal(true);
                    }}
                    activeOpacity={0.5}
                    style={styles.selectedListItem}
                  >
                    <Image
                      style={{ height: 20, width: 20 }}
                      source={require("../assets/images/plus.png")}
                    />
                  </TouchableOpacity>
                );
              }
              return (
                <TouchableOpacity
                  key={item.name + index + 180}
                  onPress={() => {
                    setSelectedSubcat(item.name);
                  }}
                  activeOpacity={0.5}
                  style={
                    selectedSubcat == item.name
                      ? styles.selectedListItem
                      : styles.unSelectedListItem
                  }
                >
                  <Text
                    style={
                      selectedSubcat == item.name
                        ? styles.selectedText
                        : styles.unSelectedText
                    }
                  >
                    {item.name}
                  </Text>
                  {!item?.action && (
                    <TouchableOpacity
                      onPress={() => {
                        clickOnDeleteButton(item, "sub tag");
                      }}
                      style={{ marginLeft: 5 }}
                    >
                      <Image
                        resizeMode="contain"
                        style={{
                          height: 15,
                          width: 15,
                          transform: [{ rotate: "45deg" }],
                        }}
                        source={
                          selectedSubcat == item.name
                            ? require("../assets/images/plus.png")
                            : require("../assets/images/plus_blue.png")
                        }
                      />
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {!isMultiple && (
          <View style={{ marginTop: 20 }}>
            {/* <DetailsRow
              icon={<TimeIcon />}
              text={
                provider == "google"
                  ? `${formatDate(
                      images[0]?.properties?.uploadDate
                    )} ${formatTime(images[0]?.properties?.uploadDate)}`
                  : `${formatDate(images[0]?.client_modified)} ${formatTime(
                      images[0]?.client_modified
                    )}`
              }
            /> */}
            <DetailsRow
              icon={<GallIcon />}
              text={
                provider === "google" ? images[0]?.mimeType : images[0]?.name
              }
            />
            <DetailsRow icon={<DeviceIcon />} text={deviceName} />
          </View>
        )}
        <CustomBtn
          onPress={
            provider === "google"
              ? handleUploadImageCategory
              : handleCopyImageToDropboxCategory
          }
          btnStyle={{ marginTop: 20, marginBottom: 20 }}
          title="Update Details"
        />
      </KeyboardAwareScrollView>

      <DeleteImagePopUp
        title={`Confirm`}
        subtitle={`Do you really want to delete ${itemForDelete?.name?.trim()}`}
        onPressCancel={() => setIsVisibleDeletePopup(false)}
        onPressDelete={handleDelete}
        visible={isVisibleDeletePopup}
      />

      <AddTagModal
        visible={addCatModal}
        onClose={() => {
          setAddCatModal(false);
          setnewtag("");
          setNewTagError("");
        }}
        placeholder="Add your tag"
        lable="Add your tag"
        onChangeText={(txt) => {
          setnewtag(txt);
          setNewTagError("");
        }}
        onsubmit={() => addNewTag("tag")}
        value={newtag}
        error={newTagError}
        isLoading={catSubPostLoading}
      />

      <AddTagModal
        visible={addSubCatModal}
        onClose={() => {
          setAddSubCatModal(false);
          setnewsubtag("");
          setNewTagError("");
        }}
        placeholder="Add your sub tag"
        lable="Add your sub tag"
        onChangeText={(txt) => {
          setnewsubtag(txt);
          setNewTagError("");
        }}
        onsubmit={() => addNewTag("subtag")}
        value={newtag}
        error={newTagError}
        isLoading={catSubPostLoading}
      />
    </WrapperContainer>
  );
};

const DetailsRow = ({ icon, text }) => (
  <View
    style={[
      commonStyles.flexView,
      { marginVertical: verticalScale(4), marginLeft: moderateScale(5) },
    ]}
  >
    {icon}
    <Text style={styles.txtStyle}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  selectedListItem: {
    padding: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    margin: 2.5,
  },
  unSelectedListItem: {
    padding: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    margin: 2.5,
  },
  selectedText: {
    fontSize: 12,
    color: COLORS.whiteColor,
    fontFamily: FONTS.regular,
  },
  unSelectedText: {
    fontSize: 12,
    color: COLORS.textColor,
    fontFamily: FONTS.regular,
  },
  popUpContainer: {
    backgroundColor: COLORS.whiteColor,
    borderRadius: 10,
    padding: moderateScale(20),
    justifyContent: "space-between",
    paddingVertical: verticalScale(15),
    width: "100%",
  },
  modalBg: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
    padding: moderateScale(25),
  },
  imgStyle: {
    marginVertical: verticalScale(20),
    height: 150,
    width: 150,
    alignSelf: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  txtStyle: {
    fontFamily: FONTS.regular,
    fontSize: 10,
    color: COLORS.textColor,
    marginLeft: moderateScale(5),
  },
  selectedStyle: {
    borderRadius: 8,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    color: COLORS.textColor,
    fontFamily: FONTS.regular,
  },
  dropdown: {
    height: 40.5,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: moderateScale(20),
  },
  placeholderStyle: {
    fontSize: 12,
    color: COLORS.textColor,
    fontFamily: FONTS.regular,
  },
  selectedTextStyle: {
    fontSize: 12,
    color: COLORS.textColor,
    fontFamily: FONTS.regular,
  },
  result: {
    marginTop: 16,
    fontSize: 16,
    color: "green",
  },
  lableStyle: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.textColor,
    marginBottom: 10,
    marginLeft: 2,
  },
  multipleImageView: {
    marginVertical: verticalScale(20),
    alignSelf: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  multipleImageContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

export default ImageDetails;
