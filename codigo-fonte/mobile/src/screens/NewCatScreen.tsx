import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Alert, Animated, Easing, Image, KeyboardAvoidingView, Text, TouchableOpacity, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Button, FormRow, KeyboardAwareScrollView, SectionLabel, SelectField, StepIndicator, TextField } from '../components';
import { ApiError } from '../services/api';
import { updateCat } from '../services/catService';
import { catRepository } from '../sync/runtime';
import { useSync } from '../sync/SyncContext';
import { colors } from '../theme/colors';
import type { CreateCatRequest } from '../types/cat';
import { GENERAL_STATUS_LABELS, SEX_LABELS } from '../types/cat';
import type { Room } from '../types/room';
import { formatBrazilianDate, maskBrazilianDate, parseBrazilianDate } from '../utils/date';
import { maskBrazilianPhone } from '../utils/phone';
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

const STEP_TITLES = ['Identificação', 'Saúde e local', 'Resgate e apadrinhamento'];

const STEP_FIELDS: (keyof NewCatFormValues)[][] = [
  ['name', 'sex', 'estimatedBirthDate', 'coat'],
  ['weightKg', 'microchip', 'roomId', 'generalStatus', 'characteristics'],
  ['rescueDate', 'foundConditions', 'sponsorName', 'sponsorPhone', 'sponsorFunding'],
];

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
  const { userId } = useSync();

  const [generalError, setGeneralError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(0);
  const [stepDirection, setStepDirection] = useState(1);
  const [stepProgress] = useState(() => new Animated.Value(1));
  const [roomOptions, setRoomOptions] = useState<Room[]>([]);
  const [roomsError, setRoomsError] = useState<string>();
  const [photoUri, setPhotoUri] = useState<string>();
  const isLocalCat = isEditing && catId < 0;
  const [loadingCat, setLoadingCat] = useState(isEditing && !isLocalCat);
  const [loadError, setLoadError] = useState<string | undefined>(isLocalCat ? 'Aguarde a sincronização para editar este gato.' : undefined);

  const {
    control,
    handleSubmit,
    reset,
    trigger,
    formState: { errors },
  } = useForm<NewCatFormValues>({ defaultValues: DEFAULT_VALUES });

  useEffect(() => {
    catRepository
      .listActiveRooms()
      .then((rooms) => {
        setRoomOptions(rooms);
        if (rooms.length === 0) {
          setRoomsError('As salas ainda não foram sincronizadas. Conecte-se para carregá-las.');
        }
      })
      .catch(() => setRoomsError('Não foi possível carregar as salas.'));
  }, []);

  useEffect(() => {
    if (catId === undefined || catId < 0) {
      return;
    }

    catRepository
      .getCat(catId)
      .then((cat) => {
        if (!cat) {
          setLoadError('Gato não encontrado.');
          return;
        }

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
        setLoadError(error instanceof ApiError && error.status === 404 ? 'Gato não encontrado.' : 'Não foi possível carregar o gato.');
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
        const updated = await updateCat(catId, request);
        await catRepository.cacheCat(updated);
        onSaved();
        return;
      }

      if (userId === null) {
        setGeneralError('Sessão expirada. Entre novamente.');
        return;
      }

      await catRepository.createCat(userId, request, photoUri);
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

  useEffect(() => {
    stepProgress.setValue(0);
    Animated.timing(stepProgress, {
      toValue: 1,
      duration: 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [step, stepProgress]);

  const isLastStep = step === STEP_TITLES.length - 1;

  async function handleNext() {
    const valid = await trigger(STEP_FIELDS[step]);
    if (valid) {
      setStepDirection(1);
      setStep((current) => current + 1);
    }
  }

  function handleStepBack() {
    if (step === 0) {
      onBack();
      return;
    }
    setStepDirection(-1);
    setStep((current) => current - 1);
  }

  return (
    <KeyboardAvoidingView style={styles.screen} behavior="padding">
      <View style={styles.header}>
        <TouchableOpacity onPress={handleStepBack} accessibilityRole="button" accessibilityLabel="Voltar">
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
        <>
          <StepIndicator titles={STEP_TITLES} current={step} />
          <KeyboardAwareScrollView contentContainerStyle={styles.stepContent}>
            <Animated.View
              style={[
                styles.stepBody,
                {
                  opacity: stepProgress,
                  transform: [
                    {
                      translateX: stepProgress.interpolate({
                        inputRange: [0, 1],
                        outputRange: [28 * stepDirection, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              {step === 0 ? (
                <>
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
                        <TextField
                          label="Nascimento estimado"
                          placeholder="dd/mm/aaaa"
                          keyboardType="number-pad"
                          maxLength={10}
                          value={value}
                          onChangeText={(text) => onChange(maskBrazilianDate(text))}
                        />
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
                </>
              ) : null}

              {step === 1 ? (
                <>
                  <FormRow>
                    <Controller
                      control={control}
                      name="weightKg"
                      render={({ field: { value, onChange } }) => (
                        <TextField
                          label="Peso (kg)"
                          placeholder="Ex: 3,5"
                          keyboardType="decimal-pad"
                          value={value}
                          onChangeText={onChange}
                        />
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
                </>
              ) : null}

              {step === 2 ? (
                <>
                  <SectionLabel>Resgate</SectionLabel>

                  <FormRow>
                    <Controller
                      control={control}
                      name="rescueDate"
                      render={({ field: { value, onChange } }) => (
                        <TextField
                          label="Data de resgate"
                          placeholder="dd/mm/aaaa"
                          keyboardType="number-pad"
                          maxLength={10}
                          value={value}
                          onChangeText={(text) => onChange(maskBrazilianDate(text))}
                        />
                      )}
                    />
                    <Controller
                      control={control}
                      name="foundConditions"
                      render={({ field: { value, onChange } }) => (
                        <TextField
                          label="Condições encontradas"
                          placeholder="Ex: desnutrido, ferido"
                          value={value}
                          onChangeText={onChange}
                        />
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
                        <TextField
                          label="Telefone"
                          placeholder="(00) 00000-0000"
                          keyboardType="phone-pad"
                          maxLength={15}
                          value={value}
                          onChangeText={(text) => onChange(maskBrazilianPhone(text))}
                        />
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
                </>
              ) : null}

              {generalError ? <Text style={styles.generalError}>{generalError}</Text> : null}
            </Animated.View>
          </KeyboardAwareScrollView>

          <View style={styles.footer}>
            <Button variant="outline" title={step === 0 ? 'Cancelar' : 'Voltar'} onPress={handleStepBack} style={styles.footerButton} />
            <Button
              title={isLastStep ? (isEditing ? 'Salvar alterações' : 'Salvar gato') : 'Avançar'}
              onPress={isLastStep ? handleSubmit(submit) : handleNext}
              loading={submitting}
              style={styles.footerButton}
            />
          </View>
        </>
      )}
    </KeyboardAvoidingView>
  );
}
