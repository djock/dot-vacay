import React, { useState } from 'react';
import { Trip } from '../types';

interface DashboardViewProps {
  trips: Trip[];
  onOpenTrip: (id: number) => void;
  onCreateTrip: () => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ trips, onOpenTrip, onCreateTrip }) => {
  const [filter, setFilter] = useState<'future' | 'past' | 'all'>('all');

  const filteredTrips = filter === 'all' ? trips : trips.filter((t) => t.status === filter);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">My Trips</h1>
          <p className="text-slate-500 mt-1">You have {trips.length} upcoming and past trips.</p>
        </div>
        <button
          onClick={onCreateTrip}
          className="bg-sky-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-sky-700 transition-all shadow-lg shadow-sky-600/20 flex items-center justify-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Plan a new trip</span>
        </button>
      </div>

      <div className="flex space-x-1 bg-slate-200/50 p-1 rounded-xl w-fit mb-8">
        {(['all', 'future', 'past'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-6 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${
              filter === tab ? 'bg-white text-sky-700 shadow-sm' : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTrips.map((trip) => (
          <div
            key={trip.id}
            onClick={() => onOpenTrip(trip.id)}
            className="group bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer"
          >
            <div className="relative h-48 overflow-hidden">
              <img
                src={trip.coverImage}
                alt={trip.destination}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute top-4 right-4">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm ${
                    trip.status === 'future' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {trip.status}
                </span>
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-slate-800 mb-2">{trip.destination}</h3>
              <div className="flex items-center text-slate-500 text-sm mb-4">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
              </div>
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-bold">
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
                <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] text-slate-500 font-bold">
                  +4
                </div>
              </div>
            </div>
          </div>
        ))}

        <div
          onClick={onCreateTrip}
          className="border-2 border-dashed border-slate-300 rounded-3xl flex flex-col items-center justify-center p-8 text-slate-400 hover:border-sky-400 hover:text-sky-500 transition-colors cursor-pointer min-h-[300px]"
        >
          <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-4 group-hover:bg-sky-50 transition-colors">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <span className="font-semibold">Add a new trip</span>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
