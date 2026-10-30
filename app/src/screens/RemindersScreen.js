import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Notifications from 'expo-notifications';
import DateTimePicker from '@react-native-community/datetimepicker';
import AppIcon from '../components/AppIcon';
import { colors, radii, spacing, type } from '../theme/theme';
import { lookupBarcode, searchByName } from '../utils/barcodeSearch';
import { addReminder, deleteReminder, isReminderActiveOnDate, loadReminders, purgeExpiredReminders } from '../utils/reminders';
import { isDoseMissed, isDoseTaken, isAllSlotsTaken, isAllSlotsMissed, isPartiallyTaken, loadLog, markDose, markSlotDose, todayKey } from '../utils/adherenceLog';

const { width: SW, height: SH } = Dimensions.get('window');

const COPY = {
  en: {
    title: 'Reminders',
    noReminders: 'No reminders yet',
    addReminder: 'Add Reminder',
    medicineName: 'Medicine name',
    medicineNamePlaceholder: 'Type or scan barcode…',
    scanBarcode: 'Scan barcode',
    scanPrescription: 'Scan prescription or label',
    readingPrescription: 'Reading prescription…',
    prescriptionError: 'Could not read the prescription. You can enter the details manually.',
    prescriptionConfirmTitle: 'Check the scanned details',
    dose: 'Dose per intake',
    frequency: 'Times per day',
    durationDaysLabel: 'Duration (days)',
    instructions: 'Special instructions',
    confirmPrescription: 'Use these details',
    timesPerDay: 'Times per day',
    times: 'Times',
    duration: 'Duration',
    noEndDate: 'No end date',
    days: 'days',
    durationPlaceholder: 'Number of days',
    save: 'Save reminder',
    cancel: 'Cancel',
    deleteLabel: 'Delete reminder',
    permissionDenied: 'Notification permission was not granted.',
    cameraPermissionDenied: 'Camera permission is required to scan.',
    scanInstruction: 'Point at the barcode on the packaging',
    cancelScan: 'Cancel scan',
    daily: (n) => n === 1 ? 'Once daily' : `${n}× daily`,
    forever: 'No end date',
    forDays: (n) => `for ${n} day${n !== 1 ? 's' : ''}`,
    close: 'Close',
    taken: 'Taken',
    skipped: 'Skipped',
    todayDose: "Today's dose",
    step1: 'Medicine',
    step2: 'Schedule',
    step3: 'Duration',
    next: 'Next',
    back: 'Back',
    linkProfile: 'Link to profile',
    allProfiles: 'All',
    markTaken: 'Mark as taken',
    takenToday: 'Taken today',
    missedToday: 'Missed today. Did you take it?',
    yesTaken: 'Yes, I took it',
    no: 'No',
    editPastDay: 'Edit doses for',
    clearDose: 'Clear',
    notYetTime: 'Not yet time',
    trackDoses: 'Track Doses',
    todaysDoses: "Today's doses",
    prevMonth: 'Previous month',
    nextMonth: 'Next month',
  },
  ar: {
    title: 'التذكيرات',
    noReminders: 'ما كاين تا تذكير',
    addReminder: 'إضافة تذكير',
    medicineName: 'اسم الدواء',
    medicineNamePlaceholder: 'كتب أو سكان الباركود…',
    scanBarcode: 'سكان الباركود',
    scanPrescription: 'سكان الوصفة أو لاصقة الدواء',
    readingPrescription: 'جاري قراءة الوصفة…',
    prescriptionError: 'ما قدرناش نقراو الوصفة. تقدر تدخل المعلومات بيدك.',
    prescriptionConfirmTitle: 'تأكد من المعلومات المقروءة',
    dose: 'الجرعة فكل مرة',
    frequency: 'عدد المرات فالنهار',
    durationDaysLabel: 'المدة بالأيام',
    instructions: 'تعليمات خاصة',
    confirmPrescription: 'استعمل هاد المعلومات',
    timesPerDay: 'عدد المرات في اليوم',
    times: 'الأوقات',
    duration: 'المدة',
    noEndDate: 'بلا نهاية',
    days: 'يوم',
    durationPlaceholder: 'عدد الأيام',
    save: 'احفظ التذكير',
    cancel: 'إلغاء',
    deleteLabel: 'حذف التذكير',
    permissionDenied: 'ما عطاناش الإذن باش نرسلو إشعارات.',
    cameraPermissionDenied: 'خاصنا الإذن ديال الكاميرا.',
    scanInstruction: 'وجه للباركود ديال العبوة',
    cancelScan: 'إلغاء السكان',
    daily: (n) => n === 1 ? 'مرة في اليوم' : `${n} مرات في اليوم`,
    forever: 'بلا نهاية',
    forDays: (n) => `لمدة ${n} يوم`,
    close: 'إغلاق',
    taken: 'أخدت',
    skipped: 'ما أخدتش',
    todayDose: 'جرعة اليوم',
    step1: 'الدواء',
    step2: 'الجدول',
    step3: 'المدة',
    next: 'التالي',
    back: 'رجوع',
    linkProfile: 'ربط بالبروفيل',
    allProfiles: 'الكل',
    markTaken: 'علّم أنني خديتو',
    takenToday: 'خديتو اليوم',
    missedToday: 'فاتك اليوم، واش خديتيه؟',
    yesTaken: 'إيه، خديتو',
    no: 'لا',
    editPastDay: 'تعديل الجرعات ليوم',
    clearDose: 'امسح',
    notYetTime: 'ما وصلش الوقت',
    trackDoses: 'تتبع الجرعات',
    todaysDoses: 'جرعات اليوم',
    prevMonth: 'الشهر السابق',
    nextMonth: 'الشهر التالي',
  },
};

const DEFAULT_TIMES = [
  { hour: 8, minute: 0 },
  { hour: 13, minute: 0 },
  { hour: 18, minute: 0 },
  { hour: 22, minute: 0 },
];

function pad(n) { return String(n).padStart(2, '0'); }
function formatTime(t) { return `${pad(t.hour)}:${pad(t.minute)}`; }
function isSlotTimePassed(hour, minute) {
  const now = new Date();
  return now.getHours() > hour || (now.getHours() === hour && now.getMinutes() >= minute);
}

function isPastLastScheduledTime(reminder, now = new Date()) {
  const slots = Array.isArray(reminder.timeSlots) ? reminder.timeSlots : [];
  if (slots.length === 0) return false;
  const latestMinutes = Math.max(...slots.map((slot) => Number(slot.hour) * 60 + Number(slot.minute)));
  return now.getHours() * 60 + now.getMinutes() > latestMinutes;
}

function last30Days() {
  return Array.from({ length: 30 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - index));
    return date.toISOString().slice(0, 10);
  });
}

function TimePicker({ value, onChange }) {
  const adjHour = (d) => onChange({ ...value, hour: (value.hour + d + 24) % 24 });
  const adjMin = (d) => onChange({ ...value, minute: (value.minute + d + 60) % 60 });
  return (
    <View style={tp.row}>
      <View style={tp.unit}>
        <TouchableOpacity onPress={() => adjHour(1)} style={tp.btn}><AppIcon name="chevron-up" size={16} color={colors.dawa} /></TouchableOpacity>
        <Text style={tp.val}>{pad(value.hour)}</Text>
        <TouchableOpacity onPress={() => adjHour(-1)} style={tp.btn}><AppIcon name="chevron-down" size={16} color={colors.dawa} /></TouchableOpacity>
      </View>
      <Text style={tp.colon}>:</Text>
      <View style={tp.unit}>
        <TouchableOpacity onPress={() => adjMin(5)} style={tp.btn}><AppIcon name="chevron-up" size={16} color={colors.dawa} /></TouchableOpacity>
        <Text style={tp.val}>{pad(value.minute)}</Text>
        <TouchableOpacity onPress={() => adjMin(-5)} style={tp.btn}><AppIcon name="chevron-down" size={16} color={colors.dawa} /></TouchableOpacity>
      </View>
    </View>
  );
}

const tp = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  unit: { alignItems: 'center', width: 44 },
  btn: { padding: 6 },
  val: { fontSize: 22, fontWeight: '700', color: colors.text, minWidth: 32, textAlign: 'center' },
  colon: { fontSize: 22, fontWeight: '700', color: colors.text, marginBottom: 2 },
});

function ReminderDetailModal({ visible, reminder, lang, onClose, onSave }) {
  const isRTL = lang === 'ar';
  const copy = COPY[lang] ?? COPY.en;
  const [name, setName] = useState('');
  const [count, setCount] = useState(1);
  const [slots, setSlots] = useState([{ ...DEFAULT_TIMES[0] }]);
  const [forever, setForever] = useState(true);
  const [mode, setMode] = useState('days');
  const [days, setDays] = useState('');
  const [date, setDate] = useState(null);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [savingChanges, setSavingChanges] = useState(false);

  useEffect(() => {
    if (!visible || !reminder) return;
    setName(reminder.medicineName ?? '');
    setCount(reminder.timesPerDay ?? 1);
    setSlots((reminder.timeSlots ?? [{ ...DEFAULT_TIMES[0] }]).map((slot) => ({ ...slot })));
    setForever(Boolean(reminder.noEndDate));
    setMode(reminder.durationDays ? 'days' : reminder.endDate ? 'date' : 'days');
    setDays(reminder.durationDays ? String(reminder.durationDays) : '');
    setDate(reminder.endDate ? new Date(reminder.endDate) : null);
    setDatePickerVisible(false);
  }, [visible, reminder]);

  if (!reminder) return null;

  const changeCount = (nextCount) => {
    setCount(nextCount);
    setSlots(Array.from({ length: nextCount }, (_, index) => slots[index] ?? { ...(DEFAULT_TIMES[index] ?? { hour: 8 + index * 4, minute: 0 }) }));
  };

  const changeSlot = (index, value) => {
    const next = [...slots];
    next[index] = value;
    setSlots(next);
  };

  const saveChanges = async () => {
    if (!name.trim() || (!forever && mode === 'days' && parseInt(days, 10) <= 0) || (!forever && mode === 'date' && !date)) return;
    setSavingChanges(true);
    try {
      const endDate = forever ? null : mode === 'date'
        ? date.toISOString()
        : (() => {
            const value = new Date();
            value.setDate(value.getDate() + parseInt(days, 10));
            return value.toISOString();
          })();
      await onSave(reminder, {
        medicineName: name.trim(),
        timesPerDay: count,
        timeSlots: slots,
        noEndDate: forever,
        endDate,
        durationDays: forever || mode !== 'days' ? null : parseInt(days, 10),
      });
    } finally {
      setSavingChanges(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={s.detailRoot}>
        <View style={[s.header, isRTL && s.rowReverse]}>
          <TouchableOpacity style={s.headerClose} onPress={onClose} activeOpacity={0.75}>
            <AppIcon name="close" size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>{lang === 'ar' ? 'تعديل التذكير' : 'Edit reminder'}</Text>
          <View style={{ width: 36 }} />
        </View>
        <ScrollView contentContainerStyle={s.detailContent} keyboardShouldPersistTaps="handled">
          <Text style={[s.detailSectionTitle, { textAlign: isRTL ? 'right' : 'left' }]}>{lang === 'ar' ? 'تفاصيل التذكير' : 'Reminder details'}</Text>
          <Text style={[s.stepLabel, { textAlign: isRTL ? 'right' : 'left' }]}>{copy.medicineName}</Text>
          <TextInput style={[s.textInput, isRTL && s.textInputRTL]} value={name} onChangeText={setName} placeholder={copy.medicineNamePlaceholder} placeholderTextColor={colors.textMuted} />

          <Text style={[s.stepLabel, { textAlign: isRTL ? 'right' : 'left' }]}>{copy.timesPerDay}</Text>
          <View style={[s.pillRow, isRTL && s.rowReverse]}>
            {[1, 2, 3, 4].map((value) => (
              <TouchableOpacity key={value} style={[s.pill, count === value && s.pillActive]} onPress={() => changeCount(value)} activeOpacity={0.75}>
                <Text style={[s.pillText, count === value && s.pillTextActive]}>{value}×</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={[s.stepLabel, { textAlign: isRTL ? 'right' : 'left' }]}>{copy.times}</Text>
          {slots.map((slot, index) => (
            <View key={index} style={s.slotRow}>
              <Text style={s.slotIndex}>{index + 1}</Text>
              <TimePicker value={slot} onChange={(value) => changeSlot(index, value)} />
            </View>
          ))}

          <Text style={[s.stepLabel, { textAlign: isRTL ? 'right' : 'left' }]}>{copy.duration}</Text>
          <TouchableOpacity style={[s.toggleRow, isRTL && s.rowReverse]} onPress={() => setForever((value) => !value)} activeOpacity={0.8}>
            <View style={[s.checkbox, forever && s.checkboxActive]}>{forever && <AppIcon name="checkmark" size={14} color={colors.white} />}</View>
            <Text style={s.toggleLabel}>{copy.noEndDate}</Text>
          </TouchableOpacity>
          {!forever && (
            <>
              <View style={[s.pillRow, isRTL && s.rowReverse]}>
                <TouchableOpacity style={[s.pill, mode === 'days' && s.pillActive]} onPress={() => setMode('days')}><Text style={[s.pillText, mode === 'days' && s.pillTextActive]}>{lang === 'ar' ? 'عدد الأيام' : 'Days'}</Text></TouchableOpacity>
                <TouchableOpacity style={[s.pill, mode === 'date' && s.pillActive]} onPress={() => setMode('date')}><Text style={[s.pillText, mode === 'date' && s.pillTextActive]}>{lang === 'ar' ? 'تاريخ محدد' : 'Pick date'}</Text></TouchableOpacity>
              </View>
              {mode === 'days' ? (
                <View style={[s.durationRow, isRTL && s.rowReverse]}>
                  <TextInput style={[s.durationInput, isRTL && s.textInputRTL]} value={days} onChangeText={setDays} keyboardType="number-pad" placeholder={copy.durationPlaceholder} placeholderTextColor={colors.textMuted} />
                  <Text style={s.durationUnit}>{copy.days}</Text>
                </View>
              ) : (
                <TouchableOpacity style={s.datePickerButton} onPress={() => setDatePickerVisible(true)} activeOpacity={0.8}>
                  <AppIcon name="calendar-outline" size={18} color={colors.dawa} />
                  <Text style={s.datePickerText}>{date ? date.toLocaleDateString(isRTL ? 'ar-MA' : 'en-GB') : (lang === 'ar' ? 'اختر التاريخ' : 'Choose date')}</Text>
                </TouchableOpacity>
              )}
            </>
          )}
          {datePickerVisible && <DateTimePicker value={date ?? new Date()} mode="date" minimumDate={new Date()} onChange={(_, selected) => { setDatePickerVisible(false); if (selected) setDate(selected); }} />}

          <TouchableOpacity style={[s.nextBtn, savingChanges && s.nextBtnDisabled]} onPress={saveChanges} disabled={savingChanges} activeOpacity={0.8}>
            {savingChanges ? <ActivityIndicator size="small" color={colors.white} /> : <Text style={s.nextBtnText}>{lang === 'ar' ? 'حفظ التغييرات' : 'Save changes'}</Text>}
          </TouchableOpacity>

        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

function DoseTrackingModal({ reminder, lang, adherenceLog, onClose, onSingleDose, onSlotDose, onDateSlotDose, onRefreshLog }) {
  const isRTL = lang === 'ar';
  const copy = COPY[lang] ?? COPY.en;
  const today = todayKey();
  const [pastSlotModal, setPastSlotModal] = useState(null);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const date = new Date();
    return { year: date.getFullYear(), month: date.getMonth() };
  });

  useEffect(() => {
    if (!reminder) return;
    const date = new Date();
    setCalendarMonth({ year: date.getFullYear(), month: date.getMonth() });
    setPastSlotModal(null);
  }, [reminder]);

  if (!reminder) return null;

  const slots = reminder.timeSlots ?? [];
  const log = adherenceLog[reminder.id] ?? {};
  const todayStatus = log[today];
  const now = new Date();
  const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const calStart = new Date(reminder.createdAt);
  calStart.setHours(0, 0, 0, 0);
  const calEnd = reminder.endDate ? new Date(reminder.endDate) : null;
  if (calEnd) calEnd.setHours(0, 0, 0, 0);
  const monthDate = new Date(calendarMonth.year, calendarMonth.month, 1);
  const startMonth = new Date(calStart.getFullYear(), calStart.getMonth(), 1);
  const endMonth = calEnd ? new Date(calEnd.getFullYear(), calEnd.getMonth(), 1) : null;
  const currentMonth = new Date(todayDate.getFullYear(), todayDate.getMonth(), 1);
  const canGoPrevious = monthDate > startMonth;
  const canGoNext = monthDate < currentMonth && (!endMonth || monthDate < endMonth);
  const schedule = `${copy.daily(reminder.timesPerDay)} · ${slots.map(formatTime).join(', ')}`;

  const dayStatus = (dateKey, date) => {
    const entry = log[dateKey];
    if (dateKey === today) return 'today';
    if (reminder.timesPerDay > 1) {
      const slotMap = entry && typeof entry === 'object' ? entry : {};
      const statuses = slots.map((slot) => {
        const value = slotMap[formatTime(slot)];
        return value === true ? 'taken' : value === false ? 'missed' : date < todayDate ? 'missed' : 'pending';
      });
      if (statuses.length && statuses.every((status) => status === 'taken')) return 'taken';
      if (statuses.length && statuses.every((status) => status === 'missed')) return 'missed';
      if (statuses.some((status) => status === 'taken')) return 'partial';
      return null;
    }
    if (isDoseTaken(entry)) return 'taken';
    if (isDoseMissed(entry) || date < todayDate) return 'missed';
    return null;
  };

  const summaryCounts = () => {
    const cursor = new Date(calStart);
    const last = new Date(Math.min(todayDate.getTime() - 86400000, calEnd ? calEnd.getTime() : Infinity));
    let taken = 0;
    let skipped = 0;
    while (cursor <= last) {
      const status = dayStatus(todayKey(cursor), cursor);
      if (status === 'taken') taken += 1;
      if (status === 'missed') skipped += 1;
      cursor.setDate(cursor.getDate() + 1);
    }
    return { taken, skipped };
  };

  const openPastSlotEditor = async (dateKey) => {
    const refreshed = await loadLog();
    const entry = refreshed[reminder.id]?.[dateKey] ?? {};
    const values = {};
    slots.forEach((slot) => {
      const timeStr = formatTime(slot);
      values[timeStr] = typeof entry === 'object' ? entry[timeStr] : undefined;
    });
    setPastSlotModal({ dateKey, slots: values });
  };

  const updatePastSlot = async (timeStr, status) => {
    if (!pastSlotModal) return;
    await onDateSlotDose(reminder.id, pastSlotModal.dateKey, timeStr, status);
    setPastSlotModal((current) => current ? {
      ...current,
      slots: { ...current.slots, [timeStr]: status == null ? undefined : status === true || status === 'taken' },
    } : current);
  };

  const closePastSlotEditor = async () => {
    await onRefreshLog();
    setPastSlotModal(null);
  };

  const daysInMonth = new Date(calendarMonth.year, calendarMonth.month + 1, 0).getDate();
  const leadingEmptyDays = new Date(calendarMonth.year, calendarMonth.month, 1).getDay();
  const { taken, skipped } = summaryCounts();

  return (
    <Modal visible={Boolean(reminder)} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={s.detailRoot}>
        <View style={[s.header, isRTL && s.rowReverse]}>
          <TouchableOpacity style={s.headerClose} onPress={onClose} activeOpacity={0.75}>
            <AppIcon name="close" size={22} color={colors.text} />
          </TouchableOpacity>
          <View style={s.trackingHeaderCopy}>
            <Text numberOfLines={1} style={[s.headerTitle, { textAlign: isRTL ? 'right' : 'left' }]}>{reminder.medicineName}</Text>
            <Text numberOfLines={1} style={[s.trackingSubtitle, { textAlign: isRTL ? 'right' : 'left' }]}>{schedule}</Text>
          </View>
          <View style={{ width: 36 }} />
        </View>
        <ScrollView contentContainerStyle={s.detailContent}>
          <Text style={[s.detailSectionTitle, { textAlign: isRTL ? 'right' : 'left' }]}>{copy.todaysDoses}</Text>
          {reminder.timesPerDay > 1 ? slots.map((slot, index) => {
            const timeStr = formatTime(slot);
            const slotMap = todayStatus && typeof todayStatus === 'object' ? todayStatus : {};
            const slotStatus = slotMap[timeStr];
            const disabled = !isSlotTimePassed(slot.hour, slot.minute);
            return (
              <View key={index} style={[s.trackingDoseRow, isRTL && s.rowReverse]}>
                <Text style={s.slotTimeLabel}>{timeStr}</Text>
                <TouchableOpacity style={[s.markBtn, slotStatus === true && s.markBtnTaken, disabled && s.adherenceButtonDisabled]} onPress={() => onSlotDose(reminder.id, timeStr, 'taken')} disabled={disabled}>
                  <Text style={[s.markBtnText, slotStatus === true && { color: colors.white }]}>{copy.taken}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.markBtn, slotStatus === false && s.markBtnSkipped, disabled && s.adherenceButtonDisabled]} onPress={() => onSlotDose(reminder.id, timeStr, 'missed')} disabled={disabled}>
                  <Text style={[s.markBtnText, slotStatus === false && { color: colors.white }]}>{copy.skipped}</Text>
                </TouchableOpacity>
              </View>
            );
          }) : (() => {
            const firstSlot = slots[0];
            const disabled = Boolean(firstSlot && !isSlotTimePassed(firstSlot.hour, firstSlot.minute));
            return (
              <View style={[s.markRow, isRTL && s.rowReverse]}>
                <TouchableOpacity style={[s.markBtn, isDoseTaken(todayStatus) && s.markBtnTaken, disabled && s.adherenceButtonDisabled]} onPress={() => onSingleDose(reminder.id, today, 'taken')} disabled={disabled}>
                  <Text style={[s.markBtnText, isDoseTaken(todayStatus) && { color: colors.white }]}>{copy.taken}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.markBtn, isDoseMissed(todayStatus) && s.markBtnSkipped, disabled && s.adherenceButtonDisabled]} onPress={() => onSingleDose(reminder.id, today, 'skipped')} disabled={disabled}>
                  <Text style={[s.markBtnText, isDoseMissed(todayStatus) && { color: colors.white }]}>{copy.skipped}</Text>
                </TouchableOpacity>
              </View>
            );
          })()}

          <View style={s.detailDivider} />
          <View style={[s.monthNavigation, isRTL && s.rowReverse]}>
            <TouchableOpacity style={[s.monthButton, !canGoPrevious && s.adherenceButtonDisabled]} onPress={() => canGoPrevious && setCalendarMonth(({ year, month }) => month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 })} disabled={!canGoPrevious} accessibilityLabel={copy.prevMonth}>
              <AppIcon name={isRTL ? 'chevron-forward' : 'chevron-back'} size={20} color={colors.dawa} />
            </TouchableOpacity>
            <Text style={s.monthLabel}>{monthDate.toLocaleDateString(isRTL ? 'ar-MA' : 'en-GB', { month: 'long', year: 'numeric' })}</Text>
            <TouchableOpacity style={[s.monthButton, !canGoNext && s.adherenceButtonDisabled]} onPress={() => canGoNext && setCalendarMonth(({ year, month }) => month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 })} disabled={!canGoNext} accessibilityLabel={copy.nextMonth}>
              <AppIcon name={isRTL ? 'chevron-back' : 'chevron-forward'} size={20} color={colors.dawa} />
            </TouchableOpacity>
          </View>
          <View style={s.monthGrid}>
            {Array.from({ length: leadingEmptyDays }, (_, index) => <View key={`empty-${index}`} style={s.monthDayCell} />)}
            {Array.from({ length: daysInMonth }, (_, index) => {
              const date = new Date(calendarMonth.year, calendarMonth.month, index + 1);
              const dateKey = todayKey(date);
              const inRange = date >= calStart && (!calEnd || date <= calEnd) && date <= todayDate;
              const isToday = dateKey === today;
              const status = inRange ? dayStatus(dateKey, date) : null;
              const isPast = date < todayDate;
              const style = status === 'taken' ? s.calendarTaken : status === 'missed' ? s.calendarSkipped : status === 'partial' ? s.calendarPartial : null;
              return (
                <TouchableOpacity
                  key={dateKey}
                  style={s.monthDayCell}
                  disabled={!inRange || isToday}
                  onPress={() => reminder.timesPerDay > 1 ? openPastSlotEditor(dateKey) : onSingleDose(reminder.id, dateKey, isDoseTaken(log[dateKey]) ? 'skipped' : isDoseMissed(log[dateKey]) ? null : 'taken')}
                >
                  <View style={[s.calendarDot, style, isToday && s.calendarToday, !inRange && s.calendarFuture]}>
                    <Text style={[s.calendarDayText, style && { color: colors.white }]}>{index + 1}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
          <View style={[s.summaryRow, isRTL && s.rowReverse]}>
            <Text style={s.summaryText}>{lang === 'ar' ? `أخدت: ${taken} يوم` : `Taken: ${taken} days`}</Text>
            <Text style={s.summaryText}>{lang === 'ar' ? `ما أخدتش: ${skipped} يوم` : `Skipped: ${skipped} days`}</Text>
          </View>
        </ScrollView>
        <Modal visible={pastSlotModal !== null} transparent animationType="fade" onRequestClose={closePastSlotEditor}>
          <View style={s.pastSlotOverlay}>
            <TouchableOpacity style={StyleSheet.absoluteFillObject} onPress={closePastSlotEditor} activeOpacity={1} />
            {pastSlotModal && <View style={s.pastSlotCard}>
              <Text style={[s.pastSlotTitle, { textAlign: isRTL ? 'right' : 'left' }]}>{reminder.medicineName}</Text>
              <Text style={[s.pastSlotSubtitle, { textAlign: isRTL ? 'right' : 'left' }]}>{copy.editPastDay} {new Date(`${pastSlotModal.dateKey}T12:00:00`).toLocaleDateString(isRTL ? 'ar-MA' : 'en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</Text>
              {slots.map((slot, index) => {
                const timeStr = formatTime(slot);
                const status = pastSlotModal.slots[timeStr];
                return <View key={index} style={[s.pastSlotRow, isRTL && s.rowReverse]}>
                  <Text style={s.slotTimeLabel}>{timeStr}</Text>
                  <TouchableOpacity style={[s.markBtn, status === true && s.markBtnTaken]} onPress={() => updatePastSlot(timeStr, 'taken')}><Text style={[s.markBtnText, status === true && { color: colors.white }]}>{copy.taken}</Text></TouchableOpacity>
                  <TouchableOpacity style={[s.markBtn, status === false && s.markBtnSkipped]} onPress={() => updatePastSlot(timeStr, 'missed')}><Text style={[s.markBtnText, status === false && { color: colors.white }]}>{copy.skipped}</Text></TouchableOpacity>
                  <TouchableOpacity onPress={() => updatePastSlot(timeStr, null)}><Text style={s.clearDoseText}>{copy.clearDose}</Text></TouchableOpacity>
                </View>;
              })}
              <TouchableOpacity style={s.pastSlotCloseButton} onPress={closePastSlotEditor}><Text style={s.pastSlotCloseText}>{copy.close}</Text></TouchableOpacity>
            </View>}
          </View>
        </Modal>
      </SafeAreaView>
    </Modal>
  );
}

export default function RemindersScreen({ visible, onClose, lang, initialMedicineName = '', profileId = null, profiles = [], onAdherenceChange }) {
  const isRTL = lang === 'ar';
  const copy = COPY[lang] ?? COPY.en;
  const insets = useSafeAreaInsets();
  const [reminders, setReminders] = useState([]);
  const [adding, setAdding] = useState(false);
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState(profileId);
  const [profileFilter, setProfileFilter] = useState(profileId ?? null);

  // Step 1 — medicine name
  const [medicineName, setMedicineName] = useState('');
  const [dose, setDose] = useState('');
  const [instructions, setInstructions] = useState('');
  const [scannerVisible, setScannerVisible] = useState(false);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();

  // Step 2 — schedule
  const [timesPerDay, setTimesPerDay] = useState(1);
  const [timeSlots, setTimeSlots] = useState([{ ...DEFAULT_TIMES[0] }]);

  // Step 3 — duration
  const [noEndDate, setNoEndDate] = useState(true);
  const [durationDays, setDurationDays] = useState('');
  const [durationMode, setDurationMode] = useState('days'); // 'days' | 'date'
  const [exactDate, setExactDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const photoCameraRef = useRef(null);
  const [photoCameraVisible, setPhotoCameraVisible] = useState(false);
  const [photoCameraReady, setPhotoCameraReady] = useState(false);
  const [capturingPhoto, setCapturingPhoto] = useState(false);
  const [processingPhoto, setProcessingPhoto] = useState(false);
  const [photoHits, setPhotoHits] = useState([]);
  const [photoDbFilter, setPhotoDbFilter] = useState(null); // 'MA' | 'UK' | null
  const prescriptionCameraRef = useRef(null);
  const [prescriptionCameraVisible, setPrescriptionCameraVisible] = useState(false);
  const [prescriptionCameraReady, setPrescriptionCameraReady] = useState(false);
  const [capturingPrescription, setCapturingPrescription] = useState(false);
  const [processingPrescription, setProcessingPrescription] = useState(false);
  const [prescriptionError, setPrescriptionError] = useState('');
  const [prescriptionDraft, setPrescriptionDraft] = useState(null);
  const [adherenceLog, setAdherenceLog] = useState({});
  const [detailReminder, setDetailReminder] = useState(null);
  const [doseTrackingReminder, setDoseTrackingReminder] = useState(null);

  useEffect(() => {
    if (!visible) return;
    purgeExpiredReminders().then(setReminders);
    loadLog().then(setAdherenceLog);
    setProfileFilter(profileId ?? null);
  }, [visible]);

  useEffect(() => {
    setTimesPerDay(1);
    setTimeSlots([{ ...DEFAULT_TIMES[0] }]);
  }, []);

  const handleTimesPerDayChange = (n) => {
    setTimesPerDay(n);
    setTimeSlots(
      Array.from({ length: n }, (_, i) => timeSlots[i] ?? { ...DEFAULT_TIMES[i] ?? { hour: 8 + i * 4, minute: 0 } })
    );
  };

  const updateSlot = (i, val) => {
    const next = [...timeSlots];
    next[i] = val;
    setTimeSlots(next);
  };

  const resetAddFlow = () => {
    setStep(1);
    setMedicineName(initialMedicineName);
    setDose('');
    setInstructions('');
    setTimesPerDay(1);
    setTimeSlots([{ ...DEFAULT_TIMES[0] }]);
    setNoEndDate(true);
    setDurationDays('');
    setDurationMode('days');
    setExactDate(null);
    setShowDatePicker(false);
    setSaving(false);
    setPrescriptionError('');
    setPrescriptionDraft(null);
    setSelectedProfileId(profileId);
  };

  const startAdding = () => {
    resetAddFlow();
    setAdding(true);
  };

  const cancelAdding = () => {
    setAdding(false);
    setScannerVisible(false);
    setPrescriptionCameraVisible(false);
  };

  const openScanner = async () => {
    if (!cameraPermission?.granted) {
      const res = await requestCameraPermission();
      if (!res.granted) return;
    }
    setScannerVisible(true);
  };

  const handleBarcodeScan = async ({ data }) => {
    setScannerVisible(false);
    try {
      const result = lookupBarcode(data);
      if (result.found) {
        const name = result.medicines?.[0]?.name ?? result.barcodeEntry?.name ?? '';
        setMedicineName(name);
      } else {
        setMedicineName('');
      }
    } catch {
      setMedicineName('');
    }
  };

  const openPhotoCamera = async () => {
    if (!cameraPermission?.granted) {
      const res = await requestCameraPermission();
      if (!res.granted) return;
    }
    setPhotoCameraReady(false);
    await new Promise((resolve) => setTimeout(resolve, 300));
    setPhotoCameraVisible(true);
  };

  const captureAndIdentify = async () => {
    if (capturingPhoto || !photoCameraRef.current) return;
    setCapturingPhoto(true);
    try {
      const photo = await photoCameraRef.current.takePictureAsync({ base64: true, quality: 0.3, exif: false });
      setPhotoCameraVisible(false);
      setPhotoCameraReady(false);
      setCapturingPhoto(false);

      if (!photo?.base64) return;
      setProcessingPhoto(true);

      // API key loaded from app/.env — never hardcode secrets in source files.
      const groqVisionKey = process.env.EXPO_PUBLIC_GROQ_API_KEY;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 35000);
      let response;
      try {
        response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${groqVisionKey}`,
          },
          body: JSON.stringify({
            model: 'meta-llama/llama-4-maverick-17b-128e-instruct',
            max_tokens: 500,
            messages: [
              {
                role: 'user',
                content: [
                  {
                    type: 'image_url',
                    image_url: { url: `data:image/jpeg;base64,${photo.base64}` },
                  },
                  {
                    type: 'text',
                    text: 'You are a pharmacy assistant. Look at this medicine packaging and reply with ONLY the most prominent medicine name on the packaging — this is usually the largest text, either the brand name (e.g. Strepsils, Panadol) or the generic name (e.g. Chlorphenamine, Ibuprofen). Do NOT return the manufacturer/company name, dosage, or active ingredient chemical names. One word or short name only, no explanation.',
                  },
                ],
              },
            ],
          }),
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeoutId);
      }

      const orJson = await response.json();
      const rawVisionContent = orJson.choices?.[0]?.message?.content ?? '';
      let extractedName = '';
      if (rawVisionContent.includes('</think>')) {
        // Reasoning model with closing tag — take everything after </think>
        extractedName = rawVisionContent.split('</think>').pop().trim();
      } else {
        // Reasoning model without closing tag — last meaningful line is the answer
        const lines = rawVisionContent.split('\n').map(l => l.trim()).filter(Boolean);
        extractedName = [...lines].reverse().find(
          l => !l.startsWith('<') && !l.startsWith('*') && !l.startsWith('-') && !/^\d+\./.test(l)
        ) ?? '';
      }

      if (!extractedName) return;

      const hits = searchByName(extractedName);
      if (hits.length === 0) return;

      if (hits.length === 1) {
        setMedicineName(hits[0].name ?? extractedName);
        return;
      }

      // Multiple results — show picker with DB toggle
      setPhotoHits(hits);
      setPhotoDbFilter(lang === 'ar' ? 'MA' : 'UK');
    } catch {
      setPhotoCameraVisible(false);
      setPhotoCameraReady(false);
      setCapturingPhoto(false);
    } finally {
      setProcessingPhoto(false);
      setCapturingPhoto(false);
    }
  };

  const openPrescriptionCamera = async () => {
    if (!cameraPermission?.granted) {
      const res = await requestCameraPermission();
      if (!res.granted) {
        setPrescriptionError(copy.cameraPermissionDenied);
        return;
      }
    }
    setPrescriptionError('');
    setPrescriptionCameraReady(false);
    setPrescriptionCameraVisible(true);
  };

  const capturePrescription = async () => {
    if (capturingPrescription || !prescriptionCameraRef.current) return;
    setCapturingPrescription(true);
    setPrescriptionError('');
    try {
      const photo = await prescriptionCameraRef.current.takePictureAsync({ base64: true, quality: 0.35, exif: false });
      setPrescriptionCameraVisible(false);
      setPrescriptionCameraReady(false);
      console.log('[RxScan] photo captured, base64 length:', photo?.base64?.length ?? 'MISSING');
      if (!photo?.base64) throw new Error('Missing image data');
      setProcessingPrescription(true);

      const geminiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
      const GEMINI_PROMPT = 'You are a prescription label reader. Extract medicine information from this image and return ONLY valid JSON with no extra text: {"medicineName": "name of the medicine", "dose": "dose per intake e.g. 500mg", "frequency": number of times per day as integer, "durationDays": number of days as integer or null, "instructions": "any special instructions e.g. take with food, or null"}';
      // Model names checked against the key's ListModels output on 14 October 2026
      // (gemini-1.5-flash has been retired and returned 404).
      const GEMINI_MODELS = ['gemini-3.6-flash', 'gemini-3.5-flash-lite', 'gemini-2.5-flash'];
      let response;
      let lastStatus = 0;
      for (const model of GEMINI_MODELS) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 35000);
        try {
          console.log(`[RxScan] trying model: ${model}`);
          response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{
                  parts: [
                    { text: GEMINI_PROMPT },
                    { inline_data: { mime_type: 'image/jpeg', data: photo.base64 } },
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
        lastStatus = response.status;
        console.log(`[RxScan] ${model} HTTP status:`, lastStatus);
        if (response.ok) break;
        if (response.status !== 503 && response.status !== 429) {
          const errText = await response.text();
          console.log('[RxScan] API error body:', errText);
          throw new Error('Prescription request failed');
        }
        console.log(`[RxScan] ${model} overloaded, trying next model...`);
        await new Promise(r => setTimeout(r, 1000));
      }
      if (!response.ok) {
        const errText = await response.text();
        console.log('[RxScan] all models failed, last error:', errText);
        throw new Error('Prescription request failed');
      }
      const result = await response.json();
      let raw = result.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
      console.log('[RxScan] raw model output:', raw);
      // strip markdown code fences
      raw = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
      console.log('[RxScan] cleaned raw:', raw);
      const parsed = JSON.parse(raw);
      console.log('[RxScan] parsed:', JSON.stringify(parsed));
      if (!parsed || typeof parsed.medicineName !== 'string' || !parsed.medicineName.trim()) {
        throw new Error('Invalid prescription response');
      }

      const extractedName = parsed.medicineName.trim();
      const normalizedExtracted = extractedName.toLocaleLowerCase();
      const strongMatch = searchByName(extractedName).find((medicine) => {
        const candidate = String(medicine.name || '').trim().toLocaleLowerCase();
        return candidate === normalizedExtracted
          || candidate.startsWith(`${normalizedExtracted} `)
          || normalizedExtracted.startsWith(`${candidate} `);
      });
      setPrescriptionDraft({
        medicineName: strongMatch?.name || extractedName,
        dose: parsed.dose == null ? '' : String(parsed.dose),
        frequency: String(Math.min(4, Math.max(1, Number.parseInt(parsed.frequency, 10) || 1))),
        durationDays: parsed.durationDays == null ? '' : String(parsed.durationDays),
        instructions: parsed.instructions == null ? '' : String(parsed.instructions),
      });
    } catch {
      setPrescriptionError(copy.prescriptionError);
      setPrescriptionDraft(null);
    } finally {
      setProcessingPrescription(false);
      setCapturingPrescription(false);
    }
  };

  const confirmPrescription = () => {
    if (!prescriptionDraft?.medicineName.trim()) return;
    const frequency = Math.min(4, Math.max(1, Number.parseInt(prescriptionDraft.frequency, 10) || 1));
    const parsedDuration = Number.parseInt(prescriptionDraft.durationDays, 10);
    setMedicineName(prescriptionDraft.medicineName.trim());
    setDose(prescriptionDraft.dose.trim());
    setInstructions(prescriptionDraft.instructions.trim());
    handleTimesPerDayChange(frequency);
    if (Number.isFinite(parsedDuration) && parsedDuration > 0) {
      setNoEndDate(false);
      setDurationMode('days');
      setDurationDays(String(parsedDuration));
    } else {
      setNoEndDate(true);
      setDurationDays('');
    }
    setPrescriptionDraft(null);
    setStep(2);
  };

  const handleSave = async () => {
    if (!medicineName.trim()) return;
    setSaving(true);
    try {
      const { granted } = await Notifications.requestPermissionsAsync();
      if (!granted) {
        setSaving(false);
        return;
      }
      const endDate = noEndDate ? null : durationMode === 'date'
        ? (exactDate ? exactDate.toISOString() : null)
        : (() => {
            const d = new Date();
            d.setDate(d.getDate() + parseInt(durationDays || '0', 10));
            return d.toISOString();
          })();

      const notificationIds = [];
      for (const slot of timeSlots) {
        try {
          const nid = await Notifications.scheduleNotificationAsync({
            content: {
              title: lang === 'ar' ? 'وقت الدواء 💊' : 'Medicine reminder 💊',
              body: lang === 'ar' ? `وقت تاخود ${medicineName.trim()}` : `Time to take ${medicineName.trim()}`,
            },
            trigger: { type: 'daily', hour: slot.hour, minute: slot.minute, repeats: true, channelId: 'medicine-reminders' },
          });
          notificationIds.push(nid);
        } catch { /* skip bad slot */ }
      }

      const reminder = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        medicineName: medicineName.trim(),
        dose: dose || null,
        instructions: instructions || null,
        timesPerDay,
        timeSlots,
        frequency: timesPerDay,
        times: timeSlots.map(formatTime),
        noEndDate,
        endDate,
        durationDays: noEndDate ? null : durationMode === 'days' ? parseInt(durationDays || '0', 10) : null,
        notificationIds,
        createdAt: new Date().toISOString(),
        startDate: todayKey(),
        profileId: selectedProfileId,
        profileIds: selectedProfileId ? [selectedProfileId] : [],
        notes: instructions || null,
      };

      const updated = await addReminder(reminder);
      setReminders(updated);
      setAdding(false);
    } catch {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const updated = await deleteReminder(id);
    setReminders(updated);
  };

  const refreshAdherence = async () => {
    const updated = await loadLog();
    setAdherenceLog({ ...updated });
    onAdherenceChange?.(updated, reminders);
    return updated;
  };

  const handleDateAdherence = async (reminderId, dateKey, status) => {
    const updated = await markDose(reminderId, dateKey, status);
    setAdherenceLog({ ...updated });
    onAdherenceChange?.(updated, reminders);
  };

  const handleAdherence = (reminderId, status) => handleDateAdherence(reminderId, todayKey(), status);

  const handleDateSlotAdherence = async (reminderId, dateKey, timeStr, status) => {
    const updated = await markSlotDose(reminderId, dateKey, timeStr, status);
    setAdherenceLog({ ...updated });
    onAdherenceChange?.(updated, reminders);
  };

  const handleSlotAdherence = (reminderId, timeStr, status) => handleDateSlotAdherence(reminderId, todayKey(), timeStr, status);

  const handleUpdateReminder = async (oldReminder, changes) => {
    await deleteReminder(oldReminder.id);
    const notificationIds = [];
    for (const slot of changes.timeSlots) {
      try {
        const notificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title: lang === 'ar' ? 'وقت الدواء 💊' : 'Medicine reminder 💊',
            body: lang === 'ar' ? `وقت تاخود ${changes.medicineName}` : `Time to take ${changes.medicineName}`,
          },
          trigger: { type: 'daily', hour: slot.hour, minute: slot.minute, repeats: true, channelId: 'medicine-reminders' },
        });
        notificationIds.push(notificationId);
      } catch { /* skip bad slot */ }
    }
    const updatedReminder = {
      ...oldReminder,
      ...changes,
      notificationIds,
      frequency: changes.timesPerDay,
      times: changes.timeSlots.map(formatTime),
      notes: changes.instructions ?? oldReminder.notes ?? oldReminder.instructions ?? null,
    };
    const updated = await addReminder(updatedReminder);
    setReminders(updated);
    setDetailReminder(null);
  };

  const dirStyle = { textAlign: isRTL ? 'right' : 'left' };

  const renderStep1 = () => (
    <ScrollView style={s.stepScroll} contentContainerStyle={s.stepContainer} keyboardShouldPersistTaps="handled">
      <Text style={[s.stepLabel, dirStyle]}>{copy.medicineName}</Text>
      <TextInput
        style={[s.textInput, isRTL && s.textInputRTL]}
        placeholder={copy.medicineNamePlaceholder}
        placeholderTextColor={colors.textMuted}
        value={medicineName}
        onChangeText={(v) => { setMedicineName(v); setPhotoHits([]); }}
        autoFocus
      />
      {profiles.length > 0 && (
        <View>
          <Text style={[s.stepLabel, dirStyle, { marginTop: spacing.sm }]}>{copy.linkProfile}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[s.profileChips, isRTL && s.rowReverse]}>
            {profiles.map((profile) => {
              const selected = selectedProfileId === profile.id;
              return (
                <TouchableOpacity
                  key={profile.id}
                  style={[s.profileChip, selected && s.profileChipActive, isRTL && s.rowReverse]}
                  onPress={() => setSelectedProfileId((current) => current === profile.id ? null : profile.id)}
                  activeOpacity={0.75}
                >
                  <View style={[s.profileAvatar, selected && s.profileAvatarActive]}>
                    <Text style={[s.profileAvatarText, selected && s.profileChipTextActive]}>{(profile.name || '?').slice(0, 2).toUpperCase()}</Text>
                  </View>
                  <Text style={[s.profileChipText, selected && s.profileChipTextActive]}>{profile.name}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}
      <TouchableOpacity style={[s.scanRow, isRTL && s.rowReverse]} onPress={openScanner} activeOpacity={0.75}>
        <AppIcon name="barcode-outline" size={20} color={colors.dawa} />
        <Text style={s.scanRowText}>{copy.scanBarcode}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[s.scanRow, isRTL && s.rowReverse]} onPress={openPrescriptionCamera} activeOpacity={0.75}>
        <AppIcon name="document-text-outline" size={20} color={colors.dawa} />
        <Text style={s.scanRowText}>{copy.scanPrescription}</Text>
      </TouchableOpacity>
      {processingPrescription && (
        <View style={[s.scanRow, isRTL && s.rowReverse]}>
          <ActivityIndicator size="small" color={colors.dawa} />
          <Text style={[s.scanRowText, { color: colors.textMuted }]}>{copy.readingPrescription}</Text>
        </View>
      )}
      {prescriptionError ? <Text style={[s.inlineError, dirStyle]}>{prescriptionError}</Text> : null}
      <TouchableOpacity style={[s.scanRow, isRTL && s.rowReverse]} onPress={openPhotoCamera} activeOpacity={0.75}>
        <AppIcon name="camera-outline" size={20} color={colors.dawa} />
        <Text style={s.scanRowText}>{lang === 'ar' ? 'صور العبوة' : 'Take a photo'}</Text>
      </TouchableOpacity>
      {processingPhoto && (
        <View style={[s.scanRow, isRTL && s.rowReverse]}>
          <ActivityIndicator size="small" color={colors.dawa} />
          <Text style={[s.scanRowText, { color: colors.textMuted }]}>
            {lang === 'ar' ? 'جاري التعرف على الدواء…' : 'Identifying medicine…'}
          </Text>
        </View>
      )}
      {photoHits.length > 0 && (() => {
        const hasMA = photoHits.some(m => m._db === 'MA');
        const hasUK = photoHits.some(m => m._db === 'UK');
        const filtered = photoHits.filter(m => photoDbFilter === null || m._db === photoDbFilter).slice(0, 5);
        return (
          <View style={{ marginTop: 8 }}>
            {(hasMA && hasUK) && (
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                <TouchableOpacity
                  style={[s.pill, photoDbFilter === 'MA' && s.pillActive]}
                  onPress={() => setPhotoDbFilter('MA')}
                >
                  <Text style={[s.pillText, photoDbFilter === 'MA' && s.pillTextActive]}>🇲🇦 AMMPS</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[s.pill, photoDbFilter === 'UK' && s.pillActive]}
                  onPress={() => setPhotoDbFilter('UK')}
                >
                  <Text style={[s.pillText, photoDbFilter === 'UK' && s.pillTextActive]}>🇬🇧 NHS UK</Text>
                </TouchableOpacity>
              </View>
            )}
            {filtered.map((medicine, index) => (
              <TouchableOpacity
                key={`${medicine.name}-${index}`}
                style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 12, marginBottom: 6, backgroundColor: colors.white }}
                onPress={() => { setMedicineName(medicine.name); setPhotoHits([]); }}
                activeOpacity={0.75}
              >
                <Text style={{ fontWeight: '700', color: colors.text, fontSize: 14 }}>{medicine.name}</Text>
                <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}>{medicine.active_ingredient || ''}</Text>
              </TouchableOpacity>
            ))}
          </View>
        );
      })()}
    </ScrollView>
  );

  const renderPrescriptionConfirmation = () => (
    <ScrollView style={s.stepScroll} contentContainerStyle={s.stepContainer} keyboardShouldPersistTaps="handled">
      <Text style={[s.confirmTitle, dirStyle]}>{copy.prescriptionConfirmTitle}</Text>
      {[
        ['medicineName', copy.medicineName, 'default'],
        ['dose', copy.dose, 'default'],
        ['frequency', copy.frequency, 'number-pad'],
        ['durationDays', copy.durationDaysLabel, 'number-pad'],
        ['instructions', copy.instructions, 'default'],
      ].map(([field, label, keyboardType]) => (
        <View key={field}>
          <Text style={[s.stepLabel, dirStyle]}>{label}</Text>
          <TextInput
            style={[s.textInput, isRTL && s.textInputRTL]}
            value={prescriptionDraft?.[field] ?? ''}
            onChangeText={(value) => setPrescriptionDraft((current) => ({ ...current, [field]: value }))}
            keyboardType={keyboardType}
          />
        </View>
      ))}
      <View style={[s.confirmActions, isRTL && s.rowReverse]}>
        <TouchableOpacity style={s.backBtn} onPress={() => setPrescriptionDraft(null)} activeOpacity={0.75}>
          <Text style={s.backBtnText}>{copy.cancel}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.nextBtn, !prescriptionDraft?.medicineName.trim() && s.nextBtnDisabled]}
          onPress={confirmPrescription}
          disabled={!prescriptionDraft?.medicineName.trim()}
          activeOpacity={0.8}
        >
          <Text style={s.nextBtnText}>{copy.confirmPrescription}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderStep2 = () => (
    <ScrollView style={s.stepScroll} contentContainerStyle={s.stepContainer} keyboardShouldPersistTaps="handled">
      <Text style={[s.stepLabel, dirStyle]}>{copy.timesPerDay}</Text>
      <View style={[s.pillRow, isRTL && s.rowReverse]}>
        {[1, 2, 3, 4].map((n) => (
          <TouchableOpacity
            key={n}
            style={[s.pill, timesPerDay === n && s.pillActive]}
            onPress={() => handleTimesPerDayChange(n)}
            activeOpacity={0.75}
          >
            <Text style={[s.pillText, timesPerDay === n && s.pillTextActive]}>{n}×</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={[s.stepLabel, dirStyle, { marginTop: spacing.lg }]}>{copy.times}</Text>
      {timeSlots.map((slot, i) => (
        <View key={i} style={s.slotRow}>
          <Text style={[s.slotIndex, isRTL && { marginLeft: spacing.sm, marginRight: 0 }]}>{i + 1}</Text>
          <TimePicker value={slot} onChange={(v) => updateSlot(i, v)} />
        </View>
      ))}
    </ScrollView>
  );

  const renderStep3 = () => (
    <View style={s.stepContainer}>
      <Text style={[s.stepLabel, dirStyle]}>{copy.duration}</Text>
      <TouchableOpacity style={[s.toggleRow, isRTL && s.rowReverse]} onPress={() => { setNoEndDate((v) => !v); setDurationMode('days'); }} activeOpacity={0.8}>
        <View style={[s.checkbox, noEndDate && s.checkboxActive]}>
          {noEndDate && <AppIcon name="checkmark" size={14} color={colors.white} />}
        </View>
        <Text style={[s.toggleLabel, isRTL && { marginRight: spacing.sm, marginLeft: 0 }]}>{copy.noEndDate}</Text>
      </TouchableOpacity>

      {!noEndDate && (
        <>
          <View style={[s.pillRow, isRTL && s.rowReverse]}>
            <TouchableOpacity style={[s.pill, durationMode === 'days' && s.pillActive]} onPress={() => setDurationMode('days')} activeOpacity={0.75}>
              <Text style={[s.pillText, durationMode === 'days' && s.pillTextActive]}>{lang === 'ar' ? 'عدد الأيام' : 'Days'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.pill, durationMode === 'date' && s.pillActive]} onPress={() => setDurationMode('date')} activeOpacity={0.75}>
              <Text style={[s.pillText, durationMode === 'date' && s.pillTextActive]}>{lang === 'ar' ? 'تاريخ محدد' : 'Pick date'}</Text>
            </TouchableOpacity>
          </View>

          {durationMode === 'days' && (
            <View style={[s.durationRow, isRTL && s.rowReverse]}>
              <TextInput
                style={[s.durationInput, isRTL && s.textInputRTL]}
                placeholder={copy.durationPlaceholder}
                placeholderTextColor={colors.textMuted}
                keyboardType="number-pad"
                value={durationDays}
                onChangeText={setDurationDays}
              />
              <Text style={s.durationUnit}>{copy.days}</Text>
            </View>
          )}

          {durationMode === 'date' && (
            <TouchableOpacity style={s.datePickerButton} onPress={() => setShowDatePicker(true)} activeOpacity={0.8}>
              <AppIcon name="calendar-outline" size={18} color={colors.dawa} />
              <Text style={s.datePickerText}>
                {exactDate
                  ? exactDate.toLocaleDateString(isRTL ? 'ar-MA' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                  : (lang === 'ar' ? 'اختر التاريخ' : 'Choose date')}
              </Text>
            </TouchableOpacity>
          )}
        </>
      )}

      {showDatePicker && (
        <DateTimePicker
          value={exactDate ?? new Date()}
          mode="date"
          minimumDate={new Date()}
          onChange={(_, selected) => { setShowDatePicker(false); if (selected) setExactDate(selected); }}
        />
      )}
    </View>
  );

  const canProceed = () => {
    if (step === 1) return medicineName.trim().length > 0;
    if (step === 2) return true;
    if (step === 3) return noEndDate || (durationMode === 'date' ? exactDate != null : durationDays.length > 0 && parseInt(durationDays, 10) > 0);
    return false;
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={s.root}>
        {/* Header */}
        <View style={[s.header, isRTL && s.rowReverse]}>
          <TouchableOpacity style={s.headerClose} onPress={onClose} activeOpacity={0.75}>
            <AppIcon name="close" size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>{copy.title}</Text>
          <View style={{ width: 36 }} />
        </View>

        {!adding ? (
          <>
            {!profileId && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterBar} contentContainerStyle={[s.filterContent, isRTL && s.rowReverse]}>
                <TouchableOpacity style={[s.filterChip, profileFilter === null && s.filterChipActive]} onPress={() => setProfileFilter(null)}>
                  <Text style={[s.filterChipText, profileFilter === null && s.filterChipTextActive]}>{copy.allProfiles}</Text>
                </TouchableOpacity>
                {profiles.map((profile) => (
                  <TouchableOpacity key={profile.id} style={[s.filterChip, profileFilter === profile.id && s.filterChipActive]} onPress={() => setProfileFilter(profile.id)}>
                    <Text style={[s.filterChipText, profileFilter === profile.id && s.filterChipTextActive]}>{profile.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
            <ScrollView style={s.list} contentContainerStyle={s.listContent}>
              {reminders.filter((reminder) => profileFilter === null || reminder.profileIds?.includes(profileFilter) || reminder.profileId === profileFilter).length === 0 ? (
                <Text style={[s.empty, dirStyle]}>{copy.noReminders}</Text>
              ) : (
                reminders.filter((reminder) => profileFilter === null || reminder.profileIds?.includes(profileFilter) || reminder.profileId === profileFilter).map((r) => (
                  <View key={r.id} style={[s.card, isRTL && s.cardRTL]}>
                    <View style={[s.cardTop, isRTL && s.rowReverse]}>
                      <View style={s.cardIcon}>
                        <AppIcon name="alarm-outline" size={20} color={colors.dawa} />
                      </View>
                      <View style={s.cardBody}>
                        <Text style={[s.cardName, dirStyle]}>{r.medicineName}</Text>
                        <Text style={[s.cardMeta, dirStyle]}>
                          {copy.daily(r.timesPerDay)} · {r.timeSlots.map(formatTime).join(', ')}
                        </Text>
                        <Text style={[s.cardMeta, dirStyle]}>
                          {r.noEndDate ? copy.forever : r.durationDays ? copy.forDays(r.durationDays) : new Date(r.endDate).toLocaleDateString(isRTL ? 'ar-MA' : 'en-GB')}
                        </Text>
                      </View>
                      <View style={[s.cardActions, isRTL && s.rowReverse]}>
                        <TouchableOpacity style={s.deleteBtn} onPress={() => setDetailReminder(r)} accessibilityLabel={lang === 'ar' ? 'تعديل التذكير' : 'Edit reminder'}>
                          <AppIcon name="create-outline" size={19} color={colors.dawa} />
                        </TouchableOpacity>
                        <TouchableOpacity style={s.deleteBtn} onPress={() => setDoseTrackingReminder(r)} accessibilityLabel={copy.trackDoses}>
                          <AppIcon name="checkmark-circle-outline" size={19} color={colors.dawa} />
                        </TouchableOpacity>
                        <TouchableOpacity style={s.deleteBtn} onPress={() => handleDelete(r.id)} accessibilityLabel={copy.deleteLabel}>
                          <AppIcon name="trash-outline" size={19} color={colors.danger} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
            <View style={[s.fab, { bottom: insets.bottom + 24 }]}>
              <TouchableOpacity style={s.fabBtn} onPress={startAdding} activeOpacity={0.85}>
                <AppIcon name="add" size={24} color={colors.white} />
                <Text style={s.fabText}>{copy.addReminder}</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            {/* Step indicator */}
            <View style={[s.steps, isRTL && s.rowReverse]}>
              {[1, 2, 3].map((n) => (
                <View key={n} style={[s.stepDot, step >= n && s.stepDotActive]}>
                  <Text style={[s.stepDotText, step >= n && s.stepDotTextActive]}>{n}</Text>
                </View>
              ))}
            </View>
            <Text style={[s.stepTitle, dirStyle]}>
              {step === 1 ? copy.step1 : step === 2 ? copy.step2 : copy.step3}
            </Text>

            <View style={s.flex}>
              {step === 1 && (prescriptionDraft ? renderPrescriptionConfirmation() : renderStep1())}
              {step === 2 && renderStep2()}
              {step === 3 && renderStep3()}
            </View>

            {/* Navigation buttons */}
            {!prescriptionDraft && <View style={[s.navRow, isRTL && s.rowReverse, { paddingBottom: insets.bottom + 16 }]}>
              <TouchableOpacity style={s.backBtn} onPress={step === 1 ? cancelAdding : () => setStep((v) => v - 1)} activeOpacity={0.75}>
                <Text style={s.backBtnText}>{step === 1 ? copy.cancel : copy.back}</Text>
              </TouchableOpacity>
              {step < 3 ? (
                <TouchableOpacity style={[s.nextBtn, !canProceed() && s.nextBtnDisabled]} onPress={() => setStep((v) => v + 1)} disabled={!canProceed()} activeOpacity={0.8}>
                  <Text style={s.nextBtnText}>{copy.next}</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={[s.nextBtn, (!canProceed() || saving) && s.nextBtnDisabled]} onPress={handleSave} disabled={!canProceed() || saving} activeOpacity={0.8}>
                  {saving ? <ActivityIndicator size="small" color={colors.white} /> : <Text style={s.nextBtnText}>{copy.save}</Text>}
                </TouchableOpacity>
              )}
            </View>}
          </KeyboardAvoidingView>
        )}

        <ReminderDetailModal
          visible={detailReminder !== null}
          reminder={detailReminder}
          lang={lang}
          onClose={() => setDetailReminder(null)}
          onSave={async (reminder, changes) => {
            await handleUpdateReminder(reminder, changes);
            setDetailReminder(null);
          }}
        />

        <DoseTrackingModal
          reminder={doseTrackingReminder}
          lang={lang}
          adherenceLog={adherenceLog}
          onClose={() => setDoseTrackingReminder(null)}
          onSingleDose={handleDateAdherence}
          onSlotDose={handleSlotAdherence}
          onDateSlotDose={handleDateSlotAdherence}
          onRefreshLog={refreshAdherence}
        />

        {/* Barcode scanner overlay */}
        {scannerVisible && (
          <View style={{ position: 'absolute', top: 0, left: 0, width: SW, height: SH, zIndex: 999 }}>
            <CameraView
              style={{ width: SW, height: SH }}
              facing="back"
              barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8'] }}
              onBarcodeScanned={handleBarcodeScan}
            />
            <Text style={s.scanInstruction}>{copy.scanInstruction}</Text>
            <TouchableOpacity style={[s.cancelScanBtn, { bottom: insets.bottom + 28 }]} onPress={() => setScannerVisible(false)} activeOpacity={0.8}>
              <Text style={s.cancelScanText}>{copy.cancelScan}</Text>
            </TouchableOpacity>
          </View>
        )}
        <Modal
          visible={photoCameraVisible}
          animationType="slide"
          transparent={false}
          onRequestClose={() => { setPhotoCameraVisible(false); setCapturingPhoto(false); setPhotoCameraReady(false); }}
        >
          <View style={{ flex: 1, backgroundColor: '#000' }}>
            <CameraView
              ref={photoCameraRef}
              style={{ flex: 1 }}
              facing="back"
              mode="picture"
              onCameraReady={() => setPhotoCameraReady(true)}
              onMountError={() => { setPhotoCameraVisible(false); setCapturingPhoto(false); setPhotoCameraReady(false); }}
            />
            <TouchableOpacity
              style={[s.cancelScanBtn, { position: 'absolute', top: insets.top + 14, left: 16, bottom: undefined }]}
              onPress={() => { setPhotoCameraVisible(false); setCapturingPhoto(false); setPhotoCameraReady(false); }}
              activeOpacity={0.8}
            >
              <AppIcon name="close" size={20} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.photoCaptureBtn, { position: 'absolute', bottom: insets.bottom + 28, alignSelf: 'center', left: (SW - 70) / 2 }, (!photoCameraReady || capturingPhoto) && { opacity: 0.4 }]}
              onPress={captureAndIdentify}
              disabled={!photoCameraReady || capturingPhoto}
              activeOpacity={0.8}
            >
              {capturingPhoto
                ? <ActivityIndicator size="small" color={colors.dawa} />
                : <View style={s.photoCaptureInner} />}
            </TouchableOpacity>
          </View>
        </Modal>
        <Modal
          visible={prescriptionCameraVisible}
          animationType="slide"
          transparent={false}
          onRequestClose={() => { setPrescriptionCameraVisible(false); setCapturingPrescription(false); setPrescriptionCameraReady(false); }}
        >
          <View style={{ flex: 1, backgroundColor: '#000' }}>
            <CameraView
              ref={prescriptionCameraRef}
              style={{ flex: 1 }}
              facing="back"
              mode="picture"
              onCameraReady={() => setPrescriptionCameraReady(true)}
              onMountError={() => { setPrescriptionCameraVisible(false); setPrescriptionError(copy.prescriptionError); }}
            />
            <TouchableOpacity
              style={[s.cancelScanBtn, { position: 'absolute', top: insets.top + 14, left: 16, bottom: undefined }]}
              onPress={() => { setPrescriptionCameraVisible(false); setCapturingPrescription(false); setPrescriptionCameraReady(false); }}
              activeOpacity={0.8}
            >
              <AppIcon name="close" size={20} color={colors.text} />
            </TouchableOpacity>
            <Text style={s.scanInstruction}>{copy.scanPrescription}</Text>
            <TouchableOpacity
              style={[s.photoCaptureBtn, { bottom: insets.bottom + 28, left: (SW - 70) / 2 }, (!prescriptionCameraReady || capturingPrescription) && { opacity: 0.4 }]}
              onPress={capturePrescription}
              disabled={!prescriptionCameraReady || capturingPrescription}
              activeOpacity={0.8}
            >
              {capturingPrescription
                ? <ActivityIndicator size="small" color={colors.dawa} />
                : <View style={s.photoCaptureInner} />}
            </TouchableOpacity>
          </View>
        </Modal>
      </SafeAreaView>
    </Modal>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.canvas },
  flex: { flex: 1 },
  rowReverse: { flexDirection: 'row-reverse' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  headerClose: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  filterBar: { flexGrow: 0, borderBottomWidth: 1, borderBottomColor: colors.border },
  filterContent: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, gap: spacing.sm },
  filterChip: { borderRadius: radii.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white, paddingHorizontal: spacing.md, paddingVertical: 8 },
  filterChipActive: { backgroundColor: colors.dawa, borderColor: colors.dawa },
  filterChipText: { ...type.caption, color: colors.textMuted },
  filterChipTextActive: { color: colors.white },
  list: { flex: 1 },
  listContent: { padding: spacing.lg, paddingBottom: 100 },
  empty: { ...type.body, color: colors.textMuted, marginTop: spacing.xl },
  card: { backgroundColor: colors.white, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md, overflow: 'hidden' },
  cardTop: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, gap: spacing.sm },
  cardActions: { flexDirection: 'row', alignItems: 'center' },
  markRow: { flexDirection: 'row', gap: spacing.sm },
  markBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 7, borderRadius: radii.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white },
  markBtnTaken: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
  markBtnSkipped: { backgroundColor: '#F44336', borderColor: '#F44336' },
  adherenceButtonDisabled: { opacity: 0.35 },
  markBtnText: { fontSize: 12, fontWeight: '700', color: colors.text },
  cardRTL: {},
  cardIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.dawaSoft, alignItems: 'center', justifyContent: 'center' },
  cardBody: { flex: 1 },
  cardName: { ...type.bodyStrong, color: colors.text },
  cardMeta: { ...type.caption, color: colors.textMuted, marginTop: 2 },
  listAdherenceRow: { flexDirection: 'row', paddingHorizontal: spacing.md, paddingBottom: spacing.sm },
  slotAdherenceColumn: { paddingHorizontal: 12, paddingBottom: 8, gap: 6 },
  slotAdherenceRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  slotTimeLabel: { fontSize: 13, fontWeight: '600', color: colors.textMuted, width: 48 },
  pastSlotOverlay: { flex: 1, justifyContent: 'center', padding: spacing.lg, backgroundColor: 'rgba(0,0,0,0.5)' },
  pastSlotCard: { backgroundColor: colors.white, borderRadius: 16, padding: spacing.lg, gap: spacing.sm },
  pastSlotTitle: { fontSize: 17, fontWeight: '800', color: colors.text },
  pastSlotSubtitle: { fontSize: 13, color: colors.textMuted, marginBottom: spacing.sm },
  pastSlotRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  clearDoseText: { ...type.caption, color: colors.dawa, fontWeight: '700' },
  pastSlotCloseButton: { alignItems: 'center', paddingVertical: 12, borderRadius: radii.md, backgroundColor: colors.dawa, marginTop: spacing.sm },
  pastSlotCloseText: { ...type.bodyStrong, color: colors.white },
  listTakenBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: radii.pill, borderWidth: 1, borderColor: '#BBE3C8', backgroundColor: '#F0FDF4', paddingHorizontal: 10, paddingVertical: 6 },
  listTakenBtnActive: { backgroundColor: '#22c55e', borderColor: '#22c55e' },
  listTakenBtnText: { fontSize: 11, fontWeight: '700', color: '#16a34a' },
  missedBanner: { marginHorizontal: spacing.md, marginBottom: spacing.md, padding: spacing.sm, borderRadius: radii.sm, borderWidth: 1, borderColor: '#F4C27A', backgroundColor: '#FFF7E8' },
  missedBannerText: { fontSize: 12, fontWeight: '700', color: '#B45309', marginBottom: 7 },
  missedActions: { flexDirection: 'row', gap: spacing.sm },
  missedYesBtn: { borderRadius: radii.pill, backgroundColor: '#F59E0B', paddingHorizontal: 10, paddingVertical: 5 },
  missedYesText: { fontSize: 10, fontWeight: '800', color: colors.white },
  missedNoBtn: { borderRadius: radii.pill, borderWidth: 1, borderColor: '#F4C27A', backgroundColor: colors.white, paddingHorizontal: 10, paddingVertical: 5 },
  missedNoText: { fontSize: 10, fontWeight: '800', color: '#B45309' },
  deleteBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  fab: { position: 'absolute', left: spacing.lg, right: spacing.lg },
  fabBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, backgroundColor: colors.dawa, borderRadius: radii.md, padding: 15 },
  fabText: { ...type.bodyStrong, color: colors.white },
  steps: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, paddingTop: spacing.lg },
  stepDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  stepDotActive: { backgroundColor: colors.dawa, borderColor: colors.dawa },
  stepDotText: { fontSize: 12, fontWeight: '700', color: colors.textMuted },
  stepDotTextActive: { color: colors.white },
  stepTitle: { fontSize: 20, fontWeight: '800', color: colors.text, paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.xs },
  stepContainer: { padding: spacing.lg, gap: spacing.md },
  stepScroll: { flex: 1 },
  stepLabel: { ...type.eyebrow, color: colors.textMuted, marginBottom: spacing.xs },
  textInput: { borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, padding: spacing.md, fontSize: 16, color: colors.text, backgroundColor: colors.white },
  textInputRTL: { textAlign: 'right' },
  profileChips: { gap: spacing.sm, paddingVertical: spacing.xs },
  profileChip: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: radii.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white, paddingHorizontal: 8, paddingVertical: 6 },
  profileChipActive: { backgroundColor: colors.dawa, borderColor: colors.dawa },
  profileAvatar: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.dawaSoft },
  profileAvatarActive: { backgroundColor: 'rgba(255,255,255,0.2)' },
  profileAvatarText: { fontSize: 10, fontWeight: '800', color: colors.dawa },
  profileChipText: { ...type.caption, color: colors.text },
  profileChipTextActive: { color: colors.white },
  scanRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm },
  scanRowText: { ...type.bodyStrong, color: colors.dawa },
  inlineError: { ...type.caption, color: colors.danger, marginTop: -spacing.xs },
  confirmTitle: { fontSize: 19, fontWeight: '800', color: colors.text, marginBottom: spacing.sm },
  confirmActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  pillRow: { flexDirection: 'row', gap: spacing.sm },
  pill: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white },
  pillActive: { backgroundColor: colors.dawa, borderColor: colors.dawa },
  pillText: { fontSize: 15, fontWeight: '700', color: colors.textMuted },
  pillTextActive: { color: colors.white },
  slotRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  slotIndex: { fontSize: 13, fontWeight: '600', color: colors.textMuted, width: 20, marginRight: spacing.sm },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white },
  checkboxActive: { backgroundColor: colors.dawa, borderColor: colors.dawa },
  toggleLabel: { ...type.body, color: colors.text, marginLeft: spacing.sm },
  durationRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  durationInput: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, padding: spacing.md, fontSize: 16, color: colors.text, backgroundColor: colors.white },
  durationUnit: { ...type.body, color: colors.textMuted },
  datePickerButton: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, padding: spacing.md, backgroundColor: colors.white },
  datePickerText: { ...type.body, color: colors.text },
  photoCaptureBtn: { position: 'absolute', alignSelf: 'center', width: 70, height: 70, borderRadius: 35, backgroundColor: 'rgba(255,255,255,0.92)', alignItems: 'center', justifyContent: 'center' },
  photoCaptureInner: { width: 54, height: 54, borderRadius: 27, backgroundColor: colors.dawa },
  navRow: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  backBtn: { flex: 1, alignItems: 'center', paddingVertical: 13, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white },
  backBtnText: { ...type.bodyStrong, color: colors.text },
  nextBtn: { flex: 2, alignItems: 'center', paddingVertical: 13, borderRadius: radii.md, backgroundColor: colors.dawa },
  nextBtnDisabled: { opacity: 0.45 },
  nextBtnText: { ...type.bodyStrong, color: colors.white },
  scanInstruction: { position: 'absolute', bottom: 120, alignSelf: 'center', color: 'rgba(255,255,255,0.9)', fontSize: 14, fontWeight: '600', textAlign: 'center', paddingHorizontal: 24 },
  cancelScanBtn: { position: 'absolute', alignSelf: 'center', backgroundColor: 'rgba(255,255,255,0.92)', paddingHorizontal: 32, paddingVertical: 13, borderRadius: 30 },
  cancelScanText: { fontSize: 15, fontWeight: '700', color: colors.text },
  detailRoot: { flex: 1, backgroundColor: colors.canvas },
  detailContent: { padding: spacing.lg, paddingBottom: 48, gap: spacing.md },
  detailSectionTitle: { fontSize: 19, fontWeight: '800', color: colors.text },
  detailDivider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.md },
  trackingHeaderCopy: { flex: 1, minWidth: 0 },
  trackingSubtitle: { ...type.caption, color: colors.textMuted, marginTop: 2 },
  trackingDoseRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  monthNavigation: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  monthButton: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 19, backgroundColor: colors.dawaSoft },
  monthLabel: { ...type.bodyStrong, color: colors.text },
  monthGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  monthDayCell: { width: '14.2857%', alignItems: 'center', paddingVertical: 6 },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -3 },
  calendarCell: { width: '20%', alignItems: 'center', paddingVertical: 6 },
  calendarDot: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.border },
  calendarTaken: { backgroundColor: '#4CAF50' },
  calendarSkipped: { backgroundColor: '#F44336' },
  calendarPartial: { backgroundColor: '#F59E0B' },
  calendarToday: { borderWidth: 2, borderColor: colors.dawa },
  calendarFuture: { opacity: 0.35 },
  calendarDayText: { fontSize: 11, fontWeight: '700', color: colors.textMuted },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
  summaryText: { flex: 1, ...type.caption, fontWeight: '700', color: colors.textMuted },
});
