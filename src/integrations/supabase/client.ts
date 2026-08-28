import { localDb, LocalUser } from "@/lib/localDb";

// Local Client Adapter providing drop-in compatibility for localDb
export const supabase = {
  auth: {
    getUser: async () => {
      const user = localDb.getCurrentUser();
      return {
        data: { user: user ? { ...user, user_metadata: { name: user.name } } : null },
        error: null,
      };
    },
    getSession: async () => {
      const session = localDb.getSession();
      return {
        data: {
          session: session
            ? {
                user: { ...session.user, user_metadata: { name: session.user.name } },
                access_token: "local-token",
              }
            : null,
        },
        error: null,
      };
    },
    signInWithPassword: async ({ email, password }: { email: string; password?: string }) => {
      const { user } = localDb.signIn(email, password);
      return { data: { user, session: { user } }, error: null };
    },
    signUp: async ({
      email,
      options,
    }: {
      email: string;
      password?: string;
      options?: { data?: { name?: string } };
    }) => {
      const { user } = localDb.signUp(email, options?.data?.name);
      return { data: { user, session: { user } }, error: null };
    },
    signOut: async () => {
      localDb.signOut();
      return { error: null };
    },
    onAuthStateChange: (
      callback: (event: string, session: { user: LocalUser } | null) => void
    ) => {
      const listener = localDb.onAuthStateChange((user) => {
        callback(user ? "SIGNED_IN" : "SIGNED_OUT", user ? { user } : null);
      });
      return {
        data: {
          subscription: listener,
        },
      };
    },
  },
  storage: {
    from: () => ({
      upload: async () => ({ error: null }),
      getPublicUrl: (filePath: string) => ({ data: { publicUrl: filePath } }),
    }),
  },
};