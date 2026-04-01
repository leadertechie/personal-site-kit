export interface InfrastructureConfig {
  baseUrl: string;
  apiUrl: string;
}

export interface StaticDetails {
  siteTitle: string;
  siteDescription: string;
  copyright: string;
  linkedin: string;
  github: string;
  email: string;
  twitter?: string;
}

export interface WebsiteConfig extends InfrastructureConfig, StaticDetails {}
