// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
  JSONObject, PromiseDelegate
} from '@phosphor/coreutils';

import {
  Message,
} from '@phosphor/messaging';

import {
  Widget
} from '@phosphor/widgets';

import {
  IRenderMime
} from '@jupyterlab/rendermime-interfaces';

import * as leaflet from 'leaflet';

import 'leaflet/dist/leaflet.css';

import '../style/index.css';


/**
 * The CSS class to add to the JSON Widget.
 */
const CSS_CLASS = 'jp-RenderedGeoJSON';

/**
 * The MIME type for Vega.
 *
 * #### Notes
 * The version of this follows the major version of Vega.
 */
export
const MIME_TYPE = 'application/geo+json';

/**
 * Set base path for leaflet images.
 */
leaflet.Icon.Default.imagePath = 'https://unpkg.com/leaflet/dist/images/';

/**
 * The url template that leaflet tile layers.
 * See http://leafletjs.com/reference-1.0.3.html#tilelayer
 */
const URL_TEMPLATE: string = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

/**
 * The options for leaflet tile layers.
 * See http://leafletjs.com/reference-1.0.3.html#tilelayer
 */
const LAYER_OPTIONS: JSONObject = {
  attribution: 'Map data (c) <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
  minZoom: 0,
  maxZoom: 18
};


export
class RenderedGeoJSON extends Widget implements IRenderMime.IReadyWidget {
  /**
   * Create a new widget for rendering Vega/Vega-Lite.
   */
  constructor(options: IRenderMime.IRenderOptions) {
    super();
    this.addClass(CSS_CLASS);
    this._model = options.model;
    this._mimeType = options.mimeType;
  }

  /**
   * A promise that resolves when the widget is ready.
   */
  get ready(): Promise<void> {
    return this._ready.promise;
  }

  /**
   * Dispose of the widget.
   */
  dispose(): void {
    this._model = null;
    this._map.remove();
    this._map = null;
    super.dispose();
  }

  /**
   * Trigger rendering after the widget is attached to the DOM.
   */
  onAfterAttach(msg: Message): void {
    this._render();
  }

  /**
   * Actual render Vega/Vega-Lite into this widget's node.
   */
  private _render(): void {
    const data = this._model.data.get(this._mimeType) as JSONObject | GeoJSON.GeoJsonObject;
    const metadata = this._model.metadata.get(this._mimeType) as JSONObject || {};
    this._map = leaflet.map(this.node).fitWorld();
    this._map.scrollWheelZoom.disable();
    leaflet.tileLayer(
      metadata.url_template as string || URL_TEMPLATE,
      metadata.layer_options as JSONObject || LAYER_OPTIONS
    ).addTo(this._map);
    this._geoJSONLayer = leaflet.geoJSON(data as GeoJSON.GeoJsonObject).addTo(this._map);
    this._map.fitBounds(this._geoJSONLayer.getBounds());
    this._map.invalidateSize();
  }

  /**
   * A message handler invoked on a `'resize'` message.
   */
  protected onResize(msg: Widget.ResizeMessage) {
    this._width = msg.width;
    this._height = msg.height;
    this._map.fitBounds(this._geoJSONLayer.getBounds());
    this._map.invalidateSize();
  }

  private _map: leaflet.Map;
  private _geoJSONLayer: leaflet.GeoJSON;
  private _width = -1;
  private _height = -1;
  private _model: IRenderMime.IMimeModel = null;
  private _mimeType: string;
  private _ready = new PromiseDelegate<void>();
}


/**
 * A mime renderer for Vega/Vega-Lite data.
 */
export
class GeoJSONRenderer implements IRenderMime.IRenderer {
  /**
   * The mimeTypes this renderer accepts.
   */
  mimeTypes = [MIME_TYPE];

  /**
   * Whether the renderer can render given the render options.
   */
  canRender(options: IRenderMime.IRenderOptions): boolean {
    return this.mimeTypes.indexOf(options.mimeType) !== -1;
  }

  /**
   * Render the transformed mime bundle.
   */
  render(options: IRenderMime.IRenderOptions): IRenderMime.IReadyWidget {
    return new RenderedGeoJSON(options);
  }

  /**
   * Whether the renderer will sanitize the data given the render options.
   */
  wouldSanitize(options: IRenderMime.IRenderOptions): boolean {
    return false;
  }
}


const extensions: IRenderMime.IExtension | IRenderMime.IExtension[] = [
  {
    mimeType: MIME_TYPE,
    renderer: new GeoJSONRenderer(),
    rendererIndex: 0,
    dataType: 'json',
    widgetFactoryOptions: {
      name: 'GeoJSON',
      fileExtensions: ['.geojson', '.geo.json'],
      defaultFor: ['.geojson', '.geo.json'],
      readOnly: true
    }
  }
];

export default extensions;
