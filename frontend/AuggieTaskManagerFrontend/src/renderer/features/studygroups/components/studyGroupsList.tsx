import React, { useEffect, useState } from 'react';
import { useStudyGroups } from '../hooks/useStudyGroups';
import { API_BASE } from '../../../../config';
import { AuthService } from '../../auth/services/authService';

const currentUser = AuthService.getCurrentUser();
const currentUserID = currentUser?.user?.id;

interface StudyGroupListProps {
  onCreateClick: () => void;
  onEditClick: (groupID: number) => void;
}

export const StudyGroupList: React.FC<StudyGroupListProps> = ({ onCreateClick, onEditClick }) => {
  const { groups, loading, error, fetchMyStudyGroups, fetchAllStudyGroups, joinStudyGroup, leaveStudyGroup } = useStudyGroups();
  const [showingAll, setShowingAll] = useState(false);

  useEffect(() => {
    fetchMyStudyGroups();
  }, []);

  const handleToggle = async () => {
    if (showingAll) {
      await fetchMyStudyGroups();
    } else {
      await fetchAllStudyGroups();
    }
    setShowingAll((prev) => !prev);
  };

  if (loading) return <p>Loading study groups...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;

  return (
    <div className="control-pane">
      <div className="control-section">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <p style={{ fontSize: '20px', fontWeight: 600, margin: 0 }}>
            {showingAll ? 'All Study Groups' : 'My Study Groups'}
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleToggle}
              style={{
                padding: '6px 14px',
                fontSize: '14px',
                cursor: 'pointer',
                borderRadius: '4px',
                border: '1px solid #ccc',
                background: showingAll ? '#f0f0f0' : '#1a73e8',
                color: showingAll ? '#333' : '#fff',
              }}
            >
              {showingAll ? 'View My Groups' : 'View All Groups'}
            </button>
            <button
              onClick={onCreateClick}
              style={{
                padding: '6px 14px',
                fontSize: '14px',
                cursor: 'pointer',
                borderRadius: '4px',
                border: 'none',
                background: '#34a853',
                color: '#fff',
              }}
            >
              + Create Group
            </button>
          </div>
        </div>
        <div id="list-study-groups" style={{ maxHeight: 500, overflowY: 'auto' }}>
          {groups.length === 0 && <p>No study groups found.</p>}
          {groups.map((group) => (
            <div
              key={group.groupID}
              className="e-list-wrapper"
              style={{ borderBottom: 'inset', padding: '10px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', whiteSpace: 'normal' }}>
                {group.image ? (
                  <img
                    className="e-avatar"
                    src={`${API_BASE}${group.image}`}
                    alt={group.name}
                    style={{
                      width: '100px',
                      height: '100px',
                      borderRadius: '4px',
                      objectFit: 'cover',
                      flexShrink: 0,
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '100px',
                      height: '100px',
                      borderRadius: '4px',
                      background: '#BCBCBC',
                      flexShrink: 0,
                    }}
                  />
                )}
                <div
                  style={{
                    marginLeft: '20px',
                    textAlign: 'left',
                    maxWidth: '600px',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <span style={{ fontSize: '18px', fontWeight: 600, paddingBottom: '3px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {group.name}
                    {group.private ? (
                      <span title="Private" style={{ fontSize: '14px' }}>🔒</span>
                    ) : (
                      <span title="Public" style={{ fontSize: '14px' }}>🌐</span>
                    )}
                  </span>
                  <span style={{ fontSize: '14px', color: '#666', paddingBottom: '6px' }}>
                    {group.members.length} member{group.members.length !== 1 ? 's' : ''} · Created{' '}
                    {new Date(group.created_at).toLocaleDateString()}
                  </span>
                  <div style={{ fontSize: '15px' }}>{group.description}</div>
                  <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                    {group.members.includes(currentUserID) ? (
                      <button
                        onClick={() => leaveStudyGroup(group.groupID)}
                        style={{
                          padding: '4px 12px',
                          fontSize: '13px',
                          cursor: 'pointer',
                          borderRadius: '4px',
                          border: '1px solid #ccc',
                          background: '#f0f0f0',
                          color: '#333',
                        }}
                      >
                        Leave
                      </button>
                    ) : (
                      <button
                        onClick={() => joinStudyGroup(group.groupID)}
                        style={{
                          padding: '4px 12px',
                          fontSize: '13px',
                          cursor: 'pointer',
                          borderRadius: '4px',
                          border: 'none',
                          background: '#1a73e8',
                          color: '#fff',
                        }}
                      >
                        Join
                      </button>
                    )}
                    {group.created_by === currentUserID && (
                      <button
                        onClick={() => onEditClick(group.groupID)}
                        style={{
                          padding: '4px 12px',
                          fontSize: '13px',
                          cursor: 'pointer',
                          borderRadius: '4px',
                          border: '1px solid #ccc',
                          background: '#fff',
                          color: '#333',
                        }}
                      >
                        Edit
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
