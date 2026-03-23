import { 
  User as UserIcon, 
  Gamepad2, 
  Ghost, 
  Smile, 
  Cat, 
  Dog, 
  Zap, 
  Star, 
  Heart, 
  Flame, 
  Sun, 
  Droplets, 
  Anchor,
  Activity,
  Award,
  BadgeAlert,
  Bird,
  Cherry,
  Coffee,
  Crown
} from 'lucide-react';

export const availableIcons = [
  { name: 'User', component: UserIcon },
  { name: 'Gamepad2', component: Gamepad2 },
  { name: 'Ghost', component: Ghost },
  { name: 'Smile', component: Smile },
  { name: 'Cat', component: Cat },
  { name: 'Dog', component: Dog },
  { name: 'Zap', component: Zap },
  { name: 'Star', component: Star },
  { name: 'Heart', component: Heart },
  { name: 'Flame', component: Flame },
  { name: 'Sun', component: Sun },
  { name: 'Droplets', component: Droplets },
  { name: 'Anchor', component: Anchor },
  { name: 'Activity', component: Activity },
  { name: 'Award', component: Award },
  { name: 'BadgeAlert', component: BadgeAlert },
  { name: 'Bird', component: Bird },
  { name: 'Cherry', component: Cherry },
  { name: 'Coffee', component: Coffee },
  { name: 'Crown', component: Crown },
];

export const getIconComponent = (iconName: string | undefined) => {
  if (!iconName) return UserIcon;
  const found = availableIcons.find(icon => icon.name === iconName);
  return found ? found.component : UserIcon;
};
