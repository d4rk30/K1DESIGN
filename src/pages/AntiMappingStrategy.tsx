import React, { useState } from 'react';
import { Card, Table, Switch, Space, Button, Row, Drawer, Form, Select, Col, Tabs } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined } from '@ant-design/icons';
import LabelInput from '@/components/LabelInput';
import LabelSelect from '@/components/LabelSelect';

interface StrategyType {
    key: string;
    name: string;
    remark: string;
    status: boolean;
}

const AntiMappingStrategy: React.FC = () => {
    const [form] = Form.useForm();
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [editingStrategy, setEditingStrategy] = useState<StrategyType | null>(null);

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
                        onClick={() => handleEdit(record)}
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
        setEditingStrategy(null);
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
            name: 'FOFA',
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
            name: 'Censys',
            status: true,
            level: 'medium',
            action: 'monitor'
        },
        {
            key: '7',
            name: '其他探测平台',
            status: true,
            level: 'medium',
            action: 'monitor'
        }
    ];

    // 添加爬虫工具数据
    const crawlerTools = [
        {
            key: '1',
            name: 'BaiduSpider爬虫测绘',
            status: true,
            level: 'high',
            action: 'block'
        },
        {
            key: '2',
            name: 'GoogleBot爬虫测绘',
            status: true,
            level: 'medium',
            action: 'monitor'
        },
        {
            key: '3',
            name: 'BingBot爬虫测绘',
            status: true,
            level: 'medium',
            action: 'monitor'
        },
        {
            key: '4',
            name: 'SougouSpider爬虫测绘',
            status: true,
            level: 'medium',
            action: 'monitor'
        },
        {
            key: '5',
            name: '360Spider爬虫测绘',
            status: true,
            level: 'medium',
            action: 'monitor'
        },
        {
            key: '6',
            name: '其他爬虫',
            status: true,
            level: 'medium',
            action: 'monitor'
        }
    ];

    // 在 commercialPlatforms 和 crawlerTools 后添加
    const scannerTools = [
        {
            key: '1',
            name: 'Nmap',
            status: true,
            level: 'high',
            action: 'block'
        },
        {
            key: '2',
            name: 'Zmap',
            status: true,
            level: 'high',
            action: 'block'
        },
        {
            key: '3',
            name: 'Masscan',
            status: true,
            level: 'high',
            action: 'block'
        },
        {
            key: '4',
            name: '系统扫描工具',
            status: true,
            level: 'medium',
            action: 'monitor'
        },
        {
            key: '5',
            name: 'WEB扫描工具',
            status: true,
            level: 'medium',
            action: 'monitor'
        },
        {
            key: '6',
            name: 'POC脆弱性',
            status: true,
            level: 'high',
            action: 'block'
        }
    ];

    // 添加一个新的内部组件
    const ToolConfigCard: React.FC<{
        title: string;
        tools: Array<{
            key: string;
            name: string;
            status: boolean;
            level: string;
            action: string;
        }>;
        prefix?: string;
    }> = ({ tools, prefix = '' }) => (
        <div style={{ padding: '16px 0' }}>
            <Card>
                <Form layout="vertical">
                    {tools.map(tool => (
                        <Row
                            key={tool.key}
                            gutter={24}
                            style={{
                                marginBottom: 24,
                                alignItems: 'center'
                            }}
                        >
                            <Col span={6}>
                                <div style={{
                                    fontSize: '14px',
                                    color: 'rgba(0, 0, 0, 0.88)',
                                    lineHeight: '32px',
                                    margin: 0
                                }}>
                                    {tool.name}
                                </div>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    style={{ marginBottom: 0 }}
                                    name={`${prefix}${tool.key}_status`}
                                    initialValue={tool.status}
                                >
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}>
                                        <span>开启状态</span>
                                        <Switch defaultChecked={tool.status} />
                                    </div>
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    style={{ marginBottom: 0 }}
                                    name={`${prefix}${tool.key}_level`}
                                    initialValue={tool.level}
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
                                    name={`${prefix}${tool.key}_action`}
                                    initialValue={tool.action}
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
    );

    // 修改 tabItems 的定义
    const tabItems = [
        {
            key: 'commercial',
            label: '商业测绘平台',
            children: <ToolConfigCard
                title="商业测绘平台"
                tools={commercialPlatforms}
            />
        },
        {
            key: 'crawler',
            label: '爬虫类工具',
            children: <ToolConfigCard
                title="爬虫类工具"
                tools={crawlerTools}
                prefix="crawler_"
            />
        },
        {
            key: 'scanner',
            label: '扫描器类测绘',
            children: <ToolConfigCard
                title="扫描器类测绘"
                tools={scannerTools}
                prefix="scanner_"
            />
        }
    ];

    // 添加编辑处理函数
    const handleEdit = (record: StrategyType) => {
        setEditingStrategy(record);
        form.setFieldsValue({
            name: record.name,
            remark: record.remark,
            status: record.status,
            assetGroup: 'group1', // 假设这是默认值
            // TODO: 设置其他字段的默认值
        });
        setDrawerVisible(true);
    };

    // 修改保存处理函数
    const handleSave = () => {
        form.validateFields().then(values => {
            console.log('表单数据:', values);
            if (editingStrategy) {
                // 处理编辑保存逻辑
                setDataSource(prev => prev.map(item =>
                    item.key === editingStrategy.key ? { ...item, ...values } : item
                ));
            } else {
                // 处理新增保存逻辑
                const newStrategy: StrategyType = {
                    key: Date.now().toString(), // 生成临时的key
                    name: values.name,
                    remark: values.remark,
                    status: values.status,
                };
                setDataSource(prev => [...prev, newStrategy]);
            }
            setDrawerVisible(false);
            setEditingStrategy(null);
            form.resetFields();
        }).catch(errorInfo => {
            console.log('表单验证失败:', errorInfo);
        });
    };

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
                title={editingStrategy ? "编辑策略" : "添加策略"}
                placement="right"
                width={960}
                onClose={handleDrawerClose}
                open={drawerVisible}
                footer={
                    <div style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '8px'
                    }}>
                        <Button onClick={handleDrawerClose}>取消</Button>
                        <Button type="primary" onClick={handleSave}>
                            保存
                        </Button>
                    </div>
                }
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

export default AntiMappingStrategy;