import { NavLink, useLocation } from "react-router-dom";
import {
  Clipboard,
  PillBottle,
  ChartColumnIncreasing,
  SettingsIcon,
  HelpCircleIcon,
  User,
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
  { title: "Dashboard", url: "/", icon: ChartColumnIncreasing },
  { title: "Patients", url: "/patients", icon: User },
  { title: "Consultations", url: "/consultations", icon: Clipboard },
  { title: "Prescriptions", url: "/prescriptions", icon: PillBottle },
  {
    title: "Settings",
    url: "/settings",
    icon: SettingsIcon,
  },
];
const data = {
  navSecondary: [
    {
      title: "Get Help",
      url: "#",
      icon: HelpCircleIcon,
    },
  ],
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatar.jpg",
  },
};

export function AppSidebar() {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <Sidebar className="h-screen bg-white dark:bg-muted text-black dark:text-white">
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
