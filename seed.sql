INSERT INTO projects (name, description, status, progress, "createdAt", "updatedAt") 
VALUES ('Sample Project', 'A sample project to get started', 'active', 30, NOW(), NOW());

INSERT INTO teams (name, description, "memberIds", "createdAt", "updatedAt") 
VALUES ('Development Team', 'Main development team', '[]', NOW(), NOW());

INSERT INTO tasks (title, description, status, priority, "projectId", "assigneeId", "dueDate", "estimatedHours", "actualHours", "createdAt", "updatedAt")
VALUES ('Setup project', 'Initial project setup', 'in_progress', 'high', 1, 1, NOW()::date, 0, 0, NOW(), NOW());

INSERT INTO activities (type, message, "userName", "entityId", "entityType", timestamp)
VALUES ('project_created', 'Sample Project created', 'Admin User', 1, 'project', NOW());
