import React, { useState, useEffect, useRef } from 'react';
import { Card, Row, Col, Space, Tag, Badge, Button, Progress, Modal, Divider, Switch, Select, TimePicker, Tooltip, Upload, message, Radio, Input, Form } from 'antd';
import { PlusOutlined, DeleteOutlined, PauseCircleOutlined, PlayCircleOutlined, ExclamationCircleOutlined, UploadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const UpgradeManagement: React.FC = () => {
    const [activeTabKey, setActiveTabKey] = useState<string>('system');
    const [hasNewVersion, setHasNewVersion] = useState(false);
    const [latestVersion, setLatestVersion] = useState<string>('');
    const [isUpgradeModalVisible, setIsUpgradeModalVisible] = useState(false);
    const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState(0);
    const [upgradeProgress, setUpgradeProgress] = useState(0);
    const [currentStep, setCurrentStep] = useState<'download' | 'upgrade'>('download');
    const [isDownloadPaused, setIsDownloadPaused] = useState(false);
    const downloadIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // 本地升级相关状态
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [isLocalUpgradeModalVisible, setIsLocalUpgradeModalVisible] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [localUpgradeProgress, setLocalUpgradeProgress] = useState(0);
    const [localCurrentStep, setLocalCurrentStep] = useState<'upload' | 'upgrade'>('upload');
    const [isUploadPaused, setIsUploadPaused] = useState(false);
    const uploadIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const upgradeCompletedRef = useRef<boolean>(false);

    // 自动升级相关状态
    const [autoUpgradeEnabled, setAutoUpgradeEnabled] = useState(false);
    const [autoUpgradeSwitchEnabled, setAutoUpgradeSwitchEnabled] = useState(false);
    const [timeRules, setTimeRules] = useState([
        { id: 1, weekDay: ['monday'], startTime: dayjs('02:00:00', 'HH:mm:ss'), endTime: dayjs('04:00:00', 'HH:mm:ss') }
    ]);
    const [upgradeTimeRules, setUpgradeTimeRules] = useState([
        { id: 1, weekDay: ['monday'], startTime: dayjs('02:00:00', 'HH:mm:ss'), endTime: dayjs('04:00:00', 'HH:mm:ss') }
    ]);

    const tabList = [
        {
            key: 'system',
            tab: '系统升级',
        },
        {
            key: 'patch',
            tab: '补丁升级',
        },
        {
            key: 'rules',
            tab: '规则库升级',
        },
    ];

    const onTabChange = (key: string) => {
        setActiveTabKey(key);
    };

    const handleCheckUpdate = () => {
        // 模拟检查更新
        setHasNewVersion(true);
        setLatestVersion('V9.0.1-R2');
    };

    const handleUpgrade = () => {
        setIsConfirmModalVisible(false);
        setIsUpgradeModalVisible(true);
        setDownloadProgress(0);
        setUpgradeProgress(0);
        setCurrentStep('download');
        setIsDownloadPaused(false);

        startDownload();
    };

    const startDownload = () => {
        // 模拟5秒下载进度
        downloadIntervalRef.current = setInterval(() => {
            setDownloadProgress(prev => {
                if (prev >= 100) {
                    if (downloadIntervalRef.current) {
                        clearInterval(downloadIntervalRef.current);
                        downloadIntervalRef.current = null;
                    }
                    setCurrentStep('upgrade');
                    setUpgradeProgress(0);

                    // 模拟5秒升级进度
                    const upgradeInterval = setInterval(() => {
                        setUpgradeProgress(prev => {
                            if (prev >= 100) {
                                clearInterval(upgradeInterval);
                                setTimeout(() => {
                                    setIsUpgradeModalVisible(false);
                                    setDownloadProgress(0);
                                    setUpgradeProgress(0);
                                    setCurrentStep('download');
                                    setIsDownloadPaused(false);
                                }, 1000);
                                return 100;
                            }
                            return prev + 10; // 每100ms增加10%，5秒完成
                        });
                    }, 100);
                    return 100;
                }
                return prev + 5; // 每100ms增加5%，5秒完成
            });
        }, 100);
    };

    const handlePauseResumeDownload = () => {
        if (isDownloadPaused) {
            // 恢复下载
            setIsDownloadPaused(false);
            startDownload();
        } else {
            // 暂停下载
            setIsDownloadPaused(true);
            if (downloadIntervalRef.current) {
                clearInterval(downloadIntervalRef.current);
                downloadIntervalRef.current = null;
            }
        }
    };

    const handleLocalUpgrade = () => {
        setIsLocalUpgradeModalVisible(true);
        setUploadProgress(0);
        setLocalUpgradeProgress(0);
        setLocalCurrentStep('upload');
        setIsUploadPaused(false);
        upgradeCompletedRef.current = false;

        startUpload();
    };

    const startUpload = () => {
        // 模拟5秒上传进度
        uploadIntervalRef.current = setInterval(() => {
            setUploadProgress(prev => {
                if (prev >= 100) {
                    if (uploadIntervalRef.current) {
                        clearInterval(uploadIntervalRef.current);
                        uploadIntervalRef.current = null;
                    }
                    setLocalCurrentStep('upgrade');
                    setLocalUpgradeProgress(0);

                    // 模拟5秒升级进度
                    const upgradeInterval = setInterval(() => {
                        setLocalUpgradeProgress(prev => {
                            if (prev >= 100) {
                                clearInterval(upgradeInterval);
                                if (!upgradeCompletedRef.current) {
                                    upgradeCompletedRef.current = true;
                                    setTimeout(() => {
                                        setIsLocalUpgradeModalVisible(false);
                                        setUploadProgress(0);
                                        setLocalUpgradeProgress(0);
                                        setLocalCurrentStep('upload');
                                        setIsUploadPaused(false);
                                        setUploadedFile(null);
                                        message.success('本地升级完成！');
                                    }, 1000);
                                }
                                return 100;
                            }
                            return prev + 10; // 每100ms增加10%，5秒完成
                        });
                    }, 100);
                    return 100;
                }
                return prev + 5; // 每100ms增加5%，5秒完成
            });
        }, 100);
    };

    const handlePauseResumeUpload = () => {
        if (isUploadPaused) {
            // 恢复上传
            setIsUploadPaused(false);
            startUpload();
        } else {
            // 暂停上传
            setIsUploadPaused(true);
            if (uploadIntervalRef.current) {
                clearInterval(uploadIntervalRef.current);
                uploadIntervalRef.current = null;
            }
        }
    };

    const handleFileUpload = (file: File) => {
        // 检查文件类型
        const allowedTypes = ['.bin', '.tar.gz', '.zip'];
        const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));

        if (!allowedTypes.some(type => file.name.toLowerCase().endsWith(type))) {
            message.error('只支持 .bin、.tar.gz、.zip 格式的升级文件');
            return false;
        }

        // 检查文件大小 (假设最大100MB)
        const maxSize = 100 * 1024 * 1024; // 100MB
        if (file.size > maxSize) {
            message.error('文件大小不能超过100MB');
            return false;
        }

        setUploadedFile(file);
        return false; // 阻止默认上传行为
    };

    const handleRemoveFile = () => {
        setUploadedFile(null);
        message.info('已移除上传的文件');
    };

    const getFileExtension = (fileName: string | undefined): string => {
        if (!fileName) return '未知';
        const parts = fileName.split('.');
        return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : '未知';
    };

    // 自动升级相关函数
    const handleAutoUpgradeChange = (checked: boolean) => {
        setAutoUpgradeEnabled(checked);
    };

    const handleAutoUpgradeSwitchChange = (checked: boolean) => {
        setAutoUpgradeSwitchEnabled(checked);
    };

    const addTimeRule = () => {
        const newId = Math.max(...timeRules.map(rule => rule.id)) + 1;
        setTimeRules([
            ...timeRules,
            {
                id: newId,
                weekDay: ['monday'],
                startTime: dayjs('02:00:00', 'HH:mm:ss'),
                endTime: dayjs('04:00:00', 'HH:mm:ss')
            }
        ]);
    };

    const removeTimeRule = (id: number) => {
        if (timeRules.length > 1) {
            setTimeRules(timeRules.filter(rule => rule.id !== id));
        }
    };

    const updateTimeRule = (id: number, field: 'weekDay' | 'startTime' | 'endTime', value: any) => {
        setTimeRules(timeRules.map(rule =>
            rule.id === id ? { ...rule, [field]: value } : rule
        ));
    };

    const addUpgradeTimeRule = () => {
        const newId = Math.max(...upgradeTimeRules.map(rule => rule.id)) + 1;
        setUpgradeTimeRules([
            ...upgradeTimeRules,
            {
                id: newId,
                weekDay: ['monday'],
                startTime: dayjs('02:00:00', 'HH:mm:ss'),
                endTime: dayjs('04:00:00', 'HH:mm:ss')
            }
        ]);
    };

    const removeUpgradeTimeRule = (id: number) => {
        if (upgradeTimeRules.length > 1) {
            setUpgradeTimeRules(upgradeTimeRules.filter(rule => rule.id !== id));
        }
    };

    const updateUpgradeTimeRule = (id: number, field: 'weekDay' | 'startTime' | 'endTime', value: any) => {
        setUpgradeTimeRules(upgradeTimeRules.map(rule =>
            rule.id === id ? { ...rule, [field]: value } : rule
        ));
    };

    // FTP升级相关状态
    const [ftpProtocol, setFtpProtocol] = useState<'SFTP' | 'FTP'>('SFTP');
    const [ftpForm] = Form.useForm();

    const handleFtpUpgrade = () => {
        ftpForm.validateFields().then(values => {
            console.log('FTP升级参数:', values);
            message.success('FTP升级功能待实现');
        }).catch(errorInfo => {
            console.log('表单验证失败:', errorInfo);
        });
    };

    const handleFtpReset = () => {
        ftpForm.resetFields();
        setFtpProtocol('SFTP');
    };

    // 清理定时器
    useEffect(() => {
        return () => {
            if (downloadIntervalRef.current) {
                clearInterval(downloadIntervalRef.current);
            }
            if (uploadIntervalRef.current) {
                clearInterval(uploadIntervalRef.current);
            }
        };
    }, []);

    const weekDayOptions = [
        { label: '周一', value: 'monday' },
        { label: '周二', value: 'tuesday' },
        { label: '周三', value: 'wednesday' },
        { label: '周四', value: 'thursday' },
        { label: '周五', value: 'friday' },
        { label: '周六', value: 'saturday' },
        { label: '周日', value: 'sunday' }
    ];



    const contentList = {
        system: (
            <div style={{ width: 1280, margin: '0 auto' }}>
                <div>
                    <h3 style={{ marginBottom: 16, marginLeft: 8 }}>在线升级</h3>
                    <div style={{ paddingLeft: 8 }}>
                        <Space style={{ width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Space>
                                <Button type="primary" onClick={handleCheckUpdate}>
                                    检查更新
                                </Button>
                                <Button
                                    type="default"
                                    disabled={!hasNewVersion}
                                    onClick={() => {
                                        if (hasNewVersion) {
                                            setIsConfirmModalVisible(true);
                                        }
                                    }}
                                >
                                    升级
                                </Button>
                            </Space>
                            {hasNewVersion && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ color: 'rgba(0, 0, 0, 0.65)' }}>发现最新版本：</span>
                                    <Tag color="blue">{latestVersion}</Tag>
                                </div>
                            )}
                        </Space>
                    </div>
                </div>

                <Divider />

                {/* 本地升级区域 */}
                <div>
                    <h3 style={{ marginBottom: 16, marginLeft: 8 }}>本地升级</h3>
                    <div style={{ paddingLeft: 8 }}>
                        <Space style={{ width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Space>
                                <Upload
                                    beforeUpload={handleFileUpload}
                                    showUploadList={false}
                                    accept=".bin,.tar.gz,.zip"
                                >
                                    <Button icon={<UploadOutlined />}>
                                        上传文件
                                    </Button>
                                </Upload>
                                <Button
                                    type="primary"
                                    disabled={!uploadedFile}
                                    onClick={() => {
                                        if (uploadedFile) {
                                            handleLocalUpgrade();
                                        }
                                    }}
                                >
                                    升级
                                </Button>
                            </Space>
                            <div></div>
                        </Space>

                        {uploadedFile && (
                            <div style={{ marginTop: 16 }}>
                                <Card size="small" style={{ background: '#fafafa' }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ color: 'rgba(0, 0, 0, 0.65)' }}>已选择文件：</span>
                                            <Tag color="blue">{uploadedFile.name}</Tag>
                                            <span style={{ color: 'rgba(0, 0, 0, 0.45)', fontSize: '12px' }}>
                                                ({(uploadedFile.size / 1024 / 1024).toFixed(2)} MB)
                                            </span>
                                        </div>
                                        <Button
                                            type="text"
                                            size="small"
                                            onClick={handleRemoveFile}
                                            style={{ color: '#ff4d4f' }}
                                        >
                                            移除
                                        </Button>
                                    </div>
                                </Card>
                            </div>
                        )}
                    </div>
                </div>

                <Divider />

                {/* 通过FTP服务器升级区域 */}
                <div>
                    <h3 style={{ marginBottom: 16, marginLeft: 8 }}>通过FTP服务器升级</h3>
                    <div style={{ paddingLeft: 8 }}>
                        <Form
                            form={ftpForm}
                            layout="vertical"
                            style={{ maxWidth: 600 }}
                            initialValues={{
                                protocol: 'SFTP',
                                path: '',
                                username: '',
                                password: ''
                            }}
                        >
                            <Form.Item
                                label="协议类型"
                                name="protocol"
                                rules={[{ required: true, message: '请选择协议类型' }]}
                            >
                                <Radio.Group
                                    value={ftpProtocol}
                                    onChange={(e) => setFtpProtocol(e.target.value)}
                                    buttonStyle="solid"
                                >
                                    <Radio.Button value="SFTP">SFTP</Radio.Button>
                                    <Radio.Button value="FTP">FTP</Radio.Button>
                                </Radio.Group>
                            </Form.Item>

                            <Form.Item
                                label="升级包路径"
                                name="path"
                                rules={[
                                    { required: true, message: '请输入升级包路径' },
                                    { pattern: /^[\/\w\-\.]+$/, message: '请输入有效的路径格式' }
                                ]}
                            >
                                <Input
                                    placeholder="请输入升级包在服务器上的完整路径，如：/upgrade/package.bin"
                                    style={{ width: '100%' }}
                                />
                            </Form.Item>

                            <Form.Item
                                label="登录名"
                                name="username"
                                rules={[
                                    { required: true, message: '请输入登录名' },
                                    { min: 1, max: 50, message: '登录名长度应在1-50个字符之间' }
                                ]}
                            >
                                <Input
                                    placeholder="请输入FTP服务器登录名"
                                    style={{ width: '100%' }}
                                />
                            </Form.Item>

                            <Form.Item
                                label="登录密码"
                                name="password"
                                rules={[
                                    { required: true, message: '请输入登录密码' },
                                    { min: 6, message: '密码长度至少6个字符' }
                                ]}
                            >
                                <Input.Password
                                    placeholder="请输入FTP服务器登录密码"
                                    style={{ width: '100%' }}
                                />
                            </Form.Item>

                            <Form.Item>
                                <Space>
                                    <Button type="primary" onClick={handleFtpUpgrade}>
                                        升级
                                    </Button>
                                    <Button onClick={handleFtpReset}>
                                        重置
                                    </Button>
                                </Space>
                            </Form.Item>
                        </Form>
                    </div>
                </div>

                <Divider />

                {/* 自动升级区域 */}
                <div>
                    <h3 style={{ marginBottom: 16, marginLeft: 8 }}>自动升级</h3>
                    <div style={{ paddingLeft: 8 }}>
                        {/* 自动升级说明 */}
                        <div style={{
                            background: '#e6f7ff',
                            padding: '12px',
                            borderRadius: '6px',
                            border: '1px solid #91d5ff',
                            lineHeight: '1.6',
                            fontSize: '14px',
                            marginBottom: '16px'
                        }}>
                            <p style={{ margin: 0, color: 'rgba(0, 0, 0, 0.65)' }}>
                                自动升级功能说明：启用后系统将在指定时间范围内自动检查并执行升级操作，确保系统始终运行最新版本。开启后下载和升级不需要手动操作。
                            </p>
                        </div>
                        {/* 自动升级开关 */}
                        <div style={{ marginBottom: 24 }}>
                            <Space>
                                <span>自动下载开关</span>
                                <Switch
                                    checked={autoUpgradeEnabled}
                                    onChange={handleAutoUpgradeChange}
                                />
                            </Space>
                        </div>



                        {/* 允许升级时间规则 */}
                        <div>
                            <div style={{ marginBottom: 16 }}>
                                <Space>
                                    <span>允许下载时间</span>
                                    <Tooltip title="设置下载升级包的时间范围，多个条件满足其中任意一条都会执行下载。">
                                        <ExclamationCircleOutlined style={{ color: '#1890ff', cursor: 'pointer' }} />
                                    </Tooltip>
                                </Space>
                            </div>
                            {timeRules.map((rule, index) => (
                                <div key={rule.id} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '16px',
                                    marginBottom: '12px',
                                    padding: '12px',
                                    background: '#fafafa',
                                    borderRadius: '6px',
                                    opacity: autoUpgradeEnabled ? 1 : 0.5
                                }}>
                                    <span style={{ minWidth: '60px' }}>升级时间范围 {index + 1}：</span>
                                    <Select
                                        value={rule.weekDay}
                                        onChange={(value) => updateTimeRule(rule.id, 'weekDay', value)}
                                        style={{ width: 460 }}
                                        options={weekDayOptions}
                                        mode="multiple"
                                        placeholder="选择星期"
                                        maxTagCount="responsive"
                                        disabled={!autoUpgradeEnabled}
                                    />
                                    <span>从</span>
                                    <TimePicker
                                        value={rule.startTime}
                                        onChange={(time) => updateTimeRule(rule.id, 'startTime', time)}
                                        format="HH:mm:ss"
                                        placeholder="开始时间"
                                        disabled={!autoUpgradeEnabled}
                                    />
                                    <span>到</span>
                                    <TimePicker
                                        value={rule.endTime}
                                        onChange={(time) => updateTimeRule(rule.id, 'endTime', time)}
                                        format="HH:mm:ss"
                                        placeholder="结束时间"
                                        disabled={!autoUpgradeEnabled}
                                    />
                                    {timeRules.length > 1 && (
                                        <Button
                                            type="text"
                                            icon={<DeleteOutlined />}
                                            onClick={() => removeTimeRule(rule.id)}
                                            style={{ color: '#ff4d4f' }}
                                            disabled={!autoUpgradeEnabled}
                                        />
                                    )}
                                </div>
                            ))}
                            <Button
                                type="dashed"
                                icon={<PlusOutlined />}
                                onClick={addTimeRule}
                                style={{ marginTop: 8, width: '100%' }}
                                disabled={!autoUpgradeEnabled}
                            >
                                增加时间范围
                            </Button>
                        </div>

                        {/* 自动升级开关 */}
                        <div style={{ marginTop: 32, marginBottom: 24 }}>
                            <Space>
                                <span>自动升级开关</span>
                                <Switch
                                    checked={autoUpgradeSwitchEnabled}
                                    onChange={handleAutoUpgradeSwitchChange}
                                />
                            </Space>
                        </div>

                        {/* 允许升级时间规则 */}
                        <div>
                            <div style={{ marginBottom: 16 }}>
                                <Space>
                                    <span>允许升级时间</span>
                                    <Tooltip title="设置升级系统的时间范围，多个条件满足其中任意一条都会执行升级。升级开始之后，如果超过时间允许范围，仍会执行到升级完成，且无法暂停。">
                                        <ExclamationCircleOutlined style={{ color: '#1890ff', cursor: 'pointer' }} />
                                    </Tooltip>
                                </Space>
                            </div>
                            {upgradeTimeRules.map((rule, index) => (
                                <div key={rule.id} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '16px',
                                    marginBottom: '12px',
                                    padding: '12px',
                                    background: '#fafafa',
                                    borderRadius: '6px',
                                    opacity: autoUpgradeSwitchEnabled ? 1 : 0.5
                                }}>
                                    <span style={{ minWidth: '60px' }}>升级时间范围 {index + 1}：</span>
                                    <Select
                                        value={rule.weekDay}
                                        onChange={(value) => updateUpgradeTimeRule(rule.id, 'weekDay', value)}
                                        style={{ width: 460 }}
                                        options={weekDayOptions}
                                        mode="multiple"
                                        placeholder="选择星期"
                                        maxTagCount="responsive"
                                        disabled={!autoUpgradeSwitchEnabled}
                                    />
                                    <span>从</span>
                                    <TimePicker
                                        value={rule.startTime}
                                        onChange={(time) => updateUpgradeTimeRule(rule.id, 'startTime', time)}
                                        format="HH:mm:ss"
                                        placeholder="开始时间"
                                        disabled={!autoUpgradeSwitchEnabled}
                                    />
                                    <span>到</span>
                                    <TimePicker
                                        value={rule.endTime}
                                        onChange={(time) => updateUpgradeTimeRule(rule.id, 'endTime', time)}
                                        format="HH:mm:ss"
                                        placeholder="结束时间"
                                        disabled={!autoUpgradeSwitchEnabled}
                                    />
                                    {upgradeTimeRules.length > 1 && (
                                        <Button
                                            type="text"
                                            icon={<DeleteOutlined />}
                                            onClick={() => removeUpgradeTimeRule(rule.id)}
                                            style={{ color: '#ff4d4f' }}
                                            disabled={!autoUpgradeSwitchEnabled}
                                        />
                                    )}
                                </div>
                            ))}
                            <Button
                                type="dashed"
                                icon={<PlusOutlined />}
                                onClick={addUpgradeTimeRule}
                                style={{ marginTop: 8, width: '100%' }}
                                disabled={!autoUpgradeSwitchEnabled}
                            >
                                增加时间范围
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        ),
        patch: (
            <div>
                {/* 补丁升级内容 */}
            </div>
        ),
        rules: (
            <div>
                {/* 规则库升级内容 */}
            </div>
        ),
    };

    return (
        <div>
            {/* 上部分三等分区域 */}
            <Row gutter={24} style={{ marginBottom: '24px' }}>
                <Col span={8}>
                    <Card>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ textAlign: 'left' }}>
                                <Space style={{ width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h3 style={{ margin: 0 }}>系统版本</h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ color: 'rgba(0, 0, 0, 0.65)' }}>当前系统版本号：</span>
                                        <Badge dot offset={[-8, 0]}>
                                            <Tag color="blue">V9.0.1-R1</Tag>
                                        </Badge>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ color: 'rgba(0, 0, 0, 0.65)' }}>自动升级：</span>
                                        <Tag color="success">已启用</Tag>
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
                                <Space style={{ width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h3 style={{ margin: 0 }}>补丁版本</h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ color: 'rgba(0, 0, 0, 0.65)' }}>当前补丁版本号：</span>
                                        <Badge dot offset={[-8, 0]}>
                                            <Tag color="blue">V9.0.1-R1-P1</Tag>
                                        </Badge>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ color: 'rgba(0, 0, 0, 0.65)' }}>自动升级：</span>
                                        <Tag color="success">已启用</Tag>
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
                                <Space style={{ width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h3 style={{ margin: 0 }}>规则库版本</h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ color: 'rgba(0, 0, 0, 0.65)' }}>当前规则库版本号：</span>
                                        <Badge dot offset={[-8, 0]}>
                                            <Tag color="blue">9.270</Tag>
                                        </Badge>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ color: 'rgba(0, 0, 0, 0.65)' }}>自动升级：</span>
                                        <Tag color="error">未启用</Tag>
                                    </div>
                                </Space>
                            </div>
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* 下部分Tab卡片区域 */}
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

            {/* 升级进度模态对话框 */}
            <Modal
                open={isUpgradeModalVisible}
                footer={null}
                closable={false}
                maskClosable={false}
                width={500}
            >
                <div style={{ padding: '20px 0' }}>
                    {currentStep === 'download' && (
                        <div>
                            <div style={{ marginBottom: 16 }}>
                                <h4>正在下载升级包...</h4>
                                <p style={{ color: 'rgba(0, 0, 0, 0.65)', margin: 0 }}>
                                    正在从服务器下载版本 {latestVersion} 的升级包
                                </p>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Progress
                                    percent={downloadProgress}
                                    status={downloadProgress === 100 ? 'success' : 'active'}
                                    style={{ flex: 1 }}
                                />
                                <Button
                                    type="text"
                                    icon={isDownloadPaused ? <PlayCircleOutlined /> : <PauseCircleOutlined />}
                                    onClick={handlePauseResumeDownload}
                                    disabled={downloadProgress === 100}
                                    style={{
                                        color: isDownloadPaused ? '#52c41a' : '#1890ff',
                                        fontSize: '16px'
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    {currentStep === 'upgrade' && (
                        <div>
                            <div style={{ marginBottom: 16 }}>
                                <h4>正在升级系统...</h4>
                                <p style={{ color: 'rgba(0, 0, 0, 0.65)', margin: 0 }}>
                                    正在安装版本 {latestVersion}，请勿关闭系统
                                </p>
                            </div>
                            <Progress
                                percent={upgradeProgress}
                                status={upgradeProgress === 100 ? 'success' : 'active'}
                            />
                        </div>
                    )}
                </div>
            </Modal>

            {/* 本地升级进度模态对话框 */}
            <Modal
                open={isLocalUpgradeModalVisible}
                footer={null}
                closable={false}
                maskClosable={false}
                width={500}
            >
                <div style={{ padding: '20px 0' }}>
                    {localCurrentStep === 'upload' && (
                        <div>
                            <div style={{ marginBottom: 16 }}>
                                <h4>正在上传升级文件...</h4>
                                <p style={{ color: 'rgba(0, 0, 0, 0.65)', margin: 0 }}>
                                    正在上传文件 {uploadedFile?.name}
                                </p>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Progress
                                    percent={uploadProgress}
                                    status={uploadProgress === 100 ? 'success' : 'active'}
                                    style={{ flex: 1 }}
                                />
                                <Button
                                    type="text"
                                    icon={isUploadPaused ? <PlayCircleOutlined /> : <PauseCircleOutlined />}
                                    onClick={handlePauseResumeUpload}
                                    disabled={uploadProgress === 100}
                                    style={{
                                        color: isUploadPaused ? '#52c41a' : '#1890ff',
                                        fontSize: '16px'
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    {localCurrentStep === 'upgrade' && (
                        <div>
                            <div style={{ marginBottom: 16 }}>
                                <h4>正在升级系统...</h4>
                                <p style={{ color: 'rgba(0, 0, 0, 0.65)', margin: 0 }}>
                                    正在安装本地升级文件，请勿关闭系统
                                </p>
                            </div>
                            <Progress
                                percent={localUpgradeProgress}
                                status={localUpgradeProgress === 100 ? 'success' : 'active'}
                            />
                        </div>
                    )}
                </div>
            </Modal>

            {/* 升级确认弹窗 */}
            <Modal
                title="升级确认"
                open={isConfirmModalVisible}
                onOk={handleUpgrade}
                onCancel={() => setIsConfirmModalVisible(false)}
                okText="确定"
                cancelText="取消"
                width={800}
            >
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    <div style={{ marginBottom: 16 }}>
                        <h4 style={{ margin: '0 0 12px 0' }}>更新内容：</h4>
                        <div style={{
                            background: '#e6f7ff',
                            padding: '12px',
                            borderRadius: '6px',
                            border: '1px solid #91d5ff',
                            lineHeight: '1.6',
                            fontSize: '14px'
                        }}>
                            <p style={{ margin: '0 0 8px 0' }}>1. 新增UDP阻断功能，作为TCP阻断的补充，进一步完善网络安全防护体系。</p>
                            <p style={{ margin: '0 0 8px 0' }}>2. 优化应用隐身时间戳检验机制，将时间窗口从3分钟缩短至30秒，有效防止重放攻击。</p>
                            <p style={{ margin: '0 0 8px 0' }}>3. KCM支持设备位置变更监控，当K01位置发生变化时，可通过配置邮箱接收通知。</p>
                            <p style={{ margin: '0 0 8px 0' }}>4. 支持磁盘挂载功能，针对双硬盘设备，当日志存储量过大时，可通过SSH命令进行磁盘挂载以扩展存储容量。</p>
                        </div>
                    </div>
                    <div>
                        <h4 style={{ margin: '0 0 12px 0' }}>升级须知：</h4>
                        <div style={{
                            background: '#fff1f0',
                            padding: '12px',
                            borderRadius: '6px',
                            border: '1px solid #ffccc7',
                            lineHeight: '1.6',
                            fontSize: '14px'
                        }}>
                            <p style={{ margin: 0, color: '#cf1322' }}>1. 升级过程中会重启设备，串联模式需要提前断开设备。</p>
                        </div>
                    </div>
                </div>
            </Modal>


        </div>
    );
};

export default UpgradeManagement; 