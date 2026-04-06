export interface ContentItem {
  key: string;
  size: number;
  uploaded?: string;
}

export interface StaticDetails {
  siteTitle?: string;
  copyright?: string;
  linkedin?: string;
  github?: string;
  email?: string;
}

export interface AuthStatus {
  configured: boolean;
  username: string | null;
}

export interface AdminSectionProps {
  contentList: ContentItem[];
  staticDetails: StaticDetails;
  onUpload: (key: string, file: File) => Promise<void>;
  onDelete: (key: string) => Promise<void>;
  onStatusMessage: (message: string) => void;
}