"use client";

import * as React from "react";
import { LucideIcon } from "lucide-react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../components/ui/sidebar";
import { NavLink } from "react-router-dom";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

export function NavSecondary({
  items,
  ...props
}: {
  items: {
    title: string;
    url: string;
    icon: LucideIcon;
  }[];
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <NavLink to={item.url}>
                  <HelpCopmenent item={item} />
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

function HelpCopmenent({
  item,
}: {
  item: { title: string; url: string; icon: LucideIcon };
}) {
  return (
    <Popover>
      <Popover>
        <PopoverTrigger className="flex items-center">
          <item.icon className="w-4 h-4" />
          <span className="ml-2">{item.title}</span>
        </PopoverTrigger>
        <PopoverContent className="w-80 ml-2">
          <div className="flex flex-col space-y-2 p-2">
            <h3 className="text-lg font-semibold">Contact Support</h3>
            <p className="text-sm text-muted-foreground">
              If you need help, reach out to our support team:
            </p>
            <div className="flex flex-col text-sm">
              <span>
                <strong>Phone:</strong> +1 (123) 456-7890
              </span>
              <span>
                <strong>Email:</strong> support@example.com
              </span>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </Popover>
  );
}
