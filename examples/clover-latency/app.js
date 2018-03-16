/* global window,document */
import React, {Component} from 'react';
import {render} from 'react-dom';
import MapGL from 'react-map-gl';
import DeckGLOverlay from './deckgl-overlay.js';

import {csv as requestCsv} from 'd3-request';
import {json as requestJson} from 'd3-request';

// Set your mapbox token here
const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line

/*
SELECT
    lon AS lng,
    lat,
    count(*) AS weight,
    sum(time_total_session - time_in_server) / count(*) AS latency,
    quantile(0.5)(time_total_session - time_in_server) AS latency_p50,
    quantile(0.75)(time_total_session - time_in_server) AS latency_p75,
    quantile(0.9)(time_total_session - time_in_server) AS latency_p90,
    quantile(0.95)(time_total_session - time_in_server) AS latency_p95,
    quantile(0.99)(time_total_session - time_in_server) AS latency_p99,
    quantile(0.999)(time_total_session - time_in_server) AS latency_p999
FROM haproxy_log
WHERE (status_code = 200)
  AND NOT ((lat = 38)
  AND (lon = -97))
  AND NOT ((lat = 0) AND (lon = 0))
  AND (backend_name = 'authserver')
  AND is_pay
GROUP BY
    lon,
    lat
INTO OUTFILE 'test_authserver.csv'
FORMAT CSVWithNames;
*/
const DATA_URL_1 =
  // 'http://localhost:8080/test_all.csv';
  'http://localhost:8080/test_authserver.csv';

const DATA_URL_2 =
  'http://localhost:8080/data_example_2.csv';

const DATA_BASE_URL =
  'http://localhost:8080/data-puller/latency_data/';


// const DATA_URL =
//   'https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/3d-heatmap/heatmap-data.csv'; // eslint-disable-line

var DATA_1 = null;
var DATA_2 = null;

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

  swapData() {
    if (DATA_1 != null && DATA_2 != null) {
      if (data_index === 0) {
        data_index = 1;
        this.setState(DATA_1)
      } else {
        data_index = 0;
        // this.setState(DATA_1)
        this.setState(DATA_2)
      }
      console.log(data_index);
    }
  }

  loadData(dataFileId) {
    const url = DATA_BASE_URL + dataFiles[dataFileId];
    console.log(url);
    requestCsv(url, (error, response) => {
      console.log('dataFileId ' + dataFileId);
      if (!error) {
        const data = response.map(d => [Number(d.lng), Number(d.lat), Number(d.weight), Number(d.latency_p99)]);
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
