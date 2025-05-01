import { Outlet } from "react-router-dom";
import { AppSidebar } from "../components/SideBar";
import { SidebarProvider, SidebarTrigger } from "../components/ui/sidebar";

const Layout = () => {
  return (
    <div className="flex bg-background">
      <SidebarProvider defaultOpen={true}>
        <AppSidebar />
        <main className="flex-1 dark:bg-background">
          <SidebarTrigger className="dark:text-white" />
          <Outlet />
        </main>
      </SidebarProvider>
    </div>
  );
};

export default Layout;
