/*global Point, Path, Size, Rectangle, Layer, PointText, project, view*/

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
	},
	{
		label: "Supply 2",
		type: "supply",
		start: 0.3,
		end: 0.8,
		color: oranges[1],
	},
	{
		label: "Demand 1",
		type: "demand",
		start: 0.7,
		end: 0.2,
		color: blues[0],
	},
	{
		label: "Demand 2",
		type: "demand",
		start: 0.8,
		end: 0.3,
		color: blues[1],
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

var axesLayer = createAxes( xAxisLabelText, yAxisLabelText, chartBoundries );
var chartLinesLayer = createChartLines( chartLines, chartBoundries );
var intersectionsLayer = createIntersectionLines( chartLinesLayer, chartBoundries );

intersectionsLayer.insertBelow(axesLayer);

/**
 * Create and return a new layer and call constructor function to create new objects on that layer.
 * @param {*} layernName 
 * @param {*} constructor 
 */
function constructOnNewLayer( layernName, constructor ){
	var currentLayer = project.activeLayer;
	var newLayer = new Layer();
	newLayer.name = layernName;

	constructor();

	currentLayer.activate();
	return newLayer;
}

/**
 * Create layer with lines for charts axis 
 * @param {Rectangle} chartBoundries 
 */
function createAxes( xAxisLabelText, yAxisLabelText, chartBoundries ) {
	return constructOnNewLayer("axes", function () {
		var leftAxis = new Path.Line(chartBoundries.topLeft, chartBoundries.bottomLeft);
		leftAxis.style = axisLineStyles;
	
		var bottomAxis = new Path.Line(chartBoundries.bottomLeft, chartBoundries.bottomRight);
		bottomAxis.style = axisLineStyles;
	
		createAxisLabels( xAxisLabelText, yAxisLabelText, chartBoundries );
	});
}

/**
 * Create labels for chart axis
 * @param {String} xAxisLabelText 
 * @param {String} yAxisLabelText 
 * @param {Rectangle} chartBoundries 
 */
function createAxisLabels( xAxisLabelText, yAxisLabelText, chartBoundries ){
	var xLabelPosition = new Point(chartBoundries.bottomCenter);
	xLabelPosition.y += 30;
	var xAxisLabel = new PointText( xLabelPosition );
	xAxisLabel.style = axisLabelStyles;
	xAxisLabel.justification = "center";
	xAxisLabel.content = xAxisLabelText;

	var yLabelPosition = new Point(chartBoundries.leftCenter);
	yLabelPosition.x -= 10;
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
	return constructOnNewLayer("chartLines", function () {
		for(var i = 0; i < chartLines.length; i++) {
			var currentLine = chartLines[i];
	
			var startPoint = getChartPosition(0, currentLine.start, chartBoundries);
			var endPoint = getChartPosition(1.0, currentLine.end, chartBoundries);
	
			var linePath = new Path.Line(startPoint, endPoint);
			linePath.style = chartLineStyle;
			linePath.strokeColor = currentLine.color;
			linePath.data = {label: currentLine.label, type: currentLine.type};
		}
	});
}

function createChartLineLabels( chartLinesLayer, chartBoundries ) {
	return constructOnNewLayer("chartLineLabels", function () {
		var chartLines = chartLinesLayer.children;
	});
}

/**
 * Given the layer with chart lines get the intersections of with lines of other types
 * @param {Layer} chartLinesLayer 
 * @param {Rectangle} chartBoundries 
 */
function createIntersectionLines( chartLinesLayer, chartBoundries ){
	return constructOnNewLayer("intersections", function () {
		var chartLines = chartLinesLayer.children;

		for( var i = 0; i < chartLines.length; i++){
			for( var j = i + 1; j < chartLines.length; j++) {
				if( chartLines[i].data.type != chartLines[j].data.type) {
					var intersectionPoint = chartLines[i].getCrossings(chartLines[j])[0].point;
					var leftAxisPoint = new Point( chartBoundries.left, intersectionPoint.y );
					var bottomAxisPoint = new Point( intersectionPoint.x, chartBoundries.bottom );
					var intersection = new Path([leftAxisPoint, intersectionPoint, bottomAxisPoint]);
					intersection.style = intersectionLineStyle;
				}
			}
		}
	});
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