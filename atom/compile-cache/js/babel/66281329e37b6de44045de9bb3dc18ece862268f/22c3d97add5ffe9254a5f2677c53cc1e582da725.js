var _this = this;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/* eslint-disable no-underscore-dangle */

var _libScriptOptions = require('../lib/script-options');

var _libScriptOptions2 = _interopRequireDefault(_libScriptOptions);

'use babel';

describe('ScriptOptions', function () {
  beforeEach(function () {
    _this.scriptOptions = new _libScriptOptions2['default']();
    _this.dummyEnv = {
      SCRIPT_CI: 'true',
      SCRIPT_ENV: 'test',
      _NUMBERS: '123'
    };
    _this.dummyEnvString = "SCRIPT_CI=true;SCRIPT_ENV='test';_NUMBERS=\"123\"";
  });

  describe('getEnv', function () {
    it('should default to an empty env object', function () {
      var env = _this.scriptOptions.getEnv();
      expect(env).toEqual({});
    });

    it('should parse a custom user environment', function () {
      _this.scriptOptions.env = _this.dummyEnvString;
      var env = _this.scriptOptions.getEnv();
      expect(env).toEqual(_this.dummyEnv);
    });
  });

  describe('mergedEnv', function () {
    it('should default to the orignal env object', function () {
      var mergedEnv = _this.scriptOptions.mergedEnv(_this.dummyEnv);
      expect(mergedEnv).toEqual(_this.dummyEnv);
    });

    it('should retain the original environment', function () {
      _this.scriptOptions.env = "TEST_VAR_1=one;TEST_VAR_2=\"two\";TEST_VAR_3='three'";
      var mergedEnv = _this.scriptOptions.mergedEnv(_this.dummyEnv);
      expect(mergedEnv.SCRIPT_CI).toEqual('true');
      expect(mergedEnv.SCRIPT_ENV).toEqual('test');
      expect(mergedEnv._NUMBERS).toEqual('123');
      expect(mergedEnv.TEST_VAR_1).toEqual('one');
      expect(mergedEnv.TEST_VAR_2).toEqual('two');
      expect(mergedEnv.TEST_VAR_3).toEqual('three');
    });

    it('should support special character values', function () {
      _this.scriptOptions.env = "TEST_VAR_1=o-n-e;TEST_VAR_2=\"nested\\\"doublequotes\\\"\";TEST_VAR_3='nested\\'singlequotes\\'';TEST_VAR_4='s p a c e s'";
      var mergedEnv = _this.scriptOptions.mergedEnv(_this.dummyEnv);
      expect(mergedEnv.TEST_VAR_1).toEqual('o-n-e');
      expect(mergedEnv.TEST_VAR_2).toEqual('nested\\"doublequotes\\"');
      expect(mergedEnv.TEST_VAR_3).toEqual("nested\\'singlequotes\\'");
      expect(mergedEnv.TEST_VAR_4).toEqual('s p a c e s');
    });
  });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2p1YW5qby8uYXRvbS9wYWNrYWdlcy9zY3JpcHQvc3BlYy9zY3JpcHQtb3B0aW9ucy1zcGVjLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztnQ0FHMEIsdUJBQXVCOzs7O0FBSGpELFdBQVcsQ0FBQzs7QUFLWixRQUFRLENBQUMsZUFBZSxFQUFFLFlBQU07QUFDOUIsWUFBVSxDQUFDLFlBQU07QUFDZixVQUFLLGFBQWEsR0FBRyxtQ0FBbUIsQ0FBQztBQUN6QyxVQUFLLFFBQVEsR0FBRztBQUNkLGVBQVMsRUFBRSxNQUFNO0FBQ2pCLGdCQUFVLEVBQUUsTUFBTTtBQUNsQixjQUFRLEVBQUUsS0FBSztLQUNoQixDQUFDO0FBQ0YsVUFBSyxjQUFjLEdBQUcsbURBQW1ELENBQUM7R0FDM0UsQ0FBQyxDQUFDOztBQUVILFVBQVEsQ0FBQyxRQUFRLEVBQUUsWUFBTTtBQUN2QixNQUFFLENBQUMsdUNBQXVDLEVBQUUsWUFBTTtBQUNoRCxVQUFNLEdBQUcsR0FBRyxNQUFLLGFBQWEsQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUN4QyxZQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0tBQ3pCLENBQUMsQ0FBQzs7QUFFSCxNQUFFLENBQUMsd0NBQXdDLEVBQUUsWUFBTTtBQUNqRCxZQUFLLGFBQWEsQ0FBQyxHQUFHLEdBQUcsTUFBSyxjQUFjLENBQUM7QUFDN0MsVUFBTSxHQUFHLEdBQUcsTUFBSyxhQUFhLENBQUMsTUFBTSxFQUFFLENBQUM7QUFDeEMsWUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFLLFFBQVEsQ0FBQyxDQUFDO0tBQ3BDLENBQUMsQ0FBQztHQUNKLENBQUMsQ0FBQzs7QUFFSCxVQUFRLENBQUMsV0FBVyxFQUFFLFlBQU07QUFDMUIsTUFBRSxDQUFDLDBDQUEwQyxFQUFFLFlBQU07QUFDbkQsVUFBTSxTQUFTLEdBQUcsTUFBSyxhQUFhLENBQUMsU0FBUyxDQUFDLE1BQUssUUFBUSxDQUFDLENBQUM7QUFDOUQsWUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFLLFFBQVEsQ0FBQyxDQUFDO0tBQzFDLENBQUMsQ0FBQzs7QUFFSCxNQUFFLENBQUMsd0NBQXdDLEVBQUUsWUFBTTtBQUNqRCxZQUFLLGFBQWEsQ0FBQyxHQUFHLEdBQUcsc0RBQXNELENBQUM7QUFDaEYsVUFBTSxTQUFTLEdBQUcsTUFBSyxhQUFhLENBQUMsU0FBUyxDQUFDLE1BQUssUUFBUSxDQUFDLENBQUM7QUFDOUQsWUFBTSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDNUMsWUFBTSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDN0MsWUFBTSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDMUMsWUFBTSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDNUMsWUFBTSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDNUMsWUFBTSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7S0FDL0MsQ0FBQyxDQUFDOztBQUVILE1BQUUsQ0FBQyx5Q0FBeUMsRUFBRSxZQUFNO0FBQ2xELFlBQUssYUFBYSxDQUFDLEdBQUcsR0FBRywySEFBMkgsQ0FBQztBQUNySixVQUFNLFNBQVMsR0FBRyxNQUFLLGFBQWEsQ0FBQyxTQUFTLENBQUMsTUFBSyxRQUFRLENBQUMsQ0FBQztBQUM5RCxZQUFNLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUM5QyxZQUFNLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDLE9BQU8sQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO0FBQ2pFLFlBQU0sQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUMsT0FBTyxDQUFDLDBCQUEwQixDQUFDLENBQUM7QUFDakUsWUFBTSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUM7S0FDckQsQ0FBQyxDQUFDO0dBQ0osQ0FBQyxDQUFDO0NBQ0osQ0FBQyxDQUFDIiwiZmlsZSI6Ii9ob21lL2p1YW5qby8uYXRvbS9wYWNrYWdlcy9zY3JpcHQvc3BlYy9zY3JpcHQtb3B0aW9ucy1zcGVjLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbi8qIGVzbGludC1kaXNhYmxlIG5vLXVuZGVyc2NvcmUtZGFuZ2xlICovXG5pbXBvcnQgU2NyaXB0T3B0aW9ucyBmcm9tICcuLi9saWIvc2NyaXB0LW9wdGlvbnMnO1xuXG5kZXNjcmliZSgnU2NyaXB0T3B0aW9ucycsICgpID0+IHtcbiAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgdGhpcy5zY3JpcHRPcHRpb25zID0gbmV3IFNjcmlwdE9wdGlvbnMoKTtcbiAgICB0aGlzLmR1bW15RW52ID0ge1xuICAgICAgU0NSSVBUX0NJOiAndHJ1ZScsXG4gICAgICBTQ1JJUFRfRU5WOiAndGVzdCcsXG4gICAgICBfTlVNQkVSUzogJzEyMycsXG4gICAgfTtcbiAgICB0aGlzLmR1bW15RW52U3RyaW5nID0gXCJTQ1JJUFRfQ0k9dHJ1ZTtTQ1JJUFRfRU5WPSd0ZXN0JztfTlVNQkVSUz1cXFwiMTIzXFxcIlwiO1xuICB9KTtcblxuICBkZXNjcmliZSgnZ2V0RW52JywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgZGVmYXVsdCB0byBhbiBlbXB0eSBlbnYgb2JqZWN0JywgKCkgPT4ge1xuICAgICAgY29uc3QgZW52ID0gdGhpcy5zY3JpcHRPcHRpb25zLmdldEVudigpO1xuICAgICAgZXhwZWN0KGVudikudG9FcXVhbCh7fSk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIHBhcnNlIGEgY3VzdG9tIHVzZXIgZW52aXJvbm1lbnQnLCAoKSA9PiB7XG4gICAgICB0aGlzLnNjcmlwdE9wdGlvbnMuZW52ID0gdGhpcy5kdW1teUVudlN0cmluZztcbiAgICAgIGNvbnN0IGVudiA9IHRoaXMuc2NyaXB0T3B0aW9ucy5nZXRFbnYoKTtcbiAgICAgIGV4cGVjdChlbnYpLnRvRXF1YWwodGhpcy5kdW1teUVudik7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCdtZXJnZWRFbnYnLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCBkZWZhdWx0IHRvIHRoZSBvcmlnbmFsIGVudiBvYmplY3QnLCAoKSA9PiB7XG4gICAgICBjb25zdCBtZXJnZWRFbnYgPSB0aGlzLnNjcmlwdE9wdGlvbnMubWVyZ2VkRW52KHRoaXMuZHVtbXlFbnYpO1xuICAgICAgZXhwZWN0KG1lcmdlZEVudikudG9FcXVhbCh0aGlzLmR1bW15RW52KTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgcmV0YWluIHRoZSBvcmlnaW5hbCBlbnZpcm9ubWVudCcsICgpID0+IHtcbiAgICAgIHRoaXMuc2NyaXB0T3B0aW9ucy5lbnYgPSBcIlRFU1RfVkFSXzE9b25lO1RFU1RfVkFSXzI9XFxcInR3b1xcXCI7VEVTVF9WQVJfMz0ndGhyZWUnXCI7XG4gICAgICBjb25zdCBtZXJnZWRFbnYgPSB0aGlzLnNjcmlwdE9wdGlvbnMubWVyZ2VkRW52KHRoaXMuZHVtbXlFbnYpO1xuICAgICAgZXhwZWN0KG1lcmdlZEVudi5TQ1JJUFRfQ0kpLnRvRXF1YWwoJ3RydWUnKTtcbiAgICAgIGV4cGVjdChtZXJnZWRFbnYuU0NSSVBUX0VOVikudG9FcXVhbCgndGVzdCcpO1xuICAgICAgZXhwZWN0KG1lcmdlZEVudi5fTlVNQkVSUykudG9FcXVhbCgnMTIzJyk7XG4gICAgICBleHBlY3QobWVyZ2VkRW52LlRFU1RfVkFSXzEpLnRvRXF1YWwoJ29uZScpO1xuICAgICAgZXhwZWN0KG1lcmdlZEVudi5URVNUX1ZBUl8yKS50b0VxdWFsKCd0d28nKTtcbiAgICAgIGV4cGVjdChtZXJnZWRFbnYuVEVTVF9WQVJfMykudG9FcXVhbCgndGhyZWUnKTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgc3VwcG9ydCBzcGVjaWFsIGNoYXJhY3RlciB2YWx1ZXMnLCAoKSA9PiB7XG4gICAgICB0aGlzLnNjcmlwdE9wdGlvbnMuZW52ID0gXCJURVNUX1ZBUl8xPW8tbi1lO1RFU1RfVkFSXzI9XFxcIm5lc3RlZFxcXFxcXFwiZG91YmxlcXVvdGVzXFxcXFxcXCJcXFwiO1RFU1RfVkFSXzM9J25lc3RlZFxcXFwnc2luZ2xlcXVvdGVzXFxcXCcnO1RFU1RfVkFSXzQ9J3MgcCBhIGMgZSBzJ1wiO1xuICAgICAgY29uc3QgbWVyZ2VkRW52ID0gdGhpcy5zY3JpcHRPcHRpb25zLm1lcmdlZEVudih0aGlzLmR1bW15RW52KTtcbiAgICAgIGV4cGVjdChtZXJnZWRFbnYuVEVTVF9WQVJfMSkudG9FcXVhbCgnby1uLWUnKTtcbiAgICAgIGV4cGVjdChtZXJnZWRFbnYuVEVTVF9WQVJfMikudG9FcXVhbCgnbmVzdGVkXFxcXFwiZG91YmxlcXVvdGVzXFxcXFwiJyk7XG4gICAgICBleHBlY3QobWVyZ2VkRW52LlRFU1RfVkFSXzMpLnRvRXF1YWwoXCJuZXN0ZWRcXFxcJ3NpbmdsZXF1b3Rlc1xcXFwnXCIpO1xuICAgICAgZXhwZWN0KG1lcmdlZEVudi5URVNUX1ZBUl80KS50b0VxdWFsKCdzIHAgYSBjIGUgcycpO1xuICAgIH0pO1xuICB9KTtcbn0pO1xuIl19
//# sourceURL=/home/juanjo/.atom/packages/script/spec/script-options-spec.js
