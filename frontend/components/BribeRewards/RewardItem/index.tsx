import CurrencyLogo from "@/components/Logo/CurrencyLogo";
import { Box, Typography } from "@mui/material";
import BigNumber from "bignumber.js";

function RewardItem({
  symbol,
  amount,
  decimals,
}: {
  symbol: string;
  decimals: number;
  amount: string;
}) {
  return (
    <Box
      display="flex"
      flexDirection="row"
      flexWrap="wrap"
      columnGap="10px"
      alignItems="center"
      rowGap="20px">
      <Typography>{symbol}</Typography>
      <Typography>-</Typography>
      <Typography>
        {new BigNumber(amount).div(Math.pow(10, decimals)).toFixed()}
      </Typography>
    </Box>
  );
}

export default RewardItem;
