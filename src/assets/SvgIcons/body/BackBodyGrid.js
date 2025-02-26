import * as React from "react";
import Svg, { Line, G, Path, Defs, ClipPath, Rect } from "react-native-svg";
const BackBodyGrid = (props) => (
  <Svg
    width={300}
    height={310}
    viewBox="0 0 300 310"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Line
      x1={150.4}
      y1={10}
      x2={150.4}
      y2={310}
      stroke="white"
      strokeWidth={0.8}
      strokeDasharray="6 6"
    />
    <Line
      y1={109.6}
      x2={300}
      y2={109.6}
      stroke="white"
      strokeWidth={0.8}
      strokeDasharray="6 6"
    />
    <G clipPath="url(#clip0_4002_28)">
      <Path
        d="M207.32 133.94C212.4 135.24 214.99 150.94 216.25 169.83"
        stroke="white"
        strokeWidth={2}
        strokeMiterlimit={10}
      />
      <Path
        d="M216.85 239.13C223.32 260.58 223.66 305.85 223.66 305.85L201.19 306.54C199.57 304 198.25 297.59 197.21 289.59C196.66 285.32 196.19 280.59 195.8 275.76H195.79C194.45 259.28 194.02 241.58 194.39 236.41C195.07 226.88 189.96 198.62 190.3 191.47C190.31 191.18 190.32 190.87 190.32 190.55C190.33 190.54 190.33 190.53 190.32 190.52C190.33 190.52 190.33 190.5 190.32 190.49C190.44 182.99 188.26 168.66 188.26 168.66"
        stroke="white"
        strokeWidth={2}
        strokeMiterlimit={10}
      />
      <Path
        d="M142.33 1C123.59 2.15 113.69 11.82 108.31 23.45C100.93 39.39 102.03 59.02 100.46 65.51"
        stroke="white"
        strokeWidth={2}
        strokeMiterlimit={10}
      />
      <Path
        d="M188.26 168.66C188.26 168.66 190.44 182.99 190.32 190.49C190.33 190.5 190.33 190.51 190.32 190.52C190.33 190.53 190.33 190.54 190.32 190.55C189.3 196.32 187.96 202.95 186.22 210.54"
        stroke="white"
        strokeWidth={2}
        strokeMiterlimit={10}
      />
      <Path
        d="M133.34 300.1C113.59 299.67 96.7599 293.32 88.6499 289.67C89.1699 285.27 89.6199 280.46 89.9899 275.58C94.7899 266.88 100.88 255.4 103.2 249C107.29 237.77 99.4599 210.54 99.4599 210.54C97.7099 202.91 96.3699 196.25 95.3499 190.46C95.2399 182.95 97.4199 168.66 97.4199 168.66C98.7799 166.56 99.8599 164.24 100.7 161.79L100.82 162.9L106.98 157.9C113.05 161.82 123.38 166.83 137.03 167.35C139.29 167.44 147.71 167.04 149.67 167C163.08 166.67 172.72 161.87 178.42 157.94"
        stroke="white"
        strokeWidth={2}
        strokeMiterlimit={10}
      />
      <Path
        d="M195.79 275.75H195.8C196.19 280.59 196.66 285.32 197.21 289.59C193.23 291.39 187.09 293.87 179.5 295.98"
        stroke="white"
        strokeWidth={2}
        strokeMiterlimit={10}
      />
      <Path
        d="M70.63 156.45C72.13 143.99 74.53 134.91 78.34 133.93C78.34 133.93 84.75 128.86 96.62 124.63L99.47 150.69L100.69 161.78C99.85 164.23 98.77 166.55 97.41 168.65C97.41 168.65 95.23 182.94 95.34 190.45C95.34 190.8 95.35 191.14 95.36 191.46C95.71 198.61 90.6 226.87 91.28 236.4C91.64 241.44 91.24 258.94 89.98 275.57C89.61 280.45 89.16 285.26 88.64 289.66C87.57 298.6 86.19 305.84 84.47 308.53L62 307.84C62 307.84 62.22 277.28 65.67 254.16C66.51 248.52 67.54 243.33 68.81 239.12"
        stroke="white"
        strokeWidth={2}
        strokeMiterlimit={10}
      />
      <Path
        d="M184.84 164.02L178.42 157.94L177.57 157.13L177.73 155.27L180.56 122.98"
        stroke="white"
        strokeWidth={2}
        strokeMiterlimit={10}
      />
      <Path
        d="M179.47 28.71C184.53 43.46 183.81 59.72 185.21 65.51C187.93 76.74 194.23 90.7 195.25 104.83C196.27 118.96 177.89 123.89 177.89 123.89C167.7 127.29 159.13 123.08 152.93 117.72C146.08 111.8 141.67 107.91 138.32 111.97C136.62 114.02 134.54 116.24 132.1 118.26C125.96 123.36 117.62 127.18 107.77 123.9C107.77 123.9 89.3901 118.96 90.4101 104.84"
        stroke="white"
        strokeWidth={2}
        strokeMiterlimit={10}
      />
      <Path
        d="M142.33 1C142.33 1 147.07 1.32 148.8 1.61"
        stroke="white"
        strokeWidth={2}
        strokeMiterlimit={10}
      />
    </G>
    <Defs>
      <ClipPath id="clip0_4002_28">
        <Rect
          width={163.66}
          height={309.56}
          fill="white"
          transform="translate(61)"
        />
      </ClipPath>
    </Defs>
  </Svg>
);
export default BackBodyGrid;
