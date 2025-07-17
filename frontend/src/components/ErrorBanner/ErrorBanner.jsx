import { useState, useEffect } from 'react';
import styles from './ErrorBanner.module.css';

const ErrorBanner = ({ message = '', onClose, duration = 3500 }) => {
  const [key, setKey] = useState(0);

  useEffect(() => {
    setKey(prev => prev + 1);
    const timer = setTimeout(() => {
      onClose?.();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  return (
    <div className={styles.ErrorContainer}>
      <div className={styles.ErrorLabel}>ⓧ</div>
      <div className={styles.ErrorTextContainer}>
        <span className={styles.ErrorText}>Error:</span>
        <span className={styles.ErrorTextContent}>{message}</span>
      </div>
      <div key={key}
        className={styles.ErrorProgressBar}
        style={{ animationDuration: `${duration + 500}ms` }}
      />
    </div>
  );
};

export default ErrorBanner;
