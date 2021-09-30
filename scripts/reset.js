const fs = require("fs");
const rimraf = require("rimraf");

const outputDirectory = "dist";

// clear dist folder
rimraf(outputDirectory, function () {
  
  console.log(`deleted "${outputDirectory}" folder`);
  
  // re-create dist folder
  fs.mkdirSync(outputDirectory);
});