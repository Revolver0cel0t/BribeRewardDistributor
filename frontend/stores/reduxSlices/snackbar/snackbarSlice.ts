//@ts-nocheck
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type SnackbarState = {
  message: React.ReactNode;
  heading: React.ReactNode;
  type: string;
  ExtraComp?: React.ReactNode;
  snackbarTime?: number;
};

const initialState: SnackbarState = {
  message: null,
  type: null,
  heading: null,
  snackbarTime: null,
  ExtraComp: null,
};

const snackbarSlice = createSlice({
  name: "snackbar",
  initialState,
  reducers: {
    setSnackBarData(state, action: PayloadAction<SnackbarState>) {
      const { payload } = action;
      state.message = payload.message;
      state.type = payload.type;
      state.heading = payload.heading;
      state.snackbarTime = Date.now();
      state.ExtraComp = payload?.ExtraComp;
    },
  },
});

export const { setSnackBarData } = snackbarSlice.actions;

export default snackbarSlice.reducer;
