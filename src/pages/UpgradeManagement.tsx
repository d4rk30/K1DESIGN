import React, { useState, useEffect, useRef } from 'react';
import { Card, Row, Col, Space, Tag, Badge, Button, Progress, Modal, Divider, Switch, Select, TimePicker } from 'antd';
import { PlusOutlined, DeleteOutlined, PauseCircleOutlined, PlayCircleOutlined } from '@ant-design/icons';
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

    // 自动升级相关状态
    const [autoUpgradeEnabled, setAutoUpgradeEnabled] = useState(false);
    const [autoUpgradeModules, setAutoUpgradeModules] = useState<string[]>(['system', 'patch', 'rules']);
    const [timeRules, setTimeRules] = useState([
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

    // 自动升级相关函数
    const handleAutoUpgradeChange = (checked: boolean) => {
        setAutoUpgradeEnabled(checked);
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

    // 清理定时器
    useEffect(() => {
        return () => {
            if (downloadIntervalRef.current) {
                clearInterval(downloadIntervalRef.current);
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

    const moduleOptions = [
        { label: '系统版本', value: 'system' },
        { label: '补丁版本', value: 'patch' },
        { label: '规则库版本', value: 'rules' }
    ];

    const contentList = {
        system: (
            <div style={{ width: 1280, margin: '0 auto' }}>
                <div>
                    <h3 style={{ marginBottom: 16, marginLeft: 8 }}>在线升级</h3>
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

                <Divider />

                {/* 本地升级区域 */}
                <div>
                    <h3 style={{ marginBottom: 16, marginLeft: 8 }}>本地升级</h3>
                    {/* 本地升级内容 */}
                </div>

                <Divider />

                {/* 通过FTP服务器升级区域 */}
                <div>
                    <h3 style={{ marginBottom: 16, marginLeft: 8 }}>通过FTP服务器升级</h3>
                    {/* 通过FTP服务器升级内容 */}
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
                                <span>自动升级开关</span>
                                <Switch
                                    checked={autoUpgradeEnabled}
                                    onChange={handleAutoUpgradeChange}
                                />
                            </Space>
                        </div>

                        {/* 自动升级模块选择 */}
                        <div style={{ marginBottom: 24 }}>
                            <div style={{ marginBottom: 8 }}>自动升级模块</div>
                            <Select
                                value={autoUpgradeModules}
                                onChange={setAutoUpgradeModules}
                                options={moduleOptions}
                                mode="multiple"
                                placeholder="选择需要自动升级的模块"
                                style={{ width: '100%' }}
                                disabled={!autoUpgradeEnabled}
                            />
                        </div>

                        {/* 允许升级时间规则 */}
                        <div>
                            <div style={{ marginBottom: 16 }}>允许升级时间</div>
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