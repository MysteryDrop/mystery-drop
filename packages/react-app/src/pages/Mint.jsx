import React, { useState } from "react";
import { FileInput, TextInput, DateTimeInput } from "components";
import { ReactComponent as EditIcon } from "assets/edit-icon.svg";
import { ReactComponent as AddIcon } from "assets/add-icon.svg";
import { ReactComponent as TrashIcon } from "assets/trash-icon.svg";
import { ReactComponent as ExitIcon } from "assets/exit-icon.svg";
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

  const setArtworkImage = image => {
    setArtworks([
      ...artworks.slice(0, editing),
      {
        ...artworks[editing],
        image,
      },
      ...artworks.slice(editing + 1),
    ]);
  };

  const setArtworkName = event => {
    const title = event.nativeEvent.target.value;
    setArtworks([
      ...artworks.slice(0, editing),
      {
        ...artworks[editing],
        title,
      },
      ...artworks.slice(editing + 1),
    ]);
  };

  const setArtworkDesc = event => {
    const description = event.nativeEvent.target.value;
    setArtworks([
      ...artworks.slice(0, editing),
      {
        ...artworks[editing],
        description,
      },
      ...artworks.slice(editing + 1),
    ]);
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
        {editing >= 0 ? (
          <div className="edit-modal" key={editing}>
            <ExitIcon className="exit" onClick={() => setEditing(-1)} />
            <FileInput
              label="Preview Image"
              name={`artwork-${editing}`}
              onChange={setArtworkImage}
              defaultImg={artworks[editing].image}
            />
            <TextInput
              label="Name"
              placeholder="Eg. Splash"
              name={`title-${editing}`}
              onChange={setArtworkName}
              defaultText={artworks[editing].title}
            />
            <TextInput
              label="Description"
              placeholder="Eg. 1 of 3 randomly generated artworks in..."
              multiline={true}
              name={`description-${editing}`}
              onChange={setArtworkDesc}
              defaultText={artworks[editing].description}
            />
          </div>
        ) : null}
      </div>
      <DateTimeInput label="Drop Date" />
      <button className="submit">Mint Collection</button>
    </div>
  );
}
