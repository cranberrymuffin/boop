import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { multiply } from "react-native-boop-ble";

export default function Index() {
  const [result, setResult] = useState<number | undefined>();

  useEffect(() => {
    // Test the multiply function on component mount
    const testResult = multiply(3, 7);
    setResult(testResult);
  }, []);

  const testMultiply = () => {
    const a = Math.floor(Math.random() * 100);
    const b = Math.floor(Math.random() * 100);
    const result = multiply(a, b);
    setResult(result);
    console.log(`Boop BLE Test: ${a} * ${b} = ${result}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Boop BLE Module Test</Text>
      <Text style={styles.description}>
        Testing the native Turbo Module multiply function.
      </Text>
      <Text style={styles.result}>Result: {result ?? "Loading..."}</Text>
      <TouchableOpacity style={styles.button} onPress={testMultiply}>
        <Text style={styles.buttonText}>Test Random Multiply</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    color: "#666",
  },
  result: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 20,
    padding: 15,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    textAlign: "center",
    minWidth: 200,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 8,
    minWidth: 200,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
