import React from "react";
import "./App.css";
import "../node_modules/react-vis/dist/style.css";
import {
  HeatmapSeries,
  VerticalBarSeries,
  MarkSeries,
  XYPlot,
  LineSeries,
  VerticalGridLines,
  HorizontalGridLines,
  XAxis,
  YAxis,
} from "react-vis";
import axios from "axios";
import ReactDOM from "react-dom";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { value: "", datos: [] };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  componentDidMount() {}

  csvToArray(strData, strDelimiter) {
    // Check to see if the delimiter is defined. If not,
    // then default to comma.
    strDelimiter = strDelimiter || ";";
    // Create a regular expression to parse the CSV values.
    var objPattern = new RegExp(
      // Delimiters.
      "(\\" +
        strDelimiter +
        "|\\r?\\n|\\r|^)" +
        // Quoted fields.
        '(?:"([^"]*(?:""[^"]*)*)"|' +
        // Standard fields.
        '([^"\\' +
        strDelimiter +
        "\\r\\n]*))",
      "gi"
    );
    // Create an array to hold our data. Give the array
    // a default empty first row.
    var arrData = [[]];
    // Create an array to hold our individual pattern
    // matching groups.
    var arrMatches = null;
    // Keep looping over the regular expression matches
    // until we can no longer find a match.
    while ((arrMatches = objPattern.exec(strData))) {
      // Get the delimiter that was found.
      var strMatchedDelimiter = arrMatches[1];
      // Check to see if the given delimiter has a length
      // (is not the start of string) and if it matches
      // field delimiter. If id does not, then we know
      // that this delimiter is a row delimiter.
      if (strMatchedDelimiter.length && strMatchedDelimiter != strDelimiter) {
        // Since we have reached a new row of data,
        // add an empty row to our data array.
        arrData.push([]);
      }
      // Now that we have our delimiter out of the way,
      // let's check to see which kind of value we
      // captured (quoted or unquoted).
      if (arrMatches[2]) {
        // We found a quoted value. When we capture
        // this value, unescape any double quotes.
        var strMatchedValue = arrMatches[2].replace(new RegExp('""', "g"), '"');
      } else {
        // We found a non-quoted value.
        var strMatchedValue = arrMatches[3];
      }
      // Now that we have our value string, let's add
      // it to the data array.
      arrData[arrData.length - 1].push(strMatchedValue);
    }
    // Return the parsed data.
    return arrData;
  }
  csv2Json(csv) {
    var array = this.csvToArray(csv);
    var objArray = [];
    for (var i = 1; i < array.length; i++) {
      objArray[i - 1] = {};
      for (var k = 0; k < array[0].length && k < array[i].length; k++) {
        var key = array[0][k];
        objArray[i - 1][key] = array[i][k];
      }
    }

    var json = JSON.stringify(objArray);
    var str = json.replace(/},/g, "},\r\n");

    return str;
  }
  handleChange(event) {
    this.setState({ value: event.target.value });
    this.setState({ k: event.target.k });
    this.setState({ xDivision: event.target.xDivision });
    this.setState({ yDivision: event.target.yDivision });
  }
  addColor(elements) {
    var elementos = JSON.stringify(elements);
    elementos = elementos.replaceAll("clase", "color");
    elementos = elementos.replaceAll("C1", "moccasin");
    elementos = elementos.replaceAll("C2", "crimson");
    elementos = elementos.replaceAll("C3", "deepPink");
    elementos = elementos.replaceAll("C4", "green");
    elementos = elementos.replaceAll("C5", "yellow");
    elementos = elementos.replaceAll("C6", "black");
    elementos = elementos.replaceAll("C7", "fuchsia");
    elementos = elementos.replaceAll("C8", "lime");
    elementos = elementos.replaceAll("C9", "navy");
    elementos = elementos.replaceAll("C10", "darkgray");
    return elementos;
  }

  handleSubmit(event) {
    event.preventDefault();
    const dataxios = new FormData(event.target);
    var kValue = dataxios.get("kValue");
    var xDivision = dataxios.get("xDivision");
    var yDivision = dataxios.get("yDivision");
    if (xDivision <= 10) {
      this.setState({ markSize: xDivision * 3 });
    } else if (xDivision <= 60) {
      this.setState({ markSize: xDivision * 0.5 });
    } else {
      this.setState({ markSize: xDivision * 0.1 });
    }
    var csv = this.state.value;
    csv = csv.replace("x1", "x");
    csv = csv.replace("x2", "y");
    csv = csv.replace("Clase", "clase");
    csv = this.csv2Json(csv);
    console.log(csv);

    // console.log(this.csv2Json(csv));
    var json = JSON.parse(csv);
    var data = JSON.stringify(json);
    var config = {
      method: "post",
      url: `https://ia-knn.herokuapp.com/api/ia-knn/v1/knn/calculate-grid?kValue=${kValue}&xDivision=${xDivision}&yDivision=${yDivision}`,
      headers: {
        "Content-Type": "application/json",
      },
      data: data,
    };
    console.log(json);
    axios(config)
      .then((response) => {
        var gridElements = response.data.gridElements;
        var testElements = response.data.testElements;

        gridElements = this.addColor(gridElements);
        testElements = this.addColor(testElements);

        var testElements = JSON.parse(testElements);
        var gridElements = JSON.parse(gridElements);
        console.log(testElements);
        console.log(gridElements);
        this.setState({ testElements, gridElements });
        console.log(this.state);
      })
      .catch(function (error) {
        console.log(error);
      });
  }
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <form onSubmit={this.handleSubmit}>
            <div className="form-group">
              <p>Insert Dataset:</p>
              <textarea
                value={this.state.value}
                onChange={this.handleChange}
                cols="30"
                rows="10"
              ></textarea>
            </div>
            <div className="form-group">
              <p>Insert k:</p>
              <input name="kValue"></input>
            </div>
            <div className="form-group">
              <p>Insert xDivision:</p>
              <input name="xDivision"></input>
            </div>
            <div className="form-group">
              <p>Insert yDivision:</p>

              <input name="yDivision"></input>
            </div>
            <button type="submit" className="btn btn-primary">
              Submit
            </button>
          </form>
          <div id="wrapper">
            <div className="chart">
              <XYPlot width={1000} height={700}>
                <XAxis />
                <YAxis />
                <MarkSeries
                  className="heatmap-series-example"
                  colorType="literal"
                  data={this.state.gridElements}
                  opacity="0.05"
                  size={this.state.markSize}
                />
                <MarkSeries
                  className="heatmap-series-example"
                  colorType="literal"
                  data={this.state.testElements}
                />
              </XYPlot>
            </div>
          </div>
        </header>
      </div>
    );
  }
}

export default App;
