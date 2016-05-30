// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';

import Box from 'grommet/components/Box';
import Chart from 'grommet/components/Chart';
import Header from 'grommet/components/Header';
import Meter from 'grommet/components/Meter';
import Tiles from 'grommet/components/Tiles';
import Title from 'grommet/components/Title';
import Tile from 'grommet/components/Tile';
import Status from 'grommet/components/icons/Status';
import User from 'grommet/components/icons/base/User';

import IndexHistory from './IndexHistory';

//var ReconnectingWebSocket = require("reconnectingwebsocket");

import { navActivate, dashboardLayout, dashboardTimeframe, alertsLoad } from '../actions';
import Logo from './Logo';

class Dashboard extends Component {

  constructor() {
    super();
    this._onClickTitle = this._onClickTitle.bind(this);
    this._onResize = this._onResize.bind(this);
    this._layout = this._layout.bind(this);
    this._onTimeframeChange = this._onTimeframeChange.bind(this);

    this.atmStreams = [];
  }

  componentDidMount() {
    window.addEventListener('resize', this._onResize);
    this._onResize();
    this.props.dispatch(
      alertsLoad(this.props.dashboard.timeframe)
    );

    this.atmStreams = [];
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.nav.active !== nextProps.nav.active) {
      // The NavSidebar is changing, relayout when it finishes animating.
      // TODO: Convert to an animation event listener.
      this._onResize();
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this._onResize);
  /*  this.props.dispatch(
      alertsUnload(this.props.dashboard.alerts)
    );*/


    for (var i = 0; i < this.atmStreams.length; i++) {
      if (this.atmStreams[i].player) {
        this.atmStreams[i].player.stop();
        this.atmStreams[i].player = null;
      }
    }
  }

  _onClickTitle() {
    this.props.dispatch(navActivate(true));
  }

  _onResize() {
    // debounce
    clearTimeout(this._timer);
    this._timer = setTimeout(this._layout, 500);
  }

  _onTimeframeChange(event) {
    this.props.dispatch(dashboardTimeframe(event.target.value));

    this.props.dispatch(
      alertsLoad(event.target.value)
    );
  }

  _layout() {
    const { dispatch } = this.props;

    if (this.refs.content) {
      var rect = this.refs.content.getBoundingClientRect();
      var tilesOffset = ReactDOM.findDOMNode(this.refs.tiles).
          getBoundingClientRect().top + document.body.scrollTop;

      let width = rect.width;
      let height = rect.height - tilesOffset;

      // set graphic size
      // TODO: These numbers are empirical. Redo to be more formal.
      let graphicSize = 'medium';
      if ((width / 300) < 3) {
        graphicSize = 'small';
      } else if ((height / 400) < 3) {
        graphicSize = 'small';
      } else if ((width / 660) > 3) {
        graphicSize = 'large';
      }

      dispatch(dashboardLayout(graphicSize));
    }
  }

  _renderCriticalAlert(alert, index) {
    const { graphicSize } = this.props.dashboard;
    let tile;
    var header = (
      <Header tag="h2" justify="center">
        Critical Alerts
      </Header>
    );

    var contents = "";
    if (alert && alert.result && alert.result.criticalAlerts) {
      contents = (
        <IndexHistory type="area" attribute="alert"
                      series={alert.result.criticalAlerts} smooth={true} size={graphicSize}/>
      );
    } else if (alert && alert.result && alert.result.length > 0) {
      contents = (
        <IndexHistory type="area" attribute="alert"
                      series={alert.result} smooth={true} size={graphicSize}/>
      );
    }

    tile = (
      <Tile key={index} wide={true}>
        {header}
        {contents}
      </Tile>
    );

    return tile;
  }

  _renderUltrasonicRawData(rawData, index) {
    var charts = [];

    if (rawData) {
      for (var k = 0; k < rawData.length; k++) {

        var sum = 0;
        for (var j = 0; j < rawData[k].value.length; j++) {
          if (rawData[k].value[j] < 1000) {
            sum += Math.ceil(1000 - rawData[k].value[j]);
          }
        }

        var avg = Math.ceil(sum / rawData[k].value.length);

        var key = index + "-ultrasonic-graph-" + k;
        var chartkey = index + "-ultrasonic-chart-" + k;

        charts.push(<Tile key={key} align="center" justify="center" wide={true}>
          <Meter key={chartkey} max={{value: 1000}}
                 min={{value: 0}}
                 series={[{"value": avg}]}
                 size="small"/>
        </Tile>);
      }
    }

    if (charts.length > 0) {
      return (
        <Tile>
          Ultrasonic Sensor:
          {charts}
        </Tile>);
    } else {
      return "";
    }
  }


  _renderVibrationSensorIcon(vibrationRawData, index) {

    var shakeSensor = "ok";

    if (vibrationRawData && vibrationRawData.length > 0 && vibrationRawData[0].value && vibrationRawData[0].value.length > 0) {
      for (var i = 0; i < vibrationRawData[0].value.length; i++) {
        if (vibrationRawData[0].value[i] > 0) {
          shakeSensor = "critical";
        }
      }
    }

    var key = index + "-vibration-icon";

    return (
      <Tile key={key}>
        Shake Sensor:
        <Status value={shakeSensor} />
      </Tile>);
  }

  _renderPeopleCounter(peopleCount, index) {
    let colorIndex = peopleCount > 1 ? "error" : "ok";

    var key = index + "-people-counter";

    return (
      <Tile key={key}>
        # of Customers:
        <Meter max={{value: 4}}
               min={{value: 0}}
               series={[{"value": peopleCount, "colorIndex": colorIndex}]}
               size="small" />
    </Tile>);
  }

  _renderVideoCanvas(streamUri, atmId, index) {
    let videoCanvas = document.getElementById(atmId);
    if (videoCanvas && (!this.atmStreams[atmId] || !this.atmStreams[atmId].stream || !this.atmStreams[atmId].player || !this.atmStreams[atmId].player.client)) {
      var videoclient = new WebSocket(streamUri);
      this.atmStreams[atmId] = {
        stream: streamUri,
        player: new jsmpeg(videoclient, {canvas: videoCanvas, loop: true})
      };
    } else if (!videoCanvas && this.atmStreams[atmId]) {
      if (this.atmStreams[atmId].player || this.atmStreams[atmId].stream != streamUri ) {
        this.atmStreams[atmId].player.stop();
      }

      this.atmStreams[atmId].stream = null;
      this.atmStreams[atmId].player = null;
    } else if (videoCanvas && this.atmStreams[atmId] && this.atmStreams[atmId].player) {
      this.atmStreams[atmId].player.canvas = videoCanvas;
    }


    var key = index + "-video";

    return (
      <Tile key={key} >
        <canvas id={atmId}>
          <p>
            Please use a browser that supports the Canvas Element, like
            <a href="http://www.google.com/chrome">Chrome</a>,
            <a href="http://www.mozilla.com/firefox/">Firefox</a>,
            <a href="http://www.apple.com/safari/">Safari</a> or Internet Explorer 10
          </p>
        </canvas>
      </Tile>
    );
  }

  _renderVibrationRawData(vibrationRawData, index) {
    var shakesChartData = [];
    var chartItemsCount = 15;

    let chartData;

    if (vibrationRawData && vibrationRawData.length > 0 && vibrationRawData[0].value && vibrationRawData[0].value.length > 0) {
      var step = vibrationRawData[0].value.length / chartItemsCount;
      for (var i = 0, j= chartItemsCount; j >= 1; j--) {
        if (i <= vibrationRawData[0].value.length) {
          shakesChartData.push([j, vibrationRawData[0].value[Math.round(i)]]);
        } else {
          shakesChartData.push([j, 0]);
        }
        i+= step;
      }

      chartData = [
        {
          "values": shakesChartData,
          "colorIndex": "graph-1"
        }];
    } else {
      chartData = [];
      //shakesChartData.push([15, 0],[14, 0],[13, 0],[12, 0],[11, 0],[10, 0], [9, 0], [8, 0], [7, 0], [6, 0], [5, 0], [4, 0], [3, 0], [2, 0], [1, 0]);
    }




    var key = index + "-vibration-graph";

    return(
      <Tile key={key} align="center">
        Sensor Activity:
        <Tile pad={{horizontal: 'small'}}>
        <Chart type="area"
               align="center"
               threshold={0}
               size="small"
               series={chartData}
               smooth={true}
          />
          </Tile>
      </Tile>
    );
  }

  _renderInfraRedSensorsData(infraredData, index) {
    var icons = [];

    for (var i = 0; i < infraredData.length; i++) {
      var color = "";
      for (var j = 0; j < infraredData[i].value.length; j++) {
        if (infraredData[i].value[j] > 0) {
          color = "warning";
          break;
        }
      }

      let key = index + "-infrared-child-" + i;

      icons.push(<User key={key} colorIndex={color} />);
    }

    if (icons.length > 0) {
      let key = index + "-infrared-graph";
      return (
        <Tile key={key}>
          Infrared sensors:
          <Tiles flush={false} pad={{between: 'medium'}} justify="center" fill={true} direction="row">
            {icons}
          </Tiles>
        </Tile>
      );
    } else {
      return "";
    }
  }

  _renderTileAlert(alert, index) {
    let tile;

    switch (alert.id) {
      case 'critical_alerts': {
        return this._renderCriticalAlert(alert, index);
        break;
      }
      case 'atms_alerts': {

        if (!alert || !alert.result) {
          tile = (
            <Tile key={index} wide={true}>
              <Meter value={undefined} type="circle" />
            </Tile>
          );
        } else {
          alert.result.sort(function(a, b) {
            return a.atmId > b.atmId;
          });

          let contents = alert.result.map((atmAlert, index) => {
            var ultrasonicMeter = this._renderUltrasonicRawData(atmAlert.ultrasonicRawData, index);
            var vibrationChart = this._renderVibrationRawData(atmAlert.vibrationRawData, index);
            var vibrationIcon = this._renderVibrationSensorIcon(atmAlert.vibrationRawData, index);
            var peopleCounter = this._renderPeopleCounter(atmAlert.peopleCount, index);
            var userIcons = this._renderInfraRedSensorsData(atmAlert.infraredRawData, index);
            var videoCanvas = this._renderVideoCanvas(atmAlert.streamUri, atmAlert.atmName);

            var series = [
              { label: "Critical", colorIndex: "error", value: atmAlert.critical},
              { label: "Warning", colorIndex: "warning", value: atmAlert.warning}
            ];

            return (
              <Tile key={'atm_alert_' + index} >
                <Header tag="h2" justify="center">{atmAlert.atmName}</Header>
                <h4>Location: {atmAlert.location}</h4>
                <Tiles fill={true}>
                  <Tile justify="start">
                    <Meter series={series} type="circle"
                           legend={{placement: 'bottom', total: true}}
                           size="medium" />
                  </Tile>
                  <Tile>
                    <Tiles fill={true} justify="center">
                      {peopleCounter}
                      {vibrationIcon}
					            {vibrationChart}
                      {ultrasonicMeter}
                      {userIcons}
                      <Tile>
                        Time of Day:
                        <Box direction="row" align="center" justify="center">
                          {atmAlert.lastUpdate}
                        </Box>
                      </Tile>
                    </Tiles>
                  </Tile>
                  {videoCanvas}
                </Tiles>
              </Tile>
            );
          });

          return (
            <Tiles key={index} flush={false} fill={true}>
              {contents}
            </Tiles>
          );
        }

        break;
      }
    }

    return tile;
  }

  render() {
    const { alerts, timeframe } = this.props.dashboard;
    const { active: navActive } = this.props.nav;

    let alertTiles = alerts.map(this._renderTileAlert, this);

    let title;
    if (! navActive) {
      title = (
        <span>
          <Title onClick={this._onClickTitle}>
            <Logo />
            <span>IoT Demo</span>
          </Title>
        </span>
      );
    }

    return (
      <div ref="content">
        <Header direction="row" justify="between"
          large={true} pad={{horizontal: 'medium'}}>
          {title}
        </Header>
        <Box direction="row" align="center" justify="end">
          <label>Timeframe:</label>
          <Box pad={{ horizontal: "small" }} >
            <select name="timeframe" value={timeframe}
              onChange={this._onTimeframeChange}>
              <option value="1">Last hour</option>
              <option value="12">Last 12 hours</option>
              <option value="24">Last 24 hours</option>
            </select>
          </Box>
        </Box>
        <Tiles ref="tiles" flush={false} justify="center"  full="horizontal">
          {alertTiles}
        </Tiles>
      </div>
    );
  }

}

Dashboard.propTypes = {
  dashboard: PropTypes.shape({
    graphicSize: PropTypes.oneOf(['small', 'medium', 'large']),
    alerts: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired
    }))
  }).isRequired
};

let select = (state) => ({ dashboard: state.dashboard, nav: state.nav, test: state.test });

export default connect(select)(Dashboard);
