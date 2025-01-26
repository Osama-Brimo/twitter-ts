import Aside from '@/components/app/aside/Aside';
import Navbar from '@/components/app/sidebar/Navbar';
import { Outlet } from 'react-router-dom';
import { Toaster } from 'sonner';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import AppSidebar from '@/components/app/sidebar/AppSidebar';

const Root = () => {
  const data = {};
  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <SidebarInset>
          <Navbar />
          <div className="flex flex-col sm:gap-4 sm:py-4 ">
            <main className="flex-1 items-start gap-4 sm:px-6 sm:py-0 md:gap-8">
              <div className="mx-auto gap-4 flex w-full max-w-6xl">
                <div className="gap-4 lg:gap-8 w-full">
                  <Outlet />
                </div>
                <Aside data={data} />
              </div>
            </main>
          </div>
        </SidebarInset>
        <Toaster />
      </div>
    </SidebarProvider>
  );
};

export default Root;
