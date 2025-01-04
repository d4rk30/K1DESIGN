import React, { useState } from 'react';
import { Card, Form, Select, Button, Table, Space, Tag, Row, Col, Modal, Input, message, Drawer, Typography, List, Timeline, Progress } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { SearchOutlined, ReloadOutlined, ExportOutlined, DeleteOutlined, SaveOutlined } from '@ant-design/icons';
import LabelSelect from '../components/LabelSelect';
import LabelInput from '../components/LabelInput';
import LabelCascader from '../components/LabelCascader';
import { US, CN, GB, FR, DE } from 'country-flag-icons/react/3x2';  // 导入国旗图标

interface DataType {
    key: string;
    targetIP: string;
    targetDomain: string;
    targetURL: string;
    assetGroup: string;
    mappingCount: number;
    time: string;
}

const { Option } = Select;

const timelineItemStyle = `
  .ant-timeline {
    .ant-timeline-item-head {
      margin-top: 10px;
    }

    .ant-timeline-item-tail {
        height: 100%;
    }
  }
`;

const AntiMappingAssets: React.FC = () => {
    const [form] = Form.useForm();
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [conditionName, setConditionName] = useState('');
    const [savedConditions, setSavedConditions] = useState<{ label: string; value: string; conditions: any }[]>([]);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [currentRecord, setCurrentRecord] = useState<DataType | null>(null);

    // 模拟数据
    const mockData: DataType[] = [
        {
            key: '1',
            targetIP: '172.18.0.41',
            targetDomain: 'example.com',
            targetURL: 'https://example.com/api/v1/users',
            assetGroup: 'Web_Server',
            mappingCount: 156,
            time: '2024-03-11 12:03'
        },
        {
            key: '2',
            targetIP: '172.18.0.42',
            targetDomain: 'api.example.com',
            targetURL: 'https://api.example.com/v2/products',
            assetGroup: 'API_Server',
            mappingCount: 89,
            time: '2024-03-11 12:05'
        },
        // ... 可以继续添加更多模拟数据
    ];

    const columns: ColumnsType<DataType> = [
        {
            title: '目的IP',
            dataIndex: 'targetIP',
            key: 'targetIP',
            width: 140,
        },
        {
            title: '目的域名',
            dataIndex: 'targetDomain',
            key: 'targetDomain',
        },
        {
            title: '最近被测绘目的URL',
            dataIndex: 'targetURL',
            key: 'targetURL',
            ellipsis: true,
        },
        {
            title: '所属资产分组',
            dataIndex: 'assetGroup',
            key: 'assetGroup',
            width: 180,
        },
        {
            title: '被测绘次数',
            dataIndex: 'mappingCount',
            key: 'mappingCount',
            width: 120,
            render: (count: number) => {
                // 根据次数设置不同的颜色
                let color = 'success';
                if (count > 100) {
                    color = 'error';
                } else if (count > 50) {
                    color = 'warning';
                } else if (count > 20) {
                    color = 'processing';
                }

                return (
                    <Tag color={color}>
                        {count} 次
                    </Tag>
                );
            },
        },
        {
            title: '时间',
            dataIndex: 'time',
            key: 'time',
            width: 180,
        },
        {
            title: '操作',
            key: 'operation',
            width: 100,
            render: (_, record) => (
                <Button
                    type="link"
                    size="small"
                    onClick={() => {
                        setCurrentRecord(record);
                        setDrawerVisible(true);
                    }}
                >
                    详情
                </Button>
            ),
        },
    ];

    const onFinish = (values: any) => {
        console.log('Search form values:', values);
    };

    const handleReset = () => {
        form.resetFields();
    };

    // 添加级联选择器的选项数据
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

    // 添加选择框配置
    const rowSelection = {
        selectedRowKeys,
        onChange: (newSelectedRowKeys: React.Key[]) => {
            setSelectedRowKeys(newSelectedRowKeys);
        }
    };

    // 计算当前页的数据
    const getCurrentPageData = () => {
        const startIndex = (currentPage - 1) * pageSize;
        return mockData.slice(startIndex, startIndex + pageSize);
    };

    // 处理页码改变
    const handlePageChange = (page: number, size?: number) => {
        setCurrentPage(page);
        size && setPageSize(size);
        setSelectedRowKeys([]); // 切换页面时清空选中项
    };

    // 处理每页条数改变
    const handleSizeChange = (_: number, size: number) => {
        setPageSize(size);
        setCurrentPage(1); // 重置到第一页
        setSelectedRowKeys([]); // 清空选中项
    };

    // 处理保存条件按钮点击
    const handleSaveCondition = () => {
        const currentConditions = form.getFieldsValue();
        // 检查是否有设置任何条件
        const hasConditions = Object.values(currentConditions).some(value => value !== undefined && value !== '');
        if (!hasConditions) {
            message.warning('请至少设置一个搜索条件');
            return;
        }
        setIsModalVisible(true);
    };

    // 处理模态框确认
    const handleModalOk = () => {
        if (!conditionName.trim()) {
            message.warning('请输入条件名称');
            return;
        }

        const currentConditions = form.getFieldsValue();
        const newCondition = {
            label: conditionName,
            value: conditionName,
            conditions: currentConditions
        };

        setSavedConditions([...savedConditions, newCondition]);
        setIsModalVisible(false);
        setConditionName('');
        message.success('搜索条件保存成功');
    };

    // 处理快捷搜索选择
    const handleQuickSearch = (value: string) => {
        const selectedCondition = savedConditions.find(item => item.value === value);
        if (selectedCondition) {
            form.setFieldsValue(selectedCondition.conditions);
        }
    };

    // 添加一个获取端口颜色的辅助函数
    const getPortColor = (port: string) => {
        const portNumber = parseInt(port.split('/')[0]);
        if (portNumber === 80 || portNumber === 443) return 'blue';    // Web服务端口
        if (portNumber === 22 || portNumber === 3389) return 'purple'; // 远程管理端口
        if (portNumber === 3306 || portNumber === 1433) return 'orange'; // 数据库端口
        if (portNumber === 8080 || portNumber === 8443) return 'cyan';  // 应用服务端口
        return 'default';  // 其他端口
    };

    // 添加一个辅助函数来获取对应的国旗组件
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

    return (
        <Card>
            <Form
                form={form}
                name="exposure_log_search"
                onFinish={onFinish}
                style={{ marginBottom: 24 }}
            >
                <Row gutter={[16, 16]}>
                    <Col span={3}>
                        <Form.Item name="quickSearch" style={{ marginBottom: 0 }}>
                            <LabelSelect
                                label="快捷搜索"
                                placeholder="请选择"
                                onChange={handleQuickSearch}
                            >
                                {savedConditions.map(item => (
                                    <Option key={item.value} value={item.value}>
                                        {item.label}
                                    </Option>
                                ))}
                            </LabelSelect>
                        </Form.Item>
                    </Col>
                    <Col span={3}>
                        <Form.Item name="sourceIP" style={{ marginBottom: 0 }}>
                            <LabelInput
                                label="源IP"
                                placeholder="请输入"
                            />
                        </Form.Item>
                    </Col>

                    <Col span={4}>
                        <Form.Item name="protectionType" style={{ marginBottom: 0 }}>
                            <LabelSelect
                                label="防护类型"
                                placeholder="请选择"
                            >
                                <Option value="all">全部</Option>
                                <Option value="nmap">Nmap</Option>
                            </LabelSelect>
                        </Form.Item>
                    </Col>
                    <Col span={4}>
                        <Form.Item name="assetGroup" style={{ marginBottom: 0 }}>
                            <LabelInput
                                label="所属资产分组"
                                placeholder="请输入"
                            />
                        </Form.Item>
                    </Col>
                    <Col span={4}>
                        <Form.Item name="location" style={{ marginBottom: 0 }}>
                            <LabelCascader
                                label="归属地"
                                options={locationOptions}
                                placeholder="请选择"
                            />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item style={{ marginBottom: 0 }}>
                            <Space>
                                <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                                    查询
                                </Button>
                                <Button icon={<ReloadOutlined />} onClick={handleReset}>
                                    重置
                                </Button>
                                <Button icon={<SaveOutlined />} onClick={handleSaveCondition}>
                                    保存条件
                                </Button>
                            </Space>
                        </Form.Item>
                    </Col>
                </Row>
            </Form>

            {/* 条件渲染按钮 */}
            {selectedRowKeys.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                    <Space>
                        <Button icon={<ExportOutlined />}>
                            导出{selectedRowKeys.length > 0 ? `(${selectedRowKeys.length})` : ''}
                        </Button>
                        <Button icon={<DeleteOutlined />}>
                            清空{selectedRowKeys.length > 0 ? `(${selectedRowKeys.length})` : ''}
                        </Button>
                    </Space>
                </div>
            )}

            <Table
                rowSelection={rowSelection}
                columns={columns}
                dataSource={getCurrentPageData()}
                pagination={{
                    total: mockData.length,
                    current: currentPage,
                    pageSize: pageSize,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total) => `共 ${total} 条记录`,
                    onChange: handlePageChange,
                    onShowSizeChange: handleSizeChange,
                    pageSizeOptions: ['10', '20', '50', '100']
                }}
            />

            {/* 添加保存条件的模态框 */}
            <Modal
                title="保存搜索条件"
                open={isModalVisible}
                onOk={handleModalOk}
                onCancel={() => {
                    setIsModalVisible(false);
                    setConditionName('');
                }}
            >
                <Form layout="vertical">
                    <Form.Item
                        label="条件名称"
                        required
                        rules={[{ required: true, message: '请输入条件名称' }]}
                    >
                        <Input
                            placeholder="请输入条件名称"
                            value={conditionName}
                            onChange={e => setConditionName(e.target.value)}
                        />
                    </Form.Item>
                </Form>
            </Modal>

            {/* 添加抽屉组件 */}
            <Drawer
                title="详细信息"
                placement="right"
                width={960}
                onClose={() => {
                    setDrawerVisible(false);
                    setCurrentRecord(null);
                }}
                open={drawerVisible}
            >
                <Card title="资产暴露面分析">

                    <div style={{
                        background: 'linear-gradient(to right, rgba(255, 77, 79, 0.08) 0%, rgba(255, 77, 79, 0.05) 50%, rgba(255, 77, 79, 0.02) 100%)',
                        borderRadius: '4px',
                        padding: '20px',
                        marginBottom: '24px'
                    }}>
                        <Row gutter={[24, 24]} align="middle">
                            <Col span={16}>
                                <Space direction="vertical" size={12}>
                                    <Space size={16}>
                                        <Typography.Title level={4} style={{ margin: 0, fontSize: 16 }}>
                                            高危风险
                                        </Typography.Title>
                                        <Tag color="error">需立即处理</Tag>
                                    </Space>
                                    <Typography.Text type="secondary">
                                        检测到 3 个高危漏洞，1 个中危漏洞，建议及时进行安全加固
                                    </Typography.Text>
                                </Space>
                            </Col>
                            <Col span={8} style={{ textAlign: 'right' }}>
                                <Progress
                                    type="circle"
                                    percent={30}
                                    size={80}
                                    strokeWidth={6}
                                    strokeColor={{
                                        '0%': '#ff4d4f',
                                        '100%': '#ff7875'
                                    }}
                                    format={() => (
                                        <div style={{ fontSize: 20, color: '#000000d9' }}>
                                            30
                                            <div style={{ fontSize: 12, color: '#00000073', marginTop: 4 }}>安全分</div>
                                        </div>
                                    )}
                                />
                            </Col>
                        </Row>
                    </div>
                    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                        <Col span={8}>
                            <Typography.Text type="secondary">目的IP：</Typography.Text>
                            <Typography.Text strong>{currentRecord?.targetIP}</Typography.Text>
                        </Col>
                        <Col span={8}>
                            <Typography.Text type="secondary">目的域名：</Typography.Text>
                            <Typography.Text strong>{currentRecord?.targetDomain}</Typography.Text>
                        </Col>
                        <Col span={8}>
                            <Typography.Text type="secondary">被测绘次数：</Typography.Text>
                            {currentRecord?.mappingCount && (
                                <Tag color={
                                    currentRecord.mappingCount > 100 ? 'error' :
                                        currentRecord.mappingCount > 50 ? 'warning' :
                                            currentRecord.mappingCount > 20 ? 'processing' : 'success'
                                }>
                                    {currentRecord.mappingCount} 次
                                </Tag>
                            )}
                        </Col>
                    </Row>
                    <Row gutter={[16, 16]}>

                        {/* 运行服务卡片 */}
                        <Col span={24}>
                            <h3>运行服务</h3>
                            <List
                                split={false}
                                dataSource={[
                                    {
                                        name: 'WordPress',
                                        version: '5.2.4',
                                        risk: 'high',
                                        ports: ['80/TCP', '443/TCP']
                                    },
                                    {
                                        name: 'Tomcat',
                                        version: '9.0.30',
                                        risk: 'low',
                                        ports: ['8080/TCP']
                                    },
                                    {
                                        name: 'MySQL',
                                        version: '5.7.26',
                                        risk: 'medium',
                                        ports: ['3306/TCP']
                                    },
                                    {
                                        name: 'Nginx',
                                        version: '1.18.0',
                                        risk: 'low',
                                        ports: ['80/TCP', '443/TCP']
                                    },
                                    {
                                        name: 'SSH',
                                        version: '8.9p1',
                                        risk: 'low',
                                        ports: ['22/TCP']
                                    }
                                ]}
                                renderItem={item => (
                                    <List.Item style={{ padding: '8px 0' }}>
                                        <div style={{
                                            padding: '12px 16px',
                                            background: '#fff',
                                            width: '100%',
                                            border: '1px solid #f0f0f0',
                                            borderRadius: '4px'
                                        }}>
                                            <Row justify="space-between" align="middle">
                                                <Col>
                                                    <Space size={16}>
                                                        <Space>
                                                            <Typography.Text strong>{item.name}</Typography.Text>
                                                            <Typography.Text type="secondary">v{item.version}</Typography.Text>
                                                        </Space>
                                                        <Space size={4}>
                                                            {item.ports.map(port => (
                                                                <Tag
                                                                    key={port}
                                                                    color={getPortColor(port)}
                                                                    style={{
                                                                        borderRadius: '2px',
                                                                        fontSize: '12px',
                                                                        padding: '0 6px',
                                                                        lineHeight: '20px'
                                                                    }}
                                                                >
                                                                    {port}
                                                                </Tag>
                                                            ))}
                                                        </Space>
                                                    </Space>
                                                </Col>
                                                <Col>
                                                    {item.risk === 'high' && (
                                                        <Tag color="error">需更新</Tag>
                                                    )}
                                                </Col>
                                            </Row>
                                        </div>
                                    </List.Item>
                                )}
                            />

                        </Col>

                        {/* 风险详情卡片 */}
                        <Col span={24}>
                            <h3 style={{ marginBottom: '16px' }}>风险详情</h3>
                            <div style={{ position: 'relative' }}>
                                <style>{timelineItemStyle}</style>
                                <Timeline
                                    style={{
                                        padding: '0 10px',
                                        marginTop: '16px'
                                    }}
                                    items={[
                                        {
                                            children: (
                                                <Card
                                                    size="small"
                                                    bordered={false}
                                                    style={{
                                                        boxShadow: 'none',
                                                    }}
                                                >
                                                    <Typography.Text strong style={{ display: 'block', marginBottom: 8 }}>
                                                        WordPress 5.2.4 版本存在 SQL 注入漏洞
                                                    </Typography.Text>
                                                    <Typography.Text type="secondary">
                                                        该版本存在高危安全漏洞，可能导致数据库被非法访问。建议立即升级到最新版本，并及时进行安全补丁更新。
                                                    </Typography.Text>
                                                </Card>
                                            )
                                        },
                                        {
                                            children: (
                                                <Card
                                                    size="small"
                                                    bordered={false}
                                                    style={{
                                                        boxShadow: 'none',
                                                        marginBottom: '-20px'
                                                    }}
                                                >
                                                    <Typography.Text strong style={{ display: 'block', marginBottom: 8 }}>
                                                        MySQL 5.7.26 版本已过期
                                                    </Typography.Text>
                                                    <Typography.Text type="secondary">
                                                        当前版本已不再获得官方安全更新支持，建议升级到 8.0 系列最新版本。
                                                    </Typography.Text>
                                                </Card>
                                            )
                                        }
                                    ]}
                                />
                            </div>

                        </Col>

                        {/* 处置建议卡片 */}
                        <Col span={24}>
                            <h3>处置建议</h3>
                            <div style={{ position: 'relative' }}>
                                <style>{timelineItemStyle}</style>
                                <Timeline
                                    style={{
                                        padding: '0 10px',
                                        marginTop: '16px'
                                    }}
                                    items={[
                                        {
                                            children: (
                                                <Card
                                                    size="small"
                                                    bordered={false}
                                                    style={{
                                                        boxShadow: 'none',
                                                    }}
                                                >
                                                    <Typography.Text strong style={{ display: 'block', marginBottom: 8 }}>
                                                        立即更新 WordPress
                                                    </Typography.Text>
                                                    <Typography.Text type="secondary">
                                                        升级到最新的稳定版本，并安装所有可用的安全补丁。更新后请确保网站功能正常运行。
                                                    </Typography.Text>
                                                </Card>
                                            )
                                        },
                                        {
                                            children: (
                                                <Card
                                                    size="small"
                                                    bordered={false}
                                                    style={{
                                                        boxShadow: 'none',
                                                    }}
                                                >
                                                    <Typography.Text strong style={{ display: 'block', marginBottom: 8 }}>
                                                        升级 MySQL 数据库
                                                    </Typography.Text>
                                                    <Typography.Text type="secondary">
                                                        计划在合适的时间窗口进行数据库版本升级。建议先在测试环境验证，确保业务兼容性。
                                                    </Typography.Text>
                                                </Card>
                                            )
                                        },
                                        {
                                            children: (
                                                <Card
                                                    size="small"
                                                    bordered={false}
                                                    style={{
                                                        boxShadow: 'none',
                                                    }}
                                                >
                                                    <Typography.Text strong style={{ display: 'block', marginBottom: 8 }}>
                                                        开启K01应用隐身功能
                                                    </Typography.Text>
                                                    <Typography.Text type="secondary">
                                                        建议开启K01应用隐身功能，以避免暴露面被爬虫工具发现。
                                                    </Typography.Text>
                                                </Card>
                                            )
                                        },
                                        {
                                            children: (
                                                <Card
                                                    size="small"
                                                    bordered={false}
                                                    style={{
                                                        boxShadow: 'none',
                                                        marginBottom: '-20px'
                                                    }}
                                                >
                                                    <Typography.Text strong style={{ display: 'block', marginBottom: 8 }}>
                                                        持续监控
                                                    </Typography.Text>
                                                    <Typography.Text type="secondary">
                                                        启用安全审计功能，定期检查系统日志。建议配置异常行为告警，实时监控潜在威胁。
                                                    </Typography.Text>
                                                </Card>
                                            )
                                        }
                                    ]}
                                />
                            </div>
                        </Col>
                    </Row>
                </Card>
                <Card title="资产暴露面日志" style={{ marginTop: 24 }}>
                    <Table
                        dataSource={[
                            {
                                key: '1',
                                time: '2024-03-15 14:30:22',
                                sourceIP: '192.168.1.100',
                                location: '中国 | 北京',
                                count: 156
                            },
                            {
                                key: '2',
                                time: '2024-03-15 13:25:16',
                                sourceIP: '192.168.1.101',
                                location: '中国 | 上海',
                                count: 89
                            },
                            {
                                key: '3',
                                time: '2024-03-15 12:18:45',
                                sourceIP: '192.168.1.102',
                                location: '美国 | 加利福尼亚',
                                count: 45
                            }
                        ]}
                        columns={[
                            {
                                title: '最近测绘时间',
                                dataIndex: 'time',
                                key: 'time',
                                width: 180
                            },
                            {
                                title: '源IP',
                                dataIndex: 'sourceIP',
                                key: 'sourceIP',
                                width: 150
                            },
                            {
                                title: '源IP归属地',
                                dataIndex: 'location',
                                key: 'location',
                                width: 200,
                                render: (text: string) => {
                                    const country = text.split('|')[0].trim();
                                    const FlagComponent = getFlagComponent(country);
                                    return (
                                        <Space>
                                            {FlagComponent && <FlagComponent style={{ width: 16 }} />}
                                            <span>{text}</span>
                                        </Space>
                                    );
                                }
                            },
                            {
                                title: '测绘次数',
                                dataIndex: 'count',
                                key: 'count',
                                width: 120,
                                render: (count: number) => (
                                    <Tag color={
                                        count > 100 ? 'error' :
                                            count > 50 ? 'warning' :
                                                count > 20 ? 'processing' : 'success'
                                    }>
                                        {count} 次
                                    </Tag>
                                )
                            }
                        ]}
                        pagination={{
                            pageSize: 5,
                            showSizeChanger: false,
                            showTotal: (total) => `共 ${total} 条记录`
                        }}
                    />
                </Card>
            </Drawer >
        </Card >
    );
};

export default AntiMappingAssets; 