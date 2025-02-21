import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { StyleSheetManager } from 'styled-components';
import App from './App.jsx';

// Funktion, die ein simuliertes Shadow DOM erstellt, auch im DEV‑Modus
function mountWithShadow(container) {
  // Erstelle ein temporäres Element als Shadow Host
  const shadowHost = document.createElement('div');
  container.appendChild(shadowHost);
  const shadowRoot = shadowHost.attachShadow({ mode: 'open' });
  
  // Füge Deine globalen Styles in das Shadow DOM ein
  const style = document.createElement('style');
  style.textContent = `
    :host {
      all: initial;
      display: block;
      width: 100%;
      height: 100%;
      font-family: Arial, sans-serif;
    }
    
    #react-container {
      width: 100%;
      height: 100%;
      font-family: inherit;
    }
  `;
  shadowRoot.appendChild(style);
  
  // Erstelle den React-Container im Shadow DOM
  const reactContainer = document.createElement('div');
  reactContainer.id = 'react-container';
  shadowRoot.appendChild(reactContainer);
  
  // Mounte die App in den Shadow Root
  createRoot(reactContainer).render(
    <StrictMode>
      <StyleSheetManager target={shadowRoot}>
        <App />
      </StyleSheetManager>
    </StrictMode>
  );
}

if (import.meta.env.DEV) {
  // DEV-Modus: Erstelle einen Container (falls noch nicht vorhanden) und simuliere Shadow DOM
  let devContainer = document.getElementById('react-container');
  if (!devContainer) {
    devContainer = document.createElement('div');
    devContainer.id = 'react-container';
    document.body.appendChild(devContainer);
  }
  mountWithShadow(devContainer);
} else {
  // PROD-Modus: Verwende ein Custom Element mit Shadow DOM
  class OgbGui extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      // Basis-Styles für das Shadow DOM
      const style = document.createElement('style');
      style.textContent = `
        :host {
          all: initial;
          display: block;
          width: 100%;
          height: 100%;
          font-family: Arial, sans-serif;
          }
        
        #react-container {
          width: 100%;
          height: 100%;
          font-family: inherit;
        }
      `;
      this.shadowRoot.appendChild(style);
      // Container für die React-App
      this.container = document.createElement('div');
      this.container.id = 'react-container';
      this.shadowRoot.appendChild(this.container);
    }
    
    connectedCallback() {
      let container = this.shadowRoot.getElementById('react-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'react-container';
        this.shadowRoot.appendChild(container);
      }
      createRoot(container).render(
        <StrictMode>
          <StyleSheetManager target={this.shadowRoot}>
            <App />
          </StyleSheetManager>
        </StrictMode>
      );
    }
  }
  
  customElements.define('ogb-gui', OgbGui);
}
