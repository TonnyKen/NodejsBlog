var mongodb = require('./db');

function Blog(name, title, content, head){
  this.name = name;
  this.title = title;
  this.content = content;
  this.head = head;
}

module.exports = Blog;

//Save blogs
Blog.prototype.save = function(callback){
  var date = new Date();
  var time = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +
      date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());
  var blog = {
    name: this.name,
    title: this.title,
    content: this.content,
    time: time,
    date: date,
    comments: [],
    pv : 0,
    head : this.head
  };
  mongodb.open(function (err, db){
    if(err){return callback(err);}
    db.collection('blogs', function (err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      collection.insert(blog,{safe:true},function(err){
        if (err) {return callback(err);}
        callback(null);
      });
    });
  });
};

// Get multi blogs
// Blog.getAll = function(name, callback) {
//   mongodb.open(function (err, db){
//     if(err){return callback(err);}
//     db.collection('blogs', function (err, collection) {
//       if (err) {
//         mongodb.close();
//         return callback(err);
//       }
//       var query = name ? {name:name} : {};
//       collection.find(query).sort({date:-1}).toArray(function(err,docs){
//         mongodb.close();
//         if (err) {return callback(err);}
//         callback(null, docs);
//       });
//     });
//   });
// };

//Get one blog
Blog.getOne = function(name, time, title, callback){
  mongodb.open(function (err, db){
    if(err){return callback(err);}
    db.collection('blogs', function(err, collection){
      if (err) {
        mongodb.close();
        return callback(err);
      }
      collection.find({
        name:name,
        time:time,
        title:title
      }).toArray(function(err,docs){
        if (err) {
          mongodb.close();
          return callback(err);
        }
        collection.update({
          name:name,
          time:time,
          title:title
        },{$inc: {pv:1}},function(err){
          mongodb.close();
          if(err){  return callback(err);}
        });
        callback(null, docs);
      });
    });
  });
};

//get ten blogs
Blog.getTen = function(name, page, callback) {
  mongodb.open(function (err, db) {
    if (err) {return callback(err);}
    db.collection('blogs', function (err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      var query = name ? {name:name} : {};
      collection.count(query, function (err, total) {
        collection.find(query, {
          skip: (page - 1)*10,
          limit: 10
        }).sort({date: -1}).toArray(function (err, docs) {
          mongodb.close();
          if (err) {return callback(err);}
          callback(null, docs, total);
        });
      });
    });
  });
};

//edit own blog
Blog.update = function(name, time, title, newContent, callback){
  mongodb.open(function (err, db){
    if(err){return callback(err);}
    db.collection('blogs', function(err, collection){
      if (err) {
        mongodb.close();
        return callback(err);
      }
      collection.update({
        name:name,
        time:time,
        title:title
      },{$set:{content:newContent}},function(err){
        mongodb.close();
        if (err) {return callback(err);}
        callback(null);
      });
    });
  });
};

Blog.remove = function(name, time, title, callback){
  mongodb.open(function (err, db){
    if(err){return callback(err);}
    db.collection('blogs', function(err, collection){
      if (err) {
        mongodb.close();
        return callback(err);
      }
      collection.remove({
        name:name,
        time:time,
        title:title
      },{w:1},function(err){
        mongodb.close();
        if (err) {return callback(err);}
        callback(null);
      });
    });
  });
};

Blog.search = function(keyword, callback){
  mongodb.open(function (err, db){
    if(err){return callback(err);}
    db.collection('blogs', function(err, collection){
      if (err) {
        mongodb.close();
        return callback(err);
      }
      var pattern = new RegExp(keyword, 'i');
      collection.find({title:pattern},{
        name:1,
        time:1,
        title:1
      }).sort({date:-1}).toArray(function(err, docs){
        mongodb.close();
        if(err){return callback(err);}
        callback(null, docs);
      });
    });
  });
};
