import * as React from "react";

type User = {
  id: string;
  email?: string;
  name?: string;
} | null;

const useUser = () => {
  const [user, setUser] = React.useState<User>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch("/api/auth/token")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setUser(data?.user || null))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const refetchUser = React.useCallback(() => {
    setLoading(true);
    fetch("/api/auth/token")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setUser(data?.user || null))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  return { user, data: user, loading, refetch: refetchUser };
};

export { useUser };
export default useUser;
