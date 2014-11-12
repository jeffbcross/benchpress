describe('bp', function() {
  var bp = window.bp,
      mockStep = {
        fn: function() {},
        name: 'fakeStep'
      };

  beforeEach(function() {
    bp.doc._container = document.createElement('div');
    bp.doc.infoTemplate = function(model) {
      return JSON.stringify(model);
    }
    var scriptTemplate = document.createElement('div');
    scriptTemplate.setAttribute('id', 'scriptTemplate');
    bp.doc._container.appendChild(scriptTemplate);
    bp.runner.runState = {
      iterations: 0,
      numSamples: 20,
      recentResult: {}
    };

    bp.report.timesPerAction = {};
    bp.variables.variables.length = 0;
    delete bp.variables.selected;
  });

  describe('.Variables', function() {
    var var1, var2;
    beforeEach(function() {
      var1 = {value: 'bindOnce', label: 'bind once'};
      var2 = {value: 'baseline', label: 'baseline'}
    });


    it('should set pending selected variable from the query params', function() {
      bp.setFakeWindow({
        location: {
          search: '?variable=bindOnce'
        }
      });
      expect(bp.variables.selected).toBeUndefined();
      bp.variables.addMany([var1, var2]);
      expect(bp.variables.selected).toBe(var1);
    });


    it('should delete pending selected after selected has been set', function() {
      bp.variables.variables = [{value: 'bindOnce'}];
      bp.variables.pending = 'bindOnce';
      bp.variables.select('bindOnce');
      expect(bp.variables._pending).toBe(null);
    });

    describe('.add()', function() {
      it('should add the variable to the bp.variables array', function() {
        bp.variables.add(var1);
        expect(bp.variables.variables[0]).toBe(var1);
      });
    });


    describe('.addMany()', function() {
      it('should add all variables to the bp.variables array', function() {
        expect(bp.variables.variables.length).toBe(0);

        var arr = [var1, var2];

        bp.variables.addMany(arr);

        expect(bp.variables.variables.length).toBe(2);
        expect(bp.variables.variables[0]).toBe(var1);
        expect(bp.variables.variables[1]).toBe(var2);
      });
    });


    describe('.select()', function() {
      it('should set the variable by provided value', function() {
        expect(bp.variables.selected).toBe(undefined);
        bp.variables.addMany([var1, var2]);
        bp.variables.select('bindOnce');
        expect(bp.variables.selected).toBe(var1);
      });


      it('should set to undefined if value does not match a variable', function() {
        bp.variables.addMany([var1, var2]);
        expect(bp.variables.selected).toBe(undefined);
        bp.variables.select('fakeVar');
        expect(bp.variables.selected).toBe(undefined);
      });
    });
  });


  describe('.Statistics', function() {
    describe('.calculateConfidenceInterval()', function() {
      it('should provide the correct confidence interval', function() {
        expect(bp.Statistics.calculateConfidenceInterval(30, 1000)).toBe(1.859419264179007);
      });
    });


    describe('.calculateRelativeMarginOfError()', function() {
      expect(bp.Statistics.calculateRelativeMarginOfError(1.85, 5)).toBe(0.37);
    });


    describe('.getMean()', function() {
      it('should return the mean for a given sample', function() {
        expect(bp.Statistics.getMean([1,2,5,4])).toBe(3);
      });
    });


    describe('.calculateStandardDeviation()', function() {
      it('should provide the correct standardDeviation for the provided sample and mean', function() {
        expect(bp.Statistics.calculateStandardDeviation([
          2,4,4,4,5,5,7,9
        ], 5)).toBe(2.138089935299395);
      });


      it('should provide the correct standardDeviation for the provided sample and mean', function() {
        expect(bp.Statistics.calculateStandardDeviation([
          674.64,701.78,668.33,662.15,663.34,677.32,664.25,1233.00,1100.80,716.15,681.52,671.23,702.70,686.89,939.39,830.28,695.46,695.66,675.15,667.48], 750.38)).toBe(158.57877026559186);
      });
    });


    describe('.calculateCoefficientOfVariation()', function() {
      expect(bp.Statistics.calculateCoefficientOfVariation(0.5, 5)).toBe(0.1);
    });
  });


  describe('.Utils', function() {
    describe('.parseSearch()', function() {
      it('should return serialized query params', function() {
        expect(bp.Utils.parseSearch('?variable=bindOnce&angular=angular.js')).toEqual({
          variable: 'bindOnce',
          angular: 'angular.js'
        });
      });


      it('should only remove leading character if "?" present', function() {
        expect(bp.Utils.parseSearch('?foo=bar&b=a')).toEqual({
          foo:'bar',
          b: 'a'
        });
        expect(bp.Utils.parseSearch('foo=bar&b=a')).toEqual({
          foo:'bar',
          b: 'a'
        });
      });
    });
  });


  describe('.Document', function() {
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
        expect(bp.runner.runState.numSamples).toBe(20);
        bp.doc.onSampleInputChanged({target: {value: '80'}});
        expect(bp.runner.runState.numSamples).toBe(80);
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
        bp.scripts = [{src: 'angular.js', id: 'angular'}, {src: 'bar'}];
      });

      it('should shift the first config from window.scripts', function() {
        bp.doc.loadNextScript();
        expect(bp.scripts).toEqual([{src: 'bar'}]);
      });


      it('should override script with provided source from query params', function() {
        var bodySpy = spyOn(document.body, 'appendChild');
        bp.doc.loadNextScript();
        expect(bodySpy.calls[0].args[0].getAttribute('src')).toBe('angular.js');
      });


      it('should call addScriptToUI with config with correct src', function() {
        var spy = spyOn(bp.doc, 'addScriptToUI');
        bp.doc.loadNextScript();
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
      it('should call bp.Utils.parseSearch()', function() {
        var spy = spyOn(bp.Utils, 'parseSearch');
        bp.doc.getParams();
        expect(spy).toHaveBeenCalled();
      });

      it('should parse query params into an object', function() {
        bp.setFakeWindow({
          location: {
            search: '?angular=foo&bar=baz'
          }
        });

        expect(bp.doc.getParams()).toEqual({
          angular: 'foo',
          bar: 'baz'
        });
      })
    });
  });


  describe('.runner', function() {
    describe('.setIterations()', function() {
      it('should set provided arguments to runState object', function() {
        bp.runner.runState = {numSamples: 20};
        bp.runner.setIterations(15);
        expect(bp.runner.runState.numSamples).toBe(20);
        expect(bp.runner.runState.iterations).toBe(15);
      });
    });


    describe('.resetIterations()', function() {
      it('should set runState object to defaults', function() {
        bp.runner.runState = {
          numSamples: 99,
          iterations: 100,
          recentResult: {
            fakeStep: {
              testTime: 2
            }
          }
        }
        bp.report.timesPerAction = {
          fakeStep: {
            testTimes: [5]
          }
        };

        bp.runner.resetIterations();
        expect(bp.runner.runState.numSamples).toBe(99);
        expect(bp.runner.runState.iterations).toBe(0);
        expect(bp.report.timesPerAction).toEqual({fakeStep: {testTimes: [5]}});
        expect(bp.runner.runState.recentResult['fakeStep'].testTime).toEqual(2);
      });
    });


    describe('.runTimedTest()', function() {
      it('should call gc if available', function() {
        window.gc = window.gc || function() {};
        var spy = spyOn(window, 'gc');
        bp.runner.runTimedTest(mockStep, {});
        expect(spy).toHaveBeenCalled();
      });


      it('should return the time required to run the test', function() {
        var times = {};
        expect(typeof bp.runner.runTimedTest(mockStep, times).testTime).toBe('number');
      });
    });


    describe('.runAllTests()', function() {
      beforeEach(function() {
        bp.steps = [mockStep];
        bp.doc.infoDiv = document.createElement('div');
        bp.infoTemplate = jasmine.createSpy('infoTemplate');
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
        var resetSpy = spyOn(bp.runner, 'resetIterations');
        runs(function() {
          bp.runner.runState.numSamples = 8;
          bp.runner.setIterations(10);
          bp.runner.runAllTests(doneSpy);
        });

        waitsFor(function() {
          return doneSpy.callCount;
        }, 'done to be called', 200);

        runs(function() {
          expect(bp.report.timesPerAction.fakeStep.testTime.history.length).toBe(8);
        });
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


  describe('.Report', function() {
    describe('.calcStats()', function() {
      beforeEach(function() {
        bp.steps = [mockStep];
        bp.runner.runState = {
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
        bp.report.timesPerAction = {
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


      it('should set the most recent time for each step to the next entry', function() {
        bp.report.calcStats();
        expect(bp.report.timesPerAction.fakeStep.testTime.history[2]).toBe(5);
        bp.runner.runState.recentResult.fakeStep.testTime = 25;
        bp.report.calcStats();
        expect(bp.report.timesPerAction.fakeStep.testTime.history[3]).toBe(25);
      });


      it('should return an string report', function() {
        expect(typeof bp.report.calcStats()).toBe('string');
      });
    });


    describe('.rightSizeTimes()', function() {
      it('should make remove the left side of the input if longer than numSamples', function() {
        bp.runner.runState.numSamples = 3;
        expect(bp.report.rightSizeTimes([0,1,2,3,4,5,6])).toEqual([4,5,6]);
      });


      it('should return the whole list if shorter than or equal to numSamples', function() {
        bp.runner.runState.numSamples = 7;
        expect(bp.report.rightSizeTimes([0,1,2,3,4,5,6])).toEqual([0,1,2,3,4,5,6]);
        expect(bp.report.rightSizeTimes([0,1,2,3,4,5])).toEqual([0,1,2,3,4,5]);
      });
    });
  });
});