import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '../../i18n/LanguageContext';
import { useToast } from '../../contexts/ToastContext';
import Modal from '../../components/Modal/Modal';
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog';
import {
  fetchPlans, createPlan, updatePlan,
  fetchTenants, updateTenant as _updateTenant, fetchResourceLimits,
  fetchIntegrations, createIntegration, updateIntegration, deleteIntegration as _deleteIntegration,
  fetchSessions, revokeSession, revokeAllSessions,
  fetchSLASummary,
  fetchBedRules, createBedRule, updateBedRule, deleteBedRule,
  fetchAuditSummary,
  batchGenerateQR,
  fetchDashboardWidgets, updateDashboardWidget,
} from '../../services/api/medboardApi';
import type {
  ServicePlan, Tenant, ResourceLimits, HISIntegration,
  UserSession, SLASummary, BedAllocationRule, AuditSummary, DashboardWidget,
} from '../../services/api/medboardApi';
import './SaasAdminPage.scss';

type Tab = 'plans' | 'tenants' | 'rules' | 'integrations' | 'sessions' | 'sla' | 'widgets' | 'qr' | 'audit';

void _updateTenant; void _deleteIntegration; // reserved for future CRUD

export default function SaasAdminPage() {
  const { t } = useTranslation();
  const _toast = useToast(); void _toast;
  const [tab, setTab] = useState<Tab>('plans');

  const tabs: { key: Tab; label: string }[] = [
    { key: 'plans', label: t.saas?.tabPlans || 'Gói dịch vụ' },
    { key: 'tenants', label: t.saas?.tabTenants || 'Đơn vị' },
    { key: 'rules', label: t.saas?.tabRules || 'Quy tắc xếp giường' },
    { key: 'integrations', label: t.saas?.tabIntegrations || 'Tích hợp HIS' },
    { key: 'sessions', label: t.saas?.tabSessions || 'Phiên đăng nhập' },
    { key: 'sla', label: t.saas?.tabSLA || 'SLA' },
    { key: 'widgets', label: t.saas?.tabWidgets || 'Dashboard' },
    { key: 'qr', label: t.saas?.tabQR || 'QR Code' },
    { key: 'audit', label: t.saas?.tabAudit || 'Audit nâng cao' },
  ];

  return (
    <div className="saas-admin">
      <div className="saas-admin__header">
        <h1>{t.saas?.title || 'Nền tảng SaaS'}</h1>
        <p>{t.saas?.subtitle || 'Quản lý gói dịch vụ, tích hợp và cấu hình nền tảng'}</p>
      </div>
      <div className="saas-admin__tabs">
        {tabs.map(tb => (
          <button key={tb.key} className={`saas-admin__tab ${tab === tb.key ? 'saas-admin__tab--active' : ''}`} onClick={() => setTab(tb.key)}>{tb.label}</button>
        ))}
      </div>
      <div className="saas-admin__content">
        {tab === 'plans' && <PlansSection />}
        {tab === 'tenants' && <TenantsSection />}
        {tab === 'rules' && <RulesSection />}
        {tab === 'integrations' && <IntegrationsSection />}
        {tab === 'sessions' && <SessionsSection />}
        {tab === 'sla' && <SLASection />}
        {tab === 'widgets' && <WidgetsSection />}
        {tab === 'qr' && <QRSection />}
        {tab === 'audit' && <AuditSection />}
      </div>
    </div>
  );
}

// ── Plans Section (#91) ──
function PlansSection() {
  const { showToast } = useToast();
  const [plans, setPlans] = useState<ServicePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<ServicePlan | null>(null);
  const [form, setForm] = useState({ plan_code: '', name: '', description: '', max_users: 10, max_departments: 3, max_rooms: 20, max_beds: 100, price_monthly: 0, price_yearly: 0, features: '' });

  const load = useCallback(async () => { try { setPlans(await fetchPlans()); } catch { } finally { setLoading(false); } }, []);
  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    try {
      const data = { ...form, features: form.features.split(',').map(f => f.trim()).filter(Boolean) };
      if (editing) await updatePlan(editing.id, data);
      else await createPlan(data as any);
      showToast('Đã lưu', 'success');
      setShowModal(false);
      load();
    } catch { showToast('Lỗi', 'error'); }
  };

  const openEdit = (p: ServicePlan) => {
    setEditing(p);
    setForm({ plan_code: p.plan_code, name: p.name, description: p.description || '', max_users: p.max_users, max_departments: p.max_departments, max_rooms: p.max_rooms, max_beds: p.max_beds, price_monthly: p.price_monthly, price_yearly: p.price_yearly, features: (p.features || []).join(', ') });
    setShowModal(true);
  };

  if (loading) return <p>Đang tải...</p>;

  return (
    <div>
      <div className="saas-admin__toolbar"><button className="btn btn--primary" onClick={() => { setEditing(null); setForm({ plan_code: '', name: '', description: '', max_users: 10, max_departments: 3, max_rooms: 20, max_beds: 100, price_monthly: 0, price_yearly: 0, features: '' }); setShowModal(true); }}>+ Thêm gói</button></div>
      <table className="saas-admin__table">
        <thead><tr><th>Mã</th><th>Tên</th><th>Users</th><th>Khoa</th><th>Phòng</th><th>Giường</th><th>Giá/tháng</th><th>Thao tác</th></tr></thead>
        <tbody>
          {plans.map(p => (
            <tr key={p.id}>
              <td><code>{p.plan_code}</code></td><td>{p.name}</td>
              <td>{p.max_users}</td><td>{p.max_departments}</td><td>{p.max_rooms}</td><td>{p.max_beds}</td>
              <td>{Number(p.price_monthly).toLocaleString()}đ</td>
              <td><button className="btn btn--sm" onClick={() => openEdit(p)}>Sửa</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      {showModal && (
        <Modal title={editing ? 'Sửa gói' : 'Thêm gói'} onClose={() => setShowModal(false)}>
          <div className="saas-admin__form">
            {!editing && <div className="form-group"><label>Mã gói</label><input value={form.plan_code} onChange={e => setForm(f => ({ ...f, plan_code: e.target.value }))} /></div>}
            <div className="form-group"><label>Tên</label><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div className="form-group"><label>Mô tả</label><input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
            <div className="form-row">
              <div className="form-group"><label>Max Users</label><input type="number" value={form.max_users} onChange={e => setForm(f => ({ ...f, max_users: +e.target.value }))} /></div>
              <div className="form-group"><label>Max Khoa</label><input type="number" value={form.max_departments} onChange={e => setForm(f => ({ ...f, max_departments: +e.target.value }))} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Max Phòng</label><input type="number" value={form.max_rooms} onChange={e => setForm(f => ({ ...f, max_rooms: +e.target.value }))} /></div>
              <div className="form-group"><label>Max Giường</label><input type="number" value={form.max_beds} onChange={e => setForm(f => ({ ...f, max_beds: +e.target.value }))} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Giá/tháng</label><input type="number" value={form.price_monthly} onChange={e => setForm(f => ({ ...f, price_monthly: +e.target.value }))} /></div>
              <div className="form-group"><label>Giá/năm</label><input type="number" value={form.price_yearly} onChange={e => setForm(f => ({ ...f, price_yearly: +e.target.value }))} /></div>
            </div>
            <div className="form-group"><label>Features (phẩy cách)</label><input value={form.features} onChange={e => setForm(f => ({ ...f, features: e.target.value }))} placeholder="dashboard, rooms, beds, ..." /></div>
            <div className="form-actions"><button className="btn btn--primary" onClick={handleSave}>Lưu</button><button className="btn" onClick={() => setShowModal(false)}>Huỷ</button></div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── Tenants Section (#90) ──
function TenantsSection() {
  const _toast = useToast(); void _toast;
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [limits, setLimits] = useState<ResourceLimits | null>(null);
  const [selectedTenant, setSelectedTenant] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => { try { setTenants(await fetchTenants()); } catch { } finally { setLoading(false); } }, []);
  useEffect(() => { load(); }, [load]);

  const viewLimits = async (id: number) => {
    setSelectedTenant(id);
    try { setLimits(await fetchResourceLimits(id)); } catch { }
  };

  if (loading) return <p>Đang tải...</p>;

  return (
    <div>
      <table className="saas-admin__table">
        <thead><tr><th>Tên</th><th>Subdomain</th><th>Gói</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
        <tbody>
          {tenants.map(t => (
            <tr key={t.id}>
              <td>{t.name}</td><td>{t.subdomain || '—'}</td><td><span className="badge">{t.plan_name || t.plan}</span></td>
              <td><span className={`status-dot ${t.is_active !== false ? 'status-dot--active' : 'status-dot--inactive'}`} /></td>
              <td><button className="btn btn--sm" onClick={() => viewLimits(t.id)}>Xem giới hạn</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      {selectedTenant && limits && (
        <div className="saas-admin__limits">
          <h3>Giới hạn tài nguyên</h3>
          <div className="limits-grid">
            {(['users', 'departments', 'rooms', 'beds'] as const).map(k => (
              <div key={k} className="limit-card">
                <div className="limit-card__label">{k === 'users' ? 'Người dùng' : k === 'departments' ? 'Khoa' : k === 'rooms' ? 'Phòng' : 'Giường'}</div>
                <div className="limit-card__value">{limits[k].current} / {limits[k].max}</div>
                <div className="limit-card__bar"><div style={{ width: `${Math.min(limits[k].current / limits[k].max * 100, 100)}%` }} /></div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Rules Section (#28, #68, #98) ──
function RulesSection() {
  const { showToast } = useToast();
  const [rules, setRules] = useState<BedAllocationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<BedAllocationRule | null>(null);
  const [form, setForm] = useState({ name: '', rule_type: 'gender_separation', priority: 0, description: '', conditions: '{}', actions: '{}' });
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const load = useCallback(async () => { try { setRules(await fetchBedRules()); } catch { } finally { setLoading(false); } }, []);
  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    try {
      const data = { ...form, conditions: JSON.parse(form.conditions), actions: JSON.parse(form.actions) };
      if (editing) await updateBedRule(editing.id, data);
      else await createBedRule(data as any);
      showToast('Đã lưu', 'success');
      setShowModal(false);
      load();
    } catch { showToast('Lỗi (kiểm tra JSON)', 'error'); }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try { await deleteBedRule(confirmDelete); showToast('Đã xoá', 'success'); setConfirmDelete(null); load(); } catch { showToast('Lỗi', 'error'); }
  };

  const toggleActive = async (r: BedAllocationRule) => {
    try { await updateBedRule(r.id, { is_active: !r.is_active }); load(); } catch { }
  };

  if (loading) return <p>Đang tải...</p>;

  return (
    <div>
      <div className="saas-admin__toolbar"><button className="btn btn--primary" onClick={() => { setEditing(null); setForm({ name: '', rule_type: 'gender_separation', priority: 0, description: '', conditions: '{}', actions: '{}' }); setShowModal(true); }}>+ Thêm quy tắc</button></div>
      <table className="saas-admin__table">
        <thead><tr><th>Tên</th><th>Loại</th><th>Ưu tiên</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
        <tbody>
          {rules.map(r => (
            <tr key={r.id}>
              <td>{r.name}</td><td><code>{r.rule_type}</code></td><td>{r.priority}</td>
              <td><button className={`btn btn--sm ${r.is_active ? 'btn--success' : 'btn--muted'}`} onClick={() => toggleActive(r)}>{r.is_active ? 'Bật' : 'Tắt'}</button></td>
              <td>
                <button className="btn btn--sm" onClick={() => { setEditing(r); setForm({ name: r.name, rule_type: r.rule_type, priority: r.priority, description: r.description || '', conditions: JSON.stringify(r.conditions, null, 2), actions: JSON.stringify(r.actions, null, 2) }); setShowModal(true); }}>Sửa</button>
                <button className="btn btn--sm btn--danger" onClick={() => setConfirmDelete(r.id)}>Xoá</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {showModal && (
        <Modal title={editing ? 'Sửa quy tắc' : 'Thêm quy tắc'} onClose={() => setShowModal(false)}>
          <div className="saas-admin__form">
            <div className="form-group"><label>Tên</label><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div className="form-row">
              <div className="form-group"><label>Loại</label>
                <select value={form.rule_type} onChange={e => setForm(f => ({ ...f, rule_type: e.target.value }))}>
                  <option value="gender_separation">Tách giới tính</option>
                  <option value="department_priority">Ưu tiên khoa</option>
                  <option value="severity">Mức độ nặng</option>
                  <option value="age_group">Nhóm tuổi</option>
                  <option value="room_type_match">Loại phòng</option>
                  <option value="custom">Tuỳ chỉnh</option>
                </select>
              </div>
              <div className="form-group"><label>Ưu tiên</label><input type="number" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: +e.target.value }))} /></div>
            </div>
            <div className="form-group"><label>Mô tả</label><input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
            <div className="form-group"><label>Conditions (JSON)</label><textarea rows={4} value={form.conditions} onChange={e => setForm(f => ({ ...f, conditions: e.target.value }))} /></div>
            <div className="form-group"><label>Actions (JSON)</label><textarea rows={4} value={form.actions} onChange={e => setForm(f => ({ ...f, actions: e.target.value }))} /></div>
            <div className="form-actions"><button className="btn btn--primary" onClick={handleSave}>Lưu</button><button className="btn" onClick={() => setShowModal(false)}>Huỷ</button></div>
          </div>
        </Modal>
      )}
      {confirmDelete !== null && (
        <ConfirmDialog open={true} title="Xoá quy tắc?" message="Hành động này không thể hoàn tác." confirmLabel="Xoá" cancelLabel="Huỷ" onConfirm={handleDelete} onCancel={() => setConfirmDelete(null)} variant="danger" />
      )}
    </div>
  );
}

// ── Integrations Section (#93) ──
function IntegrationsSection() {
  const { showToast } = useToast();
  const [items, setItems] = useState<HISIntegration[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ integration_name: '', integration_type: 'rest_api', endpoint_url: '', sync_direction: 'inbound', sync_interval_minutes: 60, tenant_id: 1 });

  const load = useCallback(async () => { try { setItems(await fetchIntegrations()); } catch { } finally { setLoading(false); } }, []);
  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    try { await createIntegration(form as any); showToast('Đã tạo', 'success'); setShowModal(false); load(); } catch { showToast('Lỗi', 'error'); }
  };

  const toggleActive = async (item: HISIntegration) => {
    try { await updateIntegration(item.id, { is_active: !item.is_active }); load(); } catch { }
  };

  if (loading) return <p>Đang tải...</p>;

  return (
    <div>
      <div className="saas-admin__toolbar"><button className="btn btn--primary" onClick={() => setShowModal(true)}>+ Thêm tích hợp</button></div>
      <table className="saas-admin__table">
        <thead><tr><th>Tên</th><th>Loại</th><th>URL</th><th>Hướng</th><th>Trạng thái</th><th>Đồng bộ cuối</th><th>Thao tác</th></tr></thead>
        <tbody>
          {items.map(i => (
            <tr key={i.id}>
              <td>{i.integration_name}</td><td><code>{i.integration_type}</code></td>
              <td className="text-truncate">{i.endpoint_url || '—'}</td><td>{i.sync_direction}</td>
              <td><span className={`status-dot ${i.is_active ? 'status-dot--active' : 'status-dot--inactive'}`} /></td>
              <td>{i.last_sync_at ? new Date(i.last_sync_at).toLocaleString() : '—'}</td>
              <td><button className="btn btn--sm" onClick={() => toggleActive(i)}>{i.is_active ? 'Tắt' : 'Bật'}</button></td>
            </tr>
          ))}
          {items.length === 0 && <tr><td colSpan={7} className="text-center">Chưa có tích hợp nào</td></tr>}
        </tbody>
      </table>
      {showModal && (
        <Modal title="Thêm tích hợp HIS/EMR" onClose={() => setShowModal(false)}>
          <div className="saas-admin__form">
            <div className="form-group"><label>Tên</label><input value={form.integration_name} onChange={e => setForm(f => ({ ...f, integration_name: e.target.value }))} /></div>
            <div className="form-row">
              <div className="form-group"><label>Loại</label>
                <select value={form.integration_type} onChange={e => setForm(f => ({ ...f, integration_type: e.target.value }))}>
                  <option value="hl7_fhir">HL7 FHIR</option><option value="rest_api">REST API</option><option value="soap">SOAP</option><option value="file_import">File Import</option><option value="custom">Custom</option>
                </select>
              </div>
              <div className="form-group"><label>Hướng</label>
                <select value={form.sync_direction} onChange={e => setForm(f => ({ ...f, sync_direction: e.target.value }))}>
                  <option value="inbound">Nhận vào</option><option value="outbound">Gửi ra</option><option value="bidirectional">Hai chiều</option>
                </select>
              </div>
            </div>
            <div className="form-group"><label>Endpoint URL</label><input value={form.endpoint_url} onChange={e => setForm(f => ({ ...f, endpoint_url: e.target.value }))} placeholder="https://..." /></div>
            <div className="form-group"><label>Chu kỳ (phút)</label><input type="number" value={form.sync_interval_minutes} onChange={e => setForm(f => ({ ...f, sync_interval_minutes: +e.target.value }))} /></div>
            <div className="form-actions"><button className="btn btn--primary" onClick={handleSave}>Tạo</button><button className="btn" onClick={() => setShowModal(false)}>Huỷ</button></div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── Sessions Section (#76) ──
function SessionsSection() {
  const { showToast } = useToast();
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => { try { setSessions(await fetchSessions()); } catch { } finally { setLoading(false); } }, []);
  useEffect(() => { load(); }, [load]);

  const handleRevoke = async (id: number) => {
    try { await revokeSession(id); showToast('Đã thu hồi', 'success'); load(); } catch { showToast('Lỗi', 'error'); }
  };

  const handleRevokeAll = async () => {
    try { await revokeAllSessions(); showToast('Đã thu hồi tất cả', 'success'); load(); } catch { showToast('Lỗi', 'error'); }
  };

  if (loading) return <p>Đang tải...</p>;

  return (
    <div>
      <div className="saas-admin__toolbar"><button className="btn btn--danger" onClick={handleRevokeAll}>Thu hồi tất cả phiên khác</button></div>
      <table className="saas-admin__table">
        <thead><tr><th>Thiết bị</th><th>IP</th><th>Hoạt động cuối</th><th>Tạo lúc</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
        <tbody>
          {sessions.map(s => (
            <tr key={s.id}>
              <td>{s.device_info || 'Không rõ'}</td><td>{s.ip_address || '—'}</td>
              <td>{new Date(s.last_active_at).toLocaleString()}</td><td>{new Date(s.created_at).toLocaleString()}</td>
              <td><span className={`status-dot ${s.is_active ? 'status-dot--active' : 'status-dot--inactive'}`} /></td>
              <td>{s.is_active && <button className="btn btn--sm btn--danger" onClick={() => handleRevoke(s.id)}>Thu hồi</button>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── SLA Section (#99) ──
function SLASection() {
  const [summary, setSummary] = useState<SLASummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchSLASummary().then(setSummary).catch(() => {}).finally(() => setLoading(false)); }, []);

  if (loading) return <p>Đang tải...</p>;

  return (
    <div>
      <h3>Tổng quan SLA (30 ngày)</h3>
      <table className="saas-admin__table">
        <thead><tr><th>SLA</th><th>Loại</th><th>Tổng</th><th>Hoàn thành</th><th>Cảnh báo</th><th>Vi phạm</th><th>TB (phút)</th></tr></thead>
        <tbody>
          {summary.map((s, i) => (
            <tr key={i}>
              <td>{s.name}</td><td><code>{s.sla_type}</code></td><td>{s.total}</td>
              <td className="text-success">{s.completed}</td><td className="text-warning">{s.warning}</td><td className="text-danger">{s.breached}</td>
              <td>{s.avg_minutes || '—'}</td>
            </tr>
          ))}
          {summary.length === 0 && <tr><td colSpan={7} className="text-center">Chưa có dữ liệu SLA</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

// ── Widgets Section (#69) ──
function WidgetsSection() {
  const { showToast } = useToast();
  const [widgets, setWidgets] = useState<DashboardWidget[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => { try { setWidgets(await fetchDashboardWidgets()); } catch { } finally { setLoading(false); } }, []);
  useEffect(() => { load(); }, [load]);

  const toggle = async (w: DashboardWidget) => {
    try { await updateDashboardWidget(w.id, { is_visible: !w.is_visible }); load(); } catch { showToast('Lỗi', 'error'); }
  };

  if (loading) return <p>Đang tải...</p>;

  return (
    <div>
      <h3>Cấu hình widget dashboard</h3>
      <table className="saas-admin__table">
        <thead><tr><th>Widget</th><th>Loại</th><th>Hiển thị</th><th>Thao tác</th></tr></thead>
        <tbody>
          {widgets.map(w => (
            <tr key={w.id}>
              <td>{w.widget_name}</td><td><code>{w.widget_type}</code></td>
              <td><span className={`status-dot ${w.is_visible ? 'status-dot--active' : 'status-dot--inactive'}`} /></td>
              <td><button className="btn btn--sm" onClick={() => toggle(w)}>{w.is_visible ? 'Ẩn' : 'Hiện'}</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── QR Section (#96) ──
function QRSection() {
  const { showToast } = useToast();
  const [generating, setGenerating] = useState(false);

  const generate = async (type: string) => {
    setGenerating(true);
    try { await batchGenerateQR(type); showToast(`Đã tạo QR cho ${type}`, 'success'); } catch { showToast('Lỗi', 'error'); }
    finally { setGenerating(false); }
  };

  return (
    <div>
      <h3>Quản lý QR Code</h3>
      <p>Tạo mã QR cho phòng và giường để quét nhanh trên điện thoại.</p>
      <div className="saas-admin__toolbar">
        <button className="btn btn--primary" disabled={generating} onClick={() => generate('room')}>
          {generating ? 'Đang tạo...' : 'Tạo QR cho tất cả phòng'}
        </button>
        <button className="btn btn--primary" disabled={generating} onClick={() => generate('bed')}>
          {generating ? 'Đang tạo...' : 'Tạo QR cho tất cả giường'}
        </button>
      </div>
    </div>
  );
}

// ── Audit Advanced (#100) ──
function AuditSection() {
  const [summary, setSummary] = useState<AuditSummary | null>(null);
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => { try { setSummary(await fetchAuditSummary(days)); } catch { } finally { setLoading(false); } }, [days]);
  useEffect(() => { load(); }, [load]);

  if (loading) return <p>Đang tải...</p>;
  if (!summary) return <p>Không có dữ liệu</p>;

  return (
    <div>
      <div className="saas-admin__toolbar">
        <select value={days} onChange={e => setDays(+e.target.value)}>
          <option value={7}>7 ngày</option><option value={14}>14 ngày</option><option value={30}>30 ngày</option>
        </select>
      </div>
      <div className="audit-grid">
        <div className="audit-card">
          <h4>Theo hành động</h4>
          <table className="saas-admin__table saas-admin__table--compact">
            <tbody>{summary.by_action.map((r, i) => <tr key={i}><td>{r.action}</td><td><strong>{r.count}</strong></td></tr>)}</tbody>
          </table>
        </div>
        <div className="audit-card">
          <h4>Theo đối tượng</h4>
          <table className="saas-admin__table saas-admin__table--compact">
            <tbody>{summary.by_entity.map((r, i) => <tr key={i}><td>{r.entity_type}</td><td><strong>{r.count}</strong></td></tr>)}</tbody>
          </table>
        </div>
        <div className="audit-card">
          <h4>Top người dùng</h4>
          <table className="saas-admin__table saas-admin__table--compact">
            <tbody>{summary.by_user.map((r, i) => <tr key={i}><td>{r.full_name}</td><td><strong>{r.count}</strong></td></tr>)}</tbody>
          </table>
        </div>
        <div className="audit-card">
          <h4>Theo ngày</h4>
          <table className="saas-admin__table saas-admin__table--compact">
            <tbody>{summary.by_day.map((r, i) => <tr key={i}><td>{r.log_date}</td><td><strong>{r.count}</strong></td></tr>)}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
