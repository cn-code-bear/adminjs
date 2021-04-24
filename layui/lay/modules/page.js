layui.define(['laytpl', 'layer'], function(exports){
	var element = layui.element
	,$=layui.$;
	let tpl=function(nav,title,menus,menusIndex){
		let text=`<div class="page-header">
		  <div class="nav">
			  <span class="layui-breadcrumb">
			    <a lay-href="/">首页</a>
			    <a style="cursor: default">${nav[0]}</a>
			    <a style="cursor: default"><cite>${nav[1]}</cite></a>
			  </span>
		  </div>
		  <div class="title">
		  	${nav[1]}
		  </div>
		</div>
		  `;
		if(menus.length>0){
			let text2="";
			layui.each(menus,function(index,item){
			text2=text2+`<li class="${menusIndex==index?'layui-this':''}" lay-href="${item.jump}">${item.title}</li>`;	
			});
			text=text+`<div class="layui-tab layui-tab-brief" style="margin:0;background:#fff">
			<ul class="layui-tab-title">
			  ${text2}
			</ul>
			</div>`;
		}  
		return text;
	};
var page={};
	page.header=function(title=false){
	let href=layui.router().path.join('/');
	let menu = JSON.parse(layui.data(layui.setter.tableName)['menu']);
	let nav=[];
	let menus=[];
	let menusIndex=0;
	menu.forEach(function(item){
	    
	    item.list.forEach(function(item2){
		if(item2.list.length>0){
			item2.list.forEach(function(item3,index){
			if(item3.jump==href){
			nav.push(item.title);
			nav.push(item2.title);
			menus=item2.list;
			menusIndex=index;
			console.log(item2.jump);
			$('[data-jump="'+item2.jump+'"]').addClass('layui-this');	
			}	
			});	
		}	
		if(item2.jump==href){
		nav.push(item.title);
		nav.push(item2.title);
		// if(item2.list){
		// menus=item2.list;	
		// }
		}   
	    })
	})
	if(!nav[0]){
		return;
	}	
	$(".layui-body").prepend(tpl(nav,title,menus,menusIndex));
	element.init();	
	}
exports('page', page);	
})