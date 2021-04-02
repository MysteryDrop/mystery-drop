import React, { useState } from "react";
import { FileInput, TextInput } from "components";
import { ReactComponent as EditIcon } from "assets/edit-icon.svg";
import { ReactComponent as AddIcon } from "assets/add-icon.svg";
import { ReactComponent as TrashIcon } from "assets/trash-icon.svg";
import noImage from "assets/no-image.svg";
import "./Mint.scss";

const MAX_ARTWORKS = 6;

export default function Mint() {
  const [artworks, setArtworks] = useState([]);
  const [editing, setEditing] = useState(-1);

  const renderCard = ({ title, image, description }, index) => (
    <div className="card">
      <div className="art-card">
        <img alt="preview" src={image || noImage} />
        <div
          className={editing === index ? "action-icon editing" : "action-icon"}
          onClick={() => {
            if (editing === index) {
              setArtworks(artworks.filter((item, ind) => ind !== index));
              setEditing(-1);
            } else {
              setEditing(index);
            }
          }}
        >
          {editing === index ? <TrashIcon /> : <EditIcon />}
        </div>
        <div className="info-container">
          <h4>{title || "Title"}</h4>
          <p>{description || "Description"}</p>
        </div>
      </div>
    </div>
  );

  const addCard = () => {
    setArtworks([...artworks, {}]);
    setEditing(artworks.length);
  };

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
        <div className="artwork-card-container">
          {artworks?.map(renderCard)}
          {artworks.length < MAX_ARTWORKS ? (
            <div className="card">
              <div className="new-card" onClick={addCard}>
                <AddIcon />
                <p>Add New</p>
              </div>
            </div>
          ) : null}
        </div>
      </div>
      {editing ? <div /> : null}
      <button>Mint Collection</button>
    </div>
  );
}
