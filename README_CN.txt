REALS 独立站 V1（静态可部署版）

一、已完成页面
1. index.html              首页
2. products.html           产品中心
3. manufacturing.html      制造能力
4. quality.html            质量与认证
5. contact.html            询价与样品申请

二、已使用资料
- REALS 品牌视觉与域名方向
- IATF 16949、ISO 9001、ISO 14001证书
- LY6512、LY6524、LY6525、LY6531、LY6632规格书
- 天津蓝宇纵横企业简介中的工厂、设备、仓库及检测照片

三、网站特点
- 深色汽车工业科技风，环保绿色作为点缀
- 横向文字与竖排文字组合
- 响应式桌面、平板和手机布局
- 产品参数页、证书下载、TDS下载
- 面向线束厂、代理商、Tier 1 / Tier 2客户
- 市场重点：墨西哥、东南亚、中亚

四、本地查看方法
直接双击 index.html 即可查看。
若浏览器对本地文件有限制，可在网站目录运行：
python -m http.server 8000
然后浏览器访问 http://localhost:8000

五、正式上线前需要确认
1. sales@realsauto.com 邮箱是否已经开通。
2. REALS正式英文法律主体名称及与天津蓝宇纵横的关系表述。
3. 联系电话、WhatsApp、对外地址。
4. LY6512具体温度等级，不建议将多个温度值当作连续工作范围。
5. MOQ、样品政策、交期、定制范围。
6. 是否公开完整证书和中文规格书。
7. 西班牙语与俄语正式翻译。

六、表单说明
当前联系表单为静态演示版，提交后会打开客户电脑的邮件软件，并生成发往 sales@realsauto.com 的邮件。
正式上线时应接入：企业邮箱SMTP、Formspree、HubSpot、Zoho CRM或服务器端表单接口，并增加垃圾邮件防护。

七、部署方式
该网站可部署至：
- Cloudflare Pages
- Netlify
- Vercel
- 阿里云/腾讯云海外主机
- WordPress主题二次开发

把整个目录上传到网站根目录即可。首页文件必须保持名称 index.html。
