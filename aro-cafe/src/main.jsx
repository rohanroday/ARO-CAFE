import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles/index.css';

// No StrictMode on purpose: the animation engine takes over the DOM once and must not be run twice.
createRoot(document.getElementById('root')).render(<App />);
