import { useCallback } from "react";

type AuthOptions = {
  email?: string;
  password?: string;
  callbackUrl?: string;
  redirect?: boolean;
};

function useAuth() {
  const callbackUrl =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("callbackUrl")
      : null;

  const signInWithCredentials = useCallback(async (options: AuthOptions) => {
    // Placeholder implementation
    console.log("Sign in:", options);
    if (options.redirect && options.callbackUrl) {
      window.location.href = options.callbackUrl;
    }
  }, []);

  const signUpWithCredentials = useCallback(async (options: AuthOptions) => {
    // Placeholder implementation
    console.log("Sign up:", options);
    if (options.redirect && options.callbackUrl) {
      window.location.href = options.callbackUrl;
    }
  }, []);

  const signInWithGoogle = useCallback(async (options: AuthOptions) => {
    console.log("Google sign in:", options);
    if (options.redirect && options.callbackUrl) {
      window.location.href = options.callbackUrl;
    }
  }, []);

  const signOut = useCallback(
    async (options: { callbackUrl?: string; redirect?: boolean }) => {
      console.log("Sign out:", options);
      if (options.redirect && options.callbackUrl) {
        window.location.href = options.callbackUrl;
      }
    },
    []
  );

  return {
    signInWithCredentials,
    signUpWithCredentials,
    signInWithGoogle,
    signOut,
  };
}

export default useAuth;
