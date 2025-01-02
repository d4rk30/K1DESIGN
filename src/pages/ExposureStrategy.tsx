import React, { useState } from 'react';
import { Card, Table, Switch, Space, Button, Tag, Row, Drawer, Form, Select, Col, Tabs } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { EditOutlined, CopyOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import LabelInput from '../components/LabelInput';
import LabelSelect from '../components/LabelSelect';

interface StrategyType {
    key: string;
    name: string;
    remark: string;
    status: boolean;
}

const ExposureStrategy: React.FC = () => {
    const [form] = Form.useForm();
    const [drawerVisible, setDrawerVisible] = useState(false);

    // 模拟数据
    const mockData: StrategyType[] = [
        {
            key: '1',
            name: '默认监测策略',
            remark: '系统默认的监测策略，包含基础的监测规则',
            status: true,
        },
        {
            key: '2',
            name: 'Web应用监测策略',
            remark: '针对Web应用的专项监测策略',
            status: true,
        },
        {
            key: '3',
            name: '数据库监测策略',
            remark: '针对数据库服务的监测策略',
            status: false,
        },
    ];

    const [dataSource, setDataSource] = useState<StrategyType[]>(mockData);

    const handleStatusChange = (checked: boolean, record: StrategyType) => {
        setDataSource(prev => prev.map(item =>
            item.key === record.key ? { ...item, status: checked } : item
        ));
    };

    const columns: ColumnsType<StrategyType> = [
        {
            title: '策略名称',
            dataIndex: 'name',
            key: 'name',
            width: 200,
        },
        {
            title: '备注',
            dataIndex: 'remark',
            key: 'remark',
            ellipsis: true,
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: (status: boolean, record) => (
                <Switch
                    checked={status}
                    onChange={(checked) => handleStatusChange(checked, record)}
                />
            ),
        },
        {
            title: '操作',
            key: 'action',
            width: 240,
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        type="link"
                        onClick={() => console.log('编辑', record)}
                    >
                        编辑
                    </Button>
                    <Button
                        type="link"
                        onClick={() => console.log('复制', record)}
                    >
                        复制
                    </Button>
                    <Button
                        type="link"
                        danger
                        onClick={() => console.log('删除', record)}
                    >
                        删除
                    </Button>
                </Space>
            ),
        },
    ];

    // 处理抽屉关闭
    const handleDrawerClose = () => {
        setDrawerVisible(false);
        form.resetFields();
    };

    // 在组件内添加配置项数据
    const commercialPlatforms = [
        {
            key: '1',
            name: 'DayDayMap',
            status: true,
            level: 'high',
            action: 'block'
        },
        {
            key: '2',
            name: 'Fofa',
            status: true,
            level: 'high',
            action: 'block'
        },
        {
            key: '3',
            name: 'Shodan',
            status: true,
            level: 'medium',
            action: 'monitor'
        },
        {
            key: '4',
            name: 'ZoomEye',
            status: true,
            level: 'high',
            action: 'block'
        },
        {
            key: '5',
            name: '360Quake',
            status: true,
            level: 'medium',
            action: 'monitor'
        },
        {
            key: '6',
            name: '其他探测平台',
            status: true,
            level: 'medium',
            action: 'monitor'
        },
        {
            key: '7',
            name: 'Censys',
            status: true,
            level: 'medium',
            action: 'monitor'
        }
    ];

    // 修改 tabItems 中商业测绘平台的内容
    const tabItems = [
        {
            key: 'commercial',
            label: '商业测绘平台',
            children: (
                <div style={{ padding: '16px 0' }}>
                    <Card title="商业测绘平台">
                        <Form layout="vertical">
                            {commercialPlatforms.map(platform => (
                                <Row
                                    key={platform.key}
                                    gutter={24}
                                    style={{
                                        marginBottom: 24,
                                        alignItems: 'flex-start'
                                    }}
                                >
                                    <Col span={6}>
                                        <div style={{
                                            fontSize: '14px',
                                            color: 'rgba(0, 0, 0, 0.88)',
                                            marginBottom: 8
                                        }}>
                                            {platform.name}
                                        </div>
                                    </Col>
                                    <Col span={6}>
                                        <Form.Item
                                            style={{ marginBottom: 0 }}
                                            name={`${platform.key}_status`}
                                            initialValue={platform.status}
                                        >
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px'
                                            }}>
                                                <span>开启状态</span>
                                                <Switch defaultChecked={platform.status} />
                                            </div>
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                        <Form.Item
                                            style={{ marginBottom: 0 }}
                                            name={`${platform.key}_level`}
                                            initialValue={platform.level}
                                        >
                                            <LabelSelect
                                                label="检测级别"
                                                placeholder="请选择"
                                            >
                                                <Select.Option value="high">高</Select.Option>
                                                <Select.Option value="medium">中</Select.Option>
                                                <Select.Option value="low">低</Select.Option>
                                            </LabelSelect>
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                        <Form.Item
                                            style={{ marginBottom: 0 }}
                                            name={`${platform.key}_action`}
                                            initialValue={platform.action}
                                        >
                                            <LabelSelect
                                                label="处理动作"
                                                placeholder="请选择"
                                            >
                                                <Select.Option value="block">阻断</Select.Option>
                                                <Select.Option value="monitor">监控</Select.Option>
                                            </LabelSelect>
                                        </Form.Item>
                                    </Col>
                                </Row>
                            ))}
                        </Form>
                    </Card>
                </div>
            ),
        },
        {
            key: 'crawler',
            label: '爬虫类工具',
            children: (
                <div style={{ padding: '16px 0' }}>
                    {/* 爬虫类工具的内容 */}
                </div>
            ),
        },
        {
            key: 'scanner',
            label: '扫描器类测绘',
            children: (
                <div style={{ padding: '16px 0' }}>
                    {/* 扫描器类测绘的内容 */}
                </div>
            ),
        },
    ];

    return (
        <Card>
            <Row justify="end" style={{ marginBottom: 16 }}>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setDrawerVisible(true)}
                >
                    添加策略
                </Button>
            </Row>
            <Table
                columns={columns}
                dataSource={dataSource}
                pagination={{
                    total: dataSource.length,
                    pageSize: 10,
                    showTotal: (total) => `共 ${total} 条记录`,
                }}
            />

            {/* 添加抽屉组件 */}
            <Drawer
                title="添加策略"
                placement="right"
                width={960}
                onClose={handleDrawerClose}
                open={drawerVisible}
            >
                <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px' }}>策略信息</div>
                <Form
                    form={form}
                    layout="vertical"
                >
                    <Row gutter={24}>
                        <Col span={12}>
                            <Form.Item
                                name="name"
                                rules={[{ required: true, message: '请输入策略名称' }]}
                            >
                                <LabelInput
                                    label="策略名称"
                                    placeholder="请输入策略名称"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="remark"
                            >
                                <LabelInput
                                    label="备注"
                                    placeholder="请输入备注信息"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="assetGroup"
                                rules={[{ required: true, message: '请选择防护资产组' }]}
                            >
                                <LabelSelect
                                    label="防护资产组"
                                    placeholder="请选择防护资产组"
                                >
                                    <Select.Option value="group1">资产组1</Select.Option>
                                    <Select.Option value="group2">资产组2</Select.Option>
                                    <Select.Option value="group3">资产组3</Select.Option>
                                </LabelSelect>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <div style={{ marginBottom: 24 }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '16px'  // 添加间距
                                }}>
                                    <span style={{ color: 'rgba(0, 0, 0, 0.88)', fontSize: '14px' }}>开启状态</span>
                                    <Form.Item
                                        name="status"
                                        valuePropName="checked"
                                        initialValue={true}
                                        style={{ marginBottom: 0 }}
                                    >
                                        <Switch defaultChecked />
                                    </Form.Item>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Form>
                <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '24px', marginTop: '16px' }}>策略规则</div>
                <Tabs
                    tabPosition="left"
                    items={tabItems}
                    style={{
                        minHeight: 300  // 设置最小高度，避免内容太少时的布局问题
                    }}
                />
            </Drawer>
        </Card>
    );
};

export default ExposureStrategy;