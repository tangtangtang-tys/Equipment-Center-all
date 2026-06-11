import React, { lazy, Suspense, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  BellRing,
  Box,
  Camera,
  Car,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Cloud,
  Cpu,
  Database,
  FileClock,
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

function App() {
  const [view, setView] = useState('search');
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState(MAIN_TABS[0]);
  const [logTab, setLogTab] = useState('登录日志');
  const [drawer, setDrawer] = useState(null);
  const [modal, setModal] = useState(null);

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
            />
          )}
          {view === 'map' && <MapView />}
        </main>
      </div>

      {drawer && <SideDrawer type={drawer} onClose={() => setDrawer(null)} />}
      {modal && <DataModal type={modal} onClose={() => setModal(null)} />}
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
          className={cls('side-item', view !== 'map' && 'active')}
          onClick={() => onNavigate('search')}
        >
          <Search size={16} />
          设备查询
        </button>
        <button className={cls('side-item', view === 'map' && 'active')} onClick={() => onNavigate('map')}>
          <MapPin size={17} />
          设备地图
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

function DetailView({ activeTab, setActiveTab, logTab, setLogTab, onBack, onDrawer, onModal }) {
  return (
    <section className="detail-page">
      <button className="backline" onClick={onBack}>
        <ChevronLeft size={16} />
        设备详情
      </button>

      <DeviceHero onModal={onModal} />

      <section className="tab-card">
        <div className="tabs">
          {MAIN_TABS.map((tab) => (
            <button key={tab} className={cls(activeTab === tab && 'active')} onClick={() => setActiveTab(tab)}>
              {tab}
            </button>
          ))}
        </div>
        <div className="tab-content">
          {activeTab === '添加该设备的用户' && <UsersPanel />}
          {activeTab === '增值服务' && <ServicesPanel />}
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

function DeviceHero({ onModal }) {
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
        <FactGroup title="设备信息">
          <Fact label="使用WIFI" value="否" />
          <Fact label="服务大区" value={<span>中国大区 <button className="text-icon">编辑</button></span>} />
          <Fact
            label={
              <span className="label-help">
                设备可用状态 <CircleHelp size={13} />
              </span>
            }
            value={
              <span className="inline-tags">
                <span className="pill green">运行中</span>
                <span className="danger-text">禁用</span>
              </span>
            }
          />
          <Fact label="使用TF卡" value="否" />
          <Fact label="IMEI" value={device.imei} />
          <Fact label="设备型号" value={device.model} />
        </FactGroup>

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

function UsersPanel() {
  return (
    <div className="users-panel">
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
      <div className="diagnosis-note">
        <AlertTriangle size={18} />
        <span>若用户反馈 App 看不到设备，可输入用户ID核对是否属于主账号或共享账号。</span>
      </div>
    </div>
  );
}

function ServicesPanel() {
  return (
    <div className="service-grid">
      {services.map((service, index) => {
        const Icon = serviceIcons[index % serviceIcons.length];
        return (
          <article className="service-card" key={service.id}>
            <Icon size={30} />
            <div>
              <strong>{service.name}</strong>
              <span>未开通</span>
            </div>
          </article>
        );
      })}
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

function SideDrawer({ type, onClose }) {
  return (
    <div className="drawer-layer">
      <button className="drawer-scrim" onClick={onClose} aria-label="关闭抽屉" />
      <aside className="drawer">
        <div className="drawer-head">
          <h2>{type === 'p2p' ? '日志' : '详情'}</h2>
          <button onClick={onClose} aria-label="关闭">
            <X size={22} />
          </button>
        </div>
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
      </aside>
    </div>
  );
}

function DataModal({ type, onClose }) {
  const title = {
    metadata: `设备元数据：${device.id}`,
    raw: '报警元数据',
    resources: '资源文件',
    power: `设备：${device.id}`,
  }[type];

  return (
    <div className="modal-layer">
      <button className="modal-scrim" onClick={onClose} aria-label="关闭弹窗" />
      <section className={cls('modal', type === 'power' && 'wide')}>
        <div className="modal-head">
          <h2>{title}</h2>
          <button onClick={onClose} aria-label="关闭">
            <X size={21} />
          </button>
        </div>
        {type === 'metadata' && <JsonBlock data={device} />}
        {type === 'raw' && <JsonBlock data={alarmLogs[0].raw} />}
        {type === 'resources' && <ResourceFiles />}
        {type === 'power' && <PowerChart />}
      </section>
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

function DataTable({ columns, rows }) {
  return (
    <div className="table-wrap">
      <table className="data-table">
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

function Fact({ label, value }) {
  return (
    <div className="fact">
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
