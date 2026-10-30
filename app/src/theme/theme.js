export const colors = {
  primary: '#174F70',
  primaryDark: '#10384F',
  primarySoft: '#EAF2F6',
  scanner: '#168C83',
  scannerSoft: '#E4F4F1',
  dawa: '#6750A4',
  dawaSoft: '#F0ECFA',
  canvas: '#F5F8FA',
  surface: '#FFFFFF',
  surfaceMuted: '#EEF3F6',
  text: '#142B3A',
  textMuted: '#667984',
  textSubtle: '#8B9AA3',
  border: '#DDE6EB',
  success: '#237A57',
  successSoft: '#E6F4EC',
  warning: '#9A650C',
  warningSoft: '#FFF3D8',
  danger: '#AD3F45',
  dangerSoft: '#FBEAEC',
  white: '#FFFFFF',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const radii = {
  sm: 12,
  md: 18,
  lg: 24,
  pill: 999,
};

export const type = {
  display: { fontSize: 32, lineHeight: 39, fontWeight: '900', letterSpacing: -0.7 },
  title: { fontSize: 24, lineHeight: 30, fontWeight: '800', letterSpacing: -0.35 },
  heading: { fontSize: 18, lineHeight: 24, fontWeight: '800' },
  body: { fontSize: 15, lineHeight: 22, fontWeight: '400' },
  bodyStrong: { fontSize: 15, lineHeight: 22, fontWeight: '700' },
  caption: { fontSize: 12, lineHeight: 17, fontWeight: '600' },
  eyebrow: { fontSize: 10, lineHeight: 14, fontWeight: '900', letterSpacing: 1.4 },
};

export const shadows = {
  card: {
    shadowColor: '#12364A',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
  },
  raised: {
    shadowColor: '#10384F',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 22,
    elevation: 9,
  },
};

export const featureTheme = {
  Scanner: { accent: colors.scanner, soft: colors.scannerSoft },
  Chatbot: { accent: colors.dawa, soft: colors.dawaSoft },
};
