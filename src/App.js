import React from "react";
import "./App.css";
import "../node_modules/react-vis/dist/style.css";
import {
  HeatmapSeries,
  MarkSeries,
  XYPlot,
  XAxis,
  YAxis,
  CustomSVGSeries,
  Highlight,
} from "react-vis";
import axios from "axios";
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      resp: "",
      prevDataset: "x",
      value: "",
      clases: [],
      colores: [],
      usedColors: [],
      gridElements: [],
      codeString: "",
      kFactors: [],
      Maxs: [],
      firstAtt: "",
      secAtt: "",
      lastDrawLocation: null,
    };

    console.log("MYDATA: ", this.state.myData);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  componentDidMount() {
    // Definimos los colores para las clases
    var colores = [
      "deepPink",
      "greenYellow",
      "aqua",
      "orange",
      "green",
      "yellow",
      "fuchsia",
      "lime",
      "navy",
      "darkgray",
    ];
    this.setState({ colores });
    this.setState({ loading: false });
  }

  //Con esta funcion lo que hacemos es convertir el csv ingresado en un array para luego convertirlo en Json
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
      if (strMatchedDelimiter.length && strMatchedDelimiter !== strDelimiter) {
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
        strMatchedValue = arrMatches[3];
      }
      // Now that we have our value string, let's add
      // it to the data array.
      arrData[arrData.length - 1].push(strMatchedValue);
    }
    // Return the parsed data.
    return arrData;
  }
  //Aqui convertimos el Array armado anteriormente, finalmente en un JSON.
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
  // Con handleChange manejamos los cambios que se realizan en los valores de los inputs del formulario
  handleChange(event) {
    this.setState({ value: event.target.value });
    this.setState({ k: event.target.k });
    this.setState({ xDivision: event.target.xDivision });
    this.setState({ yDivision: event.target.yDivision });
  }
  // Con addColor lo que hacemos es realizar un cambio en los elementos a graficar para añadirles un color dependiendo de a que clase pertenecen
  addColor(elements, clases) {
    for (var i = 0; i < elements.length; i++) {
      elements[i].clase = this.state.colores[clases.indexOf(elements[i].clase)];
    }
    var elementos = JSON.stringify(elements);
    elementos = elementos.replaceAll("clase", "color");
    elementos = JSON.parse(elementos);
    return elementos;
  }
  // En addClase realizamos el proceso inverso a addColor
  addClase(elements, clases) {
    for (var i = 0; i < elements.length; i++) {
      if (elements[i].clase === "deepPink") {
        elements[i].clase = clases[0];
      }
      if (elements[i].clase === "greenYellow") {
        elements[i].clase = clases[1];
      }
      if (elements[i].clase === "aqua") {
        elements[i].clase = clases[2];
      }
      if (elements[i].clase === "orange") {
        elements[i].clase = clases[3];
      }
      if (elements[i].clase === "green") {
        elements[i].clase = clases[4];
      }
      if (elements[i].clase === "yellow") {
        elements[i].clase = clases[5];
      }
      if (elements[i].clase === "fuchsia") {
        elements[i].clase = clases[6];
      }
      if (elements[i].clase === "lime") {
        elements[i].clase = clases[7];
      }
      if (elements[i].clase === "navy") {
        elements[i].clase = clases[8];
      }
      if (elements[i].clase === "darkgray") {
        elements[i].clase = clases[9];
      }
    }

    return elements;
  }
  // getUsedColors nos devuelve los colores utilizados(segun la cantidad de clases) para luego agregarlos a la tabla de referencia
  getUsedColors(clases) {
    var usedColors = [];
    for (var j = 0; j < clases.length; j++) {
      usedColors.push(this.state.colores[j]);
    }
    return usedColors;
  }

  // getClases nos devuelve todas las clases posibles a la q pertenece por lo menos un elemento del dataset.
  getClases(clases1, clases2) {
    var a = clases1.concat(clases2);
    var b = [];
    for (var i = 0; i < a.length; i++) {
      if (!b.includes(a[i])) {
        b.push(a[i]);
      }
    }
    return b;
  }
  addStyle(elements, clases) {
    for (var i = 0; i < elements.length; i++) {
      elements[i]["style"] = {
        fill: this.state.colores[clases.indexOf(elements[i].clase)],
        opacity: 0.6,
      };
    }
    return elements;
  }
  // Con handleSubmit manejamos la parte de cuando el boton se presiona y hay q calcular.
  handleSubmit(event) {
    event.preventDefault();
    this.setState({ loading: true });

    //Aca preparamos los valores del formulario para poder hacer la llamada a la API.
    const dataxios = new FormData(event.target);
    var kValue = dataxios.get("kValue");
    this.setState({ kValue });
    var xDivision = dataxios.get("xDivision");
    var yDivision = dataxios.get("yDivision");
    var firstRow = this.state.value.split("\n")[0];
    var firstAtt = firstRow.split(";")[0];
    var secAtt = firstRow.split(";")[1];
    var classAtt = firstRow.split(";")[2];
    this.setState({ firstAtt });
    this.setState({ secAtt });
    var csv = this.state.value;
    csv = csv.replace(firstAtt, "x");
    csv = csv.replace(secAtt, "y");
    csv = csv.replace(classAtt, "clase");
    csv = this.csv2Json(csv);
    var json = JSON.parse(csv);
    var data = JSON.stringify(json);

    // Una vez preparados los valores de los parametros, lo que hacemos con este if es preguntar si el dataset con el que se esta
    // realizando esta corrida es igual al dataset de la corrida anterior, para asi no volver a calcular el random para definir
    // el conjunto training y el conjunto de test.
    if (this.state.value !== this.state.prevDataset) {
      this.setState({ prevDataset: this.state.value });

      // Preparamos la config para la llamada
      var config = {
        method: "post",
        url: `https://ia-knn.herokuapp.com/api/ia-knn/v1/knn/calculate-grid?kValue=${kValue}&xDivision=${xDivision}&yDivision=${yDivision}`,
        headers: {
          "Content-Type": "application/json",
        },
        data: data,
      };
      // Realizamos la llamada, con ayuda de la libreria Axios
      axios(config)
        .then((response) => {
          this.setState({ loading: false });
          // Guardamos los elementos que nos devuelve la llamada (la grilla. los elementos de test calculados, y la coherencia de cada K)
          var gridElements = response.data.gridElements;
          var testElements = response.data.testElements;
          var trainingElements = response.data.trainingElements;

          this.setState({ testElements, gridElements, trainingElements });
          var testEl = this.state.testElements;
          this.setState({ testEl });
          var kFactors = response.data.kfactor;

          this.setState({ kFactors });

          // Procedemos a hallar la mayor coherencia
          var maxAccu = Math.max.apply(Math, this.state.kFactors);
          this.setState({ maxAccu });
          // Aqui creamos un array "Maxs" donde almacenamos para que valores de K se obtiene el maximo de coherencia.
          var Maxs = [];
          for (var h = 0; h < this.state.kFactors.length; h++) {
            if (this.state.kFactors[h] === this.state.maxAccu) {
              Maxs.push(h + 1);
            }
          }
          // Cortamos el array de las coherencias de los K a 10 para poder mostrarlos en una tabla
          kFactors = kFactors.slice(0, 10);
          this.setState({ kFactors });

          // Aca ya pasamos a preparar los datos para el formato que deben tener para que parsee la libreria que grafica.
          var clases1 = [];
          for (var i = 0; i < testElements.length; i++) {
            if (!clases1.includes(testElements[i].clase)) {
              clases1.push(testElements[i].clase);
            }
          }
          this.setState({ Maxs });
          var clases2 = [];
          for (i = 0; i < gridElements.length; i++) {
            if (!clases2.includes(gridElements[i].clase)) {
              clases2.push(gridElements[i].clase);
            }
          }
          var clases = this.getClases(clases1, clases2);
          this.setState({ clases });
          trainingElements = this.addStyle(trainingElements, clases);
          gridElements = this.addColor(gridElements, clases);
          testElements = this.addColor(testElements, clases);
          var usedColors = this.getUsedColors(this.state.clases);
          this.setState({ testElements, gridElements, trainingElements });
          console.log("LOS training SON: ", this.state.trainingElements);

          this.setState({ usedColors });
          document
            .getElementById("wrapper")
            .scrollIntoView({ behavior: "smooth", block: "start" });
        })
        .catch(function (error) {
          console.log(error);
        });
    } else {
      // En el else tratamos el caso de cuando el dataset con el que se quiere realizar la corrida es el mismo con el cual se realizo la
      // corrida anterior. Entonces no se vuelve a calcular el conjunto de test y de training

      var testElem = this.addClase(this.state.testEl, this.state.clases);
      var dataDraw = {
        dataSet: json,
        testElements: testElem,
      };
      console.log(dataDraw);
      // Basicamente el proceso es el mismo que el anterior, con la diferencia de que el backend de esta llamada no vuelve a calcular
      // los conjuntos de trainint y test.
      var configDraw = {
        method: "post",
        url: `https://ia-knn.herokuapp.com/api/ia-knn/v1/knn/draw-grid?kValue=${kValue}&xDivision=${xDivision}&yDivision=${yDivision}`,
        headers: {
          "Content-Type": "application/json",
        },
        data: dataDraw,
      };
      axios(configDraw)
        .then((response) => {
          this.setState({ loading: false });
          var gridElements = response.data.gridElements;
          var testElements = response.data.testElements;
          var trainingElements = response.data.trainingElements;

          var kFactor = response.data.kfactor;
          this.setState({ kFactor });
          var clases1 = [];
          for (var i = 0; i < testElements.length; i++) {
            if (!clases1.includes(testElements[i].clase)) {
              clases1.push(testElements[i].clase);
            }
          }
          var clases2 = [];
          for (i = 0; i < gridElements.length; i++) {
            if (!clases2.includes(gridElements[i].clase)) {
              clases2.push(gridElements[i].clase);
            }
          }
          var clases = this.getClases(clases1, clases2);
          this.setState({ clases });
          gridElements = this.addColor(gridElements, clases);
          testElements = this.addColor(testElements, clases);
          trainingElements = this.addStyle(trainingElements, clases);
          var usedColors = this.getUsedColors(this.state.clases);
          this.setState({ testElements, gridElements, trainingElements });
          console.log("LOS TEST SON: ", this.state.testElements);
          this.setState({ usedColors });
        })
        .catch(function (error) {
          console.log(error);
        });
    }
  }

  render() {
    const { lastDrawLocation } = this.state;
    return (
      <div className="App">
        <header>Knn-Algorithm</header>
        <div className="App-body container-fluid">
          <div className="IA">
            Inteligencia Artificial - UTN FRRe 2020 - Grupo 8
          </div>
          <div className="landing">
            <form className="container-fluid" onSubmit={this.handleSubmit}>
              <div className="row">
                <div className="col">
                  <div className="form-group">
                    <p>Insert Dataset:</p>
                    <textarea
                      value={this.state.value}
                      onChange={this.handleChange}
                      cols="50"
                      rows="10"
                    ></textarea>
                  </div>
                </div>
                <div className="col">
                  <div className="form-group">
                    <p>Insert k:</p>
                    <input
                      className="container-fluid"
                      type="number"
                      name="kValue"
                    ></input>
                  </div>
                  <div className="form-group">
                    <p>Insert xDivision:</p>
                    <input
                      className="container-fluid"
                      type="number"
                      name="xDivision"
                    ></input>
                  </div>
                  <div className="form-group">
                    <p>Insert yDivision:</p>

                    <input
                      className="container-fluid"
                      type="number"
                      name="yDivision"
                    ></input>
                  </div>
                  <button type="submit" className="btn btn-success container">
                    {!this.state.loading && <span>Run</span>}
                    {this.state.loading && (
                      <div className="spinner-border text-light" role="status">
                        <span className="sr-only">Loading...</span>
                      </div>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>

          <div id="wrapper" className="container">
            {this.state.usedColors.length > 0 && (
              <div className="tabla">
                <p>
                  El valor de coherencia para K = {this.state.kValue} es de{" "}
                  <span className="verde">
                    {this.state.kFactors[this.state.kValue - 1]}
                  </span>
                </p>
                <table className="table table-dark table-sm table-striped">
                  <thead className="thead-light">
                    <tr>
                      <th style={{ color: "black" }} scope="col">
                        Clase
                      </th>
                      <th style={{ color: "black" }} scope="col">
                        Color
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {this.state.clases.map((value, index) => {
                      return (
                        <tr key={index}>
                          <th className="cls">{value}</th>
                          <th className="clr">
                            <div className={this.state.usedColors[index]}></div>
                          </th>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            {this.state.gridElements.length > 0 && (
              <div className="chart">
                <XYPlot
                  animation
                  xDomain={
                    lastDrawLocation && [
                      lastDrawLocation.left,
                      lastDrawLocation.right,
                    ]
                  }
                  yDomain={
                    lastDrawLocation && [
                      lastDrawLocation.bottom,
                      lastDrawLocation.top,
                    ]
                  }
                  width={1200}
                  height={800}
                >
                  <XAxis
                    title={this.state.firstAtt}
                    style={{
                      title: { fontSize: "25px" },
                      color: "white",
                      opacity: "1",
                    }}
                  />
                  <YAxis
                    title={this.state.secAtt}
                    style={{
                      title: {
                        fontSize: "25px",
                        color: "white",
                      },
                    }}
                  />
                  <HeatmapSeries
                    className="heatmap-series-example"
                    colorType="literal"
                    opacity="0.1"
                    data={this.state.gridElements}
                  />
                  <CustomSVGSeries
                    customComponent="square"
                    size="7"
                    data={this.state.trainingElements}
                  />
                  <MarkSeries
                    className="heatmap-series-example"
                    colorType="literal"
                    data={this.state.testElements}
                    size="7"
                    opacity=".8"
                  />
                  <Highlight
                    onBrushEnd={(area) =>
                      this.setState({ lastDrawLocation: area })
                    }
                    onDrag={(area) => {
                      this.setState({
                        lastDrawLocation: {
                          bottom:
                            lastDrawLocation.bottom + (area.top - area.bottom),
                          left:
                            lastDrawLocation.left - (area.right - area.left),
                          right:
                            lastDrawLocation.right - (area.right - area.left),
                          top: lastDrawLocation.top + (area.top - area.bottom),
                        },
                      });
                    }}
                  />
                </XYPlot>
              </div>
            )}
            {this.state.gridElements.length > 0 && (
              <div>
                <h3>
                  los k con mayor coherencia son: <br />
                  {this.state.Maxs.map((value, i) => {
                    return (
                      <b key={i}>
                        k = <span className="verde">{value}</span>
                        {this.state.Maxs[i + 1] ? ", " : ". "}
                      </b>
                    );
                  })}{" "}
                  Con<span className="verde"> {this.state.maxAccu}</span> de
                  coherencia
                </h3>
                <table className="table table-dark table-sm table-striped">
                  <thead className="thead-light">
                    <tr>
                      <th style={{ color: "black" }} scope="col">
                        K
                      </th>
                      <th style={{ color: "black" }} scope="col">
                        Accuracy
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {this.state.kFactors.map((value, index) => {
                      return (
                        <tr key={index}>
                          <th
                            className={
                              ("cls",
                              value === this.state.maxAccu ? "verde" : "")
                            }
                          >
                            {index + 1}
                          </th>
                          <th
                            className={
                              ("cls",
                              value === this.state.maxAccu ? "verde" : "")
                            }
                          >
                            {value}
                          </th>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <br />
                <br />
                <br />
                <br />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default App;
