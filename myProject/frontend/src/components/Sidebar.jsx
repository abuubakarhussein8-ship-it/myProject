import { Link, useLocation } from "react-router-dom";

function Sidebar() {
  const location = useLocation();
  const menuItems = [
    { path: "/dashboard/staff", label: "Dashboard" },
    { path: "/books", label: "Books" },
    { path: "/members", label: "Members" },
    { path: "/borrow-book", label: "Borrow Book" },
    { path: "/borrow-history", label: "Borrow History" },
    { path: "/fines", label: "Fines" },
  ];

  return (
    <aside className="sidebar">
      <ul className="sidebar-menu">
        {menuItems.map((item) => (
          <li key={item.path}>
            <Link to={item.path} className={location.pathname === item.path ? "active" : ""}>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export default Sidebar;
