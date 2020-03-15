var pymChild = new pym.Child();

var featureService =
	"https://services1.arcgis.com/0IrmI40n5ZYxTUrV/arcgis/rest/services/CountyUAs_cases/FeatureServer/0/query?f=json&where=TotalCases%20%3C%3E%200&returnGeometry=false&spatialRel=esriSpatialRelIntersects&outFields=*&orderByFields=TotalCases%20desc&outSR=102100&resultOffset=0&resultRecordCount=1000&cacheHint=true";

d3
	.queue()
	.defer(d3.json, featureService)
	.defer(d3.json, "data/countyuabound.json")
	.defer(d3.json, "data/countyua.json")
	.await(ready);

function ready(error, featureService, geogbound, geog) {
	if (error) {
		console.error(error);
		return;
	}

	var features = featureService.features;
	var data = features.map(feature => {
		return {
			areacd: feature.attributes.GSS_CD,
			areanm: feature.attributes.GSS_NM,
			cases: feature.attributes.TotalCases
		};
	});

	//convert topojson to geojson
	for (key in geog.objects) {
		var areas = topojson.feature(geog, geog.objects[key]);
	}

	for (key in geogbound.objects) {
		var areabounds = topojson.feature(geogbound, geogbound.objects[key]);
	}

	const areabyid = [];
	const cases = [];
	const cases2 = [];

	data.forEach(function(d, i) {
		cases[d.areacd] = +d.cases;
		cases2[i] = +d.cases;
		areabyid[d.areacd] = d.areanm;
	});

	var maxvalue = d3.max(cases2);

	areas.features.map(function(d, i) {
		if (cases[d.properties.ctyua19cd] >= 0) {
			d.properties.cases = cases[d.properties.ctyua19cd];
		} else {
			d.properties.cases = 0;
		}
	});

	const map = new mapboxgl.Map({
		container: "map",
		style: "data/style.json",
		center: [-3.5, 52.355],
		zoom: 6
	});

	map.on("load", () => {
		map.addSource("area", { type: "geojson", data: areas });

		map.addSource("areabound", { type: "geojson", data: areabounds });

		map.addLayer(
			{
				id: "coronabound",
				type: "line",
				source: "areabound",
				minzoom: 8,
				maxzoom: 20,
				layout: {},
				paint: {
					"line-color": "grey",
					"line-width": 1
				}
			},
			"place_suburb"
		);

		map.addLayer(
			{
				id: "corona",
				type: "circle",
				source: "area",
				//"source-layer": "OA_all",
				paint: {
					"circle-radius": {
						property: "cases",
						stops: [
							[{ zoom: 8, value: 0 }, 0],
							[{ zoom: 8, value: maxvalue }, 15],
							[{ zoom: 11, value: 0 }, 0],
							[{ zoom: 11, value: maxvalue }, 90],
							[{ zoom: 16, value: 0 }, 0],
							[{ zoom: 16, value: maxvalue }, 600]
						]
					},
					"circle-opacity": 0.9,
					"circle-color": {
						property: "cases",
						stops: [
							[0, "#abc149"],
							[maxvalue, "#24a79b"]
						]
					}
				}
			},
			"place_suburb"
		);

		map.addLayer(
			{
				id: "coronahover",
				type: "circle",
				source: "area",
				//"source-layer": "OA_all",
				paint: {
					"circle-radius": {
						property: "cases",
						stops: [
							[{ zoom: 8, value: 0 }, 0],
							[{ zoom: 8, value: maxvalue }, 15],
							[{ zoom: 11, value: 0 }, 0],
							[{ zoom: 11, value: maxvalue }, 90],
							[{ zoom: 16, value: 0 }, 0],
							[{ zoom: 16, value: maxvalue }, 600]
						]
					},
					"circle-opacity": 0.9,
					"circle-stroke-color": "black",
					"circle-stroke-width": 3,
					"circle-color": "rgba(255,255,255,0)"
				},
				filter: ["==", "ctyua19cd", ""]
			},
			"place_suburb"
		);

		var bounds = new mapboxgl.LngLatBounds();

		areas.features.forEach(function(feature) {
			bounds.extend(feature.geometry.coordinates);
		});

		map.fitBounds(bounds);
	});

	map.on("mousemove", "corona", onMove);
	map.on("mouseleave", "corona", onLeave);
	map.on("click", "corona", onClick);

	function onMove(e) {
		var oldctyua19cd = "ff";

		newctyua19cd = e.features[0].properties.ctyua19cd;

		if (newctyua19cd != oldctyua19cd) {
			oldctyua19cd = e.features[0].properties.ctyua19cd;

			map.setFilter("coronahover", [
				"==",
				"ctyua19cd",
				e.features[0].properties.ctyua19cd
			]);

			var features = map.queryRenderedFeatures(e.point, {
				layers: ["coronahover"]
			});

			if (features.length != 0) {
				setAxisVal(features[0].properties.ctyua19nm, features[0].properties.cases);
			}
		}
	}

	function onClick(e) {
		var oldctyua19cd = "ff";
		newctyua19cd = e.features[0].properties.ctyua19cd;

		if (newctyua19cd != oldctyua19cd) {
			oldctyua19cd = e.features[0].properties.ctyua19cd;
			map.setFilter("coronahover", [
				"==",
				"ctyua19cd",
				e.features[0].properties.ctyua19cd
			]);

			setAxisVal(
				e.features[0].properties.ctyua19nm,
				e.features[0].properties.cases
			);
		}
	}

	function onLeave() {
		map.setFilter("coronahover", ["==", "ctyua19cd", ""]);
		oldlsoa11cd = "";
		hideaxisVal();
	}

	function setAxisVal(areanm, areaval) {
		d3
			.select("#keyvalue")
			.style("font-weight", "bold")
			.html(function() {
				if (!isNaN(areaval)) {
					return areanm + "<br>" + areaval + " confirmed cases";
				} else {
					return areanm + "<br>No data available";
				}
			});
	}

	function hideaxisVal() {
		d3
			.select("#keyvalue")
			.style("font-weight", "bold")
			.text("");
	}
}
