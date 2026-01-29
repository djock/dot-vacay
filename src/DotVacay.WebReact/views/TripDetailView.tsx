import React, { useEffect, useMemo, useRef, useState } from 'react';
import { POI, POIType, Trip } from '../types';
import { buildPoiDescription, uiTypeToApi } from '../services/mappers';
import { api } from '../services/api';

interface TripDetailViewProps {
  trip: Trip;
  onBack: () => void;
  onRefresh: () => void;
  onCreatePoi: (payload: any) => Promise<void> | void;
  onUpdatePoi: (id: number, payload: any) => Promise<void> | void;
  onDeletePoi: (id: number) => Promise<void> | void;
  onDeleteTrip: () => Promise<void> | void;
  onEditTrip: () => void;
}

const TripDetailView: React.FC<TripDetailViewProps> = ({
  trip,
  onBack,
  onRefresh,
  onCreatePoi,
  onUpdatePoi,
  onDeletePoi,
  onDeleteTrip,
  onEditTrip
}) => {
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [showPoiModal, setShowPoiModal] = useState(false);
  const [editingPoi, setEditingPoi] = useState<POI | null>(null);
  const [poiName, setPoiName] = useState('');
  const [poiTime, setPoiTime] = useState('09:00');
  const [poiType, setPoiType] = useState<POIType>('attraction');
  const [poiNotes, setPoiNotes] = useState('');
  const [poiDate, setPoiDate] = useState<Date | null>(null);
  const [poiLocation, setPoiLocation] = useState('');
  const [poiLatitude, setPoiLatitude] = useState(0);
  const [poiLongitude, setPoiLongitude] = useState(0);
  const [poiError, setPoiError] = useState<string | null>(null);
  const [poiSearchResults, setPoiSearchResults] = useState<Array<{ display_name: string; lat: string; lon: string }>>([]);
  const [poiSearchOpen, setPoiSearchOpen] = useState(false);
  const [poiSearchLoading, setPoiSearchLoading] = useState(false);
  const poiSearchDebounceRef = useRef<number | null>(null);

  useEffect(() => {
    setSelectedDayIdx(0);
  }, [trip.id]);

  const selectedDay = trip.itinerary[selectedDayIdx];

  const tripDateRange = useMemo(() => {
    return `${new Date(trip.startDate).toDateString()} — ${new Date(trip.endDate).toDateString()}`;
  }, [trip.startDate, trip.endDate]);

  const getIcon = (type: POIType) => {
    switch (type) {
      case 'hotel':
        return '🏨';
      case 'restaurant':
        return '🍽️';
      case 'attraction':
        return '🏛️';
      case 'coffee':
        return '☕';
      case 'transport':
        return '🚗';
      default:
        return '📍';
    }
  };

  const quickInfoCounts = useMemo(() => {
    const allItems = trip.itinerary.flatMap((day) => day.items);
    const uniqueByName = (items: POI[]) => {
      const seen = new Set<string>();
      items.forEach((item) => {
        if (item.name) {
          seen.add(item.name.toLowerCase());
        }
      });
      return seen.size;
    };

    return {
      accommodation: uniqueByName(allItems.filter((item) => item.type === 'hotel')),
      transport: uniqueByName(allItems.filter((item) => item.type === 'transport')),
      attractions: uniqueByName(allItems.filter((item) => item.type === 'attraction'))
    };
  }, [trip.itinerary]);

  const openAddModal = () => {
    setEditingPoi(null);
    setPoiName('');
    setPoiNotes('');
    setPoiType('attraction');
    setPoiTime('09:00');
    setPoiDate(selectedDay ? new Date(selectedDay.date) : new Date(trip.startDate));
    setPoiLocation('');
    setPoiLatitude(0);
    setPoiLongitude(0);
    setPoiError(null);
    setShowPoiModal(true);
  };

  const openEditModal = (poi: POI) => {
    setEditingPoi(poi);
    setPoiName(poi.name);
    setPoiType(poi.type);
    setPoiTime(poi.time || '09:00');
    setPoiNotes(poi.notes || '');
    setPoiLocation(poi.location || '');
    setPoiLatitude(poi.raw?.latitude ?? 0);
    setPoiLongitude(poi.raw?.longitude ?? 0);
    setPoiError(null);
    const rawStart = poi.raw?.startDate ? new Date(poi.raw.startDate) : new Date(selectedDay?.date || trip.startDate);
    setPoiDate(rawStart);
    setShowPoiModal(true);
  };

  const buildDateTime = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const dayNum = String(date.getDate()).padStart(2, '0');
    const hourNum = String(date.getHours()).padStart(2, '0');
    const minuteNum = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${dayNum}T${hourNum}:${minuteNum}`;
  };

  const setTimeOnDate = (day: Date, time: string) => {
    const [hours, minutes] = time.split(':');
    const date = new Date(day);
    date.setHours(Number(hours || '9'), Number(minutes || '0'), 0, 0);
    return date;
  };

  const searchPoiLocations = (query: string) => {
    if (poiSearchDebounceRef.current) {
      window.clearTimeout(poiSearchDebounceRef.current);
    }

    if (!query || query.trim().length < 2) {
      setPoiSearchResults([]);
      setPoiSearchOpen(false);
      return;
    }

    setPoiSearchLoading(true);
    poiSearchDebounceRef.current = window.setTimeout(async () => {
      try {
        const results = await api.get<Array<{ display_name: string; lat: string; lon: string }>>(
          `/Location/searchPoi?query=${encodeURIComponent(query)}`
        );
        setPoiSearchResults(results || []);
        setPoiSearchOpen(true);
      } catch (err) {
        console.error('Failed to search POIs', err);
        setPoiSearchResults([]);
        setPoiSearchOpen(false);
      } finally {
        setPoiSearchLoading(false);
      }
    }, 250);
  };

  const selectPoiLocation = (location: { display_name: string; lat: string; lon: string }) => {
    const name = location.display_name.split(',')[0];
    setPoiName(name);
    setPoiLocation(location.display_name);
    setPoiLatitude(Number(location.lat) || 0);
    setPoiLongitude(Number(location.lon) || 0);
    setPoiSearchOpen(false);
  };

  const handleSavePoi = async () => {
    if (!poiName || !poiDate || !trip.raw) return;
    setPoiError(null);

    const startDateValue = setTimeOnDate(poiDate, poiTime);
    const endDateValue = new Date(startDateValue.getTime() + 60 * 60 * 1000);
    const startDate = buildDateTime(startDateValue);
    const endDate = buildDateTime(endDateValue);
    const payload = {
      title: poiName,
      description: buildPoiDescription(poiLocation, poiNotes),
      url: '',
      latitude: poiLatitude,
      longitude: poiLongitude,
      type: uiTypeToApi(poiType),
      tripId: trip.raw.id,
      startDate,
      endDate
    };

    try {
      if (editingPoi) {
        await onUpdatePoi(editingPoi.id, payload);
      } else {
        await onCreatePoi(payload);
      }

      setShowPoiModal(false);
      onRefresh();
    } catch (error: any) {
      console.error('Failed to save POI', error);
      setPoiError(error?.data?.errors?.[0] || 'Unable to save point of interest.');
    }
  };

  const handleAddDay = async () => {
    if (!trip.raw?.endDate) return;
    const confirmed = confirm('Add one day to this trip? This will update the trip end date.');
    if (!confirmed) return;

    try {
      const currentEnd = new Date(trip.raw.endDate);
      if (Number.isNaN(currentEnd.getTime())) return;
      currentEnd.setDate(currentEnd.getDate() + 1);
      const newEndDate = currentEnd.toISOString();

      await api.patch(`/Trip/update/${trip.raw.id}/dates`, {
        startDate: trip.raw.startDate,
        endDate: newEndDate
      });

      onRefresh();
    } catch (error) {
      console.error('Failed to extend trip', error);
    }
  };

  const handleDeletePoi = async (poiId: number) => {
    if (!confirm('Delete this point of interest?')) return;
    await onDeletePoi(poiId);
    onRefresh();
  };

  const handleDeleteTrip = async () => {
    if (!confirm('Delete this trip?')) return;
    await onDeleteTrip();
  };

  return (
    <div className="max-w-5xl mx-auto">
      <button onClick={onBack} className="mb-6 flex items-center text-slate-500 hover:text-sky-600 transition-colors">
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Trips
      </button>

      <div className="relative h-64 md:h-80 rounded-3xl overflow-hidden mb-4 shadow-lg">
        <img src={trip.coverImage} className="w-full h-full object-cover" alt={trip.destination} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex flex-col justify-end p-8">
          <h1 className="text-4xl font-bold text-white mb-2">{trip.destination}</h1>
          <p className="text-white/80 font-medium">{tripDateRange}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-8">
        <button
          onClick={onEditTrip}
          className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-sky-700 hover:border-sky-200 transition-colors"
        >
          Edit Trip
        </button>
        <button
          onClick={handleDeleteTrip}
          className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-red-600 hover:border-red-200 transition-colors"
        >
          Delete Trip
        </button>
      </div>

      <div className="flex overflow-x-auto pb-4 mb-8 space-x-3 scrollbar-hide">
        {trip.itinerary.map((day, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedDayIdx(idx)}
            className={`shrink-0 px-6 py-4 rounded-2xl flex flex-col items-center min-w-[100px] transition-all ${
              selectedDayIdx === idx
                ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-sky-300'
            }`}
          >
            <span className="text-xs uppercase font-bold opacity-70">Day {idx + 1}</span>
            <span className="text-lg font-bold">{new Date(day.date).getDate()}</span>
          </button>
        ))}
        <button
          className="shrink-0 px-6 py-4 rounded-2xl bg-slate-100 text-slate-400 border border-dashed border-slate-300 flex flex-col items-center justify-center hover:bg-slate-200 transition-all"
          onClick={handleAddDay}
          type="button"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span className="text-[10px] font-bold uppercase mt-1">Add Day</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-800">
              Itinerary{' '}
              <span className="text-slate-400 font-normal ml-2">
                {selectedDay ? new Date(selectedDay.date).toDateString() : ''}
              </span>
            </h2>
            <button
              onClick={openAddModal}
              className="p-2 bg-sky-100 text-sky-700 rounded-full hover:bg-sky-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>

          {!selectedDay || selectedDay.items.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center text-slate-400">
              <p className="text-lg font-medium mb-2">No plans for this day yet.</p>
              <button className="text-sky-600 font-bold hover:underline" type="button">
                Browse recommendations
              </button>
            </div>
          ) : (
            <div className="space-y-4 relative before:absolute before:inset-y-0 before:left-8 before:w-px before:bg-slate-200 before:hidden md:before:block">
              {selectedDay.items.map((item) => (
                <div key={item.id} className="relative flex group">
                  <div className="hidden md:flex absolute left-8 -translate-x-1/2 w-4 h-4 rounded-full border-4 border-white bg-sky-500 shadow-sm top-8 z-10"></div>
                  <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 w-full hover:shadow-md transition-shadow md:ml-12 flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-3xl shrink-0">
                      {getIcon(item.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-slate-800">{item.name}</h4>
                        {item.time && (
                          <span className="text-sm font-semibold text-sky-600 bg-sky-50 px-2 py-1 rounded-lg">
                            {item.time}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 mb-2">{item.location || trip.destination}</p>
                      {item.notes && <p className="text-xs text-slate-400 italic">“{item.notes}”</p>}
                    </div>
                    <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        className="p-2 text-slate-400 hover:text-sky-600"
                        onClick={() => openEditModal(item)}
                        type="button"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        className="p-2 text-slate-400 hover:text-red-500"
                        onClick={() => handleDeletePoi(item.id)}
                        type="button"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Quick Info
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Accomodation</span>
                <span className="font-semibold text-slate-800">{quickInfoCounts.accommodation}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Transport</span>
                <span className="font-semibold text-slate-800">{quickInfoCounts.transport}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Attractions</span>
                <span className="font-semibold text-slate-800">{quickInfoCounts.attractions}</span>
              </div>
            </div>
          </div>

          <div className="bg-sky-600 p-6 rounded-3xl shadow-lg shadow-sky-600/20 text-white overflow-hidden relative">
            <div className="relative z-10">
              <h3 className="font-bold mb-2">AI Trip Assistant</h3>
              <p className="text-sm text-sky-100 mb-4">Let Gemini suggest hidden gems for your {trip.destination} trip.</p>
              <button className="w-full bg-white text-sky-600 py-2 rounded-xl text-sm font-bold hover:bg-sky-50 transition-colors" type="button">
                Generate Suggestions
              </button>
            </div>
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-32 h-32 bg-white/10 rounded-full"></div>
          </div>

          <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200 h-64 flex flex-col items-center justify-center text-slate-400 bg-slate-50 overflow-hidden relative">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-40 grayscale"
              style={{ backgroundImage: "url('https://picsum.photos/seed/map/400/400')" }}
            ></div>
            <div className="relative z-10 text-center">
              <svg className="w-8 h-8 mx-auto mb-2 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-600">Map View Locked</p>
              <p className="text-[10px] text-slate-500 mt-1">Upgrade to view full map</p>
            </div>
          </div>
        </div>
      </div>

      {showPoiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-3xl p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-slate-800">{editingPoi ? 'Edit' : 'Add'} to Itinerary</h3>
              <button onClick={() => setShowPoiModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors" type="button">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Place Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="e.g. Louvre Museum"
                  value={poiName}
                  onChange={(event) => {
                    const value = event.target.value;
                    setPoiName(value);
                    setPoiLocation(value);
                    searchPoiLocations(value);
                  }}
                />
                {poiSearchOpen && (
                  <div className="mt-2 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                    {poiSearchLoading && <div className="px-4 py-3 text-sm text-slate-500">Searching...</div>}
                    {!poiSearchLoading && poiSearchResults.length === 0 && (
                      <div className="px-4 py-3 text-sm text-slate-500">No results found.</div>
                    )}
                    {!poiSearchLoading &&
                      poiSearchResults.map((location) => (
                        <button
                          key={`${location.display_name}-${location.lat}-${location.lon}`}
                          className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50"
                          onClick={() => selectPoiLocation(location)}
                          type="button"
                        >
                          {location.display_name}
                        </button>
                      ))}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Time</label>
                  <input
                    type="time"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-sky-500"
                    value={poiTime}
                    onChange={(event) => setPoiTime(event.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Type</label>
                  <select
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-sky-500"
                    value={poiType}
                    onChange={(event) => setPoiType(event.target.value as POIType)}
                  >
                    <option value="attraction">Attraction</option>
                    <option value="restaurant">Restaurant</option>
                    <option value="hotel">Hotel</option>
                    <option value="coffee">Coffee Shop</option>
                    <option value="transport">Transport</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Notes</label>
                <textarea
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="Reservation links, must-see spots, etc."
                  rows={3}
                  value={poiNotes}
                  onChange={(event) => setPoiNotes(event.target.value)}
                ></textarea>
              </div>
              <button
                className="w-full bg-sky-600 text-white py-4 rounded-xl font-bold hover:bg-sky-700 transition-all shadow-lg shadow-sky-600/20 mt-4"
                onClick={handleSavePoi}
                type="button"
              >
                {editingPoi ? 'Save Changes' : 'Add'}
              </button>
              {poiError && <p className="text-sm text-red-100 bg-red-500/80 px-3 py-2 rounded-xl">{poiError}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripDetailView;
