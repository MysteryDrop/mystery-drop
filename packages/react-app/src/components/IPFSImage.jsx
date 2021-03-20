import React, { useState } from "react";
import defaultUri from "../assets/default.svg";

export default function IPFSImage({ hash }) {
  const [uri, setUri] = useState(defaultUri);

  return <img alt="nft" src={uri} />;
}
