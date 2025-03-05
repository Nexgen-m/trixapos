import { useFrappeAuth, useFrappeGetDoc } from 'frappe-react-sdk';
import { useState, useEffect } from 'react';

export function useAuth() {
  const [username, setUsername] = useState<string>('Demo User');
  const { currentUser, isLoading: authLoading } = useFrappeAuth();

  const { data: userDetails, isLoading: userLoading, error: userError } = useFrappeGetDoc(
    'User',
    typeof currentUser === 'string' ? currentUser : '',
    {
      fields: ['name', 'full_name', 'email'],
    }
  );

  useEffect(() => {
    if (!authLoading && !userLoading && currentUser) {
      console.log("🔍 User Details:", userDetails);

      if (userDetails?.full_name) {
        setUsername(userDetails.full_name);
      } else if (typeof currentUser === 'string') {
        setUsername(currentUser);
      }
    }

    if (userError) {
      console.error("❌ Error fetching user details:", userError);
    }
  }, [currentUser, userDetails, authLoading, userLoading, userError]);

  return { currentUser, username, authLoading };
}
