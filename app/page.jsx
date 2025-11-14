'use client'

import { useState, useEffect } from 'react'
import dayjs from 'dayjs'
import { Form, Input, Button, Table, Card, Space, message, Modal, DatePicker, notification } from 'antd'
import { EditOutlined, DeleteOutlined } from '@ant-design/icons'

function Home() {
  const [todos, setTodos] = useState([])
  const [form] = Form.useForm()
  const [editForm] = Form.useForm()
  const [editingTodo, setEditingTodo] = useState(null)
  const [isModalVisible, setIsModalVisible] = useState(false)

  // 获取所有Todo项
  useEffect(() => {
    fetch('http://localhost:8080/api/todos')
      .then(response => response.json())
      .then(data => setTodos(data))
      .catch(error => {
        console.error('Error fetching todos:', error)
        message.error('获取Todo列表失败')
      })
  }, [])
  
  // 检查通知时间并推送通知
  useEffect(() => {
    const checkNotifications = () => {
      const now = new Date();
      
      todos.forEach(todo => {
        if (todo.notificationTime) {
          const notificationTime = new Date(todo.notificationTime);
          // 检查是否在当前时间前后1分钟内
          const diff = Math.abs(now - notificationTime);
          const oneMinute = 60 * 1000;
          
          if (diff < oneMinute && !todo.notified) {
            // 推送通知
            notification.open({
              message: `Todo提醒: ${todo.creator}`,
              description: todo.content,
              placement: 'topRight',
              duration: 5,
            });
            
            // 标记为已通知
            setTodos(prevTodos => prevTodos.map(item => {
              if (item.id === todo.id) {
                return {...item, notified: true};
              }
              return item;
            }));
          }
        }
      });
    };
    
    // 每分钟检查一次
    const interval = setInterval(checkNotifications, 60 * 1000);
    
    // 组件卸载时清除定时器
    return () => clearInterval(interval);
  }, [todos])

  // 添加新Todo项
  const handleAddTodo = (values) => {
    // 格式化通知时间为ISO格式
    const todoData = {
      ...values,
      notificationTime: values.notificationTime ? values.notificationTime.format('YYYY-MM-DDTHH:mm:ss.SSS[Z]') : null
    };
    
    fetch('http://localhost:8080/api/todos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(todoData),
    })
      .then(response => response.json())
      .then(data => {
        setTodos([...todos, data])
        form.resetFields()
        message.success('添加Todo成功')
      })
      .catch(error => {
        console.error('Error adding todo:', error)
        message.error('添加Todo失败')
      })
  }

  // 处理编辑开始
  const handleEditStart = (todo) => {
    setEditingTodo(todo)
    // 将字符串格式的通知时间转换为dayjs对象
    const formValues = {
      ...todo,
      notificationTime: todo.notificationTime ? dayjs(todo.notificationTime) : null
    }
    editForm.setFieldsValue(formValues)
    setIsModalVisible(true)
  }

  // 处理编辑保存
  const handleEditSave = (values) => {
    if (!editingTodo) return

    // 格式化通知时间为ISO格式
    const todoData = {
      ...values,
      notificationTime: values.notificationTime ? values.notificationTime.format('YYYY-MM-DDTHH:mm:ss.SSS[Z]') : null
    };

    fetch(`http://localhost:8080/api/todos/${editingTodo.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(todoData),
    })
      .then(response => response.json())
      .then(data => {
        setTodos(todos.map(todo => todo.id === data.id ? data : todo))
        setIsModalVisible(false)
        setEditingTodo(null)
        message.success('更新Todo成功')
      })
      .catch(error => {
        console.error('Error updating todo:', error)
        message.error('更新Todo失败')
      })
  }

  // 处理编辑取消
  const handleEditCancel = () => {
    setIsModalVisible(false)
    setEditingTodo(null)
  }

  // 处理删除Todo项
  const handleDeleteTodo = (todoId) => {
    Modal.confirm({
      title: '确定要删除这个Todo项吗？',
      content: '删除后将无法恢复',
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk() {
        fetch(`http://localhost:8080/api/todos/${todoId}`, {
          method: 'DELETE',
        })
          .then(() => {
            setTodos(prevTodos => prevTodos.filter(todo => todo.id !== todoId))
            message.success('删除Todo成功')
          })
          .catch(error => {
            console.error('Error deleting todo:', error)
            message.error('删除Todo失败')
          })
      },
    })
  }

  // 格式化日期显示
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  return (
    <div className="app-container p-4">
      <h1 className="text-2xl font-bold mb-4">Todo List</h1>
      
      {/* 添加Todo表单 */}
      <Card className="add-todo-card mb-4">
        <Form
          form={form}
          onFinish={handleAddTodo}
          layout="horizontal"
          initialValues={{ creator: '', content: '' }}
          style={{ display: 'flex', alignItems: 'flex-start' }}
        >
          <Form.Item
            name="creator"
            label="创建人"
            rules={[{ required: true, message: '请输入创建人姓名' }]}
            style={{ flex: 1, marginRight: 16 }}
          >
            <Input placeholder="请输入创建人姓名" />
          </Form.Item>
          
          <Form.Item
            name="content"
            label="内容"
            rules={[{ required: true, message: '请输入Todo内容' }]}
            style={{ flex: 2, marginRight: 16 }}
          >
            <Input placeholder="请输入Todo内容" />
          </Form.Item>
          
          <Form.Item
            name="notificationTime"
            label="通知时间"
            rules={[{ required: true, message: '请选择通知时间' }]}
            style={{ flex: 1, marginRight: 16 }}
          >
            <DatePicker showTime format="YYYY-MM-DD HH:mm" style={{ width: '100%' }} />
          </Form.Item>
          
          <Form.Item style={{ marginRight: 0 }}>
            <Button type="primary" htmlType="submit">
              添加Todo
            </Button>
          </Form.Item>
        </Form>
      </Card>
      
      {/* Todo列表 */}
      <div className="todo-list-container">
        {todos.length === 0 ? (
          <p className="empty-message">暂无Todo项，请添加一个吧！</p>
        ) : (
          <Table
            dataSource={todos}
            columns={[
              {
                title: '创建人',
                dataIndex: 'creator',
                key: 'creator',
              },
              {
                title: '内容',
                dataIndex: 'content',
                key: 'content',
                ellipsis: true,
              },
              {
                title: '创建时间',
                dataIndex: 'createdAt',
                key: 'createdAt',
                render: (text) => formatDate(text),
              },
              {
                title: '通知时间',
                dataIndex: 'notificationTime',
                key: 'notificationTime',
                render: (text) => formatDate(text),
              },
              {
                title: '操作',
                key: 'action',
                render: (_, todo) => (
                  <Space size="middle">
                    <Button
                      icon={<EditOutlined />}
                      onClick={() => handleEditStart(todo)}
                      type="default"
                    >
                      编辑
                    </Button>
                    <Button
                      icon={<DeleteOutlined />}
                      onClick={() => handleDeleteTodo(todo.id)}
                      type="default"
                      danger
                    >
                      删除
                    </Button>
                  </Space>
                ),
              },
            ]}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            style={{ width: '100%' }}
          />
        )}
      </div>
      
      {/* 编辑Todo模态框 */}
      <Modal
        title="编辑Todo"
        open={isModalVisible}
        onOk={editForm.submit}
        onCancel={handleEditCancel}
        okText="保存"
        cancelText="取消"
      >
        <Form
          form={editForm}
          onFinish={handleEditSave}
          layout="vertical"
        >
          <Form.Item
            name="creator"
            label="创建人"
            rules={[{ required: true, message: '请输入创建人姓名' }]}
          >
            <Input placeholder="请输入创建人姓名" />
          </Form.Item>
          <Form.Item
            name="content"
            label="内容"
            rules={[{ required: true, message: '请输入Todo内容' }]}
          >
            <Input placeholder="请输入Todo内容" />
          </Form.Item>
          <Form.Item
            name="notificationTime"
            label="通知时间"
            rules={[{ required: true, message: '请选择通知时间' }]}
          >
            <DatePicker showTime format="YYYY-MM-DD HH:mm" style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Home