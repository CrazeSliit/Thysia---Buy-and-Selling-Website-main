'use client';

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

export default function DebugSession() {
  const { data: session, status } = useSession();

  useEffect(() => {
    console.log('🔍 Session Debug:', {
      status,
      hasSession: !!session,
      user: session?.user,
      sessionData: session
    });
  }, [session, status]);

  return (
    <div className="p-4 bg-gray-100 rounded-md">
      <h3 className="font-bold mb-2">Session Debug Info</h3>
      <div className="space-y-2 text-sm">
        <p><strong>Status:</strong> {status}</p>
        <p><strong>Has Session:</strong> {String(!!session)}</p>
        {session?.user && (
          <>
            <p><strong>User ID:</strong> {session.user.id}</p>
            <p><strong>Email:</strong> {session.user.email}</p>
            <p><strong>Role:</strong> {session.user.role}</p>
            <p><strong>Active:</strong> {String(session.user.isActive)}</p>
            {session.user.sellerProfile && (
              <>
                <p><strong>Seller ID:</strong> {session.user.sellerProfile.id}</p>
                <p><strong>Business:</strong> {session.user.sellerProfile.businessName}</p>
                <p><strong>Verified:</strong> {String(session.user.sellerProfile.isVerified)}</p>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
