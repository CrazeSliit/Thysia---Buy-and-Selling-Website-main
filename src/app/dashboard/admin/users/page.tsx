"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import AdminUserManagement from "@/components/dashboard/admin/AdminUserManagement";
import AddUserModal from "@/components/dashboard/admin/AddUserModal";
import { Download, Plus, UserPlus } from "lucide-react";

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const [showAddUser, setShowAddUser] = useState(false);
  
  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session) {
    redirect("/auth/signin");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard/buyer");
  }

  const handleExportUsers = async () => {
    try {
      const response = await fetch('/api/admin/users/export?format=csv');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting users:', error);
    }
  };

  return (
    <DashboardLayout userRole={session.user.role}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-1">Manage all users, roles, and permissions</p>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={handleExportUsers}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2 transition-colors"
            >
              <Download className="h-4 w-4" />
              Export Users
            </button>
            <button 
              onClick={() => setShowAddUser(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
            >
              <UserPlus className="h-4 w-4" />
              Add User
            </button>
          </div>
        </div>
        
        <AdminUserManagement />

        <AddUserModal
          isOpen={showAddUser}
          onClose={() => setShowAddUser(false)}
          onUserAdded={() => {
            // The AdminUserManagement component will refresh itself
            console.log('User added successfully');
          }}
        />
      </div>
    </DashboardLayout>
  );
}
