import { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Animated,
  Dimensions,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import {
  useAudioRecorder,
  useAudioPlayer,
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
} from 'expo-audio';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLang } from '../context/LanguageContext';
import { t } from '../i18n/strings';
import AppIcon from '../components/AppIcon';
import SidebarDrawer from '../components/SidebarDrawer';
import ProfilesScreen from './ProfilesScreen';
import MedicineLibraryScreen from './MedicineLibraryScreen';
import SymptomLogScreen from './SymptomLogScreen';
import RemindersScreen from './RemindersScreen';
import SelfCareScreen from './SelfCareScreen';
import { colors, radii, shadows, spacing, type } from '../theme/theme';
import { createChatId, createChatTitle, loadStoredChats, storeChats } from '../utils/chatHistory';
import { lookupBarcode, searchByName } from '../utils/barcodeSearch';
import { loadProfiles, saveProfiles } from '../utils/userProfile';
import { loadSavedMedicines, saveMedicine, unsaveMedicine } from '../utils/savedMedicines';
import { isReminderActiveOnDate, loadReminders, todayDateKey } from '../utils/reminders';
import { loadLog } from '../utils/adherenceLog';

const SCREEN_WIDTH  = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

const BOT_BG   = colors.surface;
const USER_BG  = colors.dawa;

// Required app/.env variable: EXPO_PUBLIC_GROQ_API_KEY.
// Never hardcode secrets in source files.
const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY;
// VoiceRSS TTS for Arabic and English
const VOICERSS_KEY = process.env.EXPO_PUBLIC_VOICERSS_KEY;
const GROQ_MODEL   = 'openai/gpt-oss-120b';
const TRANSLATION_MODEL = 'openai/gpt-oss-120b';
const TRANSLATION_SYSTEM_PROMPT = `You are a translator specializing in Moroccan Darija. Translate the following English medical text into Moroccan Darija written in Arabic script. Use everyday Moroccan dialect words — for example use 'الما' not 'الماء', 'دير' not 'افعل', 'كاين' not 'يوجد', 'بزاف' not 'كثير', 'مزيان' not 'جيد'. Avoid formal Modern Standard Arabic. Sound like a Moroccan person speaking naturally. Return only the translated Darija text in Arabic script, nothing else.`;

// The Darija medical vocabulary mappings below were verified by a native Darija speaker.
const SYSTEM_PROMPT = `You are a medical assistant that helps users in Morocco. Users may write in Moroccan Darija (in Arabic script or Franco-Arabic like 'kanbghit', '3endi', '7it'), French, or English. You must understand all of these naturally.

Always respond in English only, regardless of what language the user writes in. Keep your response clear, concise, and medically accurate. Do not invent drug dosages or claim to replace a doctor.

When a user first describes a symptom complaint, do NOT give medical advice immediately. Instead, ask only the most important missing questions to give safe guidance. Ask a maximum of 2-3 questions in one short message. The questions to consider are:
- Age group (child under 12 / adult / elderly over 65)
- How long they have had the symptom (today / 2-3 days / more than a week)
- Severity (mild / moderate / severe)
- Whether they are pregnant (only if relevant to the symptom)
- Any known allergies or chronic conditions (only if relevant)

Once the user has answered, give your medical guidance based on what they told you. If the user has already provided enough context in their first message (age, duration, severity), skip the questions and give guidance directly.

Keep all responses concise — maximum 150 words. Do not use bullet points or numbered lists. Write in short, clear paragraphs.

Moroccan Darija medical vocabulary — use this to correctly interpret what the user is saying:
- ras kayderni / ch9i9a = headache
- skhana = fever (high body temperature)
- rwa7 = common cold (runny nose, feeling cold after exposure to cold weather)
- doukha / skhfa = dizziness or vertigo
- lk7a = cough
- t9ya / t9yt = vomiting or nausea
- lm3da kadrni = stomach pain
- dhri kaydrni = back pain
- fiya l7la9m = sore throat
- r3cha = chills or shivering
- l7ka = itching or rash
- manqdrch ntnfs = difficulty breathing
- tnfkh = swelling
- l3ya = fatigue or weakness
- ishal = diarrhea
- lqabd = constipation
- r3ft mn nifi = nosebleed
- l7riq flm3da = heartburn
- [body part] + kayderni/kadrni = that body part is hurting me

Use these to accurately understand the user's complaint before generating your medical response.

IMPORTANT: If the user describes a life-threatening emergency — such as severe chest pain, inability to breathe, signs of stroke (face drooping, can't speak), heavy uncontrolled bleeding, overdose, self-harm, infant with very high fever, or severe allergic reaction — respond with only the single word EMERGENCY and nothing else. No explanation, no advice.

CRITICAL: Never simulate, predict or generate user responses. Never write text like "User hasn't responded yet" or anything similar. Each of your responses is a single assistant message only. Stop writing after your question or advice and wait for the real user to reply.`;

const MEDICAL_KNOWLEDGE_BASE = `
## MEDICAL GUIDANCE REFERENCE (Source: NHS UK)
Use this reference when answering questions about these conditions. Always advise seeing a doctor for serious or persistent symptoms.

HEADACHE: Rest, drink water, take paracetamol or ibuprofen. Avoid alcohol, skipping meals, excess screen time. See a doctor if: sudden severe headache, stiff neck, rash, confusion, vision changes, or headache lasts more than 3 weeks.

FEVER (ADULTS): High temperature is 38°C or above. Rest, drink plenty of fluids, take paracetamol or ibuprofen. See a doctor if temperature does not improve after a few days.

FEVER (CHILDREN): Give child paracetamol or ibuprofen if distressed (check age/weight on packaging). Do NOT give aspirin to under-16s. Do NOT alternate ibuprofen and paracetamol unless a doctor advises it. Call emergency services if child has stiff neck, rash that does not fade when pressed, difficulty breathing, blue or grey lips, or is unresponsive. Call 111 if: child under 3 months has temp 38°C+, child 3–6 months has 39°C+, or fever lasts more than 5 days.

COUGH: Usually clears in 3–4 weeks. Rest, drink fluids, try hot lemon and honey. Antibiotics are not needed for most coughs (viral). See a doctor if: cough lasts more than 3 weeks, coughing up blood, chest pain, or difficulty breathing.

SORE THROAT: Usually viral, resolves in about 1 week. Gargle warm salt water, drink fluids, take paracetamol or ibuprofen. Antibiotics usually not needed. See a doctor if: lasts more than 1 week, difficulty swallowing or breathing, very high fever, or drooling.

STOMACH ACHE: Most resolve in a few days. Avoid fatty and spicy foods. A pharmacist can advise on antacids and constipation. See a doctor urgently if: sudden severe pain, vomiting blood, blood in stool, unable to pass wind or pee, or pain alongside chest pain.

DIARRHOEA & VOMITING: Drink plenty of fluids in small sips. Avoid fruit juice and fizzy drinks. Diarrhoea usually stops in 5–7 days, vomiting in 1–2 days. Stay home until 48 hours symptom-free. See a doctor if: bloody diarrhoea, symptoms last more than 7 days (diarrhoea) or 2 days (vomiting), or signs of dehydration (dark urine, no tears, dry mouth).

BACK PAIN: Usually improves within a few weeks. Stay active — do NOT rest in bed. Ibuprofen is more effective than paracetamol alone for back pain. Use heat or ice packs. See a doctor urgently if: numbness or weakness in both legs, or loss of bladder/bowel control.

UTI (URINARY TRACT INFECTION): Burning when urinating, urgent or frequent need to pee, cloudy or smelly urine. Drink plenty of water. Women aged 16–64 (not pregnant) can get antibiotic treatment directly from a pharmacist. See a doctor if: male, pregnant, child, over 65, diabetic, or have back/side pain (may indicate kidney infection). Do NOT use old or leftover antibiotics.

HEARTBURN / ACID REFLUX: Burning sensation in the chest, sour taste in mouth. Eat smaller meals, avoid coffee, tomatoes, alcohol, spicy/fatty food, and lying down after eating. Pharmacist can recommend antacids. See a doctor if: symptoms occur most days, food is getting stuck in throat, unexplained weight loss, or frequent vomiting.

CONSTIPATION: Eat more fibre (fruits, vegetables, wholegrains), drink more water, stay active. Pharmacist can recommend a short-term laxative. See a doctor if: blood in stool, unexplained weight loss, persistent bloating, or sudden change in bowel habits.

COLD & FLU: Rest and drink plenty of fluids. Take paracetamol or ibuprofen. Antibiotics do not work for colds or flu (viral). Flu comes on suddenly and feels much worse than a cold. See a doctor if: high temperature lasts more than 3 days, chest pain, shortness of breath, or symptoms worsen after initially improving.

HIGH BLOOD PRESSURE: Usually has no symptoms — only detected by testing. Lifestyle: reduce salt, exercise regularly, lose weight if needed, avoid smoking and excessive alcohol. If already on blood pressure medicine, do NOT stop without speaking to a doctor. See a doctor if: regular headaches, blurred vision, or chest pain. Emergency: sudden severe chest pain spreading to arm or jaw — call emergency services immediately.

DIABETES (TYPE 2): Common symptoms include excessive thirst, frequent urination, fatigue, and blurred vision. Key management: healthy diet, regular exercise, and weight loss. Take prescribed medicine as directed — never stop without a doctor's advice. If vomiting or diarrhoea occurs while on diabetes medicine, contact a doctor. Regular check-ups for blood glucose (HbA1c), feet, eyes, and kidneys are essential.

SKIN RASH: Many rashes are harmless and clear up on their own. Avoid scratching. Pharmacist can advise on antihistamines for itchy rashes. See a doctor if: rash is spreading quickly, painful, blistering, or accompanied by fever. Emergency: rash that does not fade when pressed with a glass is a sign of meningitis — call emergency services immediately.

EYE IRRITATION / CONJUNCTIVITIS: Red, itchy, watery or sticky eyes. Wipe eyelids with cool boiled water using a clean cotton pad. Do not wear contact lenses until eyes are better. Pharmacist can recommend eye drops or antihistamines. See a doctor urgently if: eye pain, sensitivity to light, vision changes, or one or both eyes are very red.

TOOTHACHE: Take paracetamol or ibuprofen. Rinse with warm salt water. See a dentist if: pain lasts more than 2 days, there is swelling in the mouth or face, high temperature, or a bad taste. Emergency: swelling around the eye or neck, or difficulty breathing or swallowing.

FATIGUE / TIREDNESS: Common causes include poor sleep, stress, unhealthy diet, or lack of exercise. Aim for 6–9 hours of sleep, eat well, exercise regularly, and limit alcohol and caffeine. See a doctor if: tired for several weeks with no clear reason, or tiredness occurs alongside weight loss, mood changes, or other symptoms. Could indicate anaemia, diabetes, or thyroid problems.

ANXIETY / STRESS: Physical symptoms of anxiety include palpitations (racing heart), chest tightness, dizziness, and stomach problems — these are often anxiety, not a heart problem. Self-care: slow breathing exercises, regular exercise, talking to a trusted person, limiting caffeine and alcohol. See a doctor if: anxiety is affecting daily life or for referral to talking therapy (CBT).

NAUSEA / VOMITING: Take small sips of water. Avoid solid food until vomiting stops, then try bland foods. See a doctor if: vomiting blood, vomiting lasting more than 2 days, or signs of dehydration.
`;

const EMERGENCY_MESSAGES = {
  ar: t('ar', 'emergencyMessage'),
  fr: "Ces symptômes sont graves. Appelez le SAMU (15) immédiatement ou rendez-vous aux urgences. N'attendez pas.",
  en: t('en', 'emergencyMessage'),
};

const EMERGENCY_KEYWORDS = [
  // Chest / cardiac
  'chest pain', '9albi', 'qalbi', 'douleur poitrine', 'ma kanbghach ntnafs',
  'heart attack', 'crise cardiaque', 'ألم الصدر', 'الم الصدر', 'صدري كيوجعني',
  'قلبي', 'نوبة قلبية',
  // Franco
  '9lbi', 'sdri m9boud', 't9al f sdri', 'kadrni sdri', 'wja3 dyal sdri',
  // AR
  'صدري مقبوض', 'الوجع فصدري', 'فوق صدري',
  // EN
  'chest feels', 'pressure on my chest',
  // FR
  'poitrine serree', 'douleur dans ma poitrine', 'sur la poitrine', 'thorax',
  // Breathing
  "can't breathe", 'cant breathe', 'manqdarsh ntnafs', 'difficile de respirer',
  'mafich hawa', 'je respire pas', 'ما نقدرش نتنفس', 'ما كنقدرش نتنفس',
  'مافيش هوا', 'ما فيا هوا', 'صعوبة في التنفس',
  // Franco
  'kankhtn9', 'mawselnich tnafs', 'kanjbed f lhawa',
  // AR
  'كنختنق', 'كنجبد فالهوا', 'ما فيا حتى الهوا',
  // EN
  'choking', 'gasping for breath', 'no air is getting in',
  // FR
  "j'etouffe", "j'etouffe", 'je manque d\'air',
  // Stroke
  'face drooping', "can't speak", 'cant speak', 'avc', 'paralysie', 'khdam wjhi',
  '3endk khmam', 'وجهي معوج', 'ما نقدرش نهضر', 'شلل', 'سكتة دماغية',
  // Franco
  'wjhi 3waj', 'ma9drtch nhdr', 'nos wjhi', 'hdrti tkhrbqat',
  // AR
  'وجهي تعوج', 'هضرتي تخربقات', 'نص وجهي طاح', 'يدي ما بقات كاتتحرك',
  // EN
  'face dropped', 'slurred', 'one side of my body',
  // FR
  'mon visage tombe', 'je parle bizarrement', 'paralysee',
  // Heavy bleeding
  'heavy bleeding', 'dam bzzaf', 'hemorragie', "bleeding won't stop",
  'bleeding wont stop', 'dam ma wqfch', 'دم بزاف', 'النزيف ما وقفش', 'نزيف حاد',
  // Franco
  'dam kaysel', 'dam ma baghich y7bes',
  // AR
  'الدم كيسيل', 'الدم ما باغيش يوقف',
  // EN
  'so much blood', 'blood is pouring', 'losing lots of blood',
  // FR
  'sang partout', 'je perds beaucoup de sang', 'le saignement ne veut pas',
  // Overdose / poisoning
  'overdose', "klit l'adwiya", 'klit ladwiya', 'klitu dwa', 'trop de medicaments',
  'trop de pilules', 'كليت الأدوية', 'كليت الادوية', 'كليت الدوا بزاف', 'تسمم دوائي',
  // Franco
  'khdit dwa bzzaf', 'mada sma',
  // AR
  'كليت الدوا كامل', 'خديت الدوا بزاف', 'مادة سامة',
  // EN
  'swallowed all the pills', 'took too much medicine', 'poisonous',
  // FR
  "j'ai avale tous les comprimes", "j'ai avale tous", 'produit toxique',
  // Self-harm
  'hurt myself', 'ndir diya lrasi', 'me faire du mal', 'suicide', 'nqtl rasi',
  'نقتل راسي', 'نضر راسي', 'نأذي نفسي', 'انتحار',
  // Franco
  'inti7ar', 'njr7 rasi', 'nsali 7yati', 'ma baghi n3ich',
  // AR
  'ما بقيتش باغي نعيش', 'نسالي حياتي', 'نجرح راسي',
  // EN
  'kill myself', 'end my life', "don't want to be alive", 'ready to die tonight',
  // FR
  'je veux me tuer', 'mettre fin a mes jours', 'je ne veux plus vivre',
  // Infant fever
  'bebe dkhana', 'bebe skhoun', 'fievre bebe', 'baby fever',
  'drari chwiya dkhana', 'البيبي سخون', 'سخانة الرضيع', 'الطفل سخون', 'حمى الرضيع',
  // Franco
  'rdi3 dyal', 'rdi3 sghir skhoun', 'wldi 3ndo juj chhor w dkhana',
  // AR
  'الرضيع سخون', 'الرضيع ديال سيمانتين',
  // EN
  'newborn', 'one-month-old', 'two-month-old', 'under three months',
  // FR
  "bebe d'un mois", 'nouveau-ne',
  // Severe allergy
  'face swelling', 'wjhi mten7', 'gorge qui se ferme', 'allergic reaction',
  'tnafs sab', 'وجهي منفوخ', 'حلقي كيتسد', 'حساسية خطيرة', 'التنفس صعب',
  // Franco
  '7l9i kaytsd', 'lsani kaynfkh',
  // AR
  'لساني كينفخ', 'وجهي وشفافي نفخو',
  // EN
  'throat is closing', 'tongue is swelling', 'throat closing',
  // FR
  'gorge se ferme', 'ma langue gonfle',
];

function normalizeEmergencyText(text) {
  return String(text ?? '')
    .toLocaleLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f\u064B-\u065F\u0670]/g, '')
    .replace(/[’‘`]/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function checkEmergency(text, lang = 'en') {
  const normalized = normalizeEmergencyText(text);
  const negationWords = new Set([
    // English
    'no', 'not', "don't", "doesn't", "didn't", 'never', 'without', 'none', 'nor',
    "isn't", "aren't", "haven't", "hasn't",
    // French
    'pas', 'sans', 'aucun', 'aucune', 'ni', 'jamais',
    // Franco-Arabic and Arabic script
    'machi', 'bla', 'walou', 'ماشي', 'بلا', 'والو',
  ]);
  const contrastWords = new Set(['but', 'however', 'mais', 'walakin', 'lakin', 'ولكن', 'لكن']);
  const safetyScopeWords = new Set(['tellement']);
  const bodyPartFineKeywords = new Set(['9lbi', '9albi', 'qalbi', 'قلبي']);
  const fineWords = new Set(['fine', 'bikhir', 'بخير']);

  const words = (value) => value.match(/[\p{L}\p{N}']+/gu) ?? [];
  const withoutAndPrefix = (word) => {
    if (word.startsWith('wma')) return word.slice(1);
    if (word.startsWith('وما')) return word.slice(1);
    return word;
  };
  const isCapabilityNegation = (word) =>
    /^ma(?:nqdr|n9dr|9adr|9dr)[\p{L}\p{N}']*ch$/u.test(word) ||
    /^ما(?:نقدر|قدر)[\p{L}\p{N}]*ش$/u.test(word);
  const isJoinedNegation = (word) => {
    const candidate = withoutAndPrefix(word);
    if (isCapabilityNegation(candidate)) return false;
    return (/^ma[\p{L}\p{N}']*ch$/u.test(candidate) && candidate.length > 4) ||
      (/^ما[\p{L}\p{N}]*ش$/u.test(candidate) && candidate.length > 3);
  };
  const hasNegation = (beforeMatch) => {
    let scopeStart = 0;
    for (let index = 0; index < beforeMatch.length; index += 1) {
      if ('.!?;'.includes(beforeMatch[index])) scopeStart = index + 1;
    }
    const beforeWords = [...beforeMatch.matchAll(/[\p{L}\p{N}']+/gu)];
    for (const match of beforeWords) {
      if ((contrastWords.has(match[0]) || safetyScopeWords.has(match[0])) &&
          match.index >= scopeStart) {
        scopeStart = match.index + match[0].length;
      }
    }
    // An attached Arabic conjunction before a new matched symptom starts a new clause.
    if (beforeMatch.endsWith('و')) scopeStart = beforeMatch.length;
    const window = words(beforeMatch.slice(scopeStart)).slice(-8);
    if (window.some((word) => negationWords.has(word) || isJoinedNegation(word))) return true;

    // Split Franco-Arabic and Arabic forms such as "ma kaydrnich" and "ما كيضرنيش".
    for (let index = 0; index < window.length; index += 1) {
      const marker = withoutAndPrefix(window[index]);
      const ending = marker === 'ma' ? 'ch' : marker === 'ما' ? 'ش' : null;
      if (!ending) continue;
      const following = window.slice(index + 1, index + 4);
      if (following.some((word) =>
        word.endsWith(ending) && !isCapabilityNegation(`${marker}${word}`)
      )) return true;
    }
    return false;
  };
  const isClearlyFineBodyPart = (keyword, matchEnd) => {
    if (!bodyPartFineKeywords.has(keyword)) return false;
    const followingWords = words(normalized.slice(matchEnd));
    return followingWords.length > 0 && fineWords.has(followingWords[0]);
  };

  for (const rawKeyword of EMERGENCY_KEYWORDS) {
    const keyword = normalizeEmergencyText(rawKeyword);
    let fromIndex = 0;
    while (fromIndex <= normalized.length - keyword.length) {
      const matchIndex = normalized.indexOf(keyword, fromIndex);
      if (matchIndex === -1) break;
      const matchEnd = matchIndex + keyword.length;
      const negated = hasNegation(normalized.slice(0, matchIndex)) ||
        isClearlyFineBodyPart(keyword, matchEnd);
      if (!negated) {
        return {
          isEmergency: true,
          message: EMERGENCY_MESSAGES[lang] ?? EMERGENCY_MESSAGES.en,
        };
      }
      fromIndex = matchIndex + 1;
    }
  }
  return { isEmergency: false };
}

function welcomeMessage(lang) {
  return t(lang, 'welcomeMessage');
}

function messageTimestamp(lang) {
  return new Date().toLocaleTimeString(lang === 'ar' ? 'ar-MA' : 'en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function FadeInMessage({ children, style }) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [opacity]);

  return <Animated.View style={[style, { opacity }]}>{children}</Animated.View>;
}

function TypingDots({ label, isRTL }) {
  const dots = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.stagger(120, dots.map((dot) => Animated.sequence([
        Animated.timing(dot, { toValue: -5, duration: 220, useNativeDriver: true }),
        Animated.timing(dot, { toValue: 0, duration: 220, useNativeDriver: true }),
      ])))
    );
    animation.start();
    return () => animation.stop();
  }, [dots]);

  return (
    <View style={styles.typingContent}>
      <View style={styles.typingDotsRow}>
        {dots.map((dot, index) => (
          <Animated.View
            key={index}
            style={[styles.typingDot, { transform: [{ translateY: dot }] }]}
          />
        ))}
      </View>
      <Text style={[
        styles.typingCaption,
        { textAlign: isRTL ? 'right' : 'left', alignSelf: isRTL ? 'flex-end' : 'flex-start' },
      ]}>{label}</Text>
    </View>
  );
}

function medicineIdentificationMessage(lang, medicine) {
  const name = medicine.name && medicine.name !== 'Unknown' ? medicine.name : t(lang, 'unknown');
  const ingredient = medicine.activeIngredient && medicine.activeIngredient !== 'Unknown'
    ? medicine.activeIngredient
    : t(lang, 'unknown');
  const dosage = medicine.dosage || null;
  const manufacturer = medicine.manufacturer && medicine.manufacturer !== 'Unknown'
    ? medicine.manufacturer
    : t(lang, 'unknown');
  const status = medicine.status && medicine.status !== 'Unknown'
    ? medicine.status
    : t(lang, 'unknown');
  const source = medicine.source || 'AMMPS';
  return t(lang, 'medicineIdentified')(name, ingredient, dosage, manufacturer, status, source);
}

function medicineNotFoundMessage(lang) {
  return t(lang, 'medicineNotFound');
}

function ocrChoicesMessage(lang) {
  return t(lang, 'ocrChoices');
}

function cameraPermissionMessage(lang) {
  return t(lang, 'cameraPermissionMessage');
}

function getQuickReplies(lang) {
  return t(lang, 'quickReplies');
}

// Second line for a medicine choice card, so entries with the same name can be told apart.
// AMMPS entries share one brand name across strengths and forms (e.g. DOLIPRANE 1 G tablets
// vs 150 MG sachets); NHS names already include the strength, so the maker is shown instead.
function medicineChoiceDetail(medicine) {
  const parts = medicine?._db === 'UK'
    ? [medicine.manufacturer]
    : [medicine?.dosage, medicine?.form, medicine?.presentation];
  return parts.filter((part) => part && String(part).trim()).join(' · ');
}

function isWithdrawnMedicine(medicine) {
  return /retir/i.test(String(medicine?.status ?? ''));
}

function normalizeMedicine(item, fallback = {}) {
  const db = item?._db || fallback?._db || fallback?.db;
  return {
    name: item?.name || fallback?.name || 'Unknown',
    activeIngredient: item?.active_ingredient || fallback?.active_ingredient || 'Unknown',
    dosage: item?.dosage || fallback?.dosage || null,
    manufacturer: item?.manufacturer || fallback?.manufacturer || 'Unknown',
    status: item?.status || fallback?.status || 'Unknown',
    source: db === 'UK' ? 'NHS' : 'AMMPS',
  };
}

function medicineSystemContext(medicine) {
  if (!medicine) return '';
  const dosageInfo = medicine.dosage
    ? `dosage/strength: ${medicine.dosage}`
    : 'dosage information: not available in database';
  return `The user has identified the following medicine: ${medicine.name}, active ingredient: ${medicine.activeIngredient}, ${dosageInfo}, manufacturer: ${medicine.manufacturer}, status: ${medicine.status}, source: ${medicine.source}. Use this information to answer their question accurately. If asked about dosage and the database has no dosage info, say so clearly and recommend consulting a pharmacist or reading the package leaflet. Always recommend consulting a pharmacist for specific dosage questions.`;
}

function medicineMatchesAllergy(medicine, allergies = []) {
  const name = String(medicine?.name || '').toLocaleLowerCase();
  const activeIngredient = String(
    medicine?.active_ingredient || medicine?.activeIngredient || ''
  ).toLocaleLowerCase();

  return allergies.some((item) => {
    const allergy = String(item || '').trim().toLocaleLowerCase();
    return allergy && (name.includes(allergy) || activeIngredient.includes(allergy));
  });
}

function buildProfileContext(profile) {
  if (!profile) return '';
  const parts = [];
  if (profile.name) parts.push(`Patient name: ${profile.name}`);
  if (profile.age) parts.push(`Age: ${profile.age}`);
  if (profile.sex) parts.push(`Sex: ${profile.sex}`);
  if (profile.conditions?.length) parts.push(`Chronic conditions: ${profile.conditions.join(', ')}`);
  if (profile.medications?.length) parts.push(`Regular medications: ${profile.medications.join(', ')}`);
  const allergies = (profile.allergies || []).map((item) => String(item).trim()).filter(Boolean);
  if (allergies.length) {
    parts.push(`Allergies: ${allergies.join(', ')}`);
    parts.push(`IMPORTANT: The user is allergic to: ${allergies.join(', ')}. Do NOT recommend these medicines or any medicines containing these ingredients under any circumstances.`);
  }
  if (profile.pregnancyStatus && profile.pregnancyStatus !== 'not_applicable') {
    parts.push(`Pregnancy status: ${profile.pregnancyStatus}`);
  }
  if (profile.weight != null) parts.push(`Weight: ${profile.weight} kg`);
  if (profile.adverseReactions?.length) parts.push(`Past adverse medicine reactions: ${profile.adverseReactions.join('; ')}`);
  if (!parts.length) return '';
  return `PATIENT PROFILE:\n${parts.join('\n')}\nAlways consider this profile when giving advice. Flag any conflicts between recommended medicines and their existing medications or conditions.`;
}

async function callMedicalModel(messages, activeMedicine, profileContext = '') {
  const medicineContext = medicineSystemContext(activeMedicine);
  const base = `${SYSTEM_PROMPT}\n\n${MEDICAL_KNOWLEDGE_BASE}`;
  const withMedicine = medicineContext ? `${medicineContext}\n\n${base}` : base;
  const systemPrompt = profileContext ? `${profileContext}\n\n${withMedicine}` : withMedicine;
  console.log('[Medical model] System prompt preview:', systemPrompt.slice(0, 200));
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        max_tokens: 1024,
        temperature: 0.7,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
      }),
      signal: controller.signal,
    });

    const json = await response.json();

    if (json.error) {
      throw new Error(`API ${response.status}: ${json.error.message || 'Unknown error'}`);
    }

    const text = json.choices?.[0]?.message?.content;
    if (!text) {
      throw new Error(`Unexpected response: ${JSON.stringify(json).slice(0, 150)}`);
    }

    return text;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function callTranslationModel(medicalEnglishText) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: TRANSLATION_MODEL,
        max_tokens: 2048,
        temperature: 0.2,
        messages: [
          { role: 'system', content: TRANSLATION_SYSTEM_PROMPT },
          { role: 'user', content: medicalEnglishText },
        ],
      }),
      signal: controller.signal,
    });

    const json = await response.json();

    if (json.error) {
      throw new Error(`Translation API ${response.status}: ${json.error.message || 'Unknown error'}`);
    }

    const translatedText = json.choices?.[0]?.message?.content;
    if (!translatedText) {
      throw new Error(`Unexpected translation response: ${JSON.stringify(json).slice(0, 150)}`);
    }

    return translatedText;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function runTwoStagePipeline(messages, lang, onTranslationStart, activeMedicine, profileContext = '') {
  // Every non-emergency input reaches the medical model first, including greetings.
  const medicalResponse = await callMedicalModel(messages, activeMedicine, profileContext);
  console.log('[Medical model] Raw response:', medicalResponse);

  if (/^EMERGENCY[.!]?\s*$/i.test(medicalResponse.trim())) {
    return { isEmergency: true };
  }

  console.log('[Translation] Current lang value:', lang);
  const shouldTranslateToDarija = lang === 'ar';
  let responseText = medicalResponse;

  if (shouldTranslateToDarija) {
    onTranslationStart();

    try {
      // The translation model receives only the medical model's English response.
      responseText = await callTranslationModel(medicalResponse);
    } catch (err) {
      if (err.name === 'AbortError') throw err;
      console.error('[Translation] Failed:', err.message);
      responseText = `${medicalResponse} ${t(lang, 'translationUnavailable')}`;
    }
  }

  return { isEmergency: false, text: responseText, englishText: medicalResponse };
}

export default function ChatbotScreen({ route }) {
  const insets = useSafeAreaInsets();
  const { lang, setLang, toggle } = useLang();
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const ttsPlayer = useAudioPlayer(null);
  const scrollRef = useRef(null);
  const previousLangRef = useRef(lang);
  const ocrCancelRef = useRef(false);
  const evidenceRequestedRef = useRef(new Set());
  const barcodeHandledRef = useRef(false);
  const photoCameraRef = useRef(null);
  const initialMessageHandledRef = useRef(null);
  // Profile id the current chat belongs to. undefined = not assigned yet.
  // Chats are always saved under this profile, never under whichever profile is active later.
  const chatProfileIdRef = useRef(undefined);
  const [permission, requestPermission] = useCameraPermissions();

  const [messages, setMessages] = useState(() => [{
    role: 'assistant',
    content: welcomeMessage(lang),
    timestamp: messageTimestamp(lang),
  }]);
  const [input, setInput] = useState('');
  const [inputFocused, setInputFocused] = useState(false);
  const [disclaimerExpanded, setDisclaimerExpanded] = useState(true);
  const disclaimerAnimation = useRef(new Animated.Value(1)).current;
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState('analyzing');
  const [activeChatId, setActiveChatId] = useState(createChatId);
  const [activeCreatedAt, setActiveCreatedAt] = useState(() => new Date().toISOString());
  const [chatHistory, setChatHistory] = useState([]);
  const [historyReady, setHistoryReady] = useState(false);
  const [historyStorageError, setHistoryStorageError] = useState(false);
  const [scanOptionsVisible, setScanOptionsVisible] = useState(false);
  const [barcodeScannerVisible, setBarcodeScannerVisible] = useState(false);
  const [photoCameraVisible, setPhotoCameraVisible] = useState(false);
  const [photoCameraReady, setPhotoCameraReady] = useState(false);
  const [capturingPhoto, setCapturingPhoto] = useState(false);
  const [medicineLoading, setMedicineLoading] = useState(false);
  const [medicineLoadingText, setMedicineLoadingText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [activeMedicine, setActiveMedicine] = useState(null);
  const [showMedicineQuickReplies, setShowMedicineQuickReplies] = useState(false);
  const [ocrMedicineChoices, setOcrMedicineChoices] = useState([]);
  const [ocrDbFilter, setOcrDbFilter] = useState(null); // 'MA' | 'UK' | null
  const [symptomResults, setSymptomResults] = useState([]); // DB hits extracted from AI response
  const [symptomDbFilter, setSymptomDbFilter] = useState(null); // 'MA' | 'UK' | null
  const [showOcrRetry, setShowOcrRetry] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [profiles, setProfiles] = useState([]);
  const [activeProfile, setActiveProfile] = useState(null);
  const [profilePickerVisible, setProfilePickerVisible] = useState(false);
  const [pendingMessage, setPendingMessage] = useState(null);
  const [profilesScreenVisible, setProfilesScreenVisible] = useState(false);
  const [profileMedicationMode, setProfileMedicationMode] = useState(false);
  const [pendingProfileMedication, setPendingProfileMedication] = useState(null);
  const [awaitingSuitabilityScan, setAwaitingSuitabilityScan] = useState(false);
  const [medicineLibraryVisible, setMedicineLibraryVisible] = useState(false);
  const [symptomLogVisible, setSymptomLogVisible] = useState(false);
  const [savedMedicines, setSavedMedicines] = useState([]);
  const [remindersVisible, setRemindersVisible] = useState(false);
  const [reportReminders, setReportReminders] = useState([]);
  const [reportAdherenceLog, setReportAdherenceLog] = useState({});
  const [selfCareVisible, setSelfCareVisible] = useState(false);
  const [speakingMessageIndex, setSpeakingMessageIndex] = useState(null);
  const [evidenceTags, setEvidenceTags] = useState({});
  const [expandedEvidenceIndex, setExpandedEvidenceIndex] = useState(null);
  const [profileRemindersCount, setProfileRemindersCount] = useState(0);

  const chatStarted = messages.some(m => m.role === 'user');
  const isRTL = lang === 'ar';

  const toggleDisclaimer = () => {
    const nextExpanded = !disclaimerExpanded;
    setDisclaimerExpanded(nextExpanded);
    Animated.timing(disclaimerAnimation, {
      toValue: nextExpanded ? 1 : 0,
      duration: 220,
      useNativeDriver: false,
    }).start();
  };

  // Load previous conversations once. The current screen still starts with a fresh chat.
  useEffect(() => {
    let mounted = true;
    loadStoredChats(/* profileId is not known yet: use the global fallback */)
      .then((stored) => {
        if (!mounted) return;
        setChatHistory(stored);
        setHistoryReady(true);
      })
      .catch(() => {
        if (!mounted) return;
        setHistoryStorageError(true);
        setHistoryReady(true);
      });
    loadProfiles().then(async (storedProfiles) => {
      if (!mounted) return;
      if (Array.isArray(storedProfiles)) {
        setProfiles(storedProfiles);
        if (storedProfiles.length === 1) {
          setActiveProfile(storedProfiles[0]);
          setLang(storedProfiles[0].preferredLang ?? 'en');
        } else if (storedProfiles.length > 1) {
          // Restore the last-used profile instead of prompting every time
          try {
            const savedId = await AsyncStorage.getItem('@dawa/lastProfileId');
            const restored = savedId ? storedProfiles.find((p) => p.id === savedId) : null;
            if (restored) {
              setActiveProfile(restored);
              setLang(restored.preferredLang ?? 'en');
            } else {
              setProfilePickerVisible(true);
            }
          } catch {
            setProfilePickerVisible(true);
          }
        }
      }
    });
    loadSavedMedicines(/* profileId is not known yet: use the global fallback */).then((storedMedicines) => {
      if (mounted && Array.isArray(storedMedicines)) setSavedMedicines(storedMedicines);
    });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!historyReady) return;
    loadStoredChats(activeProfile?.id)
      .then((stored) => setChatHistory(stored ?? []))
      .catch(() => setChatHistory([]));
    loadSavedMedicines(activeProfile?.id)
      .then((stored) => {
        if (Array.isArray(stored)) setSavedMedicines(stored);
      })
      .catch(() => {});
  }, [activeProfile?.id, historyReady]);

  // Keep the previous-language reference synchronized without resetting the conversation.
  useEffect(() => {
    previousLangRef.current = lang;
    setMessages(prev => {
      if (prev.length === 0) return prev;
      const first = prev[0];
      if (first.role !== 'assistant') return prev;
      const updated = [...prev];
      updated[0] = { ...first, content: welcomeMessage(lang) };
      return updated;
    });
  }, [lang]);

  useEffect(() => {
    let mounted = true;
    loadReminders().then((storedReminders) => {
      if (!mounted) return;
      const linkedReminders = activeProfile?.id
        ? storedReminders.filter((reminder) => {
            const ids = Array.isArray(reminder.profileIds) ? reminder.profileIds : [];
            return ids.includes(activeProfile.id);
          })
        : storedReminders;
      setProfileRemindersCount(linkedReminders.length);
    });
    return () => { mounted = false; };
  }, [activeProfile?.id, remindersVisible]);

  // While the current chat has no user messages yet, it belongs to whichever profile is active.
  // Once the user has sent a message, the chat's profile is fixed.
  useEffect(() => {
    if (!messages.some((message) => message.role === 'user')) {
      chatProfileIdRef.current = activeProfile?.id ?? null;
    }
  }, [activeProfile?.id, messages]);

  // Persist chats after the user sends the first message and after every reply.
  useEffect(() => {
    if (!historyReady || !messages.some((message) => message.role === 'user')) return;

    const activeProfileId = activeProfile?.id ?? null;
    const chatProfileId = chatProfileIdRef.current === undefined
      ? activeProfileId
      : chatProfileIdRef.current;
    if (chatProfileIdRef.current === undefined) chatProfileIdRef.current = chatProfileId;
    const chatProfile = chatProfileId
      ? (profiles.find((profile) => profile.id === chatProfileId)
        ?? (activeProfile?.id === chatProfileId ? activeProfile : null))
      : null;

    const now = new Date().toISOString();
    const savedChat = {
      id: activeChatId,
      title: createChatTitle(messages, t(lang, 'newChat')),
      messages,
      lang,
      activeMedicine: activeMedicine ?? null,
      activeProfile: chatProfile,
      createdAt: activeCreatedAt,
      updatedAt: now,
    };

    if (chatProfileId !== activeProfileId) {
      // Safety net: the chat belongs to another profile, so save it there
      // without touching the history currently shown on screen.
      loadStoredChats(chatProfileId)
        .then((stored) => storeChats(
          [savedChat, ...stored.filter((chat) => chat.id !== activeChatId)],
          chatProfileId
        ))
        .then(() => setHistoryStorageError(false))
        .catch(() => setHistoryStorageError(true));
      return;
    }

    setChatHistory((current) => {
      const next = [savedChat, ...current.filter((chat) => chat.id !== activeChatId)];
      storeChats(next, chatProfileId)
        .then(() => setHistoryStorageError(false))
        .catch(() => setHistoryStorageError(true));
      return next.slice(0, 50);
    });
  }, [messages, activeChatId, activeCreatedAt, historyReady, lang, activeProfile, profiles]);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages, loading, medicineLoading, showMedicineQuickReplies, ocrMedicineChoices]);

  const addAssistantMessage = (content) => {
    setMessages((current) => [...current, {
      role: 'assistant',
      content,
      timestamp: messageTimestamp(lang),
    }]);
  };

  const toggleMessageSpeech = async (messageIndex, messageText) => {
    try {
      const isCurrentMessage = speakingMessageIndex === messageIndex;
      if (isCurrentMessage) {
        ttsPlayer.pause();
        setSpeakingMessageIndex(null);
        return;
      }
      if (speakingMessageIndex !== null) {
        ttsPlayer.pause();
      }

      setSpeakingMessageIndex(messageIndex);
      const text = String(messageText || '');
      console.log('[Speech] attempting to speak, text length:', text.length);
      // Allow audio to play even when the iOS silent switch is on
      await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });

      const voiceLang = lang === 'ar' ? 'ar-sa' : 'en-us';
      const voiceName = lang === 'ar' ? 'Layla' : 'Linda';

      const formData = new FormData();
      formData.append('key', VOICERSS_KEY);
      formData.append('hl', voiceLang);
      formData.append('v', voiceName);
      formData.append('src', text);
      formData.append('c', 'MP3');
      formData.append('f', '44khz_16bit_stereo');

      const ttsRes = await fetch('https://api.voicerss.org/', {
        method: 'POST',
        body: formData,
      });
      console.log('[TTS] VoiceRSS status:', ttsRes.status);

      if (!ttsRes.ok) {
        const errBody = await ttsRes.text();
        throw new Error(`VoiceRSS ${ttsRes.status}: ${errBody}`);
      }

      const contentType = ttsRes.headers.get('content-type') || '';
      if (contentType.includes('text/html') || contentType.includes('text/plain')) {
        const errorText = await ttsRes.text();
        throw new Error(`VoiceRSS error body: ${errorText}`);
      }

      console.log('[TTS] response ok, reading blob...');
      const blob = await ttsRes.blob();
      const reader = new FileReader();
      const base64 = await new Promise((res, rej) => {
        reader.onload = () => res(reader.result.split(',')[1]);
        reader.onerror = rej;
        reader.readAsDataURL(blob);
      });

      const tmpPath = FileSystem.cacheDirectory + 'dawa_tts.mp3';
      console.log('[TTS] base64 length:', base64?.length, 'first 30 chars:', base64?.substring(0, 30));
      await FileSystem.writeAsStringAsync(tmpPath, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      console.log('[TTS] file written to:', tmpPath);
      ttsPlayer.replace({ uri: tmpPath });
      await new Promise(resolve => setTimeout(resolve, 300));
      ttsPlayer.play();
      console.log('[TTS] play called after delay, playing:', ttsPlayer.playing);
      console.log('[TTS] player.replace and play called, player.playing:', ttsPlayer.playing);
      const checkDone = setInterval(() => {
        if (!ttsPlayer.playing) {
          clearInterval(checkDone);
          setSpeakingMessageIndex((current) =>
            current === messageIndex ? null : current
          );
        }
      }, 500);
    } catch (e) {
      console.log('[Speech] error:', e);
      setSpeakingMessageIndex(null);
    }
  };

  const requestEvidenceTag = async (messageIndex, messageText) => {
    if (evidenceRequestedRef.current.has(messageIndex)) return;
    evidenceRequestedRef.current.add(messageIndex);
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'openai/gpt-oss-120b',
          max_tokens: 120,
          temperature: 0,
          messages: [
            {
              role: 'system',
              content: "You are a medical evidence tagger. Given an AI medical assistant message, return ONLY a JSON object with: { confidence: 'high'|'medium'|'low', sources: string[] } where sources is a list of 1–3 short labels chosen from ['NHS guidelines', 'Standard pharmacology', 'General medical knowledge', 'Model reasoning only']. No other text.",
            },
            { role: 'user', content: messageText },
          ],
        }),
      });
      if (!response.ok) throw new Error('Evidence tagging failed');
      const json = await response.json();
      const parsed = JSON.parse(json.choices?.[0]?.message?.content?.trim() || '');
      const allowedConfidence = ['high', 'medium', 'low'];
      const allowedSources = ['NHS guidelines', 'Standard pharmacology', 'General medical knowledge', 'Model reasoning only'];
      const sources = Array.isArray(parsed?.sources)
        ? parsed.sources.filter((source) => allowedSources.includes(source)).slice(0, 3)
        : [];
      if (!allowedConfidence.includes(parsed?.confidence) || sources.length === 0) return;
      setEvidenceTags((current) => ({
        ...current,
        [messageIndex]: { confidence: parsed.confidence, sources },
      }));
    } catch {
      // Evidence metadata is optional and remains hidden on failure.
    }
  };

  const startVoiceRecording = async () => {
    try {
      const { granted } = await requestRecordingPermissionsAsync();
      if (!granted) {
        addAssistantMessage(lang === 'ar' ? 'ما أعطيتيش إذن للميكروفون.' : 'Microphone permission denied. Please allow it in settings.');
        return;
      }
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      setIsRecording(true);
    } catch (e) {
      console.warn('Voice start failed:', e);
      addAssistantMessage(lang === 'ar' ? 'ما قدرناش نبدأو التسجيل.' : t(lang, 'voiceError'));
    }
  };

  const stopVoiceRecording = async () => {
    try {
      setIsRecording(false);
      setIsTranscribing(true);
      await recorder.stop();
      await setAudioModeAsync({ allowsRecording: false });
      const recordingUri = recorder.uri;
      console.log('Voice recording URI:', recordingUri);
      if (!recordingUri) throw new Error('No recording URI');

      const formData = new FormData();
      formData.append('file', { uri: recordingUri, name: 'recording.m4a', type: 'audio/m4a' });
      formData.append('model', 'whisper-large-v3');

      const transcription = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'https://api.groq.com/openai/v1/audio/transcriptions');
        xhr.setRequestHeader('Authorization', `Bearer ${GROQ_API_KEY}`);
        xhr.onload = () => {
          if (xhr.status === 200) {
            try { resolve(JSON.parse(xhr.responseText).text ?? ''); }
            catch { reject(new Error('Bad JSON from Whisper')); }
          } else {
            reject(new Error(`Whisper HTTP ${xhr.status}: ${xhr.responseText}`));
          }
        };
        xhr.onerror = () => reject(new Error('Network error'));
        xhr.send(formData);
      });

      if (transcription.trim()) setInput(transcription);
    } catch (e) {
      console.warn('Voice input failed:', e);
      addAssistantMessage(lang === 'ar' ? 'ما قدرناش نفهم الصوت. كتب السؤال.' : t(lang, 'voiceError'));
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleMicPress = async () => {
    if (isTranscribing) return;
    if (isRecording) {
      await stopVoiceRecording();
      return;
    }
    await startVoiceRecording();
  };

  const handleLoadMedicineFromLibrary = (medicine) => {
    setActiveMedicine(medicine);
    setSymptomResults([]);
    setShowMedicineQuickReplies(true);
    addAssistantMessage(medicineIdentificationMessage(lang, medicine));
  };

  const handleRemoveSavedMedicine = async (medicineName) => {
    const updated = await unsaveMedicine(medicineName, activeProfile?.id);
    setSavedMedicines(updated);
  };

 const handleSaveMedicine = async (medicine) => {
    const updated = await saveMedicine(medicine, activeProfile?.id);
    setSavedMedicines(updated);
  };

  const isMedicineSaved = (medicine) => {
    if (!medicine?.name) return false;
    return savedMedicines.some((m) => m.name === medicine.name);
  };

  const handleSaveProfiles = async (updatedProfiles) => {
    setProfiles(updatedProfiles);
    setActiveProfile((current) => {
      if (!current) return null;
      return updatedProfiles.find((profile) => profile.id === current.id) ?? null;
    });
    await saveProfiles(updatedProfiles);
  };

  const identifyMedicine = (item, fallback = {}) => {
    const medicine = normalizeMedicine(item, fallback);
    setOcrMedicineChoices([]);
    setOcrDbFilter(null);
    setSymptomResults([]);
    setSymptomDbFilter(null);
    setShowOcrRetry(false);
    if (profileMedicationMode) {
      setProfileMedicationMode(false);
      if (medicine.name && medicine.name !== 'Unknown') {
        setPendingProfileMedication(medicine.name);
      }
      setProfilesScreenVisible(true);
      return;
    }
    setActiveMedicine(medicine);
    setSymptomResults([]);
    setShowMedicineQuickReplies(true);
    addAssistantMessage(medicineIdentificationMessage(lang, medicine));
    // A scanned or photographed medicine is always shown, even if it matches an allergy:
    // hiding it would tell the user "not found" at exactly the moment they need a warning.
    if (medicineMatchesAllergy(medicine, activeProfile?.allergies)) {
      addAssistantMessage(t(lang, 'allergyWarning'));
    }
  };

  const showMedicineNotFound = () => {
    addAssistantMessage(medicineNotFoundMessage(lang));
  };

  const cancelMedicineLoading = () => {
    ocrCancelRef.current = true;
    setMedicineLoading(false);
    setShowOcrRetry(false);
  };

  const ensureCameraPermission = async () => {
    if (permission?.granted) return true;
    try {
      const nextPermission = await requestPermission();
      if (nextPermission.granted) return true;
      addAssistantMessage(cameraPermissionMessage(lang));
      return false;
    } catch {
      addAssistantMessage(t(lang, 'cameraPermissionError'));
      return false;
    }
  };

  const openBarcodeScanner = async () => {
    setScanOptionsVisible(false);
    setProfileMedicationMode(false);
    if (!(await ensureCameraPermission())) return;
    barcodeHandledRef.current = false;
    setMedicineLoadingText(t(lang, 'scanBarcodeInstruction'));
    setMedicineLoading(true);
    setBarcodeScannerVisible(true);
  };

  const closeBarcodeScanner = () => {
    barcodeHandledRef.current = true;
    setBarcodeScannerVisible(false);
    setMedicineLoading(false);
    if (profileMedicationMode) {
      setProfileMedicationMode(false);
      setProfilesScreenVisible(true);
    }
  };

  const handleBarcodeScan = ({ data }) => {
    if (barcodeHandledRef.current) return;
    barcodeHandledRef.current = true;
    try {
      const result = lookupBarcode(data);
      setBarcodeScannerVisible(false);
      setMedicineLoading(false);

      if (!result.found) {
        if (profileMedicationMode) {
          setProfileMedicationMode(false);
          setProfilesScreenVisible(true);
        }
        showMedicineNotFound();
        return;
      }

      // Show the exact product even if the profile is allergic to it; identifyMedicine()
      // adds the allergy warning. (Previously allergens were filtered out and the user was
      // told the medicine was not found.)
      const fallbackMedicine = {
        ...result.barcodeEntry,
        db: result.db,
      };
      identifyMedicine((result.medicines || [])[0], fallbackMedicine);
    } catch {
      setBarcodeScannerVisible(false);
      setMedicineLoading(false);
      if (profileMedicationMode) {
        setProfileMedicationMode(false);
        setProfilesScreenVisible(true);
      }
      addAssistantMessage(t(lang, 'barcodeError'));
    }
  };

  const openProfileBarcodeScanner = async () => {
    setProfilesScreenVisible(false);
    setProfileMedicationMode(true);
    if (!(await ensureCameraPermission())) {
      setProfileMedicationMode(false);
      setProfilesScreenVisible(true);
      return;
    }
    barcodeHandledRef.current = false;
    setMedicineLoadingText(t(lang, 'scanBarcodeInstruction'));
    setMedicineLoading(true);
    setBarcodeScannerVisible(true);
  };

  const openPhotoCamera = async () => {
    setScanOptionsVisible(false);
    setProfileMedicationMode(false);
    setOcrMedicineChoices([]);
    setOcrDbFilter(null);
    setSymptomResults([]);
    setSymptomDbFilter(null);
    setShowMedicineQuickReplies(false);
    await new Promise((resolve) => setTimeout(resolve, 300));
    if (!(await ensureCameraPermission())) return;
    ocrCancelRef.current = false;
    setPhotoCameraReady(false);
    setPhotoCameraVisible(true);
  };

  const closePhotoCamera = () => {
    if (capturingPhoto) return;
    setPhotoCameraVisible(false);
    setPhotoCameraReady(false);
    if (profileMedicationMode) {
      setProfileMedicationMode(false);
      setProfilesScreenVisible(true);
    }
  };

  const openProfilePhotoCamera = async () => {
    setProfilesScreenVisible(false);
    setProfileMedicationMode(true);
    setOcrMedicineChoices([]);
    setOcrDbFilter(null);
    setSymptomResults([]);
    setSymptomDbFilter(null);
    await new Promise((resolve) => setTimeout(resolve, 300));
    if (!(await ensureCameraPermission())) {
      setProfileMedicationMode(false);
      setProfilesScreenVisible(true);
      return;
    }
    ocrCancelRef.current = false;
    setPhotoCameraReady(false);
    setPhotoCameraVisible(true);
  };

  const capturePackagingPhoto = async () => {
    if (!photoCameraReady || capturingPhoto || !photoCameraRef.current) return;
    setCapturingPhoto(true);

    try {
      const photo = await photoCameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.3,
        exif: false,
      });

      setPhotoCameraVisible(false);
      setPhotoCameraReady(false);
      setMedicineLoadingText(t(lang, 'ocrCapturing'));
      setMedicineLoading(true);

      if (!photo?.base64) {
        throw new Error('Camera did not return base64 image data');
      }

      if (ocrCancelRef.current) return;
      setMedicineLoadingText(t(lang, 'ocrReading'));

      // API key loaded from app/.env: never hardcode secrets in source files.
      // Same approach as the prescription scanner in RemindersScreen (confirmed working):
      // enough output tokens for the model's thinking, and a fallback model when overloaded.
      const geminiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
      const VISION_PROMPT = 'You are a pharmacy assistant. Look at this medicine packaging and reply with ONLY the most prominent medicine name on the packaging — this is usually the largest text, either the brand name (e.g. Strepsils, Panadol) or the generic name (e.g. Chlorphenamine, Ibuprofen). Do NOT return the manufacturer/company name, dosage, or active ingredient chemical names. One word or short name only, plain text, no formatting, no explanation.';
      // Provider order: three Gemini models (an overload is usually per model),
      // then Groq vision as a last resort. Each attempt returns the raw answer text or null.
      // Model names checked against the key's ListModels output on 14 October 2026.
      const GEMINI_VISION_MODELS = ['gemini-3.6-flash', 'gemini-3.5-flash-lite', 'gemini-2.5-flash'];
      const askGemini = async (model) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 35000);
        let response;
        try {
          response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{
                  parts: [
                    { inline_data: { mime_type: 'image/jpeg', data: photo.base64 } },
                    { text: VISION_PROMPT },
                  ],
                }],
                generationConfig: { temperature: 0, maxOutputTokens: 1024 },
              }),
              signal: controller.signal,
            }
          );
        } finally {
          clearTimeout(timeoutId);
        }
        console.log(`[PhotoID] ${model} HTTP status:`, response.status);
        if (!response.ok) {
          const errText = await response.text();
          console.log(`[PhotoID] ${model} error:`, errText.slice(0, 200));
          return { text: null };
        }
        const json = await response.json();
        const candidate = json.candidates?.[0];
        // Join all answer parts (skip any "thought" parts) instead of only reading the first one.
        const text = (candidate?.content?.parts ?? [])
          .filter((part) => !part.thought && typeof part.text === 'string')
          .map((part) => part.text)
          .join('\n');
        console.log(`[PhotoID] ${model} finishReason:`, candidate?.finishReason, 'raw:', text.slice(0, 200));
        return { text };
      };

      const askGroqVision = async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 35000);
        let response;
        try {
          response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.EXPO_PUBLIC_GROQ_API_KEY}`,
            },
            body: JSON.stringify({
              model: 'qwen/qwen3.6-27b',
              max_tokens: 1024,
              messages: [{
                role: 'user',
                content: [
                  { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${photo.base64}` } },
                  { type: 'text', text: VISION_PROMPT },
                ],
              }],
            }),
            signal: controller.signal,
          });
        } finally {
          clearTimeout(timeoutId);
        }
        console.log('[PhotoID] groq qwen3.6-27b HTTP status:', response.status);
        if (!response.ok) {
          const errText = await response.text();
          console.log('[PhotoID] groq error:', errText.slice(0, 200));
          return { text: null };
        }
        const json = await response.json();
        const text = json.choices?.[0]?.message?.content ?? '';
        console.log('[PhotoID] groq raw:', text.slice(0, 200));
        return { text };
      };

      let rawVisionContent = null;
      for (const model of GEMINI_VISION_MODELS) {
        if (ocrCancelRef.current) return;
        rawVisionContent = (await askGemini(model)).text;
        if (rawVisionContent !== null) break;
        await new Promise((r) => setTimeout(r, 500));
      }
      if (rawVisionContent === null) {
        if (ocrCancelRef.current) return;
        rawVisionContent = (await askGroqVision()).text;
      }
      if (ocrCancelRef.current) return;
      if (rawVisionContent === null) {
        // A service problem, not an unrecognised medicine: show the error message instead of "could not read".
        throw new Error('All vision providers failed');
      }

      let answerText = rawVisionContent.includes('</think>')
        ? rawVisionContent.split('</think>').pop()
        : rawVisionContent;
      // Remove markdown and quotes the model sometimes adds, e.g. **Doliprane** or "Doliprane".
      const cleanedLines = answerText
        .split('\n')
        .map((line) => line
          .replace(/<[^>]*>/g, '')
          .replace(/[*_`#"“”«»]/g, '')
          .replace(/^\s*(?:[-•]|\d+[.)])\s*/, '')
          .replace(/[.,;:!]+\s*$/, '')
          .trim())
        .filter(Boolean);
      const extractedName = cleanedLines.length ? cleanedLines[cleanedLines.length - 1] : '';

      if (!extractedName) {
        addAssistantMessage(t(lang, 'ocrFailed'));
        setShowOcrRetry(true);
        return;
      }

      // Try the full name first, then without strength (e.g. "Doliprane 1000mg" -> "Doliprane"),
      // then the first word, because the database may write the strength differently.
      const nameVariants = [
        extractedName,
        extractedName.replace(/\s*\d.*$/, '').trim(),
        extractedName.split(/\s+/)[0],
      ].filter((variant, index, all) => variant.length >= 3 && all.indexOf(variant) === index);
      let rawHits = [];
      for (const variant of nameVariants) {
        rawHits = searchByName(variant);
        if (rawHits.length > 0) break;
      }
      console.log('[PhotoID] extracted name:', extractedName, 'tried:', nameVariants, 'hits:', rawHits.length);
      // Keep allergens in the list: the choice cards flag them and identifyMedicine() warns.
      const hits = rawHits;

      if (hits.length === 0) {
        addAssistantMessage(t(lang, 'ocrFailed'));
        setShowOcrRetry(true);
        return;
      }

      if (hits.length === 1) {
        identifyMedicine(hits[0]);
        return;
      }

      setOcrMedicineChoices(hits);
      setOcrDbFilter(lang === 'ar' ? 'MA' : 'UK');
      addAssistantMessage(ocrChoicesMessage(lang));
    } catch (err) {
      if (ocrCancelRef.current) return;
      setPhotoCameraVisible(false);
      addAssistantMessage(t(lang, 'ocrError'));
    } finally {
      setPhotoCameraReady(false);
      setCapturingPhoto(false);
      setMedicineLoading(false);
    }
  };

  const handleSend = async (profileOverride = null, messageOverride = null, silent = false, suppressMedicineSuggestions = false) => {
    const currentLang = lang;
    console.log('[Chatbot] lang at send time:', currentLang);
    const text = (typeof messageOverride === 'string' ? messageOverride : input).trim();
    if (!text || loading || medicineLoading) return;
    const profileForRequest = profileOverride ?? activeProfile;

    const userMsg = { role: 'user', content: text, timestamp: messageTimestamp(currentLang) };
    const updatedMessages = [...messages, userMsg];
    if (!silent) setMessages(updatedMessages);
    setInput('');
    setShowMedicineQuickReplies(false);
    setSymptomResults([]);
    setSymptomDbFilter(null);

    const emergency = checkEmergency(text, currentLang);
    if (emergency.isEmergency) {
      setMessages([...updatedMessages, {
        role: 'assistant',
        content: emergency.message,
        timestamp: messageTimestamp(currentLang),
      }]);
      return;
    }

    const medicineMatches = searchByName(text);
    const normalizedText = text.toLocaleLowerCase();
    const isHighConfidenceMatch = medicineMatches.length === 1
      && normalizedText.includes(String(medicineMatches[0].name || '').toLocaleLowerCase());
    if (!activeMedicine && isHighConfidenceMatch) {
      const medicine = normalizeMedicine(medicineMatches[0]);
      setActiveMedicine(medicine);
      setSymptomResults([]);
      setShowMedicineQuickReplies(true);
      setMessages([...updatedMessages, {
        role: 'assistant',
        content: medicineIdentificationMessage(currentLang, medicine),
        timestamp: messageTimestamp(currentLang),
      }]);
      return;
    }

    setLoadingStage('analyzing');
    setLoading(true);

    try {
      // Only send the last 10 messages to avoid token bloat
      const apiMessages = updatedMessages.slice(-10).map(m => ({
        role: m.role,
        content: m.llmContent ?? m.content,
      }));

      const result = await runTwoStagePipeline(
        apiMessages,
        currentLang,
        () => setLoadingStage('translating'),
        activeMedicine,
        buildProfileContext(profileForRequest)
      );

      if (result.isEmergency) {
        addAssistantMessage(EMERGENCY_MESSAGES[currentLang] ?? EMERGENCY_MESSAGES.en);
        return;
      }

      const reply = result.text;

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: reply,
        llmContent: result.englishText ?? reply,
        timestamp: messageTimestamp(currentLang),
      }]);
      requestEvidenceTag(silent ? messages.length : updatedMessages.length, result.englishText ?? reply);

      // Symptom-based DB search: parse medicine names from response text locally
      if (!suppressMedicineSuggestions) try {
        const responseText = (result.englishText ?? reply).toLowerCase();
        // Split response into candidate phrases (1 to 3 consecutive words)
        const words = responseText.match(/[a-z]+/g) ?? [];
        const candidates = new Set();
        for (let i = 0; i < words.length; i++) {
          candidates.add(words[i]);
          if (i + 1 < words.length) candidates.add(words[i] + ' ' + words[i + 1]);
          if (i + 2 < words.length) candidates.add(words[i] + ' ' + words[i + 1] + ' ' + words[i + 2]);
        }
        const hits = [];
        const seen = new Set();
        for (const phrase of candidates) {
          if (phrase.length < 9) continue;
          const results = searchByName(phrase);
          // Only accept strong matches (score 0 = name starts with phrase)
          const strong = results.filter(r => {
            const n = (r.name ?? '').toUpperCase();
            return n.startsWith(phrase.toUpperCase()) && n.length >= 9;
          });
          const maHits = strong.filter(r => r._db === 'MA').slice(0, 2);
          const ukHits = strong.filter(r => r._db === 'UK').slice(0, 2);
          for (const r of [...maHits, ...ukHits]) {
            const key = r.name + r.active_ingredient;
            if (!seen.has(key)) { seen.add(key); hits.push(r); }
          }
        }
        const safeHits = hits.filter(
          (medicine) => !medicineMatchesAllergy(medicine, profileForRequest?.allergies)
        );
        if (safeHits.length > 0) {
          setSymptomResults(safeHits.slice(0, 8));
          setSymptomDbFilter(currentLang === 'ar' ? 'MA' : 'UK');
        }
      } catch {}
    } catch (err) {
      const errMsg = err.name === 'AbortError'
        ? t(currentLang, 'networkError')
        : t(currentLang, 'serviceError');
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: errMsg,
        timestamp: messageTimestamp(currentLang),
      }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!awaitingSuitabilityScan || !activeMedicine) return undefined;

    const timeoutId = setTimeout(() => {
      setAwaitingSuitabilityScan(false);
      handleSend(null, t(lang, 'suitabilityQuestion')(activeMedicine.name), true);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [awaitingSuitabilityScan, activeMedicine]);

  const sendMessage = (messageText) => {
    const text = (typeof messageText === 'string' ? messageText : input).trim();
    if (!text || loading || medicineLoading) return;

    const effectiveProfile = activeProfile ?? (profiles.length === 1 ? profiles[0] : null);

    // Suitability trigger: must run before profile auto-select early return.
    const suitabilityKeywords = [
      'can i take', 'is it safe', 'safe for me', 'suitable for me',
      'should i take', 'is this ok', 'can i use', 'واش نقدر ناخد',
      'واش هاد الدواء مناسب', 'واش آمن', 'مناسب ليا',
    ];
    const lowerText = text.toLocaleLowerCase();
    const isSuitabilityQuery = suitabilityKeywords.some((keyword) => lowerText.includes(keyword));

    if (isSuitabilityQuery && effectiveProfile && !activeMedicine) {
      if (profiles.length === 1 && activeProfile === null) setActiveProfile(profiles[0]);
      setMessages((current) => [...current,
        { role: 'user', content: text, timestamp: messageTimestamp(lang) },
        { role: 'assistant', content: t(lang, 'suitabilityScanPrompt'), timestamp: messageTimestamp(lang) },
      ]);
      setInput('');
      setAwaitingSuitabilityScan(true);
      return;
    }

    handleSend(null, text);
  };

  // Resets everything that belongs to a single conversation and opens a fresh one
  // for the given profile. Does not change the active profile itself.
  function resetChatState(profileForNewChat) {
    chatProfileIdRef.current = profileForNewChat?.id ?? null;
    const now = new Date().toISOString();
    setActiveChatId(createChatId());
    setActiveCreatedAt(now);
    setMessages([{
      role: 'assistant',
      content: welcomeMessage(lang),
      timestamp: messageTimestamp(lang),
    }]);
    setInput('');
    setProfilePickerVisible(false);
    setPendingMessage(null);
    setAwaitingSuitabilityScan(false);
    setActiveMedicine(null);
    setShowMedicineQuickReplies(false);
    setOcrMedicineChoices([]);
    setOcrDbFilter(null);
    setSymptomResults([]);
    setSymptomDbFilter(null);
    setScanOptionsVisible(false);
    setBarcodeScannerVisible(false);
    setPhotoCameraVisible(false);
    setPhotoCameraReady(false);
    cancelMedicineLoading();
    setProfileMedicationMode(false);
    setPendingProfileMedication(null);
    setEvidenceTags({});
    setExpandedEvidenceIndex(null);
    evidenceRequestedRef.current = new Set();
    setSpeakingMessageIndex(null);
  }

  function startNewChat() {
    if (loading) return;
    // Keep the current profile when starting a new conversation.
    // User can change it manually via the profile button in the header.
    const profileForNewChat = profiles.length === 1 ? profiles[0] : activeProfile;
    resetChatState(profileForNewChat);
    if (profiles.length === 1) {
      setActiveProfile(profiles[0]);
    }
  }

  // Single entry point for changing profile from the picker (profile may be null = no profile).
  // If a conversation is in progress, it stays saved under the old profile and a fresh chat
  // is opened for the new one.
  function switchProfile(profile) {
    if (loading) return;
    const nextProfileId = profile?.id ?? null;
    const currentProfileId = activeProfile?.id ?? null;
    const conversationStarted = messages.some((m) => m.role === 'user');

    if (nextProfileId !== currentProfileId && conversationStarted) {
      resetChatState(profile);
    } else {
      chatProfileIdRef.current = nextProfileId;
    }
    setActiveProfile(profile);
    if (profile) {
      setLang(profile.preferredLang ?? 'en');
      AsyncStorage.setItem('@dawa/lastProfileId', profile.id).catch(() => {});
    }
    setProfilePickerVisible(false);
    setPendingMessage(null);
  }

  const openChat = (chat) => {
    if (loading) return;
    const restoredMessages = Array.isArray(chat.messages) ? [...chat.messages] : [];
    if (restoredMessages[0]?.role === 'assistant') {
      restoredMessages[0] = {
        ...restoredMessages[0],
        content: welcomeMessage(lang),
      };
    }
    setActiveChatId(chat.id);
    setActiveCreatedAt(chat.createdAt || new Date().toISOString());
    setMessages(restoredMessages);
    setInput('');
    setEvidenceTags({});
    setExpandedEvidenceIndex(null);
    evidenceRequestedRef.current = new Set();
    setSpeakingMessageIndex(null);
    const restoredMedicine = chat.activeMedicine ?? null;
    setActiveMedicine(restoredMedicine);
    setShowMedicineQuickReplies(restoredMedicine !== null);
    // History only lists the active profile's chats, so a chat without a stored profile
    // belongs to the active one.
    const chatProfile = chat.activeProfile ?? activeProfile ?? null;
    chatProfileIdRef.current = chatProfile?.id ?? null;
    setActiveProfile(chatProfile);
    setOcrMedicineChoices([]);
    setOcrDbFilter(null);
    setSymptomResults([]);
    setSymptomDbFilter(null);
    if (chat.lang && chat.lang !== lang) {
      previousLangRef.current = chat.lang;
      toggle();
    }
  };

  const deleteChat = (chatId) => {
    const next = chatHistory.filter((chat) => chat.id !== chatId);
    setChatHistory(next);
    storeChats(next, activeProfile?.id)
      .then(() => setHistoryStorageError(false))
      .catch(() => setHistoryStorageError(true));
    if (chatId === activeChatId) startNewChat();
  };

  const openSymptomLog = async () => {
    const [storedReminders, storedLog] = await Promise.all([loadReminders(), loadLog()]);
    setReportReminders(storedReminders);
    setReportAdherenceLog(storedLog);
    setSymptomLogVisible(true);
  };

  const askAboutReminders = async () => {
    const today = todayDateKey();
    const allReminders = await loadReminders();
    const profileFiltered = activeProfile?.id
      ? allReminders.filter((reminder) => {
          const ids = Array.isArray(reminder.profileIds) ? reminder.profileIds : (reminder.profileId ? [reminder.profileId] : []);
          return ids.includes(activeProfile.id);
        })
      : allReminders;
    const activeReminders = profileFiltered.filter((reminder) => isReminderActiveOnDate(reminder, today));
    const formatted = activeReminders.length > 0
      ? activeReminders.map((reminder) => {
          const dose = reminder.dose ? ` ${reminder.dose}` : '';
          return `- ${reminder.medicineName}${dose}, ${reminder.frequency || reminder.timesPerDay || 1}x/day`;
        }).join('\n')
      : lang === 'ar' ? '- ما كاين تا دواء' : '- No reminders for your profile';
    handleSend(null, lang === 'ar'
      ? `هاذي هي دوياتي:\n${formatted}\nواش تقدر تعطيني نصيحة كيفاش ندير معاهم؟`
      : `Here are my current reminders:\n${formatted}\nCan you give me advice on managing them?`, false, true);
  };

  const askDawaAboutMedicine = (medicine) => {
    const medicineName = String(medicine?.name || '').trim();
    if (!medicineName) return;
    setMedicineLibraryVisible(false);
    setTimeout(() => {
      handleSend(null, lang === 'ar'
        ? `حدثني على ${medicineName}: علاش كيتستعمل، الآثار الجانبية، وأشمن تحذيرات مهمة؟`
        : `Tell me about ${medicineName}: what is it used for, common side effects, and any important warnings?`, false, true);
    }, 250);
  };

  useEffect(() => {
    const initialMessage = route?.params?.initialMessage;
    if (!initialMessage || initialMessageHandledRef.current === initialMessage) return undefined;
    initialMessageHandledRef.current = initialMessage;
    const timeoutId = setTimeout(() => handleSend(null, initialMessage), 0);
    return () => clearTimeout(timeoutId);
  }, [route?.params?.initialMessage]);

  return (
    <View style={{ flex: 1 }}>
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <LinearGradient
        colors={['#0A2535', '#1E6090']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, isRTL && styles.rowReverse, { paddingTop: insets.top + 8 }]}
      >
        <TouchableOpacity
          style={styles.hamburgerButton}
          onPress={() => setSidebarVisible(true)}
          accessibilityLabel={lang === 'ar' ? 'فتح القائمة' : 'Open menu'}
        >
          <AppIcon name="menu-outline" size={24} color={colors.white} />
        </TouchableOpacity>
        <View style={[styles.headerIdentity, isRTL && styles.rowReverse]}>
          <View style={styles.headerIdentityText}>
            <Text numberOfLines={1} style={[styles.headerTitle, { textAlign: isRTL ? 'right' : 'left' }]}>{t(lang, 'appName')}</Text>
            <View style={[styles.headerStatusRow, isRTL && styles.rowReverse]}>
              <View style={styles.headerStatusDot} />
              <Text numberOfLines={1} style={[styles.headerSub, { textAlign: isRTL ? 'right' : 'left' }]}>{t(lang, 'medicalAssistant')}</Text>
            </View>
          </View>
        </View>
        <View style={[styles.headerRight, isRTL && styles.rowReverse]}>
          <TouchableOpacity
            style={[styles.langToggle, isRTL && styles.rowReverse, (loading || medicineLoading) && styles.headerButtonDisabled]}
            onPress={toggle}
            disabled={loading || medicineLoading}
            accessibilityLabel={t(lang, 'switchLanguageAccessibility')}
          >
            <AppIcon name="language-outline" size={15} color={colors.dawa} />
            <Text style={styles.langToggleText}>{t(lang, 'languageSwitchLabel')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.clearBtn, isRTL && styles.rowReverse, loading && styles.headerButtonDisabled]}
            onPress={startNewChat}
            disabled={loading}
            accessibilityLabel={t(lang, 'newChat')}
          >
            <AppIcon name="add-outline" size={16} color={colors.white} />
            <Text style={styles.clearBtnText}>{t(lang, 'newShort')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerProfileButton}
            onPress={() => {
              profiles.length > 0 ? setProfilePickerVisible(true) : setProfilesScreenVisible(true);
            }}
            accessibilityLabel={lang === 'ar' ? 'اختيار الملف الشخصي' : 'Choose profile'}
          >
            {activeProfile?.name ? (
              <Text style={styles.headerProfileText}>{activeProfile.name.slice(0, 1).toLocaleUpperCase()}</Text>
            ) : (
              <AppIcon name="person-outline" size={17} color={colors.white} />
            )}
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Disclaimer banner */}
      <TouchableOpacity
        style={[styles.disclaimer, isRTL && styles.rowReverse]}
        onPress={toggleDisclaimer}
        activeOpacity={0.82}
        accessibilityLabel={t(lang, 'disclaimerToggle')}
      >
        <View style={styles.disclaimerIcon}>
          <AppIcon name="information-circle-outline" size={18} color={colors.warning} />
        </View>
        <Animated.View style={[
          styles.disclaimerTextWrap,
          {
            height: disclaimerAnimation.interpolate({ inputRange: [0, 1], outputRange: [0, 42] }),
            opacity: disclaimerAnimation,
          },
        ]}>
          <Text style={[styles.disclaimerText, { textAlign: isRTL ? 'right' : 'left' }]}>
            {t(lang, 'disclaimer')}
          </Text>
        </Animated.View>
        <Animated.View style={{
          transform: [{
            rotate: disclaimerAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: ['-90deg', '0deg'],
            }),
          }],
        }}>
          <AppIcon name="chevron-down" size={16} color={colors.warning} />
        </Animated.View>
      </TouchableOpacity>

      {/* Messages */}
      <ScrollView
        ref={scrollRef}
        style={styles.messageList}
        contentContainerStyle={{ padding: 16, paddingBottom: 8, backgroundColor: '#F2F4F8' }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {messages.map((msg, i) => {
          if (i === 0 && msg.role === 'assistant') {
            return (
              <View key={i}>
                <FadeInMessage>
                  <LinearGradient
                    colors={[colors.dawaSoft, '#E8E2F8']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.heroCard}
                  >
                    <View style={styles.heroCardIcon}>
                      <AppIcon name="pulse-outline" size={22} color={colors.dawa} />
                    </View>
                    <Text style={styles.heroCardTitle}>
                      {t(lang, 'appName')}
                    </Text>
                    <Text style={[styles.heroCardText, { textAlign: isRTL ? 'right' : 'left' }]}>
                      {msg.content}
                    </Text>
                    {msg.timestamp && (
                      <Text style={[styles.timestamp, { textAlign: isRTL ? 'right' : 'left', marginTop: 6 }]}>
                        {msg.timestamp}
                      </Text>
                    )}
                  </LinearGradient>
                </FadeInMessage>
              </View>
            );
          }

          const isEmergencyMessage = Object.values(EMERGENCY_MESSAGES).includes(msg.content);
          const evidence = evidenceTags[i];
          const confidenceLabel = evidence
            ? (lang === 'ar'
              ? ({ high: 'ثقة عالية', medium: 'ثقة متوسطة', low: 'ثقة ضعيفة' }[evidence.confidence])
              : `${evidence.confidence.charAt(0).toUpperCase()}${evidence.confidence.slice(1)} confidence`)
            : '';
          const mentionsNhsGuidance = /\bnhs\b|\buk\b|united kingdom|uk guidance/i.test(
            String(msg.llmContent ?? msg.content ?? '')
          );
          return (
            <FadeInMessage
              key={i}
              style={[
                styles.bubbleWrap,
                msg.role === 'user'
                  ? (isRTL ? styles.bubbleWrapLeftRTL : styles.bubbleWrapRight)
                  : styles.bubbleWrapLeft,
              ]}
            >
              {msg.role === 'assistant' && (
                <LinearGradient
                  colors={[colors.dawa, '#9B72CF']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[styles.avatar, styles.avatarMessage]}
                >
                  <AppIcon name="pulse-outline" size={16} color="#ffffff" />
                </LinearGradient>
              )}
              <View style={styles.messageColumn}>
                <View
                  style={[
                    styles.bubble,
                    msg.role === 'user' ? styles.bubbleUser : styles.bubbleBot,
                    isEmergencyMessage && styles.emergencyBubble,
                  ]}
                >
                  {isEmergencyMessage ? (
                    <View style={styles.emergencyBubbleContent}>
                      <AppIcon name="warning" size={15} color={colors.danger} />
                      <Text
                        style={[
                          styles.bubbleText,
                          styles.emergencyText,
                          { textAlign: isRTL ? 'right' : 'left' },
                        ]}
                      >
                        {msg.content}
                      </Text>
                    </View>
                  ) : (
                    <Text
                      style={[
                        styles.bubbleText,
                        msg.role === 'user' ? styles.bubbleTextUser : styles.bubbleTextBot,
                        { textAlign: isRTL ? 'right' : 'left' },
                      ]}
                    >
                      {msg.content}
                    </Text>
                  )}
                </View>
                {msg.role === 'assistant' && (
                  <View style={[styles.evidenceRow, isRTL && styles.rowReverse]}>
                    <View style={[styles.evidencePill, mentionsNhsGuidance ? styles.evidenceSourceNhs : styles.evidenceSourceGeneral]}>
                      <Text style={[styles.evidencePillText, mentionsNhsGuidance ? styles.evidenceSourceNhsText : styles.evidenceSourceGeneralText]}>
                        {mentionsNhsGuidance ? t(lang, 'evidenceNhs') : t(lang, 'evidenceGeneral')}
                      </Text>
                    </View>
                    <View style={[styles.evidencePill, styles.evidenceAiPill]}>
                      <Text style={[styles.evidencePillText, styles.evidenceAiText]}>{t(lang, 'evidenceAiGenerated')}</Text>
                    </View>
                  </View>
                )}
                {msg.role === 'assistant' && (
                  <TouchableOpacity
                    style={[styles.speechButton, speakingMessageIndex === i && styles.speechButtonActive]}
                    onPress={() => toggleMessageSpeech(i, msg.content)}
                    activeOpacity={0.7}
                    accessibilityLabel={lang === 'ar' ? 'قرا الرسالة بصوت' : 'Read message aloud'}
                  >
                    <AppIcon
                      name={speakingMessageIndex === i ? 'volume-high' : 'volume-medium-outline'}
                      size={15}
                      color={speakingMessageIndex === i ? colors.dawa : colors.textMuted}
                    />
                  </TouchableOpacity>
                )}
                <Text style={[
                  styles.messageTimestamp,
                  msg.role === 'user' ? styles.messageTimestampUser : styles.messageTimestampBot,
                ]}>
                  {msg.timestamp || ''}
                </Text>
              </View>
            </FadeInMessage>
          );
        })}

        {ocrMedicineChoices.length > 0 && (() => {
          // Only apply the database filter if that database actually has results;
          // otherwise show everything (e.g. a Moroccan medicine while the app is in English).
          const effectiveOcrFilter = ocrDbFilter && ocrMedicineChoices.some(m => m._db === ocrDbFilter) ? ocrDbFilter : null;
          const filtered = ocrMedicineChoices.filter(m => effectiveOcrFilter === null || m._db === effectiveOcrFilter).slice(0, 10);
          const hasMA = ocrMedicineChoices.some(m => m._db === 'MA');
          const hasUK = ocrMedicineChoices.some(m => m._db === 'UK');
          return (
            <View style={[styles.ocrChoices, isRTL && styles.choiceContainerRTL]}>
              {(hasMA && hasUK) && (
                <View style={{ flexDirection: 'row', marginBottom: 8, gap: 8 }}>
                  <TouchableOpacity
                    style={[styles.quickReplyButton, effectiveOcrFilter === 'MA' && { backgroundColor: '#6B4EFF' }]}
                    onPress={() => setOcrDbFilter('MA')}
                  >
                    <Text style={[styles.quickReplyText, effectiveOcrFilter === 'MA' && { color: '#fff' }]}>🇲🇦 AMMPS</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.quickReplyButton, effectiveOcrFilter === 'UK' && { backgroundColor: '#6B4EFF' }]}
                    onPress={() => setOcrDbFilter('UK')}
                  >
                    <Text style={[styles.quickReplyText, effectiveOcrFilter === 'UK' && { color: '#fff' }]}>🇬🇧 NHS UK</Text>
                  </TouchableOpacity>
                </View>
              )}
              {filtered.map((medicine, index) => (
                <TouchableOpacity
                  key={`${medicine.name}-${medicine.active_ingredient}-${index}`}
                  style={styles.ocrChoiceButton}
                  onPress={() => identifyMedicine(medicine)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.ocrChoiceName, { textAlign: isRTL ? 'right' : 'left' }]}>
                    {medicine.name}
                  </Text>
                  {!!medicineChoiceDetail(medicine) && (
                    <Text style={[styles.ocrChoiceDetail, { textAlign: isRTL ? 'right' : 'left' }]}>
                      {medicineChoiceDetail(medicine)}
                      {isWithdrawnMedicine(medicine) ? (lang === 'ar' ? ' · مسحوب من السوق' : ' · withdrawn') : ''}
                    </Text>
                  )}
                  {medicineMatchesAllergy(medicine, activeProfile?.allergies) && (
                    <Text style={[styles.ocrChoiceAllergy, { textAlign: isRTL ? 'right' : 'left' }]}>
                      {lang === 'ar' ? '⚠️ فيه شي حاجة عندك منها الحساسية' : '⚠️ Matches an allergy in your profile'}
                    </Text>
                  )}
                  <Text style={[styles.ocrChoiceIngredient, { textAlign: isRTL ? 'right' : 'left' }]}>
                    {medicine.active_ingredient || t(lang, 'unknown')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          );
        })()}

        {symptomResults.length > 0 && !activeMedicine && (() => {
          // Same rule as the photo choices: ignore a database filter that would hide every result.
          const effectiveSymptomFilter = symptomDbFilter && symptomResults.some(m => m._db === symptomDbFilter) ? symptomDbFilter : null;
          const filtered = symptomResults.filter(m => effectiveSymptomFilter === null || m._db === effectiveSymptomFilter).slice(0, 5);
          const hasMA = symptomResults.some(m => m._db === 'MA');
          const hasUK = symptomResults.some(m => m._db === 'UK');
          return (
            <View style={[styles.ocrChoices, isRTL && styles.choiceContainerRTL]}>
              <Text style={[styles.ocrChoicesLabel, { textAlign: isRTL ? 'right' : 'left', marginBottom: 6 }]}>
                {lang === 'ar' ? '💊 أدوية من قاعدة البيانات' : '💊 Medicines from the database'}
              </Text>
              {(hasMA && hasUK) && (
                <View style={{ flexDirection: 'row', marginBottom: 8, gap: 8 }}>
                  <TouchableOpacity
                    style={[styles.quickReplyButton, symptomDbFilter === 'MA' && { backgroundColor: '#6B4EFF' }]}
                    onPress={() => setSymptomDbFilter('MA')}
                  >
                    <Text style={[styles.quickReplyText, symptomDbFilter === 'MA' && { color: '#fff' }]}>🇲🇦 Moroccan</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.quickReplyButton, symptomDbFilter === 'UK' && { backgroundColor: '#6B4EFF' }]}
                    onPress={() => setSymptomDbFilter('UK')}
                  >
                    <Text style={[styles.quickReplyText, symptomDbFilter === 'UK' && { color: '#fff' }]}>🇬🇧 NHS UK</Text>
                  </TouchableOpacity>
                </View>
              )}
              {filtered.map((medicine, index) => (
                <TouchableOpacity
                  key={`sym-${medicine.name}-${index}`}
                  style={styles.ocrChoiceButton}
                  onPress={() => {
                    setSymptomResults([]);
                    setSymptomDbFilter(null);
                    identifyMedicine(medicine);
                  }}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.ocrChoiceName, { textAlign: isRTL ? 'right' : 'left' }]}>{medicine.name}</Text>
                  {!!medicineChoiceDetail(medicine) && (
                    <Text style={[styles.ocrChoiceDetail, { textAlign: isRTL ? 'right' : 'left' }]}>
                      {medicineChoiceDetail(medicine)}
                    </Text>
                  )}
                  <Text style={[styles.ocrChoiceIngredient, { textAlign: isRTL ? 'right' : 'left' }]}>
                    {medicine.active_ingredient || medicine.activeIngredient || '-'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          );
        })()}

        {showOcrRetry && (
          <View style={[styles.quickReplies, isRTL && styles.choiceContainerRTL]}>
            <TouchableOpacity
              style={styles.quickReplyButton}
              onPress={() => {
                setShowOcrRetry(false);
                if (profileMedicationMode) openProfilePhotoCamera();
                else openPhotoCamera();
              }}
            >
              <Text style={styles.quickReplyText}>
                {lang === 'ar' ? 'عاود التصوير' : 'Try again'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {awaitingSuitabilityScan && !activeMedicine && (
          <View style={[styles.quickReplies, isRTL && styles.quickRepliesRTL]}>
            <TouchableOpacity
              style={styles.quickReplyButton}
              onPress={openBarcodeScanner}
              disabled={loading || medicineLoading}
              activeOpacity={0.75}
            >
              <Text style={styles.quickReplyText}>{t(lang, 'suitabilityScanButton')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickReplyButton}
              onPress={openPhotoCamera}
              disabled={loading || medicineLoading}
              activeOpacity={0.75}
            >
              <Text style={styles.quickReplyText}>{t(lang, 'suitabilityPhotoButton')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {showMedicineQuickReplies && activeMedicine && (
          <View style={[styles.quickReplies, isRTL && styles.quickRepliesRTL]}>
            {getQuickReplies(lang)
              .filter((reply, index) => activeMedicine.dosage || index !== 1)
              .map((reply) => (
                <TouchableOpacity
                  key={reply}
                  style={styles.quickReplyButton}
                  onPress={() => sendMessage(reply)}
                  disabled={loading || medicineLoading}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.quickReplyText, { textAlign: isRTL ? 'right' : 'left' }]}>{reply}</Text>
                </TouchableOpacity>
              ))}
            {!activeMedicine.dosage && (
              <Text style={[styles.dosageUnavailableNote, isRTL && styles.dosageUnavailableNoteRTL]}>
                {t(lang, 'dosageUnavailable')}
              </Text>
            )}
            {activeProfile && (
              <TouchableOpacity
                style={[styles.quickReplyButton, styles.suitabilityButton]}
                onPress={() => sendMessage(t(lang, 'suitabilityQuestion')(activeMedicine.name))}
                disabled={loading || medicineLoading}
                activeOpacity={0.75}
              >
                <Text style={[styles.quickReplyText, styles.suitabilityButtonText, { textAlign: isRTL ? 'right' : 'left' }]}>
                  {t(lang, 'suitabilityQuickReply')}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {showMedicineQuickReplies && activeMedicine && (
          <View style={[styles.medicineActions, isRTL && { flexDirection: 'row-reverse' }]}>
            <TouchableOpacity
              style={[styles.medicineActionBtn, isMedicineSaved(activeMedicine) && styles.medicineActionBtnSaved]}
              onPress={() => {
                if (isMedicineSaved(activeMedicine)) {
                  handleRemoveSavedMedicine(activeMedicine.name);
                } else {
                  handleSaveMedicine(activeMedicine);
                }
              }}
              activeOpacity={0.75}
            >
              <AppIcon
                name={isMedicineSaved(activeMedicine) ? 'bookmark' : 'bookmark-outline'}
                size={17}
                color={isMedicineSaved(activeMedicine) ? colors.dawa : colors.textMuted}
              />
              <Text style={[styles.medicineActionText, isMedicineSaved(activeMedicine) && { color: colors.dawa }]}>
                {isMedicineSaved(activeMedicine)
                  ? (lang === 'ar' ? 'محفوظ' : 'Saved')
                  : (lang === 'ar' ? 'احفظ الدواء' : 'Save medicine')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.medicineActionBtn}
              onPress={() => setRemindersVisible(true)}
              activeOpacity={0.75}
            >
              <AppIcon name="alarm-outline" size={17} color={colors.textMuted} />
              <Text style={styles.medicineActionText}>
                {lang === 'ar' ? 'تذكير' : 'Reminder'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {medicineLoading && (
          <View style={styles.bubbleWrapLeft}>
            <LinearGradient
              colors={[colors.dawa, '#9B72CF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatar}
            >
              <AppIcon name="scan-outline" size={16} color="#ffffff" />
            </LinearGradient>
            <View style={[styles.bubble, styles.bubbleBot, styles.typingBubble, styles.inlineLoadingBubble]}>
              <ActivityIndicator size="small" color={colors.dawa} />
              <Text style={[styles.bubbleTextBot, { textAlign: isRTL ? 'right' : 'left' }]}>{medicineLoadingText}</Text>
            </View>
          </View>
        )}

        {loading && (
          <View style={styles.bubbleWrapLeft}>
            <LinearGradient
              colors={[colors.dawa, '#9B72CF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatar}
            >
              <AppIcon name="pulse-outline" size={16} color="#ffffff" />
            </LinearGradient>
            <View style={[styles.bubble, styles.bubbleBot, styles.typingBubble]}>
              <TypingDots
                label={loadingStage === 'translating'
                  ? t(lang, 'translating')
                  : t(lang, 'analyzing')}
                isRTL={isRTL}
              />
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input bar */}
      <View style={styles.inputArea}>
        {profileRemindersCount > 0 && (
          <View style={[styles.inputQuickActions, isRTL && styles.rowReverse]}>
            <TouchableOpacity
              style={styles.remindersQuickAction}
              onPress={askAboutReminders}
              disabled={loading || medicineLoading}
              activeOpacity={0.75}
            >
              <Text style={styles.remindersQuickActionText}>{t(lang, 'myReminders')}</Text>
            </TouchableOpacity>
          </View>
        )}
      <View style={[styles.inputBar, isRTL && styles.rowReverse, { paddingBottom: insets.bottom + 8 }]}>
        <TouchableOpacity
          style={[styles.scanInputButton, (loading || medicineLoading) && styles.sendBtnDisabled]}
          onPress={() => setScanOptionsVisible(true)}
          disabled={loading || medicineLoading}
          activeOpacity={0.75}
          accessibilityLabel={t(lang, 'scanMedicineLabel')}
        >
          <AppIcon name="camera-outline" size={20} color={colors.dawa} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.scanInputButton, isRecording && styles.micRecordingButton, (loading || medicineLoading) && styles.sendBtnDisabled]}
          onPress={handleMicPress}
          disabled={loading || medicineLoading || isTranscribing}
          activeOpacity={0.75}
          accessibilityLabel={t(lang, 'voiceInputLabel')}
        >
          {isTranscribing
            ? <ActivityIndicator size="small" color={colors.dawa} />
            : <AppIcon name={isRecording ? 'stop-circle' : 'mic-outline'} size={20} color={isRecording ? colors.danger : colors.dawa} />}
        </TouchableOpacity>
        <TextInput
          style={[
            styles.input,
            inputFocused && styles.inputFocused,
            { textAlign: isRTL ? 'right' : 'left' },
          ]}
          value={input}
          onChangeText={setInput}
          onFocus={() => setInputFocused(true)}
          onBlur={() => setInputFocused(false)}
          placeholder={t(lang, 'inputPlaceholder')}
          placeholderTextColor="#aaa"
          multiline
          maxLength={500}
          onSubmitEditing={() => sendMessage()}
          returnKeyType="send"
        />
        <TouchableOpacity
          onPress={() => sendMessage()}
          activeOpacity={0.8}
          disabled={!input.trim() || loading || medicineLoading}
          accessibilityLabel={t(lang, 'sendMessage')}
        >
          <LinearGradient
            colors={[colors.dawa, '#4A2F8A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.sendBtn, (!input.trim() || loading || medicineLoading) && styles.sendBtnDisabled]}
          >
            <AppIcon name={isRTL ? 'arrow-back' : 'arrow-up'} size={21} color={colors.white} />
          </LinearGradient>
        </TouchableOpacity>
      </View>
      </View>

      <Modal
        visible={scanOptionsVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setScanOptionsVisible(false)}
      >
        <View style={styles.scanOptionsOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFillObject}
            activeOpacity={1}
            onPress={() => setScanOptionsVisible(false)}
          />
          <View style={[styles.scanOptionsCard, { paddingBottom: insets.bottom + spacing.lg }]}>
            <View style={styles.scanOptionsHandle} />
            <Text style={[styles.scanOptionsTitle, { textAlign: isRTL ? 'right' : 'left' }]}>
              {t(lang, 'scanOptionsTitle')}
            </Text>
            <TouchableOpacity style={[styles.scanOptionButton, isRTL && styles.rowReverse]} onPress={openBarcodeScanner} activeOpacity={0.75}>
              <View style={styles.scanOptionIcon}>
                <AppIcon name="barcode-outline" size={22} color={colors.dawa} />
              </View>
              <Text style={[styles.scanOptionText, { textAlign: isRTL ? 'right' : 'left' }]}>
                {t(lang, 'scanBarcodeOption')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.scanOptionButton, isRTL && styles.rowReverse]} onPress={openPhotoCamera} activeOpacity={0.75}>
              <View style={styles.scanOptionIcon}>
                <AppIcon name="camera-outline" size={22} color={colors.dawa} />
              </View>
              <Text style={[styles.scanOptionText, { textAlign: isRTL ? 'right' : 'left' }]}>
                {t(lang, 'takePhotoPackaging')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={profilePickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setProfilePickerVisible(false)}
      >
        <View style={styles.pickerBackdrop}>
          <View style={styles.pickerCard}>
            <Text style={styles.pickerTitle}>
              {lang === 'ar' ? 'من هو اللي كيستعمل التطبيق؟' : 'Who is using the app?'}
            </Text>
            {profiles.map((profile, index) => (
              <TouchableOpacity
                key={profile.id}
                style={[styles.pickerOption, isRTL && styles.rowReverse, loading && styles.pickerOptionDisabled]}
                disabled={loading}
                onPress={() => switchProfile(profile)}
                activeOpacity={0.75}
              >
                <AppIcon name="person-circle-outline" size={20} color={colors.dawa} />
                <Text style={[styles.pickerOptionText, { textAlign: isRTL ? 'right' : 'left' }]}>
                  {profile.name || (lang === 'ar' ? `ملف ${index + 1}` : `Profile ${index + 1}`)}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.pickerOption, styles.pickerSkip, loading && styles.pickerOptionDisabled]}
              disabled={loading}
              onPress={() => switchProfile(null)}
              activeOpacity={0.75}
            >
              <Text style={styles.pickerSkipText}>
                {lang === 'ar' ? 'بدون ملف شخصي' : 'Continue without profile'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ProfilesScreen
        visible={profilesScreenVisible}
        onClose={() => setProfilesScreenVisible(false)}
        profiles={profiles}
        onSaveProfiles={handleSaveProfiles}
        lang={lang}
        onAddMedicationByScan={openProfileBarcodeScanner}
        onAddMedicationByPhoto={openProfilePhotoCamera}
        pendingMedication={pendingProfileMedication}
        onPendingMedicationConsumed={() => setPendingProfileMedication(null)}
      />

      <MedicineLibraryScreen
        visible={medicineLibraryVisible}
        onClose={() => setMedicineLibraryVisible(false)}
        lang={lang}
        savedMedicines={savedMedicines}
        onLoadMedicine={handleLoadMedicineFromLibrary}
        onAskDawa={askDawaAboutMedicine}
        onRemoveMedicine={handleRemoveSavedMedicine}
      />

      <SymptomLogScreen
        visible={symptomLogVisible}
        onClose={() => setSymptomLogVisible(false)}
        chatHistory={chatHistory}
        profiles={profiles}
        lang={lang}
        activeProfileId={activeProfile?.id ?? null}
        reminders={reportReminders}
        adherenceLog={reportAdherenceLog}
        onOpenReminders={() => {
          setSymptomLogVisible(false);
          setRemindersVisible(true);
        }}
      />

      <SelfCareScreen
        visible={selfCareVisible}
        onClose={() => setSelfCareVisible(false)}
      />

      <SidebarDrawer
        visible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
        onNewChat={() => { startNewChat(); setSidebarVisible(false); }}
        onOpenChat={(chat) => { openChat(chat); setSidebarVisible(false); }}
        onDeleteChat={deleteChat}
        chatHistory={chatHistory}
        activeChatId={activeChatId}
        loading={loading}
        lang={lang}
        profiles={profiles}
        activeProfile={activeProfile}
        onOpenProfiles={() => setProfilesScreenVisible(true)}
        onOpenMedicineLibrary={() => setMedicineLibraryVisible(true)}
        onOpenSymptomLog={openSymptomLog}
        onOpenReminders={() => setRemindersVisible(true)}
        onOpenSelfCare={() => setSelfCareVisible(true)}
        savedMedicinesCount={savedMedicines.length}
        historyStorageError={historyStorageError}
      />
    </KeyboardAvoidingView>

    <RemindersScreen
      visible={remindersVisible}
      onClose={() => setRemindersVisible(false)}
      lang={lang}
      initialMedicineName={activeMedicine?.name ?? ''}
      profileId={activeProfile?.id ?? null}
      profiles={profiles}
    />

    {barcodeScannerVisible && (
      <View style={{ position: 'absolute', top: 0, left: 0, width: SCREEN_WIDTH, height: SCREEN_HEIGHT, zIndex: 999 }}>
        <CameraView
          style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8'] }}
          onBarcodeScanned={handleBarcodeScan}
          onMountError={(error) => {
            console.error('Camera mount error:', error);
            closeBarcodeScanner();
            addAssistantMessage(t(lang, 'cameraError'));
          }}
        />
        <Text style={[styles.barcodeInstruction, { bottom: insets.bottom + 92 }]}>
          {t(lang, 'scanBarcodeInstruction')}
        </Text>
        <TouchableOpacity
          style={[styles.cancelBarcodeButton, { bottom: insets.bottom + 28 }]}
          onPress={closeBarcodeScanner}
          activeOpacity={0.8}
        >
          <Text style={styles.cancelBarcodeText}>{t(lang, 'cancelScan')}</Text>
        </TouchableOpacity>
      </View>
    )}

    {photoCameraVisible && (
      <View style={{ position: 'absolute', top: 0, left: 0, width: SCREEN_WIDTH, height: SCREEN_HEIGHT, zIndex: 999 }}>
        <CameraView
          ref={photoCameraRef}
          style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}
          facing="back"
          mode="picture"
          onCameraReady={() => setPhotoCameraReady(true)}
          onMountError={(error) => {
            console.error('Camera mount error:', error);
            setCapturingPhoto(false);
            closePhotoCamera();
            addAssistantMessage(t(lang, 'cameraError'));
          }}
        />
        <TouchableOpacity
          style={[
            styles.closePhotoCameraButton,
            isRTL ? styles.closePhotoCameraButtonRTL : styles.closePhotoCameraButtonLTR,
            { top: insets.top + 14 },
          ]}
          onPress={closePhotoCamera}
          disabled={capturingPhoto}
          activeOpacity={0.8}
          accessibilityLabel={t(lang, 'closeCamera')}
        >
          <AppIcon name="close" size={25} color={colors.white} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.photoCaptureButton,
            { bottom: insets.bottom + 28 },
            (!photoCameraReady || capturingPhoto) && styles.photoCaptureButtonDisabled,
          ]}
          onPress={capturePackagingPhoto}
          disabled={!photoCameraReady || capturingPhoto}
          activeOpacity={0.8}
          accessibilityLabel={t(lang, 'takePhoto')}
        >
          {capturingPhoto
            ? <ActivityIndicator size="small" color={colors.primary} />
            : <View style={styles.photoCaptureButtonInner} />}
        </TouchableOpacity>
      </View>
    )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.canvas },
  rowReverse: { flexDirection: 'row-reverse' },

  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  headerIdentity: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  headerIdentityText: { flex: 1, minWidth: 0 },
  headerIcon: { width: 44, height: 44, borderRadius: 15, backgroundColor: colors.dawa, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  headerTitle: { color: colors.white, fontSize: 22, fontWeight: '900', letterSpacing: -0.3 },
  headerStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  headerStatusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#78D7AD' },
  headerSub:   { color: 'rgba(255,255,255,0.72)', fontSize: 12, fontWeight: '600' },
  headerRight: { flexShrink: 0, flexDirection: 'row', gap: 6, alignItems: 'center' },
  headerIconButton: { width: 32, height: 32, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.13)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.11)' },
  headerProfileButton: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.13)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  headerProfileText: { color: colors.white, fontSize: 13, fontWeight: '800' },
  hamburgerButton: { padding: 8, marginRight: 4 },
  headerButtonDisabled: { opacity: 0.45 },
  clearBtn:    { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: 'rgba(255,255,255,0.13)', borderRadius: radii.pill, paddingHorizontal: 11, paddingVertical: 7, borderWidth: 1, borderColor: 'rgba(255,255,255,0.11)' },
  clearBtnText:{ color: '#fff', fontSize: 13, fontWeight: '700' },
  langToggle:  { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: colors.white, borderRadius: radii.pill, paddingHorizontal: 11, paddingVertical: 7, ...shadows.card },
  langToggleText: { color: colors.dawa, fontSize: 13, fontWeight: '800' },

  disclaimer: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.warningSoft, margin: spacing.md, marginBottom: 0, paddingHorizontal: spacing.md, paddingVertical: 9, borderRadius: radii.sm, borderWidth: 1, borderColor: '#F0DDAE', overflow: 'hidden' },
  disclaimerIcon: { width: 28, height: 28, borderRadius: 9, backgroundColor: 'rgba(255,255,255,0.62)', alignItems: 'center', justifyContent: 'center' },
  disclaimerTextWrap: { flex: 1, justifyContent: 'center', overflow: 'hidden' },
  disclaimerText: { ...type.caption, color: colors.warning },

  messageList: { flex: 1, backgroundColor: '#F2F4F8' },

  heroCard: { borderRadius: radii.lg, padding: spacing.xl, marginBottom: 16, alignItems: 'center', borderWidth: 1, borderColor: '#D8CDEA', ...shadows.card },
  heroCardIcon: { width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(255,255,255,0.7)', alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md, ...shadows.card },
  heroCardTitle: { fontSize: 20, fontWeight: '900', color: colors.dawa, letterSpacing: -0.3, marginBottom: 6 },
  heroCardText: { ...type.body, color: colors.text, textAlign: 'center' },
  timestamp: { color: colors.textSubtle, fontSize: 10 },

  bubbleWrap:        { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 12 },
  bubbleWrapLeft:    { justifyContent: 'flex-start' },
  bubbleWrapRight:   { justifyContent: 'flex-end' },
  bubbleWrapLeftRTL: { justifyContent: 'flex-end' },

  avatar:     { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginRight: spacing.sm },
  avatarMessage: { marginBottom: 15 },
  messageColumn: { maxWidth: '80%' },

  bubble:        { borderRadius: radii.md, paddingHorizontal: 15, paddingVertical: 11 },
  bubbleBot:     { backgroundColor: BOT_BG, borderWidth: 1, borderColor: colors.border, borderLeftWidth: 3, borderLeftColor: colors.dawa, borderTopLeftRadius: radii.md, borderBottomLeftRadius: 5, ...shadows.card },
  bubbleUser:    { backgroundColor: USER_BG, borderBottomRightRadius: 5, shadowColor: colors.dawa, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.15, shadowRadius: 7, elevation: 3 },
  typingBubble:  { paddingVertical: 14, paddingHorizontal: 20 },
  typingContent: { alignItems: 'flex-start' },
  typingDotsRow: { flexDirection: 'row', alignItems: 'center', gap: 5, height: 18, paddingTop: 5 },
  typingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.dawa },
  typingCaption: { ...type.caption, color: colors.textSubtle, fontSize: 10, marginTop: 5 },

  bubbleText:     { ...type.body },
  bubbleTextBot:  { color: colors.text },
  bubbleTextUser: { color: '#ffffff' },
  messageTimestamp: { color: colors.textSubtle, fontSize: 10, marginTop: 4 },
  messageTimestampBot: { alignSelf: 'flex-start', textAlign: 'left' },
  messageTimestampUser: { alignSelf: 'flex-end', textAlign: 'right' },
  speechButton: { alignSelf: 'flex-start', width: 28, height: 28, marginTop: 3, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceMuted },
  speechButtonActive: { backgroundColor: colors.dawaSoft, opacity: 1 },
  evidenceRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6, marginTop: 6 },
  evidencePill: { borderRadius: 12, paddingVertical: 4, paddingHorizontal: 10 },
  evidencePillText: { fontSize: 11, fontWeight: '700' },
  evidenceSourceNhs: { backgroundColor: '#E8F1FF' },
  evidenceSourceNhsText: { color: '#2563EB' },
  evidenceSourceGeneral: { backgroundColor: colors.surfaceMuted },
  evidenceSourceGeneralText: { color: colors.textMuted },
  evidenceAiPill: { backgroundColor: colors.surfaceMuted },
  evidenceAiText: { color: colors.textMuted, fontWeight: '600' },
  evidenceChip: { alignSelf: 'flex-start', maxWidth: '100%', marginTop: 5, flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: radii.pill, paddingHorizontal: 8, paddingVertical: 4, backgroundColor: colors.surfaceMuted },
  evidenceChipLow: { backgroundColor: colors.warningSoft },
  evidenceChipText: { flexShrink: 1, fontSize: 10, fontWeight: '700', color: colors.textMuted },
  evidenceChipTextLow: { color: colors.warning },
  evidencePanel: { marginTop: 4, padding: spacing.sm, borderRadius: radii.sm, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  evidencePanelLow: { borderColor: '#F0DDAE', backgroundColor: colors.warningSoft },
  evidenceConfidence: { ...type.caption, color: colors.text, marginBottom: 5 },
  evidenceSources: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  evidenceSourcePill: { fontSize: 9, fontWeight: '700', color: colors.dawa, backgroundColor: colors.dawaSoft, borderRadius: radii.pill, paddingHorizontal: 7, paddingVertical: 3 },
  emergencyBubble: { backgroundColor: colors.dangerSoft, borderColor: colors.danger, borderWidth: 1.5 },
  emergencyBubbleContent: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, flexShrink: 1, width: '100%' },
  emergencyText: { flexShrink: 1, color: colors.danger },
  ocrChoices: { marginLeft: 42, marginBottom: spacing.md, gap: spacing.sm },
  choiceContainerRTL: { marginLeft: 0, marginRight: 42 },
  ocrChoicesLabel: { fontSize: 12, fontWeight: '700', color: colors.textMuted },
  ocrChoiceButton: { backgroundColor: colors.surface, borderRadius: radii.md, borderWidth: 1, borderColor: '#D8CDEA', paddingHorizontal: spacing.md, paddingVertical: 11, ...shadows.card },
  ocrChoiceName: { ...type.bodyStrong, color: colors.text },
  ocrChoiceDetail: { ...type.caption, color: colors.text, marginTop: 3 },
  ocrChoiceAllergy: { ...type.caption, color: '#B42318', fontWeight: '700', marginTop: 3 },
  ocrChoiceIngredient: { ...type.caption, color: colors.textMuted, marginTop: 3 },
  quickReplies: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginLeft: 42, marginBottom: spacing.md },
  quickRepliesRTL: { flexDirection: 'row-reverse', marginLeft: 0, marginRight: 42 },
  quickReplyButton: { backgroundColor: colors.dawaSoft, borderRadius: radii.pill, borderWidth: 1, borderColor: '#D8CDEA', paddingHorizontal: 13, paddingVertical: 9 },
  quickReplyText: { ...type.caption, color: colors.dawa, fontWeight: '700' },
  medicineActions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginLeft: 42, marginBottom: spacing.md },
  medicineActionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.surface, borderRadius: radii.pill, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 14, paddingVertical: 9 },
  medicineActionBtnSaved: { backgroundColor: colors.dawaSoft, borderColor: '#D8CDEA' },
  medicineActionText: { ...type.caption, color: colors.textMuted, fontWeight: '600' },
  suitabilityButton: { backgroundColor: '#FFF4E5', borderColor: '#F0A500' },
  suitabilityButtonText: { color: '#B07000' },
  dosageUnavailableNote: { fontSize: 11, color: colors.textMuted, fontStyle: 'italic', marginLeft: 42, marginBottom: 8, width: '100%' },
  dosageUnavailableNoteRTL: { marginLeft: 0, textAlign: 'right' },
  inlineLoadingBubble: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },

  inputArea: { backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border },
  inputQuickActions: { flexDirection: 'row', paddingHorizontal: spacing.md, paddingTop: spacing.sm },
  remindersQuickAction: { alignSelf: 'flex-start', backgroundColor: colors.dawaSoft, borderRadius: radii.pill, borderWidth: 1, borderColor: '#D8CDEA', paddingHorizontal: 12, paddingVertical: 6 },
  remindersQuickActionText: { ...type.caption, color: colors.dawa, fontWeight: '700' },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    backgroundColor: colors.surface,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 8,
  },
  scanInputButton: { width: 42, height: 42, marginBottom: 2, borderRadius: 14, backgroundColor: colors.dawaSoft, borderWidth: 1, borderColor: '#D8CDEA', alignItems: 'center', justifyContent: 'center' },
  micRecordingButton: { backgroundColor: '#FFE8E8', borderColor: colors.danger },
  input: {
    flex: 1,
    backgroundColor: colors.canvas,
    borderRadius: radii.pill,
    paddingHorizontal: 16,
    paddingVertical: 8,
    ...type.body,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputFocused: { borderColor: colors.dawa },
  sendBtn:         { width: 46, height: 46, borderRadius: 16, alignItems: 'center', justifyContent: 'center', shadowColor: colors.dawa, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  sendBtnDisabled: { opacity: 0.5, shadowOpacity: 0 },

  scanOptionsOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(9,28,39,0.42)' },
  scanOptionsCard: { backgroundColor: colors.surface, borderTopLeftRadius: radii.lg, borderTopRightRadius: radii.lg, paddingHorizontal: spacing.lg, paddingTop: spacing.md, ...shadows.raised },
  scanOptionsHandle: { alignSelf: 'center', width: 42, height: 5, borderRadius: 3, backgroundColor: colors.border, marginBottom: spacing.lg },
  scanOptionsTitle: { ...type.heading, color: colors.text, marginBottom: spacing.md },
  scanOptionButton: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, marginBottom: spacing.sm, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.canvas },
  scanOptionIcon: { width: 42, height: 42, borderRadius: 13, backgroundColor: colors.dawaSoft, alignItems: 'center', justifyContent: 'center' },
  scanOptionText: { ...type.bodyStrong, color: colors.text, flex: 1 },

  barcodeScannerContainer: { flex: 1, backgroundColor: '#000' },
  barcodeShadeTop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.62)' },
  barcodeMiddleRow: { flexDirection: 'row', height: 260 },
  barcodeShadeSide: { flex: 1, backgroundColor: 'rgba(0,0,0,0.62)' },
  barcodeWindow: { width: 300, height: 260, borderWidth: 3, borderColor: colors.scanner, borderRadius: radii.md },
  barcodeShadeBottom: { flex: 1.25, backgroundColor: 'rgba(0,0,0,0.62)' },
  barcodeInstruction: { position: 'absolute', alignSelf: 'center', color: colors.white, fontSize: 15, fontWeight: '700', textAlign: 'center', backgroundColor: 'rgba(0,0,0,0.54)', paddingHorizontal: spacing.lg, paddingVertical: 10, borderRadius: radii.pill, overflow: 'hidden' },
  cancelBarcodeButton: { position: 'absolute', alignSelf: 'center', backgroundColor: colors.white, borderRadius: radii.pill, paddingHorizontal: spacing.xl, paddingVertical: 12, ...shadows.raised },
  cancelBarcodeText: { ...type.bodyStrong, color: colors.danger },

  photoCameraContainer: { flex: 1, backgroundColor: '#000' },
  photoFrameGuide: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  photoFrameGuideInner: { width: '82%', height: '48%', borderWidth: 2, borderColor: 'rgba(255,255,255,0.82)', borderRadius: radii.md, backgroundColor: 'transparent' },
  closePhotoCameraButton: { position: 'absolute', width: 46, height: 46, borderRadius: 23, backgroundColor: 'rgba(0,0,0,0.52)', alignItems: 'center', justifyContent: 'center' },
  closePhotoCameraButtonLTR: { left: spacing.lg },
  closePhotoCameraButtonRTL: { right: spacing.lg },
  photoCaptureButton: { position: 'absolute', alignSelf: 'center', width: 82, height: 82, borderRadius: 41, backgroundColor: colors.white, borderWidth: 5, borderColor: 'rgba(255,255,255,0.55)', alignItems: 'center', justifyContent: 'center', ...shadows.raised },
  photoCaptureButtonInner: { width: 62, height: 62, borderRadius: 31, backgroundColor: colors.white, borderWidth: 2, borderColor: colors.primary },
  photoCaptureButtonDisabled: { opacity: 0.55 },

  pickerBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  pickerCard: { backgroundColor: colors.white, borderRadius: radii.lg, padding: spacing.lg, width: '100%', maxWidth: 340 },
  pickerTitle: { ...type.bodyStrong, color: colors.text, marginBottom: spacing.md, textAlign: 'center' },
  pickerOption: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
  pickerOptionText: { flex: 1, ...type.body, color: colors.text },
  pickerOptionDisabled: { opacity: 0.4 },
  pickerSkip: { borderBottomWidth: 0, justifyContent: 'center', marginTop: spacing.sm },
  pickerSkipText: { ...type.caption, color: colors.textMuted, textAlign: 'center' },

});
