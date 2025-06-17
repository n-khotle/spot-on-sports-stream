import { useState } from 'react';
import UserTable from '@/components/admin/UserTable';
import UserForm from '@/components/admin/UserForm';
import type { User } from '@/types/admin';

const UserManagement = () => {
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const handleEditUser = (user: User) => {
    setEditingUser(user);
  };

  const handleUserSaved = () => {
    setEditingUser(null);
  };

  const handleUserCancel = () => {
    setEditingUser(null);
  };

  const handleUsersUpdated = () => {
    // This can be used for any additional logic when users are updated
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
      />
    </div>
  );
};

export default UserManagement;