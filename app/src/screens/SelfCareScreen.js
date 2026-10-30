import { useEffect, useMemo, useState } from 'react';
import { Modal, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useLang } from '../context/LanguageContext';
import AppIcon from '../components/AppIcon';
import selfCareLibrary from '../data/selfCareLibrary';
import { colors, radii, spacing, type } from '../theme/theme';

const COPY = {
  en: { title: 'Self-care library', subtitle: 'Offline guidance for common health concerns', search: 'Search a condition…', noResults: 'No matching condition', steps: 'What you can do', redFlags: 'Get urgent help if', doctor: 'When to see a doctor', offline: 'Available offline' },
  ar: { title: 'مكتبة العناية الذاتية', subtitle: 'نصائح بلا إنترنت للمشاكل الصحية الشائعة', search: 'قلب على حالة…', noResults: 'ما لقينا حتى حالة', steps: 'شنو تقدر دير', redFlags: 'طلب المساعدة بسرعة إلا', doctor: 'فاش خاصك تشوف الطبيب', offline: 'خدامة بلا إنترنت' },
};

export default function SelfCareScreen({ visible, onClose }) {
  const { lang } = useLang();
  const isRTL = lang === 'ar';
  const copy = COPY[lang] ?? COPY.en;
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!visible) {
      setQuery('');
      setSelected(null);
    }
  }, [visible]);

  const results = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    if (!normalized) return selfCareLibrary;
    return selfCareLibrary.filter((item) => [item.condition, item.en.title, item.ar.title, ...item.keywords]
      .some((value) => String(value).toLocaleLowerCase().includes(normalized)));
  }, [query]);

  const handleBack = () => {
    if (selected) setSelected(null);
    else onClose();
  };

  const content = selected?.[lang] ?? selected?.en;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleBack}>
      <SafeAreaView style={styles.root}>
        <View style={[styles.header, isRTL && styles.rowReverse]}>
          <TouchableOpacity style={styles.iconButton} onPress={handleBack} activeOpacity={0.75}>
            <AppIcon name={selected ? (isRTL ? 'arrow-forward' : 'arrow-back') : 'close'} size={22} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerCopy}>
            <Text style={styles.headerTitle} numberOfLines={1}>{selected ? content.title : copy.title}</Text>
            {!selected && <Text style={styles.headerSubtitle}>{copy.subtitle}</Text>}
          </View>
          <View style={styles.offlineBadge}><AppIcon name="cloud-offline-outline" size={13} color={colors.success} /></View>
        </View>

        {!selected ? (
          <>
            <View style={[styles.searchBar, isRTL && styles.rowReverse]}>
              <AppIcon name="search-outline" size={18} color={colors.textMuted} />
              <TextInput style={[styles.searchInput, { textAlign: isRTL ? 'right' : 'left' }]} value={query} onChangeText={setQuery} placeholder={copy.search} placeholderTextColor={colors.textMuted} />
            </View>
            <ScrollView contentContainerStyle={styles.listContent} keyboardShouldPersistTaps="handled">
              <Text style={[styles.offlineText, { textAlign: isRTL ? 'right' : 'left' }]}>{copy.offline}</Text>
              {results.length ? results.map((item) => {
                const itemCopy = item[lang] ?? item.en;
                return (
                  <TouchableOpacity key={item.id} style={[styles.card, isRTL && styles.rowReverse]} onPress={() => setSelected(item)} activeOpacity={0.75}>
                    <View style={styles.cardIcon}><AppIcon name={item.icon} size={23} color={colors.dawa} /></View>
                    <View style={styles.cardCopy}>
                      <Text style={[styles.cardTitle, { textAlign: isRTL ? 'right' : 'left' }]}>{itemCopy.title}</Text>
                      <Text style={[styles.cardSummary, { textAlign: isRTL ? 'right' : 'left' }]} numberOfLines={2}>{itemCopy.summary}</Text>
                    </View>
                    <AppIcon name={isRTL ? 'chevron-back' : 'chevron-forward'} size={18} color={colors.textMuted} />
                  </TouchableOpacity>
                );
              }) : <Text style={styles.empty}>{copy.noResults}</Text>}
            </ScrollView>
          </>
        ) : (
          <ScrollView contentContainerStyle={styles.detailContent}>
            <View style={styles.heroIcon}><AppIcon name={selected.icon} size={32} color={colors.dawa} /></View>
            <Text style={[styles.summary, { textAlign: isRTL ? 'right' : 'left' }]}>{content.summary}</Text>
            <Text style={[styles.sectionTitle, { textAlign: isRTL ? 'right' : 'left' }]}>{copy.steps}</Text>
            {content.steps.map((step, index) => (
              <View key={step} style={[styles.row, isRTL && styles.rowReverse]}><View style={styles.number}><Text style={styles.numberText}>{index + 1}</Text></View><Text style={[styles.rowText, { textAlign: isRTL ? 'right' : 'left' }]}>{step}</Text></View>
            ))}
            <View style={styles.redFlagCard}>
              <Text style={[styles.redFlagTitle, { textAlign: isRTL ? 'right' : 'left' }]}>{copy.redFlags}</Text>
              {content.redFlags.map((flag) => <View key={flag} style={[styles.bulletRow, isRTL && styles.rowReverse]}><Text style={styles.redBullet}>●</Text><Text style={[styles.rowText, { textAlign: isRTL ? 'right' : 'left' }]}>{flag}</Text></View>)}
            </View>
            <View style={styles.doctorCard}><Text style={[styles.sectionTitle, { textAlign: isRTL ? 'right' : 'left' }]}>{copy.doctor}</Text><Text style={[styles.rowText, { textAlign: isRTL ? 'right' : 'left' }]}>{content.whenToSeeDoctor}</Text></View>
          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.canvas }, rowReverse: { flexDirection: 'row-reverse' },
  header: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.surface },
  iconButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.canvas, borderWidth: 1, borderColor: colors.border },
  headerCopy: { flex: 1, alignItems: 'center', paddingHorizontal: spacing.sm }, headerTitle: { fontSize: 17, fontWeight: '800', color: colors.text }, headerSubtitle: { fontSize: 10, color: colors.textMuted, marginTop: 2 },
  offlineBadge: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.successSoft },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, margin: spacing.md, paddingHorizontal: spacing.md, paddingVertical: 10, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, backgroundColor: colors.surface },
  searchInput: { flex: 1, fontSize: 15, color: colors.text }, listContent: { paddingHorizontal: spacing.md, paddingBottom: spacing.xxxl }, offlineText: { ...type.caption, color: colors.success, marginBottom: spacing.sm },
  card: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, backgroundColor: colors.surface },
  cardIcon: { width: 46, height: 46, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.dawaSoft }, cardCopy: { flex: 1 }, cardTitle: { ...type.bodyStrong, color: colors.text }, cardSummary: { ...type.caption, color: colors.textMuted, marginTop: 2 }, empty: { ...type.body, color: colors.textMuted, textAlign: 'center', marginTop: spacing.xl },
  detailContent: { padding: spacing.lg, paddingBottom: spacing.xxxl }, heroIcon: { width: 64, height: 64, borderRadius: 22, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', backgroundColor: colors.dawaSoft, marginBottom: spacing.lg }, summary: { ...type.body, color: colors.text, marginBottom: spacing.xl }, sectionTitle: { ...type.heading, color: colors.text, marginBottom: spacing.md },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, marginBottom: spacing.md }, number: { width: 25, height: 25, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.dawa }, numberText: { fontSize: 12, fontWeight: '800', color: colors.white }, rowText: { flex: 1, ...type.body, color: colors.text },
  redFlagCard: { padding: spacing.lg, marginTop: spacing.md, borderRadius: radii.md, backgroundColor: colors.dangerSoft, borderWidth: 1, borderColor: '#EDC8CB' }, redFlagTitle: { ...type.heading, color: colors.danger, marginBottom: spacing.md }, bulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, marginBottom: spacing.sm }, redBullet: { color: colors.danger, fontSize: 10, marginTop: 5 },
  doctorCard: { padding: spacing.lg, marginTop: spacing.lg, borderRadius: radii.md, backgroundColor: colors.warningSoft, borderWidth: 1, borderColor: '#F0DDAE' },
});
