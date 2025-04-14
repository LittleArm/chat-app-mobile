import { FC, useState, createContext, useContext, ReactNode } from "react";

type ChatProfile = {
  id: string;
  name: string;
  avatar?: string;
  isGroupChat: boolean;
  memberCount?: number;
  newMessage?: boolean;
};

type ChatContext = {
  toUserId: string;
  toGroupId: string;
  chatboxId: string;
  chatProfile: ChatProfile;
  setToUserId: React.Dispatch<React.SetStateAction<string>>;
  setToGroupId: React.Dispatch<React.SetStateAction<string>>;
  setChatboxId: React.Dispatch<React.SetStateAction<string>>;
  setChatProfile: React.Dispatch<React.SetStateAction<ChatProfile>>;
};

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const ChatContext = createContext<ChatContext>({} as ChatContext);

interface Props {
  children: ReactNode;
}

export const ChatProvider: FC<Props> = ({ children }) => {
  const [toUserId, setToUserId] = useState("");
  const [toGroupId, setToGroupId] = useState("");
  const [chatboxId, setChatboxId] = useState("");
  const [chatProfile, setChatProfile] = useState<ChatProfile>({
    id: "",
    name: "",
    avatar: "",
    isGroupChat: false,
    memberCount: 0,
    newMessage: false,
  });

  return (
    <ChatContext.Provider
      value={{
        toUserId,
        setToUserId,
        toGroupId,
        setToGroupId,
        chatboxId,
        setChatboxId,
        chatProfile,
        setChatProfile,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);

  if (!context) throw new Error("It's must be in ChatProvider");

  return context;
};
