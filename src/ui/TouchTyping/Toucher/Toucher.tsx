'use client';
import { useState } from 'react';
import TouchInput from  '../TouchInput';
import TouchOutput from '../TouchOutput';
import begin  from './eng_begin';
import styles from './Toucher.module.css';
import { Stat } from '../touch.interface';

export default function Toucher() {
  const [stat, setStat] = useState<Stat[]>([]);
  const [word, setWord] = useState<string>(getWord());

  function getWord() : string {
    const word_arr = begin.split(' ');
    const i = Math.floor(Math.random() * word_arr.length);
    return word_arr[i];
    // const word_curr = word_array[index_curr];
    // return word_curr;
  }

  function handleAction(stat: Stat): void {
    setStat(s => ([...s, stat]));
    setWord(getWord());
  }

  return (
    <div>
      <TouchOutput data={stat} />
      <TouchInput word={word} action={handleAction} />
    </div>
)};
