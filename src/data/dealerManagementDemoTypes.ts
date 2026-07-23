export type Dealer = {
  id: string;
  name: string;
  level: '一级' | '二级' | '三级';
  parentId: string;
  parentName?: string;
  status: 'normal' | 'disabled';
  deviceTotalCount: number;
  testEnabled: boolean;
  testAccountOpened: boolean;
  testingDeviceCount: number;
  abnormalDeviceCount: number;
  testAccountCount: number;
  latestTestAt?: string;
};

export type TestAccount = {
  id: string;
  dealerId: string;
  userId: string;
  accountName: string;
  accountSource: '关联已有用户中心账号' | '创建新用户中心账号' | '设备中心创建';
  region: '中国' | '亚洲' | '北美' | '欧洲';
  clientName: string;
  clientId: string;
  currentTestingDeviceCount: number;
  applyReason: string;
  createdAt: string;
};

export type TestRecord = {
  id: string;
  dealerId: string;
  accountId: string;
  userId: string;
  accountName: string;
  deviceSn: string;
  deviceModel: string;
  deviceType: 'Wi-Fi' | '4G' | '有线';
  status: 'testing' | 'cleaned' | 'clean_failed';
  startedAt: string;
  endedAt?: string;
  endReason?: '主动解绑' | '账号停用' | '账号过期' | '权限撤销' | '平台手动清理' | '绑定失败补偿';
  cleanResult?: 'success' | 'failed';
  failReason?: string;
  latestCleanAt?: string;
};

export type OperationLog = {
  id: string;
  dealerId: string;
  dealerName: string;
  accountId?: string;
  userId?: string;
  accountName?: string;
  deviceSn?: string;
  actionType:
    | '创建App测试账号'
    | '停用App测试账号'
    | '延期App测试账号'
    | '测试绑定成功'
    | '主动解绑'
    | '自动清理'
    | '手动清理'
    | '重试清理'
    | '清理失败';
  source: '管理后台' | 'APP' | '定时任务' | '系统模拟';
  creator?: string;
  operator: string;
  result: '成功' | '失败';
  failReason?: string;
  remark?: string;
  createdAt: string;
};
