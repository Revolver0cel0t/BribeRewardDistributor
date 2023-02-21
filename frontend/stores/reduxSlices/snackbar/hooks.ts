import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "stores";
import { setSnackBarData } from "./snackbarSlice";

export const useSnackbarData = () => {
  return useSelector((state: RootState) => state.snackbar);
};

export const useSnackbarDispatch = () => {
  const dispatch = useDispatch();

  return useCallback(
    (
      message: React.ReactNode,
      heading: React.ReactNode,
      type: "Error" | "Info" | "Success",
      ExtraComp?: React.ReactNode,
    ) => {
      dispatch(
        setSnackBarData({
          message: message,
          type: type,
          heading: heading,
          ExtraComp: ExtraComp,
        }),
      );
    },
    [dispatch],
  );
};
