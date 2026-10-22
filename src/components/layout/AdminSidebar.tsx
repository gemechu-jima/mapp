import { router, usePathname } from 'expo-router';
import { Activity, Bell, ChartNoAxesColumn, CreditCard, Dices, Gamepad2, Hash, LayoutDashboard, LockKeyhole, Settings, Ticket, Users, X } from 'lucide-react-native';
import { Pressable, ScrollView, View } from 'react-native';
import SidebarMenu, { type SidebarItem } from '../common/SidebarMenu';
import { TranslatedText as Text } from '@/components/common/TranslatedText';
type Props={visible:boolean;onClose:()=>void};
export default function AdminSidebar({visible,onClose}:Props){const path=usePathname();if(!visible)return null;const go=(route:string)=>{onClose();router.push(route as never)};const items:SidebarItem[]=[
{label:'Dashboard',icon:LayoutDashboard,active:path.endsWith('/dashboard'),onPress:()=>go('/(admin)/dashboard')},
{label:'Manage Games',icon:Gamepad2,active:path.endsWith('/games'),onPress:()=>go('/(admin)/games')},
{label:'Number Inventory',icon:Hash,active:path.endsWith('/numbers'),onPress:()=>go('/(admin)/numbers')},
{label:'Reservations',icon:Ticket,active:path.endsWith('/reservations'),onPress:()=>go('/(admin)/reservations')},
{label:'Payment Review',icon:CreditCard,active:path.endsWith('/payments'),onPress:()=>go('/(admin)/payments')},
{label:'Draw Now',icon:Dices,active:path.endsWith('/draw'),onPress:()=>go('/(admin)/draw')},
{label:'Draw History',icon:Activity,active:path.endsWith('/results'),onPress:()=>go('/(admin)/results')},
{label:'Players & Access',icon:Users,active:path.endsWith('/players'),onPress:()=>go('/(admin)/players')},
{label:'Notifications',icon:Bell,active:path.endsWith('/notifications'),onPress:()=>go('/(admin)/notifications')},
{label:'Reports',icon:ChartNoAxesColumn,active:path.endsWith('/reports'),onPress:()=>go('/(admin)/reports')},
{label:'Security & Audit',icon:LockKeyhole,active:path.endsWith('/security'),onPress:()=>go('/(admin)/security')},
{label:'Settings',icon:Settings,active:path.endsWith('/settings'),onPress:()=>go('/(admin)/settings')},];return <View className="absolute inset-0 z-50 flex-row"><Pressable onPress={onClose} className="absolute inset-0 bg-black/50"/><View className="h-full w-80 border-r border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900"><View className="mb-5 flex-row items-center justify-between"><View><Text className="text-xl font-bold text-slate-900 dark:text-white">Bingo Admin</Text><Text className="mt-1 text-xs text-slate-500 dark:text-slate-400">Management workspace</Text></View><Pressable onPress={onClose} className="rounded-lg bg-slate-100 p-2 dark:bg-slate-800"><X size={20} color="#64748b"/></Pressable></View><ScrollView showsVerticalScrollIndicator={false}><SidebarMenu items={items}/><View className="mt-5 rounded-xl bg-blue-50 p-3 dark:bg-blue-950"><Activity size={18} color="#2563eb"/><Text className="mt-2 text-sm font-semibold text-blue-900 dark:text-blue-200">All modules</Text><Text className="mt-1 text-xs leading-5 text-blue-800 dark:text-blue-300">Frontend demo screens are ready for backend integration.</Text></View></ScrollView></View></View>}