import React from "react";
import "./Header.css";
import { useThemeSwitcher } from "react-css-theme-switcher";
import logoWhite from "../assets/mysteryDrop-logo-white.svg";
import logoDark from "../assets/mysteryDrop-logo-dark.svg";

// displays a page header

export default function Header() {
  const { currentTheme } = useThemeSwitcher();

  return (
    <div id="nav">
      <img className="logo" alt="logo" src={currentTheme === "light" ? logoDark : logoWhite} />
    </div>
  );
}
