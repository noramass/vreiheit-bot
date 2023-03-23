import React from "react";
import { FieldBase } from "src/component/form/field/base/field-base";

function App() {
  return (
    <div className="px-3">
      <div>Hello World :) {process.env.GIT_HASH}</div>
      <FieldBase
        label="my field"
        name="myField"
        required
        value="fe"
        onChange={console.log}
      />
    </div>
  );
}

export default App;
