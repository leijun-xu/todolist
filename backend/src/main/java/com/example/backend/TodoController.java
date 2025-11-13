package com.example.backend;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/todos")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"}) // 允许前端React应用访问
public class TodoController {
    
    @Autowired
    private TodoRepository todoRepository;
    
    // 获取所有Todo项
    @GetMapping
    public ResponseEntity<List<Todo>> getAllTodos() {
        List<Todo> todos = todoRepository.findAll();
        return new ResponseEntity<>(todos, HttpStatus.OK);
    }
    
    // 根据ID获取单个Todo项
    @GetMapping("/{id}")
    public ResponseEntity<Todo> getTodoById(@PathVariable Long id) {
        Optional<Todo> todo = todoRepository.findById(id);
        return todo.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
    
    // 创建新的Todo项
    @PostMapping
    public ResponseEntity<Todo> createTodo(@Valid @RequestBody Todo todo) {
        Todo createdTodo = todoRepository.save(todo);
        return new ResponseEntity<>(createdTodo, HttpStatus.CREATED);
    }
    
    // 更新Todo项
    @PutMapping("/{id}")
    public ResponseEntity<Todo> updateTodo(@PathVariable Long id, @Valid @RequestBody Todo todoDetails) {
        Optional<Todo> optionalTodo = todoRepository.findById(id);
        
        if (optionalTodo.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Todo todo = optionalTodo.get();
        todo.setCreator(todoDetails.getCreator());
        todo.setContent(todoDetails.getContent());
        
        Todo updatedTodo = todoRepository.save(todo);
        return ResponseEntity.ok(updatedTodo);
    }
    
    // 删除Todo项
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTodo(@PathVariable Long id) {
        Optional<Todo> optionalTodo = todoRepository.findById(id);
        
        if (optionalTodo.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        todoRepository.delete(optionalTodo.get());
        return ResponseEntity.noContent().build();
    }
}