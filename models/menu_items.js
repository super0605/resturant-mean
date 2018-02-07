// jshint esversion: 6, node: true

"use strict";

const mongoose = require('mongoose');
// mongoose.Promise = global.Promise;
const config = require('../config/database');

const MenuItemsSchema = mongoose.Schema({
  id: {
    type: String,
    // required: true,
  },
  short_name: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  special_instructions: {
    type: String
  },
  price_small: {
    type: String
  },
  price_large: {
    type: String
  },
  small_portion_name: {
    type: String
  },
  large_portion_name: {
    type: String
  },
  image_present: {
    type: String,
    default: true,
  }
});

const MenuItems = module.exports = mongoose.model('MenuItems', MenuItemsSchema);


module.exports.getMenuItems = function(shortname, callback) {
  if (shortname === null) {
    MenuItems.
    find().
    select('id short_name name description price_small price_large small_portion_name large_portion_name image_present').
    exec(callback);
  } else {
    MenuItems.
      find({ short_name: new RegExp(eval('/^'+shortname+'[0-9]*/i'))}).
      select('id short_name name description price_small price_large small_portion_name large_portion_name image_present').
      exec(callback);
  }
};

module.exports.insertMenuItem = function(menuitem, callback) {
  const newMenuItem = new MenuItems(menuitem);
  newMenuItem.save(callback);
};

module.exports.deleteMenuItem = function(shortname, callback) {
  MenuItems.find({ short_name: shortname }).remove(callback);
};

module.exports.deleteMenuItems = function(shortname, callback) {
  MenuItems.find({ short_name: new RegExp(eval('/^'+shortname+'[0-9]*/i')) }).remove(callback);
};
