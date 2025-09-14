"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _reactNative = require("react-native");
var _NativeBleBoopSpec = _interopRequireDefault(require("./NativeBleBoopSpec"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class BleBoop {
  constructor() {
    this.eventEmitter = new _reactNative.NativeEventEmitter(_reactNative.NativeModules.BleBoop);
  }

  /**
   * Start advertising as a boop user
   */
  async startAdvertising(userName) {
    return _NativeBleBoopSpec.default.startAdvertising(userName);
  }

  /**
   * Stop advertising
   */
  async stopAdvertising() {
    return _NativeBleBoopSpec.default.stopAdvertising();
  }

  /**
   * Start scanning for nearby boop users
   */
  async startScanning() {
    return _NativeBleBoopSpec.default.startScanning();
  }

  /**
   * Stop scanning for users
   */
  async stopScanning() {
    return _NativeBleBoopSpec.default.stopScanning();
  }

  /**
   * Connect to a discovered user
   */
  async connectToUser(userId) {
    return _NativeBleBoopSpec.default.connectToUser(userId);
  }

  /**
   * Disconnect from connected user
   */
  async disconnect() {
    return _NativeBleBoopSpec.default.disconnect();
  }

  /**
   * Get the list of discovered users
   */
  async getDiscoveredUsers() {
    return _NativeBleBoopSpec.default.getDiscoveredUsers();
  }

  /**
   * Check if Bluetooth is enabled
   */
  async isBluetoothEnabled() {
    return _NativeBleBoopSpec.default.isBluetoothEnabled();
  }

  /**
   * Request Bluetooth permissions
   */
  async requestBluetoothPermissions() {
    return _NativeBleBoopSpec.default.requestBluetoothPermissions();
  }

  /**
   * Add event listener
   */
  addListener(eventName, listener) {
    return this.eventEmitter.addListener(eventName, listener);
  }

  /**
   * Remove all listeners for an event
   */
  removeAllListeners(eventName) {
    this.eventEmitter.removeAllListeners(eventName);
  }
}
var _default = exports.default = new BleBoop();
//# sourceMappingURL=index.js.map