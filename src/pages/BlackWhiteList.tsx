import React, { useState } from 'react';
import { Card, Form, Row, Col, Select, Button, Table, Space, Popconfirm, Modal, Radio } from 'antd';
import type { TableColumnsType } from 'antd';
import dayjs from 'dayjs';
import {
    SearchOutlined,
    ReloadOutlined,
    PlusOutlined,
    ImportOutlined,
    ExportOutlined,
    DeleteOutlined
} from '@ant-design/icons';
import LabelRangePicker from '@/components/LabelRangePicker';
import LabelInput from '@/components/LabelInput';
import LabelSelect from '@/components/LabelSelect';
import LabelTextArea from '@/components/LabelTextArea';
import LabelInputNumber from '@/components/LabelInputNumber';

interface IPBlacklistItem {
    key: string;
    ip: string;
    type: string;
    expireTime: string;
    createTime: string;
    remark: string;
}

interface AddIPBlacklistFormData {
    type: 'source' | 'target';
    ip: string;
    expireValue: number;
    expireUnit: 'minute' | 'hour' | 'day' | 'month' | 'forever';
    remark: string;
}

interface IPBlacklistModalProps {
    open: boolean;
    onOk: (values: AddIPBlacklistFormData) => void;
    onCancel: () => void;
    mode: 'add' | 'edit';
    initialValues?: Partial<AddIPBlacklistFormData>;
}

const IPBlacklistModal: React.FC<IPBlacklistModalProps> = ({
    open,
    onOk,
    onCancel,
    mode,
    initialValues
}) => {
    const [form] = Form.useForm<AddIPBlacklistFormData>();
    const isEdit = mode === 'edit';

    const handleOk = () => {
        form.validateFields().then((values) => {
            onOk(values);
            form.resetFields();
        });
    };

    const handleCancel = () => {
        form.resetFields();
        onCancel();
    };

    return (
        <Modal
            title={isEdit ? "编辑IP黑名单" : "添加IP黑名单"}
            open={open}
            onOk={handleOk}
            onCancel={handleCancel}
            okText="确定"
            cancelText="取消"
            afterClose={() => form.resetFields()}
        >
            <Form
                form={form}
                layout="vertical"
                initialValues={{ type: 'source', expireUnit: 'minute', ...initialValues }}
            >
                <Form.Item
                    name="type"
                    label="类型"
                    rules={[{ required: true, message: '请选择类型' }]}
                >
                    <Radio.Group disabled={isEdit}>
                        <Radio value="source">源地址</Radio>
                        <Radio value="target">目标地址</Radio>
                    </Radio.Group>
                </Form.Item>

                <Form.Item
                    name="ip"
                    rules={[{ required: true, message: '请输入IP或IP段' }]}
                >
                    <LabelInput
                        label="IP/IP段"
                        placeholder="192.168.1.1 或 192.168.1.0/24"
                        disabled={isEdit}
                        required
                    />
                </Form.Item>

                <Form.Item>
                    <Row gutter={[16, 16]}>
                        <Col span={24}>
                            <Form.Item
                                name="expireValue"
                                rules={[{ required: true, message: '请输入过期时长' }]}
                                style={{ marginBottom: 0 }}
                            >
                                <LabelInputNumber
                                    label="过期时长"
                                    style={{ width: '100%' }}
                                    min={1}
                                    placeholder="请输入过期时长"
                                    required
                                />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                name="expireUnit"
                                rules={[{ required: true, message: '请选择时间单位' }]}
                                style={{ marginBottom: 0 }}
                            >
                                <Radio.Group buttonStyle="solid" style={{ width: '100%', display: 'flex' }}>
                                    <Radio.Button value="minute" style={{ flex: 1, textAlign: 'center' }}>分</Radio.Button>
                                    <Radio.Button value="hour" style={{ flex: 1, textAlign: 'center' }}>时</Radio.Button>
                                    <Radio.Button value="day" style={{ flex: 1, textAlign: 'center' }}>天</Radio.Button>
                                    <Radio.Button value="month" style={{ flex: 1, textAlign: 'center' }}>月</Radio.Button>
                                    <Radio.Button value="forever" style={{ flex: 1, textAlign: 'center' }}>永久</Radio.Button>
                                </Radio.Group>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form.Item>

                <Form.Item name="remark">
                    <LabelTextArea
                        label="备注"
                        rows={4}
                        placeholder="请输入备注"
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};

const tabList = [
    { key: 'ip-blacklist', tab: 'IP黑名单' },
    { key: 'ip-whitelist', tab: 'IP白名单' },
    { key: 'url-blacklist', tab: 'URL黑名单' },
    { key: 'url-whitelist', tab: 'URL白名单' },
    { key: 'config', tab: '黑白名单配置' },
];

const BlackWhiteList: React.FC = () => {
    const [activeTabKey, setActiveTabKey] = useState<string>('ip-blacklist');
    const [form] = Form.useForm();
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [editRecord, setEditRecord] = useState<Partial<AddIPBlacklistFormData>>();

    // 模拟数据
    const data: IPBlacklistItem[] = [
        {
            key: '1',
            ip: '192.168.1.1/24',
            type: '源地址',
            expireTime: '30天',
            createTime: '2023-12-17 12:00:00',
            remark: '测试IP'
        },
    ];

    const handleFilter = (values: any) => {
        console.log('Filter values:', values);
    };

    const handleReset = () => {
        form.resetFields();
    };

    const showAddModal = () => {
        setModalMode('add');
        setEditRecord(undefined);
        setModalVisible(true);
    };

    const showEditModal = (record: IPBlacklistItem) => {
        setModalMode('edit');
        setEditRecord({
            type: record.type === '源地址' ? 'source' : 'target',
            ip: record.ip,
            remark: record.remark
        });
        setModalVisible(true);
    };

    const handleModalOk = (values: AddIPBlacklistFormData) => {
        console.log(modalMode === 'add' ? '添加IP黑名单：' : '编辑IP黑名单：', values);
        setModalVisible(false);
    };

    const handleModalCancel = () => {
        setModalVisible(false);
    };

    const handleDelete = (record: IPBlacklistItem) => {
        console.log('Delete record:', record);
    };

    const columns: TableColumnsType<IPBlacklistItem> = [
        {
            title: 'IP/IP段',
            dataIndex: 'ip',
            key: 'ip',
        },
        {
            title: '类型',
            dataIndex: 'type',
            key: 'type',
        },
        {
            title: '过期时长',
            dataIndex: 'expireTime',
            key: 'expireTime',
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
        },
        {
            title: '操作',
            key: 'action',
            width: 150,
            render: (_, record) => (
                <Space>
                    <Button type="link" onClick={() => showEditModal(record)}>
                        编辑
                    </Button>
                    <Popconfirm
                        title="确定要删除吗？"
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

    const contentList: Record<string, React.ReactNode> = {
        'ip-blacklist': (
            <div>
                <Form
                    form={form}
                    onFinish={handleFilter}
                    style={{ marginBottom: '16px' }}
                >
                    <Row gutter={[16, 16]} align="middle">
                        <Col flex="1">
                            <Form.Item name="ip" style={{ marginBottom: 0 }}>
                                <LabelInput
                                    label="IP/IP段"
                                    placeholder="请输入IP或IP段"
                                />
                            </Form.Item>
                        </Col>
                        <Col flex="1">
                            <Form.Item name="type" style={{ marginBottom: 0 }}>
                                <LabelSelect
                                    label="类型"
                                    placeholder="请选择类型"
                                    style={{ width: '100%' }}
                                >
                                    <Select.Option value="all">全部</Select.Option>
                                    <Select.Option value="source">源地址</Select.Option>
                                    <Select.Option value="target">目标地址</Select.Option>
                                </LabelSelect>
                            </Form.Item>
                        </Col>
                        <Col flex="1">
                            <Form.Item name="dateRange" style={{ marginBottom: 0 }}>
                                <LabelRangePicker
                                    label="创建时间"
                                    showTime
                                    format="YYYY-MM-DD HH:mm:ss"
                                    presets={[
                                        {
                                            label: '今日',
                                            value: [dayjs().startOf('day'), dayjs().endOf('day')]
                                        },
                                        {
                                            label: '本周',
                                            value: [dayjs().startOf('week'), dayjs().endOf('week')]
                                        },
                                        {
                                            label: '当月',
                                            value: [dayjs().startOf('month'), dayjs().endOf('month')]
                                        }
                                    ]}
                                    placeholder={['开始时间', '结束时间']}
                                />
                            </Form.Item>
                        </Col>
                        <Col flex="1">
                            <Form.Item name="remark" style={{ marginBottom: 0 }}>
                                <LabelInput
                                    label="备注"
                                    placeholder="请输入备注"
                                />
                            </Form.Item>
                        </Col>
                        <Col>
                            <Form.Item style={{ marginBottom: 0 }}>
                                <Space>
                                    <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                                        搜索
                                    </Button>
                                    <Button icon={<ReloadOutlined />} onClick={handleReset}>
                                        重置
                                    </Button>
                                </Space>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row style={{ marginTop: '16px' }} justify="space-between">
                        <Col>
                            <Space>
                                {selectedRowKeys.length > 0 && (
                                    <>
                                        <Button icon={<ExportOutlined />}>
                                            导出
                                        </Button>
                                        <Popconfirm
                                            title="确定要删除选中的记录吗？"
                                            onConfirm={() => {
                                                console.log('批量删除', selectedRowKeys);
                                                setSelectedRowKeys([]);
                                            }}
                                            okText="确定"
                                            cancelText="取消"
                                        >
                                            <Button danger icon={<DeleteOutlined />}>
                                                批量删除
                                            </Button>
                                        </Popconfirm>
                                    </>
                                )}
                            </Space>
                        </Col>
                        <Col>
                            <Space>
                                <Button icon={<ImportOutlined />}>
                                    导入
                                </Button>
                                <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
                                    添加
                                </Button>
                            </Space>
                        </Col>
                    </Row>
                </Form>

                <Table
                    rowSelection={rowSelection}
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
            </div>
        ),
        'ip-whitelist': <div>IP白名单内容</div>,
        'url-blacklist': <div>URL黑名单内容</div>,
        'url-whitelist': <div>URL白名单内容</div>,
        'config': <div>黑白名单配置内容</div>,
    };

    const onTabChange = (key: string) => {
        setActiveTabKey(key);
    };

    return (
        <div>
            <Card
                tabList={tabList}
                activeTabKey={activeTabKey}
                onTabChange={onTabChange}
                className="blacklist-card"
            >
                {contentList[activeTabKey]}
            </Card>

            <IPBlacklistModal
                open={modalVisible}
                onOk={handleModalOk}
                onCancel={handleModalCancel}
                mode={modalMode}
                initialValues={editRecord}
            />
        </div>
    );
};

export default BlackWhiteList;
