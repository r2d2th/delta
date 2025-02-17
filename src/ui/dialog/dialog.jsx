"use strict";
import React, {useState, useEffect, useRef, useContext} from "react";
import ContextUnit from '../ContextUnit';
import AuthContext from '../AuthContext';
import auth from "../auth";
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import "./dialog.scss";
import Icons from './dialog.svg';


function Phrase({data, action}) {
  function handleChange(e) {
    action(a => {
      a.find(el => el.key === data.key).answer = e.target.value;
      return [...a];
    });
  }

  return (
    <>
      <div className="phrase-left">{data.rus}</div>
      <div className="phrase-middle">
        {data.grade
          ? <svg className='dialog-symbolist dialog-icon'><use xlinkHref={`${Icons}#icon-${data.icon}`} /></svg>
          : <></>
        }
      </div>
      <div className={"phrase-right" + (data.grade ? "" : " phrase-borderless")}>
        {data.grade 
          ? <>
              <span className="phrase-correct">{data.eng}</span>
              <br />
              {data.spanList.map((e, i) => 
                <span key={"k" + i.toString()} className={e.changed ? "phrase-incorrect" : ""}>
                  {e.text}&nbsp;
                </span>
              )}
            </> 
          : <input className="phrase-input" type="text" onChange={handleChange} />
        }
      </div>
    </>
  );
}


function Dialog({data}) {
  const uuid = useRef(uuidv4());
  const [items, setItems] = useState([]);
  const [disableCheck, setDisableCheck] = useState(true);
  const {unit} = useContext(ContextUnit);
  const {map, uid, postResult} = useContext(AuthContext);

  // p means phrase
  function getSpanList(p) {
    const output = p.answer.split(' ');
    return output.map(e => {
      const found = p.words.find(w => w.wrong === e);
      return found ? {text: found.wrong, right: found.right, changed: true} : {text: e, right: e, changed: false}
    });
  }

  function resetData() {
    setItems(content => {
      return [...(
        data.phrases.map(e => {
          return {...e, grade: 0, answer: "", spanList: []}
        })
      )];
    });
  }

  function gradePhrase(p) {
    const spanList = getSpanList(p);
    const realAnswer      = spanList.map(e => e.text).join(' ');
    const distilledAnswer = spanList.map(e => e.right).join(' ');
    let grade = 10;
    let icon = "bad";
    if(distilledAnswer === p.eng && realAnswer != p.eng) {
      icon = "good";
      grade = 50;
    }
    if(distilledAnswer === p.eng && realAnswer === p.eng) {
      icon = "ok";
      grade = 100;
    }
    return {icon, grade, spanList};
  }

  function handleCheck() {
    const resultItems = items.map(e => {
      const grader = gradePhrase(e);
      return {...e, icon: grader.icon, grade: grader.grade, spanList: [...grader.spanList]}
    });
    // console.log("===resultItems===", resultItems);
    const grade = resultItems.reduce((acc, e) => acc + e.grade, 0) / resultItems.length;
    // console.log("===grade===", grade);
    postResult(map, uid, unit.name, uuid.current, 'dialog', resultItems, grade);
    setDisableCheck(true);
    setItems(_ => ([...resultItems]));
  };

  function handleReset() {
    // console.log("===unit===", unit);
    resetData();
  }

  useEffect(() => {
    if(data.phrases) {
      resetData();
    }
  }, [data.phrases.length]);

  useEffect(() => {
    if(items.length) {
      const ready = items
        .map(e => e.answer.length > e.eng.length/2 ? true : false)
        .every(e => e);
      setDisableCheck(!ready);
    }
  }, [items]);

  return (
    <div className="dialog-wrapper">
      <div className="dialog">
        { items.length && items.map(e => <Phrase key={e.key} data={e} action={setItems} />) }
      </div>
      <button className="dialog-button" type="button" onClick={handleCheck} disabled={disableCheck}>Check</button>
      <button className="dialog-button" type="button" onClick={handleReset}>Reset</button>
    </div>
  );
}

export default Dialog;
