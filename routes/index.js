var express = require("express");
var router = express.Router();
var axios = require("axios");

// require("dotenv").config();
require("dotenv").config({ debug: true });
const mapsAPI = process.env.MAPS_API;
const weatherAPI = process.env.WEATHER_API;

/* GET home page. */
router.get("/", (req, res) => {
  res.send("Hello World!");
});

// 1. Add an endpoint ​that receives an address and validate if its valid. This address must be in an object with the properties street, streetNumber, town, postalCode and country.

router.post("/address", (req, res) => {
  const street = req.body.street.replace(/[ ,]+/g, "+");
  const streetNumber = req.body.streetNumber;
  const town = req.body.town;
  const postalCode = req.body.postalCode;
  const country = req.body.country;
  let finalAddress =
    street + "+" + streetNumber + "+" + town + "+" + postalCode + "+" + country;
  axios
    .get(
      `https://geocoder.ls.hereapi.com/6.2/geocode.json?apiKey=${mapsAPI}&searchtext=${encodeURIComponent(
        finalAddress
      )}`
    )
    .then((response) => {
      if (response.data["Response"]["View"].length < 1) {
        res.send({ valid: false });
      } else {
        res.send({ valid: true });
      }
    })
    .catch((error) => res.status(400).send("Invalid data"));
});

// 3. Add an endpoint ​that receives an address, validate it and check the weather for the lat/lon of that address.
router.post("/address/weather", async (req, res) => {
  let location = { latitude: 0, longitude: 0 };

  const street = req.body.street.replace(/[ ,]+/g, "+");
  const streetNumber = req.body.streetNumber;
  const town = req.body.town;
  const postalCode = req.body.postalCode;
  const country = req.body.country;
  let finalAddress =
    street + "+" + streetNumber + "+" + town + "+" + postalCode + "+" + country;
  try {
    let result = await axios.get(
      `https://geocoder.ls.hereapi.com/6.2/geocode.json?apiKey=${mapsAPI}&searchtext=${encodeURIComponent(
        finalAddress
      )}`
    );

    if (result.data["Response"]["View"].length < 1) {
      res.status(400).send({ message: "Address is invalid" });
    } else {
      let latitude =
        result.data["Response"]["View"][0]["Result"][0]["Location"][
          "DisplayPosition"
        ]["Latitude"];
      let longitude =
        result.data["Response"]["View"][0]["Result"][0]["Location"][
          "DisplayPosition"
        ]["Longitude"];

      location = {
        latitude: latitude,
        longitude: longitude,
      };
      let weatherResult = await axios.get(
        `http://api.openweathermap.org/data/2.5/weather?lat=${location.latitude}&lon=${location.longitude}&appid=${weatherAPI}&units=metric`
      );

      // if(weatherResult.data && weatherResult.data["weather"] && weatherResult.data["main"]["temp"])
      let weather = weatherResult.data["weather"][0]["main"];
      let temp = weatherResult.data["main"]["temp"];

      let weatherResponse = {
        temperature: temp,
        weather: weather,
      };
      res.send(weatherResponse);
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
