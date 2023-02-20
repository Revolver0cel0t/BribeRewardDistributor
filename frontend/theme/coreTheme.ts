import bodyJson from "./style-dictionary/build/body.json";
import headingJson from "./style-dictionary/build/heading.json";

export const colors = {
  blue: "#2D7DDB",
  red: "#ed4337",
  orange: "#ffb347",
  lightBlack: "rgba(0, 0, 0, 0.87)",
};

const coreTheme = {
  shape: {
    borderRadius: 32,
  },
  spacing: (factor: number) => `${8 * factor}`,
  chip: {
    border: "1px solid #98FFFF",
    boxSizing: "border-box",
    borderRadius: "120px",
  },
  circle: {
    position: "static",
    width: "20px",
    height: "20px",
    left: "calc(50% - 20px/2)",
    top: "calc(50% - 20px/2)",
  },
  inputShape: {
    border: "2px solid #FFFFFF",
    boxSizing: "border-box",
  },
  typography: {
    fontFamily: ["DM Sans"].join(","),
    ...bodyJson,
    ...headingJson,
  },
  palette: {
    primary: {
      main: "rgba(0, 0, 0, 0.87)",
    },
    secondary: {
      main: "#FFFFFF",
    },
    error: {
      main: "#dc3545",
    },
  },
  overrides: {
    MuiCircularProgress: { circle: { color: "blacK" } },
    MuiButton: {
      root: {
        minWidth: "50px",
      },
      outlinedSizeSmall: {
        fontSize: "0.7rem",
        padding: "6px 9px",
        ["@media (max-width:576px)"]: {
          // eslint-disable-line no-useless-computed-key
          padding: "3px 0px",
        },
      },
      sizeLarge: {
        padding: "19px 24px",
        minWidth: "150px",
      },
      textSizeLarge: {
        fontSize: "2.4rem",
        ["@media (max-width:576px)"]: {
          // eslint-disable-line no-useless-computed-key
          fontSize: "2rem",
        },
      },
    },
    MuiDialog: {
      paperWidthSm: {
        maxWidth: "800px",
      },
    },
    MuiToggleButton: {
      root: {
        border: "none",
        borderRadius: "12px",
      },
      "&$selected": {
        border: "1px solid #06d3d7",
        backgroundColor: "rgba(0,0,0,0)",
      },
    },
    MuiSnackbar: {
      root: {
        maxWidth: "calc(100vw - 24px)",
      },
      anchorOriginBottomLeft: {
        bottom: "12px",
        left: "12px",
        "@media (min-width: 960px)": {
          bottom: "50px",
          left: "80px",
        },
      },
    },
    MuiAccordion: {
      root: {
        margin: "0px",
        "&:before": {
          //underline color when textfield is inactive
          backgroundColor: "none",
          height: "0px",
        },
        "&$expanded": {
          margin: "0px",
        },
      },
    },
    MuiAccordionSummary: {
      root: {
        padding: "0px 24px",
        "@media (max-width:576px)": {
          padding: "0px 6px",
        },
      },
      content: {
        margin: "0px !important",
      },
    },
    MuiAccordionDetails: {
      root: {
        padding: "0",
      },
    },
    MuiTableCell: {
      head: {
        padding: "4px 8px",
      },
      body: {
        padding: "4px 8px",
        borderBottom: "none",
        backgroundColor: "orange",
      },
    },
    MuiInput: {
      underline: {
        "&:before": {
          //underline color when textfield is inactive
          borderBottom: "none !important",
        },
        "&:hover:not($disabled):before": {
          //underline color when hovered
          borderBottom: "none !important",
        },
      },
    },
    Mui: {
      "&$disabled": {
        "&:before": {
          borderBottom: "none",
        },
      },
    },
  },
};

export default coreTheme;
