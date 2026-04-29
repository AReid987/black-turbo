export interface EonetEvent {
  id: string;
  title: string;
  lat: number;
  lng: number;
  date: string;
  category: string;
  link?: string;
}

export async function fetchEonetEvents(categories?: string[]): Promise<EonetEvent[]> {
  try {
    let url = 'https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=200';
    if (categories && categories.length > 0) {
      url += `&categoryId=${categories.join(',')}`;
    }
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`EONET error: ${res.status}`);
    const data = await res.json();

    return (data.events || []).map((e: any) => {
      const geo = e.geometry?.[0];
      return {
        id: e.id,
        title: e.title,
        lat: geo?.coordinates?.[1] || 0,
        lng: geo?.coordinates?.[0] || 0,
        date: geo?.date,
        category: e.categories?.[0]?.title || 'Unknown',
        link: e.sources?.[0]?.url,
      };
    }).filter((e: EonetEvent) => e.lat && e.lng);
  } catch (err) {
    console.error('Failed to fetch EONET events:', err);
    return [];
  }
}

// Category IDs: wildfires (8), severeStorms (10), volcanoes (12), icebergs (15)
export const eonetCategories = {
  wildfires: 'wildfires',
  severeStorms: 'severeStorms',
  volcanoes: 'volcanoes',
  icebergs: 'icebergs',
};
