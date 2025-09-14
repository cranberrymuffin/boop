package com.boopble

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.Arguments
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.facebook.react.bridge.ReactContextBaseJavaModule

import android.bluetooth.*
import android.bluetooth.le.*
import android.content.Context
import android.content.pm.PackageManager
import android.os.ParcelUuid
import android.util.Log
import androidx.core.app.ActivityCompat
import java.util.*
import java.util.concurrent.ConcurrentHashMap

class BoopBleModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    
    private var bluetoothAdapter: BluetoothAdapter? = null
    private var bluetoothLeScanner: BluetoothLeScanner? = null
    private var bluetoothLeAdvertiser: BluetoothLeAdvertiser? = null
    private var isScanning = false
    private var isAdvertising = false
    private var userName: String? = null
    private var scanCallback: ScanCallback? = null
    private var advertiseCallback: AdvertiseCallback? = null
    
    // Service UUID for Boop discovery
    private val BOOP_SERVICE_UUID = UUID.fromString("12345678-1234-5678-9012-123456789abc")
    private val BOOP_CHARACTERISTIC_UUID = UUID.fromString("87654321-4321-8765-2109-cba987654321")
    
    // Map to store discovered users
    private val discoveredUsers = ConcurrentHashMap<String, BoopUser>()
    
    data class BoopUser(
        val id: String,
        val name: String,
        val rssi: Int,
        val distance: Double? = null
    )

    override fun getName(): String {
        return "BoopBle"
    }

    init {
        initializeBluetooth()
    }

    private fun initializeBluetooth() {
        val bluetoothManager = reactApplicationContext.getSystemService(Context.BLUETOOTH_SERVICE) as BluetoothManager
        bluetoothAdapter = bluetoothManager.adapter
        bluetoothLeScanner = bluetoothAdapter?.bluetoothLeScanner
        bluetoothLeAdvertiser = bluetoothAdapter?.bluetoothLeAdvertiser
    }

    @ReactMethod
    fun startAdvertising(userName: String, promise: Promise) {
        try {
            if (bluetoothAdapter == null || !bluetoothAdapter!!.isEnabled) {
                promise.reject("BLUETOOTH_DISABLED", "Bluetooth is not enabled")
                return
            }

            if (isAdvertising) {
                promise.reject("ALREADY_ADVERTISING", "Already advertising")
                return
            }

            this.userName = userName

            val settings = AdvertiseSettings.Builder()
                .setAdvertiseMode(AdvertiseSettings.ADVERTISE_MODE_LOW_LATENCY)
                .setTxPowerLevel(AdvertiseSettings.ADVERTISE_TX_POWER_HIGH)
                .setConnectable(true)
                .build()

            val data = AdvertiseData.Builder()
                .setIncludeDeviceName(false)
                .setIncludeTxPowerLevel(false)
                .addServiceData(ParcelUuid(BOOP_SERVICE_UUID), userName.toByteArray())
                .build()

            advertiseCallback = object : AdvertiseCallback() {
                override fun onStartSuccess(settingsInEffect: AdvertiseSettings?) {
                    isAdvertising = true
                    promise.resolve(null)
                    Log.d("BoopBle", "Advertising started successfully")
                }

                override fun onStartFailure(errorCode: Int) {
                    isAdvertising = false
                    promise.reject("ADVERTISE_FAILED", "Failed to start advertising: $errorCode")
                    Log.e("BoopBle", "Advertising failed: $errorCode")
                }
            }

            bluetoothLeAdvertiser?.startAdvertising(settings, data, advertiseCallback)
        } catch (e: Exception) {
            promise.reject("ADVERTISE_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun stopAdvertising(promise: Promise) {
        try {
            if (isAdvertising && advertiseCallback != null) {
                bluetoothLeAdvertiser?.stopAdvertising(advertiseCallback)
                isAdvertising = false
            }
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("STOP_ADVERTISE_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun startScanning(promise: Promise) {
        try {
            if (bluetoothAdapter == null || !bluetoothAdapter!!.isEnabled) {
                promise.reject("BLUETOOTH_DISABLED", "Bluetooth is not enabled")
                return
            }

            if (isScanning) {
                promise.reject("ALREADY_SCANNING", "Already scanning")
                return
            }

            val settings = ScanSettings.Builder()
                .setScanMode(ScanSettings.SCAN_MODE_LOW_LATENCY)
                .build()

            val filters = listOf(
                ScanFilter.Builder()
                    .setServiceUuid(ParcelUuid(BOOP_SERVICE_UUID))
                    .build()
            )

            scanCallback = object : ScanCallback() {
                override fun onScanResult(callbackType: Int, result: ScanResult?) {
                    result?.let { scanResult ->
                        val device = scanResult.device
                        val rssi = scanResult.rssi
                        val serviceData = scanResult.scanRecord?.getServiceData(ParcelUuid(BOOP_SERVICE_UUID))
                        
                        if (serviceData != null) {
                            val userName = String(serviceData)
                            val distance = calculateDistance(rssi)
                            
                            val user = BoopUser(
                                id = device.address,
                                name = userName,
                                rssi = rssi,
                                distance = distance
                            )
                            
                            discoveredUsers[device.address] = user
                            
                            sendEvent("onUserDiscovered", createUserMap(user))
                        }
                    }
                }

                override fun onScanFailed(errorCode: Int) {
                    isScanning = false
                    sendEvent("onError", Arguments.createMap().apply {
                        putString("error", "Scan failed: $errorCode")
                    })
                    Log.e("BoopBle", "Scan failed: $errorCode")
                }
            }

            bluetoothLeScanner?.startScan(filters, settings, scanCallback)
            isScanning = true
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("SCAN_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun stopScanning(promise: Promise) {
        try {
            if (isScanning && scanCallback != null) {
                bluetoothLeScanner?.stopScan(scanCallback)
                isScanning = false
            }
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("STOP_SCAN_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun connectToUser(userId: String, promise: Promise) {
        try {
            val user = discoveredUsers[userId]
            if (user == null) {
                promise.reject("USER_NOT_FOUND", "User not found")
                return
            }

            sendEvent("onConnectionStateChanged", Arguments.createMap().apply {
                putString("state", "connecting")
            })
            
            // In a real implementation, you would establish a GATT connection here
            // For demonstration, we'll just mark as connected after a delay
            Thread {
                Thread.sleep(1000)
                sendEvent("onConnectionStateChanged", Arguments.createMap().apply {
                    putString("state", "connected")
                })
            }.start()
            
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("CONNECT_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun disconnect(promise: Promise) {
        try {
            sendEvent("onConnectionStateChanged", Arguments.createMap().apply {
                putString("state", "disconnected")
            })
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("DISCONNECT_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun getDiscoveredUsers(promise: Promise) {
        try {
            val users = Arguments.createArray()
            discoveredUsers.values.forEach { user ->
                users.pushMap(createUserMap(user))
            }
            promise.resolve(users)
        } catch (e: Exception) {
            promise.reject("GET_USERS_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun isBluetoothEnabled(promise: Promise) {
        try {
            val isEnabled = bluetoothAdapter?.isEnabled ?: false
            promise.resolve(isEnabled)
        } catch (e: Exception) {
            promise.reject("BLUETOOTH_CHECK_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun requestBluetoothPermissions(promise: Promise) {
        try {
            // This would typically involve requesting permissions from the activity
            // For now, we'll return true assuming permissions are granted
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("PERMISSION_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun addListener(eventName: String) {
        // Required for TurboModule event emitters
    }

    @ReactMethod
    fun removeListeners(count: Int) {
        // Required for TurboModule event emitters
    }

    private fun createUserMap(user: BoopUser): WritableMap {
        return Arguments.createMap().apply {
            putString("id", user.id)
            putString("name", user.name)
            putInt("rssi", user.rssi)
            user.distance?.let { putDouble("distance", it) }
        }
    }

    private fun sendEvent(eventName: String, params: WritableMap) {
        reactApplicationContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
    }

    private fun calculateDistance(rssi: Int): Double {
        // Simple distance calculation based on RSSI
        // This is an approximation and can vary greatly based on environment
        return Math.pow(10.0, (-69 - rssi) / 20.0)
    }

    override fun onCatalystInstanceDestroy() {
        super.onCatalystInstanceDestroy()
        cleanup()
    }

    private fun cleanup() {
        if (isScanning && scanCallback != null) {
            bluetoothLeScanner?.stopScan(scanCallback)
        }
        if (isAdvertising && advertiseCallback != null) {
            bluetoothLeAdvertiser?.stopAdvertising(advertiseCallback)
        }
        discoveredUsers.clear()
    }
}
