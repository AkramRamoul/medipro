import { NavLink, useLocation } from "react-router-dom";
import {
  Clipboard,
  PillBottle,
  ChartColumnIncreasing,
  SettingsIcon,
  HelpCircleIcon,
  User,
  FilePen,
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

// Menu items.

const items = [
  { title: "Tableau de bord", url: "/", icon: ChartColumnIncreasing },
  { title: "Patientes", url: "/patients", icon: User },
  { title: "Consultations", url: "/consultations", icon: Clipboard },
  { title: "Ordonnances", url: "/prescriptions", icon: PillBottle },
  {
    title: "Paramètres",
    url: "/settings",
    icon: SettingsIcon,
  },
  {
    title: "Modèle Ordonnance ",
    url: "/Ordonnance",
    icon: FilePen,
  },
];
const data = {
  navSecondary: [
    {
      title: "Obtenir de l'aide",
      url: "#",
      icon: HelpCircleIcon,
    },
  ],
};

export function AppSidebar() {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <Sidebar className="h-screen text-black">
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
                      asChild
                      className="mt-2 hover:bg-transparent hover:text-inherit"
                    >
                      <NavLink
                        to={item.url}
                        className={`flex items-center gap-2 px-2 py-2 rounded-md transition-colors font-semibold text-lg
                        ${
                          (item.url === "/" && currentPath === "/") ||
                          (item.url === "/patients" &&
                            (currentPath.startsWith("/patients") ||
                              currentPath.startsWith("/pat/"))) ||
                          (item.url !== "/" &&
                            item.url !== "/patients" &&
                            currentPath.startsWith(item.url))
                            ? "bg-primary text-white pointer-events-none"
                            : "text-black dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-800"
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

        {/* Secondary Section */}
      </SidebarContent>

      <SidebarFooter>
        <NavSecondary
          items={data.navSecondary}
          className="mt-auto text-gray-800 dark:text-gray-300"
        />
      </SidebarFooter>
    </Sidebar>
  );
}
