import { supabase } from "../lib/supabaseClient";

interface FoundUser {
  id: string;
  username?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  avatarUrl?: string | null;
}

export async function findUserByEmailOrUsername(
  identifier: string
): Promise<FoundUser | null> {
  const rpc = await supabase.rpc("get_profile_by_username", {
    p_username: identifier,
  });
  if (!rpc.error && Array.isArray(rpc.data) && rpc.data.length > 0) {
    const row: {
      id: string;
      username: string | null;
      first_name: string | null;
      last_name: string | null;
      avatar_url: string | null;
    } = rpc.data[0];
    return {
      id: row.id,
      username: row.username,
      firstName: row.first_name ?? null,
      lastName: row.last_name ?? null,
      avatarUrl: row.avatar_url ?? null,
    };
  }

  const fallback = await supabase
    .from("profiles")
    .select("id, username, first_name, last_name, avatar_url")
    .ilike("username", identifier)
    .maybeSingle();
  if (fallback.error || !fallback.data) {
    return null;
  }
  return {
    id: fallback.data.id,
    username: fallback.data.username,
    firstName: fallback.data.first_name ?? null,
    lastName: fallback.data.last_name ?? null,
    avatarUrl: fallback.data.avatar_url ?? null,
  };
}
