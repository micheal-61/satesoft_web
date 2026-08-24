import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";

const Opportunities = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [keyword, setKeyword] = useState("");
  const [jobType, setJobType] = useState("");
  const [location, setLocation] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch('/api/jobs');
        if (!response.ok) throw new Error('Failed to fetch opportunities');
        const data = await response.json();
        setJobs(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesKeyword = keyword === "" ||
        job.title.toLowerCase().includes(keyword.toLowerCase()) ||
        (job.location && job.location.toLowerCase().includes(keyword.toLowerCase()));

      const matchesType = jobType === "" || job.type === jobType;

      const matchesLocation = location === "" ||
        (job.location && job.location.toLowerCase().includes(location.toLowerCase()));

      return matchesKeyword && matchesType && matchesLocation;
    });
  }, [jobs, keyword, jobType, location]);

  const uniqueTypes = useMemo(() => {
    const types = new Set(jobs.map(j => j.type).filter(Boolean));
    return Array.from(types).sort();
  }, [jobs]);

  const uniqueLocations = useMemo(() => {
    const locs = new Set(jobs.map(j => j.location).filter(Boolean));
    return Array.from(locs).sort();
  }, [jobs]);

  if (loading) {
    return (
      <section id="Opportunities" className="py-28 bg-bg min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto px-8 sm:px-12 lg:px-20 w-full text-center">
          <div className="inline-flex items-center gap-2 text-primary-500">
            <i className="bi bi-arrow-clockwise animate-spin text-2xl"></i>
            <span className="text-lg font-medium">Loading opportunities...</span>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="Opportunities" className="py-28 bg-bg min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto px-8 sm:px-12 lg:px-20 w-full text-center">
          <p className="text-red-500 text-lg">{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section id="Opportunities" className="py-28 bg-bg min-h-screen">
      <div className="max-w-7xl mx-auto px-8 sm:px-12 lg:px-20">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-primary-50 text-[#72bf24] font-semibold text-xs uppercase tracking-widest mb-4 border border-primary-100 shadow-sm">
            CAREERS
          </div>
          <h2 className="text-4xl md:text-5xl font-light text-gray-900 mb-4 tracking-tight">
            Join Our Team
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-text/70">
            Explore exciting career opportunities and find your place at Satesoft.
          </p>
        </div>

        <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-3">
            <label className="flex items-center gap-3 rounded-full border border-border bg-surface px-4 py-3 shadow-sm min-w-full sm:min-w-[280px]">
              <svg className="w-4 h-4 text-primary-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Search opportunities..."
                className="w-full bg-transparent text-sm outline-none text-text placeholder:text-text/40"
              />
            </label>

            <select
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
              className="px-4 py-3 bg-surface border border-border rounded-full text-text focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent w-full sm:w-auto min-w-[180px] shadow-sm cursor-pointer transition-all appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.org%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23131313%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px_12px] bg-no-repeat bg-[position:right_1rem_center]"
            >
              <option value="">All Types</option>
              {uniqueTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="px-4 py-3 bg-surface border border-border rounded-full text-text focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent w-full sm:w-auto min-w-[180px] shadow-sm cursor-pointer transition-all appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.org%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23131313%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px_12px] bg-no-repeat bg-[position:right_1rem_center]"
            >
              <option value="">All Locations</option>
              {uniqueLocations.map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          <div className="text-sm text-gray-600 font-light">
            {filteredJobs.length} {filteredJobs.length === 1 ? 'opportunity' : 'opportunities'} found
          </div>
        </div>

        {filteredJobs.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                className="group relative flex flex-col overflow-hidden rounded-[0.3rem] border border-border bg-surface shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
              >
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-start justify-between mb-4">
                  <div className="inline-flex self-start px-3 py-1 bg-primary-50 text-[#72bf24] rounded-full text-xs font-semibold tracking-widest uppercase border border-primary-100">
                    {job.type || 'Opportunity'}
                  </div>
                    {job.status && (
                      <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase ${
                        job.status === 'Active'
                          ? 'bg-green-50 text-green-700 border border-green-100'
                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}>
                        {job.status}
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-light text-gray-900 mb-2 group-hover:text-[#72bf24] transition-colors leading-tight">
                    {job.title}
                  </h3>

                   <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 font-light mb-4">
                     {job.location && (
                       <span className="flex items-center gap-1.5">
                         <svg className="w-4 h-4 text-primary-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                         {job.location}
                       </span>
                     )}
                     <span className="flex items-center gap-1.5">
                       <svg className="w-4 h-4 text-primary-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>
                       {job.applications !== undefined ? `${job.applications} ${job.applications === 1 ? 'position' : 'positions'}` : 'Open position'}
                     </span>
                   </div>

                   {job.description && (
                     <p className="text-sm text-gray-600 font-light mb-4 line-clamp-3">
                       {job.description}
                     </p>
                   )}

                  <div className="mt-auto pt-4 border-t border-border">
                    <Link
                      to={`/opportunities/${job.id}`}
                      className="block w-full rounded-xl bg-[#72bf24] py-3 text-center text-sm font-semibold uppercase tracking-wider text-white shadow-md transition-all duration-300 hover:bg-[#62a71e] hover:shadow-lg"
                    >
                      Learn More
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-border bg-surface/70 p-10 text-center text-gray-600">
            <h5 className="text-xl font-light mb-2">No opportunities available</h5>
            <p>Check back later or adjust your search filters to find more opportunities.</p>
          </div>
        )}

        {selectedJob && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedJob(null)}>
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between p-5 border-b border-gray-100 shrink-0">
                <h3 className="text-base font-bold text-gray-900">{selectedJob.title}</h3>
                <button onClick={() => setSelectedJob(null)} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {selectedJob.description && (
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</label>
                    <p className="mt-2 text-gray-700 font-light leading-relaxed whitespace-pre-line">{selectedJob.description}</p>
                  </div>
                )}
                {selectedJob.keyRequirements && (
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Key Requirements</label>
                    <ul className="mt-2 space-y-2">
                      {selectedJob.keyRequirements.split('\n').filter(Boolean).map((req, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-gray-700 font-light">
                          <svg className="w-4 h-4 text-[#72bf24] mt-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Opportunities;
