import React from 'react';
import { useGlobalState } from '../Components/Context/GlobalContext';
import { createGlobalStyle } from 'styled-components';

function ThemeGlobalStyle() {
    const {state } = useGlobalState()
    const { theme } = state.Design ;

  
    switch (theme) {
    case 'Unicorn':
      return <GlobalUnicornStyle />;
    case 'Hacky':
      return <GlobalHackyStyle />;
    case 'BookWorm':
        return <GlobalWhiteStyle />;
    case 'BlueOcean':
        return <GlobalOceanStyle />;
    case 'CyperPunk':
        return <GlobalCyberStyle />;
    case 'Darkness':
        return <GlobalDarkModeStyle />;
    // Standard: main
    default:
      return <GlobalStyle />;
  }
}

export default ThemeGlobalStyle;


const GlobalStyle = createGlobalStyle`
  :host {
    --primary-color:rgb(176, 187, 193);
    --secondary-color:rgb(245, 121, 63);
    
    --primary-accent:rgba(10, 226, 168, 0.86);
    --secondary-accent:rgba(219, 10, 226, 0.66);

    --main-text-color: #ffffff;
    --second-text-color:rgb(208, 112, 9);
    --error-text-color:rgba(225, 19, 19, 0.82);

    --primary-button-color: rgba(64, 226, 10, 0.82);
    --secondary-button-color: rgba(56, 205, 146, 0.74);

    --main-hover-color:rgba(13, 140, 110, 0.4);
    --secondary-hover-color:rgba(64, 226, 10, 0.82);
    --clear-hover-color:rgba(13, 211, 155, 0.83);

    --main-bg-color:rgba(23, 21, 47, 0.68);
    --second-bg-color:rgba(38, 141, 23, 0.68);

    --main-unit-color: rgba(10, 226, 168, 0.86);
    --second-unit-color: rgba(19, 194, 213, 0.86);
    
    --main-value-color: rgba(19, 213, 203, 0.86);
    
    --main-bg-nav-color:rgba(23, 21, 47, 0.95);
    
    --main-bg-card-color:rgba(53, 50, 50, 0.29);
    --main-bg-Innercard-color:rgba(83, 61, 85, 0.29);;


    --main-arrow-up: rgba(64, 226, 10, 0.82);
    --main-arrow-down: rgba(234, 24, 17, 0.84);

    --cannabis-active-color: #81C784;
    --cannabis-inactive-color: #4CAF50;
    
    --slider-BG-color:linear-gradient(
    to right,
    rgb(189, 252, 192) 0%,
    rgb(13, 234, 20) calc((var(--val) - var(--min)) / (var(--max) - var(--min)) * 100%),
        #777 calc((var(--val) - var(--min)) / (var(--max) - var(--min)) * 100%),
        #777 100%
    );

    --main-shadow-art: rgba(0, 0, 0, 0.25) 0px 54px 55px,
              rgba(0, 0, 0, 0.12) 0px -12px 30px,
              rgba(0, 0, 0, 0.12) 0px 4px 6px,
              rgba(0, 0, 0, 0.17) 0px 12px 13px,
              rgba(0, 0, 0, 0.09) 0px -3px 5px;


    --main-gradient-1:rgba(43, 135, 210, 0.65);
    --main-gradient-2:rgba(43, 135, 210, 0.65);
    --main-gradient-3:rgba(27, 197, 231, 0.65);
    --main-gradient-4:rgba(159, 11, 208, 0.6);
    --main-gradient-5:rgba(27, 211, 231, 0.65);
  }

  * {
    box-sizing: border-box;
  }

  html {
    overscroll-behavior: none;
  }


  #react-container {
    font-family: Arial, sans-serif;
    font-size: 1rem;
    overscroll-behavior: none;
    margin: 0;
    padding: 0;
    width:100%;
    height:100%;
    background: linear-gradient(135deg, #1a1a1a, #2c3e50);
    background-color: linear-gradient(135deg, #1a1a1a, #2c3e50);
    color:var(--main-text-color);
  }

  /* scrollbar */
  ::-webkit-scrollbar {
    width: 5px;
    height: 5px;
  }

  ::-webkit-scrollbar-track {
    box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
  }

  ::-webkit-scrollbar-thumb {
    background-color: darkgrey;
    width: 5px;
  }


`;

const GlobalUnicornStyle = createGlobalStyle`
  :host {
    /* Kräftige Pastellfarben, etwas verspielt/unicorn-mäßig */
    --primary-color:rgb(176, 187, 193);
    --secondary-color:rgb(245, 121, 63);
   
    --primary-accent: #ff9de2;
    --secondary-accent: #c4a2fc;

    --main-text-color: #ffffff;
    --second-text-color: #fce4ff;
    --error-text-color:rgba(225, 19, 19, 0.82); 
    
    --primary-button-color: #ff9de2;
    --secondary-button-color: #c4a2fc;

    --main-hover-color: rgba(255, 255, 255, 0.1);
    --secondary-hover-color: #ff9de2;
    --clear-hover-color: #fcaae8;

    --main-bg-color: #3c2a3b; 
    --second-bg-color: #f5d6ff;

    --main-unit-color: #ff9de2;
    --main-value-color: rgba(119, 165, 235, 0.9);
    --main-bg-nav-color: rgba(177, 157, 255, 0.9);
    --main-bg-card-color: rgba(196, 162, 252, 0.2);

    --main-arrow-up: #ff9de2;
    --main-arrow-down: #c4a2fc;
    --cannabis-active-color: #c9f7c7;
    --cannabis-inactive-color: #89c784;

    --main-shadow-art: rgba(0, 0, 0, 0.25) 0px 54px 55px,
      rgba(0, 0, 0, 0.12) 0px -12px 30px,
      rgba(0, 0, 0, 0.12) 0px 4px 6px,
      rgba(0, 0, 0, 0.17) 0px 12px 13px,
      rgba(0, 0, 0, 0.09) 0px -3px 5px;

    /* Sanfte Pastell-Gradients */
    --main-gradient-1: rgba(255, 157, 226, 0.65);
    --main-gradient-2: rgba(196, 162, 252, 0.65);
    --main-gradient-3: rgba(255, 214, 250, 0.65);
    --main-gradient-4: rgba(255, 157, 226, 0.6);
    --main-gradient-5: rgba(196, 162, 252, 0.65);
  }

  * {
    box-sizing: border-box;
  }

  html {
    overscroll-behavior: none;
  }

  #react-container {
    font-family: Arial, sans-serif;
    font-size: 1rem;
    overscroll-behavior: none;
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #1a1a1a, #2c3e50);
    color: var(--main-text-color);
  }

  /* scrollbar */
  ::-webkit-scrollbar {
    width: 5px;
    height: 5px;
  }
  ::-webkit-scrollbar-track {
    box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
  }
  ::-webkit-scrollbar-thumb {
    background-color: darkgrey;
    width: 5px;
  }
`;

const GlobalHackyStyle = createGlobalStyle`
  :host {
    /* Matrix-Style: Schwarzer Hintergrund, Neon-Grün, etc. */
    --primary-accent:rgba(68, 255, 0, 0.36);
    --secondary-accent: #0aff89;

    --main-text-color: #00ff00;
    --second-text-color: #0aff89;
    --error-text-color:rgba(225, 19, 19, 0.82);
    
    --primary-button-color: #0aff89;
    --secondary-button-color: #00ff00;

    --main-hover-color: rgba(255, 255, 255, 0.1);
    --secondary-hover-color: #0aff89;
    --clear-hover-color: rgba(10, 255, 137, 0.3);

    --main-bg-color: #0d0d0d;
    --second-bg-color: #1a1a1a;

    --main-unit-color: #00ff00;
    --main-value-color: rgba(219, 239, 226, 0.9);

    --main-bg-nav-color: rgba(13, 13, 13, 0.9);
    --main-bg-card-color: rgba(40, 40, 40, 0.5);

    --main-arrow-up: #00ff00;
    --main-arrow-down:rgb(255, 71, 10);
    --cannabis-active-color: #00ff00;
    --cannabis-inactive-color:rgb(255, 247, 10);

    --main-shadow-art: rgba(0, 255, 0, 0.25) 0px 54px 55px,
      rgba(0, 255, 0, 0.12) 0px -12px 30px,
      rgba(0, 255, 0, 0.12) 0px 4px 6px,
      rgba(0, 255, 0, 0.17) 0px 12px 13px,
      rgba(0, 255, 0, 0.09) 0px -3px 5px;

    /* Neon-Grün-Gradients */
    --main-gradient-1: rgba(0, 255, 0, 0.4);
    --main-gradient-2: rgba(10, 255, 137, 0.4);
    --main-gradient-3: rgba(0, 200, 0, 0.4);
    --main-gradient-4: rgba(0, 128, 64, 0.4);
    --main-gradient-5: rgba(0, 255, 64, 0.4);
  }

  * {
    box-sizing: border-box;
  }

  html {
    overscroll-behavior: none;
  }

  #react-container {
    font-family: 'Courier New', monospace;
    font-size: 1rem;
    overscroll-behavior: none;
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #0d0d0d, #2c3e50);
    color: var(--main-text-color);
  }

  /* scrollbar */
  ::-webkit-scrollbar {
    width: 5px;
    height: 5px;
  }
  ::-webkit-scrollbar-track {
    box-shadow: inset 0 0 6px rgba(0, 255, 0, 0.3);
  }
  ::-webkit-scrollbar-thumb {
    background-color: #00ff00;
    width: 5px;
  }
`;

const GlobalWhiteStyle = createGlobalStyle`
  :host {
    --primary-color: #222;
    --secondary-color: #444;

    --primary-accent: #007bff;
    --secondary-accent: #17a2b8;
    --error-text-color:rgba(225, 19, 19, 0.82);

    --main-text-color: #000;
    --second-text-color: #555;
    --error-text-color: #dc3545;

    --primary-button-color: #007bff;
    --secondary-button-color: #17a2b8;

    --main-hover-color: rgba(0, 123, 255, 0.1);
    --secondary-hover-color: rgba(23, 162, 184, 0.1);
    --third-hover-color: rgba(40, 167, 69, 0.1);

    --main-bg-color: #fff;
    --second-bg-color: #f8f9fa;

    --main-unit-color: #007bff;
    --second-unit-color: #17a2b8;
    
    --main-value-color: #28a745;
    
    --main-bg-nav-color: #f1f1f1;
    
    --main-bg-card-color: #ffffff;
    --main-bg-Innercard-color: #f8f9fa;

    --main-arrow-up: #28a745;
    --main-arrow-down: #dc3545;
    --cannabis-active-color: #28a745;
    --cannabis-inactive-color: #6c757d;
    
    --slider-BG-color: linear-gradient(
      to right,
      #007bff 0%,
      #17a2b8 calc((var(--val) - var(--min)) / (var(--max) - var(--min)) * 100%),
      #777 calc((var(--val) - var(--min)) / (var(--max) - var(--min)) * 100%),
      #777 100%
    );

    --main-shadow-art: rgba(0, 0, 0, 0.1) 0px 4px 6px,
                      rgba(0, 0, 0, 0.05) 0px 1px 3px;

    --main-gradient-1: #ffffff;
    --main-gradient-2: #f8f9fa;
    --main-gradient-3: #e9ecef;
    --main-gradient-4: #dee2e6;
    --main-gradient-5: #ced4da;
  }

  * {
    box-sizing: border-box;
  }

  html {
    overscroll-behavior: none;
  }

  #react-container {
    font-family: Arial, sans-serif;
    font-size: 1rem;
    overscroll-behavior: none;
    margin: 0;
    padding: 0;
    width:100%;
    height:100%;
    background: linear-gradient(135deg, #fff,rgb(242, 242, 242));
    color: var(--main-text-color);
  }

  /* scrollbar */
  ::-webkit-scrollbar {
    width: 5px;
    height: 5px;
  }

  ::-webkit-scrollbar-track {
    box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.1);
  }

  ::-webkit-scrollbar-thumb {
    background-color: #bbb;
    width: 5px;
  }
`;

const GlobalOceanStyle = createGlobalStyle`
  :host {
    --primary-accent: #0099cc;
    --secondary-accent: #33cccc;

    --main-text-color: #ffffff;
    --second-text-color: #b3e0ff;
    --error-text-color:rgba(225, 19, 19, 0.82);

    --primary-button-color: #0099cc;
    --secondary-button-color: #33cccc;

    --main-hover-color: rgba(0, 153, 204, 0.3);
    --secondary-hover-color: #33cccc;

    --main-bg-color: #00264d;
    --second-bg-color: #004080;

    --main-unit-color: #33cccc;
    --main-value-color: rgba(219, 239, 226, 0.9);

    --main-bg-nav-color: rgba(0, 38, 77, 0.9);
    --main-bg-card-color: rgba(0, 64, 128, 0.5);

    --main-arrow-up: #0099cc;
    --main-arrow-down: #33cccc;
    --cannabis-active-color: #66ccff;
    --cannabis-inactive-color: #33cccc;

    --main-shadow-art: rgba(0, 153, 204, 0.25) 0px 54px 55px,
      rgba(0, 153, 204, 0.12) 0px -12px 30px,
      rgba(0, 153, 204, 0.12) 0px 4px 6px,
      rgba(0, 153, 204, 0.17) 0px 12px 13px,
      rgba(0, 153, 204, 0.09) 0px -3px 5px;

    --main-gradient-1: rgba(0, 153, 204, 0.65);
    --main-gradient-2: rgba(51, 204, 204, 0.65);
    --main-gradient-3: rgba(0, 102, 204, 0.65);
    --main-gradient-4: rgba(0, 153, 204, 0.6);
    --main-gradient-5: rgba(51, 204, 255, 0.65);
  }
      * {
    box-sizing: border-box;
  }

  html {
    overscroll-behavior: none;
  }

  #react-container {
    font-family: Arial, sans-serif;
    font-size: 1rem;
    overscroll-behavior: none;
    margin: 0;
    padding: 0;
    width:100%;
    height:100%;
    background: linear-gradient(135deg, #fff,rgb(242, 242, 242));
    color: var(--main-text-color);
  }

  /* scrollbar */
  ::-webkit-scrollbar {
    width: 5px;
    height: 5px;
  }

  ::-webkit-scrollbar-track {
    box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.1);
  }

  ::-webkit-scrollbar-thumb {
    background-color: #bbb;
    width: 5px;
  }
`;

const GlobalCyberStyle = createGlobalStyle`
  :host {
    --primary-accent: #ff0090;
    --secondary-accent: #00eaff;

    --main-text-color: #00eaff;
    --second-text-color: #ff0090;
    --error-text-color:rgba(225, 19, 19, 0.82);

    --primary-button-color: #ff0090;
    --secondary-button-color: #00eaff;

    --main-hover-color: rgba(255, 0, 144, 0.3);
    --secondary-hover-color: #00eaff;

    --main-bg-color: #0d0027;
    --second-bg-color: #2a0034;

    --main-unit-color: #ff0090;
    --main-value-color: rgba(219, 239, 226, 0.9);

    --main-bg-nav-color: rgba(13, 0, 39, 0.9);
    --main-bg-card-color: rgba(42, 0, 52, 0.5);

    --main-arrow-up: #ff0090;
    --main-arrow-down: #00eaff;
    --cannabis-active-color: #00ffea;
    --cannabis-inactive-color: #0088ff;

    --main-shadow-art: rgba(255, 0, 144, 0.25) 0px 54px 55px,
      rgba(0, 234, 255, 0.12) 0px -12px 30px,
      rgba(255, 0, 144, 0.12) 0px 4px 6px,
      rgba(0, 234, 255, 0.17) 0px 12px 13px,
      rgba(255, 0, 144, 0.09) 0px -3px 5px;

    --main-gradient-1: rgba(255, 0, 144, 0.65);
    --main-gradient-2: rgba(0, 234, 255, 0.65);
    --main-gradient-3: rgba(255, 0, 90, 0.65);
    --main-gradient-4: rgba(0, 200, 255, 0.6);
    --main-gradient-5: rgba(255, 0, 180, 0.65);
  }
      * {
    box-sizing: border-box;
  }

  html {
    overscroll-behavior: none;
  }

  #react-container {
    font-family: Arial, sans-serif;
    font-size: 1rem;
    overscroll-behavior: none;
    margin: 0;
    padding: 0;
    width:100%;
    height:100%;
    background: linear-gradient(135deg, #fff,rgb(242, 242, 242));
    color: var(--main-text-color);
  }

  /* scrollbar */
  ::-webkit-scrollbar {
    width: 5px;
    height: 5px;
  }

  ::-webkit-scrollbar-track {
    box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.1);
  }

  ::-webkit-scrollbar-thumb {
    background-color: #bbb;
    width: 5px;
  }
`;

const GlobalDarkModeStyle = createGlobalStyle`
  :host {
    --primary-accent: #1db954;
    --secondary-accent: #535353;

    --main-text-color: #ffffff;
    --second-text-color: #b3b3b3;
    --error-text-color:rgba(225, 19, 19, 0.82);

    --primary-button-color: #1db954;
    --secondary-button-color: #535353;

    --main-hover-color: rgba(255, 255, 255, 0.1);
    --secondary-hover-color: #1db954;

    --main-bg-color: #121212;
    --second-bg-color: #181818;

    --main-unit-color: #1db954;
    --main-value-color: rgba(219, 239, 226, 0.9);


    --main-bg-nav-color: rgba(18, 18, 18, 0.9);
    --main-bg-card-color: rgba(24, 24, 24, 0.5);

    --main-arrow-up: #1db954;
    --main-arrow-down:rgb(213, 26, 26);
    --cannabis-active-color: #1db954;
    --cannabis-inactive-color: #535353;

    --main-shadow-art: rgba(0, 0, 0, 0.5) 0px 54px 55px,
      rgba(0, 0, 0, 0.3) 0px -12px 30px,
      rgba(0, 0, 0, 0.3) 0px 4px 6px,
      rgba(0, 0, 0, 0.4) 0px 12px 13px,
      rgba(0, 0, 0, 0.2) 0px -3px 5px;

    --main-gradient-1: rgba(67, 80, 71, 0.65);
    --main-gradient-2: rgba(32, 28, 48, 0.65);
    --main-gradient-3: rgba(18, 18, 18, 0.65);
    --main-gradient-4: rgba(24, 24, 24, 0.6);
    --main-gradient-5: rgba(83, 83, 83, 0.65);
  }
      * {
    box-sizing: border-box;
  }

  html {
    overscroll-behavior: none;
  }

  #react-container {
    font-family: Arial, sans-serif;
    font-size: 1rem;
    overscroll-behavior: none;
    margin: 0;
    padding: 0;
    width:100%;
    height:100%;
    background: linear-gradient(135deg, rgb(1, 55, 19),rgb(38, 30, 69));
    color: var(--main-text-color);
  }

  /* scrollbar */
  ::-webkit-scrollbar {
    width: 5px;
    height: 5px;
  }

  ::-webkit-scrollbar-track {
    box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.1);
  }

  ::-webkit-scrollbar-thumb {
    background-color: #bbb;
    width: 5px;
  }
`;