// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
  // JSONObject,
  PromiseDelegate
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

import * as Plotly from 'plotly.js/lib/core';

import '../style/index.css';


/**
 * The CSS class to add to the JSON Widget.
 */
const CSS_CLASS = 'jp-RenderedPlotly';

/**
 * The MIME type for Vega.
 *
 * #### Notes
 * The version of this follows the major version of Vega.
 */
export
const MIME_TYPE = 'application/vnd.plotly.v1+json';

interface PlotlySpec {
  data: Plotly.Data,
  layout: Plotly.Layout
};


export
class RenderedPlotly extends Widget implements IRenderMime.IReadyWidget {
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
    const { data, layout }: { data: Plotly.Data[], layout: Plotly.Layout } = this._model.data.get(this._mimeType) as any | PlotlySpec;
    // const data: this._model.data.get(this._mimeType) as JSONObject | PlotlySpec;
    // const metadata = this._model.metadata.get(this._mimeType) as JSONObject || {};
    Plotly.newPlot(this.node, data, layout)
      .then(() => {
        Plotly.Plots.resize(this.node);
      });
      // .then(plot =>
      //   Plotly.toImage(plot, {
      //     format: 'png',
      //     width: this.props.width || DEFAULT_WIDTH,
      //     height: this.props.height || DEFAULT_HEIGHT
      //   }))
      // .then(url => {
      //   const data = url.split(',')[1];
      //   this.props.callback(null, data);
      //   this.handleResize();
      // });
  }

  /**
   * A message handler invoked on a `'resize'` message.
   */
  protected onResize(msg: Widget.ResizeMessage) {
    Plotly.redraw(this.node)
      .then(() => {
        Plotly.Plots.resize(this.node);
      });
      // .then(plot =>
      //   Plotly.toImage(plot, {
      //     format: 'png',
      //     width: this.props.width || DEFAULT_WIDTH,
      //     height: this.props.height || DEFAULT_HEIGHT
      //   }))
      // .then(url => {
      //   const data = url.split(',')[1];
      //   this.props.callback(null, data);
      //   this.handleResize();
      // });
  }

  // private _width = -1;
  // private _height = -1;
  private _model: IRenderMime.IMimeModel = null;
  private _mimeType: string;
  private _ready = new PromiseDelegate<void>();
}


/**
 * A mime renderer for Vega/Vega-Lite data.
 */
export
class PlotlyRenderer implements IRenderMime.IRenderer {
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
    return new RenderedPlotly(options);
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
    renderer: new PlotlyRenderer(),
    rendererIndex: 0,
    dataType: 'json',
    widgetFactoryOptions: {
      name: 'Plotly',
      fileExtensions: ['.plotly', '.plotly.json'],
      defaultFor: ['.plotly', '.plotly.json'],
      readOnly: true
    }
  }
];

export default extensions;
