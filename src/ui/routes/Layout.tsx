import { Outlet } from "react-router-dom";
import { AppSidebar } from "../components/SideBar";
import { SidebarProvider, SidebarTrigger } from "../components/ui/sidebar";
import BackButton from "../components/BackButton";
import { useLocation } from "react-router-dom";
import { ThemeToggle } from "../components/ThemeToggle";

const Layout = () => {
  const location = useLocation();
  const hideBackButton = location.pathname === "/";
  return (
    <div className="flex">
      <SidebarProvider defaultOpen={true}>
        <AppSidebar />
        <main className="flex-1 dark:bg-background">
          <div className="sticky top-0 z-10 flex items-center justify-between p-2 bg-background border-b border-border">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              {!hideBackButton && <BackButton />}
            </div>
            <div className="flex items-center pr-2">
              <ThemeToggle />
            </div>
          </div>

          <Outlet />
        </main>
      </SidebarProvider>
    </div>
  );
};


export default Layout;
