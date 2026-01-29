import React, { useEffect, useMemo, useState } from 'react';
import { ApiTrip, ApiTripList, ApiTripListItem, Trip, TravelList, View } from './types';
import AuthView from './views/AuthView';
import DashboardView from './views/DashboardView';
import TripDetailView from './views/TripDetailView';
import ListView from './views/ListView';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import TripModal from './components/TripModal';
import ProfileView from './views/ProfileView';
import { api } from './services/api';
import { mapApiTripToUi } from './services/mappers';

interface AuthResponse {
  success: boolean;
  token: string;
  errors?: string[];
}

interface ProfileResponse {
  success: boolean;
  userProfile?: { firstName: string; lastName: string; email: string } | null;
  errors?: string[];
}

interface TripsListResult {
  success: boolean;
  trips: ApiTrip[];
  errors?: string[];
}

interface TripResult {
  success: boolean;
  trip?: ApiTrip | null;
  userIsOwner?: boolean;
  errors?: string[];
}

interface TripIdResult {
  success: boolean;
  tripId?: number;
  errors?: string[];
}

interface TripListsResult {
  success: boolean;
  tripLists?: ApiTripList[] | null;
  errors?: string[];
}

interface RequestResult {
  success: boolean;
  errors?: string[];
}

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('auth');
  const [selectedTripId, setSelectedTripId] = useState<number | null>(null);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [lists, setLists] = useState<TravelList[]>([]);
  const [listsTripId, setListsTripId] = useState<number | null>(null);
  const [listsError, setListsError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showTripModal, setShowTripModal] = useState(false);
  const [tripModalError, setTripModalError] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [tripModalMode, setTripModalMode] = useState<'create' | 'edit'>('create');

  const token = useMemo(() => localStorage.getItem('token'), []);

  const deriveNameFromEmail = (email: string) => {
    const local = email.split('@')[0] || 'Traveler';
    const parts = local.split(/[._-]+/).filter(Boolean);
    const firstName = parts[0] ? parts[0][0].toUpperCase() + parts[0].slice(1) : 'Traveler';
    const lastName = parts[1] ? parts[1][0].toUpperCase() + parts[1].slice(1) : 'Explorer';
    return { firstName, lastName };
  };

  const loadProfile = async (email: string) => {
    try {
      const response = await api.get<ProfileResponse>(`/Auth/getProfile?userEmail=${encodeURIComponent(email)}`);
      if (response.success && response.userProfile) {
        setUser({
          name: `${response.userProfile.firstName} ${response.userProfile.lastName}`.trim(),
          email: response.userProfile.email
        });
        return;
      }
    } catch (error) {
      console.error('Failed to load profile', error);
    }

    const fallback = deriveNameFromEmail(email);
    setUser({ name: `${fallback.firstName} ${fallback.lastName}`.trim(), email });
  };

  const loadTrips = async () => {
    try {
      const response = await api.get<TripsListResult>('/Trip/getAll');
      if (response.success) {
        const mapped = (response.trips || []).map(mapApiTripToUi);
        setTrips(mapped);
        return mapped;
      }
    } catch (error) {
      console.error('Failed to load trips', error);
    }
    return [] as Trip[];
  };

  const loadTripDetail = async (tripId: number) => {
    try {
      const response = await api.get<TripResult>(`/Trip/getById/${tripId}`);
      if (response.success && response.trip) {
        const mapped = mapApiTripToUi(response.trip);
        setSelectedTrip(mapped);
        return mapped;
      }
    } catch (error) {
      console.error('Failed to load trip detail', error);
    }
    return null;
  };

  const loadTripLists = async (tripId: number) => {
    try {
      const response = await api.get<TripListsResult>(`/TripList/getByTrip/${tripId}`);
      if (response.success) {
        const mapped = (response.tripLists || []).map((list) => mapTripList(list));
        setLists(mapped);
        setListsError(null);
      }
    } catch (error) {
      console.error('Failed to load trip lists', error);
      setListsError('Unable to load lists for this trip.');
    }
  };

  const mapTripList = (list: ApiTripList): TravelList => {
    const lower = list.title.toLowerCase();
    const type = lower.includes('pack') ? 'packing' : lower.includes('wish') ? 'wishlist' : 'custom';
    const items = (list.listItems || []).map((item: ApiTripListItem) => ({
      id: item.id,
      content: item.title,
      completed: item.isChecked
    }));

    return {
      id: list.id,
      title: list.title,
      type,
      items
    };
  };

  const handleAuth = async (mode: 'login' | 'register', email: string, password: string) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const payload = mode === 'login'
        ? { email, password }
        : {
            email,
            password,
            ...deriveNameFromEmail(email)
          };

      const response = await api.post<AuthResponse>(`/Auth/${mode === 'login' ? 'login' : 'register'}`, payload);
      if (response.success && response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('email', email);
        await loadProfile(email);
        await loadTrips();
        setCurrentView('dashboard');
        return;
      }

      setAuthError(response.errors?.[0] || 'Unable to authenticate.');
    } catch (error: any) {
      setAuthError(error?.data?.errors?.[0] || 'Unable to authenticate.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    setUser(null);
    setTrips([]);
    setSelectedTrip(null);
    setLists([]);
    setSelectedTripId(null);
    setCurrentView('auth');
  };

  const handleOpenTrip = async (id: number) => {
    setSelectedTripId(id);
    setCurrentView('trip-detail');
    await loadTripDetail(id);
  };

  const handleCreateTrip = () => {
    setTripModalError(null);
    setTripModalMode('create');
    setShowTripModal(true);
  };

  const handleEditTrip = () => {
    setTripModalError(null);
    setTripModalMode('edit');
    setShowTripModal(true);
  };

  const handleSaveTrip = async (data: {
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    latitude: number;
    longitude: number;
  }) => {
    if (tripModalMode === 'create') {
      try {
        const response = await api.post<TripIdResult>('/Trip/create', {
          title: data.title,
          description: data.description || '',
          startDate: data.startDate,
          endDate: data.endDate,
          latitude: data.latitude ?? 0,
          longitude: data.longitude ?? 0
        });
        if (response.success && response.tripId) {
          await loadTrips();
          setShowTripModal(false);
          await handleOpenTrip(response.tripId);
          return;
        }
        setTripModalError(response.errors?.[0] || 'Unable to create trip.');
      } catch (error) {
        console.error('Failed to create trip', error);
        setTripModalError((error as any)?.data?.errors?.[0] || 'Unable to create trip.');
      }
    } else if (selectedTrip?.raw) {
      const tripId = selectedTrip.raw.id;
      try {
        if (data.title && data.title !== selectedTrip.raw.title) {
          await api.patch<RequestResult>(`/Trip/update/${tripId}/title`, data.title);
        }
        if ((data.description || '') !== (selectedTrip.raw.description || '')) {
          await api.patch<RequestResult>(`/Trip/update/${tripId}/description`, data.description || '');
        }
        if (data.startDate !== selectedTrip.raw.startDate || data.endDate !== selectedTrip.raw.endDate) {
          await api.patch<RequestResult>(`/Trip/update/${tripId}/dates`, {
            startDate: data.startDate,
            endDate: data.endDate
          });
        }
        await loadTrips();
        await loadTripDetail(tripId);
        setShowTripModal(false);
      } catch (error) {
        console.error('Failed to update trip', error);
        setTripModalError((error as any)?.data?.errors?.[0] || 'Unable to update trip.');
      }
    }
  };

  const handleDeleteTrip = async () => {
    if (!selectedTrip?.raw) return;
    try {
      await api.delete<RequestResult>(`/Trip/delete/${selectedTrip.raw.id}`);
      setSelectedTrip(null);
      setSelectedTripId(null);
      setCurrentView('dashboard');
      await loadTrips();
    } catch (error) {
      console.error('Failed to delete trip', error);
    }
  };

  const handleCreatePoi = async (payload: any) => {
    try {
      const response = await api.post<RequestResult>('/PointOfInterest/create', payload);
      if (response && response.success === false) {
        throw { data: response };
      }
      if (selectedTripId) {
        await loadTripDetail(selectedTripId);
      }
    } catch (error) {
      console.error('Failed to create POI', error);
      throw error;
    }
  };

  const handleUpdatePoi = async (id: number, payload: any) => {
    try {
      const response = await api.patch<RequestResult>(`/PointOfInterest/update/${id}`, payload);
      if (response && response.success === false) {
        throw { data: response };
      }
      if (selectedTripId) {
        await loadTripDetail(selectedTripId);
      }
    } catch (error) {
      console.error('Failed to update POI', error);
      throw error;
    }
  };

  const handleDeletePoi = async (id: number) => {
    try {
      const response = await api.delete<RequestResult>(`/PointOfInterest/delete/${id}`);
      if (response && response.success === false) {
        throw { data: response };
      }
      if (selectedTripId) {
        await loadTripDetail(selectedTripId);
      }
    } catch (error) {
      console.error('Failed to delete POI', error);
      throw error;
    }
  };

  const handleCreateList = async (title: string) => {
    if (!listsTripId) {
      setListsError('Select a trip before creating a list.');
      return;
    }
    try {
      await api.post<RequestResult>('/TripList/create', { tripId: listsTripId, title });
      await loadTripLists(listsTripId);
    } catch (error) {
      console.error('Failed to create trip list', error);
      setListsError('Unable to create list.');
    }
  };

  const handleDeleteList = async (listId: number) => {
    if (!listsTripId) return;
    try {
      await api.delete<RequestResult>(`/TripList/delete/${listId}`);
      await loadTripLists(listsTripId);
    } catch (error) {
      console.error('Failed to delete trip list', error);
      setListsError('Unable to delete list.');
    }
  };

  const handleAddListItem = async (listId: number, content: string) => {
    if (!listsTripId) return;
    try {
      await api.post<RequestResult>('/TripListItem/create', { tripListId: listId, title: content });
      await loadTripLists(listsTripId);
    } catch (error) {
      console.error('Failed to add list item', error);
      setListsError('Unable to add list item.');
    }
  };

  const handleToggleListItem = async (listId: number, itemId: number, nextValue: boolean) => {
    if (!listsTripId) return;
    try {
      await api.patch<RequestResult>(`/TripListItem/update/${itemId}/${listsTripId}`, { isChecked: nextValue });
      await loadTripLists(listsTripId);
    } catch (error) {
      console.error('Failed to update list item', error);
      setListsError('Unable to update list item.');
    }
  };

  const handleDeleteListItem = async (listId: number, itemId: number) => {
    if (!listsTripId) return;
    try {
      await api.delete<RequestResult>(`/TripListItem/delete/${itemId}`);
      await loadTripLists(listsTripId);
    } catch (error) {
      console.error('Failed to delete list item', error);
      setListsError('Unable to delete list item.');
    }
  };

  useEffect(() => {
    const email = localStorage.getItem('email');
    if (token && email) {
      setCurrentView('dashboard');
      loadProfile(email);
      loadTrips();
    }
  }, [token]);

  useEffect(() => {
    if (currentView === 'lists') {
      const nextTripId = selectedTripId || trips[0]?.id || null;
      if (nextTripId) {
        setListsTripId(nextTripId);
        loadTripLists(nextTripId);
        setListsError(null);
      } else {
        setListsTripId(null);
        setLists([]);
        setListsError('Create a trip first to manage lists.');
      }
    }
  }, [currentView, selectedTripId, trips]);

  const selectedTripForModal = tripModalMode === 'edit' ? selectedTrip?.raw : null;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {currentView !== 'auth' && (
        <Sidebar
          currentView={currentView}
          onNavigate={(view) => setCurrentView(view)}
          onProfile={() => setCurrentView('profile')}
          onLogout={handleLogout}
          isMobileOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        />
      )}

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {currentView !== 'auth' && (
          <Header user={user} onMenu={() => setMobileMenuOpen(true)} />
        )}

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {currentView === 'auth' && <AuthView onAuth={handleAuth} loading={authLoading} error={authError} />}
          {currentView === 'dashboard' && (
            <DashboardView trips={trips} onOpenTrip={handleOpenTrip} onCreateTrip={handleCreateTrip} />
          )}
          {currentView === 'trip-detail' && selectedTrip && (
            <TripDetailView
              trip={selectedTrip}
              onBack={() => setCurrentView('dashboard')}
              onRefresh={() => selectedTripId && loadTripDetail(selectedTripId)}
              onCreatePoi={handleCreatePoi}
              onUpdatePoi={handleUpdatePoi}
              onDeletePoi={handleDeletePoi}
              onDeleteTrip={handleDeleteTrip}
              onEditTrip={handleEditTrip}
            />
          )}
          {currentView === 'lists' && (
            <ListView
              lists={lists}
              error={listsError}
              onCreateList={handleCreateList}
              onDeleteList={handleDeleteList}
              onAddItem={handleAddListItem}
              onToggleItem={handleToggleListItem}
              onDeleteItem={handleDeleteListItem}
            />
          )}
          {currentView === 'profile' && <ProfileView user={user} />}
        </div>
      </main>

      <TripModal
        isOpen={showTripModal}
        mode={tripModalMode}
        initialData={selectedTripForModal}
        error={tripModalError}
        onClose={() => setShowTripModal(false)}
        onSave={handleSaveTrip}
      />
    </div>
  );
};

export default App;
