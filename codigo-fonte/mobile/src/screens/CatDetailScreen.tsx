import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Button, StatusBadge } from '../components';
import type { StatusBadgeTone } from '../components';
import { ApiError } from '../services/api';
import { catPhotoSource, getCat, uploadCatPhoto } from '../services/catService';
import { colors } from '../theme/colors';
import type { Cat } from '../types/cat';
import { SEX_LABELS } from '../types/cat';
import { calculateAgeYears } from '../utils/date';
import { styles } from './CatDetailScreen.styles';

interface CatDetailScreenProps {
  catId: number;
  onBack: () => void;
  onEdit: (catId: number) => void;
}

interface Tag {
  label: string;
  tone: StatusBadgeTone;
}

function roomLabel(cat: Cat): string {
  if (cat.roomTitle) {
    return cat.roomTitle;
  }
  return cat.generalStatus === 'TemporaryHome' ? 'Lar temporário' : '—';
}

function subtitle(cat: Cat): string {
  const parts = [cat.sex ? SEX_LABELS[cat.sex] : null];

  if (cat.estimatedBirthDate) {
    const age = calculateAgeYears(cat.estimatedBirthDate);
    parts.push(`${age} ${age === 1 ? 'ano' : 'anos'}`);
  }

  parts.push(roomLabel(cat));

  return parts.filter(Boolean).join(' · ');
}

function clinicalTags(cat: Cat): Tag[] {
  const tags: Tag[] = [];

  if (cat.healthStatus === 'Healthy') {
    tags.push({ label: 'Saudável', tone: 'success' });
  } else if (cat.healthStatus === 'Fiv') {
    tags.push({ label: 'FIV+', tone: 'danger' });
  } else if (cat.healthStatus === 'Felv') {
    tags.push({ label: 'FeLV+', tone: 'danger' });
  } else if (cat.healthStatus === 'FivFelv') {
    tags.push({ label: 'FIV+/FeLV+', tone: 'danger' });
  }

  if (cat.pifResult === 'Negative') {
    tags.push({ label: 'PIF−', tone: 'success' });
  } else if (cat.pifResult === 'Positive') {
    tags.push({ label: 'PIF+', tone: 'danger' });
  }

  if (cat.neuteringStatus === 'Neutered') {
    tags.push({ label: cat.sex === 'Female' ? 'Castrada' : 'Castrado', tone: 'success' });
  } else if (cat.neuteringStatus === 'Scheduled') {
    tags.push({ label: 'Castração agendada', tone: 'warning' });
  }

  return tags;
}

function weightLabel(cat: Cat): string {
  return cat.weightKg != null ? `${String(cat.weightKg).replace('.', ',')} kg` : '—';
}

function comingSoon() {
  Alert.alert('Em breve', 'Este recurso ainda não está disponível.');
}

export function CatDetailScreen({ catId, onBack, onEdit }: CatDetailScreenProps) {
  const [cat, setCat] = useState<Cat | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [photoVersion, setPhotoVersion] = useState(0);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);

  // Refetches every time the screen regains focus (not just on mount), so coming back from
  // editing shows the saved changes without a manual pull-to-refresh.
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      getCat(catId)
        .then((result) => {
          if (!cancelled) {
            setCat(result);
            setErrorMessage(null);
          }
        })
        .catch((error) => {
          if (!cancelled) {
            setErrorMessage(
              error instanceof ApiError ? error.message : 'Não foi possível carregar a ficha do gato.',
            );
          }
        })
        .finally(() => {
          if (!cancelled) {
            setLoading(false);
          }
        });

      return () => {
        cancelled = true;
      };
      // reloadToken isn't read above; it only exists so the retry button can force this
      // callback (and thus useFocusEffect) to re-run on demand.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [catId, reloadToken]),
  );

  async function uploadPhoto(uri: string) {
    setUploadingPhoto(true);
    try {
      const updated = await uploadCatPhoto(catId, uri);
      setCat(updated);
      setPhotoVersion(Date.now());
    } catch {
      Alert.alert('Não foi possível enviar a foto', 'Tente novamente em instantes.');
    } finally {
      setUploadingPhoto(false);
    }
  }

  async function takePhoto() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permissão necessária', 'Autorize o acesso à câmera para fotografar o gato.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!result.canceled) {
      uploadPhoto(result.assets[0].uri);
    }
  }

  async function pickFromLibrary() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permissão necessária', 'Autorize o acesso às fotos para anexar uma imagem.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (!result.canceled) {
      uploadPhoto(result.assets[0].uri);
    }
  }

  function handlePhotoPress() {
    Alert.alert('Foto do gato', undefined, [
      { text: 'Tirar foto', onPress: takePhoto },
      { text: 'Escolher da galeria', onPress: pickFromLibrary },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} accessibilityRole="button" accessibilityLabel="Voltar">
          <Ionicons name="chevron-back" size={22} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{cat?.name ?? ''}</Text>
        {cat && (
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => onEdit(catId)}
            accessibilityRole="button"
            accessibilityLabel="Editar gato"
          >
            <Ionicons name="pencil-outline" size={18} color={colors.ink} />
          </TouchableOpacity>
        )}
      </View>

      {errorMessage ? (
        <View style={styles.feedback}>
          <Text style={styles.feedbackText}>{errorMessage}</Text>
          <Button
            variant="outline"
            title="Tentar novamente"
            onPress={() => {
              setErrorMessage(null);
              setLoading(true);
              setReloadToken((token) => token + 1);
            }}
          />
        </View>
      ) : loading || !cat ? (
        <View style={styles.feedback}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.cover}>
            {cat.photoUrl && (
              <Image
                source={{
                  ...catPhotoSource(cat.id),
                  uri: `${catPhotoSource(cat.id).uri}${photoVersion ? `?v=${photoVersion}` : ''}`,
                }}
                style={styles.coverImage}
              />
            )}
            <TouchableOpacity
              style={styles.coverPhotoButton}
              onPress={handlePhotoPress}
              disabled={uploadingPhoto}
              accessibilityRole="button"
              accessibilityLabel="Alterar foto do gato"
            >
              {uploadingPhoto ? (
                <ActivityIndicator size="small" color={colors.ink} />
              ) : (
                <Ionicons name="camera-outline" size={18} color={colors.ink} />
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.identity}>
            <Text style={styles.name}>{cat.name}</Text>
            <Text style={styles.subtitle}>{subtitle(cat)}</Text>

            <View style={styles.tagsRow}>
              {clinicalTags(cat).map((tag) => (
                <StatusBadge key={tag.label} label={tag.label} tone={tag.tone} />
              ))}
            </View>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Microchip</Text>
              <Text style={styles.infoValue}>{cat.microchip ?? '—'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Cor / Pelagem</Text>
              <Text style={styles.infoValue}>{cat.coat ?? '—'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Peso atual</Text>
              <Text style={styles.infoValue}>{weightLabel(cat)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Padrinho / madrinha</Text>
              <Text style={styles.infoValue}>{cat.sponsorName ?? '—'}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.primaryAction} onPress={comingSoon} accessibilityRole="button">
            <Text style={styles.primaryActionText}>+ Registrar prontuário</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryAction} onPress={comingSoon} accessibilityRole="button">
            <Text style={styles.secondaryActionText}>Aplicar medicação</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryAction} onPress={comingSoon} accessibilityRole="button">
            <Text style={styles.secondaryActionText}>Transferir de sala</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
}
