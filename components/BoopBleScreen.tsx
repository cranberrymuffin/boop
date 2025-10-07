import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import type { BoopUser } from "../modules/boop-ble/src";
import BoopBle from "../modules/boop-ble/src";

export default function BoopBleScreen() {
  const [isScanning, setIsScanning] = useState(false);
  const [isAdvertising, setIsAdvertising] = useState(false);
  const [isBooping, setIsBooping] = useState(false);
  const [discoveredUsers, setDiscoveredUsers] = useState<BoopUser[]>([]);
  const [userName] = useState("User");
  const [bluetoothEnabled, setBluetoothEnabled] = useState(false);
  const [connectionState, setConnectionState] =
    useState<string>("disconnected");

  // Store event listeners to clean them up later
  const [eventListeners, setEventListeners] = useState<any[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Only cleanup when component unmounts
    return () => {
      eventListeners.forEach((listener) => listener?.remove());
    };
  }, [eventListeners]);

  const initializeBluetooth = async () => {
    if (isInitialized) return;

    // Check if Bluetooth is enabled
    await checkBluetoothStatus();

    // Set up event listeners
    const userDiscoveredListener = BoopBle.addListener(
      "onUserDiscovered",
      (user: BoopUser) => {
        setDiscoveredUsers((prev) => {
          const filtered = prev.filter((u) => u.id !== user.id);
          return [...filtered, user].sort(
            (a, b) => (a.distance || 0) - (b.distance || 0)
          );
        });
      }
    );

    const bluetoothStateListener = BoopBle.addListener(
      "onBluetoothStateChanged",
      (state) => {
        const isBluetoothEnabled = state === "enabled";
        setBluetoothEnabled(isBluetoothEnabled);
        if (!isBluetoothEnabled) {
          setIsScanning(false);
          setIsAdvertising(false);
          setIsBooping(false);
          setDiscoveredUsers([]);
          Alert.alert(
            "Bluetooth Disabled",
            "Please enable Bluetooth to use Boop features",
            [{ text: "OK" }]
          );
        }
      }
    );

    const userLostListener = BoopBle.addListener(
      "onUserLost",
      (userId: string) => {
        setDiscoveredUsers((prev) => prev.filter((u) => u.id !== userId));
      }
    );

    const connectionListener = BoopBle.addListener(
      "onConnectionStateChanged",
      (state: string) => {
        setConnectionState(state);
      }
    );

    const errorListener = BoopBle.addListener("onError", (error: string) => {
      Alert.alert("BLE Error", error);
    });

    setEventListeners([
      userDiscoveredListener,
      bluetoothStateListener,
      userLostListener,
      connectionListener,
      errorListener,
    ]);

    setIsInitialized(true);
  };

  const checkBluetoothStatus = async () => {
    try {
      const enabled = await BoopBle.isBluetoothEnabled();
      setBluetoothEnabled(enabled);

      if (!enabled) {
        Alert.alert(
          "Bluetooth Disabled",
          "Please enable Bluetooth to use Boop features",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.error("Error checking Bluetooth status:", error);
    }
  };

  const requestPermissions = async () => {
    try {
      const granted = await BoopBle.requestBluetoothPermissions();
      if (!granted) {
        Alert.alert(
          "Permissions Required",
          "Bluetooth permissions are required for Boop to work",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.error("Error requesting permissions:", error);
    }
  };

  const toggleBoop = async () => {
    try {
      // Initialize Bluetooth setup on first toggle
      await initializeBluetooth();

      if (!bluetoothEnabled) {
        await checkBluetoothStatus();
        return;
      }

      await requestPermissions();

      if (isBooping) {
        // Stop both scanning and advertising
        if (isScanning) {
          await BoopBle.stopScanning();
          setIsScanning(false);
        }
        if (isAdvertising) {
          await BoopBle.stopAdvertising();
          setIsAdvertising(false);
        }
        setDiscoveredUsers([]);
        setIsBooping(false);
      } else {
        // Start both scanning and advertising
        await BoopBle.startScanning();
        setIsScanning(true);
        await BoopBle.startAdvertising(userName);
        setIsAdvertising(true);
        setIsBooping(true);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to toggle Boop mode";
      Alert.alert("Error", errorMessage);
    }
  };

  const connectToUser = async (user: BoopUser) => {
    try {
      await BoopBle.connectToUser(user.id);
      Alert.alert("Connecting", `Connecting to ${user.name}...`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to connect to user";
      Alert.alert("Connection Error", errorMessage);
    }
  };

  const formatDistance = (distance?: number) => {
    if (!distance) return "Unknown";
    if (distance < 1) return `${(distance * 100).toFixed(0)}cm`;
    return `${distance.toFixed(1)}m`;
  };

  const renderUser = ({ item }: { item: BoopUser }) => (
    <TouchableOpacity
      style={styles.userItem}
      onPress={() => connectToUser(item)}
    >
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.userDetails}>
          Distance: {formatDistance(item.distance)} • RSSI: {item.rssi}dBm
        </Text>
      </View>
      <View style={styles.connectButton}>
        <Text style={styles.connectButtonText}>Boop!</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Boop Discovery</Text>

      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          Bluetooth: {bluetoothEnabled ? "✅ Enabled" : "❌ Disabled"}
        </Text>
        <Text style={styles.statusText}>Connection: {connectionState}</Text>
      </View>

      <View style={styles.controlsContainer}>
        <View style={styles.control}>
          <Text style={styles.controlLabel}>Enable Boop Mode</Text>
          <Switch
            value={isBooping}
            onValueChange={toggleBoop}
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={isBooping ? "#f5dd4b" : "#f4f3f4"}
          />
        </View>
        <Text style={styles.boopDescription}>
          {isBooping
            ? "🔍 Scanning for users and 📡 advertising as " + userName
            : "Toggle to start scanning and advertising"}
        </Text>
      </View>

      <View style={styles.usersContainer}>
        <Text style={styles.usersTitle}>
          Nearby Users ({discoveredUsers.length})
        </Text>
        {discoveredUsers.length === 0 ? (
          <Text style={styles.noUsersText}>
            {isScanning ? "Scanning for users..." : "No users found"}
          </Text>
        ) : (
          <FlatList
            data={discoveredUsers}
            renderItem={renderUser}
            keyExtractor={(item) => item.id}
            style={styles.usersList}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  statusContainer: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  statusText: {
    fontSize: 16,
    marginBottom: 5,
    color: "#555",
  },
  controlsContainer: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  control: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  controlLabel: {
    fontSize: 16,
    color: "#333",
  },
  boopDescription: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
    marginTop: 10,
    textAlign: "center",
  },
  usersContainer: {
    flex: 1,
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
  },
  usersTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  noUsersText: {
    textAlign: "center",
    color: "#888",
    fontStyle: "italic",
    marginTop: 20,
  },
  usersList: {
    flex: 1,
  },
  userItem: {
    flexDirection: "row",
    padding: 15,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    marginBottom: 10,
    alignItems: "center",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  userDetails: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  connectButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
  },
  connectButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
});
