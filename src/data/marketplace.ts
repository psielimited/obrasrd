export interface Phase {
  id: number;
  slug: string;
  name: string;
  description: string;
  categories: Category[];
}

export interface Category {
  slug: string;
  name: string;
  icon: string;
}

export interface Provider {
  id: string;
  name: string;
  trade: string;
  categorySlug: string;
  phaseId: number;
  location: string;
  city: string;
  yearsExperience: number;
  description: string;
  rating: number;
  reviewCount: number;
  completedProjects: number;
  verified: boolean;
  isFeatured?: boolean;
  whatsapp: string;
  startingPrice?: number;
  portfolioImages: string[];
  serviceAreas: string[];
}

export interface Material {
  id: string;
  name: string;
  category: string;
  supplier: string;
  location: string;
  price: number;
  unit: string;
  bulkPrice?: number;
  bulkUnit?: string;
  delivery: boolean;
  whatsapp: string;
  description: string;
}

export interface Project {
  id: string;
  name: string;
  type: string;
  area: string;
  currentPhase: number;
  phases: number[];
}

export const CITIES = [
  "Santo Domingo",
  "Santiago",
  "Punta Cana",
  "La Romana",
  "Jarabacoa",
  "San Cristóbal",
];

export const PHASES: Phase[] = [
  {
    id: 1,
    slug: "pre-construccion",
    name: "Pre-Construcción",
    description: "Planos, permisos y diseño legal.",
    categories: [
      { slug: "arquitectos", name: "Arquitectos", icon: "Ruler" },
      { slug: "ingenieros-estructurales", name: "Ingenieros Estructurales", icon: "Building2" },
      { slug: "ingenieros-mep", name: "Ingenieros MEP", icon: "Zap" },
      { slug: "agrimensores", name: "Agrimensores", icon: "MapPin" },
      { slug: "consultores-ambientales", name: "Consultores Ambientales", icon: "Leaf" },
      { slug: "abogados-inmobiliarios", name: "Abogados Inmobiliarios", icon: "Scale" },
      { slug: "gestores-permisos", name: "Gestores de Permisos", icon: "FileText" },
      { slug: "agentes-inmobiliarios", name: "Agentes Inmobiliarios", icon: "Home" },
    ],
  },
  {
    id: 2,
    slug: "preparacion-cimentacion",
    name: "Preparación y Cimentación",
    description: "Excavación, terreno y cimentación.",
    categories: [
      { slug: "excavacion", name: "Excavación", icon: "Shovel" },
      { slug: "limpieza-terrenos", name: "Limpieza de Terrenos", icon: "Trees" },
      { slug: "movimiento-tierra", name: "Movimiento de Tierra", icon: "Mountain" },
      { slug: "concreto", name: "Concreto", icon: "Box" },
      { slug: "cimentacion", name: "Especialistas en Cimentación", icon: "Layers" },
      { slug: "ingenieros-civiles", name: "Ingenieros Civiles", icon: "HardHat" },
      { slug: "servicios-publicos", name: "Conexión a Servicios Públicos", icon: "Plug" },
    ],
  },
  {
    id: 3,
    slug: "construccion-estructural",
    name: "Construcción Estructural",
    description: "Estructura, techos y acabados exteriores.",
    categories: [
      { slug: "contratistas-generales", name: "Contratistas Generales", icon: "Hammer" },
      { slug: "carpinteros-estructura", name: "Carpinteros / Estructura", icon: "Wrench" },
      { slug: "contratistas-techos", name: "Contratistas de Techos", icon: "Home" },
      { slug: "aislamiento", name: "Instaladores de Aislamiento", icon: "Shield" },
      { slug: "acabados-exteriores", name: "Acabados Exteriores", icon: "PaintBucket" },
      { slug: "stucco", name: "Stucco / Revestimientos", icon: "Paintbrush" },
      { slug: "albaniles", name: "Albañiles", icon: "Brick" },
    ],
  },
  {
    id: 4,
    slug: "instalacion-sistemas",
    name: "Instalación de Sistemas",
    description: "Electricidad, plomería y climatización.",
    categories: [
      { slug: "electricistas", name: "Electricistas", icon: "Zap" },
      { slug: "plomeros", name: "Plomeros", icon: "Droplets" },
      { slug: "hvac", name: "Técnicos HVAC", icon: "Wind" },
      { slug: "paneles-solares", name: "Instaladores de Paneles Solares", icon: "Sun" },
      { slug: "redes-cableado", name: "Redes y Cableado", icon: "Cable" },
    ],
  },
  {
    id: 5,
    slug: "acabados-interiores",
    name: "Acabados Interiores",
    description: "Pintura, pisos y carpintería interior.",
    categories: [
      { slug: "pintores", name: "Pintores", icon: "Paintbrush" },
      { slug: "instaladores-pisos", name: "Instaladores de Pisos", icon: "Grid3x3" },
      { slug: "carpinteria-interior", name: "Carpintería Interior", icon: "DoorOpen" },
      { slug: "gabinetes", name: "Instaladores de Gabinetes", icon: "LayoutGrid" },
      { slug: "disenadores-interiores", name: "Diseñadores de Interiores", icon: "Palette" },
      { slug: "drywall", name: "Instaladores de Drywall", icon: "Square" },
      { slug: "vidrieros", name: "Vidrieros", icon: "GlassWater" },
    ],
  },
  {
    id: 6,
    slug: "trabajo-final",
    name: "Trabajo Final",
    description: "Paisajismo, limpieza e inspección.",
    categories: [
      { slug: "paisajismo", name: "Paisajismo", icon: "Flower2" },
      { slug: "pavimentacion", name: "Pavimentación", icon: "Road" },
      { slug: "portones", name: "Instalación de Portones", icon: "DoorClosed" },
      { slug: "limpieza", name: "Servicios de Limpieza", icon: "Sparkles" },
      { slug: "inspectores", name: "Inspectores de Construcción", icon: "ClipboardCheck" },
    ],
  },
];

export const PROVIDERS: Provider[] = [
  {
    id: "p1",
    name: "Arq. María González",
    trade: "Arquitecto Residencial",
    categorySlug: "arquitectos",
    phaseId: 1,
    location: "Santo Domingo",
    city: "Santo Domingo",
    yearsExperience: 12,
    description: "Servicios de diseño arquitectónico y planos estructurales para residencias y proyectos comerciales.",
    rating: 4.8,
    reviewCount: 47,
    completedProjects: 85,
    verified: true,
    whatsapp: "18091234567",
    startingPrice: 25000,
    portfolioImages: [],
    serviceAreas: ["Santo Domingo", "San Cristóbal"],
  },
  {
    id: "p2",
    name: "Ing. Carlos Pérez",
    trade: "Ingeniero Estructural",
    categorySlug: "ingenieros-estructurales",
    phaseId: 1,
    location: "Santiago",
    city: "Santiago",
    yearsExperience: 15,
    description: "Cálculos estructurales y supervisión de obra para edificaciones de hasta 10 niveles.",
    rating: 4.9,
    reviewCount: 62,
    completedProjects: 120,
    verified: true,
    whatsapp: "18099876543",
    startingPrice: 35000,
    portfolioImages: [],
    serviceAreas: ["Santiago", "Jarabacoa"],
  },
  {
    id: "p3",
    name: "José Martínez Construcciones",
    trade: "Contratista General",
    categorySlug: "contratistas-generales",
    phaseId: 3,
    location: "Punta Cana",
    city: "Punta Cana",
    yearsExperience: 20,
    description: "Construcción llave en mano de residencias y villas turísticas en la zona Este.",
    rating: 4.7,
    reviewCount: 93,
    completedProjects: 200,
    verified: true,
    whatsapp: "18095551234",
    startingPrice: 500000,
    portfolioImages: [],
    serviceAreas: ["Punta Cana", "La Romana"],
  },
  {
    id: "p4",
    name: "ElectriPro RD",
    trade: "Electricista",
    categorySlug: "electricistas",
    phaseId: 4,
    location: "Santo Domingo",
    city: "Santo Domingo",
    yearsExperience: 8,
    description: "Instalaciones eléctricas residenciales y comerciales. Certificados CDEEE.",
    rating: 4.6,
    reviewCount: 31,
    completedProjects: 55,
    verified: true,
    whatsapp: "18097771234",
    startingPrice: 15000,
    portfolioImages: [],
    serviceAreas: ["Santo Domingo", "San Cristóbal"],
  },
  {
    id: "p5",
    name: "Plomería Dominicana",
    trade: "Plomero",
    categorySlug: "plomeros",
    phaseId: 4,
    location: "Santiago",
    city: "Santiago",
    yearsExperience: 10,
    description: "Instalación y reparación de sistemas de plomería. Trabajo garantizado.",
    rating: 4.5,
    reviewCount: 28,
    completedProjects: 75,
    verified: false,
    whatsapp: "18098881234",
    startingPrice: 8000,
    portfolioImages: [],
    serviceAreas: ["Santiago"],
  },
  {
    id: "p6",
    name: "Pinturas del Caribe",
    trade: "Pintor",
    categorySlug: "pintores",
    phaseId: 5,
    location: "La Romana",
    city: "La Romana",
    yearsExperience: 6,
    description: "Pintura interior y exterior. Acabados decorativos y texturas especiales.",
    rating: 4.4,
    reviewCount: 19,
    completedProjects: 40,
    verified: false,
    whatsapp: "18096661234",
    startingPrice: 12000,
    portfolioImages: [],
    serviceAreas: ["La Romana", "Punta Cana"],
  },
  {
    id: "p7",
    name: "Excavaciones del Norte",
    trade: "Excavación",
    categorySlug: "excavacion",
    phaseId: 2,
    location: "Jarabacoa",
    city: "Jarabacoa",
    yearsExperience: 18,
    description: "Excavación, movimiento de tierra y preparación de terrenos para construcción.",
    rating: 4.7,
    reviewCount: 35,
    completedProjects: 150,
    verified: true,
    whatsapp: "18094441234",
    startingPrice: 20000,
    portfolioImages: [],
    serviceAreas: ["Jarabacoa", "Santiago"],
  },
  {
    id: "p8",
    name: "Solar Tech RD",
    trade: "Instalador de Paneles Solares",
    categorySlug: "paneles-solares",
    phaseId: 4,
    location: "Santo Domingo",
    city: "Santo Domingo",
    yearsExperience: 5,
    description: "Diseño e instalación de sistemas solares fotovoltaicos residenciales y comerciales.",
    rating: 4.8,
    reviewCount: 22,
    completedProjects: 35,
    verified: true,
    whatsapp: "18093331234",
    startingPrice: 45000,
    portfolioImages: [],
    serviceAreas: ["Santo Domingo", "Santiago", "Punta Cana"],
  },
];

export const MATERIALS: Material[] = [
  {
    id: "m1",
    name: "Cemento Gris Portland Tipo I",
    category: "Cemento",
    supplier: "Ferretería Nacional",
    location: "Santo Domingo",
    price: 380,
    unit: "saco (42.5kg)",
    bulkPrice: 350,
    bulkUnit: "50+ sacos",
    delivery: true,
    whatsapp: "18091112233",
    description: "Cemento Portland tipo I para uso general en construcción.",
  },
  {
    id: "m2",
    name: "Varilla Corrugada 3/8\"",
    category: "Varilla",
    supplier: "Acero del Caribe",
    location: "Santiago",
    price: 285,
    unit: "unidad (20 pies)",
    bulkPrice: 260,
    bulkUnit: "100+ unidades",
    delivery: true,
    whatsapp: "18092223344",
    description: "Varilla de acero corrugada grado 60 para refuerzo estructural.",
  },
  {
    id: "m3",
    name: "Block de 6\"",
    category: "Blocks",
    supplier: "Bloques Dominicanos",
    location: "San Cristóbal",
    price: 22,
    unit: "unidad",
    bulkPrice: 18,
    bulkUnit: "1000+ unidades",
    delivery: true,
    whatsapp: "18093334455",
    description: "Block de concreto de 6 pulgadas para muros y paredes.",
  },
  {
    id: "m4",
    name: "Arena Lavada",
    category: "Arena",
    supplier: "Agregados del Este",
    location: "La Romana",
    price: 8500,
    unit: "metro cúbico",
    delivery: true,
    whatsapp: "18094445566",
    description: "Arena lavada de río para mezcla de concreto y mortero.",
  },
  {
    id: "m5",
    name: "Pintura Látex Interior",
    category: "Pintura",
    supplier: "Pinturas Caribe",
    location: "Santo Domingo",
    price: 1200,
    unit: "galón",
    bulkPrice: 1050,
    bulkUnit: "10+ galones",
    delivery: true,
    whatsapp: "18095556677",
    description: "Pintura de látex acrílica para interiores. Acabado mate, lavable.",
  },
  {
    id: "m6",
    name: "Zinc Galvanizado Cal. 26",
    category: "Techos metálicos",
    supplier: "Techos del Norte",
    location: "Santiago",
    price: 850,
    unit: "lámina (12 pies)",
    bulkPrice: 780,
    bulkUnit: "50+ láminas",
    delivery: true,
    whatsapp: "18096667788",
    description: "Lámina de zinc galvanizado calibre 26 para techado.",
  },
];

export const POPULAR_CATEGORIES = [
  { name: "Arquitectos", slug: "arquitectos", count: 48 },
  { name: "Ingenieros", slug: "ingenieros-estructurales", count: 35 },
  { name: "Contratistas", slug: "contratistas-generales", count: 92 },
  { name: "Electricistas", slug: "electricistas", count: 67 },
  { name: "Plomeros", slug: "plomeros", count: 54 },
  { name: "Materiales", slug: "materiales", count: 120 },
  { name: "Excavación", slug: "excavacion", count: 23 },
  { name: "Pintores", slug: "pintores", count: 41 },
];
