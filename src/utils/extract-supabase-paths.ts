export const extractSupabasePaths = (urls: string[]): string[] => {
  return urls
    .map((url) => {
      try {
        const parsed = new URL(url);
        const match = parsed.pathname.match(/\/storage\/v1\/object\/public\/posts\/(.+)/);
        return match?.[1] || null;
      } catch {
        return null;
      }
    })
    .filter(Boolean) as string[];
};