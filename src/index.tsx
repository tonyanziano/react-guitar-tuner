import { createRoot } from 'react-dom/client';

import { App } from './app';

const appContainer = document.getElementById('root');
const root = createRoot(appContainer!); // null assertion taken directly from React docs: https://react.dev/blog/2022/03/08/react-18-upgrade-guide#updates-to-client-rendering-apis
root.render(<App />);
