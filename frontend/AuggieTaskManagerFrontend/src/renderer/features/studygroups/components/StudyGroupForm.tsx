import React, { useEffect, useState } from 'react';
import { useStudyGroups } from '../hooks/useStudyGroups';

interface StudyGroupFormProps {
  groupID?: number | null;
  onBack: () => void;
}

export const StudyGroupForm: React.FC<StudyGroupFormProps> = ({ groupID, onBack }) => {
  const { groups, fetchAllStudyGroups, createStudyGroup, updateStudyGroup, loading, error } = useStudyGroups();

  const isEditing = !!groupID;
  const existingGroup = groups.find((g) => g.groupID === groupID);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [image, setImage] = useState<File | null>(null);

  useEffect(() => {
    if (isEditing && groups.length === 0) {
      fetchAllStudyGroups();
    }
  }, []);

  useEffect(() => {
    if (existingGroup) {
      setName(existingGroup.name);
      setDescription(existingGroup.description);
      setIsPrivate(existingGroup.private);
    }
  }, [existingGroup]);

  const handleSubmit = async () => {
    if (isEditing && groupID) {
      const success = await updateStudyGroup(groupID, name, description, isPrivate);
      if (success) onBack();
    } else {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('private', String(isPrivate));
      if (image) formData.append('image', image);

      const result = await createStudyGroup(formData);
      if (result) onBack();
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '24px' }}>
      <h2 style={{ fontSize: '22px', fontWeight: 600, marginBottom: '24px' }}>
        {isEditing ? 'Edit Study Group' : 'Create Study Group'}
      </h2>

      {error && <p style={{ color: 'red', marginBottom: '16px' }}>Error: {error}</p>}

      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '15px' }}
        />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '15px' }}
        />
      </div>

      <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <label style={{ fontWeight: 500 }}>Private</label>
        <input
          type="checkbox"
          checked={isPrivate}
          onChange={(e) => setIsPrivate(e.target.checked)}
          style={{ width: '16px', height: '16px' }}
        />
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files?.[0] ?? null)}
        />
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          onClick={handleSubmit}
          disabled={loading || !name}
          style={{
            padding: '8px 20px',
            fontSize: '15px',
            borderRadius: '4px',
            border: 'none',
            background: loading || !name ? '#ccc' : '#1a73e8',
            color: '#fff',
            cursor: loading || !name ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Group'}
        </button>
        <button
          onClick={onBack}
          style={{
            padding: '8px 20px',
            fontSize: '15px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            background: '#fff',
            color: '#333',
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};