import React from "react";
import "./Header.css";
import logo from "../assets/logo.png";

// displays a page header

export default function Header() {
  return (
    <div id="nav">
      <img className="logo" alt="logo" src={logo} />
    </div>
  );
}
