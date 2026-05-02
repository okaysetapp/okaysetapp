"""
Google Places lookup → vendor data extractor.

Accepts three input types:
  1. maps.app.goo.gl short links → resolve redirect, extract place
  2. google.com/maps/place URLs  → extract place_id / coords / name
  3. Plain text queries           → Places Text Search API

Explicitly rejected:
  - share.google links (not resolvable via Places API)
  - google.com/maps/search result URLs (ambiguous, multi-result)

Flow:
1. Classify input as URL or plain text.
2. For URLs: resolve short links, extract place_id/CID/coords.
3. For plain text (or if URL extraction fails): text search.
4. Map Google's `types[]` to our 10 service categories (LLM fallback).
5. Persistent daily quota cap in /app/backend/.api_usage.json.
"""
import os
import re
import json
import logging
import asyncio
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional, Tuple, Dict, Any
import httpx
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent / '.env')
load_dotenv(Path(__file__).parent.parent / '.env')  # project-root fallback

logger = logging.getLogger(__name__)

GOOGLE_PLACES_API_KEY = os.environ.get("GOOGLE_PLACES_API_KEY")
DAILY_CAP = int(os.environ.get('GOOGLE_PLACES_DAILY_CAP', '200'))
USAGE_FILE = Path(__file__).parent / '.api_usage.json'

PLACES_BASE = "https://places.googleapis.com/v1"
FIELD_MASK = (
    "id,displayName,formattedAddress,location,internationalPhoneNumber,"
    "nationalPhoneNumber,websiteUri,types,addressComponents,editorialSummary"
)

# Map Google place types → our 10 categories
TYPE_TO_CATEGORY = {
    "wedding_venue": "Venue",
    "event_venue": "Venue",
    "banquet_hall": "Venue",
    "performing_arts_theater": "Venue",
    "convention_center": "Venue",
    "auditorium": "Venue",
    "stadium": "Venue",
    "tourist_attraction": "Venue",
    "park": "Venue",
    "hotel": "Venue",
    "resort_hotel": "Venue",

    "church": "Religious Venue",
    "hindu_temple": "Religious Venue",
    "mosque": "Religious Venue",
    "synagogue": "Religious Venue",
    "place_of_worship": "Religious Venue",

    "caterer": "Catering",
    "catering_service": "Catering",

    "florist": "Decor",
    "interior_designer": "Decor",

    "photographer": "Photography",
    "photo_studio": "Photography",
    "videographer": "Photography",

    "beauty_salon": "Makeup",
    "hair_salon": "Makeup",
    "makeup_artist": "Makeup",

    "clothing_store": "Attire Rentals",
    "men_clothing_store": "Attire Rentals",
    "women_clothing_store": "Attire Rentals",

    "car_rental": "Car Rentals",

    "store": "Accessories",

    "jewelry_store": "Jewellery",
}


# ============= Quota tracking (file-based, free-tier safe) =============
def _load_usage() -> dict:
    if not USAGE_FILE.exists():
        return {}
    try:
        return json.loads(USAGE_FILE.read_text())
    except Exception:
        return {}


def _save_usage(data: dict):
    try:
        USAGE_FILE.write_text(json.dumps(data))
    except Exception as e:
        logger.warning(f"Failed to save usage: {e}")


def _today_key() -> str:
    return datetime.now(timezone.utc).strftime('%Y-%m-%d')


def get_quota_status() -> dict:
    data = _load_usage()
    today = _today_key()
    used = data.get(today, {}).get('google_places', 0)
    return {
        "used_today": used,
        "daily_cap": DAILY_CAP,
        "remaining": max(0, DAILY_CAP - used),
        "date_utc": today,
    }


def _check_and_increment_quota():
    data = _load_usage()
    today = _today_key()
    day = data.setdefault(today, {})
    used = day.get('google_places', 0)
    if used >= DAILY_CAP:
        return False, used
    day['google_places'] = used + 1
    # prune old entries (keep only last 7 days)
    keep = sorted(data.keys())[-7:]
    data = {k: data[k] for k in keep}
    _save_usage(data)
    return True, used + 1


# ============= URL parsing =============
async def resolve_short_url(url: str) -> str:
    """Follow redirects on maps.app.goo.gl / goo.gl / g.co URLs."""
    if not any(s in url for s in ['maps.app.goo.gl', 'goo.gl', 'g.co/kgs']):
        return url
    try:
        async with httpx.AsyncClient(follow_redirects=True, timeout=10.0) as client:
            r = await client.get(url)
            return str(r.url)
    except Exception as e:
        logger.warning(f"URL resolve failed: {e}")
        return url


def extract_place_id(url: str) -> Optional[str]:
    """Place IDs in Google Maps URLs look like 'ChIJ...' or '0x...:0x...' (CID)."""
    # Standard place_id query param
    m = re.search(r'place_id[=:]([A-Za-z0-9_-]+)', url)
    if m:
        return m.group(1)
    # ftid / ChIJ pattern in data= or hex CID
    m = re.search(r'!1s(0x[0-9a-fA-F]+:0x[0-9a-fA-F]+)', url)
    if m:
        return m.group(1)  # hex CID, must be looked up via search
    # Sometimes the place_id appears directly in path
    m = re.search(r'/(ChIJ[A-Za-z0-9_-]+)', url)
    if m:
        return m.group(1)
    return None


def extract_coordinates(url: str) -> Optional[Tuple[float, float]]:
    patterns = [
        r'@(-?\d+\.\d+),(-?\d+\.\d+)',
        r'!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)',
        r'[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)',
        r'[?&]ll=(-?\d+\.\d+),(-?\d+\.\d+)',
    ]
    for p in patterns:
        m = re.search(p, url)
        if m:
            try:
                lat, lng = float(m.group(1)), float(m.group(2))
                if -90 <= lat <= 90 and -180 <= lng <= 180:
                    return (lat, lng)
            except ValueError:
                continue
    return None


def extract_business_name(url: str) -> Optional[str]:
    """Extract name from /maps/place/<NAME>(/...|$) pattern."""
    m = re.search(r'/maps/place/([^/?]+)', url)
    if m:
        try:
            from urllib.parse import unquote
            name = unquote(m.group(1)).replace('+', ' ').strip()
            return name if name and not name.startswith('@') else None
        except Exception:
            return None
    return None


# ============= Google Places API calls =============
async def _places_get_details(place_id: str) -> Optional[dict]:
    headers = {
        "X-Goog-Api-Key": GOOGLE_PLACES_API_KEY,
        "X-Goog-FieldMask": FIELD_MASK,
    }
    url = f"{PLACES_BASE}/places/{place_id}"
    async with httpx.AsyncClient(timeout=15.0) as client:
        r = await client.get(url, headers=headers)
        if r.status_code == 404:
            return None
        if r.status_code != 200:
            logger.error(f"Places GET {r.status_code}: {r.text[:200]}")
            return None
        return r.json()


async def _places_text_search(query: str, lat: Optional[float] = None, lng: Optional[float] = None) -> Optional[dict]:
    headers = {
        "X-Goog-Api-Key": GOOGLE_PLACES_API_KEY,
        "X-Goog-FieldMask": f"places.{FIELD_MASK.replace(',', ',places.')}",
        "Content-Type": "application/json",
    }
    body: Dict[str, Any] = {"textQuery": query, "pageSize": 1}
    if lat is not None and lng is not None:
        body["locationBias"] = {
            "circle": {"center": {"latitude": lat, "longitude": lng}, "radius": 500.0}
        }
    async with httpx.AsyncClient(timeout=15.0) as client:
        r = await client.post(f"{PLACES_BASE}/places:searchText", headers=headers, json=body)
        if r.status_code != 200:
            logger.error(f"Text search {r.status_code}: {r.text[:200]}")
            return None
        data = r.json()
        places = data.get("places") or []
        return places[0] if places else None


# ============= Mapping helpers =============
def _city_from_components(components: list) -> Optional[str]:
    """Pick the most-likely city from addressComponents."""
    if not components:
        return None
    priority = ["locality", "postal_town", "administrative_area_level_2", "administrative_area_level_1"]
    by_type: Dict[str, str] = {}
    for c in components:
        for t in c.get("types", []):
            by_type.setdefault(t, c.get("longText") or c.get("shortText") or "")
    for t in priority:
        if by_type.get(t):
            return by_type[t]
    return None


def _category_from_types(types: list) -> Optional[str]:
    if not types:
        return None
    for t in types:
        if t in TYPE_TO_CATEGORY:
            return TYPE_TO_CATEGORY[t]
    return None


async def _llm_category_fallback(name: str, types: list, description: str) -> Optional[str]:
    """When static map doesn't match, ask Gemini Flash to classify.

    Uses the official `google-generativeai` SDK (already in requirements).
    Reads the API key from GEMINI_API_KEY (or GOOGLE_API_KEY as a fallback).
    Any exception — missing key, network error, model error — is swallowed
    and we return None so the caller falls back to the static map.
    """
    try:
        import google.generativeai as genai
        api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
        if not api_key:
            return None
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel(
            "gemini-2.0-flash",
            system_instruction=(
                "You map a business to ONE of these exact categories: "
                "Venue, Religious Venue, Catering, Decor, Photography, Makeup, "
                "Attire Rentals, Car Rentals, Accessories, Jewellery. "
                "Reply with ONLY the category name, nothing else. "
                "If none clearly fit, reply 'NONE'."
            ),
        )
        prompt = f"Business name: {name}\nGoogle types: {types}\nDescription: {description}"
        # SDK call is sync — run in a thread so we don't block the event loop.
        resp_obj = await asyncio.to_thread(model.generate_content, prompt)
        resp = (getattr(resp_obj, "text", "") or "").strip()
        valid = {"Venue", "Religious Venue", "Catering", "Decor", "Photography",
                 "Makeup", "Attire Rentals", "Car Rentals", "Accessories", "Jewellery"}
        return resp if resp in valid else None
    except Exception as e:
        logger.warning(f"LLM category fallback failed: {e}")
        return None


# ============= Input classification =============
_MAPS_URL_PATTERNS = [
    'maps.app.goo.gl',
    'google.com/maps/place',
    'google.co.in/maps/place',
    'goo.gl/maps',
]

_REJECTED_URL_PATTERNS = [
    'share.google',
    'google.com/maps/search',
    'google.co.in/maps/search',
]


def _classify_input(raw: str) -> str:
    """Return 'maps_url', 'rejected_url', or 'text_query'."""
    lowered = raw.lower()
    for pattern in _REJECTED_URL_PATTERNS:
        if pattern in lowered:
            return 'rejected_url'
    for pattern in _MAPS_URL_PATTERNS:
        if pattern in lowered:
            return 'maps_url'
    # Anything that looks like a URL but isn't a known maps pattern → text query
    # (we don't try to handle random URLs)
    return 'text_query'


# ============= Main entry =============
async def lookup_from_url(url: str) -> dict:
    """Accepts a Google Maps URL or plain text place name.
    Returns vendor-form-shaped dict + meta. Raises ValueError or QuotaExceededError."""
    raw = (url or '').strip()
    if not raw:
        raise ValueError("Input is required — paste a Google Maps link or type a place name")

    if not GOOGLE_PLACES_API_KEY:
        raise ValueError(
            "GOOGLE_PLACES_API_KEY is not set. Add it to backend env vars to use Google Places lookup."
        )

    input_type = _classify_input(raw)

    if input_type == 'rejected_url':
        raise ValueError(
            "share.google and Google Maps search URLs are not supported. "
            "Use a direct maps.app.goo.gl link, a google.com/maps/place link, or type the place name."
        )

    # Quota check
    ok, current = _check_and_increment_quota()
    if not ok:
        raise QuotaExceededError(f"Daily Google API cap reached ({DAILY_CAP}/day). Try again tomorrow or fill manually.")

    place: Optional[dict] = None
    coords: Optional[Tuple[float, float]] = None
    name_hint: Optional[str] = None

    if input_type == 'maps_url':
        # URL flow: resolve → extract → lookup
        full_url = await resolve_short_url(raw)
        logger.info(f"Resolved URL: {full_url[:120]}")

        place_id = extract_place_id(full_url)
        coords = extract_coordinates(full_url)
        name_hint = extract_business_name(full_url)

        # Direct lookup if clean ChIJ-style place_id
        if place_id and place_id.startswith("ChIJ"):
            place = await _places_get_details(place_id)

        # Fallback: text search with name + coords
        if not place and name_hint:
            place = await _places_text_search(name_hint,
                                              coords[0] if coords else None,
                                              coords[1] if coords else None)
        if not place and coords:
            place = await _places_text_search(f"{coords[0]},{coords[1]}", coords[0], coords[1])

        # Final fallback: if URL extraction failed entirely, try the raw input as a text query
        if not place:
            logger.info("URL extraction failed, falling back to text search with raw input")
            place = await _places_text_search(raw)
    else:
        # Plain text query flow
        logger.info(f"Text query: {raw[:80]}")
        place = await _places_text_search(raw)

    if not place:
        raise ValueError(
            "Could not find this place. Try a Google Maps link or a more specific name (e.g. 'Taj Falaknuma Palace Hyderabad')."
        )

    # 4. parse fields
    display_name = (place.get("displayName") or {}).get("text") or name_hint or ""
    formatted_address = place.get("formattedAddress") or ""
    location = place.get("location") or {}
    lat = location.get("latitude") or (coords[0] if coords else None)
    lng = location.get("longitude") or (coords[1] if coords else None)
    phone = place.get("internationalPhoneNumber") or place.get("nationalPhoneNumber") or ""
    website = place.get("websiteUri") or ""
    types = place.get("types") or []
    components = place.get("addressComponents") or []
    city = _city_from_components(components) or ""
    description = ((place.get("editorialSummary") or {}).get("text")) or ""

    # 5. category
    category = _category_from_types(types)
    used_llm = False
    if not category:
        category = await _llm_category_fallback(display_name, types, description) or ""
        used_llm = bool(category)

    return {
        "data": {
            "business_name": display_name,
            "category": category,
            "city": city,
            "address": formatted_address,
            "phone": phone,
            "description": description,
            "external_link": website,
            "latitude": lat,
            "longitude": lng,
        },
        "meta": {
            "place_id": place.get("id"),
            "google_types": types,
            "category_via_llm": used_llm,
            "missing_fields": [k for k, v in {
                "phone": phone, "city": city, "description": description,
                "external_link": website, "category": category,
            }.items() if not v],
            "quota_used_today": current,
            "quota_daily_cap": DAILY_CAP,
        }
    }


class QuotaExceededError(Exception):
    pass
