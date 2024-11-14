import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Image } from "expo-image";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Scanner } from "@yudiel/react-qr-scanner";
import { Double } from "react-native/Libraries/Types/CodegenTypes";

enum ApiState {
  IDLE,
  LOADING,
  SUCCESS,
  ERROR,
}

export default function App() {
  const [scanned, setScanned] = useState(false);
  const [data, setData] = useState<string>("");
  const [isVerified, setVerified] = useState(true);
  const [apiState, setApiState] = useState<ApiState>(ApiState.SUCCESS);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);

  // Request camera permission on component mount
  useEffect(() => {
    requestPermission();
  }, []);

  const requestPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setPermissionGranted(true);
      stream.getTracks().forEach((track) => track.stop()); // Close camera after checking
    } catch (error) {
      setPermissionGranted(false);
    }
  };

  const ColumnSpacer = ({height} : {height: Double}) => {
    return <View style={{
      height: height,
      width: .1,
    }}/>
  }

  const handleBarCodeScanned = (result: string) => {
    setScanned(true);
    setData(result);
    // You can add your verification logic here and update isVerified accordingly
  };

  const handleError = (error: unknown) => {
    console.error("QR Scan Error:", error);
  };

  const resetState = () => {
    setScanned(false);
    setVerified(false); // Reset verification state
    setApiState(ApiState.SUCCESS);
  };

  const ApiStateView = () => {
    if (apiState === ApiState.LOADING) {
      return (
        <View style={styles.centerContainer}>
          <ColumnSpacer height={10} />
          <ActivityIndicator size={80} color="#E07B39" />
          <Text style={styles.message}>
            Loading, please hold on while we verify your details. This process
            may take a moment. Thank you for your patience!
          </Text>
        </View>
      );
    } else if (apiState === ApiState.SUCCESS) {
      return isVerified ? (
        <View style={styles.centerContainer}>
          <MaterialCommunityIcons
            name="ticket"
            size={80}
            color="green"
            style={{ margin: 10 }}
          />
          <Text style={styles.message}>
            Ticket Verified: Your ticket is valid. Welcome and enjoy the event!
          </Text>
          <ColumnSpacer height={40} />
          <TouchableOpacity
            style={styles.button}
            onPress={resetState}
          >
            <Text style={styles.text}>Scan Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.centerContainer}>
          <MaterialCommunityIcons
            name="close-circle"
            size={80}
            color="red"
            style={{ margin: 10 }}
          />
          <Text style={styles.message}>
            Invalid Ticket: The ticket scanned is not recognized. Please check
            your ticket and try again or contact support for assistance.
          </Text>
          <ColumnSpacer height={40} />
          <TouchableOpacity
            style={styles.button}
            onPress={resetState}
          >
            <Text style={styles.text}>Scan Again</Text>
          </TouchableOpacity>
        </View>
      );
    } else {
      return (
        <View style={styles.centerContainer}>
          <MaterialIcons
            name="error"
            size={80}
            color="red"
            style={{ margin: 10 }}
          />
          <Text style={styles.message}>
            Unable to verify your ticket at the moment due to a technical issue.
            Please try again shortly.
          </Text>
          <ColumnSpacer height={40} />
          <TouchableOpacity
            style={styles.button}
            onPress={resetState}
          >
            <Text style={styles.text}>Scan Again</Text>
          </TouchableOpacity>
        </View>
      );
    }
  };

  if (permissionGranted === null) {
    return (
      <View style={styles.container}>
        <GetAppName />
        <Text style={styles.message}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (permissionGranted === false) {
    return (
      <View style={styles.container}>
        <GetAppName />
        <Text style={[styles.message, {paddingHorizontal: 20,}]}>
          We need your permission for camera to scan the QR code.
        </Text>
        <ColumnSpacer height={20} />
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            window.location.reload();
          }}
        >
          <Text style={styles.text}>Request Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <GetAppName />
      {!scanned && (
        <Text style={styles.message}>
          Please hold your ticket's QR code below the scanner to verify your
          ticket. The scanner will automatically detect and display your ticket
          details:
        </Text>
      )}
      {!scanned && (
        <View style={styles.camera}>
          <Scanner
            onScan={(detectedCodes) => {
              if(detectedCodes && detectedCodes[0]) {
                handleBarCodeScanned(detectedCodes[0].rawValue);
              }
            }}
            onError={handleError}
            constraints={{ facingMode: "environment" }}
          />
        </View>
      )}
      {scanned && <ApiStateView />}
    </View>
  );
}

const GetAppName = () => {
  return (
    <View style={styles.appNameContainer}>
      <Image style={styles.appLogo} source={require("./assets/logo_1.png")} />
      <Text style={styles.appName}>Shri Guru Bhagwat</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  appLogo: {
    height: 100,
    width: 100,
    borderRadius: 360,
  },
  appNameContainer: {
    justifyContent: "center",
    alignItems: "center",
    margin: 10,
  },
  centerContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  appName: {
    fontSize: 30,
    color: "#E07B39",
    textAlign: "center",
    fontWeight: "bold",
    margin: 8,
  },
  message: {
    textAlign: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 20,
  },
  camera: {
    height: 300,
    width: 300,
    borderRadius: 8,
    margin: 8,
    backgroundColor: "#fffff0",
    alignSelf: "center",
    overflow: "hidden",
  },
  button: {
    alignItems: "center",
    backgroundColor: "#E07B39",
    width: "80%",
    alignSelf: "center",
    borderRadius: 8,
    padding: 10,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  text: {
    fontSize: 18,
    color: "white",
  },
});
