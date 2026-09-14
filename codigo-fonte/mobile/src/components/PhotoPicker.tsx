import { useState } from "react";
import {
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { colors } from "../theme/colors";
import { radii, spacing } from "../theme/spacing";

interface PhotoPickerProps {
  uri: string | null;
  onChange: (uri: string | null) => void;
}

export function PhotoPicker({ uri, onChange }: PhotoPickerProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  async function pickFromCamera() {
    setMenuOpen(false);
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (!result.canceled) {
      onChange(result.assets[0].uri);
    }
  }

  async function pickFromLibrary() {
    setMenuOpen(false);
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.7 });
    if (!result.canceled) {
      onChange(result.assets[0].uri);
    }
  }

  function removePhoto() {
    setMenuOpen(false);
    onChange(null);
  }

  return (
    <View>
      <View style={styles.photoArea}>
        {uri ? (
          <Image source={{ uri }} style={styles.photo} />
        ) : (
          <Ionicons name="image-outline" size={40} color={colors.inkFaint} />
        )}
        <TouchableOpacity
          style={styles.cameraButton}
          onPress={() => setMenuOpen(true)}
          accessibilityRole="button"
          accessibilityLabel="Adicionar foto"
        >
          <Ionicons name="camera" size={18} color={colors.ink} />
        </TouchableOpacity>
      </View>

      <Modal
        visible={menuOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuOpen(false)}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={() => setMenuOpen(false)}
        >
          <View style={styles.sheet}>
            <TouchableOpacity style={styles.option} onPress={pickFromCamera}>
              <Ionicons name="camera-outline" size={20} color={colors.ink} />
              <Text style={styles.optionText}>Tirar foto</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.option} onPress={pickFromLibrary}>
              <Ionicons name="images-outline" size={20} color={colors.ink} />
              <Text style={styles.optionText}>Escolher da galeria</Text>
            </TouchableOpacity>
            {uri ? (
              <TouchableOpacity style={styles.option} onPress={removePhoto}>
                <Ionicons
                  name="trash-outline"
                  size={20}
                  color={colors.danger}
                />
                <Text style={[styles.optionText, styles.optionTextDanger]}>
                  Remover foto
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  photoArea: {
    aspectRatio: 16 / 10,
    backgroundColor: colors.infoBg,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  photo: {
    width: "100%",
    height: "100%",
  },
  cameraButton: {
    position: "absolute",
    bottom: spacing.sm + 2,
    right: spacing.sm + 2,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.md,
    borderTopRightRadius: radii.md,
    padding: spacing.lg,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm + 2,
    paddingVertical: spacing.sm + 4,
  },
  optionText: {
    fontSize: 15,
    color: colors.ink,
  },
  optionTextDanger: {
    color: colors.danger,
  },
});
