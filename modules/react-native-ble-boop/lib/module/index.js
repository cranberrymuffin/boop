import { NativeEventEmitter, NativeModules } from 'react-native';
import NativeBleBoopModule from './NativeBleBoopSpec';
class BleBoop {
  constructor() {
    this.eventEmitter = new NativeEventEmitter(NativeModules.BleBoop);
  }

  /**
   * Start advertising as a boop user
   */
  async startAdvertising(userName) {
    return NativeBleBoopModule.startAdvertising(userName);
  }

  /**
   * Stop advertising
   */
  async stopAdvertising() {
    return NativeBleBoopModule.stopAdvertising();
  }

  /**
   * Start scanning for nearby boop users
   */
  async startScanning() {
    return NativeBleBoopModule.startScanning();
  }

  /**
   * Stop scanning for users
   */
  async stopScanning() {
    return NativeBleBoopModule.stopScanning();
  }

  /**
   * Connect to a discovered user
   */
  async connectToUser(userId) {
    return NativeBleBoopModule.connectToUser(userId);
  }

  /**
   * Disconnect from connected user
   */
  async disconnect() {
    return NativeBleBoopModule.disconnect();
  }

  /**
   * Get the list of discovered users
   */
  async getDiscoveredUsers() {
    return NativeBleBoopModule.getDiscoveredUsers();
  }

  /**
   * Check if Bluetooth is enabled
   */
  async isBluetoothEnabled() {
    return NativeBleBoopModule.isBluetoothEnabled();
  }

  /**
   * Request Bluetooth permissions
   */
  async requestBluetoothPermissions() {
    return NativeBleBoopModule.requestBluetoothPermissions();
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
export default new BleBoop();
//# sourceMappingURL=index.js.map