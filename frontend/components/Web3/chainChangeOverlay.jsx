import { XIcon } from "@heroicons/react/solid";
import { Box, Dialog, Grid, Typography } from "@mui/material";
import { useCallback } from "react";
import useActiveWeb3React from "../../hooks/useActiveWeb3React";
import { chainLogoURI, names } from "../../stores/connectors/connectors";
import { ADD_CHAIN, chainIds } from "../../stores/constants";
import { useThemeContext } from "../../theme/themeContext";
import { Button } from "../Button";
import { animateDown, SlideDownContainer } from "../SlideDownContainer";

export const ChainChangeOverlay = ({ open, setOpen }) => {
  const { theme } = useThemeContext();

  const { account, oldLibrary, wrongChain } = useActiveWeb3React();

  const switchChain = useCallback(
    async (chainId) => {
      let hexChain = "0x" + Number(chainId).toString(16);
      try {
        await oldLibrary?.send("wallet_switchEthereumChain", [
          { chainId: hexChain },
          account,
        ]);
        setOpen(false);
      } catch (error) {
        if (error?.code !== 4001) {
          try {
            await oldLibrary?.send("wallet_addEthereumChain", [
              ADD_CHAIN[Number(chainId)],
              account,
            ]);
            await oldLibrary?.send("wallet_switchEthereumChain", [
              { chainId: hexChain },
              account,
            ]);
            setOpen(false);
          } catch (e) {
            console.error("switch error", e);
          }
        }
      }
    },
    [oldLibrary, account]
  );

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
              Select Chain
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
              justifyContent="space-between"
              rowGap="10px"
              paddingBottom="10px"
              sx={{
                borderRight: `thin ${theme.palette.primary["20"]} solid`,
                paddingRight: "10px",
                "@media only screen and (max-width:899px)": {
                  borderRight: "unset",
                  paddingRight: "0",
                },
              }}
              textAlign="left">
              <Box>
                <Box
                  display="flex"
                  flexDirection="row"
                  alignItems="center"
                  justifyContent="space-between">
                  <Typography variant="body-m-bold" color="primary.20">
                    {!wrongChain ? "Change Chain" : "Wrong Chain"}
                  </Typography>
                </Box>
                <Typography variant="body-m-regular" color="white">
                  {!wrongChain
                    ? `Connect to one of our supported networks.`
                    : `The chain you're connected to isn't supported. Please check that your
                  wallet is connected to one of the following chains :`}
                </Typography>
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
            textAlign="left">
            <Box
              width="100%"
              display="flex"
              flexDirection="column"
              rowGap="10px">
              {chainIds?.map((value, index) => {
                return (
                  <Box
                    key={index}
                    sx={{
                      "@media only screen and (max-width:899px)": {
                        margin: "auto",
                      },
                    }}
                    width="100%">
                    <Button
                      columnGap="10px"
                      onClickFn={() => switchChain(value)}
                      type="filled"
                      variant="primary"
                      StartIcon={
                        <img
                          style={{
                            width: "15px",
                            height: "15px",
                          }}
                          src={chainLogoURI(value)}
                          alt=""
                        />
                      }
                      text={names(value)}
                    />
                  </Box>
                );
              })}
            </Box>
          </Grid>
        </Grid>
      </SlideDownContainer>
    </Dialog>
  );
};
