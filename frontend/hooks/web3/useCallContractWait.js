import useActiveWeb3React, {
  getWeb3ProviderForCall,
} from "hooks/useActiveWeb3React";
import { useTransactionDispatchers } from "stores/reduxSlices/transactions/hooks";
import { useMemo } from "react";
import { useSnackbarDispatch } from "stores/reduxSlices/snackbar/hooks";
import { Link, Typography } from "@mui/material";
import BigNumber from "bignumber.js";

const errorMap = {
  4001: "User Rejected Request: The user rejected the request.",
  4100: "Unauthorized:	The requested method and/or account has not been authorized by the user.",
  4200: "Unsupported Method:	The Provider does not support the requested method.",
  4900: "Disconnected:	The Provider is disconnected from all chains.",
  4901: "Chain Disconnected:	The Provider is not connected to the requested chain.",
  "-32700": "Parse error: Invalid JSON.",
  "-32600": "Invalid request:	JSON is not a valid request object.",
  "-32601": "Method not found:	Method does not exist.",
  "-32602": "Invalid params:	Invalid method parameters.",
  "-32603": "Internal error:	Internal JSON-RPC error.",
  "-32000": "Invalid input:	Missing or invalid parameters.",
  "-32001": "Resource not found:	Requested resource not found.",
  "-32002": "Resource unavailable:	Requested resource not available.",
  "-32003": "Transaction rejected:	Transaction creation failed.",
  "-32004": "Method not supported:	Method is not implemented.",
  "-32005": "Limit exceeded:	Request exceeds defined limit.",
  "-32006":
    "JSON-RPC version not supported:	Version of JSON-RPC protocol is not supported.",
};

const errorCodes = Object.keys(errorMap).map((code) => Number(code));

const UnknownMessage = ({ error }) => (
  <Typography variant="body-xs-regular" color="white">
    Please share this message to{" "}
    <Link
      href="https://discord.com/channels/932752916861820968/964491436743602178"
      target="_blank"
      color="primary.20">
      #help-needed
    </Link>{" "}
    on our Discord:
    <br />
    <br />
    <Typography variant="body-xs-regular">{error}</Typography>
  </Typography>
);

const KnownMessage = ({ message }) => (
  <Typography variant="body-xs-regular" color="white">
    {message}
    <br />
    <br />
    Check your Metamask or other wallet's Activity tab for more info.
  </Typography>
);

export const useCallContractWait = () => {
  const snackbarDispatch = useSnackbarDispatch();
  const context = useActiveWeb3React();
  const { account } = context;
  const {
    setTransactionPending,
    setTransactionSubmitted,
    setTransactionConfirmed,
    setTransactionRejected,
  } = useTransactionDispatchers();

  return useMemo(() => {
    return async (
      contract,
      method,
      params,
      gasPrice,
      uuid,
      callback,
      sendValue = null
    ) => {
      const web3 = await getWeb3ProviderForCall(context);

      const handleError = (error) => {
        const { code, message } = error;
        if (message && code && errorCodes.includes(code)) {
          if (code === 4001) {
            snackbarDispatch(
              "The wallet reports that you have rejected the transaction manually.  Aborting the transaction.",
              "Transaction Rejected by User",
              "Info"
            );
          } else {
            snackbarDispatch(
              "An error occurred while running the transaction.",
              "Error",
              "Error",
              () => <KnownMessage message={message} />
            );
          }

          setTransactionRejected({ uuid, error: message });
          return callback(message, null);
        }

        snackbarDispatch(
          "An unknown error occurred while running the transaction.",
          "Error",
          "Error",
          () => <UnknownMessage error={error.toString()} />
        );
        setTransactionRejected({ uuid, error: error });
        callback(error, null);
      };

      if (!web3) {
        console.warn("web3 not found");
        return null;
      }

      setTransactionPending({ uuid });

      try {
        contract.methods[method](...params)
          .estimateGas({ from: account, value: sendValue })
          .then(async (gasAmount) => {
            const sendGasAmount = new BigNumber(gasAmount)
              .times(1.2)
              .toFixed(0);
            const sendGasPrice = new BigNumber(gasPrice).times(1.2).toFixed();
            contract.methods[method](...params)
              .send({
                from: account,
                value: sendValue,
                gasPrice: web3.utils.toWei(sendGasPrice, "gwei"),
                gas: sendGasAmount,
              })
              .on("transactionHash", (txHash) => {
                setTransactionSubmitted({ uuid, txHash });
              })
              .on("receipt", (receipt) => {
                setTransactionConfirmed({
                  uuid,
                  txHash: receipt.transactionHash,
                });
                callback(null, receipt.transactionHash);
              })
              .on("error", (error) => {
                // -3xxxx errors
                // 4xxx errors, ex: rejected by user
                handleError(error);
              })
              .catch((error) => {
                // -3xxxx errors
                // 4xxx errors, ex: rejected by user
                handleError(error);
              });
          })
          .catch((error) => {
            // Reached b/c: failed at the contract-method call level
            handleError(error);
          });
      } catch (error) {
        // Reached b/c:
        // - failed at the contract-method call level
        // - estimating gas failed
        handleError(error);
      }
    };
  }, [
    context,
    setTransactionPending,
    setTransactionSubmitted,
    setTransactionConfirmed,
    setTransactionRejected,
  ]);
};
