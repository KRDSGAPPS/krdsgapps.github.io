import React, { useState } from 'react';
import {
  Check,
  Copy,
  Database,
  Download,
  Edit3,
  LogIn,
  LogOut,
  Plus,
  Save,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { signInWithPopup, signOut, User } from 'firebase/auth';
import {
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import {
  auth,
  db,
  googleProvider,
  handleFirestoreError,
  OperationType,
} from '../firebase';
import {
  ADMIN_EMAIL,
  buildPrivacyPolicyEn,
  buildPrivacyPolicyKu,
  DEFAULT_APPS,
  DEFAULT_DEVELOPER_SETTINGS,
  PRESET_APP_ICONS,
} from '../data/defaultSeed';
import { AppItem, AppStatus, DeveloperSettings, Language } from '../types';
import { AppArtwork } from './AppArtwork';

interface AdminPanelProps {
  lang: Language;
  user: User | null;
  apps: AppItem[];
  settings: DeveloperSettings;
  isCloudSeeded: boolean;
  onClose: () => void;
}

const emptyAppDraft = (nextOrder: number): AppItem => ({
  id: '',
  slug: '',
  titleKu: '',
  titleEn: '',
  packageId: '',
  status: 'in_development',
  category: 'Mobile Utility',
  summaryKu: '',
  summaryEn: '',
  playStoreUrl: '',
  githubUrl: '',
  iconUrl: '',
  privacyPolicyEn: '',
  privacyPolicyKu: '',
  accountDeletionInfo:
    'Users can clear all local app data from Android Settings or contact shakirgoran@gmail.com to delete any stored records.',
  dataCollected:
    'Only essential app preferences and user-initiated entries are processed. No personal data is sold.',
  version: '1.0.0',
  sortOrder: nextOrder,
});

function sanitizeSlug(raw: string): string {
  return raw
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  lang,
  user,
  apps,
  settings,
  isCloudSeeded,
  onClose,
}) => {
  const isKu = lang === 'ku';
  const [adminTab, setAdminTab] = useState<'apps' | 'profile' | 'console'>('apps');
  const [editingApp, setEditingApp] = useState<AppItem | null>(null);
  const [isNewApp, setIsNewApp] = useState(false);
  const [profileDraft, setProfileDraft] = useState<DeveloperSettings>(settings);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(
    null
  );
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const isAuthorizedAdmin =
    Boolean(user?.emailVerified) &&
    user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  const notify = (type: 'ok' | 'err', text: string) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleSignIn = async () => {
    try {
      setBusy(true);
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      notify(
        'err',
        err instanceof Error
          ? err.message
          : isKu
            ? 'چوونەژوورەوە سەرکەوتوو نەبوو'
            : 'Sign-in failed.'
      );
    } finally {
      setBusy(false);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setEditingApp(null);
  };

  const handleSeedCloud = async () => {
    if (!user || !isAuthorizedAdmin) return;
    try {
      setBusy(true);
      const batch = writeBatch(db);
      const settingsRef = doc(db, 'settings', 'profile');
      batch.set(settingsRef, {
        brandNameKu: settings.brandNameKu.slice(0, 80),
        brandNameEn: settings.brandNameEn.slice(0, 80),
        heroTitleKu: settings.heroTitleKu.slice(0, 160),
        heroTitleEn: settings.heroTitleEn.slice(0, 160),
        nameKu: settings.nameKu.slice(0, 120),
        nameEn: settings.nameEn.slice(0, 120),
        roleKu: settings.roleKu.slice(0, 160),
        roleEn: settings.roleEn.slice(0, 160),
        bioKu: settings.bioKu.slice(0, 1200),
        bioEn: settings.bioEn.slice(0, 1200),
        locationKu: settings.locationKu.slice(0, 160),
        locationEn: settings.locationEn.slice(0, 160),
        email: settings.email.slice(0, 120),
        playStoreDeveloperUrl: settings.playStoreDeveloperUrl.slice(0, 400),
        githubProfileUrl: settings.githubProfileUrl.slice(0, 400),
        appAdsTxt: settings.appAdsTxt.slice(0, 4000),
        globalPrivacyPolicyEn: settings.globalPrivacyPolicyEn.slice(0, 15000),
        globalPrivacyPolicyKu: settings.globalPrivacyPolicyKu.slice(0, 15000),
        ownerUid: user.uid,
        updatedAt: serverTimestamp(),
      });

      DEFAULT_APPS.forEach((item) => {
        const ref = doc(db, 'apps', item.id);
        batch.set(ref, {
          slug: item.slug,
          titleKu: item.titleKu.slice(0, 120),
          titleEn: item.titleEn.slice(0, 120),
          packageId: item.packageId.slice(0, 150),
          status: item.status,
          category: item.category.slice(0, 60),
          summaryKu: item.summaryKu.slice(0, 600),
          summaryEn: item.summaryEn.slice(0, 600),
          playStoreUrl: item.playStoreUrl.slice(0, 400),
          githubUrl: item.githubUrl.slice(0, 400),
          iconUrl: item.iconUrl.slice(0, 500),
          privacyPolicyEn: item.privacyPolicyEn.slice(0, 12000),
          privacyPolicyKu: item.privacyPolicyKu.slice(0, 12000),
          accountDeletionInfo: item.accountDeletionInfo.slice(0, 2000),
          dataCollected: item.dataCollected.slice(0, 1000),
          version: item.version.slice(0, 30),
          sortOrder: Number(item.sortOrder) || 1,
          ownerUid: user.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      });

      await batch.commit();
      notify(
        'ok',
        isKu
          ? 'هەموو ٦ ئەپەکە و زانیاری گەشەپێدەر لە داتابەیس پاشەکەوت کران.'
          : 'All 6 apps and developer profile saved to cloud database.'
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'apps/seed');
    } finally {
      setBusy(false);
    }
  };

  const handleSaveApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingApp || !user || !isAuthorizedAdmin) return;

    const cleanSlug = sanitizeSlug(editingApp.slug || editingApp.titleEn);
    if (cleanSlug.length < 2) {
      notify(
        'err',
        isKu
          ? 'تکایە ناونیشانی ئینگلیزی یان slug بنووسە (بەلایەنی کەم ٢ پیتی ئینگلیزی).'
          : 'Please provide a valid URL slug (at least 2 lowercase letters/numbers).'
      );
      return;
    }

    const titleEn = (editingApp.titleEn || editingApp.titleKu).trim().slice(0, 120);
    const titleKu = (editingApp.titleKu || editingApp.titleEn).trim().slice(0, 120);
    if (!titleEn || !titleKu) {
      notify(
        'err',
        isKu ? 'تکایە ناوی ئەپ بنووسە.' : 'Application title is required.'
      );
      return;
    }

    const docId = isNewApp ? cleanSlug : editingApp.id || cleanSlug;
    const path = `apps/${docId}`;

    try {
      setBusy(true);
      const appRef = doc(db, 'apps', docId);
      const existingSnap = await getDoc(appRef);

      const updatableFields = {
        slug: cleanSlug,
        titleKu,
        titleEn,
        packageId: editingApp.packageId.trim().slice(0, 150),
        status: editingApp.status,
        category: (editingApp.category.trim() || 'Mobile App').slice(0, 60),
        summaryKu: editingApp.summaryKu.trim().slice(0, 600),
        summaryEn: editingApp.summaryEn.trim().slice(0, 600),
        playStoreUrl: editingApp.playStoreUrl.trim().slice(0, 400),
        githubUrl: editingApp.githubUrl.trim().slice(0, 400),
        iconUrl: editingApp.iconUrl.trim().slice(0, 500),
        privacyPolicyEn: (
          editingApp.privacyPolicyEn.trim() ||
          buildPrivacyPolicyEn(
            titleEn,
            editingApp.packageId || cleanSlug,
            profileDraft.nameEn,
            profileDraft.email,
            profileDraft.locationEn,
            editingApp.dataCollected
          )
        ).slice(0, 12000),
        privacyPolicyKu: (
          editingApp.privacyPolicyKu.trim() ||
          buildPrivacyPolicyKu(
            titleKu,
            editingApp.packageId || cleanSlug,
            profileDraft.nameKu,
            profileDraft.email,
            profileDraft.locationKu,
            editingApp.dataCollected
          )
        ).slice(0, 12000),
        accountDeletionInfo: editingApp.accountDeletionInfo.trim().slice(0, 2000),
        dataCollected: editingApp.dataCollected.trim().slice(0, 1000),
        version: (editingApp.version.trim() || '1.0.0').slice(0, 30),
        sortOrder: Number(editingApp.sortOrder) || apps.length + 1,
        updatedAt: serverTimestamp(),
      };

      if (existingSnap.exists()) {
        await updateDoc(appRef, updatableFields);
      } else {
        await setDoc(appRef, {
          ...updatableFields,
          ownerUid: user.uid,
          createdAt: serverTimestamp(),
        });
      }

      setEditingApp(null);
      setIsNewApp(false);
      notify(
        'ok',
        isKu ? 'ئەپەکە بە سەرکەوتوویی پاشەکەوت کرا.' : 'Application saved to cloud.'
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteApp = async (appId: string) => {
    if (!user || !isAuthorizedAdmin) return;
    try {
      setBusy(true);
      await deleteDoc(doc(db, 'apps', appId));
      setConfirmDeleteId(null);
      notify('ok', isKu ? 'ئەپەکە سڕایەوە.' : 'Application removed.');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `apps/${appId}`);
    } finally {
      setBusy(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !isAuthorizedAdmin) return;
    try {
      setBusy(true);
      const profileRef = doc(db, 'settings', 'profile');
      const existingProfile = await getDoc(profileRef);
      const updatableProfile = {
        brandNameKu: (profileDraft.brandNameKu || 'SG Apps').trim().slice(0, 80),
        brandNameEn: (profileDraft.brandNameEn || 'SG Apps').trim().slice(0, 80),
        heroTitleKu: (profileDraft.heroTitleKu || DEFAULT_DEVELOPER_SETTINGS.heroTitleKu).trim().slice(0, 160),
        heroTitleEn: (profileDraft.heroTitleEn || DEFAULT_DEVELOPER_SETTINGS.heroTitleEn).trim().slice(0, 160),
        nameKu: profileDraft.nameKu.trim().slice(0, 120),
        nameEn: profileDraft.nameEn.trim().slice(0, 120),
        roleKu: profileDraft.roleKu.trim().slice(0, 160),
        roleEn: profileDraft.roleEn.trim().slice(0, 160),
        bioKu: profileDraft.bioKu.trim().slice(0, 1200),
        bioEn: profileDraft.bioEn.trim().slice(0, 1200),
        locationKu: profileDraft.locationKu.trim().slice(0, 160),
        locationEn: profileDraft.locationEn.trim().slice(0, 160),
        email: profileDraft.email.trim().slice(0, 120),
        playStoreDeveloperUrl: profileDraft.playStoreDeveloperUrl.trim().slice(0, 400),
        githubProfileUrl: profileDraft.githubProfileUrl.trim().slice(0, 400),
        appAdsTxt: profileDraft.appAdsTxt.slice(0, 4000),
        globalPrivacyPolicyEn: profileDraft.globalPrivacyPolicyEn.slice(0, 15000),
        globalPrivacyPolicyKu: profileDraft.globalPrivacyPolicyKu.slice(0, 15000),
        updatedAt: serverTimestamp(),
      };

      if (existingProfile.exists()) {
        await updateDoc(profileRef, updatableProfile);
      } else {
        await setDoc(profileRef, {
          ...updatableProfile,
          ownerUid: user.uid,
        });
      }
      notify(
        'ok',
        isKu
          ? 'زانیاری گەشەپێدەر و ڕێکخستنەکان پاشەکەوت کران.'
          : 'Developer settings saved.'
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'settings/profile');
    } finally {
      setBusy(false);
    }
  };

  const handleGeneratePolicies = () => {
    if (!editingApp) return;
    const enTitle = editingApp.titleEn || editingApp.titleKu || 'My Application';
    const kuTitle = editingApp.titleKu || editingApp.titleEn || 'ئەپەکەم';
    const pkg = editingApp.packageId || 'com.shakirgoran.app';
    setEditingApp({
      ...editingApp,
      privacyPolicyEn: buildPrivacyPolicyEn(
        enTitle,
        pkg,
        profileDraft.nameEn,
        profileDraft.email,
        profileDraft.locationEn,
        editingApp.dataCollected
      ),
      privacyPolicyKu: buildPrivacyPolicyKu(
        kuTitle,
        pkg,
        profileDraft.nameKu,
        profileDraft.email,
        profileDraft.locationKu,
        editingApp.dataCollected
      ),
    });
  };

  const copyText = async (key: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      // ignore
    }
  };

  const downloadFile = (filename: string, content: string, mime = 'text/plain') => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="w-full max-w-5xl max-h-[92vh] flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              {isKu
                ? 'بەشی بەڕێوەبردنی گەشەپێدەر'
                : 'Developer Management Console'}
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {isKu
                ? 'زیادکردن و دەستکاریکردنی ئەپەکان و زانیاری گۆگڵ کۆنسوڵ بەبێ گەڕانەوە بۆ کۆدی GitHub'
                : 'Manage applications, privacy policies, and Play Console links without editing GitHub code'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {user && (
              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{isKu ? 'دەرچوون' : 'Sign Out'}</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label={isKu ? 'داخستن' : 'Close'}
              className="p-2 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Auth Gate */}
        {!user ? (
          <div className="p-8 sm:p-12 flex flex-col items-center text-center max-w-md mx-auto space-y-5">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <LogIn className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                {isKu
                  ? 'چوونەژوورەوەی بەڕێوەبەر'
                  : 'Administrator Sign-In Required'}
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {isKu
                  ? `بۆ دەستکاریکردن و زیادکردنی ئەپەکان، بە هەژماری گۆگڵی فەرمی (${ADMIN_EMAIL}) بچۆ ژوورەوە.`
                  : `Sign in with the verified developer Google account (${ADMIN_EMAIL}) to edit or publish updates.`}
              </p>
            </div>
            <button
              type="button"
              disabled={busy}
              onClick={handleSignIn}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 rounded-lg transition-colors"
            >
              <LogIn className="w-4 h-4" />
              <span>
                {isKu ? 'چوونەژوورەوە بە Google' : 'Sign in with Google'}
              </span>
            </button>
          </div>
        ) : !isAuthorizedAdmin ? (
          <div className="p-8 sm:p-12 flex flex-col items-center text-center max-w-md mx-auto space-y-4">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              {isKu ? 'مۆڵەتی بەڕێوەبەرت نییە' : 'Access Restricted'}
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {isKu
                ? `ئێستا بە (${user.email}) چوویتەتە ژوورەوە. تەنها هەژماری (${ADMIN_EMAIL}) دەتوانێت گۆڕانکاری بکات.`
                : `Signed in as ${user.email}. Only ${ADMIN_EMAIL} is authorized to modify this portal.`}
            </p>
            <button
              type="button"
              onClick={handleSignOut}
              className="px-4 py-2 text-sm font-medium border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              {isKu ? 'گۆڕینی هەژمار' : 'Switch Account'}
            </button>
          </div>
        ) : (
          <>
            {/* Navigation Tabs */}
            <div className="px-6 pt-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/40 flex flex-wrap items-center justify-between gap-3 pb-3">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setAdminTab('apps');
                    setEditingApp(null);
                  }}
                  className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                    adminTab === 'apps'
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                  }`}
                >
                  {isKu
                    ? `ئەپەکان (${apps.length})`
                    : `Applications (${apps.length})`}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAdminTab('profile');
                    setProfileDraft(settings);
                  }}
                  className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                    adminTab === 'profile'
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                  }`}
                >
                  {isKu ? 'پرۆفایل و app-ads.txt' : 'Profile & app-ads.txt'}
                </button>
                <button
                  type="button"
                  onClick={() => setAdminTab('console')}
                  className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                    adminTab === 'console'
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                  }`}
                >
                  {isKu ? 'لینکەکانی Play Console' : 'Play Console URLs'}
                </button>
              </div>

              {!isCloudSeeded && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={handleSeedCloud}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>
                    {isKu
                      ? 'خەزنکردنی ئەپە بنەڕەتییەکان لە کلاود'
                      : 'Save Initial 6 Apps to Cloud'}
                  </span>
                </button>
              )}
            </div>

            {feedback && (
              <div
                className={`mx-6 mt-4 px-4 py-2.5 rounded-lg text-xs font-medium border ${
                  feedback.type === 'ok'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900'
                    : 'bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 border-red-200 dark:border-red-900'
                }`}
              >
                {feedback.text}
              </div>
            )}

            {/* Tab Content */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {adminTab === 'apps' && !editingApp && (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      {isKu
                        ? 'ئەپێک هەڵبژێرە بۆ دەستکاریکردن یان ئەپێکی نوێ زیاد بکە.'
                        : 'Select any app to update its Play Store link, status, or privacy policy, or add a new release.'}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setIsNewApp(true);
                        setEditingApp(emptyAppDraft(apps.length + 1));
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{isKu ? 'زیادکردنی ئەپی نوێ' : 'Add New App'}</span>
                    </button>
                  </div>

                  <div className="divide-y divide-zinc-200 dark:divide-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                    {apps.map((item) => (
                      <div
                        key={item.id}
                        className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white dark:bg-zinc-900"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <AppArtwork
                            iconUrl={item.iconUrl}
                            title={isKu ? item.titleKu : item.titleEn}
                            category={item.category}
                            className="w-12 h-12 rounded-lg"
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                              {isKu ? item.titleKu : item.titleEn}
                            </p>
                            <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400 truncate">
                              {item.packageId} · {item.status} · v{item.version}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setIsNewApp(false);
                              setEditingApp({ ...item });
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>{isKu ? 'دەستکاری' : 'Edit'}</span>
                          </button>

                          {isCloudSeeded &&
                            (confirmDeleteId === item.id ? (
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  disabled={busy}
                                  onClick={() => handleDeleteApp(item.id)}
                                  className="px-2.5 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg"
                                >
                                  {isKu ? 'دڵنیام' : 'Confirm'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteId(null)}
                                  className="px-2.5 py-1.5 text-xs font-medium border border-zinc-200 dark:border-zinc-700 rounded-lg"
                                >
                                  {isKu ? 'پاشگەزبوونەوە' : 'Cancel'}
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(item.id)}
                                aria-label={isKu ? 'سڕینەوە' : 'Delete'}
                                className="p-1.5 text-zinc-500 hover:text-red-600 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {adminTab === 'apps' && editingApp && (
                <form onSubmit={handleSaveApp} className="space-y-5">
                  <div className="flex items-center justify-between gap-4 pb-3 border-b border-zinc-200 dark:border-zinc-800">
                    <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                      {isNewApp
                        ? isKu
                          ? 'ئەپێکی نوێ زیاد بکە'
                          : 'Add New Application'
                        : isKu
                          ? `دەستکاری: ${editingApp.titleKu}`
                          : `Edit: ${editingApp.titleEn}`}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setEditingApp(null)}
                      className="text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                    >
                      {isKu ? 'گەڕانەوە بۆ لیست' : 'Back to List'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="block space-y-1.5">
                      <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                        {isKu ? 'ناوی ئەپ (کوردی)' : 'App Title (Kurdish)'}
                      </span>
                      <input
                        type="text"
                        required
                        maxLength={120}
                        value={editingApp.titleKu}
                        onChange={(e) =>
                          setEditingApp({ ...editingApp, titleKu: e.target.value })
                        }
                        className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                      />
                    </label>

                    <label className="block space-y-1.5">
                      <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                        {isKu ? 'ناوی ئەپ (ئینگلیزی)' : 'App Title (English)'}
                      </span>
                      <input
                        type="text"
                        required
                        maxLength={120}
                        value={editingApp.titleEn}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditingApp({
                            ...editingApp,
                            titleEn: val,
                            slug: isNewApp ? sanitizeSlug(val) : editingApp.slug,
                          });
                        }}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                      />
                    </label>

                    <label className="block space-y-1.5">
                      <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                        URL Slug (for Privacy Policy URL)
                      </span>
                      <input
                        type="text"
                        required
                        maxLength={80}
                        dir="ltr"
                        value={editingApp.slug}
                        onChange={(e) =>
                          setEditingApp({
                            ...editingApp,
                            slug: sanitizeSlug(e.target.value),
                          })
                        }
                        placeholder="tendrustim"
                        className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                      />
                    </label>

                    <label className="block space-y-1.5">
                      <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                        Package ID (Google Play)
                      </span>
                      <input
                        type="text"
                        maxLength={150}
                        dir="ltr"
                        value={editingApp.packageId}
                        onChange={(e) =>
                          setEditingApp({ ...editingApp, packageId: e.target.value })
                        }
                        placeholder="com.shakirgoran.myapp"
                        className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                      />
                    </label>

                    <label className="block space-y-1.5">
                      <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                        {isKu ? 'دۆخی ئەپ' : 'Release Status'}
                      </span>
                      <select
                        value={editingApp.status}
                        onChange={(e) =>
                          setEditingApp({
                            ...editingApp,
                            status: e.target.value as AppStatus,
                          })
                        }
                        className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                      >
                        <option value="published">
                          {isKu ? 'بڵاوکراوەتەوە (Published)' : 'Published'}
                        </option>
                        <option value="in_development">
                          {isKu
                            ? 'لە قۆناغی کارکردندایە (In Development)'
                            : 'In Development'}
                        </option>
                        <option value="upcoming">
                          {isKu ? 'بەم زووانە (Upcoming)' : 'Upcoming'}
                        </option>
                      </select>
                    </label>

                    <div className="grid grid-cols-2 gap-3">
                      <label className="block space-y-1.5">
                        <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                          {isKu ? 'جۆر' : 'Category'}
                        </span>
                        <input
                          type="text"
                          required
                          maxLength={60}
                          value={editingApp.category}
                          onChange={(e) =>
                            setEditingApp({ ...editingApp, category: e.target.value })
                          }
                          className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                        />
                      </label>
                      <label className="block space-y-1.5">
                        <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                          {isKu ? 'وەشان' : 'Version'}
                        </span>
                        <input
                          type="text"
                          maxLength={30}
                          dir="ltr"
                          value={editingApp.version}
                          onChange={(e) =>
                            setEditingApp({ ...editingApp, version: e.target.value })
                          }
                          className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                        />
                      </label>
                    </div>

                    <label className="block space-y-1.5">
                      <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                        Google Play URL
                      </span>
                      <input
                        type="url"
                        maxLength={400}
                        dir="ltr"
                        value={editingApp.playStoreUrl}
                        onChange={(e) =>
                          setEditingApp({ ...editingApp, playStoreUrl: e.target.value })
                        }
                        className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                      />
                    </label>

                    <label className="block space-y-1.5">
                      <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                        GitHub Repo URL
                      </span>
                      <input
                        type="url"
                        maxLength={400}
                        dir="ltr"
                        value={editingApp.githubUrl}
                        onChange={(e) =>
                          setEditingApp({ ...editingApp, githubUrl: e.target.value })
                        }
                        className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                      />
                    </label>
                  </div>

                  {/* Icon Picker */}
                  <div className="space-y-2">
                    <label className="block space-y-1.5">
                      <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                        {isKu
                          ? 'لینکی ئایکۆن (یان یەکێک لە وێنە ئامادەکان هەڵبژێرە)'
                          : 'App Icon URL (or select a preset artwork)'}
                      </span>
                      <input
                        type="text"
                        maxLength={500}
                        dir="ltr"
                        value={editingApp.iconUrl}
                        onChange={(e) =>
                          setEditingApp({ ...editingApp, iconUrl: e.target.value })
                        }
                        className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                      />
                    </label>
                    <div className="flex flex-wrap items-center gap-2">
                      {PRESET_APP_ICONS.map((preset) => (
                        <button
                          key={preset.url}
                          type="button"
                          onClick={() =>
                            setEditingApp({ ...editingApp, iconUrl: preset.url })
                          }
                          className={`inline-flex items-center gap-2 px-2.5 py-1 text-xs rounded-lg border transition-colors ${
                            editingApp.iconUrl === preset.url
                              ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300'
                              : 'border-zinc-200 dark:border-zinc-700'
                          }`}
                        >
                          <img
                            src={preset.url}
                            alt={preset.label}
                            className="w-5 h-5 rounded object-cover"
                          />
                          <span>{preset.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="block space-y-1.5">
                      <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                        {isKu ? 'وەسفی کورت (کوردی)' : 'Summary (Kurdish)'}
                      </span>
                      <textarea
                        rows={3}
                        maxLength={600}
                        value={editingApp.summaryKu}
                        onChange={(e) =>
                          setEditingApp({ ...editingApp, summaryKu: e.target.value })
                        }
                        className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                      />
                    </label>

                    <label className="block space-y-1.5">
                      <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                        {isKu ? 'وەسفی کورت (ئینگلیزی)' : 'Summary (English)'}
                      </span>
                      <textarea
                        rows={3}
                        maxLength={600}
                        dir="ltr"
                        value={editingApp.summaryEn}
                        onChange={(e) =>
                          setEditingApp({ ...editingApp, summaryEn: e.target.value })
                        }
                        className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                      />
                    </label>

                    <label className="block space-y-1.5">
                      <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                        {isKu
                          ? 'پوختەی داتای کۆکراوە (Play Console Data Safety)'
                          : 'Data Handled Summary'}
                      </span>
                      <textarea
                        rows={2}
                        maxLength={1000}
                        value={editingApp.dataCollected}
                        onChange={(e) =>
                          setEditingApp({
                            ...editingApp,
                            dataCollected: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                      />
                    </label>

                    <label className="block space-y-1.5">
                      <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                        {isKu
                          ? 'ڕێنمایی سڕینەوەی هەژمار و داتا'
                          : 'Account & Data Deletion Disclosure'}
                      </span>
                      <textarea
                        rows={2}
                        maxLength={2000}
                        value={editingApp.accountDeletionInfo}
                        onChange={(e) =>
                          setEditingApp({
                            ...editingApp,
                            accountDeletionInfo: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                      />
                    </label>
                  </div>

                  {/* Privacy Policy Editor */}
                  <div className="space-y-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {isKu
                          ? 'سیاسەتی پاراستنی نهێنی (Privacy Policy)'
                          : 'App Privacy Policy'}
                      </span>
                      <button
                        type="button"
                        onClick={handleGeneratePolicies}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                        <span>
                          {isKu
                            ? 'ئامادەکردنی ستانداردی گۆگڵ پلەی'
                            : 'Auto-Fill Standard Play Policy'}
                        </span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <label className="block space-y-1.5">
                        <span className="text-xs text-zinc-500">English Policy</span>
                        <textarea
                          rows={7}
                          maxLength={12000}
                          dir="ltr"
                          value={editingApp.privacyPolicyEn}
                          onChange={(e) =>
                            setEditingApp({
                              ...editingApp,
                              privacyPolicyEn: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 text-xs leading-relaxed rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                        />
                      </label>
                      <label className="block space-y-1.5">
                        <span className="text-xs text-zinc-500">سیاسەتی کوردی</span>
                        <textarea
                          rows={7}
                          maxLength={12000}
                          value={editingApp.privacyPolicyKu}
                          onChange={(e) =>
                            setEditingApp({
                              ...editingApp,
                              privacyPolicyKu: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 text-xs leading-relaxed rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setEditingApp(null)}
                      className="px-4 py-2 text-sm font-medium border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      {isKu ? 'پاشگەزبوونەوە' : 'Cancel'}
                    </button>
                    <button
                      type="submit"
                      disabled={busy}
                      className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 rounded-lg"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isKu ? 'پاشەکەوتکردن' : 'Save Application'}</span>
                    </button>
                  </div>
                </form>
              )}

              {adminTab === 'profile' && (
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="block space-y-1.5">
                      <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                        {isKu ? 'ناوی براند / وێبسایت (کوردی)' : 'Website Brand Name (Kurdish)'}
                      </span>
                      <input
                        type="text"
                        required
                        maxLength={80}
                        value={profileDraft.brandNameKu}
                        onChange={(e) =>
                          setProfileDraft({ ...profileDraft, brandNameKu: e.target.value })
                        }
                        className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                      />
                    </label>
                    <label className="block space-y-1.5">
                      <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                        {isKu ? 'ناوی براند / وێبسایت (ئینگلیزی)' : 'Website Brand Name (English)'}
                      </span>
                      <input
                        type="text"
                        required
                        maxLength={80}
                        dir="ltr"
                        value={profileDraft.brandNameEn}
                        onChange={(e) =>
                          setProfileDraft({ ...profileDraft, brandNameEn: e.target.value })
                        }
                        className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                      />
                    </label>
                    <label className="block space-y-1.5">
                      <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                        {isKu ? 'مانشێتی سەرەکی پەڕە (کوردی)' : 'Hero Headline (Kurdish)'}
                      </span>
                      <input
                        type="text"
                        required
                        maxLength={160}
                        value={profileDraft.heroTitleKu}
                        onChange={(e) =>
                          setProfileDraft({ ...profileDraft, heroTitleKu: e.target.value })
                        }
                        className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                      />
                    </label>
                    <label className="block space-y-1.5">
                      <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                        {isKu ? 'مانشێتی سەرەکی پەڕە (ئینگلیزی)' : 'Hero Headline (English)'}
                      </span>
                      <input
                        type="text"
                        required
                        maxLength={160}
                        dir="ltr"
                        value={profileDraft.heroTitleEn}
                        onChange={(e) =>
                          setProfileDraft({ ...profileDraft, heroTitleEn: e.target.value })
                        }
                        className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                      />
                    </label>
                    <label className="block space-y-1.5">
                      <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                        {isKu ? 'ناوی گەشەپێدەر لە دەربارە و یاسادا (کوردی)' : 'Developer Legal Name (Kurdish)'}
                      </span>
                      <input
                        type="text"
                        required
                        maxLength={120}
                        value={profileDraft.nameKu}
                        onChange={(e) =>
                          setProfileDraft({ ...profileDraft, nameKu: e.target.value })
                        }
                        className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                      />
                    </label>
                    <label className="block space-y-1.5">
                      <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                        {isKu ? 'ناوی گەشەپێدەر لە دەربارە و یاسادا (ئینگلیزی)' : 'Developer Legal Name (English)'}
                      </span>
                      <input
                        type="text"
                        required
                        maxLength={120}
                        dir="ltr"
                        value={profileDraft.nameEn}
                        onChange={(e) =>
                          setProfileDraft({ ...profileDraft, nameEn: e.target.value })
                        }
                        className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                      />
                    </label>
                    <label className="block space-y-1.5">
                      <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                        {isKu ? 'ناونیشان (کوردی)' : 'Location (Kurdish)'}
                      </span>
                      <input
                        type="text"
                        maxLength={160}
                        value={profileDraft.locationKu}
                        onChange={(e) =>
                          setProfileDraft({
                            ...profileDraft,
                            locationKu: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                      />
                    </label>
                    <label className="block space-y-1.5">
                      <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                        {isKu ? 'ناونیشان (ئینگلیزی)' : 'Location (English)'}
                      </span>
                      <input
                        type="text"
                        maxLength={160}
                        dir="ltr"
                        value={profileDraft.locationEn}
                        onChange={(e) =>
                          setProfileDraft({
                            ...profileDraft,
                            locationEn: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                      />
                    </label>
                    <label className="block space-y-1.5">
                      <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                        {isKu ? 'ئیمەیڵی گەشەپێدەر' : 'Support Email'}
                      </span>
                      <input
                        type="email"
                        required
                        maxLength={120}
                        dir="ltr"
                        value={profileDraft.email}
                        onChange={(e) =>
                          setProfileDraft({ ...profileDraft, email: e.target.value })
                        }
                        className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                      />
                    </label>
                    <label className="block space-y-1.5">
                      <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                        Google Play Developer URL
                      </span>
                      <input
                        type="url"
                        maxLength={400}
                        dir="ltr"
                        value={profileDraft.playStoreDeveloperUrl}
                        onChange={(e) =>
                          setProfileDraft({
                            ...profileDraft,
                            playStoreDeveloperUrl: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                      />
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="block space-y-1.5">
                      <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                        {isKu ? 'پێناسە (کوردی)' : 'Bio (Kurdish)'}
                      </span>
                      <textarea
                        rows={3}
                        maxLength={1200}
                        value={profileDraft.bioKu}
                        onChange={(e) =>
                          setProfileDraft({ ...profileDraft, bioKu: e.target.value })
                        }
                        className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                      />
                    </label>
                    <label className="block space-y-1.5">
                      <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                        {isKu ? 'پێناسە (ئینگلیزی)' : 'Bio (English)'}
                      </span>
                      <textarea
                        rows={3}
                        maxLength={1200}
                        dir="ltr"
                        value={profileDraft.bioEn}
                        onChange={(e) =>
                          setProfileDraft({ ...profileDraft, bioEn: e.target.value })
                        }
                        className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                      />
                    </label>
                  </div>

                  <label className="block space-y-1.5">
                    <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                      app-ads.txt (AdMob / Play Console)
                    </span>
                    <textarea
                      rows={4}
                      maxLength={4000}
                      dir="ltr"
                      value={profileDraft.appAdsTxt}
                      onChange={(e) =>
                        setProfileDraft({ ...profileDraft, appAdsTxt: e.target.value })
                      }
                      className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                    />
                  </label>

                  <div className="flex items-center justify-between pt-3 border-t border-zinc-200 dark:border-zinc-800">
                    <button
                      type="button"
                      onClick={() =>
                        setProfileDraft(DEFAULT_DEVELOPER_SETTINGS)
                      }
                      className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                    >
                      {isKu ? 'گەڕاندنەوە بۆ بنەڕەتی' : 'Reset to Defaults'}
                    </button>
                    <button
                      type="submit"
                      disabled={busy}
                      className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 rounded-lg"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isKu ? 'پاشەکەوتکردن' : 'Save Profile'}</span>
                    </button>
                  </div>
                </form>
              )}

              {adminTab === 'console' && (
                <div className="space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      {isKu
                        ? 'ئەم لینکانە ڕاستەوخۆ کۆپی بکە و لە Google Play Console دایانبنێ:'
                        : 'Copy any link below directly into Google Play Console:'}
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        downloadFile('app-ads.txt', settings.appAdsTxt)
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download app-ads.txt</span>
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {[
                      {
                        label: 'Developer Website URL',
                        url: origin,
                      },
                      {
                        label: 'Global Privacy Policy URL',
                        url: `${origin}/?privacy=all`,
                      },
                      {
                        label: 'Support Email',
                        url: settings.email,
                      },
                      {
                        label: 'app-ads.txt URL (Required Public for AdMob Crawler)',
                        url: `${origin}/app-ads.txt`,
                      },
                      ...apps.flatMap((item) => [
                        {
                          label: `Privacy Policy · ${item.titleEn}`,
                          url: `${origin}/?privacy=${item.slug}`,
                        },
                        {
                          label: `Account & Data Deletion · ${item.titleEn}`,
                          url: `${origin}/?deletion=${item.slug}`,
                        },
                      ]),
                    ].map((row) => (
                      <div
                        key={row.label}
                        className="flex items-center justify-between gap-3 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800"
                      >
                        <div className="min-w-0">
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            {row.label}
                          </p>
                          <p
                            dir="ltr"
                            className="text-xs font-mono text-zinc-900 dark:text-zinc-100 truncate"
                          >
                            {row.url}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyText(row.label, row.url)}
                          className="px-3 py-1.5 text-xs font-medium border border-zinc-200 dark:border-zinc-700 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-1.5 shrink-0"
                        >
                          {copiedKey === row.label ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span>{isKu ? 'کۆپی کرا' : 'Copied'}</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>{isKu ? 'کۆپی' : 'Copy'}</span>
                            </>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
