import React, { useEffect, useRef, useState } from 'react';
import { ApiTrip } from '../types';
import { GeoSuggestion, searchDestinationSuggestions } from '../services/geoSearch';

interface TripModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  initialData?: ApiTrip | null;
  error?: string | null;
  onClose: () => void;
  onSave: (data: {
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    latitude: number;
    longitude: number;
  }) => void;
}

const formatDateInput = (value?: string | null) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const TripModal: React.FC<TripModalProps> = ({ isOpen, mode, initialData, error, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [locationResults, setLocationResults] = useState<GeoSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    if (mode === 'edit' && initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setStartDate(formatDateInput(initialData.startDate));
      setEndDate(formatDateInput(initialData.endDate));
      setLatitude(initialData.latitude ?? 0);
      setLongitude(initialData.longitude ?? 0);
      return;
    }

    const now = new Date();
    const end = new Date(now);
    end.setDate(end.getDate() + 3);

    const toDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    setTitle('');
    setDescription('');
    setStartDate(toDate(now));
    setEndDate(toDate(end));
    setLatitude(0);
    setLongitude(0);
    setLocationResults([]);
    setShowDropdown(false);
  }, [isOpen, mode, initialData]);

  if (!isOpen) return null;

  const searchLocations = (query: string) => {
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }

    if (!query || query.trim().length < 2) {
      setLocationResults([]);
      setShowDropdown(false);
      return;
    }

    setIsLoading(true);
    debounceRef.current = window.setTimeout(async () => {
      try {
        const results = await searchDestinationSuggestions(query);
        setLocationResults(results || []);
        setShowDropdown(true);
      } catch (err) {
        console.error('Failed to search locations', err);
        setLocationResults([]);
        setShowDropdown(false);
      } finally {
        setIsLoading(false);
      }
    }, 250);
  };

  const selectLocation = (location: GeoSuggestion) => {
    const name = location.display_name.split(',')[0];
    setTitle(name);
    setLatitude(Number(location.lat) || 0);
    setLongitude(Number(location.lon) || 0);
    setShowDropdown(false);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!title || !startDate || !endDate) return;
    onSave({ title, description, startDate, endDate, latitude, longitude });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-3xl p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-slate-800">
            {mode === 'create' ? 'Plan a New Trip' : 'Edit Trip'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors" type="button">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <label className="block text-sm font-semibold text-slate-700 mb-1">Destination</label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="e.g. Lisbon, Portugal"
              value={title}
              onChange={(event) => {
                const value = event.target.value;
                setTitle(value);
                searchLocations(value);
              }}
              required
            />
            {showDropdown && (
              <div className="absolute z-20 mt-2 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-56 overflow-y-auto">
                {isLoading && <div className="px-4 py-3 text-sm text-slate-500">Searching...</div>}
                {!isLoading && locationResults.length === 0 && (
                  <div className="px-4 py-3 text-sm text-slate-500">No results found.</div>
                )}
                {!isLoading &&
                  locationResults.map((location) => (
                    <button
                      key={`${location.display_name}-${location.lat}-${location.lon}`}
                      className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 flex items-start justify-between gap-3"
                      onClick={() => selectLocation(location)}
                      type="button"
                    >
                      <span>{location.display_name}</span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        {location.category}
                      </span>
                    </button>
                  ))}
              </div>
            )}
            <p className="mt-2 text-xs text-slate-500">
              Suggestions include countries, cities, and landmarks.
            </p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="Trip highlights, vibe, or reminders."
              rows={3}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Start Date</label>
              <input
                type="date"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-sky-500"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">End Date</label>
              <input
                type="date"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-sky-500"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-sky-600 text-white py-4 rounded-xl font-bold hover:bg-sky-700 transition-all shadow-lg shadow-sky-600/20 mt-4"
          >
            {mode === 'create' ? 'Create Trip' : 'Save Changes'}
          </button>
          {error && <p className="text-sm text-red-100 bg-red-500/80 px-3 py-2 rounded-xl">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default TripModal;
