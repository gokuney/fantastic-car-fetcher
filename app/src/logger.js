const winston = require('winston')

const DEBUG = true;

const getLabel = function (callingModule) {
    var parts = callingModule.filename.split('/');
    return parts[parts.length - 2] + '/' + parts.pop();
};

const _transport = new winston.transports.Console({});

module.exports = function( callingModule ){
  
return new winston.createLogger({
  depth: true,
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({format: 'DD-MMM-YYYY HH:mm:ss'}),
    winston.format.align(),
    winston.format.printf(
      info =>  `${info.timestamp}  ${info.level}  [${getLabel(callingModule)}]: ${info.message}`,
      error => `${error.timestamp} ${error.level} [${getLabel(callingModule)}]: ${error.message}`,
      debug => `${debug.timestamp} ${debug.level} [${getLabel(callingModule)}]: ${debug.message}`
    )
  ),
transports: [_transport],
silent: !DEBUG
});
 
}