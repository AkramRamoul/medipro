import * as React from "react";
import { HelpCircleIcon, Lock } from "lucide-react";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../components/ui/sidebar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

export function NavSecondary({
  ...props
}: {} & React.ComponentPropsWithoutRef<typeof SidebarMenu>) {

  function handleLogout() {
    // Reload the page to reset App state and show the lock screen if a password is set
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

      <SidebarMenuItem>
        <HelpComponent />
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

function HelpComponent() {
  const APP_VERSION = "1.0";
  const LICENSE_TYPE = "Licence à vie";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <SidebarMenuButton
          tooltip="Obtenir de l'aide"
          className="transition-all duration-200 text-slate-600 dark:text-slate-300 hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/20 dark:hover:text-white group"
        >
          <HelpCircleIcon className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
          <span className="text-[15px] font-medium">Obtenir de l'aide</span>
        </SidebarMenuButton>
      </PopoverTrigger>

      <PopoverContent className="w-80 ml-2">
        <div className="flex flex-col space-y-3 p-2">
          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold">Contacter l'assistance</h3>
            <p className="text-sm text-muted-foreground">
              Si vous avez besoin d'aide, contactez notre équipe d'assistance :
            </p>
            <div className="flex flex-col text-sm mt-1">
              <span>
                <strong>Téléphone :</strong> +1 (123) 456-7890
              </span>
              <span>
                <strong>E-mail :</strong> support@example.com
              </span>
            </div>
          </div>

          <hr className="border-muted" />

          {/* Raccourcis Clavier */}
          <div>
            <h3 className="text-lg font-semibold">Raccourcis Clavier</h3>
            <div className="flex flex-col space-y-2 text-sm mt-2">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Palette de commandes</span>
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Tableau de bord</span>
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                  <span className="text-xs">⌘</span>D
                </kbd>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Tous les patients</span>
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                  <span className="text-xs">⌘</span>P
                </kbd>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Consultations</span>
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                  <span className="text-xs">⌘</span>C
                </kbd>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Rendez-vous</span>
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                  <span className="text-xs">⌘</span>R
                </kbd>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Dépenses</span>
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                  <span className="text-xs">⌘</span>E
                </kbd>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Nouvelle Ordonnance</span>
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                  <span className="text-xs">⌘</span>N
                </kbd>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Changer le thème</span>
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                  <span className="text-xs">⌘</span>T
                </kbd>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Paramètres</span>
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                  <span className="text-xs">⌘</span>S
                </kbd>
              </div>
            </div>
          </div>

          <hr className="border-muted" />

          {/* App Info */}
          <div className="text-sm space-y-1">
            <div>
              <strong>Version de l'application :</strong> {APP_VERSION}
            </div>
            <div>
              <strong>Licence :</strong> {LICENSE_TYPE}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
