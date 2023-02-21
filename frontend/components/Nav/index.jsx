import React, { useState } from "react";
import { Typography, useTheme } from "@mui/material";
import { ChainChangeOverlay } from "components/Web3/chainChangeOverlay";
import { ConnectOverlay } from "components/Web3/ConnectOverlay";
import TransactionQueue from "components/transactionQueue/transactionQueue";
import { formatAddress } from "utils";
import useActiveWeb3React from "hooks/useActiveWeb3React";
import Box from "@mui/material/Box";
import { withTheme } from "@mui/styles";
import {
  useTransactionModalDispatchers,
  useTransactions,
  useTransactionsPosition,
} from "stores/reduxSlices/transactions/hooks";
import { chainIds } from "stores/constants";
import { Button } from "../Button";

function Nav() {
  const { chainId, account } = useActiveWeb3React();

  const [chainOpened, setChainOpened] = useState(false);

  const [isTxComplete] = useTransactionsPosition();

  const [connectOpen, setConnectOpen] = useState(false);

  const transactions = useTransactions();
  const { openQueue } = useTransactionModalDispatchers();
  const theme = useTheme();

  const isConnected = Boolean(account);

  const wrongChain = !chainIds.includes(chainId);

  const getFunctionForButton = () => {
    if (isConnected) {
      if (wrongChain) {
        setChainOpened(true);
      } else {
        setConnectOpen(true);
      }
    } else {
      setConnectOpen(true);
    }
  };

  return (
    <Box
      position="fixed"
      width="100vw"
      zIndex="3"
      sx={{
        background:
          " linear-gradient(127deg, rgba(24, 47, 68, 1) 14.3%, rgba(41, 68, 96, 1) 85.7%);",
      }}
      padding="0"
      borderBottom={`thin ${theme.palette.primary["20"]} solid`}>
      <Box
        position="relative"
        display="flex"
        flexDirection="row"
        alignItems="center"
        justifyContent="flex-end"
        width="100%"
        paddingY="10px">
        {account ? (
          <>
            {transactions.length > 0 && (
              <Box mr="10px">
                <Button
                  size="s"
                  onClickFn={() => openQueue()}
                  variant="tertiary"
                  textVariant="body-m-bold"
                  text={
                    <Box px="10px">
                      <Typography variant="body-s-bold">
                        Transactions
                      </Typography>
                    </Box>
                  }
                />
              </Box>
            )}

            <Box mr="20px">
              <Button
                size="s"
                onClickFn={getFunctionForButton}
                variant="secondary"
                textVariant="body-m-bold"
                text={
                  <Box px="10px">
                    <Typography variant="body-s-bold">
                      {wrongChain
                        ? "Wrong Chain"
                        : !isConnected
                        ? "Connect Wallet"
                        : formatAddress(account)}
                    </Typography>
                  </Box>
                }
              />
            </Box>
          </>
        ) : (
          <Box mr="20px">
            <Button
              variant="secondary"
              onClickFn={() => setConnectOpen(true)}
              text={account ? formatAddress(account) : "Connect"}
              textVariant="body-s-bold"
              size="s"
              px="8px"
              pt="1px"
            />
          </Box>
        )}
      </Box>
      <ChainChangeOverlay
        open={chainOpened}
        setOpen={setChainOpened}
        dismiss={() => setChainOpened(false)}
      />
      <ConnectOverlay open={connectOpen} setOpen={setConnectOpen} />
      <TransactionQueue isTxComplete={isTxComplete} />
    </Box>
  );
}

export default withTheme(Nav);
