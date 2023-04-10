import { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { Alert, Button, Platform, StyleSheet, View } from "react-native";
import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});
const getPermissionsAsync = async () => {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    let finalStatus = status;

    if (finalStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      Alert.alert(
        "Permission error",
        "You need to set up permissions to use the app"
      );
    }
    return finalStatus;
  } catch (err) {
    console.log(err);
  }
};
export default function App() {
  const [permissions, setPermissions] =
    useState<Notifications.PermissionStatus>();
  console.log(permissions);

  useEffect(() => {
    (async () => {
      const status = await getPermissionsAsync();
      setPermissions(status);
    })();
  }, []);

  useEffect(() => {
    if (permissions === "denied") return;
    (async () => {
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      if (Platform.OS === "android") {
        Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.LOW,
        });
      }
    })();
  }, [permissions]);
  useEffect(() => {
    if (permissions === "denied") return;
    const notification1 = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log(notification);
      }
    );
    const notification2 = Notifications.addNotificationResponseReceivedListener(
      (res) => {
        console.log(res);
      }
    );
    return () => {
      notification1.remove();
      notification2.remove();
    };
  }, [permissions]);

  const sendNotification = () => {
    Notifications.scheduleNotificationAsync({
      content: {
        title: "A new notification",
        body: "Open an app",
        data: {
          useName: "Yana",
        },
      },
      trigger: {
        seconds: 3,
      },
    });
  };

  const pushNotification = () => {
    fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: "",
        title: "push not",
        body: "hello",
      }),
    });
  };
  return (
    <View style={styles.container}>
      <Button onPress={sendNotification} title="Send notification" />
      <Button onPress={pushNotification} title="Send push message" />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
