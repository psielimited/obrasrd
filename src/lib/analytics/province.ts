const PROVINCE_ALIASES: Array<{ province: string; aliases: string[] }> = [
  { province: "Santo Domingo", aliases: ["santo domingo", "distrito nacional"] },
  { province: "Santiago", aliases: ["santiago", "santiago de los caballeros"] },
  { province: "La Romana", aliases: ["la romana"] },
  { province: "La Altagracia", aliases: ["la altagracia", "punta cana", "higuey", "higüey"] },
  { province: "San Cristobal", aliases: ["san cristobal", "san cristóbal"] },
  { province: "La Vega", aliases: ["la vega", "jarabacoa", "constanza"] },
];

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

export const deriveProvinceFromText = (value?: string): string | undefined => {
  if (!value?.trim()) return undefined;
  const normalized = normalize(value);

  for (const entry of PROVINCE_ALIASES) {
    if (entry.aliases.some((alias) => normalized.includes(normalize(alias)))) {
      return entry.province;
    }
  }

  return undefined;
};
