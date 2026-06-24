import React, { lazy, Suspense, useRef, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Ban,
  BellRing,
  Box,
  Camera,
  Crown,
  Car,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Cloud,
  Cpu,
  Database,
  Download,
  Eye,
  FileClock,
  Filter,
  Flame,
  Gauge,
  History,
  Layers,
  LocateFixed,
  LockKeyhole,
  MapPin,
  Menu,
  MonitorCog,
  Info,
  MoreHorizontal,
  Power,
  RadioTower,
  RefreshCw,
  Search,
  Send,
  Share2,
  Settings,
  ShieldCheck,
  Smartphone,
  SquareStack,
  UserRound,
  UserCheck,
  UsersRound,
  UserX,
  Volume2,
  WifiOff,
  X,
} from 'lucide-react';
import {
  alarmLogs,
  boundUsers,
  device,
  loginLogs,
  mapRanking,
  p2pTimeline,
  powerActivity,
  provinceMapValues,
  resetLogs,
  services,
  simCards,
} from './data/mockData';
import { cls, formatNumber } from './utils';

const ReactECharts = lazy(() => import('echarts-for-react'));

const MAIN_TABS = ['添加该设备的用户', '增值服务', '日志记录', '设备状态', '物联网卡'];
const ITERATION_TABS = ['基础信息', '设备状态', '用户管理', '增值服务', '日志记录', '物联网卡', '设备履历'];
const ITERATION_LOG_TABS = ['登录日志', '重置记录', '报警日志', '报警调试日志', '解绑转移日志'];

const deviceSamples = [
  {
    ...device,
    scenario: device.disabled ? '禁用休眠' : '设备详情',
    scenarioDesc: device.disabled ? '售后纠纷禁用，低功耗休眠，P2P 获取失败' : '当前设备详情',
    riskSummary: device.disabled ? '低功耗休眠、P2P 状态未知、最近告警仅图片。' : '当前在线，核心能力可用。',
    statusTone: device.disabled ? 'danger' : 'normal',
  },
];

const serviceIcons = [
  Activity,
  BellRing,
  Camera,
  Crown,
  Car,
  Cloud,
  SquareStack,
  Database,
  Gauge,
  Cpu,
  RadioTower,
  ShieldCheck,
  UserRound,
  UserCheck,
  UsersRound,
  UserX,
  Box,
  Car,
  LockKeyhole,
  LocateFixed,
  RefreshCw,
  Car,
  Flame,
  MonitorCog,
];

const disableReasons = [
  {
    label: '售后纠纷/仅退款',
    desc: '用户退款、未退货或售后交易争议',
    warning: '适用于退款、未退货等售后争议。请在说明中填写工单号或处理依据。',
  },
  {
    label: '被盗/遗失',
    desc: '用户反馈设备丢失或被盗',
    warning: '适用于用户反馈设备遗失或被盗。请在说明中填写反馈来源或核实结果。',
  },
  {
    label: '渠道欠款/项目回款纠纷',
    desc: '渠道客户欠款或项目回款争议',
    warning: '适用于经销商或项目回款争议。请在说明中填写设备清单、客户名称或业务依据。',
  },
  {
    label: '平台风控',
    desc: '异常绑定、违规使用或平台风险处理',
    warning: '适用于异常绑定、违规使用等风险处理。请在说明中填写风险来源或复核结论。',
  },
  {
    label: '其他',
    desc: '无法归入以上类型的特殊情况',
    warning: '仅在无法归入以上原因时使用。请在说明中写清业务背景和处理依据。',
  },
];

const restoreReasons = ['误禁用', '设备找回', '售后纠纷解除', '平台复核通过'];

const defaultDisableRecords = [
  {
    type: '恢复启用',
    before: '禁用',
    after: '正常',
    reason: '误禁用',
    note: '复核后确认设备不应被限制，已恢复用户正常使用。',
    source: '后台手动操作',
    operator: '汤彦珊',
    time: '2026-06-13 15:06:32',
  },
  {
    type: '禁用',
    before: '正常',
    after: '禁用',
    reason: '售后纠纷/仅退款',
    note: '客户申请仅退款，售后工单已确认需临时限制设备核心能力。',
    source: '后台手动操作',
    operator: '汤彦珊',
    time: '2026-06-13 14:20:11',
  },
];

const disableFlowSteps = [
  {
    title: '触发诉求',
    owner: '经销商 / 用户 / 客服 / 风控',
    desc: '售后纠纷、被盗遗失、渠道欠款或平台风险触发禁用诉求。',
  },
  {
    title: '提交材料',
    owner: '申请方 / 客服',
    desc: '提供设备 ID、订单、退款截图、报失证明、风控记录或合同依据。',
  },
  {
    title: '平台核验',
    owner: '客服 / 运营',
    desc: '核对设备归属、绑定用户、组织关系、增值服务和误禁风险。',
  },
  {
    title: '执行禁用',
    owner: '超管 / 风控',
    desc: '选择禁用原因，填写处理依据，将设备使用状态从正常改为禁用。',
  },
  {
    title: '能力冻结',
    owner: '设备服务',
    desc: '禁止新增绑定，限制实时预览、远程控制、配置下发和告警推送。',
  },
  {
    title: '分层展示',
    owner: 'App / 经销商 / 后台',
    desc: '不同端展示不同口径，终端用户不暴露内部敏感原因。',
  },
  {
    title: '恢复启用',
    owner: '超管 / 风控',
    desc: '纠纷解除、设备找回或复核通过后，记录原因并恢复设备能力。',
  },
];

const disableScenarioCards = [
  {
    title: '售后纠纷 / 仅退款',
    tone: 'refund',
    summary: '限制退款后继续使用设备，重点核验订单、退款记录和设备归属。',
    trigger: '经销商提交设备与订单材料',
    check: '核验订单、退款记录、设备归属和绑定用户',
    action: '单设备禁用，App 端仅提示设备不可用',
    restore: '纠纷解除、平台复核通过或误禁用后恢复',
  },
  {
    title: '被盗 / 遗失',
    tone: 'lost',
    summary: '保护设备与隐私安全，优先阻断新增绑定和核心实时能力。',
    trigger: '用户、经销商或客服反馈报失',
    check: '核验绑定账号、购买凭证、报警回执和最后在线信息',
    action: '限制核心能力并禁止新增绑定，保留历史记录用于取证',
    restore: '设备找回或权属确认后恢复启用',
  },
  {
    title: '渠道欠款 / 项目回款纠纷',
    tone: 'payment',
    summary: '避免把渠道回款纠纷直接转嫁给无过错终端用户。',
    trigger: '上级经销商或供应方提供欠款和设备清单',
    check: '区分未绑定、已绑定、归属不匹配和有关联服务设备',
    action: '第一阶段仅支持明确单设备处理，不做批量执行',
    restore: '欠款结清、双方和解或发现误禁后恢复',
  },
  {
    title: '平台风控',
    tone: 'risk',
    summary: '基于异常绑定、违规使用或平台风险证据进行受控处置。',
    trigger: '风控系统或人工排查发现异常设备',
    check: '核验风险证据、异常日志、绑定关系和误伤风险',
    action: '风控或超管执行禁用，客服同步对外口径',
    restore: '风险解除或平台复核通过后恢复',
  },
];

const phaseOneScope = [
  ['做', '设备详情页展示设备使用状态'],
  ['做', '超管 / 风控单设备禁用和恢复'],
  ['做', '禁用原因、处理依据和使用状态日志'],
  ['做', '禁用前展示核心影响，禁用后保留绑定关系与历史记录'],
  ['不做', '经销商线上申请流和复杂审批流'],
  ['不做', '批量禁用、临时禁用、批量恢复'],
  ['不做', '自动退款、延期、补偿或自动解绑用户'],
  ['不做', '自动关闭第三方续费'],
];

const channelMessages = [
  ['App 用户端', '只展示设备当前不可用及售后联系口径，不展示内部纠纷原因。'],
  ['经销商端', '展示设备状态和处理结果，原因可做业务简化，不暴露平台风控细节。'],
  ['客服后台', '查看具体原因、服务影响和操作记录，用于对外解释。'],
  ['超管 / 风控后台', '查看全部信息，可执行禁用、恢复和审计追溯。'],
];

const briefingStats = [
  ['本期定位', '高风险单设备操作'],
  ['核心动作', '禁用 / 恢复启用'],
  ['审计要求', '原因、说明、操作者、时间'],
];

const decisionHighlights = [
  ['冻结而非解绑', '禁用设备冻结核心使用能力，保留绑定关系、历史记录和审计线索。'],
  ['人工处置服务', '禁用不自动触发退款、延期、补偿、权益转移或第三方续费关闭。'],
  ['分层展示口径', '终端用户不暴露内部纠纷原因，客服和风控后台保留完整信息。'],
];

const roleBoundaryCards = [
  ['经销商 / 渠道客户', '可发起申请、查看相关设备状态；不直接执行禁用或恢复。'],
  ['终端用户', '可反馈被盗、误禁用或申诉；App 不开放直接禁用入口。'],
  ['平台客服 / 运营', '可查看记录、补充材料和对外解释；最终执行能力受权限控制。'],
  ['超管 / 风控', '可执行禁用、恢复、驳回和审计追溯，高风险操作二次确认。'],
];

const disableTypeRows = [
  ['正式禁用', '仅退款、确认被盗、明确渠道欠款单设备处理', '第一阶段支持'],
  ['临时禁用', '被盗初报、证据不完整但风险较高', '后续迭代'],
  ['批量禁用', '渠道欠款、批次风险设备、批量售后纠纷', '后续独立设计'],
];

const impactItems = [
  '保留已绑定用户关系，不自动解绑。',
  '禁止设备被新增绑定到其他账号。',
  '实时预览、远程控制、配置下发、报警推送等能力停止或受限。',
  '增值服务订单不自动取消、退款、延期或转移。',
  '历史云录像允许继续查看，禁用期间不允许新增购买或手动续费。',
  '恢复启用后，仍在有效期内的增值服务随设备恢复可用。',
];

const auditItems = [
  '操作类型、设备 ID、操作前状态、操作后状态。',
  '禁用原因、原因说明、发起人、审批人、操作人。',
  '操作时间、操作 IP、关联订单号 / 工单号 / 证明材料。',
  '来源批次号、增值服务快照、影响范围确认。',
];

const stateFlow = ['运行中', '禁用申请中', '已禁用', '恢复申请中', '运行中'];

const detailAnnotationItems = [
  {
    id: '01',
    title: '设备使用状态',
    logic: [
      '根据后台设备使用状态展示“正常”或“禁用”。',
      '正常状态显示“禁用”按钮；禁用状态显示“启用”按钮。',
      '“日志”打开设备使用状态日志，查看禁用和恢复记录。',
    ],
    fields: [
      '状态枚举：正常 / 禁用。',
      '按钮文案：禁用 / 启用 / 日志。',
      '状态说明：不在详情页常驻展示；禁用原因进入日志和禁用上下文。',
    ],
  },
  {
    id: '02',
    title: '绑定用户禁用提示',
    logic: [
      '仅设备处于禁用状态时展示，正常状态不展示。',
      '用于说明绑定用户当前受到的直接影响，不展示规则性假设说明。',
    ],
    fields: [
      '提示类型：状态提示。',
      '展示条件：设备使用状态 = 禁用。',
      '提示内容：核心能力不可用，绑定关系与历史记录保留。',
    ],
  },
  {
    id: '03',
    title: '增值服务影响提示',
    logic: [
      '仅设备处于禁用状态时展示，正常状态不展示。',
      '提示禁用期间服务处理边界，避免误解为自动退款、延期或转移。',
      '该提示属于服务影响说明，不触发任何订单状态变更。',
    ],
    fields: [
      '服务状态：未开通 / 有效中 / 已过期。',
      '历史云录像：允许继续查看。',
      '新增购买与手动续费：禁用期间不允许。',
    ],
  },
  {
    id: '04',
    title: '设备使用状态日志',
    logic: [
      '记录禁用和恢复启用的完整状态流转。',
      '按操作时间倒序展示，最新记录决定当前摘要。',
    ],
    fields: [
      '记录字段：操作类型、操作前状态、操作后状态、原因、操作人、操作时间、说明。',
      '原因字段动态展示：禁用原因 / 恢复原因。',
      '状态流转格式：正常 → 禁用，禁用 → 正常。',
    ],
  },
  {
    id: '05',
    title: '禁用 / 恢复弹窗',
    logic: [
      '禁用和恢复都是高风险操作，必须填写原因和说明后才能提交。',
      '禁用弹窗展示对象核对和禁用影响；恢复弹窗展示当前禁用上下文。',
    ],
    fields: [
      '禁用原因：下拉单选，必填。',
      '处理依据 / 备注：多行文本，必填。',
      '恢复原因：下拉单选，必填。',
      '恢复说明：多行文本，必填。',
    ],
  },
];

const iterationOperationLogs = [
  {
    time: '2026-06-13 15:06:32',
    type: '恢复启用',
    operator: '汤彦珊',
    target: '设备使用状态',
    result: '禁用 -> 正常',
    source: '客服后台',
  },
  {
    time: '2026-06-13 14:20:11',
    type: '禁用',
    operator: '汤彦珊',
    target: '设备使用状态',
    result: '正常 -> 禁用',
    source: '客服后台',
  },
  {
    time: '2026-06-11 15:16:48',
    type: '绑定用户',
    operator: '系统',
    target: boundUsers[0]?.userId || '暂无用户',
    result: '绑定成功',
    source: 'App',
  },
];

function getIterationLifecycleTracks(deviceInfo) {
  return [
    {
      title: '资产生命周期',
      desc: '关注设备作为公司资产或商品的流转，当前阶段只呈现已接入节点，未接入节点保留占位。',
      current: '销售后使用中',
      nodes: [
        ['生产', '完成', deviceInfo.productionTime],
        ['质检', '暂未接入', '--'],
        ['入库', '暂未接入', '--'],
        ['出库', '暂未接入', '--'],
        ['销售', deviceInfo.activated ? '推断' : '未发生', deviceInfo.activated ? '已激活前' : '--'],
        ['维修 / 翻新 / 报废', '暂未接入', '--'],
      ],
    },
    {
      title: '使用生命周期',
      desc: '关注设备是否真正被客户使用，是运维和客服判断问题归因的主线。',
      current: deviceInfo.activated ? `已绑定 · ${deviceInfo.p2p.lowPowerStatus}` : '未激活',
      nodes: [
        ['未激活', deviceInfo.activated ? '完成' : '当前', '--'],
        ['已激活', deviceInfo.activated ? '完成' : '未发生', deviceInfo.activationTime],
        ['已绑定', deviceInfo.activated ? '完成' : '未发生', deviceInfo.activated ? boundUsers[0]?.addedAt || '--' : '--'],
        ['运行中', deviceInfo.p2p.status === '在线' ? '当前' : '历史发生', deviceInfo.p2p.lastLogin],
        ['离线 / 休眠', deviceInfo.p2p.status === '在线' ? '未发生' : '当前', deviceInfo.p2p.lastWakeTime],
        ['停用 / 解绑 / 退役', deviceInfo.disabled ? '当前' : '未发生', '--'],
      ],
    },
    {
      title: '安全生命周期',
      desc: '关注联网、配置、告警、故障与远程排查线索，当前不承诺自动诊断结论。',
      current: deviceInfo.activated ? '有告警 · 需结合日志判断' : '未接入',
      nodes: [
        ['出厂固件', '已记录', deviceInfo.firmware],
        ['首次联网', deviceInfo.activated ? '已发生' : '未发生', deviceInfo.activationTime],
        ['配置下发', '暂未接入', '--'],
        ['告警', deviceInfo.activated ? '有记录' : '暂无', deviceInfo.activated ? alarmLogs[0]?.beijing || '--' : '--'],
        ['故障 / 诊断 / 修复', '暂未接入', '--'],
      ],
    },
  ];
}

const iterationLifecycleEvents = [
  ['2024-04-23 20:09:00', '生产', '设备生产完成，工厂信息已记录。'],
  ['2024-05-20 17:15:43', '激活', '设备首次激活并进入使用生命周期。'],
  ['2026-06-11 15:16:48', '绑定', `用户 ${boundUsers[0]?.userId || '--'} 添加该设备。`],
  ['2026-06-11 15:16:50', '登录', '设备开机登录，固件版本已记录。'],
  ['2026-06-11 17:52:41', '报警', '人体侦测触发，仅上传图片。'],
  ['2026-06-13 14:20:11', '禁用', '因售后纠纷临时限制核心能力。'],
  ['2026-06-13 15:06:32', '恢复', '复核后恢复设备使用状态。'],
];

function getIterationBasicGroups(deviceInfo) {
  const simCard = simCards[0];
  const isLowPower = deviceInfo.connectType.includes('低功耗');
  const networkType = deviceInfo.usesWifi ? 'Wi-Fi' : '4G';
  const deviceUsageStatus = deviceInfo.disabled ? '禁用' : '正常';
  const pushLimited = deviceInfo.disabled || deviceInfo.mobilePushPermission.includes('受限');

  return [
    {
      title: '身份档案',
      icon: ShieldCheck,
      items: [
        { label: '设备ID', value: deviceInfo.id },
        { label: '机型型号', value: deviceInfo.modelCode },
        { label: '产品型号', value: deviceInfo.model },
        { label: '所属品类', value: deviceInfo.productLine },
        { label: 'IMEI', value: deviceInfo.imei },
        { label: 'ICCID', value: simCard?.number || '暂无数据' },
        { label: '设备元数据', value: `${deviceInfo.series || deviceInfo.productLine} / ${deviceInfo.imageSource || '产品资料库'}` },
      ],
    },
    {
      title: '设备能力',
      icon: Cpu,
      items: [
        { label: '连接类型', value: deviceInfo.connectType },
        { label: '网络类型', value: networkType },
        { label: '电量类型', value: isLowPower ? '电池供电' : '市电供电' },
        { label: '所属架构', value: `${deviceInfo.productLine} 架构` },
        { label: '支持TF卡', value: deviceInfo.usesTfCard ? '支持' : '暂不支持', tone: deviceInfo.usesTfCard ? 'success' : 'muted' },
        { label: '当前固件版本号', value: deviceInfo.firmware },
        { label: '最新固件版本号', value: deviceInfo.latestVersion },
      ],
    },
    {
      title: '生产与归属',
      icon: LocateFixed,
      variant: 'ownership',
      items: [
        { label: '生产工厂', value: deviceInfo.factory, wide: true },
        { label: '生产时间', value: deviceInfo.productionTime },
        { label: '归属组织', value: deviceInfo.organization },
        { label: '服务大区', value: deviceInfo.region },
        { label: '所在地', value: deviceInfo.location },
      ],
    },
    {
      title: '设备使用状态',
      icon: Activity,
      variant: 'availability',
      items: [
        { label: '设备使用状态', value: deviceUsageStatus, tone: deviceInfo.disabled ? 'danger' : 'success', badge: true },
        { label: '移动推送受限', value: pushLimited ? '受限' : '未受限', tone: pushLimited ? 'warning' : 'success', badge: true },
      ],
    },
  ];
}
function getIterationStatusGroups(deviceInfo) {
  return [
    {
      title: '在线与连接',
      items: [
        ['P2P状态', deviceInfo.p2p.status],
        ['最后登录时间', deviceInfo.p2p.lastLogin],
        ['低功耗状态', deviceInfo.p2p.lowPowerStatus],
        ['最后一次心跳时间', deviceInfo.p2p.lastWakeTime],
      ],
    },
    {
      title: '能力状态',
      items: [
        ['实时预览', deviceInfo.disabled ? '受限' : '可用'],
        ['远程控制', deviceInfo.disabled ? '受限' : '可用'],
        ['配置下发', deviceInfo.disabled ? '受限' : '可用'],
        ['告警推送', deviceInfo.disabled ? '受限' : '可用'],
      ],
    },
    {
      title: '限制状态',
      items: [
        ['设备使用状态', deviceInfo.disabled ? '禁用' : '正常'],
        ['新增绑定', deviceInfo.disabled ? '禁止' : '允许'],
        ['服务购买', deviceInfo.disabled ? '暂不可用' : '允许'],
        ['历史记录查看', '保留'],
      ],
    },
  ];
}

function getIterationTopStatuses(deviceInfo) {
  const isBound = deviceInfo.activated && boundUsers.length > 0;
  const runTone = deviceInfo.p2p.lowPowerStatus === '在线' ? 'normal' : deviceInfo.p2p.lowPowerStatus === '未运行' ? 'muted' : 'warn';

  return [
    {
      key: 'availability',
      label: '使用限制',
      value: deviceInfo.disabled ? '已禁用' : '正常使用',
      tone: deviceInfo.disabled ? 'danger' : 'normal',
      desc: deviceInfo.disabled ? '实时预览/远控受限' : '核心能力可用',
    },
    {
      key: 'activation',
      label: '设备生命周期',
      value: deviceInfo.activated ? '已激活' : '未激活',
      tone: deviceInfo.activated ? 'normal' : 'muted',
      desc: deviceInfo.activated ? `激活 ${deviceInfo.activationTime}` : '暂无用户侧数据',
    },
    {
      key: 'binding',
      label: '用户绑定',
      value: isBound ? '已绑定' : '未绑定',
      tone: isBound ? 'normal' : 'muted',
      desc: isBound ? `${boundUsers.length} 个用户` : '暂无绑定关系',
    },
    {
      key: 'runtime',
      label: '联网运行',
      value: deviceInfo.p2p.lowPowerStatus,
      tone: runTone,
      desc: deviceInfo.p2p.status === '在线' ? 'P2P 在线' : `P2P ${deviceInfo.p2p.status}`,
    },
  ];
}

function getIterationOverviewCards(deviceInfo) {
  const activationTone = deviceInfo.activated ? 'normal' : 'muted';
  const deviceState = deviceInfo.p2p.lowPowerStatus || deviceInfo.p2p.status || '未知';
  const deviceStateTone = deviceState === '在线' ? 'normal' : deviceState === '休眠' ? 'warn' : deviceState === '未运行' ? 'muted' : 'danger';
  const mqttBlacklisted = Boolean(deviceInfo.mqttBlacklisted);
  const shadowBlacklisted = Boolean(deviceInfo.shadowBlacklisted);
  const blacklistTone = mqttBlacklisted || shadowBlacklisted ? 'danger' : 'normal';
  const blacklistValue = mqttBlacklisted && shadowBlacklisted ? '已拉黑' : mqttBlacklisted || shadowBlacklisted ? '部分拉黑' : '正常';
  const hasFirmwareUpgrade = Boolean(deviceInfo.latestVersion && deviceInfo.firmware && deviceInfo.latestVersion !== deviceInfo.firmware);
  const firmwareTone = hasFirmwareUpgrade ? 'warn' : 'normal';

  return [
    {
      key: 'activation',
      label: '设备激活',
      value: deviceInfo.activated ? '已激活' : '未激活',
      desc: deviceInfo.activated ? `激活时间：${deviceInfo.activationTime}` : '暂无激活时间',
      tone: activationTone,
      icon: CheckCircle2,
    },
    {
      key: 'device-state',
      label: '设备状态',
      value: deviceState,
      desc: `最后心跳：${deviceInfo.p2p.lastWakeTime || '暂无记录'}`,
      tone: deviceStateTone,
      icon: Activity,
    },
    {
      key: 'blacklist',
      label: '设备拉黑',
      value: blacklistValue,
      desc: `MQTT拉黑：${mqttBlacklisted ? '是' : '否'} · 影子拉黑：${shadowBlacklisted ? '是' : '否'}`,
      tone: blacklistTone,
      icon: Ban,
    },
    {
      key: 'firmware',
      label: '固件版本',
      value: deviceInfo.firmware,
      desc: hasFirmwareUpgrade
        ? `最新版本：${deviceInfo.latestVersion} · 建议升级`
        : '已是最新版本',
      extra: hasFirmwareUpgrade ? '可升级' : undefined,
      tone: firmwareTone,
      icon: Cpu,
    },
  ];
}

function getIterationQuickFacts(deviceInfo) {
  return [
    { icon: FileClock, label: '最近心跳', value: deviceInfo.p2p.lastWakeTime },
    { icon: History, label: '最近上线', value: deviceInfo.p2p.lastLogin },
    { icon: Gauge, label: '当前运行', value: deviceInfo.p2p.lowPowerStatus },
    { icon: MapPin, label: '位置', value: deviceInfo.location },
  ];
}

function getDeviceIdentitySummary(deviceInfo) {
  const powerType = deviceInfo.connectType.includes('低功耗') ? '低功耗' : '长电';
  const networkType = deviceInfo.connectType.includes('4G')
    ? '4G'
    : deviceInfo.connectType.includes('以太网')
      ? '有线网络'
      : deviceInfo.usesWifi
        ? 'Wi-Fi'
        : '4G';

  return {
    businessLine: deviceInfo.productLine || '暂无数据',
    powerType,
    networkType,
    iccid: simCards[0]?.number || '暂无数据',
  };
}

function getIterationHeroMetaItems(deviceInfo) {
  return [
    ['机型', deviceInfo.modelCode],
    ['产线', deviceInfo.productLine],
    ['当前固件', deviceInfo.firmware],
    ['服务大区', deviceInfo.region],
  ];
}

function getDeviceOnlineSnapshot(deviceInfo) {
  const invalidValues = new Set(['暂无数据', '获取失败', '--', '', null, undefined]);
  const hasLastLogin = !invalidValues.has(deviceInfo.p2p?.lastLogin);
  const hasLastWakeTime = !invalidValues.has(deviceInfo.p2p?.lastWakeTime);
  const isOnline = deviceInfo.p2p?.status === '在线';
  const isNotActivated = !deviceInfo.activated;
  const refreshText = isOnline ? '在线状态约 1 分钟刷新' : '页面刷新 / 切换设备时更新';

  if (isNotActivated) {
    return {
      tone: 'muted',
      title: '暂无在线记录',
      items: [
        ['最近在线', '未激活'],
        ['数据更新', refreshText],
      ],
    };
  }

  if (isOnline) {
    return {
      tone: 'online',
      title: '实时在线',
      items: [
        ['最近上线', hasLastLogin ? deviceInfo.p2p.lastLogin : '暂无记录'],
        ['状态更新', hasLastWakeTime ? deviceInfo.p2p.lastWakeTime : '暂无记录'],
        ['刷新频率', refreshText],
      ],
    };
  }

  return {
    tone: deviceInfo.p2p?.lowPowerStatus === '休眠' ? 'sleep' : 'offline',
    title: deviceInfo.p2p?.lowPowerStatus === '休眠' ? '最近唤醒' : '最近在线',
    items: [
      ['最近在线', hasLastLogin ? deviceInfo.p2p.lastLogin : hasLastWakeTime ? deviceInfo.p2p.lastWakeTime : '暂无记录'],
      ['最后心跳', hasLastWakeTime ? deviceInfo.p2p.lastWakeTime : '暂无记录'],
      ['数据更新', refreshText],
    ],
  };
}

const productLineVisuals = {
  IPC: {
    label: 'IPC 默认图',
    className: 'ipc',
  },
  BK: {
    label: 'BK 默认图',
    className: 'bk',
  },
  NVR: {
    label: 'NVR 默认图',
    className: 'nvr',
  },
  车载: {
    label: '车载默认图',
    className: 'vehicle',
  },
};

function getDeviceImage(deviceInfo) {
  const lineVisual = productLineVisuals[deviceInfo.productLine] || {
    label: '通用设备图',
    className: 'generic',
  };

  if (deviceInfo.imageUrl) {
    return {
      type: 'image',
      src: deviceInfo.imageUrl,
      label: deviceInfo.modelCode,
      source: deviceInfo.imageSource || '产品资料库',
      className: lineVisual.className,
    };
  }

  return {
    type: 'fallback',
    label: lineVisual.label,
    source: deviceInfo.imageSource || '产线默认图',
    className: lineVisual.className,
  };
}

function getIterationModuleMeta(tab, deviceInfo = device) {
  const activeServiceCount = 1;
  const totalLogCount = loginLogs.length + resetLogs.length + alarmLogs.length + p2pTimeline.length + iterationOperationLogs.length;
  const boundUserSummary = deviceInfo.activated && boundUsers.length
    ? `${boundUsers.length} 个用户 · ${boundUsers[0]?.role || '已绑定'}`
    : deviceInfo.activated
      ? '已激活 · 未绑定'
      : '未激活 · 无绑定';
  const simSummary = simCards.length ? `${simCards.length} 张卡 · ${simCards[0]?.type || '插卡记录'}` : '无插卡记录';
  const lifecycleSummary = deviceInfo.activated ? `已激活 · ${deviceInfo.p2p.lowPowerStatus}` : '未激活 · 未运行';

  const meta = {
    基础信息: {
      icon: Info,
      eyebrow: 'Identity',
      title: '基础信息',
      metric: `身份 / 归属 / ${deviceInfo.disabled ? '已禁用' : '正常使用'}`,
      summary: '核对设备身份、归属和使用限制字段。',
      points: [
        { label: '档案', value: '身份完整', tone: 'normal' },
        { label: '归属', value: deviceInfo.region, tone: 'neutral' },
        { label: '限制', value: deviceInfo.disabled ? '已禁用' : '正常使用', tone: deviceInfo.disabled ? 'danger' : 'normal' },
      ],
      tag: '主档案',
      status: '完整',
      statusTone: 'normal',
      tone: 'identity',
    },
    用户管理: {
      icon: UserRound,
      eyebrow: 'Binding',
      title: '用户管理',
      metric: boundUserSummary,
      summary: '查看绑定关系、主账号和用户侧影响。',
      points: [
        { label: '关系', value: deviceInfo.activated && boundUsers.length ? `${boundUsers.length} 个用户` : '暂无绑定', tone: deviceInfo.activated && boundUsers.length ? 'normal' : 'muted' },
        { label: '主账号', value: deviceInfo.activated && boundUsers.length ? boundUsers[0]?.userId || '--' : '未产生', tone: deviceInfo.activated && boundUsers.length ? 'neutral' : 'muted' },
        { label: '影响', value: deviceInfo.disabled ? '能力受限' : '关系正常', tone: deviceInfo.disabled ? 'warn' : 'normal' },
      ],
      tag: '关系',
      status: deviceInfo.activated && boundUsers.length ? '已绑定' : '未绑定',
      statusTone: deviceInfo.activated && boundUsers.length ? 'normal' : 'muted',
      tone: 'people',
    },
    设备状态: {
      icon: Activity,
      eyebrow: 'Runtime',
      title: '设备状态',
      metric: `${deviceInfo.p2p.status} · ${deviceInfo.p2p.lowPowerStatus}`,
      summary: '判断 P2P、低功耗、心跳和能力可用性。',
      points: [
        { label: 'P2P', value: deviceInfo.p2p.status, tone: deviceInfo.p2p.status === '在线' ? 'normal' : 'warn' },
        { label: '运行', value: deviceInfo.p2p.lowPowerStatus, tone: deviceInfo.p2p.lowPowerStatus === '在线' ? 'normal' : deviceInfo.p2p.lowPowerStatus === '未运行' ? 'muted' : 'warn' },
        { label: '心跳', value: deviceInfo.p2p.lastWakeTime, tone: deviceInfo.p2p.lastWakeTime === '暂无数据' ? 'muted' : 'neutral' },
      ],
      tag: '运行',
      status: deviceInfo.p2p.status === '在线' ? '在线' : '需关注',
      statusTone: deviceInfo.p2p.status === '在线' ? 'normal' : 'warn',
      tone: 'runtime',
    },
    增值服务: {
      icon: Cloud,
      eyebrow: 'Service',
      title: '增值服务',
      metric: `${activeServiceCount} 项有效 · ${deviceInfo.disabled ? '购买受限' : '服务正常'}`,
      summary: '查看已开通服务和禁用期间的处理边界。',
      points: [
        { label: '已开通', value: `${activeServiceCount} 项`, tone: 'normal' },
        { label: '未开通', value: `${services.length - activeServiceCount} 项`, tone: 'muted' },
        { label: '处理', value: deviceInfo.disabled ? '购买续费受限' : '服务正常', tone: deviceInfo.disabled ? 'warn' : 'normal' },
      ],
      tag: '服务',
      status: '部分有效',
      statusTone: 'normal',
      tone: 'service',
    },
    日志记录: {
      icon: History,
      eyebrow: 'Audit',
      title: '日志记录',
      metric: `${totalLogCount} 条线索 · 近 30 天`,
      summary: '用时间证据确认登录、告警和操作变化。',
      points: [
        { label: '线索', value: `${totalLogCount} 条`, tone: 'normal' },
        { label: '最近', value: iterationOperationLogs[0]?.time || '--', tone: 'neutral' },
        { label: '类型', value: `${ITERATION_LOG_TABS.length} 类日志`, tone: 'neutral' },
      ],
      tag: '证据',
      status: '可追溯',
      statusTone: 'normal',
      tone: 'audit',
    },
    物联网卡: {
      icon: RadioTower,
      eyebrow: 'SIM',
      title: '物联网卡',
      metric: simSummary,
      summary: '核对 4G 设备插卡记录和卡类型。',
      points: [
        { label: '插卡', value: simCards.length ? `${simCards.length} 张` : '无记录', tone: simCards.length ? 'normal' : 'muted' },
        { label: '类型', value: simCards[0]?.type || '--', tone: simCards.length ? 'neutral' : 'muted' },
        { label: '联网', value: deviceInfo.connectType.includes('4G') ? '4G 设备' : '非 4G', tone: deviceInfo.connectType.includes('4G') ? 'warn' : 'neutral' },
      ],
      tag: '网络',
      status: '需核验',
      statusTone: 'warn',
      tone: 'sim',
    },
    设备履历: {
      icon: Layers,
      eyebrow: 'Lifecycle',
      title: '设备履历',
      metric: lifecycleSummary,
      summary: '串联生产、激活、绑定、运行和禁用恢复记录。',
      points: [
        { label: '阶段', value: deviceInfo.activated ? '已激活' : '未激活', tone: deviceInfo.activated ? 'normal' : 'muted' },
        { label: '当前', value: deviceInfo.p2p.lowPowerStatus, tone: deviceInfo.p2p.lowPowerStatus === '在线' ? 'normal' : 'warn' },
        { label: '事件', value: deviceInfo.activated ? `${iterationLifecycleEvents.length} 条` : '2 条', tone: 'neutral' },
      ],
      tag: '链路',
      status: '已串联',
      statusTone: 'normal',
      tone: 'lifecycle',
    },
  };

  return meta[tab] || meta.基础信息;
}

function App() {
  const [view, setView] = useState('search');
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState(MAIN_TABS[0]);
  const [logTab, setLogTab] = useState('登录日志');
  const [drawer, setDrawer] = useState(null);
  const [modal, setModal] = useState(null);
  const [isDisabled, setIsDisabled] = useState(false);
  const [disableInfo, setDisableInfo] = useState(null);
  const [disableRecords, setDisableRecords] = useState(defaultDisableRecords);
  const [annotationMode, setAnnotationMode] = useState(true);
  const [iterationTab, setIterationTab] = useState(ITERATION_TABS[0]);
  const [iterationLogTab, setIterationLogTab] = useState(ITERATION_LOG_TABS[0]);
  const [selectedIterationDeviceId, setSelectedIterationDeviceId] = useState(deviceSamples[0]?.id || device.id);
  const currentIterationDevice = deviceSamples.find((item) => item.id === selectedIterationDeviceId) || deviceSamples[0] || device;

  const goDetail = () => {
    setView('detail');
    setActiveTab(MAIN_TABS[0]);
  };

  return (
    <div className="console-shell">
      <TopBar />
      <div className="console-body">
        <Sidebar view={view} onNavigate={setView} />
        <main className="workspace">
          {view === 'search' && <SearchHome query={query} setQuery={setQuery} onSubmit={goDetail} />}
          {view === 'detail' && (
            <DetailView
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              logTab={logTab}
              setLogTab={setLogTab}
              onBack={() => setView('search')}
              onDrawer={setDrawer}
              onModal={setModal}
              isDisabled={isDisabled}
              disableInfo={disableInfo}
              annotationMode={annotationMode}
              onToggleAnnotation={() => setAnnotationMode((enabled) => !enabled)}
            />
          )}
          {view === 'map' && <MapView />}
          {view === 'disableRequirement' && <DisableRequirementPage />}
          {view === 'deviceManagement' && (
            <DeviceManagementPage
              selectedDeviceId={selectedIterationDeviceId}
              onOpenDetail={(deviceId) => {
                setSelectedIterationDeviceId(deviceId);
                setView('detailIterationScope');
              }}
            />
          )}
          {view === 'detailIterationScope' && (
            <DetailIterationScopePage
              deviceInfo={currentIterationDevice}
              activeTab={iterationTab}
              setActiveTab={setIterationTab}
              logTab={iterationLogTab}
              setLogTab={setIterationLogTab}
            />
          )}
        </main>
      </div>

      {drawer && <SideDrawer type={drawer} records={disableRecords} onClose={() => setDrawer(null)} />}
      {modal && (
        <DataModal
          type={modal}
          isDisabled={isDisabled}
          disableInfo={disableInfo}
          annotationMode={annotationMode}
          onDisable={({ reason, note }) => {
            const nextInfo = {
              reason,
              note,
              operator: '汤彦珊',
              time: '2026-06-13 14:20:11',
            };
            setDisableInfo(nextInfo);
            setIsDisabled(true);
            setDisableRecords((records) => [
              {
                type: '禁用',
                before: '正常',
                after: '禁用',
                source: '后台手动操作',
                ...nextInfo,
              },
              ...records,
            ]);
            setModal(null);
          }}
          onRestore={({ reason, note }) => {
            const record = {
              type: '恢复启用',
              before: '禁用',
              after: '正常',
              reason,
              note,
              source: '后台手动操作',
              operator: '汤彦珊',
              time: '2026-06-13 15:06:32',
            };
            setDisableRecords((records) => [record, ...records]);
            setDisableInfo(null);
            setIsDisabled(false);
            setModal(null);
          }}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}

function TopBar() {
  return (
    <header className="topbar">
      <button className="icon-menu" aria-label="展开菜单">
        <Menu size={22} />
      </button>
      <div className="brand">
        <div className="brand-mark">
          <ShieldCheck size={22} />
        </div>
        <span>运维系统</span>
      </div>
      <div className="topbar-right">
        <span className="system-entry">
          <Layers size={15} />
          系统管理
        </span>
        <span className="divider" />
        <span className="avatar">汤</span>
        <span>汤彦珊</span>
      </div>
    </header>
  );
}

function Sidebar({ view, onNavigate }) {
  return (
    <aside className="sidebar">
      <div className="side-title">设备中心平台</div>
      <nav>
        <button
          className={cls('side-item', (view === 'search' || view === 'detail') && 'active')}
          onClick={() => onNavigate('search')}
        >
          <Search size={16} />
          设备查询
        </button>
        <button
          className={cls('side-item', view === 'deviceManagement' && 'active')}
          onClick={() => onNavigate('deviceManagement')}
        >
          <Database size={16} />
          设备管理
        </button>
        <button
          className={cls('side-item', view === 'detailIterationScope' && 'active')}
          onClick={() => onNavigate('detailIterationScope')}
        >
          <MonitorCog size={16} />
          【202606】详情模块迭代阶段范围
        </button>
        <button className={cls('side-item', view === 'map' && 'active')} onClick={() => onNavigate('map')}>
          <MapPin size={17} />
          设备地图
        </button>
        <button
          className={cls('side-item', view === 'disableRequirement' && 'active')}
          onClick={() => onNavigate('disableRequirement')}
        >
          <FileClock size={16} />
          禁用需求说明
        </button>
      </nav>
    </aside>
  );
}

function SearchHome({ query, setQuery, onSubmit }) {
  return (
    <section className="search-page">
      <div className="search-panel">
        <h1>设备查询</h1>
        <form
          className="device-search"
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit();
          }}
        >
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="请输入设备ID查询"
            aria-label="设备ID"
          />
          <button type="submit" aria-label="查询设备">
            <Search size={20} />
          </button>
        </form>
        <div className="search-hints">
          <span>支持设备ID精准查询</span>
          <span>示例：{device.id}</span>
          <span>Enter 快速查询</span>
        </div>
      </div>
    </section>
  );
}

function DeviceManagementPage({ selectedDeviceId, onOpenDetail }) {
  return (
    <section className="iteration-page device-management-page">
      <div className="iteration-topline">
        <div>
          <span className="iteration-kicker">设备管理</span>
          <h1>设备列表</h1>
        </div>
        <span className="iteration-stage">{deviceSamples.length} 台设备</span>
      </div>

      <section className="iteration-device-list" aria-label="设备列表">
        <div className="iteration-device-list-head">
          <div>
            <span>设备列表</span>
            <strong>按状态查阅不同详情</strong>
          </div>
          <small>点击查看进入新版详情页</small>
        </div>
        <div className="iteration-device-table" role="table" aria-label="设备列表">
          <div className="iteration-device-row iteration-device-row-head" role="row">
            <span>设备</span>
            <span>状态场景</span>
            <span>产线 / 机型</span>
            <span>运行态</span>
            <span>可用态</span>
            <span>操作</span>
          </div>
          {deviceSamples.map((item) => (
            <div
              key={item.id}
              role="row"
              className={cls('iteration-device-row', `tone-${item.statusTone}`, selectedDeviceId === item.id && 'active')}
            >
              <span className="device-row-main">
                <strong>{item.id}</strong>
                <small>{item.scenarioDesc}</small>
              </span>
              <span>{item.scenario}</span>
              <span>{item.productLine} / {item.modelCode}</span>
              <span>{item.p2p.lowPowerStatus}</span>
              <b>{item.disabled ? '禁用' : item.activated ? '正常' : '未激活'}</b>
              <button type="button" onClick={() => onOpenDetail(item.id)}>查看详情</button>
            </div>
          ))}
        </div>
      </section>
    </section>
  );
}

function DisableRequirementPage() {
  return (
    <section className="requirement-page">
      <div className="requirement-hero">
        <div>
          <span className="requirement-kicker">高风险能力设计</span>
          <h1>禁用需求说明</h1>
          <p>
            禁用设备不是解绑设备，而是冻结设备核心使用能力。第一阶段聚焦后台单设备禁用与恢复闭环，
            保留绑定关系、历史记录和审计线索，不自动处理退款、延期、补偿或解绑。
          </p>
          <div className="briefing-stat-row">
            {briefingStats.map(([label, value]) => (
              <div className="briefing-stat" key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
        </div>
        <div className="requirement-status-card">
          <span>在线需求简报</span>
          <strong>单设备正式禁用 / 恢复</strong>
          <div className="briefing-mini-flow" aria-hidden="true">
            <span>申请</span>
            <i />
            <span>核验</span>
            <i />
            <span>执行</span>
          </div>
        </div>
      </div>

      <section className="requirement-section">
        <div className="requirement-section-head">
          <span />
          <div>
            <h2>核心结论</h2>
            <p>把禁用从普通状态按钮升级为带边界、权限、证据和审计的高风险操作。</p>
          </div>
        </div>
        <div className="highlight-grid">
          {decisionHighlights.map(([title, desc], index) => (
            <article className="highlight-card" key={title}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <strong>{title}</strong>
              <p>{desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="requirement-section">
        <div className="requirement-section-head">
          <span />
          <div>
            <h2>上下游主链路</h2>
            <p>从业务诉求触发，到平台核验、设备能力冻结、各端展示，再到后续恢复启用。</p>
          </div>
        </div>
        <div className="flow-diagram">
          {disableFlowSteps.map((step, index) => (
            <article className="flow-step" key={step.title} style={{ '--step-index': index }}>
              <div className="flow-index">{String(index + 1).padStart(2, '0')}</div>
              <div>
                <strong>{step.title}</strong>
                <span>{step.owner}</span>
                <p>{step.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="requirement-section">
        <div className="requirement-section-head">
          <span />
          <div>
            <h2>用户与权限边界</h2>
            <p>禁用权不直接下放给普通经销商和终端用户，执行能力集中在高权限后台。</p>
          </div>
        </div>
        <div className="role-boundary-grid">
          {roleBoundaryCards.map(([role, desc]) => (
            <article className="role-boundary-card" key={role}>
              <UserRound size={18} />
              <strong>{role}</strong>
              <p>{desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="requirement-section">
        <div className="requirement-section-head">
          <span />
          <div>
            <h2>典型场景链路</h2>
            <p>四类禁用场景共用单设备禁用能力，但核验重点和对外口径不同。</p>
          </div>
        </div>
        <div className="scenario-grid">
          {disableScenarioCards.map((scenario) => (
            <article className={cls('scenario-card', scenario.tone)} key={scenario.title}>
              <ScenarioIllustration tone={scenario.tone} />
              <h3>{scenario.title}</h3>
              <p className="scenario-summary">{scenario.summary}</p>
              <dl>
                <div>
                  <dt>触发</dt>
                  <dd>{scenario.trigger}</dd>
                </div>
                <div>
                  <dt>核验</dt>
                  <dd>{scenario.check}</dd>
                </div>
                <div>
                  <dt>执行</dt>
                  <dd>{scenario.action}</dd>
                </div>
                <div>
                  <dt>恢复</dt>
                  <dd>{scenario.restore}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </section>

      <section className="requirement-section">
        <div className="requirement-section-head">
          <span />
          <div>
            <h2>禁用类型与阶段规划</h2>
            <p>第一阶段只做单设备正式禁用和恢复，临时禁用与批量禁用作为独立迭代。</p>
          </div>
        </div>
        <div className="type-table" role="table" aria-label="禁用类型建议">
          <div role="row">
            <span role="columnheader">禁用类型</span>
            <span role="columnheader">适用场景</span>
            <span role="columnheader">阶段建议</span>
          </div>
          {disableTypeRows.map(([type, scene, phase]) => (
            <div role="row" key={type}>
              <strong role="cell">{type}</strong>
              <span role="cell">{scene}</span>
              <b role="cell">{phase}</b>
            </div>
          ))}
        </div>
      </section>

      <section className="requirement-section">
        <div className="requirement-section-head">
          <span />
          <div>
            <h2>影响范围与增值服务处理</h2>
            <p>禁用动作只改变设备使用能力，不自动处理订单、退款、延期或补偿。</p>
          </div>
        </div>
        <div className="impact-briefing">
          <div className="impact-illustration" aria-hidden="true">
            <div className="device-tower">
              <span />
              <i />
            </div>
            <div className="impact-rings">
              <span>绑定</span>
              <span>实时</span>
              <span>服务</span>
              <span>审计</span>
            </div>
          </div>
          <ul>
            {impactItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="requirement-split">
        <div className="requirement-section compact">
          <div className="requirement-section-head">
            <span />
            <div>
              <h2>审计日志</h2>
              <p>每次禁用或恢复都必须留下可追溯证据。</p>
            </div>
          </div>
          <div className="audit-list">
            {auditItems.map((item, index) => (
              <div key={item}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <p>{item}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="requirement-section compact">
          <div className="requirement-section-head">
            <span />
            <div>
              <h2>状态流转</h2>
              <p>第一阶段可以先落地最小闭环，后续扩展申请中状态。</p>
            </div>
          </div>
          <div className="state-flow">
            {stateFlow.map((state, index) => (
              <React.Fragment key={`${state}-${index}`}>
                <span>{state}</span>
                {index < stateFlow.length - 1 && <i aria-hidden="true" />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      <section className="requirement-split">
        <div className="requirement-section compact">
          <div className="requirement-section-head">
            <span />
            <div>
              <h2>第一阶段边界</h2>
              <p>明确做什么和不做什么，避免禁用能力被扩展成复杂售后系统。</p>
            </div>
          </div>
          <div className="scope-list">
            {phaseOneScope.map(([type, content]) => (
              <div className={cls('scope-row', type === '做' ? 'include' : 'exclude')} key={`${type}-${content}`}>
                <b>{type}</b>
                <span>{content}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="requirement-section compact">
          <div className="requirement-section-head">
            <span />
            <div>
              <h2>各端展示口径</h2>
              <p>同一禁用状态，不同端展示不同粒度，避免敏感原因直接暴露。</p>
            </div>
          </div>
          <div className="channel-list">
            {channelMessages.map(([channel, message]) => (
              <article key={channel}>
                <strong>{channel}</strong>
                <p>{message}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

    </section>
  );
}

function ScenarioIllustration({ tone }) {
  const visual = {
    refund: (
      <>
        <rect x="24" y="40" width="58" height="70" rx="10" />
        <path d="M38 58h30M38 74h22M38 90h18" />
        <circle cx="112" cy="70" r="24" />
        <path d="M104 70h18M112 60v20" />
        <path d="M80 86c18 0 24 18 42 18" />
      </>
    ),
    lost: (
      <>
        <rect x="36" y="38" width="44" height="76" rx="12" />
        <path d="M48 56h20M48 90h20" />
        <path d="M104 54l22 22-22 22-22-22z" />
        <path d="M104 68v18M104 94v2" />
        <path d="M28 124c24-14 82-14 106 0" />
      </>
    ),
    payment: (
      <>
        <rect x="24" y="46" width="48" height="50" rx="8" />
        <rect x="92" y="46" width="48" height="50" rx="8" />
        <path d="M72 70h20" />
        <path d="M86 64l7 6-7 6" />
        <path d="M36 112h92" />
        <path d="M46 112v-10M118 112v-10" />
        <circle cx="82" cy="112" r="10" />
      </>
    ),
    risk: (
      <>
        <path d="M82 34l44 18v30c0 28-18 48-44 58-26-10-44-30-44-58V52z" />
        <path d="M82 58v36M82 106v3" />
        <path d="M54 82h56" />
        <circle cx="82" cy="82" r="30" />
      </>
    ),
  };

  return (
    <div className="scenario-illustration" aria-hidden="true">
      <svg viewBox="0 0 164 148" role="img">
        <g>{visual[tone]}</g>
      </svg>
    </div>
  );
}

function AnnotationDot({ id, markerKey = id, activeId, onToggle }) {
  const active = activeId === markerKey;
  const anchorRef = useRef(null);
  const [popoverStyle, setPopoverStyle] = useState({});

  const updatePopoverPosition = () => {
    const anchor = anchorRef.current;
    if (!anchor) return;

    const rect = anchor.getBoundingClientRect();
    const width = 320;
    const gap = 10;
    const viewportPadding = 12;
    const left = Math.min(
      Math.max(viewportPadding, rect.left),
      window.innerWidth - width - viewportPadding,
    );
    const preferTop = rect.bottom + 320 > window.innerHeight && rect.top > 320;
    const top = preferTop
      ? Math.max(viewportPadding, rect.top - gap)
      : Math.min(rect.bottom + gap, window.innerHeight - viewportPadding);

    setPopoverStyle({
      left,
      top,
      transform: preferTop ? 'translateY(-100%)' : 'none',
    });
  };

  const handleClick = () => {
    updatePopoverPosition();
    onToggle(markerKey);
  };

  return (
    <span className="annotation-anchor" onClick={(event) => event.stopPropagation()}>
      <button
        ref={anchorRef}
        className={cls('annotation-dot', active && 'active')}
        type="button"
        aria-label={`查看原型批注 ${id}`}
        aria-expanded={active}
        onClick={handleClick}
      >
        {id}
      </button>
      {active && <AnnotationPopover id={id} style={popoverStyle} />}
    </span>
  );
}

function AnnotationPopover({ id, style }) {
  const item = detailAnnotationItems.find((annotation) => annotation.id === id);

  if (!item) return null;

  return (
    <article className="annotation-popover" style={style} onClick={(event) => event.stopPropagation()}>
      <div className="annotation-popover-title">
        <span>{item.id}</span>
        <strong>{item.title}</strong>
      </div>
      <section>
        <b>交互逻辑</b>
        <ul>
          {item.logic.map((line) => <li key={line}>{line}</li>)}
        </ul>
      </section>
      <section>
        <b>字段格式</b>
        <ul>
          {item.fields.map((line) => <li key={line}>{line}</li>)}
        </ul>
      </section>
    </article>
  );
}

function DetailView({
  activeTab,
  setActiveTab,
  logTab,
  setLogTab,
  onBack,
  onDrawer,
  onModal,
  isDisabled,
  disableInfo,
  annotationMode,
  onToggleAnnotation,
}) {
  const [activeAnnotation, setActiveAnnotation] = useState(null);
  const handleToggleAnnotation = (id) => {
    setActiveAnnotation((current) => (current === id ? null : id));
  };
  const annotationProps = {
    activeId: activeAnnotation,
    onToggle: handleToggleAnnotation,
  };

  return (
    <section className={cls('detail-page', annotationMode && 'annotating')} onClick={() => setActiveAnnotation(null)}>
      <div className="detail-topline">
        <button className="backline" onClick={onBack}>
          <ChevronLeft size={16} />
          设备详情
        </button>
        <button
          className={cls('annotation-toggle', annotationMode && 'active')}
          onClick={(event) => {
            event.stopPropagation();
            setActiveAnnotation(null);
            onToggleAnnotation();
          }}
        >
          原型标注：{annotationMode ? '开启' : '关闭'}
        </button>
      </div>

      <DeviceHero
        isDisabled={isDisabled}
        disableInfo={disableInfo}
        onModal={onModal}
        onDrawer={onDrawer}
        annotationMode={annotationMode}
        annotationProps={annotationProps}
      />

      <section className="tab-card">
        <div className="tabs">
          {MAIN_TABS.map((tab) => (
            <button key={tab} className={cls(activeTab === tab && 'active')} onClick={() => setActiveTab(tab)}>
              {tab}
            </button>
          ))}
        </div>
        <div className="tab-content">
          {activeTab === '添加该设备的用户' && (
            <UsersPanel isDisabled={isDisabled} annotationMode={annotationMode} annotationProps={annotationProps} />
          )}
          {activeTab === '增值服务' && (
            <ServicesPanel
              isDisabled={isDisabled}
              annotationMode={annotationMode}
              annotationProps={annotationProps}
            />
          )}
          {activeTab === '日志记录' && (
            <LogsPanel logTab={logTab} setLogTab={setLogTab} onDrawer={onDrawer} onModal={onModal} />
          )}
          {activeTab === '设备状态' && <StatusPanel onDrawer={onDrawer} onModal={onModal} />}
          {activeTab === '物联网卡' && <SimPanel />}
        </div>
      </section>
    </section>
  );
}

function DeviceHero({ isDisabled, disableInfo, onModal, onDrawer, annotationMode, annotationProps }) {
  return (
    <section className="hero-card">
      <div className="device-identity">
        <div className="camera-orb">
          <Camera size={38} />
          <span />
        </div>
        <h2>{device.id}</h2>
        <span className="pill green">已激活</span>
        <InfoLine icon={FileClock} label="激活时间" value={device.activationTime} />
        <InfoLine icon={MapPin} label="所在地" value={device.location} />
        <InfoLine icon={Layers} label="归属组织" value={device.organization} />
      </div>

      <div className="device-facts">
        <section className="fact-group">
          <div className="section-heading">
            <span />
            设备信息
          </div>
          <div className="profile-grid">
            <div className="profile-column">
              <Fact label="使用WIFI" value="是" />
              <Fact label="IMEI" value="--" />
            </div>
            <div className="profile-column">
              <Fact label="服务大区" value="中国大区" />
              <Fact label="设备型号" value={device.model} />
            </div>
            <div className="profile-column">
              <UsageControl
                isDisabled={isDisabled}
                disableInfo={disableInfo}
                onModal={onModal}
                onDrawer={onDrawer}
                annotationMode={annotationMode}
                annotationProps={annotationProps}
              />
              <Fact label="使用TF卡" value="否" />
            </div>
          </div>
        </section>

        <FactGroup title="生产信息">
          <Fact label="生产工厂" value={device.factory} />
          <Fact label="生产时间" value={device.productionTime} />
        </FactGroup>

        <FactGroup title="管理设备">
          <Fact label="移动推送受限" value={<span>设备未受限 <button className="link-button">限制推送</button></span>} />
          <Fact label="设备元数据" value={<button className="link-button" onClick={() => onModal('metadata')}>查看元数据</button>} />
          <Fact label="固件版本号" value={`最新版本号：${device.latestVersion}`} />
        </FactGroup>
      </div>

    </section>
  );
}

function UsageControl({ isDisabled, disableInfo, onModal, onDrawer, annotationMode, annotationProps }) {
  return (
    <div className="usage-control">
      <div className="usage-title">
        <span>设备使用状态</span>
        <Info size={13} />
        {annotationMode && <AnnotationDot id="01" {...annotationProps} />}
      </div>
      <div className="usage-row">
        <span className={cls('pill', isDisabled ? 'red' : 'green')}>{isDisabled ? '禁用' : '正常'}</span>
        <button className={cls('usage-action', isDisabled ? 'primary' : 'danger')} onClick={() => onModal(isDisabled ? 'restoreDevice' : 'disableDevice')}>
          {isDisabled ? '启用' : '禁用'}
        </button>
        <button className="usage-action annotated-action" onClick={() => onDrawer('disableRecords')}>
          日志
          {annotationMode && <AnnotationDot id="04" {...annotationProps} />}
        </button>
      </div>
      {annotationMode && <AnnotationDot id="05" markerKey="05-usage-action" {...annotationProps} />}
    </div>
  );
}

function UsersPanel({ isDisabled, annotationMode, annotationProps }) {
  return (
    <div className={cls('users-panel', isDisabled && 'disabled')}>
      {isDisabled && (
        <div className="diagnosis-note">
          <AlertTriangle size={16} />
          <span>设备已禁用，绑定用户暂不可使用实时预览、远程控制、配置下发和告警推送等核心能力；绑定关系与历史记录已保留。</span>
          {annotationMode && <AnnotationDot id="02" {...annotationProps} />}
        </div>
      )}
      {boundUsers.map((user) => (
        <article className="user-card" key={user.id}>
          <span className="user-avatar">{user.avatar}</span>
          <div>
            <div className="user-title">
              <strong>{user.id}</strong>
              <span className="pill blue">{user.role}</span>
            </div>
            <p>用户ID:{user.userId}</p>
            <p>推送状态：{user.push}</p>
            <p>添加时间：{user.addedAt}</p>
          </div>
        </article>
      ))}
    </div>
  );
}

function ServicesPanel({ isDisabled, annotationMode, annotationProps }) {
  return (
    <div className="services-panel">
      {isDisabled && (
        <div className="service-impact-note">
          <Cloud size={18} />
          <span>设备已禁用，新增购买和手动续费暂不可用；已有关联服务不自动退款、延期或转移，历史云录像仍可查看。</span>
          {annotationMode && <AnnotationDot id="03" {...annotationProps} />}
        </div>
      )}
      <div className="service-grid">
        {services.map((service, index) => {
          const Icon = serviceIcons[index % serviceIcons.length];
          return (
            <article className="service-card" key={service.id}>
              <Icon size={30} />
              <div>
                <strong>{service.name}</strong>
                <span>{index === 1 ? '有效中 · 历史录像可查看' : '未开通'}</span>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function LogsPanel({ logTab, setLogTab, onDrawer, onModal }) {
  return (
    <div className="logs-panel">
      <div className="subtabs">
        {['登录日志', '重置记录', '报警日志'].map((tab) => (
          <button key={tab} className={cls(logTab === tab && 'active')} onClick={() => setLogTab(tab)}>
            {tab}
          </button>
        ))}
      </div>

      {logTab === '登录日志' && (
        <>
          <div className="table-caption">今日授权访问次数 <span className="badge">6</span> 台</div>
          <DataTable
            columns={['登录时间', '状态', '登录IP', '版本号']}
            rows={loginLogs.map((log) => [log.time, log.status, log.ip, log.version])}
          />
        </>
      )}

      {logTab === '重置记录' && (
        <div className="timeline-lite">
          <h3>设备:{device.id}</h3>
          {resetLogs.map((log) => (
            <div className="timeline-row" key={log.time}>
              <span />
              <strong>{log.time}</strong>
            </div>
          ))}
        </div>
      )}

      {logTab === '报警日志' && (
        <>
          <div className="toolbar-line">
            <button className="date-button">2026-06-11</button>
          </div>
          <DataTable
            columns={['UTC时间', '北京时间', '设备动作', '电量', '操作']}
            rows={alarmLogs.map((log) => [
              log.utc,
              log.beijing,
              log.action,
              log.battery,
              <span className="row-actions">
                <button onClick={() => onModal('raw')}>元数据</button>
                <button onClick={() => onModal('resources')}>资源文件</button>
              </span>,
            ])}
          />
          <Pagination />
        </>
      )}
    </div>
  );
}

function StatusPanel({ onDrawer, onModal }) {
  return (
    <div className="status-panel">
      <div className="status-actions">
        <button onClick={() => onDrawer('p2p')}>日志</button>
        <button onClick={() => onModal('power')}>查看电量</button>
      </div>
      <h3>{device.p2p.uid}</h3>
      <div className="status-grid">
        <Fact label="P2P状态" value={<strong>获取失败</strong>} />
        <Fact label="最后登录时间" value={<strong>获取失败</strong>} />
        <Fact label="低功耗状态" value={<span className="pill red">休眠</span>} />
        <Fact label="最后一次心跳时间" value={<strong>{device.p2p.lastWakeTime}</strong>} />
      </div>
      <div className="diagnosis-note">
        <WifiOff size={18} />
        <span>设备在线状态和 P2P 状态不一致时，应优先判断低功耗休眠、连接身份、服务大区三项。</span>
      </div>
    </div>
  );
}

function SimPanel() {
  return (
    <div className="sim-panel">
      <div className="notice-bar">机卡绑定：不支持</div>
      <h3>设备插卡记录</h3>
      <DataTable
        columns={['卡号', '插卡位置', '卡类型']}
        rows={simCards.map((card) => [card.number, card.slot, card.type])}
      />
    </div>
  );
}

function DetailIterationScopePage({ deviceInfo, activeTab, setActiveTab, logTab, setLogTab }) {
  const activeTabIndex = ITERATION_TABS.indexOf(activeTab);
  const panelId = `iteration-panel-${activeTabIndex >= 0 ? activeTabIndex : 0}`;
  const activeMeta = getIterationModuleMeta(activeTab, deviceInfo);

  const handleTabKeyDown = (event) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const currentIndex = Math.max(ITERATION_TABS.indexOf(activeTab), 0);
    const nextIndex = getKeyboardIndex(event.key, currentIndex, ITERATION_TABS.length);
    setActiveTab(ITERATION_TABS[nextIndex]);
    requestAnimationFrame(() => document.getElementById(`iteration-tab-${nextIndex}`)?.focus({ preventScroll: true }));
  };

  return (
    <section className="iteration-page">
      <section className="iteration-console">
        <div className="iteration-console-bar">
          <div className="iteration-breadcrumb">
            <ChevronLeft size={16} />
            <span>设备中心</span>
            <span>/</span>
            <span>设备管理</span>
            <span>/</span>
            <strong>设备详情</strong>
          </div>
          <div className="iteration-console-actions">
            <button type="button" aria-label="刷新">
              <RefreshCw size={15} />
              <span>刷新</span>
            </button>
            <span className="iteration-data-updated">数据更新时间：{deviceInfo.p2p.lastWakeTime}</span>
          </div>
        </div>

        <IterationDeviceHero deviceInfo={deviceInfo} />

        <section className="tab-card iteration-tab-card">
          <div className="tabs iteration-tabs" role="tablist" aria-label="详情模块信息分类" onKeyDown={handleTabKeyDown}>
            {ITERATION_TABS.map((tab, index) => (
              <button
                key={tab}
                id={`iteration-tab-${index}`}
                role="tab"
                type="button"
                aria-selected={activeTab === tab}
                aria-controls={`iteration-panel-${index}`}
                tabIndex={activeTab === tab ? 0 : -1}
                className={cls(activeTab === tab && 'active')}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
          <div
            id={panelId}
            className="tab-content iteration-tab-content"
            role="tabpanel"
            aria-labelledby={`iteration-tab-${activeTabIndex >= 0 ? activeTabIndex : 0}`}
          >
            <IterationModuleShell meta={activeMeta}>
              {activeTab === '基础信息' && <IterationBasicInfo deviceInfo={deviceInfo} />}
              {activeTab === '用户管理' && <IterationBoundUsers deviceInfo={deviceInfo} />}
              {activeTab === '设备状态' && <IterationDeviceStatus deviceInfo={deviceInfo} />}
              {activeTab === '增值服务' && <IterationServices deviceInfo={deviceInfo} />}
              {activeTab === '日志记录' && <IterationLogs deviceInfo={deviceInfo} logTab={logTab} setLogTab={setLogTab} />}
              {activeTab === '物联网卡' && <IterationSim />}
              {activeTab === '设备履历' && <IterationLifecycle deviceInfo={deviceInfo} />}
            </IterationModuleShell>
          </div>
        </section>

      </section>
    </section>
  );
}

function IterationDeviceHero({ deviceInfo }) {
  return (
    <section className="iteration-device-hero" aria-label="设备顶部总览">
      <IterationSummary deviceInfo={deviceInfo} />
      <IterationOverviewCards deviceInfo={deviceInfo} />
    </section>
  );
}

function IterationOverviewCards({ deviceInfo }) {
  return (
    <section className="iteration-overview-cards" aria-label="设备状态总览">
      {getIterationOverviewCards(deviceInfo).map((card) => {
        const CardIcon = card.icon;

        return (
          <article className={cls('iteration-overview-card', `tone-${card.tone}`)} key={card.key}>
            <div className="iteration-overview-card-head">
              <span>
                <CardIcon size={15} />
                {card.label}
              </span>
              {card.extra && <em>{card.extra}</em>}
            </div>
            <strong>{card.value}</strong>
            <small>{card.desc}</small>
          </article>
        );
      })}
    </section>
  );
}

function IterationQuickFacts({ deviceInfo }) {
  return (
    <section className="iteration-quick-facts" aria-label="设备快捷指标">
      {getIterationQuickFacts(deviceInfo).map(({ icon: FactIcon, label, value }) => (
        <div key={label}>
          <span>
            <FactIcon size={17} />
          </span>
          <div>
            <small>{label}</small>
            <strong>{value}</strong>
          </div>
        </div>
      ))}
    </section>
  );
}

function IterationRiskStrip({ deviceInfo }) {
  const RiskIcon = deviceInfo.statusTone === 'normal' ? CheckCircle2 : deviceInfo.statusTone === 'muted' ? Info : AlertTriangle;

  if (deviceInfo.statusTone === 'normal') {
    return null;
  }

  return (
    <section className={cls('iteration-risk-strip', `tone-${deviceInfo.statusTone || 'warn'}`)} aria-label="当前设备风险提示">
      <div className="iteration-risk-icon">
        <RiskIcon size={17} />
      </div>
      <div>
        <strong>{deviceInfo.statusTone === 'normal' ? '当前状态' : '告警提示'}：{deviceInfo.riskSummary}</strong>
      </div>
      <button type="button">查看告警详情</button>
    </section>
  );
}

function IterationModuleShell({ meta, children }) {
  const ModuleIcon = meta.icon || Info;

  return (
    <section className={cls('iteration-module-shell', `module-${meta.tone}`)}>
      <header className="iteration-module-head">
        <div className="iteration-module-titlebar">
          <span className="iteration-module-icon" aria-hidden="true">
            <ModuleIcon size={14} strokeWidth={2.1} />
          </span>
          <div>
            <h2>{meta.title}</h2>
            {meta.summary && <p>{meta.summary}</p>}
          </div>
        </div>
        <div className="iteration-module-points" aria-label={`${meta.title}核心摘要`}>
          {(meta.points || [{ label: meta.eyebrow, value: meta.metric, tone: 'neutral' }]).map((point) => (
            <span className={cls('iteration-module-point', `tone-${point.tone || 'neutral'}`)} key={`${point.label}-${point.value}`}>
              <small>{point.label}</small>
              <strong>{point.value}</strong>
            </span>
          ))}
        </div>
      </header>
      <div className="iteration-module-body">{children}</div>
    </section>
  );
}

function getKeyboardIndex(key, currentIndex, itemCount) {
  if (key === 'Home') return 0;
  if (key === 'End') return itemCount - 1;
  if (key === 'ArrowRight') return (currentIndex + 1) % itemCount;
  return (currentIndex - 1 + itemCount) % itemCount;
}

function IterationSummary({ deviceInfo }) {
  const identitySummary = getDeviceIdentitySummary(deviceInfo);
  const usageStatus = deviceInfo.disabled
    ? { label: '禁用', tone: 'danger' }
    : { label: '正常', tone: 'normal' };

  return (
    <section className="iteration-summary">
      <div className="iteration-summary-hero">
        <div className="iteration-identity-block">
          <DeviceVisual deviceInfo={deviceInfo} />
          <div className="iteration-identity-main">
            <div className="iteration-identity-title">
              <h2>{deviceInfo.id}</h2>
              <span className={cls('iteration-title-status-badge', `tone-${usageStatus.tone}`)}>
                {usageStatus.label}
              </span>
            </div>
            <div className="iteration-primary-meta" aria-label="设备主身份">
              <span className={`line-${deviceInfo.productLine}`}>{identitySummary.businessLine}</span>
              <span className={`network-${identitySummary.networkType}`}>{identitySummary.networkType}</span>
              <span className={`power-${identitySummary.powerType}`}>{identitySummary.powerType}</span>
            </div>
            <div className="iteration-meta-row">
              <span>机型型号：<strong>{deviceInfo.modelCode}</strong></span>
              <span>产品型号：<strong>{deviceInfo.model}</strong></span>
              <span>ICCID：<strong>{identitySummary.iccid}</strong></span>
              <span>设备所在地：<strong>{deviceInfo.location}</strong></span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function DeviceVisual({ deviceInfo }) {
  const visual = getDeviceImage(deviceInfo);

  return (
    <figure className={cls('device-visual', `line-${visual.className}`)}>
      <div className="device-visual-frame">
        {visual.type === 'image' ? (
          <img src={visual.src} alt={`${deviceInfo.modelCode} 设备图片`} />
        ) : (
          <div className="device-visual-fallback" aria-label={`${deviceInfo.productLine} 产线默认图`}>
            <Camera size={34} />
            <span>{deviceInfo.productLine}</span>
          </div>
        )}
      </div>
    </figure>
  );
}

function IterationBasicInfo({ deviceInfo }) {
  const groups = getIterationBasicGroups(deviceInfo);

  return (
    <div className="iteration-basic-dashboard">
      <div className="iteration-basic-main">
        {groups.map((group) => (
          <BasicInfoCard key={group.title} group={group} />
        ))}
      </div>
      <IterationBasicSidebar deviceInfo={deviceInfo} />
    </div>
  );
}

function BasicInfoCard({ group }) {
  const Icon = group.icon || Info;

  return (
    <section className={cls('iteration-basic-card', group.variant && `variant-${group.variant}`)}>
      <header className="iteration-basic-card-head">
        <div>
          <span className="iteration-basic-index" aria-hidden="true">
            <Icon size={14} />
          </span>
          <h3>{group.title}</h3>
        </div>

      </header>
      <div className="iteration-basic-fields">
        {group.items.map((item) => (
          <div className={cls('iteration-basic-field', item.wide && 'wide')} key={`${group.title}-${item.label}`}>
            <span>{item.label}</span>
            <strong className={cls('iteration-basic-value', item.tone && `tone-${item.tone}`, item.badge && 'is-badge')}>
              {item.value || '暂无数据'}
            </strong>
          </div>
        ))}
      </div>
    </section>
  );
}

function IterationBasicSidebar({ deviceInfo }) {
  const quickActions = [
    { label: '重启设备', icon: Power },
    { label: '恢复出厂', icon: RefreshCw },
    { label: '同步时间', icon: FileClock },
    { label: '抓图', icon: Camera },
    { label: '定位设备', icon: MapPin },
    { label: '更多操作', icon: MoreHorizontal },
  ];
  const diagnosticItems = getBasicDiagnosticItems(deviceInfo);

  return (
    <aside className="iteration-basic-sidebar" aria-label="基础信息快捷侧栏">
      <BasicSidebarPanel title="快捷操作">
        <div className="iteration-quick-action-grid">
          {quickActions.map(({ icon: ActionIcon, label }) => (
            <button type="button" key={label}>
              <ActionIcon size={22} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </BasicSidebarPanel>

      <BasicSidebarPanel title="实时诊断" action="重新诊断">
        <div className="iteration-diagnostic-list">
          {diagnosticItems.map((item) => (
            <div className={cls('iteration-diagnostic-item', `tone-${item.tone}`)} key={item.label}>
              <CheckCircle2 size={15} />
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>
        <p className="iteration-diagnostic-time">诊断时间：2024-06-13 15:06:28</p>
      </BasicSidebarPanel>
    </aside>
  );
}

function BasicSidebarPanel({ title, action, children }) {
  return (
    <section className="iteration-basic-side-panel">
      <header>
        <h3>{title}</h3>
        {action && <button type="button">{action}</button>}
      </header>
      {children}
    </section>
  );
}

function getBasicDiagnosticItems(deviceInfo) {
  const p2pNormal = deviceInfo.p2p.status === '在线';
  const videoNormal = !deviceInfo.disabled;

  return [
    { label: '设备在线', value: deviceInfo.activated ? '在线' : '离线', tone: deviceInfo.activated ? 'success' : 'danger' },
    { label: '心跳检测', value: '正常（30s）', tone: 'success' },
    { label: '视频流', value: videoNormal ? '正常' : '异常', tone: videoNormal ? 'success' : 'danger' },
    { label: '存储状态', value: '正常（32%）', tone: 'success' },
    { label: '网络连通性', value: '正常', tone: 'success' },
    { label: 'P2P连接', value: p2pNormal ? '正常' : '异常', tone: p2pNormal ? 'success' : 'danger' },
    { label: 'MQTT连接', value: '正常（21ms）', tone: 'success' },
  ];
}

function IterationBoundUsers({ deviceInfo }) {
  const hasBoundUser = deviceInfo.activated && boundUsers.length > 0;
  const primaryUser = {
    userId: boundUsers[0]?.userId || '18533644',
    name: '张伟',
    phone: '138 **** 5678',
    pushStatus: boundUsers[0]?.push || '关闭',
    role: '主账号',
    location: '中国 · 广东 · 深圳',
    city: '深圳市',
    bindTime: '2024-05-20 17:54:23',
    lastLogin: '2024-06-11 17:52:09',
    device: 'iPhone 14 Pro Max',
    os: 'iOS 17.5.1',
    status: hasBoundUser ? '正常' : '未绑定',
  };
  const deviceCode = deviceInfo.id || 'ADG0081357CBVU';
  const overviewCards = [
    { icon: UsersRound, label: '用户总数', value: hasBoundUser ? 1 : 0, compare: '较昨日 0', tone: 'blue' },
    { icon: UserCheck, label: '主账号数', value: hasBoundUser ? 1 : 0, compare: '较昨日 0', tone: 'green' },
    { icon: Share2, label: '共享用户数', value: 0, compare: '较昨日 0', tone: 'purple' },
    { icon: UserX, label: '异常登录次数', value: 0, compare: '较昨日 0', tone: 'red' },
  ];
  const bindingLogs = [
    ['2024-06-11 17:52:09', '登录设备', 'iOS App 2.4.1 / iPhone 14 Pro Max'],
    ['2024-06-11 17:51:32', '查看实时画面', 'iOS App 2.4.1 / iPhone 14 Pro Max'],
    ['2024-06-11 17:50:48', '修改设备设置', 'iOS App 2.4.1 / iPhone 14 Pro Max'],
    ['2024-06-11 15:16:13', '初始化设备', 'iOS App 2.4.1 / iPhone 14 Pro Max'],
  ];
  const riskTips = [
    { icon: UsersRound, title: '无异常登录', desc: '近7天未发现异常登录行为', tone: 'blue' },
    { icon: Settings, title: '未检测到风险设备', desc: '当前设备登录环境安全', tone: 'blue' },
    { icon: BellRing, title: '建议开启登录保护', desc: '开启二次验证，提升账户安全性', tone: 'red', action: '去开启' },
  ];
  const suggestions = [
    { icon: Share2, title: '分享设备给家人', desc: '通过微信/手机号快速分享设备', tone: 'green' },
    { icon: UsersRound, title: '设置子账号权限', desc: '为家人或同事设置操作权限', tone: 'blue' },
    { icon: ShieldCheck, title: '开启登录保护', desc: '启用二次验证，保障账户安全', tone: 'blue' },
  ];
  const recentOps = [
    { icon: Smartphone, action: '登录设备', time: '今天 17:52:09' },
    { icon: Camera, action: '查看实时画面', time: '今天 17:51:32' },
    { icon: Settings, action: '修改设备设置', time: '今天 17:50:48' },
  ];

  return (
    <div className="iteration-user-board">
      <main className="iteration-user-content">
        <section className="iteration-user-overview-panel" aria-label="用户概览">
          <h3>用户概览</h3>
          <div className="iteration-user-kpi-grid">
            {overviewCards.map((card) => {
              const CardIcon = card.icon;
              return (
                <article className={cls('iteration-user-kpi-card', `tone-${card.tone}`)} key={card.label}>
                  <span className="iteration-user-kpi-icon"><CardIcon size={28} strokeWidth={2.05} /></span>
                  <div>
                    <small>{card.label}</small>
                    <strong>{card.value}</strong>
                    <em>{card.compare}</em>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <div className="iteration-user-two-column">
          <section className="iteration-user-design-card iteration-user-owner-card">
            <h3>主账号信息</h3>
            <div className="iteration-user-owner-body">
              <div className="iteration-owner-avatar-wrap">
                <span className="iteration-owner-avatar" aria-hidden="true">
                  <i className="hair" />
                  <i className="face" />
                  <i className="ear left" />
                  <i className="ear right" />
                  <i className="eye left" />
                  <i className="eye right" />
                  <i className="nose" />
                  <i className="mouth" />
                  <i className="shirt" />
                </span>
                <span className="iteration-owner-crown"><Crown size={16} /></span>
              </div>
              <div className="iteration-owner-info">
                <div className="iteration-owner-title">
                  <strong>{primaryUser.name}（{primaryUser.role}）</strong>
                  <span className="owner-tag blue">主账号</span>
                </div>
                <dl className="iteration-owner-fields">
                  <div><dt>用户ID</dt><dd>{primaryUser.userId}</dd></div>
                  <div><dt>手机号</dt><dd>{primaryUser.phone}<Eye size={14} /></dd></div>
                  <div><dt>推送状态</dt><dd>{primaryUser.pushStatus}</dd></div>
                  <div><dt>所属地区</dt><dd>{primaryUser.location}</dd></div>
                  <div><dt>绑定时间</dt><dd>{primaryUser.bindTime}</dd></div>
                  <div><dt>最后登录</dt><dd>{primaryUser.lastLogin}</dd></div>
                </dl>
              </div>
            </div>
            <div className="iteration-login-device">
              <strong>当前登录设备</strong>
              <article>
                <span><Smartphone size={21} /></span>
                <div>
                  <b>{primaryUser.device}</b>
                  <small>{primaryUser.os}</small>
                </div>
                <i>{primaryUser.city}</i>
              </article>
            </div>
            <button className="iteration-user-text-link" type="button">查看主账号详情 <ChevronRight size={15} /></button>
          </section>

          <section className="iteration-user-design-card iteration-user-relation-card">
            <header>
              <h3>用户关系图</h3>
            </header>
            <div className="iteration-relation-canvas relation-horizontal-view">
              <svg viewBox="0 0 780 220" preserveAspectRatio="none" aria-hidden="true">
                <defs>
                  <filter id="relationDotGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="1.2" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <path className="bind horizontal-device-owner" d="M154 96 L278 96" />
                <path className="share horizontal-owner-shared top" d="M414 96 C472 96 482 44 548 44" />
                <path className="share horizontal-owner-shared bottom" d="M414 96 C472 96 482 146 548 146" />
                <circle cx="154" cy="96" r="3.2" />
                <circle cx="278" cy="96" r="3.2" />
                <circle cx="414" cy="96" r="3.2" />
                <circle cx="548" cy="44" r="3.2" />
                <circle cx="548" cy="146" r="3.2" />
              </svg>
              <article className="relation-horizontal-device">
                <span>
                  <img src={deviceInfo.imageUrl} alt="" />
                </span>
                <small>设备</small>
                <strong>{deviceCode}</strong>
              </article>
              <article className="relation-horizontal-owner">
                <span className="relation-owner-portrait" aria-hidden="true">
                  <i className="hair" />
                  <i className="face" />
                  <i className="ear left" />
                  <i className="ear right" />
                  <i className="eye left" />
                  <i className="eye right" />
                  <i className="nose" />
                  <i className="mouth" />
                  <i className="shirt" />
                </span>
                <small>主账号</small>
                <strong>{primaryUser.name}</strong>
              </article>
              <section className="relation-horizontal-shared" aria-label="共享用户">
                {['李想', '陈一凡'].map((name, index) => (
                  <article className="relation-shared-user" key={name}>
                    <span className={cls('relation-shared-avatar', index === 1 && 'female')} aria-hidden="true">
                      <i className="hair" />
                      <i className="face" />
                      <i className="eye left" />
                      <i className="eye right" />
                      <i className="shirt" />
                    </span>
                    <div>
                      <small>共享用户</small>
                      <strong>{name}</strong>
                    </div>
                  </article>
                ))}
              </section>
            </div>
          </section>
        </div>

        <div className="iteration-user-two-column bottom">
          <section className="iteration-user-design-card iteration-user-empty-share-card">
            <h3>共享用户信息</h3>
            <div className="iteration-share-empty-body">
              <div className="iteration-share-illustration" aria-hidden="true">
                <i className="cloud one" />
                <i className="cloud two" />
                <i className="box back" />
                <i className="box front" />
                <i className="plane" />
                <i className="path" />
              </div>
              <div>
                <strong>暂无共享用户</strong>
                <p>当前设备暂无共享用户，您可以通过分享设备给家人或同事</p>
                <button type="button">分享设备</button>
              </div>
            </div>
          </section>

          <section className="iteration-user-design-card iteration-user-log-card">
            <h3>用户绑定日志</h3>
            <div className="iteration-user-log-table" role="table" aria-label="用户绑定日志">
              <div className="iteration-user-log-row head" role="row">
                <span role="columnheader">时间</span>
                <span role="columnheader">用户</span>
                <span role="columnheader">行为</span>
                <span role="columnheader">来源</span>
                <span role="columnheader">结果</span>
                <span role="columnheader">详情</span>
              </div>
              {bindingLogs.map(([time, action, source]) => (
                <div className="iteration-user-log-row" role="row" key={`${time}-${action}`}>
                  <span role="cell">{time}</span>
                  <span className="log-user" role="cell"><span className="log-avatar"><i /></span>{primaryUser.name}（主账号）</span>
                  <span role="cell">{action}</span>
                  <span role="cell">{source}</span>
                  <span className="log-success" role="cell"><CheckCircle2 size={14} />成功</span>
                  <span role="cell"><button type="button">查看</button></span>
                </div>
              ))}
            </div>
            <button className="iteration-user-text-link" type="button">查看更多日志 <ChevronRight size={15} /></button>
          </section>
        </div>
      </main>

      <aside className="iteration-user-insight-sidebar" aria-label="用户洞察侧栏">
        <section className="iteration-user-side-design-card iteration-user-state-card">
          <h3>用户状态洞察</h3>
          <div className="iteration-user-security-box">
            <div className="security-summary">
              <span><ShieldCheck size={23} /></span>
              <div>
                <strong>整体安全态势 <em>良好</em></strong>
                <p>当前设备用户使用安全，继续保持</p>
              </div>
            </div>
            <div className="security-metrics">
              <span><small>活跃用户（7天）</small><strong>1</strong></span>
              <span><small>平均每日使用</small><strong>1.2 <em>次</em></strong></span>
              <span><small>分享用户数</small><strong>0</strong></span>
            </div>
          </div>
        </section>

        <section className="iteration-user-side-design-card iteration-user-risk-card">
          <h3>风险提示</h3>
          <div className="iteration-risk-tips">
            {riskTips.map((item) => {
              const ItemIcon = item.icon;
              return (
                <article className={cls('risk-tip', `tone-${item.tone}`)} key={item.title}>
                  <ItemIcon size={18} />
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.desc}</p>
                  </div>
                  {item.action && <button type="button">{item.action} <ChevronRight size={13} /></button>}
                </article>
              );
            })}
          </div>
        </section>

        <section className="iteration-user-side-design-card iteration-user-suggestion-card">
          <h3>建议操作</h3>
          <div className="iteration-suggestion-list">
            {suggestions.map((item) => {
              const ItemIcon = item.icon;
              return (
                <article className={cls('suggestion-item', `tone-${item.tone}`)} key={item.title}>
                  <ItemIcon size={18} />
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.desc}</p>
                  </div>
                </article>
              );
            })}
          </div>
          <button className="iteration-user-text-link side" type="button">查看更多建议 <ChevronRight size={15} /></button>
        </section>

        <section className="iteration-user-side-design-card iteration-user-recent-card">
          <h3>最近操作</h3>
          <div className="iteration-recent-user-list">
            {recentOps.map((item) => {
              const ItemIcon = item.icon;
              return (
                <article key={item.action}>
                  <ItemIcon size={18} />
                  <strong>{item.action}</strong>
                  <span>{primaryUser.name}（主账号）</span>
                  <time>{item.time}</time>
                </article>
              );
            })}
          </div>
          <button className="iteration-user-text-link side" type="button"><Download size={14} /> 查看全部操作 <ChevronRight size={15} /></button>
        </section>
      </aside>
    </div>
  );
}
function IterationDeviceStatus({ deviceInfo }) {
  const p2pOffline = deviceInfo.p2p.status !== '在线';
  const mqttOffline = p2pOffline;
  const diagnosticItems = getBasicDiagnosticItems(deviceInfo);
  const recentOperations = [
    ['设备重启', '2024-06-11 15:16:13', '系统'],
    ['设备升级', '2024-06-11 14:20:11', '张三'],
    ['下发配置', '2024-06-10 10:35:23', '李四'],
    ['固件升级', '2024-06-09 16:22:45', '王五'],
    ['恢复出厂设置', '2024-06-08 09:11:02', '系统'],
  ];

  return (
    <div className="iteration-status-dashboard">
      <div className="iteration-status-main">
        <IterationStatusSection
          index="1"
          title="P2P 信息"
          desc="设备通过 P2P 通道与平台的直连通信状态"
          items={[
            { icon: RadioTower, label: 'P2P 连接状态', value: p2pOffline ? '离线' : '在线', tone: p2pOffline ? 'danger' : 'success', badge: true },
            { icon: Activity, label: 'P2P 心跳状态', value: deviceInfo.p2p.lowPowerStatus, tone: deviceInfo.p2p.lowPowerStatus === '休眠' ? 'warning' : 'success', badge: true },
            { icon: FileClock, label: '最后一次心跳时间', value: deviceInfo.p2p.lastWakeTime },
            { icon: UserRound, label: '最后登录时间', value: deviceInfo.p2p.lastLogin === '获取失败' ? '2024-06-11 15:22:49' : deviceInfo.p2p.lastLogin },
          ]}
        />
        <IterationStatusSection
          index="2"
          title="MQTT 信息"
          desc="设备通过 MQTT 通道与平台的连接状态"
          items={[
            { icon: WifiOff, label: '连接状态', value: mqttOffline ? '离线' : '在线', tone: mqttOffline ? 'danger' : 'success', badge: true },
            { icon: History, label: '离线时间', value: '2026-06-22 22:43:02', tone: 'warning' },
            { icon: RefreshCw, label: '上一次连接时间', value: '2026-06-22 22:42:51', tone: 'success' },
            { icon: ShieldCheck, label: '客户端 IP 地址', value: '39.144.15.112', tone: 'accent' },
            { icon: LockKeyhole, label: '拉黑状态', value: '未拉黑', tone: 'muted', badge: true },
            { icon: FileClock, label: '拉黑时间', value: '--' },
          ]}
        />
        <IterationStatusSection
          index="3"
          title="设备影子信息"
          desc="设备影子数据的拉黑状态"
          compact
          items={[
            { icon: ShieldCheck, label: '拉黑状态', value: '未拉黑', tone: 'muted', badge: true },
            { icon: History, label: '拉黑时间', value: '--', tone: 'accent' },
          ]}
        />
        <section className="iteration-status-section iteration-signal-section">
          <header className="iteration-status-section-head">
            <span className="iteration-status-index">4</span>
            <h3>信号与电量信息</h3>
            <p>设备网络信号强度与电量相关信息</p>
          </header>
          <div className="iteration-signal-body">
            <div className="iteration-signal-metric">
              <Gauge size={30} />
              <span>信号强度</span>
              <strong>-63 <small>dBm</small></strong>
              <em>良好</em>
            </div>
            <div className="iteration-signal-metric tone-success">
              <Power size={30} />
              <span>电量值</span>
              <strong>98%</strong>
              <em>充足</em>
            </div>
            <div className="iteration-power-chart" aria-label="最近 24 小时电量统计">
              <div className="iteration-power-chart-head">
                <strong>电量统计（最近 24 小时）</strong>
                <button type="button">24 小时</button>
              </div>
              <div className="iteration-power-bars">
                {Array.from({ length: 24 }).map((_, index) => (
                  <span key={index} style={{ height: `${46 + (index % 5) * 3}%` }} />
                ))}
              </div>
              <div className="iteration-power-scale"><span>17:00</span><span>01:00</span><span>09:00</span><span>17:00</span></div>
            </div>
          </div>
        </section>
      </div>
      <aside className="iteration-status-sidebar">
        <section className="iteration-status-side-card">
          <header><ShieldCheck size={17} /><h3>状态洞察</h3></header>
          <div className="iteration-status-alert"><AlertTriangle size={15} /><strong>风险提示</strong><span>设备当前 P2P、MQTT 均处于离线状态，可能影响远程访问与消息上报。</span></div>
          <p className="iteration-status-ok"><CheckCircle2 size={15} />电量充足，设备供电正常</p>
          <p className="iteration-status-ok"><CheckCircle2 size={15} />信号强度良好，网络质量稳定</p>
        </section>
        <section className="iteration-status-side-card">
          <header><Cpu size={17} /><h3>快捷操作</h3></header>
          <div className="iteration-status-actions">
            {[
              [Power, '设备重启'], [RefreshCw, '恢复出厂'], [Download, '设备升级'],
              [Camera, '抓图预览'], [BellRing, '设备对讲'], [MoreHorizontal, '云台控制'],
            ].map(([ActionIcon, label]) => <button type="button" key={label}><ActionIcon size={18} /><span>{label}</span></button>)}
          </div>
          <button className="iteration-status-more" type="button">查看更多操作 <ChevronRight size={14} /></button>
        </section>
        <section className="iteration-status-side-card">
          <header><History size={17} /><h3>最近操作</h3><button type="button">查看全部</button></header>
          <div className="iteration-status-logs">
            {recentOperations.map(([name, time, owner]) => <div key={`${name}-${time}`}><span>{name}</span><time>{time}</time><em>操作人：{owner}</em></div>)}
          </div>
        </section>
        <section className="iteration-status-side-card">
          <header><MonitorCog size={17} /><h3>实时诊断</h3><button type="button">刷新</button></header>
          <div className="iteration-status-diagnostics">
            {diagnosticItems.slice(0, 6).map((item) => <p className={`tone-${item.tone}`} key={item.label}><CheckCircle2 size={14} /><span>{item.label}</span><strong>{item.value}</strong></p>)}
          </div>
        </section>
      </aside>
    </div>
  );
}

function IterationStatusSection({ index, title, desc, items, compact = false }) {
  return (
    <section className={cls('iteration-status-section', compact && 'is-compact')}>
      <header className="iteration-status-section-head">
        <span className="iteration-status-index">{index}</span>
        <h3>{title}</h3>
        <p>{desc}</p>
      </header>
      <div className="iteration-status-items">
        {items.map((item) => {
          const ItemIcon = item.icon;
          return (
            <article className={cls('iteration-status-item', item.tone && `tone-${item.tone}`)} key={item.label}>
              <span className="iteration-status-item-icon"><ItemIcon size={24} /></span>
              <div>
                <small>{item.label}</small>
                <strong className={item.badge ? 'is-badge' : undefined}>{item.value}</strong>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function IterationServices({ deviceInfo }) {
  const serviceStats = [
    { label: '已开通服务', value: '3', desc: '总计 3 项', tone: 'green', icon: ShieldCheck },
    { label: '未开通服务', value: '6', desc: '可选 6 项', tone: 'blue', icon: ShieldCheck },
    { label: '即将到期', value: '1', desc: '7 天内到期', tone: 'orange', icon: Settings },
    { label: '服务影响', value: deviceInfo.disabled ? '2' : '0', desc: deviceInfo.disabled ? '存在影响' : '暂无影响', tone: 'red', icon: History },
  ];
  const openedServices = [
    {
      name: '云存储',
      icon: Cloud,
      capacity: '30 GB',
      usage: '18.6 GB / 30 GB (62%)',
      usageValue: 62,
      autoRenew: '已开启',
      actions: ['详情', '用量', '续费'],
    },
    {
      name: '告警云存',
      icon: Cloud,
      capacity: '10 GB',
      usage: '2.1 GB / 10 GB (21%)',
      usageValue: 21,
      autoRenew: '已开启',
      actions: ['详情', '用量', '续费'],
    },
    {
      name: '设备追踪',
      icon: MapPin,
      capacity: '200 次/月',
      usage: '128 次（本月）',
      usageValue: 64,
      autoRenew: '已关闭',
      actions: ['详情', '设置', '续费'],
    },
  ];
  const unopenedServices = services.slice(0, 6).map((service, index) => ({
    ...service,
    icon: serviceIcons[index % serviceIcons.length],
    desc: [
      '优化远程访问稳定性，降低延迟，提升视频响应速度。',
      '加速固件下载与分发，缩短升级时长，降低升级失败率。',
      '优化 P2P 连接质量，提升视频流畅度与连接成功率。',
      '支持人形/车辆/区域入侵等事件识别与推送。',
      '端到端数据加密传输，提升数据安全性与合规性。',
      '支持多设备联动规则与场景自动化配置。',
    ][index],
    price: ['¥12.00 / 月', '¥6.00 / 月', '¥10.00 / 月', '¥18.00 / 月', '¥8.00 / 月', '¥15.00 / 月'][index],
  }));
  const quickActions = [
    [Cloud, '续费管理'],
    [SquareStack, '服务购买'],
    [Database, '用量查询'],
    [Settings, '服务设置'],
  ];
  const recentActions = [
    ['2024-06-13 14:20', '续费关闭：设备追踪', 'admin'],
    ['2024-06-11 17:52', '自动续费：云存储', '系统'],
    ['2024-05-20 00:00', '开通服务：云存储 等 3 项', '系统'],
  ];
  const diagnostics = [
    ['服务健康度', '良好', 'good'],
    ['云存储空间', '62%', 'normal'],
    ['网络连通性', '异常', 'bad'],
    ['P2P 连接', '异常', 'bad'],
    ['MQTT 连接', '正常', 'good'],
  ];
  const serviceRecords = [
    ['2024-05-20 00:00:00', '云存储', '开通', '成功', '系统'],
    ['2024-05-20 00:00:00', '告警云存', '开通', '成功', '系统'],
    ['2024-05-20 00:00:00', '设备追踪', '开通', '成功', '系统'],
    ['2024-06-11 17:52:41', '云存储', '自动续费', '成功', '系统'],
    ['2024-06-13 14:20:11', '设备追踪', '自动续费关闭', '成功', 'admin'],
  ];
  const orderRecords = [
    ['2024052000001234', '2024-05-20', '云存储', '36.00', '已支付', '年付'],
    ['2024052000001235', '2024-05-20', '告警云存', '24.00', '已支付', '年付'],
    ['2024052000001236', '2024-05-20', '设备追踪', '20.00', '已支付', '年付'],
    ['2024061100002345', '2024-06-11', '云存储', '36.00', '已支付', '续费'],
  ];

  return (
    <div className="iteration-service-replica">
      <main className="iteration-service-main">
        {deviceInfo.disabled && (
          <div className="iteration-service-alert">
            <Cloud size={16} />
            <span>禁用期间不可新增购买或续费；已有订单不自动退款、延期或转移。</span>
          </div>
        )}

        <section className="service-replica-panel service-stat-panel">
          <ServicePanelHead title="服务总览统计" meta="刷新时间：2024-06-20 17:15:43" />
          <div className="service-stat-grid">
            {serviceStats.map((item) => {
              const StatIcon = item.icon;
              return (
                <article className={cls('service-stat-card', `tone-${item.tone}`)} key={item.label}>
                  <span><StatIcon size={26} /></span>
                  <div>
                    <small>{item.label}</small>
                    <strong>{item.value}</strong>
                    <em>{item.desc}</em>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="service-replica-panel">
          <ServicePanelHead title="已开通服务（3）" />
          <div className="opened-service-grid">
            {openedServices.map((service) => {
              const OpenIcon = service.icon;
              return (
                <article className="opened-service-card" key={service.name}>
                  <header>
                    <span><OpenIcon size={22} /></span>
                    <strong>{service.name}</strong>
                    <em>正常</em>
                  </header>
                  <dl>
                    <div><dt>生效时间</dt><dd>2024-05-20 00:00:00</dd></div>
                    <div><dt>到期时间</dt><dd>2025-06-20 23:59:59</dd></div>
                    <div><dt>{service.name === '设备追踪' ? '定位额度' : '存储容量'}</dt><dd>{service.capacity}</dd></div>
                    <div className="usage-row">
                      <dt>{service.name === '设备追踪' ? '剩余额度' : '使用进度'}</dt>
                      <dd>
                        <span className="service-progress"><i style={{ width: `${service.usageValue}%` }} /></span>
                        <b>{service.usage}</b>
                      </dd>
                    </div>
                    <div><dt>自动续费</dt><dd className={service.autoRenew === '已开启' ? 'is-on' : undefined}>{service.autoRenew}</dd></div>
                  </dl>
                  <footer>
                    {service.actions.map((action) => <button type="button" key={action}>{action}</button>)}
                  </footer>
                </article>
              );
            })}
          </div>
        </section>

        <section className="service-replica-panel">
          <ServicePanelHead title="未开通服务（6）" />
          <div className="unopened-service-grid">
            {unopenedServices.map((service) => {
              const ServiceIcon = service.icon;
              return (
                <article className="unopened-service-card" key={service.id}>
                  <header><ServiceIcon size={18} /><strong>{service.name}</strong></header>
                  <p>{service.desc}</p>
                  <footer><strong>{service.price}</strong><button type="button">开通</button></footer>
                </article>
              );
            })}
          </div>
        </section>

        <div className="service-replica-split">
          <section className="service-replica-panel expiry-panel">
            <ServicePanelHead title="即将到期服务提醒" />
            <div className="expiry-row">
              <span><History size={17} /></span>
              <strong>设备追踪</strong>
              <small>到期时间</small>
              <time>2025-06-20 23:59:59</time>
              <em>剩余 <b>7 天</b></em>
              <button type="button">立即续费</button>
            </div>
          </section>

          <section className="service-replica-panel impact-panel">
            <ServicePanelHead title="服务影响说明" />
            <div className="impact-list">
              <p><AlertTriangle size={16} />云存储空间不足将导致录像无法持续存储，建议及时扩容或清理空间。<button type="button">查看详情</button></p>
              <p><AlertTriangle size={16} />P2P 异常可能导致实时预览卡顿或连接失败，建议检查网络状态或开启 P2P 加速。<button type="button">查看详情</button></p>
            </div>
          </section>
        </div>

        <div className="service-replica-split tables">
          <section className="service-replica-panel service-table-panel">
            <ServicePanelHead title="服务记录" />
            <ServiceReplicaTable columns={['变更时间', '服务名称', '动作', '状态', '操作人']} rows={serviceRecords} />
            <button className="service-more-link" type="button">查看更多记录 <ChevronRight size={14} /></button>
          </section>
          <section className="service-replica-panel service-table-panel">
            <ServicePanelHead title="订单记录" />
            <ServiceReplicaTable columns={['订单号', '购买时间', '服务名称', '金额(元)', '支付状态', '备注']} rows={orderRecords} />
            <button className="service-more-link" type="button">查看更多订单 <ChevronRight size={14} /></button>
          </section>
        </div>
      </main>

      <aside className="iteration-service-sidebar">
        <section className="service-side-card">
          <h3>快捷操作</h3>
          <div className="service-quick-list">
            {quickActions.map(([ActionIcon, label]) => <button type="button" key={label}><ActionIcon size={17} /><span>{label}</span></button>)}
          </div>
        </section>
        <section className="service-side-card">
          <h3>最近操作</h3>
          <div className="service-recent-list">
            {recentActions.map(([time, action, operator]) => (
              <article key={`${time}-${action}`}>
                <i />
                <time>{time}</time>
                <strong>{action}</strong>
                <span>{operator}</span>
              </article>
            ))}
          </div>
          <button className="service-more-link side" type="button">查看更多 <ChevronRight size={14} /></button>
        </section>
        <section className="service-side-card">
          <h3>实时诊断</h3>
          <div className="service-diagnostic-list">
            {diagnostics.map(([label, value, tone]) => (
              <p className={`tone-${tone}`} key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </p>
            ))}
          </div>
          <button className="service-more-link side" type="button">立即诊断 <ChevronRight size={14} /></button>
        </section>
      </aside>
    </div>
  );
}

function ServicePanelHead({ title, meta }) {
  return (
    <header className="service-panel-head">
      <h3>{title}</h3>
      {meta && <span>{meta}</span>}
    </header>
  );
}

function ServiceReplicaTable({ columns, rows }) {
  return (
    <div className="service-replica-table" role="table">
      <div className="service-replica-table-row head" role="row">
        {columns.map((column) => <span role="columnheader" key={column}>{column}</span>)}
      </div>
      {rows.map((row) => (
        <div className="service-replica-table-row" role="row" key={row.join('-')}>
          {row.map((cell, index) => <span role="cell" key={`${cell}-${index}`}>{cell}</span>)}
        </div>
      ))}
    </div>
  );
}

function IterationLogs({ deviceInfo, logTab, setLogTab }) {
  const activeLogIndex = ITERATION_LOG_TABS.indexOf(logTab);
  const logRowsByTab = {
    登录日志: loginLogs.map((log) => [log.time, log.status, log.ip, log.version]),
    重置记录: resetLogs.map((log) => [deviceInfo.id, log.ip, log.time]),
    报警日志: alarmLogs.slice(0, 8).map((log) => [log.beijing, log.action, log.battery, '只有图片']),
    解绑转移日志: iterationOperationLogs.map((log) => [
      log.time,
      log.type,
      log.operator,
      log.target,
      log.result,
      log.source,
    ]),
  };
  const logColumnsByTab = {
    登录日志: ['登录时间', '状态', '登录IP', '版本号'],
    重置记录: ['设备ID', 'IP地址', '重置时间'],
    报警日志: ['北京时间', '设备动作', '电量', '资源情况'],
    解绑转移日志: ['操作时间', '操作类型', '操作人', '对象', '结果', '来源'],
  };
  const activeRows = logRowsByTab[logTab] || [];
  const activeColumns = logColumnsByTab[logTab] || [];

  const handleLogTabKeyDown = (event) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const currentIndex = Math.max(ITERATION_LOG_TABS.indexOf(logTab), 0);
    const nextIndex = getKeyboardIndex(event.key, currentIndex, ITERATION_LOG_TABS.length);
    setLogTab(ITERATION_LOG_TABS[nextIndex]);
    requestAnimationFrame(() => document.getElementById(`iteration-log-tab-${nextIndex}`)?.focus({ preventScroll: true }));
  };

  return (
    <div className="logs-panel iteration-logs-panel iteration-audit-layout">
      <div className="subtabs" role="tablist" aria-label="日志类型" onKeyDown={handleLogTabKeyDown}>
        {ITERATION_LOG_TABS.map((tab, index) => (
          <button
            key={tab}
            id={`iteration-log-tab-${index}`}
            role="tab"
            type="button"
            aria-selected={logTab === tab}
            aria-controls="iteration-log-panel"
            tabIndex={logTab === tab ? 0 : -1}
            className={cls(logTab === tab && 'active')}
            onClick={() => setLogTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div id="iteration-log-panel" role="tabpanel" aria-labelledby={`iteration-log-tab-${Math.max(activeLogIndex, 0)}`}>
        {logTab === '登录日志' ? (
          <IterationLoginLogReplica deviceInfo={deviceInfo} />
        ) : logTab === '重置记录' ? (
          <IterationResetLogReplica deviceInfo={deviceInfo} />
        ) : logTab === '报警日志' ? (
          <IterationAlarmLogReplica deviceInfo={deviceInfo} />
        ) : logTab === '报警调试日志' ? (
          <IterationAlarmDebugLogReplica deviceInfo={deviceInfo} />
        ) : (
          <>
            <div className="iteration-log-toolbar">
              <div>
                <strong>{logTab}</strong>
                <span>共 {activeRows.length} 条 · 时间倒序 · 近 30 天</span>
              </div>
              <div className="iteration-log-actions" aria-label="日志操作">
                <button type="button">
                  <Filter size={14} />
                  全部状态
                </button>
                <button type="button">
                  <RefreshCw size={14} />
                  刷新
                </button>
                <button type="button">
                  <Download size={14} />
                  导出
                </button>
              </div>
            </div>
            <DataTable
              caption={`${logTab}列表`}
              columns={activeColumns}
              rows={activeRows}
              emptyTitle="暂无日志记录"
              emptyDescription="当前筛选条件下没有匹配日志，可切换日志类型或刷新后重试。"
            />
          </>
        )}
      </div>
    </div>
  );
}

function IterationLoginLogReplica({ deviceInfo }) {
  const loginOverview = [
    {
      key: 'total',
      icon: FileClock,
      label: '登录日志总数',
      value: '15,628',
      unit: '条',
      desc: '统计周期：全部',
      tone: 'blue',
    },
    {
      key: 'latest',
      icon: History,
      label: '最新登录时间',
      value: '2026-06-23 13:32:24',
      desc: '登录IP：39.144.15.112',
      tone: 'green',
    },
    {
      key: 'abnormal',
      icon: ShieldCheck,
      label: '异常登录次数',
      value: '28',
      unit: '次',
      desc: '占比 0.18%',
      tone: 'red',
    },
    {
      key: 'timezone',
      icon: RadioTower,
      label: '时间时区',
      value: '北京时间 UTC+08:00',
      desc: '与设备上报时间一致',
      tone: 'purple',
    },
  ];
  const loginRows = [
    ['2026-06-23 13:32:24', '39.144.15.112', '成功', '心跳上报', '设备主动上报'],
    ['2026-06-23 00:44:33', '39.144.15.112', '成功', '心跳上报', '设备主动上报'],
    ['2026-06-22 12:02:05', '39.144.15.112', '成功', '首登', '设备主动上报'],
    ['2026-06-21 23:57:35', '39.144.15.112', '成功', '重连', '设备主动上报'],
    ['2026-06-21 11:47:54', '39.144.15.112', '成功', '心跳上报', '设备主动上报'],
    ['2026-06-20 22:56:42', '221.178.127.248', '失败', '心跳上报', '设备主动上报'],
    ['2026-06-20 22:51:18', '39.144.15.112', '成功', '重连', '设备主动上报'],
    ['2026-06-19 18:30:07', '39.144.15.112', '成功', '心跳上报', '设备主动上报'],
  ].map(([time, ip, status, action, source]) => ({
    deviceId: deviceInfo.id,
    time,
    ip,
    status,
    version: deviceInfo.firmware,
    action,
    source,
  }));

  return (
    <section className="login-log-replica" aria-label="登录日志">
      <div className="login-log-summary">
        {loginOverview.map((item) => {
          const SummaryIcon = item.icon;
          return (
            <article className={cls('login-log-card', `tone-${item.tone}`)} key={item.key}>
              <span className="login-log-card-icon">
                <SummaryIcon size={26} />
              </span>
              <div>
                <small>{item.label}</small>
                <strong>{item.value}{item.unit && <em>{item.unit}</em>}</strong>
                <p>{item.desc}</p>
              </div>
            </article>
          );
        })}
        <aside className="login-log-note">
          <strong><Info size={15} />日志说明</strong>
          <ul>
            <li>登录日志记录设备与云平台的登录连接事件。</li>
            <li>登录状态：成功、失败、超时、断开等。</li>
            <li>心跳动作类型：心跳上报、首次登录、重连等。</li>
            <li>时间统一按设备上报时区转换为北京时间展示。</li>
          </ul>
        </aside>
      </div>

      <section className="login-log-filters" aria-label="登录日志筛选">
        <div className="login-filter-field wide">
          <label>时间范围</label>
          <button type="button">2026-06-16 00:00:00 <span>~</span> 2026-06-23 23:59:59 <FileClock size={14} /></button>
        </div>
        <div className="login-filter-field">
          <label>日志类型</label>
          <button type="button">登录日志 <ChevronRight size={14} /></button>
        </div>
        <div className="login-filter-field">
          <label>登录状态</label>
          <button type="button">全部状态 <ChevronRight size={14} /></button>
        </div>
        <div className="login-filter-field search">
          <label>IP地址 / 版本号 / 设备ID</label>
          <div>
            <input aria-label="IP地址、版本号、设备ID关键词" placeholder="请输入关键词" />
            <Search size={17} />
          </div>
        </div>
        <div className="login-filter-actions">
          <button type="button">重置</button>
          <button type="button" className="primary">查询</button>
          <button type="button"><Download size={14} />导出</button>
          <button type="button" className="icon-only" aria-label="刷新"><RefreshCw size={17} /></button>
        </div>
        <p>已选择时间范围：2026-06-16 00:00:00 ~ 2026-06-23 23:59:59 <button type="button">清空条件</button></p>
      </section>

      <div className="login-log-table" role="table" aria-label="登录日志列表">
        <div className="login-log-table-row head" role="row">
          {['设备ID', '登录时间', '登录IP地址', '登录状态', '版本号', '心跳/动作类型', '来源', '操作'].map((column) => (
            <span role="columnheader" key={column}>{column}</span>
          ))}
        </div>
        {loginRows.map((row) => (
          <div className="login-log-table-row" role="row" key={`${row.time}-${row.ip}`}>
            <span role="cell">{row.deviceId}</span>
            <span role="cell">{row.time}</span>
            <span role="cell">{row.ip}</span>
            <span role="cell"><i className={row.status === '成功' ? 'success' : 'failed'} />{row.status}</span>
            <span role="cell">{row.version}</span>
            <span role="cell">{row.action}</span>
            <span role="cell">{row.source}</span>
            <span role="cell" className="login-log-row-actions">
              <button type="button">查看详情</button>
              <button type="button">请求元数据</button>
              <button type="button">结果元数据</button>
            </span>
          </div>
        ))}
      </div>

      <footer className="login-log-pagination">
        <strong>共 15,628 条</strong>
        <div>
          <button type="button">20条/页 <ChevronRight size={14} /></button>
          <button type="button" className="ghost" aria-label="上一页"><ChevronLeft size={15} /></button>
          <button type="button" className="active">1</button>
          <button type="button">2</button>
          <button type="button">3</button>
          <span>...</span>
          <button type="button">782</button>
          <button type="button" aria-label="下一页"><ChevronRight size={15} /></button>
          <label>前往 <input defaultValue="1" aria-label="跳转页码" /> 页</label>
        </div>
      </footer>
    </section>
  );
}

function IterationResetLogReplica({ deviceInfo }) {
  const resetRows = resetLogs.map((log) => ({
    deviceId: deviceInfo.id,
    ip: log.ip || '暂无记录',
    time: log.time,
  }));
  const latestReset = resetRows[0];
  const uniqueIpCount = new Set(resetRows.map((row) => row.ip).filter(Boolean)).size;
  const resetOverview = [
    {
      key: 'count',
      icon: RefreshCw,
      label: '重置记录总数',
      value: String(resetRows.length),
      unit: '条',
      desc: '统计周期：全部',
      tone: 'blue',
    },
    {
      key: 'latest',
      icon: FileClock,
      label: '最近重置时间',
      value: latestReset?.time || '--',
      desc: `设备ID：${deviceInfo.id}`,
      tone: 'green',
    },
    {
      key: 'ip',
      icon: RadioTower,
      label: '来源IP数量',
      value: String(uniqueIpCount),
      unit: '个',
      desc: latestReset ? `最近IP：${latestReset.ip}` : '暂无来源IP',
      tone: 'purple',
    },
  ];

  return (
    <section className="reset-log-replica" aria-label="重置记录">
      <div className="reset-log-summary">
        {resetOverview.map((item) => {
          const SummaryIcon = item.icon;
          return (
            <article className={cls('reset-log-card', `tone-${item.tone}`)} key={item.key}>
              <span className="reset-log-card-icon">
                <SummaryIcon size={24} />
              </span>
              <div>
                <small>{item.label}</small>
                <strong>{item.value}{item.unit && <em>{item.unit}</em>}</strong>
                <p>{item.desc}</p>
              </div>
            </article>
          );
        })}
        <aside className="reset-log-note">
          <strong><Info size={15} />字段说明</strong>
          <ul>
            <li>设备ID：发生重置动作的设备唯一标识。</li>
            <li>IP地址：触发或上报重置记录时的来源 IP。</li>
            <li>重置时间：统一按北京时间展示。</li>
          </ul>
        </aside>
      </div>

      <section className="reset-log-filters" aria-label="重置记录筛选">
        <div className="reset-filter-field wide">
          <label>时间范围</label>
          <button type="button">2026-05-28 00:00:00 <span>~</span> 2026-06-11 23:59:59 <FileClock size={14} /></button>
        </div>
        <div className="reset-filter-field search">
          <label>设备ID / IP地址</label>
          <div>
            <input aria-label="设备ID或IP地址关键词" placeholder="请输入关键词" />
            <Search size={17} />
          </div>
        </div>
        <div className="reset-filter-actions">
          <button type="button">重置</button>
          <button type="button" className="primary">查询</button>
          <button type="button"><Download size={14} />导出</button>
          <button type="button" className="icon-only" aria-label="刷新"><RefreshCw size={17} /></button>
        </div>
        <p>已选择时间范围：2026-05-28 00:00:00 ~ 2026-06-11 23:59:59 <button type="button">清空条件</button></p>
      </section>

      <div className="reset-log-table" role="table" aria-label="重置记录列表">
        <div className="reset-log-table-row head" role="row">
          {['设备ID', 'IP地址', '重置时间', '操作'].map((column) => (
            <span role="columnheader" key={column}>{column}</span>
          ))}
        </div>
        {resetRows.map((row) => (
          <div className="reset-log-table-row" role="row" key={`${row.deviceId}-${row.time}`}>
            <span role="cell"><b>{row.deviceId}</b></span>
            <span role="cell"><i />{row.ip}</span>
            <span role="cell">{row.time}</span>
            <span role="cell" className="reset-log-row-actions">
              <button type="button">查看详情</button>
              <button type="button">复制设备ID</button>
              <button type="button">复制IP</button>
            </span>
          </div>
        ))}
      </div>

      <footer className="reset-log-pagination">
        <strong>共 {resetRows.length} 条</strong>
        <div>
          <button type="button">20条/页 <ChevronRight size={14} /></button>
          <button type="button" className="active">1</button>
        </div>
      </footer>
    </section>
  );
}

function IterationAlarmLogReplica({ deviceInfo }) {
  const alarmRows = [
    ['2025-06-22 12:31:10', '2025-06-22 20:31:10', 'PIR人体侦测触发', 100, 2],
    ['2025-06-22 12:12:45', '2025-06-22 20:12:45', '人体侦测被触发-只有图片', 96, 1],
    ['2025-06-22 11:58:02', '2025-06-22 19:58:02', '人体侦测被触发-只有图片', 92, 1],
    ['2025-06-22 11:43:18', '2025-06-22 19:43:18', 'PIR人体侦测触发', 88, 2],
    ['2025-06-22 11:27:34', '2025-06-22 19:27:34', '人体侦测被触发-只有图片', 84, 1],
    ['2025-06-22 11:12:09', '2025-06-22 19:12:09', 'PIR人体侦测触发', 80, 2],
    ['2025-06-22 10:57:21', '2025-06-22 18:57:21', '人体侦测被触发-只有图片', 76, 1],
    ['2025-06-22 10:41:10', '2025-06-22 18:41:10', 'PIR人体侦测触发', 72, 2],
  ].map(([utc, beijing, action, battery, fileCount], index) => ({
    id: `alarm-${index}`,
    utc,
    beijing,
    action,
    battery,
    fileCount,
  }));
  const selectedAlarm = alarmRows[0];
  const calendarDays = [
    ['25', 'prev'], ['26', 'prev'], ['27', 'prev'], ['28', 'prev'], ['29', 'prev'], ['30', 'prev'], ['31', 'prev'],
    ['01'], ['02'], ['03'], ['04'], ['05'], ['06'], ['07'],
    ['08'], ['09'], ['10'], ['11'], ['12'], ['13'], ['14'],
    ['15'], ['16', 'has'], ['17', 'has'], ['18', 'has'], ['19', 'has'], ['20', 'has'], ['21'],
    ['22', 'active has'], ['23', 'has'], ['24', 'has'], ['25', 'has'], ['26', 'has'], ['27', 'has'], ['28'],
    ['29'], ['30'], ['01', 'next'], ['02', 'next'], ['03', 'next'], ['04', 'next'], ['05', 'next'],
  ];
  const metadata = {
    event: 'pir_trigger',
    sensor: 'PIR',
    sensitivity: 'high',
    battery: 100,
    temperature: 26.3,
    humidity: 58,
    device_id: deviceInfo.id,
    sequence: 102348,
    time_utc: '2025-06-22T12:31:10Z',
  };
  const detailRows = [
    ['UTC时间', selectedAlarm.utc],
    ['北京时间', selectedAlarm.beijing],
    ['设备告警事件动作', selectedAlarm.action],
    ['电量（%）', selectedAlarm.battery],
  ];
  const resourceFiles = [
    ['IMG_20250622_123110.jpg', '256 KB', selectedAlarm.utc, 'image'],
    ['IMG_20250622_123110.mp4', '1.25 MB', selectedAlarm.utc, 'video'],
  ];

  return (
    <section className="alarm-log-replica" aria-label="报警日志">
      <div className="alarm-log-tip">
        <Info size={15} />
        <div>
          <strong>报警日志说明</strong>
          <p>报警日志是设备产生告警事件时上报的记录，用于回溯设备告警情况、触发时间与相关附件（如图片、录像等），便于运维与业务排查。</p>
        </div>
      </div>

      <div className="alarm-log-layout">
        <aside className="alarm-calendar" aria-label="报警日期">
          <strong>报警日期</strong>
          <div className="alarm-calendar-card">
            <div className="alarm-calendar-head">
              <button type="button" aria-label="上个月"><ChevronLeft size={15} /></button>
              <span>2025 年 6 月</span>
              <button type="button" aria-label="下个月"><ChevronRight size={15} /></button>
              <FileClock size={15} />
            </div>
            <div className="alarm-calendar-week">
              {['日', '一', '二', '三', '四', '五', '六'].map((day) => <span key={day}>{day}</span>)}
            </div>
            <div className="alarm-calendar-grid">
              {calendarDays.map(([day, state], index) => (
                <button className={state || ''} type="button" key={`${day}-${index}`}>
                  {day}
                </button>
              ))}
            </div>
          </div>
          <p><i />当日有报警日志</p>
          <small>时区：UTC+08:00 北京时间</small>
        </aside>

        <section className="alarm-log-main">
          <section className="alarm-log-filters" aria-label="报警日志筛选">
            <label className="wide">
              <span>时间范围</span>
              <button type="button">2025-06-22 00:00:00 <em>~</em> 2025-06-22 23:59:59 <FileClock size={14} /></button>
            </label>
            <label>
              <span>事件类型</span>
              <button type="button">全部 <ChevronRight size={14} /></button>
            </label>
            <label>
              <span>电量范围</span>
              <button type="button">最小值 <em>~</em> 最大值 <b>%</b></button>
            </label>
            <label className="search">
              <span aria-hidden="true">&nbsp;</span>
              <div>
                <input aria-label="事件动作或元数据内容关键词" placeholder="请输入事件动作/元数据内容关键词" />
                <Search size={16} />
              </div>
            </label>
            <button className="alarm-export" type="button">导出 <Download size={14} /></button>
          </section>

          <div className="alarm-log-table" role="table" aria-label="报警日志列表">
            <div className="alarm-log-table-row head" role="row">
              {['UTC时间', '北京时间', '设备告警事件动作', '电量（%）', '元数据信息', '资源文件'].map((column) => (
                <span role="columnheader" key={column}>{column}</span>
              ))}
            </div>
            {alarmRows.map((row, index) => (
              <div className={cls('alarm-log-table-row', index === 0 && 'active')} role="row" key={row.id}>
                <span role="cell">{row.utc}</span>
                <span role="cell">{row.beijing}</span>
                <span role="cell">{row.action}</span>
                <span role="cell">{row.battery}</span>
                <span role="cell"><button type="button">查看</button></span>
                <span role="cell"><button type="button">查看({row.fileCount})</button></span>
              </div>
            ))}
          </div>

          <footer className="alarm-log-pagination">
            <strong>共 128 条</strong>
            <button type="button">10条/页 <ChevronRight size={14} /></button>
            <button className="ghost" type="button" aria-label="上一页"><ChevronLeft size={14} /></button>
            {[1, 2, 3, 4, 5].map((page) => (
              <button className={page === 1 ? 'active' : ''} type="button" key={page}>{page}</button>
            ))}
            <span>...</span>
            <button type="button">13</button>
            <button type="button" aria-label="下一页"><ChevronRight size={14} /></button>
            <label>前往 <input defaultValue="1" aria-label="跳转页码" /> 页</label>
          </footer>
        </section>

        <aside className="alarm-detail-drawer" aria-label="报警日志详情">
          <header>
            <strong>报警日志详情</strong>
            <button type="button" aria-label="关闭详情"><X size={17} /></button>
          </header>
          <h3><i />PIR人体侦测触发</h3>
          <dl className="alarm-detail-list">
            {detailRows.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          <section className="alarm-detail-section">
            <div className="alarm-detail-section-head">
              <strong>元数据信息</strong>
              <button type="button"><Share2 size={13} />复制</button>
            </div>
            <pre>{JSON.stringify(metadata, null, 2)}</pre>
          </section>
          <section className="alarm-detail-section">
            <strong>资源文件（2）</strong>
            <div className="alarm-resource-list">
              {resourceFiles.map(([name, size, time, type]) => (
                <article key={name}>
                  <span className={cls('alarm-resource-thumb', type)}>
                    {type === 'video' ? <ChevronRight size={22} /> : <Camera size={18} />}
                  </span>
                  <div>
                    <b>{name}</b>
                    <small>{size}</small>
                  </div>
                  <time>{time}</time>
                  <button type="button" aria-label={`下载${name}`}><Download size={18} /></button>
                </article>
              ))}
            </div>
          </section>
          <button className="alarm-detail-close" type="button">关闭</button>
        </aside>
      </div>
    </section>
  );
}

function IterationAlarmDebugLogReplica({ deviceInfo }) {
  const debugStats = [
    {
      key: 'attempts',
      icon: Send,
      label: '今日调试次数',
      value: '38',
      unit: '次',
      desc: '昨日 26 次',
      trend: '↑ 46.2%',
      tone: 'blue',
    },
    {
      key: 'success',
      icon: CheckCircle2,
      label: '推送成功率',
      value: '92.1',
      unit: '%',
      desc: '成功 35 次 / 失败 3 次',
      tone: 'green',
    },
    {
      key: 'latest',
      icon: History,
      label: '最近调试时间',
      value: '2026-06-23 12:43:55',
      desc: '上海时间 UTC+08:00',
      tone: 'purple',
    },
    {
      key: 'status',
      icon: BellRing,
      label: '当前推送状态',
      value: '推送中',
      desc: '持续时长：02:43:55',
      tone: 'orange',
    },
  ];
  const regionTabs = ['大陆', '亚洲', '欧洲', '北美洲'];
  const debugRows = [
    ['2026-06-23 12:43:55', '大陆', '设备主站上报', '心跳上报', '成功', '126 ms', 'req_20260623124355_a1bc03', '周期性心跳'],
    ['2026-06-23 12:40:21', '大陆', '短信通道', '设备报警推送', '失败', '2,312 ms', 'req_20260623124021_d4c6f6', 'SIM卡信号弱，发送失败'],
    ['2026-06-23 12:32:07', '大陆', '短信通道', '位置报警推送', '成功', '342 ms', 'req_20260623123207_d9fa9b', '围栏越界报警'],
    ['2026-06-23 12:18:33', '大陆', 'APP推送', '设备扬声器告警', '成功', '198 ms', 'req_20260623121833_f0b112', '扬声器告警测试'],
    ['2026-06-23 11:55:10', '大陆', '短信通道', '低电量报警', '部分成功', '1,205 ms', 'req_20260623115510_m3ba05', '双卡轮换发送'],
    ['2026-06-23 11:23:45', '大陆', '设备主站上报', '心跳上报', '成功', '83 ms', 'req_20260623112345_g7e7b7', '周期性心跳'],
    ['2026-06-23 10:35:02', '大陆', '电话通道', '震动报警', '部分成功', '856 ms', 'req_20260623103502_a90a11', '无人接听'],
    ['2026-06-23 09:42:18', '大陆', '邮件通道', '围栏越界告警', '成功', '412 ms', 'req_20260623094218_xa0fa4', '测试邮箱接收正常'],
    ['2026-06-23 08:15:07', '大陆', 'APP推送', 'SOS报警测试', '成功', '265 ms', 'req_20260623081507_5fc9a7', '一键SOS测试'],
    ['2026-06-23 07:55:30', '大陆', '设备主站上报', '心跳上报', '成功', '110 ms', 'req_20260623075530_bfl0b9d', '周期性心跳'],
  ].map(([time, region, channel, action, result, latency, requestId, note]) => ({
    time,
    region,
    channel,
    action,
    result,
    latency,
    requestId,
    note,
  }));
  const channelStatuses = [
    [Smartphone, '短信通道', '正常', 'normal'],
    [BellRing, 'APP推送', '正常', 'normal'],
    [Database, '设备主站', '正常', 'normal'],
    [Share2, '邮件通道', '正常', 'normal'],
    [RadioTower, '电话通道', '部分异常', 'warn'],
    [Volume2, '扬声器通道', '正常', 'normal'],
  ];
  const resultSummary = [
    ['成功', 7, '70%', 'success'],
    ['部分成功', 2, '20%', 'partial'],
    ['失败', 1, '10%', 'failed'],
  ];

  return (
    <section className="alarm-debug-replica" aria-label="报警调试日志">
      <div className="alarm-debug-stats">
        {debugStats.map(({ icon: StatIcon, ...item }) => (
          <article className={cls('alarm-debug-stat', `tone-${item.tone}`)} key={item.key}>
            <span className="alarm-debug-stat-icon">
              <StatIcon size={32} />
            </span>
            <div>
              <small>{item.label}</small>
              <strong>{item.value}<em>{item.unit}</em></strong>
              <p>{item.desc} {item.trend && <b>{item.trend}</b>}</p>
            </div>
          </article>
        ))}
      </div>

      <div className="alarm-debug-layout">
        <section className="alarm-debug-main">
          <div className="alarm-debug-toolbar">
            <div className="alarm-debug-region-tabs" role="tablist" aria-label="报警调试区域">
              {regionTabs.map((region, index) => (
                <button className={index === 0 ? 'active' : ''} type="button" role="tab" aria-selected={index === 0} key={region}>
                  {region}
                </button>
              ))}
            </div>
            <div className="alarm-debug-actions" aria-label="报警调试操作">
              <button className="primary" type="button">发送调试数据</button>
              <button className="primary" type="button">开启推送日志</button>
              <button className="danger" type="button">停止推送</button>
              <button type="button"><Settings size={14} />查看配置</button>
              <button type="button"><Download size={14} />导出结果 <ChevronRight size={14} /></button>
            </div>
          </div>

          <section className="alarm-debug-filters" aria-label="报警调试筛选">
            <label>
              <span>调试动作</span>
              <button type="button">全部动作 <ChevronRight size={14} /></button>
            </label>
            <label>
              <span>结果状态</span>
              <button type="button">全部状态 <ChevronRight size={14} /></button>
            </label>
            <label>
              <span>推送通道</span>
              <button type="button">全部通道 <ChevronRight size={14} /></button>
            </label>
            <label className="wide">
              <span>时间范围</span>
              <button type="button">2026-06-23 00:00:00 <em>~</em> 2026-06-23 23:59:59 <FileClock size={14} /></button>
            </label>
            <label className="search">
              <span>关键字</span>
              <div>
                <input aria-label="请求ID、备注、通道关键字" placeholder="请输入请求ID / 备注 / 通道" />
                <Search size={15} />
              </div>
            </label>
            <div className="alarm-debug-filter-actions">
              <button type="button">重置</button>
              <button className="primary" type="button">查询</button>
            </div>
          </section>

          <div className="alarm-debug-table" role="table" aria-label="报警调试日志列表">
            <div className="alarm-debug-table-row head" role="row">
              {['触发时间', '区域', '推送通道', '动作', '结果', '响应耗时', '请求ID', '备注', '操作'].map((column) => (
                <span role="columnheader" key={column}>{column}</span>
              ))}
            </div>
            {debugRows.map((row) => (
              <div className="alarm-debug-table-row" role="row" key={row.requestId}>
                <span role="cell">{row.time}</span>
                <span role="cell">{row.region}</span>
                <span role="cell">{row.channel}</span>
                <span role="cell">{row.action}</span>
                <span role="cell" className={cls('alarm-debug-result', `status-${row.result}`)}>
                  <i />{row.result}
                </span>
                <span role="cell">{row.latency}</span>
                <span role="cell">{row.requestId}</span>
                <span role="cell">{row.note}</span>
                <span role="cell"><button type="button">查看详情</button></span>
              </div>
            ))}
          </div>

          <footer className="alarm-debug-pagination">
            <strong>共 38 条</strong>
            <div>
              <button type="button">10条/页 <ChevronRight size={14} /></button>
              <button className="ghost" type="button" aria-label="上一页"><ChevronLeft size={14} /></button>
              {[1, 2, 3, 4].map((page) => (
                <button className={page === 1 ? 'active' : ''} type="button" key={page}>{page}</button>
              ))}
              <button type="button" aria-label="下一页"><ChevronRight size={14} /></button>
              <label>前往 <input defaultValue="1" aria-label="跳转页码" /> 页</label>
            </div>
          </footer>
        </section>

        <aside className="alarm-debug-sidebar" aria-label="报警调试诊断">
          <section className="alarm-debug-note">
            <strong>调试环境说明</strong>
            <ul>
              <li>此模块用于设备报警推送链路的调试与验证。</li>
              <li>支持多通道并发测试，结果仅用于链路验证。</li>
              <li>建议在非高峰时段进行大批量测试。</li>
              <li>调试日志保留7天，逾期自动清理。</li>
            </ul>
          </section>

          <section className="alarm-debug-channel-card">
            <header>
              <strong>通道状态</strong>
              <button type="button">刷新</button>
            </header>
            <div>
              {channelStatuses.map(([ChannelIcon, label, status, tone]) => (
                <p className={`tone-${tone}`} key={label}>
                  <span><ChannelIcon size={14} />{label}</span>
                  <b>{status}</b>
                </p>
              ))}
            </div>
          </section>

          <section className="alarm-debug-result-card">
            <strong>最近测试结果（近 10 条）</strong>
            <div className="alarm-debug-donut" aria-hidden="true">
              <span />
            </div>
            <div className="alarm-debug-result-legend">
              {resultSummary.map(([label, count, percent, tone]) => (
                <p className={`tone-${tone}`} key={label}>
                  <i />
                  <span>{label}</span>
                  <b>{count} ({percent})</b>
                </p>
              ))}
            </div>
          </section>

          <section className="alarm-debug-risk">
            <strong><AlertTriangle size={15} />风险提示</strong>
            <p>短信通道存在部分失败，建议检查SIM卡信号与短信套餐余额。</p>
            <button type="button">查看建议</button>
          </section>
        </aside>
      </div>
    </section>
  );
}

function IterationSim() {
  return (
    <div className="iteration-section-stack">
      <div className="iteration-inline-note">
        <RadioTower size={16} />
        <span>仅展示插卡记录和卡类型。</span>
      </div>
      <DataTable
        columns={['卡号', '插卡位置', '卡类型']}
        rows={simCards.map((card) => [card.number, card.slot, card.type])}
      />
    </div>
  );
}

function IterationLifecycle({ deviceInfo }) {
  const currentStage = deviceInfo.activated ? `已激活 · ${deviceInfo.p2p.lowPowerStatus}` : '未激活';
  const stageCards = [
    ['阶段', deviceInfo.activated ? '已激活' : '未激活', deviceInfo.activated ? 'success' : 'muted', CheckCircle2],
    ['当前', deviceInfo.p2p.lowPowerStatus || '未知', deviceInfo.p2p.lowPowerStatus === '休眠' ? 'warn' : 'success', Gauge],
    ['事件', '7 条', 'neutral', FileClock],
    ['最近变化', '2026-06-13 15:06:32', 'neutral', History],
  ];
  const phaseNodes = [
    ['生产', '2024-04-23\n20:00:00', 'blue'],
    ['激活', '2024-04-23\n20:09:00', 'green'],
    ['绑定', '2024-04-26\n10:35:28', 'blue'],
    ['运行/休眠', '2026-06-11\n17:52:49', 'orange'],
    ['告警', '2026-06-13\n14:20:11', 'red'],
    ['禁用/恢复', '2026-06-13\n15:06:32', 'purple'],
  ];
  const eventRows = [
    ['2026-06-13 15:06:32', '恢复启用', '设备由禁用状态恢复为正常', '平台操作', '管理员', 'success'],
    ['2026-06-13 14:20:11', '设备禁用', '设备由正常状态变更为禁用', '平台操作', '管理员', 'danger'],
    ['2026-06-11 17:52:49', '进入休眠', '设备进入低功耗休眠状态', '设备上报', '系统', 'warn'],
    ['2026-06-11 15:16:48', 'P2P 异常告警', '设备 P2P 链路异常，无法连接', '平台策略', '系统', 'blue'],
    ['2024-04-26 10:35:28', '绑定主账号', '绑定主账号 18533644（王国胜）', '用户操作', '王国胜', 'blue'],
    ['2024-04-23 20:09:00', '设备激活成功', '设备完成激活，开始接入平台', '平台操作', '系统', 'success'],
    ['2024-04-23 20:00:00', '生产完成', '设备生产完成并通过质检', '生产系统', '自动化', 'blue'],
  ];
  const assetStages = [
    ['生产', '已完成', deviceInfo.productionTime, 'success', Activity],
    ['质检', '已通过', '2024-04-23 20:05:00', 'success', ShieldCheck],
    ['入库', '已入库', '2024-04-23 21:00:00', 'success', Database],
    ['出库', '已出库', '2024-04-24 09:20:00', 'muted', Layers],
    ['销售', '已售出', '2024-04-24 10:00:00', 'blue', Smartphone],
    ['维修/翻新/报废', '正常使用', '无维修记录', 'blue', Settings],
  ];
  const usageStages = [
    ['未激活', '已完成', '2024-04-22 20:00:00', 'success', AlertTriangle],
    ['已激活', '已完成', '2024-04-23 20:09:00', 'success', CheckCircle2],
    ['已绑定', '已完成', '2024-04-26 10:35:28', 'blue', Smartphone],
    ['运行中', '已完成', '2024-04-26 ~ 2026-06-11', 'success', Activity],
    ['离线/休眠', '运行中', '2026-06-11 17:52:40', 'warn', Flame],
    ['停用/解绑/退役', '未发生', '--', 'muted', Ban],
  ];
  const recentActions = [
    ['恢复启用', '管理员', '15:06:32', 'purple'],
    ['设备禁用', '管理员', '14:20:11', 'red'],
    ['查看设备履历', '管理员', '12:18:04', 'blue'],
    ['远程重启', '系统', '10:32:26', 'blue'],
    ['查看设备日志', '王国胜', '09:11:06', 'green'],
  ];
  const diagnosis = [
    ['信号强度', '-68 dBm', '优'],
    ['CPU 使用率', '24 %', '优'],
    ['内存使用率', '38 %', '优'],
    ['在线时长', '128 天', '良'],
  ];

  return (
    <div className="lifecycle-replica">
      <main className="lifecycle-replica-main">
        <section className="lifecycle-replica-card lifecycle-overview-card">
          <header className="lifecycle-section-title">
            <span />
            <strong>生命周期总览</strong>
            <small>当前综合阶段</small>
          </header>
          <div className="lifecycle-stage-cards">
            {stageCards.map(([label, value, tone, Icon]) => (
              <article className={`tone-${tone}`} key={label}>
                <span>{label}</span>
                <strong><Icon size={16} />{value}</strong>
              </article>
            ))}
          </div>
        </section>

        <section className="lifecycle-replica-card lifecycle-phase-card">
          <header className="lifecycle-section-title">
            <span />
            <strong>生命周期阶段轨迹</strong>
          </header>
          <div className="lifecycle-phase-line">
            {phaseNodes.map(([label, time, tone], index) => (
              <article className={`tone-${tone}`} key={label}>
                <b>{label}</b>
                <i>{index + 1}</i>
                <small>{time}</small>
              </article>
            ))}
          </div>
        </section>

        <section className="lifecycle-replica-card lifecycle-event-card">
          <header className="lifecycle-section-title">
            <span />
            <strong>关键事件时间线</strong>
          </header>
          <div className="lifecycle-event-list">
            {eventRows.map(([time, type, desc, source, operator, tone]) => (
              <article className={`tone-${tone}`} key={`${time}-${type}`}>
                <time>{time}</time>
                <strong>{type}</strong>
                <p>{desc}</p>
                <span>来源：{source}</span>
                <span>操作人：{operator}</span>
              </article>
            ))}
          </div>
        </section>

        <LifecycleStageStrip title="资产生命周期" items={assetStages} />
        <LifecycleStageStrip title="使用生命周期" items={usageStages} />

        <section className="lifecycle-summary-banner">
          <div>
            <span>当前综合阶段：</span>
            <strong>{currentStage}</strong>
            <p>设备已完成激活与绑定，当前处于低功耗休眠状态，系统将按策略自动唤醒并保持在线可管理。</p>
          </div>
          <div className="lifecycle-cube" aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
        </section>
      </main>

      <aside className="lifecycle-replica-sidebar">
        <section className="lifecycle-side-card">
          <strong>快捷操作</strong>
          {['追踪重点', '远程升级', '设备日志', '诊断工具'].map((action) => (
            <button type="button" key={action}><RefreshCw size={14} />{action}</button>
          ))}
          <button type="button">更多操作 <ChevronRight size={14} /></button>
        </section>

        <section className="lifecycle-side-card">
          <header>
            <strong>最近操作</strong>
            <button type="button">全部</button>
          </header>
          <div className="lifecycle-recent-actions">
            {recentActions.map(([action, operator, time, tone]) => (
              <article className={`tone-${tone}`} key={`${action}-${time}`}>
                <span>{action}<small>{operator}</small></span>
                <time>{time}</time>
              </article>
            ))}
          </div>
          <button className="text-link" type="button">查看更多</button>
        </section>

        <section className="lifecycle-side-card lifecycle-diagnosis-card">
          <strong>实时诊断</strong>
          <div className="lifecycle-sparkline" aria-hidden="true" />
          {diagnosis.map(([label, value, level]) => (
            <p key={label}>
              <span>{label}</span>
              <b>{value}</b>
              <em>{level}</em>
            </p>
          ))}
          <button className="text-link" type="button">查看更多</button>
        </section>
      </aside>
    </div>
  );
}

function LifecycleStageStrip({ title, items }) {
  return (
    <section className="lifecycle-replica-card lifecycle-strip-card">
      <header className="lifecycle-section-title">
        <span />
        <strong>{title}</strong>
      </header>
      <div className="lifecycle-strip-grid">
        {items.map(([label, status, time, tone, Icon]) => (
          <article className={`tone-${tone}`} key={`${title}-${label}`}>
            <span><Icon size={14} />{label}</span>
            <strong>{status}</strong>
            <small>{time}</small>
          </article>
        ))}
      </div>
    </section>
  );
}

function IterationFieldPanel({ title, items, compact = false, previewCount = 6 }) {
  const [expanded, setExpanded] = useState(compact);
  const meaningfulItems = items.filter(([, value]) => !['暂无数据', '暂未接入', '--'].includes(String(value)));
  const visibleItems = compact || expanded ? meaningfulItems : meaningfulItems.slice(0, previewCount);
  const hiddenCount = Math.max(meaningfulItems.length - visibleItems.length, 0);
  const contentId = `iteration-field-${title}`;

  return (
    <section className="iteration-field-panel">
      <div className="iteration-panel-heading">
        <span>{title}</span>
        {!compact && meaningfulItems.length > previewCount && (
          <button type="button" aria-expanded={expanded} aria-controls={contentId} onClick={() => setExpanded((open) => !open)}>
            {expanded ? '收起低频字段' : `更多信息 (${meaningfulItems.length - previewCount})`}
          </button>
        )}
      </div>
      <div id={contentId} className={cls('iteration-field-grid', compact && 'compact')}>
        {visibleItems.map(([label, value]) => (
          <div className="iteration-field" key={`${title}-${label}`}>
            <span>{label}</span>
            <strong className={cls(value === '禁用' || value === '受限' || value === '禁止' ? 'danger-text' : '')}>
              {value}
            </strong>
          </div>
        ))}
        {!compact && !expanded && hiddenCount > 0 && (
          <div className="iteration-field iteration-field-more">
            <span>已收起</span>
            <strong>{hiddenCount} 项低频字段</strong>
          </div>
        )}
      </div>
    </section>
  );
}

function MapView() {
  return (
    <section className="map-page">
      <h1>全国激活设备分布图</h1>
      <select aria-label="设备类型筛选">
        <option>全部</option>
        <option>IPC</option>
        <option>BK</option>
        <option>车载</option>
      </select>
      <div className="map-layout">
        <ChinaMapVisual />
        <aside className="ranking-panel">
          <p>设备激活总量：<strong>{formatNumber(14205701)}</strong></p>
          <p>未知 IP 设备：<span>{formatNumber(50255)}（0.35%）</span></p>
          <table>
            <thead>
              <tr>
                <th>排名</th>
                <th>省份</th>
                <th>设备激活数</th>
                <th>占比</th>
              </tr>
            </thead>
            <tbody>
              {mapRanking.map((item) => (
                <tr key={item.province}>
                  <td>{item.rank}</td>
                  <td>{item.province}</td>
                  <td>{formatNumber(item.count)}</td>
                  <td>{item.percent}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </aside>
      </div>
    </section>
  );
}

function ChinaMapVisual() {
  return (
    <div className="map-fallback">
      <div className="china-silhouette" aria-label="全国设备激活分布示意图">
        {provinceMapValues.slice(0, 31).map(([name, value], index) => (
          <span
            key={name}
            className={cls(value > 900000 && 'hot', value < 100000 && 'cool')}
            style={{ '--i': index }}
            title={`${name} ${formatNumber(value)}`}
          />
        ))}
      </div>
      <div className="map-scale">
        <span>高</span>
        <b />
        <span>低</span>
      </div>
    </div>
  );
}

function SideDrawer({ type, records, onClose }) {
  return (
    <div className="drawer-layer">
      <button className="drawer-scrim" onClick={onClose} aria-label="关闭抽屉" />
      <aside className="drawer">
        <div className="drawer-head">
          <h2>{type === 'p2p' ? '日志' : type === 'disableRecords' ? '设备使用状态日志' : '详情'}</h2>
          <button onClick={onClose} aria-label="关闭">
            <X size={22} />
          </button>
        </div>
        {type === 'disableRecords' ? (
          <DisableRecords records={records} />
        ) : (
          <div className="p2p-timeline">
            {p2pTimeline.map((item) => (
              <article key={`${item.time}-${item.userPid}`}>
                <span />
                <div>
                  <strong>{item.time}</strong>
                  <p>操作类型：{item.type}</p>
                  <p>用户PID：{item.userPid}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </aside>
    </div>
  );
}

function DisableRecords({ records }) {
  if (!records.length) {
    return (
      <div className="empty-records">
        <History size={44} />
        <strong>暂无禁用记录</strong>
        <span>禁用或恢复启用后，记录会展示在这里。</span>
      </div>
    );
  }

  const latest = records[0];
  const currentStatus = latest?.after || '正常';
  const statusTone = currentStatus === '禁用' ? 'disabled' : 'normal';

  return (
    <div className="audit-records">
      <section className={cls('current-audit-summary', statusTone)}>
        <div className="current-audit-main">
          <span>当前状态</span>
          <strong>{currentStatus}</strong>
        </div>
        <div className="current-audit-copy">
          <p>
            最近由 <b>{latest.operator}</b> 于 <b>{latest.time}</b> {latest.type}
          </p>
          <span>设备 {device.id}</span>
        </div>
      </section>
      <div className="audit-card-list">
        {records.map((record, index) => (
          <article className="audit-card" key={`${record.time}-${index}`}>
            <div className={cls('audit-node', record.type === '恢复启用' ? 'restore' : 'disable')}>
              {record.type === '恢复启用' ? <CheckCircle2 size={16} /> : <Ban size={15} />}
            </div>
            <div className="audit-card-body">
              <div className="audit-card-head">
                <div>
                  <span className={cls('audit-badge', record.type === '恢复启用' ? 'restore' : 'disable')}>
                    {record.type}
                  </span>
                  <strong className="status-flow">
                    <b>{record.before}</b>
                    <ChevronRight size={14} />
                    <b className={cls(record.after === '禁用' ? 'risk-status' : 'normal-status')}>{record.after}</b>
                  </strong>
                </div>
                <time>{record.time}</time>
              </div>
              <div className="audit-card-meta">
                <span>{record.type === '恢复启用' ? '恢复原因' : '禁用原因'}：<b>{record.reason}</b></span>
                <span>操作人：<b>{record.operator}</b></span>
              </div>
              {record.note && (
                <div className="audit-note">
                  <span>说明</span>
                  <p>{record.note}</p>
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function DataModal({ type, isDisabled, disableInfo, annotationMode, onDisable, onRestore, onClose }) {
  const [activeAnnotation, setActiveAnnotation] = useState(null);
  const modalAnnotationProps = {
    activeId: activeAnnotation,
    onToggle: (id) => setActiveAnnotation((current) => (current === id ? null : id)),
  };
  const title = {
    metadata: `设备元数据：${device.id}`,
    raw: '报警元数据',
    resources: '资源文件',
    power: `设备：${device.id}`,
    disableDevice: '禁用设备',
    restoreDevice: '恢复启用',
  }[type];

  return (
    <div className="modal-layer" onClick={() => setActiveAnnotation(null)}>
      <button className="modal-scrim" onClick={onClose} aria-label="关闭弹窗" />
      <section
        className={cls(
          'modal',
          type === 'power' && 'wide',
          (type === 'disableDevice' || type === 'restoreDevice') && 'soft-action-modal',
        )}
      >
        <div className="modal-head">
          <div className="modal-title-block">
            <h2>{title}</h2>
            {(type === 'disableDevice' || type === 'restoreDevice') && (
              <p>
                {type === 'disableDevice'
                  ? '禁用后将保留绑定关系和历史记录，后续可恢复启用'
                  : '恢复后设备将重新允许用户使用核心能力'}
              </p>
            )}
          </div>
          {type === 'restoreDevice' && (
            <div className="modal-shield">
              <ShieldCheck size={30} />
            </div>
          )}
          <button onClick={onClose} aria-label="关闭">
            <X size={21} />
          </button>
        </div>
        {type === 'metadata' && <JsonBlock data={device} />}
        {type === 'raw' && <JsonBlock data={alarmLogs[0].raw} />}
        {type === 'resources' && <ResourceFiles />}
        {type === 'power' && <PowerChart />}
        {type === 'disableDevice' && (
          <DisableDeviceModal
            annotationMode={annotationMode}
            annotationProps={modalAnnotationProps}
            onCancel={onClose}
            onConfirm={onDisable}
          />
        )}
        {type === 'restoreDevice' && (
          <RestoreDeviceModal
            annotationMode={annotationMode}
            annotationProps={modalAnnotationProps}
            disableInfo={disableInfo}
            onCancel={onClose}
            onConfirm={onRestore}
          />
        )}
      </section>
    </div>
  );
}

function DisableDeviceModal({ annotationMode, annotationProps, onCancel, onConfirm }) {
  const [selectedReason, setSelectedReason] = useState('');
  const [note, setNote] = useState('');
  const boundUser = boundUsers[0];
  const canSubmit = Boolean(selectedReason && note.trim());

  return (
    <div className="risk-modal-content">
      <section className="soft-form-card">
        <div className="risk-inline-head">
          <span className="risk-tag">高风险</span>
          <span>请核对设备对象，并填写本次处理依据。</span>
        </div>
        <dl className="device-confirm-grid compact">
          <div>
            <dt>设备编号</dt>
            <dd>{device.id}</dd>
          </div>
          <div>
            <dt>绑定用户</dt>
            <dd>{boundUser ? `${boundUser.role} ${boundUser.userId}` : '暂无绑定用户'}</dd>
          </div>
          <div>
            <dt>最近心跳</dt>
            <dd>{device.p2p.lastWakeTime}</dd>
          </div>
        </dl>

        <section className="impact-panel" aria-label="禁用影响">
          <div className="impact-title">
            <AlertTriangle size={16} />
            <strong>禁用后影响</strong>
          </div>
          <ul className="impact-list">
            <li>用户将无法使用实时预览、远程控制、配置下发和告警推送等核心能力。</li>
            <li>系统会保留当前绑定关系、历史记录、告警记录和操作审计。</li>
            <li>禁用不会自动解绑用户，也不会自动处理退款、延期或补偿。</li>
          </ul>
        </section>

        <label className="form-field">
          <span><b>*</b> 禁用原因 {annotationMode && <AnnotationDot id="05" markerKey="05-disable-reason" {...annotationProps} />}</span>
          <select value={selectedReason} onChange={(event) => setSelectedReason(event.target.value)}>
            <option value="">请选择禁用原因</option>
            {disableReasons.map((reason) => (
              <option key={reason.label} value={reason.label}>{reason.label}</option>
            ))}
          </select>
        </label>

        <label className="form-field">
          <span><b>*</b> 处理依据 / 备注 {annotationMode && <AnnotationDot id="05" markerKey="05-disable-note" {...annotationProps} />}</span>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="请填写本次处理依据，例如客户申请说明、异常记录、设备清单或复核结论"
            rows={4}
          />
          <small className="field-helper">建议写清楚来源、判断依据和处理结论，方便后续追溯。</small>
        </label>
      </section>
      <div className="modal-actions">
        <button className="secondary-action" onClick={onCancel}>取消</button>
        <button className="danger-action" disabled={!canSubmit} onClick={() => onConfirm({ reason: selectedReason, note: note.trim() })}>确认禁用</button>
      </div>
    </div>
  );
}

function RestoreDeviceModal({ annotationMode, annotationProps, disableInfo, onCancel, onConfirm }) {
  const [selectedReason, setSelectedReason] = useState('');
  const [note, setNote] = useState('');
  const canSubmit = Boolean(selectedReason && note.trim());

  return (
    <div className="risk-modal-content">
      {disableInfo && (
        <div className="restore-context">
          <span>当前禁用原因</span>
          <strong>{disableInfo.reason}</strong>
          <span>{disableInfo.time} · {disableInfo.operator}</span>
        </div>
      )}
      <label className="form-field">
        <span><b>*</b> 恢复原因 {annotationMode && <AnnotationDot id="05" markerKey="05-restore-reason" {...annotationProps} />}</span>
        <select value={selectedReason} onChange={(event) => setSelectedReason(event.target.value)}>
          <option value="">请选择恢复原因</option>
          {restoreReasons.map((reason) => (
            <option key={reason} value={reason}>{reason}</option>
          ))}
        </select>
      </label>
      <label className="form-field">
        <span><b>*</b> 恢复说明 {annotationMode && <AnnotationDot id="05" markerKey="05-restore-note" {...annotationProps} />}</span>
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="请输入恢复说明，例如设备找回、纠纷解除或复核通过说明"
          rows={3}
        />
      </label>
      <div className="modal-actions">
        <button className="secondary-action" onClick={onCancel}>取消</button>
        <button className="primary-action" disabled={!canSubmit} onClick={() => onConfirm({ reason: selectedReason, note: note.trim() })}>确认恢复启用</button>
      </div>
    </div>
  );
}

function PowerChart() {
  const option = {
    grid: { top: 28, left: 46, right: 20, bottom: 54 },
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: powerActivity.map(([time]) => time), axisLabel: { color: '#98a2b3', fontSize: 11 } },
    yAxis: { type: 'value', max: 10, axisLabel: { color: '#98a2b3' }, splitLine: { lineStyle: { color: '#e8edf6', type: 'dashed' } } },
    series: [{ type: 'bar', data: powerActivity.map(([, value]) => value), barWidth: 16, itemStyle: { color: '#1f6fff', borderRadius: [3, 3, 0, 0] } }],
    dataZoom: [{ type: 'slider', height: 10, bottom: 16, showDetail: false, brushSelect: false }],
  };

  return (
    <div className="power-modal-content">
      <div className="modal-filters">
        <button>7天</button>
        <button disabled>2026-06-05 - 2026-06-11</button>
      </div>
      <div className="section-heading">
        <span />
        电量（KW）
      </div>
      <EmptyGraph label="暂无数据" />
      <div className="section-heading">
        <span />
        活跃（次）
      </div>
      <Suspense fallback={<div className="chart-loading">图表加载中</div>}>
        <ReactECharts option={option} className="activity-chart" />
      </Suspense>
    </div>
  );
}

function ResourceFiles() {
  return (
    <div className="resource-list">
      {['人体侦测截图-09:52:41.jpg', '人体侦测截图-09:51:54.jpg'].map((name) => (
        <article key={name}>
          <Camera size={22} />
          <div>
            <strong>{name}</strong>
            <span>图片资源，已生成临时访问链接</span>
          </div>
          <button>预览</button>
        </article>
      ))}
    </div>
  );
}

function EmptyGraph({ label }) {
  return (
    <div className="empty-graph">
      <FileClock size={56} />
      <span>{label}</span>
    </div>
  );
}

function JsonBlock({ data }) {
  return <pre className="json-block">{JSON.stringify(data, null, 2)}</pre>;
}

function DataTable({ columns, rows, caption, emptyTitle = '暂无数据', emptyDescription = '当前没有可展示的数据。' }) {
  if (!rows.length) {
    return (
      <div className="empty-table-state" role="status">
        <FileClock size={38} />
        <strong>{emptyTitle}</strong>
        <span>{emptyDescription}</span>
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table className="data-table">
        {caption && <caption>{caption}，共 {rows.length} 条</caption>}
        <thead>
          <tr>{columns.map((column) => <th key={column}>{column}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => <td key={`${rowIndex}-${cellIndex}`}>{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Pagination() {
  return (
    <div className="pagination">
      <span>共 220 条</span>
      <button>10条/页</button>
      <button disabled>
        <ChevronLeft size={14} />
      </button>
      {[1, 2, 3, 4, 5, 6].map((page) => (
        <button key={page} className={page === 1 ? 'active' : ''}>
          {page}
        </button>
      ))}
      <span>...</span>
      <button>22</button>
      <button>
        <ChevronRight size={14} />
      </button>
      <span>前往</span>
      <button>1</button>
      <span>页</span>
    </div>
  );
}

function FactGroup({ title, children }) {
  return (
    <div className="fact-group">
      <div className="section-heading">
        <span />
        {title}
      </div>
      <div className="fact-grid">{children}</div>
    </div>
  );
}

function Fact({ label, value, className }) {
  return (
    <div className={cls('fact', className)}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function InfoLine({ icon: Icon, label, value }) {
  return (
    <div className="info-line">
      <span>
        <Icon size={15} />
        {label}
      </span>
      <strong>{value}</strong>
    </div>
  );
}

export default App;
