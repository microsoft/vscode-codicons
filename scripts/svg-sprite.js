const SVGSpriter = require("svg-sprite");
const path = require("path");
const fs = require("fs");
const opts = require("minimist")(process.argv.slice(2));
const config = {
  mode: {
    symbol: {
      dest: opts.outDir,
      sprite: opts.outFile,
    },
  },
};
const spriter = new SVGSpriter(config);
const mapping = require("../src/template/mapping.json");

const mappingEntries = Object.entries(mapping);

const findNames = (symbol) => {
  return mappingEntries.filter(([_, s]) => s === symbol).map(([name]) => name);
};

mappingEntries.forEach(([mappedName, symbol]) => {
  // Use path.join for cross-platform compatibility
  const file = path.join(__dirname, '..', 'src', 'icons', `${mappedName}.svg`);

  if (fs.existsSync(file)) {
    for (const name of findNames(symbol)) {
      // Use path.join for cross-platform compatibility
      const svgPath = path.join(__dirname, '..', 'src', 'icons', `${name}.svg`);
      spriter.add(
        svgPath,
        name + ".svg",
        fs.readFileSync(file, "utf-8"),
      );
    }
  }
});

spriter.compile(function (error, result, data) {
  // Use path.join for cross-platform compatibility
  const outDirPath = path.resolve(opts.outDir);
  fs.mkdirSync(outDirPath, { recursive: true });
  fs.writeFileSync(result.symbol.sprite.path, result.symbol.sprite.contents);
});
