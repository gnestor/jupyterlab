// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { IRenderMime } from '@jupyterlab/rendermime-interfaces';

import { ToolbarButton, ReactElementWidget } from '@jupyterlab/apputils';

import { Widget } from '@phosphor/widgets';

import { each } from '@phosphor/algorithm';

import { MimeDocument } from '@jupyterlab/docregistry';

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
    this._model = model;
    const data = this._model.data[this._mimeType] as any;
    const metadata = (this._model.metadata[this._mimeType] as any) || {};
    return new Promise<void>((resolve, reject) => {
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

  onUpdateRequest() {
    this.renderModel(this._model);
    this.renderToolbar();
  }

  renderToolbar = () => {
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
    const toolbar = (this.parent.parent as MimeDocument).toolbar;
    // Remove all children from toolbar
    each(toolbar.children(), child => {
      toolbar.layout.removeWidget(child);
    });
    toolbar.insertItem(0, 'expand', expand);
    toolbar.insertItem(1, 'search', search);
  };

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
  private _model: IRenderMime.IMimeModel;
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
        const button = new ToolbarButton({
          className: 'jp-ToolbarButtonComponent',
          label: widget._expanded ? 'Collapse All' : 'Expand All',
          tooltip: widget._expanded ? 'Collapse All' : 'Expand All',
          onClick: widget.toggleExpand
          // iconClassName: `${
          //   widget.isExpanded() ? 'jp-ExpandLessIcon' : 'jp-ExpandMoreIcon'
          // } jp-Icon jp-Icon-16`
        });
        const search = new ToolbarInput({
          className: 'filter',
          placeholder: 'Filter...',
          onChange: widget.handleFilter
        });
        return [
          { name: 'expand', widget: button },
          { name: 'search', widget: search }
        ];
      }
    }
  }
];

export default extensions;
