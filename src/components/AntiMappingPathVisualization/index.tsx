import React from 'react';
import { Space, Typography, Tag, Descriptions } from 'antd';
import { StopOutlined } from '@ant-design/icons';
import styles from './style.module.less';
import { US, CN, GB, FR, DE } from 'country-flag-icons/react/3x2';

interface AntiMappingPathVisualizationProps {
    attackerInfo?: {
        ip: string;
        port: string;
        time: string;
        location: string;
        deviceType: string;
        browserType: string;
        OSType: string;
    };
    deviceInfo?: {
        protocolType: string;
        protectionRule: string;
        protectionType: string;
        reverseMappingType: string;
    };
    victimInfo?: {
        ip: string;
        port: string;
        assetGroup: string;
    };
    threatLevel?: string;
    action?: string;
}

const defaultData = {
    attackerInfo: {
        ip: '10.21.23.4',
        port: '45678',
        time: '2024-03-21 15:30:45',
        location: '美国｜纽约',
        deviceType: '移动设备',
        browserType: 'Chrome Mobile 121.0',
        OSType: 'Windows 11'
    },
    deviceInfo: {
        protocolType: 'HTTP',
        protectionRule: 'Default_v4',
        protectionType: '常用爬虫工具',
        reverseMappingType: '爬虫类型工具'
    },
    victimInfo: {
        ip: '10.0.2.15',
        port: '443',
        assetGroup: '核心业务系统'
    },
    threatLevel: '中级',
    action: '阻断'
};

const AntiMappingPathVisualization: React.FC<AntiMappingPathVisualizationProps> = ({
    attackerInfo = defaultData.attackerInfo,
    deviceInfo = defaultData.deviceInfo,
    victimInfo = defaultData.victimInfo,
    threatLevel = defaultData.threatLevel,
    action = defaultData.action
}) => {
    const getThreatLevelColor = (level: string) => {
        const colors: Record<string, string> = {
            '高级': 'red',
            '中级': 'orange',
            '低级': 'green'
        };
        return colors[level] || 'blue';
    };

    const iconMapping = {
        attacker: '/images/attack.png',
        device: '/images/device.png',
        victim: '/images/victim.png'
    };

    const getFlagComponent = (location: string) => {
        const country = location.split('｜')[0].trim();
        const componentMap: { [key: string]: any } = {
            '美国': US,
            '中国': CN,
            '英国': GB,
            '法国': FR,
            '德国': DE,
        };
        return componentMap[country];
    };

    return (
        <div className={styles.attackPathWrapper}>
            <div className={styles.pathContainer}>
                {/* 连线层 */}
                <div className={styles.lineLayer}>
                    {/* 第一段连线（蓝色） */}
                    <div className={styles.blueLine} />
                    {/* 威胁等级标签 */}
                    <div className={styles.threatLabel}>
                        <Tag color={getThreatLevelColor(threatLevel)}>{threatLevel}</Tag>
                    </div>

                    {/* 第二段连线（红色） */}
                    <div className={styles.redLine} />
                    {/* 阻断标签 */}
                    <div className={styles.actionLabel}>
                        <Tag color="red">
                            <Space>
                                <StopOutlined />
                                {action}
                            </Space>
                        </Tag>
                    </div>
                </div>

                {/* 攻击者信息 */}
                <div className={styles.nodeSection}>
                    <div className={styles.iconWrapper}>
                        <img src={iconMapping.attacker} alt="攻击者" className={styles.icon} />
                    </div>
                    <div className={styles.infoWrapper}>
                        <Descriptions column={1} size="small">
                            <Descriptions.Item label="源IP">
                                <Typography.Text copyable>{attackerInfo.ip}</Typography.Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="源端口">{attackerInfo.port}</Descriptions.Item>
                            <Descriptions.Item label="时间">{attackerInfo.time}</Descriptions.Item>
                            <Descriptions.Item label="归属地">
                                <Space>
                                    {(() => {
                                        const FlagComponent = getFlagComponent(attackerInfo.location);
                                        return FlagComponent && <FlagComponent style={{ width: 16 }} />;
                                    })()}
                                    {attackerInfo.location}
                                </Space>
                            </Descriptions.Item>
                        </Descriptions>
                    </div>
                </div>

                {/* 设备信息 */}
                <div className={styles.nodeSection}>
                    <div className={styles.iconWrapper}>
                        <img src={iconMapping.device} alt="设备" className={styles.icon} />
                    </div>
                    <div className={styles.infoWrapper}>
                        <Descriptions column={1} size="small">
                            <Descriptions.Item label="协议类型">{deviceInfo.protocolType}</Descriptions.Item>
                            <Descriptions.Item label="防护策略">{deviceInfo.protectionRule}</Descriptions.Item>
                        </Descriptions>
                    </div>
                </div>

                {/* 被攻击者信息 */}
                <div className={styles.nodeSection}>
                    <div className={styles.iconWrapper}>
                        <img src={iconMapping.victim} alt="被攻击者" className={styles.icon} />
                    </div>
                    <div className={styles.infoWrapper}>
                        <Descriptions column={1} size="small">
                            <Descriptions.Item label="目的IP">
                                <Typography.Text copyable>{victimInfo.ip}</Typography.Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="目的端口">{victimInfo.port}</Descriptions.Item>
                            <Descriptions.Item label="所属资产组">{victimInfo.assetGroup}</Descriptions.Item>
                        </Descriptions>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AntiMappingPathVisualization; 