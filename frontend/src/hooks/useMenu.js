
import { useState, useEffect } from 'react';
import { getMenu } from '../services/menu';

export const useMenu = () => {
  const [menu, setMenu] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const data = await getMenu();
        setMenu(data);
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenu();
  }, []);

  return { menu, isLoading, error };
};
