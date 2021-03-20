import React, { useState } from "react";

import defaultDark from "../assets/default-dark.svg";
import defaultWhite from "../assets/default-white.svg";
import { useThemeSwitcher } from "react-css-theme-switcher";

export default function IPFSImage({ uri }) {
  const { currentTheme } = useThemeSwitcher();

  return <img alt="nft" src={uri !== "default" ? uri : currentTheme === "dark" ? defaultDark : defaultWhite} />;
}
