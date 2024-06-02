/***************************/
/*                         */
/*         Classes         */
/*                         */
/***************************/

// Using a fixed set of RNG values dramatically improves processing time by preventing constant calls to rng.value()
class RNG {
  constructor() {
    this.iterator = 0;
    this.queue = [];
    for ( let i = 0; i < 65535; i++) {
      this.queue.push(Math.random());
    }
  }

  // the class's only method simply gets the next value in the RNG chain
  value() {
    this.iterator = this.iterator == this.queue.length ? 0 : this.iterator + 1;
    return this.queue[this.iterator];
  }
}

class SceneCanvas {
  constructor(docCanvasId) {
    this.canvas = document.getElementById(docCanvasId);
    this.ctx = canvas.getContext('2d');
  }

  resizeCanvas() {
    this.canvas.width = _w;
    this.canvas.height = _h;
  }

  clear() {
    this.ctx.clearRect(0, 0, _w, _h);
  }
}

class Moon {
  constructor(x, y, speed) {
    this.x = x;
    this.y = y;
    this.speed = speed;
  }

  move(frameSpeedFactor) {
    this.x += this.speed * frameSpeedFactor;
    
    if (this.y <= _h + 50 && this.x <= _w + 50) {
      this.y += this.speed * frameSpeedFactor;
    }
  }

  drawHalo(ctx) {
    // draw the moon's halo
    let bgGrad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, Math.max(_w, _h));

    bgGrad.addColorStop(0, 'rgb(60,60,120)');
    bgGrad.addColorStop(1, 'rgb(5,5,15)');

    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, _w, _h);
  }

  drawBody(ctx) {
    // draw the moon body
    let bodyGrad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, 40);
    bodyGrad.addColorStop(0.28, 'rgba(255,225,255,1)');
    bodyGrad.addColorStop(0.88, 'rgba(248,200,255,1)');
    bodyGrad.addColorStop(1, 'rgba(248,200,255,0)');

    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.arc(this.x, this.y, 40, 0, Math.PI * 2)
    ctx.fill();
  }
}

class Starfield {
  constructor(numStars) {
    this.stars = [];

    this.populateStars(numStars);
  }

  populateStars(numStars) {
    for (let i = 0; this.stars.length < numStars; i++) {
        let myX = Math.ceil(rng.value() * _w),
        myY = Math.ceil(rng.value() * _h);
        this.stars.push(new StaticStar(myX, myY));
    }
  }

  drawStarfield(ctx) {
    for (let i = 0; i < this.stars.length; i++) {
      ctx.fillStyle = `hsl(270, 50%, ${50 + (rng.value() * 50)}%)`;
      ctx.fillRect(this.stars[i].x, this.stars[i].y, 1, 1);
    }
  }
}

class StaticStar {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

class ShootingStarController {
  constructor() {
    this.shootingStarsArray = [];
  }

  createShootingStar(x, y, size = 1) {
    let s = new ShootingStar(x, y, size);
    this.shootingStarsArray.push(s);
  }

  moveShootingStars(frameSpeedFactor) {
    for (let i = 0; i < this.shootingStarsArray.length; i++) {
      let s = this.shootingStarsArray[i];

      if (s.x > _w || s.y > _h) {
        this.shootingStarsArray.splice(i, 1);
      } else {
        s.prevX = s.x;
        s.prevY = s.y;
        s.x += s.speed * frameSpeedFactor;
        s.y += s.speed * frameSpeedFactor;
      }
    }
  }

  checkForNewShootingStar() {
    // randomly creates new shooting stars. called every frame.
    let starRand = rng.value();
    if (starRand <= 0.001) {
      if (starRand <= 0.0001) {
        this.shootingStarsArray.push(new ShootingStar(Math.ceil(rng.value() * _w), -10, Math.ceil(rng.value() * 4)));
      } else {
        this.shootingStarsArray.push(new ShootingStar(Math.ceil(rng.value() * _w), -10));
      }
    }
  }

  drawShootingStars(ctx) {
    ctx.strokeStyle = "#FFF";

    for (let i = 0; i < this.shootingStarsArray.length; i++) {
      let s = this.shootingStarsArray[i];

      if (s.size >= 3) {
        let glowGrad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, 5 * s.size);
        glowGrad.addColorStop(0, 'rgba(255,255,255,' + 0.1 * s.size + ')');
        glowGrad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = glowGrad;
        ctx.fillRect(s.x - 10 * s.size / 2, s.y - 10 * s.size / 2, 30 * s.size, 30 * s.size);
      }

      ctx.lineWidth = s.size;
      ctx.beginPath();
      ctx.moveTo(s.prevX, s.prevY);
      ctx.lineTo(s.x, s.y);
      ctx.stroke();
    }
  }
}

class ShootingStar {
  constructor(x, y, size) {
    this.x = x;
    this.y = y;
    this.prevX = this.x;
    this.prevY = this.y;
    this.size = size;
    this.speed = 16 - size;
  }
} 

class Skyline {
  constructor() {
    this.buildingArray = [];

    this.constructSkyline();
  }

  // constructs a skyline of building objects
  constructSkyline() {
    let totalWidth = 0;      // tracks the screen width traversed so far to ensure the entire width is covered
    let towerNum = 0;        // limits the number of red dot towers
    let lastBuildHeight = 0; // lastBuildHeight will ensure that two buildings of the same height are not adjacent to one another

    this.buildingArray = [];

    while (totalWidth < _w) {
        let myWinHeight = (rng.value() < 0.1) ? 20 : 10;
        let myH = Math.ceil(rng.value() * 15) * myWinHeight;
        let myW;
        let myX;
        let myY;
        let myTop;
        //Check if height needs to be recalculated
        if (myH === lastBuildHeight) {
          myH = Math.ceil(rng.value() * 15) * myWinHeight;
        }

        myW = Math.ceil(rng.value() * bldgSizeFactor) * bldgSizeFactor;

        //Check if width needs to be recalculated
        if (myW == bldgSizeFactor && towerNum < 3) {
          myW = Math.ceil(rng.value() * bldgSizeFactor) * bldgSizeFactor;
        }

        if (myW <= bldgSizeFactor) {
          myH += lastBuildHeight + 40;
          towerNum += 1;
        }

        myX = totalWidth;
        myY = _h - myH;
        myTop = (rng.value() < 0.075 && myW > bldgSizeFactor) ? 1 : 0;
        this.buildingArray.push(new Building (myX, myY, myW, myH, myTop));

        totalWidth += myW;
        lastBuildHeight = myH;
    }
  }
  
  updateBuildings(frameSpeedFactor) {
    for (let i = 0; i < this.buildingArray.length; i++) {
      this.buildingArray[i].updateBuilding(frameSpeedFactor);
    }

    this.tryUpdateWindows();
  }

  drawSkyline(ctx) {
    for (let i = 0; i < this.buildingArray.length; i++) {
      let b = this.buildingArray[i];
      ctx.fillStyle = "#000";
      ctx.fillRect(b.x, b.y, b.w, b.h);

      if (b.triTop == 1) {
        ctx.beginPath();
        ctx.moveTo(b.x, b.y);
        ctx.lineTo(b.x + b.w / 2, b.y - b.triHeight);
        ctx.lineTo(b.x + b.w, b.y);
        ctx.fill();
      }
      
      if (b.hasDot && b.dotTimer > 30) {
        ctx.shadowBlur = 8;
        ctx.shadowColor = 'rgb(255, 0, 0)';

        ctx.fillStyle = 'rgb(200, 0, 0)';
        ctx.beginPath();
        ctx.arc(b.x + (b.w / 2), b.y - (b.triHeight) - 4, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;
      }
    }
  }

  drawWindows(ctx) {
    ctx.shadowBlur = 5;
    ctx.shadowColor = "#EE9";
    ctx.fillStyle = "#EE9";
    for (let i = 0; i < this.buildingArray.length; i++) {
      let building = this.buildingArray[i];
      for (let j = 0; j < building.windows.length; j++) {
        let w = building.windows[j];
        if (!w.on) { continue; }
        ctx.fillRect(w.x + 1, w.y + 1,
                     building.windowWidth - 2, building.windowHeight - 2);
      }
    }

    ctx.shadowBlur = 0;
  }

  tryUpdateWindows() {
    let r = rng.value() * 1000;
    if (r <= 2) {
      let bIndex = Math.floor(this.buildingArray.length * rng.value());
      let building = this.buildingArray[bIndex];
      if (building.windows.length > 0) {
        building.updateSingleRandomWindow();
      }
    }
  }
}

class Building {
  constructor(x, y, w, h, triTop) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;

    this.triTop = triTop;
    this.triHeight = this.triTop ? this.w / Math.round(3 - (rng.value() * 2)) : 0;

    this.windowWidth;
    this.windowHeight;    
    this.windows = [];

    this.dotTimer = Math.round(rng.value() * 60);
    this.hasDot = this.windowWidth * 2 <= this.w || rng.value() < 0.1;

    this.populateWindows();
  }

  populateWindows() {
    this.windowWidth = 6 + Math.round(rng.value() * 2);

    if (this.windowWidth * 2 > this.w) { return; }

    this.windowHeight = rng.value() < 0.75 ? this.windowWidth : Math.round(this.windowWidth * 2);

    for (let i = 0; i < this.h; i += this.windowHeight) {
      for (let j = 0; j < this.w - this.windowWidth; j += this.windowWidth) {
        let w = new Window(this.x + j, this.y + i);
        this.windows.push(w);
      }
    }
  }

  updateBuilding(frameSpeedFactor) {
    this.dotTimer = this.dotTimer > 0 ? this.dotTimer - frameSpeedFactor : 60;
  }

  updateSingleRandomWindow() {
    let wIndex = Math.floor(this.windows.length * rng.value());
    this.windows[wIndex].on = this.windows[wIndex].on ? false : true;
  }
}

class Window {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.on = rng.value() < 0.075;
  }
}

/***************************/
/*                         */
/*         Globals         */
/*                         */
/***************************/

let rng = new RNG();

let _w = window.innerWidth;
let _h = window.innerHeight;

let sceneCanvas = new SceneCanvas('canvas');

//Create vars to control the width and height of the canvas
let bldgSizeFactor = Math.max(Math.ceil(_w / 170), 7);

//This function sets the _w and _h values to the max width and height of the window
let resizeWindow = function(){
  _w = window.innerWidth;
  _h = window.innerHeight;
};

//Size the canvas to the screen on load or resize
window.addEventListener('load', sceneCanvas.resizeCanvas);
window.addEventListener('resize', sceneCanvas.resizeCanvas);

let moon = new Moon(Math.round(rng.value() * (_w / 5)), -10, 0.1)
let starfield = new Starfield(260);
let shootingStarController = new ShootingStarController();
let skyline = new Skyline();

let fadeOut = 0;

document.addEventListener('click', function(e){
  e.preventDefault();
  shootingStarController.createShootingStar(e.clientX, e.clientY, Math.ceil(rng.value() * 4));
});

// variables to track the time elapsed between each frame
let firstFrameTime = performance.now();
let frameSpeedFactor = 1;
let tempFrameSpeedFactor = 0;

function draw(callbackTime) {
  // target 30fps by dividing the monitor's refresh rate by 30 to calculate per-frame movement
  tempFrameSpeedFactor = Math.min(callbackTime - firstFrameTime, 30);   // set a minimum to avoid frame timer buildup when the window is not focused
  firstFrameTime = callbackTime;
  frameSpeedFactor = tempFrameSpeedFactor / 30;

  sceneCanvas.clear();
  
  moon.drawHalo(sceneCanvas.ctx);
  starfield.drawStarfield(sceneCanvas.ctx);
  
  moon.move(frameSpeedFactor);
  moon.drawBody(sceneCanvas.ctx);

  shootingStarController.moveShootingStars(frameSpeedFactor);
  shootingStarController.drawShootingStars(sceneCanvas.ctx);
  shootingStarController.checkForNewShootingStar();
  
  skyline.drawSkyline(sceneCanvas.ctx);
  skyline.drawWindows(sceneCanvas.ctx);
  skyline.updateBuildings(frameSpeedFactor);

  // fade the scene once the moon has gone beyond the bounds of the screen
  if (moon.y > _h || moon.x > _w + 40 || moon.x < -40 && fadeOut < 1) {
    sceneCanvas.ctx.fillStyle = 'rgba(0,0,0,' + fadeOut + ')';
    sceneCanvas.ctx.fillRect(0, 0, _w, _h);
    fadeOut += 0.001;
  }

  // completely regenerate the scene once the fade reaches 1 (fully faded out)
  if (fadeOut >= 1) {
    moon = new Moon(Math.round(rng.value() * (_w / 5)), -10, 0.1)
    starfield = new Starfield(260);
    shootingStarController = new ShootingStarController();
    skyline = new Skyline();

    fadeOut = 0;
  }

  window.requestAnimationFrame(draw);
}

window.requestAnimationFrame(draw);