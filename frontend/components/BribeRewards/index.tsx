import { useUserRewards } from "hooks/user/useUserRewards";
import { CircularProgress, Typography } from "@mui/material";
import { Box } from "@mui/system";
import RewardItem from "./RewardItem";
import { CURRENT_EPOCH_DISPLAY } from "stores/constants";
import { Button } from "components/Button";
import useActiveWeb3React from "hooks/useActiveWeb3React";
import { useClaimUserRewardsCallback } from "hooks/user/useClaimUserRewardsCallback";
import { useState } from "react";

const centeredDivProps = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
};

function RewardTable() {
  const { data, isLoading, mutate } = useUserRewards();

  const { account, wrongChain } = useActiveWeb3React();

  const [claimLoading, setClaimLoading] = useState(false);

  const claimRewards = useClaimUserRewardsCallback(
    data?.tokens as string[],
    data?.amounts as string[],
    account,
    data?.proof,
    () => {
      setClaimLoading(false);
      mutate();
    }
  );

  const onClaim = () => {
    setClaimLoading(true);
    claimRewards();
  };

  return (
    <Box paddingX="20px" paddingY="20px" height="400px" sx={centeredDivProps}>
      <Typography variant="heading-m-ultrabold">Bribe Rewards</Typography>
      <Typography variant="body-m-bold" mb="10px">
        ({CURRENT_EPOCH_DISPLAY})
      </Typography>
      <Box
        rowGap="10px"
        width="100%"
        height="300px"
        position="relative"
        sx={{ overflowY: "auto", ...centeredDivProps }}>
        {isLoading ? (
          <CircularProgress sx={{ color: "white" }} />
        ) : !account ? (
          <Typography>User account not connected</Typography>
        ) : wrongChain ? (
          <Typography>Please Connect to the correct Network</Typography>
        ) : data ? (
          <>
            {data?.tokens.map((_: any, index: number) => (
              <RewardItem
                symbol={data.symbols[index]}
                amount={data.amounts[index]}
                decimals={data.decimals[index]}
              />
            ))}
          </>
        ) : (
          <Typography>
            User does not have rewards for this bribe epoch
          </Typography>
        )}
      </Box>
      <Box width="200px">
        <Button
          text={"Claim"}
          type="filled"
          onClickFn={onClaim as () => null}
          showLoader={isLoading || claimLoading}
          disabled={
            isLoading || !data || wrongChain || !account || claimLoading
          }
        />
      </Box>
    </Box>
  );
}

export default RewardTable;
