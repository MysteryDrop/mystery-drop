import React, { useState, useEffect } from "react";
import { DateTimeInput, PriceInput } from "components";

const MAX_PIECE_PRICE = 5;

export default function CollectionDetails({ dropDate, setDropDate, price, setPrice, onSubmit, goBack }) {
  useEffect(() => {
    console.log("INPUT STATE: " + price);
  }, [price]);

  // Form Validation
  const [dateError, setDateError] = useState();
  const [priceError, setPriceError] = useState();

  const ensureValid = () => {
    let errors = false;

    if (!dropDate) {
      setDateError("Drop Date Required");
      errors = true;
    } else if (Date.parse(dropDate) < Date.now()) {
      setDateError("Drop Date Must Be In The Future");
      errors = true;
    }
    if (!price || price === "") {
      setPriceError("Piece Price Required");
      errors = true;
    } else if (parseFloat(price) > MAX_PIECE_PRICE) {
      setPriceError("Piece Price Must Be Under 5 ETH");
      errors = true;
    }
    return errors;
  };

  // Reset Errors
  useEffect(() => {
    if (dropDate && Date.parse(dropDate) > Date.now()) {
      setDateError(null);
    }
  }, [dropDate]);

  useEffect(() => {
    if (price && parseFloat(price) < MAX_PIECE_PRICE) {
      setPriceError(null);
    }
  }, [price]);

  const submit = () => {
    const errors = ensureValid();
    if (!errors) {
      onSubmit();
    }
  };

  return (
    <>
      <DateTimeInput
        label="Drop Date"
        error={dateError}
        value={dropDate}
        onChange={event => {
          setDropDate(event.nativeEvent.target.value);
        }}
      />
      <PriceInput label="Piece Price" error={priceError} onChange={setPrice} value={price} />
      <div className="button-container">
        <button onClick={goBack} className="back button">
          Back
        </button>
        <button onClick={submit} className="next button is-primary">
          Next
        </button>
      </div>
    </>
  );
}
