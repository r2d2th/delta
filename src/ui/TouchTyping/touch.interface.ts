export interface Stat {
  word: string;
  speed: number;
  errnum: number;  // number of errors
  length: number;  // length of sample
}

export interface TouchInputProps {
  word: string;
  action: (arg0: Stat) => void;
}

export interface TouchOutputProps {
  data: Stat[];
}

export interface TouchResult {
  letter: string;
  interval: number;
}

export interface TouchMark {
  err: boolean;
  num: number;
}
