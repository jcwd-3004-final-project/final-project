// pages/index.tsx

import React, { useState, useEffect } from "react";
import axios from "axios";
import StoreModal from "../../components/storeModal";
import { useRouter } from "next/router";

interface Store {
  store_id: number;
  name: string;
  address: string;
  city?: string;
  latitude: number;
  longitude: number;
  store_admin?: string | null;
}

export default function Home() {
  // Menggunakan Next.js Router
  const router = useRouter();

  const [stores, setStores] = useState<Store[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentStore, setCurrentStore] = useState<Partial<Store>>({});

  const BASE_URL = "http://localhost:8000/v1/api";

  const [assignData, setAssignData] = useState({
    storeName: "",
    adminUserId: "",
  });
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  const fetchStores = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/stores`);
      setStores(res.data);
    } catch (error) {
      console.error("Error fetching stores:", error);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const handleOpenCreateModal = () => {
    setIsEditMode(false);
    setIsModalOpen(true);
    setCurrentStore({
      name: "",
      address: "",
      city: "",
      latitude: 0,
      longitude: 0,
    });
  };

  // Buka modal Edit
  const handleOpenEditModal = (store: Store) => {
    setIsEditMode(true);
    setIsModalOpen(true);
    setCurrentStore(store);
  };

  // Submit modal (Create/Edit)
  const handleSubmitStore = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditMode && currentStore.store_id) {
        // Update store
        await axios.put(`${BASE_URL}/stores/${currentStore.store_id}`, currentStore);
      } else {
        // Create store
        await axios.post(`${BASE_URL}/stores`, currentStore);
      }
      setIsModalOpen(false);
      fetchStores();
    } catch (error) {
      console.error("Error submitting store:", error);
    }
  };

  // Delete store
  const handleDeleteStore = async (storeId: number) => {
    try {
      await axios.delete(`${BASE_URL}/stores/${storeId}`);
      fetchStores();
    } catch (error) {
      console.error("Error deleting store:", error);
    }
  };

  // Submit assign admin - sekarang berdasarkan nama toko
  const handleAssignAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Cari store berdasarkan nama
      const selectedStore = stores.find((s) => s.name === assignData.storeName);
      if (!selectedStore) {
        alert("Store not found. Please check the store name again.");
        return;
      }

      // Memanggil endpoint patch, gunakan store_id yang ditemukan
      await axios.patch(`${BASE_URL}/stores/${selectedStore.store_id}/assign-admin`, {
        adminUserId: assignData.adminUserId,
      });

      setIsAssignModalOpen(false);
      fetchStores();
    } catch (error) {
      console.error("Error assigning admin:", error);
      alert("Failed to assign admin. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Store Management</h1>

        {/* Tombol Create */}
        <button
          onClick={handleOpenCreateModal}
          className="bg-green-500 text-white py-2 px-4 rounded mb-4"
        >
          Create New Store
        </button>

        {/* Tombol Assign Admin */}
        <button
          onClick={() => {
            // Reset state assignData setiap kali buka modal
            setAssignData({ storeName: "", adminUserId: "" });
            setIsAssignModalOpen(true);
          }}
          className="bg-yellow-500 text-white py-2 px-4 rounded mb-4 ml-4"
        >
          Assign Admin
        </button>

        {/* Tambahan: Tombol menuju /superadmin/CRUD */}
        <button
          onClick={() => router.push("/superadmin/CRUD")}
          className="bg-blue-600 text-white py-2 px-4 rounded mb-4 ml-4"
        >
          Add Product
        </button>

        {/* Tabel daftar store */}
        <div className="bg-white shadow-md rounded-lg p-4">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-4">Store Name</th>
                <th className="text-left py-2 px-4">Address</th>
                <th className="text-left py-2 px-4">Admin</th>
                <th className="text-left py-2 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {stores.map((store) => (
                <tr key={store.store_id} className="border-b">
                  <td className="py-2 px-4">{store.name}</td>
                  <td className="py-2 px-4">{store.address}</td>
                  <td className="py-2 px-4">
                    {store.store_admin ? store.store_admin : "Unassigned"}
                  </td>
                  <td className="py-2 px-4">
                    <button
                      onClick={() => handleOpenEditModal(store)}
                      className="text-blue-500 mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteStore(store.store_id)}
                      className="text-red-500"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal Create/Edit */}
        {isModalOpen && (
          <StoreModal
            title={isEditMode ? "Edit Store" : "Create New Store"}
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleSubmitStore}
            data={currentStore}
            onChange={(field, value) =>
              setCurrentStore((prev) => ({ ...prev, [field]: value }))
            }
          />
        )}

        {/* Modal Assign Admin (by store name) */}
        {isAssignModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-600 bg-opacity-50 p-4">
            <div className="bg-white p-6 rounded-md w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Assign Admin</h2>
              <form onSubmit={handleAssignAdmin}>
                <div className="mb-3">
                  <label className="block mb-1 font-semibold">
                    Select Store (by Name)
                  </label>
                  <select
                    className="border w-full p-2"
                    value={assignData.storeName}
                    onChange={(e) =>
                      setAssignData({ ...assignData, storeName: e.target.value })
                    }
                    required
                  >
                    <option value="">-- Choose Store --</option>
                    {stores.map((store) => (
                      <option key={store.store_id} value={store.name}>
                        {store.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="block mb-1 font-semibold">Admin User ID</label>
                  <input
                    type="text"
                    className="border w-full p-2"
                    value={assignData.adminUserId}
                    onChange={(e) =>
                      setAssignData({ ...assignData, adminUserId: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="flex justify-end mt-4">
                  <button
                    type="button"
                    className="mr-3 bg-gray-300 py-2 px-4 rounded"
                    onClick={() => setIsAssignModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-yellow-500 text-white py-2 px-4 rounded"
                  >
                    Assign
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
