Set shell = CreateObject("WScript.Shell")
shell.Run "cmd /k ""cd /d C:\Users\Dell\Desktop\zibendao && git add -A && git commit -m ""feat: T01 利润表全面重构 - 产品单价表/完整成本结构/税率多国/100%%分配横条/讲解功能/持久化"" && git push""", 1, False
