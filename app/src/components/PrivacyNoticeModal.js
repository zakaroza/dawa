import { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLang } from '../context/LanguageContext';
import { t } from '../i18n/strings';
import AppIcon from './AppIcon';

const PRIVACY_ACCEPTED_KEY = 'privacy_accepted';
const PRIVACY_COPY = {
  ar: {
    title: 'خصوصيتك مهمة',
    body: 'هاد التطبيق كيرسل الأسئلة ديالك والتسجيلات الصوتية لـ Groq AI باش يجاوب عليها، والتصاور ديال علب الدوا لـ Google Gemini (ولا لـ Groq إلا ما خدمش Gemini) باش يقرا السمية، والتصاور ديال الوصفات الطبية لـ Google Gemini، والأجوبة اللي بغيتي تسمعها لـ VoiceRSS. البروفايلات والمحادثات ديالك كيتخزنو غير فالتيليفون. البحث على الأدوية كيخدم بلا إنترنت.',
    button: 'فهمت، نبدا',
  },
  en: {
    title: 'Your Privacy Matters',
    body: 'This app sends your questions and voice recordings to Groq AI to answer them, photos of medicine boxes to Google Gemini (or Groq if Gemini is unavailable) to read the name, prescription photos to Google Gemini, and answers you choose to hear to VoiceRSS. Your profiles and chats are stored only on this phone. Medicine lookup works offline.',
    button: "Got it, let's start",
  },
};

export default function PrivacyNoticeModal() {
  const { lang, toggle } = useLang();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let mounted = true;

    AsyncStorage.getItem(PRIVACY_ACCEPTED_KEY)
      .then((accepted) => {
        if (mounted && accepted === null) setVisible(true);
      })
      .catch(() => {
        if (mounted) setVisible(true);
      });

    return () => { mounted = false; };
  }, []);

  const acceptPrivacyNotice = async () => {
    try {
      await AsyncStorage.setItem(PRIVACY_ACCEPTED_KEY, 'true');
    } finally {
      setVisible(false);
    }
  };

  const isRTL = lang === 'ar';
  const copy = PRIVACY_COPY[lang] ?? PRIVACY_COPY.en;
  const textDirection = {
    textAlign: isRTL ? 'right' : 'left',
    writingDirection: isRTL ? 'rtl' : 'ltr',
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => {}}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.lockIcon}>🔒</Text>
          <Text style={[styles.title, textDirection]}>
            {copy.title}
          </Text>
          <Text style={[styles.body, textDirection]}>
            {copy.body}
          </Text>
          <TouchableOpacity
            style={[styles.langToggle, isRTL && styles.rowReverse]}
            onPress={toggle}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={t(lang, 'switchLanguageAccessibility')}
          >
            <AppIcon name="language-outline" size={15} color="#6750A4" />
            <Text style={styles.langToggleText}>{t(lang, 'languageSwitchLabel')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={acceptPrivacyNotice}
            activeOpacity={0.8}
          >
            <Text style={[styles.buttonText, { writingDirection: isRTL ? 'rtl' : 'ltr' }]}>
              {copy.button}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.62)',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 24,
  },
  lockIcon: {
    fontSize: 38,
    textAlign: 'center',
    marginBottom: 14,
  },
  title: {
    width: '100%',
    color: '#17384F',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 12,
  },
  body: {
    width: '100%',
    color: '#465867',
    fontSize: 15,
    lineHeight: 23,
    marginBottom: 24,
  },
  langToggle: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#ffffff',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#DDD5EF',
    paddingHorizontal: 11,
    paddingVertical: 7,
    marginBottom: 16,
  },
  langToggleText: {
    color: '#6750A4',
    fontSize: 13,
    fontWeight: '800',
  },
  rowReverse: {
    flexDirection: 'row-reverse',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6750A4',
    borderRadius: 999,
    paddingHorizontal: 22,
    paddingVertical: 13,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
});
