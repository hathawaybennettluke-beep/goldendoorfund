"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser, useClerk } from "@clerk/nextjs";
import {
  LayoutDashboard, Search, Package, Layers, Globe, Megaphone, Image as ImageIcon, Mail, Users, ShoppingCart, Truck, Settings, LogOut, ChevronUp, ExternalLink, Bot, Plus, Store as StoreIcon, ChevronsUpDown,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger,
} from "@/components/ui/sidebar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useStore } from "./StoreProvider";

const BASE = "/ecommerce/dashboard";

const NAV = [
  { label: "Overview", items: [{ title: "Dashboard", href: BASE, icon: LayoutDashboard, exact: true }] },
  { label: "1 · Find products", items: [{ title: "Research", href: `${BASE}/research`, icon: Search }] },
  {
    label: "2 · Build the store",
    items: [
      { title: "Products", href: `${BASE}/store/products`, icon: Package },
      { title: "Collections", href: `${BASE}/store/collections`, icon: Layers },
      { title: "SEO", href: `${BASE}/store/seo`, icon: Globe },
    ],
  },
  {
    label: "3 · Marketing",
    items: [
      { title: "Campaigns", href: `${BASE}/marketing/campaigns`, icon: Megaphone },
      { title: "Creatives", href: `${BASE}/marketing/creatives`, icon: ImageIcon },
      { title: "Email & SMS", href: `${BASE}/marketing/messaging`, icon: Mail },
      { title: "Influencers", href: `${BASE}/marketing/influencers`, icon: Users },
    ],
  },
  {
    label: "4 · Orders",
    items: [
      { title: "Orders", href: `${BASE}/orders`, icon: ShoppingCart, exact: true },
      { title: "Shipments", href: `${BASE}/orders/shipments`, icon: Truck },
    ],
  },
  { label: "Configuration", items: [{ title: "Settings & integrations", href: `${BASE}/settings`, icon: Settings }] },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useUser();
  const { signOut } = useClerk();
  const { stores, store, setStoreId } = useStore();

  const isActive = (href: string, exact?: boolean) => (exact ? pathname === href : pathname.startsWith(href));
  const current = NAV.flatMap((g) => g.items).filter((i) => isActive(i.href, i.exact)).sort((a, b) => b.href.length - a.href.length)[0];

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <StoreIcon className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{store?.name ?? "Select a store"}</span>
                  <span className="truncate text-xs opacity-70">{store?.niche ?? "Commerce Autopilot"}</span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64" align="start">
              <DropdownMenuLabel>Your stores</DropdownMenuLabel>
              {(stores ?? []).map((s) => (
                <DropdownMenuItem key={s._id} onClick={() => setStoreId(s._id)} className="flex items-center justify-between">
                  <span className="truncate">{s.name}</span>
                  {s._id === store?._id && <Badge variant="secondary" className="ml-2">current</Badge>}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`${BASE}/onboarding`}>
                  <Plus className="mr-2 h-4 w-4" /> New store
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarHeader>

        <SidebarContent>
          {NAV.map((group) => (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild isActive={isActive(item.href, item.exact)} tooltip={item.title}>
                        <Link href={item.href}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-muted text-foreground text-xs font-semibold">
                      {(user?.firstName?.[0] ?? user?.primaryEmailAddress?.emailAddress?.[0] ?? "U").toUpperCase()}
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">{user?.fullName ?? "Account"}</span>
                      <span className="truncate text-xs opacity-70">{user?.primaryEmailAddress?.emailAddress}</span>
                    </div>
                    <ChevronUp className="ml-auto size-4" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="top" align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link href="/ecommerce">About the platform</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/">Back to GoldenDoor Fund</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut({ redirectUrl: "/ecommerce" })}>
                    <LogOut className="mr-2 h-4 w-4" /> Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-3 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex items-center gap-2 text-sm">
            <Bot className="h-4 w-4 text-primary" />
            <span className="font-medium">Commerce Autopilot</span>
            {current && (
              <>
                <span className="text-muted-foreground">/</span>
                <span className="text-muted-foreground">{current.title}</span>
              </>
            )}
          </div>
          <div className="ml-auto flex items-center gap-2">
            {store && (
              <Button asChild variant="outline" size="sm">
                <Link href={`/ecommerce/storefront/${store.slug}`} target="_blank">
                  <ExternalLink className="h-4 w-4" /> View storefront
                </Link>
              </Button>
            )}
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-muted/20 p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
