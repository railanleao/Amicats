import { Image, View } from 'react-native';
import { catPhotoSource } from '../../services/catService';
import type { Cat } from '../../types/cat';
import { styles } from './CatAvatar.styles';

interface CatAvatarProps {
  cat: Pick<Cat, 'id' | 'photoUrl'>;
  size?: number;
}

export function CatAvatar({ cat, size = 44 }: CatAvatarProps) {
  const shape = { width: size, height: size, borderRadius: size / 2 };

  return <View style={[styles.avatar, shape]}>{cat.photoUrl ? <Image source={catPhotoSource(cat.id)} style={styles.image} /> : null}</View>;
}
