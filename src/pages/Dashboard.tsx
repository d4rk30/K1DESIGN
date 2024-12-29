import { Card, Row, Col, Statistic, Space, Spin } from 'antd';
import {
    SafetyCertificateOutlined, AlertOutlined, GlobalOutlined,
    DesktopOutlined, TeamOutlined, BugOutlined,
    DatabaseOutlined, SecurityScanOutlined, FlagOutlined,
    RiseOutlined
} from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import { useState, useEffect } from 'react';

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
        left: 'center',
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
        blockedCount: 567,
        monitorCount: 890
    },
    externalStats: {
        compromised: 45,
        blockedCount: 123,
        monitorCount: 456
    },
    securityData: {
        totalAssets: 2000,
        preciseIntel: 5678,
        blacklist: 3456,
        zeroOneDayVulns: 89,
        aptGroups: 34,
        redTeams: 12
    }
};

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
            return {
                ...baseConfig,
                xAxis: {
                    type: 'category',
                    data: data.xData,
                    axisLabel: {
                        interval: 0,
                        rotate: 30
                    }
                },
                yAxis: {
                    type: 'value'
                },
                series: [{
                    data: data.yData,
                    type: 'bar',
                    barWidth: '40%',
                    itemStyle: {
                        borderRadius: [4, 4, 0, 0]
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
                    data: data.xData
                },
                yAxis: {
                    type: 'value'
                },
                series: [{
                    name: '流量',
                    type: 'line',
                    smooth: true,
                    data: data.yData,
                    areaStyle: {
                        opacity: 0.3
                    },
                    itemStyle: {
                        color: '#1890ff'
                    }
                }]
            };
        default:
            return baseConfig;
    }
};

const Dashboard = () => {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setTimeout(() => {
            setLoading(false);
        }, 1000);
    }, []);

    const ChartCard = ({ children, title }: { children: React.ReactNode, title?: string }) => (
        <Card
            title={title}
            bordered={false}
            styles={{
                body: { padding: '12px' },
                header: { padding: '12px 16px' }
            }}
            style={{ height: '100%' }}
        >
            <Spin spinning={loading}>
                {children}
            </Spin>
        </Card>
    );

    const StatisticCard = ({ children }: { children: React.ReactNode }) => (
        <Card
            bordered={false}
            styles={{
                body: { padding: '24px', height: '100%' }
            }}
            style={{ height: '100%' }}
        >
            {children}
        </Card>
    );

    const chartData = {
        attackIP: {
            title: '攻击IP TOP10',
            xData: ['192.168.1.1', '192.168.1.2', '192.168.1.3', '192.168.1.4', '192.168.1.5',
                '192.168.1.6', '192.168.1.7', '192.168.1.8', '192.168.1.9', '192.168.1.10'],
            yData: [820, 750, 680, 620, 590, 560, 530, 500, 470, 450]
        },
        // ... 其他图表数据类似定义
    };

    return (
        <div>
            {/* 统计卡片行 - 调整高度和样式 */}
            <Row gutter={[24, 24]}>
                <Col span={6} style={{ height: '180px' }}>
                    <StatisticCard>
                        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Statistic
                                title="已安全运行"
                                value={mockData.safetyDays}
                                suffix="天"
                                prefix={<SafetyCertificateOutlined style={{ color: '#52c41a' }} />}
                            />
                        </div>
                    </StatisticCard>
                </Col>
                <Col span={6} style={{ height: '180px' }}>
                    <StatisticCard>
                        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                            <div style={{ fontSize: '16px', fontWeight: 500 }}>攻击态势</div>
                            <div>
                                <Row style={{ marginBottom: '16px' }}>
                                    <Col span={24}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            backgroundColor: '#fafafa',
                                            padding: '12px',
                                            borderRadius: '4px'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                <div style={{
                                                    backgroundColor: 'rgba(24, 144, 255, 0.1)',
                                                    padding: '8px',
                                                    borderRadius: '4px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    marginRight: '12px'
                                                }}>
                                                    <AlertOutlined style={{
                                                        fontSize: '16px',
                                                        color: '#1890ff'
                                                    }} />
                                                </div>
                                                <span style={{
                                                    fontSize: '14px',
                                                    color: 'rgba(0,0,0,0.45)',
                                                    marginRight: '32px'
                                                }}>
                                                    正向攻击
                                                </span>
                                                <span style={{
                                                    fontSize: '24px',
                                                    color: 'rgba(0,0,0,0.85)',
                                                    marginRight: '8px',
                                                    fontWeight: 500
                                                }}>
                                                    {mockData.attackStats.directAttacks}
                                                </span>
                                                <span style={{
                                                    fontSize: '14px',
                                                    color: 'rgba(0,0,0,0.45)',
                                                    marginRight: '12px'
                                                }}>
                                                    次
                                                </span>
                                            </div>
                                            <div style={{
                                                backgroundColor: 'rgba(255, 77, 79, 0.1)',
                                                padding: '8px',
                                                borderRadius: '4px',
                                                display: 'flex',
                                                alignItems: 'center'
                                            }}>
                                                <RiseOutlined style={{
                                                    color: '#ff4d4f',
                                                    fontSize: '12px'
                                                }} />
                                            </div>
                                        </div>
                                    </Col>
                                </Row>
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Statistic
                                            title="阻断次数"
                                            value={mockData.attackStats.blockedCount}
                                            valueStyle={{ fontSize: '16px' }}
                                        />
                                    </Col>
                                    <Col span={12}>
                                        <Statistic
                                            title="监控次数"
                                            value={mockData.attackStats.monitorCount}
                                            valueStyle={{ fontSize: '16px' }}
                                        />
                                    </Col>
                                </Row>
                            </div>
                        </Space>
                    </StatisticCard>
                </Col>
                <Col span={6} style={{ height: '180px' }}>
                    <StatisticCard>
                        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                            <div style={{ fontSize: '16px', fontWeight: 500 }}>外联态势</div>
                            <Row gutter={[16, 16]}>
                                <Col span={8}>
                                    <Statistic
                                        title="失陷外联"
                                        value={mockData.externalStats.compromised}
                                        prefix={<GlobalOutlined />}
                                        valueStyle={{ fontSize: '20px' }}
                                    />
                                </Col>
                                <Col span={8}>
                                    <Statistic
                                        title="阻断次数"
                                        value={mockData.externalStats.blockedCount}
                                    />
                                </Col>
                                <Col span={8}>
                                    <Statistic
                                        title="监控次数"
                                        value={mockData.externalStats.monitorCount}
                                    />
                                </Col>
                            </Row>
                        </Space>
                    </StatisticCard>
                </Col>
                <Col span={6} style={{ height: '180px' }}>
                    <StatisticCard>
                        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                            <div style={{ fontSize: '16px', fontWeight: 500 }}>安全数据</div>
                            <Row gutter={[16, 16]}>
                                <Col span={8}>
                                    <Statistic
                                        title="资产总数"
                                        value={mockData.securityData.totalAssets}
                                        prefix={<DesktopOutlined />}
                                        valueStyle={{ fontSize: '20px' }}
                                    />
                                </Col>
                                <Col span={8}>
                                    <Statistic
                                        title="高精准情报"
                                        value={mockData.securityData.preciseIntel}
                                        prefix={<DatabaseOutlined />}
                                        valueStyle={{ fontSize: '20px' }}
                                    />
                                </Col>
                                <Col span={8}>
                                    <Statistic
                                        title="黑名单"
                                        value={mockData.securityData.blacklist}
                                        prefix={<SecurityScanOutlined />}
                                        valueStyle={{ fontSize: '20px' }}
                                    />
                                </Col>
                                <Col span={8}>
                                    <Statistic
                                        title="0day/1day"
                                        value={mockData.securityData.zeroOneDayVulns}
                                        prefix={<BugOutlined />}
                                        valueStyle={{ fontSize: '20px' }}
                                    />
                                </Col>
                                <Col span={8}>
                                    <Statistic
                                        title="APT组织"
                                        value={mockData.securityData.aptGroups}
                                        prefix={<TeamOutlined />}
                                        valueStyle={{ fontSize: '20px' }}
                                    />
                                </Col>
                                <Col span={8}>
                                    <Statistic
                                        title="攻防红队"
                                        value={mockData.securityData.redTeams}
                                        prefix={<FlagOutlined />}
                                        valueStyle={{ fontSize: '20px' }}
                                    />
                                </Col>
                            </Row>
                        </Space>
                    </StatisticCard>
                </Col>
            </Row>

            {/* 威胁数据概览 - 调整布局和间距 */}
            <div style={{ marginTop: '24px', background: '#fff', padding: '24px', borderRadius: '2px' }}>
                <h3 style={{ marginBottom: '24px', color: '#333333' }}>威胁数据概览</h3>
                <Row gutter={[24, 24]}>
                    <Col span={12}>
                        <ChartCard>
                            <ReactECharts
                                option={getChartOptions('bar', chartData.attackIP)}
                                style={{ height: '300px' }}
                                notMerge={true}
                                lazyUpdate={true}
                            />
                        </ChartCard>
                    </Col>
                    <Col span={12}>
                        <ChartCard>
                            <ReactECharts
                                option={getChartOptions('bar', {
                                    title: '被攻击资产 TOP10',
                                    xData: ['资产1', '资产2', /*...*/],
                                    yData: [720, 650, /*...*/]
                                })}
                                style={{ height: '300px' }}
                                theme="custom"
                            />
                        </ChartCard>
                    </Col>
                </Row>
            </div>

            {/* 情报分析 - 新的区域 */}
            <div style={{ marginTop: '24px', background: '#fff', padding: '24px', borderRadius: '2px' }}>
                <h3 style={{ marginBottom: '24px', color: '#333333' }}>情报分析</h3>
                <Row gutter={[24, 24]}>
                    <Col span={12}>
                        <ChartCard>
                            <ReactECharts
                                option={getChartOptions('pie', {
                                    title: '攻击来源 TOP10',
                                    pieData: [
                                        { value: 335, name: '中国' },
                                        { value: 310, name: '美国' },
                                        { value: 234, name: '俄罗斯' },
                                        { value: 135, name: '韩国' },
                                        { value: 105, name: '日本' },
                                        { value: 95, name: '德国' },
                                        { value: 85, name: '法国' },
                                        { value: 75, name: '英国' },
                                        { value: 65, name: '加拿大' },
                                        { value: 55, name: '澳大利亚' }
                                    ]
                                })}
                                style={{ height: '300px' }}
                                theme="custom"
                            />
                        </ChartCard>
                    </Col>
                    <Col span={12}>
                        <ChartCard>
                            <ReactECharts
                                option={getChartOptions('pie', {
                                    title: '攻击类型分布',
                                    pieData: [
                                        { value: 335, name: 'SQL注入' },
                                        { value: 310, name: 'XSS攻击' },
                                        { value: 234, name: '暴力破解' },
                                        { value: 135, name: '文件包含' },
                                        { value: 128, name: '命令注入' },
                                        { value: 120, name: '目录遍历' },
                                        { value: 110, name: 'CSRF' },
                                        { value: 100, name: '其他' }
                                    ]
                                })}
                                style={{ height: '300px' }}
                                theme="custom"
                            />
                        </ChartCard>
                    </Col>
                </Row>
            </div>

            <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
                <Col span={12}>
                    <ChartCard>
                        <ReactECharts
                            option={getChartOptions('pie', {
                                title: '高危端口分布',
                                pieData: [
                                    { value: 335, name: '80/TCP' },
                                    { value: 310, name: '443/TCP' },
                                    { value: 234, name: '22/TCP' },
                                    { value: 135, name: '3389/TCP' },
                                    { value: 128, name: '21/TCP' },
                                    { value: 120, name: '8080/TCP' },
                                    { value: 110, name: '3306/TCP' },
                                    { value: 100, name: '其他' }
                                ]
                            })}
                            style={{ height: '300px' }}
                            theme="custom"
                        />
                    </ChartCard>
                </Col>
                <Col span={12}>
                    <ChartCard>
                        <ReactECharts
                            option={getChartOptions('bar', {
                                title: '失陷资产 TOP10',
                                xData: ['资产1', '资产2', /*...*/],
                                yData: [120, 110, /*...*/]
                            })}
                            style={{ height: '300px' }}
                            theme="custom"
                        />
                    </ChartCard>
                </Col>
            </Row>

            <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
                <Col span={12}>
                    <ChartCard>
                        <ReactECharts
                            option={getChartOptions('bar', {
                                title: '外联目标 TOP10',
                                xData: ['目标1', '目标2', /*...*/],
                                yData: [220, 210, /*...*/]
                            })}
                            style={{ height: '300px' }}
                            theme="custom"
                        />
                    </ChartCard>
                </Col>
                <Col span={12}>
                    <ChartCard>
                        <ReactECharts
                            option={getChartOptions('pie', {
                                title: '外联地区 TOP10',
                                pieData: [
                                    { value: 335, name: '北美' },
                                    { value: 310, name: '欧洲' },
                                    { value: 234, name: '亚洲' },
                                    { value: 135, name: '南美' },
                                    { value: 128, name: '大洋洲' },
                                    { value: 120, name: '非洲' },
                                    { value: 110, name: '中东' },
                                    { value: 100, name: '其他' }
                                ]
                            })}
                            style={{ height: '300px' }}
                            theme="custom"
                        />
                    </ChartCard>
                </Col>
            </Row>

            <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
                <Col span={12}>
                    <ChartCard>
                        <ReactECharts
                            option={getChartOptions('bar', {
                                title: '情报命中厂商排行',
                                xData: ['公安一所情报', '360情报', '奇安信情报', '腾讯情报', '华为情报', '阿里云情报', '私有情报'],
                                yData: [38, 52, 61, 45, 48, 38, 38]
                            })}
                            style={{ height: '300px' }}
                            theme="custom"
                        />
                    </ChartCard>
                </Col>
                <Col span={12}>
                    <ChartCard>
                        <ReactECharts
                            option={getChartOptions('line', {
                                title: '境外实时流量监控',
                                xData: ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'],
                                yData: [300, 280, 250, 320, 420, 380, 350, 400]
                            })}
                            style={{ height: '300px' }}
                            theme="custom"
                        />
                    </ChartCard>
                </Col>
            </Row>
        </div>
    );
};

export default Dashboard; 