import { Card, Table, Button, Space, Tag, Input, Select, InputNumber, Row, Col, Form, Modal, message, Drawer, Typography, Tabs, Descriptions, Empty, Radio } from 'antd';
import { SearchOutlined, ReloadOutlined, SaveOutlined, StarOutlined, StarFilled, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as echarts from 'echarts';
import OutboundTrafficVisual from '../components/OutboundTrafficVisualization';
import { US, CN, GB, FR, DE } from 'country-flag-icons/react/3x2';
import LabelCascader from '@/components/LabelCascader';
const { Option } = Select;

// 获取国旗组件的辅助函数
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

interface DataType {
    key: string;
    sourceIp: string;
    destinationIp: string;
    outboundDestination: string;  // 外联目的
    destinationPort: number;
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

const OutboundLogs: React.FC = () => {
    const chartRef = useRef<HTMLDivElement>(null);
    const chartInstance = useRef<echarts.ECharts | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const [form] = Form.useForm();
    const [filterName, setFilterName] = useState('');
    const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
    const [isIpDrawerVisible, setIsIpDrawerVisible] = useState(false);
    const [favoriteIps, setFavoriteIps] = useState<string[]>([]);
    const [trafficRange, setTrafficRange] = useState<{
        upstream: [number, number] | null;
        downstream: [number, number] | null;
    }>({ upstream: null, downstream: null });
    const [isTrafficModalVisible, setIsTrafficModalVisible] = useState(false);
    const [selectedLog, setSelectedLog] = useState<DataType | null>(null);
    const [isDetailVisible, setIsDetailVisible] = useState(false);
    const [timeModalVisible, setTimeModalVisible] = useState(false);
    const [listType, setListType] = useState<'black' | 'white'>('black');
    const [duration, setDuration] = useState<number>(0);
    const [timeUnit, setTimeUnit] = useState<string>('hour');
    const [targetIp, setTargetIp] = useState<string>('');
    const prevDurationRef = useRef<number>(0);

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
            title: '源IP',
            dataIndex: 'sourceIp',
            key: 'sourceIp',
            width: 180,
            render: (ip: string) => (
                <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <Button
                        type="link"
                        style={{ padding: 0, minWidth: 32, marginRight: 8 }}
                        icon={favoriteIps.includes(ip) ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />}
                        onClick={(e) => {
                            e.stopPropagation();
                            addToFavorites(ip, 'source');
                        }}
                    />
                    <Typography.Text copyable>{ip}</Typography.Text>
                </div>
            ),
        },
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
            title: '出境目标',
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
            title: '目的端口',
            dataIndex: 'destinationPort',
            key: 'destinationPort',
            width: 90,
        },
        {
            title: '协议',
            dataIndex: 'protocol',
            key: 'protocol',
            width: 80,
        },
        {
            title: '会话起始',
            dataIndex: 'sessionStart',
            key: 'sessionStart',
            width: 200,
        },
        {
            title: '会话结束',
            dataIndex: 'sessionEnd',
            key: 'sessionEnd',
            width: 200,
        },
        {
            title: '出境流量(KB)',
            key: 'traffic',
            width: 160,
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
            title: '应用类型',
            dataIndex: 'applicationType',
            key: 'applicationType',
            width: 100,
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            width: 80,
            render: (status: string) => {
                let color = 'blue';
                if (status === '告警') {
                    color = 'red';
                }
                return <Tag color={color}>{status}</Tag>;
            },
        },
        {
            title: '操作',
            key: 'action',
            width: 80,
            render: (_, record: DataType) => (
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
            ),
        },
    ];

    // 模拟数据
    const data: DataType[] = [
        {
            key: '1',
            sourceIp: '192.168.1.100',
            destinationIp: '8.8.8.8',
            outboundDestination: '美国 | 加利福尼亚',
            destinationPort: 443,
            protocol: 'TCP',
            sessionStart: '2024-04-08 10:00:00',
            sessionEnd: '2024-04-08 10:05:30',
            upstreamTraffic: '0.45',
            downstreamTraffic: '0.78',
            applicationType: 'HTTP(S)',
            status: '监控',
            requestInfo: {
                protocol: 'https',
                url: 'https://8.8.8.8/api/v1/data',
                dnsName: 'dns.google.com',
                method: 'GET',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json',
                    'X-Forwarded-For': '192.168.1.100',
                    'Host': 'dns.google.com',
                    'Connection': 'keep-alive',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
                },
                body: {
                    payload: '{"query": "example.com", "type": "A"}',
                    size: '45kb',
                    type: 'application/json',
                    timestamp: '2024-04-08 10:00:00'
                }
            },
            responseInfo: {
                headers: {
                    'Content-Type': 'application/json',
                    'Server': 'nginx/1.20.1',
                    'Date': 'Mon, 08 Apr 2024 10:00:00 GMT',
                    'Content-Length': '1234',
                },
                statusCode: 200,
                body: {
                    status: 0,
                    message: 'Success',
                    data: '{"result": "success", "ip": "8.8.8.8"}'
                }
            }
        },
        {
            key: '2',
            sourceIp: '192.168.1.101',
            destinationIp: '1.1.1.1',
            outboundDestination: '法国 | 巴黎',
            destinationPort: 53,
            protocol: 'UDP',
            sessionStart: '2024-04-08 10:01:00',
            sessionEnd: '2024-04-08 10:01:05',
            upstreamTraffic: '0.001',
            downstreamTraffic: '0.032',
            applicationType: 'DNS',
            status: '告警',
            dnsResponse: {
                header: {
                    id: '12345',
                    qr: true,
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
                    { name: 'example.com', type: 'A', ttl: 300, data: '1.1.1.1' }
                ],
                authority: [],
                additional: []
            }
        },
    ];

    // 添加协议选项
    const protocolOptions = [
        { label: 'TCP', value: 'TCP' },
        { label: 'UDP', value: 'UDP' },
        { label: '非TCP/UDP', value: '非TCP/UDP' },
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
                        return `${dayjs(param.value[0]).format('HH:mm:ss')}<br/>流量: ${param.value[1]} MB/s`;
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
        // 同时重置流量范围状态
        setTrafficRange({ upstream: null, downstream: null });
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



    // 自定义流量范围输入组件
    const TrafficRangeInput = () => {
        const [inputRef, setInputRef] = useState<HTMLDivElement | null>(null);
        const [popupPosition, setPopupPosition] = useState<'left' | 'right'>('left');
        const [localRange, setLocalRange] = useState<{
            upstream: [number, number];
            downstream: [number, number];
        }>({
            upstream: [0, 100],
            downstream: [0, 100]
        });

        const handleClickOutside = (e: MouseEvent) => {
            if (inputRef && !inputRef.contains(e.target as Node)) {
                setIsTrafficModalVisible(false);
            }
        };

        const calculatePosition = () => {
            if (inputRef) {
                const rect = inputRef.getBoundingClientRect();
                const windowWidth = window.innerWidth;
                const popupWidth = 360;

                // 如果右边空间不够，就向左对齐
                if (rect.left + popupWidth > windowWidth - 20) {
                    setPopupPosition('right');
                } else {
                    setPopupPosition('left');
                }
            }
        };

        // 当弹窗打开时，同步当前值到本地状态
        useEffect(() => {
            if (isTrafficModalVisible) {
                setLocalRange({
                    upstream: trafficRange.upstream || [0, 100],
                    downstream: trafficRange.downstream || [0, 100]
                });
                calculatePosition();
                document.addEventListener('mousedown', handleClickOutside);
                return () => {
                    document.removeEventListener('mousedown', handleClickOutside);
                };
            }
        }, [isTrafficModalVisible, inputRef]);

        const handleConfirm = () => {
            setTrafficRange({
                upstream: localRange.upstream,
                downstream: localRange.downstream
            });
            form.setFieldsValue({ trafficRange: localRange });
            setIsTrafficModalVisible(false);
        };

        const handleReset = () => {
            setLocalRange({
                upstream: [0, 100],
                downstream: [0, 100]
            });
            // 同时重置主状态和表单值
            setTrafficRange({ upstream: null, downstream: null });
            form.setFieldsValue({ trafficRange: null });
        };

        const getDisplayText = () => {
            if (!trafficRange.upstream && !trafficRange.downstream) return '';
            const parts = [];
            if (trafficRange.upstream) {
                parts.push(`↗${trafficRange.upstream[0]}-${trafficRange.upstream[1]}KB`);
            }
            if (trafficRange.downstream) {
                parts.push(`↙${trafficRange.downstream[0]}-${trafficRange.downstream[1]}KB`);
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
                    onClear={() => {
                        setTrafficRange({ upstream: null, downstream: null });
                        form.setFieldsValue({ trafficRange: null });
                    }}
                    onClick={() => setIsTrafficModalVisible(!isTrafficModalVisible)}
                />
                {isTrafficModalVisible && (
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

    return (
        <div>
            <Card style={{ marginBottom: 16 }}>
                <div style={{ marginBottom: '8px', marginLeft: '12px' }}>
                    <span style={{ fontWeight: 500, fontSize: '14px', color: '#000000' }}>实时出境流量</span>
                </div>
                <div ref={chartRef} style={{ height: '300px' }} />
            </Card>
            <Card>
                <Form form={form} onFinish={handleFilter} style={{ marginBottom: 24 }}>
                    <Row gutter={[16, 16]}>
                        <Col span={4}>
                            <Form.Item name="quickSearch" style={{ marginBottom: 0 }}>
                                <Select
                                    placeholder="快捷搜索"
                                    allowClear
                                    options={[]}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={4}>
                            <Form.Item name="sourceIp" style={{ marginBottom: 0 }}>
                                <Input placeholder="源IP" allowClear />
                            </Form.Item>
                        </Col>
                        <Col span={4}>
                            <Form.Item name="destinationIp" style={{ marginBottom: 0 }}>
                                <Input placeholder="目的IP" allowClear />
                            </Form.Item>
                        </Col>
                        <Col span={4}>
                            <Form.Item name="outboundDestination" style={{ marginBottom: 0 }}>
                                <LabelCascader
                                    label="出境目标"
                                    options={outboundDestinationOptions}
                                    placeholder="请选择"
                                    allowClear
                                />
                            </Form.Item>
                        </Col>
                        <Col span={4}>
                            <Form.Item name="destinationPort" style={{ marginBottom: 0 }}>
                                <Input
                                    placeholder="目的端口(多个用逗号分隔)"
                                    allowClear
                                />
                            </Form.Item>
                        </Col>
                        <Col span={4}>
                            <Form.Item name="protocol" style={{ marginBottom: 0 }}>
                                <Select
                                    mode="multiple"
                                    placeholder="协议"
                                    style={{ width: '100%' }}
                                    options={protocolOptions}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                        <Col span={4}>
                            <Form.Item name="trafficRange" style={{ marginBottom: 0 }}>
                                <TrafficRangeInput />
                            </Form.Item>
                        </Col>
                        <Col span={4}>
                            <Form.Item name="applicationType" style={{ marginBottom: 0 }}>
                                <Select
                                    mode="multiple"
                                    placeholder="应用类型"
                                    style={{ width: '100%' }}
                                    options={[
                                        { label: 'HTTP(S)', value: 'HTTP(S)' },
                                        { label: 'DNS', value: 'DNS' },
                                        { label: 'SSH', value: 'SSH' },
                                        { label: 'FTP', value: 'FTP' },
                                        { label: 'SMTP', value: 'SMTP' },
                                        { label: 'POP3', value: 'POP3' },
                                        { label: 'IMAP', value: 'IMAP' },
                                        { label: '其他', value: '其他' },
                                    ]}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={4}>
                            <Form.Item name="status" style={{ marginBottom: 0 }}>
                                <Select
                                    placeholder="状态"
                                    style={{ width: '100%' }}
                                    allowClear
                                >
                                    <Option value="monitoring">监控</Option>
                                    <Option value="alert">告警</Option>
                                </Select>
                            </Form.Item>
                        </Col>

                        <Col span={4} style={{ display: 'flex', alignItems: 'flex-end' }}>
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
                <Table
                    columns={columns}
                    dataSource={data}
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
                        <Typography.Title level={4} style={{ margin: 0, fontSize: '18px' }}>出境日志详情</Typography.Title>
                    </div>
                }
                placement="right"
                width="clamp(800px, 50%, 100%)"
                onClose={() => {
                    setSelectedLog(null);
                    setIsDetailVisible(false);
                }}
                open={isDetailVisible}
            >
                <Space direction="vertical" style={{ width: '100%' }} size="large">
                    <Card title={`${selectedLog?.status === '告警' ? '告警' : '监控'}信息详情`}>
                        {selectedLog && (
                            <OutboundTrafficVisual
                                sourceInfo={{
                                    ip: selectedLog.sourceIp,
                                    port: Math.floor(Math.random() * 65535) + 1024 // 动态生成源端口
                                }}
                                destinationInfo={{
                                    ip: selectedLog.destinationIp,
                                    port: selectedLog.destinationPort,
                                    isForeign: true
                                }}
                                protocol={selectedLog.protocol}
                                url={selectedLog.requestInfo?.url || ''}
                                method={selectedLog.requestInfo?.method}
                                statusCode={selectedLog.responseInfo?.statusCode}
                                status={selectedLog.status}
                                sessionStart={selectedLog.sessionStart}
                                sessionEnd={selectedLog.sessionEnd}
                                upstreamTraffic={selectedLog.upstreamTraffic}
                                downstreamTraffic={selectedLog.downstreamTraffic}
                                outboundDestination={selectedLog.outboundDestination}
                                applicationType={selectedLog.applicationType}
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
                        )}
                    </Card>

                    <Card title="云端情报命中">
                        <Row gutter={[24, 24]} justify="center">
                            {[
                                { logo: '/images/华为.png', name: '华为威胁情报', hasData: true },
                                { logo: '/images/奇安信.png', name: '奇安信威胁情报', hasData: true },
                                { logo: '/images/腾讯.png', name: '腾讯威胁情报', hasData: true },
                                { logo: '/images/360.png', name: '360威胁情报', hasData: false },
                                { logo: '/images/阿里.png', name: '阿里云威胁情报', hasData: false }
                            ].map((vendor, index) => (
                                <Col key={index} style={{ width: '19%' }}>
                                    <div style={{
                                        padding: '8px 0',
                                        marginBottom: '8px',
                                        height: '40px',
                                        position: 'relative'
                                    }}>
                                        <div style={{
                                            position: 'relative',
                                            width: 'fit-content',
                                            margin: '0 auto',
                                            height: '40px',
                                            lineHeight: '40px'
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
                                                whiteSpace: 'nowrap'
                                            }}>
                                                {vendor.name}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        {vendor.hasData ? [
                                            {
                                                label: '威胁等级', value: index === 0 ? <Tag color="red">高危</Tag> :
                                                    index === 1 ? <Tag color="green">低危</Tag> : <Tag color="orange">中危</Tag>
                                            },
                                            { label: '置信度', value: '高' },
                                            { label: '情报类型', value: '跨站脚本攻击' },
                                            { label: '情报相关组织', value: index === 1 ? 'APT32' : 'Lazarus' },
                                            { label: '关联病毒家族', value: 'Lockbit勒索病毒' }
                                        ].map((item, idx) => (
                                            <div
                                                key={idx}
                                                style={{
                                                    padding: '12px 0',
                                                    borderBottom: idx !== 4 ? '1px solid #f0f0f0' : 'none',
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
                                        )) : (
                                            <div style={{
                                                padding: '120px 0'
                                            }}>
                                                <Empty
                                                    description="暂无数据"
                                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </Col>
                            ))}
                        </Row>
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