import React, { memo, FC } from "react";

import Logo from "./Logo";

type CurrencyLogoProps = { token: any; size?: number };

const CurrencyLogo: FC<CurrencyLogoProps> = memo(
  ({ token, size = 24 }: CurrencyLogoProps) => {
    return <Logo src={token?.logoURI} width={size} height={size} />;
  }
);

export default CurrencyLogo;
