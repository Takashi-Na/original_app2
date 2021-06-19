window.addEventListener('load', function () {
  const pushButton = document.getElementById("getPlace");

  pushButton.addEventListener('click', function () {
    /*
     お店情報取得
    */
    let placesList;
    //結果表示クリア
    document.getElementById("results").innerHTML = "";
    //placesList配列を初期化
    placesList = new Array();

    //入力した検索場所を取得
    var addressInput = document.getElementById("addressInput").value;
    if (addressInput == "") {
      return;
    }

    //検索場所の位置情報を取得
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode(
      {
        address: addressInput
      },
      function (results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          //取得した緯度・経度を使って周辺検索
          startNearbySearch(results[0].geometry.location);
        }
        else {
          alert(addressInput + "：位置情報が取得できませんでした。");
        }
      });

    /*
     位置情報を使って周辺検索
      latLng : 位置座標インスタンス（google.maps.LatLng）
    */
    function startNearbySearch(latLng) {

      //読み込み中表示
      document.getElementById("results").innerHTML = "Now Loading...";

      //Mapインスタンス生成
      var map = new google.maps.Map(
        document.getElementById("mapArea"),
        {
          zoom: 15,
          center: latLng,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        }
      );

      //PlacesServiceインスタンス生成
      var service = new google.maps.places.PlacesService(map);

      //入力したKeywordを取得
      var keywordInput = document.getElementById("keywordInput").value;
      //入力した検索範囲を取得
      var obj = document.getElementById("radiusInput");
      var radiusInput = Number(obj.options[obj.selectedIndex].value);

      //周辺検索
      service.nearbySearch(
        {
          location: latLng,
          radius: radiusInput,
          type: ['restaurant'],
          keyword: keywordInput,
          language: 'ja'
        },
        displayResults
      );
    }

    /*
     周辺検索の結果表示
     ※nearbySearchのコールバック関数
      results : 検索結果
      status ： 実行結果ステータス
      pagination : ページネーション
    */
    function displayResults(results, status, pagination) {

      if (status == google.maps.places.PlacesServiceStatus.OK) {

        //検索結果をplacesList配列に連結
        placesList = placesList.concat(results);

        //pagination.hasNextPage==trueの場合、
        //続きの検索結果あり
        if (pagination.hasNextPage) {

          //pagination.nextPageで次の検索結果を表示する
          //※連続実行すると取得に失敗するので、
          //  1秒くらい間隔をおく
          setTimeout(pagination.nextPage(), 1000);

          //pagination.hasNextPage==falseになったら
          //全ての情報が取得できているので、
          //結果を表示する
        } else {

          //ソートを正しく行うため、
          //ratingが設定されていないものを
          //一旦「-1」に変更する。
          for (var i = 0; i < placesList.length; i++) {
            if (placesList[i].rating == undefined) {
              placesList[i].rating = -1;
            }
          }

          //ratingの降順でソート（連想配列ソート）
          placesList.sort(function (a, b) {
            if (a.rating > b.rating) return -1;
            if (a.rating < b.rating) return 1;
            return 0;
          });

          //placesList配列をループして、
          //結果表示のHTMLタグを組み立てる
          var resultHTML = "<ol>";

          for (var i = 0; i < placesList.length; i++) {
            place = placesList[i];

            //ratingが-1のものは「---」に表示変更
            var rating = place.rating;
            if (rating == -1) rating = "---";

            //表示内容（評価＋名称）
            var content = "【" + rating.toFixed(1) + "】 " + place.name;

            //クリック時にMapにマーカー表示するようにAタグを作成
            resultHTML += "<li>";
            resultHTML += "<a href=\"javascript: void(0);\"";

            resultHTML += " onclick=\"createMarker(";
            resultHTML += "'" + place.name + "',";
            resultHTML += "'" + place.vicinity + "',";
            resultHTML += place.geometry.location.lat() + ",";
            resultHTML += place.geometry.location.lng() + ")\">";
            resultHTML += content;
            resultHTML += "</a>";
            resultHTML += "</li>";
          }

          resultHTML += "</ol>";

          //結果表示
          document.getElementById("results").innerHTML = resultHTML;
        }

      } else {
        //エラー表示
        var results = document.getElementById("results");
        if (status == google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
          results.innerHTML = "検索結果が0件です。";
        } else if (status == google.maps.places.PlacesServiceStatus.ERROR) {
          results.innerHTML = "サーバ接続に失敗しました。";
        } else if (status == google.maps.places.PlacesServiceStatus.INVALID_REQUEST) {
          results.innerHTML = "リクエストが無効でした。";
        } else if (status == google.maps.places.PlacesServiceStatus.OVER_QUERY_LIMIT) {
          results.innerHTML = "リクエストの利用制限回数を超えました。";
        } else if (status == google.maps.places.PlacesServiceStatus.REQUEST_DENIED) {
          results.innerHTML = "サービスが使えない状態でした。";
        } else if (status == google.maps.places.PlacesServiceStatus.UNKNOWN_ERROR) {
          results.innerHTML = "原因不明のエラーが発生しました。";
        }
      }
    }
  })
  
  /*
  マーカー表示
  name : 名称
  vicinity : 近辺住所
  lat : 緯度
  lng : 経度
  */
  globalThis.createMarker = function (name, vicinity, lat, lng) {

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
})