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

type TripTab = 'plan' | 'map';
type JoinRole = 'Viewer' | 'Editor';

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
  const [activeTab, setActiveTab] = useState<TripTab>('plan');
  const [mapDayFilter, setMapDayFilter] = useState<string>('all');
  const [selectedMapPoiId, setSelectedMapPoiId] = useState<number | null>(null);

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
  const [poiEstimatedCost, setPoiEstimatedCost] = useState('');
  const [poiCurrency, setPoiCurrency] = useState('USD');
  const [poiError, setPoiError] = useState<string | null>(null);

  const [tripBudgetAmount, setTripBudgetAmount] = useState<string>('');
  const [tripBudgetCurrency, setTripBudgetCurrency] = useState('USD');
  const [budgetMessage, setBudgetMessage] = useState<string | null>(null);

  const [inviteRole, setInviteRole] = useState<JoinRole>('Viewer');
  const [joinTripId, setJoinTripId] = useState<string>('');

  const [poiSearchResults, setPoiSearchResults] = useState<Array<{ display_name: string; lat: string; lon: string }>>([]);
  const [poiSearchOpen, setPoiSearchOpen] = useState(false);
  const [poiSearchLoading, setPoiSearchLoading] = useState(false);
  const poiSearchDebounceRef = useRef<number | null>(null);

  const [templates, setTemplates] = useState<Array<{ id: string; title: string; payload: any }>>([]);

  useEffect(() => {
    setSelectedDayIdx(0);
    setMapDayFilter('all');
    setSelectedMapPoiId(null);
    setTripBudgetAmount(trip.budgetAmount !== undefined ? String(trip.budgetAmount) : '');
    setTripBudgetCurrency(trip.budgetCurrency || 'USD');
    setJoinTripId(String(trip.id));
  }, [trip.id, trip.budgetAmount, trip.budgetCurrency]);

  useEffect(() => {
    const raw = localStorage.getItem('dotvacay-templates');
    if (raw) {
      setTemplates(JSON.parse(raw));
    }
  }, []);

  const persistTemplates = (next: Array<{ id: string; title: string; payload: any }>) => {
    setTemplates(next);
    localStorage.setItem('dotvacay-templates', JSON.stringify(next));
  };

  const selectedDay = trip.itinerary[selectedDayIdx];
  const tripDateRange = `${new Date(trip.startDate).toDateString()} — ${new Date(trip.endDate).toDateString()}`;

  const plannedTotal = useMemo(() => {
    return trip.itinerary
      .flatMap((day) => day.items)
      .reduce((sum, poi) => sum + (poi.estimatedCost || 0), 0);
  }, [trip.itinerary]);

  const remainingBudget = useMemo(() => {
    const budget = Number(tripBudgetAmount);
    if (!tripBudgetAmount || Number.isNaN(budget)) return null;
    return budget - plannedTotal;
  }, [plannedTotal, tripBudgetAmount]);

  const mapPois = useMemo(() => {
    const all = trip.itinerary
      .flatMap((day, index) => day.items.map((item) => ({ ...item, dayIndex: index, dayDate: day.date })))
      .filter((poi) => poi.raw?.latitude !== undefined && poi.raw?.latitude !== null && poi.raw?.longitude !== undefined && poi.raw?.longitude !== null);

    if (mapDayFilter === 'all') return all;
    const index = Number(mapDayFilter);
    return all.filter((poi) => poi.dayIndex === index);
  }, [trip.itinerary, mapDayFilter]);

  useEffect(() => {
    if (!mapPois.length) {
      setSelectedMapPoiId(null);
      return;
    }
    if (!selectedMapPoiId || !mapPois.some((poi) => poi.id === selectedMapPoiId)) {
      setSelectedMapPoiId(mapPois[0].id);
    }
  }, [mapPois, selectedMapPoiId]);

  const selectedMapPoi = mapPois.find((poi) => poi.id === selectedMapPoiId) || null;

  const getMapUrl = () => {
    if (!selectedMapPoi?.raw?.latitude || !selectedMapPoi?.raw?.longitude) return '';
    const lat = selectedMapPoi.raw.latitude;
    const lon = selectedMapPoi.raw.longitude;
    const delta = 0.03;
    const bbox = `${lon - delta}%2C${lat - delta}%2C${lon + delta}%2C${lat + delta}`;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lon}`;
  };

  const getIcon = (type: POIType) => ({ hotel: '🏨', restaurant: '🍽️', attraction: '🏛️', coffee: '☕', transport: '🚗', other: '📍' }[type]);

  const setTimeOnDate = (day: Date, time: string) => {
    const [hours, minutes] = time.split(':');
    const date = new Date(day);
    date.setHours(Number(hours || '9'), Number(minutes || '0'), 0, 0);
    return date;
  };

  const buildDateTime = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const dayNum = String(date.getDate()).padStart(2, '0');
    const hourNum = String(date.getHours()).padStart(2, '0');
    const minuteNum = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${dayNum}T${hourNum}:${minuteNum}`;
  };

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
    setPoiEstimatedCost('');
    setPoiCurrency(tripBudgetCurrency || 'USD');
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
    setPoiEstimatedCost(poi.estimatedCost !== undefined ? String(poi.estimatedCost) : '');
    setPoiCurrency(poi.currency || tripBudgetCurrency || 'USD');
    setPoiError(null);
    setPoiDate(poi.raw?.startDate ? new Date(poi.raw.startDate) : new Date(selectedDay?.date || trip.startDate));
    setShowPoiModal(true);
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
      } catch {
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
    const startDateValue = setTimeOnDate(poiDate, poiTime);
    const endDateValue = new Date(startDateValue.getTime() + 60 * 60 * 1000);
    const payload = {
      title: poiName,
      description: buildPoiDescription(poiLocation, poiNotes),
      url: editingPoi?.url || '',
      latitude: poiLatitude,
      longitude: poiLongitude,
      type: uiTypeToApi(poiType),
      tripId: trip.raw.id,
      startDate: buildDateTime(startDateValue),
      endDate: buildDateTime(endDateValue),
      estimatedCost: poiEstimatedCost ? Number(poiEstimatedCost) : null,
      currency: poiCurrency || null
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
      setPoiError(error?.data?.errors?.[0] || 'Unable to save point of interest.');
    }
  };

  const handleReorder = async (poi: POI, direction: 'up' | 'down') => {
    if (!selectedDay) return;
    const items = [...selectedDay.items];
    const from = items.findIndex((item) => item.id === poi.id);
    if (from < 0) return;
    const to = direction === 'up' ? from - 1 : from + 1;
    if (to < 0 || to >= items.length) return;
    [items[from], items[to]] = [items[to], items[from]];

    try {
      await Promise.all(items.map((item, idx) => api.patch(`/PointOfInterest/update/${item.id}/tripDayIndex`, idx)));
      onRefresh();
    } catch {
      alert('Could not save reordered points of interest.');
    }
  };

  const handleSaveBudget = async () => {
    if (!trip.raw) return;
    const payload = {
      budgetAmount: tripBudgetAmount ? Number(tripBudgetAmount) : null,
      budgetCurrency: tripBudgetCurrency || null
    };

    localStorage.setItem(`dotvacay-budget-${trip.raw.id}`, JSON.stringify(payload));

    try {
      await api.patch(`/Trip/update/${trip.raw.id}/budget`, payload);
      setBudgetMessage('Budget saved.');
    } catch {
      setBudgetMessage('Budget saved locally (backend endpoint unavailable).');
    }
  };

  const handleSaveAttachment = async (poi: POI, urlValue: string) => {
    await onUpdatePoi(poi.id, { ...poi.raw, url: urlValue || '' });
    onRefresh();
  };

  const handleJoinTrip = async () => {
    try {
      await api.post('/Trip/join', { tripId: Number(joinTripId), role: inviteRole === 'Viewer' ? 0 : 1 });
      alert('Joined trip successfully.');
    } catch {
      alert('Unable to join trip.');
    }
  };

  const copyInvite = async () => {
    const text = `Join my DotVacay trip! Trip ID: ${trip.id}. Choose role: ${inviteRole}. In app, go to trip and use Join.`;
    await navigator.clipboard.writeText(text);
  };

  const handleExportIcs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5111/api'}/Trip/${trip.id}/export.ics`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (!response.ok) throw new Error('failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${trip.destination.replace(/\s+/g, '-').toLowerCase()}.ics`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      alert('Unable to export ICS yet.');
    }
  };

  const saveAsTemplate = () => {
    const template = {
      id: `tpl-${Date.now()}`,
      title: `${trip.destination} template`,
      payload: {
        title: `${trip.destination} (copy)`,
        description: trip.raw?.description || '',
        startDate: trip.startDate,
        endDate: trip.endDate,
        latitude: trip.raw?.latitude || 0,
        longitude: trip.raw?.longitude || 0
      }
    };
    persistTemplates([template, ...templates]);
  };

  const createFromTemplate = async (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (!template) return;
    await api.post('/Trip/create', template.payload);
    alert('Trip created from template.');
  };

  const feedItems = useMemo(() => {
    return trip.itinerary
      .flatMap((day, dayIndex) => day.items.map((poi) => ({ poi, dayIndex, dayDate: day.date })))
      .sort((a, b) => new Date(b.poi.raw?.startDate || b.dayDate).getTime() - new Date(a.poi.raw?.startDate || a.dayDate).getTime())
      .slice(0, 8);
  }, [trip.itinerary]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <button onClick={onBack} className="text-slate-500 hover:text-sky-600">← Back to Trips</button>
      <div className="relative h-64 rounded-3xl overflow-hidden shadow-lg">
        <img src={trip.coverImage} className="w-full h-full object-cover" alt={trip.destination} />
        <div className="absolute inset-0 bg-black/35 p-8 flex items-end justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white">{trip.destination}</h1>
            <p className="text-white/85">{tripDateRange}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={onEditTrip} className="px-3 py-2 rounded-xl bg-white/90 text-slate-700">Edit</button>
            <button onClick={handleExportIcs} className="px-3 py-2 rounded-xl bg-white/90 text-slate-700">Export ICS</button>
            <button onClick={onDeleteTrip} className="px-3 py-2 rounded-xl bg-red-100 text-red-700">Delete</button>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button className={`px-4 py-2 rounded-xl ${activeTab === 'plan' ? 'bg-sky-600 text-white' : 'bg-white'}`} onClick={() => setActiveTab('plan')}>Plan</button>
        <button className={`px-4 py-2 rounded-xl ${activeTab === 'map' ? 'bg-sky-600 text-white' : 'bg-white'}`} onClick={() => setActiveTab('map')}>Map</button>
      </div>

      {activeTab === 'map' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 bg-white rounded-3xl border border-slate-200 p-4">
          <div className="lg:col-span-2 rounded-2xl overflow-hidden border border-slate-200 min-h-[320px]">
            {selectedMapPoi ? <iframe title="trip-map" src={getMapUrl()} className="w-full h-[360px]" /> : <div className="p-6 text-slate-500">No POIs with coordinates.</div>}
          </div>
          <div className="space-y-3">
            <select className="w-full border rounded-xl px-3 py-2" value={mapDayFilter} onChange={(e) => setMapDayFilter(e.target.value)}>
              <option value="all">All days</option>
              {trip.itinerary.map((day, idx) => <option key={day.date} value={idx}>{`Day ${idx + 1} · ${new Date(day.date).toDateString()}`}</option>)}
            </select>
            <div className="max-h-[290px] overflow-auto space-y-2">
              {mapPois.map((poi) => (
                <button key={poi.id} onClick={() => setSelectedMapPoiId(poi.id)} className={`w-full text-left p-3 rounded-xl border ${selectedMapPoiId === poi.id ? 'border-sky-400 bg-sky-50' : 'border-slate-200'}`}>
                  <p className="font-semibold">{poi.name}</p>
                  <p className="text-xs text-slate-500">{poi.location}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'plan' && (
        <>
          <div className="flex overflow-x-auto gap-2 pb-2">
            {trip.itinerary.map((day, idx) => (
              <button key={day.date} onClick={() => setSelectedDayIdx(idx)} className={`px-4 py-3 rounded-xl ${selectedDayIdx === idx ? 'bg-sky-600 text-white' : 'bg-white border border-slate-200'}`}>{`Day ${idx + 1}`}</button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-3">
              <div className="flex justify-between items-center"><h2 className="text-xl font-bold">Itinerary</h2><button className="px-3 py-2 rounded-xl bg-sky-100" onClick={openAddModal}>+ Add POI</button></div>
              {selectedDay?.items.map((item, index) => (
                <div key={item.id} className={`bg-white rounded-2xl border p-4 ${selectedMapPoiId === item.id ? 'border-sky-300' : 'border-slate-200'}`}>
                  <div className="flex justify-between gap-3">
                    <div>
                      <p className="font-semibold">{getIcon(item.type)} {item.name}</p>
                      <p className="text-sm text-slate-500">{item.location}</p>
                      {item.estimatedCost !== undefined && <p className="text-xs text-emerald-600">Cost: {item.currency || tripBudgetCurrency} {item.estimatedCost}</p>}
                    </div>
                    <div className="flex gap-1">
                      <button className="px-2" disabled={index === 0} onClick={() => handleReorder(item, 'up')}>↑</button>
                      <button className="px-2" disabled={index === selectedDay.items.length - 1} onClick={() => handleReorder(item, 'down')}>↓</button>
                      <button className="px-2" onClick={() => openEditModal(item)}>Edit</button>
                      <button className="px-2 text-red-600" onClick={() => onDeletePoi(item.id).then(onRefresh)}>Delete</button>
                    </div>
                  </div>
                  <div className="mt-2 flex gap-2">
                    <input defaultValue={item.url || ''} placeholder="Attachment URL" className="flex-1 border rounded-lg px-2 py-1 text-sm" id={`url-${item.id}`} />
                    <button
                      className="text-xs px-2 py-1 bg-slate-100 rounded-lg"
                      onClick={() => {
                        const input = document.getElementById(`url-${item.id}`) as HTMLInputElement | null;
                        handleSaveAttachment(item, input?.value || '');
                      }}
                    >Save Link</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-2xl border p-4">
                <h3 className="font-bold mb-2">Invite</h3>
                <p className="text-xs text-slate-500 mb-2">Share trip id and role, then join from any account.</p>
                <div className="space-y-2">
                  <input className="w-full border rounded-xl px-3 py-2" value={joinTripId} onChange={(e) => setJoinTripId(e.target.value)} />
                  <select className="w-full border rounded-xl px-3 py-2" value={inviteRole} onChange={(e) => setInviteRole(e.target.value as JoinRole)}>
                    <option>Viewer</option>
                    <option>Editor</option>
                  </select>
                  <div className="flex gap-2">
                    <button className="flex-1 bg-slate-100 rounded-xl py-2" onClick={copyInvite}>Copy Invite</button>
                    <button className="flex-1 bg-sky-600 text-white rounded-xl py-2" onClick={handleJoinTrip}>Join</button>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border p-4">
                <h3 className="font-bold mb-2">Budget</h3>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <input className="border rounded-xl px-3 py-2" placeholder="Amount" value={tripBudgetAmount} onChange={(e) => setTripBudgetAmount(e.target.value)} />
                  <input className="border rounded-xl px-3 py-2" value={tripBudgetCurrency} onChange={(e) => setTripBudgetCurrency(e.target.value.toUpperCase())} />
                </div>
                <p className="text-sm text-slate-600">Planned: {tripBudgetCurrency} {plannedTotal.toFixed(2)}</p>
                {remainingBudget !== null && (
                  <p className={`text-sm ${remainingBudget < 0 ? 'text-red-600' : 'text-emerald-600'}`}>Remaining: {tripBudgetCurrency} {remainingBudget.toFixed(2)}</p>
                )}
                <button className="mt-2 w-full bg-slate-100 rounded-xl py-2" onClick={handleSaveBudget}>Save Budget</button>
                {budgetMessage && <p className="text-xs text-slate-500 mt-1">{budgetMessage}</p>}
              </div>

              <div className="bg-white rounded-2xl border p-4">
                <h3 className="font-bold mb-2">Activity Feed</h3>
                <div className="space-y-2 text-sm">
                  {feedItems.map((entry) => (
                    <p key={`${entry.poi.id}-${entry.dayDate}`}><span className="font-semibold">{entry.poi.name}</span> in day {entry.dayIndex + 1}</p>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border p-4">
                <h3 className="font-bold mb-2">Trip Templates</h3>
                <button className="w-full bg-slate-100 rounded-xl py-2 mb-2" onClick={saveAsTemplate}>Save Current as Template</button>
                <div className="space-y-2 max-h-32 overflow-auto">
                  {templates.map((tpl) => (
                    <button key={tpl.id} className="w-full text-left border rounded-xl px-3 py-2" onClick={() => createFromTemplate(tpl.id)}>{tpl.title}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {showPoiModal && (
        <div className="fixed inset-0 bg-black/50 grid place-items-center z-50 p-4">
          <div className="bg-white rounded-2xl p-5 w-full max-w-lg space-y-3">
            <h3 className="text-xl font-bold">{editingPoi ? 'Edit POI' : 'Add POI'}</h3>
            <input value={poiName} onChange={(e) => { setPoiName(e.target.value); setPoiLocation(e.target.value); searchPoiLocations(e.target.value); }} className="w-full border rounded-xl px-3 py-2" placeholder="Place name" />
            {poiSearchOpen && <div className="border rounded-xl max-h-28 overflow-auto">{poiSearchLoading ? <p className="p-2 text-sm">Searching...</p> : poiSearchResults.map((location) => <button className="block w-full text-left px-3 py-2 hover:bg-slate-50" key={location.display_name} onClick={() => selectPoiLocation(location)}>{location.display_name}</button>)}</div>}
            <div className="grid grid-cols-2 gap-2">
              <input type="time" value={poiTime} onChange={(e) => setPoiTime(e.target.value)} className="border rounded-xl px-3 py-2" />
              <select value={poiType} onChange={(e) => setPoiType(e.target.value as POIType)} className="border rounded-xl px-3 py-2">
                <option value="attraction">Attraction</option><option value="restaurant">Restaurant</option><option value="hotel">Hotel</option><option value="coffee">Coffee</option><option value="transport">Transport</option><option value="other">Other</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input placeholder="Estimated cost" value={poiEstimatedCost} onChange={(e) => setPoiEstimatedCost(e.target.value)} className="border rounded-xl px-3 py-2" />
              <input placeholder="Currency" value={poiCurrency} onChange={(e) => setPoiCurrency(e.target.value.toUpperCase())} className="border rounded-xl px-3 py-2" />
            </div>
            <textarea value={poiNotes} onChange={(e) => setPoiNotes(e.target.value)} className="w-full border rounded-xl px-3 py-2" rows={3} placeholder="Notes" />
            {poiError && <p className="text-red-600 text-sm">{poiError}</p>}
            <div className="flex gap-2">
              <button className="flex-1 bg-slate-100 rounded-xl py-2" onClick={() => setShowPoiModal(false)}>Cancel</button>
              <button className="flex-1 bg-sky-600 text-white rounded-xl py-2" onClick={handleSavePoi}>{editingPoi ? 'Save' : 'Add'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripDetailView;
