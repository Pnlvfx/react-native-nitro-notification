import type { ReactNode } from 'react';
import { createContext, use, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { type PermissionStatus, type NotificationPresentationOptions, Notifications } from 'react-native-nitro-notification';

interface NotificationContextValue {
  permStatus: PermissionStatus;
  token: string | undefined;
  lastReceived: string | undefined;
  presentationOptions: NotificationPresentationOptions;
  setPresentationOptions: (options: NotificationPresentationOptions) => void;
  requestPermissions: () => Promise<void>;
  unregister: () => Promise<void>;
}

const DEFAULT_PRESENTATION_OPTIONS: NotificationPresentationOptions = {
  alert: true,
  badge: true,
  sound: true,
};

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

export const NotificationProvider = ({ children }: { readonly children: ReactNode }) => {
  const [permStatus, setPermStatus] = useState<PermissionStatus>('undetermined');
  const [token, setToken] = useState<string>();
  const [lastReceived, setLastReceived] = useState<string>();
  const [presentationOptions, setPresentationOptions] = useState<NotificationPresentationOptions>(DEFAULT_PRESENTATION_OPTIONS);

  // Ref so the handler always reads the latest options without being re-registered.
  const presentationOptionsRef = useRef(presentationOptions);
  useEffect(() => {
    presentationOptionsRef.current = presentationOptions;
  }, [presentationOptions]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const status = await Notifications.getPermissionStatus();
      if (active) setPermStatus(status);
    };
    void load();
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
    void load();
    return () => {
      active = false;
    };
  }, [permStatus]);

  useEffect(() => {
    if (permStatus !== 'granted' && permStatus !== 'provisional') return;
    const sub = Notifications.addOnTokenRefreshed((t) => {
      setToken(t);
    });
    return () => {
      sub.remove();
    };
  }, [permStatus]);

  useEffect(() => {
    Notifications.setNotificationHandler((n) => {
      setLastReceived(`Received: ${n.title ?? ''} — ${n.body ?? ''}`);
      return Promise.resolve(presentationOptionsRef.current);
    });
    return () => {
      Notifications.setNotificationHandler(undefined);
    };
  }, []);

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
    <NotificationContext
      value={{
        permStatus,
        token,
        lastReceived,
        presentationOptions,
        setPresentationOptions,
        requestPermissions,
        unregister,
      }}
    >
      {children}
    </NotificationContext>
  );
};

export const useNotification = () => {
  const ctx = use(NotificationContext);
  if (!ctx) throw new Error('useNotificationContext must be used within NotificationProvider');
  return ctx;
};
