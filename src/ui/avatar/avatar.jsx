"use strict";
import React, { useState, useEffect, useContext, useRef } from "react";
import useEventListener from '../hook/use-event-listener';
import axios from "axios";
import useGame from './usegame';
import './avatar.css';


function getCoordinates(event) {
  let rect = event.target.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  };
}

function handleMouseDown(event, data) {
  let { x, y } = getCoordinates(event);
  data.handleMouseDown(x, y);
  return false;
}

function handleMouseUp(event, data) {
  return data.handleMouseUp();
}

function handleMouseMove(event, data) {
  let { x, y } = getCoordinates(event);
  const ret =  data.handleMouseMove(x, y);
  return ret;
}

function handleDraw(event, data) {
  return true;
}


function useAnimation(ref, data, deps) {
  useEffect(() => {
    let requestId;
    const cnv = ref.current;
    if(!cnv)
      return;
    const ctx = cnv.getContext('2d');
    const render = () => {
      if (data.next()){
        requestId = requestAnimationFrame(render);
      }
      data.draw(ctx);
    }

    render();

    return () => {
      if (requestId)
        cancelAnimationFrame(requestId);
    };
  }, deps);
}


function Avatar({action, sid, edit, color, acronym, width, height}) {
  const ref = useRef();
  const clip = useRef({l: 0, t: 0, r: 0, b: 0});
  const [upd, setUpd] = useState(false);
  // const [data, setData] = useState({width: 0, height: 0});
  const [data, setData] = useState({width: 100, height: 100, color, acronym, edit: false, url: '', upd: setUpd});
  // const [data, setData] = useState({});
  const fileName = useRef();
  const fileData = useRef();
  const fileObj  = useRef();
  const [fileInput, setFileInput] = useState(false);
  // const countInput = useRef(0);
  // const edit = true;

  useEffect(() => {
    console.log("===useEffect from avatar===", edit);
    edit
      ? setData(d => ({width: width, height: height, color, acronym, edit: true,  url: '', upd: setUpd}))
      : setData(d => ({
          ...d,
          width: 100,   
          height: 100,    
          color, 
          acronym, 
          edit: false, 
          url: sid ? `/api/media/image/${sid}` : '', 
          upd: setUpd
        }));
    setUpd(u => {
      return u = !u;
    });
  }, [sid, edit, acronym, width, height]);

  function dataURLtoBlob(dataURL) {
    let array, binary, i, len;
    binary = atob(dataURL.split(',')[1]);
    array = [];
    i = 0;
    len = binary.length;
    while (i < len) {
      array.push(binary.charCodeAt(i));
      i++;
    }
    return new Blob([new Uint8Array(array)], {
      // type: 'image/png'
      type: "application/octet-stream"
    });
  };

  const frmSubmit = async(e) => {
    e.preventDefault();
    const metadata = JSON.stringify({x: 42, y: 'abc'});
    const formData = new FormData();
    formData.append("name", fileName.current);
    formData.append("metadata", metadata);

    const canvas = ref.current;
    const blob = dataURLtoBlob( canvas.toDataURL() );
    // console.log("===FILE===", blob); return;
    // formData.append("track", new Blob([fileData.current], { type: "application/octet-stream"}), fileName.current);
    formData.append("track", blob, fileName.current);
    console.log({formData});
    const {data} = await axios.post('/api/media', formData, {
      headers: {'Content-Type': 'multipart/form-data'}
    });
    if(data) {
      console.log({data});
      // objRef.current.body = data.id;
      // setPid(data.id);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const {l, t, r, b} = clip.current;
    const image = new Image();
    let url = URL.createObjectURL(fileObj.current);
    image.src = url;
    image.onload = async () => {
      const width = image.width;
      const height = image.height;

      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(image, l, t, r - l, b - t, 0, 0, 100, 100);

      const metadata = JSON.stringify({x: 42, y: 'abc'});
      const formData = new FormData();
      formData.append("name", fileName.current);
      formData.append("metadata", metadata);

      const blob = dataURLtoBlob( canvas.toDataURL('image/jpeg', 0.75) );
      formData.append("track", blob, fileName.current);
      console.log({formData});
      const {data} = await axios.post('/api/media', formData, {
        headers: {'Content-Type': 'multipart/form-data'}
      });
      canvas.remove();
      if(url)
        URL.revokeObjectURL(url);

      if(data) {
        console.log({data});
        action?.({sid: data.id, ed: false});
      }
    }
  }


  const changeInput = async(e) => {
    const [file] = e.target.files;
    fileObj.current = file;
    if (file) {
      fileName.current = file.name;
      console.log("fileName", fileName.current);
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onload = async(e) => {
        fileData.current = e.target.result;
        // const b = new Blob([e.target.result], { type: "application/octet-stream"})
        // const t = await b.text();
        game.loadImage(file, setUpd);
        setFileInput(true);
      };
    }
  };

  const game = useGame(ref, data);
  const dn = useEventListener("mousedown", handleMouseDown, ref, game);
  const up = useEventListener("mouseup", handleMouseUp, ref, game);
  const mv = useEventListener("mousemove", handleMouseMove, ref, game);
  const dr = useEventListener("draw", handleDraw, ref, game);
  // useAnimation(ref, game, [up, mv, dr, width, height]);

  useAnimation(ref, game, [upd, up, mv, data]);
  clip.current = game.getClip();
  // console.log("===render from avatar===", data);

  return (
    <>
    {edit 
      ? <form id="formoid" onSubmit={handleSubmit} action="/home/uploadfiles" method="post" encType="multipart/form-data">
          <label htmlFor="fileInput">
          </label>
          <canvas ref={ref} width={data.width} height={data.height}></canvas>
          <input type="file" name="track" id="fileInput" onChange={changeInput} className={fileInput ? 'avatar-hidden' : 'avatar-visible'} />
          <input type="submit" name="submit" value="Submit" className={fileInput ? 'avatar-visible' : 'avatar-hidden'} />
        </form>
      : <canvas className="profile-canvas" ref={ref} width={data.width} height={data.height}></canvas>
    }</>
  );
};

export default Avatar;
