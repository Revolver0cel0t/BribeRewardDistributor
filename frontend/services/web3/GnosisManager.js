import { SafeAppConnector, useSafeAppConnection } from "@gnosis.pm/safe-apps-web3-react";

const safeMultisigConnector = new SafeAppConnector();

export default function GnosisManager() {
  const triedToConnectToSafe = useSafeAppConnection(safeMultisigConnector);
  return null;
}
