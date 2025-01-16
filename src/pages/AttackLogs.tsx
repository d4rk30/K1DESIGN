// 1. 引入
import React, { useState, useEffect, useMemo } from 'react';
import { Card, Table, Button, Space, Form, Row, Col, Modal, message, Typography, Tag, Drawer, Input } from 'antd';
import { StarOutlined, StarFilled, SearchOutlined, ReloadOutlined, SaveOutlined, ExportOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import AttackTrendCard from '@/components/AttackTrendCard';
import LabelSelect from '@/components/LabelSelect';
import LabelInput from '@/components/LabelInput';
import LabelCascader from '@/components/LabelCascader';
import { US, CN, GB, FR, DE } from 'country-flag-icons/react/3x2';

// 2. 类型定义
// 定义筛选条件的类型
interface FilterValues {
  intelType?: string;  // 情报类型
  intelSource?: string; // 情报源
  action?: string;      // 处理动作
  attackIp?: string;    // 攻击IP
  targetIp?: string;    // 被攻击IP
  location?: string[];   // 归属地
}

// 定义保存的筛选条件的类型
interface SavedFilter {
  id: string;           // 筛选条件的唯一标识符
  name: string;         // 筛选条件的名称
  conditions: FilterValues; // 筛选条件的具体内容
  createTime: string;   // 创建时间
}

// 定义攻击日志数据的接口
interface AttackLog {
  key: string;
  time: string;
  attackIp: string;
  location: string;
  targetIp: string;
  targetPort: string;
  intelType: string;
  threatLevel: string;
  action: string;
  intelSource: string;
  lastAttackUnit: string;
  requestInfo: {
    protocol: string;
    url: string;
    dnsName: string;
    headers: {
      'User-Agent': string;
      'Accept': string;
      'Content-Type': string;
      'X-Forwarded-For': string;
      'Host': string;
      'Connection': string;
      'Accept-Encoding': string;
      'Accept-Language': string;
    };
    body: {
      payload: string;
      size: string;
      type: string;
      timestamp: string;
    };
  };
  responseInfo: {
    headers: {
      'Content-Type': string;
      'Server': string;
      'Date': string;
      'Content-Length': string;
    };
    statusCode: number;
    body: {
      status: number;
      message: string;
      data: string;
    };
  };
  localVerification: {
    ruleName: string;
    protocolNumber: string;
    protocolType: string;
    attackType: string;
    malformedPacketLength: number;
    attackFeatures: string;
  };
}

// 4. Mock数据和常量
const MOCK_DATA_CONFIG = {
  locations: [
    '中国|北京',
    '中国|上海',
    '中国|广州',
    '中国|深圳',
    '中国|杭州',
    '美国|纽约',
    '美国|洛杉矶',
    '英国|伦敦',
    '法国|巴黎',
    '德国|柏林'
  ],
  intelTypes: ['僵尸网络', '恶意软件', 'DDoS攻击', '漏洞利用', '暴力破解', '钓鱼攻击'],
  threatLevels: ['高危', '中危', '低危'],
  actions: ['阻断', '监控'],
  intelSources: ['公有情报源', '私有情报源', '第三方情报源', '自建情报源'],
};

const generateMockData = (): AttackLog[] => {
  // 从给定数组中随机选择一个元素
  const getRandomItem = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
  // 生成一个在指定范围内的随机整数
  const getRandomNumber = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
  // 生成一个随机的IP地址，格式为 "x.x.x.x"
  const getRandomIp = () => Array.from({ length: 4 }, () => getRandomNumber(0, 255)).join('.');

  return Array.from({ length: 100 }, (_, index) => ({
    key: String(index + 1),
    time: dayjs().subtract(getRandomNumber(0, 24), 'hour').format('YYYY-MM-DD HH:mm:ss'),
    attackIp: getRandomIp(),
    location: getRandomItem(MOCK_DATA_CONFIG.locations),
    targetIp: `192.168.${getRandomNumber(0, 255)}.${getRandomNumber(0, 255)}`,
    targetPort: String(getRandomNumber(0, 65535)),
    intelType: getRandomItem(MOCK_DATA_CONFIG.intelTypes),
    threatLevel: getRandomItem(MOCK_DATA_CONFIG.threatLevels),
    action: getRandomItem(MOCK_DATA_CONFIG.actions),
    intelSource: getRandomItem(MOCK_DATA_CONFIG.intelSources),
    lastAttackUnit: getRandomNumber(0, 1) ? `${getRandomNumber(1, 24)}小时前` : `${getRandomNumber(1, 60)}分钟前`,
    requestInfo: {
      protocol: ['http', 'https', 'dns', 'ftp', 'smtp'][Math.floor(Math.random() * 5)],
      url: `example.com/api/endpoint/${Math.floor(Math.random() * 1000)}`,
      dnsName: `subdomain${Math.floor(Math.random() * 100)}.example.com`,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Forwarded-For': `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`,
        'Host': 'example.com',
        'Connection': 'keep-alive',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      },
      body: {
        payload: 'Base64编码的请求内容...',
        size: Math.floor(Math.random() * 1000) + 'bytes',
        type: ['SQL注入', 'XSS攻击', '命令注入', 'WebShell'][Math.floor(Math.random() * 4)],
        timestamp: new Date().toISOString()
      }
    },
    responseInfo: {
      headers: {
        'Content-Type': 'application/json',
        'Server': 'nginx/1.18.0',
        'Date': new Date().toUTCString(),
        'Content-Length': String(Math.floor(Math.random() * 1000))
      },
      statusCode: [200, 400, 403, 404, 500][Math.floor(Math.random() * 5)],
      body: {
        status: [200, 400, 403, 404, 500][Math.floor(Math.random() * 5)],
        message: ['Success', 'Bad Request', 'Forbidden', 'Not Found', 'Server Error'][Math.floor(Math.random() * 5)],
        data: 'Base64编码的响应内容...'
      }
    },
    localVerification: {
      ruleName: ['SQL注入检测', 'XSS攻击检测', '命令注入检测', 'WebShell检测'][Math.floor(Math.random() * 4)],
      protocolNumber: '323-2',
      protocolType: 'HTTPS',
      attackType: ['SQL注入', 'XSS攻击', '命令注入', 'WebShell'][Math.floor(Math.random() * 4)],
      malformedPacketLength: Math.floor(Math.random() * 1000),
      attackFeatures: ['特征1：异常字符串', '特征2：恶意代码片段', '特征3：非法请求参数'][Math.floor(Math.random() * 3)]
    }
  }));
};

const FILTER_OPTIONS = {
  intelType: MOCK_DATA_CONFIG.intelTypes,
  action: MOCK_DATA_CONFIG.actions,
  intelSource: MOCK_DATA_CONFIG.intelSources,
};

// 添加获取国旗组件的辅助函数
const getFlagComponent = (country: string) => {
  const componentMap: { [key: string]: any } = {
    '美国': US,
    '中国': CN,
    '英国': GB,
    '法国': FR,
    '德国': DE,
  };
  return componentMap[country];
};

// 5. 组件定义
const AttackLogs: React.FC = () => {
  // 状态定义
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [filterValues, setFilterValues] = useState<FilterValues>({});
  const [form] = Form.useForm();
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [filterName, setFilterName] = useState('');
  const [modalState, setModalState] = useState({
    isFilterModalVisible: false,
    isDetailVisible: false,
    isIpDrawerVisible: false,
    isChartsExpanded: false,
  });
  const [setSelectedLog] = useState<any>(null);
  const [favoriteIps, setFavoriteIps] = useState<string[]>([]);
  const [mockData, setMockData] = useState<AttackLog[]>([]);

  const locationOptions = [
    {
      value: 'world',
      label: '世界',
      children: [
        { value: 'usa', label: '美国' },
        { value: 'uk', label: '英国' },
        { value: 'france', label: '法国' },
        { value: 'germany', label: '德国' },
        { value: 'italy', label: '意大利' },
        { value: 'spain', label: '西班牙' },
        { value: 'portugal', label: '葡萄牙' },
        { value: 'greece', label: '希腊' },
        { value: 'turkey', label: '土耳其' },
        { value: 'australia', label: '澳大利亚' },
        { value: 'canada', label: '加拿大' },
        { value: 'brazil', label: '巴西' },
        { value: 'argentina', label: '阿根廷' },
        { value: 'chile', label: '智利' },
        { value: 'peru', label: '秘鲁' },
        // ... 其他国家
      ]
    },
    {
      value: 'china',
      label: '中国',
      children: [
        { value: 'beijing', label: '北京' },
        { value: 'shanghai', label: '上海' },
        { value: 'guangzhou', label: '广州' },
        // ... 其他城市
      ]
    },
    {
      value: 'foreign',
      label: '国外',
      children: [
        { value: 'usa', label: '美国' },
        { value: 'uk', label: '英国' },
        { value: 'france', label: '法国' },
        { value: 'germany', label: '德国' },
        { value: 'italy', label: '意大利' },
        { value: 'spain', label: '西班牙' },
        { value: 'portugal', label: '葡萄牙' },
        { value: 'greece', label: '希腊' },
        { value: 'turkey', label: '土耳其' },
        { value: 'australia', label: '澳大利亚' },
        { value: 'canada', label: '加拿大' },
        { value: 'brazil', label: '巴西' },
        { value: 'argentina', label: '阿根廷' },
        { value: 'chile', label: '智利' },
        { value: 'peru', label: '秘鲁' },
        // ... 其他国家
      ]
    }
  ];

  // 工具函数
  const toggleModal = (key: keyof typeof modalState) => {
    setModalState(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const addToFavorites = (ip: string, type: 'attack' | 'target') => {
    if (favoriteIps.includes(ip)) {
      // 如果已收藏，则取消收藏
      setFavoriteIps(prev => prev.filter(item => item !== ip));
      message.info('已取消收藏');
    } else {
      // 如果未收藏，则添加收藏
      setFavoriteIps(prev => [...prev, ip]);
      message.success('IP已添加到收藏夹');
    }

    // 更新localStorage
    const savedIps = JSON.parse(localStorage.getItem('favoriteIps') || '[]');
    const newSavedIps = favoriteIps.includes(ip)
      ? savedIps.filter((item: any) => item.ip !== ip)
      : [...savedIps, { ip, type, key: ip }];
    localStorage.setItem('favoriteIps', JSON.stringify(newSavedIps));
  };

  const filterData = useMemo(() => {
    return (data: any[]) => {
      return data.filter(item => {
        const matchesFilter = (key: keyof FilterValues) =>
          !filterValues[key] ||
          (Array.isArray(filterValues[key])
            ? (filterValues[key] as string[]).includes(item[key])
            : item[key].toLowerCase().includes((filterValues[key] as string).toLowerCase()));

        return Object.keys(filterValues).every(key =>
          key === 'location'
            ? !filterValues.location?.length || matchesLocation(item.location, filterValues.location)
            : matchesFilter(key as keyof FilterValues)
        );
      });
    };
  }, [filterValues]);

  const matchesLocation = (location: string, filterLocation: string[]) => {
    const [category, specific] = filterLocation;
    if (category === 'world') {
      return true;
    } else if (category === 'china') {
      return location === specific;
    } else if (category === 'foreign') {
      return location === specific;
    }
    return false;
  };

  const getTableColumns = (
    addToFavorites: (ip: string, type: 'attack' | 'target') => void,
    setSelectedLog: (log: any) => void,
    setIsDetailVisible: (visible: boolean) => void
  ) => {
    const renderIpColumn = (ip: string, type: 'attack' | 'target') => (
      <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
        <Button
          type="link"
          style={{ padding: 0, minWidth: 32, marginRight: 8 }}
          icon={favoriteIps.includes(ip) ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            addToFavorites(ip, type);
          }}
        />
        <Typography.Text copyable style={{ width: type === 'attack' ? 160 : 180 }} ellipsis>
          {ip}
        </Typography.Text>
      </div>
    );

    return [
      {
        title: '时间',
        dataIndex: 'time',
        width: 180,
        ellipsis: true
      },
      {
        title: '攻击IP',
        dataIndex: 'attackIp',
        width: 220,
        render: (ip: string) => renderIpColumn(ip, 'attack'),
      },
      {
        title: '归属地',
        dataIndex: 'location',
        width: 120,
        ellipsis: true,
        render: (text: string) => {
          const country = text.split('|')[0].trim();
          const FlagComponent = getFlagComponent(country);
          return (
            <Space>
              {FlagComponent && <FlagComponent style={{ width: 16 }} />}
              {text}
            </Space>
          );
        }
      },
      {
        title: '被攻击IP',
        dataIndex: 'targetIp',
        width: 220,
        ellipsis: true,
        render: (ip: string) => renderIpColumn(ip, 'target'),
      },
      {
        title: '被攻击端口',
        dataIndex: 'targetPort',
        width: 120,
        ellipsis: true
      },
      {
        title: '情报类型',
        dataIndex: 'intelType',
        width: 150,
        ellipsis: true
      },
      {
        title: '威胁等级',
        dataIndex: 'threatLevel',
        width: 120,
        ellipsis: true,
        render: (text: string) => {
          const colors = {
            '高危': 'red',
            '中危': 'orange',
            '低危': 'blue',
          };
          return <Tag color={colors[text as keyof typeof colors]}>{text}</Tag>;
        },
      },
      {
        title: '处理动作',
        dataIndex: 'action',
        width: 120,
        ellipsis: true
      },
      {
        title: '命中情报源',
        dataIndex: 'intelSource',
        width: 150,
        ellipsis: true
      },
      {
        title: '最近攻击单位',
        dataIndex: 'lastAttackUnit',
        width: 150,
        ellipsis: true
      },
      {
        title: '操作',
        key: 'operation',
        fixed: 'right' as const,
        width: 90,
        render: (_: any, record: any) => (
          <Space size="middle" style={{ paddingRight: 8 }}>
            <Button
              type="link"
              onClick={() => {
                setSelectedLog(record);
                setIsDetailVisible(true);
              }}
              style={{ padding: '4px 8px' }}
            >
              详情
            </Button>
          </Space>
        ),
      }
    ];
  };

  // 事件处理函数
  const handleFilter = (values: FilterValues) => setFilterValues(values);
  const handleReset = () => {
    form.resetFields();
    setFilterValues({});
  };

  const saveToLocalStorage = (filters: SavedFilter[]) => {
    localStorage.setItem('attackLogsSavedFilters', JSON.stringify(filters));
    setSavedFilters(filters);
  };

  const handleSaveFilter = () => {
    const currentValues = form.getFieldsValue();
    if (Object.keys(currentValues).every(key => !currentValues[key])) {
      message.warning('请至少设置一个搜索条件');
      return;
    }

    const newFilter: SavedFilter = {
      id: Date.now().toString(),
      name: filterName,
      conditions: currentValues,
      createTime: new Date().toLocaleString()
    };

    saveToLocalStorage([...savedFilters, newFilter]);
    toggleModal('isFilterModalVisible');
    setFilterName('');
    message.success('搜索条件保存成功');
  };

  // 副作用
  useEffect(() => {
    const saved = localStorage.getItem('attackLogsSavedFilters');
    if (saved) {
      setSavedFilters(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    const savedIps = JSON.parse(localStorage.getItem('favoriteIps') || '[]');
    setFavoriteIps(savedIps.map((item: any) => item.ip));
  }, []);

  // 在组件加载时生成一次数据并保存
  useEffect(() => {
    setMockData(generateMockData());
  }, []);

  // 获取数据
  const columns = getTableColumns(addToFavorites, setSelectedLog, () => toggleModal('isDetailVisible'));
  // 使用保存的mock数据而不是每次重新生成
  // const data = generateMockData(); // 删除这行
  // 筛选操作后的模拟数据
  const filteredData = filterData(mockData); // 使用保存的mockData

  // 渲染函数
  const renderFilterForm = () => (
    <Form form={form} onFinish={handleFilter} style={{ marginBottom: 24 }}>
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Form.Item name="quickSearch" style={{ marginBottom: 0 }}>
            <LabelSelect
              label="快捷搜索"
              placeholder="请选择"
            >
            </LabelSelect>
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item name="intelType" style={{ marginBottom: 0 }}>
            <LabelSelect
              label="情报类型"
              allowClear
              placeholder="请选择情报类型"
              options={FILTER_OPTIONS.intelType.map(item => ({ label: item, value: item }))}
            />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item name="intelSource" style={{ marginBottom: 0 }}>
            <LabelSelect
              label="情报源"
              allowClear
              placeholder="请选择情报源"
              options={FILTER_OPTIONS.intelSource.map(item => ({ label: item, value: item }))}
            />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item name="action" style={{ marginBottom: 0 }}>
            <LabelSelect
              label="处理动作"
              allowClear
              placeholder="请选择处理动作"
              options={FILTER_OPTIONS.action.map(item => ({ label: item, value: item }))}
            />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item name="attackIp" style={{ marginBottom: 0 }}>
            <LabelInput
              label="攻击IP"
              placeholder="请输入攻击IP"
              allowClear
            />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item name="targetIp" style={{ marginBottom: 0 }}>
            <LabelInput
              label="被攻击IP"
              placeholder="请输入被攻击IP"
              allowClear
            />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item name="location" style={{ marginBottom: 0 }}>
            <LabelCascader
              label="归属地"
              options={locationOptions}
              placeholder="请选择"
            />
          </Form.Item>
        </Col>
        <Col span={6} style={{ display: 'flex', alignItems: 'flex-end' }}>
          <Form.Item style={{ marginBottom: 0 }}>
            <Space>
              <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                搜索
              </Button>
              <Button onClick={handleReset} icon={<ReloadOutlined />}>
                重置
              </Button>
              <Button onClick={() => toggleModal('isFilterModalVisible')} icon={<SaveOutlined />}>
                保存条件
              </Button>
              <Button
                icon={<StarOutlined />}
                onClick={() => toggleModal('isIpDrawerVisible')}
              >
                IP收藏夹
              </Button>
            </Space>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );

  // 返回JSX
  return (
    <div>
      <AttackTrendCard
        trendData={[
          { date: '2024年8月7日', high: 934, medium: 1498, low: 3065 },
          { date: '2024年8月6日', high: 856, medium: 1389, low: 2987 },
          { date: '2024年8月5日', high: 912, medium: 1456, low: 3123 }
        ]}
        intelTypeData={[
          { type: '注入攻击', count: 2345, percentage: 23.45 },
          { type: 'XSS攻击', count: 1234, percentage: 12.34 },
          { type: '暴力破解', count: 987, percentage: 9.87 }
        ]}
      />

      {/* 筛选和表格区域 */}
      <Card style={{ backgroundColor: 'white' }}>
        {renderFilterForm()}
        {/* 条件渲染按钮 */}
        {selectedRows.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <Space>
              <Button icon={<ExportOutlined />}>导出</Button>
              <Button icon={<DeleteOutlined />} onClick={() => setSelectedRows([])}>清空</Button>
            </Space>
          </div>
        )}

        <Table
          columns={columns}
          dataSource={filteredData}
          rowSelection={{
            selectedRowKeys: selectedRows.map(row => row.key),
            onChange: (_, rows) => setSelectedRows(rows),
          }}
          scroll={{ x: 2000 }}
          pagination={{
            total: filteredData.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Card>

      {/* 添加 IP收藏夹抽屉组件 */}
      <Drawer
        title="IP收藏夹"
        placement="right"
        width={600}
        onClose={() => toggleModal('isIpDrawerVisible')}
        open={modalState.isIpDrawerVisible}
      >
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col flex="auto">
            <Input placeholder="请输入IP地址" />
          </Col>
          <Col>
            <Button type="primary">搜索</Button>
          </Col>
        </Row>

        <Table
          columns={[
            {
              title: 'IP',
              dataIndex: 'ip',
              key: 'ip',
            },
            {
              title: '类型',
              dataIndex: 'type',
              key: 'type',
              render: (text: string) => (
                <Tag color="blue">{text}</Tag>
              )
            },
            {
              title: '操作',
              key: 'action',
              render: () => (
                <Button 
                  type="link" 
                  danger
                >
                  删除
                </Button>
              )
            }
          ]}
          dataSource={[
            {
              key: '1',
              ip: '192.168.1.100',
              type: '攻击IP'
            },
            {
              key: '2', 
              ip: '10.0.0.123',
              type: '被攻击IP'
            },
            {
              key: '3',
              ip: '172.16.0.50',
              type: '攻击IP'
            },
            {
              key: '4',
              ip: '192.168.0.234',
              type: '被攻击IP'
            }
          ]}
          pagination={false}
        />
      </Drawer>

      {/* 添加保存筛选条件的 Modal */}
      <Modal
        title="保存搜索条件"
        open={modalState.isFilterModalVisible}
        onOk={handleSaveFilter}
        onCancel={() => {
          toggleModal('isFilterModalVisible');
          setFilterName('');
        }}
        okText="保存"
        cancelText="取消"
      >
        <Form layout="vertical">
          <Form.Item style={{ marginBottom: 0 }}>
            <LabelInput
              label="条件名称"
              required
              placeholder="请输入条件名称"
              value={filterName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilterName(e.target.value)}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AttackLogs;
