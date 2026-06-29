import { useEffect, useMemo, useState } from 'react';

export const debounce = (fn, delay = 300) => {
    let timer;
    return (...args) => {
        window.clearTimeout(timer);
        timer = window.setTimeout(() => fn(...args), delay);
    };
};

export const throttle = (fn, delay = 100) => {
    let lastRun = 0;
    let timer;
    return (...args) => {
        const now = Date.now();
        const remaining = delay - (now - lastRun);
        window.clearTimeout(timer);
        if (remaining <= 0) {
            lastRun = now;
            fn(...args);
            return;
        }
        timer = window.setTimeout(() => {
            lastRun = Date.now();
            fn(...args);
        }, remaining);
    };
};

export const useDebouncedValue = (value, delay = 300) => {
    const [debounced, setDebounced] = useState(value);

    useEffect(() => {
        const timer = window.setTimeout(() => setDebounced(value), delay);
        return () => window.clearTimeout(timer);
    }, [value, delay]);

    return debounced;
};

export const useDebouncedCallback = (callback, delay = 300, deps = []) => (
    useMemo(() => debounce(callback, delay), deps)
);
