import React from 'react';
import { createRoot } from 'react-dom/client';
import { Game } from '../components/Game';

/**
 * Main application entry point
 * Bootstraps the React application and renders the Game component
 */

// Get the root DOM element
const container = document.getElementById('root');

if (!container) {
  throw new Error('Root element not found');
}

// Create a React root and render the Game component
const root = createRoot(container);
root.render(<Game />);