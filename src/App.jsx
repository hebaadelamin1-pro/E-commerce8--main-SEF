import { useEffect, useState } from "react";
import ProductsPage from "./pages/products/ProductsPage";

// No router dependency in the project yet, so a tiny hash router is used
// (#/products). Replace with react-router later if the team adds it.
function useHashRoute() {
  const [hash, setHash] = useState(window.location.hash || "#/products");
  useEffect(() => {
    const onChange = () => setHash(window.location.hash || "#/products");
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return hash;
}

function App() {
  const route = useHashRoute();
  return (
    <div className="min-h-screen bg-[#050816] p-4 text-slate-200 md:p-8">
      {route === "#/products" ? (
        <ProductsPage />
      ) : (
        <p>Page not found. <a className="text-cyan-300 underline" href="#/products">Go to Products</a></p>
      )}
    </div>
  );
}

export default App;
