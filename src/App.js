import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Circle, Popup } from 'react-leaflet'
import osgridref from "geodesy/osgridref";

function App() {
  const [data, setData] = useState();
  const [markers, setMarkers] = useState([]);

  useEffect(() => {
    if (!data) return;

    // Gets the indexes of the eastings/northings and longitude/latitude and status of stop.
    const eastIndex = data[0].findIndex(value => value === "Easting");
    const northIndex = data[0].findIndex(value => value === "Northing");
    const longIndex = data[0].findIndex(value => value === "Longitude");
    const latIndex = data[0].findIndex(value => value === "Latitude");
    const statusIndex = data[0].findIndex(value => value === "Status");
    let tempMarkers = [];

    // Checks if indexes of the eastings/northings and longitude/latitude exist.
    if (!((eastIndex !== -1 && northIndex !== -1) || (longIndex !== -1 && latIndex !== -1))) {
      console.error("The file contains improper Eastings/Northings or Longitude/Latitude.");
      alert("The file contains improper Eastings/Northings or Longitude/Latitude.");
    }

    // For each row in data.
    data.slice(1).forEach((value, index) => {

      let longitude = NaN, latitude = NaN;

      // If LatLon exists, get coords.
      if (value[longIndex] !== "" && value[latIndex] !== "") {
        longitude = parseFloat(value[longIndex]);
        latitude = parseFloat(value[latIndex]);

      // If Eastings/Northings exists, convert osgridref coords to latlon using Geodesy library.
      } else if (value[eastIndex] !== "" && value[northIndex] !== "") {
        const converted = new osgridref(parseFloat(value[eastIndex]), parseFloat(value[northIndex])).toLatLon();
        longitude = converted.longitude;
        latitude = converted.latitude;
      }

      // If extraction or conversion of coords was successful.
      if (isNaN(longitude) || isNaN(latitude)) return;

      // Creates circle map marker and adds to array of map markers. Contains popup that display extra information on click.
      tempMarkers.push(
        <Circle
          key={index}
          center={[ latitude, longitude ]}
          color={ value[statusIndex] === "active" ? "blue" : "orange" } // Display different colour for inactive stops.
        >
          <Popup>
            {
              <table>
                <tbody>
                {
                  value.map((item, index2) => {
                    if (item === "") return null; // If row item has empty value, don't show.
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

    // If no markers were created, something must be wrong with the coordinate data in the file.
    if (tempMarkers.length === 0) {
      window.alert("It seems like the file doesn't have Easting/Northing or Latitude/Longitude coordinates. Please try a different file.")
    }

    setMarkers(tempMarkers);
  }, [data])


  // Checks and stores file data.
  function handleSubmit(input) {
    console.log(input);

    // If file is big, confirm if user still wants to use file.
    if (input.size > 500000) if (!window.confirm("This file is big. Prosessing this file might slow down or crash the browser. Are you sure you want to run?")) return;

    // Parse file and store data.
    const reader = new FileReader();
    reader.onload = event => {
      setData(parseCSV(event.target.result))
    }
    reader.readAsText(input);
  }

  // Prompts user to clear the map and clears data.
  function handleReset() {
    if (!data) return;
    if (!window.confirm("Are you sure you want to clear the map?")) return;

    setData();
    setMarkers([]);
  }

  // Displays the map with Open Street Map layer.
  return (
    <div className="App" style={{ height: "100vh" }}>
      <FileInput
        onSubmit={handleSubmit}
        onReset={handleReset}
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

/**
 * Displays form prompting the user to input file.
 */
function FileInput({ onSubmit, onReset }) {
  const [file, setFile] = useState();

  // Checks if file has been attached before sending to parent.
  function handleSubmit(e) {
    e.preventDefault();

    if (!file) {
      alert("You haven't selected any files.");
      return;
    }

    onSubmit(file);
  }

  function handleReset(_e) {
    setFile();
    onReset();
  }

  return (
    <form onSubmit={handleSubmit} onReset={handleReset}>
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
        Remove file / Clear Map
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
      if (cc === '"' && quote && nc === '"') { arr[row][col] += cc; ++c; continue; }

      // If it's just one quotation mark, begin/end quoted field
      if (cc === '"') { quote = !quote; continue; }

      // If it's a comma and we're not in a quoted field, move on to the next column
      if (cc === ',' && !quote) { ++col; continue; }

      // If it's a newline (CRLF) and we're not in a quoted field, skip the next character
      // and move on to the next row and move to column 0 of that new row
      if (cc === '\r' && nc === '\n' && !quote) { ++row; col = 0; ++c; continue; }

      // If it's a newline (LF or CR) and we're not in a quoted field,
      // move on to the next row and move to column 0 of that new row
      if (cc === '\n' && !quote) { ++row; col = 0; continue; }
      if (cc === '\r' && !quote) { ++row; col = 0; continue; }

      // Otherwise, append the current character to the current column
      arr[row][col] += cc;
  }
  return arr;
}

export default App;
