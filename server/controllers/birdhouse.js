'use strict';
import config from '../../config'
import { parseString } from 'xml2js'
import request from 'koa-request'

//Explanation here http://blog.stevensanderson.com/2013/12/21/experiments-with-koa-and-javascript-generators/
function parseXMLThunk(response){
  //console.log(response);
  return function(callback) {
    parseXMLAsync(response, callback);
  };
}

function parseXMLAsync(response, callback){
  parseString(response, function (err, result) {
    //console.log(result);
    callback(null, result);
  });
}

module.exports.getCapabilities = function * list(next) {
  if ('GET' != this.method) return yield next;
  var options = {
    url: config.pavics_birdhouse_path
  };
  var response = yield request(options); //Yay, HTTP requests with no callbacks!
  this.body = yield parseXMLThunk(response.body);
};
