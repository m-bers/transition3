//index.jsx
import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import App from './App';
import Theme from './Theme';
import './App.css';

const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);

root.render(
  <Theme>
    <App/>
  </Theme>,
);
