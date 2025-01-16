import React, { useState } from 'react';
import { Card, Table, Button, Space, Switch, Row, Col, message, Modal, Form, TimePicker, Checkbox } from 'antd';
import { ExclamationCircleOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import locale from 'antd/es/date-picker/locale/zh_CN';
import dayjs from 'dayjs';
import LabelInput from '@/components/LabelInput';
import LabelSelect from '@/components/LabelSelect';
import LabelTextArea from '@/components/LabelTextArea';

const { RangePicker } = TimePicker;

interface PolicyData {
    key: string;
    policyName: string;
    assetGroup: string;
    detectionLevel: string;
    action: string;
    description: string;
    status: boolean;
    effectiveTime?: [string, string];
    weekDays?: string[];
    passwordFields: string;
}

const tabList = [
    { key: 'policy', tab: '策略列表' },
    { key: 'custom', tab: '自定义口令列表' },
];

const PasswordPolicy: React.FC = () => {
    // 策略列表相关状态
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingPolicy, setEditingPolicy] = useState<PolicyData | null>(null);
    const [policyData, setPolicyData] = useState<PolicyData[]>([
        {
            key: '1',
            policyName: '默认弱口令策略',
            assetGroup: '所有资产',
            detectionLevel: '高',
            action: '阻断',
            description: '系统默认的弱口令检测策略',
            status: false,
            effectiveTime: ['00:00', '23:59'],
            weekDays: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
            passwordFields: 'password|passwd|pwd',
        },
        {
            key: '2',
            policyName: '测试环境策略',
            assetGroup: '测试服务器组',
            detectionLevel: '中',
            action: '监控',
            description: '测试环境的弱口令监控',
            status: false,
            effectiveTime: ['09:00', '18:00'],
            weekDays: ['MON', 'TUE', 'WED', 'THU', 'FRI'],
            passwordFields: 'password|pass',
        },
        {
            key: '3',
            policyName: '开发环境策略',
            assetGroup: '开发服务器组',
            detectionLevel: '低',
            action: '监控',
            description: '开发环境的弱口令监控',
            status: false,
            effectiveTime: ['09:00', '18:00'],
            weekDays: ['MON', 'TUE', 'WED', 'THU', 'FRI'],
            passwordFields: 'password|pwd',
        },
    ]);

    // 标签页状态
    const [activeTabKey, setActiveTabKey] = useState<string>('policy');
    const [form] = Form.useForm();

    // 策略列表相关处理函数
    const handleStatusChange = (checked: boolean, record: PolicyData) => {
        const newData = policyData.map(item => {
            if (item.key === record.key) {
                return { ...item, status: checked };
            }
            return item;
        });
        setPolicyData(newData);
        if (checked) {
            message.success(`${record.policyName}已启用`);
        } else {
            message.warning(`${record.policyName}已禁用`);
        }
    };

    const showModal = () => {
        setEditingPolicy(null);
        setIsModalVisible(true);
    };

    const showEditModal = (record: PolicyData) => {
        setEditingPolicy(record);
        form.setFieldsValue({
            policyName: record.policyName,
            assetGroup: assetGroupOptions.find(option => option.label === record.assetGroup)?.value,
            detectionLevel: detectionLevelOptions.find(option => option.label === record.detectionLevel)?.value,
            action: actionOptions.find(option => option.label === record.action)?.value,
            description: record.description,
            effectiveTime: record.effectiveTime?.map(time => dayjs(time, 'HH:mm')),
            weekDays: record.weekDays,
            passwordFields: record.passwordFields,
        });
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setEditingPolicy(null);
        form.resetFields();
    };

    const handleDelete = (record: PolicyData) => {
        Modal.confirm({
            title: '确认删除',
            icon: <ExclamationCircleOutlined />,
            content: `确定要删除策略"${record.policyName}"吗？`,
            okText: '确定',
            cancelText: '取消',
            onOk() {
                const newData = policyData.filter(item => item.key !== record.key);
                setPolicyData(newData);
                message.success('删除成功');
            },
        });
    };

    const handleAdd = (values: any) => {
        const assetGroupLabel = assetGroupOptions.find(option => option.value === values.assetGroup)?.label || '';
        const detectionLevelLabel = detectionLevelOptions.find(option => option.value === values.detectionLevel)?.label || '';
        const actionLabel = actionOptions.find(option => option.value === values.action)?.label || '';

        if (editingPolicy) {
            // 编辑模式
            const newData = policyData.map(item => {
                if (item.key === editingPolicy.key) {
                    return {
                        ...item,
                        policyName: values.policyName,
                        assetGroup: assetGroupLabel,
                        detectionLevel: detectionLevelLabel,
                        action: actionLabel,
                        description: values.description || '',
                        effectiveTime: values.effectiveTime?.map((time: dayjs.Dayjs) => time.format('HH:mm')),
                        weekDays: values.weekDays,
                        passwordFields: values.passwordFields,
                    };
                }
                return item;
            });
            setPolicyData(newData);
            message.success('策略更新成功！');
        } else {
            // 添加模式
            const newPolicy = {
                key: (policyData.length + 1).toString(),
                policyName: values.policyName,
                assetGroup: assetGroupLabel,
                detectionLevel: detectionLevelLabel,
                action: actionLabel,
                description: values.description || '',
                status: false,
                effectiveTime: values.effectiveTime?.map((time: dayjs.Dayjs) => time.format('HH:mm')),
                weekDays: values.weekDays,
                passwordFields: values.passwordFields,
            };
            setPolicyData([...policyData, newPolicy]);
            message.success('策略添加成功！');
        }
        setIsModalVisible(false);
        setEditingPolicy(null);
        form.resetFields();
    };

    // 选项配置
    const assetGroupOptions = [
        { label: '所有资产', value: 'all' },
        { label: '测试服务器组', value: 'test' },
        { label: '开发服务器组', value: 'dev' },
        { label: '生产服务器组', value: 'prod' },
    ];

    const detectionLevelOptions = [
        { label: '高', value: 'high' },
        { label: '中', value: 'medium' },
        { label: '低', value: 'low' },
    ];

    const actionOptions = [
        { label: '阻断', value: 'block' },
        { label: '监控', value: 'monitor' },
    ];

    const weekOptions = [
        { label: '周一', value: 'MON' },
        { label: '周二', value: 'TUE' },
        { label: '周三', value: 'WED' },
        { label: '周四', value: 'THU' },
        { label: '周五', value: 'FRI' },
        { label: '周六', value: 'SAT' },
        { label: '周日', value: 'SUN' },
    ];

    // 策略列表列定义
    const policyColumns = [
        {
            title: '策略名称',
            dataIndex: 'policyName',
            key: 'policyName',
        },
        {
            title: '资产分组',
            dataIndex: 'assetGroup',
            key: 'assetGroup',
        },
        {
            title: '检测级别',
            dataIndex: 'detectionLevel',
            key: 'detectionLevel',
        },
        {
            title: '处理动作',
            dataIndex: 'action',
            key: 'action',
        },
        {
            title: '备注',
            dataIndex: 'description',
            key: 'description',
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            render: (status: boolean, record: PolicyData) => (
                <Switch
                    checked={status}
                    onChange={(checked) => handleStatusChange(checked, record)}
                />
            ),
        },
        {
            title: '操作',
            key: 'action',
            render: (_: any, record: PolicyData) => (
                <Space size="middle">
                    <Button type="link" onClick={() => showEditModal(record)}>编辑</Button>
                    <Button type="link" danger onClick={() => handleDelete(record)}>删除</Button>
                </Space>
            ),
        },
    ];

    const handleBatchDelete = () => {
        Modal.confirm({
            title: '确认删除',
            icon: <ExclamationCircleOutlined />,
            content: `确定要删除选中的 ${selectedRowKeys.length} 条策略吗？`,
            okText: '确定',
            cancelText: '取消',
            onOk() {
                const newData = policyData.filter(item => !selectedRowKeys.includes(item.key));
                setPolicyData(newData);
                setSelectedRowKeys([]);
                message.success('批量删除成功');
            },
        });
    };

    const contentList: Record<string, React.ReactNode> = {
        policy: (
            <div>
                <Row justify="space-between" style={{ marginBottom: 16 }}>
                    <Col>
                        {selectedRowKeys.length > 0 && (
                            <Button danger icon={<DeleteOutlined />} onClick={handleBatchDelete}>
                                批量删除
                            </Button>
                        )}
                    </Col>
                    <Col>
                        <Button type="primary" icon={<PlusOutlined />} onClick={showModal}>
                            添加策略
                        </Button>
                    </Col>
                </Row>
                <Table
                    rowSelection={{
                        selectedRowKeys,
                        onChange: (newSelectedRowKeys: React.Key[]) => {
                            setSelectedRowKeys(newSelectedRowKeys);
                        },
                        columnWidth: 50
                    }}
                    columns={policyColumns}
                    dataSource={policyData}
                    pagination={{
                        total: policyData.length,
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total) => `共 ${total} 条`
                    }}
                />
            </div>
        ),
        custom: (
            <div>
                {/* 空内容 */}
            </div>
        ),
    };

    return (
        <Card
            className="password-policy-card"
            tabList={tabList}
            activeTabKey={activeTabKey}
            onTabChange={(key) => setActiveTabKey(key)}
            tabProps={{
                size: 'large',
            }}
        >
            {contentList[activeTabKey]}

            <Modal
                title={editingPolicy ? "编辑策略" : "添加策略"}
                open={isModalVisible}
                onOk={() => form.submit()}
                onCancel={handleCancel}
                okText="确定"
                cancelText="取消"
                width={600}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleAdd}
                    initialValues={{
                        passwordFields: 'password|passwd|pwd',
                        weekDays: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
                    }}
                >
                    <Form.Item
                        name="policyName"
                        rules={[{ required: true, message: '请输入策略名称' }]}
                    >
                        <LabelInput
                            label="策略名称"
                            required
                            placeholder="请输入策略名称"
                        />
                    </Form.Item>

                    <Form.Item
                        name="assetGroup"
                    >
                        <LabelSelect
                            label="资产分组"
                            placeholder="请选择资产分组"
                            options={assetGroupOptions}
                        />
                    </Form.Item>

                    <Form.Item
                        name="passwordFields"
                        rules={[{ required: true, message: '请输入密码字段名称' }]}
                    >
                        <LabelTextArea
                            label="密码字段名称"
                            required
                            placeholder="请输入密码字段名称，多个字段用|分隔"
                            autoSize={{ minRows: 2, maxRows: 6 }}
                        />
                    </Form.Item>

                    <Form.Item
                        name="detectionLevel"
                        rules={[{ required: true, message: '请选择检测级别' }]}
                    >
                        <LabelSelect
                            label="检测级别"
                            required
                            placeholder="请选择检测级别"
                            options={detectionLevelOptions}
                        />
                    </Form.Item>

                    <Form.Item
                        name="action"
                        rules={[{ required: true, message: '请选择处理动作' }]}
                    >
                        <LabelSelect
                            label="处理动作"
                            required
                            placeholder="请选择处理动作"
                            options={actionOptions}
                        />
                    </Form.Item>

                    <Form.Item label="生效时间" required>
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <Form.Item
                                name="effectiveTime"
                                rules={[{ required: true, message: '请选择生效时间段' }]}
                                style={{ marginBottom: 0 }}
                            >
                                <RangePicker
                                    format="HH:mm"
                                    placeholder={['开始时间', '结束时间']}
                                    style={{ width: '100%' }}
                                    locale={locale}
                                />
                            </Form.Item>

                            <Form.Item
                                name="weekDays"
                                rules={[{ required: true, message: '请选择生效日期' }]}
                                style={{ marginBottom: 0 }}
                            >
                                <Checkbox.Group style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
                                    {weekOptions.map(option => (
                                        <Checkbox key={option.value} value={option.value}>
                                            {option.label}
                                        </Checkbox>
                                    ))}
                                </Checkbox.Group>
                            </Form.Item>
                        </Space>
                    </Form.Item>

                    <Form.Item name="description">
                        <LabelTextArea
                            label="备注"
                            placeholder="请输入备注信息"
                            autoSize={{ minRows: 2, maxRows: 6 }}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </Card>
    );
};

export default PasswordPolicy;
