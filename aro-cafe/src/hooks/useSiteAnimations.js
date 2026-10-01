import { useLayoutEffect } from 'react';
import { initSite } from '../animation/site.js';

// Starts the animation engine once, as soon as the markup is in the page and before the first paint.
export function useSiteAnimations(){
  useLayoutEffect(() => { initSite(); }, []);
}
