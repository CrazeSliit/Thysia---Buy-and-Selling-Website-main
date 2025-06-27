"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Settings,
  Shield,
  Mail,
  Bell,
  CreditCard,
  Truck,
  Globe,
  Database,
  Key,
  Lock,
  Users,
  Package,
  DollarSign,
  Save,
  RefreshCw
} from "lucide-react";

interface PlatformSettings {
  general: {
    siteName: string;
    siteDescription: string;
    supportEmail: string;
    maintenanceMode: boolean;
    allowRegistration: boolean;
  };
  payment: {
    stripePublishableKey: string;
    stripeSecretKey: string;
    paypalClientId: string;
    minimumOrderAmount: number;
    currency: string;
    taxRate: number;
  };
  shipping: {
    freeShippingThreshold: number;
    standardShippingCost: number;
    expressShippingCost: number;
    maxDeliveryDistance: number;
    estimatedDeliveryDays: number;
  };
  security: {
    passwordMinLength: number;
    sessionTimeout: number;
    maxLoginAttempts: number;
    requireEmailVerification: boolean;
    enableTwoFactor: boolean;
  };
  notifications: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
    adminAlerts: boolean;
    orderUpdates: boolean;
  };
  features: {
    enableReviews: boolean;
    enableWishlist: boolean;
    enableLiveChat: boolean;
    enableAdvancedSearch: boolean;
    enableRecommendations: boolean;
  };
}

export default function AdminSettings() {
  const [settings, setSettings] = useState<PlatformSettings>({
    general: {
      siteName: "Thysia Marketplace",
      siteDescription: "Your premier e-commerce destination",
      supportEmail: "support@thysia.com",
      maintenanceMode: false,
      allowRegistration: true,
    },
    payment: {
      stripePublishableKey: "pk_test_...",
      stripeSecretKey: "sk_test_...",
      paypalClientId: "",
      minimumOrderAmount: 10,
      currency: "USD",
      taxRate: 8.5,
    },
    shipping: {
      freeShippingThreshold: 50,
      standardShippingCost: 5.99,
      expressShippingCost: 12.99,
      maxDeliveryDistance: 50,
      estimatedDeliveryDays: 3,
    },
    security: {
      passwordMinLength: 8,
      sessionTimeout: 24,
      maxLoginAttempts: 5,
      requireEmailVerification: true,
      enableTwoFactor: false,
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      adminAlerts: true,
      orderUpdates: true,
    },
    features: {
      enableReviews: true,
      enableWishlist: true,
      enableLiveChat: false,
      enableAdvancedSearch: true,
      enableRecommendations: true,
    },
  });

  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      // TODO: Implement API call to save settings
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock delay
      console.log("Settings saved:", settings);
    } catch (error) {
      console.error("Error saving settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    // Reset to default values
    setSettings({
      general: {
        siteName: "Thysia Marketplace",
        siteDescription: "Your premier e-commerce destination",
        supportEmail: "support@thysia.com",
        maintenanceMode: false,
        allowRegistration: true,
      },
      payment: {
        stripePublishableKey: "",
        stripeSecretKey: "",
        paypalClientId: "",
        minimumOrderAmount: 10,
        currency: "USD",
        taxRate: 8.5,
      },
      shipping: {
        freeShippingThreshold: 50,
        standardShippingCost: 5.99,
        expressShippingCost: 12.99,
        maxDeliveryDistance: 50,
        estimatedDeliveryDays: 3,
      },
      security: {
        passwordMinLength: 8,
        sessionTimeout: 24,
        maxLoginAttempts: 5,
        requireEmailVerification: true,
        enableTwoFactor: false,
      },
      notifications: {
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
        adminAlerts: true,
        orderUpdates: true,
      },
      features: {
        enableReviews: true,
        enableWishlist: true,
        enableLiveChat: false,
        enableAdvancedSearch: true,
        enableRecommendations: true,
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="h-5 w-5 mr-2" />
            General Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Site Name
              </label>
              <input
                type="text"
                value={settings.general.siteName}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  general: { ...prev.general, siteName: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Support Email
              </label>
              <input
                type="email"
                value={settings.general.supportEmail}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  general: { ...prev.general, supportEmail: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Site Description
            </label>
            <textarea
              value={settings.general.siteDescription}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                general: { ...prev.general, siteDescription: e.target.value }
              }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex space-x-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.general.maintenanceMode}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  general: { ...prev.general, maintenanceMode: e.target.checked }
                }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Maintenance Mode</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.general.allowRegistration}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  general: { ...prev.general, allowRegistration: e.target.checked }
                }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Allow New Registrations</span>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Payment Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="h-5 w-5 mr-2" />
            Payment Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stripe Publishable Key
              </label>
              <input
                type="text"
                value={settings.payment.stripePublishableKey}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  payment: { ...prev.payment, stripePublishableKey: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="pk_..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stripe Secret Key
              </label>
              <input
                type="password"
                value={settings.payment.stripeSecretKey}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  payment: { ...prev.payment, stripeSecretKey: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="sk_..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Order Amount ($)
              </label>
              <input
                type="number"
                value={settings.payment.minimumOrderAmount}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  payment: { ...prev.payment, minimumOrderAmount: parseFloat(e.target.value) }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tax Rate (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={settings.payment.taxRate}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  payment: { ...prev.payment, taxRate: parseFloat(e.target.value) }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shipping Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Truck className="h-5 w-5 mr-2" />
            Shipping Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Free Shipping Threshold ($)
              </label>
              <input
                type="number"
                value={settings.shipping.freeShippingThreshold}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  shipping: { ...prev.shipping, freeShippingThreshold: parseFloat(e.target.value) }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Standard Shipping Cost ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={settings.shipping.standardShippingCost}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  shipping: { ...prev.shipping, standardShippingCost: parseFloat(e.target.value) }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Express Shipping Cost ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={settings.shipping.expressShippingCost}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  shipping: { ...prev.shipping, expressShippingCost: parseFloat(e.target.value) }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Security Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password Minimum Length
              </label>
              <input
                type="number"
                value={settings.security.passwordMinLength}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  security: { ...prev.security, passwordMinLength: parseInt(e.target.value) }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Login Attempts
              </label>
              <input
                type="number"
                value={settings.security.maxLoginAttempts}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  security: { ...prev.security, maxLoginAttempts: parseInt(e.target.value) }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex space-x-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.security.requireEmailVerification}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  security: { ...prev.security, requireEmailVerification: e.target.checked }
                }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Require Email Verification</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.security.enableTwoFactor}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  security: { ...prev.security, enableTwoFactor: e.target.checked }
                }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Enable Two-Factor Authentication</span>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Feature Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Feature Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.features.enableReviews}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  features: { ...prev.features, enableReviews: e.target.checked }
                }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Product Reviews</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.features.enableWishlist}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  features: { ...prev.features, enableWishlist: e.target.checked }
                }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Wishlist</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.features.enableLiveChat}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  features: { ...prev.features, enableLiveChat: e.target.checked }
                }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Live Chat Support</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.features.enableAdvancedSearch}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  features: { ...prev.features, enableAdvancedSearch: e.target.checked }
                }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Advanced Search</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.features.enableRecommendations}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  features: { ...prev.features, enableRecommendations: e.target.checked }
                }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Product Recommendations</span>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Save Actions */}
      <div className="flex justify-end space-x-4">
        <button
          onClick={handleReset}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Reset to Defaults
        </button>
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
        >
          {loading ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
