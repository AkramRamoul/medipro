import { Outlet } from "react-router-dom";
import { AppSidebar } from "../components/SideBar";
import { SidebarProvider, SidebarTrigger } from "./ui/sidebar";

const Layout = () => {
  return (
    <div className="flex">
      <SidebarProvider>
        <AppSidebar />
        <main>
          <SidebarTrigger />
          <Outlet />
        </main>
      </SidebarProvider>
    </div>
  );
};

export default Layout;
