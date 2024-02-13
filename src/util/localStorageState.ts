import { useEffect, useState } from "react";

/**
 * Allows react states to be saved in local storage, useful for persisting state between page reloads
 * 
 * @param defaultValue - The default value to use if the key is not in local storage
 * @param key - The key to use in local storage, should be unique among all keys
 * 
 * @returns - A pair containing the value and a function to set the value (just like useState)
 */
export default function useLocalStorageState<T>(defaultValue: T, key: string): [T, React.Dispatch<React.SetStateAction<T>>] {
    
    const [value, setValue] = useState<T>(() => {
        const storageValue = window.localStorage.getItem(key);
        return storageValue !== null ? JSON.parse(storageValue) : defaultValue;
    });

    useEffect(() => {
        window.localStorage.setItem(key, JSON.stringify(value));
    }, [key, value]);

    return [value, setValue];
}