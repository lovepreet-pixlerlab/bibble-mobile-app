import { Dimensions, Platform } from "react-native";

const { width, height } = Dimensions.get("window");
const isTablet = Math.min(width, height) >= 768;
const isIOS = Platform.OS === "ios";
const isAndroid = Platform.OS === "android";
const scale = (value: number) => (isTablet ? value * 1.5 : value);

export { height, isAndroid, isIOS, isTablet, scale, width };
