import React, { useState } from 'react';
import { Oval } from 'react-loader-spinner';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFrown } from '@fortawesome/free-solid-svg-icons';
import './App.css';

function GfGWeatherApp() {
    const [input, setInput] = useState('');
    const [weather, setWeather] = useState({
        loading: false,
        data: {},
        error: false,
    });
    const [forecast, setForecast] = useState([]);
    const [hourlyForecast, setHourlyForecast] = useState([]);

    const toDateFunction = (timestamp) => {
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June', 'July',
            'August', 'September', 'October', 'November', 'December'
        ];
        const WeekDays = [
            'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
        ];
        const currentDate = new Date(timestamp * 1000);  // Convert from Unix timestamp
        const date = `${WeekDays[currentDate.getDay()]} ${currentDate.getDate()} ${months[currentDate.getMonth()]}`;
        return date;
    };

    const search = async (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            setInput(''); // Clear the input field when the search is triggered
            setWeather({ ...weather, loading: true, error: false }); // Reset loading state and error state

            const url = 'https://api.openweathermap.org/data/2.5/forecast';
            const api_key = 'f00c38e0279b7bc85480c3fe775d518c';

            await axios.get(url, {
                params: {
                    q: input,
                    units: 'metric',
                    appid: api_key,
                },
            })
            .then((res) => {
                setWeather({
                    data: res.data,
                    loading: false,
                    error: false,
                });

                const dailyForecast = res.data.list.filter((item, index) => index % 8 === 0);
                const hourlyForecast = res.data.list.slice(0, 6); // First 6 hours

                setForecast(dailyForecast);
                setHourlyForecast(hourlyForecast);
            })
            .catch((error) => {
                setWeather({
                    data: {},
                    loading: false,
                    error: true, // Set error state to true
                });
                setForecast([]); // Clear forecast data
                setHourlyForecast([]); // Clear hourly forecast data
                setInput(''); // Optionally clear input on error
                console.log('error', error);
            });
        }
    };

    const getWeatherClass = (weather) => {
        if (weather && weather.data && weather.data.weather && weather.data.weather.length > 0) {
            const mainWeather = weather.data.weather[0].main.toLowerCase();
            if (mainWeather === 'clear') return 'sunny';
            if (mainWeather === 'rain') return 'rainy';
        }
        return '';
    };

    return (
        <div className={`App ${getWeatherClass(weather)}`}>
            <h1 className="app-name">Weather App</h1>

            {/* Search Bar */}
            <div className="search-bar">
                <input
                    type="text"
                    className="city-search"
                    placeholder="Enter city"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={search}
                />
            </div>

            {/* Loader */}
            {weather.loading && (
                <Oval type="Oval" color="black" height={100} width={100} />
            )}

            {/* Error message */}
            {weather.error && (
                <div className="error-message">
                    <FontAwesomeIcon icon={faFrown} />
                    <span>City not found</span>
                </div>
            )}

            {/* Today's Weather (Detailed) */}
            {weather.data.list && weather.data.list.length > 0 && !weather.error && (
                <div className="weather-info">
                    <div className="city-name">
                        <h2>{weather.data.city.name}, {weather.data.city.country}</h2>
                    </div>
                    <div className="date">
                        <span>{toDateFunction(weather.data.list[0].dt)}</span>
                    </div>
                    <div className="icon-temp">
                        <img
                            src={`https://openweathermap.org/img/wn/${weather.data.list[0].weather[0].icon}@2x.png`}
                            alt={weather.data.list[0].weather[0].description}
                        />
                        {Math.round(weather.data.list[0].main.temp)}<sup className="deg">°C</sup>
                    </div>
                    <div className="des-wind">
                        <p>{weather.data.list[0].weather[0].description.toUpperCase()}</p>
                        <p>Wind Speed: {weather.data.list[0].wind.speed} m/s</p>
                    </div>
                </div>
            )}

            {/* Hourly Forecast (3 left, 3 right) */}
            {hourlyForecast.length > 0 && !weather.error && (
                <div className="hourly-forecast">
                    <div className="hourly-forecast-left">
                        {hourlyForecast.slice(0, 3).map((item, index) => (
                            <div className="hourly-item" key={index}>
                                <div className="hour">
                                    <span>{new Date(item.dt * 1000).getHours()}:00</span>
                                </div>
                                <div className="hourly-icon">
                                    <img
                                        src={`https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`}
                                        alt={item.weather[0].description}
                                    />
                                </div>
                                <div className="hourly-temp">
                                    {Math.round(item.main.temp)}<sup className="deg">°C</sup>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="hourly-forecast-right">
                        {hourlyForecast.slice(3, 6).map((item, index) => (
                            <div className="hourly-item" key={index}>
                                <div className="hour">
                                    <span>{new Date(item.dt * 1000).getHours()}:00</span>
                                </div>
                                <div className="hourly-icon">
                                    <img
                                        src={`https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`}
                                        alt={item.weather[0].description}
                                    />
                                </div>
                                <div className="hourly-temp">
                                    {Math.round(item.main.temp)}<sup className="deg">°C</sup>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Forecast for next few days (Cards) */}
            {forecast.length > 0 && !weather.error && (
                <div className="forecast">
                    {forecast.map((item, index) => (
                        <div className="day-forecast" key={index}>
                            <div className="date">
                                <span>{toDateFunction(item.dt)}</span>
                            </div>
                            <div className="icon-temp">
                                <img
                                    src={`https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`}
                                    alt={item.weather[0].description}
                                />
                                {Math.round(item.main.temp)}<sup className="deg">°C</sup>
                            </div>
                            <div className="description">
                                {item.weather[0].description.toUpperCase()}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default GfGWeatherApp;
