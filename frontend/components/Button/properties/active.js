export const getActiveProperties = (theme) => ({
  primary: {
    backgroundColor: "white",
    border: `2px ${theme.palette.primary["20"]} solid`,
    color: "black",
  },
  tertiary: {
    backgroundColor: "transparent",
    border: `2px white solid`,
    color: "white",
  },
  secondary: {
    color: "black",
    backgroundColor: "white",
    border: `2px white solid`,
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
