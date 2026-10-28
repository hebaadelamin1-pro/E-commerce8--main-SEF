const links = [{ href: "#/products", label: "Products" }];

export default function Sidebar({ current }) {
  return (
    <aside className="w-full shrink-0 bg-gray-900 text-white md:min-h-screen md:w-56">
      <div className="px-5 py-5 text-lg font-bold">Admin Panel</div>
      <nav className="flex gap-1 px-3 pb-3 md:flex-col">
        {links.map((l) => (
          <a
            key={l.href}
            href={l.href}
            className={`rounded-lg px-3 py-2 text-sm font-medium ${current === l.href ? "bg-indigo-600" : "text-gray-300 hover:bg-gray-800"}`}
          >
            {l.label}
          </a>
        ))}
      </nav>
    </aside>
  );
}
