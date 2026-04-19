-- 1. Add slug column to providers
ALTER TABLE public.providers
ADD COLUMN IF NOT EXISTS slug text;

-- 2. Unique partial index (case-insensitive) on slug when present
CREATE UNIQUE INDEX IF NOT EXISTS providers_slug_unique_idx
ON public.providers (lower(slug))
WHERE slug IS NOT NULL;

-- 3. Validation trigger: format + reserved words (use trigger, not CHECK)
CREATE OR REPLACE FUNCTION public.validate_provider_slug()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
  v_reserved text[] := ARRAY[
    'admin', 'api', 'dashboard', 'auth', 'proveedor', 'proveedores',
    'directorio', 'empresas', 'materiales', 'conocimiento', 'perfil',
    'pricing', 'nuevo', 'editar', 'null', 'undefined', 'login', 'logout',
    'signup', 'register', 'settings', 'configuracion', 'buscar', 'publicar',
    'guias', 'proyectos', 'about', 'contacto', 'help', 'soporte'
  ];
BEGIN
  IF NEW.slug IS NULL THEN
    RETURN NEW;
  END IF;

  -- Normalize to lowercase
  NEW.slug := lower(trim(NEW.slug));

  -- Empty after trim => treat as null
  IF NEW.slug = '' THEN
    NEW.slug := NULL;
    RETURN NEW;
  END IF;

  -- Format: 3-40 chars, lowercase alnum + hyphens, no leading/trailing hyphen
  IF NEW.slug !~ '^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])$' THEN
    RAISE EXCEPTION 'URL personalizada invalida. Usa entre 3 y 40 caracteres: solo letras minusculas, numeros y guiones (no al inicio o final).'
      USING ERRCODE = 'check_violation';
  END IF;

  -- No double hyphens
  IF NEW.slug LIKE '%--%' THEN
    RAISE EXCEPTION 'URL personalizada invalida: no se permiten guiones consecutivos.'
      USING ERRCODE = 'check_violation';
  END IF;

  -- Reserved words
  IF NEW.slug = ANY(v_reserved) THEN
    RAISE EXCEPTION 'Esta URL esta reservada. Por favor elige otra.'
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_provider_slug_trigger ON public.providers;
CREATE TRIGGER validate_provider_slug_trigger
BEFORE INSERT OR UPDATE OF slug ON public.providers
FOR EACH ROW
EXECUTE FUNCTION public.validate_provider_slug();