import React, { useEffect } from "react";
import { Typography, Dialog, IconButton, Box, useTheme } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Transaction from "./transaction";
import {
  useTransactionModalDispatchers,
  useTransactionState,
  useTransactionsHaveBeenViewed,
} from "../../stores/reduxSlices/transactions/hooks";
import { SlideDownContainer, animateDown } from "../SlideDownContainer";
import { useSnackbarDispatch } from "../../stores/reduxSlices/snackbar/hooks";
import { TransactionsToExplorer } from "./transactionsToExplorer";
import { useDispatch } from "react-redux";
import { setViewedAfterComplete } from "../../stores/reduxSlices/transactions/transactionSlice";

export default function TransactionQueue({ isTxComplete }) {
  const theme = useTheme();

  const dispatch = useDispatch();

  const { open, purpose, transactions } = useTransactionState();

  const { closeQueue } = useTransactionModalDispatchers();

  const fullScreen = window.innerWidth < 576;

  const snackbarDispatch = useSnackbarDispatch();

  const viewed = useTransactionsHaveBeenViewed();

  const close = () => {
    closeQueue();
    if (isTxComplete && !viewed && open) {
      dispatch(setViewedAfterComplete(true));
    }
  };

  useEffect(() => {
    //if the final transaction in list is confirmed, dispatch snackbar and close the transaction modal
    if (transactions?.[transactions.length - 1]?.status === "CONFIRMED") {
      try {
        snackbarDispatch(
          "Transaction has been confirmed by the blockchain",
          purpose,
          "Success",
          TransactionsToExplorer
        );
        close();
      } catch (error) {
        console.error("error@TransactionQueue", error);
      }
    }
  }, [{ transactions, purpose }]);

  const renderTransactions = (transactions) => {
    return (
      <Box
        paddingBottom="20px"
        minHeight="300px"
        maxHeight="100%"
        display="flex"
        flexDirection="column">
        <Box marginBottom="16px" textAlign="left" overflow="scroll">
          <Typography variant="heading-m-ultrabold" color="primary.20">
            {purpose ? purpose : "Pending Transactions"}
          </Typography>
        </Box>
        <Box>
          {transactions &&
            transactions.map((tx, idx) => {
              return <Transaction key={idx} transaction={tx} />;
            })}
        </Box>
      </Box>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={close}
      fullWidth={true}
      maxWidth="sm"
      fullScreen={fullScreen}
      disableScrollLock={true}>
      <SlideDownContainer
        sx={{
          animation: `${animateDown} 0.5s`,
          "@media only screen and (max-width:899px)": {
            height: "100vh",
            maxHeight: "100%",
          },
        }}>
        <Box width="600px" maxWidth="100%" rowGap="20px">
          <Box
            display="flex"
            width="100%"
            justifyContent="flex-end"
            marginBottom="-10px">
            <IconButton
              sx={{ color: theme.palette.primary["20"] }}
              onClick={close}>
              <CloseIcon />
            </IconButton>
          </Box>
          {renderTransactions(transactions)}
        </Box>
      </SlideDownContainer>
    </Dialog>
  );
}
