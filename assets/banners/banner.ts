import { ImageSourcePropType } from 'react-native';

const cover: ImageSourcePropType = require('../images/cover.png');

export interface BannerItem {
  id: string;
  badge?: string;
  prize?: string;
  title: string;
  description: string;
  image: ImageSourcePropType;
  buttonText?: string;
  onPress?: () => void;
}

export const banner: BannerItem[] = [
  {
    id: '1',
    badge: 'LIVE DRAW',
    prize: '5,000 ETB',
    title: 'Special Announcement',
    description: 'Discover our latest lucky number draw.',
    image: cover,
    buttonText: 'Join Now',
    onPress: () => console.log('Ad 1 pressed'),
  },
  {
    id: '2',
    badge: 'TONIGHT',
    prize: '2X BONUS',
    title: 'Bonus Draw',
    description: 'Double your chances in tonight’s draw!',
    image: cover,
    buttonText: 'Enter Draw',
    onPress: () => console.log('Ad 2 pressed'),
  },
];