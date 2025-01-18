import { Card, Row, Col, Space, Tooltip } from 'antd';
import {
    AlertOutlined, GlobalOutlined,
    DesktopOutlined, TeamOutlined, BugOutlined,
    DatabaseOutlined, SecurityScanOutlined, FlagOutlined,
    RiseOutlined, RightOutlined, ExclamationCircleOutlined
} from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import { useNavigate } from 'react-router-dom';

// 统一的图表主题配置
const chartTheme = {
    color: ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2', '#eb2f96', '#fadb14'],
    backgroundColor: '#ffffff',
    textStyle: {
        color: '#666666'
    },
    title: {
        textStyle: {
            color: '#333333',
            fontSize: 16,
            fontWeight: 500
        },
        left: '0',
        top: 10
    },
    grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: 50,
        containLabel: true
    },
    tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderColor: '#e1e1e1',
        borderWidth: 1,
        textStyle: {
            color: '#666666'
        }
    }
};

// Mock 数据
const mockData = {
    safetyDays: 365,
    attackStats: {
        directAttacks: 8234667,
        blockedCount: 35567,
        monitorCount: 84590
    },
    externalStats: {
        compromised: 4523456,
        blockedCount: 14523,
        monitorCount: 45356
    },
    securityData: {
        totalAssets: 2002340,
        preciseIntel: 56732558,
        blacklist: 3453246,
        zeroOneDayVulns: 89223,
        aptGroups: 32344,
        redTeams: 13242
    }
};

// 攻击来源分布的颜色方案（带渐变）
const attackSourceColors = [
    {
        type: 'linear',
        x: 0,
        y: 0,
        x2: 0,
        y2: 1,
        colorStops: [{
            offset: 0,
            color: '#36a3ff'  // 鲜艳蓝
        }, {
            offset: 1,
            color: '#69c0ff'
        }]
    },
    {
        type: 'linear',
        x: 0,
        y: 0,
        x2: 0,
        y2: 1,
        colorStops: [{
            offset: 0,
            color: '#4cd2d0'  // 青绿
        }, {
            offset: 1,
            color: '#87e8de'
        }]
    },
    {
        type: 'linear',
        x: 0,
        y: 0,
        x2: 0,
        y2: 1,
        colorStops: [{
            offset: 0,
            color: '#5fd75f'  // 翠绿
        }, {
            offset: 1,
            color: '#95de64'
        }]
    },
    {
        type: 'linear',
        x: 0,
        y: 0,
        x2: 0,
        y2: 1,
        colorStops: [{
            offset: 0,
            color: '#ffc53d'  // 金黄
        }, {
            offset: 1,
            color: '#ffd666'
        }]
    },
    {
        type: 'linear',
        x: 0,
        y: 0,
        x2: 0,
        y2: 1,
        colorStops: [{
            offset: 0,
            color: '#ff85c0'  // 粉红
        }, {
            offset: 1,
            color: '#ffadd2'
        }]
    },
    {
        type: 'linear',
        x: 0,
        y: 0,
        x2: 0,
        y2: 1,
        colorStops: [{
            offset: 0,
            color: '#597ef7'  // 靛蓝
        }, {
            offset: 1,
            color: '#85a5ff'
        }]
    },
    {
        type: 'linear',
        x: 0,
        y: 0,
        x2: 0,
        y2: 1,
        colorStops: [{
            offset: 0,
            color: '#73d13d'  // 青柠
        }, {
            offset: 1,
            color: '#95de64'
        }]
    },
    {
        type: 'linear',
        x: 0,
        y: 0,
        x2: 0,
        y2: 1,
        colorStops: [{
            offset: 0,
            color: '#40a9ff'  // 天蓝
        }, {
            offset: 1,
            color: '#69c0ff'
        }]
    },
    {
        type: 'linear',
        x: 0,
        y: 0,
        x2: 0,
        y2: 1,
        colorStops: [{
            offset: 0,
            color: '#95de64'  // 嫩绿
        }, {
            offset: 1,
            color: '#b7eb8f'
        }]
    },
    {
        type: 'linear',
        x: 0,
        y: 0,
        x2: 0,
        y2: 1,
        colorStops: [{
            offset: 0,
            color: '#ff9c6e'  // 珊瑚橙
        }, {
            offset: 1,
            color: '#ffbb96'
        }]
    }
];

// 外联地区分布的颜色方案（带渐变）
const externalRegionColors = [
    {
        type: 'linear',
        x: 0,
        y: 0,
        x2: 0,
        y2: 1,
        colorStops: [{
            offset: 0,
            color: '#ff7875'  // 玫红
        }, {
            offset: 1,
            color: '#ffa39e'
        }]
    },
    {
        type: 'linear',
        x: 0,
        y: 0,
        x2: 0,
        y2: 1,
        colorStops: [{
            offset: 0,
            color: '#ffa940'  // 橙色
        }, {
            offset: 1,
            color: '#ffc069'
        }]
    },
    {
        type: 'linear',
        x: 0,
        y: 0,
        x2: 0,
        y2: 1,
        colorStops: [{
            offset: 0,
            color: '#bae637'  // 青柠
        }, {
            offset: 1,
            color: '#d3f261'
        }]
    },
    {
        type: 'linear',
        x: 0,
        y: 0,
        x2: 0,
        y2: 1,
        colorStops: [{
            offset: 0,
            color: '#9254de'  // 紫色
        }, {
            offset: 1,
            color: '#b37feb'
        }]
    },
    {
        type: 'linear',
        x: 0,
        y: 0,
        x2: 0,
        y2: 1,
        colorStops: [{
            offset: 0,
            color: '#36cfc9'  // 碧蓝
        }, {
            offset: 1,
            color: '#5cdbd3'
        }]
    },
    {
        type: 'linear',
        x: 0,
        y: 0,
        x2: 0,
        y2: 1,
        colorStops: [{
            offset: 0,
            color: '#f759ab'  // 粉色
        }, {
            offset: 1,
            color: '#ff85c0'
        }]
    },
    {
        type: 'linear',
        x: 0,
        y: 0,
        x2: 0,
        y2: 1,
        colorStops: [{
            offset: 0,
            color: '#faad14'  // 金色
        }, {
            offset: 1,
            color: '#ffd666'
        }]
    },
    {
        type: 'linear',
        x: 0,
        y: 0,
        x2: 0,
        y2: 1,
        colorStops: [{
            offset: 0,
            color: '#52c41a'  // 绿色
        }, {
            offset: 1,
            color: '#95de64'
        }]
    },
    {
        type: 'linear',
        x: 0,
        y: 0,
        x2: 0,
        y2: 1,
        colorStops: [{
            offset: 0,
            color: '#eb2f96'  // 洋红
        }, {
            offset: 1,
            color: '#ff85c0'
        }]
    },
    {
        type: 'linear',
        x: 0,
        y: 0,
        x2: 0,
        y2: 1,
        colorStops: [{
            offset: 0,
            color: '#7cb305'  // 草绿
        }, {
            offset: 1,
            color: '#a0d911'
        }]
    }
];

// 更新图表配置，应用统一主题
const getChartOptions = (type: string, data: any) => {
    const baseConfig = {
        ...chartTheme,
        title: {
            ...chartTheme.title,
            text: data.title
        }
    };

    switch (type) {
        case 'bar':
            const isExternalData = data.isExternal;
            return {
                ...baseConfig,
                xAxis: {
                    type: 'category',
                    data: data.xData,
                    axisLabel: {
                        interval: 0,
                        rotate: 30,
                        color: '#666'
                    }
                },
                yAxis: {
                    type: 'value',
                    axisLine: {
                        show: false
                    },
                    axisTick: {
                        show: false
                    }
                },
                series: [{
                    data: data.yData,
                    type: 'bar',
                    barWidth: '40%',
                    itemStyle: {
                        borderRadius: [4, 4, 0, 0],
                        color: function (params: any) {
                            const externalColorList = [
                                {
                                    type: 'linear',
                                    x: 0,
                                    y: 0,
                                    x2: 0,
                                    y2: 1,
                                    colorStops: [{
                                        offset: 0,
                                        color: '#ff4d4fb3'
                                    }, {
                                        offset: 1,
                                        color: '#ff7875b3'
                                    }]
                                },
                                {
                                    type: 'linear',
                                    x: 0,
                                    y: 0,
                                    x2: 0,
                                    y2: 1,
                                    colorStops: [{
                                        offset: 0,
                                        color: '#ffc53db3'
                                    }, {
                                        offset: 1,
                                        color: '#ffd76bb3'
                                    }]
                                },
                                {
                                    type: 'linear',
                                    x: 0,
                                    y: 0,
                                    x2: 0,
                                    y2: 1,
                                    colorStops: [{
                                        offset: 0,
                                        color: '#722ed1b3'
                                    }, {
                                        offset: 1,
                                        color: '#9254deb3'
                                    }]
                                }
                            ];

                            const normalColorList = [
                                {
                                    type: 'linear',
                                    x: 0,
                                    y: 0,
                                    x2: 0,
                                    y2: 1,
                                    colorStops: [{
                                        offset: 0,
                                        color: '#1890ffb3'
                                    }, {
                                        offset: 1,
                                        color: '#bae7ffb3'
                                    }]
                                },
                                {
                                    type: 'linear',
                                    x: 0,
                                    y: 0,
                                    x2: 0,
                                    y2: 1,
                                    colorStops: [{
                                        offset: 0,
                                        color: '#13c2c2b3'
                                    }, {
                                        offset: 1,
                                        color: '#87e8deb3'
                                    }]
                                },
                                {
                                    type: 'linear',
                                    x: 0,
                                    y: 0,
                                    x2: 0,
                                    y2: 1,
                                    colorStops: [{
                                        offset: 0,
                                        color: '#52c41ab3'
                                    }, {
                                        offset: 1,
                                        color: '#b7eb8fb3'
                                    }]
                                }
                            ];

                            const colorList = isExternalData ? externalColorList : normalColorList;
                            return colorList[params.dataIndex % colorList.length];
                        }
                    }
                }]
            };
        case 'pie':
            return {
                ...baseConfig,
                series: [{
                    type: 'pie',
                    radius: ['40%', '70%'],
                    center: ['50%', '60%'],
                    data: data.pieData,
                    label: {
                        show: true,
                        formatter: '{b}: {d}%'
                    },
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                }]
            };
        case 'line':
            return {
                ...baseConfig,
                xAxis: {
                    type: 'category',
                    boundaryGap: false,
                    data: data.xData,
                    axisLine: {
                        lineStyle: {
                            color: '#e8e8e8'
                        }
                    },
                    axisLabel: {
                        color: '#666'
                    }
                },
                yAxis: {
                    type: 'value',
                    axisLine: {
                        show: false
                    },
                    axisTick: {
                        show: false
                    },
                    axisLabel: {
                        color: '#666'
                    },
                    splitLine: {
                        lineStyle: {
                            color: '#f0f0f0'
                        }
                    }
                },
                series: [{
                    name: '流量',
                    type: 'line',
                    smooth: true,
                    symbol: 'circle',
                    symbolSize: 6,
                    data: data.yData,
                    itemStyle: {
                        color: data.lineColor || '#1890ff'
                    },
                    lineStyle: {
                        width: 2,
                        color: data.lineColor || '#1890ff'
                    },
                    areaStyle: {
                        color: data.areaColor || 'rgba(24, 144, 255, 0.15)'
                    }
                }]
            };
        default:
            return baseConfig;
    }
};


// 然后是 TrendCard 组件
const TrendCard = ({
    title,
    titleColor,
    mainData,
    subItems,
    mainIcon,
    mainLabel,
    mainUnit
}: {
    title: string;
    titleColor: string;
    mainData: number;
    subItems: Array<{
        title: string;
        value: number;
        gradient: string;
        bgGradient: string;
    }>;
    mainIcon: React.ReactNode;
    mainLabel: string;
    mainUnit: string;
}) => {
    const navigate = useNavigate();

    // 根据标题确定跳转路径
    const handleViewDetails = () => {
        if (title === "攻击态势") {
            navigate('/attack-logs');
        } else if (title === "外联态势") {
            navigate('/external-logs');
        }
    };

    return (
        <Card>
            <Space direction="vertical" size="middle" style={{
                width: '100%',
                background: '#ffffff',
                borderRadius: '16px'
            }}>
                {/* 标题区域 */}
                <div style={{
                    padding: '0 4px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        background: 'linear-gradient(to right, #1890ff15, transparent)',
                        padding: '6px 12px',
                        borderRadius: '20px'
                    }}>
                        <span style={{
                            fontSize: '15px',
                            fontWeight: 500,
                            background: 'linear-gradient(to right, #1890ff, #1890ff90)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            {title}
                        </span>
                    </div>
                    <div
                        onClick={handleViewDetails}
                        style={{
                            fontSize: '12px',
                            color: '#1890ff',
                            display: 'flex',
                            alignItems: 'center',
                            cursor: 'pointer',
                            padding: '4px 12px',
                            borderRadius: '15px',
                            border: '1px solid #1890ff30',
                            transition: 'all 0.3s',
                            '&:hover': {
                                background: '#1890ff10',
                                transform: 'translateX(2px)'
                            }
                        } as React.CSSProperties}
                    >
                        <span>查看详情</span>
                        <RightOutlined style={{ fontSize: '10px', marginLeft: '4px' }} />
                    </div>
                </div>

                {/* 主数据卡片 */}
                <div style={{
                    background: `linear-gradient(135deg, ${titleColor} 0%, ${titleColor}dd 100%)`,
                    borderRadius: '16px',
                    padding: '24px',
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: `0 8px 16px ${titleColor}20`,
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                }}>
                    {/* 装饰图案 */}
                    <svg style={{
                        position: 'absolute',
                        right: '-10%',
                        top: '-10%',
                        width: '60%',
                        height: '60%',
                        opacity: 0.1
                    }}>
                        <circle cx="50%" cy="50%" r="50%" fill="white" />
                    </svg>

                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: '20px'
                    }}>
                        <div style={{
                            background: 'rgba(255,255,255,0.2)',
                            backdropFilter: 'blur(8px)',
                            borderRadius: '12px',
                            padding: '6px 12px',
                            display: 'flex',
                            alignItems: 'center',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                        }}>
                            {mainIcon}
                            <span style={{ marginLeft: '8px' }}>{mainLabel}</span>
                        </div>
                    </div>

                    <div style={{
                        display: 'flex',
                        alignItems: 'baseline',
                        justifyContent: 'space-between'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'baseline' }}>
                            <span style={{
                                fontSize: '38px',
                                fontWeight: 600,
                                marginRight: '8px',
                                fontFamily: '"DIN Alternate", -apple-system',
                                letterSpacing: '-1px'
                            }}>
                                {mainData.toLocaleString()}
                            </span>
                            <span style={{
                                opacity: 0.9,
                                fontSize: '15px'
                            }}>{mainUnit}</span>
                        </div>
                        <div style={{
                            background: 'rgba(255,255,255,0.15)',
                            backdropFilter: 'blur(8px)',
                            padding: '6px 16px',
                            borderRadius: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            fontSize: '12px',
                            border: '1px solid rgba(255,255,255,0.2)',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                        }}>
                            <RiseOutlined style={{ marginRight: '6px' }} />
                            <span>24h 趋势</span>
                        </div>
                    </div>
                </div>

                {/* 子数据卡片 */}
                <Row gutter={16}>
                    {subItems.map((item, index) => (
                        <Col span={12} key={index}>
                            <div style={{
                                background: item.bgGradient,
                                borderRadius: '16px',
                                padding: '16px',
                                border: '1px solid #f0f0f0',
                                transition: 'all 0.3s',
                                cursor: 'pointer',
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    marginBottom: '10px'
                                }}>
                                    <div style={{
                                        width: '4px',
                                        height: '16px',
                                        background: item.gradient,
                                        borderRadius: '2px',
                                        marginRight: '10px',
                                        boxShadow: `0 2px 4px ${titleColor}20`
                                    }} />
                                    <span style={{
                                        fontSize: '14px',
                                        color: 'rgba(0,0,0,0.65)',
                                        fontWeight: 500
                                    }}>
                                        {item.title}
                                    </span>
                                </div>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'baseline'
                                }}>
                                    <span style={{
                                        fontSize: '28px',
                                        fontWeight: 600,
                                        background: item.gradient,
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        marginRight: '6px',
                                        fontFamily: '"DIN Alternate", -apple-system',
                                        letterSpacing: '-0.5px'
                                    }}>
                                        {item.value.toLocaleString()}
                                    </span>
                                    <span style={{
                                        fontSize: '13px',
                                        color: 'rgba(0,0,0,0.45)'
                                    }}>
                                        次
                                    </span>
                                </div>
                            </div>
                        </Col>
                    ))}
                </Row>
            </Space>
        </Card>
    );
};

const Dashboard = () => {
    return (
        <div>

            <Row gutter={[24, 24]}>
                <Col span={6}>
                    <TrendCard
                        title="攻击态势"
                        titleColor="#1890ff"
                        mainData={mockData.attackStats.directAttacks}
                        mainIcon={<AlertOutlined style={{ marginRight: '6px' }} />}
                        mainLabel="正向攻击"
                        mainUnit="次"
                        subItems={[
                            {
                                title: '阻断次数',
                                value: mockData.attackStats.blockedCount,
                                gradient: 'linear-gradient(to right, #ff4d4f, #ff7875)',
                                bgGradient: 'linear-gradient(45deg, rgba(255,77,79,0.03) 0%, rgba(255,77,79,0.06) 100%)'
                            },
                            {
                                title: '监控次数',
                                value: mockData.attackStats.monitorCount,
                                gradient: 'linear-gradient(to right, #1890ff, #69c0ff)',
                                bgGradient: 'linear-gradient(45deg, rgba(24,144,255,0.03) 0%, rgba(24,144,255,0.06) 100%)'
                            }
                        ]}
                    />
                </Col>
                <Col span={6}>
                    <TrendCard
                        title="外联态势"
                        titleColor="#52c41a"
                        mainData={mockData.externalStats.compromised}
                        mainIcon={<GlobalOutlined style={{ marginRight: '6px' }} />}
                        mainLabel="失陷外联"
                        mainUnit="个"
                        subItems={[
                            {
                                title: '阻断次数',
                                value: mockData.externalStats.blockedCount,
                                gradient: 'linear-gradient(to right, #ffa940, #ffc069)',
                                bgGradient: 'linear-gradient(45deg, rgba(255,169,64,0.03) 0%, rgba(255,169,64,0.06) 100%)'
                            },
                            {
                                title: '监控次数',
                                value: mockData.externalStats.monitorCount,
                                gradient: 'linear-gradient(to right, #52c41a, #95de64)',
                                bgGradient: 'linear-gradient(45deg, rgba(82,196,26,0.03) 0%, rgba(82,196,26,0.06) 100%)'
                            }
                        ]}
                    />
                </Col>
                <Col span={12}>
                    <Card>
                        {/* 标题区域 - 统一风格 */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '24px'
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                background: 'linear-gradient(to right, #1890ff15, transparent)',
                                padding: '6px 12px',
                                borderRadius: '20px'
                            }}>
                                <span style={{
                                    fontSize: '15px',
                                    fontWeight: 500,
                                    background: 'linear-gradient(to right, #1890ff, #1890ff90)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent'
                                }}>
                                    安全数据总览
                                </span>
                            </div>
                        </div>

                        {/* 数据网格 - 优化设计 */}
                        <Row gutter={[16, 16]}>
                            {[
                                {
                                    title: '资产总数',
                                    value: mockData.securityData.totalAssets,
                                    icon: <DesktopOutlined />,
                                    color: '#1890ff',
                                    trend: '+12%',
                                    trendType: 'up'
                                },
                                {
                                    title: '高精准情报',
                                    value: mockData.securityData.preciseIntel,
                                    icon: <DatabaseOutlined />,
                                    color: '#52c41a',
                                    trend: '+5%',
                                    trendType: 'up'
                                },
                                {
                                    title: '黑名单',
                                    value: mockData.securityData.blacklist,
                                    icon: <SecurityScanOutlined />,
                                    color: '#faad14',
                                    trend: '-2%',
                                    trendType: 'down'
                                },
                                {
                                    title: (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            反测绘目标
                                            <Tooltip title="可识别测绘，爬虫，扫描器等的数量">
                                                <ExclamationCircleOutlined
                                                    style={{
                                                        fontSize: '14px',
                                                        color: 'rgba(0,0,0,0.45)',
                                                        cursor: 'help'
                                                    }}
                                                />
                                            </Tooltip>
                                        </span>
                                    ),
                                    value: mockData.securityData.zeroOneDayVulns,
                                    icon: <BugOutlined />,
                                    color: '#ff4d4f',
                                    trend: '+8%',
                                    trendType: 'up'
                                },
                                {
                                    title: (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            APT组织
                                            <Tooltip title="可识别APT组织的情报数量">
                                                <ExclamationCircleOutlined
                                                    style={{
                                                        fontSize: '14px',
                                                        color: 'rgba(0,0,0,0.45)',
                                                        cursor: 'help'
                                                    }}
                                                />
                                            </Tooltip>
                                        </span>
                                    ),
                                    value: mockData.securityData.aptGroups,
                                    icon: <TeamOutlined />,
                                    color: '#722ed1',
                                    trend: '0%',
                                    trendType: 'stable'
                                },
                                {
                                    title: (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            攻防演练
                                            <Tooltip title="可识别攻防演练队伍的情报数量">
                                                <ExclamationCircleOutlined
                                                    style={{
                                                        fontSize: '14px',
                                                        color: 'rgba(0,0,0,0.45)',
                                                        cursor: 'help'
                                                    }}
                                                />
                                            </Tooltip>
                                        </span>
                                    ),
                                    value: mockData.securityData.redTeams,
                                    icon: <FlagOutlined />,
                                    color: '#eb2f96',
                                    trend: '+3%',
                                    trendType: 'up'
                                }
                            ].map((item, index) => (
                                <Col span={8} key={index}>
                                    <div style={{
                                        background: `linear-gradient(135deg, ${item.color}08, ${item.color}02)`,
                                        borderRadius: '12px',
                                        padding: '20px',
                                        transition: 'all 0.3s',
                                        cursor: 'pointer',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        border: '1px solid transparent',
                                        '&:hover': {
                                            transform: 'translateY(-2px)',
                                            boxShadow: `0 8px 16px ${item.color}10`,
                                            borderColor: `${item.color}30`
                                        }
                                    } as React.CSSProperties}>
                                        {/* 背景装饰 */}
                                        <div style={{
                                            position: 'absolute',
                                            right: '-20px',
                                            top: '-20px',
                                            width: '100px',
                                            height: '100px',
                                            background: `radial-gradient(circle, ${item.color}06 0%, transparent 70%)`
                                        }} />

                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'flex-start',
                                            marginBottom: '16px',
                                            position: 'relative'
                                        }}>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px'
                                            }}>
                                                <div style={{
                                                    background: `${item.color}15`,
                                                    color: item.color,
                                                    padding: '8px',
                                                    borderRadius: '8px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    boxShadow: `0 2px 6px ${item.color}10`
                                                }}>
                                                    {item.icon}
                                                </div>
                                                <span style={{
                                                    fontSize: '14px',
                                                    color: 'rgba(0,0,0,0.85)',
                                                    fontWeight: 500
                                                }}>
                                                    {item.title}
                                                </span>
                                            </div>
                                            <div style={{
                                                fontSize: '12px',
                                                padding: '3px 10px',
                                                borderRadius: '12px',
                                                color: item.trendType === 'up' ? '#52c41a' :
                                                    item.trendType === 'down' ? '#ff4d4f' : '#666666',
                                                background: item.trendType === 'up' ? '#f6ffed' :
                                                    item.trendType === 'down' ? '#fff1f0' : '#f5f5f5',
                                                border: `1px solid ${item.trendType === 'up' ? '#b7eb8f' :
                                                    item.trendType === 'down' ? '#ffa39e' : '#d9d9d9'}`,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px'
                                            }}>
                                                {item.trendType === 'up' ? '↑' :
                                                    item.trendType === 'down' ? '↓' : ''}
                                                {item.trend}
                                            </div>
                                        </div>
                                        <div style={{
                                            fontSize: '28px',
                                            fontWeight: 600,
                                            background: `linear-gradient(to right, ${item.color}, ${item.color}90)`,
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            fontFamily: '"DIN Alternate", -apple-system',
                                            letterSpacing: '-0.5px',
                                            position: 'relative'
                                        }}>
                                            {item.value.toLocaleString()}
                                        </div>
                                    </div>
                                </Col>
                            ))}
                        </Row>
                    </Card>
                </Col>
            </Row>

            <Card style={{ marginTop: '24px' }} styles={{ body: { padding: '24px' } }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '16px'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        background: 'linear-gradient(to right, #1890ff15, transparent)',
                        padding: '6px 12px',
                        borderRadius: '20px'
                    }}>
                        <span style={{
                            fontSize: '15px',
                            fontWeight: 500,
                            background: 'linear-gradient(to right, #1890ff, #1890ff90)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            正向攻击TOP数据
                        </span>
                    </div>
                </div>
                <Row gutter={[24, 24]}>
                    <Col span={8}>
                        <ReactECharts
                            option={getChartOptions('bar', {
                                title: '攻击IP TOP10',
                                xData: ['103.235.46.12', '45.134.26.178', '91.242.217.54', '185.156.73.91', '194.26.135.75',
                                    '102.165.48.29', '43.154.89.234', '176.32.45.121', '89.248.167.131', '51.89.237.140'],
                                yData: [1267, 983, 856, 742, 698, 634, 589, 543, 498, 456],
                                isExternal: false
                            })}
                            style={{ height: '300px' }}
                            notMerge={true}
                            lazyUpdate={true}
                        />
                    </Col>
                    <Col span={8}>
                        <ReactECharts
                            option={getChartOptions('bar', {
                                title: '被攻击资产 TOP10',
                                xData: ['服务器集群', 'ERP系统', '邮件服务器', '数据库服务器', '文件服务器',
                                    'OA系统', '监控系统', 'DNS服务器', '代理服务器', '备份系统'],
                                yData: [720, 650, 600, 580, 550, 500, 480, 450, 400, 380],
                                isExternal: false
                            })}
                            style={{ height: '300px' }}
                            theme="custom"
                        />
                    </Col>
                    <Col span={8}>
                        <ReactECharts
                            option={{
                                ...chartTheme,
                                title: {
                                    ...chartTheme.title,
                                    text: '攻击来源分布',
                                    top: 0
                                },
                                tooltip: {
                                    trigger: 'item',
                                    formatter: '{b}: {c} ({d}%)'
                                },
                                legend: {
                                    type: 'plain',
                                    orient: 'vertical',
                                    right: '5%',
                                    top: 'center',
                                    itemWidth: 12,
                                    itemHeight: 12,
                                    itemGap: 16,
                                    formatter: function (name: string) {
                                        const flagMap: { [key: string]: string } = {
                                            '中国': '🇨🇳',
                                            '美国': '🇺🇸',
                                            '俄罗斯': '🇷🇺',
                                            '印度': '🇮🇳',
                                            '巴西': '🇧🇷',
                                            '英国': '🇬🇧',
                                            '德国': '🇩🇪',
                                            '法国': '🇫🇷',
                                            '日本': '🇯🇵',
                                            '韩国': '🇰🇷'
                                        };
                                        return `${name} ${flagMap[name]}`;
                                    },
                                    textStyle: {
                                        fontSize: 14,
                                        color: '#333',
                                        fontWeight: 500
                                    },
                                    width: '40%',
                                    align: 'left',
                                    padding: [0, 0, 0, 0],
                                    layout: 'vertical',
                                    columns: 2,
                                    itemStyle: {
                                        margin: '0 30px'
                                    }
                                },
                                series: [{
                                    name: '攻击来源',
                                    type: 'pie',
                                    radius: ['45%', '75%'],
                                    center: ['30%', '55%'],
                                    avoidLabelOverlap: true,
                                    itemStyle: {
                                        borderRadius: 4,
                                        borderColor: '#fff',
                                        borderWidth: 2
                                    },
                                    color: attackSourceColors,
                                    label: {
                                        show: false
                                    },
                                    emphasis: {
                                        label: {
                                            show: true,
                                            formatter: '{b}: {d}%',
                                            fontSize: 12
                                        },
                                        itemStyle: {
                                            shadowBlur: 10,
                                            shadowOffsetX: 0,
                                            shadowColor: 'rgba(0, 0, 0, 0.2)'
                                        }
                                    },
                                    data: [
                                        { value: 40, name: '中国' },
                                        { value: 38, name: '美国' },
                                        { value: 32, name: '俄罗斯' },
                                        { value: 30, name: '印度' },
                                        { value: 28, name: '巴西' },
                                        { value: 26, name: '英国' },
                                        { value: 22, name: '德国' },
                                        { value: 20, name: '法国' },
                                        { value: 18, name: '日本' },
                                        { value: 15, name: '韩国' }
                                    ].sort((a, b) => b.value - a.value)
                                }]
                            }}
                            style={{ height: '300px' }}
                            theme="custom"
                        />
                    </Col>
                </Row>
            </Card>

            <Card style={{ marginTop: '24px' }} styles={{ body: { padding: '24px' } }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '16px'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        background: 'linear-gradient(to right, #1890ff15, transparent)',
                        padding: '6px 12px',
                        borderRadius: '20px'
                    }}>

                        <span style={{
                            fontSize: '15px',
                            fontWeight: 500,
                            background: 'linear-gradient(to right, #1890ff, #1890ff90)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            外联失陷TOP数据
                        </span>
                    </div>
                </div>
                <Row gutter={[24, 24]}>
                    <Col span={8}>
                        <ReactECharts
                            option={getChartOptions('bar', {
                                title: '外联IP TOP10',
                                xData: ['103.235.46.12', '45.134.26.178', '91.242.217.54', '185.156.73.91', '194.26.135.75',
                                    '102.165.48.29', '43.154.89.234', '176.32.45.121', '89.248.167.131', '51.89.237.140'],
                                yData: [1267, 983, 856, 742, 698, 634, 589, 543, 498, 456],
                                isExternal: true
                            })}
                            style={{ height: '300px' }}
                            notMerge={true}
                            lazyUpdate={true}
                        />
                    </Col>
                    <Col span={8}>
                        <ReactECharts
                            option={getChartOptions('bar', {
                                title: '失陷资产 TOP10',
                                xData: ['服务器集群', 'ERP系统', '邮件服务器', '数据库服务器', '文件服务器',
                                    'OA系统', '监控系统', 'DNS服务器', '代理服务器', '备份系统'],
                                yData: [720, 650, 600, 580, 550, 500, 480, 450, 400, 380],
                                isExternal: true
                            })}
                            style={{ height: '300px' }}
                            theme="custom"
                        />
                    </Col>
                    <Col span={8}>
                        <ReactECharts
                            option={{
                                ...chartTheme,
                                title: {
                                    ...chartTheme.title,
                                    text: '外联地区分布',
                                    top: 0
                                },
                                tooltip: {
                                    trigger: 'item',
                                    formatter: '{b}: {c} ({d}%)'
                                },
                                legend: {
                                    type: 'plain',
                                    orient: 'vertical',
                                    right: '5%',
                                    top: 'center',
                                    itemWidth: 12,
                                    itemHeight: 12,
                                    itemGap: 16,
                                    formatter: function (name: string) {
                                        const flagMap: { [key: string]: string } = {
                                            '中国': '🇨🇳',
                                            '美国': '🇺🇸',
                                            '俄罗斯': '🇷🇺',
                                            '印度': '🇮🇳',
                                            '巴西': '🇧🇷',
                                            '英国': '🇬🇧',
                                            '德国': '🇩🇪',
                                            '法国': '🇫🇷',
                                            '日本': '🇯🇵',
                                            '韩国': '🇰🇷'
                                        };
                                        return `${name} ${flagMap[name]}`;
                                    },
                                    textStyle: {
                                        fontSize: 14,
                                        color: '#333',
                                        fontWeight: 500
                                    },
                                    width: '40%',
                                    align: 'left',
                                    padding: [0, 0, 0, 0],
                                    layout: 'vertical',
                                    columns: 2,
                                    itemStyle: {
                                        margin: '0 30px'
                                    }
                                },
                                series: [{
                                    name: '攻击来源',
                                    type: 'pie',
                                    radius: ['45%', '75%'],
                                    center: ['30%', '55%'],
                                    avoidLabelOverlap: true,
                                    itemStyle: {
                                        borderRadius: 4,
                                        borderColor: '#fff',
                                        borderWidth: 2
                                    },
                                    color: externalRegionColors,
                                    label: {
                                        show: false
                                    },
                                    emphasis: {
                                        label: {
                                            show: true,
                                            formatter: '{b}: {d}%',
                                            fontSize: 12
                                        },
                                        itemStyle: {
                                            shadowBlur: 10,
                                            shadowColor: 'rgba(0, 0, 0, 0.2)'
                                        }
                                    },
                                    data: [
                                        { value: 40, name: '中国' },
                                        { value: 38, name: '美国' },
                                        { value: 32, name: '俄罗斯' },
                                        { value: 30, name: '印度' },
                                        { value: 28, name: '巴西' },
                                        { value: 26, name: '英国' },
                                        { value: 22, name: '德国' },
                                        { value: 20, name: '法国' },
                                        { value: 18, name: '日本' },
                                        { value: 15, name: '韩国' }
                                    ].sort((a, b) => b.value - a.value)
                                }]
                            }}
                            style={{ height: '300px' }}
                            theme="custom"
                        />
                    </Col>
                </Row>
            </Card>

            <Card style={{ marginTop: '24px' }} styles={{ body: { padding: '24px' } }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '8px'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        background: 'linear-gradient(to right, #1890ff15, transparent)',
                        padding: '6px 12px',
                        borderRadius: '20px'
                    }}>

                        <span style={{
                            fontSize: '15px',
                            fontWeight: 500,
                            background: 'linear-gradient(to right, #1890ff, #1890ff90)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            实时流量攻击监控
                        </span>
                    </div>

                    <div style={{
                        display: 'flex',
                        gap: '8px'
                    }}>
                        {['今日', '本周', '当月', '全部'].map((item, index) => (
                            <div
                                key={item}
                                style={{
                                    padding: '4px 12px',
                                    fontSize: '12px',
                                    color: index === 0 ? '#1890ff' : '#666',
                                    background: index === 0 ? '#e6f7ff' : 'transparent',
                                    border: `1px solid ${index === 0 ? '#91d5ff' : '#d9d9d9'}`,
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s'
                                }}
                            >
                                {item}
                            </div>
                        ))}
                    </div>
                </div>
                <Row gutter={[24, 24]}>
                    <Col span={12}>
                        <ReactECharts
                            option={getChartOptions('line', {
                                title: '正向攻击趋势',
                                xData: ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'],
                                yData: [300, 280, 250, 320, 420, 380, 350, 400],
                                lineColor: '#722ed1',
                                areaColor: 'rgba(114, 46, 209, 0.15)'
                            })}
                            style={{ height: '300px' }}
                            theme="custom"
                        />
                    </Col>
                    <Col span={12}>
                        <ReactECharts
                            option={getChartOptions('line', {
                                title: '外联失陷趋势',
                                xData: ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'],
                                yData: [280, 260, 240, 300, 380, 340, 320, 360],
                                lineColor: '#13c2c2',
                                areaColor: 'rgba(19, 194, 194, 0.15)'
                            })}
                            style={{ height: '300px' }}
                            theme="custom"
                        />
                    </Col>
                    <Col span={12}>
                        <ReactECharts
                            option={getChartOptions('line', {
                                title: '出境流量趋势',
                                xData: ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'],
                                yData: [150, 180, 160, 200, 250, 220, 190, 210],
                                lineColor: '#fa8c16',
                                areaColor: 'rgba(250, 140, 22, 0.15)'
                            })}
                            style={{ height: '300px' }}
                            theme="custom"
                        />
                    </Col>
                    <Col span={12}>
                        <ReactECharts
                            option={getChartOptions('line', {
                                title: '测绘流量趋势',
                                xData: ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'],
                                yData: [420, 400, 380, 450, 520, 480, 460, 500],
                                lineColor: '#1890ff',
                                areaColor: 'rgba(24, 144, 255, 0.15)'
                            })}
                            style={{ height: '300px' }}
                            theme="custom"
                        />
                    </Col>
                </Row>
            </Card>

            <Card style={{ marginTop: '24px' }} styles={{ body: { padding: '24px' } }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '8px'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        background: 'linear-gradient(to right, #1890ff15, transparent)',
                        padding: '6px 12px',
                        borderRadius: '20px'
                    }}>

                        <span style={{
                            fontSize: '15px',
                            fontWeight: 500,
                            background: 'linear-gradient(to right, #1890ff, #1890ff90)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            威胁分析
                        </span>
                    </div>
                </div>

                <Row gutter={[24, 24]}>
                    <Col span={12}>
                        <ReactECharts
                            option={{
                                ...chartTheme,
                                title: {
                                    ...chartTheme.title,
                                    text: '高危端口分布',
                                    textStyle: {
                                        fontSize: 15,
                                        fontWeight: 500
                                    },
                                    top: 5,
                                    left: 0
                                },
                                grid: {
                                    top: 30,
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    containLabel: true
                                },
                                tooltip: {
                                    formatter: '{b}: {c}次',
                                    backgroundColor: 'rgba(255,255,255,0.95)',
                                    borderColor: '#eee',
                                    borderWidth: 1,
                                    padding: [8, 12],
                                    textStyle: {
                                        color: '#666'
                                    }
                                },
                                series: [{
                                    type: 'treemap',
                                    width: '100%',
                                    height: '90%',
                                    top: 40,
                                    left: 5,
                                    right: 5,
                                    bottom: 5,
                                    roam: false,
                                    colorMappingBy: 'value',
                                    data: [
                                        {
                                            name: '3389/TCP (远程桌面服务)',
                                            value: 1235
                                        },
                                        {
                                            name: '22/TCP (SSH服务)',
                                            value: 1180
                                        },
                                        {
                                            name: '445/TCP (文件共享)',
                                            value: 934
                                        },
                                        {
                                            name: '1433/TCP (数据库服务)',
                                            value: 835
                                        },
                                        {
                                            name: '3306/TCP (数据库服务)',
                                            value: 728
                                        },
                                        {
                                            name: '8080/TCP (Web服务)',
                                            value: 620
                                        },
                                        {
                                            name: '21/TCP (文件传输)',
                                            value: 510
                                        },
                                        {
                                            name: '23/TCP (远程登录)',
                                            value: 486
                                        },
                                        {
                                            name: '5900/TCP (远程控制)',
                                            value: 453
                                        },
                                        {
                                            name: '6379/TCP (缓存服务)',
                                            value: 442
                                        }
                                    ],
                                    label: {
                                        show: true,
                                        position: 'inside',
                                        padding: [15, 10, 15, 10],
                                        formatter: (params: any) => {
                                            const value = params.value;
                                            return [
                                                `{name|${params.name}}`,
                                                `{value|攻击次数: ${value.toLocaleString()}}`
                                            ].join('\n');
                                        },
                                        rich: {
                                            name: {
                                                fontSize: 13,
                                                color: '#fff',
                                                fontWeight: 500,
                                                padding: [0, 0, 8, 0],
                                                textShadow: '0 1px 2px rgba(0,0,0,0.2)'
                                            },
                                            value: {
                                                fontSize: 12,
                                                color: 'rgba(255,255,255,0.9)',
                                                textShadow: '0 1px 2px rgba(0,0,0,0.2)'
                                            }
                                        }
                                    },
                                    breadcrumb: { show: false },
                                    itemStyle: {
                                        borderColor: '#fff',
                                        borderWidth: 1.5,
                                        gapWidth: 2,
                                        borderRadius: 4
                                    },
                                    levels: [{
                                        color: ['#d3adf7', '#b37feb', '#9254de', '#722ed1']
                                    }],
                                    emphasis: {
                                        label: {
                                            fontSize: 14,
                                            color: '#fff'
                                        },
                                        itemStyle: {
                                            shadowBlur: 20,
                                            shadowColor: 'rgba(0,0,0,0.2)'
                                        }
                                    }
                                }]
                            }}
                            style={{
                                height: '380px',
                                marginTop: '10px'
                            }}
                            theme="custom"
                        />
                    </Col>
                    <Col span={12}>
                        <ReactECharts
                            option={{
                                ...chartTheme,
                                title: {
                                    ...chartTheme.title,
                                    text: '攻击类型分布',
                                    textStyle: {
                                        fontSize: 15,
                                        fontWeight: 500
                                    },
                                    top: 5,
                                    left: 0
                                },
                                grid: {
                                    top: 30,
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    containLabel: true
                                },
                                tooltip: {
                                    formatter: (params: any) => {
                                        return `${params.name}: ${params.value.toLocaleString()}次 (占比: ${params.data.percentage})`;
                                    },
                                    backgroundColor: 'rgba(255,255,255,0.95)',
                                    borderColor: '#eee',
                                    borderWidth: 1,
                                    padding: [8, 12],
                                    textStyle: {
                                        color: '#666'
                                    }
                                },
                                series: [{
                                    type: 'treemap',
                                    width: '100%',
                                    height: '90%',
                                    top: 40,
                                    left: 5,
                                    right: 5,
                                    bottom: 5,
                                    roam: false,
                                    colorMappingBy: 'value',
                                    data: [
                                        {
                                            name: 'SQL注入攻击',
                                            value: 1435,
                                            percentage: '18.5%'
                                        },
                                        {
                                            name: 'XSS跨站脚本',
                                            value: 1310,
                                            percentage: '16.9%'
                                        },
                                        {
                                            name: '暴力破解攻击',
                                            value: 1234,
                                            percentage: '15.9%'
                                        },
                                        {
                                            name: '文件包含漏洞',
                                            value: 935,
                                            percentage: '12.1%'
                                        },
                                        {
                                            name: '命令注入攻击',
                                            value: 828,
                                            percentage: '10.7%'
                                        },
                                        {
                                            name: '目录遍历攻击',
                                            value: 720,
                                            percentage: '9.3%'
                                        },
                                        {
                                            name: 'CSRF攻击',
                                            value: 610,
                                            percentage: '7.9%'
                                        },
                                        {
                                            name: '远程代码执行',
                                            value: 586,
                                            percentage: '7.6%'
                                        },
                                        {
                                            name: '恶意文件上传',
                                            value: 553,
                                            percentage: '7.1%'
                                        },
                                        {
                                            name: 'SSRF攻击',
                                            value: 442,
                                            percentage: '5.7%'
                                        }
                                    ],
                                    label: {
                                        show: true,
                                        position: 'inside',
                                        padding: [15, 10, 15, 10],
                                        formatter: (params: any) => {
                                            return [
                                                `{name|${params.name}}`,
                                                `{percentage|占比: ${params.data.percentage}}`,
                                                `{value|攻击次数: ${params.value.toLocaleString()}次}`
                                            ].join('\n');
                                        },
                                        rich: {
                                            name: {
                                                fontSize: 13,
                                                color: '#fff',
                                                fontWeight: 500,
                                                padding: [0, 0, 8, 0],
                                                textShadow: '0 1px 2px rgba(0,0,0,0.2)'
                                            },
                                            percentage: {
                                                fontSize: 12,
                                                color: 'rgba(255,255,255,0.9)',
                                                padding: [0, 0, 8, 0],
                                                textShadow: '0 1px 2px rgba(0,0,0,0.2)'
                                            },
                                            value: {
                                                fontSize: 12,
                                                color: 'rgba(255,255,255,0.9)',
                                                textShadow: '0 1px 2px rgba(0,0,0,0.2)'
                                            }
                                        }
                                    },
                                    breadcrumb: { show: false },
                                    itemStyle: {
                                        borderColor: '#fff',
                                        borderWidth: 1.5,
                                        gapWidth: 2,
                                        borderRadius: 4
                                    },
                                    levels: [{
                                        color: ['#87e8de', '#5cdbd3', '#13c2c2', '#006d75']
                                    }],
                                    emphasis: {
                                        label: {
                                            fontSize: 14,
                                            color: '#fff'
                                        },
                                        itemStyle: {
                                            shadowBlur: 20,
                                            shadowColor: 'rgba(0,0,0,0.2)'
                                        }
                                    }
                                }]
                            }}
                            style={{
                                height: '380px',
                                marginTop: '10px'
                            }}
                            theme="custom"
                        />
                    </Col>
                </Row>
            </Card>
        </div>
    );
};

export default Dashboard; 