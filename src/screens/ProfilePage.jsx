import React, { useEffect, useState } from 'react';
import {
  ChevronRight, MapPin, Globe, Volume2, LogOut, Pencil, Package
} from 'lucide-react';
import { useCraft } from '../context/CraftContext';
import { api } from '../utils/api';

const C = {
  terracotta: '#D55E3A',
  terracotta50: '#FDF3F0',
  terracotta700: '#953A22',
  mustard: '#F59E0B',
  mustard50: '#FFFBEB',
  mustard700: '#B45309',
  forest: '#0D9488',
  forest50: '#F0FDFA',
  royal: '#1E3ABA',
  royal50: '#EEF2FF',
  charcoal: '#1E293B',
  stone400: '#A8A29E',
  stone500: '#78716C',
  ivory: '#FFF7ED',
};

const craftGradient = 'linear-gradient(135deg, #E34A34 0%, #F59E0B 55%, #D55E3A 100%)';

function Row({ icon: Icon, label, sub, tone, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 py-3 text-left transition active:scale-[0.99]"
    >
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl"
        style={{ background: tone?.bg || C.stone400 + '22', color: danger ? '#B91C1C' : (tone?.fg || C.stone500) }}
      >
        <Icon size={16} strokeWidth={2.4} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold" style={{ color: danger ? '#B91C1C' : C.charcoal }}>{label}</p>
        {sub && <p className="mt-0.5 text-xs" style={{ color: C.stone500 }}>{sub}</p>}
      </div>
      <ChevronRight size={16} style={{ color: C.stone400 }} />
    </button>
  );
}

export default function ProfileScreen() {
  const { goToStep, getArtisanId, t } = useCraft();
  const [name] = useState('Meera Devi');
  const [craft] = useState('Madhubani Painting');
  const [village] = useState('Jitwarpur, Bihar');
  const [joined] = useState('Joined Mar 2025');

  const [listingCount, setListingCount] = useState(null);
  const [catalogValue, setCatalogValue] = useState(null);
  const [loadingListings, setLoadingListings] = useState(true);

  useEffect(() => {
    api.getProducts(getArtisanId())
      .then((res) => {
        const products = res?.data || [];
        setListingCount(products.length);
        setCatalogValue(products.reduce((sum, p) => sum + (Number(p.final_price) || 0), 0));
      })
      .catch(() => { setListingCount(null); setCatalogValue(null); })
      .finally(() => setLoadingListings(false));
  }, []);

  return (
    <div
      className="mx-auto w-full max-w-sm space-y-4 p-4"
      style={{ background: C.ivory, fontFamily: "Inter, 'Noto Sans Devanagari', system-ui, sans-serif" }}
    >
      {/* HEADER CARD */}
      <div
        className="relative overflow-hidden rounded-[2rem] p-5 text-white shadow-lg"
        style={{ background: craftGradient }}
      >
        <div
          className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full blur-2xl"
          style={{ background: 'rgba(245,158,11,0.25)' }}
        />
        <div className="relative flex items-center gap-3">
          <div
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-xl font-black"
            style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)' }}
          >
            MD
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-lg font-black leading-tight" style={{ fontFamily: "Fraunces, 'Noto Sans Devanagari', Georgia, serif" }}>
              {name}
            </p>
            <p className="mt-0.5 text-xs font-semibold text-white/85">{craft}</p>
            <p className="mt-1 flex items-center gap-1 text-[11px] text-white/70">
              <MapPin size={11} /> {village}
            </p>
          </div>
          <button
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
            style={{ background: 'rgba(255,255,255,0.2)' }}
            aria-label="Edit profile"
          >
            <Pencil size={14} />
          </button>
        </div>
        <p className="relative mt-3 text-[10px] text-white/60">{joined}</p>
      </div>

      {/* MY PRODUCTS */}
      <div className="rounded-3xl bg-white px-4 shadow-sm">
        <Row
          icon={Package}
          label={t?.myListings || 'My products'}
          sub={
            loadingListings
              ? 'Loading…'
              : listingCount === null
              ? 'Unable to load'
              : `${listingCount} listed · ₹${catalogValue} catalog value`
          }
          tone={{ bg: C.forest50, fg: C.forest }}
          onClick={() => goToStep(10)}
        />
      </div>

      {/* SETTINGS SECTION */}
      <div className="rounded-3xl bg-white px-4 shadow-sm">
        <p className="pt-3 text-[10px] font-bold uppercase tracking-wide" style={{ color: C.stone400 }}>Settings</p>
        <div className="divide-y" style={{ borderColor: '#F1EDE7' }}>
          <Row icon={Globe} label="App language" sub="हिन्दी (Hindi)" tone={{ bg: C.mustard50, fg: C.mustard700 }} />
          <Row icon={Volume2} label="Voice assistant" sub="On for all steps" tone={{ bg: C.royal50, fg: C.royal }} />
        </div>
      </div>

      {/* SIGN OUT */}
      <div className="rounded-3xl bg-white px-4 shadow-sm">
        <Row icon={LogOut} label="Sign out" danger />
      </div>

    </div>
  );
}