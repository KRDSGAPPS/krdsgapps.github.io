import React, { useEffect, useState } from 'react';
import { ExternalLink, Image as ImageIcon, MessageSquarePlus, Shield, Trash2, X } from 'lucide-react';
import { AppItem, DeveloperSettings, Language } from '../types';
import { AppArtwork } from './AppArtwork';

interface AppDetailModalProps {
  app: AppItem | null;
  initialTab?: 'overview' | 'privacy' | 'deletion';
  lang: Language;
  settings: DeveloperSettings;
  onRequestProject?: () => void;
  onClose: () => void;
}

export const AppDetailModal: React.FC<AppDetailModalProps> = ({
  app,
  initialTab = 'overview',
  lang,
  settings,
  onRequestProject,
  onClose,
}) => {
  const [tab, setTab] = useState<'overview' | 'privacy' | 'deletion'>(initialTab);
  const [policyLang, setPolicyLang] = useState<Language>(lang === 'ku' ? 'en' : 'en');
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  useEffect(() => {
    setTab(initialTab);
    setLightboxSrc(null);
  }, [initialTab, app?.id]);

  useEffect(() => {
    if (!app) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (lightboxSrc) {
          setLightboxSrc(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [app, lightboxSrc, onClose]);

  if (!app) return null;

  const isKu = lang === 'ku';
  const title = isKu ? app.titleKu : app.titleEn;
  const summary = isKu ? app.summaryKu : app.summaryEn;
  const statusLabel =
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="app-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl max-h-[90vh] flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 p-6 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-4 min-w-0">
            <AppArtwork
              iconUrl={app.iconUrl}
              title={title}
              category={app.category}
              className="w-16 h-16 rounded-xl"
            />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                <span
                  className={
                    app.status === 'published'
                      ? 'text-emerald-700 dark:text-emerald-400 font-medium'
                      : 'text-amber-700 dark:text-amber-400 font-medium'
                  }
                >
                  {statusLabel}
                </span>
                <span aria-hidden="true">·</span>
                <span>{app.category}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">v{app.version}</span>
              </div>
              <h2
                id="app-modal-title"
                className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1 truncate"
              >
                {title}
              </h2>
              <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                {app.packageId}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={isKu ? 'داخستن' : 'Close'}
            className="p-2 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Segmented tabs */}
        <div className="px-6 pt-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/40">
          <div className="flex items-center gap-1 overflow-x-auto pb-3">
            <button
              type="button"
              onClick={() => setTab('overview')}
              className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                tab === 'overview'
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              {isKu ? 'زانیاری گشتی' : 'Overview'}
            </button>
            <button
              type="button"
              onClick={() => setTab('privacy')}
              className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                tab === 'privacy'
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              {isKu ? 'سیاسەتی نهێنی (Privacy Policy)' : 'Privacy Policy'}
            </button>
            <button
              type="button"
              onClick={() => setTab('deletion')}
              className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                tab === 'deletion'
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              {isKu ? 'سڕینەوەی داتا و هەژمار' : 'Data & Account Deletion'}
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {tab === 'overview' && (
            <>
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {isKu ? 'دەربارەی ئەپەکە' : 'About This Application'}
                </h3>
                <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                  {summary}
                </p>
              </div>

              {app.screenshots && app.screenshots.length > 0 && (
                <div className="space-y-2.5 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                    <span>
                      {isKu
                        ? `وێنەکان و ڕووکاری بەرنامە (${app.screenshots.length})`
                        : `Screenshots (${app.screenshots.length})`}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {app.screenshots.map((src, idx) => (
                      <button
                        key={`${src.slice(0, 40)}-${idx}`}
                        type="button"
                        onClick={() => setLightboxSrc(src)}
                        className="group relative aspect-video rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <img
                          src={src}
                          alt={`${title} screenshot ${idx + 1}`}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                <div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {isKu ? 'گەشەپێدەر' : 'Developer'}
                  </p>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mt-1">
                    {isKu ? settings.nameKu : settings.nameEn}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {isKu ? 'ئیمەیڵی پشتگیری' : 'Support Contact'}
                  </p>
                  <a
                    href={`mailto:${settings.email}`}
                    className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline mt-1 inline-block"
                  >
                    {settings.email}
                  </a>
                </div>
              </div>

              {/* External Store / Repo Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {app.playStoreUrl && (
                  <a
                    href={app.playStoreUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
                  >
                    <span>
                      {app.status === 'published'
                        ? isKu
                          ? 'بینین لە Google Play'
                          : 'View on Google Play'
                        : isKu
                          ? 'پەڕەی تاقیکردنەوە لە Google Play'
                          : 'Google Play Testing Link'}
                    </span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                {app.githubUrl && (
                  <a
                    href={app.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
                  >
                    <span>GitHub Repository</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                {onRequestProject && (
                  <button
                    type="button"
                    onClick={onRequestProject}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 hover:bg-teal-100 dark:hover:bg-teal-900/50 rounded-lg transition-colors whitespace-nowrap shrink-0"
                  >
                    <MessageSquarePlus className="w-4 h-4" />
                    <span>
                      {isKu
                        ? 'داواکردنی ئەم سیستەمە / بەرنامەی هاوشێوە'
                        : 'Request This System / Similar App'}
                    </span>
                  </button>
                )}
              </div>
            </>
          )}

          {tab === 'privacy' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  <Shield className="w-4 h-4 text-blue-600" />
                  <span>
                    {isKu
                      ? 'سیاسەتی پاراستنی نهێنی فەرمی'
                      : 'Official Privacy Policy'}
                  </span>
                </div>
                <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setPolicyLang('en')}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                      policyLang === 'en'
                        ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                        : 'text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    English (Play Console)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPolicyLang('ku')}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                      policyLang === 'ku'
                        ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                        : 'text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    کوردی
                  </button>
                </div>
              </div>

              <div
                dir={policyLang === 'ku' ? 'rtl' : 'ltr'}
                className="p-5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 whitespace-pre-line"
              >
                {policyLang === 'en'
                  ? app.privacyPolicyEn || settings.globalPrivacyPolicyEn
                  : app.privacyPolicyKu || settings.globalPrivacyPolicyKu}
              </div>
            </div>
          )}

          {tab === 'deletion' && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                <Trash2 className="w-4 h-4 text-blue-600" />
                <span>
                  {isKu
                    ? 'ڕێکارەکانی سڕینەوەی هەژمار و داتا (Data Safety)'
                    : 'Account & Data Deletion Disclosure'}
                </span>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  {isKu ? 'داتای کۆکراوە' : 'Data Handled'}
                </h4>
                <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                  {app.dataCollected}
                </p>
              </div>

              <div className="space-y-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  {isKu
                    ? 'چۆنیەتی سڕینەوەی داتا'
                    : 'How to Request Data Deletion'}
                </h4>
                <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                  {app.accountDeletionInfo}
                </p>
              </div>

              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800">
                <a
                  href={`mailto:${settings.email}?subject=${encodeURIComponent(
                    `Data Deletion Request - ${app.titleEn} (${app.packageId})`
                  )}`}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 rounded-lg hover:opacity-90 transition-opacity"
                >
                  {isKu
                    ? 'ناردنی داواکاری سڕینەوە بە ئیمەیڵ'
                    : 'Send Deletion Request via Email'}
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {lightboxSrc && (
        <div
          className="fixed inset-0 z-[60] bg-black/85 flex items-center justify-center p-4"
          onClick={() => setLightboxSrc(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxSrc(null)}
            aria-label={isKu ? 'داخستن' : 'Close'}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={lightboxSrc}
            alt="Screenshot preview"
            referrerPolicy="no-referrer"
            onClick={(e) => e.stopPropagation()}
            className="max-w-full max-h-[88vh] rounded-xl object-contain shadow-2xl"
          />
        </div>
      )}
    </div>
  );
};
