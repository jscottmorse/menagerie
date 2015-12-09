/**
 * Built-in Log Configuration
 * (sails.config.log)
 *
 * Configure the log level for your app, as well as the transport
 * (Underneath the covers, Sails uses Winston for logging, which
 * allows for some pretty neat custom transports/adapters for log messages)
 *
 * For more information on the Sails logger, check out:
 * http://sailsjs.org/#!/documentation/concepts/Logging
 */
'use strict';

var path = require('path'),
  pkgJSON = require(path.resolve('package.json')),
  df = require('date-formatter');

module.exports.log = {

  /***************************************************************************
  *                                                                          *
  * Valid `level` configs: i.e. the minimum log level to capture with        *
  * sails.log.*()                                                            *
  *                                                                          *
  * The order of precedence for log levels from lowest to highest is:        *
  * silly, verbose, info, debug, warn, error                                 *
  *                                                                          *
  * You may also set the level to "silent" to suppress all logs.             *
  *                                                                          *
  ***************************************************************************/

  level: 'info',
  enabled: true,
  timestamp: true,
  colorize: true,
  prettyPrint: true,

  transports: [
    {
      module: require('winston-daily-rotate-file'),
      enabled: false,
      config: {
        dirname: path.resolve('logs'),
        datePattern: 'yyyy-MM-dd.log',
        filename: pkgJSON.name,
        timestamp: true,
        colorize: false,
        maxsize: 1024 * 1024 * 10,
        json: false,
        prettyPrint: true,
        depth: 10,
        tailable: true,
        zippedArchive: true,
        level: 'silly'
      }
    }
  ]
};

function makeLogStreamName() {
    return df(new Date(), 'YYYY/MM/DD');
}
