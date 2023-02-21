import React, { useState } from "react";
import { Typography, Tooltip, useTheme, Box } from "@mui/material";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import HourglassFullIcon from "@mui/icons-material/HourglassFull";
import ErrorIcon from "@mui/icons-material/Error";
import PauseIcon from "@mui/icons-material/Pause";
import { ETHERSCAN_URL } from "../../stores/constants";
import { formatAddress } from "../../utils";
import useActiveWeb3React from "../../hooks/useActiveWeb3React";
import { CheckIcon } from "@heroicons/react/outline";

export default function Transaction({ transaction }) {
  const [expanded, setExpanded] = useState(false);
  const theme = useTheme();

  const { chainId } = useActiveWeb3React();

  const mapStatusToIcon = (status) => {
    switch (status) {
      case "WAITING":
        return <PauseIcon sx={{ color: theme.palette.warning["main"] }} />;
      case "PENDING":
        return (
          <HourglassEmptyIcon sx={{ color: theme.palette.success["50"] }} />
        );
      case "SUBMITTED":
        return (
          <HourglassFullIcon sx={{ color: theme.palette.success["50"] }} />
        );
      case "CONFIRMED":
        return (
          <CheckIcon
            style={{ color: theme.palette.success["50"] }}
            width="25px"
          />
        );
      case "REJECTED":
        return <ErrorIcon sx={{ color: theme.palette.error["main"] }} />;
      case "DONE":
        return (
          <CheckIcon
            style={{ color: theme.palette.success["50"] }}
            width="25px"
          />
        );
      default:
    }
  };

  const mapStatusToTootip = (status) => {
    switch (status) {
      case "WAITING":
        return "Transaction will be submitted once ready";
      case "PENDING":
        return "Transaction is pending your approval in your wallet";
      case "SUBMITTED":
        return "Transaction has been submitted to the blockchain and we are waiting on confirmation.";
      case "CONFIRMED":
        return "Transaction has been confirmed by the blockchain.";
      case "DONE":
        return "Transaction has been confirmed by the blockchain.";
      case "REJECTED":
        return "Transaction has been rejected.";
      default:
        return "";
    }
  };

  const onExpendTransaction = () => {
    setExpanded(!expanded);
  };

  const onViewTX = () => {
    window.open(`${ETHERSCAN_URL[chainId]}tx/${transaction.txHash}`, "_blank");
  };

  return (
    <Box key={transaction.uuid}>
      <Box
        display="flex"
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        borderBottom="thin lightgray solid"
        paddingBottom="10px"
        paddingTop="10px"
        onClick={onExpendTransaction}
        sx={{ cursor: "pointer" }}>
        <Typography color="white" variant="body-m-regular">
          {transaction.description}
        </Typography>
        <Tooltip title={mapStatusToTootip(transaction.status)}>
          {mapStatusToIcon(transaction.status)}
        </Tooltip>
      </Box>
      {expanded && (
        <Box>
          {transaction.txHash && (
            <Box>
              <Typography
                sx={{ cursor: "pointer" }}
                onClick={onViewTX}
                color="primary.20"
                variant="body-xs-regular">
                {formatAddress(transaction.txHash, "long")}
              </Typography>
            </Box>
          )}
          <Box maxHeight="40px" overflow="auto" position="relative">
            {transaction.error && (
              <Typography color="error.main" variant="body-xs-regular">
                {transaction.error}
              </Typography>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
}
