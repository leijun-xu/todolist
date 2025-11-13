import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [todos, setTodos] = useState([])
  const [newTodo, setNewTodo] = useState({ creator: '', content: '' })
  const [editingTodo, setEditingTodo] = useState(null)
  const [editForm, setEditForm] = useState({ creator: '', content: '' })

  // 获取所有Todo项
  useEffect(() => {
    fetch('http://localhost:8080/api/todos')
      .then(response => response.json())
      .then(data => setTodos(data))
      .catch(error => console.error('Error fetching todos:', error))
  }, [])

  // 添加新Todo项
  const handleAddTodo = (e) => {
    e.preventDefault()
    
    fetch('http://localhost:8080/api/todos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newTodo),
    })
      .then(response => response.json())
      .then(data => {
        setTodos([...todos, data])
        setNewTodo({ creator: '', content: '' })
      })
      .catch(error => console.error('Error adding todo:', error))
  }

  // 处理编辑开始
  const handleEditStart = (todo) => {
    setEditingTodo(todo.id)
    setEditForm({ creator: todo.creator, content: todo.content })
  }

  // 处理编辑保存
  const handleEditSave = (e, todoId) => {
    e.preventDefault()
    
    fetch(`http://localhost:8080/api/todos/${todoId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(editForm),
    })
      .then(response => response.json())
      .then(data => {
        setTodos(todos.map(todo => todo.id === todoId ? data : todo))
        setEditingTodo(null)
      })
      .catch(error => console.error('Error updating todo:', error))
  }

  // 处理编辑取消
  const handleEditCancel = () => {
    setEditingTodo(null)
  }

  // 处理删除Todo项
  const handleDeleteTodo = (todoId) => {
    if (window.confirm('确定要删除这个Todo项吗？')) {
      fetch(`http://localhost:8080/api/todos/${todoId}`, {
        method: 'DELETE',
      })
        .then(() => {
          setTodos(todos.filter(todo => todo.id !== todoId))
        })
        .catch(error => console.error('Error deleting todo:', error))
    }
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
      <div className="todo-form-container">
        <form onSubmit={handleAddTodo} className="todo-form">
          <div className="form-group">
            <label htmlFor="creator">创建人:</label>
            <input
              type="text"
              id="creator"
              value={newTodo.creator}
              onChange={(e) => setNewTodo({ ...newTodo, creator: e.target.value })}
              placeholder="请输入创建人姓名"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="content">内容:</label>
            <input
              type="text"
              id="content"
              value={newTodo.content}
              onChange={(e) => setNewTodo({ ...newTodo, content: e.target.value })}
              placeholder="请输入Todo内容"
              required
            />
          </div>
          <button type="submit" className="add-btn">添加Todo</button>
        </form>
      </div>
      
      {/* Todo列表 */}
      <div className="todo-list-container">
        {todos.length === 0 ? (
          <p className="empty-message">暂无Todo项，请添加一个吧！</p>
        ) : (
          <ul className="todo-list">
            {todos.map(todo => (
              <li key={todo.id} className="todo-item">
                {editingTodo === todo.id ? (
                  // 编辑模式
                  <form onSubmit={(e) => handleEditSave(e, todo.id)} className="edit-form">
                    <div className="form-group">
                      <label htmlFor={`edit-creator-${todo.id}`}>创建人:</label>
                      <input
                        type="text"
                        id={`edit-creator-${todo.id}`}
                        value={editForm.creator}
                        onChange={(e) => setEditForm({ ...editForm, creator: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor={`edit-content-${todo.id}`}>内容:</label>
                      <input
                        type="text"
                        id={`edit-content-${todo.id}`}
                        value={editForm.content}
                        onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                        required
                      />
                    </div>
                    <div className="edit-buttons">
                      <button type="submit" className="save-btn">保存</button>
                      <button type="button" onClick={handleEditCancel} className="cancel-btn">取消</button>
                    </div>
                  </form>
                ) : (
                  // 查看模式
                  <div className="todo-item-content">
                    <div className="todo-header">
                      <span className="todo-creator">{todo.creator}</span>
                      <span className="todo-date">{formatDate(todo.createdAt)}</span>
                    </div>
                    <p className="todo-text">{todo.content}</p>
                    <div className="todo-actions">
                      <button onClick={() => handleEditStart(todo)} className="edit-btn">编辑</button>
                      <button onClick={() => handleDeleteTodo(todo.id)} className="delete-btn">删除</button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default App
