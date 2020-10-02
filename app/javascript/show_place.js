

/*
 マーカー表示
  name : 名称
  vicinity : 近辺住所
  lat : 緯度
  lng : 経度
*/
function createMarker(name, vicinity, lat, lng) {

  //マーカー表示する位置のMap表示
  var map = new google.maps.Map(document.getElementById("mapArea"), {
    zoom: 15,
    center: new google.maps.LatLng(lat, lng),
    mapTypeId: google.maps.MapTypeId.ROADMAP
  });

  //マーカー表示
  var marker = new google.maps.Marker({
    map: map,
    position: new google.maps.LatLng(lat, lng)
  });

  //情報窓の設定
  var info = "<div style=\"min-width: 100px\">";
  info += name + "<br />";
  info += vicinity + "<br />";
  info += "<a href=\"https://maps.google.co.jp/maps?q=" + encodeURIComponent(name + " " + vicinity) + "&z=15&iwloc=A\"";
  info += " target=\"_blank\">⇒詳細表示</a><br />";
  info += "<a href=\"https://www.google.com/maps/dir/?api=1&destination=" + lat + "," + lng + "\"";
  info += " target=\"_blank\">⇒ここへ行く</a>";
  info += "</div>";

  //情報窓の表示
  var infoWindow = new google.maps.InfoWindow({
    content: info
  });
  infoWindow.open(map, marker);

  //マーカーのクリック時にも情報窓を表示する
  marker.addListener("click", function () {
    infoWindow.open(map, marker);
  });
}