import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export function Layout() {
  return (
    <div className="d-flex">
      <Sidebar />
      <main className="main-content flex-grow-1">
        <div className="container-fluid max-w-7xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
