import { useEffect, useState } from 'react';
import {
  Alert,
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
import AppIcon from '../components/AppIcon';
import { colors, radii, shadows, spacing, type } from '../theme/theme';
import { createEmptyProfile } from '../utils/userProfile';

const CONDITION_OPTIONS = [
  'Diabetes',
  'Hypertension',
  'Asthma',
  'Heart disease',
  'Kidney disease',
];

const COPY = {
  en: {
    title: 'Profiles',
    addProfile: '+ Add Profile',
    editProfile: 'Edit Profile',
    newProfile: 'New Profile',
    noProfiles: 'No profiles yet. Add one below.',
    profileFallback: 'Profile',
    save: 'Save Profile',
    saveError: 'Could not save the profile. Please try again.',
    delete: 'Delete',
    edit: 'Edit',
    confirmDelete: 'Delete this profile?',
    confirmDeleteMsg: 'This cannot be undone.',
    cancel: 'Cancel',
    back: 'Back',
    name: 'Name',
    age: 'Age',
    sex: 'Sex',
    male: 'Male',
    female: 'Female',
    conditions: 'Chronic conditions',
    conditionLabels: {
      Diabetes: 'Diabetes',
      Hypertension: 'Hypertension',
      Asthma: 'Asthma',
      'Heart disease': 'Heart disease',
      'Kidney disease': 'Kidney disease',
    },
    other: 'Other condition',
    medications: 'Regular medications',
    medicationPlaceholder: 'Type medicine name',
    clinicalSafety: 'Clinical Safety',
    allergies: 'Allergies',
    allergyPlaceholder: 'Add an allergy or medicine',
    removeAllergy: 'Remove allergy',
    pregnancyStatus: 'Pregnancy status',
    pregnancyNotApplicable: 'N/A',
    pregnant: 'Pregnant',
    breastfeeding: 'Breastfeeding',
    weight: 'Weight (kg)',
    weightPlaceholder: 'e.g. 65',
    adverseReactions: 'Past adverse reactions',
    adverseReactionPlaceholder: 'Describe a past bad reaction',
    removeAdverseReaction: 'Remove adverse reaction',
    scan: 'Scan barcode',
    photo: 'Take photo',
    add: 'Add',
    removeMedication: 'Remove medication',
    preferredLang: 'Preferred language',
    langEn: 'English',
    langAr: 'عربية',
  },
  ar: {
    title: 'الملفات الشخصية',
    addProfile: '+ إضافة ملف',
    editProfile: 'تعديل الملف',
    newProfile: 'ملف جديد',
    noProfiles: 'ما كاين تا ملف. زيد واحد.',
    profileFallback: 'ملف',
    save: 'حفظ الملف',
    saveError: 'ما قدرناش نحفظو الملف. عاود المحاولة.',
    delete: 'مسح',
    edit: 'تعديل',
    confirmDelete: 'تمسح هاد الملف؟',
    confirmDeleteMsg: 'ما يمكنش التراجع.',
    cancel: 'إلغاء',
    back: 'رجوع',
    name: 'الاسم',
    age: 'العمر',
    sex: 'الجنس',
    male: 'ذكر',
    female: 'أنثى',
    conditions: 'الأمراض المزمنة',
    conditionLabels: {
      Diabetes: 'السكري',
      Hypertension: 'ضغط الدم',
      Asthma: 'الربو',
      'Heart disease': 'مرض القلب',
      'Kidney disease': 'مرض الكلي',
    },
    other: 'مرض آخر',
    medications: 'الأدوية اللي كتاخد بانتظام',
    medicationPlaceholder: 'كتب سميت الدوا',
    clinicalSafety: 'السلامة الطبية',
    allergies: 'الحساسيات',
    allergyPlaceholder: 'زيد حساسية أو دواء',
    removeAllergy: 'حيد الحساسية',
    pregnancyStatus: 'حالة الحمل',
    pregnancyNotApplicable: 'ما كينطبقش',
    pregnant: 'حامل',
    breastfeeding: 'كترضّع',
    weight: 'الوزن (كلغ)',
    weightPlaceholder: 'مثلا 65',
    adverseReactions: 'تفاعلات خايبة سابقة',
    adverseReactionPlaceholder: 'وصف تفاعل خايب وقع من قبل',
    removeAdverseReaction: 'حيد التفاعل',
    scan: 'سكان الباركود',
    photo: 'صور الدوا',
    add: 'زيد',
    removeMedication: 'حيد الدوا',
    preferredLang: 'اللغة المفضلة',
    langEn: 'English',
    langAr: 'عربية',
  },
};

function getInitialForm(profile) {
  const conditions = Array.isArray(profile?.conditions) ? profile.conditions : [];
  return {
    ...profile,
    name: profile?.name || '',
    age: profile?.age ? String(profile.age) : '',
    sex: profile?.sex || '',
    preferredLang: profile?.preferredLang === 'ar' ? 'ar' : 'en',
    conditions: conditions.filter((condition) => CONDITION_OPTIONS.includes(condition)),
    otherCondition: conditions.filter((condition) => !CONDITION_OPTIONS.includes(condition)).join(', '),
    medications: Array.isArray(profile?.medications) ? profile.medications : [],
    allergies: Array.isArray(profile?.allergies) ? profile.allergies : [],
    pregnancyStatus: ['not_applicable', 'pregnant', 'breastfeeding'].includes(profile?.pregnancyStatus)
      ? profile.pregnancyStatus
      : null,
    weight: profile?.weight != null ? String(profile.weight) : '',
    adverseReactions: Array.isArray(profile?.adverseReactions) ? profile.adverseReactions : [],
  };
}

export default function ProfilesScreen({
  visible,
  onClose,
  profiles,
  onSaveProfiles,
  lang,
  onAddMedicationByScan,
  onAddMedicationByPhoto,
  pendingMedication,
  onPendingMedicationConsumed,
}) {
  const [editingProfile, setEditingProfile] = useState(null);
  const [form, setForm] = useState(() => getInitialForm(createEmptyProfile()));
  const [medicationInput, setMedicationInput] = useState('');
  const [allergyInput, setAllergyInput] = useState('');
  const [adverseReactionInput, setAdverseReactionInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const isRTL = lang === 'ar';
  const copy = COPY[lang] ?? COPY.en;
  const directionStyle = { textAlign: isRTL ? 'right' : 'left' };

  useEffect(() => {
    const medicineName = String(pendingMedication || '').trim();
    if (!medicineName || !editingProfile) return;
    setForm((current) => {
      const alreadyAdded = current.medications.some(
        (medicine) => medicine.toLocaleLowerCase() === medicineName.toLocaleLowerCase()
      );
      return alreadyAdded ? current : { ...current, medications: [...current.medications, medicineName] };
    });
    onPendingMedicationConsumed();
  }, [editingProfile, onPendingMedicationConsumed, pendingMedication]);

  const beginEdit = (profile) => {
    setEditingProfile(profile);
    setForm(getInitialForm(profile));
    setMedicationInput('');
    setAllergyInput('');
    setAdverseReactionInput('');
    setSaveError(false);
  };

  const leaveForm = () => {
    setEditingProfile(null);
    setMedicationInput('');
    setAllergyInput('');
    setAdverseReactionInput('');
    setSaveError(false);
  };

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const toggleCondition = (condition) => {
    setForm((current) => ({
      ...current,
      conditions: current.conditions.includes(condition)
        ? current.conditions.filter((item) => item !== condition)
        : [...current.conditions, condition],
    }));
  };

  const addTypedMedication = () => {
    const medicineName = medicationInput.trim();
    if (!medicineName) return;
    setForm((current) => {
      const alreadyAdded = current.medications.some(
        (medicine) => medicine.toLocaleLowerCase() === medicineName.toLocaleLowerCase()
      );
      return alreadyAdded ? current : { ...current, medications: [...current.medications, medicineName] };
    });
    setMedicationInput('');
  };

  const removeMedication = (index) => {
    setForm((current) => ({
      ...current,
      medications: current.medications.filter((_, medicationIndex) => medicationIndex !== index),
    }));
  };

  const addListItem = (field, value, clearInput) => {
    const item = value.trim();
    if (!item) return;
    setForm((current) => {
      const alreadyAdded = current[field].some(
        (existing) => existing.toLocaleLowerCase() === item.toLocaleLowerCase()
      );
      return alreadyAdded ? current : { ...current, [field]: [...current[field], item] };
    });
    clearInput('');
  };

  const removeListItem = (field, index) => {
    setForm((current) => ({
      ...current,
      [field]: current[field].filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const submitProfile = async () => {
    const otherCondition = form.otherCondition.trim();
    const parsedWeight = Number.parseFloat(form.weight);
    const profile = {
      id: editingProfile.id,
      name: form.name.trim(),
      age: form.age.trim(),
      sex: form.sex,
      preferredLang: form.preferredLang,
      conditions: otherCondition ? [...form.conditions, otherCondition] : form.conditions,
      medications: form.medications,
      allergies: form.allergies,
      pregnancyStatus: form.sex === 'male' ? 'not_applicable' : form.pregnancyStatus,
      weight: Number.isFinite(parsedWeight) && parsedWeight > 0 ? parsedWeight : null,
      adverseReactions: form.adverseReactions,
    };
    const exists = profiles.some((item) => item.id === profile.id);
    const updatedProfiles = exists
      ? profiles.map((item) => (item.id === profile.id ? profile : item))
      : [...profiles, profile];

    setSaving(true);
    setSaveError(false);
    try {
      await onSaveProfiles(updatedProfiles);
      leaveForm();
    } catch {
      setSaveError(true);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (profile) => {
    Alert.alert(copy.confirmDelete, copy.confirmDeleteMsg, [
      { text: copy.cancel, style: 'cancel' },
      {
        text: copy.delete,
        style: 'destructive',
        onPress: async () => {
          try {
            await onSaveProfiles(profiles.filter((item) => item.id !== profile.id));
          } catch {
            Alert.alert(copy.saveError);
          }
        },
      },
    ]);
  };

  const handleClose = () => {
    leaveForm();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={editingProfile ? leaveForm : handleClose}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={[styles.header, isRTL && styles.rowReverse]}>
            <TouchableOpacity style={[styles.backButton, isRTL && styles.rowReverse]} onPress={editingProfile ? leaveForm : handleClose}>
              <AppIcon name={isRTL ? 'arrow-forward' : 'arrow-back'} size={20} color={colors.text} />
              <Text style={styles.backText}>{copy.back}</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{editingProfile ? (profiles.some((p) => p.id === editingProfile.id) ? copy.editProfile : copy.newProfile) : copy.title}</Text>
            <View style={styles.headerSpacer} />
          </View>

          {editingProfile ? (
            <ScrollView contentContainerStyle={styles.formContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <Text style={[styles.fieldLabel, directionStyle]}>{copy.name}</Text>
              <TextInput style={[styles.input, directionStyle]} value={form.name} onChangeText={(value) => updateField('name', value)} placeholder={copy.name} placeholderTextColor={colors.textSubtle} />

              <Text style={[styles.fieldLabel, directionStyle]}>{copy.age}</Text>
              <TextInput style={[styles.input, directionStyle]} value={form.age} onChangeText={(value) => updateField('age', value.replace(/[^0-9]/g, ''))} placeholder={copy.age} placeholderTextColor={colors.textSubtle} keyboardType="numeric" maxLength={3} />

              <Text style={[styles.fieldLabel, directionStyle]}>{copy.sex}</Text>
              <View style={[styles.sexRow, isRTL && styles.rowReverse]}>
                {['male', 'female'].map((sex) => {
                  const selected = form.sex === sex;
                  return (
                    <TouchableOpacity
                      key={sex}
                      style={[styles.sexButton, selected && styles.sexButtonSelected]}
                      onPress={() => setForm((current) => ({
                        ...current,
                        sex,
                        pregnancyStatus: sex === 'male' ? 'not_applicable' : current.pregnancyStatus,
                      }))}
                    >
                      <Text style={[styles.sexButtonText, selected && styles.sexButtonTextSelected]}>{copy[sex]}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={[styles.fieldLabel, directionStyle]}>{copy.preferredLang}</Text>
              <View style={[styles.segmentedRow, isRTL && styles.rowReverse]}>
                {[
                  ['en', copy.langEn],
                  ['ar', copy.langAr],
                ].map(([value, label]) => {
                  const selected = form.preferredLang === value;
                  return (
                    <TouchableOpacity
                      key={value}
                      style={[styles.segmentButton, selected && styles.sexButtonSelected]}
                      onPress={() => updateField('preferredLang', value)}
                    >
                      <Text style={[styles.segmentText, selected && styles.sexButtonTextSelected]}>{label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={[styles.fieldLabel, directionStyle]}>{copy.conditions}</Text>
              {CONDITION_OPTIONS.map((condition) => {
                const selected = form.conditions.includes(condition);
                return (
                  <TouchableOpacity key={condition} style={[styles.checkboxRow, isRTL && styles.rowReverse]} onPress={() => toggleCondition(condition)} activeOpacity={0.72}>
                    <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
                      {selected && <AppIcon name="checkmark" size={14} color={colors.white} />}
                    </View>
                    <Text style={[styles.checkboxLabel, directionStyle]}>{copy.conditionLabels[condition]}</Text>
                  </TouchableOpacity>
                );
              })}
              <TextInput style={[styles.input, directionStyle]} value={form.otherCondition} onChangeText={(value) => updateField('otherCondition', value)} placeholder={copy.other} placeholderTextColor={colors.textSubtle} />

              <Text style={[styles.fieldLabel, directionStyle]}>{copy.medications}</Text>
              {form.medications.map((medicine, index) => (
                <View key={`${medicine}-${index}`} style={[styles.medicationRow, isRTL && styles.rowReverse]}>
                  <Text style={[styles.medicationName, directionStyle]}>{medicine}</Text>
                  <TouchableOpacity style={styles.removeMedicationButton} onPress={() => removeMedication(index)} accessibilityLabel={`${copy.removeMedication}: ${medicine}`}>
                    <AppIcon name="close" size={17} color={colors.danger} />
                  </TouchableOpacity>
                </View>
              ))}
              <View style={[styles.medicationActions, isRTL && styles.rowReverse]}>
                <TouchableOpacity style={styles.secondaryButton} onPress={onAddMedicationByScan}>
                  <AppIcon name="barcode-outline" size={17} color={colors.dawa} />
                  <Text style={styles.secondaryButtonText}>{copy.scan}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.secondaryButton} onPress={onAddMedicationByPhoto}>
                  <AppIcon name="camera-outline" size={17} color={colors.dawa} />
                  <Text style={styles.secondaryButtonText}>{copy.photo}</Text>
                </TouchableOpacity>
              </View>
              <View style={[styles.addMedicationRow, isRTL && styles.rowReverse]}>
                <TextInput style={[styles.input, styles.medicationInput, directionStyle]} value={medicationInput} onChangeText={setMedicationInput} placeholder={copy.medicationPlaceholder} placeholderTextColor={colors.textSubtle} onSubmitEditing={addTypedMedication} />
                <TouchableOpacity style={styles.addButton} onPress={addTypedMedication}>
                  <Text style={styles.addButtonText}>{copy.add}</Text>
                </TouchableOpacity>
              </View>

              <Text style={[styles.sectionTitle, directionStyle]}>{copy.clinicalSafety}</Text>

              <Text style={[styles.fieldLabel, directionStyle]}>{copy.allergies}</Text>
              {form.allergies.map((allergy, index) => (
                <View key={`${allergy}-${index}`} style={[styles.medicationRow, isRTL && styles.rowReverse]}>
                  <Text style={[styles.medicationName, directionStyle]}>{allergy}</Text>
                  <TouchableOpacity
                    style={styles.removeMedicationButton}
                    onPress={() => removeListItem('allergies', index)}
                    accessibilityLabel={`${copy.removeAllergy}: ${allergy}`}
                  >
                    <AppIcon name="close" size={17} color={colors.danger} />
                  </TouchableOpacity>
                </View>
              ))}
              <View style={[styles.addMedicationRow, isRTL && styles.rowReverse]}>
                <TextInput
                  style={[styles.input, styles.medicationInput, directionStyle]}
                  value={allergyInput}
                  onChangeText={setAllergyInput}
                  placeholder={copy.allergyPlaceholder}
                  placeholderTextColor={colors.textSubtle}
                  onSubmitEditing={() => addListItem('allergies', allergyInput, setAllergyInput)}
                />
                <TouchableOpacity style={styles.addButton} onPress={() => addListItem('allergies', allergyInput, setAllergyInput)}>
                  <Text style={styles.addButtonText}>{copy.add}</Text>
                </TouchableOpacity>
              </View>

              {form.sex !== 'male' ? (
                <>
                  <Text style={[styles.fieldLabel, directionStyle]}>{copy.pregnancyStatus}</Text>
                  <View style={[styles.segmentedRow, isRTL && styles.rowReverse]}>
                    {[
                      ['not_applicable', copy.pregnancyNotApplicable],
                      ['pregnant', copy.pregnant],
                      ['breastfeeding', copy.breastfeeding],
                    ].map(([value, label]) => {
                      const selected = form.pregnancyStatus === value;
                      return (
                        <TouchableOpacity
                          key={value}
                          style={[styles.segmentButton, selected && styles.sexButtonSelected]}
                          onPress={() => updateField('pregnancyStatus', value)}
                        >
                          <Text style={[styles.segmentText, selected && styles.sexButtonTextSelected]}>{label}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </>
              ) : null}

              <Text style={[styles.fieldLabel, directionStyle]}>{copy.weight}</Text>
              <TextInput
                style={[styles.input, directionStyle]}
                value={form.weight}
                onChangeText={(value) => updateField('weight', value.replace(/[^0-9.]/g, ''))}
                placeholder={copy.weightPlaceholder}
                placeholderTextColor={colors.textSubtle}
                keyboardType="decimal-pad"
              />

              <Text style={[styles.fieldLabel, directionStyle]}>{copy.adverseReactions}</Text>
              {form.adverseReactions.map((reaction, index) => (
                <View key={`${reaction}-${index}`} style={[styles.medicationRow, isRTL && styles.rowReverse]}>
                  <Text style={[styles.medicationName, directionStyle]}>{reaction}</Text>
                  <TouchableOpacity
                    style={styles.removeMedicationButton}
                    onPress={() => removeListItem('adverseReactions', index)}
                    accessibilityLabel={`${copy.removeAdverseReaction}: ${reaction}`}
                  >
                    <AppIcon name="close" size={17} color={colors.danger} />
                  </TouchableOpacity>
                </View>
              ))}
              <View style={[styles.addMedicationRow, isRTL && styles.rowReverse]}>
                <TextInput
                  style={[styles.input, styles.medicationInput, directionStyle]}
                  value={adverseReactionInput}
                  onChangeText={setAdverseReactionInput}
                  placeholder={copy.adverseReactionPlaceholder}
                  placeholderTextColor={colors.textSubtle}
                  onSubmitEditing={() => addListItem('adverseReactions', adverseReactionInput, setAdverseReactionInput)}
                />
                <TouchableOpacity style={styles.addButton} onPress={() => addListItem('adverseReactions', adverseReactionInput, setAdverseReactionInput)}>
                  <Text style={styles.addButtonText}>{copy.add}</Text>
                </TouchableOpacity>
              </View>

              {saveError && <Text style={[styles.saveError, directionStyle]}>{copy.saveError}</Text>}
              <TouchableOpacity style={[styles.saveButton, saving && styles.disabled]} onPress={submitProfile} disabled={saving} activeOpacity={0.8}>
                <Text style={styles.saveButtonText}>{copy.save}</Text>
              </TouchableOpacity>
            </ScrollView>
          ) : (
            <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
              {profiles.length === 0 ? (
                <Text style={[styles.emptyText, directionStyle]}>{copy.noProfiles}</Text>
              ) : (
                profiles.map((profile, index) => (
                  <View key={profile.id} style={[styles.profileCard, isRTL && styles.rowReverse]}>
                    <View style={styles.profileIcon}>
                      <AppIcon name="person-outline" size={21} color={colors.dawa} />
                    </View>
                    <View style={styles.profileCopy}>
                      <Text style={[styles.profileName, directionStyle]}>{profile.name || `${copy.profileFallback} ${index + 1}`}</Text>
                      {!!profile.age && <Text style={[styles.profileMeta, directionStyle]}>{`${copy.age}: ${profile.age}`}</Text>}
                    </View>
                    <TouchableOpacity style={styles.iconButton} onPress={() => beginEdit(profile)} accessibilityLabel={copy.edit}>
                      <AppIcon name="pencil-outline" size={19} color={colors.dawa} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton} onPress={() => confirmDelete(profile)} accessibilityLabel={copy.delete}>
                      <AppIcon name="trash-outline" size={19} color={colors.danger} />
                    </TouchableOpacity>
                  </View>
                ))
              )}
              <TouchableOpacity style={styles.addProfileButton} onPress={() => beginEdit(createEmptyProfile())} activeOpacity={0.8}>
                <Text style={styles.addProfileText}>{copy.addProfile}</Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: colors.canvas },
  rowReverse: { flexDirection: 'row-reverse' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.md, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border },
  backButton: { width: 86, flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingVertical: spacing.sm },
  backText: { ...type.caption, color: colors.text },
  headerTitle: { flex: 1, ...type.heading, color: colors.text, textAlign: 'center' },
  headerSpacer: { width: 86 },
  listContent: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  emptyText: { ...type.body, color: colors.textMuted, backgroundColor: colors.white, borderRadius: radii.md, padding: spacing.xl, marginBottom: spacing.md },
  profileCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md, marginBottom: spacing.sm, ...shadows.card },
  profileIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: colors.dawaSoft, alignItems: 'center', justifyContent: 'center' },
  profileCopy: { flex: 1, marginHorizontal: spacing.md },
  profileName: { ...type.bodyStrong, color: colors.text },
  profileMeta: { ...type.caption, color: colors.textMuted, marginTop: 2 },
  iconButton: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  addProfileButton: { backgroundColor: colors.dawa, borderRadius: radii.md, padding: 15, alignItems: 'center', marginTop: spacing.sm },
  addProfileText: { ...type.bodyStrong, color: colors.white },
  formContent: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  sectionTitle: { ...type.heading, color: colors.text, marginTop: spacing.xl, marginBottom: spacing.xs },
  fieldLabel: { ...type.caption, color: colors.text, marginTop: spacing.md, marginBottom: spacing.xs },
  input: { backgroundColor: colors.white, borderRadius: radii.sm, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md, paddingVertical: 11, ...type.body, color: colors.text },
  sexRow: { flexDirection: 'row', gap: spacing.sm },
  sexButton: { flex: 1, borderRadius: radii.sm, borderWidth: 1, borderColor: colors.border, paddingVertical: 11, alignItems: 'center', backgroundColor: colors.white },
  sexButtonSelected: { backgroundColor: colors.dawaSoft, borderColor: colors.dawa },
  sexButtonText: { ...type.caption, color: colors.textMuted },
  sexButtonTextSelected: { color: colors.dawa, fontWeight: '800' },
  segmentedRow: { flexDirection: 'row', gap: spacing.xs },
  segmentButton: { flex: 1, minHeight: 44, borderRadius: radii.sm, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.xs, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white },
  segmentText: { ...type.caption, color: colors.textMuted, textAlign: 'center' },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: 8 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  checkboxSelected: { backgroundColor: colors.dawa, borderColor: colors.dawa },
  checkboxLabel: { flex: 1, ...type.body, color: colors.text },
  medicationRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: radii.sm, borderWidth: 1, borderColor: colors.border, paddingLeft: spacing.md, marginBottom: spacing.sm },
  medicationName: { flex: 1, ...type.body, color: colors.text, paddingVertical: 10 },
  removeMedicationButton: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
  medicationActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
  secondaryButton: { flex: 1, minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: colors.dawaSoft, borderRadius: radii.sm, borderWidth: 1, borderColor: '#D8CDEA', paddingHorizontal: spacing.sm },
  secondaryButtonText: { ...type.caption, color: colors.dawa, textAlign: 'center' },
  addMedicationRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.sm },
  medicationInput: { flex: 1 },
  addButton: { backgroundColor: colors.primary, borderRadius: radii.sm, minHeight: 46, paddingHorizontal: spacing.lg, alignItems: 'center', justifyContent: 'center' },
  addButtonText: { ...type.caption, color: colors.white },
  saveError: { ...type.caption, color: colors.danger, marginTop: spacing.md },
  saveButton: { backgroundColor: colors.dawa, borderRadius: radii.md, padding: 15, alignItems: 'center', marginTop: spacing.xl },
  saveButtonText: { ...type.bodyStrong, color: colors.white },
  disabled: { opacity: 0.55 },
});
