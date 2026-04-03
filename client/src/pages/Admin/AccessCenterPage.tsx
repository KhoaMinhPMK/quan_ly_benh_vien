import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../i18n/LanguageContext';
import {
  fetchAccessCatalog, fetchSubjectModules, setSubjectModule,
  fetchSubjectCapabilities, setSubjectCapabilities,
  fetchGroups, createGroup, fetchGroupMembers, addGroupMember, removeGroupMember,
  fetchAccessAuditLogs, fetchUserAccessPreview,
  type FeatureModule, type Capability, type RoleTemplate, type UserGroup,
  type ModuleEntitlement, type PolicyAssignment, type EffectiveAccess, type AccessAuditLog,
  type EntitlementEffect, type PolicyEffect,
} from '../../services/api/accessApi';
import { fetchUsers, fetchDepartments, type User, type Department } from '../../services/api/medboardApi';
import Modal from '../../components/Modal/Modal';
import './AdminPages.scss';
import './AccessCenter.scss';

type Tab = 'modules' | 'groups' | 'policies' | 'audit' | 'preview';
type SubjectType = 'user' | 'role_template' | 'department' | 'group' | 'tenant';

export default function AccessCenterPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>('modules');
  const [catalog, setCatalog] = useState<{ modules: FeatureModule[]; capabilities: Capability[]; roleTemplates: RoleTemplate[] } | null>(null);

  useEffect(() => {
    fetchAccessCatalog().then(setCatalog).catch(() => {});
  }, []);

  if (user?.role !== 'admin') return <div className="card"><div className="empty-state"><div className="empty-state__title">{t.common.noPermission}</div></div></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-header__title">{t.access.title}</h2>
          <p className="page-header__subtitle">{t.access.subtitle}</p>
        </div>
      </div>
      <div className="tab-bar">
        {([['modules', t.access.tabModules], ['groups', t.access.tabGroups], ['policies', t.access.tabPolicies], ['audit', t.access.tabAudit], ['preview', t.access.tabPreview]] as [Tab, string][]).map(([k, v]) => (
          <button key={k} className={`tab-bar__item ${tab === k ? 'tab-bar__item--active' : ''}`} onClick={() => setTab(k)}>{v}</button>
        ))}
      </div>
      {tab === 'modules' && catalog && <ModulesTab catalog={catalog} />}
      {tab === 'groups' && <GroupsTab />}
      {tab === 'policies' && catalog && <PoliciesTab catalog={catalog} />}
      {tab === 'audit' && <AuditTab />}
      {tab === 'preview' && catalog && <PreviewTab catalog={catalog} />}
    </div>
  );
}

// ============================================================
// Subject Selector (shared across tabs)
// ============================================================
function SubjectSelector({ value, onChange }: { value: { type: SubjectType; id: number }; onChange: (v: { type: SubjectType; id: number }) => void }) {
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [groups, setGroups] = useState<UserGroup[]>([]);

  useEffect(() => {
    fetchUsers().then(setUsers).catch(() => {});
    fetchDepartments().then(setDepartments).catch(() => {});
    fetchGroups().then(setGroups).catch(() => {});
  }, []);

  const subjectTypes: { value: SubjectType; label: string }[] = [
    { value: 'user', label: t.access.subjectUser || 'Người dùng' },
    { value: 'department', label: t.access.subjectDepartment || 'Khoa' },
    { value: 'group', label: t.access.subjectGroup || 'Nhóm' },
  ];

  const handleTypeChange = (type: SubjectType) => {
    onChange({ type, id: 0 });
  };

  const renderIdPicker = () => {
    if (value.type === 'user') {
      return (
        <select className="form-field__input" value={value.id || ''} onChange={e => onChange({ ...value, id: Number(e.target.value) })}>
          <option value="">{t.access.selectUser || '— Chọn người dùng —'}</option>
          {users.map(u => <option key={u.id} value={u.id}>{u.full_name} ({u.role})</option>)}
        </select>
      );
    }
    if (value.type === 'department') {
      return (
        <select className="form-field__input" value={value.id || ''} onChange={e => onChange({ ...value, id: Number(e.target.value) })}>
          <option value="">{t.access.selectDepartment || '— Chọn khoa —'}</option>
          {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      );
    }
    if (value.type === 'group') {
      return (
        <select className="form-field__input" value={value.id || ''} onChange={e => onChange({ ...value, id: Number(e.target.value) })}>
          <option value="">{t.access.selectGroup || '— Chọn nhóm —'}</option>
          {groups.map(g => <option key={g.id} value={g.id}>{g.name} ({g.code})</option>)}
        </select>
      );
    }
    return (
      <input className="form-field__input" type="number" min={1} placeholder="ID"
        value={value.id || ''} onChange={e => onChange({ ...value, id: Number(e.target.value) })} />
    );
  };

  return (
    <div className="ac-subject-selector">
      <select className="form-field__input" value={value.type} onChange={e => handleTypeChange(e.target.value as SubjectType)}>
        {subjectTypes.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
      </select>
      {renderIdPicker()}
    </div>
  );
}

// ============================================================
// Modules Tab
// ============================================================
function ModulesTab({ catalog }: { catalog: { modules: FeatureModule[]; capabilities: Capability[]; roleTemplates: RoleTemplate[] } }) {
  const { t } = useTranslation();
  const [subject, setSubject] = useState<{ type: SubjectType; id: number }>({ type: 'user', id: 0 });
  const [entitlements, setEntitlements] = useState<ModuleEntitlement[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!subject.id) { setEntitlements([]); return; }
    setLoading(true);
    try {
      const data = await fetchSubjectModules(subject.type, subject.id);
      setEntitlements(data);
    } catch { setEntitlements([]); }
    finally { setLoading(false); }
  }, [subject.type, subject.id]);

  useEffect(() => { load(); }, [load]);

  const getEffect = (moduleKey: string): EntitlementEffect => {
    const e = entitlements.find(en => en.module_key === moduleKey);
    return e?.effect || 'inherit';
  };

  const handleToggle = async (moduleKey: string, effect: EntitlementEffect) => {
    if (!subject.id) return;
    await setSubjectModule(subject.type, subject.id, moduleKey, effect);
    load();
  };

  return (
    <div className="ac-section">
      <SubjectSelector value={subject} onChange={setSubject} />
      {!subject.id && <p className="text-muted text-sm" style={{ margin: '8px 0 16px' }}>{t.access.selectSubjectHint || 'Chọn đối tượng ở trên để bật/tắt module cho đối tượng đó.'}</p>}
      {loading ? <div className="card" style={{ textAlign: 'center', padding: 32 }}>{t.common.loading}</div> : (
        <div className="ac-module-grid">
          {catalog.modules.map(m => {
            const eff = getEffect(m.module_key);
            return (
              <div key={m.id} className={`ac-module-card ${eff === 'enabled' ? 'ac-module-card--enabled' : eff === 'disabled' ? 'ac-module-card--disabled' : ''}`}>
                <div className="ac-module-card__header">
                  <span className="ac-module-card__name">{m.module_name}</span>
                  {m.is_core && <span className="ac-module-card__badge ac-module-card__badge--core">{t.access.core}</span>}
                </div>
                {m.description && <p className="ac-module-card__desc">{m.description}</p>}
                {subject.id > 0 && (
                  <div className="ac-module-card__actions">
                    {(['enabled', 'inherit', 'disabled'] as EntitlementEffect[]).map(e => (
                      <button key={e} className={`btn btn--sm ${eff === e ? 'btn--primary' : 'btn--ghost'}`}
                        onClick={() => handleToggle(m.module_key, e)}>
                        {t.access[e]}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============================================================
// Groups Tab
// ============================================================
function GroupsTab() {
  const { t } = useTranslation();
  const [groups, setGroups] = useState<UserGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<UserGroup | null>(null);
  const [members, setMembers] = useState<Array<{ user_id: number; full_name: string; email: string; role: string }>>([]);
  const [users, setUsers] = useState<User[]>([]);

  const loadGroups = useCallback(() => {
    setLoading(true);
    fetchGroups().then(setGroups).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadGroups(); }, [loadGroups]);
  useEffect(() => {
    if (selectedGroup) {
      fetchGroupMembers(selectedGroup.id).then(setMembers).catch(() => setMembers([]));
      fetchUsers().then(setUsers).catch(() => {});
    }
  }, [selectedGroup]);

  const handleCreateGroup = async (data: { code: string; name: string; description?: string; group_type?: string; priority?: number }) => {
    await createGroup(data);
    setShowAdd(false);
    loadGroups();
  };

  const handleAddMember = async (userId: number) => {
    if (!selectedGroup) return;
    await addGroupMember(selectedGroup.id, userId);
    fetchGroupMembers(selectedGroup.id).then(setMembers);
  };

  const handleRemoveMember = async (userId: number) => {
    if (!selectedGroup) return;
    await removeGroupMember(selectedGroup.id, userId);
    fetchGroupMembers(selectedGroup.id).then(setMembers);
  };

  if (loading) return <div className="card" style={{ textAlign: 'center', padding: 32 }}>{t.common.loading}</div>;

  return (
    <div className="ac-section ac-groups-layout">
      {/* Group list */}
      <div className="ac-groups-list">
        <div className="ac-groups-list__header">
          <h3>{t.access.tabGroups}</h3>
          <button className="btn btn--primary btn--sm" onClick={() => setShowAdd(true)}>{t.access.addGroup}</button>
        </div>
        {groups.length === 0 ? (
          <div className="empty-state"><div className="empty-state__title">{t.access.noGroups}</div></div>
        ) : (
          <div className="ac-groups-table">
            {groups.map(g => (
              <div key={g.id} className={`ac-group-row ${selectedGroup?.id === g.id ? 'ac-group-row--active' : ''}`}
                onClick={() => setSelectedGroup(g)}>
                <div>
                  <span className="ac-group-row__name">{g.name}</span>
                  <span className="ac-group-row__code">{g.code}</span>
                </div>
                <div className="ac-group-row__meta">
                  <span className="badge badge--secondary">{g.group_type}</span>
                  <span className="ac-group-row__members">{g.member_count ?? 0} {t.access.members}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Members panel */}
      {selectedGroup && (
        <div className="ac-members-panel">
          <h3>{selectedGroup.name} — {t.access.members}</h3>
          {members.length === 0 ? (
            <p className="text-muted">{t.access.noMembers}</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr><th>{t.users.fullName}</th><th>{t.users.email}</th><th>{t.users.role}</th><th>{t.common.actions}</th></tr>
              </thead>
              <tbody>
                {members.map(m => (
                  <tr key={m.user_id}>
                    <td>{m.full_name}</td><td>{m.email}</td><td>{m.role}</td>
                    <td><button className="btn btn--danger btn--sm" onClick={() => handleRemoveMember(m.user_id)}>×</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <div className="ac-add-member">
            <select className="form-field__input" onChange={e => { if (e.target.value) handleAddMember(Number(e.target.value)); e.target.value = ''; }}>
              <option value="">{t.access.addMember}...</option>
              {users.filter(u => !members.some(m => m.user_id === u.id)).map(u => (
                <option key={u.id} value={u.id}>{u.full_name} ({u.email})</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Add Group Modal */}
      {showAdd && <AddGroupModal onClose={() => setShowAdd(false)} onSave={handleCreateGroup} />}
    </div>
  );
}

function AddGroupModal({ onClose, onSave }: { onClose: () => void; onSave: (d: { code: string; name: string; description?: string; group_type?: string; priority?: number }) => void }) {
  const { t } = useTranslation();
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [groupType, setGroupType] = useState('custom');
  const [priority, setPriority] = useState(0);

  return (
    <Modal title={t.access.addGroup} onClose={onClose}>
      <div className="form-stack">
        <div className="form-field">
          <label className="form-field__label">{t.access.groupCode}</label>
          <input className="form-field__input" value={code} onChange={e => setCode(e.target.value)} />
        </div>
        <div className="form-field">
          <label className="form-field__label">{t.access.groupName}</label>
          <input className="form-field__input" value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div className="form-field">
          <label className="form-field__label">{t.common.description}</label>
          <input className="form-field__input" value={desc} onChange={e => setDesc(e.target.value)} />
        </div>
        <div className="form-row">
          <div className="form-field">
            <label className="form-field__label">{t.access.groupType}</label>
            <select className="form-field__input" value={groupType} onChange={e => setGroupType(e.target.value)}>
              <option value="operational">Operational</option>
              <option value="department">Department</option>
              <option value="shift">Shift</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          <div className="form-field">
            <label className="form-field__label">{t.access.priority}</label>
            <input className="form-field__input" type="number" value={priority} onChange={e => setPriority(Number(e.target.value))} />
          </div>
        </div>
        <div className="form-actions">
          <button className="btn btn--ghost" onClick={onClose}>{t.common.cancel}</button>
          <button className="btn btn--primary" disabled={!code || !name} onClick={() => onSave({ code, name, description: desc || undefined, group_type: groupType, priority })}>{t.common.create}</button>
        </div>
      </div>
    </Modal>
  );
}

// ============================================================
// Policies Tab
// ============================================================
function PoliciesTab({ catalog }: { catalog: { modules: FeatureModule[]; capabilities: Capability[]; roleTemplates: RoleTemplate[] } }) {
  const { t } = useTranslation();
  const [subject, setSubject] = useState<{ type: SubjectType; id: number }>({ type: 'user', id: 0 });
  const [, setPolicies] = useState<PolicyAssignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [edits, setEdits] = useState<Record<string, PolicyEffect>>({});

  const load = useCallback(async () => {
    if (!subject.id) { setPolicies([]); return; }
    setLoading(true);
    try {
      const data = await fetchSubjectCapabilities(subject.type, subject.id);
      setPolicies(data);
      const map: Record<string, PolicyEffect> = {};
      data.forEach(p => { map[p.capability_key] = p.effect; });
      setEdits(map);
    } catch { setPolicies([]); }
    finally { setLoading(false); }
  }, [subject.type, subject.id]);

  useEffect(() => { load(); }, [load]);

  const handleEffectChange = (capKey: string, effect: PolicyEffect) => {
    setEdits(prev => ({ ...prev, [capKey]: effect }));
  };

  const handleSave = async () => {
    if (!subject.id) return;
    const pols = Object.entries(edits).map(([capability_key, effect]) => ({ capability_key, effect }));
    await setSubjectCapabilities(subject.type, subject.id, pols);
    load();
  };

  // Group capabilities by module
  const capsByModule: Record<string, Capability[]> = {};
  catalog.capabilities.forEach(c => {
    const key = c.module_key || 'other';
    if (!capsByModule[key]) capsByModule[key] = [];
    capsByModule[key].push(c);
  });

  return (
    <div className="ac-section">
      <SubjectSelector value={subject} onChange={setSubject} />
      {!subject.id && <p className="text-muted text-sm" style={{ margin: '8px 0 16px' }}>{t.access.selectSubjectHint || 'Chọn đối tượng ở trên để phân quyền capability.'}</p>}
      {loading ? <div className="card" style={{ textAlign: 'center', padding: 32 }}>{t.common.loading}</div> : subject.id > 0 ? (
        <>
          {Object.entries(capsByModule).map(([moduleKey, caps]) => (
            <div key={moduleKey} className="ac-cap-module">
              <h4 className="ac-cap-module__title">{catalog.modules.find(m => m.module_key === moduleKey)?.module_name || moduleKey}</h4>
              <div className="ac-cap-table">
                {caps.map(cap => {
                  const eff = edits[cap.capability_key] || 'inherit';
                  return (
                    <div key={cap.id} className="ac-cap-row">
                      <div className="ac-cap-row__info">
                        <span className="ac-cap-row__key">{cap.capability_key}</span>
                        {cap.description && <span className="ac-cap-row__desc">{cap.description}</span>}
                      </div>
                      <div className="ac-cap-row__actions">
                        {(['allow', 'inherit', 'deny'] as PolicyEffect[]).map(e => (
                          <button key={e} className={`btn btn--sm ${eff === e ? (e === 'allow' ? 'btn--success' : e === 'deny' ? 'btn--danger' : 'btn--ghost') : 'btn--ghost'}`}
                            onClick={() => handleEffectChange(cap.capability_key, e)}>
                            {t.access[e === 'allow' ? 'allow' : e === 'deny' ? 'deny' : 'inherit']}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          {subject.id > 0 && (
            <div className="ac-save-bar">
              <button className="btn btn--primary" onClick={handleSave}>{t.access.savePolicies}</button>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}

// ============================================================
// Audit Tab
// ============================================================
function AuditTab() {
  const { t } = useTranslation();
  const [logs, setLogs] = useState<AccessAuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAccessAuditLogs({ limit: 200 }).then(setLogs).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="card" style={{ textAlign: 'center', padding: 32 }}>{t.common.loading}</div>;

  return (
    <div className="ac-section">
      {logs.length === 0 ? (
        <div className="empty-state"><div className="empty-state__title">{t.access.noAuditLogs}</div></div>
      ) : (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t.admin.auditTime}</th>
                <th>{t.admin.auditUser}</th>
                <th>{t.access.auditAction}</th>
                <th>{t.access.auditTarget}</th>
                <th>{t.access.auditReason}</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id}>
                  <td className="text-mono text-sm">{new Date(log.created_at).toLocaleString()}</td>
                  <td>{log.user_name || '—'}</td>
                  <td><span className="badge badge--secondary">{log.action}</span></td>
                  <td>{log.subject_type ? `${log.subject_type}#${log.subject_id}` : '—'} {log.target_key && `→ ${log.target_key}`}</td>
                  <td>{log.reason || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Preview Tab
// ============================================================
function PreviewTab({ catalog }: { catalog: { modules: FeatureModule[]; capabilities: Capability[]; roleTemplates: RoleTemplate[] } }) {
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number>(0);
  const [preview, setPreview] = useState<EffectiveAccess | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchUsers().then(setUsers).catch(() => {}); }, []);

  const handlePreview = async () => {
    if (!selectedUserId) return;
    setLoading(true);
    try {
      const data = await fetchUserAccessPreview(selectedUserId);
      setPreview(data);
    } catch { setPreview(null); }
    finally { setLoading(false); }
  };

  return (
    <div className="ac-section">
      <div className="ac-preview-selector">
        <select className="form-field__input" value={selectedUserId} onChange={e => setSelectedUserId(Number(e.target.value))}>
          <option value={0}>{t.access.previewUser}...</option>
          {users.map(u => <option key={u.id} value={u.id}>{u.full_name} ({u.email}) — {u.role}</option>)}
        </select>
        <button className="btn btn--primary btn--sm" onClick={handlePreview} disabled={!selectedUserId || loading}>
          {loading ? t.common.loading : t.access.tabPreview}
        </button>
      </div>
      <p className="text-muted text-sm">{t.access.previewHint}</p>

      {preview && (
        <div className="ac-preview-result">
          {/* Effective Modules */}
          <div className="ac-preview-block">
            <h4>{t.access.effectiveModules}</h4>
            <div className="ac-module-grid ac-module-grid--compact">
              {catalog.modules.map(m => {
                const enabled = preview.modules[m.module_key] !== false;
                return (
                  <div key={m.id} className={`ac-module-card ac-module-card--preview ${enabled ? 'ac-module-card--enabled' : 'ac-module-card--disabled'}`}>
                    <span className="ac-module-card__name">{m.module_name}</span>
                    <span className={`badge ${enabled ? 'badge--success' : 'badge--danger'}`}>{enabled ? t.access.enabled : t.access.disabled}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Effective Capabilities */}
          <div className="ac-preview-block">
            <h4>{t.access.effectiveCapabilities}</h4>
            <table className="data-table">
              <thead>
                <tr><th>{t.access.capability}</th><th>{t.access.effect}</th><th>{t.access.source}</th></tr>
              </thead>
              <tbody>
                {Object.entries(preview.capabilities).map(([key, cap]) => (
                  <tr key={key}>
                    <td className="text-mono text-sm">{key}</td>
                    <td><span className={`badge ${cap.effect === 'allow' ? 'badge--success' : 'badge--danger'}`}>{cap.effect === 'allow' ? t.access.allow : t.access.deny}</span></td>
                    <td className="text-sm text-muted">{cap.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
