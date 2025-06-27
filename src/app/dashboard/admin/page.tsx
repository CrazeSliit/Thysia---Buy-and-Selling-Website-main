import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import AdminOverview from "@/components/dashboard/admin/AdminOverview";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/auth/signin");
  }

  // Check if user has admin role
  if (session.user.role !== "ADMIN") {
    redirect("/dashboard/buyer");
  }
  return (
    <DashboardLayout userRole={session.user.role}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              Admin Access
            </span>
          </div>
        </div>
        <AdminOverview />
      </div>
    </DashboardLayout>
  );
}
