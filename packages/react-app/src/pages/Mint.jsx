import React, { useState, useEffect, useRef } from "react";
import { FileInput, TextInput, DateTimeInput } from "components";
import { ReactComponent as ModalIndicator } from "assets/modal-indicator.svg";
import { ReactComponent as EditIcon } from "assets/edit-icon.svg";
import { ReactComponent as AddIcon } from "assets/add-icon.svg";
import { ReactComponent as TrashIcon } from "assets/trash-icon.svg";
import { ReactComponent as ExitIcon } from "assets/exit-icon.svg";
import noImage from "assets/no-image.svg";
import "./Mint.scss";

const MAX_ARTWORKS = 6;
const MAX_TITLE_LENGTH = 25;
const MAX_DESCRIPTION_LENGTH = 250;

export default function Mint() {
  const [artworks, setArtworks] = useState([]);
  const [editing, setEditing] = useState(-1);
  const [bannerImg, setBannerImg] = useState();
  const [title, setTitle] = useState();
  const [description, setDescription] = useState();
  const [dropDate, setDropDate] = useState();
  const modal = useRef();

  const submit = () => {
    const errors = ensureValid();

    if (!errors) {
      console.log(
        "SUBMITING",
        JSON.stringify(
          {
            bannerImg,
            title,
            description,
            dropDate,
            artworks,
          },
          null,
          2,
        ),
      );
    }
  };

  // Form validation
  const [bannerError, setBannerError] = useState();
  const [titleError, setTitleError] = useState();
  const [descError, setDescError] = useState();
  const [dateError, setDateError] = useState();
  const [noCardError, setNoCardError] = useState();

  const ensureValid = () => {
    let errors = false;
    if (!bannerImg) {
      setBannerError("Banner Image Required");
      errors = true;
    }
    if (!title) {
      setTitleError("Title Required");
      errors = true;
    } else if (title.length > MAX_TITLE_LENGTH) {
      setTitleError(`Must Be Under ${MAX_TITLE_LENGTH} Characters`);
      errors = true;
    }
    if (!description) {
      setDescError("Description Required");
      errors = true;
    } else if (description.length > MAX_DESCRIPTION_LENGTH) {
      setDescError(`Must Be Under ${MAX_DESCRIPTION_LENGTH} Characters`);
      errors = true;
    }
    if (artworks.length < 1) {
      setNoCardError("Must Upload Artworks");
      errors = true;
    }
    if (!dropDate) {
      setDateError("Drop Date Required");
      errors = true;
    } else if (Date.parse(dropDate) < Date.now()) {
      setDateError("Drop Date Must Be In The Future");
      errors = true;
    }
    return errors;
  };

  useEffect(() => {
    if (bannerImg) {
      setBannerError(null);
    }
  }, [bannerImg]);

  useEffect(() => {
    if (title && title.length < MAX_TITLE_LENGTH) {
      setTitleError(null);
    }
  }, [title]);

  useEffect(() => {
    if (description && description.length < MAX_DESCRIPTION_LENGTH) {
      setDescError(null);
    }
  }, [description]);

  useEffect(() => {
    if (dropDate && Date.parse(dropDate) > Date.now()) {
      setDateError(null);
    }
  }, [dropDate]);

  useEffect(() => {
    if (artworks.length > 0) {
      setNoCardError(null);
    }
  }, [artworks]);

  const renderCard = ({ title, image, description }, index) => (
    <div className="card" key={index}>
      <div className="art-card fade-in">
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

  const setModalPosition = () => {
    const indicator = document.querySelector(".modal-indicator");

    const modal = document.querySelector(".modal-wrapper");
    const editingCardRect = document.querySelectorAll(".art-card")[editing].getBoundingClientRect();
    const artworksRect = document.querySelector(".artworks").getBoundingClientRect();
    const heightOffset = editingCardRect.bottom - artworksRect.top;
    modal.style.top = `${heightOffset + 10}px`;

    if (window.innerWidth < 500) {
      switch (editing % 2) {
        case 0:
          indicator.style.marginLeft = "-25%";
          break;
        case 1:
          indicator.style.marginLeft = "25%";
          break;
      }
    } else {
      switch (editing % 3) {
        case 0:
          indicator.style.marginLeft = `-${100 / 3}%`;
          break;
        case 1:
          indicator.style.marginLeft = 0;
          break;
        case 2:
          indicator.style.marginLeft = `${100 / 3}%`;
          break;
      }
    }
  };

  // Animations
  useEffect(() => {
    if (modal.current) {
      if (editing < 0) {
        modal.current.classList.add("collapsed");
      } else {
        setModalPosition();
        modal.current.classList.remove("collapsed");
      }
    }
  }, [editing]);

  useEffect(() => {
    document.querySelectorAll(".fade-in").forEach(element => {
      element.classList.add("visible");
    });
  }, [artworks]);

  return (
    <div className="create-collection">
      <h1>Create Collection</h1>
      <FileInput error={bannerError} label="Preview Image" name="bannerImg" onChange={setBannerImg} />
      <TextInput
        label="Name"
        placeholder="Eg. Splash"
        name="title"
        error={titleError}
        onChange={event => {
          setTitle(event.nativeEvent.target.value);
        }}
      />
      <TextInput
        multiline={true}
        label="Description"
        placeholder="Eg. A collection of randomly generated..."
        name="description"
        error={descError}
        onChange={event => {
          setDescription(event.nativeEvent.target.value);
        }}
      />
      <div className="artworks">
        <h4>Artworks</h4>
        <div className="artwork-card-container">
          {artworks?.map(renderCard)}
          {artworks.length < MAX_ARTWORKS ? (
            <div className="card">
              <div className={`new-card fade-in ${noCardError ? "error" : null}`} onClick={addCard}>
                <AddIcon />
                <p>Add New</p>
              </div>
              <p className="error-message">{noCardError}</p>
            </div>
          ) : null}
        </div>
        <div className="modal-wrapper collapsed" key={editing} ref={modal}>
          <ModalIndicator className="modal-indicator" />
          <div className="edit-modal">
            <ExitIcon className="exit" onClick={() => setEditing(-1)} />
            <FileInput
              label="Preview Image"
              name={`artwork-${editing}`}
              onChange={setArtworkImage}
              defaultImg={artworks[editing]?.image}
            />
            <TextInput
              label="Name"
              placeholder="Eg. Splash"
              name={`title-${editing}`}
              onChange={setArtworkName}
              defaultText={artworks[editing]?.title}
            />
            <TextInput
              label="Description"
              placeholder="Eg. 1 of 3 randomly generated artworks in..."
              multiline={true}
              name={`description-${editing}`}
              onChange={setArtworkDesc}
              defaultText={artworks[editing]?.description}
            />
          </div>
        </div>
      </div>
      <DateTimeInput
        label="Drop Date"
        error={dateError}
        onChange={event => {
          setDropDate(event.nativeEvent.target.value);
        }}
      />
      <button onClick={submit} className="submit">
        Mint Collection
      </button>
    </div>
  );
}
