//Constant parameters
const pointDensity = 50
const W = 1 //Weighted A-star weight
const variability = 5
const dissortion = 0
const fadingSpeed = 10

//Global variables
let gridPoints = [] //will be a matrix of points that have coordinates and some resistance value
let gridWidth
let gridHeight
let lines = []
let goalPoint
let startPoint
let foundGoal = false
let openSet = []
let visitedPoints = []
let gScore = {}
let cameFrom = {}

function createGridPoints(density) {
	//Format of the grid poinst matrix will be [x][y] or idk how this works
	gridPoints = []
	for ( let x = density ; x < width; x += density ) {
		let row = [];
		for ( let y = density ; y < height; y += density ) {
			row.push({
				x: x + ( Math.random() - 0.5 ) * dissortion * density,
				y: y + ( Math.random() - 0.5 ) * dissortion * density,
				resistance: Math.random()*variability + 1 //Must be over 1
			})
		}
		gridPoints.push(row);
	}
}

function findNeighbours(point) {
	let x_index
	let y_index
	//find index
	for ( let x = 0; x < gridWidth; x++ ) {
		for ( let y = 0; y < gridHeight; y++ ) {
			if ( gridPoints[x][y] == point ) {
				x_index = x;
				y_index = y;
				break;
			}
		}
	}
	neighbours = []
	if (x_index > 0 ) { neighbours.push(gridPoints[x_index - 1][y_index]) }
	if (x_index < gridWidth - 1 ) { neighbours.push(gridPoints[x_index + 1][y_index]) }
	if (y_index > 0 ) { neighbours.push(gridPoints[x_index][y_index - 1]) }
	if (y_index < gridHeight - 1 ) { neighbours.push(gridPoints[x_index][y_index + 1]) }
	return neighbours
}

function calculateDistance(point1, point2) {
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;
  
  const distance = Math.sqrt(dx**2 + dy**2);
  
  return distance;
}

function rndmIndx(length) {
	return Math.floor(Math.random() * length);
}

function lineBtwPoints( point1, point2 ) {
	let newLine = {
		startX: point1.x,
		startY: point1.y,
		endX: point2.x,
		endY: point2.y,
		intensity: 255
	}
	lines.push(newLine);
}

function reConstructPath(current) { //doesnt work right, it should go straight to start and not trough neighbours
	let totalPath = [ current ]
	let nextPoint = {...current}
	while ( cameFrom[JSON.stringify(nextPoint)] ) {
		nextPoint = cameFrom[JSON.stringify(nextPoint)];
		totalPath.push(nextPoint); //path is reversed but doesnt matter now
	}
	return totalPath
}

function drawPathToStart(point) {
	let path = reConstructPath(point);
	for ( let i = 1; i < path.length; i++ ) {
		lineBtwPoints(path[i-1], path[i])
	}
}

function setup() {
	let cnv = createCanvas(windowWidth, windowHeight);
	createGridPoints(pointDensity);
	gridWidth = gridPoints.length;
	gridHeight = gridPoints[0].length;
	
	//select random goal
	goalPoint = gridPoints[rndmIndx(gridWidth)][rndmIndx(gridHeight)]
	
	// select random starting point
	startPoint = gridPoints[rndmIndx(gridWidth)][rndmIndx(gridHeight)]
	openSet.push({
		point: startPoint,
		priority: 0
	})
	visitedPoints = [startPoint];
	gScore[JSON.stringify(startPoint)] = 0	
}


function draw() {
	background(10);
	
	if (!foundGoal) {
		//do the astar
		//Pop the lowes prio
		openSet.sort( (a,b) => b.priority - a.priority );
		const current = openSet.pop()?.point;
		
		drawPathToStart(current);
		
		if ( current == goalPoint ) {
			foundGoal = true //A-star ends here
		} else {
			//Add neighbor states to the q and draw them here
			const neighbours = findNeighbours(current)
			neighbours.forEach( neighbour => {
				const neighbourcost = calculateDistance(current, neighbour) * neighbour.resistance;
				const neighbour_G = gScore[JSON.stringify(current)] + neighbourcost;
				
				if ( !visitedPoints.includes(neighbour) ||
						neighbour_G < gScore[JSON.stringify(neighbour)] ) {
						
						//Draw line to neighbour
						//lineBtwPoints( current, neighbour )
					
						visitedPoints.push(neighbour);
						cameFrom[JSON.stringify(neighbour)] = {...current};
						gScore[JSON.stringify(neighbour)] = neighbour_G;
						const f_score = neighbour_G + ( calculateDistance(neighbour, goalPoint) * W)
						if(!openSet.find( obj => obj.point == neighbour)) {
							openSet.push({
								point: neighbour,
								priority: f_score
							})
						}
				}
			})
		}
	} else {
		//wait the lines go moustly out and pick a new goal
		if ( lines.length < 10 ) {
			//Reset the algorithm
			foundGoal = false
			startPoint = goalPoint
			visitedPoints = [startPoint];
			goalPoint = gridPoints[rndmIndx(gridWidth)][rndmIndx(gridHeight)]
			openSet = [{
					point: startPoint,
					priority: 0
				}]
			gScore = {}
			gScore[JSON.stringify(startPoint)] = 0	
			cameFrom = {}		
		}
	}		
		
	//Draw lines
	lines.forEach( strk => {
		stroke(strk.intensity)
		line( strk.startX, strk.startY, strk.endX, strk.endY)
		strk.intensity = strk.intensity - fadingSpeed
	})
	
	//remove faded lines
	lines = lines.filter( strk => strk.intensity > 10 )
	
	// circle(startPoint.x, startPoint.y, 10)
	// circle(goalPoint.x, goalPoint.y, 10)

}