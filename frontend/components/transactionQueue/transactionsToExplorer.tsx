//@ts-nocheck
import { Typography, useTheme, Link, Box } from "@mui/material";
import useActiveWeb3React from "hooks/useActiveWeb3React";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { useTransactionState } from "stores/reduxSlices/transactions/hooks";
import { useEffect, useState } from "react";
import { TransactionState } from "stores/reduxSlices/transactions/transactionSlice";
import { ETHERSCAN_URL } from "stores/connectors/connectors";

export const TransactionsToExplorer = () => {
  const theme = useTheme();
  const { chainId } = useActiveWeb3React();
  const txState = useTransactionState();
  const [state, setState] = useState<TransactionState>();

  //we store the txState in the state variable(only once), ensures that even when the tx Queue is cleared, the snackbar doesnt reset immediately until timeout
  useEffect(() => {
    if (txState && !state) {
      setState(txState);
    }
  }, [{ txState, state }]);

  return (
    <Box width="100%">
      {state?.transactions &&
        state?.transactions.length > 0 &&
        state?.transactions
          ?.filter((tx) => {
            return tx.txHash != null;
          })
          ?.map((tx, idx) => {
            return (
              <Box
                borderBottom={`thin ${theme.palette.primary["20"]} solid`}
                key={`tx_key_${idx}`}>
                <Link
                  href={`${ETHERSCAN_URL[chainId]}/tx/${tx?.txHash}`}
                  target="_blank"
                  color="primary.20"
                  display="flex"
                  flexDirection="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ textDecoration: "none" }}>
                  <Typography
                    variant="body-xs-regular"
                    color="primary.20"
                    width="100%">
                    {tx && tx.description ? tx.description : "View in Explorer"}{" "}
                  </Typography>
                  <OpenInNewIcon
                    sx={{ width: "15px" }}
                    color={theme.palette.primary["20"]}
                  />
                </Link>
              </Box>
            );
          })}
    </Box>
  );
};
