const path = require("path");
const { createCarePathServer } = require("../shared/createCarePathServer");

createCarePathServer({
  rootDir: __dirname,
  defaultPort: 3001,
  appLabel: "mobile"
});
