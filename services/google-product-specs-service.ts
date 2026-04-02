import 'server-only';

type GoogleSpecResult = {
  title: string;
  snippet: string;
  link?: string;
};

function sanitizeTitle(value: string) {
  return value
    .replace(/\s*[-|:]\s*[^-|:]+$/g, '')
    .trim()
    .slice(0, 120);
}

export async function fetchGoogleProductSpecsByBarcode(barcode: string): Promise<GoogleSpecResult | null> {
  const apiKey = process.env.GOOGLE_API_KEY;
  const cseId = process.env.GOOGLE_CSE_ID;

  if (!apiKey || !cseId) {
    return null;
  }

  const query = encodeURIComponent(`${barcode} especificacoes produto`);
  const endpoint = `https://www.googleapis.com/customsearch/v1?key=${encodeURIComponent(apiKey)}&cx=${encodeURIComponent(cseId)}&num=1&q=${query}`;

  const response = await fetch(endpoint, {
    method: 'GET',
    headers: {
      Accept: 'application/json'
    },
    cache: 'no-store'
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as {
    items?: Array<{ title?: string; snippet?: string; link?: string }>;
  };

  const firstItem = payload.items?.[0];

  if (!firstItem?.title && !firstItem?.snippet) {
    return null;
  }

  return {
    title: sanitizeTitle(firstItem.title ?? 'Produto via codigo de barras'),
    snippet: (firstItem.snippet ?? '').trim(),
    link: firstItem.link
  };
}
