/*global Point, Path, Size, Rectangle, Layer, Group, PointText, project, view*/

// Colors
var blues = [
	"#08519c",
	"#3182bd",
	"#6baed6",
];

var oranges = [
	"#e6550d",
	"#fd8d3c",
	"#fdbe85",
];

// Canvas settings
var margin = 25;
var xAxisLabelMargin = 75;
var safeBox = new Rectangle( view.bounds );
safeBox.width -= margin * 2;
safeBox.height-= margin * 2;
safeBox.center = view.center;

var chartDimension = Math.min(safeBox.width, safeBox.height) - xAxisLabelMargin;

// Chart settings
var chartSize = new Size(chartDimension, chartDimension);
var chartBoundries = new Rectangle( new Point(0, 0), chartSize);
chartBoundries.topCenter = safeBox.topCenter;

//Area to register boundaries of dragging of chart lines
var dragBoundries = new Rectangle(view.bounds.x, chartBoundries.y, view.bounds.width, chartBoundries.height);

var xAxisLabelText = "Quantity";
var yAxisLabelText = "Price";

//Supply and demand lines of chart 
var chartLines = [
	{
		label: "S₀",
		type: "supply",
		start: 0.2,
		end: 0.7,
		color: oranges[0],
		visible: true
	},
	{
		label: "S₁",
		type: "supply",
		start: 0.3,
		end: 0.8,
		color: oranges[2],
		visible: false
	},
	{
		label: "D₀",
		type: "demand",
		start: 0.7,
		end: 0.2,
		color: blues[0],
		visible: true
	},
	{
		label: "D₁",
		type: "demand",
		start: 0.8,
		end: 0.3,
		color: blues[2],
		visible: false
	}
];

// Styles

var chartLineStyle = {
	strokeWidth: 8,
	strokeCap: "round"	
};

var intersectionLineStyle = {
	strokeColor: "#bbbbbb",
	strokeWidth: 4,
	strokeCap: "butt",
	dashArray: [3, 3]
}

var axisLineStyles = {
	strokeColor: "black",
	strokeWidth: 2,
}

var axisLabelStyles = {
	color: "black",
	fontFamily: "'Roboto', 'sans-serif'",
	fontSize: 28
}

var chartLineLabelStyles = {
	fontFamily: "'Roboto', 'sans-serif'",
	fontSize: 36
}

var buttonLabelStyles = {
	fontFamily: "'Roboto', 'sans-serif'",
	fontSize: 20,
	fontWeight: "bold"
}

var intersectionsLayer = new Layer({name: "intersections"});
var axesLayer = new Layer({name: "axes"});
var chartLinesLayer = new Layer({name: "chartLines"});
var chartLineLabelsLayer = new Layer({name: "chartLineLabels"});
var uiLayer = new Layer({name: "ui"});

axesLayer.activate();
createAxes( xAxisLabelText, yAxisLabelText, chartBoundries );
chartLinesLayer.activate();
createChartLines( chartLines, chartBoundries );
chartLineLabelsLayer.activate();
// createChartLineLabels(chartLinesLayer);
intersectionsLayer.activate();
createIntersectionLines( chartLinesLayer, chartBoundries );
uiLayer.activate();
createChartLineButtons( chartLinesLayer );

// Options for selecting objects
var hitOptions = {
	segments: true,
	stroke: true,
	fill: false,
	tolerance: 5,
	match: function (hitResults) {
		return hitResults.item.layer == chartLinesLayer;
	}
};

var selectedSegment, selectedPath;

/* exported onMouseDown */
function onMouseDown(event){
	var hitResults = project.hitTest(event.point, hitOptions);

	//If not hit results nothing to do
	if(!hitResults) {
		return;
	}

	selectedPath = hitResults.item;
	
	if( hitResults.type == 'segment') {
		selectedSegment = hitResults.segment;
	} else if( hitResults.type == 'stroke' ) {
		selectedSegment = null;
	} else {
		selectedPath = null;
	}
}

/* exported onMouseDrag */
function onMouseDrag(event){
	if( event.point.isInside(dragBoundries) ) {
		if(selectedSegment) {
			selectedSegment.point.y = constrain(selectedSegment.point.y + event.delta.y, chartBoundries.top, chartBoundries.bottom);
		} else if(selectedPath) {
			var topEdge = selectedPath.bounds.top + event.delta.y;
			var bottomEdge = selectedPath.bounds.bottom + event.delta.y;

			//Check to make sure part of path doesn't extend beyond the chart area.
			if( topEdge > chartBoundries.top && bottomEdge < chartBoundries.bottom){
				selectedPath.position.y = constrain(selectedPath.position.y + event.delta.y, chartBoundries.top, chartBoundries.bottom);
			}
		}

		if( selectedPath){
			var labelForSelectedPath = selectedPath.parent.children["label"];
			labelForSelectedPath.point.y = selectedPath.lastSegment.point.y;
		}
		

		//Remove and recreate intersections 
		intersectionsLayer.removeChildren();
		intersectionsLayer.activate();
		createIntersectionLines( chartLinesLayer, chartBoundries );

		//Update chart line labels
		// updateChartLineLabels( chartLinesLayer, chartLineLabelsLayer );
	}
}

/* exported onMouseUp */
function onMouseUp(){
	selectedSegment = null;
	selectedPath = null;
}

/**
 * Constrain a given value between a maximum and minimum value
 * @param {Number} value 
 * @param {Number} min 
 * @param {Number} max 
 */
function constrain(value, min, max) {
	return Math.min(Math.max(value, min), max);
}

/**
 * Create layer with lines for charts axis 
 * @param {Rectangle} chartBoundries 
 */
function createAxes( xAxisLabelText, yAxisLabelText, chartBoundries ) {
	var leftAxis = new Path.Line(chartBoundries.topLeft, chartBoundries.bottomLeft);
	leftAxis.style = axisLineStyles;

	var bottomAxis = new Path.Line(chartBoundries.bottomLeft, chartBoundries.bottomRight);
	bottomAxis.style = axisLineStyles;

	createAxisLabels( xAxisLabelText, yAxisLabelText, chartBoundries );
}

/**
 * Create labels for chart axis
 * @param {String} xAxisLabelText 
 * @param {String} yAxisLabelText 
 * @param {Rectangle} chartBoundries 
 */
function createAxisLabels( xAxisLabelText, yAxisLabelText, chartBoundries ){
	var xLabelPosition = new Point(chartBoundries.bottomRight);
	xLabelPosition.y += 64;
	var xAxisLabel = new PointText( xLabelPosition );
	xAxisLabel.style = axisLabelStyles;
	xAxisLabel.justification = "right";
	xAxisLabel.content = xAxisLabelText;

	var yLabelPosition = new Point(chartBoundries.topLeft);
	yLabelPosition.x -= 50;
	yLabelPosition.y += axisLabelStyles.fontSize;
	var yAxisLabel = new PointText( yLabelPosition );
	yAxisLabel.style = axisLabelStyles;
	yAxisLabel.justification = "right";
	yAxisLabel.content = yAxisLabelText;	
}

/**
 * Create the lines of the chart
 * @param {*} chartLines 
 * @param {*} chartBoundries 
 */
function createChartLines( chartLines, chartBoundries ){
	for(var i = 0; i < chartLines.length; i++) {
		var currentLine = chartLines[i];

		var startPoint = getChartPosition(0, currentLine.start, chartBoundries);
		var endPoint = getChartPosition(1.0, currentLine.end, chartBoundries);

		//Create new label
		var labelPosition = new Point(endPoint);
		labelPosition.x += 10;

		var label = new PointText( {
			point: labelPosition,
			name: "label",
			fillColor: currentLine.color,
			content: currentLine.label,
			style: chartLineLabelStyles
		} );

		//Create new path
		var linePath = new Path.Line(startPoint, endPoint);
		linePath.style = chartLineStyle;
		linePath.strokeColor = currentLine.color;
		linePath.name = "path";
		linePath.data = {
			type: currentLine.type
		};

		//Create new group
		var chartLineGroup = new Group([ linePath, label ])
		chartLineGroup.name = currentLine.label;
		chartLineGroup.data = {
			color: currentLine.color,
			label: currentLine.label,
			type: currentLine.type
		}

		chartLineGroup.visible = currentLine.visible;
	}
}

function createChartLineButtons( chartLinesLayer ) {
	var chartLines = chartLinesLayer.children;
	var buttonSize = new Size(50, 32);
	var buttonSpacing = 10;

	var buttons = new Group({name: "buttons"});

	for( var i = 0; i < chartLines.length; i++) {
		var currentLine = chartLines[i];
		var buttonPosition = new Point( 0, i * (buttonSize.height + buttonSpacing) );
		

		var button = new Group({name: currentLine.data.label + " group"})
		button.data.chartline = currentLine;
		button.data.color = chartLines[i].data.color;
		
		var rectangle = new Rectangle(new Point(0, 0), buttonSize);
		var cornerSize = new Size(10, 10);
		var buttonBox = new Path.Rectangle(rectangle, cornerSize);
		buttonBox.position = buttonPosition;
		buttonBox.name = "background";

		if(currentLine.visible) {
			buttonBox.fillColor = chartLines[i].data.color;
		} else {
			buttonBox.fillColor = "#cccccc";
		}
		
		button.addChild(buttonBox);

		var label = new PointText( {
			point: buttonPosition,
			name: currentLine.data.label,
			fillColor: "white",
			content: currentLine.data.label,
			justification: "center"
		} );
		label.style = buttonLabelStyles;
		label.position.y += 5;  //Centers text vertically in box
		
		button.onMouseDown = function () {
			this.data.chartline.visible = !this.data.chartline.visible;
			if(this.data.chartline.visible) {
				this.children["background"].fillColor = this.data.color;
			} else {
				this.children["background"].fillColor = "#cccccc";
			}
	
			intersectionsLayer.removeChildren();
			intersectionsLayer.activate();
			createIntersectionLines( chartLinesLayer, chartBoundries );
		};

		button.addChild(label);	
		buttons.addChild(button);
	}

	buttons.pivot = buttons.bounds.topRight;
	buttons.position = safeBox.topRight;
}

/**
 * Given the layer with chart lines get the intersections of with lines of other types
 * @param {Layer} chartLinesLayer 
 * @param {Rectangle} chartBoundries 
 */
function createIntersectionLines( chartLinesLayer, chartBoundries ){
	var chartLines = chartLinesLayer.children;

	for( var i = 0; i < chartLines.length; i++){
		for( var j = i + 1; j < chartLines.length; j++) {
			var lineA = chartLines[i];
			var lineB = chartLines[j];

			//Only check for crossing between different types of lines
			if( lineA.data.type != lineB.data.type) {
				var crossings = lineA.children["path"].getCrossings(lineB.children["path"]);
				if( lineA.visible && lineB.visible && crossings.length > 0 ){
					var intersectionPoint = crossings[0].point;
					var leftAxisPoint = new Point( chartBoundries.left, intersectionPoint.y );
					var bottomAxisPoint = new Point( intersectionPoint.x, chartBoundries.bottom );
					var intersection = new Path([leftAxisPoint, intersectionPoint, bottomAxisPoint]);
					intersection.style = intersectionLineStyle;
				}
			}
		}
	}
}

/**
 * Get position of lines on chart from x and y values between 0 and 1
 * @param {Number} x Value should between  0 an 1
 * @param {Number} y Value should between  0 an 1
 * @param {Rectangle} chartBoundries 
 */
function getChartPosition( x, y, chartBoundries ) {
	var xPos = chartBoundries.left + chartBoundries.width * x;
	var yPos = chartBoundries.top + chartBoundries.height - chartBoundries.height * y;

	return new Point(xPos, yPos);
}

/**
 * Given a point within the chart/canvas space return a value between 0 and 1.0
 * @param {Point} point 
 * @param {Rectangle} chartBoundries 
 */
function getUnitPosition( point, chartBoundries ) {
	var x = (point.x - chartBoundries.left) / chartBoundries.width;
	var y = (chartBoundries.top + chartBoundries.height - point.y) / chartBoundries.height;
	return new Point(x, y);
}