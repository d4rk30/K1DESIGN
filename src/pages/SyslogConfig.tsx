import React from 'react';
import { Card, Form, Switch, Divider, Space, Button, Radio, Input, Collapse, Checkbox, Row, Col, Tooltip } from 'antd';
import { QuestionCircleOutlined, SaveOutlined, UndoOutlined } from '@ant-design/icons';
import LabelInput from '@/components/LabelInput';

const CustomStyle = () => (
    <style>
        {`
            .custom-collapse .ant-collapse-header {
                align-items: center !important;
            }
            .custom-collapse .ant-collapse-expand-icon {
                display: flex;
                align-items: center;
                margin-right: 8px;
            }
        `}
    </style>
);

/**
 * Syslog配置页面组件
 * 用于配置系统日志的外发、服务器信息和日志类型等设置
 */
const SyslogConfig: React.FC = () => {
    // 创建表单实例
    const [form] = Form.useForm();

    // 修改初始状态为全部选中
    const [panelModes, setPanelModes] = React.useState<Record<string, boolean>>({
        '1': true, // 使用字符串作为 key
        '2': true,
        '3': true,
        '4': true,
        '5': true
    });

    // 在组件加载时设置默认值
    React.useEffect(() => {
        // 设置所有选项的默认值
        const defaultValues = {
            attack_threatLevel: getAllOptionsForField('attack_threatLevel'),
            attack_actions: getAllOptionsForField('attack_actions'),
            attack_threatTypes: getAllOptionsForField('attack_threatTypes'),
            external_actions: getAllOptionsForField('external_actions'),
            external_hitTypes: getAllOptionsForField('external_hitTypes'),
            app_actions: getAllOptionsForField('app_actions'),
            app_logTypes: getAllOptionsForField('app_logTypes'),
            mapping_actions: getAllOptionsForField('mapping_actions'),
            mapping_severityLevels: getAllOptionsForField('mapping_severityLevels'),
            weakPassword_actions: getAllOptionsForField('weakPassword_actions')
        };
        form.setFieldsValue(defaultValues);
    }, [form]);

    // 处理全选/反选的函数
    const handleModeChange = (panelKey: keyof typeof panelModes) => {
        setPanelModes(prev => {
            const newMode = !prev[panelKey];

            // 获取当前面板所有的表单项
            const formItems = {
                '1': ['attack_threatLevel', 'attack_actions', 'attack_threatTypes'],
                '2': ['external_actions', 'external_hitTypes'],
                '3': ['app_actions', 'app_logTypes'],
                '4': ['mapping_actions', 'mapping_severityLevels'],
                '5': ['weakPassword_actions']
            }[panelKey];

            // 根据模式设置表单值
            formItems?.forEach(item => {
                const allOptions = getAllOptionsForField(item as FieldName);
                form.setFieldValue(item, newMode ? allOptions : []);
            });

            return { ...prev, [panelKey]: newMode };
        });
    };

    // 添加一个类型定义，列举所有可能的字段名
    type FieldName = 
        | 'attack_threatLevel' 
        | 'attack_actions' 
        | 'attack_threatTypes'
        | 'external_actions'
        | 'external_hitTypes'
        | 'app_actions'
        | 'app_logTypes'
        | 'mapping_actions'
        | 'mapping_severityLevels'
        | 'weakPassword_actions';

    // 修改函数签名
    const getAllOptionsForField = (fieldName: FieldName) => {
        // 定义每个字段的所有可选值
        const optionsMap = {
            'attack_threatLevel': ['high', 'medium', 'low'],
            'attack_actions': ['block', 'monitor'],
            'attack_threatTypes': [
                'scanProtection', 'webCrawler', 'commandInjection', 'codeInjection',
                'sqlInjection', 'ldapInjection', 'xpathInjection', 'xmlInjection',
                'ssiInjection', 'xss', 'componentVulnerability', 'unauthorizedAccess',
                'authVulnerability', 'deserializationVulnerability', 'webshell',
                'fileInclusion', 'hostScanAttack', 'privilegeEscalation',
                'osVulnerability', 'appVulnerability', 'webAppVulnerability',
                'dbVulnerability', 'networkDeviceVulnerability', 'securityProductVulnerability',
                'smartDeviceVulnerability', 'blockchainVulnerability', 'icsVulnerability',
                'appBruteforce', 'osBruteforce', 'networkDeviceBruteforce',
                'dbBruteforce', 'covertTunnel', 'backdoorAttack',
                'trojanWormAttack', 'dnsMaliciousRequest', 'sensitiveInfoLeak',
                'hackerToolFeature', 'hostCompromise', 'abnormalConnection',
                'zeroDay', 'httpRequestSmuggling', 'cryptojacking',
                'sessionHijacking', 'appLayerDos', 'networkLayerDos',
                'tempEmailComm'
            ],
            'external_actions': ['block', 'monitor'],
            'external_hitTypes': ['ipIntel', 'urlIntel', 'domainIntel'],
            'app_actions': ['pass', 'monitor'],
            'app_logTypes': ['validationPass', 'validationFail', 'unauthorized'],
            'mapping_actions': ['pass', 'monitor'],
            'mapping_severityLevels': ['high', 'medium', 'low'],
            'weakPassword_actions': ['pass']
        };
        return optionsMap[fieldName] || [];
    };

    /**
     * 处理表单提交
     * @param values - 表单数据
     */
    const handleSave = (values: any) => {
        console.log('Form values:', values);
    };

    /**
     * 重置表单数据到初始状态
     */
    const handleReset = () => {
        form.resetFields();
    };

    return (
        <Card>
            <CustomStyle />
            <Form
                form={form}
                onFinish={handleSave}
                layout="vertical"
                style={{ width: 1280, margin: '0 auto' }}
            >
                {/* Syslog总开关配置区域 */}
                <div>
                    <Form.Item
                        name="enableSyslog"
                        label="外发Syslog配置"
                        valuePropName="checked"
                        layout='horizontal'
                        wrapperCol={{ style: { marginLeft: 16 } }}  // 设置控件区域的左边距
                    >
                        <Switch />
                    </Form.Item>
                </div>

                <Divider />

                {/* Syslog服务器配置区域 - 支持配置3个服务器 */}
                <div>
                    <div style={{ marginBottom: 16 }}>Syslog服务器</div>
                    {/* 循环渲染3个服务器配置项 */}
                    {[1, 2, 3].map(index => (
                        <div key={index} style={{
                            display: 'grid',  // 改用 grid 布局
                            gridTemplateColumns: '240px 160px auto',  // 设置三列，最后一列自动占据剩余空间
                            gap: '24px',
                            marginBottom: index !== 3 ? '16px' : 0
                        }}>
                            {/* 服务器IP配置 */}
                            <Form.Item
                                name={`serverIp${index}`}
                                style={{ marginBottom: 0 }}
                            >
                                <LabelInput
                                    label="IP"
                                    placeholder="IP地址"
                                />
                            </Form.Item>
                            {/* 服务器端口配置 */}
                            <Form.Item
                                name={`serverPort${index}`}
                                style={{ marginBottom: 0 }}
                            >
                                <LabelInput
                                    label="端口"
                                    placeholder="端口号"
                                />
                            </Form.Item>
                            {/* 传输格式选择和加密配置放在同一列 */}
                            <div style={{ display: 'flex', gap: '24px' }}>
                                <Form.Item
                                    name={`transmissionFormat${index}`}
                                    style={{ marginBottom: 0, minWidth: 'fit-content' }}
                                    label="传输格式"
                                    layout="horizontal"
                                    wrapperCol={{ style: { marginLeft: 16 } }}
                                >
                                    <Radio.Group>
                                        <Radio value="UDP">字符串格式</Radio>
                                        <Radio value="JSON">JSON格式</Radio>
                                    </Radio.Group>
                                </Form.Item>
                                <Form.Item noStyle shouldUpdate={(prevValues, currentValues) =>
                                    prevValues[`enableServer${index}`] !== currentValues[`enableServer${index}`]
                                }>
                                    {({ getFieldValue }) => (
                                        <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                                            <Form.Item
                                                name={`enableServer${index}`}
                                                valuePropName="checked"
                                                style={{ marginBottom: 0, marginRight: 24 }}
                                                label="加密传输"
                                                layout="horizontal"
                                                wrapperCol={{ style: { marginLeft: 16 } }}
                                            >
                                                <Switch />
                                            </Form.Item>
                                            {getFieldValue(`enableServer${index}`) && (
                                                <Form.Item
                                                    name={`encryptKey${index}`}
                                                    style={{ marginBottom: 0, flex: 1 }}
                                                    rules={[
                                                        { required: true, message: '请输入加密密钥' },
                                                        {
                                                            pattern: /^[a-zA-Z0-9!@#%]{16}$/,
                                                            message: '密钥必须为16位数字、英文字母或特殊字符(!@#%)'
                                                        }
                                                    ]}
                                                >
                                                    <Input
                                                        placeholder="SM4加密，16位数字、字母、特殊字符(!@#%)"
                                                        style={{ width: '100%' }}  // 确保 Input 占满容器宽度
                                                    />
                                                </Form.Item>
                                            )}
                                        </div>
                                    )}
                                </Form.Item>
                            </div>
                        </div>
                    ))}
                </div>

                <Divider />

                <div style={{ marginBottom: 16 }}>筛选配置</div>

                <Collapse 
                    defaultActiveKey={['1', '2', '3', '4', '5']} 
                    style={{ marginBottom: 24 }}
                    className="custom-collapse"
                >
                    <Collapse.Panel
                        header={
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                width: '100%',
                                padding: '4px 0'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span>攻击监测日志</span>
                                    <Tooltip title="是否传输攻击监测日志作为syslog，可以根据条件进行选择">
                                        <QuestionCircleOutlined style={{ color: '#999' }} />
                                    </Tooltip>
                                </div>
                                <Button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleModeChange('1');
                                    }}
                                >
                                    {panelModes['1'] ? '反选' : '全选'}
                                </Button>
                            </div>
                        }
                        key="1"
                    >
                        <Form.Item
                            name="attack_threatLevel"
                            label="威胁等级"
                            layout="horizontal"
                            wrapperCol={{ style: { marginLeft: 16 } }}
                        >
                            <Checkbox.Group>
                                <Checkbox value="high">高危</Checkbox>
                                <Checkbox value="medium">中危</Checkbox>
                                <Checkbox value="low">低危</Checkbox>
                            </Checkbox.Group>
                        </Form.Item>

                        <Form.Item
                            name="attack_actions"
                            label="处理动作"
                            layout="horizontal"
                            wrapperCol={{ style: { marginLeft: 16 } }}
                        >
                            <Checkbox.Group>
                                <Checkbox value="block">阻断</Checkbox>
                                <Checkbox value="monitor">监控</Checkbox>
                            </Checkbox.Group>
                        </Form.Item>

                        <Form.Item
                            name="attack_threatTypes"
                            label="情报类型"
                            layout="horizontal"
                            wrapperCol={{ style: { marginLeft: 16 } }}
                        >
                            <Checkbox.Group style={{ width: '100%', marginTop: 6 }}>
                                <Row gutter={[16, 16]}>
                                    <Col span={4}><Checkbox value="scanProtection">扫描防护</Checkbox></Col>
                                    <Col span={4}><Checkbox value="webCrawler">网络爬虫</Checkbox></Col>
                                    <Col span={4}><Checkbox value="commandInjection">命令注入</Checkbox></Col>
                                    <Col span={4}><Checkbox value="codeInjection">代码注入</Checkbox></Col>
                                    <Col span={4}><Checkbox value="sqlInjection">SQL注入</Checkbox></Col>
                                    <Col span={4}><Checkbox value="ldapInjection">LDAP注入</Checkbox></Col>

                                    <Col span={4}><Checkbox value="xpathInjection">XPATH注入</Checkbox></Col>
                                    <Col span={4}><Checkbox value="xmlInjection">XML注入</Checkbox></Col>
                                    <Col span={4}><Checkbox value="ssiInjection">SSI注入</Checkbox></Col>
                                    <Col span={4}><Checkbox value="xss">跨站脚本攻击</Checkbox></Col>
                                    <Col span={4}><Checkbox value="componentVulnerability">组件漏洞攻击</Checkbox></Col>
                                    <Col span={4}><Checkbox value="unauthorizedAccess">未授权访问</Checkbox></Col>

                                    <Col span={4}><Checkbox value="authVulnerability">认证和授权漏洞</Checkbox></Col>
                                    <Col span={4}><Checkbox value="deserializationVulnerability">反序列化漏洞</Checkbox></Col>
                                    <Col span={4}><Checkbox value="webshell">webshell</Checkbox></Col>
                                    <Col span={4}><Checkbox value="fileInclusion">文件包含</Checkbox></Col>
                                    <Col span={4}><Checkbox value="hostScanAttack">主机扫描攻击</Checkbox></Col>
                                    <Col span={4}><Checkbox value="privilegeEscalation">主机权限提升</Checkbox></Col>

                                    <Col span={4}><Checkbox value="osVulnerability">操作系统漏洞</Checkbox></Col>
                                    <Col span={4}><Checkbox value="appVulnerability">应用程序漏洞</Checkbox></Col>
                                    <Col span={4}><Checkbox value="webAppVulnerability">WEB应用漏洞</Checkbox></Col>
                                    <Col span={4}><Checkbox value="dbVulnerability">数据库漏洞</Checkbox></Col>
                                    <Col span={4}><Checkbox value="networkDeviceVulnerability">网络设备漏洞</Checkbox></Col>
                                    <Col span={4}><Checkbox value="securityProductVulnerability">安全产品漏洞</Checkbox></Col>
                                    <Col span={4}><Checkbox value="smartDeviceVulnerability">智能设备漏洞</Checkbox></Col>
                                    <Col span={4}><Checkbox value="blockchainVulnerability">区块链漏洞</Checkbox></Col>
                                    <Col span={4}><Checkbox value="icsVulnerability">工业控制系统漏洞</Checkbox></Col>
                                    <Col span={4}><Checkbox value="appBruteforce">应用程序暴力破解攻击</Checkbox></Col>
                                    <Col span={4}><Checkbox value="osBruteforce">操作系统暴力破解攻击</Checkbox></Col>
                                    <Col span={4}><Checkbox value="networkDeviceBruteforce">网络设备暴力破解攻击</Checkbox></Col>
                                    <Col span={4}><Checkbox value="dbBruteforce">数据库暴力破解</Checkbox></Col>
                                    <Col span={4}><Checkbox value="covertTunnel">隐蔽隧道</Checkbox></Col>
                                    <Col span={4}><Checkbox value="backdoorAttack">后门攻击</Checkbox></Col>
                                    <Col span={4}><Checkbox value="trojanWormAttack">木马蠕虫攻击</Checkbox></Col>
                                    <Col span={4}><Checkbox value="dnsMaliciousRequest">DNS恶意请求攻击</Checkbox></Col>
                                    <Col span={4}><Checkbox value="sensitiveInfoLeak">敏感信息泄露</Checkbox></Col>
                                    <Col span={4}><Checkbox value="hackerToolFeature">黑客工具特征</Checkbox></Col>
                                    <Col span={4}><Checkbox value="hostCompromise">主机失陷</Checkbox></Col>
                                    <Col span={4}><Checkbox value="abnormalConnection">异常连接</Checkbox></Col>
                                    <Col span={4}><Checkbox value="zeroDay">未公开漏洞攻击</Checkbox></Col>
                                    <Col span={4}><Checkbox value="httpRequestSmuggling">HTTP请求走私</Checkbox></Col>
                                    <Col span={4}><Checkbox value="cryptojacking">挖矿行为</Checkbox></Col>
                                    <Col span={4}><Checkbox value="sessionHijacking">会话劫持</Checkbox></Col>
                                    <Col span={4}><Checkbox value="appLayerDos">应用层拒绝服务攻击</Checkbox></Col>
                                    <Col span={4}><Checkbox value="networkLayerDos">网络层拒绝服务攻击</Checkbox></Col>
                                    <Col span={4}><Checkbox value="tempEmailComm">临时Email邮箱通信</Checkbox></Col>
                                </Row>
                            </Checkbox.Group>
                        </Form.Item>

                    </Collapse.Panel>

                    <Collapse.Panel
                        header={
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                width: '100%',
                                padding: '4px 0'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span>外来检测日志</span>
                                    <Tooltip title="是否传输外联检测日志作为syslog，可以根据条件进行选择">
                                        <QuestionCircleOutlined style={{ color: '#999' }} />
                                    </Tooltip>
                                </div>
                                <Button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleModeChange('2');
                                    }}
                                >
                                    {panelModes['2'] ? '反选' : '全选'}
                                </Button>
                            </div>
                        }
                        key="2"
                    >
                        <Form.Item
                            name="external_actions"
                            label="处理动作"
                            layout="horizontal"
                            wrapperCol={{ style: { marginLeft: 16 } }}
                        >
                            <Checkbox.Group>
                                <Checkbox value="block">阻断</Checkbox>
                                <Checkbox value="monitor">监控</Checkbox>
                            </Checkbox.Group>
                        </Form.Item>

                        <Form.Item
                            name="external_hitTypes"
                            label="命中类型"
                            layout="horizontal"
                            wrapperCol={{ style: { marginLeft: 16 } }}
                        >
                            <Checkbox.Group>
                                <Checkbox value="ipIntel">IP情报</Checkbox>
                                <Checkbox value="urlIntel">URL情报</Checkbox>
                                <Checkbox value="domainIntel">域名情报</Checkbox>
                            </Checkbox.Group>
                        </Form.Item>
                    </Collapse.Panel>

                    <Collapse.Panel
                        header={
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                width: '100%',
                                padding: '4px 0'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span>应用隐身日志</span>
                                    <Tooltip title="是否传输应用隐身日志作为syslog，可以根据条件进行选择">
                                        <QuestionCircleOutlined style={{ color: '#999' }} />
                                    </Tooltip>
                                </div>
                                <Button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleModeChange('3');
                                    }}
                                >
                                    {panelModes['3'] ? '反选' : '全选'}
                                </Button>
                            </div>
                        }
                        key="3"
                    >
                        <Form.Item
                            name="app_actions"
                            label="处理动作"
                            layout="horizontal"
                            wrapperCol={{ style: { marginLeft: 16 } }}
                        >
                            <Checkbox.Group>
                                <Checkbox value="pass">阻断</Checkbox>
                                <Checkbox value="monitor">监控</Checkbox>
                            </Checkbox.Group>
                        </Form.Item>

                        <Form.Item
                            name="app_logTypes"
                            label="日志类型"
                            layout="horizontal"
                            wrapperCol={{ style: { marginLeft: 16 } }}
                        >
                            <Checkbox.Group>
                                <Checkbox value="validationPass">校验通过</Checkbox>
                                <Checkbox value="validationFail">校验未通过</Checkbox>
                                <Checkbox value="unauthorized">未授权访问</Checkbox>
                            </Checkbox.Group>
                        </Form.Item>
                    </Collapse.Panel>

                    <Collapse.Panel
                        header={
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                width: '100%',
                                padding: '4px 0'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span>反测绘日志</span>
                                    <Tooltip title="是否传输反测绘日志作为syslog，可以根据条件进行选择">
                                        <QuestionCircleOutlined style={{ color: '#999' }} />
                                    </Tooltip>
                                </div>
                                <Button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleModeChange('4');
                                    }}
                                >
                                    {panelModes['4'] ? '反选' : '全选'}
                                </Button>
                            </div>
                        }
                        key="4"
                    >
                        <Form.Item
                            name="mapping_actions"
                            label="处理动作"
                            layout="horizontal"
                            wrapperCol={{ style: { marginLeft: 16 } }}
                        >
                            <Checkbox.Group>
                                <Checkbox value="pass">阻断</Checkbox>
                                <Checkbox value="monitor">监控</Checkbox>
                            </Checkbox.Group>
                        </Form.Item>

                        <Form.Item
                            name="mapping_severityLevels"
                            label="严重级别"
                            layout="horizontal"
                            wrapperCol={{ style: { marginLeft: 16 } }}
                        >
                            <Checkbox.Group>
                                <Checkbox value="high">高级</Checkbox>
                                <Checkbox value="medium">中级</Checkbox>
                                <Checkbox value="low">低级</Checkbox>
                            </Checkbox.Group>
                        </Form.Item>
                    </Collapse.Panel>

                    <Collapse.Panel
                        header={
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                width: '100%',
                                padding: '4px 0'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span>弱口令登录日志</span>
                                    <Tooltip title="是否传输弱口令登录日作为syslog，可以根据条件进行选择">
                                        <QuestionCircleOutlined style={{ color: '#999' }} />
                                    </Tooltip>
                                </div>
                                <Button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleModeChange('5');
                                    }}
                                >
                                    {panelModes['5'] ? '反选' : '全选'}
                                </Button>
                            </div>
                        }
                        key="5"
                    >
                        <Form.Item
                            name="weakPassword_actions"
                            label="弱口令登录日志"
                            layout="horizontal"
                            wrapperCol={{ style: { marginLeft: 16 } }}
                        >
                            <Checkbox.Group>
                                <Checkbox value="pass"></Checkbox>
                            </Checkbox.Group>
                        </Form.Item>
                    </Collapse.Panel>
                </Collapse>


                {/* 表单操作按钮区域 */}
                <Form.Item>
                    <Space>
                        <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                            保存
                        </Button>
                        <Button onClick={handleReset} icon={<UndoOutlined />}>
                            重置
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </Card>
    );
};

export default SyslogConfig;

