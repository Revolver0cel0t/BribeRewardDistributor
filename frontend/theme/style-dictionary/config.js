/* eslint @typescript-eslint/no-var-requires: 0 */
/* eslint no-undef: 0 */
/* eslint no-prototype-builtins: 0 */
const StyleDictionary = require("style-dictionary");

/**
 * Outputs an object stripping out everything except values, making keys lowercase
 * @param {Object} obj - The object to minify.
 */
function minifyDictionary(obj, { lowercaseKey, levels }) {
  const lowercase = lowercaseKey && levels && levels > 0;
  if (typeof obj !== "object" || Array.isArray(obj)) {
    return obj;
  }

  const toRet = {};

  if (obj.hasOwnProperty("value")) {
    return obj.value;
  } else {
    for (let name in obj) {
      if (obj.hasOwnProperty(name)) {
        toRet[lowercase ? name.toLocaleLowerCase() : name] = minifyDictionary(obj[name], {
          lowercaseKey,
          levels: levels - 1,
        });
      }
    }
  }
  return toRet;
}

function getDropShadow(jsonValue) {
  const { color, x, y, blur } = jsonValue;
  return `drop-shadow(${x}, ${y}, ${blur}, ${color})`;
}

StyleDictionary.registerFormat({
  name: "json/nested-lowercase-keys",
  formatter: function ({ dictionary }) {
    // 3 levels of font keys to be made lowercase
    return JSON.stringify(minifyDictionary(dictionary.tokens, { lowercaseKey: true, levels: 3 }), null, 2);
  },
});

const whitelistedAttrs = (attrsObj, whitelist) => {
  return Object.keys(attrsObj)
    .filter(attr => whitelist.includes(attr))
    .reduce((memo, key) => {
      memo[key] = attrsObj[key];
      return memo;
    }, {});
};

StyleDictionary.registerFormat({
  name: "json/font-combined-keys",
  formatter: function ({ dictionary }) {
    const whitelist = ["fontFamily", "lineHeight", "fontWeight", "fontSize", "letterSpacing", "textDecoration"];
    // iterate through keys (Body, Heading)
    const textsObj = Object.keys(dictionary.tokens).reduce((memo, key) => {
      const sizes = dictionary.tokens[key];
      // iterate through sizes (M, XL, XS)
      Object.keys(sizes).forEach(sizeKey => {
        // sizekey example: "M-Ultrabold" -> remove Ultrabold
        const newKey = key.toLowerCase() + "-" + sizeKey.toLowerCase();
        // whitelist attrs and create key "b-xl" (type-size)
        memo[newKey] = whitelistedAttrs(sizes[sizeKey].value, whitelist);
      });
      return memo;
    }, {});
    return JSON.stringify(textsObj, null, 2);
  },
});

StyleDictionary.registerFormat({
  name: "json/shadow",
  formatter: function ({ dictionary }) {
    const elevation = Object.keys(dictionary.tokens.Elevation).reduce((memo, key) => {
      const { value } = dictionary.tokens.Elevation[key];
      if (Array.isArray(value)) {
        memo[key.toLowerCase().replace(/\s/g, "")] = getDropShadow(value[0]) + " " + getDropShadow(value[1]);
      } else {
        memo[key.toLowerCase().replace(/\s/g, "")] = getDropShadow(value);
      }
      return memo;
    }, {});

    const glow = Object.keys(dictionary.tokens.Glow).reduce((memo, key) => {
      const { value } = dictionary.tokens.Glow[key];
      memo[key.toLowerCase()] = getDropShadow(value);
      return memo;
    }, {});
    return JSON.stringify({ glow, elevation }, null, 2);
  },
});

module.exports = {
  source: ["properties.json"],
  platforms: {
    javascript: {
      transforms: ["attribute/cti", "name/cti/camel", "size/px", "color/hex"],
      buildPath: "build/",
      files: [
        {
          destination: "color.json",
          format: "json/nested-lowercase-keys",
          filter: function (token) {
            return ["Primary", "Secondary", "Alert", "Success"].includes(token.attributes.category);
          },
        },
        {
          destination: "body.json",
          format: "json/font-combined-keys",
          filter: {
            attributes: {
              category: "Body",
            },
          },
        },
        {
          destination: "heading.json",
          format: "json/font-combined-keys",
          filter: {
            attributes: {
              category: "Heading",
            },
          },
        },
        {
          destination: "gradients.json",
          format: "json/nested-lowercase-keys",
          filter: {
            attributes: {
              category: "Gradients",
            },
          },
        },
        {
          destination: "shadows.json",
          format: "json/shadow",
          filter: function (token) {
            return ["Glow", "Elevation"].includes(token.attributes.category);
          },
        },
      ],
    },
  },
};
