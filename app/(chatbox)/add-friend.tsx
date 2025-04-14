import { friendAPI } from "@/api/friend.api";
import { useCheckUserExist } from "@/hooks/useCheckUserExist";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { IconButton } from "react-native-paper";
import { useToast } from "react-native-paper-toast";
import { useMutation } from "react-query";

const AddFriendScreen = () => {
  const toaster = useToast();
  const [phone, setPhone] = useState("");
  const { data, refetch } = useCheckUserExist(phone);

  const sendFriendRequest = useMutation(friendAPI.sendFriendRequest, {
    onSuccess: (response) => {
      const { created_date } = response.data;
      if (created_date) {
        toaster.show({
          message: `Đã gửi yêu cầu kết bạn đến người dùng ${phone} thành công`,
          duration: 2000,
          type: "success",
        });
        router.back();
      }
    },
    onError: (error: any) => {
      toaster.show({
        message: error.message,
        duration: 2000,
        type: "error",
      });
    },
  });

  return (
    <View style={styles.container}>
      {/* <Text style={styles.title}>Thêm bạn</Text> */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          placeholder="Nhập số điện thoại"
          placeholderTextColor="#aaa"
          value={phone}
          onChangeText={(phone: string) => {
            setPhone(phone);
          }}
        />
        <IconButton
          icon="account-plus"
          size={24}
          onPress={() => {
            if (phone.length > 0) {
              sendFriendRequest.mutate({ to_user_phone: phone })
            }
          }}
          style={styles.searchButton}
        />
      </View>
      {
        data?.data ? (
          <View style={styles.foundFriendContainer}>
            <IconButton
              icon="account"
              size={24}
              style={styles.addButton}
            />
            <Text style={styles.foundText}>{phone}</Text>
          </View>
        ) : null
      }
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    marginBottom: 20,
    textAlign: "center",
    fontWeight: "bold",
    color: "#333",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    padding: 10,
  },
  foundFriendContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginBottom: 20,
    borderRadius: 10,
    padding: 10,
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  searchButton: {
    backgroundColor: "#608BC1",
    borderRadius: 50,
    elevation: 3,
  },
  foundText: {
    verticalAlign: "middle",
    color: "black",
    fontSize: 16,
  },
  addButton: {
    backgroundColor: "#608BC1",
    verticalAlign: "middle",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default AddFriendScreen;
