$(document).ready(() => {
// Global Variables
const apiKey = "d28ff4135a52661e6397d3345d7f6119";

var savedCities;
var lastCitySearched;
var cities = [];

if (localStorage.getItem("cities")) {
    savedCities = JSON.parse(localStorage.getItem("cities"));
    // console.log(savedCities);
    for (var i = 0; i < savedCities.length; i++) {
        lastCitySearched = savedCities.length - 1;
        var lastCity = savedCities[lastCitySearched];
    }
} else {
    cities;
}
// console.log(cities);
renderLastCity();

// City Search on click function
$("#search-city").on("click", function (event) {
    
    event.preventDefault();
    var city = $("#city-input").val();

    // AJAX fetch() GET request
    var weatherURL1 =
        "https://api.openweathermap.org/data/2.5/weather?q=" +
        city +
        "&appid=" +
        apiKey;

    $.ajax({
        url: weatherURL1,
        method: "GET",
    }).then(function (response) {
        console.log(response);
        lat = response.coord.lat;
        lon = response.coord.lon;

        // add city data to cities array and save in localStorage
        cities.push(city);
        localStorage.setItem("cities", JSON.stringify(cities));

        // list cities searched 
        var cityList = $("<li>");
            cityList.addClass("list-group-item city-item");
            cityList.text(response.name);
            cityList.attr("lat", response.coord.lat);
            cityList.attr("lon", response.coord.lon);
            cityList.css("background-color", "lightgray");
            cityList.css("color", "blue");
            $("#city-list").prepend(cityList);

        // City List item on click function render city data/forecast
        cityList.on("click", function () {
            lat = $(this).attr("lat");
            lon = $(this).attr("lon");
            renderCityName(response);
            renderCityInfo(lat, lon);
        });
        renderCityName(response);
        renderCityInfo(lat, lon);
    });
});

function renderLastCity() {
    $("#city-list").clear;
    var weatherURL2 =
        "https://api.openweathermap.org/data/2.5/weather?q=" +
        lastCity +
        "&appid=" +
        apiKey;

    $.ajax({
        url: weatherURL2,
        method: "GET",
    }).then(function (response) {
        console.log(response);
        lat = response.coord.lat;
        lon = response.coord.lon;

        renderCityName(response);
        renderCityInfo(lat, lon);
    });
}

function renderCityName(response) {
    //get current date and interpolate city name, date and weather icon
    var currentDate = moment().format("L");
    $(".card-title").text(`${response.name} (${currentDate})`);
    
    var weatherIcon = $("<img>");
    var iconCode = response.weather[0].icon;
    var iconUrl = "http://openweathermap.org/img/wn/" + iconCode + ".png";
    weatherIcon.attr("src", iconUrl);
    $(".card-title").append(weatherIcon);
}

// render current weather conditions for city
function renderCityInfo(lat, lon) {
    var weatherURL3 =
        "https://api.openweathermap.org/data/2.5/onecall?lat=" +
        lat +
        "&lon=" +
        lon +
        "&units=imperial&appid=" +
        apiKey;

    $.ajax({
        url: weatherURL3,
        method: "GET",
    }).then(function (response) {
        // render city name, date, weather icon, the temperature, the humidity, the wind speed, and ..
        $("#temperature").text(`Temperature: ${response.current.temp} \xB0F`);
        $("#humidity").text(`Humidity: ${response.current.humidity}%`);
        $("#wind-speed").text(`Wind Speed: ${response.current.wind_speed} MPH`);
        $("#uv-index").text(`UV Index: `);

        // UV index with a color that indicates whether the conditions
        var uviSpan = $("<span>");
        uviSpan.text(`${response.current.uvi}`);
        
        var uvi = response.current.uvi;
        if (uvi <= 2) {
            uviSpan.addClass("badge badge-success");
        } else if (uvi <= 5) {
            uviSpan.addClass("badge badge-warning");
        } else if (uvi <= 7) {
            uviSpan.addClass("badge");
            uviSpan.css("background-color", "orange");
        } else if (uvi <= 9) {
            uviSpan.addClass("badge badge-danger");
        } else {
            uviSpan.addClass("badge");
            uviSpan.css("background-color", "rebeccapurple");
            uviSpan.css("color", "white");
        }
        $("#uv-index").append(uviSpan);

       
        cityForecast(response);
    });
}

 // 5-Day Forecast
function cityForecast(response) {
    $("#forecast").empty();
   var days = response.daily;

    // index [1 - 5] of the city daily array (next 5days after current day)
    days.slice(1, 6).map((day) => {
        var dayCard = $("<div>");
        
        dayCard.addClass("card col-md-5 daycard");
        dayCard.css("background-color", "lightskyblue");
        dayCard.css("font-size", "20px");

        var dayCardBody = $("<div>");
        dayCardBody.addClass("card-body");
        dayCard.append(dayCardBody);

        var dayCardName = $("<h6>");
        dayCardName.addClass("card-title");
        
        // take the date of the response object and format it to (MM/DD/YYYY)
        var datestamp = moment.unix(day.dt);
        var forecastDate = datestamp.format("L");
        dayCardName.text(forecastDate);
        dayCardBody.append(dayCardName);

        //take the icon of the response object and set the url to the src of the iconURL
        var weatherIcon = $("<img>");
        var iconCode = day.weather[0].icon;
        var iconUrl = "http://openweathermap.org/img/wn/" + iconCode + ".png";
        weatherIcon.attr("src", iconUrl);
        dayCardBody.append(weatherIcon);

        var dayTemp = $("<p>");
        dayTemp.text(`Temp: ${day.temp.max} \xB0F`);
        dayCardBody.append(dayTemp);

        var dayHumidity = $("<p>");
        dayHumidity.text(`Humidity: ${day.humidity}%`);
        dayCardBody.append(dayHumidity);

        $("#forecast").append(dayCard);
    });
}

});