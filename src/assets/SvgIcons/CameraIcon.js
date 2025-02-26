import * as React from "react";
import Svg, { Path } from "react-native-svg";
const CameraIcon = ({tintColor='none',...props}) => (
  <Svg
    width={30}
    height={30}
    viewBox="0 0 30 30"
    fill={tintColor}
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="M20.5395 8.71172L18.9797 6.24727C18.651 5.86406 18.2004 5.625 17.6953 5.625H12.3047C11.7996 5.625 11.349 5.86406 11.0203 6.24727L9.46055 8.71172C9.13184 9.09551 8.7082 9.375 8.20312 9.375H4.6875C4.19022 9.375 3.71331 9.57254 3.36167 9.92418C3.01004 10.2758 2.8125 10.7527 2.8125 11.25V22.5C2.8125 22.9973 3.01004 23.4742 3.36167 23.8258C3.71331 24.1775 4.19022 24.375 4.6875 24.375H25.3125C25.8098 24.375 26.2867 24.1775 26.6383 23.8258C26.99 23.4742 27.1875 22.9973 27.1875 22.5V11.25C27.1875 10.7527 26.99 10.2758 26.6383 9.92418C26.2867 9.57254 25.8098 9.375 25.3125 9.375H21.8555C21.3486 9.375 20.8682 9.09551 20.5395 8.71172Z"
      stroke="white"
      strokeWidth={1.875}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M15 20.625C17.5888 20.625 19.6875 18.5263 19.6875 15.9375C19.6875 13.3487 17.5888 11.25 15 11.25C12.4112 11.25 10.3125 13.3487 10.3125 15.9375C10.3125 18.5263 12.4112 20.625 15 20.625Z"
      stroke="white"
      strokeWidth={1.875}
      strokeMiterlimit={10}
    />
    <Path
      d="M7.26562 9.25781V7.96875H5.85938V9.25781"
      stroke="white"
      strokeWidth={1.875}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export default CameraIcon;
