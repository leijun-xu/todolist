import { useState, useEffect } from 'react'
import { Form, Input, Button, List, Card, Space, message, Modal } from 'antd'
import { EditOutlined, DeleteOutlined, CheckOutlined } from '@ant-design/icons'
import './App.css'
import 'antd/dist/reset.css'

function App() {
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

  // 添加新Todo项
  const handleAddTodo = (values) => {
    fetch('http://localhost:8080/api/todos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(values),
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
    editForm.setFieldsValue(todo)
    setIsModalVisible(true)
  }

  // 处理编辑保存
  const handleEditSave = (values) => {
    if (!editingTodo) return

    fetch(`http://localhost:8080/api/todos/${editingTodo.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(values),
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
    <div className="app-container">
      <h1>Todo List</h1>
      
      {/* 添加Todo表单 */}
      <Card className="add-todo-card">
        <Form
          form={form}
          onFinish={handleAddTodo}
          layout="horizontal"
          initialValues={{ creator: '', content: '' }}
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
          
          <Form.Item>
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
          <List
            grid={{ gutter: 16, column: 1 }}
            dataSource={todos}
            renderItem={(todo) => (
              <List.Item>
                <Card
                  title={
                    <div className="todo-card-header">
                      <span className="todo-creator">{todo.creator}</span>
                      <span className="todo-date">{formatDate(todo.createdAt)}</span>
                    </div>
                  }
                  actions={[
                    <Button
                      icon={<EditOutlined />}
                      onClick={() => handleEditStart(todo)}
                      type="default"
                    >
                      编辑
                    </Button>,
                    <Button
                      icon={<DeleteOutlined />}
                      onClick={() => handleDeleteTodo(todo.id)}
                      type="default"
                      danger
                    >
                      删除
                    </Button>,
                  ]}
                >
                  <p className="todo-content">{todo.content}</p>
                </Card>
              </List.Item>
            )}
          />
        )}
      </div>
      
      {/* 编辑Todo模态框 */}
      <Modal
        title="编辑Todo"
        visible={isModalVisible}
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
        </Form>
      </Modal>
    </div>
  )
}

export default App
