import { createRoot } from 'react-dom/client';
// import App from '@root/src/pages/content/Menu';
import refreshOnUpdate from 'virtual:reload-on-update-in-view';
import injectedStyle from './injected.css?inline';
import { attachTwindStyle } from '@src/shared/style/twind';
import Avatar from '@root/src/pages/content/Avatar';
import MiniWorld from '@root/src/pages/content/MiniWorld';

refreshOnUpdate('pages/content');


const miniworld = document.createElement('div');
miniworld.classList.add('minimap');

const rootIntoShadow = document.createElement('div');
rootIntoShadow.id = 'shadow-root';

const shadowRoot = miniworld.attachShadow({ mode: 'open' });
shadowRoot.appendChild(rootIntoShadow);

/** Inject styles into shadow dom */
const styleElement = document.createElement('style');
styleElement.innerHTML = injectedStyle;
shadowRoot.appendChild(styleElement);
attachTwindStyle(rootIntoShadow, shadowRoot);
createRoot(rootIntoShadow).render(
  <>
  <MiniWorld />
  </>
);

document.body.append(miniworld);