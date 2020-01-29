---
title: nginx 基础入门
date: 2020-01-11 08:16:14
tags: nginx
---

 nginx 基础：静态服务器，反向代理，负载均衡，虚拟主机，FastCGI

> [十分钟入门Nginx基本功能](https://cloud.tencent.com/developer/article/1442657) 

<!-- more -->

### 静态服务器
nginx 是一个HTTP服务器
配置：
```nginx
server {
  listen 80 # 端口号
  location / {
    root /var/www/nginx/html; # 静态文件路径
  }
}
```

### 反向代理
```
server {
  listen 80;
  location / {
    proxy_pass http://0.0.0.0:3000;  # 服务器IP地址: 端口号
  } 
}
```

### 负载均衡
基于反向代理实现，相同应用部署在多台服务器上，进行流量分流：
```
upstream myapp {
  server 119.23.34.1:8080 #应用服务器1
  server 119.23.34.2:8080 #应用服务器2
}
server {
  listen 80;
  location / {
    proxy_pass http://myapp;
  }
}
```
###  虚拟主机
基于反向代理实现，将多个网站部署在同一台服务器上。
```
server {
  listen 80 default_server;
  server_name _;
  return 444;   # 过滤其他域名的请求，返回 444 状态码
}

server {
  listen 80;
  server_name www.aaa.com;  # www.aaa.com 域名
  location  / {
    proxy_pass http://localhost:8080 #对应的端口号 8080
  }
}

server {
  listen 80;
  server_name www.bbb.com;  # www.bbb.com 域名
  location / {
    proxy_pass  http://localhost：8001  #对应的端口号 8081
  }
}

```

### FastCGI
Nginx本身不支持PHP等语言，但是它可以通过FastCGI来将请求扔给某些语言或框架处理（例如PHP、Python、Perl）。
```
server {
  listen 80;
  location ~ \.php$ {
    include fasetcgi_params;
    fastcgi_param SCRIPT_FILENAME /PHP文件目录地址$fastcgi_script_name; # PHP文件路劲
    fastcgi_pass 127.0.0.1:9000; # PHP-FPM地址和端口
    # 另一种方式：fastcgi_pass unix: /var/run/php5-fpm.sock;
  }
}
```
