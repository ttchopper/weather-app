
import skyconsFunc from 'skycons/skycons';
let getWeather;
(function() {
    const Skycons= skyconsFunc(window);
    const skycons = new Skycons({"color": "#778287"});

    const googleGeocodingKey = 'AIzaSyDThdmlF6wBbpCKnwlTjE4PfwGH1PNOEjw';
    const forecastKey = 'fd04ff7341fc4b8ab8f77437a7c22c09';

    navigator.geolocation.getCurrentPosition((position) => {
        let {latitude, longitude} = position.coords;
        let darkSkyURL = `https://api.darksky.net/forecast/${forecastKey}/${latitude},${longitude}?units=ca&callback=index.getWeather`;
        let googleGeocodingURL = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${googleGeocodingKey}`;


        // Create script
        var s = document.createElement('script'); 
        s.src = darkSkyURL;
        document.body.appendChild(s);

        // Cb function for script      
        getWeather = (url) => { 
        function getGeocode(url) {
            return new Promise((resolve, reject) => {
                let xhr = new XMLHttpRequest();
                xhr.open('GET', url);
                xhr.send();

                xhr.onload = function() {
                    resolve(JSON.parse(xhr.responseText));
                };
            });
        }

        // Wait till all data are retrieved
        Promise.all([url, getGeocode(googleGeocodingURL)])
            .then((result) => {
                let temperature = document.querySelector('.temperature');
                let location = document.querySelector('.location');
                let dateContainer = document.querySelector('.date-container');
                let date = new Date();
                let condition = document.querySelector('.weather-conditions');
                let windSpeed = document.querySelector('.wind-speed span');
                let humidity = document.querySelector('.humidity span');
                let cloudCover = document.querySelector('.cloud-cover span');
                condition.innerHTML = result[0].currently.summary;
                windSpeed.innerHTML = Math.round(result[0].currently.windSpeed) + ' KPH';
                humidity.innerHTML = result[0].currently.humidity * 100 + ' %';
                cloudCover.innerHTML = result[0].currently.cloudCover * 100 + ' %';
                dateContainer.innerHTML = date.toString().slice(4, 7).toUpperCase() + '<br>' + date.toString().slice(8, 10);
                temperature.innerHTML = Math.round(result[0].currently.temperature) + "℃";
                location.innerHTML = result[1].results[0].address_components[2].short_name + ', ' + 
                                     result[1].results[0].address_components[5].long_name;
                skycons.add("icon1", result[0].currently.icon);
                skycons.play();
            });
        };
    }); 

    let toggler = document.querySelector('.toggler');
    toggler.onclick = function(e) {
        this.classList.toggle('f');
        let prevEl = this.parentNode.previousElementSibling;
        let nextEl = this.parentNode.nextElementSibling;
        let temperature = document.querySelector('.temperature');
        if(prevEl.className === 'active') {
            prevEl.classList.remove('active');
            nextEl.classList.add('active');
            temperature.innerHTML = Math.round(temperature.innerHTML.replace(/(℃|℉)$/g, '') * 1.8 + 32) + '℉';
        } else {
            nextEl.classList.remove('active');
            prevEl.classList.add('active');
            temperature.innerHTML = Math.round((temperature.innerHTML.replace(/(℃|℉)$/g, '') - 32) / 1.8) + '℃';
        }
    };
})();

export {getWeather};