'use client';
import { useId } from 'react';
import styles from './TouchOutput.module.css'; 
import { Stat, TouchOutputProps } from '../touch.interface';

const TouchOutput: React.FC<TouchOutputProps> = ({data}) => {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        Touch Output {data.at(-1)?.word} {data.at(-1)?.speed} {data.at(-1)?.errnum} {data.at(-1)?.length}
      </div>
    </div>
)}

export default TouchOutput;

