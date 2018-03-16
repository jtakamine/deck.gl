/* global window */
import React, {Component} from 'react';
import DeckGL, {HexagonLayer} from 'deck.gl';

const LIGHT_SETTINGS = {
  lightsPosition: [-0.144528, 49.739968, 8000, -3.807751, 54.104682, 8000],
  ambientRatio: 0.4,
  diffuseRatio: 0.6,
  specularRatio: 0.2,
  lightsStrength: [0.8, 0.0, 0.8, 0.0],
  numberOfLights: 2
};

const colorRange = [
  [1, 152, 189],
  [73, 227, 206],
  [216, 254, 181],
  [254, 237, 177],
  [254, 173, 84],
  [209, 55, 78]
];
// const colorRange = [
//   [0, 0, 0],
//   [0, 255, 0],
//   [0, 255, 255],
//   [255, 255, 0],
//   [255, 255, 0]
// ];

const elevationScale = {min: 1, max: 50};

const defaultProps = {
  // radius: 1000,
  radius: 20000,
  upperPercentile: 100,
  coverage: 1
};

export default class DeckGLOverlay extends Component {
  static get defaultColorRange() {
    return colorRange;
  }

  static get defaultViewport() {
    return {
      longitude: -95.1145875,
      latitude: 38.4491152,
      zoom: 3.5,
      minZoom: 1,
      maxZoom: 15,
      pitch: 40.5,
      bearing: -27.396674584323023
    };
  }

  constructor(props) {
    super(props);
    this.startAnimationTimer = null;
    this.intervalTimer = null;
    this.state = {
      // elevationScale: elevationScale.min
      elevationScale: elevationScale.max
    };

    this._startAnimate = this._startAnimate.bind(this);
    this._animateHeight = this._animateHeight.bind(this);
  }

  componentDidMount() {
    this._animate();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.data.length !== this.props.data.length) {
      this._animate();
    }
  }

  componentWillUnmount() {
    this._stopAnimate();
  }

  _animate() {
    // this._stopAnimate();

    // // wait 1.5 secs to start animation so that all data are loaded
    // this.startAnimationTimer = window.setTimeout(this._startAnimate, 1500);
  }

  _startAnimate() {
    // this.intervalTimer = window.setInterval(this._animateHeight, 20);
  }

  _stopAnimate() {
    // window.clearTimeout(this.startAnimationTimer);
    // window.clearTimeout(this.intervalTimer);
  }

  _animateHeight() {
    // if (this.state.elevationScale === elevationScale.max) {
    //   this._stopAnimate();
    // } else {
    //   this.setState({elevationScale: this.state.elevationScale + 1});
    // }
  }

  static _parsePoint(point) {
    return {
      lng: point[0],
      lat: point[1],
      weight: point[2],
      latency: point[3]
    }
  }

  _getColorValue(points) {
    const weighted = point => {
      const p = DeckGLOverlay._parsePoint(point);
      return p.weight * p.latency;
    }

    const total = points.map(p => DeckGLOverlay._parsePoint(p).weight).reduce((prev, next) => prev + next);

    // mean latency for the data points in this "area"
    return points.map(weighted).reduce((prev, next) => prev + next) / total;
  }

  _getElevationValue(points) {
    return points.map(p => DeckGLOverlay._parsePoint(p).weight).reduce((prev, next) => prev + next);
    // return points.length;
    // const weighted = point => {
    //   const p = DeckGLOverlay._parsePoint(point);
    //   return p.weight * p.latency;
    // }

    // const total = points.map(p => DeckGLOverlay._parsePoint(p).weight).reduce((prev, next) => prev + next);

    // // mean latency for the data points in this "area"
    // return points.map(weighted).reduce((prev, next) => prev + next) / total;
  }

  render() {
    const {viewport, data, radius, coverage, upperPercentile} = this.props;

    if (!data) {
      return null;
    }

    const layers = [
      new HexagonLayer({
        id: 'heatmap',
        colorRange,
        coverage,
        data,
        elevationRange: [0, 30000],
        elevationScale: this.state.elevationScale,
        extruded: true,
        getColorValue: this._getColorValue.bind(this),
        getElevationValue: this._getElevationValue,
        getPosition: d => d,
        lightSettings: LIGHT_SETTINGS,
        onHover: this.props.onHover,
        opacity: 1,
        pickable: Boolean(this.props.onHover),
        radius,
        upperPercentile
      })
    ];

    return <DeckGL {...viewport} layers={layers} />;
  }
}

DeckGLOverlay.displayName = 'DeckGLOverlay';
DeckGLOverlay.defaultProps = defaultProps;
