const Dotenv = require('dotenv-webpack');

module.exports = {
  plugins: [
    new Dotenv({
      path: './.env', // Load environment variables from the .env file
    }),
  ],
};
