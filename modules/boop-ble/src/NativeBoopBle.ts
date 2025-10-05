import type { TurboModule } from "react-native";
import { TurboModuleRegistry } from "react-native";

export interface BoopUser {
  id: string;
  name: string;
  rssi: number;
  distance?: number;
}

export interface Spec extends TurboModule {
  startAdvertising(userName: string): Promise<void>;
  stopAdvertising(): Promise<void>;
  startScanning(): Promise<void>;
  stopScanning(): Promise<void>;
  connectToUser(userId: string): Promise<void>;
  disconnect(): Promise<void>;
  getDiscoveredUsers(): Promise<BoopUser[]>;
  isBluetoothEnabled(): Promise<boolean>;
  requestBluetoothPermissions(): Promise<boolean>;

  // Event emitter methods for Turbo Modules
  addListener(eventName: string): void;
  removeListeners(count: number): void;
}

export default TurboModuleRegistry.getEnforcing<Spec>("BoopBle");
