import './style.css';
import { componentMap } from './componentMap';

// Override global fetch or loadComponent?
// Since legacy.js defines loadComponent globally (or in module scope?), 
// if legacy.js is a module, its functions are not global unless attached to window.
// Based on Step 87, loadComponent is defined at top level. If it's a module, it's local.
// BUT, legacy.js calls `loadAllComponents` which calls `loadComponent`.

// We need to PATCH legacy.js content to use our map, OR we just blindly replace `fetch(url)` in legacy.js
// But legacy.js is 29k lines, editing it via tool is risky/slow.

// Approach:
// 1. We will NOT import legacy.js directly if it has side effects we can't control.
// 2. Instead, we redefined `loadComponent` on window if legacy.js uses window.loadComponent.
// 3. BUT legacy.js seems to define it locally: `async function loadComponent(...)`.

// If legacy.js is imported as a module: `import './legacy.js'`, it runs.
// We can try to modify legacy.js to export its functions or attach them to window, 
// OR simpler:
// We modify legacy.js to use a global `window.resolveComponent(url)` helper that we define here.

window.resolveComponent = (url) => {
    // Basic normalization if needed, but currently exact match
    return componentMap[url] || '';
};

import './auth.js';
import './legacy.js';

console.log('Client User Loaded.');
