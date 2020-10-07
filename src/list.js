import React from "react";
import { array } from "prop-types";

const List = ({ data }) => (
  <ul>
    {data.map(({ id, text }) => (
      <li className="item" key={id}>
        {text}
      </li>
    ))}
  </ul>
);
List.propTypes = {
  data: array,
};

export default List;
