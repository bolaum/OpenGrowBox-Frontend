// context/SliderContext.js
import { createContext, useContext } from 'react';

export const SliderContext = createContext({
  pause: () => {},
  resume: () => {},
  isPlaying: true,
});

export const useSlider = () => useContext(SliderContext);
