import { useEffect, useRef, useState } from 'react';
import {
  Modal,
  SafeAreaView,
  Share,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AppIcon from '../components/AppIcon';
import * as Speech from 'expo-speech';
import { colors, radii, spacing, type } from '../theme/theme';
import { loadFollowUps, saveFollowUp } from '../utils/followUpLog';
import { isDoseMissed, isDoseTaken, last7Days } from '../utils/adherenceLog';
import { isReminderActiveOnDate, loadReminders, todayDateKey } from '../utils/reminders';

const COPY = {
  en: {
    title: 'Symptom Log',
    subtitle: 'Your health conversations, as a timeline',
    chooseProfile: 'Choose a profile',
    noChats: 'No conversations yet',
    noChatsHint: 'Start a chat with Dawa and it will appear here as your health diary.',
    general: 'General',
    close: 'Close',
    back: 'Back',
    messages: (n) => `${n} message${n !== 1 ? 's' : ''}`,
    summarising: 'Summarising…',
    symptom: 'Symptom',
    recommended: 'Recommended',
    medicineChosen: 'Medicine chosen',
    notes: 'Notes',
    feelingNow: 'How are you feeling now?',
    better: 'Better 😊',
    same: 'Same 😐',
    worse: 'Worse 😟',
    reportedFollowUp: (reported, followed) => `Reported ${reported} → Follow-up ${followed}:`,
    share: 'Share consultation',
    generateReport: "Generate doctor's report",
    profileDetails: 'Profile details',
    conversations: 'Symptoms and consultations',
    activeReminders: 'Active reminders',
    adherence: 'Last 7-day adherence',
    profile: 'Profile',
    date: 'Date',
    severity: 'Severity',
    age: 'Age',
    sex: 'Sex',
    conditions: 'Conditions',
    regularMedicines: 'Regular medicines',
    allergies: 'Allergies',
    pregnancyStatus: 'Pregnancy status',
    weight: 'Weight',
    adverseReactions: 'Past adverse reactions',
    followUp: 'Follow-up',
    none: 'None recorded',
    noSummary: 'Summary unavailable',
    takenCount: 'taken',
    skippedCount: 'skipped',
    reminders: 'Reminders',
    nextDose: 'Next dose',
    today: 'Today',
    tomorrow: 'Tomorrow',
    reminderFrequency: (count) => count === 1 ? 'Once daily' : `${count}× daily`,
  },
  ar: {
    title: 'سجل الأعراض',
    subtitle: 'محادثاتك الصحية كجدول زمني',
    chooseProfile: 'اختار البروفيل',
    noChats: 'ما كاين تا محادثة',
    noChatsHint: 'بدا محادثة مع دواك وغادي تبان هنا كسجل صحي.',
    general: 'عام',
    close: 'سد',
    back: 'رجوع',
    messages: (n) => `${n} رسالة`,
    summarising: 'جاري التلخيص…',
    symptom: 'الأعراض',
    recommended: 'التوصية',
    medicineChosen: 'الدواء المختار',
    notes: 'ملاحظات',
    feelingNow: 'كيفاش حاس دابا؟',
    better: 'حسن 😊',
    same: 'كيف كيف 😐',
    worse: 'خايب أكثر 😟',
    reportedFollowUp: (reported, followed) => `تسجل ${reported} ← المتابعة ${followed}:`,
    share: 'شارك الاستشارة',
    generateReport: 'وجد تقرير للطبيب',
    profileDetails: 'معلومات البروفيل',
    conversations: 'الأعراض والاستشارات',
    activeReminders: 'تذكيرات الدواء الحالية',
    adherence: 'الالتزام فالـ7 أيام الأخيرة',
    profile: 'البروفيل',
    date: 'التاريخ',
    severity: 'الخطورة',
    age: 'العمر',
    sex: 'الجنس',
    conditions: 'الأمراض',
    regularMedicines: 'الأدوية المعتادة',
    allergies: 'الحساسيات',
    pregnancyStatus: 'حالة الحمل',
    weight: 'الوزن',
    adverseReactions: 'تفاعلات خايبة سابقة',
    followUp: 'المتابعة',
    none: 'ما تسجل والو',
    noSummary: 'الملخص غير متوفر',
    takenCount: 'مأخوذة',
    skippedCount: 'متفوتة',
    reminders: 'التذكيرات',
    nextDose: 'الجرعة الجاية',
    today: 'اليوم',
    tomorrow: 'غدا',
    reminderFrequency: (count) => count === 1 ? 'مرة فالنهار' : `${count} مرات فالنهار`,
  },
};

const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY;
const SUMMARY_SYSTEM_PROMPT = 'You are a medical conversation analyser. Extract key information from a patient-AI chat and respond ONLY with valid JSON, no extra text.';
const SUMMARY_USER_PROMPT = 'Analyse this medical conversation and return JSON in exactly this format: {"severity": "mild|moderate|severe|unknown", "symptom": "short description of what the user complained about (max 6 words)", "recommended": "one short sentence of what was generally recommended to the user (advice + medicine if any, max 12 words)", "medicineChosen": "full name of the medicine the user selected or asked about specifically, or null"}';
const DETAIL_SUMMARY_USER_PROMPT = 'Analyse this medical conversation and return JSON: {"severity": "mild|moderate|severe|unknown", "symptom": "what the user described in 1-2 sentences", "recommended": "what was generally recommended in 2-3 sentences covering advice and medicines", "medicineChosen": "full name of the medicine chosen or null", "notes": "any important warnings or follow-up advice mentioned, or null"}';

const SEVERITY_STYLES = {
  mild: { backgroundColor: '#22c55e22', color: '#16a34a' },
  moderate: { backgroundColor: '#f59e0b22', color: '#b45309' },
  severe: { backgroundColor: '#ef444422', color: '#dc2626' },
};

async function generateChatSummary(messages, userPrompt = SUMMARY_USER_PROMPT) {
  if (!GROQ_API_KEY) return null;

  const conversation = messages
    .filter((message) => message?.role && typeof message.content === 'string' && message.content.trim())
    .map((message) => ({ role: message.role, content: message.content.trim() }));

  if (!conversation.length) return null;

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'openai/gpt-oss-120b',
      messages: [
        { role: 'system', content: SUMMARY_SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
        ...conversation,
      ],
      temperature: 0.2,
    }),
  });

  if (!response.ok) throw new Error(`Groq summary request failed: ${response.status}`);

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) return null;

  const parsed = JSON.parse(content);
  if (!parsed || Array.isArray(parsed) || typeof parsed.symptom !== 'string' || !parsed.symptom.trim()) {
    return null;
  }

  return {
    severity: SEVERITY_STYLES[parsed.severity] ? parsed.severity : 'unknown',
    symptom: parsed.symptom.trim(),
    recommended: typeof parsed.recommended === 'string' && parsed.recommended.trim()
      ? parsed.recommended.trim()
      : null,
    medicineChosen: typeof parsed.medicineChosen === 'string' && parsed.medicineChosen.trim()
      ? parsed.medicineChosen.trim()
      : null,
    notes: typeof parsed.notes === 'string' && parsed.notes.trim() ? parsed.notes.trim() : null,
  };
}

function buildTimelineGroups(chats, reminders, isRTL) {
  const entries = [];
  for (const chat of chats) {
    const userMsgs = (chat.messages || []).filter((m) => m.role === 'user');
    if (!userMsgs.length) continue;
    const date = new Date(chat.updatedAt || chat.createdAt);
    if (!Number.isNaN(date.getTime())) entries.push({ type: 'chat', chat, date });
  }

  for (const reminder of reminders) {
    const rawDate = reminder.startDate || reminder.createdAt;
    const date = /^\d{4}-\d{2}-\d{2}$/.test(String(rawDate || ''))
      ? new Date(`${rawDate}T12:00:00`)
      : new Date(rawDate);
    if (!Number.isNaN(date.getTime())) entries.push({ type: 'reminder', reminder, date });
  }

  entries.sort((a, b) => b.date.getTime() - a.date.getTime());
  const groups = new Map();
  for (const entry of entries) {
    const dateKey = `${entry.date.getFullYear()}-${String(entry.date.getMonth() + 1).padStart(2, '0')}-${String(entry.date.getDate()).padStart(2, '0')}`;
    if (!groups.has(dateKey)) {
      groups.set(dateKey, {
        key: dateKey,
        label: entry.date.toLocaleDateString(isRTL ? 'ar-MA' : 'en-GB', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
        entries: [],
      });
    }
    groups.get(dateKey).entries.push(entry);
  }
  return Array.from(groups.values());
}

function ProfileCard({ profile, chatCount, onPress, isRTL }) {
  const initials = (profile.name || '?').slice(0, 2).toUpperCase();
  return (
    <TouchableOpacity style={[styles.profileCard, isRTL && styles.rowReverse]} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>
      <View style={styles.profileInfo}>
        <Text style={[styles.profileName, { textAlign: isRTL ? 'right' : 'left' }]}>{profile.name}</Text>
        {profile.age ? (
          <Text style={[styles.profileMeta, { textAlign: isRTL ? 'right' : 'left' }]}>
            {isRTL ? `${profile.age} سنة` : `Age ${profile.age}`}
            {profile.sex ? ` · ${profile.sex}` : ''}
          </Text>
        ) : null}
        <Text style={[styles.profileChats, { textAlign: isRTL ? 'right' : 'left' }]}>
          {isRTL ? `${chatCount} محادثة` : `${chatCount} conversation${chatCount !== 1 ? 's' : ''}`}
        </Text>
      </View>
      <AppIcon name={isRTL ? 'chevron-back' : 'chevron-forward'} size={18} color={colors.textMuted} />
    </TouchableOpacity>
  );
}

function ChatSummaryCard({ chat, copy, isRTL, summary, followUp, onPress }) {
  const userMsgCount = (chat.messages || []).filter((m) => m.role === 'user').length;
  const severityStyle = summary?.data ? SEVERITY_STYLES[summary.data.severity] : null;
  const time = chat.updatedAt
    ? new Date(chat.updatedAt).toLocaleTimeString(isRTL ? 'ar-MA' : 'en-GB', { hour: '2-digit', minute: '2-digit' })
    : null;
  const reportedDate = new Date(chat.createdAt || chat.updatedAt);
  const followedDate = followUp ? new Date(followUp.recordedAt) : null;
  const reportedDay = new Date(reportedDate.getFullYear(), reportedDate.getMonth(), reportedDate.getDate());
  const followedDay = followedDate
    ? new Date(followedDate.getFullYear(), followedDate.getMonth(), followedDate.getDate())
    : null;
  const showFollowUpTimeline = Boolean(followedDay && Math.floor((followedDay - reportedDay) / 86400000) > 0);

  return (
    <TouchableOpacity
      style={[styles.chatCard, isRTL && styles.chatCardRTL]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={styles.entryDot} />
      <View style={styles.chatBody}>
        <View style={[styles.chatHeader, isRTL && styles.rowReverse]}>
          <Text style={[styles.chatTitle, { textAlign: isRTL ? 'right' : 'left', flex: 1 }]} numberOfLines={2}>
            {chat.title}
          </Text>
          {time ? <Text style={styles.chatTime}>{time}</Text> : null}
        </View>
        <Text style={[styles.chatMeta, { textAlign: isRTL ? 'right' : 'left' }]}>
          {copy.messages(userMsgCount)}
        </Text>
        {summary?.status === 'loading' && (
          <Text style={[styles.summaryPlaceholder, { textAlign: isRTL ? 'right' : 'left' }]}>
            {copy.summarising}
          </Text>
        )}
        {summary?.status === 'success' && summary.data ? (
          <View style={styles.summaryDetails}>
            <View style={[styles.symptomRow, isRTL && styles.rowReverse]}>
              {severityStyle ? (
                <View style={[styles.severityBadge, { backgroundColor: severityStyle.backgroundColor }]}>
                  <Text style={[styles.severityText, { color: severityStyle.color }]}>
                    {summary.data.severity}
                  </Text>
                </View>
              ) : null}
              <Text style={[styles.symptomText, { textAlign: isRTL ? 'right' : 'left' }]}>
                {summary.data.symptom}
              </Text>
            </View>
            {summary.data.recommended ? (
              <Text style={[styles.medicineDetail, { textAlign: isRTL ? 'right' : 'left' }]}>
                {copy.recommended}: {summary.data.recommended}
              </Text>
            ) : null}
            {summary.data.medicineChosen ? (
              <Text style={[styles.medicineDetail, { textAlign: isRTL ? 'right' : 'left' }]}>
                {copy.medicineChosen}: {summary.data.medicineChosen}
              </Text>
            ) : null}
          </View>
        ) : null}
        {showFollowUpTimeline ? (
          <View style={[styles.followUpTimeline, isRTL && styles.rowReverse]}>
            <Text style={[styles.followUpDates, { textAlign: isRTL ? 'right' : 'left' }]}>
              {copy.reportedFollowUp(
                reportedDate.toLocaleDateString(isRTL ? 'ar-MA' : 'en-GB'),
                followedDate.toLocaleDateString(isRTL ? 'ar-MA' : 'en-GB')
              )}
            </Text>
            <View style={[styles.followUpBadge, styles[`followUp_${followUp.status}`]]}>
              <Text style={[styles.followUpBadgeText, styles[`followUpText_${followUp.status}`]]}>
                {copy[followUp.status]}
              </Text>
            </View>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

function ChatDetail({ data, isLoading, copy, isRTL, followUp, onSaveFollowUp, isSpeaking, onToggleSpeech }) {
  const severityStyle = data ? SEVERITY_STYLES[data.severity] : null;

  if (isLoading) {
    return (
      <Text style={[styles.detailLoading, { textAlign: isRTL ? 'right' : 'left' }]}>
        {copy.summarising}
      </Text>
    );
  }

  if (!data) return null;

  return (
    <View style={styles.detailCard}>
      <TouchableOpacity style={styles.detailSpeechButton} onPress={onToggleSpeech} activeOpacity={0.75}>
        <AppIcon name={isSpeaking ? 'volume-high' : 'volume-medium-outline'} size={18} color={isSpeaking ? colors.dawa : colors.textMuted} />
      </TouchableOpacity>
      <View style={styles.detailSection}>
        <Text style={[styles.detailLabel, { textAlign: isRTL ? 'right' : 'left' }]}>{copy.symptom}</Text>
        <View style={[styles.detailSymptomRow, isRTL && styles.rowReverse]}>
          {severityStyle ? (
            <View style={[styles.severityBadge, { backgroundColor: severityStyle.backgroundColor }]}>
              <Text style={[styles.severityText, { color: severityStyle.color }]}>{data.severity}</Text>
            </View>
          ) : null}
          <Text style={[styles.detailContent, styles.detailSymptomText, { textAlign: isRTL ? 'right' : 'left' }]}>
            {data.symptom}
          </Text>
        </View>
      </View>

      {data.recommended ? (
        <View style={styles.detailSection}>
          <Text style={[styles.detailLabel, { textAlign: isRTL ? 'right' : 'left' }]}>{copy.recommended}</Text>
          <Text style={[styles.detailContent, { textAlign: isRTL ? 'right' : 'left' }]}>{data.recommended}</Text>
        </View>
      ) : null}

      {data.medicineChosen ? (
        <View style={styles.detailSection}>
          <Text style={[styles.detailLabel, { textAlign: isRTL ? 'right' : 'left' }]}>{copy.medicineChosen}</Text>
          <Text style={[styles.detailContent, { textAlign: isRTL ? 'right' : 'left' }]}>{data.medicineChosen}</Text>
        </View>
      ) : null}

      {data.notes ? (
        <View style={styles.detailSection}>
          <Text style={[styles.detailLabel, { textAlign: isRTL ? 'right' : 'left' }]}>{copy.notes}</Text>
          <Text style={[styles.detailContent, { textAlign: isRTL ? 'right' : 'left' }]}>{data.notes}</Text>
        </View>
      ) : null}

      <View style={styles.detailSection}>
        <Text style={[styles.detailLabel, { textAlign: isRTL ? 'right' : 'left' }]}>{copy.feelingNow}</Text>
        {followUp ? (
          <View style={styles.savedFollowUpRow}>
            <View style={[styles.followUpBadge, styles[`followUp_${followUp.status}`]]}>
              <Text style={[styles.followUpBadgeText, styles[`followUpText_${followUp.status}`]]}>
                {copy[followUp.status]}
              </Text>
            </View>
            <Text style={styles.followUpRecordedDate}>
              {new Date(followUp.recordedAt).toLocaleDateString(isRTL ? 'ar-MA' : 'en-GB')}
            </Text>
          </View>
        ) : (
          <View style={[styles.followUpButtons, isRTL && styles.rowReverse]}>
            {['better', 'same', 'worse'].map((status) => (
              <TouchableOpacity
                key={status}
                style={[styles.followUpChoice, styles[`followUp_${status}`]]}
                onPress={() => onSaveFollowUp(status)}
                activeOpacity={0.75}
              >
                <Text style={[styles.followUpChoiceText, styles[`followUpText_${status}`]]}>{copy[status]}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

export default function SymptomLogScreen({
  visible,
  onClose,
  chatHistory,
  profiles,
  lang,
  activeProfileId,
  reminders = [],
  adherenceLog = {},
  onOpenReminders,
}) {
  const copy = COPY[lang] ?? COPY.en;
  const isRTL = lang === 'ar';
  const [selectedProfileId, setSelectedProfileId] = useState(activeProfileId ?? null);
  const [selectedChat, setSelectedChat] = useState(null);
  const [summaries, setSummaries] = useState({});
  const [detailSummaries, setDetailSummaries] = useState({});
  const [followUps, setFollowUps] = useState({});
  const [detailSpeaking, setDetailSpeaking] = useState(false);
  const [storedReminders, setStoredReminders] = useState(reminders);
  const requestedSummaryIds = useRef(new Set());
  const requestedDetailSummaryIds = useRef(new Set());

  const allProfiles = [
    ...(profiles || []),
    { id: '__general__', name: copy.general },
  ];

  const profileChats = (profileId) => {
    if (profileId === '__general__') {
      return (chatHistory || []).filter((c) => !c.activeProfile?.id);
    }
    return (chatHistory || []).filter((c) => c.activeProfile?.id === profileId);
  };

  const selectedProfile = selectedProfileId
    ? allProfiles.find((p) => p.id === selectedProfileId)
    : null;

  const chatsForSelected = selectedProfileId ? profileChats(selectedProfileId) : [];
  const remindersForSelected = selectedProfileId
    ? storedReminders.filter((reminder) => (
        selectedProfileId === '__general__'
          ? !(reminder.profileIds?.length || reminder.profileId)
          : reminder.profileIds?.includes(selectedProfileId) || reminder.profileId === selectedProfileId
      ))
    : [];
  const grouped = buildTimelineGroups(chatsForSelected, remindersForSelected, isRTL);

  useEffect(() => {
    if (!visible) return;
    loadReminders().then(setStoredReminders);
  }, [visible]);

  useEffect(() => {
    if (visible && activeProfileId) {
      setSelectedProfileId(activeProfileId);
    } else if (visible && !activeProfileId) {
      setSelectedProfileId(null);
    }
  }, [visible, activeProfileId]);

  useEffect(() => {
    if (!selectedProfileId) return;

    const chatsToSummarise = chatsForSelected.filter((chat) => (
      chat.id
      && !requestedSummaryIds.current.has(chat.id)
      && (chat.messages || []).some((message) => message.role === 'user')
    ));

    if (!chatsToSummarise.length) return;

    for (const chat of chatsToSummarise) requestedSummaryIds.current.add(chat.id);
    setSummaries((current) => {
      const next = { ...current };
      for (const chat of chatsToSummarise) next[chat.id] = { status: 'loading', data: null };
      return next;
    });

    for (const chat of chatsToSummarise) {
      generateChatSummary(chat.messages || [])
        .then((data) => {
          setSummaries((current) => ({
            ...current,
            [chat.id]: data ? { status: 'success', data } : { status: 'failed', data: null },
          }));
        })
        .catch(() => {
          setSummaries((current) => ({
            ...current,
            [chat.id]: { status: 'failed', data: null },
          }));
        });
    }
  }, [selectedProfileId, chatHistory]);

  useEffect(() => {
    if (!selectedChat?.id || requestedDetailSummaryIds.current.has(selectedChat.id)) return;

    requestedDetailSummaryIds.current.add(selectedChat.id);
    setDetailSummaries((current) => ({
      ...current,
      [selectedChat.id]: { status: 'loading', data: null },
    }));

    generateChatSummary(selectedChat.messages || [], DETAIL_SUMMARY_USER_PROMPT)
      .then((data) => {
        setDetailSummaries((current) => ({
          ...current,
          [selectedChat.id]: data ? { status: 'success', data } : { status: 'failed', data: null },
        }));
      })
      .catch(() => {
        setDetailSummaries((current) => ({
          ...current,
          [selectedChat.id]: { status: 'failed', data: null },
        }));
      });
  }, [selectedChat]);

  useEffect(() => {
    if (!selectedChat?.id) return;
    loadFollowUps().then(setFollowUps);
  }, [selectedChat]);

  useEffect(() => {
    Speech.stop();
    setDetailSpeaking(false);
  }, [selectedChat]);

  useEffect(() => () => {
    Speech.stop();
  }, []);

  const handleSaveFollowUp = async (status) => {
    if (!selectedChat?.id) return;
    try {
      const updated = await saveFollowUp(selectedChat.id, {
        status,
        note: '',
        recordedAt: new Date().toISOString(),
      });
      setFollowUps(updated);
    } catch {
      // Follow-up logging is non-critical; leave the choices available on failure.
    }
  };

  const selectedDetailSummary = selectedChat ? detailSummaries[selectedChat.id] : null;
  const selectedCardSummary = selectedChat ? summaries[selectedChat.id] : null;
  const detailData = selectedDetailSummary?.status === 'success'
    ? selectedDetailSummary.data
    : selectedDetailSummary?.status === 'failed'
      ? selectedCardSummary?.data || null
      : null;
  const detailIsLoading = Boolean(selectedChat && (!selectedDetailSummary || selectedDetailSummary.status === 'loading'));

  const toggleDetailSpeech = () => {
    if (!detailData) return;
    if (detailSpeaking) {
      Speech.stop();
      setDetailSpeaking(false);
      return;
    }
    const text = [detailData.symptom, detailData.recommended, detailData.notes].filter(Boolean).join('. ');
    Speech.stop();
    setDetailSpeaking(true);
    Speech.speak(text, {
      language: lang === 'ar' ? 'ar' : 'en-GB',
      rate: 0.9,
      onDone: () => setDetailSpeaking(false),
      onStopped: () => setDetailSpeaking(false),
      onError: () => setDetailSpeaking(false),
    });
  };

  const handleHeaderAction = () => {
    if (selectedChat) {
      setSelectedChat(null);
    } else if (selectedProfileId) {
      if (activeProfileId) {
        onClose();
      } else {
        setSelectedProfileId(null);
      }
    } else {
      onClose();
    }
  };

  const formatValue = (value) => {
    if (Array.isArray(value)) return value.length ? value.join(', ') : copy.none;
    if (value == null || value === '') return copy.none;
    return String(value);
  };

  const shareConsultation = async () => {
    if (!selectedChat || !detailData) return;
    const locale = isRTL ? 'ar-MA' : 'en-GB';
    const followUp = followUps[selectedChat.id];
    const lines = [
      `Dawa: ${selectedChat.title}`,
      `${copy.profile}: ${selectedProfile?.name || copy.general}`,
      `${copy.date}: ${new Date(selectedChat.createdAt || selectedChat.updatedAt).toLocaleDateString(locale)}`,
      `${copy.severity}: ${detailData.severity}`,
      `${copy.symptom}: ${detailData.symptom}`,
      detailData.recommended ? `${copy.recommended}: ${detailData.recommended}` : null,
      detailData.medicineChosen ? `${copy.medicineChosen}: ${detailData.medicineChosen}` : null,
      detailData.notes ? `${copy.notes}: ${detailData.notes}` : null,
      followUp ? `${copy.followUp}: ${copy[followUp.status]} (${new Date(followUp.recordedAt).toLocaleDateString(locale)})` : null,
    ].filter(Boolean);
    try {
      await Share.share({ message: lines.join('\n') });
    } catch {
      // Sharing is controlled by the operating system; dismissal needs no error UI.
    }
  };

  const generateDoctorsReport = async () => {
    if (!selectedProfile) return;
    const storedFollowUps = await loadFollowUps();
    setFollowUps(storedFollowUps);
    const locale = isRTL ? 'ar-MA' : 'en-GB';
    const now = new Date();
    const profileReminderMatches = storedReminders.filter((reminder) => (
      selectedProfile.id === '__general__'
        ? !(reminder.profileIds?.length || reminder.profileId)
        : reminder.profileIds?.includes(selectedProfile.id) || reminder.profileId === selectedProfile.id
    ));
    const activeReminders = profileReminderMatches.filter((reminder) => (
      isReminderActiveOnDate(reminder, todayDateKey(now))
    ));
    const recentDays = last7Days();

    const profileLines = [
      `${copy.profile}: ${selectedProfile.name}`,
      `${copy.age}: ${formatValue(selectedProfile.age)}`,
      `${copy.sex}: ${formatValue(selectedProfile.sex)}`,
      `${copy.conditions}: ${formatValue(selectedProfile.conditions)}`,
      `${copy.regularMedicines}: ${formatValue(selectedProfile.medications)}`,
      `${copy.allergies}: ${formatValue(selectedProfile.allergies)}`,
      `${copy.pregnancyStatus}: ${formatValue(selectedProfile.pregnancyStatus)}`,
      `${copy.weight}: ${selectedProfile.weight ? `${selectedProfile.weight} kg` : copy.none}`,
      `${copy.adverseReactions}: ${formatValue(selectedProfile.adverseReactions)}`,
    ];

    const conversationLines = chatsForSelected.length ? chatsForSelected.flatMap((chat, index) => {
      const summary = detailSummaries[chat.id]?.data || summaries[chat.id]?.data;
      const followUp = storedFollowUps[chat.id];
      const chatDate = new Date(chat.createdAt || chat.updatedAt).toLocaleDateString(locale);
      return [
        `${index + 1}. ${chat.title} (${chatDate})`,
        summary ? `   ${copy.severity}: ${summary.severity}` : `   ${copy.noSummary}`,
        summary ? `   ${copy.symptom}: ${summary.symptom}` : null,
        summary?.recommended ? `   ${copy.recommended}: ${summary.recommended}` : null,
        summary?.medicineChosen ? `   ${copy.medicineChosen}: ${summary.medicineChosen}` : null,
        summary?.notes ? `   ${copy.notes}: ${summary.notes}` : null,
        followUp ? `   ${copy.followUp}: ${copy[followUp.status]} (${new Date(followUp.recordedAt).toLocaleDateString(locale)})` : null,
      ].filter(Boolean);
    }) : [copy.none];

    const reminderLines = activeReminders.length ? activeReminders.map((reminder) => {
      const times = (reminder.timeSlots || [])
        .map((slot) => `${String(slot.hour).padStart(2, '0')}:${String(slot.minute).padStart(2, '0')}`)
        .join(', ');
      const extras = [reminder.dose, reminder.instructions].filter(Boolean).join(' · ');
      return `• ${reminder.medicineName}: ${times || `${reminder.timesPerDay}×`}${extras ? `, ${extras}` : ''}`;
    }) : [copy.none];

    const adherenceLines = activeReminders.length ? activeReminders.map((reminder) => {
      const entries = recentDays.map((day) => adherenceLog[reminder.id]?.[day]).filter((status) => status !== undefined);
      const taken = entries.filter(isDoseTaken).length;
      const skipped = entries.filter(isDoseMissed).length;
      return `• ${reminder.medicineName}: ${taken} ${copy.takenCount}, ${skipped} ${copy.skippedCount}`;
    }) : [copy.none];

    const report = [
      `Dawa Health Summary: ${selectedProfile.name}, ${now.toLocaleDateString(locale)}`,
      '',
      copy.profileDetails.toUpperCase(),
      ...profileLines,
      '',
      copy.conversations.toUpperCase(),
      ...conversationLines,
      '',
      copy.activeReminders.toUpperCase(),
      ...reminderLines,
      '',
      copy.adherence.toUpperCase(),
      ...adherenceLines,
      '',
      'Generated by Dawa. For informational purposes only. Always consult a qualified healthcare professional.',
    ].join('\n');

    try {
      await Share.share({ message: report });
    } catch {
      // Sharing is controlled by the operating system; dismissal needs no error UI.
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={selectedChat ? () => setSelectedChat(null) : onClose}
    >
      <SafeAreaView style={styles.root}>
        {/* Header */}
        <View style={[styles.header, isRTL && styles.rowReverse]}>
          <TouchableOpacity
            onPress={handleHeaderAction}
            style={styles.closeBtn}
          >
            <AppIcon
              name={(selectedChat || selectedProfileId) ? (isRTL ? 'chevron-forward' : 'chevron-back') : 'close'}
              size={22}
              color={colors.text}
            />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle} numberOfLines={selectedChat ? 1 : undefined}>
              {selectedChat ? selectedChat.title : selectedProfile ? selectedProfile.name : copy.title}
            </Text>
            <Text style={styles.headerSub}>
              {selectedChat ? selectedProfile?.name : selectedProfile ? copy.title : copy.subtitle}
            </Text>
          </View>
          {selectedChat ? (
            <TouchableOpacity
              style={[styles.closeBtn, !detailData && styles.disabledAction]}
              onPress={shareConsultation}
              disabled={!detailData}
              accessibilityLabel={copy.share}
            >
              <AppIcon name="share-social-outline" size={20} color={colors.dawa} />
            </TouchableOpacity>
          ) : <View style={{ width: 38 }} />}
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Profile picker */}
          {!selectedProfileId && !selectedChat && (
            <>
              <Text style={[styles.sectionLabel, { textAlign: isRTL ? 'right' : 'left' }]}>
                {copy.chooseProfile}
              </Text>
              {allProfiles.map((profile) => {
                const count = profileChats(profile.id).filter(
                  (c) => (c.messages || []).some((m) => m.role === 'user')
                ).length;
                return (
                  <ProfileCard
                    key={profile.id}
                    profile={profile}
                    chatCount={count}
                    onPress={() => setSelectedProfileId(profile.id)}
                    isRTL={isRTL}
                  />
                );
              })}
            </>
          )}

          {/* Timeline for selected profile */}
          {selectedProfileId && !selectedChat && grouped.length === 0 && (
            <View style={styles.emptyState}>
              <AppIcon name="document-text-outline" size={42} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>{copy.noChats}</Text>
              <Text style={styles.emptyHint}>{copy.noChatsHint}</Text>
            </View>
          )}

          {selectedProfileId && !selectedChat && grouped.map((group) => (
            <View key={group.key}>
              <Text style={[styles.dateLabel, { textAlign: isRTL ? 'right' : 'left' }]}>
                {group.label}
              </Text>
              {group.entries.map((entry) => entry.type === 'chat' ? (
                  <ChatSummaryCard
                    key={`chat-${entry.chat.id}`}
                    chat={entry.chat}
                    copy={copy}
                    isRTL={isRTL}
                    summary={summaries[entry.chat.id]}
                    followUp={followUps[entry.chat.id]}
                    onPress={() => setSelectedChat(entry.chat)}
                  />
                ) : (
                  <TouchableOpacity
                    key={`reminder-${entry.reminder.id}`}
                    style={[styles.reminderCard, isRTL && styles.rowReverse]}
                    onPress={onOpenReminders}
                    activeOpacity={0.75}
                  >
                    <View style={styles.reminderIcon}><Text style={styles.reminderEmoji}>💊</Text></View>
                    <View style={styles.reminderCopy}>
                      <Text style={[styles.reminderName, { textAlign: isRTL ? 'right' : 'left' }]}>{entry.reminder.medicineName}</Text>
                      <Text style={[styles.reminderMeta, { textAlign: isRTL ? 'right' : 'left' }]}>
                        {[entry.reminder.dose, copy.reminderFrequency(entry.reminder.frequency || entry.reminder.timesPerDay || 1)].filter(Boolean).join(' · ')}
                      </Text>
                    </View>
                    <AppIcon name={isRTL ? 'chevron-back' : 'chevron-forward'} size={17} color={colors.textMuted} />
                  </TouchableOpacity>
                ))}
            </View>
          ))}

          {selectedProfileId && !selectedChat ? (
            <TouchableOpacity style={styles.reportButton} onPress={generateDoctorsReport} activeOpacity={0.8}>
              <AppIcon name="share-social-outline" size={19} color={colors.white} />
              <Text style={styles.reportButtonText}>{copy.generateReport}</Text>
            </TouchableOpacity>
          ) : null}

          {selectedChat ? (
            <ChatDetail
              data={detailData}
              isLoading={detailIsLoading}
              copy={copy}
              isRTL={isRTL}
              followUp={followUps[selectedChat.id]}
              onSaveFollowUp={handleSaveFollowUp}
              isSpeaking={detailSpeaking}
              onToggleSpeech={toggleDetailSpeech}
            />
          ) : null}
        </ScrollView>
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
  closeBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: colors.canvas,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: colors.border,
  },
  disabledAction: { opacity: 0.4 },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '800', color: colors.text },
  headerSub: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  content: { padding: spacing.lg, paddingBottom: 48 },
  sectionLabel: {
    fontSize: 13, fontWeight: '700', color: colors.textMuted,
    marginBottom: spacing.md,
  },
  // Profile cards
  profileCard: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.surface, borderRadius: radii.lg,
    padding: spacing.md, marginBottom: spacing.sm,
    borderWidth: 1, borderColor: colors.border,
  },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.dawa + '22',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 16, fontWeight: '800', color: colors.dawa },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 15, fontWeight: '700', color: colors.text },
  profileMeta: { fontSize: 12, color: colors.textMuted, marginTop: 1 },
  profileChats: { fontSize: 12, color: colors.dawa, marginTop: 3, fontWeight: '600' },
  // Timeline
  dateLabel: {
    fontSize: 12, fontWeight: '700', color: colors.textMuted,
    textTransform: 'uppercase', letterSpacing: 0.5,
    marginTop: spacing.lg, marginBottom: spacing.sm, marginLeft: 20,
  },
  chatCard: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, marginBottom: spacing.sm },
  chatCardRTL: { flexDirection: 'row-reverse' },
  entryDot: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: colors.dawa, marginTop: 14, flexShrink: 0,
  },
  chatBody: {
    flex: 1, backgroundColor: colors.surface, borderRadius: radii.md,
    padding: spacing.md, borderWidth: 1, borderColor: colors.border,
    borderLeftWidth: 3, borderLeftColor: colors.dawa,
  },
  chatHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, marginBottom: 4 },
  chatTitle: { fontSize: 14, fontWeight: '700', color: colors.text, lineHeight: 20 },
  chatTime: { fontSize: 10, color: colors.textSubtle, marginTop: 2, flexShrink: 0 },
  chatMeta: { fontSize: 12, color: colors.textMuted, marginBottom: 4 },
  summaryDetails: { marginTop: 2, gap: 2 },
  symptomRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  severityBadge: { borderRadius: 99, paddingHorizontal: 7, paddingVertical: 2 },
  severityText: { fontSize: 10, fontWeight: '700' },
  symptomText: { flex: 1, fontSize: 12, color: colors.text, fontWeight: '600' },
  medicineDetail: { fontSize: 11, color: colors.textMuted },
  summaryPlaceholder: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  // Detail
  detailLoading: { fontSize: 13, color: colors.textMuted, paddingVertical: spacing.md },
  detailCard: {
    backgroundColor: colors.surface, borderRadius: radii.lg,
    padding: spacing.lg, borderWidth: 1, borderColor: colors.border,
    gap: spacing.lg,
  },
  detailSpeechButton: { alignSelf: 'flex-end', width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.canvas, borderWidth: 1, borderColor: colors.border, marginBottom: -spacing.sm },
  detailSection: { gap: spacing.xs },
  detailLabel: { fontSize: 13, fontWeight: '800', color: colors.text },
  detailSymptomRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  detailContent: { fontSize: 14, color: colors.textMuted, lineHeight: 21 },
  detailSymptomText: { flex: 1 },
  followUpButtons: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.xs },
  followUpChoice: { flex: 1, alignItems: 'center', borderRadius: radii.pill, paddingHorizontal: spacing.sm, paddingVertical: 9 },
  followUpChoiceText: { fontSize: 11, fontWeight: '800' },
  savedFollowUpRow: { alignItems: 'flex-start', gap: spacing.xs, marginTop: spacing.xs },
  followUpBadge: { alignSelf: 'flex-start', borderRadius: 99, paddingHorizontal: 8, paddingVertical: 3 },
  followUpBadgeText: { fontSize: 10, fontWeight: '800' },
  followUp_better: { backgroundColor: '#22c55e22' },
  followUp_same: { backgroundColor: '#f59e0b22' },
  followUp_worse: { backgroundColor: '#ef444422' },
  followUpText_better: { color: '#16a34a' },
  followUpText_same: { color: '#b45309' },
  followUpText_worse: { color: '#dc2626' },
  followUpRecordedDate: { fontSize: 11, color: colors.textMuted },
  followUpTimeline: { marginTop: spacing.sm, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: spacing.xs },
  followUpDates: { flex: 1, minWidth: 180, fontSize: 10, color: colors.textMuted },
  reportButton: { marginTop: spacing.xl, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, padding: 14, borderRadius: radii.md, backgroundColor: colors.dawa },
  reportButtonText: { ...type.bodyStrong, color: colors.white },
  remindersSection: { marginTop: spacing.xl },
  remindersTitle: { ...type.heading, color: colors.text, marginBottom: spacing.sm },
  reminderCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md, marginBottom: spacing.sm, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  reminderIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.dawaSoft },
  reminderEmoji: { fontSize: 19 },
  reminderCopy: { flex: 1 }, reminderName: { ...type.bodyStrong, color: colors.text }, reminderMeta: { ...type.caption, color: colors.textMuted }, reminderNext: { ...type.caption, color: colors.dawa, marginTop: 2 },
  // Empty
  emptyState: { alignItems: 'center', paddingTop: 60, gap: spacing.md },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: colors.textMuted },
  emptyHint: { fontSize: 13, color: colors.textMuted, textAlign: 'center', lineHeight: 20 },
});
