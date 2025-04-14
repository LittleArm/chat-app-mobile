import { Href } from "expo-router";

interface Item {
  title: string;
  route: Href<string | object>;
}

export const MESSAGE_MENU_ITEMS: Item[] = [
  { title: 'Tạo nhóm', route: '/(chatbox)/create-group' },
  { title: 'Thêm bạn', route: '/(chatbox)/add-friend' }
];
