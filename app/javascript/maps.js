// マップの初期表示
let map;

function initMap() {
  map = new google.maps.Map(document.getElementById("mapArea"), {
    center: { lat: 35.6809591, lng: 139.7673068 },
    zoom: 13
  });
};
window.addEventListener('load', initMap);