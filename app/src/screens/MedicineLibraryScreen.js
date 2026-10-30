import { useState, useMemo, useRef } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  SafeAreaView,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import AppIcon from '../components/AppIcon';
import { colors, radii, spacing, type } from '../theme/theme';
import { lookupBarcode, searchByName } from '../utils/barcodeSearch';

const GROQ_API = 'https://api.groq.com/openai/v1/chat/completions';

const COPY = {
  en: {
    title: 'Medicine Library',
    searchTab: 'Search',
    savedTab: 'Saved',
    checkTab: 'Interactions',
    searchPlaceholder: 'Search by name or ingredient...',
    noResults: 'No medicines found',
    noResultsHint: 'Try a shorter name or the active ingredient.',
    noSaved: 'No saved medicines yet',
    noSavedHint: 'After scanning a medicine, tap Save to keep it here.',
    source: { NHS: '🇬🇧 NHS', AMMPS: '🇲🇦 AMMPS' },
    ingredient: 'Active ingredient',
    loadInChat: 'Load in chat',
    askDawa: 'Ask Dawa 💬',
    remove: 'Remove',
    share: 'Share',
    savedOn: 'Saved on',
    close: 'Close',
    med1Placeholder: 'First medicine (e.g. Ibuprofen)...',
    med2Placeholder: 'Second medicine (e.g. Aspirin)...',
    checkBtn: 'Check interaction',
    checkHint: 'Enter two medicine names above to check if they are safe to take together.',
    checkLoading: 'Checking...',
    shareFooter: 'Looked up on Dawa, Darija Medical Assistant',
    modelReasoning: 'Based on model reasoning',
    pharmacologyData: 'Checked against pharmacology data',
  },
  ar: {
    title: 'مكتبة الأدوية',
    searchTab: 'بحث',
    savedTab: 'المحفوظة',
    checkTab: 'التفاعلات',
    searchPlaceholder: 'ابحث بالاسم أو المادة الفعالة...',
    noResults: 'ما لقيناش تا دواء',
    noResultsHint: 'جرب اسم أقصر أو المادة الفعالة.',
    noSaved: 'ما حفظتي تا دواء',
    noSavedHint: 'بعد ما تسكاني دواء، دوز على حفظ باش يبان هنا.',
    source: { NHS: '🇬🇧 NHS', AMMPS: '🇲🇦 AMMPS' },
    ingredient: 'المادة الفعالة',
    loadInChat: 'افتح فالمحادثة',
    askDawa: 'سول دواك 💬',
    remove: 'مسح',
    share: 'مشاركة',
    savedOn: 'حُفظ في',
    close: 'سد',
    med1Placeholder: 'الدواء الأول (مثلا: باراسيتامول)...',
    med2Placeholder: 'الدواء الثاني (مثلا: إيبوبروفين)...',
    checkBtn: 'تحقق من التفاعل',
    checkHint: 'كتب اسمين ديال الدواء فوق باش تشوف واش يمكن تاخدهم مع بعض.',
    checkLoading: 'كنتحققو...',
    shareFooter: 'تم البحث عبر دواك، المساعد الطبي بالدارجة',
    modelReasoning: 'مبني على تحليل النموذج',
    pharmacologyData: 'تم التحقق ببيانات الصيدلة',
  },
};

function MedicineCard({ medicine, lang, onLoad, onAskDawa, onRemove, showRemove, isRTL }) {
  const copy = COPY[lang] ?? COPY.en;
  const sourceLabel = copy.source[medicine.source] ?? medicine.source ?? '';

  const handleShare = async () => {
    const lines = [
      `💊 ${medicine.name}`,
      medicine.activeIngredient
        ? (isRTL ? `المادة الفعالة: ${medicine.activeIngredient}` : `Active ingredient: ${medicine.activeIngredient}`)
        : null,
      medicine.dosage
        ? (isRTL ? `الجرعة: ${medicine.dosage}` : `Dosage: ${medicine.dosage}`)
        : null,
      `📋 ${sourceLabel}`,
      '',
      copy.shareFooter,
    ].filter((l) => l !== null);
    try {
      await Share.share({ message: lines.join('\n') });
    } catch {}
  };

  return (
    <View style={[styles.card, isRTL && styles.cardRTL]}>
      <View style={styles.cardBody}>
        <View style={[styles.cardHeader, isRTL && styles.rowReverse]}>
          <Text style={[styles.cardName, { textAlign: isRTL ? 'right' : 'left' }]} numberOfLines={2}>
            {medicine.name}
          </Text>
          <Text style={styles.sourceBadge}>{sourceLabel}</Text>
        </View>
        <Text style={[styles.cardIngredient, { textAlign: isRTL ? 'right' : 'left' }]}>
          {copy.ingredient}: {medicine.activeIngredient || '-'}
        </Text>
        {medicine.dosage ? (
          <Text style={[styles.cardDosage, { textAlign: isRTL ? 'right' : 'left' }]}>
            {medicine.dosage}
          </Text>
        ) : null}
        {showRemove && medicine.savedAt ? (
          <Text style={[styles.cardSavedAt, { textAlign: isRTL ? 'right' : 'left' }]}>
            {copy.savedOn} {new Date(medicine.savedAt).toLocaleDateString(isRTL ? 'ar-MA' : 'en-GB')}
          </Text>
        ) : null}
      </View>
      <View style={[styles.cardActions, isRTL && styles.rowReverse]}>
        <TouchableOpacity style={styles.loadBtn} onPress={() => onLoad(medicine)} activeOpacity={0.75}>
          <AppIcon name="chatbubble-ellipses-outline" size={15} color={colors.white} />
          <Text style={styles.loadBtnText}>{copy.loadInChat}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.askDawaBtn} onPress={() => onAskDawa(medicine)} activeOpacity={0.75}>
          <Text style={styles.askDawaBtnText}>{copy.askDawa}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.shareBtn} onPress={handleShare} activeOpacity={0.75}>
          <AppIcon name="share-outline" size={16} color={colors.dawa} />
        </TouchableOpacity>
        {showRemove && (
          <TouchableOpacity style={styles.removeBtn} onPress={() => onRemove(medicine.name)} activeOpacity={0.75}>
            <AppIcon name="trash-outline" size={16} color={colors.danger} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

export default function MedicineLibraryScreen({
  visible,
  onClose,
  lang,
  savedMedicines,
  onLoadMedicine,
  onAskDawa,
  onRemoveMedicine,
}) {
  const [tab, setTab] = useState('search');
  const [query, setQuery] = useState('');

  // Interaction checker state
  const [intMed1, setIntMed1] = useState('');
  const [intMed2, setIntMed2] = useState('');
  const [intResult, setIntResult] = useState('');
  const [intLoading, setIntLoading] = useState(false);
  const [intEvidence, setIntEvidence] = useState(null);
  const [intDbFilter, setIntDbFilter] = useState(null);
  const [intSuggestionField, setIntSuggestionField] = useState(null);
  const [intScanField, setIntScanField] = useState(null);
  const [intScannerVisible, setIntScannerVisible] = useState(false);
  const [intPhotoVisible, setIntPhotoVisible] = useState(false);
  const [intPhotoReady, setIntPhotoReady] = useState(false);
  const [intCapturingPhoto, setIntCapturingPhoto] = useState(false);
  const [intProcessingPhoto, setIntProcessingPhoto] = useState(false);
  const intPhotoCameraRef = useRef(null);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const insets = useSafeAreaInsets();

  const copy = COPY[lang] ?? COPY.en;
  const isRTL = lang === 'ar';

  const interactionSuggestions = (value) => {
    const q = value.trim();
    if (q.length < 2) return [];
    return searchByName(q)
      .filter((item) => intDbFilter === null || item._db === intDbFilter)
      .slice(0, 6);
  };

  const fillInteractionMedicine = (field, medicine) => {
    const name = typeof medicine === 'string' ? medicine : medicine?.name ?? '';
    if (field === 1) setIntMed1(name);
    if (field === 2) setIntMed2(name);
    setIntSuggestionField(null);
    setIntResult('');
    setIntEvidence(null);
  };

  const ensureInteractionCameraPermission = async () => {
    if (cameraPermission?.granted) return true;
    const result = await requestCameraPermission();
    return result.granted;
  };

  const openInteractionScanner = async (field) => {
    if (!(await ensureInteractionCameraPermission())) return;
    setIntScanField(field);
    setIntScannerVisible(true);
  };

  const openInteractionPhoto = async (field) => {
    if (!(await ensureInteractionCameraPermission())) return;
    setIntScanField(field);
    setIntPhotoReady(false);
    setIntPhotoVisible(true);
  };

  const handleInteractionBarcode = ({ data }) => {
    setIntScannerVisible(false);
    const result = lookupBarcode(data);
    const medicine = result.medicines?.[0] ?? result.barcodeEntry;
    fillInteractionMedicine(intScanField, medicine?.name ?? '');
  };

  const captureInteractionPhoto = async () => {
    if (intCapturingPhoto || !intPhotoReady || !intPhotoCameraRef.current) return;
    setIntCapturingPhoto(true);
    try {
      const photo = await intPhotoCameraRef.current.takePictureAsync({ base64: true, quality: 0.3, exif: false });
      setIntPhotoVisible(false);
      setIntPhotoReady(false);
      if (!photo?.base64) return;
      setIntProcessingPhoto(true);

      const groqVisionKey = process.env.EXPO_PUBLIC_GROQ_API_KEY;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 35000);
      let response;
      try {
        response = await fetch(GROQ_API, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${groqVisionKey}`,
          },
          body: JSON.stringify({
            model: 'qwen/qwen3.6-27b',
            max_tokens: 500,
            messages: [{
              role: 'user',
              content: [
                { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${photo.base64}` } },
                { type: 'text', text: 'You are a pharmacy assistant. Look at this medicine packaging and reply with ONLY the most prominent medicine name on the packaging — this is usually the largest text, either the brand name or the generic name. Do NOT return the manufacturer/company name, dosage, or active ingredient chemical names. One word or short name only, no explanation.' },
              ],
            }],
          }),
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeoutId);
      }

      const json = await response.json();
      const rawContent = json.choices?.[0]?.message?.content ?? '';
      const extractedName = rawContent.includes('</think>')
        ? rawContent.split('</think>').pop().trim()
        : [...rawContent.split('\n').map((line) => line.trim()).filter(Boolean)].reverse().find(
            (line) => !line.startsWith('<') && !line.startsWith('*') && !line.startsWith('-') && !/^\d+\./.test(line)
          ) ?? '';
      if (!extractedName) return;
      const hits = searchByName(extractedName)
        .filter((item) => intDbFilter === null || item._db === intDbFilter);
      fillInteractionMedicine(intScanField, hits[0] ?? extractedName);
    } catch {
      setIntPhotoVisible(false);
      setIntPhotoReady(false);
    } finally {
      setIntCapturingPhoto(false);
      setIntProcessingPhoto(false);
    }
  };

  const searchResults = useMemo(() => {
    const q = query.trim();
    if (q.length < 2) return [];
    return searchByName(q)
      .slice(0, 30)
      .map((item) => ({
        name: item.name || 'Unknown',
        activeIngredient: item.active_ingredient || 'Unknown',
        dosage: item.dosage || null,
        manufacturer: item.manufacturer || 'Unknown',
        status: item.status || 'Unknown',
        source: (item._db || item.db) === 'UK' ? 'NHS' : 'AMMPS',
      }));
  }, [query]);

  const handleLoad = (medicine) => {
    onLoadMedicine(medicine);
    onClose();
  };

  const checkInteraction = async () => {
    const m1 = intMed1.trim();
    const m2 = intMed2.trim();
    if (!m1 || !m2) return;
    setIntLoading(true);
    setIntResult('');
    setIntEvidence(null);
    try {
      const groqKey = process.env.EXPO_PUBLIC_GROQ_API_KEY;
      const replyLang = lang === 'ar'
        ? 'Moroccan Darija written in Arabic script'
        : 'English';
      const res = await fetch(GROQ_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${groqKey}`,
        },
        body: JSON.stringify({
          model: 'openai/gpt-oss-120b',
          max_tokens: 400,
          messages: [
            {
              role: 'system',
              content: `You are a pharmacy assistant. Answer concisely in ${replyLang}. Use short bullet points.`,
            },
            {
              role: 'user',
              content: `Are "${m1}" and "${m2}" safe to take together? List any known drug interactions, contraindications, or important warnings. If they are generally safe, say so clearly.`,
            },
          ],
        }),
      });
      const json = await res.json();
      let text = json.choices?.[0]?.message?.content ?? '';
      if (text.includes('</think>')) text = text.split('</think>').pop().trim();
      setIntResult(text);
      setIntEvidence(text ? 'model' : null);
    } catch {
      setIntResult(
        lang === 'ar'
          ? 'ما قدرناش نتحققو دابا. جرب من جديد.'
          : 'Could not check interaction right now. Please try again.'
      );
      setIntEvidence(null);
    } finally {
      setIntLoading(false);
    }
  };

  const TABS = ['search', 'saved', 'check'];

  const renderInteractionInput = (field, label, value, setValue, placeholder) => {
    const suggestions = intSuggestionField === field ? interactionSuggestions(value) : [];
    return (
      <View style={styles.interactionField}>
        <Text style={[styles.checkLabel, { textAlign: isRTL ? 'right' : 'left' }]}>{label}</Text>
        <View style={[styles.interactionInputRow, isRTL && styles.rowReverse]}>
          <View style={[styles.searchBar, styles.interactionSearchBar, isRTL && styles.rowReverse]}>
            <AppIcon name="medical-outline" size={18} color={colors.textMuted} />
            <TextInput
              style={[styles.searchInput, { textAlign: isRTL ? 'right' : 'left' }]}
              value={value}
              onFocus={() => setIntSuggestionField(field)}
              onChangeText={(next) => {
                setValue(next);
                setIntSuggestionField(field);
                setIntResult('');
              }}
              placeholder={placeholder}
              placeholderTextColor={colors.textMuted}
              autoCorrect={false}
            />
            {value.length > 0 && (
              <TouchableOpacity onPress={() => { setValue(''); setIntSuggestionField(null); setIntResult(''); }}>
                <AppIcon name="close-circle" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity style={styles.scanIconBtn} onPress={() => openInteractionScanner(field)} activeOpacity={0.75}>
            <AppIcon name="barcode-outline" size={20} color={colors.dawa} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.scanIconBtn} onPress={() => openInteractionPhoto(field)} activeOpacity={0.75}>
            <AppIcon name="camera-outline" size={20} color={colors.dawa} />
          </TouchableOpacity>
        </View>
        {suggestions.length > 0 && (
          <View style={styles.suggestionsDropdown}>
            {suggestions.map((medicine, index) => (
              <TouchableOpacity
                key={`${medicine.name}-${medicine.active_ingredient}-${index}`}
                style={styles.suggestionRow}
                onPress={() => fillInteractionMedicine(field, medicine)}
                activeOpacity={0.75}
              >
                <Text style={[styles.suggestionName, { textAlign: isRTL ? 'right' : 'left' }]}>{medicine.name}</Text>
                <Text style={[styles.suggestionIngredient, { textAlign: isRTL ? 'right' : 'left' }]}>{medicine.active_ingredient || '-'}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.root}>
        <View style={[styles.header, isRTL && styles.rowReverse]}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <AppIcon name="close" size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{copy.title}</Text>
          <View style={{ width: 38 }} />
        </View>

        <View style={[styles.tabs, isRTL && styles.rowReverse]}>
          {TABS.map((t) => {
            const icons = { search: 'search-outline', saved: 'bookmark-outline', check: 'swap-horizontal-outline' };
            const labels = {
              search: copy.searchTab,
              saved: `${copy.savedTab}${savedMedicines.length ? ` (${savedMedicines.length})` : ''}`,
              check: copy.checkTab,
            };
            return (
              <TouchableOpacity
                key={t}
                style={[styles.tab, tab === t && styles.tabActive]}
                onPress={() => setTab(t)}
                activeOpacity={0.75}
              >
                <AppIcon name={icons[t]} size={15} color={tab === t ? colors.dawa : colors.textMuted} />
                <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{labels[t]}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {tab === 'search' && (
          <>
            <View style={[styles.searchBar, isRTL && styles.rowReverse]}>
              <AppIcon name="search-outline" size={18} color={colors.textMuted} />
              <TextInput
                style={[styles.searchInput, { textAlign: isRTL ? 'right' : 'left' }]}
                value={query}
                onChangeText={setQuery}
                placeholder={copy.searchPlaceholder}
                placeholderTextColor={colors.textMuted}
                autoCorrect={false}
              />
              {query.length > 0 && (
                <TouchableOpacity onPress={() => setQuery('')}>
                  <AppIcon name="close-circle" size={18} color={colors.textMuted} />
                </TouchableOpacity>
              )}
            </View>
            {query.trim().length >= 2 && searchResults.length === 0 ? (
              <View style={styles.emptyState}>
                <AppIcon name="search-outline" size={38} color={colors.textMuted} />
                <Text style={styles.emptyTitle}>{copy.noResults}</Text>
                <Text style={styles.emptyHint}>{copy.noResultsHint}</Text>
              </View>
            ) : (
              <FlatList
                data={searchResults}
                keyExtractor={(item, i) => `${item.name}-${i}`}
                renderItem={({ item }) => (
                  <MedicineCard
                    medicine={item}
                    lang={lang}
                    onLoad={handleLoad}
                    onAskDawa={onAskDawa}
                    onRemove={() => {}}
                    showRemove={false}
                    isRTL={isRTL}
                  />
                )}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
              />
            )}
          </>
        )}

        {tab === 'saved' && (
          savedMedicines.length === 0 ? (
            <View style={styles.emptyState}>
              <AppIcon name="bookmark-outline" size={42} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>{copy.noSaved}</Text>
              <Text style={styles.emptyHint}>{copy.noSavedHint}</Text>
            </View>
          ) : (
            <FlatList
              data={savedMedicines}
              keyExtractor={(item, i) => `${item.name}-${i}`}
              renderItem={({ item }) => (
                <MedicineCard
                  medicine={item}
                  lang={lang}
                  onLoad={handleLoad}
                  onAskDawa={onAskDawa}
                  onRemove={onRemoveMedicine}
                  showRemove
                  isRTL={isRTL}
                />
              )}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          )
        )}

        {tab === 'check' && (
          <ScrollView contentContainerStyle={styles.checkContainer} keyboardShouldPersistTaps="handled">
            <View style={[styles.dbToggle, isRTL && styles.rowReverse]}>
              <TouchableOpacity
                style={[styles.dbPill, intDbFilter === 'MA' && styles.dbPillActive]}
                onPress={() => setIntDbFilter((current) => current === 'MA' ? null : 'MA')}
                activeOpacity={0.75}
              >
                <Text style={[styles.dbPillText, intDbFilter === 'MA' && styles.dbPillTextActive]}>🇲🇦 AMMPS</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.dbPill, intDbFilter === 'UK' && styles.dbPillActive]}
                onPress={() => setIntDbFilter((current) => current === 'UK' ? null : 'UK')}
                activeOpacity={0.75}
              >
                <Text style={[styles.dbPillText, intDbFilter === 'UK' && styles.dbPillTextActive]}>🇬🇧 NHS UK</Text>
              </TouchableOpacity>
            </View>

            {renderInteractionInput(1, isRTL ? 'الدواء الأول' : 'Medicine 1', intMed1, setIntMed1, copy.med1Placeholder)}
            {renderInteractionInput(2, isRTL ? 'الدواء الثاني' : 'Medicine 2', intMed2, setIntMed2, copy.med2Placeholder)}

            {intProcessingPhoto && (
              <View style={styles.processingRow}>
                <ActivityIndicator size="small" color={colors.dawa} />
                <Text style={styles.processingText}>{isRTL ? 'جاري التعرف على الدواء…' : 'Identifying medicine…'}</Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.checkBtn, (!intMed1.trim() || !intMed2.trim() || intLoading) && styles.checkBtnDisabled]}
              onPress={checkInteraction}
              disabled={!intMed1.trim() || !intMed2.trim() || intLoading}
              activeOpacity={0.75}
            >
              {intLoading
                ? <ActivityIndicator size="small" color={colors.white} />
                : <AppIcon name="swap-horizontal-outline" size={18} color={colors.white} />}
              <Text style={styles.checkBtnText}>
                {intLoading ? copy.checkLoading : copy.checkBtn}
              </Text>
            </TouchableOpacity>

            {!intResult && !intLoading && (
              <View style={styles.checkEmptyHint}>
                <AppIcon name="information-circle-outline" size={32} color={colors.textMuted} />
                <Text style={[styles.emptyHint, { textAlign: 'center' }]}>{copy.checkHint}</Text>
              </View>
            )}

            {intResult.length > 0 && (
              <View style={styles.resultCard}>
                <View style={[styles.resultHeader, isRTL && styles.rowReverse]}>
                  <AppIcon name="flask-outline" size={18} color={colors.dawa} />
                  <Text style={styles.resultTitle}>
                    {intMed1.trim()} + {intMed2.trim()}
                  </Text>
                </View>
                <Text style={[styles.resultText, { textAlign: isRTL ? 'right' : 'left' }]}>
                  {intResult}
                </Text>
                {intEvidence ? (
                  <View style={[styles.uncertaintyBadge, intEvidence === 'curated' ? styles.uncertaintyCurated : styles.uncertaintyModel]}>
                    <AppIcon name={intEvidence === 'curated' ? 'checkmark-circle-outline' : 'alert-circle-outline'} size={14} color={intEvidence === 'curated' ? colors.success : colors.warning} />
                    <Text style={[styles.uncertaintyText, { color: intEvidence === 'curated' ? colors.success : colors.warning }]}>
                      {intEvidence === 'curated' ? copy.pharmacologyData : copy.modelReasoning}
                    </Text>
                  </View>
                ) : null}
              </View>
            )}
          </ScrollView>
        )}

        <Modal
          visible={intScannerVisible}
          animationType="slide"
          transparent={false}
          onRequestClose={() => setIntScannerVisible(false)}
        >
          <View style={styles.cameraModal}>
            <CameraView
              style={styles.cameraPreview}
              facing="back"
              barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8'] }}
              onBarcodeScanned={handleInteractionBarcode}
            />
            <TouchableOpacity style={[styles.cameraCloseBtn, { top: insets.top + 14 }]} onPress={() => setIntScannerVisible(false)} activeOpacity={0.8}>
              <AppIcon name="close" size={22} color={colors.text} />
            </TouchableOpacity>
          </View>
        </Modal>

        <Modal
          visible={intPhotoVisible}
          animationType="slide"
          transparent={false}
          onRequestClose={() => { setIntPhotoVisible(false); setIntPhotoReady(false); setIntCapturingPhoto(false); }}
        >
          <View style={styles.cameraModal}>
            <CameraView
              ref={intPhotoCameraRef}
              style={styles.cameraPreview}
              facing="back"
              mode="picture"
              onCameraReady={() => setIntPhotoReady(true)}
              onMountError={() => { setIntPhotoVisible(false); setIntPhotoReady(false); setIntCapturingPhoto(false); }}
            />
            <TouchableOpacity
              style={[styles.cameraCloseBtn, { top: insets.top + 14 }]}
              onPress={() => { setIntPhotoVisible(false); setIntPhotoReady(false); setIntCapturingPhoto(false); }}
              activeOpacity={0.8}
            >
              <AppIcon name="close" size={22} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.cameraCaptureBtn, { bottom: insets.bottom + 28 }, (!intPhotoReady || intCapturingPhoto) && styles.cameraCaptureBtnDisabled]}
              onPress={captureInteractionPhoto}
              disabled={!intPhotoReady || intCapturingPhoto}
              activeOpacity={0.8}
            >
              {intCapturingPhoto
                ? <ActivityIndicator size="small" color={colors.dawa} />
                : <View style={styles.cameraCaptureInner} />}
            </TouchableOpacity>
          </View>
        </Modal>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.canvas },
  rowReverse: { flexDirection: 'row-reverse' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  closeBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.canvas, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
  headerTitle: { fontSize: 17, fontWeight: '800', color: colors.text },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.surface },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: colors.dawa },
  tabText: { fontSize: 12, fontWeight: '600', color: colors.textMuted },
  tabTextActive: { color: colors.dawa },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, margin: spacing.md, backgroundColor: colors.surface, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md, paddingVertical: 10 },
  searchInput: { flex: 1, fontSize: 15, color: colors.text },
  listContent: { padding: spacing.md, paddingBottom: 48, gap: spacing.sm },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.xl },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: colors.textMuted },
  emptyHint: { fontSize: 13, color: colors.textMuted, textAlign: 'center', lineHeight: 20 },
  card: { backgroundColor: colors.surface, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  cardRTL: { borderLeftWidth: 1, borderRightWidth: 3, borderRightColor: colors.dawa },
  cardBody: { padding: spacing.md },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.sm, marginBottom: 4 },
  cardName: { flex: 1, fontSize: 15, fontWeight: '800', color: colors.text },
  sourceBadge: { fontSize: 11, fontWeight: '700', color: colors.textMuted, backgroundColor: colors.canvas, borderRadius: radii.pill, paddingHorizontal: 7, paddingVertical: 2, borderWidth: 1, borderColor: colors.border },
  cardIngredient: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  cardDosage: { fontSize: 12, color: colors.textSubtle, marginTop: 2 },
  cardSavedAt: { fontSize: 11, color: colors.textSubtle, marginTop: 4 },
  cardActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.canvas },
  loadBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: colors.dawa, borderRadius: radii.pill, paddingVertical: 8 },
  loadBtnText: { fontSize: 13, fontWeight: '700', color: colors.white },
  askDawaBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.dawaSoft, borderRadius: radii.pill, paddingVertical: 8, paddingHorizontal: 8 },
  askDawaBtnText: { fontSize: 12, fontWeight: '700', color: colors.dawa },
  shareBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.canvas, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
  removeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFF0F0', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#FFCCCC' },
  // Interaction checker
  checkContainer: { padding: spacing.md, paddingBottom: 48, gap: spacing.sm },
  checkLabel: { fontSize: 13, fontWeight: '700', color: colors.textMuted, marginBottom: 4 },
  dbToggle: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  dbPill: { flex: 1, alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: radii.pill, backgroundColor: colors.surface, paddingVertical: 9 },
  dbPillActive: { backgroundColor: '#6B4EFF', borderColor: '#6B4EFF' },
  dbPillText: { fontSize: 13, fontWeight: '700', color: colors.textMuted },
  dbPillTextActive: { color: '#fff' },
  interactionField: { marginBottom: spacing.sm },
  interactionInputRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  interactionSearchBar: { flex: 1, margin: 0 },
  scanIconBtn: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  suggestionsDropdown: { marginTop: 4, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, backgroundColor: colors.surface, overflow: 'hidden' },
  suggestionRow: { paddingHorizontal: spacing.md, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  suggestionName: { fontSize: 14, fontWeight: '700', color: colors.text },
  suggestionIngredient: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  processingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm },
  processingText: { fontSize: 13, color: colors.textMuted },
  checkBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.dawa, borderRadius: radii.pill, paddingVertical: 13, marginTop: spacing.sm },
  checkBtnDisabled: { opacity: 0.45 },
  checkBtnText: { fontSize: 15, fontWeight: '700', color: colors.white },
  checkEmptyHint: { alignItems: 'center', gap: spacing.sm, marginTop: spacing.xl, paddingHorizontal: spacing.lg },
  resultCard: { marginTop: spacing.md, backgroundColor: colors.surface, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  resultHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.canvas },
  resultTitle: { flex: 1, fontSize: 14, fontWeight: '800', color: colors.text },
  resultText: { padding: spacing.md, fontSize: 14, color: colors.text, lineHeight: 22 },
  uncertaintyBadge: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 5, marginHorizontal: spacing.md, marginBottom: spacing.md, borderRadius: radii.pill, paddingHorizontal: 9, paddingVertical: 5, borderWidth: 1 },
  uncertaintyModel: { backgroundColor: colors.warningSoft, borderColor: '#F0DDAE' },
  uncertaintyCurated: { backgroundColor: colors.successSoft, borderColor: '#B9DDC9' },
  uncertaintyText: { fontSize: 10, fontWeight: '800' },
  cameraModal: { flex: 1, backgroundColor: '#000' },
  cameraPreview: { flex: 1 },
  cameraCloseBtn: { position: 'absolute', left: 16, width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.92)', alignItems: 'center', justifyContent: 'center' },
  cameraCaptureBtn: { position: 'absolute', alignSelf: 'center', width: 70, height: 70, borderRadius: 35, backgroundColor: 'rgba(255,255,255,0.92)', alignItems: 'center', justifyContent: 'center' },
  cameraCaptureBtnDisabled: { opacity: 0.4 },
  cameraCaptureInner: { width: 54, height: 54, borderRadius: 27, backgroundColor: colors.dawa },
});
