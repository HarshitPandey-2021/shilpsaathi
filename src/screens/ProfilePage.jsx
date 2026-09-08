import React, { useEffect, useState } from 'react';
import { ChevronRight, MapPin, Globe, Volume2, LogOut, Pencil, Package, Check, X } from 'lucide-react';
import { useCraft } from '../context/CraftContext';
import { api } from '../utils/api';

function Row({ icon: Icon, label, sub, tone = '', onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 py-3 text-left transition active:scale-[0.99]"
    >
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl ${
        danger ? 'bg-red-50 text-red-600' : tone || 'bg-stone-100 text-stone-500'
      }`}>
        <Icon size={16} strokeWidth={2.4} />
      </span>
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-bold ${danger ? 'text-red-600' : 'text-charcoal'}`}>{label}</p>
        {sub && <p className="mt-0.5 text-xs text-stone-500">{sub}</p>}
      </div>
      {!danger && <ChevronRight size={16} className="text-stone-400" />}
    </button>
  );
}

export default function ProfileScreen() {
  const { goToStep, getArtisanId, confirmedPhone, setShowLangModal, t } = useCraft();

  const [name, setName] = useState(localStorage.getItem('shilpsaathi_artisan_name') || '');
  const [village, setVillage] = useState(localStorage.getItem('shilpsaathi_artisan_village') || '');
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [draftVillage, setDraftVillage] = useState('');

  const [listingCount, setListingCount] = useState(null);
  const [catalogValue, setCatalogValue] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = getArtisanId();
    if (!id) { setLoading(false); return; }
    api.getProducts(id)
      .then((res) => {
        const products = res?.data || [];
        setListingCount(products.length);
        setCatalogValue(products.reduce((s, p) => s + (Number(p.final_price) || 0), 0));
      })
      .catch(() => { setListingCount(null); setCatalogValue(null); })
      .finally(() => setLoading(false));
  }, []);

  const openEdit = () => {
    setDraftName(name); setDraftVillage(village); setEditing(true);
  };

  const saveEdit = () => {
    const n = draftName.trim(), v = draftVillage.trim();
    setName(n); setVillage(v);
    localStorage.setItem('shilpsaathi_artisan_name', n);
    localStorage.setItem('shilpsaathi_artisan_village', v);
    setEditing(false);
  };

  const initials = name
    ? name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase()
    : '👤';

  const maskedPhone = confirmedPhone
    ? `+91 ${String(confirmedPhone).slice(-10, -5)} ${String(confirmedPhone).slice(-5)}`
    : '';

  return (
    <div className="space-y-4 animate-fade-in-up">

      <div className="relative overflow-hidden rounded-[2rem] bg-craft p-5 text-white shadow-lift">
        <div className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-mustard-400/25 blur-2xl" />
        <div className="relative flex items-center gap-3">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white/20 text-xl font-black backdrop-blur-sm">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-lg font-black leading-tight">
              {name || t.artisanLabel || 'Artisan'}
            </p>
            {maskedPhone && <p className="mt-0.5 text-xs font-semibold text-white/85">{maskedPhone}</p>}
            {village && (
              <p className="mt-1 flex items-center gap-1 text-[11px] text-white/70">
                <MapPin size={11} /> {village}
              </p>
            )}
          </div>
          <button
            onClick={openEdit}
            aria-label="Edit"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20 active:scale-95"
          >
            <Pencil size={15} />
          </button>
        </div>
      </div>

      <div className="rounded-3xl border border-stone-200 bg-white px-4 shadow-card">
        <Row
          icon={Package}
          label={t.myListings}
          sub={
            loading ? '…'
            : listingCount === null ? '—'
            : `${listingCount} · ₹${catalogValue} ${t.catalogValue}`
          }
          tone="bg-forest-50 text-forest"
          onClick={() => goToStep(10)}
        />
      </div>

      <div className="rounded-3xl border border-stone-200 bg-white px-4 shadow-card">
        <p className="pt-3 text-[10px] font-black uppercase tracking-wide text-stone-400">
          {t.settings || 'Settings'}
        </p>
        <div className="divide-y divide-stone-100">
          <Row
            icon={Globe}
            label={t.chooseLang}
            sub={t.name}
            tone="bg-mustard-50 text-mustard-700"
            onClick={() => setShowLangModal(true)}
          />
          <Row
            icon={Volume2}
            label={t.listen}
            sub={t.voiceOnAllSteps || 'On for all steps'}
            tone="bg-royal-50 text-royal"
          />
        </div>
      </div>

      <div className="rounded-3xl border border-stone-200 bg-white px-4 shadow-card">
        <Row
          icon={LogOut}
          label={t.signOut || 'Sign out'}
          danger
          onClick={() => {
            localStorage.removeItem('shilpsaathi_artisan_uuid');
            localStorage.removeItem('shilpsaathi_artisan_phone');
            localStorage.removeItem('shilpsaathi_artisan_name');
            localStorage.removeItem('shilpsaathi_artisan_village');
            window.location.reload();
          }}
        />
      </div>

      <p className="pb-2 text-center text-[10px] text-stone-400">
        ShilpSaathi · MoSJE
      </p>

      {editing && (
        <div className="absolute inset-0 z-50 flex items-end bg-charcoal/50 backdrop-blur-sm animate-fade-in"
          onClick={() => setEditing(false)}>
          <div className="w-full space-y-3 rounded-t-[2rem] bg-white p-5 pb-8 animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}>
            <span className="mx-auto block h-1 w-10 rounded-full bg-stone-300" />
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-black text-charcoal">
                {t.editProfile || 'Edit profile'}
              </h3>
              <button onClick={() => setEditing(false)}
                className="flex h-9 w-9 items-center justify-center rounded-2xl bg-stone-100 text-stone-500">
                <X size={17} strokeWidth={2.5} />
              </button>
            </div>
            <div className="space-y-1.5">
              <label className="text-2xs font-black uppercase tracking-wide text-stone-400">
                {t.yourName || 'Your name'}
              </label>
              <input value={draftName} onChange={(e) => setDraftName(e.target.value)}
                maxLength={60} className="field-input" placeholder="—" />
            </div>
            <div className="space-y-1.5">
              <label className="text-2xs font-black uppercase tracking-wide text-stone-400">
                {t.yourVillage || 'Village / city'}
              </label>
              <input value={draftVillage} onChange={(e) => setDraftVillage(e.target.value)}
                maxLength={80} className="field-input" placeholder="—" />
            </div>
            <button onClick={saveEdit}
              className="touch flex w-full items-center justify-center gap-2 rounded-3xl bg-craft px-5 py-4 text-sm font-bold text-white shadow-lift active:scale-[0.98]">
              <Check size={17} strokeWidth={3} /> {t.savePhoneBtn}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}