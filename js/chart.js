

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
		color: oranges[0]
	},
	{
		label: "Supply 2",
		type: "supply",
		start: 0.3,
		end: 0.8,
		color: oranges[1]
	},
	{
		label: "Demand 1",
		type: "demand",
		start: 0.7,
		end: 0.2,
		color: blues[0]
	},
	{
		label: "Demand 2",
		type: "demand",
		start: 0.8,
		end: 0.3,
		color: blues[1]
	}
];

// Styles
var chartLineWidth = 6;
var axisLineWidth = 1;
var intersectionLineWidth = 2;
var chartLineStrokeCap = "round";
var axisLineStrokeCap = "butt";
var intersectionLineStrokeCap = "round";

var supplyLineStyle = {
	strokeWidth: chartLineWidth,
	strokeCap: chartLineStrokeCap	
};

var demandLineStyle = {
	strokeWidth: chartLineWidth,
	strokeCap: chartLineStrokeCap	
};

var axisLineStyles = {
	strokeColor: "black",
	strokeWidth: axisLineWidth,
}

var axisLabelStyles = {
	color: "black",
	fontFamily: "'Roboto', 'sans-serif'",
	fontSize: 24

}

drawAxis( chartBoundries );
drawAxisLabels( xAxisLabelText, yAxisLabelText, chartBoundries );
drawChartLines( chartLines, chartBoundries );

/**
 * Draw a charts axis given its boundries
 * @param {*} chartBoundries 
 */
function drawAxis( chartBoundries ) {
	var leftAxis = new Path.Line(chartBoundries.topLeft, chartBoundries.bottomLeft);
	setItemStyle(leftAxis, axisLineStyles);

	var bottomAxis = new Path.Line(chartBoundries.bottomLeft, chartBoundries.bottomRight);
	setItemStyle(bottomAxis, axisLineStyles);
}

function drawAxisLabels( xAxisLabelText, yAxisLabelText, chartBoundries ){
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
 * Apply styles in a given object to an item
 * @param {*} item 
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
 * Create the lines of the chart
 * @param {*} chartLines 
 * @param {*} chartBoundries 
 */
function drawChartLines( chartLines, chartBoundries ){
	for(var i = 0; i < chartLines.length; i++) {
		currentLine = chartLines[i];

		var startPoint = getChartPosition(0, currentLine.start, chartBoundries);
		var endPoint = getChartPosition(1.0, currentLine.end, chartBoundries);

		var linePath = new Path.Line(startPoint, endPoint);
		linePath.strokeWidth = chartLineWidth;
		linePath.strokeColor = currentLine.color;
		linePath.strokeCap = chartLineStrokeCap;
	}
}

/**
 * Get position of lines on chart from x and y values between 0 and 1
 * @param {*} x 
 * @param {*} y 
 * @param {*} chartBoundries 
 */
function getChartPosition( x, y, chartBoundries ) {
	var xPos = chartBoundries.left + chartBoundries.width * x;
	var yPos = chartBoundries.top + chartBoundries.height - chartBoundries.height * y;

	return new Point(xPos, yPos);
}

function getUnitPosition( point, chartBoundries ) {
	var x = (point.x - chartBoundries.left) / chartBoundries.width;
	var y = (chartBoundries.top + chartBoundries.height - point.y) / chartBoundries.height;
	return new Point(x, y);
}

function xScale( lineValue ){
	var chartPosition = 0;

	return chartPosition;
} 