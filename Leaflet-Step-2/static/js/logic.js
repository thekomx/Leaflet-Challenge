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
                satellite : 'mapbox/satellite-v9',
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
const mapbox = 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}';
const depthColor = ['#0000FF','#00FFFF', '#00FF80', '#40FF00', '#BFFF00', '#FFFF00', '#FFBF00', '#FF8000', '#ff0000'];


function layer_Color_Picker(num){
    let n = (num/10).toFixed(0);

    if(n < 0){n = 0}
    else if(n > 8){n = 8}

    return depthColor[n]
}

function create_Legend(legend){
    legend.onAdd = ()=>{
        let div= L.DomUtil.create('div', 'info legend');
        let grades = depthColor;
        let labels = ['< 10 Km.', '10 - 20 Km.', '20 - 30 Km.', '30 - 40 Km.', '40 - 50 Km.', '50 - 60 Km.', '60 - 70 Km.', '70 - 80 Km.', '> 80 Km.'];

        div.innerHTML += '<h4>Hypocenter Depth</h4>';
        for(let i=0; i < grades.length; i++){
            div.innerHTML += `<h4><i style="background:${grades[i]}"></i> ${labels[i]}</h4>`
        }
        return div
    }
}

var tileStreets = Object.assign({}, tileObj);
var tileOutdoors = Object.assign({}, tileObj);
var tileLight = Object.assign({}, tileObj);
var tileSatellite = Object.assign({}, tileObj);
var tileSatellite_streets = Object.assign({}, tileObj);

tileStreets.id = mapMode.streets;
tileOutdoors.id = mapMode.outdoors;
tileLight.id = mapMode.light;
tileSatellite.id = mapMode.satellite;
tileSatellite_streets.id = mapMode.satellite_streets;

const defTileLayer = L.tileLayer(mapbox, tileObj);
const StreetsTileLayer = L.tileLayer(mapbox, tileStreets);
const OutdoorsTileLayer = L.tileLayer(mapbox, tileOutdoors);
const LightTileLayer = L.tileLayer(mapbox, tileLight);
const SatelliteTileLayer = L.tileLayer(mapbox, tileSatellite);
const Satellite_streetsTileLayer = L.tileLayer(mapbox, tileSatellite_streets);

const allTileLayers = [StreetsTileLayer, OutdoorsTileLayer, LightTileLayer, SatelliteTileLayer, Satellite_streetsTileLayer, defTileLayer];

const myMap = L.map('mapid', {center : [25,0], zoom : 3});
L.layerGroup(allTileLayers).addTo(myMap);

var legend = L.control({position: 'bottomright'});
create_Legend(legend);
legend.addTo(myMap);

const baseMaps={
                'Streets': StreetsTileLayer,
                'Outdoors': OutdoorsTileLayer,
                'Satellite': SatelliteTileLayer,
                'Satellite_streets': Satellite_streetsTileLayer,
                'Light': LightTileLayer,
                'Dark(default)' : defTileLayer
                }
const overlayMaps= {}

d3.json('./static/data/PB2002_plates.json').then(data=>{
    let geojsonFeature = {};
    let geojsonData = [];
    data.features.forEach(d=>{
        geojsonFeature={
                    'type' : 'Feature',
                    'marker_options' : {
                                        'color' : 'green',
                                        'opacity': 0.5,
                                        'fillOpacity': 0,
                                        'weight' : 1
                                        },
                    'geometry':{
                                'type' : d.geometry.type,
                                'coordinates': d.geometry.coordinates
                                }
                    }
        geojsonData.push(geojsonFeature)
    })
    overlayMaps['Plates'] = L.geoJSON(geojsonData,{style : (feature)=>feature.marker_options}).addTo(myMap)
})

d3.json(dataURL.past_day).then(data=>{
    let geojsonFeature = {};
    let geojsonData = [];
    data.features.forEach(d=>{
        geojsonFeature={
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
        geojsonData.push(geojsonFeature)
    })
    overlayMaps['Earth Quake'] = L.geoJSON(geojsonData,{pointToLayer :(feature, latlng)=>L.circleMarker(latlng, feature.marker_options)})
                                    .bindPopup(layer=>layer.feature.properties.popupContent)
                                    .addTo(myMap);

    L.control.layers(baseMaps, overlayMaps).addTo(myMap)
})