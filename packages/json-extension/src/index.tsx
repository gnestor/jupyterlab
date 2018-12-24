// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { IRenderMime } from '@jupyterlab/rendermime-interfaces';

import { ToolbarButton } from '@jupyterlab/apputils';

import { Widget } from '@phosphor/widgets';

import * as React from 'react';

import * as ReactDOM from 'react-dom';

import { Component } from './component';

import '../style/index.css';

/**
 * The CSS class to add to the JSON Widget.
 */
const CSS_CLASS = 'jp-RenderedJSON';

/**
 * The MIME type for JSON.
 */
export const MIME_TYPE = 'application/json';

/**
 * A renderer for JSON data.
 */
export class RenderedJSON extends Widget implements IRenderMime.IRenderer {
  /**
   * Create a new widget for rendering JSON.
   */
  constructor(options: IRenderMime.IRendererOptions) {
    super();
    this.addClass(CSS_CLASS);
    this.addClass('CodeMirror');
    this.addClass('cm-s-jupyter');
    this._mimeType = options.mimeType;
    this._expanded = false;
  }

  /**
   * Render JSON into this widget's node.
   */
  renderModel(model: IRenderMime.IMimeModel): Promise<void> {
    const data = model.data[this._mimeType] as any;
    const metadata = (model.metadata[this._mimeType] as any) || {};
    return new Promise<void>((resolve, reject) => {
      ReactDOM.render(
        <Component data={data} metadata={metadata} />,
        this.node,
        () => {
          resolve();
        }
      );
    });
  }

  private _mimeType: string;
  public _expanded: boolean;
}

/**
 * A mime renderer factory for JSON data.
 */
export const rendererFactory: IRenderMime.IRendererFactory = {
  safe: true,
  mimeTypes: [MIME_TYPE],
  createRenderer: options => new RenderedJSON(options)
};

const extensions: IRenderMime.IExtension | IRenderMime.IExtension[] = [
  {
    id: '@jupyterlab/json-extension:factory',
    rendererFactory,
    rank: 0,
    dataType: 'json',
    documentWidgetFactoryOptions: {
      name: 'JSON',
      primaryFileType: 'json',
      fileTypes: ['json', 'notebook'],
      defaultFor: ['json'],
      toolbarFactory: (widget: RenderedJSON) => {
        const button = new ToolbarButton({
          className: 'jp-ToolbarButtonComponent',
          onClick: () => {
            widget._expanded = !widget._expanded;
            widget.update();
          },
          iconClassName: `${
            widget._expanded ? 'jp-ExpandLessIcon' : 'jp-ExpandMoreIcon'
          } jp-Icon jp-Icon-16`
        });
        return [{ name: 'expand', widget: button }];
      }
    }
  }
];

export default extensions;
