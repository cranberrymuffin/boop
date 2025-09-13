import { NativeEventEmitter, NativeModules } from 'react-native';
import type { EmitterSubscription } from 'react-native';
import NativeBleBoopModule, { type BoopUser } from './NativeBleBoopSpec';

export { BoopUser };

export interface BleBoopEvents {
  onUserDiscovered: (user: BoopUser) => void;
  onUserLost: (userId: string) => void;
  onConnectionStateChanged: (state: 'connected' | 'disconnected' | 'connecting') => void;
  onError: (error: string) => void;
}

class BleBoop {
  private eventEmitter: NativeEventEmitter;

  constructor() {
    this.eventEmitter = new NativeEventEmitter(NativeModules.BleBoop);
  }

  /**
   * Start advertising as a boop user
   */
  async startAdvertising(userName: string): Promise<void> {
    return NativeBleBoopModule.startAdvertising(userName);
  }

  /**
   * Stop advertising
   */
  async stopAdvertising(): Promise<void> {
    return NativeBleBoopModule.stopAdvertising();
  }

  /**
   * Start scanning for nearby boop users
   */
  async startScanning(): Promise<void> {
    return NativeBleBoopModule.startScanning();
  }

  /**
   * Stop scanning for users
   */
  async stopScanning(): Promise<void> {
    return NativeBleBoopModule.stopScanning();
  }

  /**
   * Connect to a discovered user
   */
  async connectToUser(userId: string): Promise<void> {
    return NativeBleBoopModule.connectToUser(userId);
  }

  /**
   * Disconnect from connected user
   */
  async disconnect(): Promise<void> {
    return NativeBleBoopModule.disconnect();
  }

  /**
   * Get the list of discovered users
   */
  async getDiscoveredUsers(): Promise<BoopUser[]> {
    return NativeBleBoopModule.getDiscoveredUsers();
  }

  /**
   * Check if Bluetooth is enabled
   */
  async isBluetoothEnabled(): Promise<boolean> {
    return NativeBleBoopModule.isBluetoothEnabled();
  }

  /**
   * Request Bluetooth permissions
   */
  async requestBluetoothPermissions(): Promise<boolean> {
    return NativeBleBoopModule.requestBluetoothPermissions();
  }

  /**
   * Add event listener
   */
  addListener<K extends keyof BleBoopEvents>(
    eventName: K,
    listener: BleBoopEvents[K]
  ): EmitterSubscription {
    return this.eventEmitter.addListener(eventName, listener);
  }

  /**
   * Remove all listeners for an event
   */
  removeAllListeners(eventName: keyof BleBoopEvents): void {
    this.eventEmitter.removeAllListeners(eventName);
  }
}

export default new BleBoop();
