import { ImageSourcePropType } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const cover: ImageSourcePropType = require('../images/cover.png');

export interface ComingSoonFeature {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
}

export interface ComingSoonItem {
  id: string;
  badge?: string;
  releaseTag?: string;
  title: string;
  description: string;
  image: ImageSourcePropType;
  features: ComingSoonFeature[];
}

export const soonData: Record<string, ComingSoonItem> = {
  default: {
    id: 'default',
    badge: 'COMING SOON',
    releaseTag: 'NEXT UPDATE',
    title: 'New Feature Under Construction',
    description:
      'We are putting the finishing touches on this page to bring you an even better experience.',
    image: cover,
    features: [
      {
        icon: 'flash-outline',
        title: 'Instant Live Results',
        subtitle: 'Real-time updates the moment a draw closes.',
      },
      {
        icon: 'trophy-outline',
        title: 'Bigger Bonus Pools',
        subtitle: 'Unlock special rewards and multiplier rounds.',
      },
      {
        icon: 'shield-checkmark-outline',
        title: 'Fair & Verified',
        subtitle: 'Transparent draw history you can check anytime.',
      },
    ],
  },

  leaderboard: {
    id: 'leaderboard',
    badge: 'COMING SOON',
    releaseTag: 'VERSION 1.1',
    title: 'Weekly Top Winners',
    description:
      'Track top lucky numbers, streak champions, and weekly prize leaderboards.',
    image: cover,
    features: [
      {
        icon: 'podium-outline',
        title: 'Live Rankings',
        subtitle: 'See top players updated immediately after every draw.',
      },
      {
        icon: 'gift-outline',
        title: 'Monthly Milestone Rewards',
        subtitle: 'Extra bonus entries for top 10 finishers.',
      },
    ],
  },

  wallet: {
    id: 'wallet',
    badge: 'COMING SOON',
    releaseTag: 'IN PROGRESS',
    title: 'Instant Wallet & Payouts',
    description: 'Manage your balance, view transaction history, and withdraw winnings seamlessly.',
    image: cover,
    features: [
      {
        icon: 'wallet-outline',
        title: 'Fast Local Payouts',
        subtitle: 'Quick and secure transfers directly to your account.',
      },
      {
        icon: 'receipt-outline',
        title: 'Full Draw Receipts',
        subtitle: 'Detailed history of every entry and reward earned.',
      },
    ],
  },
};