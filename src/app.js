'use strict';

require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');
const bookmarkRouter = require('./bookmarks/bookmarks-router');

const app = express();

const morganOption = NODE_ENV === 'production' ? 'tiny' : 'common';

// standard middleware
app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(
  // this is validation function for api validations
  function validateBearerToken(req, res, next) {
    const apiToken = process.env.API_TOKEN;
    console.log(apiToken);
    // the authToken always returns with the word 'Bearer'
    const authToken = req.get('Authorization');
    // we want to remote the 'Bearer' with a split
    const realToken = authToken.split(' ')[1];

    if (!authToken || realToken !== apiToken) {
      return res.status(401).json({ error: 'Unauthorized request' });
    }
    // move to the next middleware
    next();
  }
);


// this is the bookmark router that I made to handel each request route. It needs to happen AFTER the validation middleware
app.use(bookmarkRouter);


// error handlers
app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === 'production') {
    response = { error: { message: 'server error, internal error please submit a bug report' } };
  } else {
    console.error(error);
    response = { message: error.message, error };
  }
  res.status(500).json(response);
});


module.exports = app;
