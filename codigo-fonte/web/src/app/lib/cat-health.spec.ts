import {
  felvResult,
  fivResult,
  isNeutered,
  neuteringLabel,
  testTagLabel,
} from './cat-health';

describe('cat-health', () => {
  it('reads FIV and FeLV from the health status', () => {
    expect(fivResult('Fiv')).toBe('positive');
    expect(fivResult('FivFelv')).toBe('positive');
    expect(fivResult('Felv')).toBe('negative');
    expect(fivResult('NotTested')).toBe('not-tested');

    expect(felvResult('Felv')).toBe('positive');
    expect(felvResult('FivFelv')).toBe('positive');
    expect(felvResult('Healthy')).toBe('negative');
    expect(felvResult(null)).toBe('not-tested');
  });

  it('labels the test results', () => {
    expect(testTagLabel('positive')).toBe('Positivo');
    expect(testTagLabel('negative')).toBe('Negativo');
    expect(testTagLabel('not-tested')).toBe('Não testado');
  });

  it('labels the neutering status', () => {
    expect(isNeutered('Neutered')).toBeTrue();
    expect(isNeutered('Scheduled')).toBeFalse();
    expect(neuteringLabel('Neutered')).toBe('Sim');
    expect(neuteringLabel('NotNeutered')).toBe('Não');
    expect(neuteringLabel('Scheduled')).toBe('Agendada');
    expect(neuteringLabel(null)).toBe('—');
  });
});
