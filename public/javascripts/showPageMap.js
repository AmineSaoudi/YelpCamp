maptilersdk.config.apiKey = maptilerToken;

const map = new maptilersdk.Map({
  container: 'map', // container's id or the HTML element in which the SDK will render the map
  style: maptilersdk.MapStyle.STREETS,
  center: campground.geometry.coordinates, // starting position [lng, lat]
  zoom: 14 // starting zoom
});

const popup = new maptilersdk.Popup({ offset: 25 })
  .setHTML(`<h5>${campground.title}</h5>`);

const marker = new maptilersdk.Marker()
  .setLngLat(campground.geometry.coordinates)
  .setPopup(popup)
  .addTo(map);