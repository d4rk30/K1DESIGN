// 1. 引入
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Card, Table, Button, Space, Form, Row, Col, Modal, message, Typography, Tag, Drawer, Input, InputNumber, Radio, Empty, Tabs, Descriptions } from 'antd';
import { StarOutlined, StarFilled, SearchOutlined, ReloadOutlined, SaveOutlined, ExportOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import AttackTrendCard from '@/components/AttackTrendCard';
import LabelSelect from '@/components/LabelSelect';
import LabelInput from '@/components/LabelInput';
import LabelCascader from '@/components/LabelCascader';
import { US, CN, GB, FR, DE } from 'country-flag-icons/react/3x2';
import AttackPathVisualization from '@/components/AttackPathVisualization';

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
    // 从给定数组中随机选择一个元素
    const getRandomItem = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
    // 生成一个在指定范围内的随机整数
    const getRandomNumber = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
    // 生成一个随机的IP地址，格式为 "x.x.x.x"
    const getRandomIp = () => Array.from({ length: 4 }, () => getRandomNumber(0, 255)).join('.');

    // 添加名称脱敏处理函数
    const maskOrganizationName = (name: string) => {
        if (name.length <= 2) return name;
        return name.charAt(0) + '*'.repeat(name.length - 2) + name.charAt(name.length - 1);
    };

    const organizations = [
        '中国移动集团',
        '华为技术有限公司',
        '清华大学',
        '北京协和医院',
        '中国石油集团',
        '阿里巴巴集团',
        '浙江大学',
        '四川省人民医院',
        '中国建设银行',
        '腾讯科技集团',
        '复旦大学',
        '北京大学人民医院',
        '中国电信集团',
        '中国联通集团',
        '上海交通大学'
    ];

    // 首先生成一条 DNS 类型的记录
    const dnsRecord: AttackLog = {
        key: '1',
        time: dayjs().subtract(getRandomNumber(0, 24), 'hour').format('YYYY-MM-DD HH:mm:ss'),
        attackIp: getRandomIp(),
        location: getRandomItem(MOCK_DATA_CONFIG.locations),
        targetIp: `192.168.${getRandomNumber(0, 255)}.${getRandomNumber(0, 255)}`,
        targetPort: '53', // DNS 默认端口
        intelType: '僵尸网络', // 或其他类型
        threatLevel: getRandomItem(MOCK_DATA_CONFIG.threatLevels),
        action: getRandomItem(MOCK_DATA_CONFIG.actions),
        intelSource: getRandomItem(MOCK_DATA_CONFIG.intelSources),
        lastAttackUnit: maskOrganizationName(getRandomItem(organizations)),
        requestInfo: {
            protocol: 'dns',
            url: '',
            dnsName: `subdomain${getRandomNumber(1, 100)}.example.com`,
            headers: {
                'User-Agent': 'DNS Client',
                'Accept': '*/*',
                'Content-Type': 'application/dns-message',
                'X-Forwarded-For': getRandomIp(),
                'Host': 'dns.example.com',
                'Connection': 'keep-alive',
                'Accept-Encoding': 'gzip, deflate, br',
                'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            },
            body: {
                payload: 'Base64编码的DNS请求内容...',
                size: `${getRandomNumber(50, 200)}bytes`,
                type: 'DNS查询',
                timestamp: new Date().toISOString()
            }
        },
        responseInfo: {
            headers: {
                'Content-Type': 'application/dns-message',
                'Server': 'DNS Server/1.0',
                'Date': new Date().toUTCString(),
                'Content-Length': String(getRandomNumber(100, 500))
            },
            statusCode: 200,
            body: {
                status: 200,
                message: 'DNS Response',
                data: 'Base64编码的DNS响应内容...'
            }
        },
        localVerification: {
            ruleName: 'DNS异常检测',
            protocolNumber: '323-2',
            protocolType: 'DNS',
            attackType: 'DNS隧道攻击',
            malformedPacketLength: getRandomNumber(100, 1000),
            attackFeatures: '特征1：异常DNS查询',
            aiDetection: Math.random() < 0.5 ? 'hit' : 'miss' as 'hit' | 'miss'
        }
    };

    // 然后生成剩余的随机记录
    const remainingRecords = Array.from({ length: 99 }, (_, index) => ({
        key: String(index + 2),
        time: dayjs().subtract(getRandomNumber(0, 24), 'hour').format('YYYY-MM-DD HH:mm:ss'),
        attackIp: getRandomIp(),
        location: getRandomItem(MOCK_DATA_CONFIG.locations),
        targetIp: `192.168.${getRandomNumber(0, 255)}.${getRandomNumber(0, 255)}`,
        targetPort: String(getRandomNumber(0, 65535)),
        intelType: getRandomItem(MOCK_DATA_CONFIG.intelTypes),
        threatLevel: getRandomItem(MOCK_DATA_CONFIG.threatLevels),
        action: getRandomItem(MOCK_DATA_CONFIG.actions),
        intelSource: getRandomItem(MOCK_DATA_CONFIG.intelSources),
        lastAttackUnit: maskOrganizationName(getRandomItem(organizations)),
        requestInfo: {
            protocol: ['http', 'https', 'ftp', 'smtp'][Math.floor(Math.random() * 4)],
            url: `example.com/api/endpoint/${Math.floor(Math.random() * 1000)}`,
            dnsName: `subdomain${Math.floor(Math.random() * 100)}.example.com`,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-Forwarded-For': getRandomIp(),
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
            attackFeatures: ['特征1：异常字符串', '特征2：恶意代码片段', '特征3：非法请求参数'][Math.floor(Math.random() * 3)],
            aiDetection: Math.random() < 0.5 ? 'hit' : 'miss' as 'hit' | 'miss'
        }
    }));

    // 将 DNS 记录和其他记录合并
    return [dnsRecord, ...remainingRecords];
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

// 在文件顶部其他辅助函数旁边添加
const getProtocolColor = (protocol: string) => {
    const colors: Record<string, string> = {
        'http': 'blue',
        'https': 'green',
        'dns': 'orange',
        'ftp': 'purple',
        'smtp': 'cyan',
    };
    return colors[protocol?.toLowerCase()] || 'default';
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
    const [selectedLog, setSelectedLog] = useState<any>(null);
    const [favoriteIps, setFavoriteIps] = useState<string[]>([]);
    const [mockData, setMockData] = useState<AttackLog[]>([]);
    const [timeModalVisible, setTimeModalVisible] = useState(false);
    const [listType, setListType] = useState<'black' | 'white'>('black');
    const [duration, setDuration] = useState<number>(0);
    const [timeUnit, setTimeUnit] = useState<string>('hour');
    const prevDurationRef = useRef<number>(0);

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
                width: 160,
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
                render: (text: string) => (
                    <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <Button
                            type="link"
                            style={{ padding: 0, minWidth: 32, marginRight: 8 }}
                            icon={favoriteIps.includes(text) ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />}
                            onClick={(e) => {
                                e.stopPropagation();
                                addToFavorites(text, 'target');
                            }}
                        />
                        <Space>
                            <Typography.Text copyable>{text}</Typography.Text>
                            <Tag color="blue">内部资产</Tag>
                        </Space>
                    </div>
                )
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
                        '低危': 'green',
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
                        >
                        </LabelSelect>
                    </Form.Item>
                </Col>
                <Col span={4}>
                    <Form.Item name="intelType" style={{ marginBottom: 0 }}>
                        <LabelSelect
                            label="情报类型"
                            allowClear
                            placeholder="请选择情报类型"
                            options={FILTER_OPTIONS.intelType.map(item => ({ label: item, value: item }))}
                        />
                    </Form.Item>
                </Col>
                <Col span={4}>
                    <Form.Item name="intelSource" style={{ marginBottom: 0 }}>
                        <LabelSelect
                            label="情报源"
                            allowClear
                            placeholder="请选择情报源"
                            options={FILTER_OPTIONS.intelSource.map(item => ({ label: item, value: item }))}
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
                    <Form.Item name="attackIp" style={{ marginBottom: 0 }}>
                        <LabelInput
                            label="攻击IP"
                            placeholder="请输入攻击IP"
                            allowClear
                        />
                    </Form.Item>
                </Col>
                <Col span={4}>
                    <Form.Item name="targetIp" style={{ marginBottom: 0 }}>
                        <LabelInput
                            label="被攻击IP"
                            placeholder="请输入被攻击IP"
                            allowClear
                        />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item name="location" style={{ marginBottom: 0 }}>
                        <LabelCascader
                            label="归属地"
                            options={locationOptions}
                            placeholder="请选择"
                        />
                    </Form.Item>
                </Col>
                <Col span={8} style={{ display: 'flex', alignItems: 'flex-end' }}>
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
                    { date: '2025年1月7日', high: 934, medium: 1498, low: 3065 },
                    { date: '2025年1月8日', high: 856, medium: 1389, low: 2987 },
                    { date: '2025年1月9日', high: 912, medium: 1456, low: 3123 },
                    { date: '2025年1月10日', high: 934, medium: 1498, low: 3065 },
                    { date: '2025年1月11日', high: 856, medium: 1389, low: 2987 },
                    { date: '2025年1月12日', high: 912, medium: 1456, low: 3123 },
                    { date: '2025年1月13日', high: 934, medium: 1498, low: 3065 },
                ]}
                intelTypeData={[
                    { type: '注入攻击', count: 3567, percentage: 35.67 },
                    { type: 'XSS攻击', count: 2845, percentage: 28.45 },
                    { type: '暴力破解', count: 1789, percentage: 17.89 },
                    { type: '僵尸网络', count: 1234, percentage: 12.34 },
                    { type: '漏洞利用', count: 565, percentage: 5.65 },
                    { type: '其他攻击', count: 432, percentage: 4.32 },
                    { type: 'SQL注入', count: 298, percentage: 2.98 },
                    { type: '命令注入', count: 256, percentage: 2.56 },
                    { type: '文件包含', count: 189, percentage: 1.89 },
                    { type: '目录遍历', count: 145, percentage: 1.45 }
                ]}
            />

            {/* 筛选和表格区域 */}
            <Card
                style={{
                    backgroundColor: 'white',
                    position: 'relative',
                    zIndex: 1
                }}
            >
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

                <div style={{ position: 'relative' }}>
                    <Table
                        columns={columns}
                        dataSource={filteredData}
                        rowSelection={{
                            selectedRowKeys: selectedRows.map(row => row.key),
                            onChange: (_, rows) => setSelectedRows(rows),
                            columnWidth: 50
                        }}
                        scroll={{
                            x: 1820,
                            scrollToFirstRowOnChange: true
                        }}
                        pagination={{
                            total: filteredData.length,
                            pageSize: 10,
                            showSizeChanger: true,
                            showQuickJumper: true,
                            showTotal: (total) => `共 ${total} 条记录`,
                        }}
                        className="attack-logs-table"
                    />
                </div>
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
                width="clamp(1000px, 50%, 100%)"
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
                                        <AttackPathVisualization
                                            attackerInfo={{
                                                ip: selectedLog?.attackIp || '',
                                                time: selectedLog?.time || '',
                                                location: selectedLog?.location || '',
                                            }}
                                            deviceInfo={{
                                                intelType: selectedLog?.intelType || '',
                                                rule: selectedLog?.rule || '未知规则',
                                                intelSource: selectedLog?.intelSource || '',
                                            }}
                                            victimInfo={{
                                                ip: selectedLog?.targetIp || '',
                                                port: selectedLog?.targetPort || '',
                                                assetGroup: selectedLog?.assetGroup || '默认资产组',
                                            }}
                                            threatLevel={selectedLog?.threatLevel || ''}
                                            action={selectedLog?.action || ''}
                                            onAddToBlacklist={(ip) => {
                                                setSelectedLog({ ...selectedLog, attackIp: ip });
                                                setListType('black');
                                                setTimeModalVisible(true);
                                            }}
                                            onAddToWhitelist={(ip) => {
                                                setSelectedLog({ ...selectedLog, attackIp: ip });
                                                setListType('white');
                                                setTimeModalVisible(true);
                                            }}
                                        />
                                    </Card>

                                    <Card title="请求地址">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'space-between' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <Tag color={getProtocolColor(selectedLog?.requestInfo?.protocol || '')}>
                                                    {selectedLog?.requestInfo?.protocol || 'unknown'}
                                                </Tag>
                                                <Typography.Text copyable>
                                                    {selectedLog?.requestInfo?.url || selectedLog?.requestInfo?.dnsName || selectedLog?.targetIp || ''}
                                                </Typography.Text>
                                                {selectedLog?.responseInfo?.statusCode && (
                                                    <Tag
                                                        color={
                                                            selectedLog.responseInfo.statusCode < 300 ? 'success' :
                                                                selectedLog.responseInfo.statusCode < 400 ? 'warning' :
                                                                    'error'
                                                        }
                                                    >
                                                        {selectedLog.responseInfo.statusCode}
                                                    </Tag>
                                                )}
                                            </div>
                                            <Button type="link">下载PCAP包</Button>
                                        </div>
                                    </Card>

                                    {(selectedLog?.dnsResponse || selectedLog?.requestInfo?.protocol === 'dns') && (
                                        <Card title="DNS响应">
                                            <Tabs
                                                items={[
                                                    {
                                                        key: 'header',
                                                        label: '报文头',
                                                        children: (
                                                            <Descriptions bordered column={2} size="small">
                                                                <Descriptions.Item label="报文标识">
                                                                    {selectedLog?.dnsResponse?.header.id}
                                                                </Descriptions.Item>
                                                                <Descriptions.Item label="响应标志">
                                                                    {selectedLog?.dnsResponse?.header.qr ? '响应' : '查询'}
                                                                </Descriptions.Item>
                                                                <Descriptions.Item label="操作码">
                                                                    {selectedLog?.dnsResponse?.header.opcode}
                                                                </Descriptions.Item>
                                                                <Descriptions.Item label="权威应答">
                                                                    {selectedLog?.dnsResponse?.header.aa ? '是' : '否'}
                                                                </Descriptions.Item>
                                                                <Descriptions.Item label="截断标志">
                                                                    {selectedLog?.dnsResponse?.header.tc ? '是' : '否'}
                                                                </Descriptions.Item>
                                                                <Descriptions.Item label="期望递归">
                                                                    {selectedLog?.dnsResponse?.header.rd ? '是' : '否'}
                                                                </Descriptions.Item>
                                                                <Descriptions.Item label="递归可用">
                                                                    {selectedLog?.dnsResponse?.header.ra ? '是' : '否'}
                                                                </Descriptions.Item>
                                                                <Descriptions.Item label="返回码">
                                                                    {selectedLog?.dnsResponse?.header.rcode}
                                                                </Descriptions.Item>
                                                                <Descriptions.Item label="问题数">
                                                                    {selectedLog?.dnsResponse?.header.qdcount}
                                                                </Descriptions.Item>
                                                                <Descriptions.Item label="回答数">
                                                                    {selectedLog?.dnsResponse?.header.ancount}
                                                                </Descriptions.Item>
                                                                <Descriptions.Item label="授权数">
                                                                    {selectedLog?.dnsResponse?.header.nscount}
                                                                </Descriptions.Item>
                                                                <Descriptions.Item label="附加数">
                                                                    {selectedLog?.dnsResponse?.header.arcount}
                                                                </Descriptions.Item>
                                                            </Descriptions>
                                                        ),
                                                    },
                                                    {
                                                        key: 'answers',
                                                        label: '应答记录',
                                                        children: (
                                                            <Table
                                                                dataSource={selectedLog?.dnsResponse?.answers.map((item: { name: string; type: string; ttl: number; data: string }, index: number) => ({ ...item, key: index }))}
                                                                columns={[
                                                                    { title: '域名', dataIndex: 'name', key: 'name' },
                                                                    { title: '记录类型', dataIndex: 'type', key: 'type' },
                                                                    { title: 'TTL', dataIndex: 'ttl', key: 'ttl' },
                                                                    { title: '记录值', dataIndex: 'data', key: 'data' },
                                                                ]}
                                                                pagination={false}
                                                                size="small"
                                                            />
                                                        ),
                                                    },
                                                    {
                                                        key: 'authority',
                                                        label: '权威记录',
                                                        children: (
                                                            <Table
                                                                dataSource={selectedLog?.dnsResponse?.authority.map((item: { name: string; type: string; ttl: number; data: string }, index: number) => ({ ...item, key: index }))}
                                                                columns={[
                                                                    { title: '域名', dataIndex: 'name', key: 'name' },
                                                                    { title: '记录类型', dataIndex: 'type', key: 'type' },
                                                                    { title: 'TTL', dataIndex: 'ttl', key: 'ttl' },
                                                                    { title: '记录值', dataIndex: 'data', key: 'data' },
                                                                ]}
                                                                pagination={false}
                                                                size="small"
                                                            />
                                                        ),
                                                    },
                                                    {
                                                        key: 'additional',
                                                        label: '附加记录',
                                                        children: (
                                                            <Table
                                                                dataSource={selectedLog?.dnsResponse?.additional.map((item: { name: string; type: string; ttl: number; data: string }, index: number) => ({ ...item, key: index }))}
                                                                columns={[
                                                                    { title: '域名', dataIndex: 'name', key: 'name' },
                                                                    { title: '记录类型', dataIndex: 'type', key: 'type' },
                                                                    { title: 'TTL', dataIndex: 'ttl', key: 'ttl' },
                                                                    { title: '记录值', dataIndex: 'data', key: 'data' },
                                                                ]}
                                                                pagination={false}
                                                                size="small"
                                                            />
                                                        ),
                                                    },
                                                ]}
                                            />
                                        </Card>
                                    )}

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

                                    {selectedLog?.responseInfo && (
                                        <Card title="响应信息">
                                            <Tabs
                                                items={[
                                                    {
                                                        key: 'headers',
                                                        label: '响应头',
                                                        children: (
                                                            <Table
                                                                columns={[
                                                                    { title: '名称', dataIndex: 'name', key: 'name' },
                                                                    { title: '值', dataIndex: 'value', key: 'value' },
                                                                ]}
                                                                dataSource={Object.entries(selectedLog.responseInfo.headers).map(([key, value], index: number) => ({
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
                                                        label: '响应体',
                                                        children: (
                                                            <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                                                                {selectedLog.responseInfo.body ? JSON.stringify(selectedLog.responseInfo.body, null, 2) : ''}
                                                            </pre>
                                                        ),
                                                    },
                                                ]}
                                            />
                                        </Card>
                                    )}

                                    {selectedLog?.localVerification && (
                                        <Card title="二次本地校准">
                                            <Descriptions column={2}>
                                                <Descriptions.Item label="规则名称">{selectedLog.localVerification.ruleName}</Descriptions.Item>
                                                <Descriptions.Item label="规则号">{selectedLog.localVerification.protocolNumber}</Descriptions.Item>
                                                <Descriptions.Item label="协议类型">{selectedLog.localVerification.protocolType}</Descriptions.Item>
                                                <Descriptions.Item label="攻击类型">{selectedLog.localVerification.attackType}</Descriptions.Item>
                                                <Descriptions.Item label="畸形包长度">{selectedLog.localVerification.malformedPacketLength}</Descriptions.Item>
                                                <Descriptions.Item label="攻击特征">{selectedLog.localVerification.attackFeatures}</Descriptions.Item>
                                                <Descriptions.Item label="AI检测引擎">
                                                    {selectedLog.localVerification.aiDetection === 'hit' ? '命中' : '未命中'}
                                                </Descriptions.Item>
                                            </Descriptions>
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

export default AttackLogs;
