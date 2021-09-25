"use strict";
import React, { useState, useEffect, useCallback } from "react";

function randInt(min, max) {
  return min + Math.round(Math.random() * max);
}

const initialGame = {
  drag: -1,
  dragX: 0,
  dragY: 0,
  animated: -1,
  targetX: 0,
  targetY: 0,
  width: 0,
  height: 0,
  unit: 42,
  count: 0,
  win: false,
  fontSize: 16,
  fontFamily: "Arial",
  answer: [],
  variant: ["b-c-dog-", "c-dog-e-", "e-f-g-", "apple-dog-g-"],
  words: [
    { text: "apple" },
    { text: "b" },
    { text: "c" },
    { text: "dog" },
    { text: "e" },
    { text: "f" },
    { text: "g" },
  ],
};

const useGame = (initial = initialGame) => {
  const randomize = (data) => {
    const x0 = data.unit / 2;
    const max_x = data.width - 2 * data.unit;
    const max_y = data.height > 7*data.unit ? data.height/2 - 3*data.unit : 1;

    for (let i = 0; i < data.words.length; i++) {
      const y0 = i % 2 ? data.unit / 2 : data.height / 2 + 1.5 * data.unit;
      data.words[i].x = randInt(x0, max_x);
      data.words[i].y = randInt(y0, max_y);
      data.words[i].a = ((data.words[i].text.length + 4) * data.fontSize) / 2;
    }
    data.answer = [];
    data.win = false;
    return data;
  };

  useEffect(() => {
    initial = randomize(initial);
  }, [initial]);

  const [value, setValue] = useState(initial);

  const getMediana = () => value.height / 2 - value.unit / 2;
  const getMargin = () => (4 * value.unit) / 3;

  const refresh = () => {
    const event = new Event("draw");
    const cnv = document.getElementById("cnv-do");
    cnv.dispatchEvent(event);
  };

  const moveTo = (x, y, i) => setValue((v) => {
            v.words[i] = { ...v.words[i], x, y };
            return v;
  });

  const mouseUp = () => setValue((v) => {
    v.drag = -1;
    return v;
  });

  const mouseMove = (x, y) =>
    setValue((v) => {
      const i = v.drag;
      v.words[i] = { ...v.words[i], x: x - v.dragX, y: y - v.dragY };
      return v;
  });

  const readyAnimate = () => {
    if (value.drag < 0) 
      return false;
    return !readyArrange();
  };

  const readyArrange = () => {
    const { y } = value.words[value.drag];
    const mediana = getMediana();
    const margin = getMargin();
    return y > mediana - margin && y < mediana + margin ? false : true;
  };

  const populateAnswer = () =>
      setValue((v) => {
          let ans = [];
          const mediana = getMediana();
          for (let i = 0; i < v.words.length; i++) {
              const { x, y } = v.words[i];
              if (y == mediana) {
                  ans = [...ans, { x, i }];
              }
          }
          v.answer = [...ans].sort((a, b) => a.x - b.x).map((item) => item.i);
          return v;
      });

  const arrangeAnswer = () =>
      setValue((v) => {
          let width = 0; // = v.unit;
          for (let j = 0; j < v.answer.length; j++) {
              const i = v.answer[j];
              v.words[i] = { ...v.words[i], x: width };
              width += v.words[i].a;
          }
          return v;
      });

    const getTarget = () => {
        const y = getMediana();
        const answerLength = value.words
            .filter((el, i) => value.answer.includes(i))
            .reduce((acc, el) => acc + el.a, 0);

        const x = answerLength ? value.words[value.drag].x : 1;

        if (x > answerLength) {
            setValue((v) => {
                v.answer = [...v.answer, v.drag];
                return v;
            });
            return { x: answerLength, y };
        } else {
            const map1 = value.answer.map((e) => {
                return { x: value.words[e].x, i: e };
            });
            const map2 = map1.map((e) =>
                e.x < x ? { ...e, f: 0 } : { ...e, f: 1 }
            );
            const filter1 = map2.filter((e) => e.f);

            let slice1;
            let curr;
            if (filter1.length) {
                slice1 = filter1[0].i;
                curr = value.words[slice1].x;
            } else {
                slice1 = value.answer.slice(-1);
                curr = value.words[slice1].x + value.words[slice1].a;
            }

            setValue((v) => {
                v.answer = [
                    ...v.answer.slice(0, curr),
                    v.drag,
                    ...v.answer.slice(curr),
                ];
                if (filter1.length) {
                    const shift = v.words[v.drag].a;
                    filter1.forEach((e) => {
                        v.words[e.i].x += shift;
                    });
                }
                return v;
            });

            return { x: curr, y };
        }
    };

    const setAnimated = (x, y) =>
        setValue((v) => {
            if (v.drag >= 0) {
                v.animated = v.drag;
                v.targetX = x;
                v.targetY = y;
            }
            return v;
        });

    const isWin = () => {
      let curr = value.answer.map((e) => value.words[e].text + "-").join("");
      return value.variant.indexOf(curr) != -1 ? true : false;
    };

    const phaseGenerator = function* () {
        const tx = value.targetX;
        const ty = value.targetY;
        const arr = value.words;
        const index = value.animated;

        const dl = 24;
        let N = 0;
        let { x, y } = index < 0 ? {} : arr[index];
        // if index<0 both x and y would be undefined 'cos of {} on prev line
        // index<0 means animated<0 => no animation => N keeps its initial =0
        // => for cycle would produce no yield
        // => [...phaser(....)] will return empty array []
        if (x && y)
            N =
                1 +
                Math.floor(Math.hypot(Math.abs(x - tx), Math.abs(y - ty)) / dl);
        for (let i = 0; i < N; i++) {
            let length = Math.hypot(Math.abs(x - tx), Math.abs(y - ty));
            if (length < dl) {
                yield [{ x: tx, y: ty, i: index }];
                break;
            }
            x = Math.round(x + (dl * (tx - x)) / length);
            y = Math.round(y + (dl * (ty - y)) / length);
            yield [{ x, y, i: index }];
        }
    };

    const winGenerator = function* () {
        const dl = 24;
        while (
            value.answer.length &&
            value.words[value.answer[0]].x < value.width + dl
        ) {
            let result = [];
            for (let i = 0; i < value.answer.length; i++) {
                let j = value.answer[i];
                setValue((v) => {
                    v.words[j].x += dl;
                    return v;
                });
                result.push({ x: value.words[j].x, y: value.words[j].y, i: j });
            }
            yield result;
        }
        setValue(randomize(value));
        refresh();
    };

  return {
    value,
    setValue,
    handleMouseDown: (hx, hy) => {
      if (value.win) 
        return true;
      setValue((v) => {
        for (let i = 0; i < v.words.length; i++) {
          const { x, y, a } = v.words[i];
          if (hx > x && hx < x + a && hy > y && hy < y + v.unit) {
            v.drag = 0;
            v.dragX = hx - x;
            v.dragY = hy - y;
            v.words = [v.words[i], 
                       ...v.words.slice(0, i), 
                       ...v.words.slice(i + 1)];
            break;
          }
        }
        return v;
      });
      return false;
    },

    handleMouseUp: () => {
      if (value.win) 
        return true;

      populateAnswer();
      arrangeAnswer();

      if (readyAnimate()) {
        const { x, y } = getTarget();
        setAnimated(x, y);
      } else {
        value.win = isWin();
      }
      mouseUp();
      return true;
    },

    handleMouseMove: (x, y) => {
      if (value.drag < 0) return false;
      if (value.animated >= 0) return false;
      if (readyArrange()) {
          populateAnswer();
          arrangeAnswer();
      }
      mouseMove(x, y);
      return true;
    },

    forEach: (fn) => {
      for (let i = value.words.length - 1; i >= 0; i--) {
        const { x, y, a, text } = value.words[i];
        fn(x, y, a, value.unit, text);
      }
    },

    getFont: useCallback(() => {
      return value.fontSize.toString() + "px " + value.fontFamily;
    }, []),

    getTextOffset: useCallback(() => {
      return { dx: value.fontSize, 
               dy: value.unit / 2 + value.fontSize / 4 
      };
    }, []),

    getAnswerRect: () => {
      return {
        x: 0,
        y: value.height / 2 - (5 * value.unit) / 6,
        width: value.width,
        height: (5 * value.unit) / 3,
        unit: value.unit,
      };
    },

    getGenerator: () => (value.win ? winGenerator : phaseGenerator),

    stepAnimated: (step) => {
      step.value.forEach((e) => moveTo(e.x, e.y, e.i));
    },

    stopAnimated: () =>
      setValue((v) => {
        v.targetX = 0;
        v.targetY = 0;
        if (v.animated > -1) {
          v.animated = -1;
          populateAnswer();
          arrangeAnswer();
          v.win = isWin();
          if (v.win) refresh();
        }
        return v;
      }),

    setSize: (width, height) =>
      setValue((v) => {
        let isInit = false;
        if (!v.width && !v.height) isInit = true;

        v.width = width;
        v.height = height;

        if (isInit) 
          v = randomize(v);
        return v;
    }),

    consoleLog: (label) => {
      const obj = { ...value };
      obj.words = [...value.words];
      obj.answer = [...value.answer];
      console.log(label, { obj });
    },
  };
};

export default useGame;
