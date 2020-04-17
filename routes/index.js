var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", (req, res) => {
  res.send("Hello World!");
});
router.get("/address", (req, res) => {
  res.send("Hello address!");
});
router.get("/address/weather", (req, res) => {
  res.send("Hello weather!");
});

module.exports = router;
