import React, { useState } from "react";

import defaultDark from "assets/default-dark.svg";
import defaultWhite from "assets/default-white.svg";
import { useThemeSwitcher } from "react-css-theme-switcher";

export default function IPFSImage({ uri }) {
  const { currentTheme } = useThemeSwitcher();

  if (uri !== "default") {
    return (
      <video autoPlay={true} loop={true} muted={true} playsInline={true} src={uri} alt="video"></video>
      // <img alt="nft" src={uri} />
    );
  }
  return <img alt="nft" src={currentTheme === "dark" ? defaultDark : defaultWhite} />;
}
