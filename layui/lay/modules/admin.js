layui.define('view', function(exports){
  var $ = layui.jquery
  ,laytpl = layui.laytpl
  ,element = layui.element
  ,setter = layui.setter
  ,view = layui.view
  ,device = layui.device()
  
  ,$win = $(window), $body = $('body')
  ,container = $('#'+ setter.container)
  
  ,SHOW = 'layui-show', HIDE = 'layui-hide', THIS = 'layui-this', DISABLED = 'layui-disabled', TEMP = 'template'
  ,APP_BODY = '#LAY_app_body', APP_FLEXIBLE = 'LAY_app_flexible'
  ,FILTER_TAB_TBAS = 'layadmin-layout-tabs'
  ,APP_SPREAD_SM = 'layadmin-side-spread-sm', TABS_BODY = 'layadmin-tabsbody-item'
  ,ICON_SHRINK = 'layui-icon-shrink-right', ICON_SPREAD = 'layui-icon-spread-left'
  ,SIDE_SHRINK = 'layadmin-side-shrink', SIDE_MENU = 'LAY-system-side-menu'

  //通用方法
  ,admin = {
    v: 'dmx pro'
    ,req: view.req
    ,exit: view.exit
    //xss 转义
    ,escape: function(html){
      return String(html || '').replace(/&(?!#?[a-zA-Z0-9]+;)/g, '&amp;')
      .replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/'/g, '&#39;').replace(/"/g, '&quot;');
    }
    
    //事件监听
    ,on: function(events, callback){
      return layui.onevent.call(this, setter.MOD_NAME, events, callback);
    }
    
    //弹出面板
    ,popup: view.popup
    
    //右侧面板
    ,popupRight: function(options){
      //layer.close(admin.popup.index);
      return admin.popup.index = layer.open($.extend({
        type: 1
        ,id: 'LAY_adminPopupR'
        ,anim: -1
        ,title: false
        ,closeBtn: false
        ,offset: 'r'
        ,shade: 0.1
        ,shadeClose: true
        ,skin: 'layui-anim layui-anim-rl layui-layer-adminRight'
        ,area: '300px'
      }, options));
    }
    
    
    //屏幕类型
    ,screen: function(){
      var width = $win.width();
      if(width > 1200){
        return 3; //大屏幕
      } else if(width > 992){
        return 2; //中屏幕
      } else if(width > 768){
        return 1; //小屏幕
      } else {
        return 0; //超小屏幕
      }
    }
    
    //侧边伸缩
    ,sideFlexible: function(status){
      var app = container
      ,iconElem =  $('#'+ APP_FLEXIBLE)
      ,screen = admin.screen();

      //设置状态，PC：默认展开、移动：默认收缩
      if(status === 'spread'){
        //切换到展开状态的 icon，箭头：←
        iconElem.removeClass(ICON_SPREAD).addClass(ICON_SHRINK);
        
        //移动：从左到右位移；PC：清除多余选择器恢复默认
        if(screen < 2){
          app.addClass(APP_SPREAD_SM);
        } else {
          app.removeClass(APP_SPREAD_SM);
        }
        
        app.removeClass(SIDE_SHRINK)
      } else {
        //切换到搜索状态的 icon，箭头：→
        iconElem.removeClass(ICON_SHRINK).addClass(ICON_SPREAD);

        //移动：清除多余选择器恢复默认；PC：从右往左收缩
        if(screen < 2){
          app.removeClass(SIDE_SHRINK);
        } else {
          app.addClass(SIDE_SHRINK);
        }
        
        app.removeClass(APP_SPREAD_SM)
      }
      
      layui.event.call(this, setter.MOD_NAME, 'side({*})', {
        status: status
      });
    }
    
    //重置主体区域表格尺寸
    ,resizeTable: function(delay){
      var that = this, runResizeTable = function(){
        that.tabsBody(admin.tabsPage.index).find('.layui-table-view').each(function(){
          var tableID = $(this).attr('lay-id');
          layui.table.resize(tableID);
        });
      };
      if(!layui.table) return;
      delay ? setTimeout(runResizeTable, delay) : runResizeTable();
    }
    // 数组转url
    ,dataUrl: function(obj){
    var str = '';
    for(var i in obj){
        if(typeof(obj[i]) === 'object'){
            for(var s in obj[i]){
                str = str + i+'['+ s + ']' + '=' + obj[i][s] + '&';
            }
        }else{
            str = str + i + '=' + obj[i] + '&';
        }
    }
    return encodeURI(str);	
    }
    //记录最近一次点击的页面标签数据
    ,tabsPage: {}
    
    //获取标签页的头元素
    ,tabsHeader: function(index){
      return $('#LAY_app_tabsheader').children('li').eq(index || 0);
    }
    
    //获取页面标签主体元素
    ,tabsBody: function(index){
      return $(APP_BODY).find('.'+ TABS_BODY).eq(index || 0);
    }
    
    //切换页面标签主体
    ,tabsBodyChange: function(index){
      admin.tabsHeader(index).attr('lay-attr', layui.router().href);
      admin.tabsBody(index).addClass(SHOW).siblings().removeClass(SHOW);
      //events.rollPage('auto', index);
    }
    
    //resize事件管理
    ,resize: function(fn){
      var router = layui.router()
      ,key = router.path.join('-');
      
      if(admin.resizeFn[key]){
        $win.off('resize', admin.resizeFn[key]);
        delete admin.resizeFn[key];
      }
      
      if(fn === 'off') return; //如果是清除 resize 事件，则终止往下执行
      
      fn(), admin.resizeFn[key] = fn;
      $win.on('resize', admin.resizeFn[key]);
    }
    ,resizeFn: {}
    ,runResize: function(){
      var router = layui.router()
      ,key = router.path.join('-');
      admin.resizeFn[key] && admin.resizeFn[key]();
    }
    ,delResize: function(){
      this.resize('off');
    }
    
    //关闭当前 pageTabs
    ,closeThisTabs: function(){
      if(!admin.tabsPage.index) return;
      $(TABS_HEADER).eq(admin.tabsPage.index).find('.layui-tab-close').trigger('click');
    }
    
    //全屏
    ,fullScreen: function(){
      var ele = document.documentElement
      ,reqFullScreen = ele.requestFullScreen || ele.webkitRequestFullScreen 
      || ele.mozRequestFullScreen || ele.msRequestFullscreen;      
      if(typeof reqFullScreen !== 'undefined' && reqFullScreen) {
        reqFullScreen.call(ele);
      };
    }
    
    //退出全屏
    ,exitScreen: function(){
      var ele = document.documentElement
      if (document.exitFullscreen) {  
        document.exitFullscreen();  
      } else if (document.mozCancelFullScreen) {  
        document.mozCancelFullScreen();  
      } else if (document.webkitCancelFullScreen) {  
        document.webkitCancelFullScreen();  
      } else if (document.msExitFullscreen) {  
        document.msExitFullscreen();
      }
    }
    
    //纠正单页路由格式
    ,correctRouter: function(href){
      if(!/^\//.test(href)) href = '/' + href;
      
      //纠正首尾
      return href.replace(/^(\/+)/, '/'); //过滤路由最后的默认视图文件名（如：index）
    }
    
    //……
  };
  
  //事件
  var events = admin.events = {
    //伸缩
    flexible: function(othis){
      var iconElem = othis.find('#'+ APP_FLEXIBLE)
      ,isSpread = iconElem.hasClass(ICON_SPREAD);
      admin.sideFlexible(isSpread ? 'spread' : null); //控制伸缩
      admin.resizeTable(350);
    }
    
    //刷新
    ,refresh: function(){
      layui.index.render();
    }

    //输入框搜索
    ,serach: function(othis){
      othis.off('keypress').on('keypress',function(e){
        if(!this.value.replace(/\s/g, '')) return;
        //回车跳转
        if(e.keyCode === 13){
          var text = this.value;
          
          var menu=$("#LAY-system-side-menu li");
          var items="";
           menu.each(function(){
           	 var child="";
           if($(this).find('cite').text().indexOf(text) != -1){	
           $(this).children('dl').find('>dd').each(function(){
           	var href=$(this).find('a').attr('lay-href');
           	var sun=$(this).find('dd');
           	if(sun.length>0){
           	var sun_tpl="";		
           	sun.each(function(){
           	var href=$(this).children('a').attr('lay-href');	           	
           	sun_tpl=sun_tpl+"<a lay-href='"+href+"'>"+$(this).find('a').text()+"</a>";	
           	})
           	child=child+"<span>"+$(this).children('a').text()+":</span>"+sun_tpl+"<br>";
           	}
           	else{
           	child=child+"<a lay-href='"+href+"'>"+$(this).children('a').text()+"</a>";	
           	}
           	
            })           
           	}
           	else{
           	$(this).children('dl').find('>dd').each(function(){
           	if($(this).text().indexOf(text) != -1){
           	var href=$(this).find('a').attr('lay-href');
           	var sun=$(this).find('dd'),sun_tpl="";
           	if(sun.length>0){
           	sun.each(function(){
           	var href=$(this).children('a').attr('lay-href');	
           	//if($(this).find('a').text().indexOf(text) != -1){
           	sun_tpl=sun_tpl+"<a lay-href='"+href+"'>"+$(this).find('a').text()+"</a>";	
           //}
           	})
           	child=child+"<span>"+$(this).children('a').text()+":</span>"+sun_tpl+"<br>";
           	}
           	else{
           	child=child+"<a lay-href='"+href+"'>"+$(this).find('a').text()+"</a>";	
           	}
           	}
            })	
           	}
           	if(child){
           		items=items+"<h2>"+$(this).find('cite').text()+"</h2><div>"+child+"</div>";	
           	}
           });
           if(!items){
           	layer.msg('没有搜索结果');
           	return false;
           }
           items="<style>#LAY_adminSearch h2{font-size:16px;color:#333;padding:10px 0} #LAY_adminSearch a{padding-right:10px;color:#1890ff}#LAY_adminSearch span{padding-right:5px}</style>"+items;
          admin.popup({
        title: false
        ,offset: [
          '50px'
          ,'180px'
        ]
        ,area: '400px'
        ,anim: -1
        ,id: 'LAY_adminSearch'
        ,content: items
        ,resize: false
        ,success: function(layero, index){
         $("#LAY_adminSearch a").click(function(){
         	layer.close(index);
         })
          
        }
      })
          //打开标签页
         // location.hash = admin.correctRouter(href)
          
          //如果搜索关键词已经打开，则刷新页面即可
          events.serach.keys || (events.serach.keys = {});
          events.serach.keys[admin.tabsPage.index] = this.value;
          if(this.value === events.serach.keys[admin.tabsPage.index]){
            events.refresh(othis);
          }
          
          //清空输入框
          this.value = '';
        }       
      });
    }
    
    //点击消息
    ,message: function(othis){}
    
    
    //便签
    ,note: function(othis){}

    //全屏
    ,fullscreen: function(othis){
      var SCREEN_FULL = 'layui-icon-screen-full'
      ,SCREEN_REST = 'layui-icon-screen-restore'
      ,iconElem = othis.children("i");
      
      if(iconElem.hasClass(SCREEN_FULL)){
        admin.fullScreen();
        iconElem.addClass(SCREEN_REST).removeClass(SCREEN_FULL);
      } else {
        admin.exitScreen();
        iconElem.addClass(SCREEN_FULL).removeClass(SCREEN_REST);
      }
    }
    
    //弹出关于面板
    ,about: function(){
      admin.popupRight({
        id: 'LAY_adminPopupAbout'
        ,success: function(){
          view(this.id).render('system/about')
        }
      });
    }
    
    //弹出更多面板
    ,more: function(){
      admin.popupRight({
        id: 'LAY_adminPopupMore'
        ,success: function(){
          view(this.id).render('system/more')
        }
      });
    }
    
    //返回上一页
    ,back: function(){
      history.back();
    }
    
    //主题设置
    ,setTheme: function(othis){}
    
     
    //遮罩
    ,shade: function(){
      admin.sideFlexible();
    }
  };
  
  //初始
  !function(){    
    //禁止水平滚动
    $body.addClass('layui-layout-body');
    
    //移动端强制不开启页面标签功能
    if(admin.screen() < 1){
      delete setter.pageTabs;
    }
    
    //不开启页面标签时
    if(!setter.pageTabs){
      container.addClass('layadmin-tabspage-none');
    }
    
    //低版本IE提示
    if(device.ie && device.ie < 10){
      view.error('IE'+ device.ie + '下访问可能不佳，推荐使用：Chrome / Firefox / Edge 等高级浏览器', {
        offset: 'auto'
        ,id: 'LAY_errorIE'
      });
    }
    
  }();
  
  //admin.prevRouter = {}; //上一个路由
  
  //监听 hash 改变侧边状态
  admin.on('hash(side)', function(router){
    var path = router.path, getData = function(item){
      return {
        list: item.children('.layui-nav-child')
        ,name: item.data('name')
        ,jump: item.data('jump')
      }
    }
    ,sideMenu = $('#'+ SIDE_MENU)
    ,SIDE_NAV_ITEMD = 'layui-nav-itemed'
    
    //捕获对应菜单
    ,matchMenu = function(list){
      var pathURL = admin.correctRouter(path.join('/'));
      list.each(function(index1, item1){
        var othis1 = $(item1)
        ,data1 = getData(othis1)
        ,listChildren1 = data1.list.children('dd')
        ,matched1 = path[0] == data1.name || (index1 === 0 && !path[0]) 
        || (data1.jump && pathURL == admin.correctRouter(data1.jump));
        
        listChildren1.each(function(index2, item2){
          var othis2 = $(item2)
          ,data2 = getData(othis2)
          ,listChildren2 = data2.list.children('dd')
          ,matched2 = (path[0] == data1.name && path[1] == data2.name)
          || (data2.jump && pathURL == admin.correctRouter(data2.jump));
          
          listChildren2.each(function(index3, item3){
            var othis3 = $(item3)
            ,data3 = getData(othis3)
            ,matched3 = (path[0] ==  data1.name && path[1] ==  data2.name && path[2] == data3.name)
            || (data3.jump && pathURL == admin.correctRouter(data3.jump))
            
            if(matched3){
              var selected = data3.list[0] ? SIDE_NAV_ITEMD : THIS;
              othis3.addClass(selected).siblings().removeClass(selected); //标记选择器
              return false;
            }
            
          });

          if(matched2){
            var selected = data2.list[0] ? SIDE_NAV_ITEMD : THIS;
            othis2.addClass(selected).siblings().removeClass(selected); //标记选择器
            return false
          }
          
        });
        
        if(matched1){
          var selected = data1.list[0] ? SIDE_NAV_ITEMD : THIS;
          othis1.addClass(selected).siblings().removeClass(selected); //标记选择器
          return false;
        }
        
      });
    }
    
    //重置状态
    sideMenu.find('.'+ THIS).removeClass(THIS);
    
    //移动端点击菜单时自动收缩
    if(admin.screen() < 2) admin.sideFlexible();
    
    //开始捕获
    matchMenu(sideMenu.children('li'));
  });
  
  //监听侧边导航点击事件
  element.on('nav(layadmin-system-side-menu)', function(elem){
    if(elem.siblings('.layui-nav-child')[0] && container.hasClass(SIDE_SHRINK)){
      admin.sideFlexible('spread');
      layer.close(elem.data('index'));
    };
    admin.tabsPage.type = 'nav';
  });
  
  //监听选项卡的更多操作
//element.on('nav(layadmin-pagetabs-nav)', function(elem){
//  var dd = elem.parent();
//  dd.removeClass(THIS);
//  dd.parent().removeClass(SHOW);
//});
  
  //同步路由
  var setThisRouter = function(othis){
    var layid = othis.attr('lay-id')
    ,attr = othis.attr('lay-attr')
    ,index = othis.index();

    location.hash = layid === setter.entry ? '/' : (attr || '/');
    admin.tabsBodyChange(index);
  }
  ,TABS_HEADER = '#LAY_app_tabsheader>li';
  //页面跳转
  $body.on('click', '*[lay-href]', function(){
    var othis = $(this)
    ,href = othis.attr('lay-href')
    ,router = layui.router();
    
    admin.tabsPage.elem = othis;
    //admin.prevRouter[router.path[0]] = router.href; //记录上一次各菜单的路由信息
    if(href.indexOf("@") != -1){
    href = layui.url().hash.href + href.substr(1);	
    }
 //    let has=layui.data(layui.setter.tableName)['menu'].search(href);
 //    if(has== -1){
	// layer.msg("权限不足");
	// return;
 //    }
    //执行跳转
    location.hash = admin.correctRouter(href);
  });
  
  //点击事件
  $body.on('click', '*[layadmin-event]', function(){
    var othis = $(this)
    ,attrEvent = othis.attr('layadmin-event');
    events[attrEvent] && events[attrEvent].call(this, othis);
  });
  
  //tips
  $body.on('mouseenter', '*[lay-tips]', function(){
    var othis = $(this);
    
    if(othis.parent().hasClass('layui-nav-item') && !container.hasClass(SIDE_SHRINK)) return;
    
    var tips = othis.attr('lay-tips')
    ,offset = othis.attr('lay-offset') 
    ,direction = othis.attr('lay-direction')
    ,index = layer.tips(tips, this, {
      tips: direction || 1
      ,time: -1
      ,success: function(layero, index){
        if(offset){
          layero.css('margin-left', offset + 'px');
        }
      }
    });
    othis.data('index', index);
  }).on('mouseleave', '*[lay-tips]', function(){
    layer.close($(this).data('index'));
  });
  
  //窗口resize事件
  var resizeSystem = layui.data.resizeSystem = function(){
    //layer.close(events.note.index);
    layer.closeAll('tips');
    
    if(!resizeSystem.lock){
      setTimeout(function(){
        admin.sideFlexible(admin.screen() < 2 ? '' : 'spread');
        delete resizeSystem.lock;
      }, 100);
    }
    
    resizeSystem.lock = true;
  }
  $win.on('resize', layui.data.resizeSystem);
  
  //接口输出
  exports('admin', admin);
});