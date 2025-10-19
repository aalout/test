const path = require("path");

module.exports = {
  plugins: {
    "postcss-mixins": {
      mixinsDir: path.resolve(__dirname, "shared/styles/mixins"),
    },
  },
};
