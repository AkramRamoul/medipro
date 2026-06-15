import { Outlet } from "react-router-dom";
import { AppSidebar } from "../components/SideBar";
import { SidebarProvider, SidebarTrigger } from "../components/ui/sidebar";
import BackButton from "../components/BackButton";
import { useLocation } from "react-router-dom";
import { ThemeToggle } from "../components/ThemeToggle";
import { CommandPalette } from "../components/CommandPalette";
import { HelpDialog } from "../components/HelpDialog";
import { HelpCircle } from "lucide-react";

const Layout = () => {
  const location = useLocation();
  const hideBackButton = location.pathname === "/";
  return (
    <div className="flex">
      <SidebarProvider defaultOpen={true}>
        <AppSidebar />
        <main className="flex-1 min-w-0 dark:bg-background">
          <div className="sticky top-0 z-10 flex items-center justify-between p-2 bg-background border-b border-border">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              {!hideBackButton && <BackButton />}
            </div>
            <div className="flex items-center pr-2 gap-1">
              <HelpDialog
                trigger={
                  <button
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors cursor-pointer group"
                    title="Centre d'aide & Raccourcis"
                  >
                    <HelpCircle className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
                  </button>
                }
              />
              <ThemeToggle />
            </div>
          </div>

          <CommandPalette />
          <Outlet />
        </main>
      </SidebarProvider>
    </div>
  );
};


export default Layout;
