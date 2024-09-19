const frame = document.getElementById('frame');
const ctx = frame.getContext("2d");
const selectableColors = document.getElementsByClassName('color-selection__color');
const canvasWrapper = document.getElementsByClassName('canvas-wrapper')[0];
const canvasSize = document.getElementById('canvas-size');
const canvasSizeLabel = document.getElementById('canvas-size-label');

let selectedColor = 3;

// let defaultColors = [0,1,2,3,4,5,5,2,3];
let defaultColors = Array(9).fill(0);


const detectHit = (x, y, obj, objSize) => {
  // Only find obj if the click is in bounds
  if ((y < obj.y || y > obj.y + objSize) || (x < obj.x || x > obj.x + objSize)) return false;
  
  // console.log("Hit:", obj);
  return true;
}

const changeTileColor = (x, y, wholeCube = false) => {
  // Only find a cube if the click is in bounds
  const hitCube = cubes.find((cube) => detectHit(x, y, cube, cubeSize));
  
  if (!hitCube) return;
  
  // We need to duplicate the array otherwise it gets rreeaalll funky
  let newColors = [...hitCube.colors]; 

  // Detect tile
  if (wholeCube) {
    newColors = Array(9).fill(selectedColor);
  } else {
    const hitTile = hitCube.tiles.find((tile) => detectHit(x, y, tile, tileSize));  
    if (!hitTile) return;
    newColors[hitTile.index] = selectedColor;
  }
 
  hitCube.colors = newColors;
  hitCube.drawCube();
}

const findColor = (colorCode) => {
  switch(colorCode) {
    case 0:
      return "#FFF"; // white; 
      break;
    case 1:
      return "#ffeb3b"; // yellow
      break;
    case 2:
      return "#2dc63a"; // green 
      break;
    case 3:
      return "#ff6200"; // orange 
      break;
    case 4:
      return "#e20b0b"; // red
      break;
    case 5:
      return "#1f3bd9"; // blue 
      break;
    default:
      return "#FFF";
  }
}

const handleColorSelect = (colorEl, colorId) => {
  selectedColor = colorId;
  
  // Remove selected class from elements
  for (let el of selectableColors) {
    el.classList.remove('selected');
  }
  
  colorEl.classList.add('selected');
}

let drawingActive = false;

// DOM interaction setup / event listeners
frame.addEventListener('mousedown', () => {
  drawingActive = true;
});

frame.addEventListener('mouseup', () => {
  drawingActive = false;
});

frame.addEventListener('click', (evt) => {
  const x = evt.pageX - frame.offsetLeft;
  const y = evt.pageY - frame.offsetTop;
  changeTileColor(x, y, evt.altKey);
});

frame.addEventListener('mousemove', (evt) => {
  if (!drawingActive) return;
  const x = evt.pageX - frame.offsetLeft;
  const y = evt.pageY - frame.offsetTop;
  changeTileColor(x, y, evt.altKey);
});

for (let c of selectableColors) {
  const colorId = parseInt(c.dataset.colorId, 10);
  c.style.backgroundColor = findColor(colorId);
  c.onclick = (evt) => {
    if (evt.altKey) {
      resetFrame(colorId);
    } else {
      handleColorSelect(evt.target, colorId) 
    }
  };
  if (selectedColor === colorId) {
    c.classList.add('selected');
  }
}

// Stop issue where drawing continues if mouse leaves frame whilst active 
frame.addEventListener('mouseover', (evt) => {
  if (evt.buttons === 0) {
    drawingActive = false;
  };
}); 

// Touch event listeners
// frame.addEventListener('touchstart', (evt) => {
//   evt.target.style.touchAction = evt.touches.length === 1 ? "none" : "";
// });

// frame.addEventListener('touchend', (evt) => {
//   evt.target.style.touchAction = "";
// });

frame.addEventListener('touchmove', (evt) => {
  const x = evt.touches[0].pageX - frame.offsetLeft;
  const y = evt.touches[0].pageY - frame.offsetTop;
  changeTileColor(x, y, evt.altKey);
});

// Cubes consist of an array of 9 ints representing a colour e.g.:
// [0, 1, 2,
//  3, 4, 5,
//  0, 1, 2]
// Colour options: white, yellow, green, orange, red, blue

// const dpr = window.devicePixelRatio;
let cubeCols = localStorage.getItem('lastSetColumns') || 6;

if (cubeCols !== 6) {
  canvasSize.value = cubeCols;
  canvasSizeLabel.innerText = `${cubeCols}x${cubeCols}`;
}

let computedFrameWidth = frame.getBoundingClientRect().width;
let cubeSize = computedFrameWidth / cubeCols;
let tileSize = cubeSize / 3;

// Dynamically size canvas
frame.width = frame.height = (cubeCols * cubeSize);

const handleResize = () => {
  computedFrameWidth = frame.getBoundingClientRect().width;
  cubeSize = computedFrameWidth / cubeCols;
  tileSize = cubeSize / 3;

  frame.width = frame.height = (cubeCols * cubeSize);

  if (cubes.length === 0) {
   resetFrame(0);
  } else {
    const cubeColorData = cubes.map(cube => cube.colors);
    drawFrame(cubeColorData);
  }
};

const resizeFrameByColumns = (cols) => {
  cubeCols = parseInt(cols, 10);
  handleResize();
  drawFrame();

  canvasSizeLabel.innerText = `${cubeCols}x${cubeCols}`;
  canvasSize.value = cubeCols;

  localStorage.setItem('lastSetColumns', cubeCols);
};

// Recalculate and redraw on a window resize event
// TODO: Add debounce
window.addEventListener('resize', () => {
  handleResize();
});


// Handle dynamic canvas size
canvasSize.addEventListener('input', (evt) => {
  resizeFrameByColumns(evt.target.value);
});


let cubes = []; 

const drawFrame = (cubeColorData = []) => {
  cubes = [];

  let cubesToLoadCount = cubeColorData.length > 0 ? cubeColorData.length : cubeCols ** 2;

  let currentRow = 0;
  let currentCol = 0;

  for (let i = 0; i < cubesToLoadCount; i++) {
    if (i !== 0 && i % cubeCols === 0) {
        currentCol = 0;
        currentRow++;
    }

    const cubeColor = cubeColorData.length > 0 ? cubeColorData[i] : defaultColors;
    const posX = currentCol * cubeSize;
    const posY = currentRow * cubeSize;
    const cube = new Cube(posX, posY, currentRow, currentCol, cubeColor, i);

    cubes.push(cube);
    cube.drawCube();

    currentCol++;
  };
}

class Cube {
  constructor(x, y, row, column, colors, cubeIndex) {
    this.x = Math.round(x);
    this.y = Math.round(y);
    this.row = row;
    this.column = column;
    this.colors = colors;
    this.cubeIndex = cubeIndex;
    this.tiles = [];
  }

  static calcXPos(x, i) {
    const tilePosition = x;
    if ([0,3,6].includes(i)) return tilePosition;
    if ([1,4,7].includes(i)) return tilePosition + tileSize;
    if ([2,5,8].includes(i)) return tilePosition + (2 * tileSize);
  }

  static calcYPos(y, i) {
    const tilePosition = y;
    if (i < 3) return tilePosition;
    if (i < 6) return tilePosition + tileSize;
    if (i < 9) return tilePosition + (2 * tileSize);
  }

  drawCube() {
    this.tiles = [];
    this.colors.forEach((color, index) => {
      const tile = new Tile(Cube.calcXPos(this.x, index), Cube.calcYPos(this.y, index), color, index);
      tile.draw();
      this.tiles.push(tile);
    });

    ctx.strokeStyle = "black";
    ctx.lineWidth = 3;
    ctx.strokeRect(this.column * cubeSize, this.row * cubeSize, cubeSize, cubeSize);
  } 
}

class Tile {
  constructor(x, y, color, index) {
    this.x = Math.round(x);
    this.y = Math.round(y);
    this.color = color;
    this.index = index;
  }

  draw() {
    ctx.fillStyle = findColor(this.color);
    ctx.fillRect(this.x, this.y, tileSize, tileSize);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;
    ctx.strokeRect(this.x, this.y, tileSize, tileSize);
  }  
 }

const exportImage = () => {
  const frameImageUrl = frame.toDataURL();

  const link = document.createElement('a');
  link.download = `mosaic-cube-export-${Date.now()}.png`;
  link.href = frameImageUrl
  link.click();
}

const resetFrame = (colorId = 0) => {
  cubes = [];
  defaultColors = Array(9).fill(colorId);
  drawFrame();
} 

let savedData = [];

const saveFrame = (saveDataToLoad = null) => {
  const cubesData = saveDataToLoad || cubes;

  // Pull just the color data for each cube into an array
  const cubeColorData = cubesData.map(cube => cube.colors);

  // const base64ify = btoa(JSON.stringify(cubeColorData));

  // Stringify so it's easier to encode to base64
  const stringifiedData = JSON.stringify(cubeColorData);
  return stringifiedData;
}

const removeSaveState = (el, uuid) => {
  // remove the DOM element
  el.parentNode.parentNode.removeChild(el.parentNode);

  // remove item from localStorage
  savedData = savedData.filter(save => save.uuid !== uuid);
  localStorage.setItem('saves', JSON.stringify(savedData));
}

const createSaveState = (saveDataToLoad = null) => {
  const parent = document.getElementById('saves');
  const wrapper = document.createElement('div');
  const removeButton = document.createElement('button');
  const img = document.createElement('img');
  
  wrapper.className = "save-state-item";

  removeButton.innerHTML = 'X';
  removeButton.onclick = () => removeSaveState(img, uuid);
  removeButton.className = 'save-state-item__remove';  

  let colorData = '';
  let imgData = '';
  let uuid = '';
  let cols = cubeCols;

  if (saveDataToLoad) {
    colorData = saveDataToLoad.colors;
    imgData = saveDataToLoad.thumbnail;
    uuid = saveDataToLoad.uuid;
    cols = saveDataToLoad.columns || 6;
  } else {
    colorData = saveFrame();
    imgData = frame.toDataURL();
    uuid = Math.floor(Math.random()*1e15).toString(36);

    savedData.push({uuid, thumbnail:imgData, colors:colorData, columns: cubeCols});
    saveToLocalStorage();
  }

  img.src = imgData; 
  img.className = "save-state-item__thumbnail";
  img.dataset.uuid = uuid;

  img.addEventListener('click', () => {
    loadFrame(colorData, cols)
  });

  wrapper.append(img);
  wrapper.append(removeButton);
  parent.append(wrapper);
}

const saveToLocalStorage = () => {
  localStorage.setItem('saves', JSON.stringify(savedData));
}

const loadSaves = () => {
  const localSaves = localStorage.getItem('saves');

  if (localSaves) {
    const savesArray = JSON.parse(localSaves);
    savedData.push(...savesArray);
    savesArray.forEach(loadedSave => {
      createSaveState(loadedSave, false);
    });
  }
}

const loadFrame = (stringifiedColorData, columns) => {
  // const colorDataArray = JSON.parse(atob(base64ColorData));
  const colorDataArray = JSON.parse(stringifiedColorData);
  resizeFrameByColumns(columns);
  drawFrame(colorDataArray);
}

// Doesn't work correctly on iPhone/iPad due to swipe down to exit
// const toggleFullscreen = () => {
//  if (!document.fullscreenElement || !document.webkitFullscreenElement ) {
//    canvasWrapper.requestFullscreen() || canvasWrapper.webkitRequestFullscreen();
//  } else if (document.exitFullscreen || document.webkitExitFullscreen) {
//    document.exitFullscreen() || document.webkitExitFullscreen();
//  }
//}

// TODO:

const init = () => {
  drawFrame();
  loadSaves();
}

init();

