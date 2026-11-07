import {
  Home,
  Map as MapIcon,
  TrendingUp,
  User,
  Crown,
  ClipboardList,
  Video,
  FolderTree,
  Users,
} from 'lucide-react'

// everyone (also used by MobileNav)
export const NAV_ITEMS = [
  { to: '/home',      label: 'Home',     icon: Home },
  { to: '/quests',    label: 'Quests',   icon: MapIcon },
  { to: '/progress',  label: 'Progress', icon: TrendingUp },
  { to: '/profile',   label: 'Profile',  icon: User },
  { to: '/subscribe', label: 'Premium',  icon: Crown },
]

// ADMIN or TEACHER
export const STAFF_NAV_ITEMS = [
  { to: '/admin/quests', label: 'Manage quests', icon: ClipboardList },
  { to: '/admin/videos', label: 'Manage videos', icon: Video },
]

// ADMIN only
// ADMIN only
export const ADMIN_NAV_ITEMS = [
  { to: '/admin/categories', label: 'Categories', icon: FolderTree },
  { to: '/admin/users',      label: 'Users',      icon: Users },
]