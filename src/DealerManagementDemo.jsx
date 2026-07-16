import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  ClipboardList,
  Copy,
  FileText,
  KeyRound,
  Plus,
  RefreshCw,
  Search,
  UserPlus,
  X,
} from 'lucide-react';
import {
  initialDealers,
  initialDealerOrgNodes,
  initialOperationLogs,
  initialTestAccounts,
  initialTestRecords,
} from './data/dealerManagementDemoData';
import { cls } from './utils';

const DETAIL_TABS = ['设备测试记录', 'APP测试账号', '操作日志'];
const ROOT_ORG_ID = 'ORG-ROOT';
const TEST_ACCOUNT_REGIONS = ['中国', '亚洲', '北美', '欧洲'];
const TEST_ACCOUNT_CLIENTS = [
  { clientName: '小鹰看看', clientId: 'app-xiaoying-kankan' },
  { clientName: '小鹰视界', clientId: 'app-xiaoying-vision' },
];
const DEFAULT_TEST_ACCOUNT_CLIENT = TEST_ACCOUNT_CLIENTS[0];
const DEFAULT_TEST_ACCOUNT_VALID_YEARS = 1;
const MAX_TEST_ACCOUNT_VALID_YEARS = 10;
const TEST_ACCOUNT_VALIDITY_PRESETS = [1, 3, 10];
const DEFAULT_DEALER_LIST_FILTERS = {
  keyword: '',
};

const ANNOTATION_RULES = [
  {
    id: 'dealerSearch',
    title: '经销商检索',
    summary: '用于在左侧经销商信息中快速定位目标组织，查询结果只影响左侧树与右侧当前选中对象。',
    fields: [
      '经销商名称 / ID：非必填；支持经销商名称模糊匹配，支持经销商 ID 匹配。',
      '查询：点击后按输入内容刷新左侧经销商树；若当前选中经销商不在结果内，自动选中结果中的第一家经销商。',
      '重置：清空输入，恢复全部经销商，左侧树保持默认展开。',
    ],
    rules: [
      '左侧树只展示经销商名称、层级标签和停用标签，不展示经销商 ID。',
      '查询条件为空时展示全部一级、二级、三级经销商。',
    ],
  },
  {
    id: 'dealerTree',
    title: '经销商层级树',
    summary: '左侧用于表达经销商层级关系，右侧承载当前经销商的详情和业务数据。',
    flow: [
      '进入页面默认全部展开，减少用户首次进入后的额外操作。',
      '点击经销商行后刷新右侧详情，不跳转新页面。',
      '停用经销商仍可查看详情，但不能创建 APP 测试账号。',
    ],
    rules: [
      '层级标签统一只展示一级、二级、三级，不再展示组织汇总类标签。',
      '左侧共计数量按当前筛选结果统计，统计对象为经销商家数。',
    ],
  },
  {
    id: 'dealerContext',
    title: '经销商详情摘要',
    summary: '以经销商名称作为主身份，紧凑展示当前组织的关键基础信息。',
    rules: [
      '经销商名称作为模块主标题，名称旁仅展示层级标签，不展示启用或停用标签。',
      '详情字段固定为经销商 ID、经销商简称、创建时间、设备总数，不重复展示名称字段。',
      '基础字段横向平铺，不使用独立指标卡，不提供折叠或编辑交互。',
      '设备总数展示单位“台”，其余字段保持组织中心数据格式。',
    ],
  },
  {
    id: 'detailTabs',
    title: '详情模块切换',
    summary: '右侧详情按高频查看顺序组织信息，减少在测试记录与账号之间来回查找。',
    flow: [
      'Tab 顺序固定为：设备测试记录、APP 测试账号、操作日志。',
      '切换 Tab 只刷新当前经销商下的数据，不改变左侧选中的经销商。',
      '创建账号成功后自动切换到 APP 测试账号 Tab，便于立即查看新增账号。',
    ],
  },
  {
    id: 'recordFilters',
    title: '设备测试记录查询',
    summary: '设备测试记录按设备 ID 汇总，主表展示最近一次记录和累计添加次数。',
    fields: [
      '设备 ID：非必填；按设备 ID 匹配测试记录。',
      'App测试账号 / 用户 ID：非必填；只匹配最近一次添加记录中的账号名称或用户 ID。',
      '添加时间：范围控件；开始时间不能晚于结束时间，只匹配最近一次添加记录的添加时间。',
    ],
    rules: [
      '每个设备 ID 只展示一行，字段为设备 ID、最近添加账号、最近添加时间、添加次数和操作。',
      '添加次数按该设备正式形成的添加记录累计，点击次数或展开箭头在表格内查看添加历史。',
      '筛选条件只匹配最近一次添加记录；历史添加记录不影响主表筛选结果。',
      '底层保留每次正式形成的添加记录，不因主列表聚合而覆盖历史记录。',
    ],
  },
  {
    id: 'deviceLink',
    title: '设备详情跳转',
    summary: '设备测试记录只保留入口，完整设备日志在设备详情模块承载。',
    flow: [
      '点击设备 ID 跳转到【202606】详情模块迭代阶段范围中的设备详情。',
      '设备详情负责查看历史添加、解绑、反激活补偿和异常处理等完整日志。',
      '主列表展示添加次数，多次添加历史通过当前表格展开行查看。',
    ],
  },
  {
    id: 'accountSearch',
    title: 'APP 测试账号查询',
    summary: '账号列表用于查看当前经销商下已创建的 APP 测试账号，并支持跳转用户中心。',
    fields: [
      '账号名称 / 用户 ID：非必填；支持账号名称或用户 ID 匹配。',
      '刷新：刷新当前经销商下的 APP 测试账号列表，不改变查询关键字。',
    ],
    rules: [
      '不提供账号状态查询条件，避免第一阶段筛选项过重。',
      '账号状态仅在列表内展示，用于识别生效中、已停用、已过期。',
    ],
  },
  {
    id: 'createEntry',
    title: '创建账号入口',
    summary: '创建入口与查询区保持同一行，降低用户在当前经销商下新增账号的操作成本。',
    flow: [
      '点击创建账号后打开弹窗，默认带入当前选中的经销商组织。',
      '第一阶段不接入审批流，提交成功后立即生效。',
      '经销商停用时按钮置灰，不允许创建。',
    ],
  },
  {
    id: 'createFields',
    title: '创建账号字段规则',
    summary: '创建表单需要保证账号可追溯、可区分客户端和大区，并避免同一经销商下账号名称重复。',
    fields: [
      '经销商组织：必填，默认当前经销商，只读展示。',
      '账号名称：必填；同一经销商下不可重复，重复时阻止提交并提示用户。',
      '手机号：可选；填写时必须为 11 位手机号。',
      '账号所属大区：必填；可选中国、亚洲、北美、欧洲，默认中国。',
      '客户端名称：必填；从客户端清单选择，并自动带出客户端 ID。',
      '客户端 ID：由客户端名称联动生成，以禁用态展示，不允许手动修改。',
      '到期时间：必填；创建成功后立即生效，默认有效 1 年，过去日期不可选，单次最长 10 年。',
      '到期时间为单日期选择，支持 1 年、3 年、10 年快捷选项；有效期按自然年计算，含创建日和到期日。',
      '创建原因：必填，用于说明设备抽检、样机验证或异常复测场景。',
    ],
    rules: [
      '提交成功后返回账号名称、用户 ID 和临时密码。',
      '临时密码仅本次展示，关闭后不可再次查看。',
    ],
  },
  {
    id: 'credential',
    title: '创建/重置成功反馈',
    summary: '账号创建或密码重置后，需要把可交付给经销商的信息一次性展示清楚。',
    rules: [
      '创建账号和重置密码使用同一规则：安全随机生成 10 位，仅包含大写字母、小写字母和数字，并保证三类字符各至少包含 1 位。',
      '临时密码始终明文展示，不提供显示 / 隐藏操作，支持一键复制。',
      '复制密码只触发前端剪贴板操作，不写入操作日志。',
      '弹窗关闭后不可再次查看当前临时密码；遗失时通过重置密码重新生成。',
    ],
  },
  {
    id: 'resetPassword',
    title: '重置密码',
    summary: '用于账号密码遗失或需要重新交付账号时生成新的临时密码。',
    fields: [
      '重置原因：必填；用于后续审计追溯。',
    ],
    rules: [
      '重置后旧密码立即失效，新密码仅本次展示。',
      '新密码沿用统一临时密码规则：安全随机 10 位，并保证包含大写字母、小写字母和数字。',
      '重置密码不改变账号权限状态，已停用或已过期账号不会因此恢复可用。',
      '重置成功后写入操作日志，记录操作人、账号、用户 ID、原因和时间。',
    ],
  },
  {
    id: 'operationLog',
    title: '操作日志范围',
    summary: '操作日志采用时间节点形式，记录后台可审计的人为操作。',
    fields: [
      '操作日期：单日期选择；默认选中今日并展示今日操作日志。',
    ],
    rules: [
      '日历中仅有操作日志的日期可选择，无日志日期置灰且不可点击。',
      '记录创建 APP 测试账号、重置 APP 测试账号密码、手动清理、重试清理。',
      '不记录复制密码、APP 端测试绑定、自动清理、主动解绑。',
      '每条日志展示操作对象、来源、创建人、操作人、结果、失败原因和备注。',
    ],
  },
].map((rule, index) => ({ ...rule, number: String(index + 1).padStart(2, '0') }));

const ANNOTATION_RULE_MAP = new Map(ANNOTATION_RULES.map((rule) => [rule.id, rule]));

const ACCOUNT_STATUS_MAP = {
  active: { label: '生效中', tone: 'success' },
  stopped: { label: '已停用', tone: 'muted' },
  expired: { label: '已过期', tone: 'orange' },
};

const DEALER_STATUS_MAP = {
  normal: { label: '正常', tone: 'success' },
  disabled: { label: '停用', tone: 'muted' },
};

const REGION_TAG_TONE = {
  中国: 'info',
  亚洲: 'success',
  北美: 'warning',
  欧洲: 'orange',
};

const LEVEL_TAG_TONE = {
  一级: 'info',
  二级: 'warning',
  三级: 'orange',
  全部: 'muted',
};

function nowText() {
  return '2026-07-08 11:30:00';
}

const DATE_INPUT_FORMATTER = new Intl.DateTimeFormat('en-CA', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

function formatDateInputValue(date) {
  const parts = Object.fromEntries(
    DATE_INPUT_FORMATTER.formatToParts(date).map(({ type, value }) => [type, value]),
  );
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function getValidityEndDateText(startDateText, years) {
  const [year, month, day] = startDateText.split('-').map(Number);
  const endDate = new Date(year + years, month - 1, day);
  endDate.setDate(endDate.getDate() - 1);
  return formatDateInputValue(endDate);
}

function getEffectiveAccountStatus(account) {
  if (account.status === 'stopped') return 'stopped';
  if (account.validEndAt && account.validEndAt < nowText().slice(0, 10)) return 'expired';
  return 'active';
}

function createId(prefix) {
  return `${prefix}-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 90 + 10)}`;
}

const TEMP_PASSWORD_GROUPS = [
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  'abcdefghijklmnopqrstuvwxyz',
  '0123456789',
];
const TEMP_PASSWORD_LENGTH = 10;

function secureRandomIndex(length) {
  const values = new Uint32Array(1);
  const limit = Math.floor(0x100000000 / length) * length;
  do {
    crypto.getRandomValues(values);
  } while (values[0] >= limit);
  return values[0] % length;
}

function randomCharacter(characters) {
  return characters[secureRandomIndex(characters.length)];
}

function createTemporaryPassword() {
  const allCharacters = TEMP_PASSWORD_GROUPS.join('');
  const password = TEMP_PASSWORD_GROUPS.map(randomCharacter);
  while (password.length < TEMP_PASSWORD_LENGTH) {
    password.push(randomCharacter(allCharacters));
  }
  for (let index = password.length - 1; index > 0; index -= 1) {
    const swapIndex = secureRandomIndex(index + 1);
    [password[index], password[swapIndex]] = [password[swapIndex], password[index]];
  }
  return password.join('');
}

function getClientConfig(clientName) {
  return TEST_ACCOUNT_CLIENTS.find((item) => item.clientName === clientName) || DEFAULT_TEST_ACCOUNT_CLIENT;
}

function openUserCenterDetail(userId) {
  const url = `/user-center/users/${encodeURIComponent(userId)}`;
  const openedWindow = window.open(url, '_blank');
  if (openedWindow) openedWindow.opener = null;
  return Boolean(openedWindow);
}

function getRecordDeviceId(record) {
  return record.deviceId || record.deviceSn;
}

function openDeviceCenterDetail(deviceId) {
  const url = `/device-center/devices/${encodeURIComponent(deviceId)}`;
  const openedWindow = window.open(url, '_blank');
  if (openedWindow) openedWindow.opener = null;
  return Boolean(openedWindow);
}

function buildDeviceRecordGroups(records) {
  const groupMap = new Map();
  [...records]
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt))
    .forEach((record) => {
      const deviceId = getRecordDeviceId(record);
      if (!groupMap.has(deviceId)) groupMap.set(deviceId, []);
      groupMap.get(deviceId).push(record);
    });

  return Array.from(groupMap, ([deviceId, deviceRecords]) => ({
    deviceId,
    latest: deviceRecords[0],
    records: deviceRecords,
    addCount: deviceRecords.length,
  }));
}

function buildOrgIndexes(orgNodes) {
  const nodeMap = new Map();
  const childrenMap = new Map();
  const dealerNodeMap = new Map();

  orgNodes.forEach((node) => {
    nodeMap.set(node.id, node);
    if (node.dealerId) dealerNodeMap.set(node.dealerId, node);
    if (!childrenMap.has(node.parentId || '')) childrenMap.set(node.parentId || '', []);
  });

  orgNodes.forEach((node) => {
    if (!childrenMap.has(node.parentId || '')) childrenMap.set(node.parentId || '', []);
    if (node.parentId) childrenMap.get(node.parentId).push(node);
  });

  return { nodeMap, childrenMap, dealerNodeMap };
}

function collectDescendantNodes(nodeId, childrenMap) {
  const result = [];
  const stack = [...(childrenMap.get(nodeId) || [])];

  while (stack.length > 0) {
    const node = stack.shift();
    result.push(node);
    stack.unshift(...(childrenMap.get(node.id) || []));
  }

  return result;
}

function getOrgPath(node, nodeMap) {
  if (!node) return '全部经销商';
  const path = [];
  let current = node;

  while (current) {
    path.unshift(current.name);
    current = current.parentId ? nodeMap.get(current.parentId) : null;
  }

  return path.join(' / ');
}

function getDealerStats(dealerId, accounts, records) {
  const dealerAccounts = accounts.filter((account) => account.dealerId === dealerId);
  const dealerRecords = records.filter((record) => record.dealerId === dealerId);
  const recordGroups = buildDeviceRecordGroups(dealerRecords);
  const activeTestAccountCount = dealerAccounts.filter((account) => getEffectiveAccountStatus(account) === 'active').length;
  return {
    testAccountCount: dealerAccounts.length,
    activeTestAccountCount,
    testingDeviceCount: recordGroups.filter((group) => group.latest.status === 'testing').length,
    endedDeviceCount: recordGroups.filter((group) => group.latest.status !== 'testing').length,
    abnormalDeviceCount: recordGroups.filter((group) => group.latest.status === 'clean_failed').length,
    testedDeviceCount: recordGroups.length,
    totalAddCount: dealerRecords.length,
    hasTesting: recordGroups.some((group) => group.latest.status === 'testing'),
    hasTestAccount: dealerAccounts.length > 0,
    latestTestAt: recordGroups.map((group) => group.latest.startedAt).filter(Boolean).sort().at(-1) || '',
  };
}

function Tag({ children, tone = 'muted' }) {
  return <span className={cls('dm-tag', `dm-tag-${tone}`)}>{children}</span>;
}

function LevelTag({ level }) {
  if (!level) return null;
  return <Tag tone={LEVEL_TAG_TONE[level] || 'muted'}>{level}</Tag>;
}

function isBindingUnbound(record) {
  return record.endReason === '主动解绑';
}

function EmptyState({ title = '暂无数据', desc = '当前筛选条件下没有可展示的数据。' }) {
  return (
    <div className="dm-empty">
      <ClipboardList size={22} />
      <strong>{title}</strong>
      <span>{desc}</span>
    </div>
  );
}

function Toast({ message, tone = 'success' }) {
  if (!message) return null;
  const Icon = tone === 'error' ? AlertTriangle : CheckCircle2;
  return (
    <div className={cls('dm-toast', tone)} role="status" aria-live="polite">
      <Icon size={16} aria-hidden="true" />
      {message}
    </div>
  );
}

function AnnotationToggle({ enabled, onToggle }) {
  return (
    <button
      className={cls('dm-annotation-toggle', enabled && 'active')}
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={() => onToggle?.(!enabled)}
    >
      <FileText size={14} />
      <span>标注模式</span>
      <i aria-hidden="true" />
    </button>
  );
}

function AnnotationDot({ id, annotation, inline = false }) {
  const rule = ANNOTATION_RULE_MAP.get(id);
  if (!annotation?.enabled || !rule) return null;

  const active = annotation.activeId === id;
  return (
    <button
      className={cls('dm-annotation-dot', inline && 'inline', active && 'active')}
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        annotation.onOpen?.(id);
      }}
      aria-label={`查看标注 ${rule.number}：${rule.title}`}
      title={`标注 ${rule.number}：${rule.title}`}
    >
      {rule.number}
    </button>
  );
}

function AnnotationRulePopover({ rule, onClose }) {
  const renderList = (title, items) => {
    if (!items?.length) return null;
    return (
      <section>
        <h4>{title}</h4>
        <ul>
          {items.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </section>
    );
  };

  return (
    <aside className="dm-annotation-popover" aria-label={`标注 ${rule.number} 规则说明`}>
      <div className="dm-annotation-popover-head">
        <strong>{rule.number}. {rule.title}</strong>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onClose?.();
          }}
          aria-label="关闭标注说明"
        >
          <X size={14} />
        </button>
      </div>
      <div className="dm-annotation-popover-body">
        <p>{rule.summary}</p>
        {renderList('字段规则', rule.fields)}
        {renderList('流转规则', rule.flow)}
        {renderList('处理规则', rule.rules)}
      </div>
    </aside>
  );
}

function AnnotationArea({ id, annotation, className, children }) {
  const rule = ANNOTATION_RULE_MAP.get(id);
  const active = annotation?.enabled && annotation?.activeId === id;

  return (
    <div className={cls('dm-annotated', active && 'active', className)}>
      {children}
      <AnnotationDot id={id} annotation={annotation} />
      {active && rule && <AnnotationRulePopover rule={rule} onClose={annotation?.onClose} />}
    </div>
  );
}

export default function DealerManagementDemo({ onOpenDeviceDetail } = {}) {
  const [dealers] = useState(initialDealers);
  const [accounts, setAccounts] = useState(initialTestAccounts);
  const [records] = useState(initialTestRecords);
  const [logs, setLogs] = useState(initialOperationLogs);
  const [selectedDealerId, setSelectedDealerId] = useState(initialDealers[0].id);
  const [activeTab, setActiveTab] = useState('设备测试记录');
  const [recordKeyword, setRecordKeyword] = useState('');
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);
  const [annotationEnabled, setAnnotationEnabled] = useState(true);
  const [activeAnnotationId, setActiveAnnotationId] = useState('');

  const selectedDealer = dealers.find((dealer) => dealer.id === selectedDealerId) || dealers[0];
  const annotation = {
    enabled: annotationEnabled,
    activeId: activeAnnotationId,
    onOpen: (id) => {
      setAnnotationEnabled(true);
      setActiveAnnotationId(id);
    },
    onClose: () => setActiveAnnotationId(''),
    onToggle: (enabled) => {
      setAnnotationEnabled(enabled);
      setActiveAnnotationId('');
    },
  };

  useEffect(() => {
    if (!annotationEnabled || !activeAnnotationId) return undefined;

    const closeActiveAnnotation = (event) => {
      const target = event.target;
      if (target?.closest?.('.dm-annotation-dot, .dm-annotation-popover')) return;
      setActiveAnnotationId('');
    };
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setActiveAnnotationId('');
    };

    document.addEventListener('mousedown', closeActiveAnnotation);
    document.addEventListener('touchstart', closeActiveAnnotation);
    document.addEventListener('keydown', closeOnEscape);

    return () => {
      document.removeEventListener('mousedown', closeActiveAnnotation);
      document.removeEventListener('touchstart', closeActiveAnnotation);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [annotationEnabled, activeAnnotationId]);

  const showToast = (message, tone = 'success') => {
    setToast({ message, tone });
    window.clearTimeout(window.__dmToastTimer);
    window.__dmToastTimer = window.setTimeout(() => setToast(null), 2200);
  };

  const appendLog = (payload) => {
    const dealer = dealers.find((item) => item.id === payload.dealerId) || selectedDealer;
    setLogs((prev) => [
      {
        id: createId('LOG'),
        dealerId: dealer.id,
        dealerName: dealer.name,
        accountId: payload.accountId || '',
        userId: payload.userId || '',
        accountName: payload.accountName || '',
        deviceSn: payload.deviceSn || '',
        actionType: payload.actionType,
        source: payload.source || '管理后台',
        creator: payload.creator || payload.operator || '汤彦珊',
        operator: payload.operator || '汤彦珊',
        result: payload.result || '成功',
        failReason: payload.failReason || '',
        remark: payload.remark || '',
        createdAt: nowText(),
      },
      ...prev,
    ]);
  };

  const handleSelectDealer = (dealerId, options = {}) => {
    setSelectedDealerId(dealerId);
    if (options.tab) setActiveTab(options.tab);
    setRecordKeyword(options.recordKeyword || '');
  };

  const handleRefresh = (message = '已刷新当前数据') => {
    showToast(message);
  };

  const handleOpenUserCenterDetail = (account) => {
    const opened = openUserCenterDetail(account.userId);
    showToast(
      opened ? '已在新标签页打开用户中心详情' : '浏览器已拦截新标签页，请允许弹窗后重试',
      opened ? 'success' : 'error',
    );
  };

  const handleOpenDeviceCenterDetail = (record) => {
    const deviceId = getRecordDeviceId(record);
    if (onOpenDeviceDetail) {
      onOpenDeviceDetail(deviceId, record);
      showToast('已跳转至【202606】详情模块迭代阶段范围');
      return;
    }
    const opened = openDeviceCenterDetail(deviceId);
    showToast(
      opened ? '已在新标签页打开设备详情' : '浏览器已拦截新标签页，请允许弹窗后重试',
      opened ? 'success' : 'error',
    );
  };

  const handleCopyCredentialPassword = async ({ password }) => {
    try {
      if (!navigator.clipboard) throw new Error('clipboard unavailable');
      await navigator.clipboard?.writeText(password);
      showToast('临时密码已复制');
    } catch (error) {
      showToast('复制失败，请手动选中密码复制', 'error');
    }
  };

  const handleCreateAccount = (formData) => {
    const dealer = dealers.find((item) => item.id === formData.dealerId);
    if (!dealer || dealer.status === 'disabled') {
      showToast('经销商已停用，无法创建App测试账号', 'error');
      return;
    }
    const accountName = formData.accountName.trim();
    const hasDuplicateName = accounts.some((account) => account.dealerId === dealer.id && account.accountName === accountName);
    if (hasDuplicateName) {
      showToast('该经销商下已存在同名App测试账号，请调整账号名称', 'error');
      return;
    }
    const client = getClientConfig(formData.clientName);
    const validStartAt = nowText().slice(0, 10);
    if (
      !formData.validEndAt
      || formData.validEndAt < validStartAt
      || formData.validEndAt > getValidityEndDateText(validStartAt, MAX_TEST_ACCOUNT_VALID_YEARS)
    ) {
      showToast('到期时间无效，请选择今天起 10 年内的日期', 'error');
      return;
    }
    const account = {
      id: createId('TA'),
      dealerId: dealer.id,
      userId: formData.userId || `U${Date.now().toString().slice(-6)}`,
      accountName,
      mobile: formData.mobile,
      accountSource: '设备中心创建',
      region: formData.region,
      clientName: client.clientName,
      clientId: client.clientId,
      status: 'active',
      validStartAt,
      validEndAt: formData.validEndAt,
      applyReason: formData.applyReason,
      createdAt: nowText(),
    };
    const temporaryPassword = createTemporaryPassword();
    setAccounts((prev) => [account, ...prev]);
    appendLog({
      dealerId: dealer.id,
      accountId: account.id,
      userId: account.userId,
      accountName: account.accountName,
      actionType: '创建App测试账号',
      creator: '汤彦珊',
      remark: `大区：${account.region}；客户端：${account.clientName} / ${account.clientId}；创建后立即生效；临时密码仅本次展示`,
    });
    setSelectedDealerId(dealer.id);
    setActiveTab('APP测试账号');
    setModal({
      type: 'credential',
      mode: 'create',
      dealer,
      account,
      password: temporaryPassword,
    });
    showToast('创建成功，App测试账号已立即生效');
  };

  const handleResetPassword = (account, formData) => {
    const dealer = dealers.find((item) => item.id === account.dealerId) || selectedDealer;
    const temporaryPassword = createTemporaryPassword();
    appendLog({
      dealerId: dealer.id,
      accountId: account.id,
      userId: account.userId,
      accountName: account.accountName,
      actionType: '重置App测试账号密码',
      source: '管理后台',
      operator: '汤彦珊',
      remark: `重置原因：${formData.reason}；新密码仅本次展示`,
    });
    setModal({
      type: 'credential',
      mode: 'reset',
      dealer,
      account,
      password: temporaryPassword,
    });
    showToast('密码已重置，新密码仅本次展示');
  };

  return (
    <section className="dm-page">
      <DealerWorkbenchView
        dealers={dealers}
        orgNodes={initialDealerOrgNodes}
        accounts={accounts}
        records={records}
        logs={logs}
        selectedDealerId={selectedDealerId}
        onSelectDealer={handleSelectDealer}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        recordKeyword={recordKeyword}
        setRecordKeyword={setRecordKeyword}
        onOpenCreate={(dealerId) => setModal({ type: 'create', dealerId })}
        onRefresh={handleRefresh}
        onOpenUserDetail={handleOpenUserCenterDetail}
        onOpenDeviceDetail={handleOpenDeviceCenterDetail}
        onResetPassword={(account) => setModal({ type: 'resetPassword', account })}
        annotation={annotation}
      />

      {modal?.type === 'create' && (
        <CreateAccountModal
          dealers={dealers}
          accounts={accounts}
          defaultDealerId={modal.dealerId || selectedDealer.id}
          onSubmit={handleCreateAccount}
          onValidationError={(message) => showToast(message, 'error')}
          onClose={() => setModal(null)}
          annotation={annotation}
        />
      )}
      {modal?.type === 'credential' && modal.account && modal.dealer && (
        <CredentialResultModal
          mode={modal.mode}
          dealer={modal.dealer}
          account={modal.account}
          password={modal.password}
          onCopy={handleCopyCredentialPassword}
          onClose={() => setModal(null)}
          annotation={annotation}
        />
      )}
      {modal?.type === 'resetPassword' && modal.account && (
        <ResetPasswordModal
          account={modal.account}
          dealer={dealers.find((item) => item.id === modal.account.dealerId) || selectedDealer}
          onSubmit={handleResetPassword}
          onClose={() => setModal(null)}
          annotation={annotation}
        />
      )}
      <Toast message={toast?.message} tone={toast?.tone} />
    </section>
  );
}

function DealerWorkbenchView({
  dealers,
  orgNodes,
  accounts,
  records,
  logs,
  selectedDealerId,
  onSelectDealer,
  activeTab,
  setActiveTab,
  recordKeyword,
  setRecordKeyword,
  onOpenCreate,
  onRefresh,
  onOpenUserDetail,
  onOpenDeviceDetail,
  onResetPassword,
  annotation,
}) {
  const [draftFilters, setDraftFilters] = useState(DEFAULT_DEALER_LIST_FILTERS);
  const [filters, setFilters] = useState(DEFAULT_DEALER_LIST_FILTERS);
  const [expandedNodeIds, setExpandedNodeIds] = useState(() => new Set(orgNodes.map((node) => node.id)));

  const orgIndex = useMemo(() => buildOrgIndexes(orgNodes), [orgNodes]);
  const dealerRows = useMemo(() => dealers.map((dealer) => {
    const stats = getDealerStats(dealer.id, accounts, records);
    const orgNode = orgIndex.dealerNodeMap.get(dealer.id);

    return {
      ...dealer,
      ...stats,
      orgNodeId: orgNode?.id || dealer.id,
      orgPath: getOrgPath(orgNode, orgIndex.nodeMap),
      testEnabled: stats.hasTestAccount,
    };
  }), [dealers, accounts, records, orgIndex]);

  const dealerRowMap = useMemo(() => new Map(dealerRows.map((dealer) => [dealer.id, dealer])), [dealerRows]);
  const filteredDealerRows = useMemo(() => dealerRows.filter((dealer) => {
    const keyword = filters.keyword.trim();
    if (keyword && !dealer.name.includes(keyword) && !dealer.id.includes(keyword)) return false;
    return true;
  }), [dealerRows, filters]);
  const filteredDealerIds = useMemo(() => new Set(filteredDealerRows.map((dealer) => dealer.id)), [filteredDealerRows]);
  const selectedDealer = filteredDealerIds.has(selectedDealerId) ? dealerRowMap.get(selectedDealerId) : null;

  useEffect(() => {
    if (filteredDealerRows.length === 0 || filteredDealerIds.has(selectedDealerId)) return;
    onSelectDealer(filteredDealerRows[0].id);
  }, [filteredDealerRows, filteredDealerIds, onSelectDealer, selectedDealerId]);

  const treeRows = useMemo(() => {
    const hasMatchedDealer = (node) => {
      if (node.dealerId && filteredDealerIds.has(node.dealerId)) return true;
      return collectDescendantNodes(node.id, orgIndex.childrenMap).some((item) => item.dealerId && filteredDealerIds.has(item.dealerId));
    };

    const buildRows = (parentId, depth = 0) => {
      const children = orgIndex.childrenMap.get(parentId) || [];
      return children.flatMap((node) => {
        if (!hasMatchedDealer(node)) return [];
        const dealer = node.dealerId ? dealerRowMap.get(node.dealerId) : null;
        const visibleChildren = (orgIndex.childrenMap.get(node.id) || []).filter(hasMatchedDealer);
        const current = dealer ? [{
          id: node.id,
          node,
          dealer,
          depth,
          hasChildren: visibleChildren.length > 0,
          isMatched: filteredDealerIds.has(dealer.id),
        }] : [];

        if (!expandedNodeIds.has(node.id)) return current;
        return [...current, ...buildRows(node.id, depth + 1)];
      });
    };

    return buildRows(ROOT_ORG_ID);
  }, [dealerRowMap, expandedNodeIds, filteredDealerIds, orgIndex]);

  const updateDraftFilter = (key, value) => setDraftFilters((prev) => ({ ...prev, [key]: value }));
  const submitFilters = (event) => {
    event.preventDefault();
    setFilters({ ...draftFilters, keyword: draftFilters.keyword.trim() });
  };
  const resetFilters = () => {
    setDraftFilters(DEFAULT_DEALER_LIST_FILTERS);
    setFilters(DEFAULT_DEALER_LIST_FILTERS);
  };
  const toggleOrgNode = (nodeId) => {
    setExpandedNodeIds((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      return next;
    });
  };

  return (
    <>
      <div className="dm-page-head dm-workbench-page-head">
        <div className="dm-workbench-breadcrumb">
          <span>经销商列表</span>
          <ChevronRight size={13} aria-hidden="true" />
          <strong>{selectedDealer?.name || '请选择经销商'}</strong>
        </div>
        <div className="dm-page-head-actions">
          <AnnotationToggle enabled={annotation?.enabled} onToggle={annotation?.onToggle} />
        </div>
      </div>

      <div className="dm-workbench-layout">
        <aside className="dm-card dm-dealer-nav-panel">
          <div className="dm-card-head">
            <div>
              <h2>经销商信息</h2>
            </div>
            <div className="dm-dealer-nav-total">共计 <strong>{filteredDealerRows.length}</strong> 家</div>
          </div>

          <AnnotationArea id="dealerSearch" annotation={annotation}>
            <form className="dm-dealer-nav-filter" onSubmit={submitFilters}>
              <label className="dm-dealer-search-field">
                <span>经销商名称 / ID</span>
                <div className="dm-dealer-search-line">
                  <input value={draftFilters.keyword} onChange={(event) => updateDraftFilter('keyword', event.target.value)} placeholder="请输入名称或 ID" />
                  <button className="dm-btn dm-btn-primary" type="submit"><Search size={14} />查询</button>
                  <button className="dm-btn dm-btn-ghost" type="button" onClick={resetFilters}>重置</button>
                </div>
              </label>
            </form>
          </AnnotationArea>

          <AnnotationArea id="dealerTree" annotation={annotation} className="dm-annotation-stretch">
            <div className="dm-dealer-nav-list">
              {treeRows.length === 0 && <EmptyState title="暂无匹配经销商" desc="请调整筛选条件后重试。" />}
              {treeRows.map(({ id, node, dealer, depth, hasChildren, isMatched }) => {
                const isSelected = dealer.id === selectedDealerId && isMatched;
                const statusCfg = DEALER_STATUS_MAP[dealer.status] || DEALER_STATUS_MAP.normal;
                return (
                  <div
                    className={cls('dm-dealer-nav-row', isSelected && 'active', !isMatched && 'context')}
                    style={{ '--tree-depth': depth }}
                    key={id}
                  >
                    <button
                      className="dm-dealer-nav-toggle"
                      type="button"
                      disabled={!hasChildren}
                      onClick={() => toggleOrgNode(node.id)}
                      aria-label={expandedNodeIds.has(node.id) ? '收起下级' : '展开下级'}
                    >
                      {hasChildren ? (expandedNodeIds.has(node.id) ? <ChevronDown size={14} /> : <ChevronRight size={14} />) : null}
                    </button>
                    <button
                      className="dm-dealer-nav-item"
                      type="button"
                      disabled={!isMatched}
                      onClick={() => onSelectDealer(dealer.id)}
                    >
                      <span className="dm-dealer-nav-title">
                        <strong>{dealer.name}</strong>
                        <LevelTag level={dealer.level} />
                        {dealer.status !== 'normal' && <Tag tone={statusCfg.tone}>{statusCfg.label}</Tag>}
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          </AnnotationArea>
        </aside>

        <main className="dm-workbench-detail">
          {selectedDealer ? (
            <DealerDetailView
              dealer={selectedDealer}
              accounts={accounts}
              records={records}
              logs={logs}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              recordKeyword={recordKeyword}
              setRecordKeyword={setRecordKeyword}
              hideBack
              hideToolbar
              onOpenCreate={() => onOpenCreate(selectedDealer.id)}
              onRefresh={onRefresh}
              onOpenUserDetail={onOpenUserDetail}
              onOpenDeviceDetail={onOpenDeviceDetail}
              onResetPassword={onResetPassword}
              annotation={annotation}
            />
          ) : (
            <section className="dm-card">
              <EmptyState title="请选择经销商" desc="左侧筛选结果为空，或当前经销商不在筛选范围内。" />
            </section>
          )}
        </main>
      </div>
    </>
  );
}

function DealerListView({ dealers, orgNodes, accounts, records, onOpenDetail, onOpenCreate }) {
  const [draftFilters, setDraftFilters] = useState(DEFAULT_DEALER_LIST_FILTERS);
  const [filters, setFilters] = useState(DEFAULT_DEALER_LIST_FILTERS);
  const [selectedOrgId, setSelectedOrgId] = useState(ROOT_ORG_ID);
  const [includeChildren, setIncludeChildren] = useState(true);
  const [expandedNodeIds, setExpandedNodeIds] = useState(() => new Set(orgNodes.map((node) => node.id)));

  const orgIndex = useMemo(() => buildOrgIndexes(orgNodes), [orgNodes]);
  const selectedOrg = orgIndex.nodeMap.get(selectedOrgId) || orgIndex.nodeMap.get(ROOT_ORG_ID);
  const onlyCurrentDisabled = selectedOrg?.id === ROOT_ORG_ID || !selectedOrg?.dealerId;
  const effectiveIncludeChildren = onlyCurrentDisabled || includeChildren;
  const scopePath = getOrgPath(selectedOrg, orgIndex.nodeMap);

  const scopeDealerIds = useMemo(() => {
    const currentNode = orgIndex.nodeMap.get(selectedOrgId) || orgIndex.nodeMap.get(ROOT_ORG_ID);
    const scopeNodes = effectiveIncludeChildren
      ? [currentNode, ...collectDescendantNodes(currentNode.id, orgIndex.childrenMap)]
      : [currentNode];

    return new Set(scopeNodes.map((node) => node?.dealerId).filter(Boolean));
  }, [selectedOrgId, effectiveIncludeChildren, orgIndex]);

  const dealerRows = useMemo(() => dealers.map((dealer) => {
    const stats = getDealerStats(dealer.id, accounts, records);
    const orgNode = orgIndex.dealerNodeMap.get(dealer.id);
    const childDealerCount = orgNode
      ? collectDescendantNodes(orgNode.id, orgIndex.childrenMap).filter((node) => node.dealerId).length
      : 0;
    return {
      ...dealer,
      ...stats,
      orgNodeId: orgNode?.id || dealer.id,
      orgPath: getOrgPath(orgNode, orgIndex.nodeMap),
      childDealerCount,
      testEnabled: stats.hasTestAccount,
    };
  }), [dealers, accounts, records, orgIndex]);

  const scopedRows = dealerRows.filter((dealer) => scopeDealerIds.has(dealer.id));
  const filteredRows = scopedRows.filter((dealer) => {
    const keyword = filters.keyword.trim();
    if (keyword && !dealer.name.includes(keyword) && !dealer.id.includes(keyword)) return false;
    return true;
  });

  const overview = [
    ['经销商总数（含2、3级）', scopedRows.length, effectiveIncludeChildren ? '当前组织及下级经销商' : '仅当前经销商', 'normal'],
    ['设备总数', scopedRows.reduce((sum, dealer) => sum + (dealer.deviceTotalCount || 0), 0), '来源于设备中心设备归属统计', 'blue'],
    ['App测试账号总数', scopedRows.reduce((sum, dealer) => sum + dealer.testAccountCount, 0), '当前范围内App测试账号总量', 'green'],
  ];

  const updateDraftFilter = (key, value) => setDraftFilters((prev) => ({ ...prev, [key]: value }));
  const submitFilters = (event) => {
    event.preventDefault();
    setFilters({ ...draftFilters, keyword: draftFilters.keyword.trim() });
  };
  const resetFilters = () => {
    setDraftFilters(DEFAULT_DEALER_LIST_FILTERS);
    setFilters(DEFAULT_DEALER_LIST_FILTERS);
  };
  const selectOrgNode = (node) => {
    setSelectedOrgId(node.id);
    if (node.id === ROOT_ORG_ID || !node.dealerId) setIncludeChildren(true);
  };
  const toggleOrgNode = (nodeId) => {
    setExpandedNodeIds((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      return next;
    });
  };

  return (
    <>
      <div className="dm-page-head">
        <div>
          <span className="dm-kicker">设备中心 / 经销商列表</span>
          <h1>经销商列表</h1>
        </div>
      </div>

      <div className="dm-overview-grid">
        {overview.map(([label, value, , tone]) => (
          <article className={cls('dm-overview-card', `tone-${tone}`)} key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </article>
        ))}
      </div>

      <div className="dm-org-layout">
        <DealerOrgTree
          rootNode={orgIndex.nodeMap.get(ROOT_ORG_ID)}
          childrenMap={orgIndex.childrenMap}
          selectedId={selectedOrg?.id || ROOT_ORG_ID}
          expandedNodeIds={expandedNodeIds}
          onSelect={selectOrgNode}
          onToggle={toggleOrgNode}
        />

        <div className="dm-list-main">
          <section className="dm-card">
            <div className="dm-card-head">
              <div>
                <h2>经销商筛选</h2>
                <span>先通过左侧组织树确定范围，再按名称筛选</span>
              </div>
            </div>
            <div className="dm-scope-bar">
              <div>
                <span>当前组织范围</span>
                <strong>{selectedOrg?.name || '全部经销商'}</strong>
                <small>{scopePath}</small>
              </div>
              <div className="dm-segmented">
                <button
                  className={cls(!effectiveIncludeChildren && 'active')}
                  type="button"
                  disabled={onlyCurrentDisabled}
                  onClick={() => setIncludeChildren(false)}
                >
                  仅当前
                </button>
                <button
                  className={cls(effectiveIncludeChildren && 'active')}
                  type="button"
                  onClick={() => setIncludeChildren(true)}
                >
                  包含下级
                </button>
              </div>
            </div>
            <form className="dm-filter-grid" onSubmit={submitFilters}>
              <label>
                <span>经销商名称 / 经销商 ID</span>
                <input value={draftFilters.keyword} onChange={(event) => updateDraftFilter('keyword', event.target.value)} placeholder="请输入名称或 ID" />
              </label>
              <div className="dm-filter-actions">
                <button className="dm-btn dm-btn-primary" type="submit"><Search size={15} />查询</button>
                <button className="dm-btn" type="button" onClick={resetFilters}>重置</button>
              </div>
            </form>
          </section>

          <section className="dm-card">
            <div className="dm-card-head">
              <div>
                <h2>经销商列表</h2>
                <span>列表统计口径跟随当前组织范围；设备总数仅展示设备归属规模</span>
              </div>
              <b>{filteredRows.length} 家</b>
            </div>
            <TableShell empty={filteredRows.length === 0} emptyTitle="暂无匹配经销商">
              <table className="dm-table">
                <thead>
                  <tr>
                    <th>经销商名称</th>
                    <th>经销商 ID</th>
                    <th>设备总数</th>
                    <th>App测试账号总数</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((dealer) => {
                    return (
                      <tr key={dealer.id}>
                        <td>
                          <div className="dm-name-cell">
                            <div className="dm-name-title">
                              <strong>{dealer.name}</strong>
                              <LevelTag level={dealer.level} />
                            </div>
                          </div>
                        </td>
                        <td className="dm-mono">{dealer.id}</td>
                        <td>{dealer.deviceTotalCount || 0}</td>
                        <td>{dealer.testAccountCount}</td>
                        <td>
                          <div className="dm-row-actions">
                            <button className="dm-link-btn" type="button" onClick={() => onOpenDetail(dealer.id)}>详情</button>
                            <button
                              className="dm-link-btn"
                              type="button"
                              disabled={dealer.status === 'disabled'}
                              title={dealer.status === 'disabled' ? '经销商已停用，无法创建App测试账号' : ''}
                              aria-label={dealer.status === 'disabled' ? '经销商已停用，无法创建App测试账号' : '创建账号'}
                              onClick={() => onOpenCreate(dealer.id)}
                            >
                              创建账号
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </TableShell>
          </section>
        </div>
      </div>
    </>
  );
}

function DealerOrgTree({ rootNode, childrenMap, selectedId, expandedNodeIds, onSelect, onToggle }) {
  return (
    <aside className="dm-card dm-org-panel">
      <div className="dm-card-head">
        <div>
          <h2>组织范围</h2>
          <span>选择经销商组织后，右侧列表按范围联动</span>
        </div>
      </div>
      <div className="dm-org-tree">
        {rootNode && (
          <OrgTreeNode
            node={rootNode}
            depth={0}
            childrenMap={childrenMap}
            selectedId={selectedId}
            expandedNodeIds={expandedNodeIds}
            onSelect={onSelect}
            onToggle={onToggle}
          />
        )}
      </div>
    </aside>
  );
}

function OrgTreeNode({ node, depth, childrenMap, selectedId, expandedNodeIds, onSelect, onToggle }) {
  const children = childrenMap.get(node.id) || [];
  const expanded = expandedNodeIds.has(node.id);
  const selected = selectedId === node.id;

  return (
    <div className="dm-tree-node">
      <div className="dm-tree-row" style={{ '--tree-depth': depth }}>
        <button
          className="dm-tree-switch"
          type="button"
          disabled={children.length === 0}
          onClick={() => onToggle(node.id)}
          aria-label={expanded ? '收起组织' : '展开组织'}
        >
          {children.length > 0 ? (expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />) : null}
        </button>
        <button
          className={cls('dm-tree-label', selected && 'active', node.nodeType === 'org' && 'virtual')}
          type="button"
          onClick={() => onSelect(node)}
        >
          <Building2 size={14} />
          <span>{node.name}</span>
          <small>{node.nodeType === 'root' ? '全量' : node.nodeType === 'org' ? '组织' : '经销商'}</small>
        </button>
      </div>
      {expanded && children.map((child) => (
        <OrgTreeNode
          key={child.id}
          node={child}
          depth={depth + 1}
          childrenMap={childrenMap}
          selectedId={selectedId}
          expandedNodeIds={expandedNodeIds}
          onSelect={onSelect}
          onToggle={onToggle}
        />
      ))}
    </div>
  );
}

function DealerHierarchyListView({ dealers, orgNodes, accounts, records, onOpenDetail, onOpenCreate }) {
  const [draftFilters, setDraftFilters] = useState(DEFAULT_DEALER_LIST_FILTERS);
  const [filters, setFilters] = useState(DEFAULT_DEALER_LIST_FILTERS);
  const [expandedNodeIds, setExpandedNodeIds] = useState(() => new Set(orgNodes.map((node) => node.id)));

  const orgIndex = useMemo(() => buildOrgIndexes(orgNodes), [orgNodes]);
  const dealerRows = useMemo(() => dealers.map((dealer) => {
    const stats = getDealerStats(dealer.id, accounts, records);
    const orgNode = orgIndex.dealerNodeMap.get(dealer.id);
    const childDealerCount = orgNode
      ? collectDescendantNodes(orgNode.id, orgIndex.childrenMap).filter((node) => node.dealerId).length
      : 0;

    return {
      ...dealer,
      ...stats,
      orgNodeId: orgNode?.id || dealer.id,
      orgPath: getOrgPath(orgNode, orgIndex.nodeMap),
      childDealerCount,
      testEnabled: stats.hasTestAccount,
    };
  }), [dealers, accounts, records, orgIndex]);

  const dealerRowMap = useMemo(() => new Map(dealerRows.map((dealer) => [dealer.id, dealer])), [dealerRows]);
  const matchedDealerRows = dealerRows.filter((dealer) => {
    const keyword = filters.keyword.trim();
    if (keyword && !dealer.name.includes(keyword) && !dealer.id.includes(keyword)) return false;
    return true;
  });
  const matchedDealerIds = useMemo(() => new Set(matchedDealerRows.map((dealer) => dealer.id)), [matchedDealerRows]);

  const treeRows = useMemo(() => {
    const hasMatchedDealer = (node) => {
      if (node.dealerId && matchedDealerIds.has(node.dealerId)) return true;
      return collectDescendantNodes(node.id, orgIndex.childrenMap).some((item) => item.dealerId && matchedDealerIds.has(item.dealerId));
    };

    const buildRows = (parentId, depth = 0) => {
      const children = orgIndex.childrenMap.get(parentId) || [];
      return children.flatMap((node) => {
        if (!hasMatchedDealer(node)) return [];
        const visibleChildren = (orgIndex.childrenMap.get(node.id) || []).filter(hasMatchedDealer);
        const dealer = node.dealerId ? dealerRowMap.get(node.dealerId) : null;
        const descendantDealers = collectDescendantNodes(node.id, orgIndex.childrenMap)
          .map((item) => item.dealerId && dealerRowMap.get(item.dealerId))
          .filter(Boolean);
        const aggregateDealers = dealer ? [dealer, ...descendantDealers] : descendantDealers;
        const aggregate = {
          testEnabled: aggregateDealers.some((item) => item.testEnabled),
          testAccountCount: aggregateDealers.reduce((sum, item) => sum + item.testAccountCount, 0),
          activeTestAccountCount: aggregateDealers.reduce((sum, item) => sum + item.activeTestAccountCount, 0),
          testingDeviceCount: aggregateDealers.reduce((sum, item) => sum + item.testingDeviceCount, 0),
          deviceTotalCount: aggregateDealers.reduce((sum, item) => sum + (item.deviceTotalCount || 0), 0),
          childDealerCount: descendantDealers.length,
        };
        const current = {
          id: node.id,
          node,
          dealer,
          depth,
          hasChildren: visibleChildren.length > 0,
          aggregate,
        };

        if (!expandedNodeIds.has(node.id)) return [current];
        return [current, ...buildRows(node.id, depth + 1)];
      });
    };

    return buildRows(ROOT_ORG_ID);
  }, [dealerRowMap, expandedNodeIds, matchedDealerIds, orgIndex]);

  const overview = [
    ['经销商总数（含2、3级）', matchedDealerRows.length, '当前筛选结果中的经销商数量', 'normal'],
    ['设备总数', matchedDealerRows.reduce((sum, dealer) => sum + (dealer.deviceTotalCount || 0), 0), '当前筛选结果内设备归属总量', 'blue'],
    ['App测试账号总数', matchedDealerRows.reduce((sum, dealer) => sum + dealer.testAccountCount, 0), '当前筛选结果内App测试账号总量', 'green'],
  ];

  const updateDraftFilter = (key, value) => setDraftFilters((prev) => ({ ...prev, [key]: value }));
  const submitFilters = (event) => {
    event.preventDefault();
    setFilters({ ...draftFilters, keyword: draftFilters.keyword.trim() });
  };
  const resetFilters = () => {
    setDraftFilters(DEFAULT_DEALER_LIST_FILTERS);
    setFilters(DEFAULT_DEALER_LIST_FILTERS);
  };
  const toggleOrgNode = (nodeId) => {
    setExpandedNodeIds((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      return next;
    });
  };

  return (
    <>
      <div className="dm-page-head">
        <div>
          <span className="dm-kicker">设备中心 / 经销商列表</span>
          <h1>经销商列表</h1>
        </div>
      </div>

      <div className="dm-overview-grid">
        {overview.map(([label, value, , tone]) => (
          <article className={cls('dm-overview-card', `tone-${tone}`)} key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </article>
        ))}
      </div>

      <section className="dm-card">
        <div className="dm-card-head">
          <div>
            <h2>经销商筛选</h2>
          </div>
        </div>
        <form className="dm-filter-grid" onSubmit={submitFilters}>
          <label>
            <span>经销商名称 / 经销商 ID</span>
            <input value={draftFilters.keyword} onChange={(event) => updateDraftFilter('keyword', event.target.value)} placeholder="请输入名称或 ID" />
          </label>
          <div className="dm-filter-actions">
            <button className="dm-btn dm-btn-primary" type="submit"><Search size={15} />查询</button>
            <button className="dm-btn" type="button" onClick={resetFilters}>重置</button>
          </div>
        </form>
      </section>

      <section className="dm-card">
        <div className="dm-card-head">
          <div>
            <h2>经销商列表</h2>
          </div>
          <div className="dm-hierarchy-tools">
            <b>{matchedDealerRows.length} 家</b>
          </div>
        </div>
        <TableShell empty={treeRows.length === 0} emptyTitle="暂无匹配经销商">
          <table className="dm-table">
            <thead>
              <tr>
                <th>经销商名称</th>
                <th>经销商 ID</th>
                <th>设备总数</th>
                <th>App测试账号总数</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {treeRows.map(({ id, node, dealer, depth, hasChildren, aggregate }) => {
                const isGroup = !dealer;
                const rowData = dealer || aggregate;
                return (
                  <tr key={id} className={cls(isGroup && 'dm-group-row')}>
                    <td>
                      <div className="dm-tree-table-name" style={{ '--tree-depth': depth }}>
                        <button
                          className="dm-table-toggle"
                          type="button"
                          disabled={!hasChildren}
                          onClick={() => toggleOrgNode(node.id)}
                          aria-label={expandedNodeIds.has(node.id) ? '收起下级' : '展开下级'}
                        >
                          {hasChildren ? (expandedNodeIds.has(node.id) ? <ChevronDown size={14} /> : <ChevronRight size={14} />) : null}
                        </button>
                        <div className="dm-name-cell">
                          <div className="dm-name-title">
                            <strong>{node.name}</strong>
                            <LevelTag level={dealer?.level || node.level} />
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className={cls('dm-mono', isGroup && 'dm-muted-cell')}>{dealer?.id || '-'}</td>
                    <td>{rowData.deviceTotalCount || 0}</td>
                    <td>{rowData.testAccountCount}</td>
                    <td>
                      {dealer ? (
                        <div className="dm-row-actions">
                          <button className="dm-link-btn" type="button" onClick={() => onOpenDetail(dealer.id)}>详情</button>
                          <button
                            className="dm-link-btn"
                            type="button"
                            disabled={dealer.status === 'disabled'}
                            title={dealer.status === 'disabled' ? '经销商已停用，无法创建App测试账号' : ''}
                            aria-label={dealer.status === 'disabled' ? '经销商已停用，无法创建App测试账号' : '创建账号'}
                            onClick={() => onOpenCreate(dealer.id)}
                          >
                            创建账号
                          </button>
                        </div>
                      ) : <span className="dm-muted-cell">-</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </TableShell>
      </section>
    </>
  );
}

function DealerDetailView({
  dealer,
  accounts,
  records,
  logs = [],
  activeTab,
  setActiveTab,
  recordKeyword,
  setRecordKeyword,
  onBack,
  onOpenCreate,
  onRefresh,
  onOpenUserDetail,
  onOpenDeviceDetail,
  onResetPassword,
  inDrawer = false,
  hideBack = false,
  hideToolbar = false,
  annotation,
}) {
  const dealerAccounts = accounts.filter((account) => account.dealerId === dealer.id);
  const dealerRecords = records.filter((record) => record.dealerId === dealer.id);
  const dealerLogs = logs.filter((log) => log.dealerId === dealer.id);

  return (
    <>
      {!inDrawer && !hideToolbar && (
        <div className="dm-detail-toolbar">
          {!hideBack && <button className="dm-btn" type="button" onClick={onBack}><ArrowLeft size={15} />返回</button>}
          <button className="dm-btn" type="button" onClick={() => onRefresh?.('已刷新经销商详情')}><RefreshCw size={15} />刷新</button>
          <button
            className="dm-btn dm-btn-primary"
            type="button"
            onClick={onOpenCreate}
            disabled={dealer.status === 'disabled'}
            title={dealer.status === 'disabled' ? '经销商已停用，无法创建App测试账号' : ''}
          >
            <UserPlus size={15} />创建账号
          </button>
        </div>
      )}

      <AnnotationArea id="dealerContext" annotation={annotation}>
        <section className="dm-card dm-detail-card">
          <header className="dm-dealer-profile-head">
            <div className="dm-dealer-profile-identity">
              <div className="dm-dealer-profile-title">
                <h1>{dealer.name}</h1>
                <LevelTag level={dealer.level} />
              </div>
            </div>
            <div className="dm-dealer-profile-actions">
              <button className="dm-btn" type="button" onClick={() => onRefresh?.('已刷新经销商详情')}>
                <RefreshCw size={14} />刷新
              </button>
            </div>
          </header>
          <dl className="dm-dealer-summary-fields">
            <DealerSummaryField label="经销商ID" value={dealer.id} mono />
            <DealerSummaryField label="经销商简称" value={dealer.shortName || '-'} />
            <DealerSummaryField label="创建时间" value={dealer.createdAt || '-'} time />
            <DealerSummaryField label="设备总数" value={`${dealer.deviceTotalCount || 0} 台`} accent />
          </dl>
        </section>
      </AnnotationArea>

      <section className="dm-card dm-detail-tabs-card">
        <AnnotationArea id="detailTabs" annotation={annotation}>
          <div className="dm-tabs">
            {DETAIL_TABS.map((tab) => (
              <button key={tab} className={cls(activeTab === tab && 'active')} type="button" onClick={() => setActiveTab(tab)}>
                {tab}
              </button>
            ))}
          </div>
        </AnnotationArea>
        {activeTab === 'APP测试账号' && (
          <TestAccountTab
            dealer={dealer}
            accounts={dealerAccounts}
            onOpenCreate={onOpenCreate}
            onOpenUserDetail={onOpenUserDetail}
            onResetPassword={onResetPassword}
            annotation={annotation}
          />
        )}
        {activeTab === '设备测试记录' && (
          <TestRecordTab
            records={dealerRecords}
            keyword={recordKeyword}
            setKeyword={setRecordKeyword}
            onOpenDeviceDetail={onOpenDeviceDetail}
            annotation={annotation}
          />
        )}
        {activeTab === '操作日志' && (
          <OperationLogTab
            logs={dealerLogs}
            showDealerColumn={false}
            emptyTitle="所选日期暂无当前经销商操作日志"
            annotation={annotation}
          />
        )}
      </section>
    </>
  );
}

function DealerSummaryField({ label, value, mono = false, time = false, accent = false }) {
  return (
    <div className={cls('dm-dealer-summary-field', accent && 'accent')}>
      <dt>{label}</dt>
      <dd className={cls(mono && 'dm-mono', time && 'dm-time')}>{value}</dd>
    </div>
  );
}

function AppTestAccountUsageNote({ className }) {
  return (
    <div className={cls('dm-usage-note', className)}>
      <strong>APP测试账号使用说明</strong>
      <ul>
        <li>APP测试账号仅用于经销商设备抽检、样机验证和异常复测。</li>
        <li>APP端可完成扫码添加、配网、在线检查、音视频、基础控制和 4G 通信测试。</li>
        <li>测试期间仅生成测试设备关系，不产生设备激活信息。</li>
        <li>测试完成后需在 APP 端解绑，保证用户能正常绑定并正式激活使用设备。</li>
      </ul>
    </div>
  );
}

function TestAccountTab({ dealer, accounts, onOpenCreate, onOpenUserDetail, onResetPassword, annotation }) {
  const [keyword, setKeyword] = useState('');

  const rows = accounts
    .filter((account) => {
      if (keyword && !account.accountName.includes(keyword) && !account.userId.includes(keyword)) return false;
      return true;
    });

  return (
    <div>
      <div className="dm-account-query-row">
        <AnnotationArea id="accountSearch" annotation={annotation} className="dm-annotation-query-field">
          <label className="dm-account-query-field">
            <span>账号名称 / 用户 ID</span>
            <input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="请输入账号名称或用户 ID" />
          </label>
        </AnnotationArea>
        <AnnotationArea id="createEntry" annotation={annotation} className="dm-annotation-query-actions">
          <div className="dm-tab-actions dm-account-query-actions">
            <button
              className="dm-btn dm-btn-primary"
              type="button"
              onClick={onOpenCreate}
              disabled={dealer.status === 'disabled'}
              title={dealer.status === 'disabled' ? '经销商已停用，无法创建App测试账号' : ''}
            >
              <Plus size={15} />创建账号
            </button>
          </div>
        </AnnotationArea>
      </div>
      <TableShell empty={rows.length === 0} emptyTitle="暂无App测试账号">
        <table className="dm-table">
          <thead>
            <tr>
              <th>账号名称</th>
              <th>用户 ID</th>
              <th>手机号</th>
              <th>所属大区</th>
              <th>客户端</th>
              <th>权限状态</th>
              <th>有效期</th>
              <th>创建时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((account) => {
              const effectiveStatus = getEffectiveAccountStatus(account);
              const statusCfg = ACCOUNT_STATUS_MAP[effectiveStatus];
              return (
                <tr key={account.id}>
                  <td>
                    <div className="dm-cell-stack">
                      <strong>{account.accountName}</strong>
                    </div>
                  </td>
                  <td className="dm-mono">{account.userId}</td>
                  <td>{account.mobile || '-'}</td>
                  <td><Tag tone={REGION_TAG_TONE[account.region] || 'muted'}>{account.region || '中国'}</Tag></td>
                  <td>
                    <div className="dm-cell-stack">
                      <strong>{account.clientName || DEFAULT_TEST_ACCOUNT_CLIENT.clientName}</strong>
                      <span className="dm-mono">{account.clientId || DEFAULT_TEST_ACCOUNT_CLIENT.clientId}</span>
                    </div>
                  </td>
                  <td>
                    <div className="dm-cell-stack">
                      <span><Tag tone={statusCfg.tone}>{statusCfg.label}</Tag></span>
                    </div>
                  </td>
                  <td className="dm-time">{account.validStartAt} 至 {account.validEndAt}</td>
                  <td className="dm-time">{account.createdAt}</td>
                  <td>
                    <div className="dm-row-actions">
                      <button className="dm-link-btn" type="button" onClick={() => onOpenUserDetail?.(account)}>查看</button>
                      <button
                        className="dm-link-btn"
                        type="button"
                        onClick={() => onResetPassword?.(account)}
                        title={effectiveStatus === 'active' ? '' : '重置密码不改变账号权限状态'}
                      >
                        重置密码
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </TableShell>
      <AppTestAccountUsageNote className="dm-usage-note-list" />
    </div>
  );
}

function TestRecordTab({ records, keyword, setKeyword, onOpenDeviceDetail, annotation }) {
  const [accountKeyword, setAccountKeyword] = useState('');
  const [bindingStartAt, setBindingStartAt] = useState('');
  const [bindingEndAt, setBindingEndAt] = useState('');
  const [expandedDeviceId, setExpandedDeviceId] = useState(null);

  const rows = useMemo(() => {
    return buildDeviceRecordGroups(records)
      .filter((group) => {
        const { latest, deviceId } = group;
        if (keyword && !deviceId.includes(keyword)) return false;
        if (accountKeyword && !latest.accountName.includes(accountKeyword) && !latest.userId.includes(accountKeyword)) return false;
        if (bindingStartAt && latest.startedAt.slice(0, 10) < bindingStartAt) return false;
        if (bindingEndAt && latest.startedAt.slice(0, 10) > bindingEndAt) return false;
        return true;
      })
      .sort((a, b) => b.latest.startedAt.localeCompare(a.latest.startedAt));
  }, [records, keyword, accountKeyword, bindingStartAt, bindingEndAt]);

  useEffect(() => {
    const firstMultiAddGroup = rows.find((group) => group.addCount > 1);
    if (expandedDeviceId === null) {
      setExpandedDeviceId(firstMultiAddGroup?.deviceId || '');
      return;
    }
    if (expandedDeviceId && !rows.some((group) => group.deviceId === expandedDeviceId)) {
      setExpandedDeviceId(firstMultiAddGroup?.deviceId || '');
    }
  }, [rows, expandedDeviceId]);

  const handleOpenDevice = (record) => {
    onOpenDeviceDetail?.(record);
  };

  return (
    <div>
      <AnnotationArea id="recordFilters" annotation={annotation}>
        <div className="dm-filter-grid record">
          <label>
            <span>设备 ID</span>
            <input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="请输入设备 ID" />
          </label>
          <label>
            <span>App测试账号 / 用户 ID</span>
            <input value={accountKeyword} onChange={(event) => setAccountKeyword(event.target.value)} placeholder="请输入App测试账号或用户 ID" />
          </label>
          <label className="dm-field-wide">
            <span>添加时间</span>
            <div className="dm-date-range">
              <input type="date" value={bindingStartAt} onChange={(event) => setBindingStartAt(event.target.value)} />
              <span>至</span>
              <input type="date" value={bindingEndAt} onChange={(event) => setBindingEndAt(event.target.value)} />
            </div>
          </label>
        </div>
      </AnnotationArea>

      <AnnotationArea id="deviceLink" annotation={annotation}>
        <TableShell empty={rows.length === 0} emptyTitle="暂无设备测试记录">
          <table className="dm-table dm-record-latest-table">
            <thead>
              <tr>
                <th>设备 ID</th>
                <th>最近添加账号</th>
                <th>最近添加时间</th>
                <th>添加次数</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((group) => {
                const record = group.latest;
                const expanded = expandedDeviceId === group.deviceId;
                return (
                  <React.Fragment key={group.deviceId}>
                    <tr className={cls('dm-record-summary-row', expanded && 'expanded')}>
                      <td>
                        <div className="dm-device-summary">
                          {group.addCount > 1 ? (
                            <button
                              className="dm-row-toggle"
                              type="button"
                              aria-expanded={expanded}
                              aria-label={expanded ? `收起 ${group.deviceId} 的添加记录` : `展开 ${group.deviceId} 的添加记录`}
                              onClick={() => setExpandedDeviceId(expanded ? '' : group.deviceId)}
                            >
                              {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            </button>
                          ) : (
                            <span className="dm-row-toggle-placeholder" />
                          )}
                          <button className="dm-link-btn dm-mono" type="button" onClick={() => handleOpenDevice(record)}>
                            {group.deviceId}
                          </button>
                        </div>
                      </td>
                      <td>
                        <div className="dm-cell-stack">
                          <strong>{record.accountName}</strong>
                          <span className="dm-mono">{record.userId}</span>
                        </div>
                      </td>
                      <td className="dm-time">{record.startedAt}</td>
                      <td>
                        {group.addCount > 1 ? (
                          <button className="dm-count-link" type="button" onClick={() => setExpandedDeviceId(expanded ? '' : group.deviceId)}>
                            {group.addCount} 次
                          </button>
                        ) : (
                          <span className="dm-add-count-text">1 次</span>
                        )}
                      </td>
                      <td>
                        <button className="dm-link-btn" type="button" onClick={() => handleOpenDevice(record)}>查看设备详情</button>
                      </td>
                    </tr>
                    {expanded && (
                      <tr className="dm-history-row">
                        <td colSpan={5}>
                          <div className="dm-history-panel">
                            <div className="dm-history-title">添加记录（按添加时间倒序）</div>
                            <table className="dm-history-table">
                              <thead>
                                <tr>
                                  <th>添加序号</th>
                                  <th>App测试账号</th>
                                  <th>添加时间</th>
                                </tr>
                              </thead>
                              <tbody>
                                {group.records.map((historyRecord, index) => (
                                  <tr key={historyRecord.id}>
                                    <td>第 {group.records.length - index} 次添加</td>
                                    <td>
                                      <div className="dm-cell-stack">
                                        <strong>{historyRecord.accountName}</strong>
                                        <span className="dm-mono">{historyRecord.userId}</span>
                                      </div>
                                    </td>
                                    <td className="dm-time">{historyRecord.startedAt}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </TableShell>
      </AnnotationArea>
    </div>
  );
}

function getOperationLogTarget(log) {
  if (log.deviceSn) return `设备 SN：${log.deviceSn}`;
  if (log.accountName && log.userId) return `${log.accountName} / ${log.userId}`;
  if (log.accountName) return log.accountName;
  return log.dealerId || '-';
}

function getCalendarDays(month) {
  const [year, monthNumber] = month.split('-').map(Number);
  const firstWeekday = new Date(year, monthNumber - 1, 1).getDay();
  const totalDays = new Date(year, monthNumber, 0).getDate();
  return [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: totalDays }, (_, index) => index + 1),
  ];
}

function formatCalendarDate(month, day) {
  return `${month}-${String(day).padStart(2, '0')}`;
}

function formatCalendarMonth(month) {
  const [year, monthNumber] = month.split('-');
  return `${year}年${Number(monthNumber)}月`;
}

function OperationLogDatePicker({ availableDates, value, onChange }) {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(value.slice(0, 7));
  const pickerRef = useRef(null);
  const availableDateSet = useMemo(() => new Set(availableDates), [availableDates]);
  const availableMonths = useMemo(() => Array.from(new Set([
    value.slice(0, 7),
    ...availableDates.map((date) => date.slice(0, 7)),
  ])).sort(), [availableDates, value]);
  const currentMonthIndex = Math.max(availableMonths.indexOf(month), 0);
  const calendarDays = useMemo(() => getCalendarDays(month), [month]);

  useEffect(() => {
    setMonth(value.slice(0, 7));
  }, [value]);

  useEffect(() => {
    if (!open) return undefined;
    const closeOnOutsideClick = (event) => {
      if (!pickerRef.current?.contains(event.target)) setOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [open]);

  const selectDate = (date) => {
    onChange(date);
    setOpen(false);
  };

  return (
    <div className="dm-log-date-picker" ref={pickerRef}>
      <button
        className="dm-log-date-trigger"
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((visible) => !visible)}
      >
        <CalendarDays size={16} />
        <span>{value}</span>
        <ChevronDown size={15} />
      </button>
      {open && (
        <div className="dm-log-calendar" role="dialog" aria-label="选择操作日志日期">
          <div className="dm-log-calendar-head">
            <button
              type="button"
              aria-label="上一个有日志月份"
              disabled={currentMonthIndex === 0}
              onClick={() => setMonth(availableMonths[currentMonthIndex - 1])}
            >
              <ChevronLeft size={16} />
            </button>
            <strong>{formatCalendarMonth(month)}</strong>
            <button
              type="button"
              aria-label="下一个有日志月份"
              disabled={currentMonthIndex === availableMonths.length - 1}
              onClick={() => setMonth(availableMonths[currentMonthIndex + 1])}
            >
              <ChevronRight size={16} />
            </button>
          </div>
          <div className="dm-log-calendar-week" aria-hidden="true">
            {['日', '一', '二', '三', '四', '五', '六'].map((weekday) => <span key={weekday}>{weekday}</span>)}
          </div>
          <div className="dm-log-calendar-days">
            {calendarDays.map((day, index) => {
              if (!day) return <span className="empty" key={`empty-${index}`} />;
              const date = formatCalendarDate(month, day);
              const hasLogs = availableDateSet.has(date);
              return (
                <button
                  key={date}
                  className={cls(hasLogs && 'has-logs', value === date && 'selected')}
                  type="button"
                  aria-label={hasLogs ? `${date}，有操作日志` : `${date}，无操作日志`}
                  disabled={!hasLogs}
                  onClick={() => selectDate(date)}
                >
                  {day}
                </button>
              );
            })}
          </div>
          <div className="dm-log-calendar-legend">
            <span><i />有操作日志</span>
            <span className="disabled">无日志日期不可选</span>
          </div>
        </div>
      )}
    </div>
  );
}

function OperationLogTab({
  logs,
  showDealerColumn = true,
  emptyTitle = '暂无App测试操作日志',
  annotation,
}) {
  const [date, setDate] = useState(nowText().slice(0, 10));
  const availableDates = useMemo(() => Array.from(new Set(
    logs.map((log) => log.createdAt.slice(0, 10)),
  )).sort(), [logs]);

  const rows = useMemo(() => logs
    .filter((log) => log.createdAt.slice(0, 10) === date)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt)), [logs, date]);

  return (
    <div>
      <AnnotationArea id="operationLog" annotation={annotation}>
        <div className="dm-log-date-filter">
          <div className="dm-log-date-field">
            <span>操作日期</span>
            <OperationLogDatePicker availableDates={availableDates} value={date} onChange={setDate} />
          </div>
        </div>
        <TableShell empty={rows.length === 0} emptyTitle={emptyTitle}>
          <div className="dm-log-timeline">
            {rows.map((log, index) => {
              const isFailed = log.result === '失败';
              return (
                <article className={cls('dm-log-timeline-item', isFailed && 'danger')} key={log.id}>
                  <div className="dm-log-timeline-rail" aria-hidden="true">
                    <span className="dm-log-timeline-dot">
                      {isFailed ? <AlertTriangle size={14} /> : <CheckCircle2 size={14} />}
                    </span>
                    {index < rows.length - 1 && <span className="dm-log-timeline-line" />}
                  </div>
                  <div className="dm-log-timeline-card">
                    <div className="dm-log-timeline-head">
                      <div>
                        <strong>{log.actionType}</strong>
                        <span className="dm-time">{log.createdAt}</span>
                      </div>
                      <Tag tone={isFailed ? 'danger' : 'success'}>{log.result}</Tag>
                    </div>
                    <div className="dm-log-timeline-meta">
                      {showDealerColumn && <span>经销商：{log.dealerName || '-'}</span>}
                      <span>操作对象：{getOperationLogTarget(log)}</span>
                      <span>来源：{log.source || '-'}</span>
                      <span>创建人：{log.creator || log.operator || '-'}</span>
                      <span>操作人：{log.operator || '-'}</span>
                    </div>
                    {isFailed && log.failReason && <div className="dm-log-timeline-alert">失败原因：{log.failReason}</div>}
                    {log.remark && <p>{log.remark}</p>}
                  </div>
                </article>
              );
            })}
          </div>
        </TableShell>
      </AnnotationArea>
    </div>
  );
}

function TableShell({ children, empty, emptyTitle }) {
  if (empty) return <EmptyState title={emptyTitle} />;
  return <div className="dm-table-wrap">{children}</div>;
}

function BaseModal({ title, children, footer, onClose, width = 560, className }) {
  const modalRef = useRef(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const previousFocus = document.activeElement;
    const modal = modalRef.current;
    const getFocusableElements = () => Array.from(modal?.querySelectorAll(
      'button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])',
    ) || []);
    const preferredFocus = modal?.querySelector('input:not(:disabled):not([readonly]), select:not(:disabled), textarea:not(:disabled)');
    (preferredFocus || getFocusableElements()[0] || modal)?.focus();

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== 'Tab') return;
      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) {
        event.preventDefault();
        return;
      }
      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previousFocus?.focus?.();
    };
  }, []);

  return (
    <div className="dm-modal-mask" onClick={onClose}>
      <div
        className={cls('dm-modal', className)}
        ref={modalRef}
        style={{ width }}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="dm-modal-head">
          <h3>{title}</h3>
          <button type="button" onClick={onClose} aria-label="关闭"><X size={18} /></button>
        </div>
        <div className="dm-modal-body">{children}</div>
        <div className="dm-modal-foot">{footer}</div>
      </div>
    </div>
  );
}

function CredentialResultModal({ mode, dealer, account, password, onCopy, onClose, annotation }) {
  const title = mode === 'reset' ? '密码已重置' : '创建成功';
  const source = mode === 'reset' ? '重置成功弹窗' : '创建成功弹窗';

  return (
    <BaseModal
      title={title}
      width={620}
      className="dm-credential-modal"
      onClose={onClose}
      footer={(
        <button className="dm-btn" type="button" onClick={onClose}>关闭</button>
      )}
    >
      <div className="dm-credential-success">
        <CheckCircle2 size={28} />
        <div>
          <strong>{mode === 'reset' ? '新密码已生成' : 'App测试账号已创建'}</strong>
          <p>临时密码仅本次展示，关闭后不可再次查看。如遗失，请在账号列表中重置密码。</p>
        </div>
      </div>
      <div className="dm-modal-info-grid dm-credential-grid">
        <div><span>经销商</span><strong>{dealer.name}</strong></div>
        <div><span>账号名称</span><strong>{account.accountName}</strong></div>
        <div><span>用户 ID</span><strong className="dm-mono">{account.userId}</strong></div>
        <div><span>客户端</span><strong>{account.clientName || DEFAULT_TEST_ACCOUNT_CLIENT.clientName}</strong></div>
      </div>
      <AnnotationArea id="credential" annotation={annotation}>
        <div className="dm-password-panel">
          <div className="dm-password-panel-head">
            <span>临时密码</span>
            <div className="dm-password-actions">
              <button
                className="dm-password-action primary"
                type="button"
                onClick={() => onCopy({ dealer, account, password, source })}
              >
                <Copy size={14} />复制密码
              </button>
            </div>
          </div>
          <strong className="dm-mono">{password}</strong>
        </div>
      </AnnotationArea>
    </BaseModal>
  );
}

function ResetPasswordModal({ account, dealer, onSubmit, onClose, annotation }) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const reasonRef = useRef(null);
  const effectiveStatus = getEffectiveAccountStatus(account);
  const statusCfg = ACCOUNT_STATUS_MAP[effectiveStatus] || ACCOUNT_STATUS_MAP.active;
  const submit = () => {
    const nextReason = reason.trim();
    if (!nextReason) {
      setError('请输入重置原因');
      requestAnimationFrame(() => reasonRef.current?.focus());
      return;
    }
    onSubmit(account, { reason: nextReason });
  };

  return (
    <BaseModal
      title="重置App测试账号密码"
      width={600}
      onClose={onClose}
      footer={(
        <>
          <button className="dm-btn" type="button" onClick={onClose}>取消</button>
          <button className="dm-btn dm-btn-primary" type="button" onClick={submit}><KeyRound size={15} />确认重置</button>
        </>
      )}
    >
      <div className="dm-confirm">
        <AlertTriangle size={24} />
        <p>确认重置该 App测试账号密码？重置后将生成新的临时密码，旧密码立即失效。</p>
      </div>
      <div className="dm-modal-info-grid">
        <div><span>经销商</span><strong>{dealer.name}</strong></div>
        <div><span>账号名称</span><strong>{account.accountName}</strong></div>
        <div><span>用户 ID</span><strong className="dm-mono">{account.userId}</strong></div>
        <div><span>权限状态</span><strong>{statusCfg.label}</strong></div>
      </div>
      {effectiveStatus !== 'active' && (
        <div className="dm-inline-alert">
          <AlertTriangle size={16} />
          重置密码不改变账号权限状态，已停用或已过期账号仍不能继续添加测试设备。
        </div>
      )}
      <AnnotationArea id="resetPassword" annotation={annotation}>
        <div className="dm-form-grid">
          <Field label="重置原因" error={error}>
            <textarea
              ref={reasonRef}
              name="resetReason"
              value={reason}
              aria-invalid={Boolean(error)}
              autoComplete="off"
              maxLength={200}
              onChange={(event) => {
                setReason(event.target.value);
                if (error) setError('');
              }}
              placeholder="请填写密码重置原因，便于后续审计追溯…"
            />
          </Field>
        </div>
      </AnnotationArea>
    </BaseModal>
  );
}

function CreateAccountModal({ dealers, accounts, defaultDealerId, onSubmit, onValidationError, onClose, annotation }) {
  const currentDealer = dealers.find((dealer) => dealer.id === defaultDealerId) || dealers.find((dealer) => dealer.status === 'normal');
  const formRef = useRef(null);
  const validStartAt = nowText().slice(0, 10);
  const maxValidEndAt = getValidityEndDateText(validStartAt, MAX_TEST_ACCOUNT_VALID_YEARS);
  const [form, setForm] = useState({
    dealerId: currentDealer?.id || '',
    accountName: '',
    mobile: '',
    region: '中国',
    clientName: DEFAULT_TEST_ACCOUNT_CLIENT.clientName,
    clientId: DEFAULT_TEST_ACCOUNT_CLIENT.clientId,
    validStartAt,
    validEndAt: getValidityEndDateText(validStartAt, DEFAULT_TEST_ACCOUNT_VALID_YEARS),
    applyReason: '',
  });
  const [errors, setErrors] = useState({});
  const clearErrors = (...keys) => {
    setErrors((prev) => {
      if (!keys.some((key) => prev[key])) return prev;
      const next = { ...prev };
      keys.forEach((key) => delete next[key]);
      return next;
    });
  };
  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    clearErrors(key);
  };
  const updateRegion = (region) => {
    setForm((prev) => ({
      ...prev,
      region,
    }));
    clearErrors('region');
  };
  const updateClientName = (clientName) => {
    const client = getClientConfig(clientName);
    setForm((prev) => ({
      ...prev,
      clientName: client.clientName,
      clientId: client.clientId,
    }));
    clearErrors('clientName', 'clientId');
  };
  const submit = () => {
    const nextErrors = {};
    const accountName = form.accountName.trim();
    const hasMobile = Boolean(form.mobile.trim());
    if (!form.dealerId) nextErrors.dealerId = '请选择经销商';
    if (!accountName) nextErrors.accountName = '请输入账号名称';
    else if (accounts.some((account) => account.dealerId === form.dealerId && account.accountName === accountName)) {
      nextErrors.accountName = '该经销商下已存在同名App测试账号';
    }
    if (hasMobile && !/^1\d{10}$/.test(form.mobile)) nextErrors.mobile = '请输入 11 位手机号';
    if (!form.region) nextErrors.region = '请选择账号所属大区';
    if (!form.clientName.trim()) nextErrors.clientName = '请输入客户端名称';
    if (!form.clientId.trim()) nextErrors.clientId = '请选择有效的客户端';
    if (!form.validEndAt) nextErrors.validEndAt = '请选择到期时间';
    else if (form.validEndAt < validStartAt) nextErrors.validEndAt = '到期时间不能早于今天';
    else if (form.validEndAt > maxValidEndAt) {
      nextErrors.validEndAt = `有效期最长不能超过 ${MAX_TEST_ACCOUNT_VALID_YEARS} 年`;
    }
    if (!form.applyReason.trim()) nextErrors.applyReason = '请输入创建原因';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) {
      onSubmit({ ...form, validStartAt, accountName });
      return;
    }
    const firstErrorKey = Object.keys(nextErrors)[0];
    requestAnimationFrame(() => formRef.current?.querySelector(`[name="${firstErrorKey}"]`)?.focus());
    onValidationError?.(nextErrors[firstErrorKey] || '请完善创建账号信息后再提交');
  };

  return (
    <BaseModal
      title="创建App测试账号"
      width={760}
      className="dm-create-account-modal"
      onClose={onClose}
      footer={(
        <>
          <button className="dm-btn" type="button" onClick={onClose}>取消</button>
          <button className="dm-btn dm-btn-primary" type="button" onClick={submit}>创建账号</button>
        </>
      )}
    >
      <AppTestAccountUsageNote className="dm-create-account-note" />
      <AnnotationArea id="createFields" annotation={annotation}>
        <div className="dm-form-grid dm-create-account-form" ref={formRef}>
          <div className="dm-form-section-title">基础信息</div>
          <Field label="经销商组织" error={errors.dealerId}>
            <input name="dealerId" value={currentDealer?.name || ''} readOnly autoComplete="off" />
          </Field>
          <Field label="账号名称" error={errors.accountName}>
            <input
              name="accountName"
              value={form.accountName}
              aria-invalid={Boolean(errors.accountName)}
              autoComplete="off"
              spellCheck={false}
              onChange={(event) => update('accountName', event.target.value)}
              placeholder="示例：华东经销商测试员 A…"
            />
          </Field>
          <Field label="手机号（可选）" error={errors.mobile}>
            <input
              name="mobile"
              type="tel"
              inputMode="numeric"
              value={form.mobile}
              aria-invalid={Boolean(errors.mobile)}
              autoComplete="off"
              onChange={(event) => update('mobile', event.target.value)}
              placeholder="请输入 11 位手机号…"
            />
          </Field>
          <div className="dm-form-section-title">使用范围</div>
          <Field label="账号所属大区" error={errors.region}>
            <select name="region" value={form.region} aria-invalid={Boolean(errors.region)} onChange={(event) => updateRegion(event.target.value)}>
              {TEST_ACCOUNT_REGIONS.map((region) => <option key={region} value={region}>{region}</option>)}
            </select>
          </Field>
          <Field label="客户端名称" error={errors.clientName}>
            <select name="clientName" value={form.clientName} aria-invalid={Boolean(errors.clientName)} onChange={(event) => updateClientName(event.target.value)}>
              {TEST_ACCOUNT_CLIENTS.map((client) => <option key={client.clientId} value={client.clientName}>{client.clientName}</option>)}
            </select>
          </Field>
          <Field label="客户端 ID" hint="由客户端名称自动带出，不可编辑" error={errors.clientId}>
            <input name="clientId" value={form.clientId} disabled aria-disabled="true" />
          </Field>
          <Field
            label="到期时间"
            labelFor="validEndAt"
            hint={`创建后立即生效，默认 ${DEFAULT_TEST_ACCOUNT_VALID_YEARS} 年，最长 ${MAX_TEST_ACCOUNT_VALID_YEARS} 年`}
            error={errors.validEndAt}
          >
            <div className="dm-validity-date-control">
              <input
                id="validEndAt"
                name="validEndAt"
                type="date"
                value={form.validEndAt}
                min={validStartAt}
                max={maxValidEndAt}
                aria-invalid={Boolean(errors.validEndAt)}
                autoComplete="off"
                onChange={(event) => update('validEndAt', event.target.value)}
              />
              <div className="dm-validity-presets" role="group" aria-label="到期时间快捷选项">
                {TEST_ACCOUNT_VALIDITY_PRESETS.map((years) => {
                  const presetDate = getValidityEndDateText(validStartAt, years);
                  return (
                    <button
                      key={years}
                      className={cls(form.validEndAt === presetDate && 'active')}
                      type="button"
                      aria-pressed={form.validEndAt === presetDate}
                      onClick={() => update('validEndAt', presetDate)}
                    >
                      {years}年
                    </button>
                  );
                })}
              </div>
            </div>
          </Field>
          <Field label="创建原因" error={errors.applyReason} className="dm-field-full">
            <textarea
              name="applyReason"
              value={form.applyReason}
              aria-invalid={Boolean(errors.applyReason)}
              autoComplete="off"
              maxLength={200}
              onChange={(event) => update('applyReason', event.target.value)}
              placeholder="请说明该账号用于哪些设备抽检场景…"
            />
          </Field>
        </div>
      </AnnotationArea>
    </BaseModal>
  );
}

function Field({ label, labelFor, hint, error, children, className }) {
  if (labelFor) {
    return (
      <div className={cls('dm-field', className)}>
        <label htmlFor={labelFor}>{label}</label>
        {children}
        {hint && <span className="dm-field-hint">{hint}</span>}
        {error && <small role="alert">{error}</small>}
      </div>
    );
  }

  return (
    <label className={cls('dm-field', className)}>
      <span>{label}</span>
      {children}
      {hint && <span className="dm-field-hint">{hint}</span>}
      {error && <small role="alert">{error}</small>}
    </label>
  );
}
