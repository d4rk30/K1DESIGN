import React from 'react';
import { Space, Typography, Tag, Descriptions } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { US, CN, GB, FR, DE } from 'country-flag-icons/react/3x2';
import styles from './style.module.less';

// 获取国旗组件的辅助函数
const getFlagComponent = (country: string) => {
    const componentMap: { [key: string]: any } = {
        '美国': US,
        '中国': CN,
        '英国': GB,
        '法国': FR,
        '德国': DE,
    };
    return componentMap[country];
};

interface OutboundTrafficVisualProps {
    sourceInfo: {
        ip: string;
        port?: number;
    };
    destinationInfo: {
        ip: string;
        port?: number;
        isForeign?: boolean;
    };
    protocol: string;
    url: string;
    method?: string;
    statusCode?: number;
    status?: string;
    sessionStart?: string;
    sessionEnd?: string;
    trafficSize?: string;
    upstreamTraffic?: string;
    downstreamTraffic?: string;
    outboundDestination?: string;
    applicationType?: string;
    onDownloadPcap?: () => void;
    onAddToBlacklist?: (ip: string) => void;
    onAddToWhitelist?: (ip: string) => void;
}

const OutboundTrafficVisual: React.FC<OutboundTrafficVisualProps> = ({
    sourceInfo,
    destinationInfo,
    protocol,
    url,
    method,
    statusCode,
    status,
    sessionStart,
    sessionEnd,
    trafficSize,
    upstreamTraffic,
    downstreamTraffic,
    outboundDestination,
    applicationType,
    onDownloadPcap,
    onAddToBlacklist,
    onAddToWhitelist
}) => {
    const getProtocolColor = (protocol: string) => {
        const colors: Record<string, string> = {
            'HTTP': 'blue',
            'HTTPS': 'green',
            'DNS': 'purple',
            'TCP': 'default',
            'UDP': 'default'
        };
        return colors[protocol.toUpperCase()] || 'default';
    };

    const iconMapping = {
        source: '/images/victim.png',
        outbound: '/images/attack.png'
    };

    const isTransportLayer = (protocol: string) => {
        return ['TCP', 'UDP'].includes(protocol.toUpperCase());
    };

    const getStatusLineColor = (status?: string) => {
        if (status === '告警') {
            return '#ff4d4f'; // 红色
        }
        return '#1890ff'; // 蓝色 (监控状态)
    };

    return (
        <div className={styles.pathWrapper}>
            <div className={styles.pathContainer}>
                <div className={styles.lineLayer}>
                    <div
                        className={styles.outboundLine}
                        style={{ backgroundColor: getStatusLineColor(status) }}
                    />
                    <div className={styles.protocolInfo}>
                        <Tag
                            color={getProtocolColor(protocol)}
                            className={styles.protocolTag}
                        >
                            {protocol.toUpperCase()}
                        </Tag>
                        {!isTransportLayer(protocol) && (
                            <div className={styles.urlSection}>
                                {!['DNS', 'TCP', 'UDP'].includes(protocol.toUpperCase()) && method && (
                                    <Tag color="cyan">
                                        {method}
                                    </Tag>
                                )}
                                <Typography.Text
                                    copyable={{ tooltips: false }}
                                    className={styles.urlText}
                                    style={{ margin: '0 4px' }}
                                >
                                    {url || '-'}
                                </Typography.Text>
                                {!['DNS', 'TCP', 'UDP'].includes(protocol.toUpperCase()) && statusCode && (
                                    <Tag
                                        color={
                                            statusCode < 300 ? 'success' :
                                                statusCode < 400 ? 'warning' :
                                                    'error'
                                        }
                                    >
                                        {statusCode}
                                    </Tag>
                                )}
                            </div>
                        )}
                        {(trafficSize || (upstreamTraffic && downstreamTraffic)) && (
                            <div className={styles.trafficSection}>
                                {upstreamTraffic && downstreamTraffic ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Typography.Text
                                            className={styles.trafficText}
                                            type="secondary"
                                        >
                                        </Typography.Text>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                                            <ArrowUpOutlined style={{ color: '#52c41a', fontSize: '10px' }} />
                                            {upstreamTraffic}KB
                                        </span>
                                        <span>/</span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                                            <ArrowDownOutlined style={{ color: '#1890ff', fontSize: '10px' }} />
                                            {downstreamTraffic}KB
                                        </span>
                                    </div>
                                ) : (
                                    <Typography.Text
                                        className={styles.trafficText}
                                        type="secondary"
                                    >
                                        {trafficSize}
                                    </Typography.Text>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* 源IP信息 */}
                <div className={styles.nodeSection}>
                    <div className={styles.iconWrapper}>
                        <img src={iconMapping.source} alt="源IP" className={styles.icon} />
                    </div>
                    <div className={styles.infoWrapper}>
                        <Descriptions column={1} size="small">
                            <Descriptions.Item label="源IP">
                                <Typography.Text copyable style={{ fontSize: '14px' }}>
                                    {sourceInfo.ip}
                                </Typography.Text>
                            </Descriptions.Item>
                            {sourceInfo.port && (
                                <Descriptions.Item label="源端口">
                                    <Typography.Text style={{ fontSize: '14px' }}>
                                        {sourceInfo.port}
                                    </Typography.Text>
                                </Descriptions.Item>
                            )}
                            {applicationType && (
                                <Descriptions.Item label="应用类型">
                                    <Typography.Text style={{ fontSize: '14px' }}>
                                        {applicationType}
                                    </Typography.Text>
                                </Descriptions.Item>
                            )}
                            {sessionStart && (
                                <Descriptions.Item label="会话起始">
                                    <Typography.Text style={{ fontSize: '14px' }}>
                                        {sessionStart}
                                    </Typography.Text>
                                </Descriptions.Item>
                            )}
                        </Descriptions>
                    </div>
                </div>

                {/* 中间下载按钮 */}
                {!isTransportLayer(protocol) && (
                    <div className={styles.centerSection}>
                        <Typography.Link
                            className={styles.downloadLink}
                            onClick={onDownloadPcap}
                        >
                            下载PCAP包
                        </Typography.Link>
                    </div>
                )}

                {/* 目的IP信息 */}
                <div className={`${styles.nodeSection} ${styles.rightAlign}`}>
                    <div className={`${styles.iconWrapper} ${styles.rightAlign}`}>
                        <img src={iconMapping.outbound} alt="目的IP" className={styles.icon} />
                    </div>
                    <div className={styles.infoWrapper}>
                        <Descriptions column={1} size="small">
                            <Descriptions.Item label="目的IP">
                                <Space>
                                    <Typography.Text copyable style={{ fontSize: '14px' }}>
                                        {destinationInfo.ip}
                                    </Typography.Text>
                                    <Typography.Link
                                        onClick={() => onAddToBlacklist?.(destinationInfo.ip)}
                                        style={{ fontSize: '14px' }}
                                    >
                                        加黑
                                    </Typography.Link>
                                    <Typography.Link
                                        onClick={() => onAddToWhitelist?.(destinationInfo.ip)}
                                        style={{ fontSize: '14px' }}
                                    >
                                        加白
                                    </Typography.Link>
                                </Space>
                            </Descriptions.Item>
                            {destinationInfo.port && (
                                <Descriptions.Item label="目的端口">
                                    <Typography.Text style={{ fontSize: '14px' }}>
                                        {destinationInfo.port}
                                    </Typography.Text>
                                </Descriptions.Item>
                            )}
                            {outboundDestination && (
                                <Descriptions.Item label="出境目标">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        {(() => {
                                            const country = outboundDestination.split('|')[0].trim();
                                            const FlagComponent = getFlagComponent(country);
                                            return FlagComponent ? <FlagComponent style={{ width: 16 }} /> : null;
                                        })()}
                                        <Typography.Text style={{ fontSize: '14px' }}>
                                            {outboundDestination}
                                        </Typography.Text>
                                    </div>
                                </Descriptions.Item>
                            )}
                            {sessionEnd && (
                                <Descriptions.Item label="会话结束">
                                    <Typography.Text style={{ fontSize: '14px' }}>
                                        {sessionEnd}
                                    </Typography.Text>
                                </Descriptions.Item>
                            )}
                        </Descriptions>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OutboundTrafficVisual; 