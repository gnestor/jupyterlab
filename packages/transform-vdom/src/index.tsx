import * as React from 'react';
import { cloneDeep } from 'lodash';

import {
  objectToReactElement,
  VDOMEl,
  Attributes,
  SerializedEvent
} from './object-to-react';

interface Props {
  mediaType: 'application/vdom.v1+json';
  data: VDOMEl;
  onVDOMEvent: (targetName: string, event: SerializedEvent<any>) => void;
  resolveImport: (path: string) => string;
}

interface State {
  error: Error | null;
}

// Provide object-to-react as an available helper on the library
export { objectToReactElement, VDOMEl, Attributes, SerializedEvent };

const mediaType = 'application/vdom.v1+json';

export default class VDOM extends React.PureComponent<Props, State> {
  static MIMETYPE = mediaType;

  static defaultProps = {
    mediaType,
    onVDOMEvent: () => {
      console.log(
        "This app doesn't support vdom events ☹️ See @nteract/transform-vdom for more info: https://github.com/nteract/nteract/tree/master/packages/transform-vdom"
      );
    }
  };

  readonly state: State = {
    error: null
  };

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    this.setState({ error });
  }

  render(): React.ReactElement<any> {
    if (this.state.error) {
      return (
        <details open>
          <summary>{this.state.error.message}</summary>
          {this.state.error.stack.split('\n').map((item: string) => (
            <pre style={{ fontSize: '1vw' }}>{item}</pre>
          ))}
        </details>
      );
    }
    const obj = cloneDeep(this.props.data);
    return (
      <React.Suspense fallback={null}>
        {objectToReactElement(
          obj,
          this.props.onVDOMEvent,
          this.props.resolveImport
        )}
      </React.Suspense>
    );
  }
}
