import { Cat } from '../models/cat.model';

export type TestTag = 'positive' | 'negative' | 'not-tested';

type HealthStatus = Cat['healthStatus'] | null | undefined;
type NeuteringStatus = Cat['neuteringStatus'] | undefined;

export function fivResult(status: HealthStatus): TestTag {
  if (!status || status === 'NotTested') {
    return 'not-tested';
  }
  return status === 'Fiv' || status === 'FivFelv' ? 'positive' : 'negative';
}

export function felvResult(status: HealthStatus): TestTag {
  if (!status || status === 'NotTested') {
    return 'not-tested';
  }
  return status === 'Felv' || status === 'FivFelv' ? 'positive' : 'negative';
}

export function testTagLabel(tag: TestTag): string {
  switch (tag) {
    case 'positive':
      return 'Positivo';
    case 'negative':
      return 'Negativo';
    default:
      return 'Não testado';
  }
}

export function isNeutered(status: NeuteringStatus): boolean {
  return status === 'Neutered';
}

export function neuteringLabel(status: NeuteringStatus): string {
  switch (status) {
    case 'Neutered':
      return 'Sim';
    case 'NotNeutered':
      return 'Não';
    case 'Scheduled':
      return 'Agendada';
    default:
      return '—';
  }
}
