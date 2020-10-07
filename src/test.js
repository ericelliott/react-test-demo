import React from "React";
import { describe } from "riteway";
import render from "riteway/render-component";
import match from "riteway/match";
import cuid from "cuid";

import InputForm from "./input-form";
import List from "./list";

describe("InputForm", async (assert) => {
  const $ = render(<InputForm />);

  assert({
    given: "no arguments",
    should: "render the text input field",
    actual: $(".text-input").length,
    expected: 1,
  });

  assert({
    given: "no arguments",
    should: "render the add to list button",
    actual: $(".add-to-list-button").length,
    expected: 1,
  });
});

describe("List", async (assert) => {
  const data = [
    { id: cuid(), text: "input 1" },
    { id: cuid(), text: "input 2" },
    { id: cuid(), text: "input 3" },
  ];
  const $ = render(<List data={data} />);

  assert({
    given: "a list of n fields",
    should: "render n items",
    actual: $(".item").length,
    expected: data.length,
  });

  {
    // we can locally scope the "contains" variable
    // with braces, so you can reuse the name in
    // other tests with no conflict.
    const contains = match($.html());
    const searchText = "input 1";

    assert({
      given: "text for the list items",
      should: "render the correct text",
      actual: contains(searchText),
      expected: searchText,
    });
  }
});
