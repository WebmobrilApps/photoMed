import * as React from "react";
import Svg, { Path } from "react-native-svg";
const ImageCollege = ({tintColor='#32327C',...props}) => (
  <Svg
    width={26}
    height={26}
    viewBox="0 0 26 26"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="M5.3125 4.25H9.5625C9.84429 4.25 10.1145 4.36194 10.3138 4.5612C10.5131 4.76046 10.625 5.03071 10.625 5.3125V11.6875C10.625 11.9693 10.5131 12.2395 10.3138 12.4388C10.1145 12.6381 9.84429 12.75 9.5625 12.75H5.3125C5.03071 12.75 4.76046 12.6381 4.5612 12.4388C4.36194 12.2395 4.25 11.9693 4.25 11.6875V5.3125C4.25 5.03071 4.36194 4.76046 4.5612 4.5612C4.76046 4.36194 5.03071 4.25 5.3125 4.25ZM5.3125 17H9.5625C9.84429 17 10.1145 17.1119 10.3138 17.3112C10.5131 17.5105 10.625 17.7807 10.625 18.0625V20.1875C10.625 20.4693 10.5131 20.7395 10.3138 20.9388C10.1145 21.1381 9.84429 21.25 9.5625 21.25H5.3125C5.03071 21.25 4.76046 21.1381 4.5612 20.9388C4.36194 20.7395 4.25 20.4693 4.25 20.1875V18.0625C4.25 17.7807 4.36194 17.5105 4.5612 17.3112C4.76046 17.1119 5.03071 17 5.3125 17ZM15.9375 12.75H20.1875C20.4693 12.75 20.7395 12.8619 20.9388 13.0612C21.1381 13.2605 21.25 13.5307 21.25 13.8125V20.1875C21.25 20.4693 21.1381 20.7395 20.9388 20.9388C20.7395 21.1381 20.4693 21.25 20.1875 21.25H15.9375C15.6557 21.25 15.3855 21.1381 15.1862 20.9388C14.9869 20.7395 14.875 20.4693 14.875 20.1875V13.8125C14.875 13.5307 14.9869 13.2605 15.1862 13.0612C15.3855 12.8619 15.6557 12.75 15.9375 12.75ZM15.9375 4.25H20.1875C20.4693 4.25 20.7395 4.36194 20.9388 4.5612C21.1381 4.76046 21.25 5.03071 21.25 5.3125V7.4375C21.25 7.71929 21.1381 7.98954 20.9388 8.1888C20.7395 8.38806 20.4693 8.5 20.1875 8.5H15.9375C15.6557 8.5 15.3855 8.38806 15.1862 8.1888C14.9869 7.98954 14.875 7.71929 14.875 7.4375V5.3125C14.875 5.03071 14.9869 4.76046 15.1862 4.5612C15.3855 4.36194 15.6557 4.25 15.9375 4.25Z"
      stroke={tintColor}
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export default ImageCollege;
