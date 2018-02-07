// jshint esversion: 6, node: true

"use strict";

const mongoose = require('mongoose');
const config = require('../config/database');
mongoose.Promise = global.Promise;
const CategorySchema = mongoose.Schema({
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
  special_instructions: {
    type: String
  }
});

const Category = module.exports = mongoose.model('Category', CategorySchema);

module.exports.getCategories = function(tag, callback) {
  if (tag === null) {
    Category.
      find().
      // sort('id').
      select('id short_name name special_instructions url').
      exec(callback);
    } else {
      Category.
        find({ short_name: tag }).
        select('id short_name name special_instructions url').
        exec(callback);
    }
};


module.exports.insertCategory = function(category, callback) {
  const newCategory = new Category(category);
  newCategory.save(callback);
};

module.exports.editBlog = function(blog, callback) {
  Blog.findOneAndUpdate({ _id: blog.id}, { $set: { heading: blog.heading, tags: blog.tags, body: blog.body, modifiedDate: blog.modifiedDate }}).
  exec(callback);
};

module.exports.deleteCategory = function(shortname, callback) {
  Category.find({ short_name: shortname }).remove(callback);
};
