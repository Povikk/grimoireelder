import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from '../app/page';
import '../app/globals.css';
import '../app/rules.css';
import '../app/lore.css';
import '../app/enhancements.css';
import '../app/school.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
