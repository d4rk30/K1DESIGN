import React from 'react';
import { Space, Typography, Tag, Descriptions } from 'antd';
import { StopOutlined } from '@ant-design/icons';
import styles from './style.module.less';
import { US, CN, GB, FR, DE } from 'country-flag-icons/react/3x2';

interface AttackPathVisualProps {
    attackerInfo: {
        ip: string;
        time: string;
        location: string;
    };
    deviceInfo: {
        intelType: string;
        rule: string;
        intelSource: string;
        localCalibration?: {
            status: string;
            result: string;
            time: string;
        };
    };
    victimInfo: {
        ip: string;
        port: string;
        assetGroup: string;
    };
    threatLevel: string;
    action: string;
    onAddToBlacklist?: (ip: string) => void;
    onAddToWhitelist?: (ip: string) => void;
}

const AttackPathVisual: React.FC<AttackPathVisualProps> = ({
    attackerInfo,
    deviceInfo,
    victimInfo,
    threatLevel,
    action,
    onAddToBlacklist,
    onAddToWhitelist
}) => {
    const getThreatLevelColor = (level: string) => {
        const colors: Record<string, string> = {
            '高': 'red',
            '中': 'orange',
            '低': 'green'
        };
        return colors[level] || 'blue';
    };

    const iconMapping = {
        attacker: '/images/attack.png',
        device: '/images/device.png',
        victim: '/images/victim.png'
    };

    const getFlagComponent = (location: string) => {
        const country = location.split('|')[0].trim();
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
                            <Descriptions.Item label="攻击IP">
                                <Space>
                                    <Typography.Text copyable>{attackerInfo.ip}</Typography.Text>
                                    <Typography.Link 
                                        onClick={() => onAddToBlacklist?.(attackerInfo.ip)}
                                        style={{ fontSize: '14px' }}
                                    >
                                        加黑
                                    </Typography.Link>
                                    <Typography.Link 
                                        onClick={() => onAddToWhitelist?.(attackerInfo.ip)}
                                        style={{ fontSize: '14px' }}
                                    >
                                        加白
                                    </Typography.Link>
                                </Space>
                            </Descriptions.Item>
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
                            <Descriptions.Item label="情报类型">{deviceInfo.intelType}</Descriptions.Item>
                            <Descriptions.Item label="命中规则">{deviceInfo.rule}</Descriptions.Item>
                            <Descriptions.Item label="命中情报源">{deviceInfo.intelSource}</Descriptions.Item>
                            {deviceInfo.localCalibration && (
                                <>
                                    <Descriptions.Item label="二次本地校准状态">
                                        <Tag color={deviceInfo.localCalibration.status === '已完成' ? 'success' : 'processing'}>
                                            {deviceInfo.localCalibration.status}
                                        </Tag>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="校准结果">
                                        <Tag color={deviceInfo.localCalibration.result === '确认为威胁' ? 'error' : 'success'}>
                                            {deviceInfo.localCalibration.result}
                                        </Tag>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="校准时间">
                                        {deviceInfo.localCalibration.time}
                                    </Descriptions.Item>
                                </>
                            )}
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
                            <Descriptions.Item label="被攻击IP">
                                <Typography.Text copyable>{victimInfo.ip}</Typography.Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="被攻击端口">{victimInfo.port}</Descriptions.Item>
                            <Descriptions.Item label="所属资产组">{victimInfo.assetGroup}</Descriptions.Item>
                        </Descriptions>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AttackPathVisual; 