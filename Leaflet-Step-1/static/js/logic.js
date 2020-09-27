const dataURL ={
                past_hour : 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson',
                past_day : 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson',
                past_week : 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson',
                past_month : 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson'
                }
const mapMode ={
                streets : 'mapbox/streets-v11',
                outdoors : 'mapbox/outdoors-v11',
                light : 'mapbox/light-v10',
                dark : 'mapbox/dark-v10',
                satellite : 'satellite-v9',
                satellite_streets : 'mapbox/satellite-streets-v11'
                }
const tileObj ={
                attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
                maxZoom: 18,
                accessToken: API_KEY,
                id: mapMode.dark,
                tileSize: 512,
                zoomOffset: -1
                }
const deptColor = ['#0000FF','#00FFFF', '#00FF80', '#40FF00', '#BFFF00', '#FFFF00', '#FFBF00', '#FF8000', '#ff0000'];


function layer_Color_Picker(num){
    let n = (num/10).toFixed(0);

    if(n<0){n=0}
    else if(n>8){n=8}

    return deptColor[n]
}


const mapbox = 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}';
const defTileLayer = L.tileLayer(mapbox, tileObj);
const myMap = L.map('mapid').setView([25,0],3);
defTileLayer.addTo(myMap);

d3.json(dataURL.past_day).then(data=>{
    let geoJsonObj = {};
    let geojsonData = [];
    data.features.forEach(d=>{
        geoJsonObj={
                    'type' : 'Feature',
                    'properties' : {
                                    'popupContent' : `<b>${d.properties.place}</b><br>${new Date(d.properties.time)}<br><b>${d.properties.mag}</b> magnitude<br><b>${d.geometry.coordinates[2]}</b> km. dept<br>`
                                    },
                    'marker_options' : {
                                        'radius' : d.properties.mag*7,
                                        'fillColor' : layer_Color_Picker(d.geometry.coordinates[2]),
                                        'color' : 'white',
                                        'weight' : 1,
                                        'opacity' : 1,
                                        'fillOpacity' : 0.2
                                        },
                    'geometry':{
                                'type' : 'Point',
                                'coordinates': d.geometry.coordinates.slice(0,2)
                                }
                    }
        geojsonData.push(geoJsonObj)
    })
    L.geoJSON(geojsonData,{pointToLayer :(feature, latlng)=>L.circleMarker(latlng, feature.marker_options)})
        .bindPopup(layer=>layer.feature.properties.popupContent)
        .addTo(myMap)

})

var legend = L.control({position: 'bottomright'});
legend.onAdd = ()=>{
    let div= L.DomUtil.create('div', 'info legend'),
        grades = deptColor,
        labels = ['< 10 Km.','10 - 20 Km.', '20 - 30 Km.', '30 - 40 Km.', '40 - 50 Km.', '50 - 60 Km.', '60 - 70 Km.', '70 - 80 Km.', '> 80 Km.'];
    div.innerHTML += '<h4></h4>';
    for(let i=0; i < grades.length; i++){
        div.innerHTML += `<h4><i style="background:${grades[i]}"></i> ${labels[i]}</h4>`
    }
    return div
}
legend.addTo(myMap);

myMap.on('click', ()=>L.popup.open(myMap));