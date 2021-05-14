import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { QuillBinding } from 'y-quill';
import Quill from 'quill';
import QuillCursors from 'quill-cursors';

Quill.register('modules/cursors', QuillCursors);

const quill = new Quill(document.querySelector('#editor'), {
  modules: {
    cursors: true,
    toolbar: [
      // adding some basic Quill content features
      ['bold', 'italic', 'underline']
    ],
    history: {
      // Local undo shouldn't undo changes
      // from remote users
      userOnly: true
    }
  },
  placeholder: 'Start collaborating...',
  theme: 'snow' // 'bubble' is also great
});

const ydoc = new Y.Doc();
const ytext = ydoc.getText('quill');

const provider = new WebsocketProvider('ws://localhost:1234', 'lab-4160', ydoc);
const awareness = provider.awareness;

const binding = new QuillBinding(ytext, quill, awareness);

setInterval(() => {
  const strings = [];
  awareness.getStates().forEach(state => {
    if (state.user) {
      strings.push(`<div style="color:${state.user.color};">&#128591;&#127999; ${state.user.name}</div>`);
    }
    document.querySelector('#users').innerHTML = strings.join('');
  });
}, 100);

let color = [
  '#000000',
  '#0000ff',
  '#00ff00',
  '#00ffff',
  '#ff0000',
  '#ff00ff'
][Math.floor(Math.random() * 7)];
const inputElement = document.querySelector('#username');
inputElement.addEventListener('input', () => {
  awareness.setLocalStateField('user', { name: inputElement.value, color: color });
});

const button = document.getElementById('button');
button.addEventListener('click', () => {
  if (provider.shouldConnect) {
    provider.disconnect();
    button.textContent = 'Connect';
  } else {
    provider.connect();
    button.textContent = 'Disconnect';
  }
});
