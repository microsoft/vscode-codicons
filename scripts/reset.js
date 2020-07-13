const fs = require("fs");
const rimraf = require("rimraf");
const flatten = require("@hutsoninc/flatten-dir");

const outputDirectory = "dist";
const iconDirectory = "src/icons/";

// clear dist folder
rimraf(outputDirectory, function () {
  
  console.log(`deleted "${outputDirectory}" folder`);
  
  // re-create dist folder
  fs.mkdirSync(outputDirectory);
});

// flatten all
flatten(iconDirectory)