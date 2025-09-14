import Foundation
import CoreBluetooth
import React

struct BoopUser {
    let id: String
    let name: String
    let rssi: Int
    let distance: Double?
}

@objc(BleBoop)
class BleBoop: RCTEventEmitter {
    private var centralManager: CBCentralManager?
    private var peripheralManager: CBPeripheralManager?
    private var isScanning = false
    private var isAdvertising = false
    private var userName: String?
    private var discoveredUsers: [String: BoopUser] = [:]
    
    // Service and characteristic UUIDs
    private let BOOP_SERVICE_UUID = CBUUID(string: "12345678-1234-5678-9012-123456789ABC")
    private let BOOP_CHARACTERISTIC_UUID = CBUUID(string: "87654321-4321-8765-2109-CBA987654321")
    
    override init() {
        super.init()
        initializeBluetooth()
    }
    
    override func supportedEvents() -> [String]! {
        return ["onUserDiscovered", "onUserLost", "onConnectionStateChanged", "onError"]
    }
    
    private func initializeBluetooth() {
        centralManager = CBCentralManager(delegate: self, queue: nil)
        peripheralManager = CBPeripheralManager(delegate: self, queue: nil)
    }
    
    @objc
    func startAdvertising(_ userName: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        guard let peripheralManager = peripheralManager else {
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
        
        // Create the service
        let service = CBMutableService(type: BOOP_SERVICE_UUID, primary: true)
        
        // Create the characteristic with the username
        let characteristic = CBMutableCharacteristic(
            type: BOOP_CHARACTERISTIC_UUID,
            properties: [.read, .notify],
            value: userName.data(using: .utf8),
            permissions: [.readable]
        )
        
        service.characteristics = [characteristic]
        peripheralManager.add(service)
        
        // Start advertising
        let advertisementData = [
            CBAdvertisementDataServiceUUIDsKey: [BOOP_SERVICE_UUID],
            CBAdvertisementDataLocalNameKey: "Boop-\(userName)"
        ]
        
        peripheralManager.startAdvertising(advertisementData)
        isAdvertising = true
        resolve(nil)
    }
    
    @objc
    func stopAdvertising(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        peripheralManager?.stopAdvertising()
        isAdvertising = false
        resolve(nil)
    }
    
    @objc
    func startScanning(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        guard let centralManager = centralManager else {
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
        resolve(nil)
    }
    
    @objc
    func stopScanning(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        centralManager?.stopScan()
        isScanning = false
        resolve(nil)
    }
    
    @objc
    func connectToUser(_ userId: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        guard let user = discoveredUsers[userId] else {
            reject("USER_NOT_FOUND", "User not found", nil)
            return
        }
        
        sendEvent(withName: "onConnectionStateChanged", body: ["state": "connecting"])
        
        // For demonstration, simulate connection
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
            self.sendEvent(withName: "onConnectionStateChanged", body: ["state": "connected"])
        }
        
        resolve(nil)
    }
    
    @objc
    func disconnect(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        sendEvent(withName: "onConnectionStateChanged", body: ["state": "disconnected"])
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
extension BleBoop: CBCentralManagerDelegate {
    func centralManagerDidUpdateState(_ central: CBCentralManager) {
        switch central.state {
        case .poweredOn:
            print("Bluetooth is powered on")
        case .poweredOff:
            sendEvent(withName: "onError", body: ["error": "Bluetooth is powered off"])
        case .unauthorized:
            sendEvent(withName: "onError", body: ["error": "Bluetooth access unauthorized"])
        case .unsupported:
            sendEvent(withName: "onError", body: ["error": "Bluetooth not supported"])
        default:
            sendEvent(withName: "onError", body: ["error": "Unknown Bluetooth state"])
        }
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
        
        sendEvent(withName: "onUserDiscovered", body: [
            "id": user.id,
            "name": user.name,
            "rssi": user.rssi,
            "distance": user.distance as Any
        ])
    }
}

// MARK: - CBPeripheralManagerDelegate
extension BleBoop: CBPeripheralManagerDelegate {
    func peripheralManagerDidUpdateState(_ peripheral: CBPeripheralManager) {
        switch peripheral.state {
        case .poweredOn:
            print("Peripheral manager is powered on")
        case .poweredOff:
            sendEvent(withName: "onError", body: ["error": "Bluetooth is powered off"])
        case .unauthorized:
            sendEvent(withName: "onError", body: ["error": "Bluetooth access unauthorized"])
        case .unsupported:
            sendEvent(withName: "onError", body: ["error": "Bluetooth not supported"])
        default:
            sendEvent(withName: "onError", body: ["error": "Unknown Bluetooth state"])
        }
    }
    
    func peripheralManager(_ peripheral: CBPeripheralManager, didAdd service: CBService, error: Error?) {
        if let error = error {
            sendEvent(withName: "onError", body: ["error": "Failed to add service: \(error.localizedDescription)"])
        }
    }
}
