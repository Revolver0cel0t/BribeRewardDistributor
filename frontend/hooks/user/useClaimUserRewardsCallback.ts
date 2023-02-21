import useActiveWeb3React, {
  getWeb3ProviderForCall,
} from "hooks/useActiveWeb3React";
import { useCallContractWait } from "hooks/web3/useCallContractWait";
import { useCallback } from "react";
import { AbiItem } from "web3-utils";
import { useTransactionDispatchers } from "stores/reduxSlices/transactions/hooks";
import { v4 as uuidv4 } from "uuid";
import { getGasPrice } from "functions/getGasPrice";
import { CURRENT_EPOCH_DISPLAY, merkleClaimAddress } from "stores/constants";
import MERKLE_CLAIM_ABI from "stores/abis/merkleClaim.json";
import { AddTransaction } from "stores/reduxSlices/transactions/transactionSlice";

export const useClaimUserRewardsCallback = (
  tokens: string[],
  amounts: string[],
  account: string,
  proof: string,
  depositCallback: (e: any) => void
) => {
  const context = useActiveWeb3React();
  const { chainId } = context;

  const { addTransaction, setTransactionStatus } = useTransactionDispatchers();
  const callContractWait = useCallContractWait();

  return useCallback(async () => {
    try {
      const web3 = await getWeb3ProviderForCall(context);
      if (!web3) {
        depositCallback("web3 not found");
        console.warn("web3 not found");
        return null;
      }

      const claimTXId = uuidv4();

      const sendOBJ = {
        title: `Claim bribe rewards for EPOCH - ${CURRENT_EPOCH_DISPLAY}`,
        verb: "Rewards Claimed",
        transactions: [
          {
            uuid: claimTXId,
            description: `Claiming bribes`,
            status: "WAITING",
          },
        ],
      };

      addTransaction(sendOBJ as AddTransaction);

      const gasPrice = await getGasPrice(web3);

      // SUBMIT CLAIM TRANSACTION
      const merkleClaimerContract = new web3.eth.Contract(
        MERKLE_CLAIM_ABI as AbiItem[],
        merkleClaimAddress[chainId]
      );
      console.log([tokens, amounts, account, proof]);
      callContractWait(
        merkleClaimerContract,
        "claim",
        [tokens, amounts, account, proof],
        gasPrice,
        claimTXId,
        async (err: any) => {
          depositCallback(err);
          return;
        }
      );
    } catch (error) {
      depositCallback(error);
    }
  }, [
    depositCallback,
    context,
    addTransaction,
    callContractWait,
    setTransactionStatus,
    tokens,
    amounts,
    account,
    proof,
  ]);
};
