import { colors } from '../theme/theme';

export function getMedicineStatusTone(status = '') {
  const normalized = status.toLocaleLowerCase('fr');

  if (normalized.includes('non commercialis')) {
    return { key: 'unavailable', icon: 'remove-circle-outline', color: colors.danger, background: colors.dangerSoft };
  }
  if (normalized.includes('suspendu')) {
    return { key: 'suspended', icon: 'pause-circle-outline', color: colors.warning, background: colors.warningSoft };
  }
  if (normalized.includes('retir')) {
    return { key: 'withdrawn', icon: 'alert-circle-outline', color: colors.danger, background: colors.dangerSoft };
  }
  if (normalized.includes('commercialis')) {
    return { key: 'available', icon: 'checkmark-circle-outline', color: colors.success, background: colors.successSoft };
  }

  return { key: 'unknown', icon: 'information-circle-outline', color: colors.textMuted, background: colors.surfaceMuted };
}
