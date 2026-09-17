-- ============================================================
-- GAMIFIKATHINK — Gamification (XP & Level)
-- Jalankan section ini di Supabase Dashboard > SQL Editor
-- (setelah menjalankan supabase-schema.sql)
-- ============================================================

-- Kurva level: XP dibutuhkan untuk naik dari level L ke L+1 = L * 100
CREATE OR REPLACE FUNCTION public.add_xp(amount INTEGER)
RETURNS TABLE (xp INTEGER, level INTEGER, leveled_up BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  current_xp INTEGER;
  current_level INTEGER;
  old_level INTEGER;
BEGIN
  SELECT p.xp, p.level INTO current_xp, current_level
  FROM public.profiles p
  WHERE p.id = auth.uid();

  IF NOT FOUND THEN
    INSERT INTO public.profiles (id, email)
    VALUES (auth.uid(), NULL)
    RETURNING xp, level INTO current_xp, current_level;
  END IF;

  current_xp := current_xp + amount;
  old_level := current_level;

  WHILE current_xp >= current_level * 100 LOOP
    current_xp := current_xp - (current_level * 100);
    current_level := current_level + 1;
  END LOOP;

  UPDATE public.profiles
  SET xp = current_xp,
      level = current_level,
      updated_at = now()
  WHERE id = auth.uid();

  RETURN QUERY
  SELECT current_xp, current_level, (current_level > old_level);
END;
$$;

GRANT EXECUTE ON FUNCTION public.add_xp(INTEGER) TO authenticated;
