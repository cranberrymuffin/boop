import type { EmitterSubscription } from "react-native";
import { NativeEventEmitter, NativeModules } from "react-native";
import NativeBoopBle, { type BoopUser } from "./NativeBoopBle";

export { BoopUser };

export interface BleBoopEvents {
  onUserDiscovered: (user: BoopUser) => void;
  onUserLost: (userId: string) => void;
  onConnectionStateChanged: (
    state: "connected" | "disconnected" | "connecting"
  ) => void;
  onError: (error: string) => void;
}

class BleBoop {
  private eventEmitter: NativeEventEmitter;

  constructor() {
    this.eventEmitter = new NativeEventEmitter(NativeModules.BoopBle);
  }

  /**
   * Start advertising as a boop user
   */
  async startAdvertising(userName: string): Promise<void> {
    return NativeBoopBle.startAdvertising(userName);
  }

  /**
   * Stop advertising
   */
  async stopAdvertising(): Promise<void> {
    return NativeBoopBle.stopAdvertising();
  }

  /**
   * Start scanning for nearby boop users
   */
  async startScanning(): Promise<void> {
    return NativeBoopBle.startScanning();
  }

  /**
   * Stop scanning for users
   */
  async stopScanning(): Promise<void> {
    return NativeBoopBle.stopScanning();
  }

  /**
   * Connect to a discovered user
   */
  async connectToUser(userId: string): Promise<void> {
    return NativeBoopBle.connectToUser(userId);
  }

  /**
   * Disconnect from connected user
   */
  async disconnect(): Promise<void> {
    return NativeBoopBle.disconnect();
  }

  /**
   * Get the list of discovered users
   */
  async getDiscoveredUsers(): Promise<BoopUser[]> {
    return NativeBoopBle.getDiscoveredUsers();
  }

  /**
   * Check if Bluetooth is enabled
   */
  async isBluetoothEnabled(): Promise<boolean> {
    return NativeBoopBle.isBluetoothEnabled();
  }

  /**
   * Request Bluetooth permissions
   */
  async requestBluetoothPermissions(): Promise<boolean> {
    return NativeBoopBle.requestBluetoothPermissions();
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
