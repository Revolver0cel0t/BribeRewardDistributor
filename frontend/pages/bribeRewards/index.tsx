import { ConnectOverlay } from "components/Web3/ConnectOverlay";
import { Box, styled, useTheme } from "@mui/material";
import { useState } from "react";
import Head from "next/head";
import RewardTable from "components/BribeRewards";

const RewardsContainer = styled(Box)(({ theme }: any) => ({
  color: "white",
  fontSize: "xx-large",
  backgroundImage: theme.palette.gradients.glass,
  backdropFilter: "blur(16px)",
  overflow: "auto",
  overflowX: "hidden",
  borderRadius: 0,
  height: "auto",
}));

function BribeRewards() {
  const [open, setOpen] = useState(false);

  const theme = useTheme();

  return (
    <Box
      display="flex"
      flexDirection="row"
      justifyContent="center"
      alignItems="center"
      width="100vw">
      <Head>
        <title>Rewards | 3xcalibur</title>
      </Head>
      <ConnectOverlay open={open} setOpen={setOpen} />

      <Box width="1072px" maxWidth="100%" position="relative" marginX="20px">
        <Box width="100%">
          <RewardsContainer>
            <Box
              padding="5px"
              width="100%"
              sx={{ background: `${theme.palette.gradients["pool"]}` }}
            />
            <RewardTable />
          </RewardsContainer>
        </Box>
      </Box>
    </Box>
  );
}

export default BribeRewards;
