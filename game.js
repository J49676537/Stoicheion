var shapeList = [
	[ [2,2]							],	// 1
	[ [2,2],[3,2]					],	// 2
	[ [1,2],[2,2],[3,2]				],	// 3|
	[ [1,2],[2,2],[2,3]				],	// 3L
	[ [1,2],[2,2],[3,2],[4,2]		],	// 4|
	[ [1,2],[2,2],[3,2],[3,3]		],	// 4L
	[ [1,2],[2,2],[2,3],[3,2]		],	// 4T
	[ [1,2],[2,2],[2,3],[3,3]		],	// 4S
	[ [1,2],[1,3],[2,2],[2,3]		],	// 4□
	[ [0,2],[1,2],[2,2],[3,2],[4,2] ],	// 5|
	[ [1,2],[2,2],[3,2],[4,2],[4,3] ],	// 5L
	[ [1,2],[2,2],[3,2],[3,3],[4,2] ],	// 5|.
	[ [1,2],[2,2],[2,3],[3,2],[3,3] ],	// 5b
	[ [1,2],[1,3],[2,2],[3,2],[3,3] ],	// 5C
	[ [1,1],[1,2],[1,3],[2,2],[3,2] ],	// 5T
	[ [1,2],[2,1],[2,2],[3,2],[3,3] ],	// 5-L
	[ [1,1],[1,2],[2,2],[3,2],[3,3] ],	// 5S
	[ [1,2],[2,1],[2,2],[2,3],[3,2] ],	// 5+
	[ [1,1],[2,1],[3,1],[3,2],[3,3] ],	// 5L
	[ [1,2],[2,2],[3,2],[3,3],[4,3] ],	// 5|,
	[ [1,1],[2,1],[2,2],[3,2],[3,3] ]	// 5Z
];

function main(){
	// Shape Setup - Assign Background Url Space in Array [x, y, bg]
	for (var i=0; i<shapeList.length; i++){
		for (var j=0; j<shapeList[i].length; j++){
			shapeList[i][j].push("");
		}
	}

	// Draw Gameboard
	var board = document.getElementById("board");
	for (var r=0; r<5; ++r){
		var tr = board.appendChild(document.createElement("tr"));
		for (var c=0; c<5; ++c){
			var cell = tr.appendChild(document.createElement("td"));
			// id equals coordinate relative to the center
			if (r-2 >= 0){cell.id = "+" + (r-2);}
				else{cell.id = "" + (r-2);}
			if (c-2 >= 0){cell.id += "+" + (c-2);}
				else{cell.id += (c-2);}
			// add functions and cell contents
			cell.addEventListener("mouseover", function(){shapeHover(this.id);});
			cell.addEventListener("mouseout", clearHover);
			cell.addEventListener("click", function(){placeShape(this.id);});
			// cell +Num / plusFactor / overlap counter (see placeShape)
			cell.innerHTML = '+0';
		}
	}

	// Draw Inventory of Five Random Shapes
	var gridList = document.getElementsByClassName("grid");
	for (var i=0; i<5; i++){
		gridList[i].addEventListener("click", selectGrid);
		for (var r=0; r<5; ++r){
			var tr = gridList[i].appendChild(document.createElement("tr"));
			for (var c=0; c<5; ++c){
				tr.appendChild(document.createElement("td"));
			}
		}
		// draw a new random shape in each grid
		drawShape(deepCopyShape(), gridList[i].id);
	}
}

// Select Shape on Inventory Grid Click
function selectGrid(){
	var gridList = document.getElementsByClassName("grid");
	// unselect if already selected
	if (this.id.slice(-1) === "S"){
		this.id = this.id.slice(0,-1);
		this.style.backgroundColor = "";
	} else{
		for (var i=0; i<gridList.length; i++){
			if (gridList[i].id.slice(-1) === "S"){
				gridList[i].id = gridList[i].id.slice(0,-1);
				gridList[i].style.backgroundColor = "";
			}
		}
		this.id += "S";
		this.style.backgroundColor = "rgba(255, 255, 255, 0.75)";
	}
}

// Return Selected Grid ID
function getSelected(){
	var gridList = document.getElementsByClassName("grid");
	for (var i=0; i<gridList.length; i++){
		if (gridList[i].id.slice(-1) === "S"){
			return gridList[i].id;
		}
	}
}

// Deep Copy Random Shape from Shape List & Add Random Background Image per Vector
// WARNING: this function is nested in loops
function deepCopyShape(){
	var randShape = shapeList[Math.floor(Math.random() * (shapeList.length))];
	var shapeClone = [];
	for (var j=0; j<randShape.length; j++){
		shapeClone[j] = randShape[j].slice();
		var randNum = Math.ceil(Math.random() * 4);
		shapeClone[j][2] = "url('img/element/element0" + randNum + ".png')";
	}
	return shapeClone;
}

// ------------------------------------------------------------------------------------------------------------------------------------------------------
// Switch String to Comma Separated Number & Back
function switchIntStr(input){
	if (typeof input === "string"){
		return parseInt(input.replace(",", "").replace("+", ""));
	}
	if (typeof input === "number"){
		return input.toLocaleString();
	}
}

// Error Message Cloning to Replay Animation & Sound
function errorMessage(messageText, audio){
	var elm = document.getElementById("message");
	var newMessage = elm.cloneNode(true);
	newMessage.innerHTML = messageText;
	elm.parentNode.replaceChild(newMessage, elm);
	playAudio(audio);
}

// Replace Selected Shape (New Shape)
function fillGrid(){
	var stock = switchIntStr(document.getElementById("stock").innerHTML);
	if (stock > 0){
		var gridId = getSelected();
		var newShape = deepCopyShape();
		try{
			drawShape(newShape, gridId);
			playAudio("whip");
			document.getElementById("stock").innerHTML = switchIntStr(stock - 1);
		} catch(e){
			errorMessage("No Shape Selected!", "bite");
		}
	} else{
		errorMessage("No More Shapes!", "bite");
	}
}

// Draw New Shape in Selected Invetory Grid - Called by NewShape/Rotate/Mirror
// WARNING: this function is nested in loops
function drawShape(vectors, gridId){
	for (var r=0; r<5; r++){
		for (var c=0; c<5; c++){
			document.getElementById(gridId).rows[r].cells[c].style.backgroundImage = "";
		}
	}
	for (var j=0; j<vectors.length; j++){
		document.getElementById(gridId).rows[ vectors[j][0] ].cells[ vectors[j][1] ].style.backgroundImage = vectors[j][2];
	}
}

// Rotate Selected Shape
function rotateGrid(){
	var gridId = getSelected();
	try {var gridVectors = getSelectedVectors(gridId);}
		catch(e){errorMessage("No Shape Selected!", "bite");}
	var newVectors = rotateVectors(gridVectors);
	drawShape(newVectors, gridId);
	playAudio("click");
}

// Flip Selected Shape
function flipGrid(){
	var gridId = getSelected();
	try {var gridVectors = getSelectedVectors(gridId);}
		catch(e){errorMessage("No Shape Selected!", "bite");}
	var newVectors = flipVectors(gridVectors);
	drawShape(newVectors, gridId);
	playAudio("click");
}

// Return Vector List & Background Images (Elements) of Selected Shape
function getSelectedVectors(gridId){
	var vectors = [];
	for (var r=0; r<5; r++){
		for (var c=0; c<5; c++){
			if (document.getElementById(gridId).rows[r].cells[c].style.backgroundImage !== ""){
				vectors.push([r, c, document.getElementById(gridId).rows[r].cells[c].style.backgroundImage]);
			}
		}
	}
	return vectors;
}

// ------------------------------------------------------------------------------------------------------------------------------------------------------
// Rotate vectors 90deg relative to the center (2,2), giving new coordinates through matrix multiplication
function rotateVectors(vectors){
	var R = [[0,-1],[1, 0]]; // rotation matrix

	// DEEP copy of vector array - is this actually a deep copy? - doesn't matter it works
	var newVectors = [];
	for (var i=0; i<vectors.length; i++){
		newVectors[i] = [vectors[i][0], vectors[i][1], vectors[i][2]];
	}

	for (var i=0; i<vectors.length; i++){
		// subtract center of rotation
		vectors[i][0] -= 2;
		vectors[i][1] -= 2;
		// matrix multiplication
		newVectors[i][0] = R[0][0] * vectors[i][0] + R[0][1] * vectors[i][1];
		newVectors[i][1] = R[1][0] * vectors[i][0] + R[1][1] * vectors[i][1];
		// add back center of rotation
		newVectors[i][0] += 2;
		newVectors[i][1] += 2;
	}
	return newVectors;
}

// Flip a shape by mirroring the x axis at 2
function flipVectors(vectors){
	newVectors = [];
	for (var i=0; i<vectors.length; i++){	// is there a better way to do this?
		var mirror = 2;	// middle
		if (vectors[i][1] === 0){mirror = 4;}
		if (vectors[i][1] === 1){mirror = 3;}		
		if (vectors[i][1] === 3){mirror = 1;}		
		if (vectors[i][1] === 4){mirror = 0;}		
		newVectors.push([vectors[i][0], mirror, vectors[i][2]]);
	}
	return newVectors;
}

// ------------------------------------------------------------------------------------------------------------------------------------------------------
function shapeHover(position){
	var gridId = getSelected();
	try{var vectors = getSelectedVectors(gridId);}
		catch(e){return;}

	var outside = false;											// if any part of the shape is outside the box
	for (var i=0; i<vectors.length; i++){							// for each element in the array, which contains [x, y, bg]
		var r = vectors[i][0] + Number(position.substring(0,2));	// r = x position of cursor relative to the center
		var c = vectors[i][1] + Number(position.substring(2,4));	// c = y position of cursor relative to the center

		// if (x,y) of shape is inside the board...
		if (r<=4 && r>=0 && c<=4 && c>=0){
			var square = document.getElementById("board").rows[r].cells[c];

			// if the hovered square is NOT filled...
			if (square.id.charAt(4) !== "*"){
				// draw the background image with a white background
				square.style.backgroundColor = "rgba(255, 255, 255, 0.5)";
				square.style.backgroundImage = vectors[i][2];
			}

			// else the square must already be filled, so if it has the same background image...
			// ... you can place same element on top of each other, background turns green to show this
			else if (square.style.backgroundImage === vectors[i][2]){
				square.style.backgroundColor = "rgba(0, 255, 0, 0.5)";
			}
			// ... else have a red background because it can't be placed
			else{
				square.style.backgroundColor = "rgba(255, 0, 0, 0.75)";
			}
		}
		// ... else the shape must have part of it outside the board
		else {outside = true;}
	}

	// second loop to visually indicate when part of the shape is outside the box
	if (outside === true) {
		for (var i=0; i<vectors.length; i++){							// for each element in the array, which contains [x, y, bg]
			var r = vectors[i][0] + Number(position.substring(0,2));	// r = x position of cursor relative to the center
			var c = vectors[i][1] + Number(position.substring(2,4));	// c = y position of cursor relative to the center
			try {
				var square = document.getElementById("board").rows[r].cells[c];
				square.style.borderColor = "rgba(255, 0, 0, 0.75)";
			}
			// ignore cases where the cell is outside
			catch(e) {};
		}
	}

}

function clearHover(){
	for (var r=0; r<5; r++){
		for (var c=0; c<5; c++){
			document.getElementById("board").rows[r].cells[c].style.backgroundColor = "";
			// for when the shape is outside the box
			document.getElementById("board").rows[r].cells[c].style.borderColor = "white";
			// if the background cell is not filled, remove the hover element image
			if (document.getElementById("board").rows[r].cells[c].id.charAt(4) !== "*"){
				document.getElementById("board").rows[r].cells[c].style.backgroundImage = "";
			}
		}
	}	
}

// ------------------------------------------------------------------------------------------------------------------------------------------------------
// Place Selected Shape on Board with Click
function placeShape(position){
	var gridId = getSelected();
	// clicking on the board with nothing selected does nothing
	try{var vectors = getSelectedVectors(gridId);}
		catch(e){return;}

	for (var i=0; i<vectors.length; i++){
		var r = vectors[i][0] + Number(position.substring(0,2));
		var c = vectors[i][1] + Number(position.substring(2,4));
		// check if the shape fits
		if (r>4 || r<0 || c>4 || c<0){return;}
		// check for overlap and if the background images are different
		// a filled square has a * in the Id - e.g. [+2-1*]
		if (document.getElementById("board").rows[r].cells[c].id.charAt(4) === "*" &&
		document.getElementById("board").rows[r].cells[c].style.backgroundImage !== vectors[i][2]){
			return;
		}
	}

	// passed all checks so place the shape (needs to be in a seperate loop) (probably)
	for (var i=0; i<vectors.length; i++){
		var r = vectors[i][0] + Number(position.substring(0,2));
		var c = vectors[i][1] + Number(position.substring(2,4));

		// check the +Num (how many times an element has been stacked/overlapped)
		if (document.getElementById("board").rows[r].cells[c].style.backgroundImage === vectors[i][2]){
			var plusFactor = document.getElementById("board").rows[r].cells[c].innerHTML;
			// make sure +Num can't be more than 2 characters, stops at * innerHTML
			if (plusFactor === "+9" || plusFactor === "*"){
				document.getElementById("board").rows[r].cells[c].innerHTML = "*";
				document.getElementById("board").rows[r].cells[c].style.color = "white";
				document.getElementById("board").rows[r].cells[c].style.textAlign = "center";
				document.getElementById("board").rows[r].cells[c].style.verticalAlign = "middle";
				document.getElementById("board").rows[r].cells[c].style.textShadow = "1px 1px black";
			} else{
				document.getElementById("board").rows[r].cells[c].innerHTML = "+" + (switchIntStr(plusFactor) + 1);
				document.getElementById("board").rows[r].cells[c].style.color = "white";
				document.getElementById("board").rows[r].cells[c].style.textShadow = "1px 1px black";
			}
		}

		// then "draw" shape on the board, if already filled don't add another (*)
		if (document.getElementById("board").rows[r].cells[c].id.charAt(4) !== "*"){
			document.getElementById("board").rows[r].cells[c].id += "*";
		}
	}
	
	// clear the hover color after placing shape
	clearHover();

	// replace the used shape
	newShape = deepCopyShape();
	drawShape(newShape, gridId);
	playAudio("whip");
	document.getElementById(gridId).style.backgroundColor = "";
	document.getElementById(gridId).id = gridId.slice(0,-1);

	// Dynamic Score Calculation
	calculateScore();

	checkGameOver();
}
// ----------------------------------------------------------------------------------------------
function checkGameOver(){
	// stop this function if there is an empty cell
	for (var r=0; r<5; r++){
		for (var c=0; c<5; c++){
			if (document.getElementById("board").rows[r].cells[c].style.backgroundImage === ""){return;}
		}
	}

	// passed checks (board completely full)
	for (var r=0; r<5; r++){
		for (var c=0; c<5; c++){
			// clear the board
			var cell = document.getElementById("board").rows[r].cells[c];
			cell.style.backgroundImage = "";
			if (cell.id.charAt(4) === "*") {cell.id = cell.id.slice(0, -1);}

			document.getElementById("board").rows[r].cells[c].innerHTML = "+0";
			document.getElementById("board").rows[r].cells[c].style.color = "transparent";
		}
	}

	// give one extra shape
	var stock = switchIntStr(document.getElementById("stock").innerHTML);
	document.getElementById("stock").innerHTML = switchIntStr(stock + 1);
}

function calculateScore() {
	var score = 0;
	// for each cell in the game board
	for (var r=0; r<5; r++){
		for (var c=0; c<5; c++){
			// check the plus factor...
			var plusFactor = document.getElementById("board").rows[r].cells[c].innerHTML;
			if (plusFactor === "*") {plusFactor = "+10";}
			// ignore +0 as the formula counts it as one point
			if (plusFactor != "+0") {
				plusFactor = switchIntStr(plusFactor);
				score += Math.pow(plusFactor, plusFactor);
			}
		}
	}
	document.getElementById("score").innerHTML = switchIntStr(score);
}

// ------------------------------------------------------------------------------------------------------------------------------------------------------
function playAudio(id){
	var audio = document.getElementById(id);
	if (audio.paused){audio.play();}
	else{audio.currentTime = 0;}
}

// this function is pretty shit, need to rework it
function toggle(id) {
	if (document.getElementById(id).style.display === "none"){
		document.getElementById(id).style.display = "block";
	}
	else {document.getElementById(id).style.display = "none";}
}

main();