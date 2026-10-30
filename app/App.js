import React, { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LanguageProvider, useLang } from './src/context/LanguageContext';
import { t } from './src/i18n/strings';
import PrivacyNoticeModal from './src/components/PrivacyNoticeModal';
import ChatbotScreen from './src/screens/ChatbotScreen';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      const lang = this.props.lang;
      const textAlign = lang === 'ar' ? 'right' : 'left';
      return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
          <Text style={{ width: '100%', fontSize: 18, fontWeight: '700', marginBottom: 12, textAlign }}>
            {t(lang, 'appErrorTitle')}
          </Text>
          <Text style={{ width: '100%', fontSize: 14, color: '#666', textAlign, marginBottom: 24 }}>
            {t(lang, 'appErrorMessage')}
          </Text>
          <TouchableOpacity
            onPress={() => this.setState({ hasError: false })}
            style={{ backgroundColor: '#6750A4', borderRadius: 999, paddingHorizontal: 28, paddingVertical: 12 }}
          >
            <Text style={{ color: '#fff', fontWeight: '700' }}>{t(lang, 'restart')}</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

function LocalizedErrorBoundary({ children }) {
  const { lang } = useLang();
  return <ErrorBoundary lang={lang}>{children}</ErrorBoundary>;
}

async function setupNotificationChannel() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('medicine-reminders', {
      name: 'Medicine Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      sound: true,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#6750A4',
    });
  }
}

export default function App() {
  useEffect(() => { setupNotificationChannel(); }, []);
  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <LocalizedErrorBoundary>
          <>
            <ChatbotScreen />
            <PrivacyNoticeModal />
          </>
        </LocalizedErrorBoundary>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}
