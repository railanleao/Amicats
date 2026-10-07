import type { TextStyle } from 'react-native';

export const DISPLAY_FONT = 'display';

type NormalizedWeight = '400' | '500' | '600' | '700';

const BODY_FAMILIES: Record<NormalizedWeight, string> = {
  '400': 'Karla_400Regular',
  '500': 'Karla_500Medium',
  '600': 'Karla_600SemiBold',
  '700': 'Karla_700Bold',
};

const DISPLAY_FAMILIES: Record<NormalizedWeight, string> = {
  '400': 'Literata_400Regular',
  '500': 'Literata_500Medium',
  '600': 'Literata_600SemiBold',
  '700': 'Literata_700Bold',
};

export function normalizeWeight(weight: TextStyle['fontWeight']): NormalizedWeight {
  if (weight === 'bold') {
    return '700';
  }

  const numeric = Number(weight);

  if (!Number.isFinite(numeric) || numeric <= 400) {
    return '400';
  }
  if (numeric < 600) {
    return '500';
  }
  if (numeric < 700) {
    return '600';
  }
  return '700';
}

export function resolveFontFamily(family: string | undefined, weight: TextStyle['fontWeight']): string | undefined {
  if (family !== undefined && family !== DISPLAY_FONT) {
    return undefined;
  }

  const weights = family === DISPLAY_FONT ? DISPLAY_FAMILIES : BODY_FAMILIES;

  return weights[normalizeWeight(weight)];
}
