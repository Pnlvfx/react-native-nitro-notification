import { useEffect } from 'react';
import { Notifications } from 'react-native-nitro-notification';
import { Navigation, navigationRef } from './navigation';
import { NotificationProvider } from './context/NotificationContext';

const App = () => {
  useEffect(() => {
    const sub = Notifications.addOnNotificationTapped((response) => {
      if (!navigationRef.isReady()) return;
      navigationRef.navigate('NotificationDetail', {
        notificationTitle: response.notification.title ?? '',
        notificationBody: response.notification.body ?? '',
        notificationData: JSON.stringify(response.notification.data ?? {}),
        actionIdentifier: response.actionIdentifier,
      });
    });
    return () => {
      sub.remove();
    };
  }, []);

  return (
    <NotificationProvider>
      <Navigation ref={navigationRef} />
    </NotificationProvider>
  );
};

export default App;
