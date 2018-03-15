/* global window,document */
import React, {Component} from 'react';
import {render} from 'react-dom';
import MapGL from 'react-map-gl';
import DeckGLOverlay from './deckgl-overlay.js';

import {csv as requestCsv} from 'd3-request';

// Set your mapbox token here
const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line

// Source data CSV
const DATA_URL_1 =
  'http://localhost:8080/data_example_1.csv';
const DATA_URL_2 =
  'http://localhost:8080/data_example_2.csv';
// const DATA_URL =
//   'https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/3d-heatmap/heatmap-data.csv'; // eslint-disable-line

var DATA_1 = null;
var DATA_2 = null;

var data_index = 0;

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

    this.loadData(DATA_URL_1, data => {DATA_1 = data});
    this.loadData(DATA_URL_2, data => {DATA_2 = data});

    window.setInterval(this.swapData.bind(this), 1000);
  }

  swapData() {
    if (DATA_1 != null && DATA_2 != null) {
      if (data_index === 0) {
        data_index = 1;
        this.setState(DATA_1)
      } else {
        data_index = 0;
        this.setState(DATA_2)
      }
      console.log(data_index);
    }
  }

  loadData(data_url, callback) {
    requestCsv(data_url, (error, response) => {
      if (!error) {
        const data = response.map(d => [Number(d.lng), Number(d.lat), Number(d.weight), Number(d.latency)]);
        callback({data});
        this.setState({data});
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
