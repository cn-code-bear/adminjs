layui.extend({
   setter: 'lib/config'
  ,admin: 'lib/admin'
  ,view: 'lib/view'
  ,dmx: 'lib/dmx'
  ,page: 'lib/page'
}).define(['setter', 'admin','dmx','page'], function(exports){
  var setter = layui.setter
  ,element = layui.element
  ,admin = layui.admin
  ,tabsPage = admin.tabsPage
  ,view = layui.view
  //根据路由渲染页面
  ,renderPage = function(){
    var router = layui.router()
    ,path = router.path
    ,pathURL = admin.correctRouter(router.path.join('/'))
    if(!path.length) path = [''];
    //如果最后一项为空字符，则读取默认文件
    // if(path[path.length - 1] === ''){
    //   path[path.length - 1] = setter.entry;
    // }
    //重置状态
    var reset = function(type){
	  
      //renderPage.haveInit && layer.closeAll();
      if(renderPage.haveInit){
        $('.layui-layer').each(function(){
          var othis = $(this),
          index = othis.attr('times');
          if(!othis.hasClass('layui-layim')){
            //layer.close(index);
          }
        });
      }
      renderPage.haveInit = true;
      
      $(APP_BODY).scrollTop(0);
      delete tabsPage.type; //重置页面标签的来源类型
    };
    //如果路由来自于 tab 切换，则不重新请求视图
    if(tabsPage.type === 'tab'){
      //切换到非主页、或者切换到主页且主页必须有内容。方可阻止请求
      if(pathURL !== '/' || (pathURL === '/' && admin.tabsBody().html())){
        admin.tabsBodyChange(tabsPage.index);
        return reset(tabsPage.type);
      }
    }
    
    //请求视图渲染
    view().render(path.join('/')).then(function(res){
      this.container.scrollTop(0); 
      
    }).done(function(){
      $win.on('resize', layui.data.resize);
      layui.page.header();//加载标题栏	
      element.render('breadcrumb', 'breadcrumb');
      
      //容器 scroll 事件，剔除吸附层
      admin.tabsBody(tabsPage.index).on('scroll', function(){
        var othis = $(this)
        ,elemDate = $('.layui-laydate')
        ,layerOpen = $('.layui-layer')[0];

        //关闭 layDate
        if(elemDate[0]){
          elemDate.each(function(){
            var thisElemDate = $(this);
            thisElemDate.hasClass('layui-laydate-static') || thisElemDate.remove();
          });
          othis.find('input').blur();
        }
        
        //关闭 Tips 层
        layerOpen && layer.closeAll('tips');
      });
    });
    reset();
  }
  
  //入口页面
  ,entryPage = function(fn){
    var router = layui.router()
    ,container = view(setter.container)
    ,pathURL = admin.correctRouter(router.path.join('/'));
    
    //将模块根路径设置为 modules 目录
    layui.config({
      base: setter.base + 'modules/'
    });
    
    //独立页面
    if(pathURL === '/home/login'){
      container.render(router.path.join('/')).done(function(){
        admin.pageType = 'alone';
      });
    } else {
      //强制拦截未登入
      if(setter.interceptor){
        var local = layui.data(setter.tableName);
        if(!local[setter.request.token]){
          return location.hash = '/home/login'; //跳转到登入页
        }
      }
      //渲染后台结构
      if(admin.pageType === 'console') { //后台主体页
        renderPage();
      } else { //初始控制台结构
        container.render('layout').done(function(){
          renderPage();
          layui.element.render();
          if(admin.screen() < 2){
            admin.sideFlexible();
          }
          admin.pageType = 'console';
        }); 
      }
      
    }
	
  }
  ,APP_BODY = '#app_body', FILTER_TAB_TBAS = 'layadmin-layout-tabs'
  ,$ = layui.$, $win = $(window);
  //初始主体结构
  entryPage()
  
  //监听Hash改变
  window.onhashchange = function(){
    entryPage();
     //执行 {setter.MOD_NAME}.hash 下的事件
    layui.event.call(this, setter.MOD_NAME, 'hash({*})', layui.router());
  };
  //对外输出
  exports('index', {
    render: renderPage
  });
});
