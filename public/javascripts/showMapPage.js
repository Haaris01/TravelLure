mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/navigation-day-v1', // style URL
    center: campgroundLoc.geometry.coordinates, // starting position [lng, lat]
    zoom: 8 // starting zoom
});

const marker = new mapboxgl.Marker()
    .setLngLat(campgroundLoc.geometry.coordinates)
    .setPopup(new mapboxgl.Popup().setHTML(
            `<h4>${campgroundLoc.title}</h4>
            <p>${campgroundLoc.location}</p>`
        ))
    .addTo(map);
    map.addControl(new mapboxgl.NavigationControl());
