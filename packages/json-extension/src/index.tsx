// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { IRenderMime } from '@jupyterlab/rendermime-interfaces';

import { ToolbarButton, ReactElementWidget } from '@jupyterlab/apputils';

import { Widget } from '@phosphor/widgets';

import * as React from 'react';

import * as ReactDOM from 'react-dom';

import { InputGroup } from '@jupyterlab/ui-components';

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
 * Prop types for ToolbarInputComponent.
 */
type ToolbarInputComponentProps = {
  className: string;
  placeholder?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

/**
 * VDOM component for toolbar input.
 */
function ToolbarInputComponent(props: ToolbarInputComponentProps) {
  return <InputGroup type="text" rightIcon="search" {...props} />;
}

/**
 * Phosphor Widget version of ToolbarInputComponent.
 */
class ToolbarInput extends ReactElementWidget {
  constructor(props: ToolbarInputComponentProps) {
    super(<ToolbarInputComponent {...props} />);
    this.addClass('jp-ToolbarButton');
  }
}

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
    this._filter = '';
    this._timer = 0;
  }

  /**
   * Render JSON into this widget's node.
   */
  renderModel(model: IRenderMime.IMimeModel): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const data = model.data[this._mimeType] as any;
      const metadata = (model.metadata[this._mimeType] as any) || {};
      ReactDOM.render(
        <Component
          data={data}
          metadata={{
            ...metadata,
            expanded: this._expanded,
            filter: this._filter
          }}
        />,
        this.node,
        () => {
          resolve();
        }
      );
    });
  }

  renderToolbar(model?: IRenderMime.IMimeModel): IRenderMime.IToolbarItem[] {
    const expand = new ToolbarButton({
      className: 'jp-ToolbarButtonComponent',
      label: this._expanded ? 'Collapse All' : 'Expand All',
      tooltip: this._expanded ? 'Collapse All' : 'Expand All',
      onClick: this.toggleExpand
    });
    const search = new ToolbarInput({
      className: 'filter',
      placeholder: 'Filter...',
      onChange: this.handleFilter
    });
    return [
      { name: 'expand', widget: expand },
      { name: 'search', widget: search }
    ];
  }

  onUpdateRequest() {
    this.parent.update();
  }

  toggleExpand = () => {
    this._expanded = !this._expanded;
    this.update();
  };

  handleFilter = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    window.clearTimeout(this._timer);
    this._timer = window.setTimeout(() => {
      this._filter = value;
      this.update();
    }, 300);
  };

  private _mimeType: string;
  public _expanded: boolean;
  public _filter: string;
  private _timer: number;
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
        return widget.renderToolbar();
      }
    }
  }
];

export default extensions;
