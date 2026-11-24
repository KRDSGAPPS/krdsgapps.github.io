import { AppItem, DeveloperSettings } from '../types';

export const ADMIN_EMAIL = 'shakirgoran@gmail.com';

export const HERO_STUDIO_IMAGE = '/src/assets/images/hero_developer_studio_1795555119546.jpg';

export const PRESET_APP_ICONS = [
  {
    label: 'Muroo Sort',
    url: '/src/assets/images/app_muroosort_1795555119133.jpg',
  },
  {
    label: 'Tendrustim Health',
    url: '/src/assets/images/app_tendrustim_1795555120910.jpg',
  },
  {
    label: 'My Debts Finance',
    url: '/src/assets/images/app_mydebts_1795555119989.jpg',
  },
  {
    label: 'Study Buddy Acoustic',
    url: '/src/assets/images/app_studybuddy_1795555120219.jpg',
  },
];

export function buildPrivacyPolicyEn(
  appTitle: string,
  packageId: string,
  developerName = 'Eng. Shakir Goran',
  email = ADMIN_EMAIL,
  location = 'Kurdistan Region - Erbil Governorate, Iraq',
  dataCollected = 'No personal data is sold. Essential diagnostics or local preferences remain on your device unless explicitly stated.'
): string {
  return `Privacy Policy for ${appTitle}
Package ID: ${packageId}
Effective Date: November 2026

1. Overview
${developerName} ("we", "our", or "Developer"), based in ${location}, built the ${appTitle} mobile application as a commercial and utility service for Android users. This page informs visitors regarding policies with the collection, use, and disclosure of information if anyone decides to use this application.

2. Information Collection and Use
${dataCollected}
Any local records, preferences, or user entries created inside ${appTitle} are stored locally on your device or securely transmitted only when required by an explicit user-triggered feature. We do not sell, rent, or trade your personal information to third parties.

3. Third-Party Services
The application may rely on standard Google Play Services and crash-reporting tools solely to maintain stability, security, and compatibility across Android devices:
- Google Play Services (https://policies.google.com/privacy)

4. Data Retention & Deletion
You may clear all locally stored application data at any time via Android Settings > Apps > ${appTitle} > Storage > Clear Data, or by uninstalling the application. If cloud synchronization is enabled in a specific feature, you may request permanent deletion of your data by emailing ${email}.

5. Children's Privacy
This application is not directed toward children under the age of 13 without parental consent, and we do not knowingly collect personally identifiable information from children under 13.

6. Changes to This Privacy Policy
We may update this Privacy Policy from time to time. Updates take effect immediately upon publication on this page.

7. Contact Information
Developer: ${developerName}
Location: ${location}
Email: ${email}`;
}

export function buildPrivacyPolicyKu(
  appTitle: string,
  packageId: string,
  developerName = 'ئەندازیار شاکر گۆران',
  email = ADMIN_EMAIL,
  location = 'هەرێمی کوردستان - پارێزگای هەولێر',
  dataCollected = 'هیچ داتایەکی کەسی نافرۆشرێت. زانیارییە بنەڕەتییەکان تەنها لەسەر مۆبایلەکەت هەڵدەگیرێن یان بۆ کارکردنی دروستی ئەپەکە بەکاردەهێنرێن.'
): string {
  return `سیاسەتی پاراستنی نهێنی بۆ ئەپی ${appTitle}
ناسنامەی پاکێج: ${packageId}
بەرواری کارپێکردن: تشرینی دووەمی ٢٠٢٦

١. پێشەکی
${developerName} لە ${location} ئەپی ${appTitle}ـی بۆ سیستەمی ئەندرۆید دروستکردووە. ئەم لاپەڕەیە بۆ ڕوونکردنەوەی چۆنیەتی پاراستن و مامەڵەکردن لەگەڵ داتا و زانیارییەکانی بەکارهێنەرانە.

٢. کۆکردنەوە و بەکارهێنانی زانیاری
${dataCollected}
هەموو تۆمار و ڕێکخستنە ناوخۆییەکان لەسەر ئامێرەکەی خۆت دەپارێزرێن و هیچ زانیارییەکی کەسی بە لایەنی سێیەم نافرۆشرێت و بڵاوناکرێتەوە.

٣. خزمەتگوزارییە لاوەکییەکان
لەوانەیە ئەپەکە سوود لە خزمەتگوزارییە فەرمییەکانی Google Play Services وەربگرێت تەنها بۆ باشترکردنی خێرایی، ئاسایش، و دیاریکردنی کێشە تەکنیکییەکان.

٤. هەڵگرتن و سڕینەوەی داتا
بەکارهێنەر لە هەر کاتێکدا دەتوانێت هەموو داتاکانی ناو ئەپەکە بسڕێتەوە لە ڕێگەی ڕێکخستنەکانی مۆبایل یان سڕینەوەی ئەپەکە. ئەگەر هەر تایبەتمەندییەکی هەژمار هەبێت، دەتوانیت داوای سڕینەوەی یەکجاری بنێریت بۆ ئەم ئیمەیڵە: ${email}

٥. پاراستنی منداڵان
ئەم ئەپە بە هیچ شێوەیەک زانیاری تایبەت لە منداڵانی خوار تەمەن ١٣ ساڵ کۆناکاتەوە.

٦. گۆڕانکاری لە سیاسەتی نهێنیدا
هەر کاتێک پێویست بکات ئەم سیاسەتە نوێ دەکرێتەوە و ڕاستەوخۆ لەم لاپەڕەیەدا بڵاودەکرێتەوە.

٧. پەیوەندی
گەشەپێدەر: ${developerName}
ناونیشان: ${location}
ئیمەیڵ: ${email}`;
}

export const DEFAULT_DEVELOPER_SETTINGS: DeveloperSettings = {
  brandNameKu: 'SG Apps',
  brandNameEn: 'SG Apps',
  heroTitleKu: 'ئەپ و یارییە مۆدێرنەکان بۆ ئەندرۆید',
  heroTitleEn: 'Thoughtful Android Apps & Games',
  nameKu: 'ئەندازیار شاکر گۆران',
  nameEn: 'Eng. Shakir Goran',
  roleKu: 'ستۆدیۆی سەربەخۆی ئەپەکانی مۆبایل',
  roleEn: 'Independent Mobile App Studio',
  bioKu:
    'پێگەی فەرمیی ئەپە بڵاوکراوەکان و پڕۆژە نوێیەکان — دیزاینکراو بە سادەیی و خێرایی بۆ بەکارهێنەرانی ئەندرۆید، لەگەڵ سیاسەتی پاراستنی نهێنی و پشتگیری ڕاستەوخۆ.',
  bioEn:
    'Official home for published Android apps, puzzle games, and upcoming tools — crafted for clarity, reliability, and transparent user privacy.',
  locationKu: 'هەرێمی کوردستان - پارێزگای هەولێر',
  locationEn: 'Kurdistan Region - Erbil Governorate',
  email: ADMIN_EMAIL,
  playStoreDeveloperUrl:
    'https://play.google.com/store/apps/developer?id=shakir+goran&hl=en-US',
  githubProfileUrl: 'https://github.com/shakirgoran',
  appAdsTxt: `# app-ads.txt for Eng. Shakir Goran
# Add your AdMob publisher ID line below when monetizing apps:
# google.com, pub-0000000000000000, DIRECT, f08c47fec0942fa0`,
  globalPrivacyPolicyEn: buildPrivacyPolicyEn(
    'Shakir Goran Mobile Applications',
    'All Published & Upcoming Apps',
    'Eng. Shakir Goran',
    ADMIN_EMAIL,
    'Kurdistan Region - Erbil Governorate, Iraq',
    'Each application only accesses the minimum permissions needed for its core functionality (such as local storage for files, offline debt ledgers, or wellness tracking). Personal information is never sold to third parties.'
  ),
  globalPrivacyPolicyKu: buildPrivacyPolicyKu(
    'ئەپەکانی ئەندازیار شاکر گۆران',
    'هەموو ئەپە بڵاوکراوە و داهاتووەکان',
    'ئەندازیار شاکر گۆران',
    ADMIN_EMAIL,
    'هەرێمی کوردستان - پارێزگای هەولێر',
    'هەر ئەپێک تەنها ئەو ڕێگەپێدانە سەرەکییانە بەکاردەهێنێت کە بۆ کارکردنی پێویستە و هیچ زانیارییەکی کەسی بە هیچ لایەنێک نافرۆشرێت.'
  ),
};

export const DEFAULT_APPS: AppItem[] = [
  {
    id: 'muroo-sort',
    slug: 'muroo-sort',
    titleKu: 'مورۆ سۆرت — Muroo Sort',
    titleEn: 'Muroo Sort',
    packageId: 'com.muroosort.app',
    status: 'published',
    category: 'Puzzle Game',
    summaryKu:
      'یارییەکی بیرکاری و ڕێکخستنی ڕەنگەکان بە دیزاینێکی سادە و قۆناغی جۆراوجۆر بۆ چالاککردنی مێشک.',
    summaryEn:
      'A crisp color-sorting puzzle mobile game crafted for calm focus, logical sequencing, and progressive brain challenges.',
    playStoreUrl:
      'https://play.google.com/store/apps/developer?id=shakir+goran&hl=en-US',
    githubUrl: 'https://github.com/shakirgoran/muroosort',
    iconUrl: '/src/assets/images/app_muroosort_1795555119133.jpg',
    dataCollected:
      'Game progress and level preferences are stored locally on the device. Standard Google Play diagnostic logs may apply.',
    accountDeletionInfo:
      'No account registration is required. All local game state can be cleared in Android App Settings or by uninstalling.',
    privacyPolicyEn: buildPrivacyPolicyEn(
      'Muroo Sort',
      'com.muroosort.app',
      'Eng. Shakir Goran',
      ADMIN_EMAIL,
      'Kurdistan Region - Erbil Governorate, Iraq',
      'Muroo Sort stores level progress and sound preferences locally on your device. No account registration or personal contact data is collected.'
    ),
    privacyPolicyKu: buildPrivacyPolicyKu(
      'Muroo Sort',
      'com.muroosort.app',
      'ئەندازیار شاکر گۆران',
      ADMIN_EMAIL,
      'هەرێمی کوردستان - پارێزگای هەولێر',
      'ئەپەکە قۆناغەکانی یاری و ڕێکخستنی دەنگ تەنها لەسەر مۆبایلەکەت هەڵدەگرێت و هیچ زانیارییەکی کەسی کۆناکاتەوە.'
    ),
    version: '1.2.0',
    sortOrder: 1,
  },
  {
    id: 'my-debts',
    slug: 'my-debts',
    titleKu: 'قەرزەکانم — LOANS',
    titleEn: 'My Debts — LOANS',
    packageId: 'com.shakirgoran.mydebts',
    status: 'published',
    category: 'Finance & Ledger',
    summaryKu:
      'ئەپێکی تەواو بۆ بەڕێوەبردن و تۆمارکردنی قەرز و پارەدانەکان بە شێوەیەکی ڕێکوپێک بە زمانی کوردی و ئینگلیزی.',
    summaryEn:
      'Personal debt, loan, and repayment ledger designed for individuals and small shops with clear balance summaries.',
    playStoreUrl:
      'https://play.google.com/store/apps/developer?id=shakir+goran&hl=en-US',
    githubUrl: 'https://github.com/shakirgoran/my-debts',
    iconUrl: '/src/assets/images/app_mydebts_1795555119989.jpg',
    dataCollected:
      'Financial ledger entries remain strictly under user control on the device or user-authorized backup.',
    accountDeletionInfo:
      'Users can clear all debt records directly inside the app or send a deletion inquiry to shakirgoran@gmail.com if cloud sync is enabled.',
    privacyPolicyEn: buildPrivacyPolicyEn(
      'My Debts — LOANS (قەرزەکانم)',
      'com.shakirgoran.mydebts',
      'Eng. Shakir Goran',
      ADMIN_EMAIL,
      'Kurdistan Region - Erbil Governorate, Iraq',
      'All debt, customer, and repayment entries are stored strictly for your personal bookkeeping. We never access, sell, or share your financial records.'
    ),
    privacyPolicyKu: buildPrivacyPolicyKu(
      'قەرزەکانم — LOANS',
      'com.shakirgoran.mydebts',
      'ئەندازیار شاکر گۆران',
      ADMIN_EMAIL,
      'هەرێمی کوردستان - پارێزگای هەولێر',
      'هەموو تۆمارە داراییەکان و قەرزەکان تەنها بۆ بەکارهێنانی خۆت دەپارێزرێن و هیچ کەسێکی تر دەستی پێیان ناگات.'
    ),
    version: '2.0.1',
    sortOrder: 2,
  },
  {
    id: 'smart-compressor',
    slug: 'smart-compressor',
    titleKu: 'کەمکردنەوەی قەبارەی ڤیدیۆ و وێنە',
    titleEn: 'Smart Video & Image Compressor',
    packageId: 'com.shakirgoran.compressor',
    status: 'published',
    category: 'Media & Utilities',
    summaryKu:
      'بچووککردنەوەی قەبارەی ڤیدیۆ و وێنەکان بە خێرایی و بەبێ لەدەستدانی کوالێتی، بە تەواوی لەسەر مۆبایلەکەت.',
    summaryEn:
      'On-device video and image compression utility engineered to shrink file sizes rapidly while preserving visual clarity.',
    playStoreUrl:
      'https://play.google.com/store/apps/developer?id=shakir+goran&hl=en-US',
    githubUrl: '',
    iconUrl: '',
    dataCollected:
      'Media files are processed locally on-device. Photos and videos are never uploaded to external servers.',
    accountDeletionInfo:
      'No user accounts exist. Temporary cache files can be removed at any time via Android Storage settings.',
    privacyPolicyEn: buildPrivacyPolicyEn(
      'Smart Video & Image Compressor',
      'com.shakirgoran.compressor',
      'Eng. Shakir Goran',
      ADMIN_EMAIL,
      'Kurdistan Region - Erbil Governorate, Iraq',
      'Media selection permissions are used strictly to read your selected image or video and save the compressed output locally on your device. Files are never uploaded externally.'
    ),
    privacyPolicyKu: buildPrivacyPolicyKu(
      'Smart Video & Image Compressor',
      'com.shakirgoran.compressor',
      'ئەندازیار شاکر گۆران',
      ADMIN_EMAIL,
      'هەرێمی کوردستان - پارێزگای هەولێر',
      'هەموو کارەکانی بچووککردنەوەی وێنە و ڤیدیۆ لەسەر مۆبایلەکەی خۆت ئەنجام دەدرێن و هیچ فایلێک بۆ دەرەوە نانێردرێت.'
    ),
    version: '1.4.0',
    sortOrder: 3,
  },
  {
    id: 'car-fight-frenzy',
    slug: 'car-fight-frenzy',
    titleKu: 'کار فایت فرێنزی — Car Fight Frenzy',
    titleEn: 'Car Fight Frenzy',
    packageId: 'com.shakirgoran.carfightfrenzy',
    status: 'published',
    category: 'Action Arcade',
    summaryKu:
      'یارییەکی خێرای ئەکشن و پێشبڕکێی ئۆتۆمبێل بە کۆنترۆڵی ئاسان و قۆناغی چێژبەخش.',
    summaryEn:
      'Fast-paced vehicular arena action game with responsive touch controls and escalating arcade stages.',
    playStoreUrl:
      'https://play.google.com/store/apps/developer?id=shakir+goran&hl=en-US',
    githubUrl: '',
    iconUrl: '',
    dataCollected:
      'Stores local high scores and audio preferences on-device.',
    accountDeletionInfo:
      'No personal account required. Clearing app data resets local scores.',
    privacyPolicyEn: buildPrivacyPolicyEn(
      'Car Fight Frenzy',
      'com.shakirgoran.carfightfrenzy',
      'Eng. Shakir Goran',
      ADMIN_EMAIL,
      'Kurdistan Region - Erbil Governorate, Iraq',
      'Car Fight Frenzy only stores local high scores and gameplay settings on your device.'
    ),
    privacyPolicyKu: buildPrivacyPolicyKu(
      'Car Fight Frenzy',
      'com.shakirgoran.carfightfrenzy',
      'ئەندازیار شاکر گۆران',
      ADMIN_EMAIL,
      'هەرێمی کوردستان - پارێزگای هەولێر',
      'تەنها خاڵە بەرزەکان و ڕێکخستنەکانی یاری لەسەر مۆبایلەکەت هەڵدەگرێت.'
    ),
    version: '1.0.5',
    sortOrder: 4,
  },
  {
    id: 'tendrustim',
    slug: 'tendrustim',
    titleKu: 'تەندروستیم — Tendrustim',
    titleEn: 'Tendrustim',
    packageId: 'com.aistudio.tendrustim.xkqmpz',
    status: 'in_development',
    category: 'Health & Wellness',
    summaryKu:
      'ئەپێکی تەندروستی و ڕێنمایی ڕۆژانە بە زمانی کوردی (ئێستا لە قۆناغی تاقیکردنەوە و تەواوکردندایە لە گۆگڵ پلەی).',
    summaryEn:
      'Kurdish-first personal health and daily wellness companion currently undergoing Google Play testing and refinement.',
    playStoreUrl:
      'https://play.google.com/store/apps/details?id=com.aistudio.tendrustim.xkqmpz&hl=en-US',
    githubUrl: '',
    iconUrl: '/src/assets/images/app_tendrustim_1795555120910.jpg',
    dataCollected:
      'Wellness logs and user preferences are used only to personalize your health reminders and remain protected.',
    accountDeletionInfo:
      'To request deletion of any account or wellness log stored during testing, email shakirgoran@gmail.com with your account email.',
    privacyPolicyEn: buildPrivacyPolicyEn(
      'Tendrustim (تەندروستیم)',
      'com.aistudio.tendrustim.xkqmpz',
      'Eng. Shakir Goran',
      ADMIN_EMAIL,
      'Kurdistan Region - Erbil Governorate, Iraq',
      'Tendrustim processes user-entered wellness logs solely to deliver personalized health tracking inside the app. Health entries are never used for advertising or sold to third parties.'
    ),
    privacyPolicyKu: buildPrivacyPolicyKu(
      'تەندروستیم — Tendrustim',
      'com.aistudio.tendrustim.xkqmpz',
      'ئەندازیار شاکر گۆران',
      ADMIN_EMAIL,
      'هەرێمی کوردستان - پارێزگای هەولێر',
      'ئەپی تەندروستیم تەنها ئەو زانیارییانە بەکاردەهێنێت کە بەکارهێنەر بۆ چاودێری تەندروستی خۆی تۆماری دەکات و هەرگیز بۆ ڕیکلام یان فرۆشتن بەکارناهێنرێن.'
    ),
    version: '0.9.0-beta',
    sortOrder: 5,
  },
  {
    id: 'smart-study-buddy-sounds',
    slug: 'smart-study-buddy-sounds',
    titleKu: 'هاوڕێی زیرەکی خوێندن — Study Buddy Sounds',
    titleEn: 'Smart Study Buddy Sounds',
    packageId: 'com.shakirgoran.studybuddy',
    status: 'upcoming',
    category: 'Education & Focus',
    summaryKu:
      'ئەپێکی یارمەتیدەر بۆ خوێندن و تەرکیزکردن لەگەڵ دەنگی ئارامبەخش و کاتژمێری خوێندن (پۆمۆدۆرۆ).',
    summaryEn:
      'Focused study environment pairing ambient acoustic soundscapes with structured study timers for students.',
    playStoreUrl: '',
    githubUrl: 'https://github.com/shakirgoran/smart-study-buddy-sounds',
    iconUrl: '/src/assets/images/app_studybuddy_1795555120219.jpg',
    dataCollected:
      'Timer sessions and preferred ambient sound mixes are saved locally on your device.',
    accountDeletionInfo:
      'No personal account required. All local timer history is cleared upon uninstalling.',
    privacyPolicyEn: buildPrivacyPolicyEn(
      'Smart Study Buddy Sounds',
      'com.shakirgoran.studybuddy',
      'Eng. Shakir Goran',
      ADMIN_EMAIL,
      'Kurdistan Region - Erbil Governorate, Iraq',
      'Smart Study Buddy Sounds stores study timer preferences and sound mix presets locally on your device without collecting personal data.'
    ),
    privacyPolicyKu: buildPrivacyPolicyKu(
      'Smart Study Buddy Sounds',
      'com.shakirgoran.studybuddy',
      'ئەندازیار شاکر گۆران',
      ADMIN_EMAIL,
      'هەرێمی کوردستان - پارێزگای هەولێر',
      'ئەپەکە ڕێکخستنی دەنگ و کاتی خوێندن لەسەر مۆبایلەکەت هەڵدەگرێت بەبێ کۆکردنەوەی زانیاری کەسی.'
    ),
    version: '0.5.0-dev',
    sortOrder: 6,
  },
];
