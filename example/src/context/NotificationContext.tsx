import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import {
  type PermissionStatus,
  Notifications,
} from 'react-native-nitro-notification';

type NotificationContextValue = {
  permStatus: PermissionStatus;
  token: string | undefined;
  lastReceived: string | undefined;
  requestPermissions: () => Promise<void>;
  unregister: () => Promise<void>;
};

const NotificationContext = createContext<NotificationContextValue | undefined>(
  undefined
);

export const useNotificationContext = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx)
    throw new Error(
      'useNotificationContext must be used within NotificationProvider'
    );
  return ctx;
};

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [permStatus, setPermStatus] =
    useState<PermissionStatus>('undetermined');
  const [token, setToken] = useState<string | undefined>(undefined);
  const [lastReceived, setLastReceived] = useState<string | undefined>(
    undefined
  );

  useEffect(() => {
    let active = true;
    const load = async () => {
      const status = await Notifications.getPermissionStatus();
      if (active) setPermStatus(status);
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (permStatus !== 'granted' && permStatus !== 'provisional') return;
    let active = true;
    const load = async () => {
      const t = await Notifications.getDevicePushToken();
      if (active) setToken(t);
    };
    load();
    return () => {
      active = false;
    };
  }, [permStatus]);

  useEffect(() => {
    if (permStatus !== 'granted' && permStatus !== 'provisional') return;
    const sub = Notifications.addOnTokenRefreshed((t) => setToken(t));
    return () => sub.remove();
  }, [permStatus]);

  useEffect(() => {
    if (permStatus !== 'granted' && permStatus !== 'provisional') return;
    const sub = Notifications.addOnNotificationReceived((n) => {
      setLastReceived(`${n.title ?? '(no title)'} — ${n.body ?? '(no body)'}`);
    });
    return () => sub.remove();
  }, [permStatus]);

  useEffect(() => {
    if (permStatus !== 'granted' && permStatus !== 'provisional') return;
    Notifications.setForegroundPresentationOptions({
      alert: true,
      badge: true,
      sound: true,
    });
  }, [permStatus]);

  const requestPermissions = async () => {
    const status = await Notifications.requestPermissions();
    setPermStatus(status);
  };

  const unregister = async () => {
    await Notifications.unregisterForNotifications();
    setToken(undefined);
    Alert.alert('Unregistered', 'Token removed from device.');
  };

  return (
    <NotificationContext.Provider
      value={{
        permStatus,
        token,
        lastReceived,
        requestPermissions,
        unregister,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
