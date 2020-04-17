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
      res.send({ message: "valid" });
    })
    .catch((error) => res.send(error));
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
    // res.send("done");
  } catch (error) {
    console.error(error);
  }
  try {
    let result = await axios.get(
      `http://api.openweathermap.org/data/2.5/weather?lat=${location.latitude}&lon=${location.longitude}&appid=${weatherAPI}&units=metric`
    );
    let weather = result.data["weather"][0]["main"];
    let temp = result.data["main"]["temp"];
    let weatherResult = {
      temperature: temp,
      weather: weather,
    };
    res.send(weatherResult);
  } catch (error) {
    console.error(error);
  }
});

// router.post("/address/weather", (req, res) => {
//   const street = req.body.street.replace(/[ ,]+/g, "+");
//   const streetNumber = req.body.streetNumber;
//   const town = req.body.town;
//   const postalCode = req.body.postalCode;
//   const country = req.body.country;
//   let finalAddress =
//     street + "+" + streetNumber + "+" + town + "+" + postalCode + "+" + country;
//   try {
//     let result = axios.get(
//       `https://geocoder.ls.hereapi.com/6.2/geocode.json?apiKey=${mapsAPI}&searchtext=${encodeURIComponent(
//         finalAddress
//       )}`
//     );
//     let latitude =
//       result["Response"]["View"][0]["Result"][0]["Location"]["DisplayPosition"][
//         "Latitude"
//       ];
//     console.log(latitude);
//   } catch (error) {
//     console.error(error);
//   }
// });

// Weather API
router.get("/weather", (req, res) => {
  axios(
    `http://api.openweathermap.org/data/2.5/forecast?q=${location.latitude}&appid=${weatherAPI}`
  ).then((response) => res.send(response.data));
});

module.exports = router;
