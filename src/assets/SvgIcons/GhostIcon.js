import * as React from "react";
import Svg, { Path } from "react-native-svg";
const GhostIcon = (props) => (
  <Svg
    fill="#000000"
    width="800px"
    height="800px"
    viewBox="-4 -2 24 24"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="xMinYMin"
    className="jam jam-ghost"
    {...props}
  >
    <Path d="M8 0a8 8 0 0 1 8 8v12l-4.919-1-3.08 1-2.992-1L0 20V8a8 8 0 0 1 8-8zm6 8A6 6 0 0 0 2 8v9.561l3.138-.626 2.871.96 2.955-.96 3.036.618V8zm-8.5 2a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
  </Svg>
);
export default GhostIcon;
