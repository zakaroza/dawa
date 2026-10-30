import { useEffect, useRef } from 'react';
import {
  Animated,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppIcon from './AppIcon';
import { colors, radii, spacing, type } from '../theme/theme';

const COPY = {
  en: {
    appName: 'Dawa',
    assistant: 'Medical Assistant',
    newChat: 'New Conversation',
    profiles: 'Profiles',
    noProfiles: 'No profiles yet',
    medicineLibrary: 'Medicine Library',
    savedMedicines: 'Saved Medicines',
    symptomLog: 'Symptom Log',
    reminders: 'Reminders',
    remindersSubtitle: 'Set medicine alerts',
    selfCareLibrary: 'Self-care library',
    recentChats: 'Recent Chats',
    noChats: 'No previous chats yet',
    deleteChat: 'Delete chat',
    historyError: 'Could not save chat changes. Please try again.',
    closeMenu: 'Close menu',
  },
  ar: {
    appName: 'دواك',
    assistant: 'المساعد الطبي',
    newChat: 'محادثة جديدة',
    profiles: 'الملفات الشخصية',
    noProfiles: 'ما كاين تا ملف',
    medicineLibrary: 'مكتبة الأدوية',
    savedMedicines: 'الأدوية المحفوظة',
    symptomLog: 'سجل الأعراض',
    reminders: 'التذكيرات',
    remindersSubtitle: 'ضبط تنبيهات الدواء',
    selfCareLibrary: 'مكتبة الرعاية الذاتية',
    recentChats: 'المحادثات الأخيرة',
    noChats: 'ما كايناش محادثات سابقة',
    deleteChat: 'مسح المحادثة',
    historyError: 'ما قدرناش نحفظو تغييرات المحادثات. عاود المحاولة.',
    closeMenu: 'سد القائمة',
  },
};

export default function SidebarDrawer({
  visible,
  onClose,
  onNewChat,
  onOpenChat,
  onDeleteChat,
  chatHistory,
  activeChatId,
  loading,
  lang,
  profiles,
  activeProfile,
  onOpenProfiles,
  onOpenMedicineLibrary,
  onOpenSymptomLog,
  onOpenReminders,
  onOpenSelfCare,
  savedMedicinesCount,
  historyStorageError,
}) {
  const insets = useSafeAreaInsets();
  const slideAnimation = useRef(new Animated.Value(-320)).current;
  const isRTL = lang === 'ar';
  const copy = COPY[lang] ?? COPY.en;
  const directionStyle = { textAlign: isRTL ? 'right' : 'left' };

  useEffect(() => {
    if (!visible) return;
    slideAnimation.setValue(-320);
    Animated.timing(slideAnimation, {
      toValue: 0,
      duration: 240,
      useNativeDriver: true,
    }).start();
  }, [slideAnimation, visible]);

  const closeWithAnimation = (afterClose) => {
    Animated.timing(slideAnimation, {
      toValue: -320,
      duration: 210,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (!finished) return;
      onClose();
      afterClose?.();
    });
  };

  const formatChatDate = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString(isRTL ? 'ar-MA' : 'en-GB', {
      day: 'numeric',
      month: 'short',
    });
  };

  const profileCount = Array.isArray(profiles) ? profiles.length : 0;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={() => closeWithAnimation()}>
      <View style={styles.modalRoot}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={() => closeWithAnimation()}
          accessibilityLabel={copy.closeMenu}
        />
        <Animated.View style={[styles.drawer, { transform: [{ translateX: slideAnimation }] }]}>
          <View style={[styles.flex, { paddingTop: insets.top }]}>
            <LinearGradient
              colors={['#0A2535', '#1E6090']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.drawerHeader}
            >
              <View style={[styles.drawerHeaderRow, isRTL && styles.rowReverse]}>
                <View style={styles.drawerLogo}>
                  <AppIcon name="pulse-outline" size={22} color={colors.white} />
                </View>
                <View style={styles.headerCopy}>
                  <Text style={[styles.drawerTitle, directionStyle]}>{copy.appName}</Text>
                  <Text style={[styles.drawerSubtitle, directionStyle]}>{copy.assistant}</Text>
                </View>
                <TouchableOpacity style={styles.closeButton} onPress={() => closeWithAnimation()}>
                  <AppIcon name="close" size={21} color={colors.white} />
                </TouchableOpacity>
              </View>
            </LinearGradient>

            <ScrollView style={styles.drawerScroll} contentContainerStyle={styles.drawerContent} showsVerticalScrollIndicator={false}>
              <TouchableOpacity
                style={[styles.newChatButton, isRTL && styles.rowReverse]}
                onPress={() => closeWithAnimation(onNewChat)}
                disabled={loading}
                activeOpacity={0.8}
              >
                <AppIcon name="add" size={20} color={colors.white} />
                <Text style={styles.newChatText}>{copy.newChat}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.navRow, isRTL && styles.rowReverse]}
                onPress={() => closeWithAnimation(onOpenProfiles)}
                activeOpacity={0.75}
              >
                <View style={[styles.sectionIdentity, isRTL && styles.rowReverse]}>
                  <View style={styles.sectionIcon}>
                    <AppIcon name="person-outline" size={18} color={colors.dawa} />
                  </View>
                  <View style={styles.navCopy}>
                    <Text style={[styles.sectionTitle, directionStyle]}>{copy.profiles}</Text>
                    <Text style={[styles.sectionSubtitle, directionStyle]}>
                      {profileCount > 0
                        ? (isRTL ? `${profileCount} ملفات` : `${profileCount} profile${profileCount !== 1 ? 's' : ''}`)
                        : copy.noProfiles}
                    </Text>
                  </View>
                </View>
                <AppIcon name={isRTL ? 'chevron-back' : 'chevron-forward'} size={18} color={colors.textMuted} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.navRow, isRTL && styles.rowReverse]}
                onPress={() => closeWithAnimation(onOpenMedicineLibrary)}
                activeOpacity={0.75}
              >
                <View style={[styles.sectionIdentity, isRTL && styles.rowReverse]}>
                  <View style={styles.sectionIcon}>
                    <AppIcon name="library-outline" size={18} color={colors.dawa} />
                  </View>
                  <View style={styles.navCopy}>
                    <Text style={[styles.sectionTitle, directionStyle]}>{copy.medicineLibrary}</Text>
                    <Text style={[styles.sectionSubtitle, directionStyle]}>
                      {savedMedicinesCount > 0
                        ? (isRTL ? `${savedMedicinesCount} محفوظ` : `${savedMedicinesCount} saved`)
                        : (isRTL ? 'بحث + المحفوظة' : 'Search + saved')}
                    </Text>
                  </View>
                </View>
                <AppIcon name={isRTL ? 'chevron-back' : 'chevron-forward'} size={18} color={colors.textMuted} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.navRow, isRTL && styles.rowReverse]}
                onPress={() => closeWithAnimation(onOpenSymptomLog)}
                activeOpacity={0.75}
              >
                <View style={[styles.sectionIdentity, isRTL && styles.rowReverse]}>
                  <View style={styles.sectionIcon}>
                    <AppIcon name="time-outline" size={18} color={colors.dawa} />
                  </View>
                  <View style={styles.navCopy}>
                    <Text style={[styles.sectionTitle, directionStyle]}>{copy.symptomLog}</Text>
                    <Text style={[styles.sectionSubtitle, directionStyle]}>
                      {isRTL ? 'تاريخ الأعراض ديالك' : 'Your health timeline'}
                    </Text>
                  </View>
                </View>
                <AppIcon name={isRTL ? 'chevron-back' : 'chevron-forward'} size={18} color={colors.textMuted} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.navRow, isRTL && styles.rowReverse]}
                onPress={() => closeWithAnimation(onOpenReminders)}
                activeOpacity={0.75}
              >
                <View style={[styles.sectionIdentity, isRTL && styles.rowReverse]}>
                  <View style={styles.sectionIcon}>
                    <AppIcon name="notifications-outline" size={18} color={colors.dawa} />
                  </View>
                  <View style={styles.navCopy}>
                    <Text style={[styles.sectionTitle, directionStyle]}>{copy.reminders}</Text>
                    <Text style={[styles.sectionSubtitle, directionStyle]}>{copy.remindersSubtitle}</Text>
                  </View>
                </View>
                <AppIcon name={isRTL ? 'chevron-back' : 'chevron-forward'} size={18} color={colors.textMuted} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.navRow, isRTL && styles.rowReverse]}
                onPress={() => closeWithAnimation(onOpenSelfCare)}
                activeOpacity={0.75}
              >
                <View style={[styles.sectionIdentity, isRTL && styles.rowReverse]}>
                  <View style={styles.sectionIcon}>
                    <AppIcon name="leaf-outline" size={18} color={colors.dawa} />
                  </View>
                  <View style={styles.navCopy}>
                    <Text style={[styles.sectionTitle, directionStyle]}>{copy.selfCareLibrary}</Text>
                  </View>
                </View>
                <AppIcon name={isRTL ? 'chevron-back' : 'chevron-forward'} size={18} color={colors.textMuted} />
              </TouchableOpacity>

              <Text style={[styles.recentHeading, directionStyle]}>{copy.recentChats}</Text>
              {historyStorageError && <Text style={[styles.historyError, directionStyle]}>{copy.historyError}</Text>}
              {chatHistory.length === 0 ? (
                <Text style={[styles.noChatsText, directionStyle]}>{copy.noChats}</Text>
              ) : (
                chatHistory.map((chat) => {
                  const active = chat.id === activeChatId;
                  return (
                    <View key={chat.id} style={[styles.chatRow, active && styles.chatRowActive]}>
                      <TouchableOpacity
                        style={[styles.chatMain, isRTL && styles.rowReverse]}
                        onPress={() => closeWithAnimation(() => onOpenChat(chat))}
                        disabled={loading}
                        activeOpacity={0.72}
                      >
                        <AppIcon name="chatbubble-outline" size={17} color={active ? colors.dawa : colors.textMuted} />
                        <View style={styles.chatCopy}>
                          <Text numberOfLines={1} style={[styles.chatTitle, directionStyle]}>{chat.title}</Text>
                          <Text style={[styles.chatDate, directionStyle]}>{formatChatDate(chat.updatedAt || chat.createdAt)}</Text>
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.deleteButton} onPress={() => onDeleteChat(chat.id)} accessibilityLabel={copy.deleteChat}>
                        <AppIcon name="trash-outline" size={17} color={colors.danger} />
                      </TouchableOpacity>
                    </View>
                  );
                })
              )}
            </ScrollView>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  rowReverse: { flexDirection: 'row-reverse' },
  modalRoot: { flex: 1, flexDirection: 'row' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(8, 25, 35, 0.45)' },
  drawer: { width: 300, maxWidth: '86%', height: '100%', backgroundColor: colors.canvas },
  drawerHeader: { paddingHorizontal: spacing.lg, paddingVertical: spacing.lg },
  drawerHeaderRow: { flexDirection: 'row', alignItems: 'center' },
  drawerLogo: { width: 42, height: 42, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.14)', alignItems: 'center', justifyContent: 'center' },
  headerCopy: { flex: 1, marginHorizontal: spacing.md },
  drawerTitle: { color: colors.white, fontSize: 20, fontWeight: '900' },
  drawerSubtitle: { color: 'rgba(255,255,255,0.72)', fontSize: 12, fontWeight: '600' },
  closeButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  drawerScroll: { flex: 1 },
  drawerContent: { padding: spacing.md, paddingBottom: spacing.xxxl },
  newChatButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, backgroundColor: colors.dawa, borderRadius: radii.md, padding: 14, marginBottom: spacing.md },
  newChatText: { ...type.bodyStrong, color: colors.white },
  navRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.md, backgroundColor: colors.white, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.lg },
  sectionIdentity: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  sectionIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: colors.dawaSoft, alignItems: 'center', justifyContent: 'center' },
  navCopy: { flex: 1 },
  sectionTitle: { ...type.bodyStrong, color: colors.text },
  sectionSubtitle: { ...type.caption, color: colors.textMuted, marginTop: 1 },
  recentHeading: { ...type.eyebrow, color: colors.textMuted, marginBottom: spacing.sm, marginHorizontal: spacing.xs },
  historyError: { ...type.caption, color: colors.danger, marginBottom: spacing.sm, paddingHorizontal: spacing.xs },
  noChatsText: { ...type.body, color: colors.textMuted, padding: spacing.md },
  chatRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: radii.sm, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm, overflow: 'hidden' },
  chatRowActive: { borderColor: '#CFC4EC', backgroundColor: '#FBF9FF' },
  chatMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md },
  chatCopy: { flex: 1 },
  chatTitle: { ...type.bodyStrong, color: colors.text },
  chatDate: { ...type.caption, color: colors.textSubtle, marginTop: 2 },
  deleteButton: { alignSelf: 'stretch', width: 44, alignItems: 'center', justifyContent: 'center' },
});
