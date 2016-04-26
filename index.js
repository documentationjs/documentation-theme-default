'use strict';

var fs = require('fs'),
  path = require('path'),
  File = require('vinyl'),
  vfs = require('vinyl-fs'),
  _ = require('lodash'),
  concat = require('concat-stream'),
  formatMarkdown = require('./lib/format_markdown'),
  formatParameters = require('./lib/format_parameters');

module.exports = function (comments, options, callback) {

  var highlight = require('./lib/highlight')(options.hljs || {});

  var paths = comments.map(function (comment) {
    return comment.path.join('.');
  }).filter(function (path) {
    return path;
  });

  var pageTemplate = _.template(fs.readFileSync(path.join(__dirname, 'index.hbs'), 'utf8'), {
    imports: {
      section: _.template(fs.readFileSync(path.join(__dirname, 'section.hbs'), 'utf8'), {
        imports: {
          permalink: function(path) {
            return path.join('.');
          },
          md: function (string) {
            return formatMarkdown(string, paths);
          },
          formatType: function(section) {
            return formatMarkdown.type(section.type, paths);
          },
          formatParameters: formatParameters
        }
      }),
      permalink: function(path) {
        return path.join('.');
      },
      highlight: function(str) {
        return highlight(str);
      }
    }
  });


  // Handlebars.registerHelper('format_params', formatParameters);


  // Handlebars.registerHelper('format_type', function (type) {
  //   return new Handlebars.SafeString(formatMarkdown.type(type, paths));
  // });

  // Handlebars.registerHelper('autolink', function (text) {
  //   return new Handlebars.SafeString(formatMarkdown.link(paths, text));
  // });

  // push assets into the pipeline as well.
  vfs.src([__dirname + '/assets/**'], { base: __dirname })
    .pipe(concat(function (files) {
      callback(null, files.concat(new File({
        path: 'index.html',
        contents: new Buffer(pageTemplate({
          docs: comments,
          options: options
        }), 'utf8')
      })));
    }));
}
