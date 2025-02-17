'use client'

import { useId, useRef, useState, useEffect } from 'react';
import styles from './ThemeSwitcher.module.css'; 
import clsx from 'clsx';

  // function defaultState() {
  //   // let body  = document.querySelector("body");
  //   let body3 = document.querySelector("body");
  //   console.log("defaultState", body3.getAttribute('datatheme'));
  //   return body3.getAttribute("datatheme") === 'dark' ? true : false;
  // }
          // className={clsx(`${styles.slider} ${styles.round}`} data-toggle-theme=""></span>


export default function ThemeSwitcher() {
  const switcherId = useId();
  const [check, setCheck] = useState(false);
  const [initial, setInitial] = useState(true);
  // const [initial, setInitial] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [styleObj, setStyleObj] = useState<{}>({'--theme-switch-transable': '0'});
  // styleObj['--theme-switch-transable'] = '4s';
  // const [check, setCheck] = useState(() => {
  //   const html = document.querySelector("html");
  //   console.log("defaultState", html.getAttribute('datatheme'));
  //   return html.getAttribute("datatheme") == 'dark' ? true : false;
  // });
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    let html: HTMLElement | null = document.querySelector("html");
    const theme = e.target.checked ? 'dark' : 'light';
    if(!html)
      return;
    html.setAttribute('data-theme', theme);
    window.localStorage.setItem('color-mode', theme);
  }
  useEffect(() => {
    const html: HTMLElement | null = document.querySelector("html");
    // console.log("defaultState", html.getAttribute('data-theme'));
    const b = html?.getAttribute("data-theme") == 'dark' ? true : false;
    // console.log("defaultState2", b);
    setCheck(b);
    if(inputRef.current)
      inputRef.current.checked = b;
    setTimeout(() => {
      setStyleObj(s => ({...s, ['--theme-switch-transable']: '.4s'}));
      setInitial(false);
    }, 10); 
  }, []);
  return (
    <div className={styles.container} style={{visibility: initial ? 'hidden' : 'visible'}}>
      <label className={styles['theme-switch']} htmlFor={switcherId}>
        <input ref={inputRef} type="checkbox" id={switcherId} defaultChecked={check} onChange={handleChange} />
        <span className={clsx(styles.slider, styles.round)} style={styleObj} data-toggle-theme=""></span>
      </label>
    </div>
)}

