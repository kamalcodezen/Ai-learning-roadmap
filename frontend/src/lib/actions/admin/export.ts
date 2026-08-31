export const exportAdminData = async (userId: string, entity: string) => {
  const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/export/${entity}?userId=${userId}`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to export data');
  }

  const blob = await response.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = `${entity}-export.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(downloadUrl);
};
