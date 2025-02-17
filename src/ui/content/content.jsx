'use strict';
import React from 'react';
import { useState, useEffect, useContext } from 'react';
import ContextUnit from '../ContextUnit';
import axios from 'axios';
import LangToggler from '../langtoggler';
import Anki from '../anki';
import Talk from '../talk';
import Dialog from '../dialog';
import Spell from '../spell';
import Puzzle from '../puzzle';
import Dummy from '../dummy';
import Chip from '../chip';
import Contented from '../contented';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import './content.scss';

const Anker = ({target}) => {
  const { unit, setUnit } = useContext(ContextUnit);
  const [data, setData] = useState('');

  useEffect(() => {
    const found = unit.data.find(e => e.target === target);
    const json  = found ? found.body : '';
    setData(json);
  }, []);

  return (
    <div className="anki-wrapper">
      {data && <Anki type="flesh" data={data} />}
    </div>
  );
};

const Picture = ({target}) => {
  const { unit, setUnit } = useContext(ContextUnit);
  const [pid, setPid] = useState('');         // picture url 
  const [width, setWidth] = useState('50%');  // picture width in percent of content block

  useEffect(() => {
    const [primary, secondary] = target.split(' ');
    const foundPrimary   = unit.data.find(e => e.target === primary);
    const foundSecondary = !!secondary ? `${secondary}%` : '50%';
    setWidth(foundSecondary);
    // const found = unit.data.find(e => e.target === target);
    // const found = unit.data.find(e => e.target === foundPrimary);
    const pictureId = foundPrimary ? foundPrimary.body : '';
    setPid(`/api/media/image/${pictureId}`);
  }, [target]);
  return (
    <div className="content-wrapper">
      <img className="picture-img" style={{width}} src={pid} role="img" />
    </div>
  );
};

const Dialoger = ({target}) => {
  const { unit, setUnit } = useContext(ContextUnit);
  const [initial, setInitial] = useState({phrases: []});

  useEffect(() => {
    const found = unit.data.find(e => e.target === target);
    const json  = found ? found.body : '';
    setInitial(ini => {
      const tmp = JSON.parse(json);
      return {
        ...ini, 
        phrases: [
          ...(tmp.phrases.map((e, i) => { 
            return {
              ...e, 
              key: "a" + i.toString()
            }
          }))
        ]
      };
    });
  }, []);

  return (
    <div className="content-wrapper">
      <Dialog data={initial} />
    </div>
  );
};

const Puzzler = ({target}) => {
  const { unit, setUnit } = useContext(ContextUnit);
  const [initial, setInitial] = useState('');

  useEffect(() => {
    const found = unit.data.find(e => e.target === target);
    const json  = found ? found.body : '';
    setInitial(ini => {
      ini += json;
      return ini;
    });
  }, []);

  return (
    <div className="puzzle-wrapper">
      {initial && <Puzzle data={initial} />}
    </div>
  );
};

const Speller = ({target}) => {
  const { unit, setUnit } = useContext(ContextUnit);
  const [initial, setInitial] = useState('');

  useEffect(() => {
    console.log("===speller===", target);
    const [primary, secondary] = target.split(' ');
    const foundPrimary = unit.data.find(e => e.target === primary);
    const foundSecondary = unit.data.find(e => e.target === secondary);

    const jsonData = foundPrimary ? foundPrimary.body : '';
    const jsonSound = foundSecondary ? foundSecondary.body : '""';

    const dataRaw   = JSON.parse(jsonData);
    const sound = JSON.parse(jsonSound);
    const data = sound 
      ? { task: dataRaw.task.map(e => {
            const found = sound.find(el => el.text == e.sound);
            return {...e, src: `/api/media/${found.id}`, subtitle: found.subtitle};
          }), 
          sound: true
        } 
      : { task: dataRaw.task.map(e => {return {...e, src: '', subtitle: ''}}), 
          sound: false
        };
    setInitial(ini => {
      ini = JSON.stringify(data);
      return ini;
    });
  }, [target]);

  return (
    <div className="puzzle-wrapper">
      {initial && <Spell data={initial} />}
    </div>
  );
};

const VideoPlayer = ({target}) => {
  const { unit, setUnit } = useContext(ContextUnit);
  const [vid, setVid] = useState('');  // video id

  useEffect(() => {
    const found = unit.data.find(e => e.target === target);
    const videoId = found ? found.body : '';
    setVid(`/api/media/${videoId}`);
  }, [target]);
  return (
    <div className="content-wrapper">
      {vid && 
        <video width="800" className="content-video" controls preload="auto">
          <source src={vid} type="video/mp4" />
          Your browser does not support HTML5 video.
        </video>}
    </div>
  );
};

const Chiper = ({target}) => {
  const { unit, setUnit } = useContext(ContextUnit);
  const [json, setJson] = useState('');
  const [jsnd, setJsnd] = useState(false);

  useEffect(() => {
    console.log("===chiper===", target);
    const [primary, secondary] = target.split(' ');
    const foundPrimary = unit.data.find(e => e.target === primary);
    const foundSecondary = unit.data.find(e => e.target === secondary);

    const jsonData = foundPrimary ? foundPrimary.body : '';
    const jsonSound = foundSecondary ? foundSecondary.body : false;

    const dataRaw   = JSON.parse(jsonData);
    const sound = JSON.parse(jsonSound);
    const data = !!sound
      ? { task: dataRaw.task.map(e => {
            const found = sound.find(el => el.text == e.sound);
            return {...e, src: `/api/media/${found.id}`, subtitle: found.subtitle};
          }), 
          sound: true
        } 
      : { task: dataRaw.task.map(e => {return {...e}}), 
          sound: false
        };
    setJson(JSON.stringify(data));
    setJsnd(!!sound);
  }, [target]);

  return (
    <div className="puzzle-wrapper">
      {json && <Chip json={json} jsnd={jsnd} />}
    </div>
  );
};


const Content = ({target}) => {
  const admin =  false; // true;
  const [md, setMd] = useState('');
  const { unit, setUnit } = useContext(ContextUnit);

  const getTarget = (target) => {
    if(unit.data.length == 0)
      return "";

    const obj = unit.data.find(e => e.target === target);
    if(obj === undefined)
      return "";

    return obj.body;
  };

  useEffect(() => {
    // console.log("====Unit.name====", unit.name);
    // console.log("====getTarget====", target, getTarget(target));
    setMd(getTarget(target));
  }, [target]);

  function handleToggle() {
    setMd(md.replace(/##/gm, "###"));
  }

  return (
    <>
      <div>
        <LangToggler onToggle={handleToggle} initial="en" />
        <ReactMarkdown 
          children={md}
          className='md-class'
          components={{ 
            talk: Talk, 
            dummy: Dummy, 
            picture: Picture, 
            dialoger: Dialoger, 
            puzzler: Puzzler, 
            speller: Speller, 
            anker: Anker, 
            videoplayer: VideoPlayer,
            chiper: Chiper
          }}
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[[rehypeRaw, {allowDangerousHtml: true}]]} />
        { admin && 
          md && 
          <Contented value={md} action={setMd} />}
      </div>
    </>
  );
};

export default Content;
