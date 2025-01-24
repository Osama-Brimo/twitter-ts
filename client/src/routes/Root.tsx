import Sidebar from '../components/app/sidebar/Sidebar';
import Aside from '../components/app/aside/Aside';
import Navbar from '../components/app/sidebar/Navbar';
import { Outlet } from 'react-router-dom';
import { Toaster } from 'sonner';
import { SidebarProvider } from '@/components/ui/sidebar';

const Root = () => {
  const data = {};
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <Navbar />
        <Sidebar />
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
          <main className="flex-1 items-start gap-4 sm:px-6 sm:py-0 md:gap-8">
            <div className="mx-auto max-w-[70rem] flex-1 auto-rows-max gap-4 flex">
              <div className="gap-4 lg:gap-8">
                <Outlet />
              </div>
              <Aside data={data} />
            </div>
          </main>
        </div>
        <Toaster />
      </div>
    </SidebarProvider>
  );
};

export default Root;
