var graphic = d3.select("#graphic");
var keypoints = d3.select("#keypoints");
var footer = d3.select(".footer");
var pymChild = null;

function drawGraphic(width) {
	var threshold_md = 788;
	var threshold_sm = dvc.optional.mobileBreakpoint;

	//set variables for chart dimensions dependent on width of #graphic
	if (parseInt(graphic.style("width")) < threshold_sm) {
		var margin = {
			top: dvc.optional.margin_sm[0],
			right: dvc.optional.margin_sm[1],
			bottom: dvc.optional.margin_sm[2],
			left: dvc.optional.margin_sm[3]
		};
		var chart_width =
			parseInt(graphic.style("width")) - margin.left - margin.right;
		var height =
			dvc.essential.barHeight_sm_md_lg[0] * graphic_data.length -
			margin.top -
			margin.bottom;
	} else if (parseInt(graphic.style("width")) < threshold_md) {
		var margin = {
			top: dvc.optional.margin_md[0],
			right: dvc.optional.margin_md[1],
			bottom: dvc.optional.margin_md[2],
			left: dvc.optional.margin_md[3]
		};
		var chart_width =
			parseInt(graphic.style("width")) - margin.left - margin.right;
		var height =
			dvc.essential.barHeight_sm_md_lg[1] * graphic_data.length -
			margin.top -
			margin.bottom;
	} else {
		var margin = {
			top: dvc.optional.margin_lg[0],
			right: dvc.optional.margin_lg[1],
			bottom: dvc.optional.margin_lg[2],
			left: dvc.optional.margin_lg[3]
		};
		var chart_width =
			parseInt(graphic.style("width")) - margin.left - margin.right;
		var height =
			dvc.essential.barHeight_sm_md_lg[2] * graphic_data.length -
			margin.top -
			margin.bottom;
	}

	// clear out existing graphics
	graphic.selectAll("*").remove();
	keypoints.selectAll("*").remove();
	footer.selectAll("*").remove();

	var x = d3.scaleLinear().range([0, chart_width]);

	var y = d3
		.scaleBand()
		.range([0, height])
		.paddingInner(0.1)
		.paddingOuter(0);

	graphic_data.sort(function(a, b) {
		return b.value - a.value;
	});

	y.domain(
		graphic_data.map(function(d) {
			return d.name;
		})
	);

	var yAxis = d3.axisLeft(y);

	var xAxis = d3.axisTop(x).tickSize(height, 0, 0);

	//specify number or ticks on x axis
	if (parseInt(graphic.style("width")) <= threshold_sm) {
		xAxis.ticks(dvc.optional.x_num_ticks_sm_md_lg[0]);
	} else if (parseInt(graphic.style("width")) <= threshold_md) {
		xAxis.ticks(dvc.optional.x_num_ticks_sm_md_lg[1]);
	} else {
		xAxis.ticks(dvc.optional.x_num_ticks_sm_md_lg[2]);
	}

	// parse data into columns
	var bars = {};
	for (var column in graphic_data[0]) {
		if (column == "name") continue;
		bars[column] = graphic_data.map(function(d) {
			return {
				name: d.name,
				amt: d[column]
			};
		});
	}

	//y domain calculations	: zero to intelligent max choice, or intelligent min and max choice,  or interval chosen manually
	if (dvc.essential.xAxisScale == "auto_zero_max") {
		var xDomain = [
			0,
			d3.max(d3.entries(bars), function(c) {
				return d3.max(c.value, function(v) {
					var n = v.amt;
					return Math.ceil(n);
				});
			})
		];
	} else if (dvc.essential.xAxisScale == "auto_min_max") {
		var xDomain = [
			d3.min(d3.entries(bars), function(c) {
				return d3.min(c.value, function(v) {
					var n = v.amt;
					return Math.floor(n);
				});
			}),

			d3.max(d3.entries(bars), function(c) {
				return d3.max(c.value, function(v) {
					var n = v.amt;
					return Math.ceil(n);
				});
			})
		];
	} else {
		var xDomain = dvc.essential.xAxisScale;
	}

	x.domain(xDomain);

	//create svg for chart
	var svg = d3
		.select("#graphic")
		.append("svg")
		.attr("id", "chart")
		.style("background-color", "#fff")
		.attr("width", chart_width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom + 30)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	svg
		.append("rect")
		.attr("class", "svgRect")
		.attr("width", chart_width)
		.attr("height", height)
		.attr("fill", "transparent");

	svg
		.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0, " + height + ")")
		.call(xAxis)
		.append("text")
		.attr("y", -height - 25)
		.attr("x", chart_width)
		.attr("dy", ".71em")
		.style("text-anchor", "end")
		.attr("font-size", "12px")
		.attr("fill", "#666")
		.text(dvc.essential.xAxisLabel);

	d3.select(".x .domain").remove();

	//create y axis, if x axis doesn't start at 0 drop x axis accordingly
	svg
		.append("g")
		.attr("class", "y axis")
		.attr("transform", function(d) {
			if (xDomain[0] != 0) {
				return "translate(" + 0 + ",0)";
			} else {
				return "translate(" + 0 + ", 0)";
			}
		})
		.call(yAxis);

	if (parseInt(graphic.style("width")) < threshold_sm) {
		d3.selectAll(".y .tick text").call(wrap, dvc.optional.margin_sm[3] - 10);
	} else if (parseInt(graphic.style("width")) < threshold_md) {
		d3.selectAll(".y .tick text").call(wrap, dvc.optional.margin_md[3] - 10);
	} else {
		d3.selectAll(".y .tick text").call(wrap, dvc.optional.margin_lg[3] - 10);
	}

	svg
		.append("g")
		.attr("class", "bars")
		.selectAll("rect")
		.data(bars["value"])
		.enter()
		.append("rect")
		.attr("fill", function(d) {
			if (d.amt > 0) {
				return dvc.essential.colour_palette[0];
			} else {
				return dvc.essential.negative_colour;
			}
		})
		.attr("width", function(d) {
			return 0 + Math.abs(x(d.amt) - x(0));
		})
		.attr("x", function(d) {
			return x(Math.min(0, d.amt));
		})
		.attr("y", function(d) {
			return y(d.name);
		})
		.attr("height", y.bandwidth());

	svg
		.append("g")
		.attr("class", "bars")
		.selectAll("text")
		.data(bars["value"])
		.enter()
		.append("text")
		.text(function(d) {
			return d.amt;
		})
		.attr("x", function(d) {
			if (d.amt <= 9) {
				return x(Math.max(0, d.amt)) + 5;
			} else {
				return x(Math.min(0, d.amt)) + 5;
			}
		})
		.attr("y", function(d) {
			return y(d.name) + y.bandwidth() / 2 + 5;
		})
		.attr("fill", function(d, i) {
			if (d.amt <= 9) {
				return "#323132";
			} else {
				return "#fff";
			}
		});

	//create centre line if required
	if (dvc.optional.centre_line == true) {
		svg
			.append("line")
			.attr("id", "centreline")
			.attr("y1", 0)
			.attr("y2", height)
			.attr("x1", x(dvc.optional.centre_line_value))
			.attr("x2", x(dvc.optional.centre_line_value));
	} else if (xDomain[0] < 0) {
		svg.append("line");
		svg
			.append("line")
			.attr("id", "centreline")
			.attr("y1", 0)
			.attr("y2", height)
			.attr("x1", x(0))
			.attr("x2", x(0));
	}

	function wrap(text, width) {
		text.each(function() {
			var text = d3.select(this),
				words = text
					.text()
					.split(/\s+/)
					.reverse(),
				word,
				line = [],
				lineNumber = 0,
				lineHeight = 1.1, // ems
				y = text.attr("y"),
				x = text.attr("x"),
				dy = parseFloat(text.attr("dy")),
				tspan = text
					.text(null)
					.append("tspan")
					.attr("x", x)
					.attr("y", y)
					.attr("dy", dy + "em");
			if (words.length > 2) {
				while ((word = words.pop())) {
					line.push(word);
					tspan.text(line.join(" "));
					if (tspan.node().getComputedTextLength() > width) {
						if (lineNumber == 0) {
							tspan.attr("dy", dy - 1.1 + "em");
						} else {
							tspan.attr("dy", -dy + 0.55 + "em");
						}
						line.pop();
						tspan.text(line.join(" "));
						line = [word];
						++lineNumber;
						tspan = text
							.append("tspan")
							.attr("x", x)
							.attr("y", y)
							.attr("dy", 0.55 * lineNumber - dy + 0.55 + "em")
							.text(word);
					}
				}
			} else {
				while ((word = words.pop())) {
					line.push(word);
					tspan.text(line.join(" "));
					if (tspan.node().getComputedTextLength() > width) {
						if (lineNumber == 0) {
							tspan.attr("dy", dy - 0.55 + "em");
						} else {
							tspan.attr("dy", -dy + 0.55 + "em");
						}
						line.pop();
						tspan.text(line.join(" "));
						line = [word];
						++lineNumber;
						tspan = text
							.append("tspan")
							.attr("x", x)
							.attr("y", y)
							.attr("dy", 1.1 * lineNumber - dy + 0.55 + "em")
							.text(word);
					}
				}
			}
		});
	}

	writeAnnotation();

	function writeAnnotation() {
		if (parseInt(graphic.style("width")) < threshold_sm) {
			dvc.essential.annotationBullet.forEach(function(d, i) {
				d3
					.select("#keypoints")
					.append("svg")
					.attr("width", "20px")
					.attr("height", "20px")
					.attr("class", "circles")
					.append("circle")
					.attr("class", "annocirc" + i)
					.attr("r", "2")
					.attr("cy", "12px")
					.attr("cx", "10px");

				d3
					.select("#keypoints")
					.append("p")
					.text(dvc.essential.annotationBullet[i])
					.attr("font-family", "'Open Sans', sans-serif")
					.attr("font-size", "13px")
					.attr("color", "#666")
					.attr("font-weight", "500");
			}); // end foreach
		} else {
			dvc.essential.annotationChart.forEach(function(d, i) {
				// draw annotation text based on content of var annotationArray ...
				svg
					.append("text")
					.text(dvc.essential.annotationChart[i])
					.attr("class", "annotext" + i)
					.attr("text-anchor", dvc.essential.annotationAlign[i])
					.attr("y", y(dvc.essential.annotationxY[1]))
					.attr("x", x(dvc.essential.annotationxY[0]))
					.attr("font-family", "'Open Sans', sans-serif")
					.attr("font-size", "13px")
					.attr("fill", "#666")
					.attr("font-weight", "500");

				d3
					.selectAll(".annotext" + i)
					.each(insertLinebreaks)
					.each(createBackRect);

				function insertLinebreaks() {
					var str = this;

					var el1 = dvc.essential.annotationChart[i];
					var el = el1.data;

					var words = el1.split("  ");

					d3.select(this /*str*/).text("");

					for (var j = 0; j < words.length; j++) {
						var tspan = d3
							.select(this)
							.append("tspan")
							.text(words[j]);
						if (j > 0)
							tspan.attr("x", x(dvc.essential.annotationxY[0])).attr("dy", "22");
					}
				}

				function createBackRect() {
					var BBox = this.getBBox();

					svg
						.insert("rect", ".annotext" + i)
						.attr("width", BBox.width)
						.attr("height", BBox.height)
						.attr("x", BBox.x)
						.attr("y", BBox.y)
						.attr("fill", "white")
						.attr("opacity", 0.4);
				} // end function createBackRect()
			}); // end foreach
		} // end else ...

		// If you have labels rather than years then you can split the lines using a double space (in the CSV file).

		if (dvc.optional.vertical_line == true) {
			dvc.optional.annotateLineX1_Y1_X2_Y2.forEach(function(d, i) {
				svg
					.append("line")
					.attr("x1", x(dvc.optional.annotateLineX1_Y1_X2_Y2[i][0][0]))
					.attr("x2", x(dvc.optional.annotateLineX1_Y1_X2_Y2[i][1][0]))
					.style("stroke", "#888")
					.style("stroke-width", 2)
					.attr("font-size", "13px")
					//.style('stroke-dasharray', '5 5')                         .attr('y1',y(dvc.optional.annotateLineX1_Y1_X2_Y2[i][0][1]))
					.attr("y2", y(dvc.optional.annotateLineX1_Y1_X2_Y2[i][1][1]));
			});
		}

		d3.selectAll("path").attr("fill", "none");

		d3
			.selectAll(".x line")
			.attr("stroke", "#CCC")
			.attr("stroke-width", "1px")
			.attr("shape-rendering", "crispEdges");

		d3.selectAll("text").attr("font-family", "'Open Sans', sans-serif");

		d3
			.selectAll(".y text")
			.attr("font-size", "12px")
			.attr("fill", "#666");
		d3
			.selectAll(".x text")
			.attr("font-size", "12px")
			.attr("fill", "#666"); // dates - timelines

		d3
			.selectAll(".y line")
			.attr("stroke", "#CCC")
			.attr("stroke-width", "1px")
			.style("shape-rendering", "crispEdges");

		if (dvc.optional.annotateRect == true) {
			dvc.optional.annotateRectX_Y.forEach(function(d, i) {
				var xY = dvc.optional.annotateRectX_Y[i];

				// TODO: The data types here don't make sense, as we're
				// trying to add a string and a number. What does this code block do?
				if (!isNaN(xY[0][0]) && !isNaN(xY[0][1])) {
					svg
						.append("rect")
						.attr("x", x(xY[0][0]))
						.attr("y", y(xY[0][1]))
						.attr("height", y(xY[1][1]) - y(xY[0][1]))
						.attr("width", x(xY[1][0]) - x(xY[0][0]))
						.style("fill", dvc.optional.lineColor_opcty[i][0])
						.style("stroke-width", 2)
						.style("opacity", dvc.optional.lineColor_opcty[i][1]);
				}
			});
		}

		d3
			.select(".y")
			.select("path")
			.style("stroke", "#666");
	} // end function writeAnnotation()

	d3.select("#source").text("Source: " + dvc.essential.sourceText);

	d3.selectAll("text").attr("font-family", "'Open Sans', sans-serif");

	//use pym to calculate chart dimensions
	if (pymChild) {
		pymChild.sendHeight();
	}
}

var supportsSVG =
	!!document.createElementNS &&
	!!document.createElementNS("http://www.w3.org/2000/svg", "svg");

//check whether browser can cope with svg
if (supportsSVG) {
	//load config
	d3.json("config.json", function(error, config) {
		if (error) {
			var graphic = document.getElementById("graphic");
			graphic.innerHTML = "Chart data failed to load";
			graphic.style.textAlign = "center";
			graphic.style.marginTop = "60px";
			graphic.style.color = "#b42525";
			graphic.style.fontWeight = "bold";
			return;
		}

		dvc = config;

		var barchartFeatureService =
			"https://raw.githubusercontent.com/tomwhite/covid-19-uk-data/master/data/covid-19-cases-uk.csv";
			//"https://services1.arcgis.com/0IrmI40n5ZYxTUrV/arcgis/rest/services/CountyUAs_cases/FeatureServer/0/query?f=json&where=1=1&returnGeometry=false&spatialRel=esriSpatialRelIntersects&outFields=*&orderByFields=TotalCases%20desc&outSR=102100&resultOffset=0&resultRecordCount=1000&cacheHint=true";

		var parseDate = d3.timeParse("%Y-%m-%d");
		var formatDate = d3.timeFormat("%Y-%m-%d");


		d3.csv(barchartFeatureService, function(error, fsData) {
			console.log(fsData)

			engdata = fsData.filter(function(d) {return d.Country=="England"});
			walesdata = fsData.filter(function(d) {return d.Country=="Wales"});
			scotdata = fsData.filter(function(d) {return d.Country=="Scotland"});

			dates = engdata.map(function(d) {
			    return {
			        "month": parseDate(d.Date)
			    };
			});

			latestDateEng = d3.max(dates.map(d=>d.month));


			dates = walesdata.map(function(d) {
			    return {
			        "month": parseDate(d.Date)
			    };
			});

			latestDateWales = d3.max(dates.map(d=>d.month));


			dates = scotdata.map(function(d) {
					return {
							"month": parseDate(d.Date)
					};
			});

			latestDateScot = d3.max(dates.map(d=>d.month));

			filteredData = fsData.filter(function(d) {
				if(d.Country=="England" && d.Date==formatDate(latestDateEng)) {
					return d.Country=="England" && d.Date==formatDate(latestDateEng);
				} else if(d.Country=="Wales" && d.Date==formatDate(latestDateWales)) {
					return d.Country=="Wales" && d.Date==formatDate(latestDateWales);
				} else if(d.Country=="Scotland" && d.Date==formatDate(latestDateScot)) {
					return d.Country=="Scotland" && d.Date==formatDate(latestDateScot);
				}
			})

			const features = filteredData;
			const graphic_dataFs = features.map(feature => {
				return {
					name: feature.Area,
					value: feature.TotalCases
				};
			});
			graphic_dataFs.columns = ["name", "value"];
			graphic_data = graphic_dataFs;

			console.log(graphic_data);

			pymChild = new pym.Child({
				renderCallback: drawGraphic
			});
		});
	});
} else {
	//use pym to create iframe containing fallback image (which is set as default)
	pymChild = new pym.Child();
	if (pymChild) {
		pymChild.sendHeight();
	}
}
