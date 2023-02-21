import React, { useEffect, useState } from "react";
import Snackbar from "./Snackbar.jsx";
import { useSnackbarData } from "../..//stores/reduxSlices/snackbar/hooks";

const SnackBarController = () => {
  const snackbarData = useSnackbarData();

  const [state, setState] = useState({
    open: false,
    snackbarType: null,
    snackbarMessage: null,
    snackbarHeading: null,
    ExtraComp: null,
  });

  const clearSnackBar = () => {
    const snackbarObj = {
      snackbarMessage: null,
      snackbarType: null,
      open: false,
      snackbarHeading: null,
      ExtraComp: null,
    };
    setState(snackbarObj);
  };

  const showSnackbar = (barData) => {
    clearSnackBar();
    setTimeout(() => {
      const snackbarObj = {
        snackbarMessage: barData?.message ?? "Message",
        snackbarType: barData?.type,
        open: true,
        snackbarHeading: barData?.heading ?? "Heading",
        ExtraComp: barData.ExtraComp,
      };
      setState(snackbarObj);
    });
  };

  useEffect(() => {
    if (snackbarData?.type) {
      showSnackbar(snackbarData);
    }
  }, [snackbarData]);

  return state?.open ? (
    <Snackbar
      type={state?.snackbarType}
      heading={state?.snackbarHeading}
      message={state?.snackbarMessage}
      open={true}
      ExtraComp={state?.ExtraComp}
    />
  ) : (
    <></>
  );
};

export default SnackBarController;
