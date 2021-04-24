layui.define(['laytpl'], function (exports) {
var obj = {},
$=layui.$,
laytpl=layui.laytpl;
var tpl=`
<div class="meditor">
              		<div class="box">
              		{{# if(d && d.length>0){ }}	
              		{{#  layui.each(d,function(index,item){ }}
              		{{# if(item.type=='text'){ }}
              		<section class="p">
              		<span>
              			{{item.text}}
              		</span>
              		<a class="del" onclick="layui.xedit.on.meditor_del(this)">删除</a>
              		<a class="btn" onclick="layui.xedit.on.meditor_edit(this)">编辑</a>
              		</section>
              		{{# }else{ }}
              		<section class="img">
              			<img src="{{item.src}}"/>
              			<a class="del" onclick="layui.xedit.on.meditor_del(this)">删除</a>
              		    <a class="btn" onclick="layui.xedit.on.meditor_img(this)">编辑</a>
              		</section>
              		{{#  } }}
              		{{#  }) }}
              		{{#  } }}
              		</div>
              		<div class="bottom">
              			<div onclick="layui.xedit.on.meditor_p()">
              				<img src="style/img/icon/word.png"/>
              				<span>文字</span>
              				
              			</div>
              			<div onclick="layui.xedit.on.meditor_imgs()">
              				<img src="style/img/icon/img.png"/>
              				<span>图片</span>
              			</div>
              		</div>	
              	</div>`;
var on={
 meditor_imgs:function(){
	var _this=this;
	var $=layui.$;
	var admin=layui.admin;
	admin.popup({
		id: "LAY_adminupimages",
		title:"选择图片",
		area: ['1080px', '800px'],
		 btn: ['确定选择', '取消'],
		 btnAlign: 'c',
	yes: function(index, layero){
   var imgs=$(".imgs>.on img");
   if(imgs.length<=0){
   layer.msg("请选择图片");
   return false;
   }
   for (i = 0; i < imgs.length; i++) { 
   	var alt= imgs[i].alt;
   	let html=`<section class="img">
              			<img src="${alt}"/>
              			<a class="del" onclick="layui.xedit.on.meditor_del(this)">删除</a>
              		    <a class="btn" onclick="layui.xedit.on.meditor_img(this)">修改</a>
              		</section>
              		`;
   	$(".box").append(html);
    layer.close(index); 
   }
  },
		success: function(layero,index) {
		layui.view(this.id).render('more_images',{index:index,id:1,count:10,type:''});
		}
	});
},
 meditor_edit:function(_this){
let btn=layui.$(_this).parent().children('span');	
layer.prompt({
  formType: 2,
  value: btn[0].innerText,
  title: '内容修改',
  area: ['400px', '250px'] //自定义文本域宽高
}, function(value, index, elem){
  layer.close(index);
  btn.html(value);
});
},
meditor_p:function (){
console.log('p');
layer.prompt({
  formType: 2,
  value: '',
  title: '添加内容',
  area: ['400px', '250px'] //自定义文本域宽高
}, function(value, index, elem){
	let html=`<section class="p">
              			<span>${value}</span>
              			<a class="del" onclick="layui.xedit.on.meditor_del(this)">删除</a>
              		    <a class="btn" onclick="layui.xedit.on.meditor_edit(this)">编辑</a>
              		</section>
              		`;
   	layui.$(".box").append(html);
  layer.close(index);
});
},
 meditor_img:function(_this){
let btn=layui.$(_this).parent().children('img');	
	var _this=this;
	var $=layui.$;
	var admin=layui.admin;
	admin.popup({
		id: "LAY_adminupimages",
		title:"选择图片",
		area: ['1080px', '800px'],
		 btn: ['确定选择', '取消'],
		 btnAlign: 'c',
	yes: function(index, layero){
   var imgs=$(".imgs>.on img");
   if(imgs.length<=0){
   layer.msg("请选择图片");
   return false;
   }
   for (i = 0; i < imgs.length; i++) { 
   	var alt= imgs[i].alt;
   	 btn.attr('src',alt);
    layer.close(index); 
   }
  },
		success: function(layero,index) {
		layui.view(this.id).render('more_images',{index:index,id:1,count:1,type:''});
		}
	});

},
 meditor_del:function(_this){
let btn=layui.$(_this).parent();	
    btn.remove();
}
}
	obj.render=function(id,data=[]){
		if(!data){
		data=[];
		}
		laytpl(tpl).render(data,function(html){
		$(id).html(html);	
		});
	}
	obj.on=on;
	obj.get=function(){
		let res=[];
		let $=layui.$;
		$(".meditor").find('section').each(function(){
	        let p=$(this).hasClass('p');
	        if(p){
	        let content=$(this).find('span')[0].innerText;	
	        res.push({type:'text',text:content});	
	        }else{
	        let content=$(this).find('img')[0].src;	
	        res.push({type:'img',src:content});		
	        }
	   });
		return res;
	}
    exports('xedit', obj);
	});