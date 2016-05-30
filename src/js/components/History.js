// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';

import Box from 'grommet/components/Box';
import Header from 'grommet/components/Header';
import Tiles from 'grommet/components/Tiles';
import Title from 'grommet/components/Title';
import Tile from 'grommet/components/Tile';
import Meter from 'grommet/components/Meter';
import Calendar from 'grommet/components/Calendar';
import Image from 'grommet/components/Image';
import Button from 'grommet/components/Button';

import IndexHistory from './IndexHistory';
import { navActivate, dashboardLayout, historyLoad } from '../actions';
import Logo from './Logo';
var moment = require('moment');


class History extends Component {

  constructor() {
    super();
    this._onClickTitle = this._onClickTitle.bind(this);
    this._onTimeIncrease = this._onTimeIncrease.bind(this);
    this._onTimeDecrease = this._onTimeDecrease.bind(this);
    this._onResize = this._onResize.bind(this);
    this._layout = this._layout.bind(this);
    this._onTimeframeChange = this._onTimeframeChange.bind(this);
    this._onAtmChange = this._onAtmChange.bind(this);
    this.videos = [];
  }

  componentDidMount() {
    window.addEventListener('resize', this._onResize);
    this._onResize();
    this.props.dispatch(
      historyLoad(moment().format(), -1)
    );
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
  }

  _onClickTitle() {
    this.props.dispatch(navActivate(true));
  }

  _onTimeframeChange(event) {
    var parsedDate = moment.utc(event, "YYYY-MM-DD");
    var date = new Date(parsedDate.format());
    this.props.dispatch(
      historyLoad(date, -1, this.props.history.history.result.atmId)
    );
  }

  _onAtmChange(event) {
    this.props.dispatch(
      historyLoad(this.props.history.history.result.date, -1, event.target.value)
    );
  }

  _onTimeIncrease() {
    var skip = this.props.history.history.result.skip+=1;
    this.props.dispatch(historyLoad(this.props.history.history.result.date, skip, this.props.history.history.result.atmId));
  }

  _onTimeDecrease() {
    var skip = this.props.history.history.result.skip-=1;
    this.props.dispatch(historyLoad(this.props.history.history.result.date, skip, this.props.history.history.result.atmId));
  }

  _onResize() {
    // debounce
    clearTimeout(this._timer);
    this._timer = setTimeout(this._layout, 500);
  }

  _layout() {
    const { dispatch } = this.props;
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

  _renderCriticalAlerts(title, alerts) {
    if (alerts) {
      return (
      <Tile wide={true}>
        <h2>{title}</h2>
        <IndexHistory type="area" attribute="alert"
            series={alerts} smooth={true} size="small"/>
      </Tile>
       );
    } else {
      return (<Tiles></Tiles>);
    }
  }

  _renderTimeControl(dateStr, skip, max) {
    if (!dateStr) {
      return "";
    }

    var videoTitle = "Total videos: " + (max) + " Current: " + (skip + 1);
    return (
      <Tile flush={false} wide={true} justify="center">
        <br/>
        <h3 >{videoTitle}</h3>
        <Box direction="row" align="center" justify="center">
          <Button label="Previous video" onClick={this._onTimeDecrease} />&nbsp;&nbsp;&nbsp;
          <Button label="&nbsp;&nbsp;Next video&nbsp;&nbsp;" onClick={this._onTimeIncrease} />
        </Box>
        <br/>
      </Tile>
    );
  }

  _renderRangeSelector(atmList, date, atmId) {
    var atms = [];

    if (atmList) {
      for (var i = 0; i < atmList.length; i++) {
        atms.push(<option value={atmList[i].atmId}>{atmList[i].atmName}&nbsp;&nbsp;&nbsp;</option>);
      }
    }

    var date = moment(date).format('YYYY-MM-DD');

    return (
      <Box direction="row" align="center" justify="end">
        <Calendar value={date} onChange={this._onTimeframeChange} />&nbsp;
        <select name="timeframe" value={atmId} onChange={this._onAtmChange}>
          {atms}
        </select>
      </Box>
    );
  }

  _renderPhotos(photosData) {
    var photos = [];

    if (photosData && photosData.length > 0) {
      for (var i = 0; i < photosData.length; i++) {
        var key = "photo-" + i;
        photos.push(
          <Tile key={key}>
            <Image full={false}
                   size="small"
                   src={photosData[i]}/>
          </Tile>
        );
      }
    } else {
      photos.push( <Tile /> );
    }

    return photos;
  }

  _renderAlertsMeter(critical, warnings) {
    return (<Meter stacked={true}
      series={[
        {
          "colorIndex": "error",
          "status": "error",
          "value": critical,
          "label": "critical"
        },
        {
          "colorIndex": "warning",
          "status": "warning",
          "value": warnings,
          "label": "warning"
        }
      ]} type="circle"
                   legend={{placement: 'right', total: true}}
                   size="medium"/>
    );
  }

  _renderVideos(videoData) {
    var videos = [];

    if (videoData && videoData.length > 0) {
      for (var i = 0; i < videoData.length; i++) {
        var streamUri = videoData[i];
        var videoCanvasId = "video-" + i;

        videos.push(
          <Tile key={videoCanvasId} justify="start" pad="small">
            <canvas id={videoCanvasId} >
              <p>
                Please use a browser that supports the Canvas Element, like
                <a href="http://www.google.com/chrome">Chrome</a>,
                <a href="http://www.mozilla.com/firefox/">Firefox</a>,
                <a href="http://www.apple.com/safari/">Safari</a> or Internet Explorer 10
              </p>
            </canvas>
          </Tile>);

        var that = this;

        setTimeout(function() {
          let videoCanvas = document.getElementById(videoCanvasId);
          if (videoCanvas) {
            var videoclient = streamUri;
            if (streamUri.startsWith("ws")) {
              videoclient = new WebSocket(streamUri);
            }
          }

          if (!that.videos[videoCanvasId]) {
            var player = new jsmpeg(videoclient, {canvas: videoCanvas});
            player.autoplay = true;
            that.videos[videoCanvasId] = player;
          } else {
            that.videos[videoCanvasId].load(videoclient);
          }
        }, 2000);
      }
    } else {
      this.videos = [];
    }

    return videos;
  }

  _renderTotalMeters(total) {

    if (!total) {
      return (<Tile flush={false} wide={true} justify="center"></Tile>);
    }

    var ultrasonic = total.ultrasonic || 0;
    var vibration = total.vibration || 0;
    var photo = total.photo || 0;
    var infrared = total.infrared || 0;

    return (
      <Tile flush={false} wide={true} justify="center">
      <h2>
        Sensor events
      </h2>
      <Meter legend={true} series={[
        {"label": "Ultrasonic", "value": ultrasonic},
        {"label": "Shakes", "value": vibration},
        {"label": "Infrared", "value": infrared},
        {"label": "Photos", "value": photo}
      ]}  />
    </Tile>
    );
  }

  render() {
    const { history, date } = this.props.history;

    if (history.result) {
      let title = (
        <span>
        <Title onClick={this._onClickTitle}>
          <Logo />
          <span>IoT History</span>
        </Title>
      </span>
      );

      var contentTiles = [];
      contentTiles.push(this._renderCriticalAlerts("Critical Alerts", history.result.criticalAlerts));
      contentTiles.push(this._renderCriticalAlerts("Warning Alerts", history.result.warningAlerts));

      let timeControl = this._renderTimeControl(date, history.result.skip, history.result.max);
      let rangeSelector = this._renderRangeSelector(history.result.atmList, history.result.date,  history.result.atmId);
      let photos = this._renderPhotos(history.result.photos);
      let videos = this._renderVideos(history.result.videos);
      let alertsMeter = this._renderAlertsMeter(history.result.critical, history.result.warnings);
      let total = this._renderTotalMeters(history.result.total);

      return (
        <div ref="content">
          <Header direction="row" justify="between"
                  large={true} pad={{horizontal: 'medium'}}>
            {title}
            {rangeSelector}
          </Header>

          <Tiles ref="tiles" fill={true} flush={false}>
            <Tiles fill={true} flush={false} >
              {contentTiles}
            </Tiles>
            <Tiles fill={true} flush={false}>
              <Tile justify="start">
                <Tiles fill={true} flush={false} >
                  <Tile flush={false} wide={true}>
                    <h2>
                      Alerts
                    </h2>
                    {alertsMeter}
                    <br/>
                  </Tile>

                  {total}
                </Tiles>
              </Tile>
              <Tile fill={true} flush={false} >
                {timeControl}
                <h2>
                  Video
                    {videos}
                </h2>

                <h2>
                  Photos
                </h2>
                <Box>
                  <Tiles fill={true} size="small">
                    {photos}
                  </Tiles>
                </Box>
              </Tile>
            </Tiles>
          </Tiles>
        </div>
      );
    } else {
      return (
        <div ref="content" >
          </div>
      );
    }
  }
}

History.propTypes = {
  history: PropTypes.shape({
    graphicSize: PropTypes.oneOf(['small', 'medium', 'large']),
    history: PropTypes.shape({
      id: PropTypes.string.isRequired
    })
  }).isRequired
};

let select = (state) => ({history: state.history, nav: state.nav});

export default connect(select)(History);

