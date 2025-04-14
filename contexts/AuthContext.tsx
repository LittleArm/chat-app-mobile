import {
  FC,
  useState,
  createContext,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import { STORAGE_KEY } from "../utils/constants";
import AsyncStorage from '@react-native-async-storage/async-storage';

type AuthContext = {
  accessToken: string;
  userId: string;
  setUserId: React.Dispatch<React.SetStateAction<string>>;
  setAccessToken: React.Dispatch<React.SetStateAction<string>>;
};

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const AuthContext = createContext<AuthContext>({} as AuthContext);

interface Props {
  children: ReactNode;
}

export const AuthProvider: FC<Props> = ({ children }) => {
  const [userId, setUserId] = useState("");
  const [accessToken, setAccessToken] = useState("");

  useEffect(() => {
    setAuthValue();
  }, []);

  const setAuthValue = async () => {
    const accessToken = await AsyncStorage.getItem(STORAGE_KEY.ACCESS_TOKEN);
    if (accessToken) {
      setAccessToken(accessToken);
    }
    const id = await AsyncStorage.getItem(STORAGE_KEY.ID);
    if (id) {
      setUserId(id);
    }
  }
  
  return (
    <AuthContext.Provider
      value={{ userId, setUserId, accessToken, setAccessToken }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) throw new Error("It's must be in AuthProvider");

  return context;
};
