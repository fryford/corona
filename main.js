var pymParent = new pym.Parent("example-0", "stackedbar/index.html", {});
var pymParent = new pym.Parent("example-1", "map/index.html", {});
var pymParent = new pym.Parent("example-2", "barchart/index.html", {});

var totalFeatureService =
	"https://services1.arcgis.com/0IrmI40n5ZYxTUrV/arcgis/rest/services/DailyIndicators/FeatureServer/0/query?f=json&where=1%3D1&returnGeometry=false&spatialRel=esriSpatialRelIntersects&outFields=*&resultOffset=0&resultRecordCount=50&cacheHint=true";

d3.json(totalFeatureService, function(error, totalsData) {
	var caseValues = totalsData.features[0].attributes;
	const date = new Date(caseValues.DateVal);
	const ddmmyyyy =
		date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();

	document.getElementById("last-updated-date").innerText = ddmmyyyy;
	document.getElementById("bignum-uk-cases").innerText = caseValues.TotalUKCases;
	document.getElementById("bignum-uk-new-cases").innerText =
		caseValues.NewUKCases;
	document.getElementById("bignum-uk-deaths").innerText =
		caseValues.TotalUKDeaths;
	document.getElementById("bignum-england-cases").innerText =
		caseValues.EnglandCases;
	document.getElementById("bignum-scotland-cases").innerText =
		caseValues.ScotlandCases;
	document.getElementById("bignum-wales-cases").innerText =
		caseValues.WalesCases;
	document.getElementById("bignum-ni-cases").innerText = caseValues.NICases;
});
