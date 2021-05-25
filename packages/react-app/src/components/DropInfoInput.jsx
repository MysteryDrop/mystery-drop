import React, { useState, useEffect, useRef } from "react";
import { FileInput, TextInput, DateTimeInput, PriceInput } from "components";
import { ReactComponent as ModalIndicator } from "assets/modal-indicator.svg";
import { ReactComponent as EditIcon } from "assets/edit-icon.svg";
import { ReactComponent as AddIcon } from "assets/add-icon.svg";
import { ReactComponent as TrashIcon } from "assets/trash-icon.svg";
import { ReactComponent as ExitIcon } from "assets/exit-icon.svg";
import noImage from "assets/no-image.svg";

const MAX_ARTWORKS = 6;
const MAX_TITLE_LENGTH = 250;
const MAX_DESCRIPTION_LENGTH = 1000;
const MAX_DROP_PRICE = 5;

export default function CollectionUpload({
  artworks,
  setArtworks,
  bannerImg,
  setBannerImg,
  title,
  setTitle,
  description,
  setDescription,
  onSubmit,
  dropDate,
  setDropDate,
  price,
  setPrice,
}) {
  const modal = useRef();
  const [editing, setEditing] = useState(-1);

  // Form validation
  const [bannerError, setBannerError] = useState();
  const [titleError, setTitleError] = useState();
  const [descError, setDescError] = useState();
  const [noCardError, setNoCardError] = useState();
  const [dateError, setDateError] = useState();
  const [priceError, setPriceError] = useState();

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
    if (!price || price === "") {
      setPriceError("Drop Price Required");
      errors = true;
    } else if (parseFloat(price) > MAX_DROP_PRICE) {
      setPriceError("Piece Price Must Be Under 5 ETH");
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
    if (price && parseFloat(price) < MAX_DROP_PRICE) {
      setPriceError(null);
    }
  }, [price]);

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

  const submit = () => {
    const errors = ensureValid();
    if (!errors) {
      onSubmit();
    }
  };

  const renderCard = ({ title, titleError, image, imageError, description, descError }, index) => (
    <div className="card" key={index}>
      <div className={`art-card fade-in ${titleError || imageError || descError ? "error" : null}`}>
        <img alt="preview" src={image?.localUrl || noImage} />
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

  return (
    <>
      <FileInput error={bannerError} label="Thumbnail" name="bannerImg" onChange={setBannerImg} file={bannerImg} />
      <TextInput
        label="Drop Name"
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
        label="Drop Description"
        placeholder="Eg. A collection of randomly generated..."
        name="description"
        error={descError}
        onChange={event => {
          setDescription(event.nativeEvent.target.value);
        }}
        defaultText={description}
      />
      <DateTimeInput
        label="Release Date"
        error={dateError}
        value={dropDate}
        onChange={event => {
          setDropDate(event.nativeEvent.target.value);
        }}
      />
      <PriceInput label="Total Price" error={priceError} onChange={setPrice} value={price} />
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
              file={artworks[editing]?.image}
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
        <div className="button-container">
          <button onClick={submit} className=".next button is-primary">
            Next
          </button>
        </div>
      </div>
    </>
  );
}
