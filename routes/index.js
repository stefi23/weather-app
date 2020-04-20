var express = require("express");
var router = express.Router();
var axios = require("axios");

require("dotenv").config();
const mapsAPI = process.env.MAPS_API;
const weatherAPI = process.env.WEATHER_API;

/* GET home page. */
router.get("/", (req, res) => {
  res.send("Check address at /address; Check weather at /address/weather");
});

// 1. Add an endpoint ​that receives an address and validate if its valid. This address must be in an object with the properties street, streetNumber, town, postalCode and country.

router.post("/address", async (req, res) => {
  let { street, streetNumber, town, postalCode, country } = req.body;
  try {
    let response = await getMapsApiResult(
      street,
      streetNumber,
      town,
      postalCode,
      country
    );
    res.send({ valid: isAddressValid(response) });
  } catch (error) {
    res.status(400).send("Invalid data");
  }
});

// 3. Add an endpoint ​that receives an address, validate it and check the weather for the lat/lon of that address.
router.post("/address/weather", async (req, res) => {
  let { street, streetNumber, town, postalCode, country } = req.body;
  try {
    let response = await getMapsApiResult(
      street,
      streetNumber,
      town,
      postalCode,
      country
    );

    if (!isAddressValid(response)) {
      res.status(400).send({ message: "Address is invalid" });
      return;
    }
    if (!isPositionValid(response)) {
      res
        .status(500)
        .send({ message: "Position doesn't exit for this address" });
      return;
    }
    let displayPosition =
      response.data["Response"]["View"][0]["Result"][0]["Location"][
        "DisplayPosition"
      ];
    let weatherResult = await getWeatherApiResult(displayPosition);

    if (!(isWeatherValid(weatherResult) && isTemperatureValid(weatherResult))) {
      res.status(500).send({
        message: "API cannot find weather and temprature for that position",
      });
      return;
    }
    let weather = weatherResult.data["weather"][0]["main"];
    let temp = weatherResult.data["main"]["temp"];

    let weatherResponse = {
      temperature: temp,
      weather: weather,
    };
    res.send(weatherResponse);
  } catch (error) {
    res.status(500).send(error);
  }
});

const isAddressValid = (response) => {
  return (
    response &&
    response.data &&
    response.data["Response"] &&
    response.data["Response"]["View"] &&
    response.data["Response"]["View"].length === 1
  );
};

const isPositionValid = (response) => {
  return (
    response.data["Response"]["View"][0] &&
    response.data["Response"]["View"][0]["Result"] &&
    response.data["Response"]["View"][0]["Result"][0] &&
    response.data["Response"]["View"][0]["Result"][0]["Location"] &&
    response.data["Response"]["View"][0]["Result"][0]["Location"][
      "DisplayPosition"
    ]
  );
};

const isWeatherValid = (weatherResult) => {
  return (
    weatherResult &&
    weatherResult.data &&
    weatherResult.data["weather"] &&
    weatherResult.data["weather"][0] &&
    weatherResult.data["weather"][0]["main"]
  );
};

const isTemperatureValid = (weatherResult) => {
  return weatherResult.data["main"] && weatherResult.data["main"]["temp"];
};

const getMapsApiResult = async (
  street,
  streetNumber,
  town,
  postalCode,
  country
) => {
  street = street.replace(/[ ,]+/g, "+");
  let finalAddress =
    street + "+" + streetNumber + "+" + town + "+" + postalCode + "+" + country;
  return await axios.get(
    `https://geocoder.ls.hereapi.com/6.2/geocode.json?apiKey=${mapsAPI}&searchtext=${encodeURIComponent(
      finalAddress
    )}`
  );
};

const getWeatherApiResult = async (displayPosition) => {
  let { Latitude, Longitude } = displayPosition;
  return await axios.get(
    `http://api.openweathermap.org/data/2.5/weather?lat=${Latitude}&lon=${Longitude}&appid=${weatherAPI}&units=metric`
  );
};

module.exports = router;
