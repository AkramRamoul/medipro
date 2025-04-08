import { NavLink, useLocation } from "react-router-dom";
import {
  Clipboard,
  Home,
  User,
  PillBottle,
  ChartColumnIncreasing,
  SettingsIcon,
  HelpCircleIcon,
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
import { NavUser } from "./Nav-User";

// Menu items.
const items = [
  { title: "Home", url: "/", icon: Home },
  { title: "New Patient", url: "/newpatient", icon: User },
  { title: "Consultations", url: "/consultations", icon: Clipboard },
  { title: "Prescriptions", url: "/prescriptions", icon: PillBottle },
  { title: "Statistics", url: "/stats", icon: ChartColumnIncreasing },
];
const data = {
  navSecondary: [
    {
      title: "Settings",
      url: "/settings",
      icon: SettingsIcon,
    },
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
    <Sidebar className="h-screen">
      <SidebarContent className="flex flex-col h-full">
        <div>
          <SidebarGroup>
            <SidebarGroupLabel>Menu</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild className="mt-2">
                      <NavLink
                        to={item.url}
                        className={`flex items-center gap-2 px-2 py-2 rounded-md transition-colors font-semibold text-lg  ${
                          item.url === "/"
                            ? currentPath === "/"
                              ? "bg-primary text-white"
                              : "text-black "
                            : currentPath.startsWith(item.url)
                            ? "bg-primary text-white"
                            : "text-black hover:bg-gray-200"
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
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
