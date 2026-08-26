import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const safeImageUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (/^file:\/\//i.test(trimmed)) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith('/')) return trimmed;
  if (trimmed.startsWith('data:')) return trimmed;
  return '/' + trimmed;
};

const Products = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        if (!response.ok) throw new Error('Failed to fetch products');
        const data = await response.json();
        setProjects(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleLearnMore = async (project) => {
    setSelectedProject(project);
    setLoadingDetails(true);
    setProjectDetails(null);
    try {
      const res = await fetch(`/api/products/${project.id}`);
      if (res.ok) {
        const data = await res.json();
        setProjectDetails(data);
      } else {
        setProjectDetails(project);
      }
    } catch (e) {
      setProjectDetails(project);
    } finally {
      setLoadingDetails(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-[#72bf24] border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="mt-4 text-gray-500 font-light animate-pulse">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <div className="text-center max-w-md mx-auto p-8 bg-white rounded-2xl shadow-lg border border-gray-100">
          <div className="text-5xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Unable to load products</h3>
          <p className="text-gray-500">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-6 py-2 bg-[#72bf24] text-white rounded-lg hover:bg-[#62a71e] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <section className="py-12 md:py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-end mb-8 md:mb-10 gap-4">
            <div className="w-full md:w-1/2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#72bf24]/10 border border-[#72bf24]/20 rounded-full text-[#72bf24] text-xs font-medium mb-3">
                Portfolio
              </div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-light text-gray-900 leading-tight">
                Explore Our Recent <span className="font-semibold text-[#72bf24]">Projects.</span>
              </h1>
            </div>
          </div>

          {/* Products Grid */}
          {projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
              {projects.map((project) => (
                <div 
                  key={project.id} 
                  className="group bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden hover:-translate-y-1"
                >
                  <div className="relative overflow-hidden aspect-[16/10] bg-gray-100">
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/20 via-transparent to-transparent z-10 group-hover:opacity-0 transition-opacity duration-500"></div>
                    <img
                      decoding="async"
                      loading="lazy"
                      src={safeImageUrl(project.logo_url || project.image_url) || "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=600&h=400"}
                      alt={project.name || project.title}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                    />
                    {/* Category Badge */}
                    <div className="absolute top-3 left-3 z-20 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-[11px] font-semibold text-[#72bf24] border border-[#72bf24]/20 shadow-sm">
                      {project.category || "Product"}
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="text-base font-semibold text-gray-900 mb-1">
                      {project.name || project.title}
                    </h3>
                    <p className="text-xs text-gray-500 font-light mb-2 line-clamp-1">
                      {project.tagline || project.subtitle || ''}
                    </p>
                    <p className="text-xs text-gray-600 font-light mb-3 line-clamp-2">
                      {project.description || 'Innovative solution for modern businesses.'}
                    </p>
                    {project.keyFeatures && project.keyFeatures.length > 0 && (
                      <ul className="space-y-1 mb-3">
                        {project.keyFeatures.slice(0, 3).map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-1.5 text-[11px] text-gray-600 font-light">
                            <svg className="w-3 h-3 text-[#72bf24] mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    <Link
                      to={`/products/${project.id}`}
                      className="block w-full rounded-lg bg-[#72bf24] py-2 text-center text-xs font-semibold uppercase tracking-wider text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#62a71e] hover:shadow-md"
                    >
                      Learn More
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white/70 p-10 text-center">
              <div className="text-4xl mb-3">📦</div>
              <h3 className="text-lg font-medium text-gray-700 mb-1">No products available</h3>
              <p className="text-gray-400 font-light text-sm">Please check back later for our latest offerings.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default Products;
