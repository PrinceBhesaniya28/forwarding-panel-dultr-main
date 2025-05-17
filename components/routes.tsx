// Auth Imports
import { IRoute } from '@/types/types';
import {
  HiOutlineCog8Tooth,
  HiOutlineCpuChip,
  HiOutlineCreditCard,
  HiOutlineCurrencyDollar,
  HiOutlineArrowPathRoundedSquare,
  HiOutlinePhoneArrowDownLeft,
  HiOutlineDocumentText,
  HiOutlineHome,
  HiOutlineUsers,
  HiOutlineChartBarSquare,
  HiOutlineMegaphone,
  HiOutlineBanknotes
} from 'react-icons/hi2';

export const routes: IRoute[] = [
  {
    name: 'Main Dashboard',
    path: '/dashboard/main',
    icon: <HiOutlineHome className="-mt-[7px] h-4 w-4 stroke-2 text-inherit" />,
    collapse: false,
    roles: ['admin', 'user']
  },
  // {
  //   name: 'AI Pages',
  //   path: '/ai-pages',
  //   icon: (
  //     <HiOutlineCpuChip className="-mt-[7px] h-4 w-4 stroke-2 text-inherit" />
  //   ),
  //   collapse: true,
  //   items: [
  //     {
  //       name: 'AI Generator',
  //       path: '/dashboard/ai-generator',
  //       collapse: false
  //     },
  //     {
  //       name: 'AI Assistant',
  //       path: '/dashboard/ai-assistant',
  //       collapse: false
  //     },
  //     {
  //       name: 'AI Chat',
  //       path: '/dashboard/ai-chat',
  //       collapse: false
  //     },
  //     {
  //       name: 'AI Text to Speech',
  //       path: '/dashboard/ai-text-to-speech',
  //       collapse: false
  //     }
  //   ]
  // },
  // {
  //  name: 'AI Generator',
  //  path: '/dashboard/ai-generator',
  //  icon: <MdWorkspacePremium className="-mt-[7px] h-4 w-4 stroke-2 text-inherit" />,
  //  collapse: false,
  // },
  // {
  //  name: 'AI Assistant',
  //  path: '/dashboard/ai-assistant',
  //  icon: <MdAssistant className="-mt-[7px] h-4 w-4 stroke-2 text-inherit" />,
  //  collapse: false,
  // },
  // {
  //  name: 'AI Chat',
  //  path: '/dashboard/ai-chat',
  //  icon: <MdAutoAwesome className="-mt-[7px] h-4 w-4 stroke-2 text-inherit" />,
  //  collapse: false,
  // },
  {
    name: 'Users List',
    path: '/dashboard/users-list',
    icon: (
      <HiOutlineUsers className="-mt-[7px] h-4 w-4 stroke-2 text-inherit" />
    ),
    collapse: false,
    roles: ['admin']
  },
  {
    name: 'Campaign List',
    path: '/dashboard/campaign-list',
    icon: (
      <HiOutlineMegaphone className="-mt-[7px] h-4 w-4 stroke-2 text-inherit" />
    ),
    collapse: false,
    roles: ['admin', 'user']
  },
  {
    name: 'Trunk List',
    path: '/dashboard/trunk-list',
    icon: (
      <HiOutlineChartBarSquare className="-mt-[7px] h-4 w-4 stroke-2 text-inherit" />
    ),
    collapse: false,
    roles: ['admin']
  },
  {
    name: 'Advance Reporting',
    path: '/dashboard/cdr-list',
    icon: (
      <HiOutlineCpuChip className="-mt-[7px] h-4 w-4 stroke-2 text-inherit" />
    ),
    collapse: false,
    roles: ['admin', 'user']
  },
  {
    name: 'Live Calls',
    path: '/dashboard/live-list',
    icon: (
      <HiOutlinePhoneArrowDownLeft className="-mt-[7px] h-4 w-4 stroke-2 text-inherit" />
    ),
    collapse: false,
    roles: ['admin', 'user']
  },
  {
    name: 'Targets',
    path: '/dashboard/target-list',
    icon: (
      <HiOutlineArrowPathRoundedSquare className="-mt-[7px] h-4 w-4 stroke-2 text-inherit" />
    ),
    collapse: false,
    roles: ['admin', 'user']
  },
  {
    name: 'Numbers',
    path: '/dashboard/number-list',
    icon: (
      <HiOutlineDocumentText className="-mt-[7px] h-4 w-4 stroke-2 text-inherit" />
    ),
    collapse: false,
    roles: ['admin', 'user']
  },
  // {
  //   name: 'Live Calls',
  //   path: '/dashboard/number-list',
  //   icon: (
  //     <HiOutlineDocumentText className="-mt-[7px] h-4 w-4 stroke-2 text-inherit" />
  //   ),
  //   collapse: false
  // },
  {
    name: 'Payments',
    path: '/dashboard/payment-list',
    icon: (
      <HiOutlineBanknotes className="-mt-[7px] h-4 w-4 stroke-2 text-inherit" />
    ),
    collapse: false,
    roles: ['admin']
  },
  {
    name: 'Settings',
    path: '/dashboard/settings',
    icon: (
      <HiOutlineCog8Tooth className="-mt-[7px] h-4 w-4 stroke-2 text-inherit" />
    ),
    collapse: false,
    roles: ['admin', 'user']
  },
  {
    name: 'Subscription',
    path: '/dashboard/subscription',
    icon: (
      <HiOutlineCreditCard className="-mt-[7px] h-4 w-4 stroke-2 text-inherit" />
    ),
    collapse: false,
    roles: ['admin', 'user']
  },
  // {
  //   name: 'Landing Page',
  //   path: '/home',
  //   icon: (
  //     <HiOutlineDocumentText className="-mt-[7px] h-4 w-4 stroke-2 text-inherit" />
  //   ),
  //   collapse: false
  // },
  // {
  //   name: 'Pricing Page',
  //   path: '/pricing',
  //   icon: (
  //     <HiOutlineCurrencyDollar className="-mt-[7px] h-4 w-4 stroke-2 text-inherit" />
  //   ),
  //   collapse: false
  // }
];
