'use strict';
import React from 'react';
import { useState } from "react";
import './tabber.scss';

const Tabber = (props) => {
  const [content, setContent] = useState(props.extend ? [...(props.content), { tab: '+', outlet: (props.extend)() }] : props.content);
  const initial = props.initial;
  const [active, setActive] = useState({ curr: `${initial}`, prev: '' });
  const fnExtend = props.extend;
  const template = props.template;

  function nextNumber() {
    let tabNumber = content
      .map(e => e.tab)                                    // make array of tab titles
      .filter(e => e.split(' ').length > 1)               // filter out all tabs with space separated title
      .map(e => e.split(' ').slice(-1))                   // take last part of the title  
      .map(e => parseInt(e))                              // convert string into number
      .reduce((acc, curr) => curr > acc ? curr : acc, 0); // find max array item
    tabNumber += 1;                                       // increment that number
    return tabNumber;
  }

  return (
    <div className='tabwrap'>
      <div className='tabgroup'>
        {content.map((e, i) => (
          <button
            key={e.tab}
            id={e.tab.toLowerCase()}
            onClick={() => setActive(v => {
              // return { ...v, curr: e.tab, prev: active.curr }; 
              const prev = active.curr;
              if (e.tab === '+') {
                let tabNumber = nextNumber();
                const groupName = `${template} ${tabNumber}`;
                setTimeout(() => {
                  setContent(c => {                                      // insert new group before '+' tab
                    return [...(c.slice(0, -1)), 
                      { tab: groupName, outlet: fnExtend(tabNumber) }, 
                      ...(c.slice(-1))
                    ];
                  });
                  setActive(v => {return { ...v, curr: groupName, prev: '' };});
                  console.log({ content });
                }, 0);
              }
              return { ...v, curr: e.tab, prev: prev };
            })}
            className={'tabbtn'
              + (e.tab == active.curr ? ' tabactive' : '')
              + (i == 0 ? ' tableft' : '')
            }
          >
            {e.tab}
          </button>))}
      </div>
      <div className='tabber-outlet'>
        {content.find(e => e.tab == active.curr).outlet}
      </div>
    </div>
  )
};
export default Tabber;
