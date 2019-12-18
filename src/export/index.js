// https://github.com/bitinn/character-map

var opts = require("minimist")(process.argv.slice(2));
var opentype = require("opentype.js");

if (!opts.f || typeof opts.f !== "string") {
  console.log(
    "use -f to specify your font path, TrueType and OpenType supported"
  );
  return;
}

opentype.load(opts.f, function(err, font) {
  if (err) {
    console.log(err);
    return;
  }

  var glyphs = font.glyphs.glyphs;
  if (!glyphs || glyphs.length === 0) {
    console.log("no glyphs found in this font");
    return;
  }

  var table = "short_name,character,unicode";
  for (glyphIndex in glyphs) {
    var glyph = glyphs[glyphIndex];
    var name = glyph.name;
    var unicode = glyph.unicodes.map(formatUnicode).join(", ");
    unicode = unicode.split(",")[0];
    // var character = String.fromCharCode(glyph.unicode);
    var character = String.fromCharCode(parseInt(glyph.unicodes.map(formatUnicode)[0], 16));
    if (unicode) {
      table += "\n" + name + "," + character + "," + unicode;
    }
    
  }

  console.log(table);
});

function formatUnicode(unicode) {
  unicode = unicode.toString(16);
  if (unicode.length > 4) {
    return ("000000" + unicode.toUpperCase()).substr(-6);
  } else {
    return ("0000" + unicode.toUpperCase()).substr(-4);
  }
}
