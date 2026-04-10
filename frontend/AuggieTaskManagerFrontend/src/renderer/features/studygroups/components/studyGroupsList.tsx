import React from 'react';

interface StudyGroup {
  id: string;
  name: string;
  subject: string;
  description: string;
  src: string;
  altText: string;
}

const studyGroupData: StudyGroup[] = [
  {
    id: '1',
    name: 'Calculus Study Group',
    subject: 'Mathematics',
    description: 'Weekly meetings to work through problem sets and exam prep.',
    src: '/images/math.png',
    altText: 'Mathematics group',
  },
  {
    id: '2',
    name: 'History Reading Circle',
    subject: 'History',
    description: 'We discuss assigned readings and share notes every Thursday.',
    src: '/images/history.png',
    altText: 'History group',
  },
];

export const StudyGroupList: React.FC = () => {
  return (
    <div className="control-pane">
      <div className="control-section">
        <p style={{ fontSize: '20px', fontWeight: 600 }}>Study Groups</p>
        <div id="list-study-groups" style={{ maxHeight: 500, overflowY: 'auto' }}>
          {studyGroupData.map((group) => (
            <div
              key={group.id}
              className="e-list-wrapper"
              style={{ borderBottom: 'inset', padding: '10px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', whiteSpace: 'normal' }}>
                <img
                  className="e-avatar"
                  src={group.src}
                  alt={group.altText}
                  style={{ background: '#BCBCBC', width: '100px', height: '100px', borderRadius: '4px' }}
                />
                <div
                  style={{
                    marginLeft: '20px',
                    textAlign: 'left',
                    maxWidth: '600px',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <span style={{ fontSize: '18px', fontWeight: 600, paddingBottom: '3px' }}>{group.name}</span>
                  <span style={{ fontSize: '14px', color: '#666', paddingBottom: '6px' }}>{group.subject}</span>
                  <div style={{ fontSize: '15px' }}>{group.description}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
