import React from "react";
import logo from "assets/logo-small.svg";
import "./Hero.scss";

export default function Explore() {
  return (
    <div className="hero">
      <img alt="" src={logo} />
      <div className="info-container">
        <h1>
          Mystery <br />
          <span className="alt">Drop</span>
        </h1>
        <p>NFT collections that are hidden until the drop date.</p>
        <a href="/about">Learn More</a>
      </div>
    </div>
  );
}
