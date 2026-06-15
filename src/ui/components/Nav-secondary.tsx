import * as React from "react";
import { Lock } from "lucide-react";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../components/ui/sidebar";
export function NavSecondary({
  ...props
}: {} & React.ComponentPropsWithoutRef<typeof SidebarMenu>) {

  function handleLogout() {
    window.location.reload();
  }

  return (
    <SidebarMenu {...props}>
      <SidebarMenuItem>
        <SidebarMenuButton
          onClick={handleLogout}
          tooltip="Déconnexion"
          className="transition-all duration-200 text-slate-600 dark:text-slate-300 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 group"
        >
          <Lock className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
          <span className="text-[15px] font-medium">Déconnexion</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
