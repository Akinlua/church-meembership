import React, { useState } from 'react';

const BackupRestore = () => {
  const [downloading, setDownloading] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [file, setFile] = useState(null);

  const handleDownload = async () => {
    setDownloading(true);
    setError('');
    setMessage('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:4000'}/backup/download`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to download backup');
      }

      // Create a blob from the response and trigger download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      // The content-disposition header might have the filename, but we can set a fallback
      const contentDisposition = response.headers.get('content-disposition');
      let fileName = 'backup.sql';
      if (contentDisposition && contentDisposition.indexOf('attachment') !== -1) {
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        const matches = filenameRegex.exec(contentDisposition);
        if (matches != null && matches[1]) { 
          fileName = matches[1].replace(/['"]/g, '');
        }
      }
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      
      setMessage('Backup downloaded successfully.');
    } catch (err) {
      console.error(err);
      setError('An error occurred while downloading the backup. Make sure PostgreSQL tools are installed on the server.');
    } finally {
      setDownloading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleRestore = async () => {
    if (!file) {
      setError('Please select a .sql backup file to restore.');
      return;
    }

    if (!window.confirm('WARNING: Restoring a backup will OVERWRITE your current database. Are you absolutely sure you want to proceed?')) {
      return;
    }

    setRestoring(true);
    setError('');
    setMessage('');

    const formData = new FormData();
    formData.append('backupFile', file);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:4000'}/backup/restore`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to restore backup');
      }

      setMessage('Backup restored successfully.');
      setFile(null);
      // clear the file input
      document.getElementById('backupFile').value = '';
    } catch (err) {
      console.error(err);
      setError(`An error occurred while restoring the backup: ${err.message}`);
    } finally {
      setRestoring(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Database Backup & Restore</h1>

      {message && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
          {message}
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {error}
        </div>
      )}

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 border-b pb-2">Download Backup</h2>
        <p className="text-gray-600 mb-4">
          Generate and download a full SQL backup of the current database. Keep this file safe.
        </p>
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
        >
          {downloading ? 'Generating Backup...' : 'Download Database Backup'}
        </button>
      </div>

      <div className="bg-white shadow rounded-lg p-6 border-l-4 border-red-500">
        <h2 className="text-xl font-semibold mb-4 border-b pb-2 text-red-600">Restore Backup</h2>
        <p className="text-gray-600 mb-4">
          <strong>Warning:</strong> Restoring a backup will permanently overwrite the current database. This action cannot be undone.
        </p>
        
        <div className="flex flex-col mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="backupFile">
            Select Backup File (.sql)
          </label>
          <input
            type="file"
            id="backupFile"
            accept=".sql"
            onChange={handleFileChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2"
          />
        </div>

        <button
          onClick={handleRestore}
          disabled={restoring || !file}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
        >
          {restoring ? 'Restoring Database...' : 'Restore Backup'}
        </button>
      </div>
    </div>
  );
};

export default BackupRestore;
