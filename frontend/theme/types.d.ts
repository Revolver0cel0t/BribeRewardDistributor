import { CSSProperties } from "@material/core/styles/createTypography";

interface Sections {
  pool?: string;
  mint?: string;
  glass?: string;
  swap?: string;
  govern?: string;
  credit?: string;
}
export interface PaletteColor extends Palette {
  primary: PrimaryColor;
  secondary: SecondaryColor;
  alert: AlertColor;
  success: SuccessColor;
  black: string;
  white: string;
  gradients: Sections;
  themeSpecific: Sections;
  elevation: {
    level1: string;
    level2: string;
    level3: string;
  };
  glow: Sections;
  accordionBorder: { [name: string]: string };
}

export interface PrimaryColor {
  10: string;
  20: string;
  60: string;
  80: string;
  100: string;
  200: string;
  300: string;
  500: string;
}
export interface SecondaryColor {
  10: string;
  20: string;
  30: string;
  40: string;
  50: string;
  80: string;
  300: string;
  500: string;
  main: string;
}
export interface AlertColor {
  20: string;
  70: string;
  80: string;
  500: string;
  900: string;
  main: string;
}
export interface SuccessColor {
  10: string;
  30: string;
  50: string;
  600: string;
  main: string;
}

interface CustomTypography extends Typography {
  "body-m-regular": CSSProperties;
  "body-m-bold": CSSProperties;
  "body-s-regular": CSSProperties;
  "body-s-bold": CSSProperties;
  "body-xs-regular": CSSProperties;
  "body-xs-medium": CSSProperties;
  "heading-xl-ultrabold": CSSProperties;
  "heading-m-ultrabold": CSSProperties;
  "heading-s-light": CSSProperties;
  "nav-m-thin": CSSProperties;
}

type CustomPalette = PaletteColor;

declare module "@mui/material/Typography" {
  interface TypographyPropsVariantOverrides extends CustomTypography {}
}

declare module "@mui/material/styles/createTheme" {
  interface CustomTheme extends Theme {
    typography: CustomTypography;
  }
  // allow configuration using `createTheme`

  interface CustomBaseTheme extends BaseTheme {
    palette: CustomPalette;
  }
  interface CustomThemeOptions extends ThemeOptions {
    typography: CustomTypography;
    palette: CustomPalette;
  }
}

declare module "@mui/material/styles/createTypography" {
  interface Typography extends CustomTypography {}
  interface TypographyOptions extends CustomTypography {}
}

declare module "@mui/material/styles/createPalette" {
  interface Palette extends CustomPalette {}
  interface PaletteOptions extends CustomPalette {}
}
