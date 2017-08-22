'use babel';

// Public: GrammarUtils.PHP - a module which assist the creation of PHP temporary files
Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = {
  // Public: Create a temporary file with the provided PHP code
  //
  // * `code`    A {String} containing some PHP code without <?php header
  //
  // Returns the {String} filepath of the new file
  createTempFileWithCode: function createTempFileWithCode(code) {
    if (!/^[\s]*<\?php/.test(code)) {
      code = '<?php ' + code;
    }
    return module.parent.exports.createTempFileWithCode(code);
  }
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2p1YW5qby8uYXRvbS9wYWNrYWdlcy9zY3JpcHQvbGliL2dyYW1tYXItdXRpbHMvcGhwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFdBQVcsQ0FBQzs7Ozs7O3FCQUdHOzs7Ozs7QUFNYix3QkFBc0IsRUFBQSxnQ0FBQyxJQUFJLEVBQUU7QUFDM0IsUUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUU7QUFBRSxVQUFJLGNBQVksSUFBSSxBQUFFLENBQUM7S0FBRTtBQUMzRCxXQUFPLE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLHNCQUFzQixDQUFDLElBQUksQ0FBQyxDQUFDO0dBQzNEO0NBQ0YiLCJmaWxlIjoiL2hvbWUvanVhbmpvLy5hdG9tL3BhY2thZ2VzL3NjcmlwdC9saWIvZ3JhbW1hci11dGlscy9waHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuLy8gUHVibGljOiBHcmFtbWFyVXRpbHMuUEhQIC0gYSBtb2R1bGUgd2hpY2ggYXNzaXN0IHRoZSBjcmVhdGlvbiBvZiBQSFAgdGVtcG9yYXJ5IGZpbGVzXG5leHBvcnQgZGVmYXVsdCB7XG4gIC8vIFB1YmxpYzogQ3JlYXRlIGEgdGVtcG9yYXJ5IGZpbGUgd2l0aCB0aGUgcHJvdmlkZWQgUEhQIGNvZGVcbiAgLy9cbiAgLy8gKiBgY29kZWAgICAgQSB7U3RyaW5nfSBjb250YWluaW5nIHNvbWUgUEhQIGNvZGUgd2l0aG91dCA8P3BocCBoZWFkZXJcbiAgLy9cbiAgLy8gUmV0dXJucyB0aGUge1N0cmluZ30gZmlsZXBhdGggb2YgdGhlIG5ldyBmaWxlXG4gIGNyZWF0ZVRlbXBGaWxlV2l0aENvZGUoY29kZSkge1xuICAgIGlmICghL15bXFxzXSo8XFw/cGhwLy50ZXN0KGNvZGUpKSB7IGNvZGUgPSBgPD9waHAgJHtjb2RlfWA7IH1cbiAgICByZXR1cm4gbW9kdWxlLnBhcmVudC5leHBvcnRzLmNyZWF0ZVRlbXBGaWxlV2l0aENvZGUoY29kZSk7XG4gIH0sXG59O1xuIl19