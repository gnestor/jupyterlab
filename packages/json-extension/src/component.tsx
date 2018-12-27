// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import * as React from 'react';

import Highlight from 'react-highlighter';

import JSONTree from 'react-json-tree';

import { JSONArray, JSONObject, JSONValue } from '@phosphor/coreutils';

/**
 * The properties for the JSON tree component.
 */
export interface IProps {
  data: JSONValue;
  metadata: JSONObject & { expanded: boolean; filter: string };
}

/**
 * A component that renders JSON data as a collapsible tree.
 */
export class Component extends React.Component<IProps, null> {
  render() {
    const { data, metadata } = this.props;
    const root = metadata && metadata.root ? (metadata.root as string) : 'root';
    const keyPaths = metadata.filter
      ? filterPaths(data, metadata.filter, [root])
      : [root];
    return (
      <div className="container">
        <JSONTree
          data={data}
          collectionLimit={100}
          theme={{
            extend: theme,
            valueLabel: 'cm-variable',
            valueText: 'cm-string',
            nestedNodeItemString: 'cm-comment'
          }}
          invertTheme={false}
          keyPath={[root]}
          labelRenderer={([label, type]) => {
            // let className = 'cm-variable';
            // if (type === 'root') {
            //   className = 'cm-variable-2';
            // }
            // if (type === 'array') {
            //   className = 'cm-variable-2';
            // }
            // if (type === 'Object') {
            //   className = 'cm-variable-3';
            // }
            return (
              <span className="cm-keyword">
                <Highlight
                  search={metadata.filter}
                  matchStyle={{ backgroundColor: 'yellow' }}
                >
                  {`${label}: `}
                </Highlight>
              </span>
            );
          }}
          valueRenderer={raw => {
            let className = 'cm-string';
            if (typeof raw === 'number') {
              className = 'cm-number';
            }
            if (raw === 'true' || raw === 'false') {
              className = 'cm-keyword';
            }
            return (
              <span className={className}>
                <Highlight
                  search={metadata.filter}
                  matchStyle={{ backgroundColor: 'yellow' }}
                >
                  {`${raw}`}
                </Highlight>
              </span>
            );
          }}
          shouldExpandNode={(keyPath, data, level) =>
            metadata && metadata.expanded
              ? true
              : keyPaths.join(',').includes(keyPath.join(','))
          }
        />
      </div>
    );
  }
}

// Provide an invalid theme object (this is on purpose!) to invalidate the
// react-json-tree's inline styles that override CodeMirror CSS classes
const theme = {
  scheme: 'jupyter',
  base00: 'invalid',
  base01: 'invalid',
  base02: 'invalid',
  base03: 'invalid',
  base04: 'invalid',
  base05: 'invalid',
  base06: 'invalid',
  base07: 'invalid',
  base08: 'invalid',
  base09: 'invalid',
  base0A: 'invalid',
  base0B: 'invalid',
  base0C: 'invalid',
  base0D: 'invalid',
  base0E: 'invalid',
  base0F: 'invalid'
};

function objectIncludes(data: JSONValue, query: string): boolean {
  return JSON.stringify(data).includes(query);
}

function filterPaths(
  data: JSONValue,
  query: string,
  parent: JSONArray = ['root']
): JSONArray {
  if (Array.isArray(data)) {
    return data.reduce((result: JSONArray, item: JSONValue, index: number) => {
      if (item && typeof item === 'object' && objectIncludes(item, query)) {
        return [
          ...result,
          [index, ...parent].join(','),
          ...filterPaths(item, query, [index, ...parent])
        ];
      }
      return result;
    }, []) as JSONArray;
  }
  if (typeof data === 'object') {
    return Object.keys(data).reduce((result: JSONArray, key: string) => {
      let item = data[key];
      if (
        item &&
        typeof item === 'object' &&
        (key.includes(query) || objectIncludes(item, query))
      ) {
        return [
          ...result,
          [key, ...parent].join(','),
          ...filterPaths(item, query, [key, ...parent])
        ];
      }
      return result;
    }, []);
  }
}
