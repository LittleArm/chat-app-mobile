import { authAPI } from '@/api';
import { useToast } from 'react-native-paper-toast';
import { useQuery } from "react-query";


export const useCheckUserExist = (phone: string, enabled: boolean=true) => {
  const toaster = useToast();
  
  return useQuery(
    ['checkUserExist', phone],
    () => authAPI.checkUserExist(phone),
    {
      enabled: phone.length > 0 && enabled,
      onError: (error: any) => {
        // console.log(error);
        toaster.show({ message: error.message, type: "error" });
      },
    }
  );
};
