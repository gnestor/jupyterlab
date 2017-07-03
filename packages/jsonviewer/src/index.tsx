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

import * as React from 'react';

import * as ReactDOM from 'react-dom';

import {
  Component
} from './component';


/**
 * The CSS class to add to the JSON Widget.
 */
const CSS_CLASS = 'jp-RenderedJSON';

/**
 * The MIME type for Vega.
 *
 * #### Notes
 * The version of this follows the major version of Vega.
 */
export
const MIME_TYPE = 'application/json';


export
class RenderedJSON extends Widget implements IRenderMime.IReadyWidget {
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
    const data = this._model.data.get(this._mimeType) as JSONObject;
    const metadata = this._model.metadata.get(this._mimeType) as JSONObject || {};
    const props = { data, metadata, theme: 'cm-s-jupyter' };
    ReactDOM.render(<Component {...props} />, this.node, () => {
      this._ready.resolve(undefined);
    });
  }

  private _model: IRenderMime.IMimeModel = null;
  private _mimeType: string;
  private _ready = new PromiseDelegate<void>();
}


/**
 * A mime renderer for Vega/Vega-Lite data.
 */
export
class JSONRenderer implements IRenderMime.IRenderer {
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
    return new RenderedJSON(options);
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
    renderer: new JSONRenderer(),
    rendererIndex: 0,
    dataType: 'json',
    widgetFactoryOptions: {
      name: 'JSON',
      fileExtensions: ['.json'],
      defaultFor: ['.json'],
      readOnly: true
    }
  }
];

export default extensions;
