var style = {
	strokeColor: '#E4141B',
	strokeWidth: 8,
	strokeCap: 'round'	
};

var lines = [];

function onMouseDown(event) {
	var line = new Path(style);
	line.add(event.point);
	line.add(event.point);
	lines.push(line);
}

function onMouseDrag(event) {
	var line = lines[lines.length - 1];
	line.lastSegment.point = event.point;
}

function onMouseUp(event) {
	console.log("There are " + lines.length + " lines.");
}

