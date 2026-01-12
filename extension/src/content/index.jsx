import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import App from '../App';

const init = () => {
  if (document.getElementById('movie-bot-root')) return;

  const container = document.createElement('div');
  container.id = 'movie-bot-root';
  container.style.position = 'fixed';
  container.style.zIndex = '99999';
  container.style.bottom = '20px';
  container.style.right = '20px';
  document.body.appendChild(container);

  // Create shadow root to isolate styles
  const shadowRoot = container.attachShadow({ mode: 'open' });

  // Inject styles manually (since we are in shadow DOM)
  const style = document.createElement('style');
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
    
    :host {
      font-family: 'Inter', sans-serif;
      --primary-color: #e50914; /* Default (Netflix) */
      --bg-color: #1a1a1a;
      --header-bg: #e50914;
      --bot-msg-bg: #e50914;
      --user-msg-bg: #333;
    }

    /* THEMES */
    .theme-netflix {
        --primary-color: #e50914;
        --header-bg: #e50914;
        --bot-msg-bg: #e50914;
    }

    .theme-prime {
        --primary-color: #00A8E1;
        --header-bg: #0F171E; /* Prime Dark Header */
        --bot-msg-bg: #00A8E1;
    }

    .theme-disney {
        --primary-color: #113CCF; 
        --header-bg: linear-gradient(to bottom, #1a1d29, #1a1d29); /* Disney dark */
        --bot-msg-bg: #113CCF;
    }

    .theme-hotstar {
        --primary-color: #113CCF; /* Similar to Disney */
        --header-bg: #0c111b; 
        --bot-msg-bg: #113CCF;
    }
    
    .theme-jio {
        --primary-color: #d80073; /* Jio Pink/Red */
        --header-bg: #000;
        --bot-msg-bg: #d80073;
    }

    * {
      box-sizing: border-box;
    }

    .chat-container {
      background: var(--bg-color);
      color: white;
      width: 350px;
      height: 500px;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.5);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      font-size: 14px;
      border: 1px solid rgba(255,255,255,0.1);
    }

    .chat-header {
      background: var(--header-bg);
      padding: 12px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 600;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }

    .chat-body {
      flex: 1;
      padding: 16px;
      overflow-y: auto;
      background: #121212;
    }

    .chat-input-area {
      padding: 12px;
      background: #1a1a1a;
      border-top: 1px solid #333;
      display: flex;
      gap: 8px;
    }

    input {
      flex: 1;
      background: #333;
      border: 1px solid #444;
      padding: 8px 12px;
      border-radius: 20px;
      color: white;
      outline: none;
      transition: border-color 0.2s;
    }
    
    input:focus {
        border-color: var(--primary-color);
    }

    button.send-btn {
      background: var(--primary-color);
      border: none;
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      cursor: pointer;
      font-weight: 600;
      transition: opacity 0.2s;
    }
    
    button.send-btn:hover {
        opacity: 0.9;
    }

    .message {
      margin-bottom: 12px;
      max-width: 85%;
      padding: 8px 12px;
      border-radius: 12px;
      line-height: 1.4;
    }

    .user-msg {
      background: var(--user-msg-bg);
      color: white;
      align-self: flex-end;
      margin-left: auto;
      border-bottom-right-radius: 2px;
    }

    .bot-msg {
      background: var(--bot-msg-bg);
      color: white;
      align-self: flex-start;
      margin-right: auto;
      border-bottom-left-radius: 2px;
    }

    .movie-card {
      background: #2a2a2a;
      border-radius: 8px;
      margin-top: 8px;
      overflow: hidden;
      display: flex;
      gap: 10px;
      padding: 8px;
      border: 1px solid #333;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    
    .movie-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        border-color: var(--primary-color);
    }
    
    .movie-card img {
      width: 50px;
      height: 75px;
      object-fit: cover;
      border-radius: 4px;
    }

    .movie-info h4 {
      margin: 0 0 4px 0;
      font-size: 13px;
    }
    
    .movie-info p {
      margin: 0;
      font-size: 11px;
      color: #ccc;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .fab {
      width: 60px;
      height: 60px;
      border-radius: 30px;
      background: var(--primary-color);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      transition: transform 0.2s;
    }

    .fab:hover {
      transform: scale(1.1);
    }

    /* Scrollbar */
    ::-webkit-scrollbar {
      width: 6px;
    }
    ::-webkit-scrollbar-track {
      background: #1a1a1a; 
    }
    ::-webkit-scrollbar-thumb {
      background: #444; 
      border-radius: 3px;
    }
  `;

  shadowRoot.appendChild(style);

  // Mount React
  const root = createRoot(shadowRoot);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
};

// Wait for DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Helper to detect movie title
window.getNetflixTitle = () => {
  // Strategy 1: Look for specific class names (very brittle, purely exemplary)
  const titleStatus = document.querySelector('.video-title');
  if (titleStatus) return titleStatus.innerText;

  // Strategy 2: Check H1/H2
  const h1 = document.querySelector('h1');
  if (h1 && window.location.hostname.includes('netflix')) return h1.innerText;

  // Strategy 3: Check Document Title
  // Netflix usually is "Movie Title - Netflix"
  if (document.title.includes(' - Netflix')) {
    return document.title.split(' - Netflix')[0];
  }

  return null;
}
