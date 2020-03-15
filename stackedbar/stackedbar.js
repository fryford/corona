var graphic = d3.select("#graphic");
var keypoints = d3.select("#keypoints");
var footer = d3.select(".footer");

var pymChild = null;

function drawGraphic(width) {
	var threshold_md = 788;
	var threshold_sm = dvc.optional.mobileBreakpoint;

	if (parseInt(graphic.style("width")) < threshold_sm) {
		nocols = dvc.essential.numbercolumns_sm_md_lg[0];
		var margin = {
			top: dvc.optional.margin_sm[0],
			right: dvc.optional.margin_sm[1],
			bottom: dvc.optional.margin_sm[2],
			left: dvc.optional.margin_sm[3]
		};
		var innermargin = {
			top: dvc.optional.innersm[0],
			right: dvc.optional.innersm[1],
			bottom: dvc.optional.innersm[2],
			left: dvc.optional.innersm[3]
		};
		canvaswidth = parseInt(graphic.style("width")) - margin.left - margin.right;
		var chart_width =
			canvaswidth / dvc.essential.numbercolumns_sm_md_lg[0] -
			dvc.optional.innersm[1] -
			dvc.optional.innersm[3];
		var height =
			Math.ceil(
				(chart_width * dvc.optional.aspectRatio_sm[1]) /
					dvc.optional.aspectRatio_sm[0]
			) -
			dvc.optional.innersm[0] -
			dvc.optional.innersm[2];
	} else if (parseInt(graphic.style("width")) < threshold_md) {
		nocols = dvc.essential.numbercolumns_sm_md_lg[1];
		var margin = {
			top: dvc.optional.margin_md[0],
			right: dvc.optional.margin_md[1],
			bottom: dvc.optional.margin_md[2],
			left: dvc.optional.margin_md[3]
		};
		var innermargin = {
			top: dvc.optional.innermd[0],
			right: dvc.optional.innermd[1],
			bottom: dvc.optional.innermd[2],
			left: dvc.optional.innermd[3]
		};
		canvaswidth = parseInt(graphic.style("width")) - margin.left - margin.right;
		var chart_width =
			canvaswidth / dvc.essential.numbercolumns_sm_md_lg[1] -
			dvc.optional.innermd[1] -
			dvc.optional.innermd[3];
		var height =
			Math.ceil(
				(chart_width * dvc.optional.aspectRatio_md[1]) /
					dvc.optional.aspectRatio_md[0]
			) -
			dvc.optional.innermd[0] -
			dvc.optional.innermd[2];
	} else {
		nocols = dvc.essential.numbercolumns_sm_md_lg[2];
		var margin = {
			top: dvc.optional.margin_lg[0],
			right: dvc.optional.margin_lg[1],
			bottom: dvc.optional.margin_lg[2],
			left: dvc.optional.margin_lg[3]
		};
		var innermargin = {
			top: dvc.optional.innerlg[0],
			right: dvc.optional.innerlg[1],
			bottom: dvc.optional.innerlg[2],
			left: dvc.optional.innerlg[3]
		};
		canvaswidth = parseInt(graphic.style("width")) - margin.left - margin.right;
		var chart_width =
			canvaswidth / dvc.essential.numbercolumns_sm_md_lg[2] -
			dvc.optional.innerlg[1] -
			dvc.optional.innerlg[3];

		var height =
			Math.ceil(
				(chart_width * dvc.optional.aspectRatio_lg[1]) /
					dvc.optional.aspectRatio_lg[0]
			) -
			dvc.optional.innerlg[0] -
			dvc.optional.innerlg[2];
	}

	// clear out existing graphics
	graphic.selectAll("*").remove();
	keypoints.selectAll("*").remove();
	footer.selectAll("*").remove();

	//Work out legend labels from column namespace
	variables = [];
	for (var column in graphic_data[0]) {
		if (column == "chart_title") continue;
		if (column == "group") continue;
		variables.push(column);
	}

	variableslessnet = variables.slice(0, variables.length - 1);

	//Create legend
	var legend = d3
		.select("#graphic")
		.append("ul")
		.attr("class", "key")
		.selectAll("g")
		.data(variables)
		.enter()
		.append("li")
		.attr("class", function(d, i) {
			return "key-" + i;
		});

	legend.append("b").style("background-color", function(d, i) {
		return dvc.essential.colour_palette[i];
	});

	legend.append("label").html(function(d, i) {
		return dvc.essential.legendLabels[i];
	});

	//Work out how many charts we need.
	chartgroups = graphic_data.map(function(obj) {
		return obj.chart_title;
	});
	chartgroups = chartgroups.filter(function(v, i) {
		return chartgroups.indexOf(v) == i;
	});

	chartgroups.forEach(function(chartgroup, k) {
		graphicfiltered = graphic_data.filter(function(b, i) {
			return b.chart_title == chartgroup;
		});

		var x = d3
			.scaleBand()
			.range([0, chart_width])
			.padding(0.1);

		var y = d3.scaleLinear().rangeRound([height, 0]);

		// colour scale
		var z = d3.scaleOrdinal(dvc.essential.colour_palette);

		var formatAsPercentage = d3.formatPrefix("%", 0);

		x.domain(
			d3.extent(graphicfiltered, function(d) {
				return d.group;
			})
		);

		z.domain(variableslessnet);

		var xAxis = d3
			.axisBottom(x)
			.tickFormat(function(d, i) {
				if (dvc.essential.dateFormat != "") {
					if (chart_width <= threshold_sm) {
						var fmt = d3.timeFormat(dvc.optional.xAxisTextFormat_sm_md_lg[0]);
						return i % dvc.optional.x_num_ticks_sm_md_lg[0] ? " " : fmt(d);
					} else if (width <= threshold_md) {
						var fmt = d3.timeFormat(dvc.optional.xAxisTextFormat_sm_md_lg[1]);
						return i % dvc.optional.x_num_ticks_sm_md_lg[1] ? " " : fmt(d);
					} else {
						var fmt = d3.timeFormat(dvc.optional.xAxisTextFormat_sm_md_lg[2]);
						return i % dvc.optional.x_num_ticks_sm_md_lg[2] ? " " : fmt(d);
					}
				} else {
					return d;
				}
			})
			.tickPadding(5);

		//d3.selectAll(".tick").selectAll("line").attr("transform", "translate(30,0)");

		var yAxis = d3.axisLeft(y);

		if (parseInt(graphic.style("width")) <= threshold_sm) {
			yAxis.ticks(dvc.optional.y_num_ticks_sm_md_lg[0]);
		} else if (parseInt(graphic.style("width")) <= threshold_md) {
			yAxis.ticks(dvc.optional.y_num_ticks_sm_md_lg[1]);
		} else {
			yAxis.ticks(dvc.optional.y_num_ticks_sm_md_lg[2]);
		}

		var y_axis_grid = function() {
			return yAxis;
		};

		var svg = d3
			.select("#graphic")
			.append("svg")
			.attr("width", function() {
				if (k % nocols) {
					return chart_width + innermargin.left + innermargin.right;
				} else {
					return chart_width + margin.left + innermargin.left + innermargin.right;
				}
			})
			.attr("height", height + innermargin.top + innermargin.bottom)
			.append("g")
			.attr(
				"transform",
				"translate(" + innermargin.left + "," + innermargin.top + ")"
			);

		x.domain(
			graphicfiltered.map(function(d) {
				return d.group;
			})
		);

		//y domain calculations	: zero to intelligent max choice, or intelligent min and max choice,  or interval chosen manually
		if (dvc.essential.yAxisScale == "auto_zero_max") {
			var num = d3.max(graphicfiltered, function(d) {
				return d.total;
			});
			var yDomain = [0, (parseInt(num / 10, 10) + 1) * 10];
		} else if (dvc.essential.yAxisScale == "auto_min_max") {
			// console.log("not appropriate for a stack bar chart");
		} else {
			var yDomain = dvc.essential.yAxisScale;
		}

		y.domain(yDomain);

		svg
			.append("g")
			.attr("class", "x axis")
			.attr("transform", function() {
				if (k % nocols) {
					return "translate(0," + height + ")";
				} else {
					return "translate(" + margin.left + "," + height + ")";
				}
			})
			.call(xAxis);

		svg
			.append("g")
			.attr("class", "y axis")
			.attr("transform", function() {
				if (k % nocols) {
					return "translate(0,0)";
				} else {
					return "translate(" + margin.left + ",0)";
				}
			})
			.call(yAxis.tickSize(-chart_width, 0, 0))
			.append("text")
			.attr("x", 0)
			.attr("y", -25)
			.attr("dy", ".71em")
			.style("text-anchor", "end")
			.text(dvc.essential.yAxisLabel);

		var stack = d3
			.stack()
			.keys(variableslessnet)
			.offset(d3.stackOffsetDiverging)(graphicfiltered);

		var group = svg
			.selectAll(".year")
			.data(stack)
			.enter()
			.append("g")
			.attr("class", "g bars")
			.attr("fill", function(d) {
				return z(d.key);
			});

		group
			.selectAll("rect")
			.data(function(d) {
				return d;
			})
			.enter()
			.append("rect")
			.attr("width", x.bandwidth())
			.attr("x", function(d) {
				return x(d.data.group);
			})
			.attr("y", function(d) {
				return y(d[1]);
			})
			.attr("height", function(d) {
				return y(d[0]) - y(d[1]);
			})
			.style("opacity", 0.85);

		if (k % nocols) {
		} else {
			d3.selectAll(".bars").attr("transform", "translate(" + margin.left + ",0)");
		}
		//if(k%nocols) {} else {d3.selectAll(".netbars").attr("transform","translate(" + margin.left + ",0)")}
		if (k % nocols) {
			svg
				.select(".y")
				.selectAll("text")
				.remove();
		}
	});

	if (chart_width > dvc.optional.mobileBreakpoint) {
	} else {
	}

	if (pymChild) {
		pymChild.sendHeight();
	}
}

var supportsSVG =
	!!document.createElementNS &&
	!!document.createElementNS("http://www.w3.org/2000/svg", "svg");

if (supportsSVG) {
	d3.json("config.json", function(error, config) {
		dvc = config;

		var featureService =
			"https://services1.arcgis.com/0IrmI40n5ZYxTUrV/arcgis/rest/services/DailyConfirmedCases/FeatureServer/0/query?f=json&where=1%3D1&returnGeometry=false&spatialRel=esriSpatialRelIntersects&outFields=*&orderByFields=DateVal%20asc&outSR=102100&resultOffset=0&resultRecordCount=2000&cacheHint=true";

		d3.json(featureService, function(error, fsData) {
			if (error) {
				var graphic = document.getElementById("graphic");
				graphic.innerHTML = "Chart data failed to load";
				graphic.style.textAlign = "center";
				graphic.style.marginTop = "60px";
				graphic.style.color = "#b42525";
				graphic.style.fontWeight = "bold";
				return;
			}

			const features = fsData.features;

			const graphic_dataFs = features.map((feature, i) => {
				const date = new Date(feature.attributes.DateVal);
				const ddmmyyyy =
					date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();

				return {
					chart_title: "25-34", // TODO: not really sure what this is?
					group: ddmmyyyy,
					newcases: feature.attributes.CMODateCount,
					existing: feature.attributes.CumCases - feature.attributes.CMODateCount,
					total: feature.attributes.CumCases
				};
			});

			graphic_data = graphic_dataFs;

			// sort data
			if (dvc.essential.sort_data === true) {
				graphic_data.sort(function(a, b) {
					return b.total - a.total;
				});
			}

			graphic_data.forEach(function(d) {
				d.group = d3.timeParse(dvc.essential.dateFormat)(d.group);
			});

			pymChild = new pym.Child({ renderCallback: drawGraphic });
		});
	});

	// strings to numbers
	function type(d, i, columns) {
		for (i = 2, t = 0; i < columns.length; ++i)
			t += d[columns[i]] = +d[columns[i]];
		d.total = t;
		return d;
	}
} else {
	pymChild = new pym.Child();
	if (pymChild) {
		pymChild.sendHeight();
	}
}
