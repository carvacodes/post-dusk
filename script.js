let myCanvas = document.getElementById('myCanvas'),
canDraw = myCanvas.getContext('2d');
//Create vars to control the width and height of the canvas
let maxX = innerWidth;
let maxY = innerHeight;
let bldgSizeFactor = Math.ceil(innerWidth / 170);
//This function sets the maxX and maxY values to the max width and height of the window
let resizeFunc = function(){
    maxX = window.innerWidth;
    maxY = window.innerHeight;
    myCanvas.width = maxX;
    myCanvas.height = maxY;
};

//Size the canvas to the screen on load
onload = resizeFunc;
//Reload the screen, resulting in a new skyline
onresize = function(){
  resizeFunc;
};

//Create starfield array
//First define star prototype
class Star {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}
//Now create an empty array and loop through it to fill it with Star objects
let starArray = [];
for (let i = 0; starArray.length < 260; i++) {
    let myX = Math.ceil(Math.random()*maxX),
    myY = Math.ceil(Math.random()*maxY);
    starArray.push(new Star (myX,myY));
}

//Create building array
//First define building prototype
class Building {
  constructor(x, y, w, h, winHeight, triTop) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.winHeight = winHeight;
    this.triTop = triTop;
  }
}

let totalWidth = 0,  //Define totalWidth variable to stop creating buildings once the total width is greater than maxX
towerNum = 0,        //towerNum will limit the number of red-dot towers that can be created
lastBuildHeight = 0, //lastBuildHeight will ensure that two buildings of the same height are not adjacent to one another
buildingArray = [];  //Now create an empty array and loop through it to fill it with Building objects
for (let i = 0; totalWidth < maxX; i++) {
    let myWinHeight = (Math.random() < 0.1) ? 20 : 10;
    let myH = Math.ceil(Math.random() * 15) * myWinHeight;
    let myW;
    let myX;
    let myY;
    let myTop;
    //Check if height needs to be recalculated
    if (myH === lastBuildHeight) {
        myH = Math.ceil(Math.random() * 15) * myWinHeight;
    }
    myW = Math.ceil(Math.random() * bldgSizeFactor) * bldgSizeFactor;
    //Check if width needs to be recalculated
    if (myW == bldgSizeFactor && towerNum < 3) {
        myW = Math.ceil(Math.random() * bldgSizeFactor) * bldgSizeFactor;
    }
    if (myW <= bldgSizeFactor) {
        myH += 40;
        towerNum += 1;
    }
    myX = totalWidth;
    myY = maxY - myH;
    myTop = (Math.random() < 0.1 && myW > bldgSizeFactor) ? 1 : 0;
    buildingArray.push(new Building (myX, myY, myW, myH, myWinHeight, myTop));
    totalWidth += myW;
    lastBuildHeight = myH;
}

//Create window array
//First define window prototype
class Windowlight {
  constructor(x, y, lit, tall) {
    this.x = x;
    this.y = y;
    this.lit = lit;
    this.tall = tall;
  }
}

//Create an array of windows and fill it
let windowLightArray = [];
for (let i = 0; i < buildingArray.length; i++) {
    if (buildingArray[i].w > bldgSizeFactor) {
        for (let j = 0; j < buildingArray[i].w; j += bldgSizeFactor) {
            for (let k = 0; k < buildingArray[i].h; k += buildingArray[i].winHeight) {
                if (Math.random() < 0.1) {
                    let myX = (buildingArray[i].x + j) + 1,
                    myY = (buildingArray[i].y + k) + 1;
                    windowLightArray.push(new Windowlight(myX, myY, 1, buildingArray[i].winHeight));
                }
                else {
                    let myX = (buildingArray[i].x + j) + 1,
                    myY = (buildingArray[i].y + k) + 1;
                    windowLightArray.push(new Windowlight(myX, myY, 0, buildingArray[i].winHeight));
                }
            }
        }
    }
}

//Create a prototype for red dots
class RedDot {
  constructor(x, y, myCounter) {
    this.x = x;
    this.y = y;
    this.myCounter = Math.ceil(Math.random() * 50);
  }
}
//Create an array of red dots for towers of width 10 or less
let dotArray = [];

for (let i = 0; i < buildingArray.length; i++) {
    if (buildingArray[i].w == 10) {
        let myX = buildingArray[i].x + 5,
        myY = buildingArray[i].y - 5;
        dotArray.push(new RedDot (myX,myY));
    }
}

//Create the moon
let moonX = Math.ceil(Math.random() * innerWidth / 5);
let moonY = -10;
let moonDir = 0.05;
    
class ShootingStar {
  constructor(x, y, size = 1) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.speed = 8 - size;
  }
}

//Create the shooting stars
let shootingStarsArray = [];

let shootingStar = new ShootingStar(Math.ceil(Math.random() * maxX), -10);
shootingStarsArray.push(shootingStar);

//Set variables to control the background color
let bgTop = moonY / maxY;
let fadeOut = 0;    

document.addEventListener('click', function(e){
  e.preventDefault();
  shootingStarsArray.push(new ShootingStar(e.clientX, e.clientY, Math.ceil(Math.random() * 4)));
});

function draw() {
    canDraw.clearRect(0,0,maxX,maxY);
    //Draw the backgrounds
    let bgGrad = canDraw.createRadialGradient(moonX, moonY, 0, moonX, moonY, Math.max(innerWidth, innerHeight));
    bgGrad.addColorStop(0, 'rgb(60,60,120)');
    bgGrad.addColorStop(1, 'rgb(5,5,15)');
    canDraw.fillStyle = bgGrad;
    canDraw.fillRect(0,0,maxX,maxY);
  	bgTop = moonY / maxY;
    
    //Draw starfield
    for (let i = 0; i < starArray.length; i++) {
        canDraw.globalAlpha = 1 - (Math.random()/1.5);
        canDraw.fillStyle = "#FAF";
        canDraw.fillRect(starArray[i].x,starArray[i].y,1,1);
    }
    canDraw.globalAlpha = 1;
    
    //Shooting star drawing and logic
    let starRand = Math.random();
    if (starRand <= 0.0001) {
      shootingStarsArray.push(new ShootingStar(Math.ceil(Math.random() * maxX), -10, Math.ceil(Math.random() * 4)));
    } else if (starRand <= 0.001) {
      shootingStarsArray.push(new ShootingStar(Math.ceil(Math.random() * maxX), -10));
    }

    canDraw.strokeStyle = "#FFF";
    shootingStarsArray.forEach(star => {
      let index = shootingStarsArray.indexOf(star);

      // if stars are particularly large/slow, draw a halo around them, with less alpha as they get closer to the center of the screen
      if (star.size >= 3) {
        let starGrad = canDraw.createRadialGradient(star.x, star.y, 0, star.x, star.y, 5 * star.size);
        starGrad.addColorStop(0, 'rgba(255,255,255,' + 0.1 * star.size + ')');
        starGrad.addColorStop(1, 'rgba(255,255,255,0)');
        canDraw.fillStyle = starGrad;
        canDraw.fillRect(star.x - 10 * star.size / 2, star.y - 10 * star.size / 2, 30 * star.size, 30 * star.size);
      }

      canDraw.lineWidth = star.size;
      canDraw.beginPath();
      canDraw.moveTo(star.x - star.speed, star.y - star.speed)
      canDraw.lineTo(star.x, star.y)
      canDraw.stroke();

      if (star.x > maxX + 50 || star.x < -20 || star.y > maxY + 50) {
          shootingStarsArray.splice(index, 1);
      }
      else {
          star.x += star.speed;
          star.y += star.speed;
      }
    });
    
    //Draw moon and move it
    let moonGrad = canDraw.createRadialGradient(moonX, moonY, 0, moonX, moonY,40);
    moonGrad.addColorStop(0.28, 'rgba(255,225,255,1)');
    moonGrad.addColorStop(0.88, 'rgba(248,200,255,1)');
    moonGrad.addColorStop(1, 'rgba(248,200,255,0)');
    canDraw.fillStyle = moonGrad;
    canDraw.beginPath();
    canDraw.arc(moonX,moonY,40,0,Math.PI*2,0)
    canDraw.fill();
    moonX += moonDir;
    if (moonY > maxY + 50 || moonX > maxX + 50 || moonX < -42) {
        moonY = moonY;
    }
    else {
        moonY += 0.05;
    }
    
    //Draw buildings - dynamic foreground
    for (let k = 0; k < buildingArray.length; k++) {
      canDraw.fillStyle = "#000";
      canDraw.fillRect(buildingArray[k].x,buildingArray[k].y,buildingArray[k].w,buildingArray[k].h);
      if (buildingArray[k].triTop === 1) {
          canDraw.beginPath();
          canDraw.moveTo(buildingArray[k].x,buildingArray[k].y);
          canDraw.lineTo(buildingArray[k].x + buildingArray[k].w / 2, buildingArray[k].y - buildingArray[k].winHeight * 4);
          canDraw.lineTo(buildingArray[k].x + buildingArray[k].w, buildingArray[k].y);
          canDraw.fill();
      }
    }
    
    //Draw windows - dynamic foreground
    for (let j = 0; j < windowLightArray.length; j++) {
        if (windowLightArray[j].lit) {
            canDraw.fillStyle = "#EE9";
            canDraw.fillRect(windowLightArray[j].x,windowLightArray[j].y,6,windowLightArray[j].tall - 4);
            if (Math.random() < 0.00002) {
                windowLightArray[j].lit = 0;
            }
        }
        else if (windowLightArray[j].lit === 0) {
            canDraw.fillStyle = "#020202";
            canDraw.fillRect(windowLightArray[j].x,windowLightArray[j].y,6,windowLightArray[j].tall - 4);
            if (Math.random() < 0.00001) {
                windowLightArray[j].lit = 1;
            } 
        }
    }
    //Draw the red dot on towers with a width of 10
    for (let m = 0; m < dotArray.length; m++) {
        if (dotArray[m].myCounter % 100 > 50) {
            canDraw.fillStyle = "#F00";
        }
        else {
            canDraw.fillStyle = "#010203";
        }
        canDraw.beginPath();
        canDraw.arc(dotArray[m].x + 0.5,dotArray[m].y,2,0,Math.PI*2);
        canDraw.fill();
        dotArray[m].myCounter++;
    }
    canDraw.globalAlpha = 1;
  	if (moonY > maxY || moonX > maxX + 40 || moonX < -40 && fadeOut < 1) {
      canDraw.fillStyle = 'rgba(0,0,0,' + fadeOut + ')';
      canDraw.fillRect(0,0,maxX,maxY);
      fadeOut += 0.001;
    }
  	if (fadeOut >= 1) {
      fadeOut = 0;
      moonY = -50;
      moonX = 100 + (Math.random() * (innerWidth - 100));
    }
  	window.requestAnimationFrame(draw);
}

draw();