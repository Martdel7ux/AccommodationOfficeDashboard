import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';

export default function Layout() {
  return (
    <>
      {/* Fixed ambient background */}
      <div className="app-bg" />

      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 ml-64 min-h-screen">
          <div className="max-w-[1400px] mx-auto px-8 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </>
  );
}
