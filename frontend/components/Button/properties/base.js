export const getBaseProperties = (theme) => ({
  primary: {
    color: "black",
    backgroundColor: "white",
    border: "2px white solid",
  },
  tertiary: {
    color: "white",
    backgroundColor: "transparent",
    border: `2px ${theme.palette.primary["20"]} solid`,
  },
  secondary: {
    color: "black",
    backgroundColor: theme.palette.primary["20"],
    border: `2px ${theme.palette.primary["20"]} solid`,
  },
  chips: {
    color: "black",
    backgroundColor: "transparent",
    border: "2px white solid",
  },
  ghost: {
    color: theme.palette.primary["20"],
    backgroundColor: "transparent",
    border: "2px transparent solid",
  },
});
