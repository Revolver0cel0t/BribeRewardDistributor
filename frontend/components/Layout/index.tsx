import { Box } from "@mui/material";
import React from "react";
import SnackbarController from "../snackbar/snackbarController";
import Nav from "../Nav";

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Box>
      <Nav />
      <SnackbarController />
      <Box paddingTop="6rem">{children}</Box>
    </Box>
  );
}

export default Layout;
