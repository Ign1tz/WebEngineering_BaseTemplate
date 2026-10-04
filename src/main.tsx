import { createRoot } from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');

if (rootElement === null) {
    throw new Error('Root element could not be found.');
}

const root = createRoot(rootElement);

root.render(<App />);