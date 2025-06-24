import React, { useState } from 'react';
import { Card, Row, Col, Button, Tag, Typography } from 'antd';
import ReactECharts from 'echarts-for-react';
import styles from './style.module.less';

// 新的类型定义
interface TopData {
  name: string;
  count: number;
}

interface OutboundTrendCardProps {
  destinationIpTop5: TopData[];
  outboundDestinationTop5: TopData[];
  sourceIpTop5: TopData[];
}

const CHART_COLORS = {
  blue: '#1890ff'
};

// 折叠状态下的TOP N列表
const CollapsedTopList: React.FC<{
  title: string;
  data: TopData[];
  displayCount: number;
}> = ({ title, data, displayCount }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flex: 1, minWidth: 0 }}>
    <span style={{ fontWeight: 500, fontSize: '14px', color: '#000000', flexShrink: 0 }}>{title}</span>
    <div style={{ display: 'flex', justifyContent: 'space-between', minWidth: 0, flex: 1, gap: '16px' }}>
      {data.slice(0, displayCount).map((item, index) => (
        <div key={`${item.name}-${index}`}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1, overflow: 'hidden' }}>
          <div style={{
            width: '18px',
            height: '18px',
            borderRadius: '50%',
            background: '#e6f7ff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: CHART_COLORS.blue,
            fontSize: '12px',
            flexShrink: 0
          }}>
            {index + 1}
          </div>
          <Typography.Text className={styles['type-text']} title={item.name} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</Typography.Text>
          <Tag style={{
            marginLeft: '2px',
            border: '1px solid',
            background: 'rgba(24, 144, 255, 0.1)',
            color: CHART_COLORS.blue,
            borderColor: 'rgba(24, 144, 255, 0.2)',
            flexShrink: 0
          }}>{item.count}</Tag>
        </div>
      ))}
    </div>
  </div>
);

// 展开状态下的TOP 5图表（1:1还原ExternalTrendCard样式，仅保留一个）
const Top5Chart: React.FC<{
  title: string;
  data: TopData[];
}> = ({ title, data }) => {
  const option = {
    grid: {
      left: '48px',
      right: '20px',
      top: '30px',
      bottom: '40px'
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        // params为数组
        if (Array.isArray(params) && params.length > 0) {
          return `${params[0].axisValueLabel}：${params[0].data}次`;
        }
        return '';
      }
    },
    xAxis: {
      type: 'category',
      data: data.map(item => item.name),
      axisLabel: {
        interval: 0,
        rotate: 0
      }
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 1000,
      interval: 200
    },
    series: [
      {
        type: 'bar',
        data: data.map(item => item.count),
        itemStyle: {
          color: '#1890ff'
        },
        barWidth: '20%'
      }
    ]
  };

  return (
    <>
      <div style={{ marginBottom: '8px' }}>
        <span style={{ fontWeight: 500, fontSize: '14px', color: '#000000' }}>{title}</span>
      </div>
      <ReactECharts
        option={option}
        style={{ height: '200px' }}
        opts={{ renderer: 'svg' }}
      />
    </>
  );
};

// 饼图蓝色阶梯色盘
const pieBlueColors = [
  '#1890ff', '#40a9ff', '#69c0ff', '#91d5ff', '#bae7ff',
  '#0050b3', '#096dd9', '#1d39c4', '#2f54eb', '#597ef7'
];

// 饼图组件（美化为Dashboard同款）
const Top10PieChart: React.FC<{
  title: string;
  data: TopData[];
}> = ({ title, data }) => {
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      type: 'plain',
      orient: 'vertical',
      right: '20%',
      top: '20%',
      itemWidth: 12,
      itemHeight: 12,
      itemGap: 16,
      textStyle: {
        fontSize: 14,
        color: '#333',
        fontWeight: 500
      },
      width: '40%',
      align: 'left',
      padding: [0, 0, 0, 0],
      layout: 'vertical',
      columns: 2,
      itemStyle: {
        margin: '0 30px'
      }
    },
    series: [{
      name: title,
      type: 'pie',
      radius: ['45%', '75%'],
      center: ['30%', '55%'],
      avoidLabelOverlap: true,
      itemStyle: {
        borderRadius: 4,
        borderColor: '#fff',
        borderWidth: 2
      },
      color: pieBlueColors,
      label: { show: false },
      emphasis: {
        label: {
          show: true,
          formatter: '{b}: {d}%',
          fontSize: 12
        },
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.2)'
        }
      },
      data: data.map(item => ({ value: item.count, name: item.name }))
    }]
  };
  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <span style={{ fontWeight: 500, fontSize: '14px', color: '#000000' }}>{title}</span>
      </div>
      <div style={{ marginTop: '16px', position: 'relative', height: '200px' }}>
        <div style={{ position: 'relative', top: '-20px', height: '200px' }}>
          <ReactECharts option={option} style={{ height: '200px' }} opts={{ renderer: 'svg' }} />
        </div>
      </div>
    </div>
  );
};

// 主组件
const OutboundTrendCard: React.FC<OutboundTrendCardProps> = ({
  destinationIpTop5,
  outboundDestinationTop5,
  sourceIpTop5,
}) => {
  const [isChartsExpanded, setIsChartsExpanded] = useState(false);
  // 假设有 outboundDestinationTop10，如果没有就用 outboundDestinationTop5 代替
  const outboundDestinationTop10 = outboundDestinationTop5.length > 5 ? outboundDestinationTop5.slice(0, 10) : outboundDestinationTop5;

  return (
    <div style={{ position: 'relative', marginBottom: '24px' }}>
      <Card
        style={{ marginBottom: isChartsExpanded ? '24px' : '0' }}
        bodyStyle={isChartsExpanded ? { paddingBottom: '0px' } : {}}
      >
        {isChartsExpanded ? (
          <Row gutter={24}>
            <Col span={8}>
              <Top5Chart title="目的IP TOP5" data={destinationIpTop5} />
            </Col>
            <Col span={8}>
              <Top5Chart title="源IP TOP5" data={sourceIpTop5} />
            </Col>
            <Col span={8}>
              <Top10PieChart title="出境地区 TOP5" data={outboundDestinationTop10} />
              <div style={{ position: 'absolute', right: 12, top: -4, zIndex: 1 }}>
                <Button type="link" onClick={() => setIsChartsExpanded(false)} style={{ padding: '4px 0' }}>收起图表</Button>
              </div>
            </Col>
          </Row>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-around', gap: '24px' }}>
              <CollapsedTopList title="目的IP TOP" data={destinationIpTop5} displayCount={2} />
              <div style={{ width: '1px', height: '20px', background: '#f0f0f0', flexShrink: 0 }} />
              <CollapsedTopList title="源IP TOP" data={sourceIpTop5} displayCount={2} />
              <div style={{ width: '1px', height: '20px', background: '#f0f0f0', flexShrink: 0 }} />
              <CollapsedTopList title="出境地区TOP" data={outboundDestinationTop5} displayCount={2} />
            </div>
            <Button type="link" onClick={() => setIsChartsExpanded(true)} style={{ padding: '4px 0', marginLeft: '16px' }}>展开图表</Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default OutboundTrendCard; 