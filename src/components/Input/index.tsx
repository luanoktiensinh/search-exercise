import React, { useState, useEffect, useCallback, useRef } from "react";
import "./input.scss";
import { fetchData } from "../../utils/fetch-data";
import { debounce } from "../../utils/deboucne";
import Loader from "../Loader";

export interface InputProps {
  /** Placeholder of the input */
  placeholder?: string;
  /** On click item handler */
  onSelectItem: (item: string) => void;
}

const Input = ({ placeholder, onSelectItem }: InputProps) => {
  const [query, setQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<string[]>([]);
  
  const latestQueryRef = useRef<string>("");

  const debouncedFetchData = useCallback(
    debounce(async (searchTerm: string) => {
      latestQueryRef.current = searchTerm;

      if (searchTerm.trim() !== "") {
        try {
          setLoading(true);
          setError(null);

          const data = await fetchData(searchTerm);

          if (latestQueryRef.current === searchTerm) {
            setResults(data);
          }
        } catch (err) {
          if (latestQueryRef.current === searchTerm) {
            setError(err as string);
            setResults([]);
          }
        } finally {
          setLoading(false);
        }
      }
    }, 1000),
    []
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    if (value.trim() === "") {
      setResults([]);
      setError(null);
      setLoading(false);
    }
    
    debouncedFetchData(value);
  };

  return (
    <div className="input-container">
      <input
        className="search-input"
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={handleInputChange}
      />

      {loading && <Loader />}

      {!loading && (
        <div className="results-container">
          {error ? (
            <div className="error-message">{error}</div>
          ) : results.length > 0 ? (
            <ul className="search-result">
              {results.map((item, index) => (
                <li
                  className="search-result__item"
                  key={index}
                  onClick={() => onSelectItem(item)}
                >
                  {item}
                </li>
              ))}
            </ul>
          ) : query && results.length === 0 ? (
            <div>No results</div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default Input;