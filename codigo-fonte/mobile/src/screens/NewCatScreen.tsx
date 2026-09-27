import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Alert, Image, Text, TouchableOpacity, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Button, FormRow, FormScreenLayout, SectionLabel, SelectField, TextField } from '../components';
import { ApiError } from '../services/api';
import { createCat, getCat, updateCat, uploadCatPhoto } from '../services/catService';
import { listActiveRooms } from '../services/roomService';
import { colors } from '../theme/colors';
import type { CreateCatRequest } from '../types/cat';
import { GENERAL_STATUS_LABELS, SEX_LABELS } from '../types/cat';
import type { Room } from '../types/room';
import { formatBrazilianDate, parseBrazilianDate } from '../utils/date';
import { styles } from './NewCatScreen.styles';

const SEX_OPTIONS = Object.entries(SEX_LABELS).map(([value, label]) => ({ value, label }));
const GENERAL_STATUS_OPTIONS = Object.entries(GENERAL_STATUS_LABELS).map(([value, label]) => ({
  value,
  label,
}));

interface NewCatFormValues {
  name: string;
  sex: string | null;
  estimatedBirthDate: string;
  coat: string;
  weightKg: string;
  microchip: string;
  roomId: string | null;
  generalStatus: string | null;
  characteristics: string;
  rescueDate: string;
  foundConditions: string;
  sponsorName: string;
  sponsorPhone: string;
  sponsorFunding: string;
}

const DEFAULT_VALUES: NewCatFormValues = {
  name: '',
  sex: null,
  estimatedBirthDate: '',
  coat: '',
  weightKg: '',
  microchip: '',
  roomId: null,
  generalStatus: null,
  characteristics: '',
  rescueDate: '',
  foundConditions: '',
  sponsorName: '',
  sponsorPhone: '',
  sponsorFunding: '',
};

interface NewCatScreenProps {
  catId?: number;
  onBack: () => void;
  onSaved: () => void;
}

export function NewCatScreen({ catId, onBack, onSaved }: NewCatScreenProps) {
  const isEditing = catId !== undefined;

  const [generalError, setGeneralError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);
  const [roomOptions, setRoomOptions] = useState<Room[]>([]);
  const [roomsError, setRoomsError] = useState<string>();
  const [photoUri, setPhotoUri] = useState<string>();
  const [loadingCat, setLoadingCat] = useState(isEditing);
  const [loadError, setLoadError] = useState<string>();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NewCatFormValues>({ defaultValues: DEFAULT_VALUES });

  useEffect(() => {
    listActiveRooms()
      .then(setRoomOptions)
      .catch((error) => {
        setRoomsError(
          error instanceof ApiError && error.status === 403
            ? 'Você não tem permissão para ver as salas. Peça a um Administrador.'
            : 'Não foi possível carregar as salas.',
        );
      });
  }, []);

  useEffect(() => {
    if (catId === undefined) {
      return;
    }

    getCat(catId)
      .then((cat) => {
        reset({
          name: cat.name,
          sex: cat.sex,
          estimatedBirthDate: formatBrazilianDate(cat.estimatedBirthDate),
          coat: cat.coat ?? '',
          weightKg: cat.weightKg != null ? String(cat.weightKg).replace('.', ',') : '',
          microchip: cat.microchip ?? '',
          roomId: cat.roomId != null ? String(cat.roomId) : null,
          generalStatus: cat.generalStatus,
          characteristics: cat.characteristics ?? '',
          rescueDate: formatBrazilianDate(cat.rescueDate),
          foundConditions: cat.foundConditions ?? '',
          sponsorName: cat.sponsorName ?? '',
          sponsorPhone: cat.sponsorPhone ?? '',
          sponsorFunding: cat.sponsorFunding ?? '',
        });
      })
      .catch((error) => {
        setLoadError(
          error instanceof ApiError && error.status === 404
            ? 'Gato não encontrado.'
            : 'Não foi possível carregar o gato.',
        );
      })
      .finally(() => setLoadingCat(false));
  }, [catId, reset]);

  async function takePhoto() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permissão necessária', 'Autorize o acesso à câmera para fotografar o gato.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
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
      setPhotoUri(result.assets[0].uri);
    }
  }

  function handlePhotoPress() {
    Alert.alert('Foto do gato', undefined, [
      { text: 'Tirar foto', onPress: takePhoto },
      { text: 'Escolher da galeria', onPress: pickFromLibrary },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  }

  async function submit(values: NewCatFormValues) {
    setGeneralError(undefined);
    setSubmitting(true);

    const request: CreateCatRequest = {
      name: values.name.trim(),
      roomId: values.roomId ? Number(values.roomId) : null,
      sex: (values.sex as CreateCatRequest['sex']) ?? null,
      estimatedBirthDate: parseBrazilianDate(values.estimatedBirthDate),
      coat: values.coat.trim() || null,
      weightKg: values.weightKg ? Number(values.weightKg.replace(',', '.')) : null,
      characteristics: values.characteristics.trim() || null,
      generalStatus: (values.generalStatus as CreateCatRequest['generalStatus']) ?? null,
      microchip: values.microchip.trim() || null,
      rescueDate: parseBrazilianDate(values.rescueDate),
      foundConditions: values.foundConditions.trim() || null,
      sponsorName: values.sponsorName.trim() || null,
      sponsorPhone: values.sponsorPhone.trim() || null,
      sponsorFunding: values.sponsorFunding.trim() || null,
    };

    try {
      if (isEditing) {
        await updateCat(catId, request);
        onSaved();
        return;
      }

      const cat = await createCat(request);

      if (photoUri) {
        try {
          await uploadCatPhoto(cat.id, photoUri);
        } catch {
          Alert.alert('Gato salvo', 'O cadastro foi salvo, mas a foto não pôde ser enviada. Tente adicioná-la depois.');
        }
      }

      onSaved();
    } catch (error) {
      setGeneralError(
        error instanceof ApiError
          ? error.message
          : isEditing
            ? 'Não foi possível salvar as alterações.'
            : 'Não foi possível salvar o gato.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} accessibilityRole="button" accessibilityLabel="Voltar">
          <Ionicons name="chevron-back" size={22} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditing ? 'Editar gato' : 'Novo gato'}</Text>
      </View>

      {loadingCat ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : loadError ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.generalError}>{loadError}</Text>
        </View>
      ) : (
      <FormScreenLayout>
        {!isEditing && (
          <View style={styles.photoSection}>
            <Text style={styles.photoSectionLabel}>Foto do gato</Text>
            <TouchableOpacity onPress={handlePhotoPress} accessibilityRole="button">
              {photoUri ? (
                <Image source={{ uri: photoUri }} style={styles.photoPreview} />
              ) : (
                <View style={styles.addPhotoTile}>
                  <Ionicons name="add" size={16} color={colors.primary} />
                  <Text style={styles.addPhotoLabel}>Foto</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        )}

        <FormRow>
          <Controller
            control={control}
            name="name"
            rules={{ required: 'Informe o nome do gato.' }}
            render={({ field: { value, onChange } }) => (
              <TextField label="Nome" placeholder="Ex: Nina" value={value} onChangeText={onChange} error={errors.name?.message} />
            )}
          />
          <Controller
            control={control}
            name="sex"
            render={({ field: { value, onChange } }) => (
              <SelectField label="Sexo" value={value} placeholder="Selecione" options={SEX_OPTIONS} onChange={onChange} />
            )}
          />
        </FormRow>

        <FormRow>
          <Controller
            control={control}
            name="estimatedBirthDate"
            render={({ field: { value, onChange } }) => (
              <TextField label="Nascimento estimado" placeholder="Ex: 08/12/2023" value={value} onChangeText={onChange} />
            )}
          />
          <Controller
            control={control}
            name="coat"
            render={({ field: { value, onChange } }) => (
              <TextField label="Cor / Pelagem" placeholder="Ex: Tricolor, curto" value={value} onChangeText={onChange} />
            )}
          />
        </FormRow>

        <FormRow>
          <Controller
            control={control}
            name="weightKg"
            render={({ field: { value, onChange } }) => (
              <TextField label="Peso (kg)" placeholder="Ex: 3,5" keyboardType="decimal-pad" value={value} onChangeText={onChange} />
            )}
          />
          <Controller
            control={control}
            name="microchip"
            rules={{
              validate: (value) => !value || value.length === 15 || 'O microchip tem 15 dígitos.',
            }}
            render={({ field: { value, onChange } }) => (
              <TextField
                label="Microchip"
                placeholder="Opcional — 15 dígitos"
                keyboardType="number-pad"
                maxLength={15}
                value={value}
                onChangeText={onChange}
                error={errors.microchip?.message}
              />
            )}
          />
        </FormRow>

        <Controller
          control={control}
          name="roomId"
          render={({ field: { value, onChange } }) => (
            <SelectField
              label="Sala atual"
              value={value}
              placeholder="Selecione a sala"
              options={roomOptions.map((room) => ({ label: room.title, value: String(room.id) }))}
              onChange={onChange}
              error={roomsError}
            />
          )}
        />

        <Controller
          control={control}
          name="characteristics"
          render={({ field: { value, onChange } }) => (
            <TextField
              label="Características"
              placeholder="Temperamento, marcas, particularidades."
              multiline
              numberOfLines={3}
              style={{ minHeight: 60, textAlignVertical: 'top' }}
              value={value}
              onChangeText={onChange}
            />
          )}
        />

        <Controller
          control={control}
          name="generalStatus"
          render={({ field: { value, onChange } }) => (
            <SelectField
              label="Situação clínica"
              value={value}
              placeholder="Selecione (padrão: Em triagem)"
              options={GENERAL_STATUS_OPTIONS}
              onChange={onChange}
            />
          )}
        />

        <SectionLabel>Resgate</SectionLabel>

        <FormRow>
          <Controller
            control={control}
            name="rescueDate"
            render={({ field: { value, onChange } }) => (
              <TextField label="Data de resgate" placeholder="Ex: 08/12/2025" value={value} onChangeText={onChange} />
            )}
          />
          <Controller
            control={control}
            name="foundConditions"
            render={({ field: { value, onChange } }) => (
              <TextField label="Condições encontradas" placeholder="Ex: desnutrido, ferido" value={value} onChangeText={onChange} />
            )}
          />
        </FormRow>

        <SectionLabel>Apadrinhamento</SectionLabel>

        <FormRow>
          <Controller
            control={control}
            name="sponsorName"
            render={({ field: { value, onChange } }) => (
              <TextField label="Padrinho / madrinha" placeholder="Nome" value={value} onChangeText={onChange} />
            )}
          />
          <Controller
            control={control}
            name="sponsorPhone"
            render={({ field: { value, onChange } }) => (
              <TextField label="Telefone" placeholder="(00) 00000-0000" keyboardType="phone-pad" value={value} onChangeText={onChange} />
            )}
          />
        </FormRow>

        <Controller
          control={control}
          name="sponsorFunding"
          render={({ field: { value, onChange } }) => (
            <TextField
              label="O que o padrinho custeia"
              placeholder="Ex: ração terapêutica e exames de acompanhamento."
              multiline
              numberOfLines={2}
              style={{ minHeight: 52, textAlignVertical: 'top' }}
              value={value}
              onChangeText={onChange}
            />
          )}
        />

        {generalError ? <Text style={styles.generalError}>{generalError}</Text> : null}

        <Button
          title={isEditing ? 'Salvar alterações' : 'Salvar gato'}
          onPress={handleSubmit(submit)}
          loading={submitting}
        />
      </FormScreenLayout>
      )}
    </View>
  );
}
