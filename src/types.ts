export type AppStatus = 'published' | 'in_development' | 'upcoming';

export type Language = 'ku' | 'en';

export type PageView = 'home' | 'privacy' | 'about';

export interface AppItem {
  id: string;
  slug: string;
  titleKu: string;
  titleEn: string;
  packageId: string;
  status: AppStatus;
  category: string;
  summaryKu: string;
  summaryEn: string;
  playStoreUrl: string;
  githubUrl: string;
  iconUrl: string;
  privacyPolicyEn: string;
  privacyPolicyKu: string;
  accountDeletionInfo: string;
  dataCollected: string;
  version: string;
  sortOrder: number;
  ownerUid?: string;
}

export interface DeveloperSettings {
  brandNameKu: string;
  brandNameEn: string;
  heroTitleKu: string;
  heroTitleEn: string;
  nameKu: string;
  nameEn: string;
  roleKu: string;
  roleEn: string;
  bioKu: string;
  bioEn: string;
  locationKu: string;
  locationEn: string;
  email: string;
  playStoreDeveloperUrl: string;
  githubProfileUrl: string;
  appAdsTxt: string;
  globalPrivacyPolicyEn: string;
  globalPrivacyPolicyKu: string;
  ownerUid?: string;
}
