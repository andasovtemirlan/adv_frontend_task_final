# Page snapshot

```yaml
- generic [ref=e4]:
  - generic [ref=e5]:
    - heading "Project Manager" [level=1] [ref=e6]
    - paragraph [ref=e7]: Manage your projects efficiently
  - tablist "login register tabs" [ref=e10]:
    - tab "Login" [selected] [ref=e11] [cursor=pointer]
    - tab "Register" [ref=e12] [cursor=pointer]
  - tabpanel "Login" [ref=e15]:
    - generic [ref=e16]:
      - alert [ref=e17]:
        - img [ref=e19]
        - generic [ref=e21]: Invalid email or password
      - generic [ref=e22]:
        - generic [ref=e23]:
          - generic [ref=e24]: Email
          - generic [ref=e25]:
            - textbox "Email" [ref=e26]: admin@example.com
            - group:
              - generic: Email
        - generic [ref=e27]:
          - generic [ref=e28]: Password
          - generic [ref=e29]:
            - textbox "Password" [ref=e30]: admin123
            - group:
              - generic: Password
        - button "Login" [ref=e31] [cursor=pointer]: Login
      - paragraph [ref=e33]: "Demo: admin@example.com / admin123"
```