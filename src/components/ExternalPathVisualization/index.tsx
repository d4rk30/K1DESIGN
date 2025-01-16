import React from 'react';
import { Space, Typography, Tag } from 'antd';
import styles from './style.module.less';

interface ExternalConnectionPathVisualProps {
  attackerInfo: {
    ip: string;
  };
  victimInfo: {
    ip: string;
    isForeign?: boolean;
  };
  protocol: string;
  url: string;
  onDownloadPcap?: () => void;
}

const ExternalConnectionPathVisual: React.FC<ExternalConnectionPathVisualProps> = ({
  attackerInfo,
  victimInfo,
  protocol,
  url,
  onDownloadPcap
}) => {
  const getProtocolColor = (protocol: string) => {
    const colors: Record<string, string> = {
      'HTTP': 'blue',
      'HTTPS': 'green',
      'FTP': 'orange',
      'DNS': 'purple'
    };
    return colors[protocol.toUpperCase()] || 'default';
  };

  const iconMapping = {
    attacker: '/images/attack.png',
    device: '/images/device.png',
    victim: '/images/victim.png'
  };

  return (
    <div className={styles.pathWrapper}>
      <div className={styles.pathContainer}>
        <div className={styles.lineLayer}>
          <div className={styles.redLine} />
          <div className={styles.protocolInfo}>
            <Tag
              color={getProtocolColor(protocol)}
              className={styles.protocolTag}
            >
              {protocol.toUpperCase()}
            </Tag>
            <Typography.Text
              copyable
              className={styles.urlText}
            >
              {url || '-'}
            </Typography.Text>
          </div>
        </div>

        {/* 受控主机信息 */}
        <div className={styles.nodeSection}>
          <div className={styles.iconWrapper}>
            <img src={iconMapping.victim} alt="受控主机" className={styles.icon} />
          </div>
          <div>
            <Space>
              <Typography.Text type="secondary">受控主机：</Typography.Text>
              <Typography.Text copyable style={{ fontSize: '14px' }}>
                {attackerInfo.ip}
              </Typography.Text>
            </Space>
          </div>
        </div>

        {/* 中间下载按钮 */}
        <div className={styles.centerSection}>
          <Typography.Link
            className={styles.downloadLink}
            onClick={onDownloadPcap}
          >
            下载PCAP包
          </Typography.Link>
        </div>

        {/* 目的IP信息 */}
        <div className={`${styles.nodeSection} ${styles.rightAlign}`}>
          <div className={`${styles.iconWrapper} ${styles.rightAlign}`}>
            <img src={iconMapping.attacker} alt="目的IP" className={styles.icon} />
          </div>
          <div>
            <Space>
              <Typography.Text type="secondary">目的IP：</Typography.Text>
              <Typography.Text copyable style={{ fontSize: '14px' }}>
                {victimInfo.ip}
              </Typography.Text>
              {victimInfo.isForeign && (
                <Tag className={styles.foreignTag}>
                  出境流量
                </Tag>
              )}
            </Space>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExternalConnectionPathVisual; 