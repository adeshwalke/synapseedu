import { useState, useEffect } from 'react';

export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (e) {
      console.warn(`localStorage write failed for key "${key}":`, e);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}

export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}
