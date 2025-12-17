'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarSeparator,
  SidebarGroup,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  History,
  LayoutDashboard,
  LogOut,
  Settings,
  FileText,
  CheckCircle,
  User,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useApiKeys } from '@/context/api-keys-context';
import { services } from '@/lib/services';
import { ZeroSharkLogo } from '@/components/logos/zeroshark-logo';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/history', icon: History, label: 'History' },
  { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const userAvatar = PlaceHolderImages.find((p) => p.id === 'user-avatar');
  const { apiKeys } = useApiKeys();

  const configuredServices = services.filter((service) => apiKeys[service.id]);

  return (
    <Sidebar>
      <SidebarHeader>
        <Link href="/home" className="flex items-center gap-2">
          <ZeroSharkLogo className="size-7 text-primary" />
          <span className="text-xl font-semibold font-headline">ZeroShark</span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              <Link href={item.href} passHref prefetch={true}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={{ children: item.label }}
                >
                  <div>
                    <item.icon />
                    <span>{item.label}</span>
                  </div>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>

        {configuredServices.length > 0 && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
               <SidebarGroupLabel>Configured Keys</SidebarGroupLabel>
                 <SidebarMenu>
                    {configuredServices.map((service) => (
                      <SidebarMenuItem key={service.id}>
                        <SidebarMenuButton
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground"
                          disabled
                        >
                          <CheckCircle className="text-green-500" />
                          <span>{service.name}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                 </SidebarMenu>
            </SidebarGroup>
          </>
        )}

      </SidebarContent>
      <SidebarFooter>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start p-2 text-left h-auto"
            >
              <div className="flex w-full items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={userAvatar?.imageUrl}
                    data-ai-hint={userAvatar?.imageHint}
                  />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <div className="flex flex-col overflow-hidden text-sm">
                  <span className="font-medium truncate">User</span>
                  <span className="text-xs text-muted-foreground truncate">
                    user@example.com
                  </span>
                </div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 mb-2" side="top" align="start">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/profile">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>Billing</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
