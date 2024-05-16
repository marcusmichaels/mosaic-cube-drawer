const frame = document.getElementById('frame');
const ctx = frame.getContext("2d");
const selectableColors = document.getElementsByClassName('color-selection__color');

let selectedColor = 3;

let defaultColors = [0,1,2,3,4,5,5,2,3];

const detectHit = (x, y, obj, objSize) => {
  // Only find obj if the click is in bounds
  if ((y < obj.y || y > obj.y + objSize) || (x < obj.x || x > obj.x + objSize)) return false;
  
  console.log("Hit:", obj);
  return true;
}

const changeTileColor = (x, y) => {
  // Only find a cube if the click is in bounds
  const hitCube = cubes.find((cube) => detectHit(x, y, cube, cubeSize));
  
  if (!hitCube) return;
  
  // We need to duplicate the array otherwise it gets rreeaalll funky
  const newColors = [...hitCube.colors]; 

  // Detect tile
  const hitTile = hitCube.tiles.find((tile) => detectHit(x, y, tile, tileSize));  
  newColors[hitTile.index] = selectedColor;
 
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
  console.log(x, y);
  changeTileColor(x, y);
});

frame.addEventListener('mousemove', (evt) => {
  if (!drawingActive) return;
  const x = evt.pageX - frame.offsetLeft;
  const y = evt.pageY - frame.offsetTop;
  console.log(x, y);
  changeTileColor(x, y);
});

for (let c of selectableColors) {
  const colorId = parseInt(c.dataset.colorId, 10);
  c.style.backgroundColor = findColor(colorId);
  c.onclick = (evt) => { handleColorSelect(evt.target, colorId) };
  if (selectedColor === colorId) {
    c.classList.add('selected');
  }
}
 

// Cubes consist of an array of 9 ints representing a colour e.g.:
// [0, 1, 2,
//  3, 4, 5,
//  0, 1, 2]
// Colour options: white, yellow, green, orange, red, blue

const dpr = window.devicePixelRatio;
const computedFrameWidth = frame.getBoundingClientRect().width;

const cubeCols = 6;
const cubeSize = 90;
//const cubeSize = cubeCols * computedFrameWidth;
const tileSize = cubeSize / 3;

// Dynamically size canvas
frame.width = frame.height = (cubeCols * cubeSize);

let cubes = []; 

const drawCanvas = () => {
  let currentRow = 0;
  let currentCol = 0;

  for (let i = 0; i < (cubeCols ** 2); i++) {
    if (i !== 0 && i % cubeCols === 0) {
        currentCol = 0;
        currentRow++;
    }

    const posX = currentCol * cubeSize;
    const posY = currentRow * cubeSize;
    const cube = new Cube(posX, posY, currentRow, currentCol, defaultColors, i);

    cubes.push(cube);
    cube.drawCube(); 
    
    currentCol++;
  };
}

class Cube {
  constructor(x, y, row, column, colors, cubeIndex) {
    this.x = x;
    this.y = y;
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
    this.x = x;
    this.y = y;
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
  link.download = 'filename.png';
  link.href = frameImageUrl
  link.click();
}

const clearFrame = () => {
  cubes = [];
  defaultColors = [0,0,0,0,0,0,0,0,0];
  drawCanvas();
} 

// TODO:
// ALT+Click a color to make the whole frame that color
// ALT+Click a cube to make the whole cube that color
// Make it look nicer




drawCanvas();