//@ts-nocheck

import { createAction, createSlice, PayloadAction } from "@reduxjs/toolkit";

type TransactionStatus =
  | "PENDING"
  | "CONFIRMED"
  | "SUBMITTED"
  | "REJECTED"
  | "WAITING"
  | "DONE";

type Transaction = {
  uuid: string;
  status: TransactionStatus;
  description: string;
  error?: string;
  txHash?: string;
};

export type AddTransaction = {
  title: string;
  type: string;
  verb: string;
  transactions: Transaction[];
};
export type SetTransactionPending = { uuid: string; description?: string };
export type SetTransactionSubmitted = {
  uuid: string;
  txHash: string;
  description?: string;
};
export type SetTransactionConfirmed = {
  uuid: string;
  txHash: string;
  description?: string;
};
export type SetTransactionRejected = {
  uuid: string;
  error: string;
  description?: string;
};
export type SetTransactionStatus = {
  uuid: string;
  status?: TransactionStatus;
  description?: string;
};

export type TransactionState = {
  open: boolean;
  transactions: Transaction[];
  queueLength: number;
  purpose: string;
  type: string;
  action: string;
  viewedAfterComplete: boolean;
};

const initialState: TransactionState = {
  open: false,
  transactions: [],
  queueLength: 0,
  purpose: null,
  type: null,
  action: null,
  viewedAfterComplete: false,
};

const transactionSlice = createSlice({
  name: "transaction",
  initialState,
  reducers: {
    addTransaction(state, action: PayloadAction<AddTransaction>) {
      const { payload } = action;
      state.purpose = payload.title;
      state.type = payload.type;
      state.action = payload.verb;
      state.open = true;
      const txs = [...payload.transactions];
      state.transactions = txs;
      state.queueLength = payload.transactions.length;
      state.viewedAfterComplete = false;
    },
    setTransactionPending(state, action: PayloadAction<SetTransactionPending>) {
      const { payload } = action;
      const txns = state.transactions;
      state.transactions = txns.map((tx) => {
        if (tx.uuid === payload.uuid) {
          tx.status = "PENDING";
          tx.description = payload.description
            ? payload.description
            : tx.description;
        }
        return tx;
      });
    },
    setTransactionSubmitted(
      state,
      action: PayloadAction<SetTransactionSubmitted>
    ) {
      const { payload } = action;
      const txns = state.transactions;
      state.transactions = txns.map((tx) => {
        if (tx.uuid === payload.uuid) {
          tx.status = "SUBMITTED";
          tx.txHash = payload.txHash;
          tx.description = payload.description
            ? payload.description
            : tx.description;
        }
        return tx;
      });
    },
    setTransactionConfirmed(
      state,
      action: PayloadAction<SetTransactionConfirmed>
    ) {
      const { payload } = action;
      const txns = state.transactions;
      state.transactions = txns.map((tx) => {
        if (tx.uuid === payload.uuid) {
          tx.status = "CONFIRMED";
          tx.txHash = payload.txHash;
          tx.description = payload.description
            ? payload.description
            : tx.description;
        }
        return tx;
      });
    },
    setTransactionRejected(
      state,
      action: PayloadAction<SetTransactionRejected>
    ) {
      const { payload } = action;
      const txns = state.transactions;
      state.transactions = txns.map((tx) => {
        if (tx.uuid === payload.uuid) {
          tx.status = "REJECTED";
          tx.description = payload.description
            ? payload.description
            : tx.description;
          tx.error = payload.error;
        }
        return tx;
      });
    },
    setTransactionStatus(state, action: PayloadAction<SetTransactionStatus>) {
      const { payload } = action;
      const txns = state.transactions;
      state.transactions = txns.map((tx) => {
        if (tx.uuid === payload.uuid) {
          tx.status = payload.status ? payload.status : tx.status;
          tx.description = payload.description
            ? payload.description
            : tx.description;
        }
        return tx;
      });
    },
    clearTransactions(state) {
      state.transactions = [];
      state.queueLength = 0;
    },
    openQueue(state) {
      state.open = true;
    },
    closeQueue(state) {
      state.open = false;
    },
    changeQueueOpenState(state, action: PayloadAction<boolean>) {
      state.open = action.payload;
    },
    setViewedAfterComplete(state, action: PayloadAction<boolean>) {
      state.viewedAfterComplete = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(resetState, (state) => {
      return initialState;
    });
  },
});

export const resetState = createAction<void>("transaction/resetState");
export const {
  openQueue,
  closeQueue,
  addTransaction,
  setTransactionPending,
  setTransactionSubmitted,
  setTransactionConfirmed,
  setTransactionRejected,
  setTransactionStatus,
  clearTransactions,
  changeQueueOpenState,
  setViewedAfterComplete,
} = transactionSlice.actions;

export default transactionSlice.reducer;
