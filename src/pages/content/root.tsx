// import { createRoot } from 'react-dom/client';
// import App from '@root/src/pages/content/Menu';
import refreshOnUpdate from 'virtual:reload-on-update-in-view';
// import injectedStyle from './injected.css?inline';
import { attachTwindStyle } from '@src/shared/style/twind';

refreshOnUpdate('pages/content');

let lastCursorPos = { x: 0, y: 0 };

document.addEventListener('mousemove', (event) => {
  lastCursorPos.x = event.clientX;
  lastCursorPos.y = event.clientY;
});

setInterval(() => {
  chrome.runtime.sendMessage({ type: "CURSOR_POSITION", position: lastCursorPos });
  console.log("send")
}, 5000);
