module.exports = {
  dependencies: {
    'react-native-ble-boop': {
      platforms: {
        android: {
          sourceDir: '../modules/react-native-ble-boop/android/',
          packageImportPath: 'import com.bleboop.BleBoopPackage;',
        },
        ios: {
          podspecPath: '../modules/react-native-ble-boop/ios/BleBoop.podspec',
        },
      },
    },
  },
};
