import React, { useState } from 'react';
import { Card, Table, Button, Space, Form, Input, Modal, Popconfirm, message, Typography, Select, Row, Upload } from 'antd';
import type { TableColumnsType } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import LabelInput from '@/components/LabelInput';
import LabelSelect from '@/components/LabelSelect';
import LabelTextArea from '@/components/LabelTextArea';
import { LeftOutlined, SearchOutlined, ReloadOutlined, PlusOutlined, ImportOutlined, ExportOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';

const { Title } = Typography;

enum AssetZone {
    DMZ = 'DMZ',
    Trust = 'Trust',
    Untrust = 'Untrust',
    Management = 'Management',
    Guest = 'Guest',
    Other = 'Other'
}

enum AssetType {
    WebServer = 'Web Server',
    WindowsServer = 'Windows Server',
    LinuxServer = 'Linux Server',
    Database = 'Database',
    Firewall = 'Firewall',
    Switch = 'Switch',
    Router = 'Router',
    LoadBalancer = 'Load Balancer',
    VirtualMachine = 'Virtual Machine',
    ApplicationServer = 'Application Server',
    Storage = 'Storage',
    Other = 'Other'
}

// 添加资产类型的中文映射
const assetTypeLabels: Record<AssetType, string> = {
    [AssetType.WebServer]: 'Web Server（网站服务器）',
    [AssetType.WindowsServer]: 'Windows Server（Windows服务器）',
    [AssetType.LinuxServer]: 'Linux Server（Linux服务器）',
    [AssetType.Database]: 'Database（数据库）',
    [AssetType.Firewall]: 'Firewall（防火墙）',
    [AssetType.Switch]: 'Switch（交换机）',
    [AssetType.Router]: 'Router（路由器）',
    [AssetType.LoadBalancer]: 'Load Balancer（负载均衡器）',
    [AssetType.VirtualMachine]: 'Virtual Machine（虚拟机）',
    [AssetType.ApplicationServer]: 'Application Server（应用服务器）',
    [AssetType.Storage]: 'Storage（存储设备）',
    [AssetType.Other]: 'Other（其他）'
};

interface Asset {
    id: string;
    groupId: string;
    type: 'ip';
    value: string;
    port?: string;
    zone: AssetZone;
    assetType: AssetType;
    otherZone?: string;
    otherAssetType?: string;
    createTime: string;
    remark?: string;
}

const AssetList: React.FC = () => {
    const navigate = useNavigate();
    const { groupId } = useParams();
    const [form] = Form.useForm();
    const [filterForm] = Form.useForm();
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [modalType, setModalType] = useState<'ip'>('ip');
    const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
    const [isImportModalVisible, setIsImportModalVisible] = useState(false);

    // 模拟数据
    const data: (Asset & { key: string })[] = [
        {
            key: '1',
            id: '1',
            groupId: groupId || '',
            type: 'ip',
            value: '192.168.1.1/24',
            port: '80,443,8080',
            zone: AssetZone.DMZ,
            assetType: AssetType.WebServer,
            createTime: '2023-12-17 10:00:00',
            remark: '核心交换机网段'
        }
    ];

    const showModal = (type: 'ip', asset?: Asset) => {
        setModalType(type);
        setEditingAsset(asset || null);
        if (asset) {
            form.setFieldsValue(asset);
        }
        setIsModalVisible(true);
    };

    const handleOk = () => {
        form.validateFields().then((values) => {
            console.log('提交数据：', values);
            form.resetFields();
            setIsModalVisible(false);
            setEditingAsset(null);
            message.success(editingAsset ? '编辑成功' : '添加成功');
        });
    };

    const handleCancel = () => {
        form.resetFields();
        setIsModalVisible(false);
        setEditingAsset(null);
    };

    const handleDelete = (record: Asset) => {
        console.log('删除资产：', record);
        message.success('删除成功');
    };

    const handleFilter = (values: any) => {
        console.log('查询条件：', values);
    };

    const handleReset = () => {
        filterForm.resetFields();
    };

    const handleImport = () => {
        setIsImportModalVisible(true);
    };

    const handleImportCancel = () => {
        setIsImportModalVisible(false);
    };

    const handleDownloadTemplate = () => {
        // 这里实现下载模板的逻辑
        console.log('下载模板');
        message.success('模板下载成功');
    };

    const { Dragger } = Upload;

    const uploadProps: UploadProps = {
        name: 'file',
        action: '/api/asset/import',
        accept: '.xlsx,.xls',
        showUploadList: true,
        maxCount: 1,
        onChange(info) {
            if (info.file.status === 'done') {
                message.success(`${info.file.name} 导入成功`);
                setIsImportModalVisible(false);
            } else if (info.file.status === 'error') {
                message.error(`${info.file.name} 导入失败`);
            }
        },
    };

    const columns: TableColumnsType<Asset> = [
        {
            title: 'IP/IP段',
            dataIndex: 'value',
            key: 'value',
        },
        {
            title: '区域',
            dataIndex: 'zone',
            key: 'zone',
        },
        {
            title: '资产类型',
            dataIndex: 'assetType',
            key: 'assetType',
        },
        {
            title: '创建时间',
            dataIndex: 'createTime',
            key: 'createTime',
        },
        {
            title: '备注',
            dataIndex: 'remark',
            key: 'remark',
            ellipsis: true,
        },
        {
            title: '操作',
            key: 'action',
            width: 150,
            render: (_, record) => (
                <Space>
                    <Button
                        type="link"
                        onClick={() => showModal('ip', record)}
                    >
                        编辑
                    </Button>
                    <Popconfirm
                        title="确定要删除该资产吗？"
                        onConfirm={() => handleDelete(record)}
                        okText="确定"
                        cancelText="取消"
                    >
                        <Button type="link" danger>
                            删除
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const rowSelection = {
        selectedRowKeys,
        onChange: (newSelectedRowKeys: React.Key[]) => {
            setSelectedRowKeys(newSelectedRowKeys);
        },
        columnWidth: 50
    };

    // 监听区域选择变化
    const handleZoneChange = (value: AssetZone) => {
        if (value !== AssetZone.Other) {
            form.setFieldValue('otherZone', undefined);
        }
    };

    // 监听资产类型选择变化
    const handleAssetTypeChange = (value: AssetType) => {
        if (value !== AssetType.Other) {
            form.setFieldValue('otherAssetType', undefined);
        }
    };

    return (
        <Card
            title={
                <Space split={
                    <span style={{
                        margin: '0 8px',
                        color: 'rgba(0, 0, 0, 0.45)',
                        fontWeight: 'normal',
                        opacity: 1,
                        display: 'inline-block'
                    }}>
                        |
                    </span>
                }
                    align="center"
                >
                    <Button
                        type="link"
                        icon={<LeftOutlined />}
                        onClick={() => navigate('/asset-management')}
                        style={{
                            padding: '4px 8px',
                            height: 'auto',
                            lineHeight: 'inherit'
                        }}
                    >
                        返回
                    </Button>
                    <Title
                        level={5}
                        style={{
                            margin: 0,
                            lineHeight: 'inherit'
                        }}
                    >
                        核心业务资产组
                    </Title>
                </Space>
            }
        >
            <Form
                form={filterForm}
                onFinish={handleFilter}
                layout="inline"
                style={{ marginBottom: 24 }}
            >
                <Form.Item
                    name="ipValue"
                    style={{ marginBottom: 0 }}
                >
                    <LabelInput
                        label="IP/IP段"
                        placeholder="请输入IP/IP段"
                    //   style={{ minWidth: 200 }}
                    />
                </Form.Item>

                <Form.Item
                    name="zone"
                    style={{ marginBottom: 0 }}
                >
                    <LabelSelect
                        label="区域"
                        placeholder="请选择"
                        style={{ minWidth: 200 }}
                    >
                        {Object.values(AssetZone).map(zone => (
                            <Select.Option key={zone} value={zone}>
                                {zone === AssetZone.DMZ ? 'DMZ（隔离区）' :
                                    zone === AssetZone.Trust ? 'Trust（信任区）' :
                                        zone === AssetZone.Untrust ? 'Untrust（非信任区）' :
                                            zone === AssetZone.Management ? 'Management（管理区）' :
                                                zone === AssetZone.Guest ? 'Guest（访客区）' :
                                                    'Other（其他）'}
                            </Select.Option>
                        ))}
                    </LabelSelect>
                </Form.Item>

                <Form.Item
                    name="assetType"
                    style={{ marginBottom: 0 }}
                >
                    <LabelSelect
                        label="资产类型"
                        placeholder="请选择"
                        style={{ minWidth: 200 }}
                    >
                        {Object.values(AssetType).map(type => (
                            <Select.Option key={type} value={type}>
                                {assetTypeLabels[type]}
                            </Select.Option>
                        ))}
                    </LabelSelect>
                </Form.Item>

                <Form.Item style={{ marginBottom: 0 }}>
                    <Space>
                        <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                            搜索
                        </Button>
                        <Button onClick={handleReset} icon={<ReloadOutlined />}>
                            重置
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
            <Row style={{ marginBottom: 16 }} justify="space-between">
                <Space>
                    {selectedRowKeys.length > 0 && (
                        <React.Fragment key="selected-actions">
                            <Button icon={<ExportOutlined />}>
                                导出
                            </Button>
                            <Popconfirm
                                title="确定要删除选中的资产吗？"
                                onConfirm={() => {
                                    console.log('批量删除：', selectedRowKeys);
                                    message.success('删除成功');
                                    setSelectedRowKeys([]);
                                }}
                                okText="确定"
                                cancelText="取消"
                            >
                                <Button danger icon={<DeleteOutlined />}>
                                    批量删除
                                </Button>
                            </Popconfirm>
                        </React.Fragment>
                    )}
                </Space>
                <Space>
                    <Button type="primary" onClick={() => showModal('ip')} icon={<PlusOutlined />}>
                        添加IP/IP段
                    </Button>
                    <Button icon={<ImportOutlined />} onClick={handleImport}>
                        导入
                    </Button>
                </Space>
            </Row>
            <Table
                rowSelection={rowSelection}
                columns={columns}
                dataSource={data}
                rowKey="id"
                pagination={{
                    total: data.length,
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total) => `共 ${total} 条记录`,
                }}
            />
            <Modal
                title={editingAsset ? "编辑资产" : `添加${modalType === 'ip' ? 'IP/IP段' : '域名'}`}
                open={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
                okText="确定"
                cancelText="取消"
            >
                <Form
                    form={form}
                    layout="vertical"
                >
                    <Form.Item
                        name="value"
                        rules={[{ required: true, message: `请输入${modalType === 'ip' ? 'IP/IP段' : '域名'}` }]}
                    >
                        <LabelInput
                            label={modalType === 'ip' ? 'IP/IP段' : '域名'}
                            required
                            placeholder={modalType === 'ip'
                                ? '192.168.1.1 或 192.168.1.0/24'
                                : 'example.com 或 www.example.com 或 *.example.com'
                            }
                            disabled={!!editingAsset}
                        />
                    </Form.Item>

                    {modalType === 'ip' && (
                        <Form.Item
                            name="port"
                            rules={[{ required: true, message: '请输入端口' }]}
                        >
                            <LabelInput
                                label="端口"
                                required
                                placeholder="80 或 80-8080 或 0代表全端口"
                                disabled={!!editingAsset}
                            />
                        </Form.Item>
                    )}

                    <Form.Item
                        name="zone"
                        rules={[{ required: true, message: '请选择区域' }]}
                    >
                        <LabelSelect
                            label="区域"
                            required
                            placeholder="请选择"
                            onChange={handleZoneChange}
                        >
                            {Object.values(AssetZone).map(zone => (
                                <Select.Option key={zone} value={zone}>
                                    {zone === AssetZone.DMZ ? 'DMZ（隔离区）' :
                                        zone === AssetZone.Trust ? 'Trust（信任区）' :
                                            zone === AssetZone.Untrust ? 'Untrust（非信任区）' :
                                                zone === AssetZone.Management ? 'Management（管理区）' :
                                                    zone === AssetZone.Guest ? 'Guest（访客区）' :
                                                        'Other（其他）'}
                                </Select.Option>
                            ))}
                        </LabelSelect>
                    </Form.Item>

                    {/* 当区域选择"其他"时显示的输入框 */}
                    <Form.Item
                        noStyle
                        shouldUpdate={(prevValues, currentValues) => prevValues.zone !== currentValues.zone}
                    >
                        {({ getFieldValue }) =>
                            getFieldValue('zone') === AssetZone.Other && (
                                <div style={{ marginTop: -16 }}>
                                    <Form.Item
                                        name="otherZone"
                                        rules={[{ required: true, message: '请输入其他区域名称' }]}
                                    >
                                        <Input
                                            placeholder="请输入其他区域名称"
                                        />
                                    </Form.Item>
                                </div>
                            )
                        }
                    </Form.Item>

                    <Form.Item
                        name="assetType"
                        rules={[{ required: true, message: '请选择资产类型' }]}
                    >
                        <LabelSelect
                            label="资产类型"
                            required
                            placeholder="请选择"
                            onChange={handleAssetTypeChange}
                        >
                            {Object.values(AssetType).map(type => (
                                <Select.Option key={type} value={type}>
                                    {assetTypeLabels[type]}
                                </Select.Option>
                            ))}
                        </LabelSelect>
                    </Form.Item>

                    {/* 当资产类型选择"其他"时显示的输入框 */}
                    <Form.Item
                        noStyle
                        shouldUpdate={(prevValues, currentValues) => prevValues.assetType !== currentValues.assetType}
                    >
                        {({ getFieldValue }) =>
                            getFieldValue('assetType') === AssetType.Other && (
                                <div style={{ marginTop: -16 }}>
                                    <Form.Item
                                        name="otherAssetType"
                                        rules={[{ required: true, message: '请输入其他资产类型名称' }]}
                                    >
                                        <Input
                                            placeholder="请输入其他资产类型名称"
                                        />
                                    </Form.Item>
                                </div>
                            )
                        }
                    </Form.Item>

                    <Form.Item
                        name="remark"
                    >
                        <LabelTextArea
                            label="备注"
                            placeholder="请输入备注"
                            rows={4}
                        />
                    </Form.Item>
                </Form>
            </Modal>
            <Modal
                title="导入资产"
                open={isImportModalVisible}
                onCancel={handleImportCancel}
                footer={null}
            >
                <div style={{ marginBottom: 16 }}>
                    <Dragger {...uploadProps}>
                        <p className="ant-upload-drag-icon">
                            <UploadOutlined />
                        </p>
                        <p className="ant-upload-text">
                            点击或拖拽文件到此区域上传
                        </p>
                    </Dragger>
                </div>
                <div style={{
                    padding: '8px 16px',
                    background: '#f5f5f5',
                    borderRadius: 6,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <span style={{ color: 'rgba(0, 0, 0, 0.65)' }}>
                        先下载模板，在模板中填写需要上传的数据
                    </span>
                    <Button
                        type="link"
                        onClick={handleDownloadTemplate}
                        style={{ padding: 0 }}
                    >
                        下载模板
                    </Button>
                </div>
            </Modal>
        </Card>
    );
};

export default AssetList;

