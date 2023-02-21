import React, { useMemo, useState } from "react";
import { Snackbar, Typography, useTheme, Box } from "@mui/material";
import { Close, Done, Info, WarningAmber } from "@mui/icons-material";

const SnackBar = ({ type, message, heading, ExtraComp }) => {
  const [open, setOpen] = useState(true);
  const theme = useTheme();

  const colors = useMemo(
    () => ({
      Error: theme.palette.alert["500"],
      Info: theme.palette.primary["20"],
      Success: theme.palette.success["50"],
    }),
    [theme],
  );

  const boxShadows = useMemo(
    () => ({
      Error: `0px 4px 12px ${theme.palette.alert["500"]}`,
      Info: `0px 4px 12px ${theme.palette.primary["20"]}`,
      Success: `0px 4px 12px ${theme.palette.success["50"]}`,
    }),
    [theme],
  );

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };

  return (
    <Snackbar
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      open={open}
      sx={{ border: `1px ${colors[type]} solid` }}
      onClose={handleClose}
    >
      <Box
        sx={{
          background: theme.palette.gradients.glass,
          backdropFilter: "blur(16px)",
          width: "400px",
          "@media only screen and (max-width:599px)": {
            width: "100%",
          },
        }}
        padding="18px"
        backgroundColor="none"
        borderRadius="0"
        maxWidth="100%"
        maxHeight="90vh"
        display="flex"
        boxShadow={boxShadows[type]}
        justifyContent="space-between"
        overflow="auto"
      >
        <Box display="flex" flexDirection="column" rowGap="10px" position="relative" width="100%" top="0">
          <Box width="100%" display="flex" justifyContent="space-between">
            <Typography
              variant="body-xs-medium"
              color={colors[type]}
              display="flex"
              alignItems="end"
              columnGap="5px"
              top="0"
              right="0"
              position="sticky"
            >
              <>
                {type === "Error" ? (
                  <WarningAmber sx={{ width: "18px" }} />
                ) : type === "Info" ? (
                  <Info sx={{ width: "18px" }} />
                ) : (
                  <Done sx={{ width: "18px" }} />
                )}
              </>
              {heading}
            </Typography>

            <Close onClick={handleClose} sx={{ color: theme.palette.primary["20"], cursor: "pointer" }} />
          </Box>
          <Box sx={{ overflowX: "auto" }} width="100%" height="100%" position="relative">
            <Typography variant="body-xs-regular" color="white">
              {message}
            </Typography>
          </Box>
          <Box width="100%" position="relative">
            {ExtraComp && <ExtraComp />}
          </Box>
        </Box>
      </Box>
    </Snackbar>
  );
};

export default SnackBar;
