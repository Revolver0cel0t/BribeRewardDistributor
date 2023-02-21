export const getHoverProperties = (theme) => ({
  primary: {
    color: "black",
    backgroundColor: theme.palette.primary["20"],
    border: `2px white solid`,
  },
  tertiary: {
    color: theme.palette.primary["20"],
    backgroundColor: "transparent",
    border: "2px white solid",
  },
  secondary: {
    color: "black",
    backgroundColor: "white",
    border: `2px ${theme.palette.primary["20"]} solid`,
  },
  chips: {
    color: theme.palette.primary["20"],
    backgroundColor: "transparent",
    border: "2px white solid",
  },
  ghost: {
    color: "white",
    backgroundColor: "transparent",
    border: "2px transparent solid",
  },
});
