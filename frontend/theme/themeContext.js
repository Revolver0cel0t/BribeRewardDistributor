import React, { useContext, useMemo, useState } from "react";
import { ThemeProvider as MUIThemeProvider } from "@mui/material/styles";
import dark from "./dark";
import light from "./light";
import { ThemeProvider } from "@emotion/react";

const themeMap = {
  darkTheme: dark,
  lightTheme: light,
};

export const ThemeContextCustom = React.createContext(null);

export const useThemeContext = () => {
  const themeContext = useContext(ThemeContextCustom);
  const { themeProvider } = themeContext;
  return { ...themeProvider };
};

export const ThemeContextProvider = ({ children }) => {
  const [themeType, setThemeType] = useState("darkTheme");

  const theme = useMemo(() => {
    return themeMap[themeType];
  }, [themeType]);

  const themeProvider = useMemo(
    () => ({
      theme,
      themeType,
      setThemeType,
    }),
    [themeType],
  );
  return (
    <MUIThemeProvider theme={theme}>
      <ThemeProvider theme={theme}>
        <ThemeContextCustom.Provider value={{ themeProvider }}>{children}</ThemeContextCustom.Provider>
      </ThemeProvider>
    </MUIThemeProvider>
  );
};
