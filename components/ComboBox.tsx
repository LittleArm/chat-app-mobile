import React, { useState } from "react";
import {
    FlatList,
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { Chip } from "react-native-paper";

export interface EditableComboBoxModelItem {
  id: string;
  text: string;
  avatar: string;
};

interface EditableComboBoxProps {
  items: EditableComboBoxModelItem[];
  placeHolderText?: string;
  onSelectionChanged?: (ids: string[]) => void;
};

export const EditableComboBox = ({ items, placeHolderText, onSelectionChanged }: EditableComboBoxProps) => {
  const [query, setQuery] = useState("");
  const [selectedItems, setSelectedItems] = useState<EditableComboBoxModelItem[]>([]);

  const handleSelectItem = (item: EditableComboBoxModelItem) => {
    if (!selectedItems.find((f) => f.id === item.id)) {
      const currentItems: EditableComboBoxModelItem[] = [...selectedItems, item];
      setSelectedItems(currentItems);
      if (onSelectionChanged) {
        onSelectionChanged(currentItems.map((f) => f.id));
      }
    }
    setQuery("");
  };

  const handleRemoveItem = (id: string) => {
    const currentItems: EditableComboBoxModelItem[] = selectedItems.filter((
      item: EditableComboBoxModelItem) => item.id !== id);
    setSelectedItems(currentItems);

    if (onSelectionChanged) {
      onSelectionChanged(currentItems.map((f) => f.id));
    }
  };

  const filteredItems = items.filter((item: EditableComboBoxModelItem) =>
    item.text.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.selectedFriendsContainer}>
        {selectedItems.map((item: EditableComboBoxModelItem) => (
          <Chip
            key={item.id}
            onClose={() => handleRemoveItem(item.id)}
            style={styles.chip}
          >
            {item.text}
          </Chip>
        ))}
      </View>

      <TextInput
        style={styles.input}
        placeholder={placeHolderText}
        value={query}
        onChangeText={(text) => setQuery(text)}
      />
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.dropdownItem}
            onPress={() => handleSelectItem(item)}
          >
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
            <Text style={styles.name}>{item.text}</Text>
          </TouchableOpacity>
        )}
        style={styles.dropdownList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  selectedFriendsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  chip: {
    margin: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  dropdownList: {
    maxHeight: 200,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  name: {
    fontSize: 16,
  },
});
