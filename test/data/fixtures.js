/*jslint node: true, indent: 2, white: true, vars: true */
/*globals suite, test, setup, suiteSetup, suiteTeardown, done, teardown */
'use strict';

// Libraries
var request = require('request');
var makeSlug = require('slugs');

var settings = require('../../settings');

// Models
var Org = require('../../lib/models/Org');
var Survey = require('../../lib/models/Survey');
var User = require('../../lib/models/User');
var Response = require('../../lib/models/Response');

var fixtures = {};
module.exports = fixtures;

var BASEURL = 'http://localhost:' + settings.port + '/api';
var BASE_HTTPS = 'https://localhost:' + settings.testSecurePort + '/api';
var BASE_LOGOUT_URL = 'http://localhost:' + settings.port + '/logout';
var USER_URL = BASE_HTTPS + '/user';

request = request.defaults({
  strictSSL: false
});

fixtures.surveys = {
  "surveys" : [ {
    "name": "Just a survey",
    "description": "Testing the description",
    "location": "Detroit",
    "users": ["A", "B"]
  } ]
};

fixtures.clearResponses = function(callback) {
  Response.remove({}, function(error, result){
    if(error) {
      callback(error);
      return;
    }
    callback();
  });
};

fixtures.clearSurveys = function(callback) {
  Survey.remove({}, function(error, result){
    if(error) {
      callback(error);
      return;
    }
    fixtures.clearResponses(callback);
  });
};


fixtures.users = [{
    'name': 'User A',
    'email': 'a@localdata.com',
    'password': 'password'
  }, {
    'name': 'User B',
    'email': 'b@localdata.com',
    'password': 'drowssap'
  }
];

fixtures.clearUsers = function(callback) {
  User.remove({}, function(error, result){
    if(error) {
      console.log(error);
    }
    callback();
  });
};

fixtures.makeUser = function makeUser(name) {
  var slug = makeSlug(name);
  return {
    name: name,
    email: slug + '@localdata.com',
    password: 'pw' + slug
  };
};

/**
 * Add a single user to the system
 * done is given a request cookie jar, user ID, and user data (including password).
 * @param {Function} callback Params (error, jar, userId, user)
 */
fixtures.addUser = function addUser(name, done) {
  var data = fixtures.makeUser(name);
  var jar = request.jar();
  request.post({
    url: USER_URL,
    json: data,
    jar: jar
  }, function (error, response, user) {
    if (error) { return done(error); }
    if (response.statusCode !== 200) {
      return done(new Error('Received an incorrect status from the API'));
    }
    user.password = data.password;
    done(null, jar, user._id, user);
  });
};

/**
 * Clear all users and create a new user.
 * Callback is given a request.jar cookie jar.
 * @param  {Function} callback Params (error, jarA, jarB, userIdA, userIdB)
 */
fixtures.setupUser = function(callback) {

  var jarA = request.jar();
  var jarB = request.jar();
  var idA;

  fixtures.clearUsers(function(){

    // Create one user
    request.post({
        url: USER_URL,
        json: fixtures.users[0],
        jar: jarA
      },
      function (error, response, body) {
        if(error) {
          callback(error, null);
        }

        idA = body._id;

        // Create a second user
        request.post({
            url: USER_URL,
            json: fixtures.users[1],
            jar: jarB
          },
          function (error, response, body) {
            if(error) {
              callback(error, null);
            }
            callback(null, jarA, jarB, idA, body._id);
          }
        );
      }
    );
  });
};

/**
 * Clear all orgs.
 */
fixtures.clearOrgs = function clearOrgs(done) {
  Org.remove({}).exec(done);
};

/**
 * Adds a new org to the system.
 * Callback is given an org ID.
 * @param  {String} name The name of the org
 * @param  {Object} jar The request cookie jar, containing a logged in state
 * @param  {Function} callback Params (error, id)
 */
fixtures.addOrg = function addOrg(name, jar, done) {
  request.post({
    url: BASEURL + '/orgs',
    jar: jar,
    json: { orgs: [{ name: name }] }
  }, function (error, respone, body) {
    if (error) { return done(error); }
    done(null, body.orgs[0]);
  });
};

// Generate some fake response data.
fixtures.makeResponses = function makeResponses(count, options) {
  function makeResponse(parcelId, streetNumber) {
    var response = {
      source: {
        type: 'mobile',
        collector: 'Name'
      },
      geo_info: {
        geometry: {
          type: 'MultiPolygon',
          coordinates: [ [ [
            [-122.43469523018862, 37.771087088400655],
            [-122.43477071284453, 37.77146083403105],
            [-122.4346853083731, 37.77147170307505],
            [-122.43460982859321, 37.771097964560134],
            [-122.43463544873167, 37.77109470163426],
            [-122.43469523018862, 37.771087088400655]
          ] ] ]
        },
        centroid: [-122.43469027023522, 37.77127939798119],
        humanReadableName: streetNumber + ' HAIGHT ST',
        parcel_id: parcelId
      },
      parcel_id: parcelId,
      object_id: parcelId,
      responses: {
        'use-count': '1',
        collector: 'Some Name',
        site: 'parking-lot',
        'condition-1': 'demolish',
        'text-question': 'St. Cloud, MN; basically anything'
      }
    };

    if (options && options.includeInfo) {
      response.info = {
        MAPBLKLOT: '200-400-500-6',
        region: 57
      };
    }

    return response;
  }

  var data = { responses: [] };
  var parcelBase = 123456;
  if (options && options.parcelBase) {
    parcelBase = options.parcelBase;
  }
  var i;
  for (i = 0; i < count; i += 1) {
    var num = Math.floor(Math.random() * 10000);

    if (options && options.parcelId) {
      num = options.parcelId;
    }

    data.responses.push(makeResponse(num.toString(), num.toString() + ' A'));
  }

  // Delete the first condition so that there's always one with no response for that
  // question
  delete data.responses[0].responses['condition-1'];

  return data;
};

fixtures.clearResponses = function clearResponses(survey, done) {
  var query = {};
  if (done === undefined) {
    done = survey;
  } else {
    query['properties.survey'] = survey;
  }

  Response.remove(query, function (error, result) {
    if (error) {
      done(error);
      return;
    }
    done();
  });
};
