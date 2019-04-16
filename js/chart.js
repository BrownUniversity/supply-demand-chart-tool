
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

// Chart settings
var types = ["Supply", "Demand"];
var numberOfLinesPerType = 2;

var chartPosition = new Point(0, 0);
var chartSize = new Size(380, 380);
var chartBoundries = new Rectangle( chartPosition, chartSize);
chartBoundries.center = view.center;

var xAxisLabelText = "Price";
var yAxisLabelText = "Quantity";

//Supply and demand lines of chart 
var chartLines = [
	{
		label: "Supply 1",
		type: "supply",
		start: 0.2,
		end: 0.7,
		color: oranges[0],
		path: null
	},
	{
		label: "Supply 2",
		type: "supply",
		start: 0.3,
		end: 0.8,
		color: oranges[1],
		path: null
	},
	{
		label: "Demand 1",
		type: "demand",
		start: 0.7,
		end: 0.2,
		color: blues[0],
		path: null
	},
	{
		label: "Demand 2",
		type: "demand",
		start: 0.8,
		end: 0.3,
		color: blues[1],
		path: null
	}
];

// Styles

var chartLineStyle = {
	strokeWidth: 6,
	strokeCap: "round"	
};

var intersectionLineStyle = {
	strokeColor: "#bbbbbb",
	strokeWidth: 2,
	strokeCap: "butt",
	dashArray: [3, 3]
}

var axisLineStyles = {
	strokeColor: "black",
	strokeWidth: 1,
}

var axisLabelStyles = {
	color: "black",
	fontFamily: "'Roboto', 'sans-serif'",
	fontSize: 20
}

createAxis( xAxisLabelText, yAxisLabelText, chartBoundries );
chartLines = createChartLines( chartLines, chartBoundries );
createIntersectionLines( chartLines, chartBoundries );

console.log(project.layers);

/**
 * Create charts axis given its boundries
 * @param {*} chartBoundries 
 */
function createAxis( xAxisLabelText, yAxisLabelText, chartBoundries ) {
	var currentLayer = project.activeLayer
	var axesLayer = new Layer();
	axesLayer.name = "axes";

	var leftAxis = new Path.Line(chartBoundries.topLeft, chartBoundries.bottomLeft);
	setItemStyle(leftAxis, axisLineStyles);

	var bottomAxis = new Path.Line(chartBoundries.bottomLeft, chartBoundries.bottomRight);
	setItemStyle(bottomAxis, axisLineStyles);

	createAxisLabels( xAxisLabelText, yAxisLabelText, chartBoundries );

	currentLayer.activate();
	return axesLayer;
}

/**
 * Create labels for chart axis
 * @param {*} xAxisLabelText 
 * @param {*} yAxisLabelText 
 * @param {*} chartBoundries 
 */
function createAxisLabels( xAxisLabelText, yAxisLabelText, chartBoundries ){
	var xLabelPosition = new Point(chartBoundries.bottomCenter);
	xLabelPosition.y += 30;
	var xAxisLabel = new PointText( xLabelPosition );
	setItemStyle(xAxisLabel, axisLabelStyles);
	xAxisLabel.justification = "center";
	xAxisLabel.content = xAxisLabelText;

	var yLabelPosition = new Point(chartBoundries.leftCenter);
	yLabelPosition.x -= 10;
	var yAxisLabel = new PointText( yLabelPosition );
	setItemStyle(yAxisLabel, axisLabelStyles);
	yAxisLabel.justification = "right";
	yAxisLabel.content = yAxisLabelText;	
}

/**
 * Create the lines of the chart
 * @param {*} chartLines 
 * @param {*} chartBoundries 
 */
function createChartLines( chartLines, chartBoundries ){
	var currentLayer = project.activeLayer;
	var chartLinesLayer = new Layer();
	chartLinesLayer.name = "chartLines";

	for(var i = 0; i < chartLines.length; i++) {
		currentLine = chartLines[i];

		var startPoint = getChartPosition(0, currentLine.start, chartBoundries);
		var endPoint = getChartPosition(1.0, currentLine.end, chartBoundries);

		var linePath = new Path.Line(startPoint, endPoint);
		setItemStyle(linePath, chartLineStyle );
		linePath.strokeColor = currentLine.color;

		chartLines[i].path = linePath;
	}

	currentLayer.activate();
	return chartLines;
}

function createIntersectionLines( chartLines, chartBoundries ){
	var currentLayer = project.activeLayer;
	var intersectionsLayer = new Layer();
	intersectionsLayer.name = "intersections"

	for( var i = 0; i < chartLines.length; i++){
		for( var j = i + 1; j < chartLines.length; j++) {
			if( chartLines[i].type != chartLines[j].type) {
				var intersectionPoint = chartLines[i].path.getCrossings(chartLines[j].path)[0].point;
				var leftAxisPoint = new Point( chartBoundries.left, intersectionPoint.y );
				var bottomAxisPoint = new Point( intersectionPoint.x, chartBoundries.bottom );
				var intersection = new Path([leftAxisPoint, intersectionPoint, bottomAxisPoint]);
				setItemStyle(intersection, intersectionLineStyle);
			}
		}
	}

	currentLayer.activate();
}

/**
 * Apply styles in a given object to an item
 * @param {Item} item 
 * @param {*} itemStyles 
 */
function setItemStyle( item, itemStyles ) {
	for( style in itemStyles ){
		if(itemStyles.hasOwnProperty(style)) {
			item[style] = itemStyles[style];
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