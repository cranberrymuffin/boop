module.exports = {
  dependencies: {
    "boop-ble": {
      platforms: {
        android: {
          sourceDir: "../modules/boop-ble/android/",
          packageImportPath: "import com.boopble.BoopBlePackage;",
        },
        ios: {
          podspecPath: "../modules/boop-ble/ios/BoopBle.podspec",
        },
      },
    },
  },
};
