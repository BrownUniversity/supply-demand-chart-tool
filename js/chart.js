// Chart settings
var types = ["Supply", "Demand"];
var numberOfLinesPerType = 2;

var chartPosition = new Point(0, 0);
var chartSize = new Size(400, 400);
var chartBoundries = new Rectangle( chartPosition, chartSize);
chartBoundries.center = view.center;

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

// Styles
var chartLineWidth = 7;
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

/**
 * Draw a charts axis given its boundries
 * @param {*} chartBoundries 
 */
function drawAxis( chartBoundries ) {
	var leftAxis = new Path.Line(chartBoundries.topLeft, chartBoundries.bottomLeft);
	leftAxis.strokeColor = axisLineStyles.strokeColor;

	var bottomAxis = new Path.Line(chartBoundries.bottomLeft, chartBoundries.bottomRight);
	bottomAxis.strokeColor = axisLineStyles.strokeColor;
}

drawAxis( chartBoundries );