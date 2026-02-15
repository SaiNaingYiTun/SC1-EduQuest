import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css';

import { QuestProvider } from "./components/QuestContext";


const root = ReactDOM.createRoot(document.getElementById('root')); // Use createRoot
root.render(
  <React.StrictMode>
    <QuestProvider>
      <App />
    </QuestProvider>
  </React.StrictMode>
);

