// 1. 引入
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Card, Table, Button, Space, Form, Row, Col, Modal, message, Typography, Tag, Drawer, Input, InputNumber, Radio, Empty, Tabs, Descriptions, Carousel, Skeleton } from 'antd';
import { StarOutlined, StarFilled, SearchOutlined, ReloadOutlined, SaveOutlined, ExportOutlined, DeleteOutlined, CopyOutlined, ApartmentOutlined, GlobalOutlined, ApiOutlined, LeftOutlined, RightOutlined, UpOutlined, DownOutlined, CalendarOutlined, LinkOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import LabelSelect from '@/components/LabelSelect';
import LabelInput from '@/components/LabelInput';
import ExternalPathVisualization from '@/components/ExternalPathVisualization';
import ExternalTrendCard from '@/components/ExternalTrendCard';
import { useNavigate } from 'react-router-dom';

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
    dnsResponse?: {
        header: {
            id: string;
            qr: boolean;
            opcode: string;
            aa: boolean;
            tc: boolean;
            rd: boolean;
            ra: boolean;
            rcode: string;
            qdcount: number;
            ancount: number;
            nscount: number;
            arcount: number;
        };
        answers: { name: string; type: string; ttl: number; data: string }[];
        authority: { name: string; type: string; ttl: number; data: string }[];
        additional: { name: string; type: string; ttl: number; data: string }[];
    };
}

// 定义时间单位类型
interface TimeUnit {
    label: string;
    value: string;
    multiplier: number;
}

// 4. Mock数据和常量
const TARGET_TYPES = [
    '僵尸网络类',
    '挖矿软件类',
    '恶意代码下载',
    '社工钓鱼类',
    '后门软件',
    '黑客工具',
    '漏洞利用类',
    '流氓程序',
    '勒索软件类',
    '蠕虫',
    '远控木马类',
    '窃密木马类',
    '普通木马',
    'APT攻击类',
    '其他类型'
];

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
    intelTypes: [
        '网络爬虫',
        '命令注入',
        '代码注入',
        'SQL注入',
        'LDAP注入',
        'XPATH注入',
        'XML注入',
        'SSI注入',
        '跨站脚本攻击',
        '组件漏洞攻击',
        '未授权访问',
        '认证和授权漏洞',
        '反序列化漏洞',
        'webshell',
        '文件包含',
        '主机扫描攻击',
        '主机权限提升',
        '操作系统漏洞',
        '应用程序漏洞',
        'WEB应用漏洞',
        '数据库漏洞',
        '网络设备漏洞',
        '安全产品漏洞',
        '智能设备漏洞',
        '区块链漏洞',
        '工业控制系统漏洞',
        '应用程序暴力破解攻击',
        '操作系统暴力破解攻击',
        '网络设备暴力破解攻击',
        '数据库暴力破解',
        '隐蔽隧道',
        '后门攻击',
        '木马蠕虫攻击',
        'DNS恶意请求攻击',
        '敏感信息泄露',
        '黑客工具特征',
        '主机失陷',
        '异常连接',
        '未公开漏洞攻击',
        'HTTP请求走私',
        '挖矿行为',
        '会话劫持',
        '应用层拒绝服务攻击',
        '网络层拒绝服务攻击',
        '临时Email邮箱通信'
    ],
    threatLevels: ['高危', '中危', '低危'],
    actions: ['阻断', '监控'],
    intelSources: ['公有情报源', '私有情报源', '第三方情报源', '自建情报源'],
};

const generateMockData = (): AttackLog[] => {
    const getRandomItem = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
    const getRandomNumber = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
    const getRandomIp = () => Array.from({ length: 4 }, () => getRandomNumber(0, 255)).join('.');
    const getRandomDomain = () => `${Math.random().toString(36).substring(7)}.example.com`;

    const targetTypes = TARGET_TYPES;
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

    return Array.from({ length: 100 }, (_, index) => {
        // 确保第一条是DNS请求
        const isFirstRecord = index === 0;
        const protocol = isFirstRecord ? 'dns' : getRandomItem(['http', 'https', 'dns', 'tcp', 'udp']);

        return {
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
                protocol,
                url: `https://${getRandomDomain()}/api/v1/${getRandomItem(['users', 'orders', 'products'])}`,
                dnsName: getRandomDomain(),
                method: ['GET', 'POST', 'PUT', 'DELETE'][Math.floor(Math.random() * 4)],
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
            },
            dnsResponse: {
                header: {
                    id: getRandomItem(['12345678', '23456789', '34567890']),
                    qr: Math.random() > 0.5,
                    opcode: getRandomItem(['QUERY', 'IQUERY', 'STATUS']),
                    aa: Math.random() > 0.5,
                    tc: Math.random() > 0.5,
                    rd: Math.random() > 0.5,
                    ra: Math.random() > 0.5,
                    rcode: getRandomItem(['NOERROR', 'FORMERR', 'SERVFAIL', 'NXDOMAIN', 'NOTIMP']),
                    qdcount: getRandomNumber(1, 10),
                    ancount: getRandomNumber(0, 10),
                    nscount: getRandomNumber(0, 10),
                    arcount: getRandomNumber(0, 10)
                },
                answers: Array.from({ length: getRandomNumber(0, 5) }, () => ({
                    name: getRandomItem(['example.com', 'subdomain.example.com', 'thirdlevel.example.com']),
                    type: getRandomItem(['A', 'AAAA', 'CNAME', 'MX', 'NS', 'TXT']),
                    ttl: getRandomNumber(100, 3600),
                    data: getRandomIp()
                })),
                authority: Array.from({ length: getRandomNumber(0, 5) }, () => ({
                    name: getRandomItem(['example.com', 'subdomain.example.com', 'thirdlevel.example.com']),
                    type: getRandomItem(['NS', 'CNAME']),
                    ttl: getRandomNumber(100, 3600),
                    data: getRandomIp()
                })),
                additional: Array.from({ length: getRandomNumber(0, 5) }, () => ({
                    name: getRandomItem(['example.com', 'subdomain.example.com', 'thirdlevel.example.com']),
                    type: getRandomItem(['A', 'AAAA', 'CNAME', 'MX', 'NS', 'TXT']),
                    ttl: getRandomNumber(100, 3600),
                    data: getRandomIp()
                }))
            }
        };
    });
};

const FILTER_OPTIONS = {
    hitType: ['情报命中', '规则命中', 'AI检测', '行为分析'],
    action: MOCK_DATA_CONFIG.actions,
    targetType: TARGET_TYPES,
    threatLevel: MOCK_DATA_CONFIG.threatLevels,
};

// 5. 组件定义
const ExternalLogs: React.FC = () => {
    const navigate = useNavigate();
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

    // 添加IP溯源相关的状态
    const [currentVendorPage, setCurrentVendorPage] = useState(0);
    const [activeTraceTab, setActiveTraceTab] = useState('fingerprint');
    const carouselRef = useRef<any>(null);

    // 添加tabs切换处理函数
    const handleTraceTabChange = (key: string) => {
        setActiveTraceTab(key);
        // 重置厂商轮播状态
        setCurrentVendorPage(0);
        // 重置Carousel到第一页
        if (carouselRef.current) {
            carouselRef.current.goTo(0);
        }
    };

    // 添加useEffect来确保在tabs切换时正确重置Carousel
    useEffect(() => {
        if (carouselRef.current) {
            carouselRef.current.goTo(0);
        }
        setCurrentVendorPage(0);
    }, [activeTraceTab]);

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
        setSelectedLog: (log: any) => void
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
                render: (ip: string) => {
                    const renderIpWithLink = (ip: string, type: 'attack' | 'target', showStar = true, showAssetTag = false) => (
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
                                <Typography.Link onClick={() => navigate('/controlled-host')} copyable>
                                    {ip}
                                </Typography.Link>
                                {showAssetTag && <Tag color="blue" style={{ whiteSpace: 'nowrap' }}>全局资产</Tag>}
                            </div>
                        </div>
                    );
                    return renderIpWithLink(ip, 'attack', true, true);
                },
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
                width: 240,
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
    const columns = getTableColumns(addToFavorites, setSelectedLog);
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

    // 添加RecordDisplay组件
    const RecordDisplay: React.FC<{
        leftRecords: { label: string; value: string }[];
        rightRecords: { label: string; value: string }[];
        leftStartNumber?: number;
        rightStartNumber?: number;
    }> = ({ leftRecords, rightRecords, leftStartNumber = 1, rightStartNumber = 5 }) => {
        const renderNumberColumn = (start: number, count: number) => (
            <Col span={1} style={{ maxWidth: 30 }}>
                <div style={{ width: 24, backgroundColor: '#E3F1FD', textAlign: 'center', padding: 4, borderRadius: 4, color: '#999' }}>
                    {[...Array(count)].map((_, i) => (
                        <div key={i}>{start + i}</div>
                    ))}
                </div>
            </Col>
        );

        const renderRecordColumn = (records: { label: string; value: string }[]) => (
            <>
                <Col span={3}>
                    <div style={{ padding: 4, color: '#999' }}>
                        {records.map((record, i) => (
                            <div key={i}>{record.label}</div>
                        ))}
                    </div>
                </Col>
                <Col span={8}>
                    <div style={{ padding: 4 }}>
                        {records.map((record, i) => (
                            <div key={i}>{record.value}</div>
                        ))}
                    </div>
                </Col>
            </>
        );

        return (
            <div style={{ fontSize: 14, color: '#333', fontWeight: 400, backgroundColor: '#F7FBFF', padding: '12px 16px', borderRadius: 4, border: '1px solid #f3f3f3' }}>
                <Row gutter={[24, 24]} style={{ borderRadius: 4 }}>
                    {renderNumberColumn(leftStartNumber, leftRecords.length)}
                    {renderRecordColumn(leftRecords)}
                    {renderNumberColumn(rightStartNumber, rightRecords.length)}
                    {renderRecordColumn(rightRecords)}
                </Row>
            </div>
        );
    };

    // 添加TagList组件
    const TagList: React.FC<{
        title: string;
        tags: string[];
        maxDisplayCount?: number;
    }> = ({ title, tags, maxDisplayCount = 10 }) => {
        const [expanded, setExpanded] = useState(false);
        const shouldShowExpand = tags.length > maxDisplayCount;
        const displayTags = expanded ? tags : tags.slice(0, maxDisplayCount);

        return (
            <div style={{ marginBottom: 16 }}>
                <Row wrap={false} align="middle">
                    <Col flex="120px">
                        <span style={{ color: '#666' }}>{title}</span>
                    </Col>
                    <Col flex="auto">
                        <Space size={[8, 8]} wrap style={{ display: 'flex', flexWrap: 'wrap' }}>
                            {displayTags.map((tag, index) => (
                                <Tag key={index} color="blue">{tag}</Tag>
                            ))}
                            {shouldShowExpand && (
                                <Button
                                    type="link"
                                    size="small"
                                    onClick={() => setExpanded(!expanded)}
                                    style={{ padding: '0 4px' }}
                                >
                                    {expanded ? '收起' : '展开全部'}
                                </Button>
                            )}
                        </Space>
                    </Col>
                </Row>
            </div>
        );
    };

    // 添加PortCard组件
    const PortCard: React.FC<{
        port: number;
        time: string;
        protocol: string;
        serviceName: string;
        version: string;
    }> = ({ port, time, protocol, serviceName, version }) => {
        return (
            <div style={{
                padding: '16px 0',
                border: '1px solid #f3f3f3',
                borderRadius: 6,
                minWidth: 320,
            }}>
                <Row>
                    <Col style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        padding: '0 16px'
                    }}>
                        <div style={{ fontSize: 16, fontWeight: 500, color: '#333' }}>端口</div>
                        <div style={{ fontSize: 30, color: '#0E7CFD', marginTop: 16, fontWeight: 700 }}>{port}</div>
                        <div style={{
                            position: 'absolute',
                            right: 0,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: 1,
                            height: '100%',
                            backgroundColor: '#f3f3f3'
                        }} />
                    </Col>
                    <Col style={{ padding: '0 32px 0 16px' }}>
                        <Space direction="vertical" size={8} style={{ width: '100%' }}>
                            <div>
                                <CalendarOutlined style={{ marginRight: 8 }} />
                                {time}
                            </div>
                            <div>服务协议：{protocol}</div>
                            <div>服务名称：{serviceName || '-'}</div>
                            <div>版本信息：{version || '-'}</div>
                        </Space>
                    </Col>
                </Row>
            </div >
        );
    };

    // 添加tabs内容渲染函数
    const renderDNSRecords = () => {
        const leftRecords = [
            { label: 'A:', value: '156.254.127.112' },
            { label: 'AAAA:', value: '-' },
            { label: 'NS:', value: '-' },
            { label: 'MX:', value: '-' }
        ];

        const rightRecords = [
            { label: 'TXT:', value: '156.254.127.112' },
            { label: 'SOA:', value: '-' },
            { label: 'CNAME:', value: '-' }
        ];

        return <RecordDisplay leftRecords={leftRecords} rightRecords={rightRecords} />;
    };

    const renderWhois = () => {
        const leftRecords = [
            { label: '注册者:', value: 'REDACTED FOR PRIVACY' },
            { label: '注册机构:', value: 'REDACTED FOR PRIVACY' },
            { label: '邮箱:', value: '信息已设置隐私保护' },
            { label: '地址:', value: 'Redacted for Privacy Purposes' },
            { label: '电话:', value: 'ALLOCATED UNSPECIFIED REDACTED FOR PRIVACY' }
        ];

        const rightRecords = [
            { label: '注册时间:', value: '2024-02-29 06:11:09' },
            { label: '过期时间:', value: '2024-02-29 06:11:09' },
            { label: '更新时间:', value: '2024-02-29 06:11:09' },
            { label: '域名服务商:', value: 'Chengdu west dimension digital technology Co., LTD' },
            { label: '域名服务器:', value: 'ns3.4cun.com; ns4.4cun.com' }
        ];

        return <RecordDisplay
            leftRecords={leftRecords}
            rightRecords={rightRecords}
            leftStartNumber={1}
            rightStartNumber={6}
        />;
    };

    const renderSubdomains = () => {
        return (
            <Table
                columns={[
                    {
                        title: '域名',
                        dataIndex: 'domain',
                        key: 'domain',
                        width: '30%',
                    },
                    {
                        title: '威胁等级',
                        dataIndex: 'threatLevel',
                        key: 'threatLevel',
                        width: '20%',
                    },
                    {
                        title: '创建时间',
                        dataIndex: 'firstParseTime',
                        key: 'firstParseTime',
                        width: '25%',
                    },
                    {
                        title: '更新时间',
                        dataIndex: 'lastParseTime',
                        key: 'lastParseTime',
                        width: '25%',
                    }
                ]}
                dataSource={[
                    {
                        key: '1',
                        domain: 'mail.example.com',
                        threatLevel: <Tag color="red">高危</Tag>,
                        firstParseTime: '2024-01-15 08:30:00',
                        lastParseTime: '2024-02-29 10:15:23'
                    },
                    {
                        key: '2',
                        domain: 'api.example.com',
                        threatLevel: <Tag color="orange">中危</Tag>,
                        firstParseTime: '2024-01-16 09:45:12',
                        lastParseTime: '2024-02-29 11:20:45'
                    },
                    {
                        key: '3',
                        domain: 'blog.example.com',
                        threatLevel: <Tag color="red">高危</Tag>,
                        firstParseTime: '2024-01-17 14:22:33',
                        lastParseTime: '2024-02-29 09:05:18'
                    },
                    {
                        key: '4',
                        domain: 'dev.example.com',
                        threatLevel: <Tag color="green">低危</Tag>,
                        firstParseTime: '2024-01-18 16:40:55',
                        lastParseTime: '2024-02-29 08:30:42'
                    }
                ]}
                pagination={{
                    total: 4,
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total) => `共 ${total} 条记录`,
                }}
            />
        );
    };

    const renderFingerprint = () => {
        const fingerprintData = {
            assetTags: [
                'Windows Server', 'IIS 8.5', 'Microsoft-HTTPAPI/2.0',
                'ASP.NET', '.NET Framework 4.0', 'Windows Server 2012',
                'Microsoft SQL Server 2014', 'Windows防火墙', 'Windows更新服务',
                'Remote Desktop Services', 'Windows Management Instrumentation',
                'Windows任务计划程序', 'Windows事件日志'
            ],
            components: [
                'jQuery 1.12.4', 'Bootstrap 3.3.7', 'Vue.js 2.6.11',
                'Axios 0.19.2', 'Moment.js 2.24.0', 'Lodash 4.17.15',
                'ECharts 4.7.0', 'React 16.13.1', 'Webpack 4.42.0',
                'Node.js 12.16.1'
            ],
            titles: [
                '登录页面', '系统管理', '用户管理', '权限管理',
                '日志查询', '数据统计', '监控中心', '配置中心',
                '任务管理', '资源管理'
            ],
            certificates: [
                'DigiCert SHA2 Secure Server CA', 'Let\'s Encrypt Authority X3',
                'Symantec Class 3 EV SSL CA', 'GlobalSign Organization Validation CA',
                'Comodo RSA Domain Validation Secure Server CA'
            ]
        };

        return (
            <div>
                <TagList title="资产标签" tags={fingerprintData.assetTags} />
                <TagList title="组件信息" tags={fingerprintData.components} />
                <TagList title="网站标题" tags={fingerprintData.titles} />
                <TagList title="HTTPS证书" tags={fingerprintData.certificates} />
            </div>
        );
    };

    const renderPorts = () => {
        const [expanded, setExpanded] = useState(false);

        const portsData = [
            { port: 21, time: '2023-12-01 15:30:00', protocol: 'FTP', serviceName: 'vsftpd', version: '3.0.3' },
            { port: 22, time: '2023-12-01 15:30:00', protocol: 'SSH', serviceName: 'OpenSSH', version: '8.2p1' },
            { port: 80, time: '2023-12-01 15:30:00', protocol: 'HTTP', serviceName: 'nginx', version: '1.18.0' },
            { port: 443, time: '2023-12-01 15:30:00', protocol: 'HTTPS', serviceName: 'nginx', version: '1.18.0' },
            { port: 3306, time: '2023-12-01 15:30:00', protocol: 'MySQL', serviceName: 'MySQL', version: '8.0.23' },
            { port: 6379, time: '2023-12-01 15:30:00', protocol: 'Redis', serviceName: 'Redis', version: '6.0.9' },
            { port: 8080, time: '2023-12-01 15:30:00', protocol: 'HTTP', serviceName: 'Tomcat', version: '9.0.41' },
            { port: 9000, time: '2023-12-01 15:30:00', protocol: 'HTTP', serviceName: '', version: '' },
            { port: 9090, time: '2023-12-01 15:30:00', protocol: 'HTTP', serviceName: '', version: '' },
            { port: 27017, time: '2023-12-01 15:30:00', protocol: 'MongoDB', serviceName: 'MongoDB', version: '4.4.3' }
        ];

        // 根据展开状态决定显示全部端口数据还是仅显示前5个
        const displayPorts = expanded ? portsData : portsData.slice(0, 4);

        return (
            // 外层容器，使用相对定位以便放置展开/收起按钮
            <div style={{ position: 'relative' }}>
                <Row gutter={[24, 24]} style={{
                    marginBottom: portsData.length > 5 ? 16 : 0,
                }}>
                    {displayPorts.map((port, index) => (
                        <Col key={index} span={12} style={{ paddingLeft: 12, paddingRight: 12 }}>
                            <PortCard {...port} />
                        </Col>
                    ))}
                </Row>

                {/* 当端口数据超过5条时显示展开/收起按钮 */}
                {portsData.length > 4 && (
                    <div style={{
                        // 使用绝对定位将按钮固定在底部中间
                        position: 'absolute',
                        bottom: -32,
                        left: '50%',
                        transform: 'translateX(-50%)',  // 水平居中对齐
                        cursor: 'pointer',
                        color: '#0E7CFD'
                    }}
                        onClick={() => setExpanded(!expanded)}
                    >
                        {/* 根据展开状态显示向上或向下箭头图标 */}
                        {expanded ? <UpOutlined /> : <DownOutlined />}
                    </div>
                )}
            </div>
        );
    };

    // 添加同C段信息渲染函数
    const renderCSegment = () => {
        return (
            <Table
                columns={[
                    {
                        title: 'IP地址',
                        dataIndex: 'ip',
                        key: 'ip',
                    },
                    {
                        title: '威胁等级',
                        dataIndex: 'threatLevel',
                        key: 'threatLevel',
                        render: (level) => {
                            const colors: Record<string, string> = {
                                '高危': 'red',
                                '中危': 'orange',
                                '低危': 'green'
                            };
                            return <Tag color={colors[level]}>{level}</Tag>;
                        }
                    },
                    {
                        title: '情报类型',
                        dataIndex: 'intelType',
                        key: 'intelType',
                    },
                    {
                        title: '归属地',
                        dataIndex: 'location',
                        key: 'location',
                        render: ({ country, city }) => {
                            return (
                                <Space>
                                    <span>{country} | {city}</span>
                                </Space>
                            );
                        },
                    },
                    {
                        title: '创建时间',
                        dataIndex: 'firstAttackTime',
                        key: 'firstAttackTime',
                    },
                    {
                        title: '更新时间',
                        dataIndex: 'updateTime',
                        key: 'updateTime',
                    }
                ]}
                dataSource={[
                    {
                        key: '1',
                        ip: '156.254.127.100',
                        threatLevel: '高危',
                        intelType: '恶意扫描',
                        location: {
                            country: '美国',
                            city: '纽约'
                        },
                        firstAttackTime: '2023-12-01 15:30:00',
                        updateTime: '2023-12-05 10:20:00'
                    },
                    {
                        key: '2',
                        ip: '156.254.127.101',
                        threatLevel: '中危',
                        intelType: 'DDoS攻击',
                        location: {
                            country: '中国',
                            city: '北京'
                        },
                        firstAttackTime: '2023-11-28 09:15:00',
                        updateTime: '2023-12-04 16:45:00'
                    },
                    {
                        key: '3',
                        ip: '156.254.127.102',
                        threatLevel: '高危',
                        intelType: '漏洞利用',
                        location: {
                            country: '俄罗斯',
                            city: '莫斯科'
                        },
                        firstAttackTime: '2023-11-25 14:20:00',
                        updateTime: '2023-12-03 11:30:00'
                    },
                    {
                        key: '4',
                        ip: '156.254.127.103',
                        threatLevel: '低危',
                        intelType: '可疑流量',
                        location: {
                            country: '英国',
                            city: '伦敦'
                        },
                        firstAttackTime: '2023-11-20 08:40:00',
                        updateTime: '2023-12-02 09:15:00'
                    }
                ]}
                pagination={{
                    total: 4,
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total) => `共 ${total} 条记录`,
                }}
            />
        );
    };

    // 更新tabs内容 - 去掉attackPath
    const tabContents = {
        fingerprint: renderFingerprint(),
        ports: renderPorts(),
        cSegment: renderCSegment()
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
                    <Form.Item name="sourcePort" style={{ marginBottom: 0 }}>
                        <LabelInput
                            label="源端口"
                            placeholder="请输入源端口"
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
                    <Form.Item name="destinationPort" style={{ marginBottom: 0 }}>
                        <LabelInput
                            label="目的端口"
                            placeholder="请输入目的端口"
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
            <Card
                style={{
                    backgroundColor: 'white',
                    position: 'relative',
                    zIndex: 2
                }}
            >
                {renderFilterForm()}
                {selectedRows.length > 0 && (
                    <div style={{ marginBottom: 16 }}>
                        <Space>
                            <Button icon={<ExportOutlined />}>导出</Button>
                            <Button icon={<DeleteOutlined />} onClick={() => setSelectedRows([])}>清空</Button>
                        </Space>
                    </div>
                )}

                <div
                    style={{
                        position: 'relative',
                        zIndex: 1
                    }}
                >
                    <Table
                        columns={columns}
                        dataSource={filteredData}
                        rowSelection={{
                            selectedRowKeys: selectedRows.map(row => row.key),
                            onChange: (_, rows) => setSelectedRows(rows),
                            columnWidth: 50
                        }}
                        scroll={{ x: 1820 }}
                        pagination={{
                            total: filteredData.length,
                            pageSize: 10,
                            showSizeChanger: true,
                            showQuickJumper: true,
                            showTotal: (total) => `共 ${total} 条记录`,
                        }}
                        className="external-logs-table"
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

            {/* 详情页抽屉组件 */}
            <Drawer
                title={
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography.Title level={4} style={{ margin: 0, fontSize: '18px' }}>外联日志详情</Typography.Title>
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
                                            url={selectedLog?.requestInfo?.url || selectedLog?.externalDomain || ''}
                                            method={!['dns', 'tcp', 'udp'].includes(selectedLog?.requestInfo?.protocol || '') ? selectedLog?.requestInfo?.method : undefined}
                                            statusCode={!['dns', 'tcp', 'udp'].includes(selectedLog?.requestInfo?.protocol || '') ? selectedLog?.responseInfo?.statusCode : undefined}
                                        />
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
                                </Space>
                            ),
                        },
                        {
                            key: 'ipTrace',
                            label: '外联溯源',
                            children: (
                                <Space direction="vertical" style={{ width: '100%' }} size="large">
                                    {/* 威胁情报详情卡片 */}
                                    <Card styles={{ body: { padding: '24px' } }}>
                                        <Row gutter={[24, 24]} align="middle">
                                            <Col span={4}>
                                                <img
                                                    src="/images/ThreatOut.png"
                                                    alt="威胁分数"
                                                    style={{ width: '100%' }}
                                                />
                                            </Col>
                                            <Col span={20}>
                                                <Row gutter={[0, 16]}>
                                                    <Col span={24}>
                                                        <div style={{ marginBottom: 8 }}>
                                                            <Row justify="space-between" align="middle">
                                                                <Col>
                                                                    <Space size={36} align="center">
                                                                        <Space align="center">
                                                                            <span style={{ fontSize: 24, fontWeight: 500, display: 'flex', alignItems: 'center' }}>
                                                                                {selectedLog?.destinationIp || '192.168.1.100'}
                                                                                <CopyOutlined
                                                                                    style={{ cursor: 'pointer', color: '#1890ff', fontSize: 14, marginLeft: 8 }}
                                                                                    onClick={() => {
                                                                                        navigator.clipboard.writeText(selectedLog?.destinationIp || '192.168.1.100');
                                                                                        message.success('IP已复制到剪贴板');
                                                                                    }}
                                                                                />
                                                                            </span>
                                                                        </Space>
                                                                    </Space>
                                                                </Col>
                                                                <Col>
                                                                    <Button>
                                                                        误报反馈
                                                                    </Button>
                                                                </Col>
                                                            </Row>
                                                        </div>
                                                        <Space size={8} wrap>
                                                            <Tag color="blue">SQL注入</Tag>
                                                            <Tag color="blue">XSS攻击</Tag>
                                                            <Tag color="blue">DDoS攻击</Tag>
                                                            <Tag color="blue">暴力破解</Tag>
                                                        </Space>
                                                    </Col>
                                                    <Col span={24}>
                                                        <Row gutter={0}>
                                                            <Col span={8}>
                                                                <div style={{
                                                                    width: '100%',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'flex-start'
                                                                }}>
                                                                    <div style={{
                                                                        width: 32,
                                                                        height: 32,
                                                                        borderRadius: '50%',
                                                                        backgroundColor: '#1890ff',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        marginRight: 8
                                                                    }}>
                                                                        <GlobalOutlined style={{ color: '#fff', fontSize: 16 }} />
                                                                    </div>
                                                                    <span style={{ color: '#999', marginRight: 8 }}>端口信息</span>
                                                                    <span style={{ color: '#1890ff', fontSize: 20, fontWeight: 500 }}>10</span>
                                                                </div>
                                                            </Col>
                                                            <Col span={8}>
                                                                <div style={{
                                                                    width: '100%',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'flex-start'
                                                                }}>
                                                                    <div style={{
                                                                        width: 32,
                                                                        height: 32,
                                                                        borderRadius: '50%',
                                                                        backgroundColor: '#1890ff',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        marginRight: 8
                                                                    }}>
                                                                        <LinkOutlined style={{ color: '#fff', fontSize: 16 }} />
                                                                    </div>
                                                                    <span style={{ color: '#999', marginRight: 8 }}>同C段信息</span>
                                                                    <span style={{ color: '#1890ff', fontSize: 20, fontWeight: 500 }}>4</span>
                                                                </div>
                                                            </Col>
                                                            <Col span={8}>
                                                                <div style={{
                                                                    width: '100%',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'flex-start'
                                                                }}>
                                                                    <div style={{
                                                                        width: 32,
                                                                        height: 32,
                                                                        borderRadius: '50%',
                                                                        backgroundColor: '#1890ff',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        marginRight: 8
                                                                    }}>
                                                                        <ApiOutlined style={{ color: '#fff', fontSize: 16 }} />
                                                                    </div>
                                                                    <span style={{ color: '#999', marginRight: 8 }}>情报厂商</span>
                                                                    <span style={{ color: '#1890ff', fontSize: 20, fontWeight: 500 }}>8</span>
                                                                </div>
                                                            </Col>
                                                        </Row>
                                                    </Col>
                                                </Row>
                                            </Col>
                                        </Row>
                                        <div style={{
                                            height: '1px',
                                            background: '#f0f0f0',
                                            margin: '16px 0 8px 0'
                                        }} />
                                        <Row>
                                            <Col flex="1">
                                                <Row gutter={[0, 16]}>
                                                    <Col span={24}>
                                                        <div style={{ position: 'relative' }}>
                                                            {/* 左侧切换按钮 */}
                                                            <div
                                                                style={{
                                                                    position: 'absolute',
                                                                    left: -40,
                                                                    top: '50%',
                                                                    transform: 'translateY(-50%)',
                                                                    width: 32,
                                                                    height: 32,
                                                                    borderRadius: '50%',
                                                                    backgroundColor: '#fff',
                                                                    border: '1px solid #d9d9d9',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    cursor: 'pointer',
                                                                    zIndex: 10,
                                                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                                                    transition: 'all 0.3s'
                                                                }}
                                                                onMouseEnter={(e) => {
                                                                    e.currentTarget.style.backgroundColor = '#f0f9ff';
                                                                    e.currentTarget.style.borderColor = '#1890ff';
                                                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(24, 144, 255, 0.15)';
                                                                }}
                                                                onMouseLeave={(e) => {
                                                                    e.currentTarget.style.backgroundColor = '#fff';
                                                                    e.currentTarget.style.borderColor = '#d9d9d9';
                                                                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                                                                }}
                                                                onClick={() => {
                                                                    if (carouselRef.current) {
                                                                        carouselRef.current.prev();
                                                                    }
                                                                }}
                                                            >
                                                                <LeftOutlined style={{ fontSize: 14, color: '#666' }} />
                                                            </div>

                                                            {/* 右侧切换按钮 */}
                                                            <div
                                                                style={{
                                                                    position: 'absolute',
                                                                    right: -40,
                                                                    top: '50%',
                                                                    transform: 'translateY(-50%)',
                                                                    width: 32,
                                                                    height: 32,
                                                                    borderRadius: '50%',
                                                                    backgroundColor: '#fff',
                                                                    border: '1px solid #d9d9d9',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    cursor: 'pointer',
                                                                    zIndex: 10,
                                                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                                                    transition: 'all 0.3s'
                                                                }}
                                                                onMouseEnter={(e) => {
                                                                    e.currentTarget.style.backgroundColor = '#f0f9ff';
                                                                    e.currentTarget.style.borderColor = '#1890ff';
                                                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(24, 144, 255, 0.15)';
                                                                }}
                                                                onMouseLeave={(e) => {
                                                                    e.currentTarget.style.backgroundColor = '#fff';
                                                                    e.currentTarget.style.borderColor = '#d9d9d9';
                                                                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                                                                }}
                                                                onClick={() => {
                                                                    if (carouselRef.current) {
                                                                        carouselRef.current.next();
                                                                    }
                                                                }}
                                                            >
                                                                <RightOutlined style={{ fontSize: 14, color: '#666' }} />
                                                            </div>

                                                            {/* 厂商数据展示 */}
                                                            <div style={{ padding: '0 0px' }}>
                                                                <Carousel
                                                                    key={`vendor-carousel-${activeTraceTab}`}
                                                                    ref={carouselRef}
                                                                    dots={false}
                                                                    arrows={false}
                                                                    autoplay={false}
                                                                    beforeChange={(from, to) => setCurrentVendorPage(to)}
                                                                    style={{
                                                                        padding: '0 40px',
                                                                        willChange: 'transform',
                                                                        transform: 'translate3d(0, 0, 0)'
                                                                    }}
                                                                    slidesToShow={3}
                                                                    slidesToScroll={1}
                                                                    infinite={true}
                                                                    responsive={[
                                                                        {
                                                                            breakpoint: 1200,
                                                                            settings: {
                                                                                slidesToShow: 3,
                                                                                slidesToScroll: 1
                                                                            }
                                                                        },
                                                                        {
                                                                            breakpoint: 768,
                                                                            settings: {
                                                                                slidesToShow: 2,
                                                                                slidesToScroll: 1
                                                                            }
                                                                        }
                                                                    ]}
                                                                >
                                                                    {[
                                                                        { logo: '/images/华为.png', name: '华为威胁情报' },
                                                                        { logo: '/images/奇安信.png', name: '奇安信威胁情报' },
                                                                        { logo: '/images/腾讯.png', name: '腾讯威胁情报' },
                                                                        { logo: '/images/360.png', name: '360威胁情报' },
                                                                        { logo: '/images/阿里.png', name: '阿里云威胁情报' },
                                                                        { logo: '/images/绿盟.png', name: '绿盟威胁情报' },
                                                                        { logo: '/images/长亭.png', name: '长亭威胁情报' },
                                                                        { logo: '/images/知道创宇.png', name: '知道创宇威胁情报' }
                                                                    ].map((vendor, index) => (
                                                                        <div key={index} style={{ padding: '0 8px' }}>
                                                                            <div style={{
                                                                                padding: '8px 0',
                                                                                marginBottom: '8px',
                                                                                height: '40px',
                                                                                position: 'relative',
                                                                                overflow: 'hidden'
                                                                            }}>
                                                                                <div style={{
                                                                                    position: 'relative',
                                                                                    width: 'fit-content',
                                                                                    margin: '0 auto',
                                                                                    height: '40px',
                                                                                    lineHeight: '40px',
                                                                                    whiteSpace: 'nowrap'
                                                                                }}>
                                                                                    <div style={{
                                                                                        position: 'absolute',
                                                                                        right: '100%',
                                                                                        top: '47%',
                                                                                        transform: 'translateY(-50%)',
                                                                                        marginRight: '12px'
                                                                                    }}>
                                                                                        <img
                                                                                            src={vendor.logo}
                                                                                            alt={vendor.name}
                                                                                            style={{
                                                                                                width: 32,
                                                                                                height: 32
                                                                                            }}
                                                                                        />
                                                                                    </div>
                                                                                    <span style={{
                                                                                        fontSize: 16,
                                                                                        fontWeight: 500,
                                                                                        whiteSpace: 'nowrap',
                                                                                        display: 'inline-block'
                                                                                    }}>
                                                                                        {vendor.name}
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                            <div>
                                                                                {[
                                                                                    {
                                                                                        label: '威胁等级', value: index === 0 ? <Tag color="red">高危</Tag> :
                                                                                            index === 1 ? <Tag color="green">低危</Tag> : <Tag color="orange">中危</Tag>
                                                                                    },
                                                                                    { label: '置信度', value: '高' },
                                                                                    { label: '情报类型', value: '恶意代码下载' },
                                                                                    { label: '情报归属', value: '公有情报源' },
                                                                                    { label: '经纬度信息', value: '30.34324,343.3434' },
                                                                                    { label: '情报相关组织', value: index === 1 ? 'APT32' : 'Lazarus' },
                                                                                    { label: '关联病毒家族', value: 'Lockbit勒索病毒' },
                                                                                    { label: '入库时间', value: '2024-12-11 12:03:44' },
                                                                                    { label: '过期时间', value: '2024-12-31 11:22:31' }
                                                                                ].map((item, idx) => (
                                                                                    <div
                                                                                        key={idx}
                                                                                        style={{
                                                                                            padding: '12px 0',
                                                                                            borderBottom: idx !== 8 ? '1px solid #f0f0f0' : 'none',
                                                                                            textAlign: 'center'
                                                                                        }}
                                                                                    >
                                                                                        <div style={{
                                                                                            color: '#666',
                                                                                            marginBottom: '8px',
                                                                                            textAlign: 'center'
                                                                                        }}>{item.label}</div>
                                                                                        <div style={{
                                                                                            textAlign: 'center'
                                                                                        }}>{item.value}</div>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </Carousel>
                                                            </div>
                                                        </div>
                                                    </Col>
                                                </Row>
                                            </Col>
                                        </Row>
                                    </Card>

                                    {/* 带tabs的卡片 */}
                                    <Card
                                        tabList={[
                                            { key: 'fingerprint', tab: '指纹信息' },
                                            { key: 'ports', tab: '端口信息' },
                                            { key: 'cSegment', tab: '同C段信息' }
                                        ]}
                                        activeTabKey={activeTraceTab}
                                        onTabChange={handleTraceTabChange}
                                    >
                                        <div>
                                            {tabContents[activeTraceTab as keyof typeof tabContents]}
                                        </div>
                                    </Card>
                                </Space>
                            ),
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
