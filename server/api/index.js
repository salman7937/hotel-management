const { connectDB } = require("../dist/config/db");
const app = require("../dist/app").default;

module.exports = async (req, res) => {
  await connectDB();
  return app(req, res);
};
