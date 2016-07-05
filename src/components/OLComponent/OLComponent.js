import React from 'react'
//import classes from './CesiumComponent.scss'
import ol from 'openlayers';
require('./ol3-layerswitcher.js')
import WMS from './'
import $ from 'jquery';

require("openlayers/css/ol.css");
require("./OLComponent.css");
import classes from './ol3-layerswitcher.scss'


var g_BING_API_KEY = 'AtXX65CBBfZXBxm6oMyf_5idMAMI7W6a5GuZ5acVcrYi6lCQayiiBz7_aMHB7JR7'


class OLComponent extends React.Component {
  static propTypes = {
    capabilities: React.PropTypes.object,
    dataset: React.PropTypes.object
  }

  constructor(props) {
    super(props);
    this.map = null;
    this.baseLayers = new ol.layer.Group({'title': 'Base maps', 'opacity':1.0, 'visible':true,'zIndex':0})
    this.overlayLayers = new ol.layer.Group({'title': 'Overlays','opacity':1.0, 'visible':true,'zIndex':1})
    this.view = null
    this.tmpLayer=null

    this.popup = null;

  }

  // Returns base layers list
  getMapBaseLayersList() {
    if (this.baseLayers != null) {
      return this.baseLayers.getLayers()
    }
    return []
  }

  // Returns overlay layers list
  getMapOverlayList() {
    if (this.overlayLayers != null) {
      return this.overlayLayers.getLayers()
    }
    return []
  }

  // Add backgrounnd layer (use once)
  initBackgroundLayer() {
    this.addBingLayer('Aerial', this.getMapBaseLayersList(),'Aerial')
    var wmsUrl = "http://demo.boundlessgeo.com/geoserver/wms";
    var wmsParams = {'LAYERS': 'topp:states', 'TILED': true};
    this.addTileWMSLayer('topp:states', this.getMapOverlayList(), wmsUrl, wmsParams);
  }

  removeLayer(layers, title){
    var layer;

    for(layer in layers)
      if(title===layer.get('title')) {
        console.log('addTileWMSLayer: First Remove layer ' + layer.get('title'));
        this.map.removeLayer(layer)
      }
  }

  /*! \brief Adds a layer to a layers list
   @param layers layers input list
   @param wmsUrl wms url
   @param wmsParams parameters associated to the wms
   @param extent region extent to load
   @param serverType Server's type
   */
  addTileWMSLayer(title,
                  layers,
                  wmsUrl,
                  wmsParams,
                  extent,
                  serverType,
                  visible=true) {

    var layer = this.getTileWMSLayer(title,
      wmsUrl,
      wmsParams,
      extent,
      serverType,
      visible)
    layers.push(layer)
    console.log('addTileWMSLayer: Add layer ' + layer.get('title'));
    return layer;
  }

  /*! \brief Returns a ol3 layer to a layers list
   @param layers layers input list
   @param wmsUrl wms url
   @param wmsParams parameters associated to the wms
   @param extent region extent to load
   @param serverType Server's type
   */
  getTileWMSLayer(title,
                  wmsUrl,
                  wmsParams,
                  extent,
                  serverType="",
                  visible=true){

    if (extent == undefined) {
        return new ol.layer.Tile(
          {
            visible:visible,
            title: title,
            source: new ol.source.TileWMS(
              {
                url: wmsUrl,
                params: wmsParams,
                serverType: serverType
              })
          });
    }
    else {
        return new ol.layer.Tile(
          {
            title: title,
            extent: extent,
            source: new ol.source.TileWMS(
              {
                url: wmsUrl,
                params: wmsParams,
                serverType: serverType
              })
          });
    }
  }

  addBingLayer(title, layers, bingStyle){
    layers.push(new ol.layer.Tile({
      visible: true,
      preload: Infinity,
      source: new ol.source.BingMaps({
        key: g_BING_API_KEY,
        imagerySet: bingStyle
        // use maxZoom 19 to see stretched tiles instead of the BingMaps
        // "no photos at this zoom level" tiles
        // maxZoom: 19
      })
    }));
  }

  initMap() {

    this.view = new ol.View({
      center: [-10997148, 4569099],
      zoom: 4
    })

    var map = new ol.Map({
      layers: [this.baseLayers, this.overlayLayers],
      target: 'map',
      renderer: 'canvas',
      view: this.view
    });

    var layerSwitcher = new ol.control.LayerSwitcher({
      tipLabel: 'Legend' // Optional label for button
    });
    map.addControl(layerSwitcher);

    this.map = map;
  }

  /** Returns view resolution */
  getCurrentResolution() {
    if (this.view != null) {
      return this.view.getResolution()
    }
    return -1;
  }

  /** Sets view resolution */
  setCurrentResolution(resolution) {
    if (this.view != null) {
      this.view.setResolution(resolution)
    }
  }

  /** Returns current view center */
  getCurrentCenter() {
    if (this.view != null) {
      return this.view.getCenter()
    }
    return [];
  }

  /** Sets current view center */
  setCurrentCenter(center) {
    if (this.view != null) {
      this.view.setCenter(center)
    }
    return [];
  }

  /** Returns current projection */
  getCurrentProjection() {
    if (this.view != null) {
      return this.view.getProjection()
    }
    return "";
  }

  /** Sets current projection */
  setCurrentProjection(epsg_string) {
    if (this.view != null) {
      this.view.setProjection(epsg_string)
    }
  }

  componentDidMount(){
    this.initBackgroundLayer()
    this.initMap();
  }

  componentWillUnmount(){
    //TODO: Verify if usefull
    //this.map.setTarget(null);
    //this.map = null;
  }

  componentDidUpdate(prevProps, prevState){
    if(this.props.dataset && this.props.capabilities){
      var wmsUrl = this.props.capabilities.value["WMS_Capabilities"]["Service"][0]["OnlineResource"][0]["$"]["xlink:href"];
      var wmsParams = {
        'TRANSPARENT': 'TRUE',
        'LAYERS' : this.props.dataset["Name"][0],
        'BGCOLOR' : 'transparent',
        'SRS' : 'PSG:4326'
      }
      //this.addTileWMSLayer(this.props.dataset["Name"][0],this.getMapOverlayList(), wmsUrl, wmsParams);
      if(this.tmpLayer)
      {
        this.tmpLayer.setVisible(false);
        this.map.removeLayer(this.tmpLayer);
      }

      this.tmpLayer = this.addTileWMSLayer("ncWMS2 test",this.getMapOverlayList(), wmsUrl, wmsParams);
    }else{
    }
  }

  render () {
    return(
      <div id="map" className="map">
        <div id="popup" className="ol-popup"></div>
      </div>
    )
  }
}

export default OLComponent
