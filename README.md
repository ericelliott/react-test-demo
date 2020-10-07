# Unit Testing React Apps

This is a quick overview of how Eric Elliott and the DevAnywhere crew unit test React apps.

The key concept to understand is that you want to isolate your presentation logic from your state logic, from your side-effects. Put all that code in 3 separate buckets. That isolation is known as "separation of concerns".

We use Redux to test all our state logic with pure functions.

With that hard part handled, all that's left to test is that our components render the right things given the provided props, and that everything works together end-to-end from the user's functional perspective.

We use and recommend [Redux-Saga](https://redux-saga.js.org/) to help isolate and test your side-effect logic.

For now, let's focus on how we test our React components.

## Getting Started

We build on the Next.js framework and Vercel serverless deployment stack. To get started:

```
npx create-next-app
```

`create-next-app` generates some sample pages in the `pages` folder. We don't need them, so let's delete them now:

```
rm -rf pages/*
```

When it's done, it's time to install all the things:

```
cd <your-app-name>
npm install --save-dev riteway watch tap-nirvana
```

Lint tools help you detect and correct errors, and prettier helps you keep your code formatted properly for consistent style:

````
npm install --save-dev eslint eslint-config-prettier eslint-plugin-prettier eslint-plugin-react prettier
```

You'll need Babel for transpiling and loading:

```
npm install --save-dev @babel/core @babel/polyfill @babel/preset-env @babel/preset-react @babel/register babel-loader
```

Now you'll need to configure all that. Make a couple config files:

`.babelrc`:

```js
{
  "env": {
    "development": {
      "presets": ["next/babel"]
    },
    "production": {
      "presets": ["next/babel"]
    },
    "test": {
      "presets": [
        "@babel/env",
        "@babel/react"
      ],
      "plugins": [
        "styled-jsx/babel"
      ]
    }
  }
}
```

`.eslintrc`:

```js
{
  "env": {
    "browser": true,
    "commonjs": true,
    "es6": true,
    "node": true
  },
  "plugins": [
    "react"
  ],
  "extends": ["eslint:recommended", "plugin:react/recommended", "plugin:prettier/recommended"],
  "parserOptions": {
    "sourceType": "module",
    "ecmaVersion": 2018
  },
  "settings": {
    "react": {
      "version": "detect"
    }
  },
  "rules": {
    "linebreak-style": ["error", "unix"]
  }
}
```

And then add some scripts to package.json:

```js
  "scripts": {
    "lint": "eslint --fix . && echo 'Lint complete.'",
    "test": "node -r @babel/register -r @babel/polyfill src/test.js | tap-nirvana",
    "watch": "watch 'clear && npm run -s test && npm run -s lint' src",
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
```

Then add a test to your test script. I usually start with this just to test the setup, but then delete it when I start to add more:

```
import { describe } from 'riteway';

describe('Test suite', async assert => {
  assert({
    given: 'no arguments',
    should: 'run tests',
    actual: true,
    expected: true
  });
});
```

Then run your tests:

```
❯ npm run test

> react-test-demo@0.1.0 test /Users/eric/dev/react-test-demo
> node -r @babel/register -r @babel/polyfill src/test.js | tap-nirvana


  Test suite
    ✔  Given no arguments: should run tests


  passed: 1,  failed: 0  of 1 tests  (777ms)
```


## A React Component Test

The best way to make React components testable is to make sure that your components:

* Given same props, always render the same outputs
* Have no side-effects
* Isolate state logic from presentation logic

Let's start with some requirements:

Build a component that takes text input and adds it to a list. The basic UI should look like this:

```
[<text input field...>        ]  [ Add to list ]
```

When the user clicks "add to list", add the text to a list.

Display the list below the input form.

Let's translate the first requirement into tests. Let's make sure we're rendering our input field. We'll need to import a React component helper from RITEway. Let's change our test file to:

```
import React from "React";
import { describe } from "riteway";
import render from "riteway/render-component";

import InputForm from "./input-form";

describe("InputForm", async (assert) => {
  const $ = render(<InputForm />);

  assert({
    given: "no arguments",
    should: "render the text input field",
    actual: $(".text-input").length,
    expected: 1,
  });
});
```

Let's turn on our watch script:

```
npm run watch
```

You should see an error:

```
Error: Cannot find module './input-form'
```

Let's fix that by creating an `input-form.js` module in the same directory:

```js
import React from "react";

const InputForm = () => <div></div>;

export default InputForm;
```

Now you should see:

```
 InputForm
    ✖  Given no arguments: should render the text input field
    ----------------------------------------------------------
        operator: deepEqual
        diff: "1" => "0"
        source: at _callee$ (/Users/eric/dev/react-test-demo/src/test.js:9:3)
        

  passed: 0,  failed: 1  of 1 tests  (848ms)
```

You always want to see your test fail before you make it pass. This is how we test our tests and prevent getting fooled by false positives because our test is buggy.

Let's make the test pass. Update the component so it looks like this:

```js
import React from "react";

const InputForm = () => (
  <div>
    <input className="text-input" type="text" />
  </div>
);

export default InputForm;
```

Let's add a test for the button. Update your describe block so it looks like the following code. You can make multiple assertions in the same describe block:

```
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
```

Your watch script should report a failing test:

```
 InputForm
    ✔  Given no arguments: should render the text input field
    ✖  Given no arguments: should render the add to list button
    ------------------------------------------------------------
        operator: deepEqual
        diff: "1" => "0"
        source: at _callee$ (/Users/eric/dev/react-test-demo/src/test.js:17:3)

  passed: 1,  failed: 1  of 2 tests  (869ms)
```

Let's fix it. Update your component to look like this:

```js
import React from "react";

const InputForm = () => (
  <div>
    <input className="text-input" type="text" />
    <button className="add-to-list-button">Add to list</button>
  </div>
);

export default InputForm;
```

Your tests should pass.

Now let's create a test for our list component. We're going to need unique ids for each element in our list, so let's install cuid:

```
npm install cuid
```

And import it into our test file, just below the "render" import:

```js
import cuid from "cuid";
```

We'll also need to import our `List` component, just below our `InputForm` component:

```js
import List from "./list";
```

And write a test:

```js
describe('List', async assert => {
  const data = [
    {id: cuid(), text: 'input 1'},
    {id: cuid(), text: 'input 2'},
    {id: cuid(), text: 'input 3'},
  ];
  const $ = render(<List data={data}>);

  assert({
    given: 'a list of n fields',
    should: 'render n items',
    actual: $(".item").length,
    expected: data.length
  });
});
```

Our watch script should be reporting that it can't find `./list`, so let's make it!

```js
import React from "react";

const List = () => <></>;

export default List;
```

And we should have a failing test:

```
List
    ✖  Given a list of n fields: should render n items
    ---------------------------------------------------
        operator: deepEqual
        diff: "3" => "0"
        source: at _callee2$ (/Users/eric/dev/react-test-demo/src/test.js:35:3)

passed: 2,  failed: 1  of 3 tests  (840ms)
```

Let's fix that. Start by installing `prop-types`:

```
npm install prop-types
```

Now we can use it in `list.js`:

```js
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
```

Now our tests should pass.

But that's not a very interesting test. What if we forgot the braces around `text` in the list items? That test would still pass. We need it to fail in that case. Let's remove the braces so the list item looks like this:

```js
      <li className="item" key={id}>
        text
      </li>
```

We'll get a lint error (this is why we lint!) but ignore it for now. Let's write a test that will break for this case.

This time we're going to import `match` from RITEway, just below the render import. Then add the new test so our list tests look like this:

```js
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
```

The great thing about `match` is that if the test fails, it will tell you the text it was expecting, and an empty string for the `actual` value, which will be much more useful output than the true/false booleans you get from most text matching unit test assertions.