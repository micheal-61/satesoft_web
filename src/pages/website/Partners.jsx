import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import api from "../../api/axios";

const Partners = () => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const res = await api.get('/partners');
        setPartners(res.data || []);
      } catch (err) {
        console.error('Failed to load partners:', err);
        setPartners([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPartners();
  }, []);

  return (
    <section className="py-20 bg-white border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Heading */}
        <div className="text-center mb-12">
          <h4 className="text-[#70B312] uppercase font-bold tracking-[0.2em] mb-3 text-sm">
            Our Network
          </h4>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-0 tracking-tight">
            Trusted by Global Leaders
          </h2>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-500">Loading partners...</div>
        ) : partners.length === 0 ? (
          <div className="text-center py-12 text-slate-500">No partners found.</div>
        ) : (
          <div className="relative">
            <Swiper
              autoplay={{ delay: 3000, disableOnInteraction: false }}
              breakpoints={{
                0: { slidesPerView: 2 },
                576: { slidesPerView: 3 },
                768: { slidesPerView: 4 },
                992: { slidesPerView: 5 },
                1200: { slidesPerView: 6 },
              }}
              className="w-full"
              loop={true}
              modules={[Autoplay]}
              slidesPerView={2}
              spaceBetween={30}
              speed={3000}
            >
              {partners.map((partner) => (
                <SwiperSlide key={partner.id}>
                  <div
                    onClick={() => navigate(`/partners/${partner.id}`)}
                    className="flex items-center justify-center h-20 cursor-pointer group"
                  >
                    <div className="bg-slate-100 rounded-lg px-6 py-4 w-full text-center transition-all duration-300 group-hover:bg-[#70bf24]/10 group-hover:shadow-md border border-transparent group-hover:border-[#70bf24]/20">
                      <span className="text-sm font-bold text-slate-700 group-hover:text-[#70bf24] transition-colors">
                        {partner.name}
                      </span>
                      {partner.joined && (
                        <span className="block text-[10px] text-slate-400 mt-1">
                          Joined: {partner.joined}
                        </span>
                      )}
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}

      </div>
    </section>
  );
};

export default Partners;
