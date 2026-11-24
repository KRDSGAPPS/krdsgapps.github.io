import React, { useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { CheckCircle2, MonitorSmartphone, Send } from 'lucide-react';
import { db } from '../firebase';

interface ProjectRequestFormProps {
  isKu: boolean;
}

type PlatformType = 'android' | 'desktop' | 'both';

export const ProjectRequestForm: React.FC<ProjectRequestFormProps> = ({ isKu }) => {
  const [clientName, setClientName] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [platform, setPlatform] = useState<PlatformType>('android');
  const [projectTitle, setProjectTitle] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const name = clientName.trim();
    const contact = contactInfo.trim();
    const title = projectTitle.trim();
    const msg = message.trim();

    if (name.length < 1 || contact.length < 3 || title.length < 2 || msg.length < 10) {
      setError(
        isKu
          ? 'تکایە هەموو خانەکان بە تەواوی پڕ بکەرەوە (وەسفەکە لانیکەم ١٠ پیت بێت).'
          : 'Please complete all fields (project description must be at least 10 characters).'
      );
      return;
    }

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'requests'), {
        clientName: name.slice(0, 100),
        contactInfo: contact.slice(0, 160),
        platform,
        projectTitle: title.slice(0, 120),
        message: msg.slice(0, 2000),
        status: 'new',
        createdAt: serverTimestamp(),
      });
      setSubmitted(true);
      setClientName('');
      setContactInfo('');
      setProjectTitle('');
      setMessage('');
    } catch (err) {
      setError(
        isKu
          ? `نەتوانرا داواکارییەکە بنێردرێت: ${err instanceof Error ? err.message : String(err)}`
          : `Could not submit request: ${err instanceof Error ? err.message : String(err)}`
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 space-y-6">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 text-xs font-medium text-teal-600 dark:text-teal-400">
          <MonitorSmartphone className="w-4 h-4" />
          <span>
            {isKu
              ? 'داواکاری ئەپی مۆبایل و بەرنامەی کۆمپیوتەر'
              : 'Custom Mobile Apps & Desktop Software'}
          </span>
        </div>
        <h2 className="font-display text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          {isKu
            ? 'ئەپ یان بەرنامەی تایبەت بە خۆت داوا بکە'
            : 'Request a Custom App or PC Software'}
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          {isKu
            ? 'دروستکردنی ئەپی ئەندرۆید و بەرنامەی کۆمپیوتەر (وەک سیستەمی کارگە، کۆگا، ژمێریاری، و بزنس). بیرۆکەکەت بنووسە و ڕاستەوخۆ دەگاتە مۆبایلەکەم.'
            : 'Need a custom Android app or Windows/PC desktop software (e.g., factory, inventory, or business management)? Send your project idea directly.'}
        </p>
      </div>

      {submitted ? (
        <div className="rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 p-5 space-y-3">
          <div className="flex items-center gap-2 text-teal-700 dark:text-teal-300 font-semibold">
            <CheckCircle2 className="w-5 h-5" />
            <span>
              {isKu
                ? 'داواکارییەکەت بە سەرکەوتوویی نێردرا!'
                : 'Your request has been sent!'}
            </span>
          </div>
          <p className="text-sm text-teal-700/90 dark:text-teal-300/90">
            {isKu
              ? 'سوپاس بۆ پەیوەندیکردنت. بە زووترین کات پەیوەندیت پێوە دەکەمەوە.'
              : 'Thank you for reaching out. I will review your request and reply soon.'}
          </p>
          <button
            type="button"
            onClick={() => setSubmitted(false)}
            className="text-xs font-medium text-teal-700 dark:text-teal-300 underline"
          >
            {isKu ? 'ناردنی داواکارییەکی تر' : 'Send another request'}
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                {isKu ? 'ناوی تەواو *' : 'Your Name *'}
              </label>
              <input
                type="text"
                required
                maxLength={100}
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder={isKu ? 'نموونە: ئەحمەد علی' : 'e.g. Ahmad Ali'}
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                {isKu ? 'ژمارەی مۆبایل / واتسئەپ / ئیمەیڵ *' : 'Phone / WhatsApp / Email *'}
              </label>
              <input
                type="text"
                required
                maxLength={160}
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                placeholder={isKu ? '0750xxxxxxx یان email' : '+964750... or email'}
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                {isKu ? 'جۆری پڕۆژە *' : 'Platform *'}
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as PlatformType)}
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="android">
                  {isKu ? 'ئەپی مۆبایل (Android)' : 'Mobile App (Android)'}
                </option>
                <option value="desktop">
                  {isKu ? 'بەرنامەی کۆمپیوتەر (Desktop / PC)' : 'Desktop / PC Software'}
                </option>
                <option value="both">
                  {isKu ? 'هەردووکیان (مۆبایل + کۆمپیوتەر)' : 'Both (Mobile + Desktop)'}
                </option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                {isKu ? 'ناونیشانی پڕۆژە *' : 'Project Title *'}
              </label>
              <input
                type="text"
                required
                maxLength={120}
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                placeholder={
                  isKu ? 'نموونە: سیستەمی بەڕێوەبردنی کارگە' : 'e.g. Factory Management System'
                }
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
              {isKu ? 'وردەکاری و نامەی داواکاری *' : 'Project Details & Message *'}
            </label>
            <textarea
              required
              rows={4}
              maxLength={2000}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                isKu
                  ? 'باسێکی کورتی پڕۆژەکەت بنووسە (چ کارێک دەکات، بۆ کێیە، یان هەر تێبینییەکی تر)...'
                  : 'Briefly describe what you need the app or desktop software to do...'
              }
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && (
            <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 rounded-lg transition-colors"
          >
            <Send className="w-4 h-4" />
            <span>
              {submitting
                ? isKu
                  ? 'خەریکە دەنێردرێت...'
                  : 'Sending...'
                : isKu
                ? 'ناردنی داواکاری'
                : 'Submit Request'}
            </span>
          </button>
        </form>
      )}
    </div>
  );
};
