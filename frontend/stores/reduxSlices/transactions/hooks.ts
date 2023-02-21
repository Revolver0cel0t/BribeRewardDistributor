import useActiveWeb3React from "hooks/useActiveWeb3React";
import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "stores";
import {
  AddTransaction,
  addTransaction,
  changeQueueOpenState,
  closeQueue,
  openQueue,
  resetState,
  SetTransactionConfirmed,
  setTransactionConfirmed,
  SetTransactionPending,
  setTransactionPending,
  SetTransactionRejected,
  setTransactionRejected,
  SetTransactionStatus,
  setTransactionStatus,
  SetTransactionSubmitted,
  setTransactionSubmitted,
} from "./transactionSlice";

export const useTransactionState = () => {
  return useSelector((state: RootState) => state.transaction);
};

export const useTransactions = () => {
  return useSelector((state: RootState) => state.transaction.transactions);
};

export const useTransactionsModalOpen = () => {
  return useSelector((state: RootState) => state.transaction.open);
};

export const useTransactionsPosition = () => {
  const transactions = useSelector(
    (state: RootState) => state.transaction.transactions
  );
  return useMemo(() => {
    const completeSuccess =
      transactions.length === 0 ||
      transactions.filter(
        (transaction) =>
          transaction.status === "DONE" || transaction.status === "CONFIRMED"
      ).length === transactions.length;
    const completeFailure =
      transactions.filter((transaction) => transaction.status === "REJECTED")
        .length > 0;

    return [
      completeSuccess || completeFailure,
      completeSuccess ? "SUCCESS" : completeFailure ? "FAILURE" : "PENDING",
    ];
  }, [transactions]);
};

export const useTransactionsHaveBeenViewed = () => {
  return useSelector(
    (state: RootState) => state.transaction.viewedAfterComplete
  );
};

export const useTransactionDispatchers = () => {
  const dispatch = useDispatch();
  return {
    addTransaction: (payload: AddTransaction) => {
      dispatch(addTransaction(payload));
    },
    setTransactionStatus: (payload: SetTransactionStatus) => {
      dispatch(setTransactionStatus(payload));
    },
    setTransactionPending: (payload: SetTransactionPending) => {
      dispatch(setTransactionPending(payload));
    },
    setTransactionSubmitted: (payload: SetTransactionSubmitted) => {
      dispatch(setTransactionSubmitted(payload));
    },
    setTransactionConfirmed: (payload: SetTransactionConfirmed) => {
      dispatch(setTransactionConfirmed(payload));
    },
    setTransactionRejected: (payload: SetTransactionRejected) => {
      dispatch(setTransactionRejected(payload));
    },
    resetTransactions: () => {
      dispatch(resetState());
    },
  };
};

export const useTransactionModalDispatchers = () => {
  const dispatch = useDispatch();

  return {
    openQueue: () => {
      dispatch(openQueue());
    },
    closeQueue: () => {
      dispatch(closeQueue());
    },
    //@ts-ignore
    changeQueueOpenState: (payload) => {
      dispatch(changeQueueOpenState(payload));
    },
  };
};

export const TransactionController = () => {
  const { account, chainId } = useActiveWeb3React();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(resetState());
  }, [account, chainId]);
  return null;
};
