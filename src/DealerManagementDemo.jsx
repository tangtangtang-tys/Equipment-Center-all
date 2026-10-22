import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CheckCircle2,
  ClipboardList,
  Copy,
  Clock3,
  FileText,
  Globe2,
  History,
  Info,
  KeyRound,
  LayoutGrid,
  Plus,
  Power,
  RefreshCw,
  Search,
  Settings,
  UserPlus,
  UserRound,
  X,
} from 'lucide-react';
import {
  initialDealers,
  initialDealerOrgNodes,
  initialAutoWakeConfigs,
  initialDeviceDefaultConfigHistories,
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
const DEFAULT_DEALER_LIST_FILTERS = {
  keyword: '',
};

const AUTO_WAKE_VALUE_LABELS = {
  on: '开启',
  off: '关闭',
};

const AUTO_WAKE_ENTRY_LABELS = {
  visible: '显示',
  hidden: '隐藏',
};

const AUTO_WAKE_COUNTRY_OPTIONS = [
  { value: 'CN', label: '中国大陆' },
  { value: 'JP', label: '日本' },
  { value: 'US', label: '美国' },
  { value: 'DE', label: '德国' },
  { value: 'FR', label: '法国' },
  { value: 'GB', label: '英国' },
  { value: 'AU', label: '澳大利亚' },
];

const AUTO_WAKE_LANGUAGE_OPTIONS = [
  { value: 'zh-CN', label: '简体中文' },
  { value: 'zh-TW', label: '繁体中文' },
  { value: 'ja-JP', label: '日语' },
  { value: 'en-US', label: '英语' },
  { value: 'de-DE', label: '德语' },
  { value: 'fr-FR', label: '法语' },
];

function getAutoWakeValueLabel(value) {
  return AUTO_WAKE_VALUE_LABELS[value] || AUTO_WAKE_VALUE_LABELS.off;
}

function getAutoWakeEntryLabel(value) {
  return AUTO_WAKE_ENTRY_LABELS[value] || AUTO_WAKE_ENTRY_LABELS.visible;
}

function normalizeAutoWakeStrategy(strategy, config) {
  const source = strategy || {};
  return {
    defaultValue: source.defaultValue === 'on' ? 'on' : (source.defaultValue === 'off' ? 'off' : (config?.defaultValue === 'on' ? 'on' : 'off')),
    countryCodes: Array.isArray(source.countryCodes) ? source.countryCodes : [],
    languageCodes: Array.isArray(source.languageCodes) ? source.languageCodes : [],
    updatedAt: source.updatedAt || config?.updatedAt || '',
    updatedBy: source.updatedBy || config?.updatedBy || '',
  };
}

function getAutoWakeStrategy(config) {
  return normalizeAutoWakeStrategy(config?.autoWakeStrategy, config);
}

function getOptionLabels(values, options, allLabel) {
  if (!values?.length) return allLabel;
  const labels = values.map((value) => options.find((option) => option.value === value)?.label || value);
  return labels.join('、');
}

function getAutoWakeStrategyScopeLabel(strategy) {
  const normalized = normalizeAutoWakeStrategy(strategy);
  return `${getOptionLabels(normalized.countryCodes, AUTO_WAKE_COUNTRY_OPTIONS, '全部国家/地区')} / ${getOptionLabels(normalized.languageCodes, AUTO_WAKE_LANGUAGE_OPTIONS, '全部语言')}`;
}

function getAutoWakeStrategySummary(strategy) {
  const normalized = normalizeAutoWakeStrategy(strategy);
  return `${getOptionLabels(normalized.countryCodes, AUTO_WAKE_COUNTRY_OPTIONS, '全部国家/地区')}，${getOptionLabels(normalized.languageCodes, AUTO_WAKE_LANGUAGE_OPTIONS, '全部语言')}：${getAutoWakeValueLabel(normalized.defaultValue)}`;
}

function isSameAutoWakeStrategy(left, right) {
  const a = normalizeAutoWakeStrategy(left);
  const b = normalizeAutoWakeStrategy(right);
  return a.defaultValue === b.defaultValue
    && [...a.countryCodes].sort().join(',') === [...b.countryCodes].sort().join(',')
    && [...a.languageCodes].sort().join(',') === [...b.languageCodes].sort().join(',');
}

function normalizeAutoWakePlan(configOrPlan) {
  const source = configOrPlan || {};
  const baselineDefaultValue = source.baselineDefaultValue || source.defaultValue || 'off';
  return {
    entryVisible: source.entryVisible !== false,
    baselineDefaultValue: baselineDefaultValue === 'on' ? 'on' : 'off',
    strategy: normalizeAutoWakeStrategy(source.strategy || source.autoWakeStrategy, source),
  };
}

function getAutoWakePlan(config) {
  return normalizeAutoWakePlan(config);
}

function isSameAutoWakePlan(left, right) {
  const a = normalizeAutoWakePlan(left);
  const b = normalizeAutoWakePlan(right);
  return a.entryVisible === b.entryVisible
    && a.baselineDefaultValue === b.baselineDefaultValue
    && isSameAutoWakeStrategy(a.strategy, b.strategy);
}

function getAutoWakePlanChangeItems(before, after) {
  const beforePlan = normalizeAutoWakePlan(before);
  const afterPlan = normalizeAutoWakePlan(after);
  const changes = [];
  if (beforePlan.entryVisible !== afterPlan.entryVisible) {
    changes.push({
      key: 'entryVisible',
      label: 'APP 入口展示',
      before: getAutoWakeEntryLabel(beforePlan.entryVisible ? 'visible' : 'hidden'),
      after: getAutoWakeEntryLabel(afterPlan.entryVisible ? 'visible' : 'hidden'),
    });
  }
  if (beforePlan.baselineDefaultValue !== afterPlan.baselineDefaultValue) {
    changes.push({
      key: 'baselineDefaultValue',
      label: '设备默认状态 · 基础默认值',
      before: getAutoWakeValueLabel(beforePlan.baselineDefaultValue),
      after: getAutoWakeValueLabel(afterPlan.baselineDefaultValue),
    });
  }
  if (!isSameAutoWakeStrategy(beforePlan.strategy, afterPlan.strategy)) {
    changes.push({
      key: 'strategy',
      label: '设备默认状态 · 定制覆盖',
      before: getAutoWakeStrategySummary(beforePlan.strategy),
      after: getAutoWakeStrategySummary(afterPlan.strategy),
      beforeScope: getAutoWakeStrategyScopeLabel(beforePlan.strategy),
      afterScope: getAutoWakeStrategyScopeLabel(afterPlan.strategy),
    });
  }
  return changes;
}

function getAutoWakePlanChangeSummary(changes = []) {
  if (!changes.length) return '未发生字段变更';
  return changes.map((change) => `${change.label}：${change.before} → ${change.after}`).join('；');
}

function getAutoWakePlanSummary(plan) {
  const normalized = normalizeAutoWakePlan(plan);
  return `入口${getAutoWakeEntryLabel(normalized.entryVisible ? 'visible' : 'hidden')}；基础默认${getAutoWakeValueLabel(normalized.baselineDefaultValue)}；${getAutoWakeStrategySummary(normalized.strategy)}`;
}

function normalizeDeviceDefaultHistoryItem(item) {
  if (Array.isArray(item?.changes)) {
    return {
      ...item,
      parameterKey: item.parameterKey || 'autoWakePlan',
      parameterName: item.parameterName || '自动唤醒配置方案',
      changeSummary: item.changeSummary || getAutoWakePlanChangeSummary(item.changes),
    };
  }

  const isStrategy = item?.parameterKey === 'autoWakeStrategy' || item?.beforeScope || item?.afterScope;
  const change = {
    key: item?.parameterKey || 'baselineDefaultValue',
    label: isStrategy ? '设备默认状态 · 定制覆盖' : (item?.parameterKey === 'autoWakeEntryVisible' ? 'APP 入口展示' : '设备默认状态 · 基础默认值'),
    before: isStrategy && item?.beforeScope ? `${item.beforeScope}：${getAutoWakeValueLabel(item.before)}` : (item?.parameterKey === 'autoWakeEntryVisible' ? getAutoWakeEntryLabel(item.before) : getAutoWakeValueLabel(item?.before)),
    after: isStrategy && item?.afterScope ? `${item.afterScope}：${getAutoWakeValueLabel(item.after)}` : (item?.parameterKey === 'autoWakeEntryVisible' ? getAutoWakeEntryLabel(item.after) : getAutoWakeValueLabel(item?.after)),
    beforeScope: item?.beforeScope || '',
    afterScope: item?.afterScope || '',
  };
  return {
    ...item,
    parameterKey: 'autoWakePlan',
    parameterName: '自动唤醒配置方案',
    changes: [change],
    changeSummary: getAutoWakePlanChangeSummary([change]),
  };
}

function getAutoWakeConfig(configs, dealer) {
  const existingConfig = configs?.[dealer?.id];
  if (existingConfig) {
    return {
      ...existingConfig,
      entryVisible: existingConfig.entryVisible !== false,
      baselineDefaultValue: existingConfig.baselineDefaultValue || existingConfig.defaultValue || 'off',
      autoWakeStrategy: normalizeAutoWakeStrategy(existingConfig.autoWakeStrategy, existingConfig),
    };
  }
  return {
    status: 'configured',
    entryVisible: true,
    defaultValue: 'off',
    baselineDefaultValue: 'off',
    autoWakeStrategy: normalizeAutoWakeStrategy(null, { defaultValue: 'off' }),
    updatedAt: '',
    updatedBy: '',
    boundDeviceCount: dealer?.deviceTotalCount || 0,
    userConfiguredDeviceCount: 0,
    history: [],
  };
}

function hasEffectiveDeviceDefaultParameterValue(value) {
  return value !== undefined && value !== null && value !== '';
}

function getDeviceDefaultHistoryValueLabel(item, value) {
  if (value === '-') return '-';
  if (item.parameterKey === 'autoWakeEntryVisible') return getAutoWakeEntryLabel(value);
  if (item.parameterKey === 'autoWakeDefaultValue' || item.parameterKey === 'autoWakeStrategy') return getAutoWakeValueLabel(value);
  if (typeof value === 'boolean') return value ? '开启' : '关闭';
  return String(value);
}

function getDeviceDefaultHistoryScopeLabel(item) {
  if (item.parameterKey === 'autoWakeStrategy') {
    return `${item.beforeScope || '全部国家/地区 / 全部语言'} → ${item.afterScope || '全部国家/地区 / 全部语言'}`;
  }
  return '组织级默认配置';
}

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
      '左侧树只展示经销商名称和层级标签，不展示经销商 ID 或启用、停用状态。',
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
    id: 'deviceDefaultConfig',
    title: '设备默认参数配置',
    summary: '按当前经销商组织维护设备默认参数；自动唤醒作为一个功能卡片统一承载入口展示和首次绑定默认状态。',
    fields: [
      '自动唤醒：仅展示一张功能配置卡，不按配置维度拆成两张卡片。',
      '自动唤醒卡片只提供“配置方案”和“历史记录”两个操作入口，不在卡片内直接修改字段。',
      '配置方案：在右侧抽屉内一次性维护 APP 端入口展示、基础默认状态、国家 / 地区、语言和定制策略默认状态。',
      '国家 / 语言定制策略：分别支持多选，均不选择表示全部；每个组织只保留一条有效策略。',
      '最近修改信息：展示最近一次成功修改的时间与操作人。',
      '其他默认参数：有有效配置值时才展示对应参数卡片，无数据时不展示占位内容。',
      '历史记录：只查看当前经销商组织、当前自动唤醒卡片的一次保存记录；每条记录可查看具体字段变更。',
    ],
    flow: [
      '切换左侧经销商后，按当前选中组织加载对应的默认参数，组织之间独立配置。',
      '点击“配置方案”打开右侧抽屉；完成整套方案编辑后点击保存，先展示修改前后差异，再一次性确认。',
      '点击“历史记录”打开当前自动唤醒卡片的历史抽屉；每次整套方案保存只生成一条历史记录。',
      '一期确认后配置直接生效并写入设备默认参数配置历史，不写入平台操作日志；后续再接入审批流程。',
      '设备首次绑定时读取所属经销商组织当时有效的默认值进行初始化。',
      '设备解绑后再次绑定，按新绑定处理，重新读取当前组织的最新默认值。',
    ],
    rules: [
      '配置维度为单个经销商组织，不支持一级组织向二、三级组织批量覆盖或自动继承。',
      '旧系统仅提供组织历史配置，由研发按现有组织 ID 一次性手动补齐；页面不建设迁移任务，也不区分新旧组织。',
      '组织默认值修改仅影响未来新绑定设备，不覆盖当前已绑定设备，也不下发设备控制指令。',
      '用户绑定后手动修改的设备配置优先级最高，后续组织默认值变更不得覆盖。',
      '解绑后旧绑定配置不保留到新绑定，重新绑定以当前组织默认值为准。',
      '自动唤醒作为一个功能配置统一展示，入口展示与首次绑定默认状态在同一张卡片内独立配置。',
      '国家 / 地区和语言同一维度内为多选或关系；两个维度同时有选择时为且关系，均为空表示全部。',
      '当前有效策略只允许一条；新方案保存后替换旧方案，历史保留完整的方案变更差异。',
      '设备命中当前策略使用策略默认值，未命中使用组织基础默认值；策略只影响未来新绑定或解绑后重新绑定。',
      '仅有配置权限的账号可修改；无权账号只读展示，后端仍需校验组织范围与操作权限。',
      '历史记录按一次方案保存生成一条，至少包含操作时间、操作人、修改摘要、操作结果和详情中的字段前后值。',
    ],
    acceptance: [
      '切换任意经销商组织后，只展示该组织的默认参数；修改一家组织不得联动修改其上、下级或其他组织。',
      '自动唤醒只展示一张卡片，卡内不直接修改字段，且只提供“配置方案”和“历史记录”两个按钮。',
      '配置抽屉支持国家 / 地区和语言多选；清空任一维度后页面明确显示“全部”，不能生成多条规则。',
      '保存方案前必须明确展示整套方案修改前后差异、适用范围、命中 / 未命中处理方式和重新绑定规则。',
      '点击取消或关闭确认弹窗后，配置值不变、不生成历史与操作日志；确认且服务端返回成功后，页面才更新当前值及最近修改信息。',
      '整套方案确认成功后必须只生成一条自动唤醒历史，详情能展示每个发生变化字段，不得写入平台操作日志模块。',
      '组织默认值修改后，所有已绑定设备及用户已手动修改的设备配置必须保持不变，且不产生任何设备控制指令。',
      '修改成功后新绑定的设备应采用新默认值；设备解绑后重新绑定时也应采用当前最新默认值，不继承旧绑定的用户配置。',
      '修改入口展示策略不得改变设备默认状态；修改设备默认状态不得改变 APP 入口展示策略。',
      '无配置权限账号只能查看、不能修改；直接调用修改接口或跨组织修改时，服务端必须拒绝且不产生配置变更。',
      '“查看历史”必须聚合当前组织下所有设备默认参数的修改记录，按操作时间倒序展示，且字段与实际变更一致。',
      '研发手动补齐的旧系统组织历史配置必须能在对应现有组织下正确查看，页面不出现迁移任务或新旧组织区分入口。',
    ],
  },
  {
    id: 'detailTabs',
    title: '详情模块切换',
    summary: '先按大区确定共享数据范围，再在测试记录、账号和日志之间切换。',
    flow: [
      '大区顺序固定为：中国、亚洲、北美、欧洲。',
      '切换大区后，设备测试记录、APP 测试账号和操作日志同步刷新为对应大区数据。',
      'Tab 顺序固定为：设备测试记录、APP 测试账号、操作日志。',
      '切换 Tab 保留当前大区和左侧选中的经销商。',
      '创建账号成功后自动切换到 APP 测试账号 Tab，便于立即查看新增账号。',
    ],
  },
  {
    id: 'recordFilters',
    title: '设备测试记录查询',
    summary: '设备测试记录按设备 ID 汇总，主表展示最近一次记录和累计添加次数。',
    fields: [
      '查询范围：继承详情模块上方当前选中大区。',
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
      '查询范围：继承详情模块上方当前选中大区。',
      '账号名称 / 用户 ID：非必填；支持账号名称或用户 ID 匹配。',
    ],
    rules: [
      '创建成功后自动切换到新账号所属大区并清空旧关键词，确保新增记录立即可见。',
      '第一阶段不提供账号权限状态和有效期的查询、展示或维护能力。',
      '账号是否允许测试由服务端结合经销商组织状态、用户中心账号状态和内部测试权限策略判断。',
    ],
  },
  {
    id: 'createEntry',
    title: '创建账号入口',
    summary: '创建入口与查询区保持同一行，降低用户在当前经销商下新增账号的操作成本。',
    flow: [
      '点击创建账号后打开弹窗，默认带入当前选中的经销商组织。',
      '第一阶段不接入审批流，提交成功后直接进入当前经销商的账号列表。',
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
      '账号所属大区：必填；可选中国、亚洲、北美、欧洲，默认中国。',
      '客户端名称：必填；从客户端清单选择，并自动带出客户端 ID。',
      '客户端 ID：由客户端名称联动生成，以禁用态展示，不允许手动修改。',
      '创建原因：必填，用于说明设备抽检、样机验证或异常复测场景。',
    ],
    rules: [
      '第一阶段创建表单不配置账号权限状态和到期时间，前端创建请求也不提交这两个字段。',
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
      '重置密码只处理登录凭证，不改变经销商组织或用户中心账号的可用状态。',
      '重置成功后写入操作日志，记录操作人、账号、用户 ID、原因和时间。',
    ],
  },
  {
    id: 'operationLog',
    title: '操作日志范围',
    summary: '操作日志采用时间节点形式，记录后台可审计的人为操作。',
    fields: [
      '查询范围：继承详情模块上方当前选中大区。',
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

function currentDateTimeText() {
  const date = new Date();
  const pad = (value) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
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
  return {
    testAccountCount: dealerAccounts.length,
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
        {renderList('验收标准', rule.acceptance)}
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
  const [autoWakeConfigs, setAutoWakeConfigs] = useState(initialAutoWakeConfigs);
  const [deviceDefaultConfigHistories, setDeviceDefaultConfigHistories] = useState(initialDeviceDefaultConfigHistories);
  const [selectedDealerId, setSelectedDealerId] = useState(initialDealers[0].id);
  const [activeTab, setActiveTab] = useState('设备测试记录');
  const [activeRegion, setActiveRegion] = useState(() => getDefaultTestAccountRegion(
    initialTestAccounts.filter((account) => account.dealerId === initialDealers[0].id),
  ));
  const [recordKeyword, setRecordKeyword] = useState('');
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);
  const [annotationEnabled, setAnnotationEnabled] = useState(true);
  const [activeAnnotationId, setActiveAnnotationId] = useState('');
  const canEditAutoWake = new URLSearchParams(window.location.search).get('readOnly') !== '1';

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
        region: payload.region || accounts.find((account) => account.id === payload.accountId)?.region || TEST_ACCOUNT_REGIONS[0],
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
    const dealerAccounts = accounts.filter((account) => account.dealerId === dealerId);
    setActiveRegion(options.region || getDefaultTestAccountRegion(dealerAccounts));
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
    const account = {
      id: createId('TA'),
      dealerId: dealer.id,
      userId: formData.userId || `U${Date.now().toString().slice(-6)}`,
      accountName,
      accountSource: '设备中心创建',
      region: formData.region,
      clientName: client.clientName,
      clientId: client.clientId,
      applyReason: formData.applyReason,
      createdAt: nowText(),
    };
    const temporaryPassword = createTemporaryPassword();
    setAccounts((prev) => [account, ...prev]);
    appendLog({
      dealerId: dealer.id,
      accountId: account.id,
      region: account.region,
      userId: account.userId,
      accountName: account.accountName,
      actionType: '创建App测试账号',
      creator: '汤彦珊',
      remark: `大区：${account.region}；客户端：${account.clientName} / ${account.clientId}；临时密码仅本次展示`,
    });
    setSelectedDealerId(dealer.id);
    setActiveRegion(account.region);
    setActiveTab('APP测试账号');
    setModal({
      type: 'credential',
      mode: 'create',
      dealer,
      account,
      password: temporaryPassword,
    });
    showToast('创建成功，已加入App测试账号列表');
  };

  const handleResetPassword = (account, formData) => {
    const dealer = dealers.find((item) => item.id === account.dealerId) || selectedDealer;
    const temporaryPassword = createTemporaryPassword();
    appendLog({
      dealerId: dealer.id,
      accountId: account.id,
      region: account.region,
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

  const handleOpenAutoWakePlan = (dealerId) => {
    const dealer = dealers.find((item) => item.id === dealerId) || selectedDealer;
    if (!dealer || !canEditAutoWake) return;
    setModal({
      type: 'autoWakePlan',
      dealerId,
      dealer,
      currentConfig: getAutoWakeConfig(autoWakeConfigs, dealer),
    });
  };

  const handleRequestAutoWakePlanSave = ({ dealerId, plan }) => {
    const dealer = dealers.find((item) => item.id === dealerId) || selectedDealer;
    const currentConfig = getAutoWakeConfig(autoWakeConfigs, dealer);
    const nextPlan = normalizeAutoWakePlan(plan);
    if (!dealer || !canEditAutoWake || isSameAutoWakePlan(getAutoWakePlan(currentConfig), nextPlan)) return;
    setModal({
      type: 'autoWakePlanConfirm',
      dealerId,
      dealer,
      currentConfig,
      nextPlan,
    });
  };

  const handleOpenAutoWakeHistory = (dealerId) => {
    setModal({ type: 'autoWakeHistory', dealerId });
  };

  const handleConfirmAutoWakePlanSave = () => {
    const dealer = modal?.dealer || dealers.find((item) => item.id === modal?.dealerId) || selectedDealer;
    const currentConfig = modal?.currentConfig || getAutoWakeConfig(autoWakeConfigs, dealer);
    const nextPlan = normalizeAutoWakePlan(modal?.nextPlan);
    const changes = getAutoWakePlanChangeItems(getAutoWakePlan(currentConfig), nextPlan);
    if (!dealer || !changes.length) {
      setModal(null);
      showToast('自动唤醒配置更新失败，请稍后重试', 'error');
      return;
    }

    const updatedAt = currentDateTimeText();
    const updatedBy = '汤彦珊';
    const historyItem = {
      id: createId('AW'),
      parameterKey: 'autoWakePlan',
      parameterName: '自动唤醒配置方案',
      time: updatedAt,
      operator: updatedBy,
      changes,
      changeSummary: getAutoWakePlanChangeSummary(changes),
      result: '成功',
      remark: '整套方案保存；仅影响未来新绑定或解绑后重新绑定的设备',
    };
    const nextConfig = {
      ...currentConfig,
      status: 'configured',
      entryVisible: nextPlan.entryVisible,
      defaultValue: nextPlan.baselineDefaultValue,
      baselineDefaultValue: nextPlan.baselineDefaultValue,
      autoWakeStrategy: { ...nextPlan.strategy, updatedAt, updatedBy },
      updatedAt,
      updatedBy,
      history: [historyItem, ...(currentConfig.history || [])],
    };
    setAutoWakeConfigs((prev) => ({ ...prev, [dealer.id]: nextConfig }));
    setDeviceDefaultConfigHistories((prev) => ({
      ...prev,
      [dealer.id]: [historyItem, ...(prev[dealer.id] || [])],
    }));
    setModal(null);
    showToast('自动唤醒配置方案已保存，当前方案已替换');
  };

  return (
    <section className="dm-page">
      <DealerWorkbenchView
        dealers={dealers}
        orgNodes={initialDealerOrgNodes}
        accounts={accounts}
        records={records}
        logs={logs}
        autoWakeConfigs={autoWakeConfigs}
        selectedDealerId={selectedDealerId}
        onSelectDealer={handleSelectDealer}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeRegion={activeRegion}
        setActiveRegion={setActiveRegion}
        recordKeyword={recordKeyword}
        setRecordKeyword={setRecordKeyword}
        onOpenCreate={(dealerId) => setModal({ type: 'create', dealerId })}
        onRefresh={handleRefresh}
        onOpenUserDetail={handleOpenUserCenterDetail}
        onOpenDeviceDetail={handleOpenDeviceCenterDetail}
        onResetPassword={(account) => setModal({ type: 'resetPassword', account })}
        onOpenAutoWakePlan={handleOpenAutoWakePlan}
        onOpenAutoWakeHistory={handleOpenAutoWakeHistory}
        canEditAutoWake={canEditAutoWake}
        annotation={annotation}
      />

      {modal?.type === 'create' && (
        <CreateAccountModal
          dealers={dealers}
          accounts={accounts}
          defaultDealerId={modal.dealerId || selectedDealer.id}
          defaultRegion={modal.region || activeRegion}
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
      {modal?.type === 'autoWakePlan' && (
        <AutoWakePlanDrawer
          dealer={modal.dealer}
          config={modal.currentConfig}
          onSave={(plan) => handleRequestAutoWakePlanSave({ dealerId: modal.dealerId, plan })}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.type === 'autoWakePlanConfirm' && (
        <AutoWakeConfirmModal
          dealer={modal.dealer}
          config={modal.currentConfig}
          nextPlan={modal.nextPlan}
          onConfirm={handleConfirmAutoWakePlanSave}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.type === 'autoWakeHistory' && modal.dealerId && (
        <DeviceDefaultConfigHistoryDrawer
          dealer={dealers.find((item) => item.id === modal.dealerId) || selectedDealer}
          config={autoWakeConfigs[modal.dealerId]}
          history={(deviceDefaultConfigHistories[modal.dealerId] || []).filter((item) => {
            const normalized = normalizeDeviceDefaultHistoryItem(item);
            return normalized.parameterKey === 'autoWakePlan';
          })}
          onOpenDetail={(item) => setModal({ type: 'autoWakeHistoryDetail', dealerId: modal.dealerId, item: normalizeDeviceDefaultHistoryItem(item) })}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.type === 'autoWakeHistoryDetail' && modal.item && (
        <AutoWakeHistoryDetailModal
          dealer={dealers.find((item) => item.id === modal.dealerId) || selectedDealer}
          item={normalizeDeviceDefaultHistoryItem(modal.item)}
          onClose={() => setModal({ type: 'autoWakeHistory', dealerId: modal.dealerId })}
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
  autoWakeConfigs,
  selectedDealerId,
  onSelectDealer,
  activeTab,
  setActiveTab,
  activeRegion,
  setActiveRegion,
  recordKeyword,
  setRecordKeyword,
  onOpenCreate,
  onRefresh,
  onOpenUserDetail,
  onOpenDeviceDetail,
  onResetPassword,
  onOpenAutoWakePlan,
  onOpenAutoWakeHistory,
  canEditAutoWake,
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
              activeRegion={activeRegion}
              setActiveRegion={setActiveRegion}
              recordKeyword={recordKeyword}
              setRecordKeyword={setRecordKeyword}
              hideBack
              hideToolbar
              onOpenCreate={() => onOpenCreate(selectedDealer.id)}
              autoWakeConfig={getAutoWakeConfig(autoWakeConfigs, selectedDealer)}
              onOpenAutoWakePlan={() => onOpenAutoWakePlan(selectedDealer.id)}
              onOpenAutoWakeHistory={() => onOpenAutoWakeHistory(selectedDealer.id)}
              canEditAutoWake={canEditAutoWake}
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
  autoWakeConfig,
  activeTab,
  setActiveTab,
  activeRegion,
  setActiveRegion,
  recordKeyword,
  setRecordKeyword,
  onBack,
  onOpenCreate,
  onOpenAutoWakePlan,
  onOpenAutoWakeHistory,
  canEditAutoWake = true,
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
  const regionAccounts = dealerAccounts.filter((account) => account.region === activeRegion);
  const dealerRecords = records.filter((record) => record.dealerId === dealer.id && record.region === activeRegion);
  const dealerLogs = logs.filter((log) => log.dealerId === dealer.id && log.region === activeRegion);
  const handleDetailTabKeyDown = (event, index) => {
    const lastIndex = DETAIL_TABS.length - 1;
    let nextIndex = index;
    if (event.key === 'ArrowLeft') nextIndex = index === 0 ? lastIndex : index - 1;
    else if (event.key === 'ArrowRight') nextIndex = index === lastIndex ? 0 : index + 1;
    else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = lastIndex;
    else return;

    event.preventDefault();
    setActiveTab(DETAIL_TABS[nextIndex]);
    requestAnimationFrame(() => document.getElementById(`dm-detail-tab-${nextIndex}`)?.focus());
  };

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

      <AnnotationArea id="deviceDefaultConfig" annotation={annotation}>
        <DeviceDefaultConfigSection
          config={autoWakeConfig}
          parameters={autoWakeConfig?.additionalParameters || []}
          canEdit={canEditAutoWake}
          onOpenPlan={onOpenAutoWakePlan}
          onOpenHistory={onOpenAutoWakeHistory}
        />
      </AnnotationArea>

      <section className="dm-card dm-detail-tabs-card">
        <AnnotationArea id="detailTabs" annotation={annotation}>
          <div className="dm-detail-navigation">
            <div className="dm-tabs" role="tablist" aria-label="经销商详情分类">
              {DETAIL_TABS.map((tab, index) => (
                <button
                  id={`dm-detail-tab-${index}`}
                  key={tab}
                  className={cls(activeTab === tab && 'active')}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab}
                  tabIndex={activeTab === tab ? 0 : -1}
                  onClick={() => setActiveTab(tab)}
                  onKeyDown={(event) => handleDetailTabKeyDown(event, index)}
                >
                  {tab}
                </button>
              ))}
            </div>
            <RegionScopeSelector value={activeRegion} onChange={setActiveRegion} />
          </div>
        </AnnotationArea>
        {activeTab === 'APP测试账号' && (
          <TestAccountTab
            dealer={dealer}
            accounts={regionAccounts}
            activeRegion={activeRegion}
            totalAccountCount={dealerAccounts.length}
            onOpenCreate={onOpenCreate}
            onOpenUserDetail={onOpenUserDetail}
            onResetPassword={onResetPassword}
            annotation={annotation}
          />
        )}
        {activeTab === '设备测试记录' && (
          <TestRecordTab
            records={dealerRecords}
            activeRegion={activeRegion}
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
            emptyTitle={`${activeRegion}大区在所选日期暂无当前经销商操作日志`}
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

function DeviceDefaultConfigSection({ config, parameters = [], canEdit = true, onOpenPlan, onOpenHistory }) {
  const hasAutoWakeConfig = config?.status === 'configured'
    && hasEffectiveDeviceDefaultParameterValue(config?.baselineDefaultValue || config?.defaultValue);
  const visibleAdditionalParameters = parameters.filter((parameter) => (
    parameter
    && parameter.status !== 'unconfigured'
    && hasEffectiveDeviceDefaultParameterValue(parameter.defaultValue)
  ));

  return (
    <section className="dm-card dm-device-default-config-section" aria-labelledby="dm-device-default-config-title">
      <div className="dm-device-default-config-heading">
        <div className="dm-device-default-config-title-wrap">
          <i aria-hidden="true" />
          <h2 id="dm-device-default-config-title">设备默认参数配置</h2>
        </div>
      </div>
      <div className="dm-device-default-parameter-list">
        {hasAutoWakeConfig ? (
          <AutoWakeSummaryCard config={config} canEdit={canEdit} onOpenPlan={onOpenPlan} onOpenHistory={onOpenHistory} />
        ) : null}
        {visibleAdditionalParameters.map((parameter) => (
          <DeviceDefaultParameterCard key={parameter.parameterKey || parameter.key || parameter.parameterName} parameter={parameter} />
        ))}
      </div>
    </section>
  );
}

function DeviceDefaultParameterCard({ parameter }) {
  const value = parameter.displayValue ?? (
    typeof parameter.defaultValue === 'boolean'
      ? (parameter.defaultValue ? '开启' : '关闭')
      : String(parameter.defaultValue)
  );

  return (
    <section className="dm-card dm-device-default-parameter-card">
      <div className="dm-device-default-parameter-card-head">
        <div>
          <h3>{parameter.parameterName || parameter.name || '设备默认参数'}</h3>
          {parameter.description && <p>{parameter.description}</p>}
        </div>
      </div>
      <div className="dm-device-default-parameter-card-meta">
        <span>当前默认值</span>
        <strong>{value}</strong>
        {parameter.updatedAt && <span>最近修改：{parameter.updatedAt}</span>}
        {parameter.updatedBy && <span>{parameter.updatedBy}</span>}
      </div>
    </section>
  );
}

function AutoWakeSummaryCard({ config, canEdit = true, onOpenPlan, onOpenHistory }) {
  const plan = getAutoWakePlan(config);
  const [expanded, setExpanded] = useState(true);
  const strategyScope = `${getOptionLabels(plan.strategy.countryCodes, AUTO_WAKE_COUNTRY_OPTIONS, '全部国家/地区')}、${getOptionLabels(plan.strategy.languageCodes, AUTO_WAKE_LANGUAGE_OPTIONS, '全部语言')}`;
  const strategyCount = (plan.strategy.countryCodes?.length || 0) + (plan.strategy.languageCodes?.length || 0);

  return (
    <section className="dm-card dm-auto-wake-card">
      <div className="dm-auto-wake-card-title">
        <div className="dm-auto-wake-heading">
          <span className="dm-auto-wake-heading-icon" aria-hidden="true"><Settings size={28} strokeWidth={2.3} /></span>
          <div>
            <h2>自动唤醒</h2>
            <p>配置 APP 入口显示与新绑定设备的默认状态。</p>
          </div>
        </div>
        <div className="dm-auto-wake-card-actions">
          <button className="dm-btn dm-btn-primary" type="button" disabled={!canEdit} onClick={onOpenPlan}>
            <ClipboardList size={14} />配置方案
          </button>
          <button className="dm-btn dm-btn-outline" type="button" onClick={onOpenHistory}>
            <History size={14} />历史记录
          </button>
          <button
            className="dm-auto-wake-collapse"
            type="button"
            aria-label={expanded ? '收起自动唤醒配置' : '展开自动唤醒配置'}
            aria-expanded={expanded}
            onClick={() => setExpanded((value) => !value)}
          >
            {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
      </div>
      {expanded && (
        <>
          <div className="dm-auto-wake-plan-summary">
            <div className="dm-auto-wake-design-row">
              <span className="dm-auto-wake-row-icon" aria-hidden="true"><LayoutGrid size={22} strokeWidth={2.1} /></span>
              <strong className="dm-auto-wake-row-label">APP 入口显示</strong>
              <strong className={`dm-auto-wake-row-value ${plan.entryVisible ? 'value-on' : 'value-off'}`}>{getAutoWakeEntryLabel(plan.entryVisible ? 'visible' : 'hidden')}</strong>
            </div>
            <div className="dm-auto-wake-design-row">
              <span className="dm-auto-wake-row-icon" aria-hidden="true"><Power size={23} strokeWidth={2.1} /></span>
              <strong className="dm-auto-wake-row-label">设备默认状态</strong>
              <strong className={`dm-auto-wake-row-value ${plan.baselineDefaultValue === 'on' ? 'value-on' : 'value-off'}`}>{getAutoWakeValueLabel(plan.baselineDefaultValue)}</strong>
            </div>
            <div className="dm-auto-wake-design-row dm-auto-wake-design-row-scope">
              <span className="dm-auto-wake-row-icon" aria-hidden="true"><Globe2 size={23} strokeWidth={2.1} /></span>
              <strong className="dm-auto-wake-row-label">定制范围</strong>
              <strong className="dm-auto-wake-row-value dm-auto-wake-scope-value">{strategyScope}</strong>
              <span className="dm-auto-wake-scope-count">共 {strategyCount} 项</span>
            </div>
          </div>
          <div className="dm-auto-wake-last-change">
            <span className="dm-auto-wake-meta-item"><Clock3 size={18} aria-hidden="true" />最近修改时间</span>
            <strong className="dm-time">{config?.updatedAt || '-'}</strong>
            <span className="dm-auto-wake-meta-divider" aria-hidden="true" />
            <span className="dm-auto-wake-meta-item"><UserRound size={18} aria-hidden="true" />操作人</span>
            <strong>{config?.updatedBy || '-'}</strong>
          </div>
        </>
      )}
    </section>
  );
}

function AutoWakePlanDrawer({ dealer, config, onSave, onClose }) {
  const [draft, setDraft] = useState(() => getAutoWakePlan(config));
  const [openSelect, setOpenSelect] = useState(null);
  const [searchKeywords, setSearchKeywords] = useState({ countryCodes: '', languageCodes: '' });
  const selectRefs = useRef({});
  const current = getAutoWakePlan(config);
  const changed = !isSameAutoWakePlan(current, draft);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (openSelect && !selectRefs.current[openSelect]?.contains(event.target)) setOpenSelect(null);
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [openSelect]);

  const toggleOption = (key, value) => {
    setDraft((prev) => {
      const values = prev.strategy?.[key] || [];
      return {
        ...prev,
        strategy: {
          ...prev.strategy,
          [key]: values.includes(value) ? values.filter((item) => item !== value) : [...values, value],
        },
      };
    });
  };

  const renderOptionGroup = (label, key, options) => {
    const selectedValues = draft.strategy?.[key] || [];
    const keyword = searchKeywords[key] || '';
    const filteredOptions = options.filter((option) => option.label.toLowerCase().includes(keyword.trim().toLowerCase()) || option.value.toLowerCase().includes(keyword.trim().toLowerCase()));
    const isOpen = openSelect === key;
    return (
      <div className="dm-aw-form-item" ref={(node) => { selectRefs.current[key] = node; }}>
        <label className="dm-aw-form-label">{label}</label>
        <div className={cls('dm-aw-select', isOpen && 'is-open')}>
            <div className="dm-aw-select-field" onClick={() => setOpenSelect(isOpen ? null : key)}>
              <Search size={20} />
              <input
                type="search"
                value={keyword}
                className="dm-aw-select-input"
                placeholder={`请选择${label}（不选择表示全部）`}
                onFocus={() => setOpenSelect(key)}
                onChange={(event) => { setSearchKeywords((prev) => ({ ...prev, [key]: event.target.value })); setOpenSelect(key); }}
                onClick={(event) => event.stopPropagation()}
                aria-label={`搜索${label}`}
              />
              <ChevronDown size={20} className="dm-aw-select-chevron" />
            </div>
            {selectedValues.length > 0 && (
              <div className="dm-aw-select-tags">
                {selectedValues.map((value) => {
                  const option = options.find((item) => item.value === value);
                  return <button type="button" className="dm-aw-tag" key={value} onClick={(event) => { event.stopPropagation(); toggleOption(key, value); }}>{option?.label || value}<X size={16} /></button>;
                })}
              </div>
            )}
          {isOpen && (
            <div className="dm-aw-select-menu">
              {filteredOptions.map((option) => (
                <label className={cls('dm-aw-select-option', selectedValues.includes(option.value) && 'selected')} key={option.value}>
                  <input
                    type="checkbox"
                    className="dm-aw-select-checkbox"
                    checked={selectedValues.includes(option.value)}
                    onChange={() => toggleOption(key, option.value)}
                    aria-label={option.label}
                  />
                  <span className="dm-aw-select-option-checkbox" aria-hidden="true" />
                  <span>{option.label}</span>
                </label>
              ))}
              {filteredOptions.length === 0 && <div className="dm-aw-select-empty">暂无匹配项</div>}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="dm-drawer-mask dm-aw-drawer-mask" onClick={onClose}>
      <aside className="dm-drawer dm-aw-drawer" role="dialog" aria-modal="true" aria-label="编辑自动唤醒方案" onClick={(event) => event.stopPropagation()}>
        <div className="dm-aw-drawer-head">
          <div>
            <h3>编辑自动唤醒方案</h3>
            <span>{dealer.name}（{dealer.id}）</span>
          </div>
          <button type="button" onClick={onClose} aria-label="关闭"><X size={18} /></button>
        </div>
        <div className="dm-aw-drawer-body">
          <section className="dm-aw-section">
            <h4 className="dm-aw-section-title"><span className="dm-aw-section-icon" aria-hidden="true"><Settings size={22} /></span><span>基础配置</span></h4>
            <div className="dm-aw-form-item">
              <label className="dm-aw-form-label">APP 入口显示</label>
              <div className="dm-aw-segment">
                {[true, false].map((value) => (
                  <label className={cls('dm-aw-segment-btn', draft.entryVisible === value && 'selected')} key={String(value)}>
                    <input type="radio" name="autoWakeEntryVisible" checked={draft.entryVisible === value} onChange={() => setDraft((prev) => ({ ...prev, entryVisible: value }))} />
                    <span>{value ? '显示' : '隐藏'}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="dm-aw-form-item">
              <label className="dm-aw-form-label">设备默认状态</label>
              <div className="dm-aw-segment">
                {['on', 'off'].map((value) => (
                  <label className={cls('dm-aw-segment-btn', draft.baselineDefaultValue === value && 'selected')} key={value}>
                    <input type="radio" name="autoWakeBaselineDefaultValue" checked={draft.baselineDefaultValue === value} onChange={() => setDraft((prev) => ({ ...prev, baselineDefaultValue: value }))} />
                    <span>{getAutoWakeValueLabel(value)}</span>
                  </label>
                ))}
              </div>
            </div>
          </section>
          <section className="dm-aw-section">
            <h4 className="dm-aw-section-title"><span className="dm-aw-section-icon" aria-hidden="true"><Globe2 size={22} /></span><span>定制规则</span><span className="dm-aw-badge">可选</span></h4>
            {renderOptionGroup('国家/地区', 'countryCodes', AUTO_WAKE_COUNTRY_OPTIONS)}
            {renderOptionGroup('语言', 'languageCodes', AUTO_WAKE_LANGUAGE_OPTIONS)}
            <div className="dm-aw-tip"><Info size={13} /><span>国家或语言任一条件命中时，设备默认关闭；不选择国家和语言时，定制规则将覆盖全部范围。</span></div>
          </section>
        </div>
        <div className="dm-aw-drawer-foot">
          <button className="dm-btn" type="button" onClick={onClose}>取消</button>
          <button className="dm-btn dm-btn-primary" type="button" disabled={!changed} onClick={() => onSave(draft)}>保存方案</button>
        </div>
      </aside>
    </div>
  );
}

function AutoWakeConfirmModal({ dealer, config, nextPlan, onConfirm, onClose }) {
  const currentPlan = getAutoWakePlan(config);
  const normalizedNextPlan = normalizeAutoWakePlan(nextPlan);
  const changes = getAutoWakePlanChangeItems(currentPlan, normalizedNextPlan);
  return (
    <BaseModal
      title="确认保存自动唤醒配置方案？"
      width={700}
      className="dm-auto-wake-confirm-modal"
      onClose={onClose}
      footer={(
        <>
          <button className="dm-btn" type="button" onClick={onClose}>取消</button>
          <button className="dm-btn dm-btn-primary" type="button" onClick={onConfirm}>确认保存</button>
        </>
      )}
    >
      <div className="dm-auto-wake-confirm-org">{dealer.name}<span>{dealer.id}</span></div>
      <dl className="dm-auto-wake-confirm-grid">
        <div><dt>当前方案</dt><dd>{getAutoWakePlanSummary(currentPlan)}</dd></div>
        <div><dt>保存后方案</dt><dd>{getAutoWakePlanSummary(normalizedNextPlan)}</dd></div>
      </dl>
      <section className="dm-auto-wake-confirm-section dm-auto-wake-confirm-changes">
        <h4><ClipboardList size={15} />本次修改</h4>
        <div className="dm-auto-wake-change-table-wrap">
          <table className="dm-auto-wake-change-table">
            <thead><tr><th>字段</th><th>修改前</th><th>修改后</th></tr></thead>
            <tbody>{changes.map((change) => (
              <tr key={change.key}><td>{change.label}</td><td>{change.before}</td><td>{change.after}</td></tr>
            ))}</tbody>
          </table>
        </div>
      </section>
      <section className="dm-auto-wake-confirm-section dm-auto-wake-confirm-impact">
        <h4><Info size={15} />影响范围</h4>
        <dl>
          <div><dt>组织范围</dt><dd>仅「{dealer.name}」当前组织</dd></div>
          <div><dt>入口展示</dt><dd>主账号按方案展示，分享账号始终隐藏</dd></div>
          <div><dt>设备默认值</dt><dd>未来新绑定或解绑后重新绑定时读取；命中策略使用策略默认值，否则使用基础默认值</dd></div>
          <div><dt>保存方式</dt><dd>整套方案原子替换，当前只保留一条有效定制策略</dd></div>
        </dl>
      </section>
      <section className="dm-auto-wake-confirm-section dm-auto-wake-confirm-safe">
        <h4><CheckCircle2 size={15} />不会影响</h4>
        <ul>
          <li>当前已经绑定的设备及其现有自动唤醒状态</li>
          <li>用户已经手动修改过的设备配置</li>
          <li>不会向现有设备下发控制指令</li>
          <li>不会写入平台操作日志</li>
        </ul>
      </section>
      <section className="dm-auto-wake-rebind-rule">
        <strong>重新绑定规则</strong>
        <p>设备解绑后再次绑定时，重新读取当前有效方案；国家或语言任一条件命中则使用策略默认值，均未命中则使用基础默认值，不继承旧绑定的用户配置。</p>
      </section>
      <div className="dm-auto-wake-warning"><AlertTriangle size={15} /><span><strong>配置变更提示</strong>保存后仅影响未来绑定初始化；国家或语言任一条件命中即可使用定制值，两个条件都不选择表示全部范围。</span></div>
    </BaseModal>
  );
}

function getAutoWakeHistorySnapshot(item, config) {
  const currentPlan = getAutoWakePlan(config);
  if (item?.snapshot) {
    return normalizeAutoWakePlan(item.snapshot);
  }
  const changes = item?.changes || [];
  const entryChange = changes.find((change) => change.key === 'entryVisible' || change.label === 'APP 入口展示');
  const baselineChange = changes.find((change) => change.key === 'baselineDefaultValue' || change.label.includes('基础默认值'));
  const strategyChange = changes.find((change) => change.key === 'strategy' || change.label.includes('定制覆盖'));
  const valueToKey = (value, fallback) => value === '开启' || value === 'on' ? 'on' : value === '关闭' || value === 'off' ? 'off' : fallback;
  return normalizeAutoWakePlan({
    entryVisible: entryChange ? entryChange.after === '显示' || entryChange.after === 'visible' : currentPlan.entryVisible,
    baselineDefaultValue: valueToKey(baselineChange?.after, currentPlan.baselineDefaultValue),
    strategy: {
      ...currentPlan.strategy,
      defaultValue: valueToKey(strategyChange?.after, currentPlan.strategy.defaultValue),
    },
  });
}

function getHistoryScopeLabels(strategy, type) {
  const values = type === 'countryCodes' ? strategy.countryCodes : strategy.languageCodes;
  const options = type === 'countryCodes' ? AUTO_WAKE_COUNTRY_OPTIONS : AUTO_WAKE_LANGUAGE_OPTIONS;
  return (values?.length ? values : []).map((value) => options.find((option) => option.value === value)?.label || value);
}

function DeviceDefaultConfigHistoryDrawer({ dealer, config, history = [], onClose }) {
  const normalizedHistory = history.map(normalizeDeviceDefaultHistoryItem);
  const versions = normalizedHistory.map((item, index) => ({
    ...item,
    version: `V${normalizedHistory.length - index}`,
    isCurrent: index === 0,
  }));
  const [selectedId, setSelectedId] = useState(versions[0]?.id || '');
  const selectedVersion = versions.find((item) => item.id === selectedId) || versions[0];
  const selectedPlan = getAutoWakeHistorySnapshot(selectedVersion, config);
  const countryLabels = getHistoryScopeLabels(selectedPlan.strategy, 'countryCodes');
  const languageLabels = getHistoryScopeLabels(selectedPlan.strategy, 'languageCodes');

  return (
    <div className="dm-drawer-mask dm-history-design-mask" onClick={onClose}>
      <aside className="dm-drawer dm-auto-wake-history dm-history-design-drawer" role="dialog" aria-modal="true" aria-label="自动唤醒历史记录" onClick={(event) => event.stopPropagation()}>
        <div className="dm-history-design-head">
          <div><h3>自动唤醒 · 历史记录</h3><span>{dealer.name}（{dealer.id}）</span></div>
          <button type="button" onClick={onClose} aria-label="关闭"><X size={28} /></button>
        </div>
        {normalizedHistory.length === 0 ? (
          <div className="dm-history-design-empty"><History size={28} /><strong>暂无历史记录</strong><span>该组织的自动唤醒方案尚未产生修改记录。</span></div>
        ) : (
          <div className="dm-history-design-body">
            <aside className="dm-history-version-panel" aria-label="历史版本列表">
              <h4>历史版本（{versions.length}）</h4>
              <div className="dm-history-version-list">
                {versions.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={cls('dm-history-version-item', item.id === selectedVersion?.id && 'selected')}
                    onClick={() => setSelectedId(item.id)}
                  >
                    <span className={cls('dm-history-version-dot', item.id === selectedVersion?.id && 'selected')} aria-hidden="true" />
                    <span className="dm-history-version-copy">
                      <span className="dm-history-version-title"><strong>{item.version}</strong>{item.isCurrent && <em>最新</em>}</span>
                      <span>{item.time}</span>
                      <span>{item.operator}</span>
                    </span>
                    <ChevronRight size={22} aria-hidden="true" />
                  </button>
                ))}
              </div>
            </aside>
            <section className="dm-history-snapshot-panel" aria-label={`${selectedVersion?.version || ''} 配置快照`}>
              <header className="dm-history-snapshot-head">
                <div className="dm-history-snapshot-title"><h4>{selectedVersion?.version || '-'} · 配置快照</h4>{selectedVersion?.isCurrent && <span>当前生效版本</span>}</div>
                <div className="dm-history-snapshot-meta"><span><Clock3 size={20} />{selectedVersion?.time || '-'}</span><i /><span><UserRound size={20} />操作人：{selectedVersion?.operator || '-'}</span></div>
              </header>
              <section className="dm-history-snapshot-section dm-history-basic-section">
                <h5><i />基础配置</h5>
                <div className="dm-history-basic-card">
                  <div><strong>APP 入口显示</strong><b className="dm-history-value-on">{getAutoWakeEntryLabel(selectedPlan.entryVisible ? 'visible' : 'hidden')}</b><small>仅主账号可见</small></div>
                  <div><strong>设备默认状态</strong><b className="dm-history-value-on">{getAutoWakeValueLabel(selectedPlan.baselineDefaultValue)}</b><small>未命中定制范围时使用</small></div>
                </div>
              </section>
              <section className="dm-history-snapshot-section dm-history-rule-section">
                <h5><i />定制规则</h5>
                <div className="dm-history-rule-card">
                  <div><strong>国家 / 地区</strong><span>{countryLabels.length ? countryLabels.map((label) => <em key={label}>{label}</em>) : <small>全部国家 / 地区</small>}</span></div>
                  <div><strong>语言</strong><span>{languageLabels.length ? languageLabels.map((label) => <em key={label}>{label}</em>) : <small>全部语言</small>}</span></div>
                </div>
              </section>
            </section>
          </div>
        )}
        <div className="dm-history-design-foot"><button className="dm-btn" type="button" onClick={onClose}>关闭</button></div>
      </aside>
    </div>
  );
}

function AutoWakeHistoryDetailModal({ dealer, item, onClose }) {
  return (
    <BaseModal title="自动唤醒方案变更详情" width={680} className="dm-auto-wake-history-detail-modal" onClose={onClose} footer={<button className="dm-btn dm-btn-primary" type="button" onClick={onClose}>关闭</button>}>
      <div className="dm-auto-wake-history-detail-meta"><strong>{dealer.name}</strong><span>{item.time}</span><span>操作人：{item.operator}</span></div>
      <div className="dm-auto-wake-change-table-wrap">
        <table className="dm-auto-wake-change-table">
          <thead><tr><th>字段</th><th>修改前</th><th>修改后</th></tr></thead>
          <tbody>{(item.changes || []).map((change) => (
            <tr key={change.key}><td>{change.label}</td><td>{change.before}</td><td>{change.after}</td></tr>
          ))}</tbody>
        </table>
      </div>
      <div className="dm-auto-wake-history-detail-note">{item.remark || '本次配置仅影响未来新绑定或解绑后重新绑定的设备。'}</div>
    </BaseModal>
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

function RegionScopeSelector({ value, onChange }) {
  const activeIndex = TEST_ACCOUNT_REGIONS.indexOf(value);
  const handleKeyDown = (event, index) => {
    const lastIndex = TEST_ACCOUNT_REGIONS.length - 1;
    let nextIndex = index;
    if (event.key === 'ArrowLeft') nextIndex = index === 0 ? lastIndex : index - 1;
    else if (event.key === 'ArrowRight') nextIndex = index === lastIndex ? 0 : index + 1;
    else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = lastIndex;
    else return;

    event.preventDefault();
    onChange(TEST_ACCOUNT_REGIONS[nextIndex]);
    requestAnimationFrame(() => document.getElementById(`dm-region-option-${nextIndex}`)?.focus());
  };

  return (
    <div className="dm-region-scope">
      <span className="dm-region-scope-icon" title="大区筛选" aria-hidden="true">
        <Globe2 size={15} strokeWidth={1.8} />
      </span>
      <div className="dm-region-options" role="group" aria-label="大区筛选">
        {TEST_ACCOUNT_REGIONS.map((region, index) => (
          <button
            id={`dm-region-option-${index}`}
            key={region}
            className={cls(value === region && 'active')}
            type="button"
            aria-pressed={value === region}
            tabIndex={activeIndex === index ? 0 : -1}
            onClick={() => onChange(region)}
            onKeyDown={(event) => handleKeyDown(event, index)}
          >
            {region}
          </button>
        ))}
      </div>
    </div>
  );
}

function getDefaultTestAccountRegion(accounts) {
  const latestAccount = accounts.reduce((latest, account) => {
    if (!latest || account.createdAt > latest.createdAt) return account;
    return latest;
  }, null);
  return latestAccount?.region || TEST_ACCOUNT_REGIONS[0];
}

function TestAccountTab({
  dealer,
  accounts,
  activeRegion,
  totalAccountCount,
  onOpenCreate,
  onOpenUserDetail,
  onResetPassword,
  annotation,
}) {
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    setKeyword('');
  }, [dealer.id, totalAccountCount]);

  const rows = accounts
    .filter((account) => {
      if (keyword && !account.accountName.includes(keyword) && !account.userId.includes(keyword)) return false;
      return true;
    });

  return (
    <div>
      <div className="dm-account-query-row">
        <AnnotationArea id="accountSearch" annotation={annotation} className="dm-annotation-account-filters">
          <label className="dm-account-query-field">
            <span>账号名称 / 用户 ID</span>
            <input
              name="accountKeyword"
              value={keyword}
              autoComplete="off"
              spellCheck={false}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="请输入账号名称或用户 ID…"
            />
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
      <div>
        <TableShell
          empty={rows.length === 0}
          emptyTitle={keyword ? `${activeRegion}区域暂无匹配的App测试账号` : `${activeRegion}区域暂无App测试账号`}
        >
          <table className="dm-table">
            <thead>
              <tr>
                <th>账号名称</th>
                <th>用户 ID</th>
                <th>所属大区</th>
                <th>客户端</th>
                <th>创建时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((account) => (
                <tr key={account.id}>
                  <td>
                    <div className="dm-cell-stack">
                      <strong>{account.accountName}</strong>
                    </div>
                  </td>
                  <td className="dm-mono">{account.userId}</td>
                  <td><Tag tone={REGION_TAG_TONE[account.region] || 'muted'}>{account.region || '中国'}</Tag></td>
                  <td>
                    <div className="dm-cell-stack">
                      <strong>{account.clientName || DEFAULT_TEST_ACCOUNT_CLIENT.clientName}</strong>
                      <span className="dm-mono">{account.clientId || DEFAULT_TEST_ACCOUNT_CLIENT.clientId}</span>
                    </div>
                  </td>
                  <td className="dm-time">{account.createdAt}</td>
                  <td>
                    <div className="dm-row-actions">
                      <button className="dm-link-btn" type="button" onClick={() => onOpenUserDetail?.(account)}>查看</button>
                      <button
                        className="dm-link-btn"
                        type="button"
                        onClick={() => onResetPassword?.(account)}
                      >
                        重置密码
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableShell>
      </div>
      <AppTestAccountUsageNote className="dm-usage-note-list" />
    </div>
  );
}

function TestRecordTab({ records, activeRegion, keyword, setKeyword, onOpenDeviceDetail, annotation }) {
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
        <TableShell empty={rows.length === 0} emptyTitle={`${activeRegion}大区暂无设备测试记录`}>
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
      </div>
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

function CreateAccountModal({
  dealers,
  accounts,
  defaultDealerId,
  defaultRegion,
  onSubmit,
  onValidationError,
  onClose,
  annotation,
}) {
  const currentDealer = dealers.find((dealer) => dealer.id === defaultDealerId) || dealers.find((dealer) => dealer.status === 'normal');
  const formRef = useRef(null);
  const [form, setForm] = useState({
    dealerId: currentDealer?.id || '',
    accountName: '',
    region: defaultRegion || TEST_ACCOUNT_REGIONS[0],
    clientName: DEFAULT_TEST_ACCOUNT_CLIENT.clientName,
    clientId: DEFAULT_TEST_ACCOUNT_CLIENT.clientId,
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
    if (!form.dealerId) nextErrors.dealerId = '请选择经销商';
    if (!accountName) nextErrors.accountName = '请输入账号名称';
    else if (accounts.some((account) => account.dealerId === form.dealerId && account.accountName === accountName)) {
      nextErrors.accountName = '该经销商下已存在同名App测试账号';
    }
    if (!form.region) nextErrors.region = '请选择账号所属大区';
    if (!form.clientName.trim()) nextErrors.clientName = '请输入客户端名称';
    if (!form.clientId.trim()) nextErrors.clientId = '请选择有效的客户端';
    if (!form.applyReason.trim()) nextErrors.applyReason = '请输入创建原因';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) {
      onSubmit({ ...form, accountName });
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
