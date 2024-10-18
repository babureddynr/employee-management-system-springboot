// src/main/java/com/example/employeemgt/repository/EmployeeRepository.java
package com.example.employeemgt.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.employeemgt.model.Employee;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {
}