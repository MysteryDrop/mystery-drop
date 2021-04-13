import React, { useState, useEffect, useRef } from "react";
import { useQueryClient } from 'react-query'
import axios, { AxiosResponse } from "axios";
import { v4 as uuid } from "uuid";

import { FileInput, TextInput, DateTimeInput } from "components";
import { ReactComponent as ModalIndicator } from "assets/modal-indicator.svg";
import { ReactComponent as EditIcon } from "assets/edit-icon.svg";
import { ReactComponent as AddIcon } from "assets/add-icon.svg";
import { ReactComponent as TrashIcon } from "assets/trash-icon.svg";
import { ReactComponent as ExitIcon } from "assets/exit-icon.svg";
import noImage from "assets/no-image.svg";
import "./Mint.scss";
import MysteryDropAuth from "components/MysteryDropAuth";
import { logout } from "util/auth";
import { apiRequest } from "../util/util";
import Drops from "components/Drops";

const MAX_ARTWORKS = 6;
const MAX_TITLE_LENGTH = 25;
const MAX_DESCRIPTION_LENGTH = 250;

async function logDrops({ jwtAuthToken }) {
  const result = await apiRequest({ path: "v1/getDrops", method: "GET", accessToken: jwtAuthToken });
  console.log({ result });
}

export async function uploadDrop({ jwtAuthToken, bannerImg, title, description, dropDate, artworks }) {
  const contentMap = {};
  const numberOfItems = artworks.length;
  const metadata = {
    contentType: bannerImg.type,
    dropTitle: title,
    dropDescription: description,
    numberOfItems: numberOfItems,
    content: artworks.map(a => {
      const contentId = uuid();
      contentMap[contentId] = a;
      return {
        contentId,
        contentType: a.image.type,
        contentTitle: a.title,
        contentDescription: a.description,
      };
    }),
  };
  console.log({ metadata });
  console.log({ jwtAuthToken });
  const initiateResult = await apiRequest({
    path: "v1/initiateUpload",
    method: "POST",
    data: metadata,
    accessToken: jwtAuthToken,
  });
  console.log(JSON.stringify(initiateResult));

  // Upload preview
  await axios.put(initiateResult.result.dropPreviewUrl, bannerImg, {
    headers: {
      "Content-Type": bannerImg.type,
    },
  });

  // upload each artwork
  for (let index = 0; index < numberOfItems; index++) {
    await axios.put(
      initiateResult.result.content[index].url,
      contentMap[initiateResult.result.content[index].contentId].image,
      {
        headers: {
          "Content-Type": bannerImg.type,
        },
      },
    );
  }

}

export default function Mint({ provider, jwtAuthToken, setJwtAuthToken }) {
  const [artworks, setArtworks] = useState([]);
  const [editing, setEditing] = useState(-1);
  const [bannerImg, setBannerImg] = useState();
  const [title, setTitle] = useState();
  const [description, setDescription] = useState();
  const [dropDate, setDropDate] = useState();
  const modal = useRef();
  const queryClient = useQueryClient()

  const submit = async () => {
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
      await uploadDrop({ jwtAuthToken, bannerImg, title, description, dropDate, artworks });
      queryClient.invalidateQueries('userDrops')
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
    artworks.forEach((artwork, index) => {
      let artErrors = {};
      if (!artwork.image) {
        artErrors = { ...artErrors, imageError: "Image Required" };
      }
      if (!artwork.title) {
        artErrors = { ...artErrors, titleError: "Title Required" };
      } else if (artwork.title.length > MAX_TITLE_LENGTH) {
        artErrors = { ...artErrors, titleError: `Must Be Under ${MAX_TITLE_LENGTH} Characters` };
      }
      if (!artwork.description) {
        artErrors = { ...artErrors, descError: "Description Required" };
      } else if (artwork.description.length > MAX_DESCRIPTION_LENGTH) {
        artErrors = { ...artErrors, descError: `Must Be Under ${MAX_DESCRIPTION_LENGTH} Characters` };
      }
      setArtworkAttribute(index, artErrors);
      errors = Object.keys(artErrors).length !== 0;
    });

    return errors;
  };

  // Reset Errors
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

    // Remove Each artwork error on change
    artworks.forEach((artwork, index) => {
      let toRemove = {};
      if (artwork.image && artwork.imageError !== null) {
        toRemove = { ...toRemove, imageError: null };
      }
      if (artwork.title && artwork.title.length < MAX_TITLE_LENGTH && artwork.titleError !== null) {
        toRemove = { ...toRemove, titleError: null };
      }
      if (artwork.description && artwork.description.length < MAX_DESCRIPTION_LENGTH && artwork.descError !== null) {
        toRemove = { ...toRemove, descError: null };
      }
      if (Object.keys(toRemove).length !== 0) {
        setArtworkAttribute(index, toRemove);
      }
    });
  }, [artworks]);

  const renderCard = ({ title, titleError, image, imageError, description, descError }, index) => (
    <div className="card" key={index}>
      <div className={`art-card fade-in ${titleError || imageError || descError ? "error" : null}`}>
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

  const setArtworkAttribute = (index, changes) => {
    setArtworks([
      ...artworks.slice(0, index),
      {
        ...artworks[index],
        ...changes,
      },
      ...artworks.slice(index + 1),
    ]);
  };

  const setArtworkDescError = (index, error) => {
    setArtworks([
      ...artworks.slice(0, index),
      {
        ...artworks[index],
        descError: error,
      },
      ...artworks.slice(index + 1),
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

  return jwtAuthToken ? (
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
        defaultText={title}
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
        defaultText={description}
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
              error={artworks[editing]?.imageError}
              name={`artwork-${editing}`}
              onChange={image => {
                setArtworkAttribute(editing, {
                  image,
                });
              }}
              defaultImg={artworks[editing]?.image}
            />
            <TextInput
              label="Name"
              error={artworks[editing]?.titleError}
              placeholder="Eg. Splash"
              name={`title-${editing}`}
              onChange={event => {
                setArtworkAttribute(editing, {
                  title: event.nativeEvent.target.value,
                });
              }}
              defaultText={artworks[editing]?.title}
            />
            <TextInput
              label="Description"
              error={artworks[editing]?.descError}
              placeholder="Eg. 1 of 3 randomly generated artworks in..."
              multiline={true}
              name={`description-${editing}`}
              onChange={event => {
                setArtworkAttribute(editing, {
                  description: event.nativeEvent.target.value,
                });
              }}
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
        Upload Collection
      </button>
      <button onClick={() => logDrops({ jwtAuthToken })} className="button is-primary">
        Log Drops
      </button>
      <button onClick={() => logout({ setJwtAuthToken })} className="button is-primary">
        Logout
      </button>
      <Drops jwtAuthToken={jwtAuthToken} />
    </div>
  ) : (
    <MysteryDropAuth provider={provider} jwtAuthToken={jwtAuthToken} setJwtAuthToken={setJwtAuthToken} />
  );
}
