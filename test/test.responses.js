/*jslint node: true, indent: 2, white: true, vars: true */
/*globals suite, test, setup, suiteSetup, suiteTeardown, done, teardown */
'use strict';

var server = require('../lib/server.js');
var assert = require('assert');
var fs = require('fs');
var util = require('util');
var request = require('request');
var should = require('should');

var settings = require('../settings-test.js');
// We don't use filtering right now, so we'll skip testing it
// var filterToRemoveResults = require('../responses.js').filterToRemoveResults;

var BASEURL = 'http://localhost:' + settings.port + '/api';
var FILENAME = 'data/map.png';

suite('Responses', function () {

  var data_one = {
    responses: [ {
      source: {
        type: 'mobile',
        collector: 'Name'
      },
      geo_info: {
        geometry: {
          type: 'MultiPolygon',
          coordinates: [ [ [
            [-122.43481265888725, 37.77107213299167],
            [-122.43488814355871, 37.77144589024014],
            [-122.43477071284453, 37.77146083403105],
            [-122.43469523018862, 37.771087088400655],
            [-122.43471231026837, 37.77108491280468],
            [-122.43479771296865, 37.77107403655235],
            [-122.43481265888725, 37.77107213299167]
          ] ] ]
        },
        centroid: [-122.43479168663654, 37.771266486242666],
        humanReadableName: '765 HAIGHT ST',
        parcel_id: '0862022A'
      },
      parcel_id: '0862022A',
      object_id: '0862022A',
      responses: {
        'use-count': '1',
        collector: 'Some Name',
        site: 'parking-lot',
        'condition-1': 'demolish'
      }
    } ]
  };

  var dataTwo = function(){
    return {
      responses: [
        {
          source: {
            type: 'mobile',
            collector: 'Name'
          },
          geo_info: {
            geometry: {
              type: 'MultiPolygon',
              coordinates: [ [ [
                [-122.43481265888725, 37.77107213299167],
                [-122.43488814355871, 37.77144589024014],
                [-122.43477071284453, 37.77146083403105],
                [-122.43469523018862, 37.771087088400655],
                [-122.43471231026837, 37.77108491280468],
                [-122.43479771296865, 37.77107403655235],
                [-122.43481265888725, 37.77107213299167]
              ] ] ]
            },
            centroid: [-122.43479168663654, 37.771266486242666],
            humanReadableName: '765 HAIGHT ST',
            parcel_id: '0862022A'
          },
          parcel_id: '0862022A',
          object_id: '0862022A',
          responses: {
            'use-count': '1',
            collector: 'Some Name',
            site: 'parking-lot',
            'condition-1': 'demolish'
          }
        },
        {
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
            humanReadableName: '763 HAIGHT ST',
            parcel_id: '0862023'
          },
          parcel_id: '0862023',
          object_id: '0862023',
          responses: {
            'use-count': '1',
            collector: 'Some Name',
            site: 'parking-lot',
            'condition-1': 'demolish'
          }
        }
      ]
    };
  };

  var data_twenty = (function () {
    function makeResponse(parcelId) {
      return {
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
          humanReadableName: '763 HAIGHT ST',
          parcel_id: parcelId
        },
        parcel_id: parcelId,
        object_id: parcelId,
        responses: {
          'use-count': '1',
          collector: 'Some Name',
          site: 'parking-lot',
          'condition-1': 'demolish'
        }
      };
    }
    var data = { responses: [] };
    var parcelBase = 123456;
    var i;
    for (i = 0; i < 20; i += 1) {
      data.responses.push(makeResponse((parcelBase + i).toString()));
    }
    return data;
  }());

  suiteSetup(function (done) {
    server.run(settings, done);
  });

  suiteTeardown(function () {
    server.stop();
  });

  suite('POST', function () {
    var surveyId = '123';
    var url = BASEURL + '/surveys/' + surveyId + '/responses';
    test('Posting JSON to /surveys/' + surveyId + '/responses', function (done) {
      request.post({url: url, json: data_one}, function (error, response, body) {
        assert.ifError(error);
        assert.equal(response.statusCode, 201, 'Status should be 201. Status is ' + response.statusCode);

        var i;
        for (i = 0; i < data_one.responses.length; i += 1) {
          // Source
          assert.deepEqual(data_one.responses[i].source, body.responses[i].source, 'Response differs from posted data');
          // Centroid
          assert.deepEqual(data_one.responses[i].geo_info.centroid,
                           body.responses[i].geo_info.centroid,
                           'Response centroid differs from posted data');
          // Parcel ID in geo_info
          data_one.responses[i].geo_info.parcel_id.should.equal(body.responses[i].geo_info.parcel_id);
          // Geometry
          assert.deepEqual(data_one.responses[i].geo_info.geometry,
                           body.responses[i].geo_info.geometry,
                           'Response geometry differs from posted data');
          // Human-readable name
          data_one.responses[i].geo_info.humanReadableName.should.equal(body.responses[i].geo_info.humanReadableName);

          // Object ID
          assert.deepEqual(data_one.responses[i].parcel_id, body.responses[i].parcel_id, 'Response differs from posted data');
          assert.deepEqual(data_one.responses[i].object_id, body.responses[i].object_id, 'Response differs from posted data');
          // Answers
          assert.deepEqual(data_one.responses[i].responses, body.responses[i].responses, 'Response differs from posted data');

          assert.notEqual(body.responses[i].id, null, 'Response does not have an ID.');
          assert.equal(body.responses[i].survey, surveyId,
                       'Response does not indicate the correct survey: ' +
                       body.responses[i].survey + ' vs ' + surveyId);
          assert.notEqual(body.responses[i].created, null, 'Response does not have a creation timestamp.');
        }

        done();
      });
    });


    test('Posting a file to /surveys/' + surveyId + '/responses', function (done) {
      var form = new FormData();
      form.append('my_file', fs.open(FILENAME));
      var dataAsString = JSON.toString({"responses": [data_one]});
      form.append('responses', dataAsString);

      request.post({url: url, data: form}, function (error, response, body) {
        assert.ifError(error);
        assert.equal(response.statusCode, 201, 'Status should be 201. Status is ' + response.statusCode);

        var i;
        for (i = 0; i < data_one.responses.length; i += 1) {
          // Source
          assert.deepEqual(data_one.responses[i].source, body.responses[i].source, 'Response differs from posted data');
          // Centroid
          assert.deepEqual(data_one.responses[i].geo_info.centroid,
                           body.responses[i].geo_info.centroid,
                           'Response centroid differs from posted data');
          // Parcel ID in geo_info
          data_one.responses[i].geo_info.parcel_id.should.equal(body.responses[i].geo_info.parcel_id);
          // Geometry
          assert.deepEqual(data_one.responses[i].geo_info.geometry,
                           body.responses[i].geo_info.geometry,
                           'Response geometry differs from posted data');
          // Human-readable name
          data_one.responses[i].geo_info.humanReadableName.should.equal(body.responses[i].geo_info.humanReadableName);

          // Object ID
          assert.deepEqual(data_one.responses[i].parcel_id, body.responses[i].parcel_id, 'Response differs from posted data');
          assert.deepEqual(data_one.responses[i].object_id, body.responses[i].object_id, 'Response differs from posted data');
          // Answers
          assert.deepEqual(data_one.responses[i].responses, body.responses[i].responses, 'Response differs from posted data');

          assert.notEqual(body.responses[i].id, null, 'Response does not have an ID.');
          assert.equal(body.responses[i].survey, surveyId,
                       'Response does not indicate the correct survey: ' +
                       body.responses[i].survey + ' vs ' + surveyId);
          assert.notEqual(body.responses[i].created, null, 'Response does not have a creation timestamp.');

          // Files
          assert(false);
        }

        done();
      });
    });

    test('Posting bad data /surveys/' + surveyId + '/responses', function (done) {
      request.post({url: url, json: {respnoses: {}}}, function (error, response, body) {
        should.not.exist(error);
        response.statusCode.should.equal(400);
        done();
      });
    });
  });

  suite('DEL', function () {
    var surveyId = '123';
    var id;

    setup(function (done) {
      request.post({url: BASEURL + '/surveys/' + surveyId + '/responses', json: dataTwo()},
                   function (error, response, body) {
        if (error) { done(error); }
        id = body.responses[0].id;
        done();
      });
    });

    test('Deleting a response', function (done) {
      request.del({url: BASEURL + '/surveys/' + surveyId + '/responses/' + id}, function (error, response, body) {
        should.not.exist(error);
        should.exist(response);
        response.statusCode.should.equal(200);
        response.should.be.json;

        var parsed = JSON.parse(body);
        parsed.should.have.property('count').equal(1);

        done();
      });
    });
  });

  suite('GET', function () {
    var surveyId = '123';
    var id;

    suiteSetup(function (done) {
      request.post({url: BASEURL + '/surveys/' + surveyId + '/responses', json: data_twenty},
                   function (error, response, body) {
        if (error) { done(error); }
        id = body.responses[0].id;
        done();
      });
    });


    test(' all responses for a survey', function (done) {
      request.get({url: BASEURL + '/surveys/' + surveyId + '/responses?startIndex=0&count=100000'}, function (error, response, body) {
        should.not.exist(error);
        response.statusCode.should.equal(200);
        response.should.be.json;

        var parsed = JSON.parse(body);
        parsed.should.have.property('responses');
        parsed.responses.length.should.be.above(1);
        var i;
        var prevTime = Number.MAX_VALUE;
        var created;
        for (i = 0; i < parsed.responses.length; i += 1) {
          parsed.responses[i].survey.should.equal(surveyId);
          created = Date.parse(parsed.responses[i].created);
          created.should.not.be.above(prevTime);
          prevTime = created;
        }
        done();
      });
    });

    // test('Filtering of results', function (done) {
    //   var results = dataTwo().responses;
    //   var sanitizedResults = filterToRemoveResults(results);
    //   results[0].should.not.have.property('responses');
    //   done();
    // });


    test('Get all responses for a specific parcel', function (done) {
      request.get({url: BASEURL + '/surveys/' + surveyId + '/responses?objectId=' + data_twenty.responses[1].parcel_id},
       function (error, response, body) {
        should.not.exist(error);
        response.statusCode.should.equal(200);
        response.should.be.json;

        var parsed = JSON.parse(body);
        parsed.should.have.property('responses');
        parsed.responses.length.should.be.above(0);
        parsed.responses[0].parcel_id.should.equal(data_twenty.responses[1].parcel_id);
        parsed.responses[0].survey.should.equal(surveyId);

        var i;
        var prevTime = Number.MAX_VALUE;
        var created;
        for (i = 0; i < parsed.responses.length; i += 1) {
          parsed.responses[i].survey.should.equal(surveyId);

          created = Date.parse(parsed.responses[i].created);
          created.should.not.be.above(prevTime);
          prevTime = created;
        }

        done();
      });
    });

    test('one response', function (done) {
      request.get({url: BASEURL + '/surveys/' + surveyId + '/responses/' + id},
                  function (error, response, body) {
        should.not.exist(error);
        response.statusCode.should.equal(200);
        response.should.be.json;

        var parsed = JSON.parse(body);

        parsed.response.id.should.equal(id);
        should.deepEqual(parsed.response.source, data_twenty.responses[0].source);
        should.deepEqual(parsed.response.geo_info, data_twenty.responses[0].geo_info);
        should.deepEqual(parsed.response.responses, data_twenty.responses[0].responses);
        parsed.response.parcel_id.should.equal(data_twenty.responses[0].parcel_id);
        parsed.response.survey.should.equal(surveyId);

        done();
      });
    });

    test('Get all responses in a bounding box', function (done) {
      var center = data_twenty.responses[0].geo_info.centroid;
      var bbox = [center[0] - 0.1, center[1] - 0.1, center[0] + 0.1, center[1] + 0.1];
      var url = BASEURL + '/surveys/' + surveyId + '/responses?bbox=' + bbox.join(',');
      console.log(url);
      request.get({url: url}, function (error, response, body) {
        should.not.exist(error);
        response.statusCode.should.equal(200);
        response.should.be.json;

        var parsed = JSON.parse(body);
        parsed.should.have.property('responses');
        parsed.responses.length.should.be.above(0);
        var i;
        var prevTime = Number.MAX_VALUE;
        var created;
        for (i = 0; i < parsed.responses.length; i += 1) {
          parsed.responses[i].survey.should.equal(surveyId);
          parsed.responses[i].geo_info.centroid.should.have.lengthOf(2);
          parsed.responses[i].geo_info.centroid[0].should.be.above(bbox[0]);
          parsed.responses[i].geo_info.centroid[0].should.be.below(bbox[2]);
          parsed.responses[i].geo_info.centroid[1].should.be.above(bbox[1]);
          parsed.responses[i].geo_info.centroid[1].should.be.below(bbox[3]);

          created = Date.parse(parsed.responses[i].created);
          created.should.not.be.above(prevTime);
          prevTime = created;
        }
        done();
      });
    });

    test('Get a chunk of responses', function (done) {
      request.get({url: BASEURL + '/surveys/' + surveyId + '/responses?startIndex=5&count=10'}, function (error, response, body) {
        should.not.exist(error);
        response.statusCode.should.equal(200);
        response.should.be.json;

        var parsed = JSON.parse(body);
        parsed.should.have.property('responses');
        // Make sure we got the number we requested.
        parsed.responses.length.should.equal(10);

        // Make sure the responses are in descending order of creation time.
        var i;
        var prevTime = Number.MAX_VALUE;
        var created;
        for (i = 0; i < parsed.responses.length; i += 1) {
          parsed.responses[i].survey.should.equal(surveyId);

          created = Date.parse(parsed.responses[i].created);
          created.should.not.be.above(prevTime);
          prevTime = created;
        }

        // Make sure we got the right range of responses.
        request.get({url: BASEURL + '/surveys/' + surveyId + '/responses?startIndex=0&count=100000'}, function (error, response, body) {
          var full = JSON.parse(body);
          full.responses[5].geo_info.parcel_id.should.equal(parsed.responses[0].geo_info.parcel_id);
          done();
        });
      });
    });

    test('Get responses in ascending creation order', function (done) {
      request.get({url: BASEURL + '/surveys/' + surveyId + '/responses?startIndex=0&count=100000&sort=asc'}, function (error, response, body) {
        should.not.exist(error);
        response.statusCode.should.equal(200);
        response.should.be.json;

        var parsed = JSON.parse(body);
        parsed.should.have.property('responses');

        // Make sure the responses are in ascending order of creation time.
        var i;
        var prevTime = Number.MIN_VALUE;
        var created;
        for (i = 0; i < parsed.responses.length; i += 1) {
          parsed.responses[i].survey.should.equal(surveyId);

          created = Date.parse(parsed.responses[i].created);
          created.should.not.be.below(prevTime);
          prevTime = created;
        }

        done();
      });
    });


    test('Get response data as CSV', function (done) {
      request.get({url: BASEURL + '/surveys/' + surveyId + '/responses.csv'},
                  function (error, response, body) {
        should.not.exist(error);
        response.statusCode.should.equal(200);

        response.headers.should.have.property('content-type');
        response.headers['content-type'].should.equal('text/csv');

        response.headers.should.have.property('content-disposition');
        response.headers['content-disposition'].should.equal('attachment; filename=Survey Export.csv');

        done();
      });
    });

    test('Get response data as KML', function (done) {
      request.get({url: BASEURL + '/surveys/' + surveyId + '/responses.kml'},
                  function (error, response, body) {
        should.not.exist(error);
        response.statusCode.should.equal(200);

        response.headers.should.have.property('content-type');
        response.headers['content-type'].should.equal('application/vnd.google-earth.kml+xml');

        response.headers.should.have.property('content-disposition');
        response.headers['content-disposition'].should.equal('attachment; filename=Survey Export.kml');

        done();
      });
    });


  });
});
