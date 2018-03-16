/* global window,document */
import React, {Component} from 'react';
import {render} from 'react-dom';
import MapGL from 'react-map-gl';
import DeckGLOverlay from './deckgl-overlay.js';

import {csv as requestCsv} from 'd3-request';
import {json as requestJson} from 'd3-request';

// Set your mapbox token here
const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line

const DATA_BASE_URL =
  'http://localhost:8080/data-puller/latency_data/';

// const DATA_URL =
//   'https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/3d-heatmap/heatmap-data.csv'; // eslint-disable-line

var dataFiles = null;
var numDataFiles = null;

class Root extends Component {
  constructor(props) {
    super(props);

    this.state = {
      viewport: {
        ...DeckGLOverlay.defaultViewport,
        width: 500,
        height: 500
      },
      data: null
    };

    requestJson(DATA_BASE_URL, (error, response) => {
      if (error) {
        console.log(error);
      } else {
        dataFiles = response;
        numDataFiles = response.length;
        this.loadData(1);
      }
    });
  }

  loadData(dataFileId) {
    const dataFile = dataFiles[dataFileId];
    const unix = Number(dataFile.split(/[_.]+/)[1]);
    const date = new Date(unix * 1000);
    const url = DATA_BASE_URL + dataFile;

    requestCsv(url, (error, response) => {
      console.log('dataFileId ' + dataFileId);
      console.log('unixTime ' + unix);
      console.log('date ' + date);

      document.getElementById('header').innerHTML = 'Clover Traffic -- ' + date;

      if (!error) {
        const data = response.map(d => [Number(d.lng), Number(d.lat), Number(d.weight), Number(d.latency_p99)]);
        data.push([0, 0, 2000, 0]);
        this.setState({data});
      }

      // Skip the last batch which may not have much data
      if (dataFileId < numDataFiles - 2) {
        window.setTimeout(() => this.loadData(dataFileId + 1), 100)
      }
    });
  }

  componentDidMount() {
    window.addEventListener('resize', this._resize.bind(this));
    this._resize();
  }

  _resize() {
    this._onViewportChange({
      width: window.innerWidth,
      height: window.innerHeight
    });
  }

  _onViewportChange(viewport) {
    this.setState({
      viewport: {...this.state.viewport, ...viewport}
    });
  }

  render() {
    const {viewport, data} = this.state;

    return (
      <MapGL
        {...viewport}
        mapStyle="mapbox://styles/mapbox/dark-v9"
        onViewportChange={this._onViewportChange.bind(this)}
        mapboxApiAccessToken={MAPBOX_TOKEN}
      >
        <DeckGLOverlay viewport={viewport} data={data || []} />
      </MapGL>
    );
  }
}

render(<Root />, document.body.appendChild(document.createElement('div')));
