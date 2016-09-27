// Initial array of locations

// Make the map
var map;

var locations = [
  {
  name: "Best Western Heritage Inn",
  lat: 37.961810,
  lng: -121.985602,
  id: "4bd5b6e89649ce72368f511d"
  },
  {
  name: "Motel 6",
  lat: 37.970395,
  lng: -122.00884,
  id: "4c3fbf78d691c9b6a1488a0a"
  },
  {
  name: "Hilton Concord",
  lat: 37.971683,
  lng: -122.053990,
  id: "4a678d99f964a520abc91fe3"
  },
  {
  name: "America's Best Value Inn",
  lat: 37.971023,
  lng: -122.011060,
  id: "4bd773a5304fce72f59333ab"
  },
  {
  name: "Courtyard Pleasant Hill",
  lat: 37.946084,
  lng: -122.059781,
  id: "4c10040ece57c928463181d2"
  },
  {
  name: "Hyatt House",
  lat: 37.943975,
  lng: -122.061160,
  id: "4bccc83e0245eee1a24c25b9"
  }
];

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
//Home
  center: {lat: 37.956477, lng: -121.97304},
  zoom: 13,
  disableDefaultUI: false
  });

  ko.applyBindings(new ViewModel());
debugger
}

// Google Maps won't load
function googleError() {
  document.getElementById('mapConcord').innerHTML = "<h2>Google Maps load failed</h2>";
  }
  
  //Create the Hotel list
  var Place = function (data) {
  this.name = ko.observable(data.name);
  this.lat = ko.observable(data.lat);
  this.lng = ko.observable(data.lng);
  this.id = ko.observable(data.id);
  this.description = ko.observable('');
  this.phoneNumber = ko.observable('');
  this.address = ko.observable('');
  this.rating = ko.observable('');
  this.url = ko.observable('');
  this.mapmarker = ko.observable();
  this.photoPrefix = ko.observable('');
  this.photoSuffix = ko.observable('');
  };

var ViewModel = function () {
var self = this;

this.placeList = ko.observableArray([]);
locations.forEach(function (placeItem) {
  self.placeList.push(new Place(placeItem));
});

// Initialize marker
var mapmarker;

// Kudos to FourSquare for the place data
// Get the info from FourSquare
self.placeList().forEach(function (placeItem) {
  mapmarker = new google.maps.Marker({
  position: new google.maps.LatLng(placeItem.lat(), placeItem.lng()),
  map: map
});

placeItem.mapmarker = mapmarker;
// Popup window

var infowindow = new google.maps.InfoWindow({maxWidth: 300,}
);

//Foursquare Client ID KMJOTKHRX2BOMOMPDOCGDI5SEWPRUSLWGQRUPS4EUCFCX5RR
//Foursquare Client Secret XLDUNHRNQFP42SDQPLDFHUP2YWTAJDTKPIUSD2DAOUH13RM4

//json call
$.ajax({
url: 'https://api.foursquare.com/v2/venues/' + placeItem.id() +
'?client_id=KMJOTKHRX2BOMOMPDOCGDI5SEWPRUSLWGQRUPS4EUCFCX5RR&client_secret=XLDUNHRNQFP42SDQPLDFHUP2YWTAJDTKPIUSD2DAOUH13RM4&v=20130815',
dataType: "json",
  success: function (data) {
    // Make results easier to handle
    var result = data.response.venue;
    
    var contact = result.hasOwnProperty('contact') ? result.contact : '';
    if (contact.hasOwnProperty('formattedPhone')) {
    placeItem.phoneNumber(contact.formattedPhone || '');
    }
    
    var location = result.hasOwnProperty('location') ? result.location : '';
    if (location.hasOwnProperty('address')) {
    placeItem.address(location.address || '');
    }
    
    var bestPhoto = result.hasOwnProperty('bestPhoto') ? result.bestPhoto : '';
    if (bestPhoto.hasOwnProperty('prefix')) {
    placeItem.photoPrefix(bestPhoto.prefix || '');
    }
    
    if (bestPhoto.hasOwnProperty('suffix')) {
    placeItem.photoSuffix(bestPhoto.suffix || '');
    }
    
    var description = result.hasOwnProperty('description') ? result.description : '';
    placeItem.description(description || '');
    
    var rating = result.hasOwnProperty('rating') ? result.rating : '';
    placeItem.rating(rating || 'none');
    
    var content = '<div id="iWindow"><h4>' + placeItem.name() + '</h4><div id="pic"><img src="' +
        placeItem.photoPrefix() + '110x110' + placeItem.photoSuffix() +
        '" alt="Image Location"></div><p>Information from Foursquare:</p><p>' +
        placeItem.phoneNumber() + '</p><p>' +
        placeItem.address() + '</p><p>' +
        placeItem.description() + '</p><p>Rating: ' + placeItem.rating() +
        '</p><p><a href=' + placeItem.url() + '>' + placeItem.url()+' </a></p></div>';
    
    google.maps.event.addListener(placeItem.mapmarker, 'click', function () {
    infowindow.open(map, this);
    setTimeout(function () {
        placeItem.mapmarker.setAnimation(google.maps.Animation.BOUNCE);
    }, 1000);
  infowindow.setContent(content);
  });
},
// If Foursquare call fails
error: function (e) {
  infowindow.setContent('<h5>Foursquare data is unavailable. Please try refreshing later.</h5>');
  document.getElementById("error").innerHTML = "<h4>Can't access Foursquare.</h4>";
}
});

google.maps.event.addListener(mapmarker, 'click', function () {
  infowindow.open(map, this);
  setTimeout(function () {
    placeItem.mapmarker.setAnimation(null);
  }, 1000);
});
});

self.showInfo = function (placeItem) {
  google.maps.event.trigger(placeItem.mapmarker, 'click');
  self.hideMapElements();
};

self.toggleNav = ko.observable(false);
  this.mapNavStatus = ko.pureComputed (function () {
  return self.toggleNav() === false ? 'nav' : 'navClosed';
}, this);

self.hideMapElements = function (toggleNav) {
  self.toggleNav(true);
  return true;
};

self.showMapElements = function (toggleNav) {
  self.toggleMapNav(false);
  return true;
};

self.visible = ko.observableArray();

// Show the markers
self.placeList().forEach(function (place) {
  self.visible.push(place);
});

self.userInput = ko.observable('');

//Search Filter
self.filterMarkers = function () {
  var searchInput = self.userInput().toLowerCase();
  self.visible.removeAll();
  self.placeList().forEach(function (place) {
  place.mapmarker.setVisible(false);
// Compare the name of each place to user input
// If user input is included in the name, set the place and marker as visible
    if (place.name().toLowerCase().indexOf(searchInput) !== -1) {
      self.visible.push(place);
  }
});
self.visible().forEach(function (place) {
  place.mapmarker.setVisible(true);
});
};

};
