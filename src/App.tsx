import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Globe,
  Mail,
  MapPin,
  Menu,
  Moon,
  Search,
  Shield,
  Sun,
  Trash2,
  UserCheck,
  X,
} from 'lucide-react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, doc, onSnapshot, orderBy, query } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import {
  DEFAULT_APPS,
  DEFAULT_DEVELOPER_SETTINGS,
  HERO_STUDIO_IMAGE,
} from './data/defaultSeed';
import { AppItem, DeveloperSettings, Language, PageView } from './types';
import { AppArtwork } from './components/AppArtwork';
import { AppDetailModal } from './components/AppDetailModal';
import { AdminPanel } from './components/AdminPanel';

export default function App() {
  const [lang, setLang] = useState<Language>('ku');
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [activePage, setActivePage] = useState<PageView>('home');
  const [activePolicySlug, setActivePolicySlug] = useState<string>('all');
  const [focusDeletion, setFocusDeletion] = useState<boolean>(false);
  const [policyDisplayLang, setPolicyDisplayLang] = useState<Language>('en');

  const [cloudApps, setCloudApps] = useState<AppItem[] | null>(null);
  const [cloudSettings, setCloudSettings] = useState<DeveloperSettings | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const [statusFilter, setStatusFilter] = useState<
    'all' | 'published' | 'in_development' | 'upcoming'
  >('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedApp, setSelectedApp] = useState<AppItem | null>(null);
  const [modalInitialTab, setModalInitialTab] = useState<
    'overview' | 'privacy' | 'deletion'
  >('overview');
  const [adminOpen, setAdminOpen] = useState(false);
  const [heroImgFailed, setHeroImgFailed] = useState(false);

  const isKu = lang === 'ku';

  // Sync HTML dir, lang, and dark class
  useEffect(() => {
    document.documentElement.lang = isKu ? 'ckb' : 'en';
    document.documentElement.dir = isKu ? 'rtl' : 'ltr';
  }, [isKu]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  // Listen to Firebase Auth
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsub();
  }, []);

  // Listen to public Firestore /apps and /settings/profile
  useEffect(() => {
    const appsQuery = query(collection(db, 'apps'), orderBy('sortOrder', 'asc'));
    const unsubApps = onSnapshot(
      appsQuery,
      (snapshot) => {
        if (snapshot.empty) {
          setCloudApps([]);
          return;
        }
        const items: AppItem[] = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            slug: String(data.slug || d.id),
            titleKu: String(data.titleKu || ''),
            titleEn: String(data.titleEn || ''),
            packageId: String(data.packageId || ''),
            status:
              data.status === 'published' ||
              data.status === 'in_development' ||
              data.status === 'upcoming'
                ? data.status
                : 'published',
            category: String(data.category || ''),
            summaryKu: String(data.summaryKu || ''),
            summaryEn: String(data.summaryEn || ''),
            playStoreUrl: String(data.playStoreUrl || ''),
            githubUrl: String(data.githubUrl || ''),
            iconUrl: String(data.iconUrl || ''),
            privacyPolicyEn: String(data.privacyPolicyEn || ''),
            privacyPolicyKu: String(data.privacyPolicyKu || ''),
            accountDeletionInfo: String(data.accountDeletionInfo || ''),
            dataCollected: String(data.dataCollected || ''),
            version: String(data.version || '1.0.0'),
            sortOrder: Number(data.sortOrder || 0),
            ownerUid: data.ownerUid ? String(data.ownerUid) : undefined,
          };
        });
        setCloudApps(items);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'apps');
      }
    );

    const unsubSettings = onSnapshot(
      doc(db, 'settings', 'profile'),
      (snap) => {
        if (!snap.exists()) {
          setCloudSettings(null);
          return;
        }
        const data = snap.data();
        setCloudSettings({
          brandNameKu: String(
            data.brandNameKu || DEFAULT_DEVELOPER_SETTINGS.brandNameKu
          ),
          brandNameEn: String(
            data.brandNameEn || DEFAULT_DEVELOPER_SETTINGS.brandNameEn
          ),
          heroTitleKu: String(
            data.heroTitleKu || DEFAULT_DEVELOPER_SETTINGS.heroTitleKu
          ),
          heroTitleEn: String(
            data.heroTitleEn || DEFAULT_DEVELOPER_SETTINGS.heroTitleEn
          ),
          nameKu: String(data.nameKu || DEFAULT_DEVELOPER_SETTINGS.nameKu),
          nameEn: String(data.nameEn || DEFAULT_DEVELOPER_SETTINGS.nameEn),
          roleKu: String(data.roleKu || DEFAULT_DEVELOPER_SETTINGS.roleKu),
          roleEn: String(data.roleEn || DEFAULT_DEVELOPER_SETTINGS.roleEn),
          bioKu: String(data.bioKu || DEFAULT_DEVELOPER_SETTINGS.bioKu),
          bioEn: String(data.bioEn || DEFAULT_DEVELOPER_SETTINGS.bioEn),
          locationKu: String(data.locationKu || DEFAULT_DEVELOPER_SETTINGS.locationKu),
          locationEn: String(data.locationEn || DEFAULT_DEVELOPER_SETTINGS.locationEn),
          email: String(data.email || DEFAULT_DEVELOPER_SETTINGS.email),
          playStoreDeveloperUrl: String(
            data.playStoreDeveloperUrl ||
              DEFAULT_DEVELOPER_SETTINGS.playStoreDeveloperUrl
          ),
          githubProfileUrl: String(
            data.githubProfileUrl || DEFAULT_DEVELOPER_SETTINGS.githubProfileUrl
          ),
          appAdsTxt: String(data.appAdsTxt || DEFAULT_DEVELOPER_SETTINGS.appAdsTxt),
          globalPrivacyPolicyEn: String(
            data.globalPrivacyPolicyEn ||
              DEFAULT_DEVELOPER_SETTINGS.globalPrivacyPolicyEn
          ),
          globalPrivacyPolicyKu: String(
            data.globalPrivacyPolicyKu ||
              DEFAULT_DEVELOPER_SETTINGS.globalPrivacyPolicyKu
          ),
          ownerUid: data.ownerUid ? String(data.ownerUid) : undefined,
        });
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'settings/profile');
      }
    );

    return () => {
      unsubApps();
      unsubSettings();
    };
  }, []);

  const isCloudSeeded = Boolean(cloudApps && cloudApps.length > 0);
  const apps = isCloudSeeded ? cloudApps! : DEFAULT_APPS;
  const settings = cloudSettings || DEFAULT_DEVELOPER_SETTINGS;
  const brandName = isKu ? settings.brandNameKu : settings.brandNameEn;

  // Sync browser tab title dynamically
  useEffect(() => {
    const pageLabel =
      activePage === 'privacy'
        ? isKu
          ? 'سیاسەتی نهێنی'
          : 'Privacy Policy'
        : activePage === 'about'
          ? isKu
            ? 'دەربارە و پەیوەندی'
            : 'About & Contact'
          : isKu
            ? 'ئەپەکان'
            : 'Apps';
    document.title = `${brandName} — ${pageLabel}`;
  }, [brandName, activePage, isKu]);

  // Read URL route (?page=home|privacy|about, ?privacy=slug, ?deletion=slug, ?admin)
  const syncFromUrl = useMemo(
    () => (appList: AppItem[]) => {
      const params = new URLSearchParams(window.location.search);
      const pageParam = params.get('page');
      const privacyParam = params.get('privacy');
      const deletionParam = params.get('deletion');
      const adminParam = params.get('admin');

      if (adminParam !== null || window.location.hash === '#admin') {
        setAdminOpen(true);
      }

      if (privacyParam) {
        setActivePage('privacy');
        setFocusDeletion(false);
        if (privacyParam === 'all') {
          setActivePolicySlug('all');
        } else {
          const match = appList.find((a) => a.slug === privacyParam);
          setActivePolicySlug(match ? match.slug : 'all');
        }
        return;
      }

      if (deletionParam) {
        setActivePage('privacy');
        setFocusDeletion(true);
        const match = appList.find((a) => a.slug === deletionParam);
        setActivePolicySlug(match ? match.slug : 'all');
        return;
      }

      if (pageParam === 'privacy') {
        setActivePage('privacy');
        setFocusDeletion(false);
      } else if (pageParam === 'about') {
        setActivePage('about');
      } else {
        setActivePage('home');
      }
    },
    []
  );

  useEffect(() => {
    syncFromUrl(apps);
  }, [apps, syncFromUrl]);

  useEffect(() => {
    const onPopState = () => syncFromUrl(apps);
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [apps, syncFromUrl]);

  const navigateTo = (
    page: PageView,
    opts?: { privacySlug?: string; deletion?: boolean }
  ) => {
    setActivePage(page);
    setMobileMenuOpen(false);
    setFocusDeletion(Boolean(opts?.deletion));

    const url = new URL(window.location.href);
    url.searchParams.delete('page');
    url.searchParams.delete('privacy');
    url.searchParams.delete('deletion');

    if (page === 'privacy') {
      const slug = opts?.privacySlug || activePolicySlug || 'all';
      setActivePolicySlug(slug);
      if (opts?.deletion && slug !== 'all') {
        url.searchParams.set('deletion', slug);
      } else {
        url.searchParams.set('privacy', slug);
      }
    } else if (page === 'about') {
      url.searchParams.set('page', 'about');
    }

    window.history.pushState({}, '', url.toString());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filteredApps = useMemo(() => {
    return apps.filter((app) => {
      if (statusFilter !== 'all' && app.status !== statusFilter) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        app.titleEn.toLowerCase().includes(q) ||
        app.titleKu.toLowerCase().includes(q) ||
        app.packageId.toLowerCase().includes(q) ||
        app.category.toLowerCase().includes(q)
      );
    });
  }, [apps, statusFilter, searchQuery]);

  const publishedCount = apps.filter((a) => a.status === 'published').length;
  const inProgressCount = apps.filter((a) => a.status !== 'published').length;

  const activePolicyApp =
    activePolicySlug === 'all'
      ? null
      : apps.find((a) => a.slug === activePolicySlug) || null;

  const activePolicyContent = activePolicyApp
    ? policyDisplayLang === 'en'
      ? activePolicyApp.privacyPolicyEn
      : activePolicyApp.privacyPolicyKu
    : policyDisplayLang === 'en'
      ? settings.globalPrivacyPolicyEn
      : settings.globalPrivacyPolicyKu;

  const BackArrow = isKu ? ArrowRight : ArrowLeft;

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 transition-colors duration-200">
      {/* Top Bar Contract: 3 zones separated by gap-8 */}
      <header className="sticky top-0 z-40 bg-zinc-50/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single-line brand wordmark */}
          <button
            type="button"
            onClick={() => navigateTo('home')}
            className="font-display text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100 whitespace-nowrap shrink-0 hover:opacity-80 transition-opacity"
          >
            {brandName}
          </button>

          {/* Zone 2: 3 Separate Pages Navigation */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <button
              type="button"
              onClick={() => navigateTo('home')}
              className={`transition-colors whitespace-nowrap shrink-0 ${
                activePage === 'home'
                  ? 'text-zinc-900 dark:text-zinc-100 underline underline-offset-8 decoration-blue-600 decoration-2'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              {isKu ? 'ئەپەکان' : 'Apps'}
            </button>
            <button
              type="button"
              onClick={() => navigateTo('privacy', { privacySlug: activePolicySlug })}
              className={`transition-colors whitespace-nowrap shrink-0 ${
                activePage === 'privacy'
                  ? 'text-zinc-900 dark:text-zinc-100 underline underline-offset-8 decoration-blue-600 decoration-2'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              {isKu ? 'سیاسەتی نهێنی' : 'Privacy Policy'}
            </button>
            <button
              type="button"
              onClick={() => navigateTo('about')}
              className={`transition-colors whitespace-nowrap shrink-0 ${
                activePage === 'about'
                  ? 'text-zinc-900 dark:text-zinc-100 underline underline-offset-8 decoration-blue-600 decoration-2'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              {isKu ? 'دەربارە و پەیوەندی' : 'About & Contact'}
            </button>
          </nav>

          {/* Zone 3: 1 Primary Action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setAdminOpen(true)}
              className="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              {isKu ? 'بەڕێوەبردن' : 'Admin'}
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label={isKu ? 'مێنۆ' : 'Menu'}
              className="md:hidden p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300"
            >
              {mobileMenuOpen ? (
                <X className="w-4 h-4" />
              ) : (
                <Menu className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Nav Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-6 py-4 flex flex-col gap-3 text-sm font-medium text-start">
            <button
              type="button"
              onClick={() => navigateTo('home')}
              className={`py-1.5 text-start ${
                activePage === 'home'
                  ? 'text-blue-600 font-semibold'
                  : 'text-zinc-700 dark:text-zinc-300'
              }`}
            >
              {isKu ? 'ئەپەکان' : 'Apps'}
            </button>
            <button
              type="button"
              onClick={() => navigateTo('privacy', { privacySlug: activePolicySlug })}
              className={`py-1.5 text-start ${
                activePage === 'privacy'
                  ? 'text-blue-600 font-semibold'
                  : 'text-zinc-700 dark:text-zinc-300'
              }`}
            >
              {isKu ? 'سیاسەتی نهێنی' : 'Privacy Policy'}
            </button>
            <button
              type="button"
              onClick={() => navigateTo('about')}
              className={`py-1.5 text-start ${
                activePage === 'about'
                  ? 'text-blue-600 font-semibold'
                  : 'text-zinc-700 dark:text-zinc-300'
              }`}
            >
              {isKu ? 'دەربارە و پەیوەندی' : 'About & Contact'}
            </button>
          </div>
        )}
      </header>

      <main className="max-w-6xl w-full mx-auto px-6 flex-1">
        {/* Workspace Controls Strip (Language & Theme — placed below header per Top Bar Contract) */}
        <div className="pt-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>{isKu ? settings.locationKu : settings.locationEn}</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
              <button
                type="button"
                onClick={() => setLang('ku')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  lang === 'ku'
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400'
                }`}
              >
                کوردی
              </button>
              <button
                type="button"
                onClick={() => setLang('en')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  lang === 'en'
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400'
                }`}
              >
                English
              </button>
            </div>

            <button
              type="button"
              onClick={() => setDarkMode((d) => !d)}
              aria-label={isKu ? 'گۆڕینی ڕووناکی' : 'Toggle theme'}
              className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              {darkMode ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* PAGE 1: HOME & APPS */}
        {activePage === 'home' && (
          <>
            <section className="py-10 sm:py-14">
              <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch gap-8 lg:gap-12">
                <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
                  <div className="space-y-3">
                    <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
                      {brandName} · {isKu ? settings.roleKu : settings.roleEn}
                    </p>
                    <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 leading-[1.15]">
                      {isKu ? settings.heroTitleKu : settings.heroTitleEn}
                    </h1>
                    <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl">
                      {isKu ? settings.bioKu : settings.bioEn}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 pt-2">
                    <a
                      href="#apps-catalog"
                      className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
                    >
                      {isKu ? 'بینینی هەموو ئەپەکان' : 'Explore Applications'}
                    </a>
                    <a
                      href={settings.playStoreDeveloperUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
                    >
                      <span>Google Play Store</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                <div className="lg:col-span-5">
                  {!heroImgFailed ? (
                    <img
                      src={HERO_STUDIO_IMAGE}
                      alt={brandName}
                      referrerPolicy="no-referrer"
                      onError={() => setHeroImgFailed(true)}
                      className="w-full h-64 sm:h-80 lg:h-full object-cover rounded-2xl border border-zinc-200 dark:border-zinc-800"
                    />
                  ) : (
                    <div className="w-full h-64 sm:h-80 lg:h-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 flex flex-col items-center justify-center p-8 text-center">
                      <Globe className="w-10 h-10 text-blue-600 mb-3" />
                      <p className="font-display font-bold text-lg">{brandName}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 4-column summary strip below hero split */}
              <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-6 py-6 border-y border-zinc-200 dark:border-zinc-800">
                <div>
                  <p className="text-2xl sm:text-3xl font-display font-bold tabular-nums text-zinc-900 dark:text-zinc-100">
                    {publishedCount}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    {isKu ? 'ئەپە بڵاوکراوەکان' : 'Published on Google Play'}
                  </p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-display font-bold tabular-nums text-zinc-900 dark:text-zinc-100">
                    {inProgressCount}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    {isKu ? 'لە قۆناغی گەشەپێداندا' : 'In Progress & Upcoming'}
                  </p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-display font-bold tabular-nums text-zinc-900 dark:text-zinc-100">
                    {apps.length}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    {isKu ? 'سەرجەمی ئەپەکان' : 'Total Portfolio Apps'}
                  </p>
                </div>
                <div>
                  <p className="text-sm sm:text-base font-display font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                    {settings.email}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    {isKu ? 'پشتگیری بەکارهێنەران' : 'User Support'}
                  </p>
                </div>
              </div>
            </section>

            {/* Applications Catalog Section */}
            <section id="apps-catalog" className="py-8 sm:py-12 space-y-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                  <h2 className="font-display text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                    {isKu ? 'ئەپەکان و پڕۆژەکان' : 'Applications & Releases'}
                  </h2>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-xl">
                    {isKu
                      ? 'هەموو ئەپە بڵاوکراوەکان و پڕۆژە نوێیەکان لەگەڵ زانیاری تەواو و سیاسەتی نهێنی.'
                      : 'Published Google Play applications alongside active builds and upcoming releases.'}
                  </p>
                </div>

                {/* Filter Controls + Search */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                    {(
                      [
                        { id: 'all', ku: 'هەموو', en: 'All' },
                        { id: 'published', ku: 'بڵاوکراوە', en: 'Published' },
                        { id: 'in_development', ku: 'ژێر کارکردن', en: 'In Progress' },
                        { id: 'upcoming', ku: 'داهاتوو', en: 'Upcoming' },
                      ] as const
                    ).map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setStatusFilter(tab.id)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                          statusFilter === tab.id
                            ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                            : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                        }`}
                      >
                        {isKu ? tab.ku : tab.en}
                      </button>
                    ))}
                  </div>

                  <div className="relative">
                    <Search className="w-4 h-4 text-zinc-400 absolute top-1/2 -translate-y-1/2 start-3 pointer-events-none" />
                    <input
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={isKu ? 'گەڕان...' : 'Search apps...'}
                      className="ps-9 pe-3 py-1.5 text-sm rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>
              </div>

              {filteredApps.length === 0 ? (
                <div className="py-12 text-center border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900">
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {isKu
                      ? 'هیچ ئەپێک نەدۆزرایەوە بەپێی گەڕانەکەت.'
                      : 'No applications match your current filter.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredApps.map((app) => {
                    const title = isKu ? app.titleKu : app.titleEn;
                    const summary = isKu ? app.summaryKu : app.summaryEn;
                    const statusText =
                      app.status === 'published'
                        ? isKu
                          ? 'بڵاوکراوەتەوە'
                          : 'Published'
                        : app.status === 'in_development'
                          ? isKu
                            ? 'لە قۆناغی کارکردندایە'
                            : 'In Development'
                          : isKu
                            ? 'بەم زووانە'
                            : 'Upcoming';

                    return (
                      <article
                        key={app.id}
                        className="flex flex-col justify-between bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 transition-colors hover:border-zinc-300 dark:hover:border-zinc-700"
                      >
                        <div className="space-y-4">
                          <div className="flex items-start justify-between gap-4">
                            <AppArtwork
                              iconUrl={app.iconUrl}
                              title={title}
                              category={app.category}
                              className="w-14 h-14 rounded-xl"
                            />
                            <span className="text-xs font-mono tabular-nums text-zinc-500 dark:text-zinc-400">
                              v{app.version}
                            </span>
                          </div>

                          <div className="space-y-1.5">
                            <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                              <span
                                className={
                                  app.status === 'published'
                                    ? 'text-emerald-700 dark:text-emerald-400 font-medium'
                                    : 'text-amber-700 dark:text-amber-400 font-medium'
                                }
                              >
                                {statusText}
                              </span>
                              <span aria-hidden="true">·</span>
                              <span>{app.category}</span>
                            </div>

                            <h3 className="font-display text-lg font-bold text-zinc-900 dark:text-zinc-100 leading-snug">
                              {title}
                            </h3>
                            <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400 truncate">
                              {app.packageId}
                            </p>
                          </div>

                          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed line-clamp-3">
                            {summary}
                          </p>
                        </div>

                        <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedApp(app);
                              setModalInitialTab('overview');
                            }}
                            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline whitespace-nowrap"
                          >
                            {isKu ? 'زانیاری و سیاسەتی نهێنی' : 'Details & Privacy'}
                          </button>

                          <div className="flex items-center gap-3">
                            {app.playStoreUrl && (
                              <a
                                href={app.playStoreUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 whitespace-nowrap"
                              >
                                <span>Google Play</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}

        {/* PAGE 2: DEDICATED PRIVACY POLICY & DATA SAFETY PAGE */}
        {activePage === 'privacy' && (
          <section className="py-10 sm:py-14 space-y-8 max-w-4xl mx-auto">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => navigateTo('home')}
                className="inline-flex items-center gap-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                <BackArrow className="w-4 h-4" />
                <span>{isKu ? 'گەڕانەوە بۆ ئەپەکان' : 'Back to Apps'}</span>
              </button>
            </div>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-medium text-blue-600 dark:text-blue-400">
                  <Shield className="w-4 h-4" />
                  <span>
                    {brandName} ·{' '}
                    {isKu ? 'یاسایی و پاراستنی نهێنی' : 'Legal & Privacy'}
                  </span>
                </div>
                <h1 className="font-display text-2xl sm:text-4xl font-bold text-zinc-900 dark:text-zinc-100">
                  {activePolicyApp
                    ? isKu
                      ? activePolicyApp.titleKu
                      : activePolicyApp.titleEn
                    : isKu
                      ? 'سیاسەتی پاراستنی نهێنی گشتی'
                      : 'Privacy Policy'}
                </h1>
                {activePolicyApp && (
                  <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
                    {activePolicyApp.packageId}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <select
                  aria-label={isKu ? 'هەڵبژاردنی ئەپ' : 'Select Application'}
                  value={activePolicySlug}
                  onChange={(e) =>
                    navigateTo('privacy', { privacySlug: e.target.value })
                  }
                  className="px-3 py-2 text-xs font-medium rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
                >
                  <option value="all">
                    {isKu
                      ? 'سیاسەتی گشتی هەموو ئەپەکان'
                      : 'Global Studio Privacy Policy'}
                  </option>
                  {apps.map((a) => (
                    <option key={a.id} value={a.slug}>
                      {isKu ? a.titleKu : a.titleEn} ({a.packageId})
                    </option>
                  ))}
                </select>

                <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setPolicyDisplayLang('en')}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                      policyDisplayLang === 'en'
                        ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                        : 'text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    English
                  </button>
                  <button
                    type="button"
                    onClick={() => setPolicyDisplayLang('ku')}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                      policyDisplayLang === 'ku'
                        ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                        : 'text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    کوردی
                  </button>
                </div>
              </div>
            </div>

            {!focusDeletion && (
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8">
                <div
                  dir={policyDisplayLang === 'ku' ? 'rtl' : 'ltr'}
                  className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 whitespace-pre-line"
                >
                  {activePolicyContent}
                </div>
              </div>
            )}

            {/* Data Safety & Account Deletion section on Privacy Page */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 space-y-5">
              <div className="flex items-center gap-2 text-base font-bold text-zinc-900 dark:text-zinc-100">
                <Trash2 className="w-4 h-4 text-blue-600" />
                <h2>
                  {isKu
                    ? 'پاراستنی داتا و سڕینەوەی هەژمار'
                    : 'Data Safety & Account Deletion'}
                </h2>
              </div>

              {activePolicyApp ? (
                <div className="space-y-4 text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  <div>
                    <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1">
                      {isKu ? 'مامەڵەکردن لەگەڵ داتا' : 'Data Handled'}
                    </p>
                    <p>{activePolicyApp.dataCollected}</p>
                  </div>
                  <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800">
                    <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1">
                      {isKu ? 'سڕینەوەی داتا یان هەژمار' : 'Deletion Instructions'}
                    </p>
                    <p>{activePolicyApp.accountDeletionInfo}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  {isKu
                    ? `بۆ داواکردنی سڕینەوەی هەر داتایەک یان هەژمارێک لە هەر کامێک لە ئەپەکانی ${brandName}، دەتوانیت ڕاستەوخۆ ئیمەیڵ بنێریت بۆ ${settings.email}.`
                    : `To request deletion of any account or stored data across ${brandName} applications, please contact ${settings.email}.`}
                </p>
              )}

              {focusDeletion && (
                <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() =>
                      navigateTo('privacy', { privacySlug: activePolicySlug })
                    }
                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {isKu
                      ? 'خوێندنەوەی تەواوی سیاسەتی نهێنی'
                      : 'Read Full Privacy Policy'}
                  </button>
                </div>
              )}
            </div>
          </section>
        )}

        {/* PAGE 3: DEDICATED ABOUT & CONTACT PAGE */}
        {activePage === 'about' && (
          <section className="py-10 sm:py-14 space-y-8 max-w-4xl mx-auto">
            <button
              type="button"
              onClick={() => navigateTo('home')}
              className="inline-flex items-center gap-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              <BackArrow className="w-4 h-4" />
              <span>{isKu ? 'گەڕانەوە بۆ ئەپەکان' : 'Back to Apps'}</span>
            </button>

            <div className="space-y-3">
              <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
                {brandName}
              </p>
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-zinc-100">
                {isKu ? 'دەربارەی ئێمە و پەیوەندی' : 'About & Developer Contact'}
              </h1>
              <p className="text-base text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl">
                {isKu ? settings.bioKu : settings.bioEn}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 space-y-4">
                <div className="flex items-center gap-2 text-xs font-medium text-blue-600 dark:text-blue-400">
                  <UserCheck className="w-4 h-4" />
                  <span>
                    {isKu ? 'گەشەپێدەر و دامەزرێنەر' : 'Lead Developer'}
                  </span>
                </div>
                <h2 className="font-display text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  {isKu ? settings.nameKu : settings.nameEn}
                </h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {isKu ? settings.roleKu : settings.roleEn}
                </p>
                <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
                  <MapPin className="w-4 h-4 text-zinc-400 shrink-0" />
                  <span>{isKu ? settings.locationKu : settings.locationEn}</span>
                </div>
              </div>

              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 space-y-5 flex flex-col justify-between">
                <div className="space-y-2">
                  <h2 className="font-display text-xl font-bold text-zinc-900 dark:text-zinc-100">
                    {isKu ? 'پەیوەندی و پشتگیری' : 'Direct Support'}
                  </h2>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {isKu
                      ? 'بۆ هەر پرسیارێک، پێشنیارێک، یان هاوکاری تەکنیکی لەسەر ئەپەکانمان پەیوەندیمان پێوە بکە.'
                      : 'Reach out anytime for user support, feedback, or app inquiries.'}
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <a
                    href={`mailto:${settings.email}`}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    <span>{settings.email}</span>
                  </a>
                  <div className="grid grid-cols-2 gap-3">
                    <a
                      href={settings.playStoreDeveloperUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      <span>Google Play</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <a
                      href={settings.githubProfileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      <span>GitHub</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Quiet Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-8 mt-12">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 dark:text-zinc-400">
          <p>
            © {new Date().getFullYear()} {brandName} ·{' '}
            {isKu ? settings.locationKu : settings.locationEn}
          </p>
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => navigateTo('home')}
              className="hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              {isKu ? 'ئەپەکان' : 'Apps'}
            </button>
            <button
              type="button"
              onClick={() => navigateTo('privacy', { privacySlug: 'all' })}
              className="hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              {isKu ? 'سیاسەتی نهێنی' : 'Privacy'}
            </button>
            <button
              type="button"
              onClick={() => navigateTo('about')}
              className="hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              {isKu ? 'دەربارە و پەیوەندی' : 'About'}
            </button>
            <button
              type="button"
              onClick={() => setAdminOpen(true)}
              className="hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              {isKu ? 'بەڕێوەبردن' : 'Admin'}
            </button>
          </div>
        </div>
      </footer>

      {/* App Details & Privacy Modal */}
      <AppDetailModal
        app={selectedApp}
        initialTab={modalInitialTab}
        lang={lang}
        settings={settings}
        onClose={() => setSelectedApp(null)}
      />

      {/* Admin Dashboard Modal */}
      {adminOpen && (
        <AdminPanel
          lang={lang}
          user={user}
          apps={apps}
          settings={settings}
          isCloudSeeded={isCloudSeeded}
          onClose={() => setAdminOpen(false)}
        />
      )}
    </div>
  );
}
