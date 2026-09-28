import { Home, Map as MapIcon, User, Crown } from 'lucide-react'

export const NAV_ITEMS = [
  { to: '/home',      label: 'Home',    icon: Home },
  { to: '/quests',    label: 'Quests',  icon: MapIcon },
  { to: '/profile',   label: 'Profile', icon: User },
  { to: '/subscribe', label: 'Premium', icon: Crown },
]