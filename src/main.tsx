import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

const rootElement = document.getElementById('root');

if (rootElement === null) {
    throw new Error('Root element could not be found.');
}

createRoot(rootElement).render(
    <BrowserRouter>
        <App />
    </BrowserRouter>
);
