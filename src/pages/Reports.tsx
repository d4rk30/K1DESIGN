import React, { useState } from 'react';
import { Card, Table, Button, Space, Progress, message, Popconfirm, Row, Col, Switch, Form, Modal, Radio, Alert } from 'antd';
import type { TableColumnsType } from 'antd';
import dayjs from 'dayjs';
import LabelInput from '@/components/LabelInput';
import LabelSelect from '@/components/LabelSelect';
import LabelRangePicker from '@/components/LabelRangePicker';
import {
    SearchOutlined,
    ReloadOutlined,
    ExportOutlined,
    DeleteOutlined,
    DownloadOutlined,
    PlusOutlined,
} from '@ant-design/icons';

interface ReportRecord {
    key: string;
    name: string;
    module: string;
    createTime: string;
    progress: number;
    exportType: 'manual' | 'auto';
    format: 'html' | 'pdf';
}

interface CycleConfig {
    type: 'daily' | 'weekly' | 'monthly';
}

interface ReportConfig {
    key: string;
    name: string;
    cycle: CycleConfig;
    modules: string[];
    format: 'html' | 'pdf';
    enabled: boolean;
}

// Mock数据
const mockData: ReportRecord[] = [
    {
        key: '1',
        name: '攻击监测日报',
        module: '攻击监测告警',
        createTime: '2024-01-16 08:00:00',
        progress: 100,
        exportType: 'auto',
        format: 'pdf',
    },
    {
        key: '2',
        name: '外联检测周报',
        module: '外联检测告警',
        createTime: '2024-01-15 08:00:00',
        progress: 100,
        exportType: 'auto',
        format: 'html',
    },
    {
        key: '3',
        name: '威胁情报月度分析报告',
        module: '威胁情报',
        createTime: '2024-01-01 00:00:00',
        progress: 100,
        exportType: 'manual',
        format: 'pdf',
    },
    {
        key: '4',
        name: '攻击监测日报',
        module: '攻击监测告警',
        createTime: '2024-01-17 08:00:00',
        progress: 45,
        exportType: 'manual',
        format: 'html',
    },
    {
        key: '5',
        name: '反测绘周报',
        module: '反测绘告警',
        createTime: '2024-01-15 08:00:00',
        progress: 80,
        exportType: 'auto',
        format: 'pdf',
    }
];

const mockConfigs: ReportConfig[] = [
    {
        key: '1',
        name: '攻击监测日报配置',
        cycle: {
            type: 'daily',
        },
        modules: ['攻击监测告警'],
        format: 'pdf',
        enabled: true,
    },
    {
        key: '2',
        name: '外联检测周报配置',
        cycle: {
            type: 'weekly',
        },
        modules: ['外联检测告警'],
        format: 'pdf',
        enabled: true,
    },
    {
        key: '3',
        name: '威胁情报月度分析配置',
        cycle: {
            type: 'monthly',
        },
        modules: ['威胁情报'],
        format: 'html',
        enabled: false,
    },
];

const tabList = [
    {
        key: 'records',
        tab: '导出记录',
    },
    {
        key: 'config',
        tab: '自动导出配置',
    },
];

interface FilterValues {
    name?: string;
    module?: string[];
    exportType?: 'manual' | 'auto';
    format?: 'html' | 'pdf';
    dateRange?: [dayjs.Dayjs, dayjs.Dayjs];
}

interface ExportFormValues {
    name: string;
    dateRange: [dayjs.Dayjs, dayjs.Dayjs];
    modules: string[];
    format: 'html' | 'pdf';
}

// 在文件顶部，其他 interface 定义之前添加
const timeRangePresets: {
    label: string;
    value: [dayjs.Dayjs, dayjs.Dayjs];
}[] = [
        { label: '今日', value: [dayjs().startOf('day'), dayjs().endOf('day')] },
        { label: '本周', value: [dayjs().startOf('week'), dayjs().endOf('week')] },
        { label: '当月', value: [dayjs().startOf('month'), dayjs().endOf('month')] },
    ];

// 添加提示信息映射
const cycleAlertMessages: Record<CycleConfig['type'], string> = {
    daily: '每日6点进行导出，内容的范围是前一天00:00到23:59:59之间的数据。',
    weekly: '每周一6点进行导出，内容的范围是上一周的周一00:00到周日23:59:59之间的数据。',
    monthly: '每月1日6点进行导出，内容的范围是上一个月1日00:00到上个月最后一天23:59:59之间的数据。'
};

const Reports: React.FC = () => {
    const [form] = Form.useForm();
    const [activeTabKey, setActiveTabKey] = useState<string>('records');
    const [data, setData] = useState<ReportRecord[]>(mockData);
    const [filteredData, setFilteredData] = useState<ReportRecord[]>(mockData);
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [selectedRows, setSelectedRows] = useState<ReportRecord[]>([]);
    const [configs, setConfigs] = useState<ReportConfig[]>(mockConfigs);
    const [selectedConfigKeys, setSelectedConfigKeys] = useState<React.Key[]>([]);
    const [exportForm] = Form.useForm();
    const [isExportModalVisible, setIsExportModalVisible] = useState(false);
    const [isConfigModalVisible, setIsConfigModalVisible] = useState(false);
    const [configForm] = Form.useForm();
    const [editingConfig, setEditingConfig] = useState<ReportConfig | null>(null);

    const handleDownload = (record: ReportRecord) => {
        if (record.progress === 100) {
            message.success('开始下载报表');
            // 实际下载逻辑
        }
    };

    const handleDelete = (key: string) => {
        setData(data.filter(item => item.key !== key));
        message.success('删除成功');
    };

    const handleBatchDownload = () => {
        const completedRecords = selectedRows.filter(record => record.progress === 100);
        if (completedRecords.length > 0) {
            message.success(`开始下载 ${completedRecords.length} 个报表`);
            // 实际批量下载逻辑
        }
    };

    const handleBatchDelete = () => {
        setData(data.filter(item => !selectedRowKeys.includes(item.key)));
        setSelectedRowKeys([]);
        setSelectedRows([]);
        message.success('批量删除成功');
    };

    const handleEnableChange = (key: string, enabled: boolean) => {
        setConfigs(configs.map(config =>
            config.key === key ? { ...config, enabled } : config
        ));
        message.success(`${enabled ? '启用' : '禁用'}成功`);
    };

    const handleConfigDelete = (key: string) => {
        setConfigs(configs.filter(config => config.key !== key));
        message.success('删除成功');
    };

    const handleFilter = (values: FilterValues) => {
        const filtered = data.filter(item => {
            const matchName = !values.name || item.name.toLowerCase().includes(values.name.toLowerCase());
            const matchModule = !values.module || values.module.length === 0 || values.module.includes(item.module);
            const matchExportType = !values.exportType || item.exportType === values.exportType;
            const matchFormat = !values.format || item.format === values.format;
            const matchDate = !values.dateRange || (
                dayjs(item.createTime).isAfter(values.dateRange[0].startOf('day')) &&
                dayjs(item.createTime).isBefore(values.dateRange[1].endOf('day'))
            );
            return matchName && matchModule && matchExportType && matchFormat && matchDate;
        });
        setFilteredData(filtered);
    };

    const handleReset = () => {
        form.resetFields();
        setFilteredData(data);
    };

    const handleExport = (values: ExportFormValues) => {
        console.log('导出参数：', values);
        message.success('开始生成报表');
        setIsExportModalVisible(false);
        exportForm.resetFields();
    };

    const handleExportCancel = () => {
        setIsExportModalVisible(false);
        exportForm.resetFields();
    };

    const handleConfigSubmit = (values: any) => {
        // 移除时间转换逻辑，直接提交值
        if (editingConfig) {
            setConfigs(configs.map(config =>
                config.key === editingConfig.key ? { ...values, key: editingConfig.key } : config
            ));
            message.success('编辑成功');
        } else {
            setConfigs([...configs, { ...values, key: Date.now().toString() }]);
            message.success('新增成功');
        }
        setIsConfigModalVisible(false);
        configForm.resetFields();
        setEditingConfig(null);
    };

    const handleConfigCancel = () => {
        setIsConfigModalVisible(false);
        configForm.resetFields();
        setEditingConfig(null);
    };

    const showConfigModal = (config?: ReportConfig) => {
        if (config) {
            setEditingConfig(config);
            configForm.setFieldsValue(config);
        } else {
            configForm.resetFields();
        }
        setIsConfigModalVisible(true);
    };

    const columns: TableColumnsType<ReportRecord> = [
        {
            title: '报表名称',
            dataIndex: 'name',
            key: 'name',
            width: 200,
        },
        {
            title: '告警模块',
            dataIndex: 'module',
            key: 'module',
            width: 150,
        },
        {
            title: '导出方式',
            dataIndex: 'exportType',
            key: 'exportType',
            width: 100,
            render: (type: string) => type === 'auto' ? '自动' : '手动',
        },
        {
            title: '报表格式',
            dataIndex: 'format',
            key: 'format',
            width: 100,
            render: (format: string) => format.toUpperCase(),
        },
        {
            title: '创建时间',
            dataIndex: 'createTime',
            key: 'createTime',
            width: 180,
        },
        {
            title: '进度',
            dataIndex: 'progress',
            key: 'progress',
            width: 200,
            render: (progress: number) => (
                <Progress percent={progress} size="small" status={progress === 100 ? 'success' : 'active'} />
            ),
        },
        {
            title: '操作',
            key: 'action',
            width: 150,
            render: (_, record) => (
                <Space>
                    <Button
                        type="link"
                        disabled={record.progress !== 100}
                        onClick={() => handleDownload(record)}
                    >
                        下载
                    </Button>
                    <Popconfirm
                        title="确定要删除这条记录吗？"
                        onConfirm={() => handleDelete(record.key)}
                        okText="确定"
                        cancelText="取消"
                    >
                        <Button
                            type="link"
                            danger
                        >
                            删除
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const configColumns: TableColumnsType<ReportConfig> = [
        {
            title: '配置名称',
            dataIndex: 'name',
            key: 'name',
            width: 300,
        },
        {
            title: '报表格式',
            dataIndex: 'format',
            key: 'format',
            width: 200,
            render: (format: string) => format.toUpperCase(),
        },
        {
            title: '启用状态',
            dataIndex: 'enabled',
            key: 'enabled',
            width: 150,
            render: (enabled: boolean, record) => (
                <Switch
                    checked={enabled}
                    onChange={(checked) => handleEnableChange(record.key, checked)}
                />
            ),
        },
        {
            title: '操作',
            key: 'action',
            width: 150,
            render: (_, record) => (
                <Space>
                    <Button
                        type="link"
                        onClick={() => showConfigModal(record)}
                    >
                        编辑
                    </Button>
                    <Popconfirm
                        title="确定要删除这条配置吗？"
                        onConfirm={() => handleConfigDelete(record.key)}
                        okText="确定"
                        cancelText="取消"
                    >
                        <Button
                            type="link"
                            danger
                        >
                            删除
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const handleBatchConfigDelete = () => {
        setConfigs(configs.filter(config => !selectedConfigKeys.includes(config.key)));
        setSelectedConfigKeys([]);
        message.success('批量删除成功');
    };

    const contentList = {
        records: (
            <>
                <Form
                    form={form}
                    onFinish={handleFilter}
                    style={{ marginBottom: 24 }}
                >
                    <Row gutter={[16, 16]}>
                        <Col span={8}>
                            <Form.Item name="name" style={{ marginBottom: 0 }}>
                                <LabelInput label="报表名称" placeholder="请输入报表名称" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="module" style={{ marginBottom: 0 }}>
                                <LabelSelect
                                    label="告警模块"
                                    allowClear
                                    mode="multiple"
                                    placeholder="请选择告警模块"
                                    options={[
                                        { label: '攻击监测告警', value: '攻击监测告警' },
                                        { label: '外联检测告警', value: '外联检测告警' },
                                        { label: '威胁情报', value: '威胁情报' },
                                        { label: '反测绘告警', value: '反测绘告警' }
                                    ]}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="exportType" style={{ marginBottom: 0 }}>
                                <LabelSelect
                                    label="导出方式"
                                    allowClear
                                    placeholder="请选择导出方式"
                                    options={[
                                        { label: '手动', value: 'manual' },
                                        { label: '自动', value: 'auto' }
                                    ]}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="format" style={{ marginBottom: 0 }}>
                                <LabelSelect
                                    label="报表格式"
                                    allowClear
                                    placeholder="请选择报表格式"
                                    options={[
                                        { label: 'HTML', value: 'html' },
                                        { label: 'PDF', value: 'pdf' }
                                    ]}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="dateRange" style={{ marginBottom: 0 }}>
                                <LabelRangePicker
                                    label="创建时间"
                                    showTime
                                    format="YYYY-MM-DD HH:mm:ss"
                                    presets={timeRangePresets}
                                    placeholder={['开始时间', '结束时间']}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item style={{ marginBottom: 0 }}>
                                <Space>
                                    <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                                        筛选
                                    </Button>
                                    <Button onClick={handleReset} icon={<ReloadOutlined />}>
                                        重置
                                    </Button>
                                </Space>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
                <Row style={{ marginBottom: 16 }}>
                    <Col flex="auto">
                        <Space>
                            {selectedRowKeys.length > 0 && (
                                <>
                                    <Button
                                        onClick={handleBatchDownload}
                                        disabled={!selectedRows.some(record => record.progress === 100)}
                                        icon={<DownloadOutlined />}
                                    >
                                        批量下载
                                    </Button>
                                    <Popconfirm
                                        title="确定要删除选中的记录吗？"
                                        onConfirm={handleBatchDelete}
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
                        <Button
                            type="primary"
                            onClick={() => setIsExportModalVisible(true)}
                            icon={<ExportOutlined />}
                        >
                            手动导出
                        </Button>
                    </Col>
                </Row>
                <Table
                    rowSelection={{
                        selectedRowKeys,
                        onChange: (newSelectedRowKeys: React.Key[], newSelectedRows: ReportRecord[]) => {
                            setSelectedRowKeys(newSelectedRowKeys);
                            setSelectedRows(newSelectedRows);
                        },
                    }}
                    columns={columns}
                    dataSource={filteredData}
                    pagination={{
                        total: filteredData.length,
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total) => `共 ${total} 条记录`,
                    }}
                />
            </>
        ),
        config: (
            <>
                <Row style={{ marginBottom: 16 }}>
                    <Col flex="auto">
                        {selectedConfigKeys.length > 0 && (
                            <Popconfirm
                                title="确定要删除选中的配置吗？"
                                onConfirm={handleBatchConfigDelete}
                                okText="确定"
                                cancelText="取消"
                            >
                                <Button danger icon={<DeleteOutlined />}>
                                    批量删除
                                </Button>
                            </Popconfirm>
                        )}
                    </Col>
                    <Col>
                        <Button
                            type="primary"
                            onClick={() => showConfigModal()}
                            icon={<PlusOutlined />}
                        >
                            新增配置
                        </Button>
                    </Col>
                </Row>
                <Table
                    rowSelection={{
                        selectedRowKeys: selectedConfigKeys,
                        onChange: (newSelectedRowKeys: React.Key[]) => {
                            setSelectedConfigKeys(newSelectedRowKeys);
                        },
                    }}
                    columns={configColumns}
                    dataSource={configs}
                    pagination={{
                        total: configs.length,
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total) => `共 ${total} 条记录`,
                    }}
                />
            </>
        ),
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
                tabProps={{
                    size: 'large',
                }}
            >
                {contentList[activeTabKey as keyof typeof contentList]}
            </Card>
            <Modal
                title="手动导出"
                open={isExportModalVisible}
                onCancel={handleExportCancel}
                footer={null}
                width={600}
            >
                <Form
                    form={exportForm}
                    onFinish={handleExport}
                    layout="vertical"
                >
                    <Form.Item
                        name="name"
                        rules={[{ required: true, message: '请输入报表名称' }]}
                    >
                        <LabelInput
                            label="报表名称"
                            placeholder="请输入报表名称"
                            required
                        />
                    </Form.Item>

                    <Form.Item
                        name="dateRange"
                        rules={[{ required: true, message: '请选择报表数据范围' }]}
                    >
                        <LabelRangePicker
                            label="报表数据范围"
                            showTime
                            required
                            format="YYYY-MM-DD HH:mm:ss"
                            presets={timeRangePresets}
                            placeholder={['开始时间', '结束时间']}
                        />
                    </Form.Item>

                    <Form.Item
                        name="modules"
                        rules={[{ required: true, message: '请选择至少一个告警模块' }]}
                    >
                        <LabelSelect
                            label="告警模块"
                            mode="multiple"
                            allowClear
                            required
                            placeholder="请选择告警模块"
                            options={[
                                { label: '攻击监测告警', value: '攻击监测告警' },
                                { label: '外联检测告警', value: '外联检测告警' },
                                { label: '弱口令登录告警', value: '弱口令登录告警' },
                                { label: '反测绘告警', value: '反测绘告警' },
                            ]}
                        />
                    </Form.Item>

                    <Form.Item
                        label="报表格式"
                        name="format"
                        rules={[{ required: true, message: '请选择报表格式' }]}
                        initialValue="html"
                        layout='horizontal'
                        wrapperCol={{ style: { marginLeft: 16 } }}
                    >
                        <Radio.Group>
                            <Radio value="html">HTML</Radio>
                            <Radio value="pdf">PDF</Radio>
                        </Radio.Group>
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                        <Space>
                            <Button onClick={handleExportCancel}>取消</Button>
                            <Button type="primary" htmlType="submit">
                                确定
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
            <Modal
                title={editingConfig ? "编辑配置" : "新增配置"}
                open={isConfigModalVisible}
                onCancel={handleConfigCancel}
                footer={null}
                width={600}
            >
                <Form
                    form={configForm}
                    onFinish={handleConfigSubmit}
                    layout="vertical"
                    initialValues={{ enabled: true }}
                >
                    <Form.Item
                        name="name"
                        rules={[{ required: true, message: '请输入配置名称' }]}
                    >
                        <LabelInput
                            label="配置名称"
                            required
                            placeholder="请输入配置名称"
                        />
                    </Form.Item>

                    <Form.Item
                        name={['cycle', 'type']}
                        rules={[{ required: true, message: '请选择导出周期' }]}
                    >
                        <LabelSelect
                            label="导出周期"
                            required
                            placeholder="请选择导出周期"
                            options={[
                                { label: '每日', value: 'daily' },
                                { label: '每周', value: 'weekly' },
                                { label: '每月', value: 'monthly' }
                            ]}
                        />
                    </Form.Item>

                    <Form.Item noStyle shouldUpdate>
                        {({ getFieldValue }) => {
                            const cycleType = getFieldValue(['cycle', 'type']) as CycleConfig['type'];
                            return cycleType ? (
                                <Alert
                                    message={cycleAlertMessages[cycleType]}
                                    type="info"
                                    style={{ marginBottom: 24 }}
                                />
                            ) : null;
                        }}
                    </Form.Item>

                    <Form.Item
                        name="modules"
                        rules={[{ required: true, message: '请选择至少一个告警模块' }]}
                    >
                        <LabelSelect
                            label="告警模块"
                            mode="multiple"
                            placeholder="请选择告警模块"
                            required
                            options={[
                                { label: '攻击监测告警', value: '攻击监测告警' },
                                { label: '外联检测告警', value: '外联检测告警' },
                                { label: '弱口令登录告警', value: '弱口令登录告警' },
                                { label: '反测绘告警', value: '反测绘告警' },
                            ]}
                        />
                    </Form.Item>

                    <Form.Item
                        label="报表格式"
                        name="format"
                        rules={[{ required: true, message: '请选择报表格式' }]}
                        initialValue="html"
                        layout='horizontal'
                        wrapperCol={{ style: { marginLeft: 16 } }}
                    >
                        <Radio.Group>
                            <Radio value="html">HTML</Radio>
                            <Radio value="pdf">PDF</Radio>
                        </Radio.Group>
                    </Form.Item>

                    <Form.Item
                        name="enabled"
                        valuePropName="checked"
                        label="启用状态"
                        layout='horizontal'
                        wrapperCol={{ style: { marginLeft: 16 } }}
                    >
                        <Switch />
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                        <Space>
                            <Button onClick={handleConfigCancel}>取消</Button>
                            <Button type="primary" htmlType="submit">
                                确定
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Reports;
