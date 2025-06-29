"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import AdminShipmentManagement from "@/components/dashboard/admin/AdminShipmentManagement";
import { Download, FileText } from "lucide-react";

export default function AdminShipmentsPage() {
  const { data: session, status } = useSession();
  
  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session) {
    redirect("/auth/signin");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard/buyer");
  }

  const handleExportShipments = async (format: 'csv' | 'json' = 'csv') => {
    try {
      const response = await fetch(`/api/dashboard/admin/shipments/export?format=${format}`);
      if (response.ok) {
        if (format === 'csv') {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = url;
          a.download = `shipments_export_${new Date().toISOString().split('T')[0]}.csv`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
        } else {
          const data = await response.json();
          const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = url;
          a.download = `shipments_export_${new Date().toISOString().split('T')[0]}.json`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
        }
      }
    } catch (error) {
      console.error('Error exporting shipments:', error);
    }
  };

  return (
    <DashboardLayout userRole={session.user.role}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Shipment Management</h1>
            <p className="text-gray-600 mt-1">Track and manage all shipments, deliveries, and logistics</p>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => handleExportShipments('csv')}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2 transition-colors"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>
            <button 
              onClick={() => handleExportShipments('json')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
            >
              <FileText className="h-4 w-4" />
              Export JSON
            </button>
          </div>
        </div>
        
        <AdminShipmentManagement />
      </div>
    </DashboardLayout>
  );
}
