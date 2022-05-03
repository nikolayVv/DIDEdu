var byName = document.getElementById("searchByName");
var byCountry = document.getElementById("searchByCountry");
var byCity = document.getElementById("searchByCity");
var input = document.getElementById("searchInput");

var currMessage = 'Search by name...';

byName.onclick = function() {
    currMessage = 'Search by name...';
    input.placeholder = currMessage;
}

byCountry.onclick = function() {
    currMessage = 'Search by country...'
    input.placeholder = currMessage;
}

byCity.onclick = function() {
    currMessage = 'Search by city...'
    input.placeholder = currMessage;
}

input.onfocus = function () {
    input.placeholder = '';
}

input.onblur = function() {
    input.placeholder = currMessage;
}