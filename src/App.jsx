import React, { lazy, Suspense, useRef, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Ban,
  BellRing,
  Box,
  Camera,
  Car,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Cloud,
  Cpu,
  Database,
  Download,
  FileClock,
  Filter,
  Flame,
  Gauge,
  HardDrive,
  History,
  Layers,
  LocateFixed,
  LockKeyhole,
  MapPin,
  Menu,
  MonitorCog,
  Info,
  RadioTower,
  RefreshCw,
  Search,
  ShieldCheck,
  Smartphone,
  SquareStack,
  UserRound,
  WifiOff,
  X,
} from 'lucide-react';
import {
  alarmLogs,
  boundUsers,
  device,
  deviceSamples,
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
const ITERATION_TABS = ['基础信息', '绑定用户', '设备状态', '增值服务', '日志记录', '物联网卡', '设备履历'];
const ITERATION_LOG_TABS = ['登录日志', '重置记录', '报警日志', '低功耗日志', '操作日志'];

const serviceIcons = [
  Activity,
  BellRing,
  Camera,
  Car,
  Cloud,
  SquareStack,
  Database,
  HardDrive,
  Gauge,
  Cpu,
  RadioTower,
  ShieldCheck,
  UserRound,
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
  return [
    {
      title: '身份信息',
      items: [
        ['设备ID', deviceInfo.id],
        ['设备型号', deviceInfo.model],
        ['机型型号', deviceInfo.modelCode],
        ['产品线', deviceInfo.productLine],
        ['SN / 序列号', '暂无数据'],
        ['UUID', '暂无数据'],
        ['IMEI', deviceInfo.imei],
        ['ICCID', simCards[0]?.number || '暂无数据'],
        ['MAC', '暂无数据'],
      ],
    },
    {
      title: '产品与能力',
      items: [
        ['连接类型', deviceInfo.connectType],
        ['网络类型', deviceInfo.usesWifi ? 'Wi-Fi' : '4G'],
        ['电量类型', deviceInfo.connectType.includes('低功耗') ? '电池供电' : '市电供电'],
        ['是否低功耗', deviceInfo.connectType.includes('低功耗') ? '是' : '否'],
        ['是否支持TF卡', deviceInfo.usesTfCard ? '是' : '否'],
        ['当前固件版本', deviceInfo.firmware],
      ],
    },
    {
      title: '生产信息',
      items: [
        ['生产工厂', deviceInfo.factory],
        ['生产时间', deviceInfo.productionTime],
        ['生产批次', '暂未接入'],
      ],
    },
    {
      title: '激活与归属',
      items: [
        ['激活状态', deviceInfo.activated ? '已激活' : '未激活'],
        ['激活时间', deviceInfo.activationTime],
        ['归属组织', deviceInfo.organization],
        ['经销商', '中性'],
        ['服务大区', deviceInfo.region],
        ['所在地', deviceInfo.location],
      ],
    },
    {
      title: '可用与限制状态',
      items: [
        ['设备可用状态', deviceInfo.disabled ? '禁用' : '正常'],
        ['MQTT / TCP 拉黑状态', '未拉黑'],
        ['影子拉黑状态', '未拉黑'],
        ['移动推送受限', deviceInfo.mobilePushPermission],
        ['最近状态变更', deviceInfo.disabled ? defaultDisableRecords[0]?.time || '暂无记录' : '暂无记录'],
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
  const p2pTone = deviceInfo.p2p.status === '在线' ? 'normal' : deviceInfo.p2p.status === '未接入' ? 'muted' : 'danger';
  const runTone = deviceInfo.p2p.lowPowerStatus === '在线' ? 'normal' : deviceInfo.p2p.lowPowerStatus === '休眠' ? 'warn' : 'muted';

  return [
    {
      key: 'lifecycle',
      label: '设备生命周期',
      value: deviceInfo.activated ? '已激活' : '未激活',
      desc: `激活时间：${deviceInfo.activationTime}`,
      tone: deviceInfo.activated ? 'normal' : 'muted',
      icon: CheckCircle2,
    },
    {
      key: 'runtime',
      label: '运行状态',
      value: deviceInfo.p2p.lowPowerStatus,
      desc: `最近心跳：${deviceInfo.p2p.lastWakeTime}`,
      tone: runTone,
      icon: Activity,
    },
    {
      key: 'p2p',
      label: 'P2P 状态',
      value: deviceInfo.p2p.status === '在线' ? '正常' : deviceInfo.p2p.status === '获取失败' ? '异常' : deviceInfo.p2p.status,
      desc: `最近在线：${deviceInfo.p2p.lastWakeTime}`,
      tone: p2pTone,
      icon: ShieldCheck,
    },
    {
      key: 'mqtt',
      label: 'MQTT 状态',
      value: deviceInfo.disabled ? '正常' : '正常',
      desc: '延迟：32ms',
      tone: 'normal',
      icon: RadioTower,
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
  const productTypeMap = {
    IPC: 'IPC 摄像机',
    BK: 'BK 电池设备',
    NVR: 'NVR 录像机',
    车载: '车载设备',
  };
  const powerType = deviceInfo.connectType.includes('低功耗') ? '低功耗' : '长电';
  const networkType = deviceInfo.connectType.includes('4G')
    ? '4G'
    : deviceInfo.connectType.includes('以太网')
      ? '有线网络'
      : deviceInfo.usesWifi
        ? 'Wi-Fi'
        : '4G';

  return {
    productType: productTypeMap[deviceInfo.productLine] || `${deviceInfo.productLine || '通用'} 设备`,
    powerType,
    networkType,
    firmware: deviceInfo.firmware,
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
    绑定用户: {
      icon: UserRound,
      eyebrow: 'Binding',
      title: '绑定用户',
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
              <Fact label="服务大区" value={<span>中国大区 <button className="text-icon">编辑</button></span>} />
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
  const recentOperations = iterationOperationLogs.slice(0, 3);

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
        <IterationRiskStrip deviceInfo={deviceInfo} />
        <IterationQuickFacts deviceInfo={deviceInfo} />

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
              {activeTab === '绑定用户' && <IterationBoundUsers deviceInfo={deviceInfo} />}
              {activeTab === '设备状态' && <IterationDeviceStatus deviceInfo={deviceInfo} />}
              {activeTab === '增值服务' && <IterationServices deviceInfo={deviceInfo} />}
              {activeTab === '日志记录' && <IterationLogs deviceInfo={deviceInfo} logTab={logTab} setLogTab={setLogTab} />}
              {activeTab === '物联网卡' && <IterationSim />}
              {activeTab === '设备履历' && <IterationLifecycle deviceInfo={deviceInfo} />}
            </IterationModuleShell>
          </div>
        </section>

        <section className="iteration-recent-strip" aria-label="最近操作">
          <div className="iteration-recent-head">
            <span>最近操作</span>
            <strong>{recentOperations.length} 条</strong>
          </div>
          <div className="iteration-recent-list">
            {recentOperations.map((log) => (
              <article key={`${log.time}-${log.type}`}>
                <time>{log.time}</time>
                <strong>{log.type}</strong>
                <span>{log.result}</span>
              </article>
            ))}
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

  return (
    <section className="iteration-summary">
      <div className="iteration-summary-hero">
        <div className="iteration-identity-block">
          <DeviceVisual deviceInfo={deviceInfo} />
          <div className="iteration-identity-main">
            <div className="iteration-identity-title">
              <span className="overview-label">设备ID</span>
              <h2>{deviceInfo.id}</h2>
            </div>
            <div className="iteration-primary-meta" aria-label="设备主身份">
              <span className={`network-${identitySummary.networkType}`}>{identitySummary.networkType}</span>
              <span className={`power-${identitySummary.powerType}`}>{identitySummary.powerType}</span>
              <span className={`line-${deviceInfo.productLine}`}>{identitySummary.productType}</span>
            </div>
            <div className="iteration-meta-row">
              <span>型号：<strong>{deviceInfo.modelCode}</strong></span>
              <span>产品线：<strong>{deviceInfo.productLine}</strong></span>
              <span>固件版本：<strong>{identitySummary.firmware}</strong></span>
              <span>IMEI：<strong>{deviceInfo.imei}</strong></span>
              <span>ICCID：<strong>{simCards[0]?.number || '--'}</strong></span>
              <span>设备地区：<strong>{deviceInfo.region}</strong></span>
              <span>SN：<strong>{simCards[0]?.number || '--'}</strong></span>
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
  const priorityGroups = groups.slice(0, 2);
  const secondaryGroups = groups.slice(2);

  return (
    <div className="iteration-section-stack iteration-basic-layout">
      <div className="iteration-priority-fields">
        {priorityGroups.map((group) => (
          <IterationFieldPanel key={group.title} title={group.title} items={group.items} previewCount={6} />
        ))}
      </div>
      <div className="iteration-secondary-fields">
        {secondaryGroups.map((group) => (
          <IterationFieldPanel key={group.title} title={group.title} items={group.items} previewCount={6} />
        ))}
      </div>
    </div>
  );
}

function IterationBoundUsers({ deviceInfo }) {
  return (
    <div className="iteration-section-stack">
      {deviceInfo.disabled && (
        <div className="iteration-inline-note warning">
          <AlertTriangle size={16} />
          <span>设备当前处于禁用状态，绑定关系保留，但实时预览、远程控制、配置下发和告警推送等核心能力受限。</span>
        </div>
      )}
      <div className="iteration-user-grid">
        {(deviceInfo.activated ? boundUsers : []).map((user) => (
          <article className="iteration-user-card" key={user.id}>
            <span className="user-avatar">{user.avatar}</span>
            <div>
              <div className="user-title">
                <strong>{user.id}</strong>
                <span className="pill blue">{user.role}</span>
              </div>
              <dl className="iteration-mini-dl">
                <div>
                  <dt>用户ID</dt>
                  <dd>{user.userId}</dd>
                </div>
                <div>
                  <dt>推送状态</dt>
                  <dd>{user.push}</dd>
                </div>
                <div>
                  <dt>添加时间</dt>
                  <dd>{user.addedAt}</dd>
                </div>
              </dl>
            </div>
          </article>
        ))}
        {!deviceInfo.activated && (
          <div className="iteration-empty-brief">设备未激活，暂无绑定用户。</div>
        )}
      </div>
    </div>
  );
}

function IterationDeviceStatus({ deviceInfo }) {
  const statusGroups = getIterationStatusGroups(deviceInfo);

  return (
    <div className="iteration-section-stack iteration-runtime-layout">
      <div className="iteration-status-overview">
        <div>
          <span>P2P UID</span>
          <strong>{deviceInfo.p2p.uid}</strong>
        </div>
        <div>
          <span>当前运行态</span>
          <strong>{deviceInfo.p2p.lowPowerStatus}</strong>
        </div>
        <div>
          <span>最近心跳</span>
          <strong>{deviceInfo.p2p.lastWakeTime}</strong>
        </div>
      </div>
      {statusGroups.map((group) => (
        <IterationFieldPanel key={group.title} title={group.title} items={group.items} compact />
      ))}
      <div className="iteration-inline-note">
        <WifiOff size={16} />
        <span>{deviceInfo.p2p.status === '在线' ? '设备在线，仍可结合心跳和日志确认最近运行情况。' : 'P2P 状态异常，需结合低功耗、心跳和网络记录判断。'}</span>
      </div>
    </div>
  );
}

function IterationServices({ deviceInfo }) {
  const activeServices = services.map((service, index) => ({
    ...service,
    status: index === 1 ? '有效中 · 历史录像可查看' : '未开通',
  })).filter((service) => service.status !== '未开通');

  return (
    <div className="iteration-section-stack iteration-service-layout">
      {deviceInfo.disabled && (
        <div className="iteration-inline-note">
          <Cloud size={16} />
          <span>禁用期间不可新增购买或续费；已有订单不自动退款、延期或转移。</span>
        </div>
      )}
      <div className="iteration-service-summary">
        <div>
          <span>已开通</span>
          <strong>1</strong>
        </div>
        <div>
          <span>未开通</span>
          <strong>{services.length - 1}</strong>
        </div>
        <div>
          <span>服务影响</span>
          <strong>{deviceInfo.disabled ? '使用受限' : '正常'}</strong>
        </div>
      </div>
      <div className="iteration-service-grid">
        {activeServices.map((service) => {
          const originalIndex = services.findIndex((item) => item.id === service.id);
          const Icon = serviceIcons[originalIndex % serviceIcons.length];
          return (
            <article className="iteration-service-card active" key={service.id}>
              <Icon size={22} />
              <div>
                <strong>{service.name}</strong>
                <span>{service.status}</span>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function IterationLogs({ deviceInfo, logTab, setLogTab }) {
  const activeLogIndex = ITERATION_LOG_TABS.indexOf(logTab);
  const logRowsByTab = {
    登录日志: loginLogs.map((log) => [log.time, log.status, log.ip, log.version]),
    重置记录: resetLogs.map((log) => [log.time, deviceInfo.id]),
    报警日志: alarmLogs.slice(0, 8).map((log) => [log.beijing, log.action, log.battery, '只有图片']),
    低功耗日志: p2pTimeline.map((log) => [log.time, log.type, log.userPid]),
    操作日志: iterationOperationLogs.map((log) => [
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
    重置记录: ['重置时间', '设备ID'],
    报警日志: ['北京时间', '设备动作', '电量', '资源情况'],
    低功耗日志: ['时间', '操作类型', '用户PID'],
    操作日志: ['操作时间', '操作类型', '操作人', '对象', '结果', '来源'],
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
        <DataTable
          caption={`${logTab}列表`}
          columns={activeColumns}
          rows={activeRows}
          emptyTitle="暂无日志记录"
          emptyDescription="当前筛选条件下没有匹配日志，可切换日志类型或刷新后重试。"
        />
      </div>
    </div>
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
  const lifecycleFlow = [
    ['生产', '完成', deviceInfo.productionTime, 'done'],
    ['激活', deviceInfo.activated ? '完成' : '未发生', deviceInfo.activationTime, deviceInfo.activated ? 'done' : 'muted'],
    ['绑定', deviceInfo.activated ? '完成' : '未发生', deviceInfo.activated ? boundUsers[0]?.addedAt || '--' : '--', deviceInfo.activated ? 'done' : 'muted'],
    ['运行 / 休眠', '当前', deviceInfo.p2p.lowPowerStatus, deviceInfo.p2p.status === '在线' ? 'done' : 'current'],
    ['告警', deviceInfo.activated ? '有记录' : '暂无', deviceInfo.activated ? alarmLogs[0]?.beijing || '--' : '--', deviceInfo.activated ? 'warn' : 'muted'],
    ['禁用 / 恢复', deviceInfo.disabled ? '已发生' : '未发生', deviceInfo.disabled ? defaultDisableRecords[0]?.time || '--' : '--', deviceInfo.disabled ? 'done' : 'muted'],
  ];

  const lifecycleEvents = deviceInfo.activated
    ? iterationLifecycleEvents.map(([time, type, desc]) => {
      if (type === '生产') return [deviceInfo.productionTime, type, desc];
      if (type === '激活') return [deviceInfo.activationTime, type, desc];
      return [time, type, desc];
    })
    : [
      [deviceInfo.productionTime, '生产', '设备生产完成，工厂信息已记录。'],
      ['--', '激活', '设备尚未激活。'],
    ];

  return (
    <div className="iteration-lifecycle">
      <section className="iteration-lifecycle-current">
        <div>
          <span>当前综合阶段</span>
          <strong>{deviceInfo.activated ? `已激活 · ${deviceInfo.p2p.lowPowerStatus}` : '未激活'}</strong>
        </div>
        <div>
          <span>主要判断依据</span>
          <strong>激活时间、绑定记录、最近心跳、操作日志</strong>
        </div>
      </section>

      <section className="iteration-lifecycle-flow" aria-label="设备生命周期节点">
        {lifecycleFlow.map(([name, status, time, tone], index) => (
          <div className={cls('iteration-flow-step', `tone-${tone}`)} key={name}>
            <div className="iteration-flow-dot">{index + 1}</div>
            <div>
              <strong>{name}</strong>
              <span>{status}</span>
              <small>{time}</small>
            </div>
          </div>
        ))}
      </section>

      <div className="iteration-track-grid">
        {getIterationLifecycleTracks(deviceInfo).map((track) => (
          <article className="iteration-track" key={track.title}>
            <div className="iteration-track-head">
              <div>
                <h3>{track.title}</h3>
                <p>{track.desc}</p>
              </div>
              <span>{track.current}</span>
            </div>
            <div className="iteration-track-nodes">
              {track.nodes.map(([name, status, time]) => (
                <div className={cls('iteration-track-node', status === '当前' && 'current')} key={`${track.title}-${name}`}>
                  <b>{name}</b>
                  <span>{status}</span>
                  <small>{time}</small>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>

      <section className="iteration-event-timeline">
        <div className="section-heading">
          <span />
          关键事件时间线
        </div>
        {lifecycleEvents.map(([time, type, desc]) => (
          <article key={`${time}-${type}`}>
            <time>{time}</time>
            <strong>{type}</strong>
            <p>{desc}</p>
          </article>
        ))}
      </section>
    </div>
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
