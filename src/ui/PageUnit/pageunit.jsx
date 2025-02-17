'use strict';
import React from 'react';
import { Suspense, useState, useEffect, useRef, useContext} from 'react';
import Content from '../content';
import United from '../united';
import Puzzle from '../puzzle';
import Dummy from '../dummy';
import AuthContext from '../AuthContext';
import ContextUnit from '../ContextUnit';
import axios from 'axios';
import store from '../store';
import './pageunit.scss';
// import Icons from './pageunit.svg';
import Icon from '../icon';

// const Simulator = React.lazy(() =>
//   new Promise((resolve, reject) =>
//     setTimeout(() => resolve(import("../Simulator")), 0)
//   )
// );

const Sim = function(props) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="sim-container">
        <Puzzle />
      </div>
    </Suspense>
  );
}

const dict = [
  {tab: "content",  component: Content},
  {tab: "phrases",  component: Content},
  {tab: "spelling", component: Content},
  {tab: "dialogs",  component: Content},
  {tab: "sim",      component: Sim},
  {tab: "training", component: Content},
  {tab: "audio",    component: Content},
  {tab: "practice", component: Dummy},
];

const PageUnit = function(props) {
  const [active, setActive] = useState('Content');
  const [unit, setUnit] = useState({data: []});
  const [content, setContent] = useState([]);
  const {uid, setUid} = useContext(AuthContext);
  const [start, setStart] = useState(Date.now());

  // change first letter to upper case
  function toTitle(s) {
    return s.slice(0,1).toUpperCase() + s.slice(1);
  };

  useEffect(() => {
    store.setStore(v => {
      v.page = 'unit';
      v.unit = uid;
      console.log("===useEffect in PageUnit", v);
      return v; 
    });
    // console.log("uid from AuthContext", uid, Date.now() - start);

    const getUnit = async (id) => {
      const result = await axios.get(`/api/unit/${id}`);
      console.log("===PageUnit===", id, result);
      const initial = toTitle(result.data.initial);
      if(initial && initial != active)
        setActive(initial);
      if(!result.data.data.length)
        setActive('Unit');
      let localUnit;
      setUnit(u => {
        const res = JSON.parse(JSON.stringify(result.data)); 
        const modified = {
          ...res, 
          edited: false, 
          data: [...(res.data.map(e => {
            const tab = res.tab.includes(e.target);
            const initial = (res.initial == e.target);
            return {...e, edited: false, deleted: false, created: false, tab, initial}
          }))]
        };
        localUnit = {...u, ...modified};
        return {...u, ...modified}; 
      });

      setContent(c => {
        c = [];
        // if(localUnit.data.length) {
        //   localUnit.tab.forEach(t => {
        //     const found = dict.find(e => e.tab === t);
        //     const tab = toTitle(found ? found.tab : t); 
        //     const icon = found ? `icon${t}` : 'iconaudio';
        //     const Component = found ? found.component : Content;
        //     return c.push({tab, icon, outlet: <Component target={t} />}); 
        //   });
        // } 
        c = localUnit.tab.map(t => {
          const found = dict.find(e => e.tab === t);
          const tab = toTitle(found ? found.tab : t); 
          const icon = found ? `icon${t}` : 'iconaudio';
          const Component = found ? found.component : Content;
          return {tab, icon, outlet: <Component target={t} />}; 
        });
        c.push({ tab: 'Unit', icon: 'iconedit', outlet: <United /> });
        return [...c];
      });
    };
    getUnit(uid);
  }, [uid]);

              // <svg className='unit-pg-symbolist unit-pg-symbolist__icon-style'>
              //   <use xlinkHref={`${Icons}#${e.icon}`} className='unit-pg-symbolist unit-pg-symbolist__icon-style' />
              // </svg>


  return (
    <ContextUnit.Provider value={{unit, setUnit, setContent}}>
      <div className='unit-pg'>
        <div className='unit-pg__menu-left'>
          {content.map(e => (
            <div key={e.tab} className='unit-pg__menu-left__item' onClick={() => setActive(e.tab)}>
              {Icon[e.icon]}
              <div className='unit-pg__menu-left__item__title'>
                <span className={e.tab === active ? "unit-pg__menu-left__item__active" : "unit-pg__menu-left__item__normal"}>
                  {e.tab}
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className='unit-pg__content'>
          <Suspense fallback={<div>Loading {active}</div>}>
            {content.length && content.find(e => e.tab === active).outlet}
          </Suspense>
        </div>
        <div className='unit-pg__space-right'>
        </div>
      </div>
    </ContextUnit.Provider>
  );
}

export default PageUnit;
