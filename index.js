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

  var imports = {
    permalink: function (path) {
      return path.join('.');
    },
    signature: function (section) {
      var returns = '';
      var prefix = '';
      if (section.kind === 'class') {
        prefix = 'new ';
      }
      if (section.returns) {
        returns = ': ' +
          formatMarkdown.type(section.returns[0].type, paths);
      }
      return prefix + section.name +
        formatParameters(section) + returns;
    },
    md: function (ast, inline) {
      if (inline && ast && ast.children.length && ast.children[0].type === 'paragraph') {
        return formatMarkdown({
          type: 'root',
          children: ast.children[0].children
        }, paths);
      }
      return formatMarkdown(ast, paths);
    },
    formatType: function (section) {
      if (!section.type.type) {
        console.log('the section is', section);
      }
      return formatMarkdown.type(section.type, paths);
    },
    autolink: function (text) {
      return formatMarkdown.link(paths, text);
    },
    highlight: function (str) {
      return highlight(str);
    }
  };

  var pageTemplate = _.template(fs.readFileSync(path.join(__dirname, 'index.hbs'), 'utf8'), {
    imports: {
      renderSection: _.template(fs.readFileSync(path.join(__dirname, 'section.hbs'), 'utf8'), {
        imports: imports
      }),
      permalink: function (path) {
        return path.join('.');
      },
      highlight: function (str) {
        return highlight(str);
      }
    }
  });

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
};
