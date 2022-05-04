import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Circle, Popup } from 'react-leaflet'

function App() {
  const [data, setData] = useState([[]]);
  const [markers, setMarkers] = useState([]);

  useEffect(() => {
    if (data.length === 0) return;

    const longIndex = data[0].findIndex(value => value === "Longitude");
    const latIndex = data[0].findIndex(value => value === "Latitude");
    let tempMarkers = [];

    if (longIndex === -1 || latIndex === -1) return;

    data.slice(1).forEach((value, index) => {

      const longitude = parseFloat(value[longIndex]);
      const latitude = parseFloat(value[latIndex]);

      if (Number.isNaN(longitude) || Number.isNaN(latitude)) return;

      tempMarkers.push(
        <Circle key={index} center={[ latitude, longitude ]}>
          <Popup>
            {
              <table>
                <tbody>
                {
                  value.map((item, index2) => {
                    if (item === "") return null;
                    return (
                      <tr key={`${index}.${index2}`}>
                        <th>{data[0][index2]}</th>
                        <td>{item}</td>
                      </tr>
                    )
                  })
                }
                </tbody>
              </table>
            }
          </Popup>
        </Circle>
      )
    });

    if (tempMarkers.length === 0) {
      window.alert("It seems like the file doesn't have Latitude/Longitude coordinates. Please try a different file.")
    }

    setMarkers(tempMarkers);
  }, [data])


  function handleSubmit(input) {
    console.log(input);

    if (input.size > 500000) {
      if (!window.confirm("This file is big. Prosessing this file might slow down or crash the browser. Are you sure you want to run?")) return;
    }

    const reader = new FileReader();
    reader.onload = event => {
      setData(parseCSV(event.target.result))
    }
    reader.readAsText(input);
  }

  return (
    <div className="App" style={{ height: "100vh" }}>
      <FileInput
        onSubmit={handleSubmit}
      />
      <MapContainer
        center={[54.093, -2.894]}
        zoom={6}
        minZoom={6}
        style={{ height: "100%" }}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {
          markers.length === 0 ? null : markers.map(value => value)
        }
      </MapContainer>
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
      <button
        type="reset"
      >
        Reset
      </button>
    </form>
  )
}

/**
 * Converts the CSV data into an array.
 * Taken from https://stackoverflow.com/a/14991797.
 * @param {String} str The input data.
 * @returns Array containing the data.
 */
function parseCSV(str) {
  let arr = [];
  let quote = false;  // 'true' means we're inside a quoted field

  // Iterate over each character, keep track of current row and column (of the returned array)
  for (var row = 0, col = 0, c = 0; c < str.length; c++) {
      var cc = str[c], nc = str[c+1];        // Current character, next character
      arr[row] = arr[row] || [];             // Create a new row if necessary
      arr[row][col] = arr[row][col] || '';   // Create a new column (start with empty string) if necessary

      // If the current character is a quotation mark, and we're inside a
      // quoted field, and the next character is also a quotation mark,
      // add a quotation mark to the current column and skip the next character
      if (cc == '"' && quote && nc == '"') { arr[row][col] += cc; ++c; continue; }

      // If it's just one quotation mark, begin/end quoted field
      if (cc == '"') { quote = !quote; continue; }

      // If it's a comma and we're not in a quoted field, move on to the next column
      if (cc == ',' && !quote) { ++col; continue; }

      // If it's a newline (CRLF) and we're not in a quoted field, skip the next character
      // and move on to the next row and move to column 0 of that new row
      if (cc == '\r' && nc == '\n' && !quote) { ++row; col = 0; ++c; continue; }

      // If it's a newline (LF or CR) and we're not in a quoted field,
      // move on to the next row and move to column 0 of that new row
      if (cc == '\n' && !quote) { ++row; col = 0; continue; }
      if (cc == '\r' && !quote) { ++row; col = 0; continue; }

      // Otherwise, append the current character to the current column
      arr[row][col] += cc;
  }
  return arr;
}

export default App;
