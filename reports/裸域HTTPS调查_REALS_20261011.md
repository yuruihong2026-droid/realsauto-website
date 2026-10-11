# REALS 裸域 HTTPS 调查（2026-10-11）

## 结论

裸域 DNS 已正确指向 GitHub Pages，但 GitHub Pages 当前下发给
`realsauto.com` 的是通用 `*.github.io` 证书；为 `www.realsauto.com`
签发的证书只包含 `www.realsauto.com`，没有包含裸域。因此裸域在 HTTP
层能够 301 到 `https://www.realsauto.com/`，但 HTTPS 会在读取 301 之前
先因主机名不匹配失败。

仓库本身不应把 `CNAME` 从 `www.realsauto.com` 改成裸域，否则会改变当前
首选域和重定向方向。当前环境没有 `gh` CLI，也没有 GitHub 写入凭据，无法
触发 Pages 重新检查域名和重新签发证书。

## 证据

- `CNAME`：`www.realsauto.com`
- 裸域 A：`185.199.108.153`、`185.199.109.153`、`185.199.110.153`、
  `185.199.111.153`（GitHub Pages 官方地址组）
- `www` CNAME：`yuruihong2026-droid.github.io.`
- 裸域 HTTPS 当前证书：`CN=*.github.io`，SAN 不含 `realsauto.com`
- `www` HTTPS 当前证书：`CN=www.realsauto.com`，SAN 只有
  `www.realsauto.com`
- `curl -I http://realsauto.com/`：301 到 `https://www.realsauto.com/`
- `curl -I https://realsauto.com/`：curl 60，证书主机名不匹配
- `curl -I https://www.realsauto.com/`：HTTP 200

## 红哥操作步骤（GitHub 网页，预计操作 5 分钟；签发需等待）

1. 登录 GitHub，打开 `yuruihong2026-droid/realsauto-website`。
2. 点击 **Settings** → 左侧 **Pages**。
3. 在 **Custom domain** 确认当前值为 `www.realsauto.com`。
4. 先截图记录 **Enforce HTTPS** 状态；点击 Custom domain 旁的
   **Remove**。这一步会短暂影响自定义域访问，建议在低流量时操作。
5. 立即重新输入 `www.realsauto.com`，点击 **Save**。
6. 等待页面显示 **DNS check successful**。不要修改仓库 `CNAME`，也不要
   删除阿里云现有的 4 条裸域 A 记录或 `www` CNAME。
7. 等 GitHub 显示证书已签发后，勾选 **Enforce HTTPS**。证书签发通常不是
   即时完成；若按钮灰色，稍后刷新 Pages 页面。
8. 在终端执行：

   ```bash
   curl -I -L https://realsauto.com/
   echo | openssl s_client -connect realsauto.com:443 -servername realsauto.com 2>/dev/null \
     | openssl x509 -noout -text | sed -n '/Subject Alternative Name/{n;p;}'
   ```

   验收标准：证书 SAN 包含 `realsauto.com`；curl 不再报 60，并出现一次
   301 到 `https://www.realsauto.com/`，随后 200。

如果重新签发后证书仍只含 `www.realsauto.com`，在同一 Pages 页面先把
Custom domain 保存为 `realsauto.com`，等 DNS check successful 和证书签发，
再改回 `www.realsauto.com` 触发第二次签发；若仍失败，应向 GitHub Support
提交仓库名、两个域名及上述证书 SAN 输出。
