export interface Profile {
  name: string;
  title: string;
  experience: string;
  profileImageUrl?: string;
}

export async function fetchAboutMe(url: string): Promise<{ profile: Profile; contentNodes: any[] }> {
  const res = await fetch(`${url}/api/aboutme`);
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}
