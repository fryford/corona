var pymParent = new pym.Parent("example-0", "stackedbar/index.html", {
	title: "Case numbers over time"
});
var pymParent = new pym.Parent("example-1", "map/index.html", { title: "Map showing case numbers by area" });
var pymParent = new pym.Parent("example-2", "barchart/index.html", {
	title: "Bar chart showing case numbers by area"
});

var numberFormat = d3.format(",");

var totalFeatureService =
	"https://services1.arcgis.com/0IrmI40n5ZYxTUrV/arcgis/rest/services/DailyIndicators/FeatureServer/0/query?f=json&where=1%3D1&returnGeometry=false&spatialRel=esriSpatialRelIntersects&outFields=*&resultOffset=0&resultRecordCount=50&cacheHint=true";
//https://services1.arcgis.com/0IrmI40n5ZYxTUrV/arcgis/rest/services/DailyIndicators/FeatureServer/0/query?f=json&where=1%3D1&returnGeometry=false&spatialRel=esriSpatialRelIntersects&outFields=*&resultOffset=0&resultRecordCount=50&cacheHint=true
d3.json(totalFeatureService, function(error, totalsData) {

	console.log(totalsData)
	var caseValues = totalsData.features[0].attributes;
	const date = new Date(caseValues.DateVal);
	const ddmmyyyy =
		date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();

	document.getElementById("last-updated-date").innerText = ddmmyyyy;
	document.getElementById("bignum-uk-cases").innerText = numberFormat(
		caseValues.TotalUKCases
	);
	document.getElementById("bignum-uk-new-cases").innerText = numberFormat(
		caseValues.NewUKCases
	);
	document.getElementById("bignum-uk-deaths").innerText = numberFormat(
		caseValues.TotalUKDeaths
	);
	document.getElementById("bignum-england-cases").innerText = numberFormat(
		caseValues.EnglandCases
	);
	document.getElementById("bignum-scotland-cases").innerText = numberFormat(
		caseValues.ScotlandCases
	);
	document.getElementById("bignum-wales-cases").innerText = numberFormat(
		caseValues.WalesCases
	);
	document.getElementById("bignum-ni-cases").innerText = numberFormat(
		caseValues.NICases
	);
});
