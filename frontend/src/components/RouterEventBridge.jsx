import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Permet à du code "hors React" (ex: axios interceptors) de déclencher une navigation SPA
 * sans recharger la page.
 */
const RouterEventBridge = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (event) => {
      const to = event?.detail?.to;
      if (typeof to === 'string' && to.length > 0) {
        navigate(to, { replace: true });
      }
    };

    window.addEventListener('app:navigate', handler);
    return () => window.removeEventListener('app:navigate', handler);
  }, [navigate]);

  return null;
};

export default RouterEventBridge;


