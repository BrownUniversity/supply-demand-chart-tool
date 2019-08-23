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

var xAxisLabelText = "Quantity";
var yAxisLabelText = "Price";

//Supply and demand lines of chart 
var supplyDemandLineData = [
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
	dashArray: [8, 6]
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

//Create the charts
var safeBox = createSafeBoxDimensions( view.bounds, margin );
var chartBoundries = createChartDimensions(safeBox);
createChart(supplyDemandLineData, chartBoundries);

//Area to register boundaries of dragging of chart lines
var dragBoundries = new Rectangle(view.bounds.x, chartBoundries.y, view.bounds.width, chartBoundries.height);

// Options for selecting objects
var hitOptions = {
	segments: true,
	stroke: true,
	fill: false,
	tolerance: 5,
	match: function (hitResults) {
		return hitResults.item.layer == project.layers["supplyDemandLines"];
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
		if( selectedPath ) {
			if(selectedSegment) {
				selectedSegment.point.y = constrain(selectedSegment.point.y + event.delta.y, chartBoundries.top, chartBoundries.bottom);
			} else {
				var topEdge = selectedPath.bounds.top + event.delta.y;
				var bottomEdge = selectedPath.bounds.bottom + event.delta.y;
	
				//Check to make sure part of path doesn't extend beyond the chart area.
				if( topEdge > chartBoundries.top && bottomEdge < chartBoundries.bottom){
					selectedPath.position.y = constrain(selectedPath.position.y + event.delta.y, chartBoundries.top, chartBoundries.bottom);
				}
			}

			var parentGroup = selectedPath.parent;
			parentGroup.children["label"].point.y = selectedPath.lastSegment.point.y;
			
			parentGroup.data.start = getUnitPosition( selectedPath.firstSegment.point, chartBoundries ).y;
			parentGroup.data.end = getUnitPosition(selectedPath.lastSegment.point, chartBoundries ).y;
		}	

		//Remove and recreate intersections 
		project.layers["intersections"].removeChildren();
		project.layers["intersections"].activate();
		createIntersectionLines( project.layers["supplyDemandLines"], chartBoundries );
	}
}

/* exported onMouseUp */
function onMouseUp(){
	selectedSegment = null;
	selectedPath = null;
}

/* exported onResize */
function onResize(){
	safeBox = createSafeBoxDimensions( view.bounds, margin );
	chartBoundries = createChartDimensions(safeBox);

	var data = project.layers["supplyDemandLines"].children.map( function (chartLineGroup) {
		return chartLineGroup.data;
	});

	createChart(data, chartBoundries);
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
 * Create box to contain
 * @param {*} containerRectangle 
 * @param {*} margin 
 */
function createSafeBoxDimensions(containerBounds, margin){
	var safeBox = new Rectangle( containerBounds );
	safeBox.width -= margin * 2;
	safeBox.height-= margin * 2;
	safeBox.center = view.center;

	return safeBox;
}

/**
 * Create chart dimensions based on a container rectangle and a margin to offset from that rectagle
 * @param {*} containerBounds 
 * @param {*} margin 
 */
function createChartDimensions(containerBounds) {
	var xAxisLabelMargin = 75;
	
	var chartDimension = Math.min(containerBounds.width, containerBounds.height) - xAxisLabelMargin;
	
	// Chart settings
	var chartSize = new Size(chartDimension, chartDimension);
	var chartBoundries = new Rectangle( new Point(0, 0), chartSize);
	chartBoundries.topCenter = containerBounds.topCenter;

	return chartBoundries;
}


/**
 * Create the chart and its elements.
 * @param {*} chartLineData 
 * @param {*} chartBoundries 
 */
function createChart( chartLineData, chartBoundries) {
	project.clear();
	
	project.addLayer(new Layer({name: "intersections"}));
	project.addLayer(new Layer({name: "tempPriceQuantityLines"}));
	project.addLayer(new Layer({name: "axes"}));
	project.addLayer(new Layer({name: "supplyDemandLines"}));
	project.addLayer(new Layer({name: "ui"}));

	project.layers["axes"].activate();
	createPriceQuantityHoverAreas(chartBoundries);
	createAxes( xAxisLabelText, yAxisLabelText, chartBoundries );
	
	project.layers["supplyDemandLines"].activate();
	createChartLines( chartLineData, chartBoundries );

	project.layers["intersections"].activate();
	createIntersectionLines( project.layers["supplyDemandLines"], chartBoundries );

	project.layers["ui"].activate();
	createChartLineButtons( project.layers["supplyDemandLines"] );
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
 * Create area near axes that when user hovers will draw temporary price or quantity lines.
 * @param {*} chartBoundries 
 */
function createPriceQuantityHoverAreas(chartBoundries) {
	var hoverAreaSize = 120;

	var leftOrigin = new Point(chartBoundries.topLeft.x - hoverAreaSize, chartBoundries.topLeft.y);
	var leftSize = new Size(hoverAreaSize, chartBoundries.height);
	var leftAxisHoverArea = new Path.Rectangle(leftOrigin, leftSize);

	var bottomOrigin = new Point(chartBoundries.bottomLeft.x, chartBoundries.bottomLeft.y);
	var bottomSize = new Size(chartBoundries.width, hoverAreaSize);
	var bottomAxisHoverArea = new Path.Rectangle(bottomOrigin, bottomSize);

	leftAxisHoverArea.fillColor = new Color(1.0,1.0, 1.0);
	bottomAxisHoverArea.fillColor = new Color(1.0,1.0, 1.0);

	var drawTemporaryPriceQuantityLine = function( from, to ){
		project.layers["tempPriceQuantityLines"].removeChildren();
		project.layers["tempPriceQuantityLines"].activate();

		var priceQuantityLine = new Path.Line(from, to);
		
		//Find intersections between line and supply and demand lines
		var intersections = [];
		var supplyDemandLines = project.layers["supplyDemandLines"].children;

		for( var i = 0; i < supplyDemandLines.length; i++) {
			if(supplyDemandLines[i].visible) {
				var crossings = priceQuantityLine.getCrossings(supplyDemandLines[i].children["path"]);
				for(var j = 0; j < crossings.length; j++) {
					intersections.push(crossings[j]);
				}
			}
		}

		for( var i = 0; i < intersections.length; i++) {
			var endPoint;

			//Check if line is horizontal (price) or vertical (quantity)
			if(priceQuantityLine.firstSegment.point.x === priceQuantityLine.lastSegment.point.x ) {
				//Line is vertical
				endPoint = new Point(chartBoundries.left, intersections[i].point.y);
			} else {
				//Line is horizontal
				endPoint = new Point(intersections[i].point.x, chartBoundries.bottom);
			}
			var newLine = new Path.Line(intersections[i].point, endPoint);
			newLine.style = intersectionLineStyle;

		}

		priceQuantityLine.style = intersectionLineStyle;
	}

	//Update any temporary price (horizontal) lines
	leftAxisHoverArea.onMouseMove = function(event) {
		var from = new Point( chartBoundries.left, event.point.y );
		var to = new Point( chartBoundries.right, event.point.y);

		drawTemporaryPriceQuantityLine(from, to);
	}

	//Update any temporary quantity (vertical) lines
	bottomAxisHoverArea.onMouseMove = function(event) {
		var from = new Point( event.point.x, chartBoundries.top  );
		var to = new Point( event.point.x, chartBoundries.bottom);
		
		drawTemporaryPriceQuantityLine(from, to);
	}

	//Function for removing temporary lines
	var removeTemporaryLines = function(event) {
		project.layers["tempPriceQuantityLines"].removeChildren();
	}

	// Remove any temporary price lines
	leftAxisHoverArea.onMouseLeave = removeTemporaryLines;

	// Remove any temporary quantity lines
	bottomAxisHoverArea.onMouseLeave = removeTemporaryLines;
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
 * @param {*} chartLineData 
 * @param {*} chartBoundries 
 */
function createChartLines( chartLineData, chartBoundries ){
	for(var i = 0; i < chartLineData.length; i++) {
		var lineData = chartLineData[i];

		var startPoint = getChartPosition(0, lineData.start, chartBoundries);
		var endPoint = getChartPosition(1.0, lineData.end, chartBoundries);

		//Create new label
		var labelPosition = new Point(endPoint);
		labelPosition.x += 10;

		var label = new PointText( {
			point: labelPosition,
			name: "label",
			fillColor: lineData.color,
			content: lineData.label,
			style: chartLineLabelStyles
		} );

		//Create new path
		var linePath = new Path.Line(startPoint, endPoint);
		linePath.style = chartLineStyle;
		linePath.strokeColor = lineData.color;
		linePath.name = "path";

		//Create new group
		var chartLineGroup = new Group([ linePath, label ])
		chartLineGroup.name = lineData.label;
		chartLineGroup.data = lineData;

		chartLineGroup.visible = lineData.visible;
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
			this.data.chartline.data.visible = this.data.chartline.visible;
			if(this.data.chartline.visible) {
				this.children["background"].fillColor = this.data.color;
			} else {
				this.children["background"].fillColor = "#cccccc";
			}
	
			project.layers["intersections"].removeChildren();
			project.layers["intersections"].activate();
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