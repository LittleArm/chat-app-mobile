import { Href, router } from 'expo-router';
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Menu, IconButton } from 'react-native-paper';


interface SimpleMenuItem {
  title: string;
  route: Href<string | object>;
};

interface SimpleMenuProps {
  items: SimpleMenuItem[];
}

export const SimpleMenu = ({ items }: SimpleMenuProps) => {
  const [visible, setVisible] = useState(false);

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  return (
    <View style={styles.container}>
      <Menu
        visible={visible}
        onDismiss={closeMenu}
        anchor={
          <IconButton
            icon="dots-vertical"
            size={24}
            onPress={openMenu}
          />
        }
        contentStyle={styles.menuContent}
      >
        {items.map(
          (item, index) => <Menu.Item
            key={index} 
            title={item.title} 
            onPress={() => {
                router.navigate(item.route)
                closeMenu();
              }
          }/>)
        }
      </Menu>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  menuContent: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
});
