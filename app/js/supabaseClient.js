// Cliente único do Supabase, compartilhado por toda a plataforma.
// Import via ESM direto do CDN — sem build step, mas já no formato que um
// bundler (Vite/Node/React, no futuro) entende sem precisar reescrever nada.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config.js";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
