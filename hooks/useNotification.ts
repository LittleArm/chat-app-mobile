import messaging from "@react-native-firebase/messaging";
import { useEffect, useState } from "react";
import { PermissionsAndroid, Platform } from "react-native";

const useNotification = () => {
  const [token, setToken] = useState<string>();
  useEffect(() => {
    const requestPermission = async () => {
      if (Platform.OS === 'ios') {
        const permission = await messaging().requestPermission();
        
        const enabled =
          permission === messaging.AuthorizationStatus.AUTHORIZED ||
          permission === messaging.AuthorizationStatus.PROVISIONAL;
  
        if (enabled) {
          console.log("Authorization status:", permission);
        }
      } else if (Platform.OS === 'android') {
        const permission = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
        if (permission === 'granted') {
          console.log("Authorization status:", permission);
        }
      }

      const newToken = await messaging().getToken();
      setToken(newToken);
    };

    requestPermission().then();
  }, []);

  return token;
};

export default useNotification;
