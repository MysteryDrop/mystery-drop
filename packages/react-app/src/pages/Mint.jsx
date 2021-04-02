import React, { useState } from "react";
import { FileInput, TextInput } from "components";
import { ReactComponent as EditIcon } from "assets/edit-icon.svg";
import { ReactComponent as AddIcon } from "assets/add-icon.svg";
import "./Mint.scss";

const MAX_ARTWORKS = 6;

export default function Mint() {
  const [artworks, setArtworks] = useState([]);
  const [editting, setEditting] = useState(-1);

  const renderCard = ({ title, image, description }) => (
    <div className="art-card">
      <img alt="preview" src={image} />
      <div>
        <EditIcon />
      </div>
      <div>
        <h4>{title || "Title"}</h4>
        <p>{description || "Description"}</p>
      </div>
    </div>
  );

  return (
    <div className="create-collection">
      <h1>Create Collection</h1>
      <FileInput label="Preview Image" name="bannerImg" />
      <TextInput label="Name" placeholder="Eg. Splash" name="title" />
      <TextInput
        multiline={true}
        label="Description"
        placeholder="Eg. A collection of randomly generated..."
        name="description"
      />
      <div className="artworks">
        <h4>Artworks</h4>
        {artworks?.map(renderCard)}
        {artworks.length < MAX_ARTWORKS ? (
          <div className="new-card">
            <AddIcon />
            <p>Add New</p>
          </div>
        ) : null}
      </div>
      {editting ? <div /> : null}
      <button>Mint Collection</button>
    </div>
  );
}
