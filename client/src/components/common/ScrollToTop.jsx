import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const ScrollToTop = () => {
  const { pathname, search } = useLocation();

  useEffect(() => {
    if (typeof globalThis.scrollTo === 'function') {
      globalThis.scrollTo(0, 0);
    }
  }, [pathname, search]);

  return null;
};

export default ScrollToTop;
