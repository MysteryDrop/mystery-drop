import React from "react";
import "./SectionSelector.scss";

export default function SectionSelector({ sections, selected, setSelected }) {
  return (
    <div className="section-selector">
      {sections.map(section => (
        <div
          key={section}
          className={`section ${section === selected ? "selected" : ""}`}
          onClick={() => {
            setSelected(section);
          }}
        >
          {section}
        </div>
      ))}
    </div>
  );
}
