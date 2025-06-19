import { useState } from 'react';
import UserTable from '@/components/admin/UserTable';
import UserForm from '@/components/admin/UserForm';
import type { User } from '@/types/admin';

const UserManagement = () => {
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleEditUser = (user: User) => {
    setEditingUser(user);
  };

  const handleUserSaved = () => {
    setEditingUser(null);
    // Trigger UserTable refresh
    setRefreshKey(prev => prev + 1);
  };

  const handleUserCancel = () => {
    setEditingUser(null);
  };

  const handleUsersUpdated = () => {
    // Trigger UserTable refresh
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <UserForm 
        editingUser={editingUser} 
        onUserSaved={handleUserSaved}
        onCancel={handleUserCancel}
      />
      <UserTable 
        onEditUser={handleEditUser}
        onUsersUpdated={handleUsersUpdated}
        refreshKey={refreshKey}
      />
    </div>
  );
};

export default UserManagement;