import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { MainSidebar } from '@/components/layout/main-sidebar';
import { Header } from '@/components/layout/header';
import { AITutorWidget } from '@/components/ai/ai-tutor-widget';

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <MainSidebar />
      <SidebarInset>
        <Header />
        <main className="flex-1 p-4 md:p-6">{children}</main>
        <AITutorWidget />
      </SidebarInset>
    </SidebarProvider>
  );
}
