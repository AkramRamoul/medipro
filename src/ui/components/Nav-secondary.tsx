import * as React from "react";
import { HelpCircleIcon, Lock } from "lucide-react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../components/ui/sidebar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { useAuth } from "../context/auth-context";
import { NavLink, useNavigate } from "react-router-dom";
import { usePasswordStatus } from "../hooks/usePasswordStatus";
import { toast } from "sonner";

export function NavSecondary({
  ...props
}: {} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  const { setAuthed } = useAuth();
  const navigate = useNavigate();

  const { refetch } = usePasswordStatus();

  async function handleLock() {
    const updatedStatus = await refetch();
    if (updatedStatus === "not-exists") {
      toast.warning("Aucun mot de passe n'a encore été défini.");
      return;
    }

    setAuthed(false);
    localStorage.removeItem("isAuthed");
    navigate("/enter-password");
  }

  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {/* Lock button FIRST */}
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="flex items-center">
              <Button
                variant="ghost"
                className="flex items-center w-full justify-start"
                onClick={handleLock}
              >
                <Lock className="w-4 h-4" />
                <span className="ml-2 font-semibold">Déconnexion</span>
              </Button>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink to={"#"}>
                <HelpComponent />
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

function HelpComponent() {
  const APP_VERSION = "1.0";
  const LICENSE_TYPE = "Licence à vie";

  return (
    <Popover>
      <PopoverTrigger className="flex items-center">
        <HelpCircleIcon className="w-4 h-4" />
        <span className="ml-4 font-semibold">Obtenir de l'aide</span>
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
