describe('bp', function() {
  var di = require('di');
  var testing = require('../node_modules/di/dist/cjs/testing');
  var injector;

  // var Document = require('./Document');
  // var Report = require('./HtmlReport');
  // var Runner = require('./Runner');
  // var Statistics = require('./Statistics');
  // var Utils = require('./Utils');
  // var Values = require('./Values');
  var Globals = require('./Globals');
  var MockGlobals = require('./MockGlobals');
  var Variables = require('./Variables.js');

  beforeEach(function() {
    // bp.doc._container = document.createElement('div');
    // bp.doc.infoTemplate = function(model) {
    //   return JSON.stringify(model);
    // }
    // var scriptTemplate = document.createElement('div');
    // scriptTemplate.setAttribute('id', 'scriptTemplate');
    // bp.doc._container.appendChild(scriptTemplate);
    // bp.runner.runState = {
    //   iterations: 0,
    //   numSamples: 20,
    //   recentResult: {}
    // };

    // bp.report.timesPerAction = {};
  });

  describe('.variables', function() {
    var var1, var2, variables;

    beforeEach(function() {
      testing.use(MockGlobals).as(Globals);
      testing.inject(Variables, function(vars) {
        console.log('same?', vars === variables);
        variables = vars;
      });

      var1 = {value: 'bindOnce', label: 'bind once'};
      var2 = {value: 'baseline', label: 'baseline'}
    });


    it('should set pending selected variable from the query params', function() {
      expect(variables.selected).toBeUndefined();
      variables.addMany([var1, var2]);
      expect(variables.selected).toBe(var1);
    });


    it('should delete pending selected after selected has been set', function() {
      variables.variables = [{value: 'bindOnce'}];
      variables.pending = 'bindOnce';
      variables.select('bindOnce');
      expect(variables._pending).toBe(null);
    });

    describe('.add()', function() {
      it('should add the variable to the variables array', function() {
        variables.add(var1);
        expect(variables.variables[0]).toBe(var1);
      });
    });


    describe('.addMany()', function() {
      it('should add all variables to the variables array', function() {
        expect(variables.variables.length).toBe(0);

        var arr = [var1, var2];

        variables.addMany(arr);

        expect(variables.variables.length).toBe(2);
        expect(variables.variables[0]).toBe(var1);
        expect(variables.variables[1]).toBe(var2);
      });
    });


    describe('.select()', function() {
      it('should set the variable by provided value', function() {
        expect(variables.selected).toBe(undefined);
        variables.addMany([var1, var2]);
        variables.select('bindOnce');
        expect(variables.selected).toBe(var1);
      });


      it('should set to undefined if value does not match a variable', function() {
        variables._globals._window.location.search = '';
        variables.addMany([var1, var2]);
        expect(variables.selected).toBe(undefined);
        variables.select('fakeVar');
        expect(variables.selected).toBe(undefined);
      });
    });
  });


  describe('.statistics', function() {
    describe('.calculateConfidenceInterval()', function() {
      it('should provide the correct confidence interval', function() {
        expect(bp.statistics.calculateConfidenceInterval(30, 1000)).toBe(1.859419264179007);
      });
    });


    describe('.calculateRelativeMarginOfError()', function() {
      expect(bp.statistics.calculateRelativeMarginOfError(1.85, 5)).toBe(0.37);
    });


    describe('.getMean()', function() {
      it('should return the mean for a given sample', function() {
        expect(bp.statistics.getMean([1,2,5,4])).toBe(3);
      });
    });


    describe('.calculateStandardDeviation()', function() {
      it('should provide the correct standardDeviation for the provided sample and mean', function() {
        expect(bp.statistics.calculateStandardDeviation([
          2,4,4,4,5,5,7,9
        ], 5)).toBe(2.138089935299395);
      });


      it('should provide the correct standardDeviation for the provided sample and mean', function() {
        expect(bp.statistics.calculateStandardDeviation([
          674.64,701.78,668.33,662.15,663.34,677.32,664.25,1233.00,1100.80,716.15,681.52,671.23,702.70,686.89,939.39,830.28,695.46,695.66,675.15,667.48], 750.38)).toBe(158.57877026559186);
      });
    });


    describe('.calculateCoefficientOfVariation()', function() {
      expect(bp.statistics.calculateCoefficientOfVariation(0.5, 5)).toBe(0.1);
    });
  });


  describe('.utils', function() {
    describe('.parseSearch()', function() {
      it('should return serialized query params', function() {
        expect(bp.utils.parseSearch('?variable=bindOnce&angular=angular.js')).toEqual({
          variable: 'bindOnce',
          angular: 'angular.js'
        });
      });


      it('should only remove leading character if "?" present', function() {
        expect(bp.utils.parseSearch('?foo=bar&b=a')).toEqual({
          foo:'bar',
          b: 'a'
        });
        expect(bp.utils.parseSearch('foo=bar&b=a')).toEqual({
          foo:'bar',
          b: 'a'
        });
      });
    });
  });


  describe('.Document', function() {
    var doc, utils, values, scripts;

    beforeEach(function() {
      scripts = [];
      utils = new Utils();
      values = new Values();
      runner = new Runner();
      doc = new Document(values, utils, scripts, runner, {win: {
        location: {
          search: '?angular=foo&bar=baz'
        }
      }});
    });


    describe('.container()', function() {
      it('should return bp.doc._container if set', function() {
        expect(bp.doc.container() instanceof HTMLElement).toBe(true);
      });
    });


    describe('.onSampleRangeChanged()', function() {
      beforeEach(function() {
        bp.runner.resetIterations();
      });


      it('should change the numSamples property', function() {
        expect(values.defaultNumSamples).toBe(20);
        doc.onSampleInputChanged({target: {value: '80'}});
        expect(values.defaultNumSamples).toBe(80);
      });
    });


    describe('.writeReport()', function() {
      it('should write the report to the infoDiv', function() {
        bp.doc.infoDiv = document.createElement('div');
        bp.doc.writeReport('report!');
        expect(bp.doc.infoDiv.innerHTML).toBe('report!')
      });
    });


    describe('.onDOMContentLoaded()', function() {
      it('should call methods to write to the dom', function() {
        var buttonSpy = spyOn(bp.doc, 'addButton');
        var rangeSpy = spyOn(bp.doc, 'addSampleRange');
        var infoSpy = spyOn(bp.doc, 'addInfo');

        bp.doc.onDOMContentLoaded();
        expect(buttonSpy.callCount).toBe(4);
        expect(rangeSpy).toHaveBeenCalled();
        expect(infoSpy).toHaveBeenCalled();
      });
    });


    describe('.loadNextScript()', function() {
      beforeEach(function() {
        scripts.push.apply(scripts, [{src: 'angular.js', id: 'angular'}, {src: 'bar'}]);
      });

      it('should shift the first config from window.scripts', function() {
        doc.loadNextScript();
        expect(scripts).toEqual([{src: 'bar'}]);
      });


      it('should override script with provided source from query params', function() {
        var bodySpy = spyOn(document.body, 'appendChild');
        doc.loadNextScript();
        expect(bodySpy.calls[0].args[0].getAttribute('src')).toBe('angular.js');
      });


      it('should call addScriptToUI with config with correct src', function() {
        var spy = spyOn(doc, 'addScriptToUI');
        doc.loadNextScript();
        expect(spy).toHaveBeenCalled();
        expect(spy.calls[0].args[0]).toEqual({id: 'angular', src: 'angular.js'});
      })
    });


    xdescribe('.addScriptToUI()', function() {
      beforeEach(function() {
        bp.doc._scriptsContainer = document.createElement('div');
        bp.doc._scriptsContainer.classList.add('scripts');
        var scriptTemplate = document.createElement('script');
        scriptTemplate.setAttribute('id', 'scriptTemplate');
        bp.doc._container.appendChild(scriptTemplate);
      });


      it('should add a script to the info container', function() {
        var appendSpy = spyOn(bp.doc._scriptsContainer, 'appendChild');
        bp.doc.addScriptToUI({src: '/foo.js', id: 'foo'});
        expect(appendSpy).toHaveBeenCalled();
      });
    });


    xdescribe('.addScriptsContainer()', function() {
      it('should set the container to bp.doc._scriptsContainer');
      it('should add script template to bp.doc');
    });


    describe('.getParams()', function() {
      it('should call bp.utils.parseSearch()', function() {
        var spy = spyOn(bp.utils, 'parseSearch');
        bp.doc.getParams();
        expect(spy).toHaveBeenCalled();
      });

      it('should parse query params into an object', function() {
        expect(doc.getParams()).toEqual({
          angular: 'foo',
          bar: 'baz'
        });
      })
    });
  });


  describe('.runner', function() {
    var runner, report, doc;

    beforeEach(function() {
      runner = new Runner();
      report = new Report();
      doc = new Document();
      doc.infoDiv = document.createElement('div');
      runner.runState = {
        numSamples: 99,
        iterations: 100,
        recentResult: {
          fakeStep: {
            testTime: 2
          }
        }
      }
      report.timesPerAction = {
        fakeStep: {
          testTimes: [5]
        }
      };
    });


    describe('.setIterations()', function() {
      it('should set provided arguments to runState object', function() {
        runner.runState = {numSamples: 20};
        runner.setIterations(15);
        expect(runner.runState.numSamples).toBe(20);
        expect(runner.runState.iterations).toBe(15);
      });
    });


    describe('.resetIterations()', function() {
      it('should set runState object to defaults', function() {
        runner.resetIterations();
        expect(runner.runState.numSamples).toBe(99);
        expect(runner.runState.iterations).toBe(0);
        expect(report.timesPerAction).toEqual({fakeStep: {testTimes: [5]}});
        expect(runner.runState.recentResult['fakeStep'].testTime).toEqual(2);
      });
    });


    describe('.runTimedTest()', function() {
      it('should call gc if available', function() {
        window.gc = window.gc || function() {};
        var spy = spyOn(window, 'gc');
        runner.runTimedTest(mockStep, {});
        expect(spy).toHaveBeenCalled();
      });


      it('should return the time required to run the test', function() {
        var times = {};
        expect(typeof runner.runTimedTest(mockStep, times).testTime).toBe('number');
      });
    });


    describe('.runAllTests()', function() {
      beforeEach(function() {
        bp.steps = [mockStep];
        // bp.infoTemplate = jasmine.createSpy('infoTemplate');
      });

      it('should call resetIterations before calling done', function() {
        var spy = spyOn(bp.runner, 'resetIterations');
        bp.runner.runState.iterations = 0;
        bp.runner.runAllTests();
        expect(spy).toHaveBeenCalled();
      });


      it('should call done after running for the appropriate number of iterations', function() {
        var spy = spyOn(mockStep, 'fn');
        var doneSpy = jasmine.createSpy('done');

        runs(function() {
          bp.runner.setIterations(5, 5);
          bp.runner.runAllTests(doneSpy);
        });

        waitsFor(function() {
          return doneSpy.callCount;
        }, 'done to be called', 500);

        runs(function() {
          expect(spy.callCount).toBe(5);
        });
      });


      it('should add as many times to timePerStep as are specified by numSamples', function() {
        var doneSpy = jasmine.createSpy('done');
        var resetSpy = spyOn(runner, 'resetIterations');
        runs(function() {
          runner.runState.numSamples = 8;
          runner.setIterations(10);
          runner.runAllTests(doneSpy);
        });


        waitsFor(function() {
          return doneSpy.callCount;
        }, 'done to be called', 200);

        runs(function() {
          expect(report.timesPerAction.fakeStep.testTime.history.length).toBe(8);
        });
        console.log('in test: ', doc.infoDiv)
      });
    });


    describe('.loopBenchmark()', function() {
      var runAllTestsSpy, btn;
      beforeEach(function() {
        runAllTestsSpy = spyOn(bp.runner, 'runAllTests');
        bp.doc.loopBtn = document.createElement('button');
      });

      it('should call runAllTests if iterations does not start at greater than -1', function() {
        bp.runner.runState.iterations = 0;
        bp.runner.loopBenchmark();
        expect(runAllTestsSpy).toHaveBeenCalled();
        expect(runAllTestsSpy.callCount).toBe(1);
      });


      it('should not call runAllTests if iterations is already -1', function() {
        runs(function() {
          bp.runner.runState.iterations = -1;
          bp.runner.loopBenchmark();
        });

        waits(1);

        runs(function() {
          expect(runAllTestsSpy).not.toHaveBeenCalled();
        });
      });


      it('should not call runAllTests if iterations is less than -1', function() {
        runs(function() {
          bp.runner.runState.iterations = -50;
          bp.runner.loopBenchmark();
        });

        waits(1);

        runs(function() {
          expect(runAllTestsSpy).not.toHaveBeenCalled();
        });
      });


      it('should set the button text to "Pause" while iterating', function() {
        bp.runner.runState.iterations = 0;
        bp.runner.loopBenchmark();
        expect(bp.doc.loopBtn.innerText).toBe('Pause');
      });


      it('should set the button text to "Loop" while iterating', function() {
        bp.runner.runState.iterations = -1;
        bp.runner.loopBenchmark();
        expect(bp.doc.loopBtn.innerText).toBe('Loop');
      });


      it('should set the runState -1 iterations', function() {
        var spy = spyOn(bp.runner, 'setIterations');
        bp.runner.runState.iterations = 0;
        bp.runner.loopBenchmark();
        expect(spy).toHaveBeenCalledWith(-1);
      });


      it('should set the iterations to 0 if iterations is already -1', function() {
        bp.runner.runState.iterations = -1;
        bp.runner.loopBenchmark();
        expect(bp.runner.runState.iterations).toBe(0);
      });
    });


    describe('.onceBenchmark()', function() {
      var runAllTestsSpy;
      beforeEach(function() {
        bp.doc.onceBtn = document.createElement('button');
        runAllTestsSpy = spyOn(bp.runner, 'runAllTests');
      });

      it('should call runAllTests', function() {
        expect(runAllTestsSpy.callCount).toBe(0);
        bp.runner.onceBenchmark();
        expect(runAllTestsSpy).toHaveBeenCalled();
      });


      it('should set the button text to "..."', function() {
        expect(runAllTestsSpy.callCount).toBe(0);
        bp.runner.onceBenchmark();
        expect(bp.doc.onceBtn.innerText).toBe('...');
      });


      it('should set the text back to Once when done running test', function() {
        expect(bp.doc.onceBtn.innerText).not.toBe('Once');
        bp.runner.onceBenchmark();
        var done = runAllTestsSpy.calls[0].args[0];
        done();
        expect(bp.doc.onceBtn.innerText).toBe('Once');
      });
    });


    describe('.twentyFiveBenchmark()', function() {
      var runAllTestsSpy;
      beforeEach(function() {
        bp.doc.twentyFiveBtn = document.createElement('button');
        runAllTestsSpy = spyOn(bp.runner, 'runAllTests');
      });


      it('should set the runState to25 iterations', function() {
        var spy = spyOn(bp.runner, 'setIterations');
        bp.runner.twentyFiveBenchmark();
        expect(spy).toHaveBeenCalledWith(25);
      });


      it('should change the button text to "Looping..."', function() {
        expect(bp.doc.twentyFiveBtn.innerText).not.toBe('Looping...');
        bp.runner.twentyFiveBenchmark();
        expect(bp.doc.twentyFiveBtn.innerText).toBe('Looping...');
      });


      it('should call runAllTests', function() {
        bp.runner.twentyFiveBenchmark();
        expect(runAllTestsSpy).toHaveBeenCalled();
      });


      it('should pass runAllTests a third argument specifying times to ignore', function() {
        bp.runner.twentyFiveBenchmark();
        expect(runAllTestsSpy.calls[0].args[1]).toBe(5);
      });
    });
  });


  describe('.report', function() {
    var report, doc, measure, stats, values, runner;
    beforeEach(function() {
      doc = {
        infoTemplate: jasmine.createSpy('infoTemplate')
      }
      measure = {
        characteristics: ['gcTime','testTime','garbageCount','retainedCount']
      };
      values = {};
      stats = new Statistics();
      runner = new Runner();
      report = new Report(doc, measure, runner, stats, values, [mockStep]);
      runner.runState = {
        numSamples: 5,
        iterations: 5,
        recentResult: {
          fakeStep: {
            testTime: 5,
            gcTime: 2,
            recentGarbagePerStep: 200,
            recentRetainedMemoryPerStep: 100
          }
        }
      };
      report.timesPerAction = {
        fakeStep: {
          testTime: {
            history: [3,7]
          },
          garbageCount: {
            history: [50,50]
          },
          retainedCount: {
            history: [25,25]
          },
          gcTime: {
            recent: 3,
            history: [1,3]
          },
          nextEntry: 2
        },
      };
    });


    describe('.calcStats()', function() {
      it('should set the most recent time for each step to the next entry', function() {
        report.calcStats();
        expect(report.timesPerAction.fakeStep.testTime.history[2]).toBe(5);
        runner.runState.recentResult.fakeStep.testTime = 25;
        report.calcStats();
        expect(report.timesPerAction.fakeStep.testTime.history[3]).toBe(25);
      });


      it('should return an string report', function() {
        expect(typeof report.calcStats()).toBe('string');
      });
    });


    describe('.rightSizeTimes()', function() {
      it('should make remove the left side of the input if longer than numSamples', function() {
        values.defaultNumSamples = 3;
        expect(report.rightSizeTimes([0,1,2,3,4,5,6])).toEqual([4,5,6]);
      });


      it('should return the whole list if shorter than or equal to numSamples', function() {
        bp.runner.runState.numSamples = 7;
        expect(report.rightSizeTimes([0,1,2,3,4,5,6])).toEqual([0,1,2,3,4,5,6]);
        expect(report.rightSizeTimes([0,1,2,3,4,5])).toEqual([0,1,2,3,4,5]);
      });
    });
  });
});