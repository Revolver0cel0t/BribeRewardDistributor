import { Box, CircularProgress, Typography, useTheme } from "@mui/material";
import { useWeb3React } from "@web3-react/core";
import dynamic from "next/dynamic";
import React, { useEffect, useState } from "react";
import { network } from "../../stores/connectors/connectors";
import useEagerConnect from "./hooks/useEagerConnect";
import useInactiveListener from "./hooks/useInactiveListener";

const GnosisManagerNoSSR = dynamic(() => import("./GnosisManager"), {
  ssr: false,
});
export const NetworkContextName = "NETWORK";

export default function Web3ReactManager({ children }) {
  const { active } = useWeb3React();
  const { active: networkActive, error: networkError, activate: activateNetwork } = useWeb3React(NetworkContextName);

  // try to eagerly connect to an injected provider, if it exists and has granted access already
  const triedEager = useEagerConnect();

  // after eagerly trying injected, if the network connect ever isn't active or in an error state, activate itd
  useEffect(() => {
    if (triedEager && !networkActive && !networkError && !active) {
      activateNetwork(network);
    }
  }, [triedEager, networkActive, networkError, activateNetwork, active]);

  // when there's no account connected, react to logins (broadly speaking) on the injected provider, if it exists
  useInactiveListener(!triedEager);

  // handle delayed loader state
  const [showLoader, setShowLoader] = useState(false);
  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowLoader(true);
    }, 600);

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  const theme = useTheme();

  if (!triedEager) {
    return null;
  }

  return (
    <>
      <GnosisManagerNoSSR />
      <Box position="relative">
        {!active && !networkActive ? (
          showLoader ? (
            <Box
              position="fixed"
              top="0"
              left="0"
              backgroundColor="red"
              zIndex="3"
              width="100vw"
              height="100vh"
              sx={{
                background: "linear-gradient(106.5deg, rgba(24, 47, 68, 0.75) -10.36%, rgba(41, 68, 96, 0.45) 102.62%)",
                backdropFilter: "blur(16px)",
              }}
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              textAlign="center"
            >
              <Typography variant="heading-m-ultrabold" color="primary.20">
                Initializing network context
              </Typography>
              <CircularProgress size={60} sx={{ color: theme.palette.primary["20"] }} />
            </Box>
          ) : null
        ) : null}
        {!active && networkError ? (
          <Box
            position="fixed"
            top="0"
            left="0"
            backgroundColor="red"
            zIndex="3"
            width="100vw"
            height="100vh"
            sx={{
              background: "linear-gradient(106.5deg, rgba(24, 47, 68, 0.75) -10.36%, rgba(41, 68, 96, 0.45) 102.62%)",
              backdropFilter: "blur(16px)",
            }}
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            textAlign="center"
          >
            <Typography variant="heading-m-ultrabold" color="primary.20">
              Error
            </Typography>
            <Typography variant="heading-m-regular" color="white">
              Oops! An unknown error occurred. Please refresh the page, or visit from another browser/device
            </Typography>
          </Box>
        ) : null}
        {children}
      </Box>
    </>
  );
}
