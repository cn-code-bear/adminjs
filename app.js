if (window.ActiveXObject || "ActiveXObject" in window){
		   alert('IE浏览器存在安全和性能问题，推荐使用：Chrome/Firefox/Edge 等高级浏览器,如有疑问请联系系统开发者');
	         }
  layui.config({
    base: 'admin/'
    ,version: '1.0.0'
  }).use('index');
