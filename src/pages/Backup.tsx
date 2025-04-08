import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Row, Col, Progress, Drawer, Switch, Form, Radio, Modal, Tag } from 'antd';
import { SettingOutlined, ImportOutlined, SaveOutlined, DownloadOutlined, UploadOutlined } from '@ant-design/icons';
import { message } from 'antd';
import LabelSelect from '@/components/LabelSelect';
import LabelInput from '@/components/LabelInput';
const Backup: React.FC = () => {
    // 添加抽屉的显示状态控制
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [exportModalVisible, setExportModalVisible] = useState(false);
    const [importModalVisible, setImportModalVisible] = useState(false);
    const [importStep, setImportStep] = useState<'select' | 'config'>('select');
    const [form] = Form.useForm();

    // 模拟表格数据
    const tableData = [
        {
            key: '1',
            fileName: 'cfg_20240406134522.db',
            backupModule: '告警日志备份',
            backupMode: '增量',
            targetVersion: '8.2.2.25174-f00aee77',
            backupTime: '2024-04-06 13:45:22',
            backupStatus: 'completed',
            progress: 100
        },
        {
            key: '2',
            fileName: 'cfg_20240406132211.db',
            backupModule: '系统及策略配置备份',
            backupMode: '全量',
            targetVersion: '8.2.2.25174-f00aee77',
            backupTime: '2024-04-06 13:22:11',
            backupStatus: 'completed',
            progress: 100
        },
        {
            key: '3',
            fileName: 'cfg_20240406130001.db',
            backupModule: '策略配置备份',
            backupMode: '全量',
            targetVersion: '8.2.2.25174-f00aee77',
            backupTime: null,
            backupStatus: 'progress',
            progress: 45
        },
        {
            key: '4',
            fileName: 'cfg_20240406125522.db',
            backupModule: '告警日志备份',
            backupMode: '全量',
            targetVersion: '8.2.2.25174-f00aee77',
            backupTime: '2024-04-06 12:55:22',
            backupStatus: 'completed',
            progress: 100
        },
        {
            key: '5',
            fileName: 'cfg_20240406124233.db',
            backupModule: '系统及策略配置备份',
            backupMode: '全量',
            targetVersion: '8.2.2.25174-f00aee77',
            backupTime: '2024-04-06 12:42:33',
            backupStatus: 'completed',
            progress: 100
        },
        {
            key: '6',
            fileName: 'cfg_20240406123000.db',
            backupModule: '策略配置备份',
            backupMode: '全量',
            targetVersion: '8.2.2.25174-f00aee77',
            backupTime: '2024-04-06 12:30:00',
            backupStatus: 'completed',
            progress: 100
        }
    ];

    // 表格列定义
    const columns = [
        {
            title: '文件名称',
            dataIndex: 'fileName',
            key: 'fileName'
        },
        {
            title: '备份模块',
            dataIndex: 'backupModule',
            key: 'backupModule',
            width: 200,
        },
        {
            title: '备份模式',
            dataIndex: 'backupMode',
            key: 'backupMode',
            width: 160,
            render: (text: string) => text
        },
        {
            title: '目标版本',
            dataIndex: 'targetVersion',
            key: 'targetVersion',
            width: 250,
        },
        {
            title: '备份时间',
            dataIndex: 'backupTime',
            key: 'backupTime',
            width: 250,
            render: (_: any, record: any) => {
                if (record.backupStatus === 'completed') {
                    return record.backupTime;
                }
                return (
                    <Progress
                        percent={record.progress}
                        size="small"
                        status={record.progress === 100 ? 'success' : 'active'}
                    />
                );
            }
        },
        {
            title: '操作',
            key: 'action',
            width: 200,
            render: (_: any, record: any) => (
                <Space>
                    <Button
                        type="link"
                        disabled={record.backupStatus !== 'completed'}
                        onClick={() => message.success('开始回退操作')}
                    >
                        回退至此版本
                    </Button>
                    <Button
                        type="link"
                        disabled={record.backupStatus !== 'completed' || record.backupModule === '系统及策略配置备份'}
                        onClick={() => handleExport(record)}
                    >
                        导出
                    </Button>
                    <Button
                        type="link"
                        danger
                        disabled={record.backupStatus !== 'completed'}
                        onClick={() => message.success('删除成功')}
                    >
                        删除
                    </Button>
                </Space>
            ),
        }
    ];

    // 在组件初始化时设置默认值
    useEffect(() => {
        form.setFieldsValue({
            backupMode: 'ftp'
        });
    }, [form]);

    // 处理导出
    const handleExport = (record: any) => {
        if (record.backupModule === '策略配置备份') {
            message.success('开始下载策略配置备份');
        } else {
            setExportModalVisible(true);
        }
    };

    // 处理导入类型选择
    const handleImportTypeSelect = (type: 'log' | 'policy') => {
        if (type === 'policy') {
            message.success('开始导入策略配置备份');
            setImportModalVisible(false);
        } else {
            setImportStep('config');
        }
    };

    // 处理模态框关闭
    const handleModalClose = () => {
        setExportModalVisible(false);
        setImportModalVisible(false);
        setImportStep('select');
        form.resetFields();
    };

    return (
        <div>
            {/* 上部分三等分区域 */}
            <Row gutter={24} style={{ marginBottom: '24px' }}>
                <Col span={8}>
                    <Card>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ textAlign: 'left' }}>
                                <h3>告警日志备份</h3>
                                <div style={{
                                    color: 'rgba(0, 0, 0, 0.45)',
                                    marginBottom: '16px'
                                }}>
                                    对攻击监测，外联检测，弱口令登录，应用隐身等日志进行备份
                                </div>
                                <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ color: 'rgba(0, 0, 0, 0.65)' }}>状态：</span>
                                        <Tag color="success">已启用备份</Tag>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ color: 'rgba(0, 0, 0, 0.65)' }}>周期：</span>
                                        <Tag color="blue">每周</Tag>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ color: 'rgba(0, 0, 0, 0.65)' }}>时间：</span>
                                        <span style={{ color: 'rgba(0, 0, 0, 0.65)' }}>2024年8月10日</span>
                                    </div>
                                </Space>
                            </div>
                        </div>
                    </Card>
                </Col>
                <Col span={8}>
                    <Card>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ textAlign: 'left' }}>
                                <h3>系统及策略配置备份</h3>
                                <div style={{
                                    color: 'rgba(0, 0, 0, 0.45)',
                                    marginBottom: '16px'
                                }}>
                                    对系统及策略配置进行整体的备份，通过整体备份保证系统和配置的一致性
                                </div>
                                <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ color: 'rgba(0, 0, 0, 0.65)' }}>状态：</span>
                                        <Tag color="success">已启用备份</Tag>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ color: 'rgba(0, 0, 0, 0.65)' }}>周期：</span>
                                        <Tag color="blue">每周</Tag>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ color: 'rgba(0, 0, 0, 0.65)' }}>时间：</span>
                                        <span style={{ color: 'rgba(0, 0, 0, 0.65)' }}>2024年8月10日</span>
                                    </div>
                                </Space>
                            </div>
                        </div>
                    </Card>
                </Col>
                <Col span={8}>
                    <Card>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ textAlign: 'left' }}>
                                <h3>策略配置备份</h3>
                                <div style={{
                                    color: 'rgba(0, 0, 0, 0.45)',
                                    marginBottom: '16px'
                                }}>
                                    对策略配置进行单独备份，有多台设备时候可以快速同步至多台设备
                                </div>
                                <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ color: 'rgba(0, 0, 0, 0.65)' }}>状态：</span>
                                        <Tag color="success">已启用备份</Tag>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ color: 'rgba(0, 0, 0, 0.65)' }}>周期：</span>
                                        <Tag color="blue">每周</Tag>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ color: 'rgba(0, 0, 0, 0.65)' }}>时间：</span>
                                        <span style={{ color: 'rgba(0, 0, 0, 0.65)' }}>2024年8月10日</span>
                                    </div>
                                </Space>
                            </div>
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* 下部分表格区域 */}
            <Card>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                    <Space>
                        <Button
                            icon={<SettingOutlined />}
                            onClick={() => setDrawerVisible(true)}
                        >
                            配置
                        </Button>
                        <Button icon={<ImportOutlined />} onClick={() => setImportModalVisible(true)}>
                            导入
                        </Button>
                        <Button type="primary" icon={<SaveOutlined />}>
                            手动备份
                        </Button>
                    </Space>
                </div>
                <Table
                    columns={columns}
                    dataSource={tableData}
                    pagination={{
                        total: tableData.length,
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total) => `共 ${total} 条记录`,
                    }}
                />
            </Card>

            {/* 添加抽屉组件 */}
            <Drawer
                title="备份配置"
                placement="right"
                width={600}
                onClose={() => setDrawerVisible(false)}
                open={drawerVisible}
            >
                <Space direction="vertical" style={{ width: '100%' }} size="large">
                    <Card title="系统及策略配置备份">
                        <Form
                            layout="vertical"
                        >
                            <Form.Item
                                name="modules"
                                rules={[{ required: true, message: '请选择至少一个告警模块' }]}
                            >
                                <LabelSelect
                                    label="备份周期"
                                    mode="multiple"
                                    allowClear
                                    placeholder="请选择告警模块"
                                    options={[
                                        { value: 'weekly', label: '每周一 6:00' },
                                        { value: 'monthly', label: '每月1日 6:00' }
                                    ]}
                                />
                            </Form.Item>
                            <Form.Item
                                style={{ marginBottom: 0 }}
                            >
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '16px'
                                }}>
                                    <span>开启状态</span>
                                    <Switch />
                                </div>
                            </Form.Item>
                        </Form>
                    </Card>
                    <Card title="告警日志备份">
                        <Form
                            layout="vertical"
                        >
                            <Form.Item
                                name="modules"
                                rules={[{ required: true, message: '请选择至少一个告警模块' }]}
                            >
                                <LabelSelect
                                    label="备份周期"
                                    mode="multiple"
                                    allowClear
                                    placeholder="请选择告警模块"
                                    options={[
                                        { value: 'weekly', label: '每周一 6:00' },
                                        { value: 'monthly', label: '每月1日 6:00' }
                                    ]}
                                />
                            </Form.Item>
                            <Form.Item
                                name="backupMode"
                                initialValue="full"
                                rules={[{ required: true, message: '请选择备份模式' }]}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <span style={{ width: '80px' }}>备份模式</span>
                                    <Radio.Group style={{ display: 'flex', flex: 1 }}>
                                        <Radio value="full" style={{ flex: 1 }}>全量备份</Radio>
                                        <Radio value="incremental" style={{ flex: 1 }}>增量备份</Radio>
                                    </Radio.Group>
                                </div>
                            </Form.Item>
                            <Form.Item
                                style={{ marginBottom: 0 }}
                            >
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '16px'
                                }}>
                                    <span>开启状态</span>
                                    <Switch />
                                </div>
                            </Form.Item>
                        </Form>
                    </Card>
                    <Card title="策略配置备份">
                        <Form
                            layout="vertical"
                        >
                            <Form.Item
                                name="modules"
                                rules={[{ required: true, message: '请选择至少一个告警模块' }]}
                            >
                                <LabelSelect
                                    label="备份周期"
                                    mode="multiple"
                                    allowClear
                                    placeholder="请选择告警模块"
                                    options={[
                                        { value: 'weekly', label: '每周一 6:00' },
                                        { value: 'monthly', label: '每月1日 6:00' }
                                    ]}
                                />
                            </Form.Item>
                            <Form.Item
                                style={{ marginBottom: 0 }}
                            >
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '16px'
                                }}>
                                    <span>开启状态</span>
                                    <Switch />
                                </div>
                            </Form.Item>
                        </Form>
                    </Card>
                </Space>
                <div style={{ display: 'flex', gap: '8px', marginTop: '24px' }}>
                    <Button
                        style={{ flex: 1 }}
                        onClick={() => setDrawerVisible(false)}
                    >
                        关闭
                    </Button>
                    <Button
                        type="primary"
                        style={{ flex: 1 }}
                    >
                        保存
                    </Button>
                </div>
                <div style={{
                    marginTop: '24px',
                    padding: '12px 16px',
                    background: '#e6f7ff',
                    border: '1px solid #91d5ff',
                    borderRadius: '4px'
                }}>
                    <div style={{
                        fontSize: '14px',
                        color: '#1890ff',
                        marginBottom: '8px',
                        fontWeight: 500
                    }}>注意：</div>
                    <div style={{
                        fontSize: '14px',
                        color: 'rgba(0, 0, 0, 0.65)',
                        lineHeight: '24px'
                    }}>
                        <div>1.系统及策略配置备份仅支持生成1个文件，当开启周期备份时，会循环生成，自动清除上一次生成的文件。</div>
                        <div>2.备份（满载情况下）预计耗时30分钟，实际时间取决于备份内容大小，请耐心等待。</div>
                        <div>3.当前备份空间使用率为5%，当使用率达到60%时，将会滚动清除最早备份的同类文件。</div>
                        <div>4.备份规则为每个触发时间点，自动备份上一个周期内0:00:00到23:59:59之间的数据，例如：选择了每周一6:00，则备份上周一0:00:00到上周日23:59:59之前的数据。</div>
                    </div>
                </div>
            </Drawer>

            <Modal
                title="导出"
                open={exportModalVisible}
                onCancel={handleModalClose}
                footer={null}
                width={520}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={(values) => {
                        console.log('表单提交值:', values);
                        message.success('开始导出告警日志备份');
                        handleModalClose();
                    }}
                >
                    <Form.Item
                        name="backupMode"
                        rules={[{ required: true, message: '请选择导出方式' }]}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <span style={{ width: '80px' }}>导出方式</span>
                            <Radio.Group style={{ display: 'flex', flex: 1 }} defaultValue="ftp">
                                <Radio value="ftp" style={{ flex: 1 }}>FTP</Radio>
                                <Radio value="sftp" style={{ flex: 1 }}>SFTP</Radio>
                            </Radio.Group>
                        </div>
                    </Form.Item>
                    <Form.Item
                        name="serverAddress"
                        rules={[{ required: true, message: '请输入服务器地址' }]}
                    >
                        <LabelInput
                            label="服务器地址"
                            placeholder="请输入服务器地址，如 192.168.1.1"
                        />
                    </Form.Item>
                    <Form.Item
                        name="path"
                        rules={[{ required: true, message: '请输入路径地址' }]}
                    >
                        <LabelInput
                            label="路径地址"
                            placeholder="请输入路径地址，如 /backup"
                        />
                    </Form.Item>
                    <Form.Item
                        name="port"
                        rules={[{ required: true, message: '请输入端口' }]}
                    >
                        <LabelInput
                            label="端口"
                            placeholder="请输入端口，如 21"
                        />
                    </Form.Item>
                    <Form.Item
                        name="username"
                        rules={[{ required: true, message: '请输入用户名' }]}
                    >
                        <LabelInput
                            label="用户名"
                            placeholder="请输入用户名"
                        />
                    </Form.Item>
                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: '请输入密码' }]}
                    >
                        <LabelInput
                            label="密码"
                            placeholder="请输入密码"
                            type="password"
                        />
                    </Form.Item>
                    <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                        <Space>
                            <Button onClick={handleModalClose}>取消</Button>
                            <Button type="primary" htmlType="submit">
                                确定
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title="导入"
                open={importModalVisible}
                onCancel={handleModalClose}
                footer={null}
                width={520}
            >
                <style>
                    {`
                        .import-option-card:hover {
                            border-color: #1890ff !important;
                        }
                    `}
                </style>
                {importStep === 'select' ? (
                    <Space direction="vertical" style={{ width: '100%' }} size="middle">
                        <Card
                            hoverable
                            style={{
                                cursor: 'pointer',
                                border: '1px solid #f0f0f0',
                                transition: 'all 0.3s',
                                borderRadius: '8px',
                                boxShadow: 'none'
                            }}
                            className="import-option-card"
                            bodyStyle={{ padding: '16px' }}
                            onClick={() => handleImportTypeSelect('log')}
                        >
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '16px'
                            }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '8px',
                                    background: '#e6f7ff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <ImportOutlined style={{ fontSize: '20px', color: '#1890ff' }} />
                                </div>
                                <div>
                                    <div style={{ fontSize: '16px', fontWeight: 500, marginBottom: '4px' }}>
                                        告警日志备份导入
                                    </div>
                                    <div style={{ color: 'rgba(0, 0, 0, 0.45)' }}>
                                        支持FTP和SFTP方式导入告警日志备份文件
                                    </div>
                                </div>
                            </div>
                        </Card>
                        <Card
                            hoverable
                            style={{
                                cursor: 'pointer',
                                border: '1px solid #f0f0f0',
                                transition: 'all 0.3s',
                                borderRadius: '8px',
                                boxShadow: 'none'
                            }}
                            className="import-option-card"
                            bodyStyle={{ padding: '16px' }}
                            onClick={() => handleImportTypeSelect('policy')}
                        >
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '16px'
                            }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '8px',
                                    background: '#f6ffed',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <UploadOutlined style={{ fontSize: '20px', color: '#52c41a' }} />
                                </div>
                                <div>
                                    <div style={{ fontSize: '16px', fontWeight: 500, marginBottom: '4px' }}>
                                        策略配置备份导入
                                    </div>
                                    <div style={{ color: 'rgba(0, 0, 0, 0.45)' }}>
                                        直接上传策略配置备份文件到系统
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </Space>
                ) : (
                    <>
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={(values) => {
                                console.log('表单提交值:', values);
                                message.success('开始导入告警日志备份');
                                handleModalClose();
                            }}
                        >
                            <Form.Item
                                name="backupMode"
                                rules={[{ required: true, message: '请选择导入方式' }]}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <span style={{ width: '80px' }}>导入方式</span>
                                    <Radio.Group style={{ display: 'flex', flex: 1 }} defaultValue="ftp">
                                        <Radio value="ftp" style={{ flex: 1 }}>FTP</Radio>
                                        <Radio value="sftp" style={{ flex: 1 }}>SFTP</Radio>
                                    </Radio.Group>
                                </div>
                            </Form.Item>
                            <Form.Item
                                name="serverAddress"
                                rules={[{ required: true, message: '请输入服务器地址' }]}
                            >
                                <LabelInput
                                    label="服务器地址"
                                    placeholder="请输入服务器地址，如 192.168.1.1"
                                />
                            </Form.Item>
                            <Form.Item
                                name="path"
                                rules={[{ required: true, message: '请输入路径地址' }]}
                            >
                                <LabelInput
                                    label="路径地址"
                                    placeholder="请输入路径地址，如 /backup"
                                />
                            </Form.Item>
                            <Form.Item
                                name="fileName"
                                rules={[{ required: true, message: '请输入文件名称' }]}
                            >
                                <LabelInput
                                    label="文件名称"
                                    placeholder="请输入文件名称，如 cfg_20240406123000.db"
                                />
                            </Form.Item>
                            <Form.Item
                                name="port"
                                rules={[{ required: true, message: '请输入端口' }]}
                            >
                                <LabelInput
                                    label="端口"
                                    placeholder="请输入端口，如 21"
                                />
                            </Form.Item>
                            <Form.Item
                                name="username"
                                rules={[{ required: true, message: '请输入用户名' }]}
                            >
                                <LabelInput
                                    label="用户名"
                                    placeholder="请输入用户名"
                                />
                            </Form.Item>
                            <Form.Item
                                name="password"
                                rules={[{ required: true, message: '请输入密码' }]}
                            >
                                <LabelInput
                                    label="密码"
                                    placeholder="请输入密码"
                                    type="password"
                                />
                            </Form.Item>
                            <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                                <Space>
                                    <Button onClick={() => setImportStep('select')}>返回选择</Button>
                                    <Button type="primary" htmlType="submit">
                                        确定
                                    </Button>
                                </Space>
                            </Form.Item>
                        </Form>
                    </>
                )}
            </Modal>
        </div>
    );
};

export default Backup; 