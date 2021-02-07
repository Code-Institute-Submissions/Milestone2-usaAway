/*---------- google maps and places api------------
code used and edited from google maps documentation and google code labs more details and link in readme */

// Global Variables
let map;
let infoWindow;
let currentInfoWindow;
let service;
let infoPane;
let markers = [];
let markerCluster;

// Function to render map onto page for each destination area.
const renderMap = (area) => {
  if (area) {
    // to desplay info when markers are clicked
    infoWindow = new google.maps.InfoWindow();
    currentInfoWindow = infoWindow;
    const mapArea = area;
    map = new google.maps.Map(document.getElementById("map"), mapArea);
    /* Adds map panel for search results*/
    infoPane = document.getElementById("panel");
  } else {
    document.getElementById(
      "map"
    ).innerHTML = `<h3>Opps something has gone wrong with the map. Please contact us so we can fix the error.</h3>`;
  }
};

/* Function to search for different places in each area using Google places nearbySearch and a keyword */
const placesSearch = (keyword) => {
  let request = {
    bounds: map.getBounds(),
    keyword: keyword,
  };
  service = new google.maps.places.PlacesService(map);
  service.nearbySearch(request, callBack);
};

/*Callback function that will call the createMarkers if the request was succsessful */

const callBack = (results, status) => {
  /*first remove previous clusters */
  removePreviousCluster();
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    createMarkers(results);
    markerCluster = new MarkerClusterer(map, markers, {
      imagePath:
        "https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m",
    });
  } else {
    alert(
      "Something went wrong. Please contact us so we can look into this issue."
    );
  }
};

/* Function to create markers for the search taken from the google documentation and google codelab tutorials*/

const createMarkers = (places) => {
  /* first remove previous markers*/
  removePreviousMarkers();
  places.forEach((place) => {
    let marker = new google.maps.Marker({
      position: place.geometry.location,
      map: map,
      title: place.name,
      animation: google.maps.Animation.DROP,
    });
    /* From stack overflow push markers into an array to be used in the markerClusterer function */
    markers.push(marker);
    /* adds and event listener for each marker to show its details */
    google.maps.event.addListener(marker, "click", () => {
      let request = {
        placeId: place.place_id,
        fields: [
          "name",
          "formatted_address",
          "geometry",
          "rating",
          "website",
          "photos",
        ],
      };
      service.getDetails(request, (placeResult, status) => {
        showDetails(placeResult, marker, status);
      });
    });
  });
};
/* sows details of each place to the map info */
const showDetails = (placeResult, marker, status) => {
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    let placeInfowindow = new google.maps.InfoWindow();
    let rating = "None";
    if (placeResult.rating) {
      rating = placeResult.rating;
    }
    placeInfowindow.setContent(
      `<div class="window-text"><strong> ${placeResult.name} </strong><br> Rating:${rating}</div>`
    );
    placeInfowindow.open(marker.map, marker);
    currentInfoWindow.close();
    currentInfoWindow = placeInfowindow;
    /* calls showpanel function */
    showPanel(placeResult);
  } else {
    console.log("showDetails failed: " + status);
  }
};

/* Functions to remove markers and markers cluster when a new search happens */
const removePreviousMarkers = () => {
  if (markers.length) {
    markers.forEach((marker) => {
      marker.setMap(null);
    });
    markers = [];
  }
};

const removePreviousCluster = () => {
  if (markerCluster) {
    markerCluster.setMap(null);
  }
};

/* Function to show panel with details about each place */

const showPanel = (placeResult) => {
  let image = document.querySelector(".result-img-container");
  let heading = document.querySelector(".result-heading");
  let rating = document.querySelector(".rating");
  let address = document.querySelector(".result-address");
  let webAddress = document.querySelector(".web-address");
  /* closes infopane if it is open  */
  if (infoPane.classList.contains("open")) {
    infoPane.classList.remove("open");
    infoPane.classList.add("hidden");
  }
  /* shows image if there is one otherwise lets user know that there wasn't one found */
  if (placeResult.photos) {
    photo = placeResult.photos[0].getUrl();
    image.innerHTML = `
        <img src="${photo}" alt="image ${placeResult.name}" class="result-img center">
        `;
  } else {
    image.innerHTML = `<p class="no-result"> No Image Available for this choice </p>`;
  }
  /* renders heading */
  heading.innerHTML = `
    <h3>${placeResult.name}</h3>
    `;
  /* shows ratinf if there is one otherwise lets user know that there wasn't one found */
  if (placeResult.rating) {
    rating.innerHTML = `
        <p>Rating: ${placeResult.rating} \u272e</p>
        `;
  } else {
    rating.innerHTML = `
        <p>No ratings found </p>
        `;
  }
  /* renders address */
  address.innerHTML = `
      <p>${placeResult.formatted_address}</p>
      `;
  /* shows webaddress if there is one otherwise lets user know that there wasn't one found */
  if (placeResult.website) {
    webAddress.innerHTML = `
          <a href="${placeResult.website}" target="_blank">Web Page</a>
          `;
  } else {
    webAddress.innerHTML = `
          <p>No web address found</p>
          `;
  }
  /* opens the infopane */
  infoPane.classList.remove("hidden");
  infoPane.classList.add("open");
};

/* Event listeners for each button to make the search */
document.getElementById("shopping-btn").addEventListener("click", () => {
  placesSearch("shopping");
});
document.getElementById("attraction-btn").addEventListener("click", () => {
  placesSearch("tourist attraction");
});
document.getElementById("parks-btn").addEventListener("click", () => {
  placesSearch("parks");
});
document.getElementById("restaurant-btn").addEventListener("click", () => {
  placesSearch("restaurant");
});
document.getElementById("bars-btn").addEventListener("click", () => {
  placesSearch("bar");
});