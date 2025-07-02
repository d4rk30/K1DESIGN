import { Card, Table, Button, Space, Tag, Input, InputNumber, Row, Col, Form, Modal, message, Drawer, Typography, Tabs, Descriptions, Empty, Radio, Tooltip } from 'antd';
import { SearchOutlined, ReloadOutlined, SaveOutlined, StarOutlined, StarFilled, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as echarts from 'echarts';
import { useNavigate } from 'react-router-dom';
import OutboundTrafficVisual from '../components/OutboundTrafficVisualization';
import { US, CN, GB, FR, DE, RU, UA, SG, NL } from 'country-flag-icons/react/3x2';
import LabelCascader from '@/components/LabelCascader';
import LabelSelect from '@/components/LabelSelect';
import LabelInput from '@/components/LabelInput';
import OutboundTrendCard from '@/components/OutboundTrendCard';
import LabelRangePicker from '@/components/LabelRangePicker';

// 获取国旗组件的辅助函数
const getFlagComponent = (country: string) => {
    const componentMap: { [key: string]: any } = {
        '美国': US,
        '中国': CN,
        '英国': GB,
        '法国': FR,
        '德国': DE,
        '俄罗斯': RU,
        '乌克兰': UA,
        '新加坡': SG,
        '荷兰': NL,
    };
    return componentMap[country];
};

interface DataType {
    key: string;
    sourceIp: string;
    destinationIp: string;
    outboundDestination: string;  // 外联目的
    outboundCount: number;
    protocol: string;
    sessionStart: string;
    sessionEnd: string;
    upstreamTraffic: string;  // 上行流量
    downstreamTraffic: string;  // 下行流量
    applicationType: string;
    status: string;
    requestInfo?: {
        protocol: string;
        url: string;
        dnsName: string;
        method?: string;
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
    responseInfo?: {
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
    intelligenceHit?: boolean;
}

// 添加收藏IP的类型定义
interface FavoriteIp {
    ip: string;
    type: 'source' | 'destination';
    key: string;
}

// 时间单位接口
interface TimeUnit {
    label: string;
    value: string;
    multiplier: number;
}

// 常见应用层协议
const commonAppTypes = [
    'DNS', 'HTTP', 'HTTPS', 'FTP', 'SSH', 'SMTP', 'POP3', 'IMAP', 'TELNET', '其他'
];

const OutboundLogs: React.FC = () => {
    const navigate = useNavigate();
    const chartRef = useRef<HTMLDivElement>(null);
    const chartInstance = useRef<echarts.ECharts | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const [form] = Form.useForm();
    const [filterName, setFilterName] = useState('');
    const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
    const [isIpDrawerVisible, setIsIpDrawerVisible] = useState(false);
    const [favoriteIps, setFavoriteIps] = useState<string[]>([]);
    const [selectedLog, setSelectedLog] = useState<DataType | null>(null);
    const [isDetailVisible, setIsDetailVisible] = useState(false);
    const [timeModalVisible, setTimeModalVisible] = useState(false);
    const [listType, setListType] = useState<'black' | 'white'>('black');
    const [duration, setDuration] = useState<number>(0);
    const [timeUnit, setTimeUnit] = useState<string>('hour');
    const [targetIp, setTargetIp] = useState<string>('');
    const prevDurationRef = useRef<number>(0);
    const [selectedRows, setSelectedRows] = useState<any[]>([]);
    const [selectedRowsDetail, setSelectedRowsDetail] = useState<any[]>([]);
    const [detailFilters, setDetailFilters] = useState<{
        sourceIp: string;
        applicationTypes: string[];
        sessionTime: [dayjs.Dayjs | null, dayjs.Dayjs | null];
        status: string;
        trafficRange: [number | undefined, number | undefined];
    }>({
        sourceIp: '',
        applicationTypes: [],
        sessionTime: [null, null],
        status: '',
        trafficRange: [undefined, undefined],
    });
    const [filteredDetailData, setFilteredDetailData] = useState<any[]>([]);

    const handleTrace = (record: any) => {
        // 跳转到威胁情报溯源详情页，并传递必要的参数
        console.log("Navigating to trace for record:", record);
        navigate('/threat-intelligence-trace/detail', { state: { type: 'external', ip: record.destinationIp } });
    };

    // 外联目的地选项
    const outboundDestinationOptions = [
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
            ]
        },
        {
            value: 'asia',
            label: '亚洲',
            children: [
                { value: 'japan', label: '日本' },
                { value: 'korea', label: '韩国' },
                { value: 'singapore', label: '新加坡' },
                { value: 'thailand', label: '泰国' },
                { value: 'india', label: '印度' },
                { value: 'malaysia', label: '马来西亚' },
            ]
        },
        {
            value: 'europe',
            label: '欧洲',
            children: [
                { value: 'uk', label: '英国' },
                { value: 'france', label: '法国' },
                { value: 'germany', label: '德国' },
                { value: 'italy', label: '意大利' },
                { value: 'spain', label: '西班牙' },
                { value: 'netherlands', label: '荷兰' },
            ]
        },
        {
            value: 'america',
            label: '美洲',
            children: [
                { value: 'usa', label: '美国' },
                { value: 'canada', label: '加拿大' },
                { value: 'brazil', label: '巴西' },
                { value: 'mexico', label: '墨西哥' },
                { value: 'argentina', label: '阿根廷' },
                { value: 'chile', label: '智利' },
            ]
        }
    ];

    const columns: ColumnsType<DataType> = [
        {
            title: '目的IP',
            dataIndex: 'destinationIp',
            key: 'destinationIp',
            width: 160,
            render: (ip: string) => (
                <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <Button
                        type="link"
                        style={{ padding: 0, minWidth: 32, marginRight: 8 }}
                        icon={favoriteIps.includes(ip) ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />}
                        onClick={(e) => {
                            e.stopPropagation();
                            addToFavorites(ip, 'destination');
                        }}
                    />
                    <Typography.Text copyable>{ip}</Typography.Text>
                </div>
            ),
        },
        {
            title: '目的地址',
            dataIndex: 'outboundDestination',
            key: 'outboundDestination',
            width: 180,
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
            title: '连接次数',
            dataIndex: 'outboundCount',
            key: 'outboundCount',
            width: 90,
            sorter: (a, b) => a.outboundCount - b.outboundCount,
        },
        {
            title: '是否命中情报',
            dataIndex: 'intelligenceHit',
            key: 'intelligenceHit',
            width: 100,
            render: (hit: boolean, record: DataType) => (
                <span>
                    <Tag color={hit ? 'green' : 'default'}>{hit ? '命中' : '未命中'}</Tag>
                    {hit && (
                        <Tooltip title="溯源">
                            <Button
                                type="link"
                                size="small"
                                style={{ padding: 0, marginLeft: 4, fontSize: 16 }}
                                onClick={() => handleTrace(record)}
                                icon={<SearchOutlined />}
                            />
                        </Tooltip>
                    )}
                </span>
            ),
        },
        {
            title: '首次连接时间',
            dataIndex: 'sessionStart',
            key: 'sessionStart',
            width: 200,
            sorter: (a, b) => dayjs(a.sessionStart).valueOf() - dayjs(b.sessionStart).valueOf(),
        },
        {
            title: '最近连接时间',
            dataIndex: 'sessionEnd',
            key: 'sessionEnd',
            width: 200,
            sorter: (a, b) => dayjs(a.sessionEnd).valueOf() - dayjs(b.sessionEnd).valueOf(),
        },
        {
            title: '数据总量(MB)',
            key: 'traffic',
            width: 160,
            sorter: (a, b) => (parseFloat(a.upstreamTraffic) + parseFloat(a.downstreamTraffic)) - (parseFloat(b.upstreamTraffic) + parseFloat(b.downstreamTraffic)),
            render: (_, record: DataType) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                        <ArrowUpOutlined style={{ color: '#52c41a', fontSize: '10px' }} />
                        {record.upstreamTraffic}
                    </span>
                    <span>/</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                        <ArrowDownOutlined style={{ color: '#1890ff', fontSize: '10px' }} />
                        {record.downstreamTraffic}
                    </span>
                </div>
            ),
        },
        {
            title: '操作',
            key: 'action',
            width: 160,
            fixed: 'right',
            render: (_, record: DataType) => (
                <Space size="small">
                    <Button
                        type="link"
                        size="small"
                        onClick={() => {
                            setSelectedLog(record);
                            setIsDetailVisible(true);
                        }}
                    >
                        详情
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        onClick={() => {
                            setTargetIp(record.destinationIp);
                            setListType('black');
                            setTimeModalVisible(true);
                        }}
                    >
                        加黑
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        onClick={() => {
                            setTargetIp(record.destinationIp);
                            setListType('white');
                            setTimeModalVisible(true);
                        }}
                    >
                        加白
                    </Button>
                </Space>
            ),
        },
    ];

    // 主表格mock数据生成函数，保证applicationType合规
    function generateMainTableMockData(): DataType[] {
        return [
            {
                key: '1',
                sourceIp: '192.168.1.100',
                destinationIp: '88.123.98.6',
                outboundDestination: '美国 | 加利福尼亚',
                outboundCount: 1523,
                protocol: 'UDP',
                intelligenceHit: false,
                sessionStart: dayjs().subtract(2, 'hour').format('YYYY-MM-DD HH:mm:ss'),
                sessionEnd: dayjs().subtract(2, 'hour').add(3, 'second').format('YYYY-MM-DD HH:mm:ss'),
                upstreamTraffic: '4.2',
                downstreamTraffic: '12.5',
                applicationType: commonAppTypes.includes('DNS') ? 'DNS' : '未知',
                status: '监控',
            },
            {
                key: '2',
                sourceIp: '192.168.2.55',
                destinationIp: '198.51.100.10',
                outboundDestination: '俄罗斯 | 莫斯科',
                outboundCount: 89,
                protocol: 'TCP',
                intelligenceHit: true,
                sessionStart: dayjs().subtract(1, 'hour').format('YYYY-MM-DD HH:mm:ss'),
                sessionEnd: dayjs().subtract(1, 'hour').add(5, 'minute').format('YYYY-MM-DD HH:mm:ss'),
                upstreamTraffic: '7.8',
                downstreamTraffic: '15.2',
                applicationType: commonAppTypes.includes('未知') ? '未知' : commonAppTypes[0],
                status: '告警',
            },
            {
                key: '3',
                sourceIp: '192.168.3.88',
                destinationIp: '185.199.108.153',
                outboundDestination: '英国 | 伦敦',
                outboundCount: 234,
                protocol: 'TCP',
                intelligenceHit: false,
                sessionStart: dayjs().subtract(30, 'minute').format('YYYY-MM-DD HH:mm:ss'),
                sessionEnd: dayjs().subtract(29, 'minute').format('YYYY-MM-DD HH:mm:ss'),
                upstreamTraffic: '9.3',
                downstreamTraffic: '18.7',
                applicationType: commonAppTypes.includes('HTTP') ? 'HTTP' : '未知',
                status: '监控',
            },
            {
                key: '4',
                sourceIp: '192.168.4.77',
                destinationIp: '13.225.103.55',
                outboundDestination: '德国 | 柏林',
                outboundCount: 56,
                protocol: 'TCP',
                intelligenceHit: true,
                sessionStart: dayjs().subtract(10, 'minute').format('YYYY-MM-DD HH:mm:ss'),
                sessionEnd: dayjs().subtract(9, 'minute').format('YYYY-MM-DD HH:mm:ss'),
                upstreamTraffic: '3.2',
                downstreamTraffic: '7.6',
                applicationType: commonAppTypes.includes('SSH') ? 'SSH' : '未知',
                status: '告警',
            },
            {
                key: '5',
                sourceIp: '192.168.5.66',
                destinationIp: '45.137.21.57',
                outboundDestination: '日本 | 东京',
                outboundCount: 321,
                protocol: 'TCP',
                intelligenceHit: false,
                sessionStart: dayjs().subtract(5, 'minute').format('YYYY-MM-DD HH:mm:ss'),
                sessionEnd: dayjs().subtract(4, 'minute').format('YYYY-MM-DD HH:mm:ss'),
                upstreamTraffic: '8.1',
                downstreamTraffic: '16.4',
                applicationType: commonAppTypes.includes('HTTP') ? 'HTTP' : '未知',
                status: '监控',
            },
            {
                key: '6',
                sourceIp: '192.168.6.33',
                destinationIp: '104.18.32.134',
                outboundDestination: '中国 | 北京',
                outboundCount: 78,
                protocol: 'UDP',
                intelligenceHit: false,
                sessionStart: dayjs().subtract(3, 'minute').format('YYYY-MM-DD HH:mm:ss'),
                sessionEnd: dayjs().subtract(2, 'minute').format('YYYY-MM-DD HH:mm:ss'),
                upstreamTraffic: '5.7',
                downstreamTraffic: '13.9',
                applicationType: commonAppTypes.includes('其他') ? '其他' : '未知',
                status: '监控',
            },
            {
                key: '7',
                sourceIp: '192.168.7.22',
                destinationIp: '198.51.100.10',
                outboundDestination: '美国 | 纽约',
                outboundCount: 145,
                protocol: 'TCP',
                intelligenceHit: true,
                sessionStart: dayjs().subtract(1, 'minute').format('YYYY-MM-DD HH:mm:ss'),
                sessionEnd: dayjs().subtract(0, 'minute').format('YYYY-MM-DD HH:mm:ss'),
                upstreamTraffic: '6.8',
                downstreamTraffic: '14.3',
                applicationType: commonAppTypes.includes('FTP') ? 'FTP' : '未知',
                status: '告警',
            },
            {
                key: '8',
                sourceIp: '192.168.8.11',
                destinationIp: '185.199.108.153',
                outboundDestination: '英国 | 曼彻斯特',
                outboundCount: 67,
                protocol: 'TCP',
                intelligenceHit: false,
                sessionStart: dayjs().subtract(50, 'minute').format('YYYY-MM-DD HH:mm:ss'),
                sessionEnd: dayjs().subtract(49, 'minute').format('YYYY-MM-DD HH:mm:ss'),
                upstreamTraffic: '10.4',
                downstreamTraffic: '18.2',
                applicationType: commonAppTypes.includes('HTTP') ? 'HTTP' : '未知',
                status: '监控',
            },
            {
                key: '9',
                sourceIp: '192.168.9.99',
                destinationIp: '13.225.103.55',
                outboundDestination: '德国 | 法兰克福',
                outboundCount: 210,
                protocol: 'TCP',
                intelligenceHit: true,
                sessionStart: dayjs().subtract(20, 'minute').format('YYYY-MM-DD HH:mm:ss'),
                sessionEnd: dayjs().subtract(19, 'minute').format('YYYY-MM-DD HH:mm:ss'),
                upstreamTraffic: '3.9',
                downstreamTraffic: '11.7',
                applicationType: commonAppTypes.includes('未知') ? '未知' : commonAppTypes[0],
                status: '告警',
            }
        ];
    }

    const data = generateMainTableMockData();

    // 源IP TOP5 mock数据
    const sourceIpTop5 = [
        { name: '192.168.1.100', count: 900 },
        { name: '192.168.2.55', count: 700 },
        { name: '192.168.1.120', count: 480 },
        { name: '192.168.3.45', count: 260 },
        { name: '192.168.10.1', count: 100 },
    ];

    // 初始化图表
    useEffect(() => {
        if (chartRef.current) {
            chartInstance.current = echarts.init(chartRef.current);

            // 生成初始数据点
            const initialData = Array.from({ length: 60 }, (_, i) => {
                const time = new Date(Date.now() - (60 - i) * 1000); // 从60秒前开始
                const value = Math.floor(Math.random() * 700 + 100); // 100-800MB/s
                return [time, value];
            });

            const option = {
                grid: {
                    left: '1%',
                    right: '1%',
                    bottom: '3%',
                    top: '10%',
                    containLabel: true
                },
                tooltip: {
                    trigger: 'axis',
                    formatter: function (params: any) {
                        const param = params[0];
                        return `${dayjs(param.value[0]).format('HH:mm:ss')}<br/>流量: ${param.value[1]} KB/s`;
                    }
                },
                xAxis: {
                    type: 'time',
                    splitLine: {
                        show: false
                    },
                    minInterval: 10000, // 最小间隔5秒
                    maxInterval: 10000, // 最大间隔5秒
                    axisLabel: {
                        formatter: function (value: any) {
                            return dayjs(value).format('HH:mm:ss');
                        },
                        interval: 0,
                        margin: 15
                    }
                },
                yAxis: {
                    type: 'value',
                    max: 1000,
                    splitLine: {
                        show: true
                    }
                },
                series: [{
                    name: '流量',
                    type: 'line',
                    showSymbol: false,
                    areaStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            {
                                offset: 0,
                                color: 'rgba(24, 144, 255, 0.8)'
                            },
                            {
                                offset: 1,
                                color: 'rgba(24, 144, 255, 0.1)'
                            }
                        ])
                    },
                    lineStyle: {
                        width: 2,
                        color: '#1890ff'
                    },
                    data: initialData
                }]
            };

            chartInstance.current.setOption(option);
        }

        return () => {
            if (chartInstance.current) {
                chartInstance.current.dispose();
            }
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, []);

    // 更新图表数据
    useEffect(() => {
        const updateChart = () => {
            if (chartInstance.current) {
                const now = new Date();
                const value = Math.floor(Math.random() * 700 + 100); // 100-800MB/s

                const option = chartInstance.current.getOption();
                const currentData = (option.series as any[])[0].data;
                const newData = [...currentData, [now, value]];

                // 只保留最近 60 个数据点
                if (newData.length > 60) {
                    newData.shift();
                }

                // 更新图表时保持固定的标签显示间隔
                chartInstance.current.setOption({
                    xAxis: {
                        axisLabel: {
                            interval: 2
                        }
                    },
                    series: [{
                        data: newData
                    }]
                });
            }
        };

        // 每秒更新一次数据
        timerRef.current = setInterval(updateChart, 1000);

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, []);

    // 添加表单提交和重置处理函数
    const handleFilter = (values: any) => {
        console.log('Filter values:', values);
    };

    const handleReset = () => {
        form.resetFields();
    };

    // 添加保存筛选条件的处理函数
    const handleSaveFilter = () => {
        const currentValues = form.getFieldsValue();
        if (Object.keys(currentValues).every(key => !currentValues[key])) {
            message.warning('请至少设置一个搜索条件');
            return;
        }
        message.success('搜索条件保存成功');
        setIsFilterModalVisible(false);
        setFilterName('');
    };

    // 修改收藏IP的处理函数
    const addToFavorites = (ip: string, type: 'source' | 'destination') => {
        if (favoriteIps.includes(ip)) {
            setFavoriteIps(prev => prev.filter(item => item !== ip));
            message.info('已取消收藏');
        } else {
            setFavoriteIps(prev => [...prev, ip]);
            message.success('IP已添加到收藏夹');
        }

        // 更新localStorage
        const savedIps = JSON.parse(localStorage.getItem('outboundFavoriteIps') || '[]') as FavoriteIp[];
        const newSavedIps = favoriteIps.includes(ip)
            ? savedIps.filter(item => item.ip !== ip)
            : [...savedIps, { ip, type, key: ip }];
        localStorage.setItem('outboundFavoriteIps', JSON.stringify(newSavedIps));
    };

    // 修改加载收藏IP的useEffect
    useEffect(() => {
        const savedIps = JSON.parse(localStorage.getItem('outboundFavoriteIps') || '[]') as FavoriteIp[];
        setFavoriteIps(savedIps.map(item => item.ip));
    }, []);

    // 时间单位配置
    const timeUnits: TimeUnit[] = [
        { label: '小时', value: 'hour', multiplier: 3600 },
        { label: '天', value: 'day', multiplier: 86400 },
        { label: '周', value: 'week', multiplier: 604800 },
        { label: '月', value: 'month', multiplier: 2592000 },
        { label: '永久', value: 'forever', multiplier: -1 }
    ];

    // 处理时间单位变化
    const handleTimeUnitChange = useCallback((value: string | number) => {
        const newTimeUnit = value.toString();

        if (newTimeUnit === 'forever') {
            prevDurationRef.current = duration;
        } else if (timeUnit === 'forever') {
            prevDurationRef.current = duration;
        }

        setTimeUnit(newTimeUnit);
    }, [timeUnit, duration]);

    // 确认添加到黑白名单
    const handleConfirmAddToList = () => {
        const selectedUnit = timeUnits.find(unit => unit.value === timeUnit);
        let totalSeconds = 0;

        if (selectedUnit?.value === 'forever') {
            totalSeconds = -1;
        } else if (selectedUnit) {
            totalSeconds = duration * selectedUnit.multiplier;
        }

        message.success(`已将IP ${targetIp} 添加到${listType === 'black' ? '黑' : '白'}名单，时长：${totalSeconds === -1 ? '永久' : `${duration}${selectedUnit?.label}`}`);
        setTimeModalVisible(false);
    };

    // 自定义流量范围输入组件（自管理弹窗和输入状态）
    const TrafficRangeInput = ({ value, onChange }: {
        value?: { upstream: [number, number] | null; downstream: [number, number] | null };
        onChange?: (val: { upstream: [number, number] | null; downstream: [number, number] | null }) => void;
    } = {}) => {
        const [inputRef, setInputRef] = useState<HTMLDivElement | null>(null);
        const [popupPosition, setPopupPosition] = useState<'left' | 'right'>('left');
        const [isVisible, setIsVisible] = useState(false);
        const [localRange, setLocalRange] = useState<{
            upstream: [number, number];
            downstream: [number, number];
        }>({
            upstream: [0, 0],
            downstream: [0, 0]
        });

        // 同步外部value到本地
        useEffect(() => {
            if (isVisible) {
                setLocalRange({
                    upstream: value?.upstream || [0, 0],
                    downstream: value?.downstream || [0, 0]
                });
                calculatePosition();
                document.addEventListener('mousedown', handleClickOutside);
                return () => {
                    document.removeEventListener('mousedown', handleClickOutside);
                };
            }
        }, [isVisible, inputRef]);

        const handleClickOutside = (e: MouseEvent) => {
            if (inputRef && !inputRef.contains(e.target as Node)) {
                setIsVisible(false);
            }
        };

        const calculatePosition = () => {
            if (inputRef) {
                const rect = inputRef.getBoundingClientRect();
                const windowWidth = window.innerWidth;
                const popupWidth = 360;
                if (rect.left + popupWidth > windowWidth - 20) {
                    setPopupPosition('right');
                } else {
                    setPopupPosition('left');
                }
            }
        };

        const handleConfirm = () => {
            onChange?.({
                upstream: localRange.upstream,
                downstream: localRange.downstream
            });
            setIsVisible(false);
        };

        const handleReset = () => {
            setLocalRange({
                upstream: [0, 0],
                downstream: [0, 0]
            });
            onChange?.({ upstream: null, downstream: null });
        };

        const getDisplayText = () => {
            if (!value?.upstream && !value?.downstream) return '';
            const parts = [];
            if (value?.upstream) {
                parts.push(`↗${value.upstream[0]}KB - ↘${value.upstream[1]}KB`);
            }
            if (value?.downstream) {
                parts.push(`↗${value.downstream[0]}KB - ↘${value.downstream[1]}KB`);
            }
            return parts.join(' / ');
        };

        return (
            <div style={{ position: 'relative' }} ref={setInputRef}>
                <Input
                    placeholder="出境流量"
                    value={getDisplayText()}
                    readOnly
                    style={{ width: '100%' }}
                    allowClear
                    onClear={() => onChange?.({ upstream: null, downstream: null })}
                    onClick={() => setIsVisible(!isVisible)}
                />
                {isVisible && (
                    <div
                        style={{
                            position: 'absolute',
                            top: '100%',
                            [popupPosition === 'left' ? 'left' : 'right']: 0,
                            zIndex: 1000,
                            backgroundColor: 'white',
                            border: '1px solid #d9d9d9',
                            borderRadius: '6px',
                            boxShadow: '0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)',
                            padding: '12px',
                            minWidth: '360px',
                            marginTop: '4px'
                        }}
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{ marginBottom: '16px' }}>
                            <div style={{ marginBottom: '12px', fontSize: '14px', fontWeight: 500 }}>设置流量范围</div>
                            {/* 上行流量设置 */}
                            <div style={{ marginBottom: '12px' }}>
                                <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <ArrowUpOutlined style={{ color: '#52c41a', fontSize: '12px' }} />
                                    <span style={{ fontSize: '13px', color: '#666' }}>上行流量</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <InputNumber
                                        min={0}
                                        value={localRange.upstream[0]}
                                        onChange={(value) => setLocalRange({
                                            ...localRange,
                                            upstream: [value || 0, localRange.upstream[1]]
                                        })}
                                        addonAfter="KB"
                                        style={{ width: '140px' }}
                                        placeholder="最小值"
                                        onMouseDown={(e) => e.stopPropagation()}
                                        onClick={(e) => e.stopPropagation()}
                                        onFocus={(e) => e.stopPropagation()}
                                    />
                                    <span style={{ margin: '0 8px', color: '#999' }}>-</span>
                                    <InputNumber
                                        min={0}
                                        value={localRange.upstream[1]}
                                        onChange={(value) => setLocalRange({
                                            ...localRange,
                                            upstream: [localRange.upstream[0], value || 0]
                                        })}
                                        addonAfter="KB"
                                        style={{ width: '140px' }}
                                        placeholder="最大值"
                                        onMouseDown={(e) => e.stopPropagation()}
                                        onClick={(e) => e.stopPropagation()}
                                        onFocus={(e) => e.stopPropagation()}
                                    />
                                </div>
                            </div>
                            {/* 下行流量设置 */}
                            <div>
                                <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <ArrowDownOutlined style={{ color: '#1890ff', fontSize: '12px' }} />
                                    <span style={{ fontSize: '13px', color: '#666' }}>下行流量</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <InputNumber
                                        min={0}
                                        value={localRange.downstream[0]}
                                        onChange={(value) => setLocalRange({
                                            ...localRange,
                                            downstream: [value || 0, localRange.downstream[1]]
                                        })}
                                        addonAfter="KB"
                                        style={{ width: '140px' }}
                                        placeholder="最小值"
                                        onMouseDown={(e) => e.stopPropagation()}
                                        onClick={(e) => e.stopPropagation()}
                                        onFocus={(e) => e.stopPropagation()}
                                    />
                                    <span style={{ margin: '0 8px', color: '#999' }}>-</span>
                                    <InputNumber
                                        min={0}
                                        value={localRange.downstream[1]}
                                        onChange={(value) => setLocalRange({
                                            ...localRange,
                                            downstream: [localRange.downstream[0], value || 0]
                                        })}
                                        addonAfter="KB"
                                        style={{ width: '140px' }}
                                        placeholder="最大值"
                                        onMouseDown={(e) => e.stopPropagation()}
                                        onClick={(e) => e.stopPropagation()}
                                        onFocus={(e) => e.stopPropagation()}
                                    />
                                </div>
                            </div>
                        </div>
                        <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '8px', display: 'flex', justifyContent: 'flex-end' }}>
                            <Space>
                                <Button
                                    size="small"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleReset();
                                    }}
                                    onMouseDown={(e) => e.stopPropagation()}
                                >
                                    重置
                                </Button>
                                <Button
                                    size="small"
                                    type="primary"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleConfirm();
                                    }}
                                    onMouseDown={(e) => e.stopPropagation()}
                                >
                                    确定
                                </Button>
                            </Space>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // mock数据，和ExternalLogs.tsx结构一致
    const destinationIpTop5 = [
        { name: '104.18.32.134', count: 950 },
        { name: '198.51.100.10', count: 780 },
        { name: '185.199.108.153', count: 540 },
        { name: '13.225.103.55', count: 320 },
        { name: '45.137.21.57', count: 120 },
    ];
    const outboundDestinationTop5 = [
        { name: '美国', count: 2500 },
        { name: '印度', count: 1800 },
        { name: '德国', count: 1200 },
        { name: '日本', count: 900 },
        { name: '英国', count: 600 },
    ];

    // 详情页mock数据生成（更真实）
    const generateDetailMockData = () => {
        if (!selectedLog) return [];
        // 应用类型与协议的对应关系
        const appTypes = commonAppTypes;
        const statuses = ['监控', '告警'];
        const baseIp = selectedLog.sourceIp.split('.');
        const arr = [];
        for (let i = 0; i < 20; i++) {
            // 随机应用类型
            let appType = appTypes[i % appTypes.length];
            // 兜底：如果不是commonAppTypes里的，强制为'未知'
            if (!appTypes.includes(appType)) appType = '未知';
            // 根据应用类型分配协议
            let protocol = 'TCP';
            if (appType === 'DNS') {
                protocol = i % 4 === 0 ? 'TCP' : 'UDP'; // 大部分UDP，偶尔TCP
            } else if (appType === 'HTTP' || appType === 'HTTPS' || appType === 'FTP' || appType === 'SSH') {
                protocol = 'TCP';
            } else if (appType === '未知') {
                protocol = i % 2 === 0 ? 'UDP' : 'TCP';
            }
            const status = statuses[i % statuses.length];
            // 生成不同的源IP和端口
            const ip = `${baseIp[0]}.${baseIp[1]}.${baseIp[2]}.${(parseInt(baseIp[3]) + i) % 255}`;
            const port = 1024 + (i * 137) % 50000;
            // 时间递增
            const start = dayjs(selectedLog.sessionStart).add(i, 'minute').format('YYYY-MM-DD HH:mm:ss');
            const end = dayjs(selectedLog.sessionEnd).add(i, 'minute').format('YYYY-MM-DD HH:mm:ss');
            // mock部分数据带详细字段
            let requestInfo, responseInfo, dnsResponse;
            if (appType === 'DNS') {
                dnsResponse = {
                    header: {
                        id: `${1000 + i}`,
                        qr: i % 2 === 0,
                        opcode: 'QUERY',
                        aa: false,
                        tc: false,
                        rd: true,
                        ra: true,
                        rcode: 'NOERROR',
                        qdcount: 1,
                        ancount: 1,
                        nscount: 0,
                        arcount: 0
                    },
                    answers: [
                        { name: `sub${i}.example.com`, type: 'A', ttl: 3600, data: `1.2.3.${i}` }
                    ],
                    authority: [],
                    additional: []
                };
            }
            if (appType === 'HTTP') {
                requestInfo = {
                    protocol: protocol.toLowerCase(),
                    url: `https://example.com/api/${i}`,
                    dnsName: `sub${i}.example.com`,
                    method: 'GET',
                    headers: {
                        'User-Agent': 'Mozilla/5.0',
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'X-Forwarded-For': ip,
                        'Host': 'example.com',
                        'Connection': 'keep-alive',
                        'Accept-Encoding': 'gzip, deflate, br',
                        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
                    },
                    body: {
                        payload: '{"test":1}',
                        size: '123bytes',
                        type: '测试',
                        timestamp: new Date().toISOString()
                    }
                };
                responseInfo = {
                    headers: {
                        'Content-Type': 'application/json',
                        'Server': 'nginx/1.18.0',
                        'Date': new Date().toUTCString(),
                        'Content-Length': '456'
                    },
                    statusCode: 200,
                    body: {
                        status: 200,
                        message: 'Success',
                        data: '{"result":true}'
                    }
                };
            }
            arr.push({
                key: `${selectedLog.key}-${i}`,
                sourceIp: ip,
                sourcePort: port,
                protocol,
                applicationType: appType,
                sessionStart: start,
                sessionEnd: end,
                status,
                upstreamTraffic: (parseFloat(selectedLog.upstreamTraffic) + i * 0.7).toFixed(1),
                downstreamTraffic: (parseFloat(selectedLog.downstreamTraffic) + i * 0.9).toFixed(1),
                requestInfo,
                responseInfo,
                dnsResponse
            });
        }
        return arr;
    };

    // 详情页筛选逻辑
    const handleDetailSearch = () => {
        let data = generateDetailMockData();
        if (detailFilters.sourceIp) {
            data = data.filter(item => item.sourceIp.includes(detailFilters.sourceIp));
        }
        if (detailFilters.applicationTypes && detailFilters.applicationTypes.length > 0) {
            data = data.filter(item => detailFilters.applicationTypes.includes(item.applicationType));
        }
        if (detailFilters.sessionTime && detailFilters.sessionTime.length === 2) {
            const [start, end] = detailFilters.sessionTime;
            data = data.filter(item => {
                const s = dayjs(item.sessionStart);
                const e = dayjs(item.sessionEnd);
                return (
                    (!start || e.isAfter(start)) && (!end || s.isBefore(end))
                );
            });
        }
        if (detailFilters.status) {
            data = data.filter(item => item.status === detailFilters.status);
        }
        if (detailFilters.trafficRange && (detailFilters.trafficRange[0] !== undefined || detailFilters.trafficRange[1] !== undefined)) {
            data = data.filter(item => {
                const total = parseFloat(item.upstreamTraffic) + parseFloat(item.downstreamTraffic);
                const [min, max] = detailFilters.trafficRange;
                if (typeof min === 'number' && total < min) return false;
                if (typeof max === 'number' && total > max) return false;
                return true;
            });
        }
        setFilteredDetailData(data);
    };
    const handleDetailReset = () => {
        setDetailFilters({
            sourceIp: '',
            applicationTypes: [],
            sessionTime: [null, null],
            status: '',
            trafficRange: [undefined, undefined],
        });
        setFilteredDetailData(generateDetailMockData());
    };

    useEffect(() => {
        if (isDetailVisible && selectedLog) {
            setFilteredDetailData(generateDetailMockData());
        }
    }, [isDetailVisible, selectedLog]);

    // 添加CSS样式覆盖展开行背景色
    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            .ant-table-expanded-row .ant-table-cell {
                background-color: #fff !important;
            }
        `;
        document.head.appendChild(style);

        return () => {
            document.head.removeChild(style);
        };
    }, []);

    return (
        <div>
            <OutboundTrendCard
                destinationIpTop5={destinationIpTop5}
                outboundDestinationTop5={outboundDestinationTop5}
                sourceIpTop5={sourceIpTop5}
            />
            <Card>
                <Form form={form} onFinish={handleFilter} style={{ marginBottom: 24 }}>
                    <Row gutter={[16, 16]}>
                        <Col span={6}>
                            <Form.Item name="quickSearch" style={{ marginBottom: 0 }}>
                                <LabelSelect
                                    label="快捷搜索"
                                    placeholder="请选择"
                                    allowClear
                                    options={[]}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item name="destinationIp" style={{ marginBottom: 0 }}>
                                <LabelInput label="目的IP" placeholder="请输入目的IP" allowClear />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item name="outboundDestination" style={{ marginBottom: 0 }}>
                                <LabelCascader
                                    label="出境目标"
                                    options={outboundDestinationOptions}
                                    placeholder="请选择"
                                    allowClear
                                />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item name="outboundCount" style={{ marginBottom: 0 }}>
                                <LabelInput label="出境次数" placeholder="请输入出境次数" allowClear />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                        <Col span={6}>
                            <Form.Item name="trafficRange" style={{ marginBottom: 0 }}>
                                <TrafficRangeInput />
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
                                    <Button onClick={() => setIsFilterModalVisible(true)} icon={<SaveOutlined />}>
                                        保存条件
                                    </Button>
                                    <Button
                                        icon={<StarOutlined />}
                                        onClick={() => setIsIpDrawerVisible(true)}
                                    >
                                        IP收藏夹
                                    </Button>
                                </Space>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
                {/* 批量操作按钮 */}
                {selectedRows.length > 0 && (
                    <div style={{ marginBottom: 16 }}>
                        <Space>
                            <Button icon={<SaveOutlined />}>导出</Button>
                            <Button icon={<ReloadOutlined />} onClick={() => setSelectedRows([])}>清空</Button>
                        </Space>
                    </div>
                )}
                <Table
                    columns={columns}
                    dataSource={data}
                    rowSelection={{
                        selectedRowKeys: selectedRows.map(row => row.key),
                        onChange: (_, rows) => setSelectedRows(rows),
                        columnWidth: 50
                    }}
                    scroll={{
                        x: 1320,
                        scrollToFirstRowOnChange: true
                    }}
                    pagination={{
                        total: data.length,
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total) => `共 ${total} 条记录`,
                    }}
                />
            </Card>

            {/* 添加保存筛选条件的 Modal */}
            <Modal
                title="保存搜索条件"
                open={isFilterModalVisible}
                onOk={handleSaveFilter}
                onCancel={() => {
                    setIsFilterModalVisible(false);
                    setFilterName('');
                }}
                okText="保存"
                cancelText="取消"
            >
                <Form layout="vertical">
                    <Form.Item
                        label="条件名称"
                        required
                        style={{ marginBottom: 0 }}
                    >
                        <Input
                            placeholder="请输入条件名称"
                            value={filterName}
                            onChange={(e) => setFilterName(e.target.value)}
                        />
                    </Form.Item>
                </Form>
            </Modal>

            {/* 添加 IP收藏夹抽屉组件 */}
            <Drawer
                title="IP收藏夹"
                placement="right"
                width={600}
                onClose={() => setIsIpDrawerVisible(false)}
                open={isIpDrawerVisible}
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
                                <Tag color={text === 'source' ? 'blue' : 'green'}>
                                    {text === 'source' ? '源IP' : '目标IP'}
                                </Tag>
                            )
                        },
                        {
                            title: '操作',
                            key: 'action',
                            render: (_, record: FavoriteIp) => (
                                <Button
                                    type="link"
                                    danger
                                    onClick={() => addToFavorites(record.ip, record.type)}
                                >
                                    删除
                                </Button>
                            )
                        }
                    ]}
                    dataSource={JSON.parse(localStorage.getItem('outboundFavoriteIps') || '[]') as FavoriteIp[]}
                    pagination={false}
                />
            </Drawer>

            {/* 详情抽屉 */}
            <Drawer
                title={
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography.Title level={4} style={{ margin: 0, fontSize: '18px' }}>出境日志</Typography.Title>
                    </div>
                }
                placement="right"
                width="clamp(1100px, 60%, 100%)"
                onClose={() => {
                    setSelectedLog(null);
                    setIsDetailVisible(false);
                }}
                open={isDetailVisible}
            >
                <Space direction="vertical" style={{ width: '100%' }} size="large">

                    {/* 详情页筛选区域 */}
                    <Form
                        layout="inline"
                        initialValues={detailFilters}
                        onFinish={handleDetailSearch}
                    >
                        <Row gutter={[4, 16]}>
                            <Col span={6}>
                                <Form.Item style={{ marginBottom: 0 }}>
                                    <LabelInput
                                        label="源IP"
                                        placeholder="请输入源IP"
                                        value={detailFilters.sourceIp}
                                        allowClear
                                        onChange={e => setDetailFilters(f => ({ ...f, sourceIp: e.target.value }))}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item style={{ marginBottom: 0 }}>
                                    <LabelSelect
                                        label="应用类型"
                                        mode="multiple"
                                        allowClear
                                        placeholder="请选择应用类型"
                                        value={detailFilters.applicationTypes}
                                        options={commonAppTypes.map(type => ({ label: type, value: type }))}
                                        onChange={v => setDetailFilters(f => ({ ...f, applicationTypes: v }))}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item style={{ marginBottom: 0 }}>
                                    <LabelRangePicker
                                        label="会话时间"
                                        showTime={{ format: 'HH:mm:ss' }}
                                        format="YYYY-MM-DD HH:mm:ss"
                                        value={detailFilters.sessionTime}
                                        onChange={v => setDetailFilters(f => ({ ...f, sessionTime: v as [dayjs.Dayjs | null, dayjs.Dayjs | null] }))}
                                        style={{ width: '100%' }}
                                        placeholder={["开始时间", "结束时间"]}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item style={{ marginBottom: 0 }}>
                                    <LabelSelect
                                        label="状态"
                                        allowClear
                                        placeholder="请选择状态"
                                        value={detailFilters.status}
                                        options={[
                                            { label: '监控', value: '监控' },
                                            { label: '告警', value: '告警' },
                                        ]}
                                        onChange={v => setDetailFilters(f => ({ ...f, status: v }))}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item style={{ marginBottom: 0 }}>
                                    {/* 复用主表格的区间输入组件 */}
                                    <TrafficRangeInput />
                                </Form.Item>
                            </Col>
                            <Col span={6} style={{ display: 'flex', alignItems: 'flex-end' }}>
                                <Form.Item style={{ marginBottom: 0 }}>
                                    <Space>
                                        <Button type="primary" htmlType="submit">搜索</Button>
                                        <Button onClick={handleDetailReset}>重置</Button>
                                    </Space>
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>

                    {/* 详情页批量操作按钮 */}
                    <div>
                        {selectedRowsDetail.length > 0 && (
                            <div style={{ marginBottom: 16 }}>
                                <Space>
                                    <Button icon={<SaveOutlined />}>导出</Button>
                                    <Button icon={<ReloadOutlined />} onClick={() => setSelectedRowsDetail([])}>清空</Button>
                                </Space>
                            </div>
                        )}
                        <Table
                            columns={[
                                {
                                    title: '源IP',
                                    dataIndex: 'sourceIp',
                                    key: 'sourceIp',
                                    width: 140,
                                },
                                {
                                    title: '源端口',
                                    dataIndex: 'sourcePort',
                                    key: 'sourcePort',
                                    width: 100,
                                    render: () => 443,
                                },
                                {
                                    title: '协议',
                                    dataIndex: 'protocol',
                                    key: 'protocol',
                                    width: 80,
                                },
                                {
                                    title: '应用类型',
                                    dataIndex: 'applicationType',
                                    key: 'applicationType',
                                    width: 120,
                                },
                                {
                                    title: '会话开始时间',
                                    dataIndex: 'sessionStart',
                                    key: 'sessionStart',
                                    width: 180,
                                },
                                {
                                    title: '会话结束时间',
                                    dataIndex: 'sessionEnd',
                                    key: 'sessionEnd',
                                    width: 180,
                                },
                                {
                                    title: '状态',
                                    dataIndex: 'status',
                                    key: 'status',
                                    width: 80,
                                    render: (text) => (
                                        <Tag color={text === '告警' ? 'red' : 'blue'}>{text}</Tag>
                                    ),
                                },
                                {
                                    title: '数据总量',
                                    dataIndex: 'traffic',
                                    key: 'traffic',
                                    width: 140,
                                    render: (_, row) => (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                                                <ArrowUpOutlined style={{ color: '#52c41a', fontSize: '10px' }} />
                                                {row.upstreamTraffic}
                                            </span>
                                            <span>/</span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                                                <ArrowDownOutlined style={{ color: '#1890ff', fontSize: '10px' }} />
                                                {row.downstreamTraffic}
                                            </span>
                                        </div>
                                    ),
                                },
                            ]}
                            dataSource={selectedLog ? filteredDetailData : []}
                            rowSelection={{
                                type: 'checkbox',
                                columnWidth: 50,
                                selectedRowKeys: selectedRowsDetail.map(row => row.key),
                                onChange: (_, rows) => setSelectedRowsDetail(rows),
                            }}
                            expandable={{
                                expandIconColumnIndex: 1,
                                expandedRowRender: (record) => {
                                    const type = (record.applicationType || '').toLowerCase();
                                    return (
                                        <>
                                            {/* 主可视化卡片，所有类型都显示 */}
                                            <Card
                                                title="日志详情"
                                                style={{ background: '#fff !important' }}
                                            >
                                                <OutboundTrafficVisual
                                                    sourceInfo={{
                                                        ip: record.sourceIp,
                                                        port: record.sourcePort || 443
                                                    }}
                                                    destinationInfo={{
                                                        ip: selectedLog?.destinationIp || '',
                                                        port: selectedLog?.outboundCount || 0,
                                                        isForeign: true
                                                    }}
                                                    protocol={record.protocol}
                                                    url=""
                                                    method=""
                                                    statusCode={200}
                                                    status={record.status}
                                                    sessionStart={record.sessionStart}
                                                    sessionEnd={record.sessionEnd}
                                                    upstreamTraffic={record.upstreamTraffic}
                                                    downstreamTraffic={record.downstreamTraffic}
                                                    outboundDestination={selectedLog?.outboundDestination || ''}
                                                    applicationType={record.applicationType}
                                                    onDownloadPcap={() => {
                                                        message.success('PCAP包下载已开始');
                                                    }}
                                                    onAddToBlacklist={(ip: string) => {
                                                        setTargetIp(ip);
                                                        setListType('black');
                                                        setTimeModalVisible(true);
                                                    }}
                                                    onAddToWhitelist={(ip: string) => {
                                                        setTargetIp(ip);
                                                        setListType('white');
                                                        setTimeModalVisible(true);
                                                    }}
                                                />
                                            </Card>

                                            {/* DNS响应 */}
                                            {type === 'dns' && record.dnsResponse && (
                                                <Card title="DNS响应" style={{ marginTop: 16 }}>
                                                    <Tabs
                                                        items={[{
                                                            key: 'header',
                                                            label: '报文头',
                                                            children: (
                                                                <Descriptions bordered column={2} size="small">
                                                                    <Descriptions.Item label="报文标识">
                                                                        {record.dnsResponse.header.id}
                                                                    </Descriptions.Item>
                                                                    <Descriptions.Item label="响应标志">
                                                                        {record.dnsResponse.header.qr ? '响应' : '查询'}
                                                                    </Descriptions.Item>
                                                                    <Descriptions.Item label="操作码">
                                                                        {record.dnsResponse.header.opcode}
                                                                    </Descriptions.Item>
                                                                    <Descriptions.Item label="权威应答">
                                                                        {record.dnsResponse.header.aa ? '是' : '否'}
                                                                    </Descriptions.Item>
                                                                    <Descriptions.Item label="截断标志">
                                                                        {record.dnsResponse.header.tc ? '是' : '否'}
                                                                    </Descriptions.Item>
                                                                    <Descriptions.Item label="期望递归">
                                                                        {record.dnsResponse.header.rd ? '是' : '否'}
                                                                    </Descriptions.Item>
                                                                    <Descriptions.Item label="递归可用">
                                                                        {record.dnsResponse.header.ra ? '是' : '否'}
                                                                    </Descriptions.Item>
                                                                    <Descriptions.Item label="返回码">
                                                                        {record.dnsResponse.header.rcode}
                                                                    </Descriptions.Item>
                                                                    <Descriptions.Item label="问题数">
                                                                        {record.dnsResponse.header.qdcount}
                                                                    </Descriptions.Item>
                                                                    <Descriptions.Item label="回答数">
                                                                        {record.dnsResponse.header.ancount}
                                                                    </Descriptions.Item>
                                                                    <Descriptions.Item label="授权数">
                                                                        {record.dnsResponse.header.nscount}
                                                                    </Descriptions.Item>
                                                                    <Descriptions.Item label="附加数">
                                                                        {record.dnsResponse.header.arcount}
                                                                    </Descriptions.Item>
                                                                </Descriptions>
                                                            ),
                                                        },
                                                        {
                                                            key: 'answers',
                                                            label: '应答记录',
                                                            children: (
                                                                <Table
                                                                    dataSource={record.dnsResponse.answers?.map((item: { name: string; type: string; ttl: number; data: string }, index: number) => ({ ...item, key: index }))}
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
                                                                    dataSource={record.dnsResponse.authority?.map((item: { name: string; type: string; ttl: number; data: string }, index: number) => ({ ...item, key: index }))}
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
                                                                    dataSource={record.dnsResponse.additional?.map((item: { name: string; type: string; ttl: number; data: string }, index: number) => ({ ...item, key: index }))}
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

                                            {/* HTTP请求与响应 */}
                                            {type === 'http' && (
                                                <>
                                                    {record.requestInfo && (
                                                        <Card title="请求信息" style={{ marginTop: 16 }}>
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
                                                                                dataSource={Object.entries(record.requestInfo.headers).map(([key, value], index: number) => ({
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
                                                                                {record.requestInfo.body ? JSON.stringify(record.requestInfo.body, null, 2) : ''}
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
                                                    {record.responseInfo && (
                                                        <Card title="响应信息" style={{ marginTop: 16 }}>
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
                                                                                dataSource={[
                                                                                    {
                                                                                        key: 'statusCode',
                                                                                        name: '状态码',
                                                                                        value: record.responseInfo.statusCode
                                                                                    },
                                                                                    ...Object.entries(record.responseInfo.headers).map(([key, value], index: number) => ({
                                                                                        key: index,
                                                                                        name: key,
                                                                                        value: value
                                                                                    }))
                                                                                ]}
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
                                                                                {record.responseInfo.body ? JSON.stringify(record.responseInfo.body, null, 2) : ''}
                                                                            </pre>
                                                                        ),
                                                                    },
                                                                ]}
                                                            />
                                                        </Card>
                                                    )}
                                                </>
                                            )}
                                        </>
                                    );
                                },
                            }}
                            pagination={{
                                total: selectedLog ? filteredDetailData.length : 0,
                                pageSize: 20,
                                showSizeChanger: true,
                                showQuickJumper: true,
                                showTotal: (total) => `共 ${total} 条记录`,
                            }}
                            scroll={{ x: 1050 }}
                            style={{ marginBottom: 16 }}
                        />
                    </div>
                </Space>
            </Drawer>

            {/* 时间选择模态框 */}
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
                        <Typography.Text>IP地址：{targetIp}</Typography.Text>
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

export default OutboundLogs; 