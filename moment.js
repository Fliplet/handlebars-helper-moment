/*
 * Handlebars Helper: Moment.js
 * @author: https://github.com/Arkkimaagi
 * Built for Assemble: the static site generator and
 * component builder for Node.js, Grunt.js and Yeoman.
 * http://assemble.io
 *
 * Copyright (c) 2014, Brian Woodward, Jon Schlinkert
 * Licensed under the MIT license.
 */

/*jshint node:true */
'use strict';
module.exports.register = function (Handlebars, options, params) {
  var moment  = require('moment-timezone');
  var _       = require('lodash');

  Handlebars.registerHelper('moment', function (context, block) {
    if (context && context.hash) {
      block = _.cloneDeep(context);
      context = undefined;
    }

    var date = moment(context);

    if (block.hash.inputFormat) {
      date = moment(context, block.hash.inputFormat);
    }

    if (block.hash.timezone){
      date.tz(block.hash.timezone);
    }

    // Array of parameters to ignore
    var ignoreParameters = [
      'inputFormat',
      'referenceTime',
      'ignoreFromNowSuffix',
      'ignoreToNowSuffix'
    ];

    // Array of display function to support, in priority order
    var displayFunctions = [
      'calendar',
      'fromNow',
      'toNow',
      'format'
    ];

    // Reset the language back to default before doing anything else
    date.lang('en');

    for (var i in block.hash) {
      if (_.includes(ignoreParameters, i) || _.includes(displayFunctions, i)) {
        continue;
      } else if (typeof date[i] === 'function') {
        date = date[i](block.hash[i]);
      } else {
        console.log('moment.js does not support "' + i + '"');
      }
    }

    _.some(displayFunctions, function (func) {
      if (!block.hash.hasOwnProperty(func)) {
        return false;
      }

      switch (func) {
        // Support for special parameters and syntax in display functions
        case 'calendar':
          date = date.calendar(block.hash.referenceTime);
          break;
        case 'fromNow':
          date = date.fromNow(block.hash.ignoreFromNowSuffix);
          break;
        case 'toNow':
          date = date.toNow(block.hash.ignoreToNowSuffix);
          break;
        default:
          if (typeof date[func] === 'function') {
            date = date[func](block.hash[func]);        
          }
          break;
      }
      return true;
    });

    return date;
  });

  Handlebars.registerHelper('duration', function (context, block) {
    if (context && context.hash) {
      block = _.cloneDeep(context);
      context = 0;
    }
    var duration = moment.duration(context);
    var hasFormat = false;

    // Reset the language back to default before doing anything else
    duration = duration.lang('en');

    for (var i in block.hash) {
      if (i === 'format') {
        hasFormat = true;
      }
      else if (duration[i]) {
        duration = duration[i](block.hash[i]);
      } else {
        console.log('moment.js duration does not support "' + i + '"');
      }
    }

    if (hasFormat) {
      duration = duration.format(block.hash.format);
    }
    return duration;
  });
};
