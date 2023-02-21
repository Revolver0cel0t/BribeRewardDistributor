import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";

import { combineReducers, configureStore } from "@reduxjs/toolkit";
import transactionSlice from "./reduxSlices/transactions/transactionSlice";
import snackbarSlice from "./reduxSlices/snackbar/snackbarSlice";
const PERSISTED_KEYS = ["user", "transaction", "lists", "txSettings"];

let store: any;

const persistConfig = {
  key: "root",
  whitelist: PERSISTED_KEYS,
  storage,
  // stateReconciler: false,
};

const reducers = combineReducers({
  transaction: transactionSlice,
  snackbar: snackbarSlice,
});

const persistedReducer = persistReducer(persistConfig, reducers);
const reduxStore = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

function makeStore(preloadedState = undefined) {
  return configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
    preloadedState,
  });
}

export const getOrCreateStore = (preloadedState = undefined) => {
  let _store = store ?? makeStore(preloadedState);

  // After navigating to a page with an initial Redux state, merge that state
  // with the current state in the store, and create a new store
  if (preloadedState && store) {
    _store = makeStore({
      ...store.getState(),
      //@ts-ignore
      ...preloadedState,
    });
    // Reset the current store
    store = undefined;
  }

  // For SSG and SSR always create a new store
  if (typeof window === "undefined") return _store;

  // Create the store once in the client
  if (!store) store = _store;

  return _store;
};

store = getOrCreateStore();

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof reduxStore.getState>;
/*** END REDUX ***/
export default {
  reduxStore: store,
};
