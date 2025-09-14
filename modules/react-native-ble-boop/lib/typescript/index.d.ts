import type { EmitterSubscription } from "react-native";
import { type BoopUser } from "./NativeBleBoopSpec";
export { BoopUser };
export interface BleBoopEvents {
  onUserDiscovered: (user: BoopUser) => void;
  onUserLost: (userId: string) => void;
  onConnectionStateChanged: (
    state: "connected" | "disconnected" | "connecting"
  ) => void;
  onError: (error: string) => void;
}
declare class BleBoop {
  private eventEmitter;
  constructor();
  /**
   * Start advertising as a boop user
   */
  startAdvertising(userName: string): Promise<void>;
  /**
   * Stop advertising
   */
  stopAdvertising(): Promise<void>;
  /**
   * Start scanning for nearby boop users
   */
  startScanning(): Promise<void>;
  /**
   * Stop scanning for users
   */
  stopScanning(): Promise<void>;
  /**
   * Connect to a discovered user
   */
  connectToUser(userId: string): Promise<void>;
  /**
   * Disconnect from connected user
   */
  disconnect(): Promise<void>;
  /**
   * Get the list of discovered users
   */
  getDiscoveredUsers(): Promise<BoopUser[]>;
  /**
   * Check if Bluetooth is enabled
   */
  isBluetoothEnabled(): Promise<boolean>;
  /**
   * Request Bluetooth permissions
   */
  requestBluetoothPermissions(): Promise<boolean>;
  /**
   * Add event listener
   */
  addListener<K extends keyof BleBoopEvents>(
    eventName: K,
    listener: BleBoopEvents[K]
  ): EmitterSubscription;
  /**
   * Remove all listeners for an event
   */
  removeAllListeners(eventName: keyof BleBoopEvents): void;
}
declare const _default: BleBoop;
export default _default;
//# sourceMappingURL=index.d.ts.map
