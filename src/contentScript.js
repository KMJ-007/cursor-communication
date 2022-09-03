'use strict';
import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';
import { PerfectCursor } from 'perfect-cursors';
import { nanoid } from 'nanoid';
import randomcolor from 'randomcolor';
console.log('hello karan');

document.body.innerHTML +=
  '<div id="cursor-chat-layer"><input type="text" id="cursor-chat-box"></div>';

function initCursorFunction(
  cursorDivId = 'cursor-chat-layer',
  chatDivId = 'cursor-chat-box'
) {
  let chatLayerDiv = document.getElementById(`${cursorDivId}`);
  let chatInputDiv = document.getElementById(`${chatDivId}`);

  if (!chatLayerDiv || !chatInputDiv) {
    throw `Couldn't find cursor-chat-related divs! Make sure DOM content is fully loaded before initializing`;
  }
  const room_id = `cursor-chat-room-${
    window.location.host + window.location.pathname
  }`;
  let me = {
    id: nanoid(),
    color: randomcolor(),
    x: 0,
    y: 0,
    chat: '',
  };
  const doc = new Y.Doc();
  new WebrtcProvider(room_id, doc);
  // other people
  const others = doc.getMap('state');

  let sendUpdate = false;
  addEventListener('beforeunload', () => {
    others.delete(me.id);
  });
  setInterval(() => {
    if (sendUpdate) {
      others.set(me.id, me);
      sendUpdate = false;
    }
  }, 100);
  console.log(others);
  // updating mouse
  document.onmousemove = (evt) => {
    if (me.x !== evt.pageX && me.y !== evt.pageY) {
      sendUpdate = true;
      me.x = evt.pageX;
      me.y = evt.pageY;
      chatInputDiv.style.setProperty(
        'transform',
        `translate(${me.x}px, ${me.y}px)`
      );
    }
  };

  const cursor_interp = new Map();
  others.observe((evt) => {
    const updated_cursors = evt.changes.keys;
    updated_cursors.forEach((change, cursor_id) => {
      console.log(change);
      if (me.id !== cursor_id) {
        switch (change.action) {
          case 'add':
            const new_cursor = others.get(cursor_id);
            const new_cursor_div = cursorFactory(new_cursor);
            new_cursor_div.classList.add('new');
            chatLayerDiv.appendChild(new_cursor_div);
            const add_point_closure = ([x, y]) =>
              new_cursor_div.style.setProperty(
                'transform',
                `translate(${x}px, ${y}px)`
              );
            const perfect_cursor = new PerfectCursor(add_point_closure);
            perfect_cursor.addPoint([new_cursor.x, new_cursor.y]);
            cursor_interp.set(cursor_id, perfect_cursor);
            break;

          case 'update':
            const updated_cursor = others.get(cursor_id);
            const updated_cursor_div = document.getElementById(
              `cursor_${cursor_id}`
            );
            const updated_chat_div = document.getElementById(
              `chat_${cursor_id}`
            );

            if (updated_cursor.chat === '') {
              updated_chat_div.classList.remove('show');
            } else {
              updated_chat_div.classList.add('show');
            }
            updated_chat_div.innerText = updated_cursor.chat;
            updated_cursor_div.classList.remove('new');
            cursor_interp
              .get(cursor_id)
              .addPoint([updated_cursor.x, updated_cursor.y]);
            break;
        }
      }
    });
  });
  console.log(others);
}
function newCursor(cursor) {
  console.log(cursor);
  const cursorHtml = `<div id="cursor_${cursor.id}" class="cursor">
 <svg
   xmlns="http://www.w3.org/2000/svg"
   viewBox="0 0 35 35"
   fill="none"
   fillRule="evenodd"
 >
   <g fill="rgba(0,0,0,.2)" transform="translate(1,1)">
     <path d="m12 24.4219v-16.015l11.591 11.619h-6.781l-.411.124z" />
     <path d="m21.0845 25.0962-3.605 1.535-4.682-11.089 3.686-1.553z" />
   </g>
   <g fill="white">
     <path d="m12 24.4219v-16.015l11.591 11.619h-6.781l-.411.124z" />
     <path d="m21.0845 25.0962-3.605 1.535-4.682-11.089 3.686-1.553z" />
   </g>
   <g fill="${randomcolor()}">
     <path d="m19.751 24.4155-1.844.774-3.1-7.374 1.841-.775z" />
     <path d="m13 10.814v11.188l2.969-2.866.428-.139h4.768z" />
   </g>
 </svg>
 <p id="chat_${
   cursor.id
 }" class="chat" style="background-color: ${randomcolor()}">${
    (cursor && cursor.chat) || ''
  }</p>
</div>`;
  const template = document.createElement('template');
  template.innerHTML = cursorHtml;
  const cursorEl = template.content.firstChild;
  console.log(cursorEl);
  return cursorEl;
}
initCursorFunction();
newCursor();
