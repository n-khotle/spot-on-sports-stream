import { useState } from 'react';
import PageForm from '@/components/admin/PageForm';
import PagesTable from '@/components/admin/PagesTable';
import type { Page } from '@/types/admin';

const PageManagement = () => {
  const [editingPage, setEditingPage] = useState<Page | null>(null);

  const handleEditPage = (page: Page) => {
    setEditingPage(page);
  };

  const handlePageSaved = () => {
    setEditingPage(null);
  };

  const handlePageCancel = () => {
    setEditingPage(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <PageForm 
        editingPage={editingPage} 
        onPageSaved={handlePageSaved}
        onCancel={handlePageCancel}
      />
      <PagesTable 
        onEditPage={handleEditPage}
      />
    </div>
  );
};

export default PageManagement;