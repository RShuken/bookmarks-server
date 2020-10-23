'use strict';

const express = require('express');

const bookmarkRouter = express.Router();
const bodyParser = express.json();
// require the data store
const bookmarks = require('../bookmarksStore');
// this a function I wrote to create an ID similar to the store we were given, when we return a post request we add this new ID to the result
const uniqueID = require('../bookmarks/createId')
const logger = require('../logger');

bookmarkRouter
  .route("/bookmarks")
  .get((req, res) => {
    // This gets the bookmark array of all bookmarks where idDeleted = false, I use this so we don't directly mutate the data
    const bookmarkArray = bookmarks.filter((x) => !x.isDeleted);

    res.json({ bookmarks: bookmarkArray });
  })
  .post(bodyParser, (req, res) => {
    // move implementation logic into here
    const { title, url, rating, desc } = req.body;

      if (!title || !url || !rating || !desc) {
        logger.error(`Bookmark with incorrect params can not be made.`);
      return res
        .status(400)
        .send("title, url, rating and desc are all required fields");
    }
    // here we create a new object to push to the store that includes an id and a isDeleted boolean
      const newBookmark = { id: uniqueID(), isDeleted: false, ...req.body };
      
      bookmarks.push(newBookmark);
      
    return res.send(newBookmark);
  });

bookmarkRouter
  .route('/bookmarks/:id')
  .get((req, res) => {
    // move implementation logic into here
    
    const bookmarkId = parseInt(req.params.id);
    const bookmark = bookmarks.filter((x) => x.id === bookmarkId);

      if (!bookmark.length) {
        logger.error(`bookmark to get with id of ${bookmarkId} not found.`);
      return res
        .status(404)
        .send('404 Not Found');
    }
  
    res.json({ message: bookmark });
  })
  .delete((req, res) => {
    // this is the function to delete bookmarks, instead of using findIndex then splicing, I didn't want to directly mutate the store. Instead I change a variable called isDeleted to true. The get request only returns bookmarks that have that var set to false.
    const bookmarkId = parseInt(req.params.id);
    const bookmark = bookmarks.filter((x) => x.id === bookmarkId);

      if (!bookmark.length) {
        logger.error(`Bookmark to delete with id ${bookmarkId} not found.`);
      return res.status(404).send('404 Not Found');
    }
    // this is where we change the value to true for isDeleted
    bookmark[0].isDeleted = true; 

    return res
      .status(200)
      .json({ message: 'target bookmark has been deleted', BookmarkStore: bookmarks });
  });

module.exports = bookmarkRouter;

