import React from '//dev.jspm.io/react';
import PianoDefault from '//dev.jspm.io/react-piano-component';
// import './InteractivePiano.css';

// TODO: Better way to import default module
const { default: Piano } = PianoDefault;

// TODO: Better way to load required CSS
const linkElement = document.createElement('link');
linkElement.setAttribute('rel', 'stylesheet');
linkElement.setAttribute('type', 'text/css');
linkElement.setAttribute('href', '/files/vdom/ReactPianoComponent.css');
document.head.appendChild(linkElement);

function PianoContainer({ children }) {
  return React.createElement(
    'div',
    {
      className: 'interactive-piano__piano-container',
      onMouseDown: event => event.preventDefault()
    },
    children
  );
}

function AccidentalKey({ isPlaying, text, eventHandlers }) {
  return React.createElement(
    'div',
    { className: 'interactive-piano__accidental-key__wrapper' },
    React.createElement(
      'button',
      {
        className: `interactive-piano__accidental-key ${
          isPlaying ? 'interactive-piano__accidental-key--playing' : ''
        }`,
        ...eventHandlers
      },
      React.createElement('div', { className: 'interactive-piano__text' }, text)
    )
  );
}

function NaturalKey({ isPlaying, text, eventHandlers }) {
  return React.createElement(
    'button',
    {
      className: `interactive-piano__natural-key ${
        isPlaying ? 'interactive-piano__natural-key--playing' : ''
      }`,
      ...eventHandlers
    },
    React.createElement('div', { className: 'interactive-piano__text' }, text)
  );
}

function PianoKey({
  isNoteAccidental,
  isNotePlaying,
  startPlayingNote,
  stopPlayingNote,
  keyboardShortcuts
}) {
  function handleMouseEnter(event) {
    if (event.buttons) {
      startPlayingNote();
    }
  }

  const KeyComponent = isNoteAccidental ? AccidentalKey : NaturalKey;
  const eventHandlers = {
    onMouseDown: startPlayingNote,
    onMouseEnter: handleMouseEnter,
    onTouchStart: startPlayingNote,
    onMouseUp: stopPlayingNote,
    onMouseOut: stopPlayingNote,
    onTouchEnd: stopPlayingNote
  };
  return React.createElement(KeyComponent, {
    isPlaying: isNotePlaying,
    text: keyboardShortcuts.join(' / '),
    eventHandlers: eventHandlers
  });
}

export default function InteractivePiano() {
  return React.createElement(
    PianoContainer,
    null,
    React.createElement(Piano, {
      startNote: 'C4',
      endNote: 'B5',
      renderPianoKey: PianoKey,
      keyboardMap: {
        Q: 'C4',
        2: 'C#4',
        W: 'D4',
        3: 'D#4',
        E: 'E4',
        R: 'F4',
        5: 'F#4',
        T: 'G4',
        6: 'G#4',
        Y: 'A4',
        7: 'A#4',
        U: 'B4',
        V: 'C5',
        G: 'C#5',
        B: 'D5',
        H: 'D#5',
        N: 'E5',
        M: 'F5',
        K: 'F#5',
        ',': 'G5',
        L: 'G#5',
        '.': 'A5',
        ';': 'A#5',
        '/': 'B5'
      }
    })
  );
}
