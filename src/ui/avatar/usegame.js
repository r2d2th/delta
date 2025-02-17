'use strict';
import React from 'react';
import {useRef, useEffect, useState} from 'react';

const initialGame = {
  x: 0, 
  y: 0, 
  width: 0,  // canvas width 
  height: 0, // canvas height
  color: '#fff',
  angle: 0,
  drag: false,
  dragX: 0,
  dragY: 0,
  image: undefined, 
  upd: undefined,
  url: '',   // image url
  w: 0,      // image width 
  h: 0,      // image height
  left: 0,
  top: 0,
  right: 0,
  bottom: 0,
  clip: false,
  clipX: 0,
  clipY: 0,
  radius: 0,
  ready: false,
  part: -1, // curr index for the parts array
  parts: [{x: 0, y: 0},{x: 0, y: 0},{x: 0, y: 0},{x: 0, y: 0}],
  borders: [
    {sw: 0, sh: 0, l: 0, t: 0, r: 0, b: 0},
    {sw: 0, sh: 0, l: 0, t: 0, r: 0, b: 0},
    {sw: 0, sh: 0, l: 0, t: 0, r: 0, b: 0},
    {sw: 0, sh: 0, l: 0, t: 0, r: 0, b: 0}
  ],
};

function useGame(ref, data) {
  const game = useRef(initialGame);

  function setGame(updater){
    game.current = updater(game.current);
  } 

  useEffect(() => {
    setGame(g => {
      return {...g, ...data};
    });
    console.log("===useEffect of avatar useGame===", data);
    if(data.url)
      loadImage(data.url, data.upd);
    else
      loadAcronym(data.upd);
    // setGame(g => {
    //   return {...g, ready: true};
    // });
  }, [data]);

  useEffect(() => {
    if(game.current.url)
      loadImage(data.url, data.upd);
    else
      loadAcronym(data.upd);

  }, [game.current.url]);

  function draw(ctx) {
    // const {ready} = game.current;
    // if(!ready)
    //   return;
    drawClear(ctx);
    drawImage(ctx);
    drawMask(ctx);
    drawClip(ctx);
  }

  function drawClear(ctx) {
    const {width, height} = game.current;
    ctx.clearRect(0, 0, width, height);
  }

  function drawImage(ctx) {
    console.log("===usegame drawImage===", game.current);
    const {image, w, h, angle, width, height, acronym} = game.current;
    let {x, y} = game.current;
    const tmp = x;
    switch(angle) {
      case 180:
        x = -x;
        y = -y;
        break;
      case 90:
        x = y;
        y = -tmp;
        break;
      case 270:
        x = -y;
        y = tmp;
        break;
      default:
        break;
    }
    const degrees = angle;
    // console.log("===Draw Image===");
    if(image) {
      // ctx.drawImage(image, x, y, w/2, h/2);
      // save the unrotated context of the canvas so we can restore it later
      // the alternative is to untranslate & unrotate after drawing
      ctx.save();

      // move to the center of the canvas
//      ctx.translate(w/2,h/2);

      // rotate the canvas to the specified degrees
  //    ctx.rotate(degrees*Math.PI/180);

      // draw the image
      // since the context is rotated, the image will be rotated also
//      ctx.drawImage(image,x-w/2,y-h/2);
      const widthC = (angle == 0 || angle == 180) ? width : height;
      const heightC = (angle == 0 || angle == 180) ? height : width;
      const cW = widthC/w;
      const cH = heightC/h;
      let dW, dH, dx, dy;
      if(cW >= cH) {
        dW = w * cH;
        dH = heightC;
        dx = Math.round((widthC - dW)/2);
        dy = 0;
      }
      if(cH > cW) {
        dW = widthC; 
        dH = h * cW;
        dx = 0;
        dy = Math.round((heightC - dH)/2);
      }
      // console.log({x, y, w, h, dx: dx-dW/2, dy: dy-dH/2, width, height});
      ctx.translate(width/2, height/2);
      ctx.rotate(degrees*Math.PI/180);
      // if(angle)
      //   ctx.drawImage(image, 0, 0, w, h, dW/4 + x+dx-width/2, dH/4 + y+dy-height/2, dW/2, dH/2);
      // else
        ctx.drawImage(image, 0, 0, w, h, x+dx-widthC/2, y+dy-heightC/2, dW, dH);

      // we’re done with the rotating so restore the unrotated context
      ctx.restore();
    } else {
      // console.log("===Empty image===");
      const {clipX, clipY, radius} = game.current;
      ctx.beginPath();
      ctx.font = `${height/3}px Arial`;
      ctx.fillText(acronym, clipX - height/5, clipY + height/9);
      // ctx.arc(clipX, clipY, radius/2, 0, 2 * Math.PI, false);
      ctx.strokeStyle = '#7a7';
      ctx.stroke();
      ctx.closePath();

      ctx.beginPath();
      ctx.arc(clipX, clipY, radius, 0, 2 * Math.PI, false);
      ctx.strokeStyle = '#777';
      ctx.stroke();
    }
  }

  function drawMask(ctx) {
    if(!game.current.image)
      return;
    const {width, height, clipX, clipY, radius, color, edit} = game.current;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(width, 0);
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.lineTo(0, 0);

    ctx.moveTo(clipX + radius, clipY);
    ctx.arc(clipX, clipY, radius, 0, 2 * Math.PI, true);
    ctx.fillStyle = edit ? 'rgba(0, 0, 0, 0.5)' : color;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(clipX, clipY, radius, 0, 2 * Math.PI, false);
    ctx.strokeStyle = '#777';
    ctx.stroke();
  }

  function drawClip(ctx) {
    if(!game.current.image)
      return;
    if(!game.current.edit)
      return;
    const {left, top, right, bottom} = game.current;
    const radius = 5;
    ctx.beginPath();
    ctx.strokeStyle = '#444';
    // ctx.strokeStyle = '#000';
    // ctx.fillStyle = '#fff';
    ctx.moveTo(game.current.parts[0].x,  game.current.parts[0].y);
    game.current.parts.forEach(e => {
      ctx.lineTo(e.x, e.y);
    });
    ctx.closePath();
    ctx.stroke();

    ctx.strokeStyle = '#000';
    ctx.fillStyle = '#fff';
    // ctx.strokeStyle = '#444';
    // ctx.fillStyle = '#888';

    game.current.parts.forEach(e => {
      ctx.beginPath();
      ctx.arc(e.x,  e.y, radius, 0, 2*Math.PI);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    });
  }

  function loadGeometry(radius) {
    setGame(g =>{
      const {width, height} = g;
      const centerX = Math.floor(width/2);
      const centerY = Math.floor(height/2);
      g.left   = centerX - radius;
      g.right  = centerX + radius;
      g.top    = centerY - radius;
      g.bottom = centerY + radius;
      const left   = centerX - radius;
      const right  = centerX + radius;
      const top    = centerY - radius;
      const bottom = centerY + radius;
      g.parts[0].x = left;
      g.parts[0].y = top;
      g.parts[1].x = right;
      g.parts[1].y = top;
      g.parts[2].x = right;
      g.parts[2].y = bottom;
      g.parts[3].x = left;
      g.parts[3].y = bottom;

      g.clipX = (left + right)/2;
      g.clipY = (top + bottom)/2;
      g.angle = 0;
      g.radius = radius;
      return g;
    });
  }

  function loadAcronym(updater) {
    const {width, height} = game.current;
    const radius = Math.floor(Math.min(width, height)/2) - 5;
    loadGeometry(radius);
    setGame(g => {
      return {...g, ready: true}
    });
    updater(u => {
      u = !u;
      return u;
    });
  }

  const loadImage = (file, updater) => {
    const image = new Image();
    let url;
    if('string' === typeof file)
      image.src = file;
    else {
      url = URL.createObjectURL(file);
      image.src = url;
    }
    image.onload = () => {
      game.current.w = image.width;
      game.current.h = image.height;
      game.current.image = image;
      if(url)
        URL.revokeObjectURL(url);

      const {width, height, w, h, edit} = game.current;
      game.current.borders.forEach((e,i) => {
        game.current.borders[i] = (i % 2) ? {...e, sw: h, sh: w} : {...e, sw: w, sh: h};
      });
      let mindim = 0;
      const cw = width;
      const ch = height;
      for(let i=0; i<4; i++){
        const {sw, sh} = game.current.borders[i];
        let dh, dw;
        if(cw > ch*sw/sh) {
          dh = ch;
          dw = ch*sw/sh;
          game.current.borders[i] = {...game.current.borders[i], l: (cw-dw)/2, t: 0, r: (cw+dw)/2, b: ch};
        } else {
          dh = cw*sh/sw;
          dw = cw;
          game.current.borders[i] = {...game.current.borders[i], l: 0, t: (ch-dh)/2, r: cw, b: (ch+dh)/2};
        }
        mindim = Math.min(dw, dh);
      }

      const radius = edit ? Math.floor(0.2 * mindim) : Math.floor(mindim/2);
      loadGeometry(radius);
      // const centerX = Math.floor(width/2);
      // const centerY = Math.floor(height/2);
      // game.current.left   = centerX - radius;
      // game.current.right  = centerX + radius;
      // game.current.top    = centerY - radius;
      // game.current.bottom = centerY + radius;
      // const left   = centerX - radius;
      // const right  = centerX + radius;
      // const top    = centerY - radius;
      // const bottom = centerY + radius;
      // game.current.parts[0].x = left;
      // game.current.parts[0].y = top;
      // game.current.parts[1].x = right;
      // game.current.parts[1].y = top;
      // game.current.parts[2].x = right;
      // game.current.parts[2].y = bottom;
      // game.current.parts[3].x = left;
      // game.current.parts[3].y = bottom;
      //
      // game.current.clipX = (left + right)/2;
      // game.current.clipY = (top + bottom)/2;
      // game.current.angle = 0;
      // game.current.radius = radius;

      setGame(g => {
        return {...g, ready: true}
      });
      updater(u => {
        u = !u;
        return u;
      });
    }
  }

  function next() {
    return false;
  }

  const mouseUp = () => setGame(g => {
    g.drag = false;
    g.dragX = 0;
    g.dragY = 0;
    g.clip = false;
    g.part = -1;
    return g;
  });

  function hitTest(hx, hy) {
    const radius = 5;
    const D = radius * radius; 
    for(let i=0; i<4; i++) {
      const {x, y} = game.current.parts[i]
      if((hx-x)*(hx-x)+(hy-y)*(hy-y) < D)
        return i;
    }
    return -1;
  }

  function hitClip(hx, hy) {
    const {clipX, clipY, radius} = game.current;
    if((hx - clipX)*(hx - clipX) + (hy - clipY)*(hy - clipY) < radius * radius)
      return true;
    return false;
  }

  function rotateImage() {
    setGame(g => {
      g.angle += 90;
      if(g.angle == 360)
        g.angle = 0;
      return g;
    });
  }

  const handleMouseDown = (hx, hy) => {
    let ret = true;
    if(hx < 10 && hy < 10) {
      moveClip(game.current.width/2, game.current.height/2);
      rotateImage();
      return ret;
    }
    const part = hitTest(hx, hy);
    if(part >= 0) {
      game.current.part = part;
      return true;
    }
    const clip = hitClip(hx, hy);
    if(clip) {
      setGame(g => {
        g.clip = true;
        g.dragX = Math.round(hx - g.clipX);
        g.dragY = Math.round(hy - g.clipY);
        return g;
      });
      return true;
    }
    return ret;
  }

  const handleMouseUp = () => {
    mouseUp();
    return true;
  };

  function movePart(x, y, i) {
    function getDelta(x, y, obj) {
      const dx = Math.abs(x - obj.x);
      const dy = Math.abs(y - obj.y);
      let delta = Math.max(dx, dy);
      if(delta < 16) 
        delta = 16;
      return delta;
    } 
    let nx, ny, delta;
    setGame(g => {
      const {l, t, r, b} = g.borders[Math.round(g.angle/90)];
      switch(i) {
        case 0:
          delta = getDelta(x, y, g.parts[2]);
          nx = g.parts[2].x - delta; 
          ny = g.parts[2].y - delta;
          if(nx < l || ny < t)
            break;
          g.parts[0].x = nx;
          g.parts[0].y = ny;
          g.parts[1].y = ny;
          g.parts[3].x = nx;
          break;
        case 1:
          delta = getDelta(x, y, g.parts[3]);
          nx = g.parts[3].x + delta; 
          ny = g.parts[3].y - delta;
          if(nx > r || ny < t)
            break;
          g.parts[1].x = nx;
          g.parts[1].y = ny;
          g.parts[0].y = ny;
          g.parts[2].x = nx;
          break;
        case 2:
          delta = getDelta(x, y, g.parts[0]);
          nx = g.parts[0].x + delta; 
          ny = g.parts[0].y + delta;
          if(nx > r || ny > b)
            break;
          g.parts[2].x = nx;
          g.parts[2].y = ny;
          g.parts[3].y = ny;
          g.parts[1].x = nx;
          break;
        case 3:
          delta = getDelta(x, y, g.parts[1]);
          nx = g.parts[1].x - delta; 
          ny = g.parts[1].y + delta;
          if(nx < l || ny > b)
            break;
          g.parts[3].x = nx;
          g.parts[3].y = ny;
          g.parts[2].y = ny;
          g.parts[0].x = nx;
          break;
        default:
          break;
      }
      const left = g.parts[0].x;
      const top  = g.parts[0].y;
      const right  = g.parts[2].x;
      const bottom = g.parts[2].y;
      g.clipX = (left + right)/2;
      g.clipY = (top + bottom)/2;
      g.radius  = (right - left)/2;
      return g;
    });
  }

  function moveClip(x, y) {
    setGame(g => {
      const clipX = Math.floor(x - g.dragX);
      const clipY = Math.floor(y - g.dragY);
      const left   = clipX - g.radius;
      const right  = clipX + g.radius;
      const top    = clipY - g.radius;
      const bottom = clipY + g.radius;
      
      const {l, t, r, b} = g.borders[Math.round(g.angle/90)];
      if(left < l || top < t) {
        g.dragX = Math.round(x - g.clipX);
        g.dragY = Math.round(y - g.clipY);
        return g;
      }
      if(right > r || bottom > b) {
        g.dragX = Math.round(x - g.clipX);
        g.dragY = Math.round(y - g.clipY);
        return g;
      }

      g.parts[0].x = left;
      g.parts[0].y = top;
      g.parts[1].x = right;
      g.parts[1].y = top;
      g.parts[2].x = right;
      g.parts[2].y = bottom;
      g.parts[3].x = left;
      g.parts[3].y = bottom;
      g.clipX = clipX;
      g.clipY = clipY;
      return g;
    });
  }

  const handleMouseMove = (x, y) => {
    if(game.current.part >= 0) {
      movePart(x, y, game.current.part);
      return true;
    }
    if(game.current.clip){
      moveClip(x,y);
      return true;
    }
    return false;
  }

  function getClip() {
    const {angle, width, height, w, h} = game.current;
    let {x: l, y: t} = game.current.parts[0];
    let {x: r, y: b} = game.current.parts[2];

    const widthC = (angle == 0 || angle == 180) ? width : height;
    const heightC = (angle == 0 || angle == 180) ? height : width;
    const cW = widthC/w;
    const cH = heightC/h;
    let dW, dH, dx, dy;
    if(cW >= cH) {
      dW = w * cH;
      dH = heightC;
      dx = Math.round((widthC - dW)/2);
      dy = 0;
      l -= dx;
      r -= dx;
      l /= cH;
      t /= cH;
      r /= cH;
      b /= cH;
    }
    if(cH > cW) {
      dW = widthC; 
      dH = h * cW;
      dx = 0;
      dy = Math.round((heightC - dH)/2);
      t -= dy;
      b -= dy;
      l /= cW;
      t /= cW;
      r /= cW;
      b /= cW;
    }
    return {l: Math.floor(l), t: Math.floor(t), r: Math.floor(r), b: Math.floor(b)};
  }

  return {
    handleMouseDown,
    handleMouseUp,
    handleMouseMove,
    next,
    draw,
    drawImage,
    loadImage,
    getClip,
  }
}

export default useGame;
