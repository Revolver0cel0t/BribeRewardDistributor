import { createTheme } from "@mui/material/styles";
import coreTheme from "./coreTheme";
import colors from "./style-dictionary/build/color.json";
import gradientsJson from "./style-dictionary/build/gradients.json";
import shadows from "./style-dictionary/build/shadows.json";
// Create a theme instance.
const theme = createTheme({
  ...coreTheme,
  palette: {
    ...coreTheme.palette,
    mode: "dark" as any,
    black: "#000000",
    white: "#ffffff",
    gradients: {
      ...gradientsJson.gradients,
      pool: "linear-gradient(89deg, #c8ff82 31.15%, #00d1ff 89.58%)",
      mint: "linear-gradient(89deg, #c8ff82 31.15%, #00d1ff 89.58%)",
      glass: "linear-gradient(106.5deg, rgba(24, 47, 68, 0.75) -10.36%, rgba(41, 68, 96, 0.45) 102.62%)",
    },
    themeSpecific: {
      swap: "#FEC5E6",
      credit: "#FFBD13",
      pool: "#c8ff82",
      mint: "green",
      govern: "#98ffff",
    },
    primary: {
      ...colors.primary,
      main: colors.primary["500"],
    },
    text: {
      primary: "#000000",
      secondary: "#98ffff",
      disabled: "rgba(255, 255, 255, 0.5)",
    },
    secondary: {
      ...colors.secondary,
      main: colors.secondary["500"],
    },
    alert: {
      ...colors.alert,
      main: colors.alert["900"],
    },
    success: {
      ...colors.success,
      main: colors.success["600"],
    },
    elevation: shadows.elevation,
    glow: shadows.glow,
    accordionBorder: {
      borderRadius: "2px 2px 0px 0px",
    },
    background: {
      default: "#294460",
      paper: "transparent",
    },
  },
});

export default theme;
