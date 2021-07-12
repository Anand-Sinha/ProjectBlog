// jshint esversion:6
const dotenv = require('dotenv');
dotenv.config({ path: "./config.env" });
const mongoose = require('mongoose');
const _ = require('lodash');
const dateFormat = require('dateformat');
dateFormat.masks.blogTime = 'dddd, mmmm dS, yyyy, h:MM:ss TT';

const blogPostSchema = {
  id: String,
  date: String,
  title: String,
  name: String,
  post: String
};
const BlogPost = mongoose.model('BlogPost', blogPostSchema);

var mconnect = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose.connect(mconnect, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).catch(err => {
  console.log(`Mongoose connection error:\n${mconnect}\n${err}`);
});

var Blog = (function() {
  this.fetchPosts = function(callback) {
    BlogPost.find({}, function(err, foundPosts) {
      if (!err) {
        callback(foundPosts);
      } else {
        callback([]);
      }
    });
  };

  this.publish = function(post) {
    const now = new Date();
    const nowString = dateFormat(now, "blogTime");

    post.date = nowString;
    post.id = _.kebabCase(post.title);

    var newBlogPost = new BlogPost(post);
    newBlogPost.save(function(err, insertedPost) {
      if (err) {
        console.log('Problem inserting new blog post into mongo');
      } else {
        console.log(`Inserted document ${insertedPost}`);
      }
    });
  };

  this.findPosts = function(title, callback) {
    const title_id = _.kebabCase(title);
    BlogPost.find({id: title_id}, function(err, foundPosts) {
      if (!err) {
        callback(foundPosts);
      } else {
        callback([]);
      }
    });
  };

  console.log('Blog singleton created');
  return this;
})();

module.exports = Blog;
