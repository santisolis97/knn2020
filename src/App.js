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
      menu: false,
      sets: [],
    };

    console.log("MYDATA: ", this.state.myData);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.toggleMenu = this.toggleMenu.bind(this);
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
    this.setState({ loading2: false });
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
      elements[i].color = this.state.colores[clases.indexOf(elements[i].clase)];
    }
    // var elementos = JSON.stringify(elements);
    // elementos = elementos.replaceAll("clase", "color");
    // elementos = JSON.parse(elementos);
    return elements;
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
  //Esta funcion formatea los elementos de training para que se muestren con el color de la clase q le corresponden, tengan relleno negro y opacidad 0.3
  addStyle(elements, clases) {
    for (var i = 0; i < elements.length; i++) {
      elements[i]["style"] = {
        stroke: this.state.colores[clases.indexOf(elements[i].clase)],
        fill: "black",
        opacity: 0.3,
      };
    }
    return elements;
  }
  //ToggleMenu nada mas se usa para colapsar y mostrar los k con mayor exactitud
  toggleMenu() {
    this.setState({ menu: !this.state.menu });
  }
  //handleNewK se utiliza para poder realizar el grafico con un nuevo k, en caso de que el usuario lo solicite
  handleNewK() {
    return (event) => {
      this.setState({ loading2: true });
      event.preventDefault();
      const params = new FormData(event.target);
      var kValue = params.get("kValue");
      var xDivision = params.get("xDivision");
      var yDivision = params.get("yDivision");

      var dataDraw2 = {
        dataSet: JSON.parse(this.state.data),
        testElements: this.state.testElements,
      };
      console.log(dataDraw2);
      var configDraw2 = {
        method: "post",
        url: `https://knn2020-backend.herokuapp.com/api/ia-knn/v1/knn/draw-grid?kValue=${kValue}&xDivision=${xDivision}&yDivision=${yDivision}`,
        headers: {
          "Content-Type": "application/json",
        },
        data: dataDraw2,
      };
      axios(configDraw2)
        .then((response) => {
          this.setState({ loading2: false });

          var gridElements = response.data.gridElements;
          var testElements = response.data.testElements;
          var trainingElements = response.data.trainingElements;
          var kFactor = response.data.kfactor;
          this.setState({ kFactor });
          gridElements = this.addColor(gridElements, this.state.clases);
          testElements = this.addColor(testElements, this.state.clases);
          trainingElements = this.addStyle(trainingElements, this.state.clases);

          var newK = { gridElements, trainingElements, testElements };
          this.setState({ newK });
        })
        .catch(function (error) {
          console.log(error);
        });
    };
  }
  // Con handleSubmit manejamos la parte de cuando el boton se presiona y hay q calcular.
  handleSubmit(event) {
    this.setState({ newK: "" });
    event.preventDefault();
    this.setState({ loading: true });
    var sets = [];
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
    this.setState({ data });
    // Una vez preparados los valores de los parametros, lo que hacemos con este if es preguntar si el dataset con el que se esta
    // realizando esta corrida es igual al dataset de la corrida anterior, para asi no volver a calcular el random para definir
    // el conjunto training y el conjunto de test.

    // Preparamos la config para la llamada

    var config = {
      method: "post",
      url: `https://knn2020-backend.herokuapp.com/api/ia-knn/v1/knn/calculate-grid?kValue=1&xDivision=${xDivision}&yDivision=${yDivision}`,
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
        let testElements = response.data.testElements;
        var trainingElements = response.data.trainingElements;
        var testEl = testElements;
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
        this.setState({ Maxs });
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

        var clases2 = [];
        for (i = 0; i < gridElements.length; i++) {
          if (!clases2.includes(gridElements[i].clase)) {
            clases2.push(gridElements[i].clase);
          }
        }
        var clases = this.getClases(clases1, clases2);
        this.setState({ clases });
        console.log(clases);
        trainingElements = this.addStyle(trainingElements, clases);
        gridElements = this.addColor(gridElements, clases);
        testElements = this.addColor(testElements, clases);
        var usedColors = this.getUsedColors(this.state.clases);
        sets.push({ gridElements, trainingElements, testElements });
        this.setState(
          { gridElements, trainingElements, testElements },
          function () {
            this.handleNewK(this.state);
          }.bind(this)
        );
        this.setState({ usedColors });
        document
          .getElementById("wrapper")
          .scrollIntoView({ behavior: "smooth", block: "start" });
        for (var i = 0; i < 9; i++) {
          var testElem = this.addClase(testElements, this.state.clases);
          var dataDraw = {
            dataSet: json,
            testElements: testElem,
          };

          // Basicamente el proceso es el mismo que el anterior, con la diferencia de que el backend de esta llamada no vuelve a calcular
          // los conjuntos de trainint y test.
          var configDraw = {
            method: "post",
            url: `https://knn2020-backend.herokuapp.com/api/ia-knn/v1/knn/draw-grid?kValue=${
              i + 2
            }&xDivision=${xDivision}&yDivision=${yDivision}`,
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
              gridElements = this.addColor(gridElements, clases);
              testElements = this.addColor(testElements, clases);
              trainingElements = this.addStyle(trainingElements, clases);

              sets.push({ gridElements, trainingElements, testElements });

              this.setState({ usedColors });
            })
            .catch(function (error) {
              console.log(error);
            });
        }
        this.setState({ sets: sets });
        console.log(this.state.sets);
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  render() {
    const show = this.state.menu ? "show" : "";

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
                    <p>Inserte dataset:</p>
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
                    <p>Inserte la cantidad de divisiones para el eje X</p>
                    <input
                      className="container-fluid"
                      type="number"
                      name="xDivision"
                    ></input>
                  </div>
                  <div className="form-group">
                    <p>Inserte la cantidad de divisiones para el eje Y</p>

                    <input
                      className="container-fluid"
                      type="number"
                      name="yDivision"
                    ></input>
                  </div>
                  <button
                    type="submit"
                    className="btn btn1 btn-success container"
                    disabled={this.state.loading}
                  >
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

          <div id="wrapper" className="container-fluid">
            {this.state.sets.length > 0 && (
              <div>
                {" "}
                <br />
                <br />
                <br />
                <h3>
                  <div className="card bg-dark">
                    {/* <div className="card-header"> */}
                    <span
                      className="collapser btn btn-secondary"
                      onClick={this.toggleMenu}
                    >
                      Click aqui para mostrar los valores de K que poseen mayor
                      exactitud <i class="fas fa-chevron-down"></i>{" "}
                    </span>{" "}
                    {/* </div> */}
                    <div
                      className={
                        "collapse navbar-collapse " + show + " card-body"
                      }
                    >
                      {this.state.Maxs.map((value, i) => {
                        return (
                          <b key={i}>
                            k = <span className="verde">{value}</span>
                            {this.state.Maxs[i + 1] ? ", " : ". "}
                          </b>
                        );
                      })}{" "}
                      Con
                      <span className="verde">
                        {" "}
                        {this.state.maxAccu * 100}%
                      </span>{" "}
                      de exactitud.
                    </div>
                  </div>
                </h3>
                <table className="table table-dark table-sm table-striped">
                  <thead className="thead-light">
                    <tr>
                      <th style={{ color: "black" }} scope="col">
                        K
                      </th>
                      <th style={{ color: "black" }} scope="col">
                        Exactitud
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
                            {value * 100}%
                          </th>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <br />
                <hr className="class-1" />
                <br />
                <div className="newk">
                  <form
                    onSubmit={this.handleNewK(
                      this.state.xDivision,
                      this.state.yDivision
                    )}
                  >
                    <div className="row card bg-dark">
                      <div className="card-header">
                        En caso de que quieras graficar con un valor K
                        especifico
                      </div>
                      <div className="col card-body">
                        <div className="form-group">
                          <p>Inserte K: </p>
                          <input
                            className="container-fluid"
                            type="number"
                            name="kValue"
                          ></input>
                        </div>
                        <div className="form-group">
                          <p>Inserte cantidad de divisiones en X: </p>
                          <input
                            className="container-fluid"
                            type="number"
                            name="xDivision"
                          ></input>
                        </div>
                        <div className="form-group">
                          <p>Inserte cantidad de divisiones en Y: </p>
                          <input
                            className="container-fluid"
                            type="number"
                            name="yDivision"
                          ></input>
                        </div>
                        <button
                          type="submit"
                          className="btn btn2 btn-success container"
                          disabled={this.state.loading2}
                        >
                          {!this.state.loading2 && <span>Run</span>}
                          {this.state.loading2 && (
                            <div
                              className="spinner-border text-light"
                              role="status"
                            >
                              <span className="sr-only">Loading...</span>
                            </div>
                          )}
                        </button>
                        {this.state.newK && (
                          <div className="chart">
                            <XYPlot width={800} height={800}>
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
                                data={this.state.newK.gridElements}
                              />
                              <CustomSVGSeries
                                customComponent="square"
                                size="7"
                                data={this.state.newK.trainingElements}
                              />
                              <MarkSeries
                                className="heatmap-series-example"
                                colorType="literal"
                                data={this.state.newK.testElements}
                                size="7"
                                opacity=".6"
                              />
                            </XYPlot>
                          </div>
                        )}
                      </div>
                    </div>
                  </form>
                </div>
                <br />
                <hr className="class-1" />
                <br />
                <div className="card bg-dark">
                  <div className="card-header">
                    <h2>Graficos</h2>
                    <p>Para k=1..10</p>
                  </div>

                  <div className="card-body">
                    {this.state.usedColors.length > 0 && (
                      <div className="tabla">
                        <div class="alert alert-dark" role="alert">
                          <i class="fas fa-info-circle"></i> Los cuadrados
                          representan los puntos del dataset de training y los
                          circulos a los puntos del dataset de testing
                        </div>
                        <br />

                        <table className="table table-dark table-sm table-striped">
                          <thead className="thead-dark">
                            <tr>
                              <th scope="col">Clase</th>
                              <th scope="col">Color</th>
                            </tr>
                          </thead>
                          <tbody>
                            {this.state.clases.map((value, index) => {
                              return (
                                <tr key={index}>
                                  <th className="cls">{value}</th>
                                  <th className="clr">
                                    <div
                                      className={this.state.usedColors[index]}
                                    ></div>
                                  </th>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                    {this.state.sets.map((value, index) => {
                      return (
                        <div key={index} className="chart col-6">
                          k={index + 1}
                          <XYPlot width={550} height={550}>
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
                              data={this.state.sets[index].gridElements}
                            />
                            <CustomSVGSeries
                              customComponent="square"
                              size="7"
                              data={this.state.sets[index].trainingElements}
                            />
                            <MarkSeries
                              className="heatmap-series-example"
                              colorType="literal"
                              data={this.state.sets[index].testElements}
                              size="7"
                              opacity=".6"
                            />
                          </XYPlot>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default App;
