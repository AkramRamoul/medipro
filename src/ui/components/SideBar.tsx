import { NavLink, useLocation } from "react-router-dom";
import {
  Clipboard,
  PillBottle,
  ChartColumnIncreasing,
  SettingsIcon,
  FilePen,
  Calendar,
  Users,
  Wallet,
  CalendarCheck,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../components/ui/sidebar";
import { NavSecondary } from "./Nav-secondary";
import { useAuth, Permission } from "../context/auth-context";

export function AppSidebar() {
  const location = useLocation();
  const currentPath = location.pathname;
  const { can } = useAuth();

  const allItems = [
    { title: "Tableau de bord", url: "/", icon: ChartColumnIncreasing, permission: "VIEW_DASHBOARD_STATS" as Permission },
    { title: "Aujourd'hui", url: "/patients", icon: CalendarCheck, permission: "VIEW_PATIENTS" as Permission },
    { title: "Tous les patients", url: "/all-patients", icon: Users, permission: "VIEW_PATIENTS" as Permission },
    { title: "Rendez-vous", url: "/appointments", icon: Calendar, permission: "VIEW_PATIENTS" as Permission },
    { title: "Consultations", url: "/consultations", icon: Clipboard, permission: "VIEW_MEDICAL_RECORDS" as Permission },
    { title: "Ordonnances", url: "/prescriptions", icon: PillBottle, permission: "VIEW_PRESCRIPTIONS" as Permission },
    { title: "Dépenses", url: "/expenses", icon: Wallet, permission: "VIEW_EXPENSES" as Permission },
    { title: "Modèle Ordonnance ", url: "/Ordonnance", icon: FilePen, permission: "MANAGE_SETTINGS" as Permission },
    { title: "Paramètres", url: "/settings", icon: SettingsIcon, permission: "MANAGE_SETTINGS" as Permission },
  ];

  const items = allItems.filter(item => can(item.permission));

  return (
    <Sidebar className="h-screen text-black" collapsible='icon'>
      <SidebarContent className="flex flex-col h-full">
        <div>
          <SidebarGroup>
            <SidebarGroupLabel className="text-gray-800 dark:text-gray-200">
              Menu
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      tooltip={item.title}
                      asChild
                      className="mt-2 hover:bg-transparent hover:text-inherit"
                    >
                      <NavLink
                        to={item.url}
                        className={`flex items-center gap-2 px-2 py-2 rounded-md transition-colors font-semibold text-lg
                        ${(item.url === "/" && currentPath === "/") ||
                            (item.url === "/patients" &&
                              (currentPath.startsWith("/patients") ||
                                currentPath.startsWith("/pat/"))) ||
                            (item.url !== "/" &&
                              item.url !== "/patients" &&
                              currentPath.startsWith(item.url))
                            ? "bg-primary text-white pointer-events-none"
                            : "text-black dark:text-gray-300 hover:bg-[#e0f2fe] dark:hover:bg-[#1e3a8a]"
                          }`}
                      >
                        <item.icon />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>
      </SidebarContent>

      <SidebarFooter>
        <NavSecondary className="mt-auto text-gray-800 dark:text-gray-300" />
      </SidebarFooter>
    </Sidebar>
  );
}
