'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, MapPin } from 'lucide-react';

interface Address {
  id: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

export default function AddressesPage() {
  const { data: session } = useSession();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
    isDefault: false
  });

  useEffect(() => {
    if (session?.user?.id) {
      fetchAddresses();
    }
  }, [session]);

  const fetchAddresses = async () => {
    try {
      const response = await fetch('/api/buyer/addresses');
      if (response.ok) {
        const data = await response.json();
        setAddresses(data);
      }
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingAddress ? `/api/buyer/addresses/${editingAddress.id}` : '/api/buyer/addresses';
      const method = editingAddress ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchAddresses();
        resetForm();
      }
    } catch (error) {
      console.error('Failed to save address:', error);
    }
  };

  const handleDelete = async (addressId: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;

    try {
      const response = await fetch(`/api/buyer/addresses/${addressId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchAddresses();
      }
    } catch (error) {
      console.error('Failed to delete address:', error);
    }
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      const response = await fetch(`/api/buyer/addresses/${addressId}/default`, {
        method: 'PUT',
      });

      if (response.ok) {
        await fetchAddresses();
      }
    } catch (error) {
      console.error('Failed to set default address:', error);
    }
  };

  const startEdit = (address: Address) => {
    setEditingAddress(address);
    setFormData({
      fullName: address.fullName,
      phone: address.phone,
      street: address.street,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country,
      isDefault: address.isDefault
    });
    setShowAddForm(true);
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      phone: '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US',
      isDefault: false
    });
    setEditingAddress(null);
    setShowAddForm(false);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Addresses</h1>
        <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
          <Plus size={16} />
          Add New Address
        </Button>
      </div>

      {showAddForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{editingAddress ? 'Edit Address' : 'Add New Address'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Full Name"
                value={formData.fullName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, fullName: e.target.value })}
                required
              />
              <Input
                placeholder="Phone Number"
                value={formData.phone}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
              <Input
                placeholder="Street Address"
                value={formData.street}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, street: e.target.value })}
                className="md:col-span-2"
                required
              />
              <Input
                placeholder="City"
                value={formData.city}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, city: e.target.value })}
                required
              />
              <Input
                placeholder="State"
                value={formData.state}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, state: e.target.value })}
                required
              />
              <Input
                placeholder="ZIP Code"
                value={formData.zipCode}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, zipCode: e.target.value })}
                required
              />
              <Input
                placeholder="Country"
                value={formData.country}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, country: e.target.value })}
                required
              />
              <div className="md:col-span-2 flex gap-2">
                <Button type="submit" className="flex-1">
                  {editingAddress ? 'Update Address' : 'Add Address'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {addresses.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <MapPin size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No addresses yet</h3>
              <p className="text-gray-600 mb-4">Add your first address to start shopping</p>
              <Button onClick={() => setShowAddForm(true)}>Add Address</Button>
            </CardContent>
          </Card>
        ) : (
          addresses.map((address) => (
            <Card key={address.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{address.fullName}</h3>
                      {address.isDefault && (
                        <Badge variant="default">Default</Badge>
                      )}
                    </div>
                    <p className="text-gray-600 mb-1">{address.phone}</p>
                    <p className="text-gray-600 mb-1">{address.street}</p>
                    <p className="text-gray-600">
                      {address.city}, {address.state} {address.zipCode}
                    </p>
                    <p className="text-gray-600">{address.country}</p>
                  </div>
                  <div className="flex gap-2">
                    {!address.isDefault && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetDefault(address.id)}
                      >
                        Set Default
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEdit(address)}
                    >
                      <Edit size={16} />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(address.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
