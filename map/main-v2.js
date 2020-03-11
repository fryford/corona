var pymChild = new pym.Child();

d3.queue()
		.defer(d3.csv, "data/data.csv")
		.defer(d3.json, "data/countyuabound.json")
		.defer(d3.json, "data/countyua.json")
		.await(ready);


    function ready (error, data, geogbound, geog){

//convert topojson to geojson
for(key in geog.objects){
  var areas = topojson.feature(geog, geog.objects[key])
}

for(key in geogbound.objects){
  var areabounds = topojson.feature(geogbound, geogbound.objects[key])
}

bounds = turf.extent(areabounds);

//set map to total extent
setTimeout(function(){
  map.fitBounds([[bounds[0],bounds[1]], [bounds[2], bounds[3]]])
},1000);

console.log(bounds)

const areabyid = [];
const cases =[];
const cases2 =[];

data.forEach(function(d,i) { cases[d.areacd] = +d.cases; cases2[i] = +d.cases; areabyid[d.areacd] = d.areanm});

var maxvalue = d3.max(cases2);

    areas.features.map(function(d,i) {
      if(cases[d.properties.ctyua19cd]>=0) {
		      d.properties.cases = cases[d.properties.ctyua19cd];
      } else {
         d.properties.cases = 0;
      }
		});

const map = new mapboxgl.Map({
  container: 'map',
  style: 'data/style.json',
  center: [-3.5,52.355,],
  zoom: 6,
  // center: [0, 20]
});

map.on('load', () => {

  map.addSource('area', { 'type': 'geojson', 'data': areas });

  map.addSource('areabound', { 'type': 'geojson', 'data': areabounds});


    map.addLayer({
      "id": "coronabound",
      "type": "line",
      "source": 'areabound',
      "minzoom": 8,
      "maxzoom": 20,
      "layout": {},
      "paint": {
        "line-color": "grey",
        "line-width": 1
      }
    }, 'place_suburb');

  map.addLayer({
    "id": "corona",
    'type': 'circle',
    'source': 'area',
    //"source-layer": "OA_all",
    'paint': {
      'circle-radius': {
          property: 'cases',
          stops: [
          [{zoom: 8, value: 0}, 0],
          [{zoom: 8, value: maxvalue}, 15],
          [{zoom: 11, value: 0}, 0],
          [{zoom: 11, value: maxvalue}, 90],
          [{zoom: 16, value: 0}, 0],
          [{zoom: 16, value: maxvalue}, 600]
          ]
      },
      'circle-opacity': 0.9,
      'circle-color': {
          property: 'cases',
          stops: [
          [0, '#f1f075'],
          [maxvalue, '#e55e5e']
          ]
      }
    }
  }, 'place_suburb');




});

}
