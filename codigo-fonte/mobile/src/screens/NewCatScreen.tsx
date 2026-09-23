import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Button, FormRow, FormScreenLayout, SectionLabel, SelectField, TextField } from '../components';
import { ApiError } from '../services/api';
import { createCat, uploadCatPhoto } from '../services/catService';
import { listActiveRooms } from '../services/roomService';
import { colors } from '../theme/colors';
import type { CreateCatRequest } from '../types/cat';
import type { Room } from '../types/room';
import { parseBrazilianDate } from '../utils/date';
import { styles } from './NewCatScreen.styles';

const MAX_PHOTOS = 6;

const SEX_OPTIONS = [
  { label: 'Macho', value: 'Male' },
  { label: 'Fêmea', value: 'Female' },
];
const HEALTH_TEST_OPTIONS = [
  { label: 'Positivo', value: 'Positive' },
  { label: 'Negativo', value: 'Negative' },
  { label: 'Não testado', value: 'Untested' },
];
const NEUTERED_OPTIONS = [
  { label: 'Sim', value: 'Yes' },
  { label: 'Não', value: 'No' },
  { label: 'Agendada', value: 'Scheduled' },
];
const CLINICAL_STATUS_OPTIONS = [
  { label: 'Em tratamento', value: 'InTreatment' },
  { label: 'Disponível para adoção', value: 'AvailableForAdoption' },
  { label: 'Em triagem', value: 'InTriage' },
  { label: 'Adotado', value: 'Adopted' },
  { label: 'Lar temporário', value: 'FosterHome' },
  { label: 'Em clínica', value: 'InClinic' },
  { label: 'Óbito', value: 'Deceased' },
  { label: 'Desaparecido', value: 'Missing' },
];

interface NewCatFormValues {
  name: string;
  sex: string | null;
  estimatedAge: string;
  coat: string;
  microchip: string;
  roomId: string | null;
  fiv: string | null;
  felv: string | null;
  pif: string | null;
  neutered: string | null;
  clinicalStatus: string | null;
  healthNotes: string;
  rescueDate: string;
  rescueLocation: string;
  sponsorName: string;
  sponsorPhone: string;
  sponsorCoverage: string;
}

const DEFAULT_VALUES: NewCatFormValues = {
  name: '',
  sex: null,
  estimatedAge: '',
  coat: '',
  microchip: '',
  roomId: null,
  fiv: null,
  felv: null,
  pif: null,
  neutered: null,
  clinicalStatus: null,
  healthNotes: '',
  rescueDate: '',
  rescueLocation: '',
  sponsorName: '',
  sponsorPhone: '',
  sponsorCoverage: '',
};

interface NewCatScreenProps {
  onBack: () => void;
  onSaved: () => void;
}

export function NewCatScreen({ onBack, onSaved }: NewCatScreenProps) {
  const [generalError, setGeneralError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);
  const [roomOptions, setRoomOptions] = useState<Room[]>([]);
  const [roomsError, setRoomsError] = useState<string>();
  const [photos, setPhotos] = useState<string[]>([]);

  const {
    control,
    handleSubmit,
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

  async function takePhoto() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permissão necessária', 'Autorize o acesso à câmera para fotografar o gato.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!result.canceled) {
      addPhotos(result.assets.map((asset) => asset.uri));
    }
  }

  async function pickFromLibrary() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permissão necessária', 'Autorize o acesso às fotos para anexar imagens.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: MAX_PHOTOS - photos.length,
      quality: 0.8,
    });
    if (!result.canceled) {
      addPhotos(result.assets.map((asset) => asset.uri));
    }
  }

  function addPhotos(uris: string[]) {
    setPhotos((current) => [...current, ...uris].slice(0, MAX_PHOTOS));
  }

  function removePhoto(uri: string) {
    setPhotos((current) => current.filter((photo) => photo !== uri));
  }

  function handleAddPhotoPress() {
    Alert.alert('Adicionar foto', undefined, [
      { text: 'Tirar foto', onPress: takePhoto },
      { text: 'Escolher da galeria', onPress: pickFromLibrary },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  }

  async function submit(values: NewCatFormValues) {
    setGeneralError(undefined);
    setSubmitting(true);
    const request: CreateCatRequest = {
      ...values,
      roomId: values.roomId ? Number(values.roomId) : null,
      rescueDate: parseBrazilianDate(values.rescueDate) ?? '',
    } as CreateCatRequest;

    try {
      const cat = await createCat(request);

      const uploads = await Promise.allSettled(photos.map((uri) => uploadCatPhoto(cat.id, uri)));
      const failedCount = uploads.filter((result) => result.status === 'rejected').length;
      if (failedCount > 0) {
        Alert.alert(
          'Gato salvo',
          `O cadastro foi salvo, mas ${failedCount} de ${photos.length} foto(s) não foram enviadas. Tente adicioná-las depois.`,
        );
      }

      onSaved();
    } catch (error) {
      setGeneralError(error instanceof ApiError ? error.message : 'Não foi possível salvar o gato.');
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
        <Text style={styles.headerTitle}>Novo gato</Text>
      </View>

      <FormScreenLayout>
        <View style={styles.photoSection}>
          <View style={styles.photoSectionHeader}>
            <Text style={styles.photoSectionLabel}>Fotos do gato</Text>
            <Text style={styles.photoSectionHint}>até {MAX_PHOTOS} fotos</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.photoRow}>
              {photos.length < MAX_PHOTOS ? (
                <TouchableOpacity style={styles.addPhotoTile} onPress={handleAddPhotoPress} accessibilityRole="button">
                  <Ionicons name="add" size={16} color={colors.primary} />
                  <Text style={styles.addPhotoLabel}>Foto</Text>
                </TouchableOpacity>
              ) : null}
              {photos.map((uri) => (
                <TouchableOpacity key={uri} onPress={() => removePhoto(uri)} accessibilityRole="button" accessibilityLabel="Remover foto">
                  <Image source={{ uri }} style={styles.photoPlaceholder} />
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

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
            name="estimatedAge"
            render={({ field: { value, onChange } }) => (
              <TextField label="Idade estimada" placeholder="Ex: 4 anos" value={value} onChangeText={onChange} />
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

        <SectionLabel>Saúde</SectionLabel>

        <FormRow>
          <Controller
            control={control}
            name="fiv"
            render={({ field: { value, onChange } }) => (
              <SelectField label="FIV" value={value} placeholder="Selecione" options={HEALTH_TEST_OPTIONS} onChange={onChange} />
            )}
          />
          <Controller
            control={control}
            name="felv"
            render={({ field: { value, onChange } }) => (
              <SelectField label="FeLV" value={value} placeholder="Selecione" options={HEALTH_TEST_OPTIONS} onChange={onChange} />
            )}
          />
        </FormRow>

        <FormRow>
          <Controller
            control={control}
            name="pif"
            render={({ field: { value, onChange } }) => (
              <SelectField label="PIF" value={value} placeholder="Selecione" options={HEALTH_TEST_OPTIONS} onChange={onChange} />
            )}
          />
          <Controller
            control={control}
            name="neutered"
            render={({ field: { value, onChange } }) => (
              <SelectField label="Castrado(a)" value={value} placeholder="Selecione" options={NEUTERED_OPTIONS} onChange={onChange} />
            )}
          />
        </FormRow>

        <Controller
          control={control}
          name="clinicalStatus"
          render={({ field: { value, onChange } }) => (
            <SelectField
              label="Situação clínica"
              value={value}
              placeholder="Selecione"
              options={CLINICAL_STATUS_OPTIONS}
              onChange={onChange}
            />
          )}
        />

        <Controller
          control={control}
          name="healthNotes"
          render={({ field: { value, onChange } }) => (
            <TextField
              label="Observações de saúde"
              placeholder="Diagnósticos, tratamentos em andamento e cuidados especiais."
              multiline
              numberOfLines={3}
              style={{ minHeight: 60, textAlignVertical: 'top' }}
              value={value}
              onChangeText={onChange}
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
            name="rescueLocation"
            render={({ field: { value, onChange } }) => (
              <TextField label="Local de resgate" placeholder="Rua, bairro" value={value} onChangeText={onChange} />
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
          name="sponsorCoverage"
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

        <Button title="Salvar gato" onPress={handleSubmit(submit)} loading={submitting} />
      </FormScreenLayout>
    </View>
  );
}
