// 1. 引入
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Card, Table, Button, Space, Form, Row, Col, Modal, message, Typography, Tag, Drawer, Input, InputNumber, Radio, Empty, Tabs } from 'antd';
import { StarOutlined, StarFilled, SearchOutlined, ReloadOutlined, SaveOutlined, ExportOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import LabelSelect from '@/components/LabelSelect';
import LabelInput from '@/components/LabelInput';
import ExternalPathVisualization from '@/components/ExternalPathVisualization';
import ExternalTrendCard from '@/components/ExternalTrendCard';

// 2. 类型定义
// 定义筛选条件的类型
interface FilterValues {
    quickSearch?: string;    // 快捷搜索
    hitType?: string;        // 命中类型
    action?: string;         // 处理动作
    targetType?: string;     // 目标类型
    controlledHost?: string; // 受控主机
    externalDomain?: string; // 外联域名/URL
    destinationIp?: string;  // 目的IP
    threatLevel?: string;    // 威胁等级
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
    controlledHost: string;
    sourcePort: string;
    externalDomain: string;
    nextHopDns: string;
    destinationIp: string;
    destinationPort: string;
    targetType: string;
    hitType: string;
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
        aiDetection: 'hit' | 'miss';
    };
}

// 定义时间单位类型
interface TimeUnit {
    label: string;
    value: string;
    multiplier: number;
}

// 4. Mock数据和常量
const MOCK_DATA_CONFIG = {
    locations: [
        '中国 | 北京',
        '中国 | 上海',
        '中国 | 广州',
        '中国 | 深圳',
        '中国 | 杭州',
        '美国 | 纽约',
        '美国 | 洛杉矶',
        '英国 | 伦敦',
        '法国 | 巴黎',
        '德国 | 柏林'
    ],
    intelTypes: ['僵尸网络', '恶意软件', 'DDoS攻击', '漏洞利用', '暴力破解', '钓鱼攻击'],
    threatLevels: ['高危', '中危', '低危'],
    actions: ['阻断', '监控'],
    intelSources: ['公有情报源', '私有情报源', '第三方情报源', '自建情报源'],
};

const generateMockData = (): AttackLog[] => {
    const getRandomItem = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
    const getRandomNumber = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
    const getRandomIp = () => Array.from({ length: 4 }, () => getRandomNumber(0, 255)).join('.');
    const getRandomDomain = () => `${Math.random().toString(36).substring(7)}.example.com`;

    const targetTypes = ['C2服务器', '恶意域名', '钓鱼网站', '僵尸网络', '挖矿程序'];
    const hitTypes = ['情报命中', '规则命中', 'AI检测', '行为分析'];

    const getRandomUserAgent = () => {
        const userAgents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
            'Mozilla/5.0 (Linux; Android 13; SM-S908B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'
        ];
        return userAgents[Math.floor(Math.random() * userAgents.length)];
    };

    const getRandomContentType = () => {
        const contentTypes = [
            'application/json',
            'application/x-www-form-urlencoded',
            'multipart/form-data',
            'text/plain',
            'application/xml'
        ];
        return contentTypes[Math.floor(Math.random() * contentTypes.length)];
    };

    return Array.from({ length: 100 }, (_, index) => ({
        key: String(index + 1),
        time: dayjs().subtract(getRandomNumber(0, 24), 'hour').format('YYYY-MM-DD HH:mm:ss'),
        controlledHost: getRandomIp(),
        sourcePort: String(getRandomNumber(1024, 65535)),
        externalDomain: getRandomDomain(),
        nextHopDns: getRandomIp(),
        destinationIp: getRandomIp(),
        destinationPort: String(getRandomNumber(1, 65535)),
        targetType: getRandomItem(targetTypes),
        hitType: getRandomItem(hitTypes),
        threatLevel: getRandomItem(MOCK_DATA_CONFIG.threatLevels),
        action: getRandomItem(MOCK_DATA_CONFIG.actions),
        intelSource: getRandomItem(MOCK_DATA_CONFIG.intelSources),
        lastAttackUnit: getRandomNumber(0, 1) ? `${getRandomNumber(1, 24)}小时前` : `${getRandomNumber(1, 60)}分钟前`,
        requestInfo: {
            protocol: getRandomItem(['http', 'https']),
            url: `https://${getRandomDomain()}/api/v1/${getRandomItem(['users', 'orders', 'products'])}`,
            dnsName: getRandomDomain(),
            headers: {
                'User-Agent': getRandomUserAgent(),
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': getRandomContentType(),
                'X-Forwarded-For': getRandomIp(),
                'Host': getRandomDomain(),
                'Connection': 'keep-alive',
                'Accept-Encoding': 'gzip, deflate, br',
                'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
                'X-Request-ID': `req-${Math.random().toString(36).substring(7)}`,
                'Authorization': `Bearer ${Math.random().toString(36).substring(7)}`,
                'Origin': `https://${getRandomDomain()}`,
                'Referer': `https://${getRandomDomain()}/`,
            },
            body: {
                payload: JSON.stringify({
                    action: getRandomItem(['login', 'getData', 'updateProfile', 'deleteRecord']),
                    params: {
                        userId: Math.floor(Math.random() * 10000),
                        timestamp: new Date().toISOString(),
                        data: {
                            key1: Math.random().toString(36).substring(7),
                            key2: Math.floor(Math.random() * 100),
                            key3: getRandomItem(['value1', 'value2', 'value3']),
                        }
                    },
                    signature: Math.random().toString(36).substring(7)
                }),
                size: `${Math.floor(Math.random() * 1000)}kb`,
                type: getRandomContentType(),
                timestamp: dayjs().subtract(getRandomNumber(0, 24), 'hour').format('YYYY-MM-DD HH:mm:ss')
            }
        },
        responseInfo: {
            headers: {
                'Content-Type': getRandomContentType(),
                'Server': getRandomItem(['nginx/1.20.1', 'Apache/2.4.41', 'cloudflare']),
                'Date': dayjs().format('ddd, DD MMM YYYY HH:mm:ss GMT'),
                'Content-Length': String(Math.floor(Math.random() * 5000)),
                'X-Response-Time': `${Math.floor(Math.random() * 500)}ms`,
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'X-Frame-Options': 'SAMEORIGIN',
                'X-Content-Type-Options': 'nosniff',
                'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
            },
            statusCode: getRandomItem([200, 201, 400, 401, 403, 404, 500]),
            body: {
                status: getRandomItem([0, 1, -1]),
                message: getRandomItem(['Success', 'Failed', 'Unauthorized', 'Server Error']),
                data: JSON.stringify({
                    result: getRandomItem(['success', 'error']),
                    errorCode: Math.floor(Math.random() * 1000),
                    details: {
                        id: Math.floor(Math.random() * 10000),
                        timestamp: new Date().toISOString(),
                        processingTime: `${Math.floor(Math.random() * 500)}ms`
                    }
                })
            }
        },
        localVerification: {
            ruleName: '',
            protocolNumber: '',
            protocolType: '',
            attackType: '',
            malformedPacketLength: 0,
            attackFeatures: '',
            aiDetection: 'miss'
        }
    }));
};

const FILTER_OPTIONS = {
    hitType: ['情报命中', '规则命中', 'AI检测', '行为分析'],
    action: MOCK_DATA_CONFIG.actions,
    targetType: ['C2服务器', '恶意域名', '钓鱼网站', '僵尸网络', '挖矿程序'],
    threatLevel: MOCK_DATA_CONFIG.threatLevels,
};

// 5. 组件定义
const ExternalLogs: React.FC = () => {
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
    const [selectedLog, setSelectedLog] = useState<any>(null);
    const [favoriteIps, setFavoriteIps] = useState<string[]>([]);
    const [mockData, setMockData] = useState<AttackLog[]>([]);
    const [timeModalVisible, setTimeModalVisible] = useState(false);
    const [listType, setListType] = useState<'black' | 'white'>('black');
    const [duration, setDuration] = useState<number>(0);
    const [timeUnit, setTimeUnit] = useState<string>('hour');
    const prevDurationRef = useRef<number>(0);

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
                    item[key].toLowerCase().includes((filterValues[key] as string).toLowerCase());

                return Object.keys(filterValues).every(key =>
                    matchesFilter(key as keyof FilterValues)
                );
            });
        };
    }, [filterValues]);

    const getTableColumns = (
        addToFavorites: (ip: string, type: 'attack' | 'target') => void,
        setSelectedLog: (log: any) => void,
        setIsDetailVisible: (visible: boolean) => void
    ) => {
        const renderIpColumn = (ip: string, type: 'attack' | 'target', showStar = true, showAssetTag = false) => (
            <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                {showStar && (
                    <Button
                        type="link"
                        style={{ padding: 0, minWidth: 32, marginRight: 8 }}
                        icon={favoriteIps.includes(ip) ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />}
                        onClick={(e) => {
                            e.stopPropagation();
                            addToFavorites(ip, type);
                        }}
                    />
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                    <Typography.Text copyable style={{ margin: 0 }}>
                        {ip}
                    </Typography.Text>
                    {showAssetTag && <Tag color="blue" style={{ whiteSpace: 'nowrap' }}>全局资产</Tag>}
                </div>
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
                title: '受控主机',
                dataIndex: 'controlledHost',
                width: 280,
                render: (ip: string) => renderIpColumn(ip, 'attack', true, true),
            },
            {
                title: '源端口',
                dataIndex: 'sourcePort',
                width: 100,
                ellipsis: true
            },
            {
                title: '外联域名/URL',
                dataIndex: 'externalDomain',
                width: 220,
                ellipsis: true,
                render: (text: string) => (
                    <Typography.Text copyable style={{ width: 200 }} ellipsis>
                        {text}
                    </Typography.Text>
                )
            },
            {
                title: '下一跳DNS',
                dataIndex: 'nextHopDns',
                width: 180,
                ellipsis: true,
                render: (ip: string) => renderIpColumn(ip, 'target', false),
            },
            {
                title: '目的IP',
                dataIndex: 'destinationIp',
                width: 220,
                ellipsis: true,
                render: (ip: string) => (
                    <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                            <Typography.Text copyable style={{ margin: 0 }}>
                                {ip}
                            </Typography.Text>
                            {Math.random() > 0.5 && (
                                <Tag
                                    style={{
                                        color: '#722ed1',
                                        backgroundColor: 'rgba(114, 46, 209, 0.1)',
                                        border: 'none',
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    出境流量
                                </Tag>
                            )}
                        </div>
                    </div>
                ),
            },
            {
                title: '目的端口',
                dataIndex: 'destinationPort',
                width: 100,
                ellipsis: true
            },
            {
                title: '目标类型',
                dataIndex: 'targetType',
                width: 120,
                ellipsis: true
            },
            {
                title: '命中类型',
                dataIndex: 'hitType',
                width: 120,
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
                        '低危': 'green',
                    };
                    return <Tag color={colors[text as keyof typeof colors]}>{text}</Tag>;
                },
            },
            {
                title: '处理动作',
                dataIndex: 'action',
                width: 120,
                ellipsis: true,
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

    // 添加时间单位常量
    const timeUnits: TimeUnit[] = [
        { label: '分钟', value: 'minute', multiplier: 60 },
        { label: '小时', value: 'hour', multiplier: 3600 },
        { label: '天', value: 'day', multiplier: 86400 },
        { label: '月', value: 'month', multiplier: 2592000 },
        { label: '永久', value: 'forever', multiplier: -1 }
    ];

    // 优化时间单位切换的处理函数
    const handleTimeUnitChange = useCallback((value: string | number) => {
        const newTimeUnit = value.toString();

        if (newTimeUnit === 'forever') {
            prevDurationRef.current = duration;
        } else if (timeUnit === 'forever') {
            prevDurationRef.current = duration;
        }

        setTimeUnit(newTimeUnit);
    }, [timeUnit, duration]);

    const handleConfirmAddToList = () => {
        const selectedUnit = timeUnits.find(unit => unit.value === timeUnit);
        let totalSeconds = 0;

        if (selectedUnit?.value === 'forever') {
            totalSeconds = -1;
        } else if (selectedUnit) {
            totalSeconds = duration * selectedUnit.multiplier;
        }

        message.success(`已将IP ${selectedLog?.attackIp} 添加到${listType === 'black' ? '黑' : '白'}名单，时长：${totalSeconds === -1 ? '永久' : `${duration}${selectedUnit?.label}`}`);
        setTimeModalVisible(false);
    };

    // 渲染函数
    const renderFilterForm = () => (
        <Form form={form} onFinish={handleFilter} style={{ marginBottom: 24 }}>
            <Row gutter={[16, 16]}>
                <Col span={4}>
                    <Form.Item name="quickSearch" style={{ marginBottom: 0 }}>
                        <LabelSelect
                            label="快捷搜索"
                            placeholder="请选择"
                        />
                    </Form.Item>
                </Col>
                <Col span={4}>
                    <Form.Item name="hitType" style={{ marginBottom: 0 }}>
                        <LabelSelect
                            label="命中类型"
                            allowClear
                            placeholder="请选择命中类型"
                            options={FILTER_OPTIONS.hitType.map(item => ({ label: item, value: item }))}
                        />
                    </Form.Item>
                </Col>
                <Col span={4}>
                    <Form.Item name="action" style={{ marginBottom: 0 }}>
                        <LabelSelect
                            label="处理动作"
                            allowClear
                            placeholder="请选择处理动作"
                            options={FILTER_OPTIONS.action.map(item => ({ label: item, value: item }))}
                        />
                    </Form.Item>
                </Col>
                <Col span={4}>
                    <Form.Item name="targetType" style={{ marginBottom: 0 }}>
                        <LabelSelect
                            label="目标类型"
                            allowClear
                            placeholder="请选择目标类型"
                            options={FILTER_OPTIONS.targetType.map(item => ({ label: item, value: item }))}
                        />
                    </Form.Item>
                </Col>
                <Col span={4}>
                    <Form.Item name="controlledHost" style={{ marginBottom: 0 }}>
                        <LabelInput
                            label="受控主机"
                            placeholder="请输入受控主机"
                            allowClear
                        />
                    </Form.Item>
                </Col>
                <Col span={4}>
                    <Form.Item name="externalDomain" style={{ marginBottom: 0 }}>
                        <LabelInput
                            label="外联域名/URL"
                            placeholder="请输入外联域名/URL"
                            allowClear
                        />
                    </Form.Item>
                </Col>
                <Col span={4}>
                    <Form.Item name="destinationIp" style={{ marginBottom: 0 }}>
                        <LabelInput
                            label="目的IP"
                            placeholder="请输入目的IP"
                            allowClear
                        />
                    </Form.Item>
                </Col>
                <Col span={4}>
                    <Form.Item name="threatLevel" style={{ marginBottom: 0 }}>
                        <LabelSelect
                            label="威胁等级"
                            allowClear
                            placeholder="请选择威胁等级"
                            options={FILTER_OPTIONS.threatLevel.map(item => ({ label: item, value: item }))}
                        />
                    </Form.Item>
                </Col>
                <Col span={6}>
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
            <ExternalTrendCard
                trendData={[
                    { date: '1月9日', count: 298 },
                    { date: '1月10日', count: 432 },
                    { date: '1月11日', count: 432 },
                    { date: '1月12日', count: 634 },
                    { date: '1月13日', count: 1234 }
                ]}
                intelTypeData={[
                    { type: '注入攻击', count: 3567 },
                    { type: 'XSS攻击', count: 2845 },
                    { type: '暴力破解', count: 1789 },
                    { type: '僵尸网络', count: 1234 },
                    { type: '漏洞利用', count: 565 },
                    { type: '其他攻击', count: 432 },
                    { type: 'SQL注入', count: 298 },
                    { type: '命令注入', count: 256 },
                    { type: '文件包含', count: 189 },
                    { type: '目录遍历', count: 145 }
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
                    scroll={{ x: 1 }}
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

            <Drawer
                title={
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography.Title level={4} style={{ margin: 0, fontSize: '18px' }}>攻击日志详情</Typography.Title>
                    </div>
                }
                placement="right"
                width="clamp(800px, 50%, 100%)"
                onClose={() => setSelectedLog(null)}
                open={!!selectedLog}
            >
                <Tabs
                    items={[
                        {
                            key: 'logInfo',
                            label: '日志信息',
                            children: (
                                <Space direction="vertical" style={{ width: '100%' }} size="large">
                                    <Card title="告警信息详情">
                                        <ExternalPathVisualization
                                            attackerInfo={{
                                                ip: selectedLog?.controlledHost || '',
                                            }}
                                            victimInfo={{
                                                ip: selectedLog?.destinationIp || '',
                                                isForeign: true,
                                            }}
                                            protocol={selectedLog?.requestInfo?.protocol?.toUpperCase() || 'HTTP'}
                                            url={selectedLog?.externalDomain || selectedLog?.requestInfo?.url || ''}
                                        />
                                    </Card>

                                    {selectedLog?.requestInfo && (
                                        <Card title="请求信息">
                                            <Tabs
                                                items={[
                                                    {
                                                        key: 'headers',
                                                        label: '请求头',
                                                        children: (
                                                            <Table
                                                                columns={[
                                                                    { title: '名称', dataIndex: 'name', key: 'name' },
                                                                    { title: '值', dataIndex: 'value', key: 'value' },
                                                                ]}
                                                                dataSource={Object.entries(selectedLog.requestInfo.headers).map(([key, value], index: number) => ({
                                                                    key: index,
                                                                    name: key,
                                                                    value: value
                                                                }))}
                                                                pagination={false}
                                                                size="small"
                                                            />
                                                        ),
                                                    },
                                                    {
                                                        key: 'body',
                                                        label: '请求体',
                                                        children: (
                                                            <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                                                                {selectedLog.requestInfo.body ? JSON.stringify(selectedLog.requestInfo.body, null, 2) : ''}
                                                            </pre>
                                                        ),
                                                    },
                                                    {
                                                        key: 'params',
                                                        label: '请求参数',
                                                        children: <Empty description="暂无数据" />,
                                                    },
                                                ]}
                                            />
                                        </Card>
                                    )}
                                </Space>
                            ),
                        },
                        {
                            key: 'ipTrace',
                            label: 'IP溯源',
                            children: <Empty description="暂无数据" />,
                        },
                    ]}
                />
            </Drawer>

            <Modal
                title={`添加到${listType === 'black' ? '黑' : '白'}名单`}
                open={timeModalVisible}
                onOk={handleConfirmAddToList}
                onCancel={() => setTimeModalVisible(false)}
                okText="确认"
                cancelText="取消"
                centered
                style={{ top: '20px' }}
            >
                <Space direction="vertical" style={{ width: '100%' }} size="large">
                    <Radio.Group
                        value={listType}
                        onChange={(e) => setListType(e.target.value)}
                        style={{ marginBottom: 16 }}
                    >
                        <Radio.Button value="black">黑名单</Radio.Button>
                        <Radio.Button value="white">白名单</Radio.Button>
                    </Radio.Group>
                    <div>
                        <Typography.Text>IP地址：{selectedLog?.attackIp}</Typography.Text>
                    </div>
                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <InputNumber
                                min={0}
                                value={duration}
                                onChange={(value) => setDuration(value || 0)}
                                style={{ flex: 1 }}
                                disabled={timeUnit === 'forever'}
                            />
                            <Radio.Group
                                value={timeUnit}
                                onChange={(e) => handleTimeUnitChange(e.target.value)}
                                optionType="button"
                                buttonStyle="solid"
                                options={timeUnits.map(unit => ({
                                    label: unit.label,
                                    value: unit.value
                                }))}
                            />
                        </div>
                    </Space>
                </Space>
            </Modal>
        </div>
    );
};

export default ExternalLogs;
