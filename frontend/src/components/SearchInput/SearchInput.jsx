import { useState } from 'react';
import styles from './SearchInput.module.css';

const SearchInput = ({ onSearchSubmit }) => {
  const [input, setInput] = useState('');

  const handleSubmit = () => {
    onSearchSubmit(input);
  }

  const handleChange = (e) => {
    setInput(e.target.value);
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
      e.target.blur();
    }
  }

  return (
    <div className={styles.searchDiv}>
      <input
        type='text'
        className={styles.searchInput}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder='Search for Artifacts...'
      />
      <button onClick={handleSubmit} className={styles.searchButton}>
        Search
      </button>
    </div>

  )

}

export default SearchInput;
