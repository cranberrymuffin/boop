import Foundation
import CoreBluetooth
import React

struct BoopUser {
    let id: String
    let name: String
    let rssi: Int
    let distance: Double?
}

@objc(BoopBle)
class BoopBle: RCTEventEmitter {
    private var centralManager: CBCentralManager?
    private var peripheralManager: CBPeripheralManager?
    private var isScanning = false
    private var isAdvertising = false
    private var userName: String?
    private var discoveredUsers: [String: BoopUser] = [:]
    private var hasListeners = false
    private let logger: IBoopLogger = BoopLogger.shared

    // Service and characteristic UUIDs
    private let BOOP_SERVICE_UUID = CBUUID(string: "12345678-1234-5678-9012-123456789ABC")
    private let BOOP_CHARACTERISTIC_UUID = CBUUID(string: "87654321-4321-8765-2109-CBA987654321")
    
    override init() {
        super.init()
        // Delay Bluetooth initialization until the module is properly set up
        DispatchQueue.main.async {
            self.initializeBluetooth()
        }
    }
    
    override func supportedEvents() -> [String]! {
        return ["onBluetoothStateChanged", "onUserDiscovered", "onUserLost", "onConnectionStateChanged", "onError"]
    }
    
    override func startObserving() {
        hasListeners = true
    }
    
    override func stopObserving() {
        hasListeners = false
    }
    
    private func sendEventSafely(withName name: String, body: Any?) {
        if hasListeners && bridge != nil {
            logger.logInfo("Sending event: \(name)", category: "BLE")
            sendEvent(withName: name, body: body)
        }
    }
    
    private func initializeBluetooth() {
        centralManager = CBCentralManager(delegate: self, queue: nil)
        peripheralManager = CBPeripheralManager(delegate: self, queue: nil)
    }
    
    @objc
    func startAdvertising(_ userName: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        guard let peripheralManager = peripheralManager else {
            logger.logError("Peripheral manager not initialized", category: "BLE")
            reject("BLUETOOTH_ERROR", "Peripheral manager not initialized", nil)
            return
        }

        guard peripheralManager.state == .poweredOn else {
            reject("BLUETOOTH_DISABLED", "Bluetooth is not powered on", nil)
            return
        }

        if isAdvertising {
            reject("ALREADY_ADVERTISING", "Already advertising", nil)
            return
        }

        self.userName = userName

        // Start advertising with just the service UUID and local name
        // Don't add services for simple advertising - this can cause crashes
        let advertisementData: [String: Any] = [
            CBAdvertisementDataServiceUUIDsKey: [BOOP_SERVICE_UUID],
            CBAdvertisementDataLocalNameKey: "Boop-\(userName)"
        ]

        peripheralManager.startAdvertising(advertisementData)
        isAdvertising = true
        logger.logInfo("Started advertising as: \(userName)", category: "BLE")
        resolve(nil)
    }
    
    @objc
    func stopAdvertising(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        peripheralManager?.stopAdvertising()
        isAdvertising = false
        logger.logInfo("Stopped advertising", category: "BLE")
        resolve(nil)
    }
    
    @objc
    func startScanning(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        guard let centralManager = centralManager else {
            logger.logError("Central manager not initialized", category: "BLE")
            reject("BLUETOOTH_ERROR", "Central manager not initialized", nil)
            return
        }

        guard centralManager.state == .poweredOn else {
            reject("BLUETOOTH_DISABLED", "Bluetooth is not powered on", nil)
            return
        }

        if isScanning {
            reject("ALREADY_SCANNING", "Already scanning", nil)
            return
        }

        let options = [CBCentralManagerScanOptionAllowDuplicatesKey: true]
        centralManager.scanForPeripherals(withServices: [BOOP_SERVICE_UUID], options: options)
        isScanning = true
        logger.logInfo("Started scanning for users", category: "BLE")
        resolve(nil)
    }
    
    @objc
    func stopScanning(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        centralManager?.stopScan()
        isScanning = false
        logger.logInfo("Stopped scanning", category: "BLE")
        resolve(nil)
    }
    
    @objc
    func connectToUser(_ userId: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        guard let user = discoveredUsers[userId] else {
            reject("USER_NOT_FOUND", "User not found", nil)
            return
        }
        
        sendEventSafely(withName: "onConnectionStateChanged", body: ["state": "connecting"])
        
        // For demonstration, simulate connection
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
            self.sendEventSafely(withName: "onConnectionStateChanged", body: ["state": "connected"])
        }
        
        resolve(nil)
    }
    
    @objc
    func disconnect(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        sendEventSafely(withName: "onConnectionStateChanged", body: ["state": "disconnected"])
        resolve(nil)
    }
    
    @objc
    func getDiscoveredUsers(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        let users = discoveredUsers.values.map { user in
            return [
                "id": user.id,
                "name": user.name,
                "rssi": user.rssi,
                "distance": user.distance as Any
            ]
        }
        resolve(users)
    }
    
    @objc
    func isBluetoothEnabled(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        let isEnabled = centralManager?.state == .poweredOn
        resolve(isEnabled)
    }
    
    @objc
    func requestBluetoothPermissions(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        // iOS automatically handles Bluetooth permissions
        resolve(true)
    }
    
    private func calculateDistance(rssi: Int) -> Double {
        // Simple distance calculation based on RSSI
        return pow(10.0, (-69.0 - Double(rssi)) / 20.0)
    }
    
    private func cleanup() {
        if isScanning {
            centralManager?.stopScan()
        }
        if isAdvertising {
            peripheralManager?.stopAdvertising()
        }
        discoveredUsers.removeAll()
    }
    
    deinit {
        cleanup()
    }
}

// MARK: - CBCentralManagerDelegate
extension BoopBle: CBCentralManagerDelegate {
    func centralManagerDidUpdateState(_ central: CBCentralManager) {
        let stateString: String
        switch central.state {
        case .poweredOn:
            stateString = "enabled"
        case .poweredOff:
            stateString = "disabled"
        case .unauthorized:
            stateString = "disabled"
        case .unsupported:
            stateString = "disabled"
        default:
            stateString = "disabled"
        }
        logger.logInfo("Central manager state changed: \(central.state.rawValue)", category: "BLE")
        sendEventSafely(withName: "onBluetoothStateChanged", body: stateString)
    }
    
    func centralManager(_ central: CBCentralManager, didDiscover peripheral: CBPeripheral, advertisementData: [String : Any], rssi RSSI: NSNumber) {
        let rssiValue = RSSI.intValue
        let distance = calculateDistance(rssi: rssiValue)
        
        // Extract username from advertisement data
        var userName = "Unknown"
        if let localName = advertisementData[CBAdvertisementDataLocalNameKey] as? String,
           localName.hasPrefix("Boop-") {
            userName = String(localName.dropFirst(5)) // Remove "Boop-" prefix
        }
        
        let user = BoopUser(
            id: peripheral.identifier.uuidString,
            name: userName,
            rssi: rssiValue,
            distance: distance
        )
        
        discoveredUsers[peripheral.identifier.uuidString] = user
        
        sendEventSafely(withName: "onUserDiscovered", body: [
            "id": user.id,
            "name": user.name,
            "rssi": user.rssi,
            "distance": user.distance as Any
        ])
    }
}

// MARK: - CBPeripheralManagerDelegate
extension BoopBle: CBPeripheralManagerDelegate {
    func peripheralManagerDidUpdateState(_ peripheral: CBPeripheralManager) {
        let stateString: String
        switch peripheral.state {
        case .poweredOn:
            stateString = "enabled"
        case .poweredOff:
            stateString = "disabled"
        case .unauthorized:
            stateString = "disabled"
        case .unsupported:
            stateString = "disabled"
        default:
            stateString = "disabled"
        }
        logger.logInfo("Peripheral manager state changed: \(peripheral.state.rawValue)", category: "BLE")
        sendEventSafely(withName: "onBluetoothStateChanged", body: stateString)
    }

    func peripheralManager(_ peripheral: CBPeripheralManager, didAdd service: CBService, error: Error?) {
        if let error = error {
            logger.logError("Failed to add service: \(error.localizedDescription)", category: "BLE")
            sendEventSafely(withName: "onError", body: ["error": "Failed to add service: \(error.localizedDescription)"])
        }
    }
}
