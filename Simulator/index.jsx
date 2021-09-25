"use strict";
import React, { useState, useEffect, useRef, createRef, useContext } from "react";
import useGame from "./usegame";
import useEventListener from "../hook/use-event-listener";
import useWindowResize from "../hook/use-window-resize";
import axios from "axios";
import auth from "../auth";
import AuthContext from "../AuthContext";
import "./assets/simulator.scss";



function useCanvasResize(cnv, div, dm, data) {
    const dims = useRef();
    useEffect(() => {
        const boundingRect = div.current.getClientRects()[0];
        dims.current = {width:  Math.round(boundingRect.width), 
                        height: Math.round(boundingRect.height)};
        console.log("Secondary size: ", dims.current.width, dims.current.height);
        data.setSize(dims.current.width, dims.current.height);
        cnv.current.width  = dims.current.width;  
        cnv.current.height = dims.current.height; 
    }, [dm]);
}


function handleMouseDown(event, data) {
    return data.handleMouseDown(event.layerX, event.layerY);
}

function handleMouseUp(event, data) {
    return data.handleMouseUp();
}

function handleMouseMove(event, data) {
    return data.handleMouseMove(event.layerX, event.layerY);
}

function handleDraw(event, data) {
    return true;
}


function useAnimation(ref, data, deps) {
  useEffect(() => {
    const cnv = ref.current;
    const ctx = cnv.getContext('2d');

    const phases = data.getGenerator()(); //phaseGenerator();
    let requestId;

    const render = () => {
      ctx.clearRect(0, 0, cnv.width, cnv.height);

      const r = data.getAnswerRect();
      ctx.beginPath();
      ctx.fillStyle = '#FFFFFF';
      ctx.rect(r.x,r.y, r.width, r.height);
      ctx.fill();

      ctx.beginPath();
      ctx.strokeStyle = 'rgba(0, 0, 100, 0.5)';
      for(let i=r.y; i<=r.y+r.height; i+=r.unit/3) {
        ctx.moveTo(      0,  i); 
        ctx.lineTo(r.width,  i); 
      }
      for(let j= 0; j < r.width+r.unit/3; j+=r.unit/3) {
        ctx.moveTo( j,  r.y);
        ctx.lineTo( j,  r.y+r.height);
      }
	    ctx.stroke();
      ctx.closePath();


      data.forEach((x, y, w, a, text) => {
        ctx.fillStyle = "RosyBrown";//'SlateGray';
        ctx.beginPath();  
        ctx.fillRect(x, y, w, a);

        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(60, 60, 60, 1.0)'; //'#444444';
        ctx.lineCap = 'square';
        ctx.strokeRect(x,y,w,a);
			 
        ctx.fillStyle = "navy";//"cadetblue";
        ctx.font = data.getFont();
        const {dx, dy} = data.getTextOffset();
        ctx.fillText(text, x + dx, y + dy);
        ctx.closePath();
      });
      
      const step = phases.next();
      if(step.done == false) {
        data.stepAnimated(step);
        requestId = requestAnimationFrame(render);
      }
      if(step.done == true) {
        data.stopAnimated();
      }
    }

    render();

    return () => {
      if(requestId)
        cancelAnimationFrame(requestId);
    };        
  }, deps);
}


const Simulator = (props) => {
    const ref = useRef();
    const divRef = useRef();
    const gameContext = useContext(AuthContext); 
    const game = useGame(gameContext.state.game) ;

    const dimensions = useWindowResize();
    useCanvasResize(ref, divRef, dimensions, game);
    useEventListener("mousedown", handleMouseDown, ref, game);
    const upCounter = useEventListener("mouseup",   handleMouseUp,   ref, game);
    const mvCounter = useEventListener("mousemove", handleMouseMove, ref, game);
    const drCounter = useEventListener("draw",      handleDraw,      ref, game);
    useAnimation (ref, game, [upCounter, mvCounter, drCounter, dimensions]);
    
    return (
       <div
         ref={divRef}
         className="canvaser"
       >
            <canvas
                id='cnv-do'
                ref={ref}
            />
       </div>
    );    
};

export default Simulator;

