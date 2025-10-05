# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Boop is a React Native mobile application built with Expo that enables peer-to-peer discovery and connection using Bluetooth Low Energy (BLE). The app allows users to advertise themselves and discover nearby users through BLE broadcasting and scanning.

## Key Technologies

- **Framework**: Expo (v54) with React Native 0.81.4
- **Router**: Expo Router (file-based routing)
- **Architecture**: React Native New Architecture enabled
- **Native Modules**: Custom Turbo Module for BLE functionality
- **Platforms**: iOS and Android

## Common Development Commands

```bash
# Install dependencies
npm install

# Start development server
npx expo start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Lint code
npm run lint

# Regenerate native code from iOS build
cd ios && pod install
```

## Architecture

### Native Module: boop-ble

The core BLE functionality is implemented as a local Turbo Module at `modules/boop-ble/`:

- **Location**: `modules/boop-ble/` (referenced in package.json as `"boop-ble": "file:modules/boop-ble"`)
- **Type**: React Native Turbo Module with native iOS (Swift) and Android (Kotlin) implementations
- **Configuration**: Linked via `react-native.config.js` which specifies the native module paths

**Module Structure**:
- `src/NativeBoopBle.ts` - Turbo Module spec defining the native interface
- `src/index.tsx` - JavaScript wrapper providing high-level API and event handling
- `ios/BoopBle.swift` - iOS implementation using CoreBluetooth
- `android/src/main/java/com/boopble/BoopBleModule.kt` - Android implementation

**BLE Configuration**:
- Service UUID: `12345678-1234-5678-9012-123456789ABC`
- Characteristic UUID: `87654321-4321-8765-2109-CBA987654321`
- Both iOS and Android use these UUIDs for discovery and advertising

**Key APIs**:
- `startAdvertising(userName)` / `stopAdvertising()` - Broadcast user presence
- `startScanning()` / `stopScanning()` - Discover nearby users
- `connectToUser(userId)` / `disconnect()` - Connection management
- Event listeners: `onUserDiscovered`, `onUserLost`, `onBluetoothStateChanged`, `onConnectionStateChanged`, `onError`

### Application Structure

- **Entry Point**: `app/index.tsx` renders the main `BoopBleScreen` component
- **Layout**: `app/_layout.tsx` uses Expo Router's Stack navigation
- **Main UI**: `components/BoopBleScreen.tsx` - Single screen with BLE controls and user list

### Bluetooth Permissions

**iOS** (`app.json` - ios.infoPlist):
- `NSBluetoothAlwaysUsageDescription`
- `NSBluetoothPeripheralUsageDescription`

**Android** (`app.json` - android.permissions):
- `BLUETOOTH`, `BLUETOOTH_ADMIN`, `BLUETOOTH_SCAN`, `BLUETOOTH_ADVERTISE`, `BLUETOOTH_CONNECT`
- Location permissions: `ACCESS_COARSE_LOCATION`, `ACCESS_FINE_LOCATION`

## iOS Development Notes

- Native project location: `ios/`
- Uses CocoaPods for dependency management
- New Architecture enabled via `app.json` (`"newArchEnabled": true`)
- After modifying the native module, run `cd ios && pod install` to update dependencies
- Xcode workspace: `ios/boop.xcworkspace`

## Android Development Notes

- Native project location: `android/`
- Package name: `com.boopble`
- Module configuration in `modules/boop-ble/android/build.gradle`

## Codegen for Turbo Modules

When modifying the native module interface (`modules/boop-ble/src/NativeBoopBle.ts`):

```bash
cd modules/boop-ble
npm run codegen        # Generate for both platforms
npm run codegen:ios    # iOS only
npm run codegen:android # Android only
```

## Development Workflow

1. The app uses a single screen architecture - all UI is in `BoopBleScreen.tsx`
2. BLE functionality is accessed through the `BoopBle` singleton exported from `modules/boop-ble/src`
3. Native changes require rebuilding: `npm run ios` or `npm run android` (not just `npx expo start`)
4. Hot reloading works for JavaScript/TypeScript changes only
