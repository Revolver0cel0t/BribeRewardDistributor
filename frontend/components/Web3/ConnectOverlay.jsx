import { Box, Dialog, Grid, Typography } from "@mui/material";
import { useWeb3React } from "@web3-react/core";
import { useEffect, useState } from "react";
import { useThemeContext } from "../../theme/themeContext";
import { Button } from "../Button";
import {
  ADD_CHAIN,
  ChainIds,
  connectorsByName,
} from "../../stores/connectors/connectors";
import { animateDown, SlideDownContainer } from "../SlideDownContainer";
import XIcon from "@heroicons/react/outline/XIcon";

export const ConnectOverlay = ({ open, setOpen }) => {
  const context = useWeb3React();

  const { connector, activate, deactivate, account } = context;

  const { theme } = useThemeContext();

  const [activatingConnector, setActivatingConnector] = useState();

  useEffect(() => {
    if (activatingConnector && activatingConnector === connector) {
      setActivatingConnector(undefined);
    }
  }, [activatingConnector, connector]);

  async function onConnectionClicked(
    currentConnector,
    name,
    setActivatingConnector,
    activate,
    setOpen
  ) {
    setActivatingConnector(name);
    activate(connectorsByName[name]);
    setOpen(false);
    let hexChain = "0x" + Number(ChainIds.ARBITRUM).toString(16);
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: hexChain }],
      });
      setOpen(false);
    } catch (error) {
      console.log(error);
      if (error?.code !== 4001) {
        try {
          await window.ethereum.request("wallet_addEthereumChain", [
            ADD_CHAIN[Number(chainId)],
            account,
          ]);
          await window.ethereum.request("wallet_switchEthereumChain", [
            { chainId: hexChain },
            account,
          ]);
          setOpen(false);
        } catch (e) {
          console.error("switch error", e);
        }
      }
    }
  }

  return (
    <Dialog
      onClose={() => setOpen(false)}
      aria-labelledby="simple-dialog-title"
      open={open}
      disableScrollLock={true}>
      <SlideDownContainer
        sx={{
          animation: `${animateDown} 0.5s`,
          height: "max-content",
          maxHeight: 700,
          "@media only screen and (max-width:899px)": {
            height: "100vh",
            maxHeight: "100%",
          },
        }}>
        <Grid
          container
          sx={{
            width: "800px",
            maxWidth: "100%",
            "@media only screen and (max-width:899px)": {
              width: "450px",
            },
          }}
          rowGap="10px"
          paddingY="10px"
          marginTop="10px"
          onClick={(e) => {
            e.stopPropagation();
          }}
          overflow="scroll">
          <Box
            display="flex"
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
            width="100%">
            <Typography variant="body-m-bold" color="primary.20">
              Connect Wallet
            </Typography>
            <XIcon
              width="20px"
              height="20px"
              style={{
                marginRight: "12px",
                cursor: "pointer",
                color: "white",
              }}
              onClick={() => setOpen(false)}
            />
          </Box>
          <Grid
            item
            xs={12}
            md={6}
            display="flex"
            flexDirection="column"
            width="100%"
            sx={{
              paddingRight: "20px",
              "@media only screen and (max-width:899px)": {
                paddingRight: "0",
              },
            }}
            paddingY="40px">
            <Box
              style={{
                width: "899px",
                height: "100%",
                maxWidth: "100%",
                maxHeight: "max-content",
              }}
              color="black"
              display="flex"
              flexDirection="column"
              justifyContent="center"
              rowGap="10px"
              paddingBottom="10px"
              sx={{
                borderRight: `thin ${theme.palette.primary["20"]} solid`,
                paddingRight: "10px",
                "@media only screen and (max-width:899px)": {
                  borderRight: "unset",
                  paddingRight: "0",
                },
              }}>
              <Typography variant="body-m-bold" color="primary.20">
                Recommended
              </Typography>
              <Box
                display="flex"
                flexDirection="column"
                alignItems="start"
                rowGap="10px">
                {Object.keys(connectorsByName).map((name, index) => {
                  const currentConnector = connectorsByName[name];

                  let url;
                  let descriptor = "";
                  if (name === "MetaMask") {
                    url = "/connectors/icn-metamask.svg";
                    descriptor = "Metamask";
                  } else if (name === "WalletConnect") {
                    url = "/connectors/walletConnectIcon.svg";
                    descriptor = "WalletConnect";
                  }

                  return (
                    <Box
                      key={name}
                      sx={{
                        "@media only screen and (max-width:899px)": {
                          margin: "auto",
                        },
                      }}
                      width="100%">
                      <Button
                        variant="primary"
                        onClickFn={() => {
                          onConnectionClicked(
                            currentConnector,
                            name,
                            setActivatingConnector,
                            activate,
                            setOpen
                          );
                        }}
                        StartIcon={
                          <img
                            style={{
                              width: "15px",
                              height: "15px",
                            }}
                            src={url}
                            alt=""
                          />
                        }
                        columnGap="10px"
                        text={descriptor}
                        type="filled"
                      />
                    </Box>
                  );
                })}
                {account && (
                  <Button
                    variant="tertiary"
                    onClickFn={() => {
                      deactivate();
                    }}
                    text="Disconnect Wallet"
                    type="filled"
                  />
                )}
              </Box>
            </Box>
          </Grid>
          <Grid
            item
            xs={12}
            md={6}
            display="flex"
            flexDirection="column"
            alignItems="start"
            width="100%"
            paddingY="40px"
            justifyContent="space-between"
            style={{ color: "white" }}
            rowGap="20px"
            textAlign="left">
            <Box display="flex" flexDirection="column" alignItems="start">
              <Typography variant="body-m-bold" color="primary.20">
                New here?
              </Typography>
              <Typography variant="body-m-bold">Welcome to DeFi!</Typography>
              <Typography variant="body-m-regular">
                Create a crypto wallet to start trading on 3xcalibur.
              </Typography>
            </Box>
            <Box display="flex" flexDirection="column" alignItems="start">
              <Typography variant="body-m-bold" color="primary.20">
                What is a wallet?
              </Typography>
              <Typography variant="body-m-bold">
                A home for your digital assets!
              </Typography>
              <Typography variant="body-m-regular">
                A new way to log in
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </SlideDownContainer>
    </Dialog>
  );
};
