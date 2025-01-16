import React, { useState } from 'react';
import { Card, Table, Button, Space, Form, Modal, Popconfirm, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { TableColumnsType } from 'antd';
import { useNavigate } from 'react-router-dom';
import LabelInput from '@/components/LabelInput';
import LabelTextArea from '@/components/LabelTextArea';

interface AssetGroup {
  id: string;
  name: string;
  createTime: string;
  remark?: string;
}

const AssetManagement: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingGroup, setEditingGroup] = useState<AssetGroup | null>(null);

  // 模拟数据
  const data: AssetGroup[] = [
    {
      id: '1',
      name: '核心业务资产组',
      createTime: '2023-12-17 10:00:00',
      remark: '包含所有核心业务系统资产'
    },
    {
      id: '2',
      name: '测试环境资产组',
      createTime: '2023-12-17 11:00:00',
      remark: '测试环境资产'
    }
  ];

  const showModal = (group?: AssetGroup) => {
    setEditingGroup(group || null);
    if (group) {
      form.setFieldsValue(group);
    }
    setIsModalVisible(true);
  };

  const handleOk = () => {
    form.validateFields().then((values) => {
      console.log('提交数据：', values);
      form.resetFields();
      setIsModalVisible(false);
      setEditingGroup(null);
      message.success(editingGroup ? '编辑成功' : '创建成功');
    });
  };

  const handleCancel = () => {
    form.resetFields();
    setIsModalVisible(false);
    setEditingGroup(null);
  };

  const handleDelete = (record: AssetGroup) => {
    console.log('删除资产组：', record);
    message.success('删除成功');
  };

  const columns: TableColumnsType<AssetGroup> = [
    {
      title: '资产组名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      ellipsis: true,
    },
    {
      title: '操作',
      key: 'action',
      width: 260,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            onClick={() => navigate(`/asset-management/${record.id}`)}
          >
            查看资产
          </Button>
          <Button
            type="link"
            onClick={() => showModal(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个资产组吗?"
            onConfirm={() => handleDelete(record)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <Space
        style={{
          marginBottom: 16,
          width: '100%',
          justifyContent: 'flex-end'
        }}
      >
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => showModal()}
        >
          创建资产组
        </Button>
      </Space>

      <Table
        columns={columns}
        dataSource={data}
        pagination={{
          total: data.length,
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条记录`,
        }}
      />

      <Modal
        title={editingGroup ? "编辑资产组" : "创建资产组"}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="确定"
        cancelText="取消"
        className="asset-group-modal"
        centered
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="name"
            rules={[{ required: true, message: '请输入资产组名称' }]}
          >
            <LabelInput
              label="资产组名称"
              required
              placeholder="请输入资产组名称"
            />
          </Form.Item>

          <Form.Item
            name="remark"
          >
            <LabelTextArea
              label="备注"
              placeholder="请输入备注"
              rows={4}
            />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default AssetManagement;
