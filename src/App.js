import React, { useState } from "react";

function App() {
  const [data, setData] = useState([[]]);

  function handleSubmit(input) {
    const reader = new FileReader();
    reader.onload = event => {
      setData(parseCSV(event.target.result))
    }
    reader.readAsText(input);
  }

  return (
    <div className="App">
      <FileInput onSubmit={handleSubmit} />
    </div>
  );
}

function FileInput({ onSubmit }) {
  const [file, setFile] = useState();

  function handleSubmit(e) {
    e.preventDefault();

    if (!file) {
      alert("You haven't selected any files.");
      return;
    }

    onSubmit(file);
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="file"
        name="fileInput"
        id="fileInput"
        accept=".csv"
        multiple={false}
        onChange={(e) => setFile(e.target.files[0])}
      />
      <button
        type="submit"
        disabled={!file}
      >
        Submit
      </button>
    </form>
  )
}
export default App;
