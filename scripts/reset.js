const fs = require("fs");

const outputDirectory = "dist";

// clear dist folder
fs.rmSync(outputDirectory, { recursive: true, force: true });
console.log(`deleted "${outputDirectory}" folder`);

// re-create dist folder
fs.mkdirSync(outputDirectory, { recursive: true });