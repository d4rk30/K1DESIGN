import { Card, Table, Button, Space, Tag, Input, DatePicker, Select } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

const { RangePicker } = DatePicker;
const { Option } = Select;

interface DataType {
    key: string;
    time: string;
    sourceIp: string;
    destinationIp: string;
    destinationPort: number;
    protocol: string;
    traffic: string;
    status: string;
}

const OutboundLogs: React.FC = () => {
    const chartRef = useRef<HTMLDivElement>(null);
    const chartInstance = useRef<echarts.ECharts | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const columns: ColumnsType<DataType> = [
        {
            title: '时间',
            dataIndex: 'time',
            key: 'time',
            width: 180,
        },
        {
            title: '源IP',
            dataIndex: 'sourceIp',
            key: 'sourceIp',
            width: 150,
        },
        {
            title: '目标IP',
            dataIndex: 'destinationIp',
            key: 'destinationIp',
            width: 150,
        },
        {
            title: '目标端口',
            dataIndex: 'destinationPort',
            key: 'destinationPort',
            width: 120,
        },
        {
            title: '协议',
            dataIndex: 'protocol',
            key: 'protocol',
            width: 100,
        },
        {
            title: '流量大小',
            dataIndex: 'traffic',
            key: 'traffic',
            width: 120,
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            width: 100,
            render: (status: string) => {
                let color = 'green';
                if (status === '异常') {
                    color = 'red';
                } else if (status === '警告') {
                    color = 'orange';
                }
                return <Tag color={color}>{status}</Tag>;
            },
        },
    ];

    // 模拟数据
    const data: DataType[] = [
        {
            key: '1',
            time: '2024-04-08 10:00:00',
            sourceIp: '192.168.1.100',
            destinationIp: '8.8.8.8',
            destinationPort: 443,
            protocol: 'HTTPS',
            traffic: '1.2MB',
            status: '正常',
        },
        {
            key: '2',
            time: '2024-04-08 10:01:00',
            sourceIp: '192.168.1.101',
            destinationIp: '1.1.1.1',
            destinationPort: 53,
            protocol: 'DNS',
            traffic: '0.5MB',
            status: '警告',
        },
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

    return (
        <div>
            <Card style={{ marginBottom: 16 }}>
                <div style={{ marginBottom: '8px', marginLeft: '12px' }}>
                    <span style={{ fontWeight: 500, fontSize: '14px', color: '#000000' }}>实时出境流量</span>
                </div>
                <div ref={chartRef} style={{ height: '300px' }} />
            </Card>
            <Card>
                <div style={{ marginBottom: 16 }}>
                    <Space>
                        <RangePicker
                            showTime
                            format="YYYY-MM-DD HH:mm:ss"
                            defaultValue={[dayjs().subtract(1, 'day'), dayjs()]}
                        />
                        <Select defaultValue="all" style={{ width: 120 }}>
                            <Option value="all">全部状态</Option>
                            <Option value="normal">正常</Option>
                            <Option value="warning">警告</Option>
                            <Option value="error">异常</Option>
                        </Select>
                        <Input
                            placeholder="搜索IP地址"
                            style={{ width: 200 }}
                            prefix={<SearchOutlined />}
                        />
                        <Button icon={<ReloadOutlined />}>重置</Button>
                    </Space>
                </div>
                <Table
                    columns={columns}
                    dataSource={data}
                    pagination={{
                        total: data.length,
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total) => `共 ${total} 条记录`,
                    }}
                />
            </Card>
        </div>
    );
};

export default OutboundLogs; 