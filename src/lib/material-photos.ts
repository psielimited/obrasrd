import materialCemento from "@/assets/photos/material-cemento.jpg";
import materialVarilla from "@/assets/photos/material-varilla.jpg";
import materialBlocks from "@/assets/photos/material-blocks.jpg";
import materialArena from "@/assets/photos/material-arena.jpg";
import materialPintura from "@/assets/photos/material-pintura.jpg";
import materialTechos from "@/assets/photos/material-techos.jpg";

/**
 * Single source of truth mapping material category → reusable B&W asset.
 * Categories are normalized (lowercased, accent-stripped) so free-text
 * supplier categories like "Techos metálicos" still resolve.
 */
const normalize = (value: string): string =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const MATERIAL_CATEGORY_PHOTO_MAP: Record<string, string> = {
  cemento: materialCemento,
  varilla: materialVarilla,
  varillas: materialVarilla,
  acero: materialVarilla,
  blocks: materialBlocks,
  block: materialBlocks,
  bloques: materialBlocks,
  arena: materialArena,
  agregados: materialArena,
  pintura: materialPintura,
  pinturas: materialPintura,
  "techos metalicos": materialTechos,
  techos: materialTechos,
  zinc: materialTechos,
};

const MATERIAL_CATEGORY_ALT_MAP: Record<string, string> = {
  cemento: "Sacos de cemento apilados en una obra",
  varilla: "Varillas de acero corrugado en sitio de construccion",
  blocks: "Blocks de concreto apilados con albanil al fondo",
  arena: "Pila de arena lavada con pala",
  pintura: "Galones de pintura y rodillo sobre lona protectora",
  techos: "Laminas de zinc galvanizado apiladas en almacen",
};

export const getMaterialPhoto = (category: string): string => {
  const key = normalize(category);
  return MATERIAL_CATEGORY_PHOTO_MAP[key] ?? materialCemento;
};

export const getMaterialPhotoAlt = (category: string): string => {
  const key = normalize(category);
  // Map specific category keys back to a base alt key
  if (key.includes("varilla") || key.includes("acero")) return MATERIAL_CATEGORY_ALT_MAP.varilla;
  if (key.includes("block") || key.includes("bloque")) return MATERIAL_CATEGORY_ALT_MAP.blocks;
  if (key.includes("arena") || key.includes("agregado")) return MATERIAL_CATEGORY_ALT_MAP.arena;
  if (key.includes("pintura")) return MATERIAL_CATEGORY_ALT_MAP.pintura;
  if (key.includes("techo") || key.includes("zinc")) return MATERIAL_CATEGORY_ALT_MAP.techos;
  if (key.includes("cemento")) return MATERIAL_CATEGORY_ALT_MAP.cemento;
  return `Foto referencial de ${category}`;
};
