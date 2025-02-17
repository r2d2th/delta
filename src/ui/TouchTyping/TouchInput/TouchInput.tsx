'use client';
import styles from './TouchInput.module.css';
import { useRef, useEffect, useState, useCallback } from 'react';
import begin  from './eng_begin';
import { TouchMark, TouchResult, TouchInputProps } from '../touch.interface';
import clsx from 'clsx';

const inputMaxLen: number = 90;

export default function TouchInput({word, action}: TouchInputProps) {
  const [para, setPara] = useState<string>('');
  const [sample, setSample] = useState<string>(getSampleText(word, inputMaxLen));
  const [mark, setMark] = useState<TouchMark>({err: false, num: 0});
  const [error, setError] = useState<boolean>(false);
  const [errnum, setErrnum] = useState<number>(0);
  const result = useRef<TouchResult[]>([]);
  const time_start = useRef<number>(0);
  const time_end = useRef<number>(0);
  // const count = useRef<number>(0);  

  function getSampleText(word_curr: string, len: number): string {
    const word_len = word_curr.length + 1;
    const sample_word_number = (len - (len % word_len)) / word_len;
    const sample_text = new Array(sample_word_number).fill(word_curr).join(' ');
    return sample_text; 
  }

  function endTyping() {
    const sec_span: number = Math.floor((Date.now() - time_start.current) / 1000);
    const time_span: number = sec_span / 60;
    const speed: number = Math.floor(sample.length / time_span);
    // action({word, speed, errnum, length: sample.length});
    action({word, speed, errnum: mark.num, length: sample.length});
    setMark(m => ({...m, err: false, num: 0}));
    setErrnum(0);
    setError(false);
    setPara('');
    time_start.current = 0;
  }

  const handleOnChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setPara(event.target.value);
    const len = event.target.value.length;
    const bError = sample.slice(0, len) === event.target.value ? false : true;
    setMark(m => {
      let {err, num} = m;
      if(bError != err) {
        err = bError;
        if(bError)
          num = num + 1;
      }
      return {...m, err, num}
    });
    setError(err => bError != err ? bError : err);
    if(bError != error) {
      // setError(bError);
      if(bError)
        setErrnum(errnum => errnum + 1);
    }
  }, [sample, error]); 
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPara(t => e.target.value);
    console.log('handleChange', para.length, sample.length);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLElement>) {
    if(!time_start.current)
      time_start.current = Date.now();
    if(e.key == "Enter") {
      if(para.length == sample.length) {
        endTyping();
      }
      else {
        setPara(para => para + '\u{00b6}');
      }
    }
    if(e.key == "CapsLock") {
      setPara(para => para + '\u{21ea}');
    }
    if(e.key == " ") {
      if(para.length == sample.length) {
        e.preventDefault();
        e.stopPropagation();
        // rewindTouchTyping();
        endTyping();
      }
    }
    time_end.current = Date.now();
  }

  useEffect(() => {
    setSample(getSampleText(word, inputMaxLen));
  }, [word]);

  // className={clsx(
  //   styles['toucher-input'], 
  //   error && styles['toucher-input-error']
  // )}

  // console.log("r", count.current++);
  return (
    <div className={styles['toucherWrapper']}>
      <input 
        className={clsx({
          [styles['toucher-input']]: true, 
          [styles['toucher-input-error']]: mark.err
        })}
        style={{outline: "none"}} 
        type="text" 
        value={para} 
        onChange={handleOnChange} 
        onKeyDown={handleKeyDown} 
        autoFocus 
      />
      <div id="sample" className={clsx(styles['toucher-sample'])}>{sample}</div>
    </div>
)}

