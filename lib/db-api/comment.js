/**
 * Module dependencies.
 */

var mongoose = require('mongoose')
  , Comment = mongoose.model('Comment')
  , log = require('debug')('democracyos:db-api:comment')

/**
 * Get all comments
 *
 * @param {Function} fn callback function
 *   - 'err' error found while process or `null`
 *   - 'comments' list items found or `undefined`
 * @return {Module} `comment` module
 * @api public
 */

exports.all = function all(fn) {
  log('Looking for all comments.')

  Comment.find(function (err, comments) {
    if (err) {
      log('Found error %j', err);
      return fn(err);
    };

    log('Delivering comments %j', mapByProperty(proposals, 'id'));
    fn(null, proposals);
  });

  return this;
};

/**
 * Create comment for `proposal` by `author`
 * with `text`
 *
 * @param {String} proposal to submit comment
 * @param {Object} comment comment vars like `text` and `author`
 * @param {Function} fn callback function
 *   - 'err' error found while process or `null`
 *   - 'comments' list items found or `undefined`
 * @api public
 */

exports.create = function create(comment, fn) {
  log('Creating new comment %j for %s %s', comment.text, comment.context, comment.reference);
  
  var comment = new Comment(comment);

  comment.save(function (err) {
    if (err) {
      log('Found error %s', err);
      return fn(err);
    };
    comment.populate('author', function(err) {
      if (err) {
        log('Found error %s', err)
        return fn(err);
      };
      
      log('Delivering comment %j', comment);
      fn(null, comment);
    });
  });
};

/**
 * Get comments for proposal
 *
 * @param {String} proposal to get comments from
 * @param {Function} fn callback function
 *   - 'err' error found while process or `null`
 *   - 'comments' list items found or `undefined`
 * @api public
 */

exports.getFor = function getFor(query, fn) {
  log('Looking for comments for %s %s', query.context, query.reference);

  Comment
  .find(query)
  .populate('author', 'id firstName lastName fullName avatar')
  .sort('-createdAt')
  .exec(function(err, comments) {
    if (err) {
      log('Found error %j', err);
      return fn(err);
    };

    log('Delivering comments %j', comments);
    fn(null, comments);
  });
};

/**
 * Reply to comment
 *
 * @param {String} commentId to attach reply
 * @param {Object} reply object with params
 * @param {Function} fn callback function
 *   - 'err' error found while process or `null`
 *   - 'comments' list items found or `undefined`
 * @api public
 */

exports.reply = function reply(commentId, reply, fn) {
  log('Looking for comment %s to reply with %j', commentId, reply);

  Comment.findById(commentId, function(err, comment) {
    if (err) {
      log('Found error %j', err);
      return fn(err);
    };

    log('Creating a reply for comment %j', comment);
    var doc = comment.replies.create(reply);
    comment.replies.push(doc);

    comment.save(function(err, saved) {
      if (err) {
        log('Found error %j', err)
      };

      log('Delivering reply %j', doc);
      fn(null, doc);
    });
  });
};

/**
 * Upvote comment
 *
 * @param {String} id
 * @param {Citizen|ObjectId|String} citizen
 * @param {Function} fn callback function
 *   - 'err' error found while process or `null`
 *   - 'comment' list items found or `undefined`
 * @api public
 */

exports.upvote = function upvote(id, citizen, fn) {
  Comment.findById(id, function(err, comment) {
    if (err) return log('Found error %s', err), fn(err);

    log('Upvoting comment %s', comment.id);
    comment.vote(citizen, 'positive', function(err) {
      if (err) return log('Found error %s', err), fn(err);

      log('Delivering comment %s', comment.id);
      fn(null, comment);
    });
  });
};

/**
 * Downvote comment
 *
 * @param {String} id
 * @param {Citizen|ObjectId|String} citizen
 * @param {Function} fn callback function
 *   - 'err' error found while process or `null`
 *   - 'comments' list items found or `undefined`
 * @api public
 */

exports.downvote = function downvote(id, citizen, fn) {
  Comment.findById(id, function(err, comment) {
    if (err) return log('Found error %s', err), fn(err);

    log('Downvoting comment %s', comment.id);
    comment.vote(citizen, 'negative', function(err) {
      if (err) return log('Found error %s', err), fn(err);

      log('Delivering comment %s', comment.id);
      fn(null, comment);
    });
  });
};

/**
 * Flag comment as spam
 *
 * @param {String} id
 * @param {Citizen|ObjectId|String} citizen
 * @param {Function} fn callback function
 *   - 'err' error found while process or `null`
 *   - 'comment' list items found or `undefined`
 * @api public
 */

exports.flag = function flag(id, citizen, fn) {
  Comment.findById(id, function(err, comment) {
    if (err) return log('Found error %s', err), fn(err);

    log('Upvoting comment %s', comment.id);
    comment.flag(citizen, 'spam', function(err) {
      if (err) return log('Found error %s', err), fn(err);

      log('Delivering comment %s', comment.id);
      fn(null, comment);
    });
  });
};

/**
 * Unflag comment as spam
 *
 * @param {String} id
 * @param {Citizen|ObjectId|String} citizen
 * @param {Function} fn callback function
 *   - 'err' error found while process or `null`
 *   - 'comments' list items found or `undefined`
 * @api public
 */

exports.unflag = function unflag(id, citizen, fn) {
  Comment.findById(id, function(err, comment) {
    if (err) return log('Found error %s', err), fn(err);

    log('Downvoting comment %s', comment.id);
    comment.unflag(citizen, function(err) {
      if (err) return log('Found error %s', err), fn(err);

      log('Delivering comment %s', comment.id);
      fn(null, comment);
    });
  });
};

/**
 * Map array of objects by `property`
 *
 * @param {Array} source array of objects to map
 * @param {String} property to map from objects
 * @return {Array} array of listed properties
 * @api private
 */

function mapByProperty (source, property) {
  return source.map(function(item) { return item[prop]; });
};