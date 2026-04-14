function getBaseUrl(): string {
  if (typeof window === 'undefined') return 'http://localhost:4000';
  return window.location.origin;
}

export async function checkMethods(email: string): Promise<string[]> {
  const res = await fetch(`${getBaseUrl()}/auth/check-methods`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) return [];
  const data = (await res.json()) as { methods: string[] };
  return data.methods;
}