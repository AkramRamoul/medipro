import { Outlet } from "react-router-dom";
import { AppSidebar } from "../components/SideBar";
import { SidebarProvider, SidebarTrigger } from "../components/ui/sidebar";

const Layout = () => {
  return (
    <div className="flex bg-gray-50">
      <SidebarProvider defaultOpen={true}>
        <AppSidebar />
        <main className="flex-1">
          <SidebarTrigger />
          <Outlet />
        </main>
      </SidebarProvider>
    </div>
  );
};

export default Layout;
