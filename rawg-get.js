const axios = require("axios");

module.exports = function rawgGet(path, params) {
  return axios.get(`https://api.rawg.io/api${path}`, {
    params: { ...params, key: process.env.RAWG_API_KEY },
  });
};
