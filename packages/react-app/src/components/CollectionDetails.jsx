import React, { useState, useEffect } from "react";
import { DateTimeInput } from "components";

export default function CollectionDetails({ dropDate, setDropDate, onSubmit, goBack }) {
  // Form Validation
  const [dateError, setDateError] = useState();

  const ensureValid = () => {
    let errors = false;

    if (!dropDate) {
      setDateError("Drop Date Required");
      errors = true;
    } else if (Date.parse(dropDate) < Date.now()) {
      setDateError("Drop Date Must Be In The Future");
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
