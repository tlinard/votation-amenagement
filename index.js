// peremt de compter le nombre de fois que l'animation de l'infobox a été executée, on limite à 3
var animation_count = 0;

/*
  donnees des resultats
*/
// objet avec les resultats
var results = {
  canton: res_cantons,
  district: res_districts,
  commune: res_communes,
}

// recupere les resultats en fonction de l'id et du type de region
function get_region_data(id, feature_type){
  for (var i = 0; i < results[feature_type].length; i++){
    if (results[feature_type][i].id == id){
      return results[feature_type][i];
    }
  }
  // pas de donnée
  return null
}

/* 
  initialisation de la carte
*/
// initialise la carte
var mymap = L.map('map');
mymap.setView([46.82, 8.28], 8);
mymap.setMinZoom(8);
mymap.setMaxBounds([[48.76, 12.68], [44.81, 3.89]]);

// fond de carte
var background_map = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
	maxZoom: 16
});
background_map.addTo(mymap);

// objet avec les couches
var layers = {
  canton: create_layer(cantons, "canton"),
  district: create_layer(districts, "district"),
  commune: create_layer(communes, "commune"),
}

// cree une couche geojson
function create_layer(data, feature_type){
  return L.geoJSON(data, {
    style: function (feature) {
      return {
        "fillColor": region_color(feature.properties.id, feature_type), // choisit la couleur en fonction du pourcentage de oui
        "color": "white",
        "weight": 0.4,
        "opacity": 1,
        "fillOpacity": 1,
      }
    },
    onEachFeature: function (feature, layer) {
      layer.bindTooltip(feature.properties.nom + '<br>' + get_region_data(feature.properties.id, feature_type).p_oui + '%', { sticky: true });
      layer.on({
        // affiche les resultats quand la region est clique
        click: function (e) { display_region_data(e, feature_type);},

        // souligne la region quand la souris passe dessus
        mouseover: function (e) { highlight_feature(e); },

         // reninitialise le style quand la souris quitte
        mouseout: function (e) { reset_highlight(e); },
      });
    }
  })
}

// associe une couleur en fonction du pourcentage de oui
function region_color(id, feature_type){
  p_oui = get_region_data(id, feature_type).p_oui

  // gris regions sans donnees
  if (p_oui == null) return "gray"

  // rouge regions <= 50p de oui
  if (p_oui <= 20) return "#b2182b";
  if (p_oui <= 30) return "#d6604d";
  if (p_oui <= 40) return "#f4a582";
  if (p_oui <= 50) return "#fddbc7";

  // bleu regions > 50p de oui
  if (p_oui <= 60) return "#d1e5f0";
  if (p_oui <= 70) return "#92c5de";
  if (p_oui <= 80) return "#4393c3";
  if (p_oui <= 100) return "#2166ac";

  // valeur non valable
  return "gray"
}

// couche initiale a afficher
mymap.addLayer(layers.commune);

/*
  interactivite sur la carte
*/
// souligne la region
highlight_feature = function(e) {
  var layer = e.target;

  layer.setStyle({
    color: 'black',
    weight: 2,
  });

  if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
    layer.bringToFront();
  }
}

// reinitialise le style
reset_highlight = function(e) {
  var layer = e.target;

  layer.setStyle({
    color: 'white',
    weight: 0.4,
  });

  if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
    layer.bringToFront();
  };
}

// change le tete dans l'infobox en fonction de la région sélectionnée
function display_region_data(e, feature_type){

  // cherche l'id du de la region selectionnee
  id = e.target.feature.properties.id

  // recupere les donnes en fonction de l'id
  region_data = get_region_data(id, feature_type);

  // cree le contenu de l'infobox a partir des donnees
  var text = '<table class="infotable">';
  text += '<tr>';
  text +=   '<td class="label"><b>' + feature_type.charAt(0).toUpperCase() + feature_type.slice(1) + '</b>:</td>';
  text +=   '<td>' + e.target.feature.properties.nom + '</td>';
  text += '</tr><tr>';
  text +=   '<td class="label"><b>Electeurs inscrits:</b></td>';
  text +=   '<td>' + region_data.electeurs_inscrits + '</td>';
  text += '</tr><tr>';
  text +=   '<td class="label"><b>Taux de participation:</b></td>';
  text +=   '<td>' + region_data.p_participation + '%</td>';
  text += '</tr><tr>';
  text +=   '<td class="label"><b>Bulletins valables:</b></td>';
  text +=   '<td>' + region_data.bulletins_valables + '</td>';
  text += '</tr><tr>';
  text +=   '<td class="label"><b>Oui:</b></td>';
  text +=   '<td>' + region_data.oui + '</td>';
  text += '</tr><tr>';
  text +=   '<td class="label"><b>Non:</b></td>';
  text +=   '<td>' + region_data.non + '</td>';
  text += '</tr><tr>';
  text +=   '<td class="label"><b>Pourcentage Oui:</b></td>';
  text +=   '<td>' + region_data.p_oui + '%</td>';
  text += '</tr><tr>';  
  
  // remplace le texte dans l'infobox
  $('.infobox').html(text);

  // animation de l'infobox pour les 3 premieres regions selectionnees
  if (animation_count < 3) {
    for (let i = 0; i < 3; i++) {
      $('.infobox').fadeOut(250).fadeIn(250);
    }
    animation_count += 1;
  }
}

/*
  choix de la couche
*/
// ecouteur d'evenement sur le bouton pour changer la couche
document.querySelectorAll('input[name="regionButton"]').forEach(function(radio) {
  radio.addEventListener('change', function() {
    var selected_value = document.querySelector('input[name="regionButton"]:checked').value;
    
    var selected_region = null

    // associe le bouton a la region
    if (selected_value == 1){
      selected_region = "canton";
    }
    if (selected_value == 2){
      selected_region = "district";
    }
    if (selected_value == 3){
      selected_region = "commune";
    }

    // enleve les couches
    for(feature_type in layers){
      mymap.removeLayer(layers[feature_type]);
    }
    
    // ajoute la couche desiree
    mymap.addLayer(layers[selected_region]);

    // change la legende
    change_legend(selected_region);
  });
});

// change la legende en fonction de la couche
function change_legend(feature_type){
  var text_max = "";
  var text_80 = "";
  var text_min = "";
  var col_fill_box = "";
  var col_box = "";
  var col_line = "";

  // cantons
  if (feature_type == "canton"){
    text_80 = "Max: 78.11% (Basel-Stadt)"
    text_min = "Min: 19.65% (Valais)"
    col_fill_box = "#eee";
    col_box = "#eee";
    col_line = "#eee";
  }
  
  // districts
  if (feature_type == "district"){
    text_max = "Max: 80.32% (Bezirk Solothurn)"
    text_80 = "80%"
    text_min = "Min: 11.69% (District d'Entremont)"
    col_fill_box = "#2166ac";
    col_box = "black";
    col_line = "black";
  }
  
  // communes
  if (feature_type == "commune"){
    text_max = "Max: 86.21% (Hüniken)"
    text_80 = "80%"
    text_min = "Min: 6% (Evolène)"
    col_fill_box = "#2166ac";
    col_box = "black";
    col_line = "black";
  }

  // remplace le texte dans la légende
  $('.max').html(text_max);
  $('.80p').html(text_80);
  $('.min').html(text_min);

  // change couleur de la box max
  document.getElementsByClassName("box_max")[0].style.fill = col_fill_box;
  document.getElementsByClassName("box_max")[0].style.stroke = col_box;
  document.getElementsByClassName("line_max")[0].style.stroke = col_line;
}