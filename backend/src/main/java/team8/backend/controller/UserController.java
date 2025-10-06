package team8.backend.controller;

import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    @GetMapping
    public List<Object> getAllUsers() {
        return List.of();
    }

    @GetMapping("/{id}")
    public Object getUser(@PathVariable Long id) {
        return null;
    }

    @PostMapping
    public Object createUser(@RequestBody Object user) {
        return null;
    }

    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable Long id) {
        return;
    }
}