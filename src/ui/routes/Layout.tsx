import { Outlet } from "react-router-dom";
import { AppSidebar } from "../components/SideBar";
import { SidebarProvider, SidebarTrigger } from "../components/ui/sidebar";
import BackButton from "../components/BackButton";
import { useLocation } from "react-router-dom";

const Layout = () => {
  const location = useLocation();
  const hideBackButton = location.pathname === "/";
  return (
    <div className="flex">
      <SidebarProvider defaultOpen={true}>
        <AppSidebar />
        <main className="flex-1 dark:bg-background">
          <div className="flex items-center p-2">
            <SidebarTrigger />
            {!hideBackButton && <BackButton />}
          </div>

          <Outlet />
        </main>
      </SidebarProvider>
    </div>
  );
};

export default Layout;
