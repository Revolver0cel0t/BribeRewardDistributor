import type { AppProps } from "next/app";
import { Web3ReactProvider } from "@web3-react/core";
import Web3ReactManager from "services/web3/Web3ReactManager.jsx";
import { ThemeContextProvider } from "theme/themeContext.js";
import { Web3Provider, ExternalProvider } from "@ethersproject/providers";
import dynamic from "next/dynamic";
import { Box, Typography } from "@mui/material";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import stores, { persistor } from "stores";
import Layout from "components/Layout";
const Web3ProviderNetwork = dynamic(
  () => import("../services/web3/web3ProviderNetwork"),
  { ssr: false }
);

declare global {
  interface Window {
    ethereum: import("ethers").providers.ExternalProvider;
  }
}

export default function App({ Component, pageProps }: AppProps) {
  function getLibrary(provider: ExternalProvider) {
    const library = new Web3Provider(provider);
    library.pollingInterval = 8000;
    return library;
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        padding: 0,
        margin: 0,
        maxWidth: "100vw",
        height: "100%",
        width: "100%",
        display: "flex",
        background:
          " url(images/dashboardImage.png)no-repeat center center fixed",
        backgroundSize: "cover",
        WebkitBackgroundSize: "cover",
      }}>
      <Web3ReactProvider getLibrary={getLibrary}>
        <Web3ProviderNetwork getLibrary={getLibrary}>
          <ThemeContextProvider>
            <Web3ReactManager>
              <Provider store={stores.reduxStore}>
                <PersistGate
                  loading={
                    <Typography variant="body-m-bold" color="white">
                      Loading...
                    </Typography>
                  }
                  persistor={persistor}>
                  <Layout>
                    <Component {...pageProps} />
                  </Layout>
                </PersistGate>
              </Provider>
            </Web3ReactManager>
          </ThemeContextProvider>
        </Web3ProviderNetwork>
      </Web3ReactProvider>
    </Box>
  );
}
