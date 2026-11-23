import { ImageSourcePropType } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const cover: ImageSourcePropType = require('../images/cover.png');
const car: ImageSourcePropType = require('../documents/car.jpg');
const car2: ImageSourcePropType = require('../documents/car1.jpg');
const house: ImageSourcePropType = require('../documents/house1.jpg');
const kichen: ImageSourcePropType = require('../documents/kichen.jpg');
const kichen1: ImageSourcePropType = require('../documents/kichen1.jpg');

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

export const carSoon: ComingSoonItem = {
  id: 'car',
  badge: 'COMING SOON',
  releaseTag: 'GRAND PRIZE',
  title: 'Luxury Car Lucky Draw',
  description: 'Enter upcoming special rounds for a chance to win brand-new vehicles.',
  image: car,
  features: [
    {
      icon: 'car-sport-outline',
      title: 'Verified Vehicle Prizes',
      subtitle: 'Full ownership transfer and transparent live draw.',
    },
    {
      icon: 'ticket-outline',
      title: 'Bonus Ticket Entries',
      subtitle: 'Regular players earn extra entries automatically.',
    },
  ],
};

export const houseSoon: ComingSoonItem = {
  id: 'house',
  badge: 'COMING SOON',
  releaseTag: 'MEGA DRAW',
  title: 'Dream Home Jackpot',
  description: 'Participate in milestone community draws with life-changing home prizes.',
  image: house,
  features: [
    {
      icon: 'home-outline',
      title: 'Prime Location Homes',
      subtitle: 'Modern apartments ready for immediate handover.',
    },
    {
      icon: 'shield-checkmark-outline',
      title: 'Audited & Fair Draw',
      subtitle: 'Live-streamed selection with instant verification.',
    },
  ],
};

export const kitchenSoon: ComingSoonItem = {
  id: 'kitchen',
  badge: 'COMING SOON',
  releaseTag: 'WEEKLY REWARD',
  title: 'Modern Kitchen & Appliance Pack',
  description: 'Weekly home makeover bundles and premium kitchen appliances.',
  image: kichen,
  features: [
    {
      icon: 'gift-outline',
      title: 'Weekly Winner Drops',
      subtitle: 'Multiple winners selected every Sunday.',
    },
    {
      icon: 'flash-outline',
      title: 'Fast Delivery',
      subtitle: 'Direct doorstep delivery or cash equivalent option.',
    },
  ],
};

// Export all items as an array so the component can loop and display them
export const soonItems: ComingSoonItem[] = [
  carSoon,
  houseSoon,
  kitchenSoon,
  {
    id: 'car-special',
    badge: 'COMING SOON',
    releaseTag: 'VIP ROUND',
    title: 'Weekend Speedster Edition',
    description: 'Exclusive limited-seat number draw with boosted odds.',
    image: car2,
    features: [],
  },
  {
    id: 'kitchen-deluxe',
    badge: 'COMING SOON',
    releaseTag: 'BONUS POOL',
    title: 'Deluxe Home Appliances',
    description: 'Complete home upgrade packages for lucky number holders.',
    image: kichen1,
    features: [],
  },
];