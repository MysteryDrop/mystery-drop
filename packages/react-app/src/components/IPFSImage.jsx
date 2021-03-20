import React, { useState } from "react";
import defaultDark from "../assets/default-dark.svg";
import defaultWhite from "../assets/default-white.svg";
import { useThemeSwitcher } from "react-css-theme-switcher";

export default function IPFSImage({ hash }) {
  const { currentTheme } = useThemeSwitcher();
  const [uri, setUri] = useState(null);

  return <img alt="nft" src={uri ? uri : currentTheme === "dark" ? defaultDark : defaultWhite} />;
}
