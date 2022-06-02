const { 
  Engine,
  Render,
  Runner,
  World,
  Bodies,
  Body,
  Events
} = Matter;

// number of rows & column cells: 
const cellsHorizontal = 15;
const cellsVertical = 15;

// Maze shape: with any change of width or height, the walls will adjust automatically. 
// Adjusting the width and height to the screen.
const width = window.innerWidth;
const height = window.innerHeight -10;

// unitLength: sets how many units to each side of a cell should be.
const unitLengthX = width / cellsHorizontal;
const unitLengthY = height / cellsVertical;

// creating a new Engine & disabling gravity of the ball:
const engine = Engine.create();
engine.world.gravity.y = 0;

// get access to the world along with that engine created. World comes from this engine.
const { world } = engine;

// Show some content on the screen, and tell the render where and how we want to show our representation.
const render = Render.create({
  element: document.body,
  engine: engine,
  options: {
    // wireframes false set solid colors to the shapes:
    wireframes: false,
    width,
    height
  }
});
Render.run(render);
Runner.run(Runner.create(), engine);

// Walls config: 
// Rectangle - the first 2 args represent the position of the shape in the world (X or Y). The last 2 args represent width and height.
const walls = [
  // top
  Bodies.rectangle(width/2, 0, width, 2, { isStatic: true }),
  // bottom
  Bodies.rectangle(width/2, height, width, 2, { isStatic: true }),
  // left
  Bodies.rectangle(0, height/2, 2, height, { isStatic: true }),
  // right
  Bodies.rectangle(width, height/2, 2, height, { isStatic: true })
];
// Adding the 4 walls:
World.add(world, walls);

// Maze generation nice aproach.
// Take some array and randomly reorder all the elements:
const shuffle = (arr) => {
  // get the length of the array & assign it to a variable:
  let counter = arr.length;

  // set up a loop that we are going to run until counter is greater than 0.
  while (counter > 0) {
    // finding a RANDOM element inside of the array:
    const index = Math.floor(Math.random() * counter);
    // And then decrease the counter variable by 1:
    counter--;
    // Swap the elements to randomize the order that are at the array, at element, at index of index, or at index of counter. It swap each element at least once.
    const temp = arr[counter];
    arr[counter] = arr[index]; // it updates the value at index of counter to arr[index]
    arr[index] = temp; // it updates the element at index to be whatever was previously at counter.
  }
  return arr;
};

// Replacing each null elements with the map() statement.
// The first Array() of each one modifies the rows, the second modifies the columns.
const grid = Array (cellsVertical)
  .fill(null)
  .map(() => Array (cellsHorizontal).fill(false));

const verticals = Array (cellsVertical)
  .fill(null)
  .map(() => Array (cellsHorizontal - 1).fill(false));

const horizontals = Array (cellsVertical - 1)
  .fill(null)
  .map(() => Array (cellsHorizontal).fill(false));

// The cell number will be multiply by a random number, and round number down to the lowest integer.
const startRow = Math.floor(Math.random() * cellsVertical);
const startColumn = Math.floor(Math.random() * cellsHorizontal);

// the logic:
const stepThroughCell = (row, column) => {
  // If i have randomly visited a cell at [row, column], return true or false.
  if (grid[row][column]) {
    return;
  }
  // Mark this cell as being visited.
  grid[row][column] = true;

  // Assemble randomly-ordered a list of neighbors:
  // The third element of each array determines what direction we travel:
  const neighbors = shuffle([
    [row - 1, column, 'up'],
    [row, column + 1, 'right'],
    [row + 1, column, 'down'],
    [row, column - 1, 'left']
  ]);

  // For each neighbor... Some Steps:
  // The third variable [direction] destructured here modifies the verticals and horizontals:
  for (let neighbor of neighbors) {
    const [nextRow, nextColumn, direction] = neighbor;
    // 1. See if that neighbor is out of bounds:
    if (
      nextRow < 0 || 
      nextRow >= cellsVertical || 
      nextColumn < 0 || 
      nextColumn >= cellsHorizontal
    ) {
      continue; // means "Skip over the other steps and move on to the next neighbor."
    }

    // 2. Check the neighbor, and if has being visited before move on to next neighbor:
    if (grid[nextRow][nextColumn]) {
      continue;
    }

    // 3. Remove walls from either horizontals or verticals array, it will depend on the direction:
    if (direction === 'left') {
      // access verticals at the same row
      verticals[row][column - 1] = true;
    } else if (direction === 'right') {
      verticals[row][column] = true;
    } else if (direction === 'up') {
      horizontals[row - 1][column] = true;
    } else if (direction === 'down') {
      horizontals[row][column] = true;
    }

    stepThroughCell(nextRow, nextColumn);
  }
};
stepThroughCell(startRow, startColumn);

// Iterating over all the verticals & all the horizontals:

// For every false value found inside those 2 arrays, we need to draw a wall segment onto the canvas.
// Returns an array of of boolean values.
horizontals.forEach((row, rowIndex) => {
  // Receive each boolean value as an arg called 'open':
  row.forEach((open, columnIndex) => {
    if (open) {
      // If true, no need to draw a wall segment:
      return;
    }

    // Creating the wall: If false, need to draw a wall segment 5 args inside a variable to Bodies.rectangle:
    const wall = Bodies.rectangle(
      // X distance:
      (columnIndex * unitLengthX) + unitLengthX/2,
      // Y distance:
      (rowIndex * unitLengthY) + unitLengthY,
      // The wide/width of one cell: each rectangle.
      unitLengthX,
      // The tall/height of one cell: each rectangle.
      3,
      {
        label: 'wall',
        isStatic: true,
        // customizing
        render: {
          fillStyle: 'goldenrod'
        }
      }
    );
    // Adding the walls to the world:
    World.add(world, wall);
  });
});

verticals.forEach((row, rowIndex) => {
  row.forEach((open, columnIndex) => {
    if (open) {
      // If true, return, no need to draw a wall segment:
      return;
    }
    // If false, need to draw a wall segment w/ 5 args inside a variable to Bodies.rectangle:
    const wall = Bodies.rectangle(
      // X distance:
      (columnIndex * unitLengthX) + unitLengthX,
      // Y distance:
      (rowIndex * unitLengthY) + unitLengthY/2,
      // The wide/width of one cell: each rectangle.
      5,
      // The tall/height of one cell: each rectangle.
      unitLengthY,
      {
        label: 'wall',
        isStatic: true,
        // customizing
        render: {
          fillStyle: 'goldenrod'
        }
      }
    );
    // Adding the walls to the world:
    World.add(world, wall);
  });
});

// Goal
const goal = Bodies.rectangle(
  width - unitLengthX / 2,
  height - unitLengthY / 2,
  // Height & Width: scaling rectangle size with the size of the cell. The cell will be 70% of the size of a cell:
  unitLengthX * .7,
  unitLengthY * .5,
  {
    label: 'goal',
    isStatic: true,
    // customizing
    render: {
      fillStyle: 'limegreen'
    }
  }
);
World.add(world, goal);

// Ball
const ballRadius = Math.min(unitLengthX, unitLengthY) / 4;
const ball = Bodies.circle(
  unitLengthX / 2,
  unitLengthY / 2,
  // Radius of the ball: making the ball half the size of the cell:
  ballRadius,
  {
    label: 'ball',
    render: {
      fillStyle: 'turquoise'
    }
  }
);
World.add(world, ball);

// Detecting a key press & setting the velocity.
document.addEventListener('keydown', event => {
  const { x, y } = ball.velocity;
  // up
  if (event.keyCode === 38) {
    Body.setVelocity(ball, { x, y: y - 3 });
  }   
  // right
  if (event.keyCode === 39) {
    Body.setVelocity(ball, { x: x + 3, y });
  }
  // down
  if (event.keyCode === 40) {
    Body.setVelocity(ball, { x, y: y + 3 });
  }
  // left
  if (event.keyCode === 37) {
    Body.setVelocity(ball, { x: x - 3, y });
  }
  
});

// Win Condition: When the ball reaches the goal: Three args: (engine, 'collisionStart', event).
// Second arg: Collision
// Third arg: a callback function called 'event' that will be invoked every time there's a collision between two different shapes inside world.
Events.on(engine, 'collisionStart', event => {
  event.pairs.forEach((collision) => {
    const labels = [ 'ball', 'goal' ];
    if (
      labels.includes(collision.bodyA.label) && 
      labels.includes(collision.bodyB.label) 
    ) {
      // showing the win message after collision. See index.html:
      document.querySelector('.winner').classList.remove('hidden');

      // When reaching the goal, ALL SHAPES FALLS APART: 
      // It's going to accelerate all the different shapes we have down towards the bottom edge of the screen.
      world.gravity.y = 1;
      // Loop over all the shapes inside of the world, try to find all different walls, and then update to 'false' the static flag from each of them.
      world.bodies.forEach((body) => {
        if (body.label === 'wall') {
          Body.setStatic(body, false);
        }
      });
    }
  });
});
