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
router.post("/address", (req, res) => {
  let address = false;
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
      res.send(address == true);
    })
    .catch((error) => res.send(error));
});

// Weather API
router.get("/weather", (req, res) => {
  axios(
    `http://api.openweathermap.org/data/2.5/forecast?q=Barcelona&appid=4214a458bdd687f791e52fd42fb12dd6`
  ).then((response) => res.send(response.data));
});

module.exports = router;
