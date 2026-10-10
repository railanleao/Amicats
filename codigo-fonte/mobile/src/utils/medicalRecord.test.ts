import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { Cat } from '../types/cat';
import type { PrescribedMedication } from '../types/medicalPrescription';
import {
  ageGroupLabel,
  felvBadge,
  fivBadge,
  medicalRecordSubtitle,
  medicationSchedule,
  neuteredLabel,
  roomLabel,
  testedExamBadges,
  weightLabel,
} from './medicalRecord';

function toIsoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function birthDate(yearsAgo: number, extraDays = 0): string {
  const date = new Date();
  date.setFullYear(date.getFullYear() - yearsAgo);
  date.setDate(date.getDate() + extraDays);
  return toIsoDate(date);
}

function cat(overrides: Partial<Cat> = {}): Cat {
  return {
    id: 1,
    name: 'Nina',
    photoUrl: null,
    roomId: 2,
    roomTitle: 'Observação Intensiva',
    sex: 'Female',
    estimatedBirthDate: birthDate(3),
    weightKg: 4.1,
    generalStatus: 'InClinic',
    healthStatus: 'NotTested',
    pifResult: 'NotTested',
    neuteringStatus: 'Neutered',
    ...overrides,
  } as Cat;
}

describe('roomLabel', () => {
  it('uses the room title when the cat has a room', () => {
    assert.equal(roomLabel(cat()), 'Observação Intensiva');
  });

  it('shows the temporary home when the cat has no room', () => {
    assert.equal(roomLabel(cat({ roomTitle: null, generalStatus: 'TemporaryHome' })), 'Lar temporário');
  });

  it('shows a dash for a room-less cat that is not in a temporary home', () => {
    assert.equal(roomLabel(cat({ roomTitle: null, generalStatus: 'InTriage' })), '—');
  });
});

describe('ageGroupLabel', () => {
  it('returns null without a birth date', () => {
    assert.equal(ageGroupLabel(cat({ estimatedBirthDate: null })), null);
  });

  it('calls a cat younger than one year a kitten', () => {
    assert.equal(ageGroupLabel(cat({ estimatedBirthDate: birthDate(0, -180) })), 'Filhote');
  });

  it('still calls a cat one day before its first birthday a kitten', () => {
    assert.equal(ageGroupLabel(cat({ estimatedBirthDate: birthDate(1, 1) })), 'Filhote');
  });

  it('calls a cat an adult on its first birthday', () => {
    assert.equal(ageGroupLabel(cat({ estimatedBirthDate: birthDate(1) })), 'Adulto');
  });
});

describe('weightLabel', () => {
  it('formats the weight with a comma', () => {
    assert.equal(weightLabel(cat({ weightKg: 4.5 })), '4,5 kg');
  });

  it('shows a dash without a weight', () => {
    assert.equal(weightLabel(cat({ weightKg: null })), '—');
  });
});

describe('testedExamBadges', () => {
  it('hides exams that were not tested', () => {
    assert.deepEqual(testedExamBadges(cat()), []);
  });

  it('shows the retroviral and PIF results that were tested', () => {
    assert.deepEqual(testedExamBadges(cat({ healthStatus: 'Fiv', pifResult: 'Positive' })), [
      { label: 'FIV+', tone: 'danger' },
      { label: 'PIF+', tone: 'danger' },
    ]);
  });
});

describe('medicalRecordSubtitle', () => {
  it('joins sex, age group and health status', () => {
    assert.equal(medicalRecordSubtitle(cat({ healthStatus: 'Healthy' })), 'Fêmea · Adulto · Saudável');
  });

  it('leaves out a health status that was not tested', () => {
    assert.equal(medicalRecordSubtitle(cat()), 'Fêmea · Adulto');
  });
});

describe('fivBadge and felvBadge', () => {
  it('splits a combined FIV/FeLV result into two positives', () => {
    assert.equal(fivBadge('FivFelv').label, 'Positivo');
    assert.equal(felvBadge('FivFelv').label, 'Positivo');
  });

  it('marks the other exam as negative when only one is positive', () => {
    assert.equal(fivBadge('Fiv').label, 'Positivo');
    assert.equal(felvBadge('Fiv').label, 'Negativo');
  });

  it('keeps both as not tested', () => {
    assert.deepEqual(fivBadge('NotTested'), { label: 'Não testado', tone: 'neutral' });
    assert.deepEqual(felvBadge('NotTested'), { label: 'Não testado', tone: 'neutral' });
  });
});

describe('neuteredLabel', () => {
  it('translates every neutering status', () => {
    assert.equal(neuteredLabel(cat({ neuteringStatus: 'Neutered' })), 'Sim');
    assert.equal(neuteredLabel(cat({ neuteringStatus: 'Scheduled' })), 'Agendada');
    assert.equal(neuteredLabel(cat({ neuteringStatus: 'NotNeutered' })), 'Não');
    assert.equal(neuteredLabel(cat({ neuteringStatus: null })), '—');
  });
});

describe('medicationSchedule', () => {
  it('describes dosage, route and interval', () => {
    const medication = {
      dosage: '0,5 ml',
      route: 'Subcutaneous',
      intervalHours: 48,
    } as PrescribedMedication;

    assert.equal(medicationSchedule(medication), '0,5 ml · Subcutânea · a cada 48h');
  });
});
