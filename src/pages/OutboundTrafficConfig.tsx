import React, { useState } from 'react';
import { Card, Table, Switch, Space, Button, Row, Drawer, Form, Select, Col, InputNumber } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import LabelInput from '@/components/LabelInput';
import LabelSelect from '@/components/LabelSelect';

interface OutboundConfigType {
    key: string;
    name: string;
    remark: string;
    status: boolean;
    rules?: Array<{
        trafficSize: number;
        protocol: string[];
        appType: string[];
    }>;
}

const OutboundTrafficConfig: React.FC = () => {
    const [form] = Form.useForm();
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [editingConfig, setEditingConfig] = useState<OutboundConfigType | null>(null);

    // 模拟数据
    const mockData: OutboundConfigType[] = [
        {
            key: '1',
            name: '默认出境流量策略',
            remark: '系统默认的出境流量监控策略，包含基础的流量控制规则',
            status: true,
            rules: [
                {
                    trafficSize: 20,
                    protocol: ['TCP', 'UDP'],
                    appType: ['HTTP(S)', 'FTP']
                }
            ]
        },
        {
            key: '2',
            name: 'Web服务出境策略',
            remark: '针对Web服务的出境流量监控策略',
            status: false,
            rules: [
                {
                    trafficSize: 50,
                    protocol: ['TCP'],
                    appType: ['HTTP(S)']
                },
                {
                    trafficSize: 200,
                    protocol: ['TCP'],
                    appType: ['FTP']
                }
            ]
        },
    ];

    const [dataSource, setDataSource] = useState<OutboundConfigType[]>(mockData);

    const handleStatusChange = (checked: boolean, record: OutboundConfigType) => {
        setDataSource(prev => prev.map(item => {
            if (item.key === record.key) {
                return { ...item, status: checked };
            } else {
                // 当开启一个策略时，其他策略自动关闭
                return { ...item, status: checked ? false : item.status };
            }
        }));
    };

    const columns: ColumnsType<OutboundConfigType> = [
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
            width: 230,
            render: (_, record) => (
                <Space>
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
        setEditingConfig(null);
        form.resetFields();
    };



    // 编辑处理函数
    const handleEdit = (record: OutboundConfigType) => {
        setEditingConfig(record);
        form.setFieldsValue({
            name: record.name,
            remark: record.remark,
            status: record.status,
            assetGroup: 'group1', // 假设这是默认值
            rules: record.rules || [
                // 如果没有现有规则，设置默认规则
                {
                    trafficSize: 100,
                    protocol: ['TCP'],
                    appType: ['HTTP(S)']
                }
            ]
        });
        setDrawerVisible(true);
    };

    // 保存处理函数
    const handleSave = () => {
        form.validateFields().then(values => {
            console.log('表单数据:', values);
            console.log('策略规则:', values.rules);

            if (editingConfig) {
                // 处理编辑保存逻辑
                setDataSource(prev => prev.map(item => {
                    if (item.key === editingConfig.key) {
                        const updatedItem = {
                            ...item,
                            name: values.name,
                            remark: values.remark,
                            status: values.status,
                            // 这里可以保存策略规则到后端
                            rules: values.rules
                        };
                        return updatedItem;
                    } else {
                        // 如果编辑的策略被开启，则关闭其他策略
                        return { ...item, status: values.status ? false : item.status };
                    }
                }));
            } else {
                // 处理新增保存逻辑
                const newConfig: OutboundConfigType = {
                    key: Date.now().toString(), // 生成临时的key
                    name: values.name,
                    remark: values.remark,
                    status: values.status,
                    // 这里可以保存策略规则到后端
                    rules: values.rules
                };
                setDataSource(prev => [...prev, newConfig]);
            }
            setDrawerVisible(false);
            setEditingConfig(null);
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
                title={editingConfig ? "编辑出境流量策略" : "添加出境流量策略"}
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
                                rules={[{ required: true, message: '请选择监控资产组' }]}
                            >
                                <LabelSelect
                                    label="监控资产组"
                                    placeholder="请选择监控资产组"
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
                                    gap: '16px'
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

                    <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '24px', marginTop: '16px' }}>策略规则</div>
                    <Form.List name="rules" initialValue={[]}>
                        {(fields, { add, remove }) => (
                            <>
                                {fields.map(({ key, name, ...restField }) => (
                                    <Row key={key} gutter={16} style={{ marginBottom: 16, alignItems: 'center', flexWrap: 'nowrap' }}>
                                        <Col flex="0 0 auto">
                                            <div style={{
                                                fontSize: '14px',
                                                color: 'rgba(0, 0, 0, 0.88)',
                                                lineHeight: '32px',
                                                whiteSpace: 'nowrap',
                                            }}>
                                                流量大于
                                            </div>
                                        </Col>
                                        <Col flex="0 0 140px">
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'trafficSize']}
                                                rules={[{ required: true, message: '请输入流量大小' }]}
                                                style={{ marginBottom: 0 }}
                                            >
                                                <InputNumber
                                                    placeholder="请输入"
                                                    style={{ width: '100%' }}
                                                    min={0}
                                                    addonAfter="MB"
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col flex="0 0 auto">
                                            <div style={{
                                                fontSize: '14px',
                                                color: 'rgba(0, 0, 0, 0.88)',
                                                lineHeight: '32px',
                                                whiteSpace: 'nowrap',
                                            }}>
                                                且传输层协议为
                                            </div>
                                        </Col>
                                        <Col flex="1 1 120px">
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'protocol']}
                                                rules={[{ required: true, message: '请选择协议' }]}
                                                style={{ marginBottom: 0 }}
                                            >
                                                <Select
                                                    mode="multiple"
                                                    placeholder="请选择"
                                                    style={{ width: '100%' }}
                                                >
                                                    <Select.Option value="TCP">TCP</Select.Option>
                                                    <Select.Option value="UDP">UDP</Select.Option>
                                                    <Select.Option value="非TCP/UDP">非TCP/UDP</Select.Option>
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                        <Col flex="0 0 auto">
                                            <div style={{
                                                fontSize: '14px',
                                                color: 'rgba(0, 0, 0, 0.88)',
                                                lineHeight: '32px',
                                                whiteSpace: 'nowrap',
                                            }}>
                                                应用层协议为
                                            </div>
                                        </Col>
                                        <Col flex="1 1 120px">
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'appType']}
                                                rules={[{ required: true, message: '请选择应用类型' }]}
                                                style={{ marginBottom: 0 }}
                                            >
                                                <Select
                                                    mode="multiple"
                                                    placeholder="请选择"
                                                    style={{ width: '100%' }}
                                                >
                                                    <Select.Option value="HTTP(S)">HTTP(S)</Select.Option>
                                                    <Select.Option value="DNS">DNS</Select.Option>
                                                    <Select.Option value="SSH">SSH</Select.Option>
                                                    <Select.Option value="FTP">FTP</Select.Option>
                                                    <Select.Option value="SMTP">SMTP</Select.Option>
                                                    <Select.Option value="POP3">POP3</Select.Option>
                                                    <Select.Option value="IMAP">IMAP</Select.Option>
                                                    <Select.Option value="其他">其他</Select.Option>
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                        <Col flex="0 0 auto">
                                            <div style={{ display: 'flex', alignItems: 'center', height: '32px' }}>
                                                <Button
                                                    type="link"
                                                    danger
                                                    icon={<MinusCircleOutlined />}
                                                    onClick={() => remove(name)}
                                                    style={{ padding: '0 4px' }}
                                                >
                                                    删除
                                                </Button>
                                            </div>
                                        </Col>
                                    </Row>
                                ))}
                                <Row>
                                    <Col span={24}>
                                        <Button
                                            type="dashed"
                                            onClick={() => add()}
                                            block
                                            icon={<PlusOutlined />}
                                            style={{ marginBottom: 16 }}
                                        >
                                            添加一行
                                        </Button>
                                    </Col>
                                </Row>
                            </>
                        )}
                    </Form.List>
                </Form>
            </Drawer>
        </Card >
    );
};

export default OutboundTrafficConfig; 