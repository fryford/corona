var pymParent = new pym.Parent("example-0", "stackedbar/index.html", {
	title: "Case numbers over time"
});
var pymParent = new pym.Parent("example-1", "map/index.html", { title: "Map showing case numbers by area" });
var pymParent = new pym.Parent("example-2", "barchart/index.html", {
	title: "Bar chart showing case numbers by area"
});
var pymParent = new pym.Parent("example-4", "stackedbardeaths/index.html", {
	title: "Deaths over time"
});

var pymParent = new pym.Parent("example-5", "ratemap/index.html", {
	title: "Map showing rates by area"
});

var numberFormat = d3.format(",");

var parseDate = d3.timeParse("%Y-%m-%d");
var firstFormat = d3.timeFormat("%Y-%m-%d");
var formatDate = d3.timeFormat("%d-%m-%Y");



var totalFeatureService =
	"https://raw.githubusercontent.com/tomwhite/covid-19-uk-data/master/data/covid-19-indicators-uk.csv";
//https://services1.arcgis.com/0IrmI40n5ZYxTUrV/arcgis/rest/services/DailyIndicators/FeatureServer/0/query?f=json&where=1%3D1&returnGeometry=false&spatialRel=esriSpatialRelIntersects&outFields=*&resultOffset=0&resultRecordCount=50&cacheHint=true
d3.csv(totalFeatureService, function(error, totalsData) {

	console.log(totalsData)
	//var caseValues = totalsData.features.attributes;
	//const date = new Date(caseValues.DateVal);
	//const ddmmyyyy =
	//	date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();

	dates = totalsData.map(function(d) {
	    return {
	        "month": parseDate(d.Date)
	    };
	});

	console.log(dates)

	latestDate = d3.max(dates.map(d=>d.month));


	totalcases = totalsData.filter(function(d,i) {
		//console.log(i)
		return d.Date==firstFormat(latestDate) && d.Country == "UK" && d.Indicator == "ConfirmedCases"
	});

	totaldeaths = totalsData.filter(function(d,i) {
		//console.log(d)
		return d.Date==firstFormat(latestDate) && d.Country == "UK" && d.Indicator == "Deaths"
	});


	//var d = new Date();
 	tminus1 = d3.timeDay.offset(latestDate, -1)

	console.log(latestDate)
	console.log(tminus1)

	totalcasesyesterday = totalsData.filter(function(d,i) {
		//console.log(i)
		return d.Date==firstFormat(tminus1) && d.Country == "UK" && d.Indicator == "ConfirmedCases"
	});

	totaldeathsyesterday = totalsData.filter(function(d,i) {
		//console.log(i)
		return d.Date==firstFormat(tminus1) && d.Country == "UK" && d.Indicator == "Deaths"
	});

	totalEngcases = totalsData.filter(function(d,i) {
		//console.log(i)
		return d.Date==firstFormat(latestDate) && d.Country == "England" && d.Indicator == "ConfirmedCases"
	});

	totalScotcases = totalsData.filter(function(d,i) {
		//console.log(i)
		return d.Date==firstFormat(latestDate) && d.Country == "Scotland" && d.Indicator == "ConfirmedCases"
	});

	totalWalescases = totalsData.filter(function(d,i) {
		//console.log(i)
		return d.Date==firstFormat(latestDate) && d.Country == "Wales" && d.Indicator == "ConfirmedCases"
	});

	totalNIcases = totalsData.filter(function(d,i) {
		//console.log(i)
		return d.Date==firstFormat(latestDate) && d.Country == "Northern Ireland" && d.Indicator == "ConfirmedCases"
	});



	totalEngdeaths = totalsData.filter(function(d,i) {
		return d.Date==firstFormat(latestDate) && d.Country == "England" && d.Indicator == "Deaths"
	});

	totalScotdeaths = totalsData.filter(function(d,i) {
		return d.Date==firstFormat(latestDate) && d.Country == "Scotland" && d.Indicator == "Deaths"
	});

	totalWalesdeaths = totalsData.filter(function(d,i) {
		return d.Date==firstFormat(latestDate) && d.Country == "Wales" && d.Indicator == "Deaths"
	});

	totalNIdeaths = totalsData.filter(function(d,i) {
		return d.Date==firstFormat(latestDate) && d.Country == "Northern Ireland" && d.Indicator == "Deaths"
	});



	document.getElementById("last-updated-date").innerText = formatDate(latestDate);
	document.getElementById("bignum-uk-cases").innerText = numberFormat(
		totalcases[0].Value
	);
	document.getElementById("bignum-uk-new-cases").innerText = numberFormat(
		totalcases[0].Value - totalcasesyesterday[0].Value
	);
	document.getElementById("bignum-uk-new-deaths").innerText = numberFormat(
		totaldeaths[0].Value - totaldeathsyesterday[0].Value
	);
	document.getElementById("bignum-uk-deaths").innerText = numberFormat(
		totaldeaths[0].Value
	);
	document.getElementById("bignum-england-cases").innerText = numberFormat(
		totalEngcases[0].Value
	);
	document.getElementById("bignum-scotland-cases").innerText = numberFormat(
		totalScotcases[0].Value
	);
	document.getElementById("bignum-wales-cases").innerText = numberFormat(
		totalWalescases[0].Value
	);
	document.getElementById("bignum-ni-cases").innerText = numberFormat(
		totalNIcases[0].Value
	);

	document.getElementById("bignum-england-deaths").innerText = numberFormat(
		totalEngdeaths[0].Value
	);
	document.getElementById("bignum-scotland-deaths").innerText = numberFormat(
		totalScotdeaths[0].Value
	);
	document.getElementById("bignum-wales-deaths").innerText = numberFormat(
		totalWalesdeaths[0].Value
	);
	document.getElementById("bignum-ni-deaths").innerText = numberFormat(
		totalNIdeaths[0].Value
	);
});
