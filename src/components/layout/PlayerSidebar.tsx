import { router, usePathname } from 'expo-router';
import { Bell, Gamepad2, LayoutDashboard, Settings, Ticket, Trophy, UserRound, X, CreditCard } from 'lucide-react-native';
import { Pressable, ScrollView, View } from 'react-native';
import SidebarMenu, { type SidebarItem } from '../common/SidebarMenu';
import { TranslatedText as Text } from '@/components/common/TranslatedText';
type Props={visible:boolean;onClose:()=>void};
export default function PlayerSidebar({visible,onClose}:Props){const path=usePathname();if(!visible)return null;const go=(route:string)=>{onClose();router.push(route as never)};const items:SidebarItem[]=[
{label:'Dashboard',icon:LayoutDashboard,active:path.endsWith('/dashboard')||path.endsWith('/home'),onPress:()=>go('/(player)/dashboard')},
{label:'Browse Games',icon:Gamepad2,active:path.endsWith('/games'),onPress:()=>go('/(player)/games')},
{label:'My Reservations',icon:Ticket,active:path.endsWith('/reservations')||path.endsWith('/ticket'),onPress:()=>go('/(player)/reservations')},
{label:'Payments',icon:CreditCard,active:path.endsWith('/payments'),onPress:()=>go('/(player)/payments')},
{label:'Draw Results',icon:Trophy,active:path.endsWith('/results'),onPress:()=>go('/(player)/results')},
{label:'Notifications',icon:Bell,active:path.endsWith('/notifications'),onPress:()=>go('/(player)/notifications')},
{label:'My Profile',icon:UserRound,active:path.endsWith('/profile'),onPress:()=>go('/(player)/profile')},
{label:'Settings',icon:Settings,active:path.endsWith('/settings'),onPress:()=>go('/(player)/settings')},];return <View className="absolute inset-0 z-50 flex-row"><Pressable onPress={onClose} className="absolute inset-0 bg-black/50"/><View className="h-full w-80 border-r border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900"><View className="mb-5 flex-row items-center justify-between"><View><Text className="text-xl font-bold text-slate-900 dark:text-white">Bingo Menu</Text><Text className="mt-1 text-xs text-slate-500 dark:text-slate-400">Player workspace</Text></View><Pressable onPress={onClose} className="rounded-lg bg-slate-100 p-2 dark:bg-slate-800"><X size={20} color="#64748b"/></Pressable></View><ScrollView showsVerticalScrollIndicator={false}><SidebarMenu items={items}/></ScrollView></View></View>}