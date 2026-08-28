import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (e) {
    return 'N/A';
  }
};

export default function PartnerDetail() {
  const { id } = useParams();
  const [partner, setPartner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPartnerData = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await api.get(`/partners/${id}`);
        const data = Array.isArray(res.data) ? res.data[0] : res.data;

        if (data && (data.name || data.id)) {
          setPartner(data);
        } else {
          setError('Partner record not found.');
        }
      } catch (err) {
        console.error(`Failed to fetch partner with ID #${id}:`, err);
        setError('Could not connect to database or partner does not exist.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPartnerData();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center py-24">
        <p className="text-slate-500 font-medium text-sm">Loading partner details...</p>
      </div>
    );
  }

  if (error || !partner) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center py-24 gap-4">
        <p className="text-red-600 font-bold text-sm">{error || 'Partner not found.'}</p>
        <Link className="text-xs font-bold text-[#70B312] underline" to="/">
          ← Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-50 min-h-screen">

      {/* FULL-WIDTH HERO BANNER SECTION */}
      <section className="bg-gradient-to-r from-[#5c940f] to-[#70B312] text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-md flex-shrink-0">
              <span className="text-4xl font-extrabold text-[#70B312]">
                {partner.name ? partner.name.charAt(0).toUpperCase() : 'P'}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                  {partner.name}
                </h1>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white uppercase tracking-wider">
                  {partner.status || 'ACTIVE'}
                </span>
              </div>
              <p className="text-white/80 mt-2 text-sm max-w-2xl font-medium">
                {partner.description || 'No overview description available.'}
              </p>
            </div>
          </div>

          <Link className="inline-flex items-center gap-2 bg-white text-[#70B312] hover:bg-slate-100 font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-full shadow-sm transition-all" to="/">
            ← Back to Home
          </Link>
        </div>
      </section>

      {/* FULL-PAGE MAIN CONTENT AREA */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* MAIN DETAILS SECTION */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-2xl p-8 border border-slate-200/80 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100">
                Partner Overview
              </h3>
              <p className="text-slate-600 leading-relaxed text-sm">
                {partner.description ? partner.description : `${partner.name} collaborates with Satesoft to deliver enterprise-grade digital services, software development, and modern cloud architecture to clients across ${partner.location || 'the region'}.`}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-slate-200/80 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-6 pb-3 border-b border-slate-100">
                Key Profile Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Industry Sector
                  </span>
                  <span className="text-sm font-bold text-slate-800">
                    {partner.industry || 'N/A'}
                  </span>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Primary Location
                  </span>
                  <span className="text-sm font-bold text-slate-800">
                    {partner.location || 'N/A'}
                  </span>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Partner Registration Date
                  </span>
                  <span className="text-sm font-bold text-slate-800">
                    {formatDate(partner.joined || partner.joined_date)}
                  </span>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    System Partner ID
                  </span>
                  <span className="text-sm font-bold text-slate-800">
                    #{partner.id || id}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* SIDEBAR CONTACT INFO */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                Contact Details
              </h4>

              <div className="space-y-4">
                <div>
                  <span className="block text-xs text-slate-400 font-medium mb-1">Representative</span>
                  <span className="text-sm font-bold text-slate-800">{partner.contact_name || 'N/A'}</span>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <span className="block text-xs text-slate-400 font-medium mb-1">Direct Email</span>
                  {partner.contact_email ? (
                    <a href={`mailto:${partner.contact_email}`} className="text-sm font-bold text-[#70B312] hover:underline">
                      {partner.contact_email}
                    </a>
                  ) : (
                    <span className="text-sm font-bold text-slate-400">N/A</span>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

    </div>
  );
}
