# Suggestion System Research

**Date:** 2026-03-04
**Project:** dot-vacay
**Branch:** jedai

---

## Executive Summary

The current suggestion system consists of **two separate mechanisms**:

1. **OpenStreetMap (Nominatim)** - FREE ✅
   - Used for autocomplete in input fields
   - General location search (cities) and POI search
   - API: `nominatim.openstreetmap.org`

2. **OpenAI (GPT-4.1-mini)** - PAID ❌
   - Used for generating full itinerary suggestions
   - Generates POIs: restaurants, cafes, museums, landmarks, shopping
   - **REQUIRES PAID API KEY** (`DOTVACAY_OPENAI_APIKEY`)

---

## Current Implementation

### 1. Frontend Services

#### SearchOsmService (`src/DotVacay.WebNg/src/app/services/search-osm.service.ts`)

```typescript
// General location search (cities, landmarks)
searchLocations(query: string): Observable<LocationResult[]>
// Returns: display_name, lat, lon

// POI search (hotels, museums, cafes, restaurants)
searchPointsOfInterest(query: string): Observable<LocationResult[]>
```

**Used in:**
- `edit-trip-modal.component.ts` → `searchLocations()` for trip creation
- `edit-poi-modal.component.ts` → `searchPointsOfInterest()` for POI editing

#### AiSuggestionService (`src/DotVacay.WebNg/src/app/services/ai-suggestion.service.ts`)

```typescript
generateSuggestions(request: GenerateSuggestionsRequest): Observable<any>
// Takes: location, startDate, endDate, tripId
// Calls: GET /AiSuggestion/generate
```

**Used in:**
- `trip-detail.component.ts` → `generateDayAiSuggestions()` for itinerary suggestions

---

### 2. Backend API

#### LocationController (`src/DotVacay.API/Controllers/LocationController.cs`)

**Base URL:** `https://nominatim.openstreetmap.org`

**Endpoints:**

```csharp
// Search for cities/locations
[HttpGet("search")]
public async Task<IActionResult> SearchLocations([FromQuery] string query)
// Calls: /search?q={query}&format=json&limit=5&addressdetails=1
```

```csharp
// Search for POIs - HAS A BUG! ⚠️
[HttpGet("searchPoi")]
public async Task<IActionResult> SearchPointsOfInterest([FromQuery] string query)
// CURRENTLY CALLS: /search?amenity={query}&format=json&limit=5&addressdetails=1
// ISSUE: amenity= searches for a specific amenity TYPE, not name matching
// SHOULD BE: /search?q={query}&format=json&limit=5
```

**BUG:** The `searchPoi` endpoint uses `amenity=` parameter, which filters by amenity TYPE (like "restaurant", "cafe"), not by name. This breaks the POI search functionality when users type a specific place name.

---

#### AiSuggestionService (`src/DotVacay.Application/Services/AiSuggestionService.cs`)

```csharp
// OpenAI-based itinerary generation
public async Task<SuggestionsResult> GenerateTripSuggestionsAsync(GenerateTripSuggestionRequest request)
```

**What it generates:**
- POIs with: title, description, type, startDate, endDate, url, latitude, longitude
- Types: Restaurant, Coffee, Museum, Landmark, Shopping
- Schedules suggestions with realistic timing per day

**Requirements:**
- OpenAI API key in `DOTVACAY_OPENAI_APIKEY` environment variable
- Model: `gpt-4.1-mini`
- **COST:** PAID per token

---

### 3. POI Types (`src/DotVacay.Core/Enums/PointOfInterestType.cs`)

```csharp
public enum PointOfInterestType {
    Accomodation = 0,      // Hotels
    Transportation = 1,
    Restaurant = 2,
    Coffee = 3,            // Cafes
    Museum = 4,
    Landmark = 5,
    Shopping = 6
}
```

---

## Your Requirements

### Trip Creation Flow
- **Want:** Suggestions for cities and landmarks ✅
- **Current:** Uses `searchLocations()` via OpenStreetMap (Nominatim)
- **Status:** ALREADY IMPLEMENTED & FREE ✅

### Itinerary Flow
- **Want:** Suggestions for hotels, museums, cafes, restaurants ✅
- **Current:** Uses `searchPointsOfInterest()` via OpenStreetMap (Nominatim)
  - **BUT** has a bug (amenity= instead of q=)
- **Alternative:** AI suggestions via OpenAI (PAID) ❌

---

## Options Analysis

### Option 1: Fix Current OSM Implementation ⭐ RECOMMENDED

**Pros:**
- FREE (OpenStreetMap/Nominatim is open source and free)
- No new dependencies
- Only a bug fix needed
- UI/UX stays the same

**Cons:**
- Nominatim has rate limits (1 request per second recommended)
- Results depend on OpenStreetMap data quality

**Changes Required:**

1. **Backend - Fix LocationController.cs:**

```csharp
// Change line 60 in searchPoi endpoint
// FROM: amenity={Uri.EscapeDataString(query)}
// TO:   q={Uri.EscapeDataString(query)}
```

2. **Optional - Add filters for specific types:**
   - Could add optional query parameters for POI type filtering
   - Example: `/searchPoi?q={query}&type=museum`

**Effort:** ~30 minutes

---

### Option 2: Use Overpass API (Advanced)

**Pros:**
- More powerful than Nominatim
- Can filter by specific tags and categories
- Still FREE and open source
- Can get more detailed POI data

**Cons:**
- More complex to implement
- Need to write custom Overpass QL queries
- Still rate-limited

**Example Query:**
```overpass
[out:json][timeout:25];
(
  node["tourism"~"museum|attraction"](around:5000,48.8566,2.3522);
  node["amenity"~"restaurant|cafe"](around:5000,48.8566,2.3522);
);
out body;
```

**Effort:** ~2-3 days

---

### Option 3: Local POI Database

**Pros:**
- No external API calls
- Fast and reliable
- No rate limits
- Offline capable

**Cons:**
- Need to import POI data
- Requires storage space
- Data may become outdated
- Initial setup work

**Data Sources:**
- OpenStreetMap extracts (geofabrik.de)
- Wikivoyage dumps
- Custom curated database

**Effort:** ~1 week for initial setup + maintenance

---

### Option 4: Phosphor Search or Other Services

**Note:** Most commercial POI search services are PAID:
- Google Places API ❌
- Foursquare ❌
- Yelp ❌
- TripAdvisor ❌

**Free Alternatives:**
- **OpenStreetMap/Nominatim** ✅ (already using)
- **Overpass API** ✅ (more advanced)
- **Photon** ✅ (OSM-based geocoder, free)
- **Pelias** ✅ (OSM-based, self-hostable)

---

## Recommendation

### For Trip Creation (Cities & Landmarks)
**Status: Already working perfectly** ✅
- Continue using `searchLocations()` via Nominatim
- No changes needed

### For Itinerary Flow (Hotels, Museums, Cafes, Restaurants)

**Recommended Approach:**

1. **Immediate Fix (Option 1) - Fix the Bug:**
   - Change `searchPoi` to use `q=` instead of `amenity=`
   - This will make POI search work correctly
   - FREE and quick to implement

2. **Enhancement (Option 2) - Add Type Filtering:**
   - Allow users to filter by POI type when searching
   - Example: search only museums or restaurants
   - Still uses OSM/Nominatim (FREE)

3. **Long-term (Option 3) - Consider Local Database:**
   - If performance issues arise with rate limits
   - Or if more complex filtering is needed
   - Could be implemented later

---

## Implementation Plan

### Phase 1: Quick Fix (1-2 hours)
1. Fix `LocationController.cs` `searchPoi` endpoint
2. Test POI search functionality
3. Verify results for hotels, museums, cafes, restaurants

### Phase 2: Type Filtering (1 day)
1. Add optional `type` parameter to `searchPoi` endpoint
2. Update frontend to pass selected POI type
3. Add filter UI if desired

### Phase 3: Performance Optimization (optional)
1. Implement caching for frequent queries
2. Consider Overpass API for complex queries
3. Evaluate local database if needed

---

## Free/Open Source Alternatives Summary

| Service | Free | Rate Limit | Complexity | Notes |
|---------|------|-------------|------------|-------|
| **Nominatim (current)** | ✅ | 1 req/sec | Low | Already integrated, just needs bug fix |
| **Overpass API** | ✅ | Fair | High | More powerful, custom queries |
| **Photon** | ✅ | N/A (self-host) | Medium | OSM-based, fast geocoding |
| **Pelias** | ✅ | N/A (self-host) | High | Full geocoding suite |
| **Google Places** | ❌ | Paid | Low | Not free |
| **Foursquare** | ❌ | Paid | Low | Not free |

---

## Next Steps

1. **Review this research** - Confirm approach
2. **Fix the bug** - Update `LocationController.cs` line 60
3. **Test** - Verify POI search works for all required types
4. **Decide** - If type filtering or enhancements are needed

---

## Files Referenced

- `src/DotVacay.WebNg/src/app/services/search-osm.service.ts`
- `src/DotVacay.WebNg/src/app/services/ai-suggestion.service.ts`
- `src/DotVacay.API/Controllers/LocationController.cs`
- `src/DotVacay.Application/Services/AiSuggestionService.cs`
- `src/DotVacay.Core/Enums/PointOfInterestType.cs`
- `src/DotVacay.WebNg/src/app/components/edit-trip-modal/edit-trip-modal.component.ts`
- `src/DotVacay.WebNg/src/app/components/edit-poi-modal/edit-poi-modal.component.ts`
- `src/DotVacay.WebNg/src/app/pages/trip-detail/trip-detail.component.ts`
