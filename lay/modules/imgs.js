layui.define(['laytpl','sortable'], function (exports) {
var obj = {},
$=layui.$,
admin=layui.admin,
laytpl=layui.laytpl;
var tpl=`
<style>
.uploads-img {
		width: 100%;
		margin-top: 20px;
	}

	.uploads-img .list-group-item {
		width: 110px;
		height: 110px;
		float: left;
		margin-right: 10px;
	}

	.uploads-img .list-group-item:hover img {
		border: 1px dashed #1890ff;
	}

	.uploads-img img {
		width: 100px;
		height: 100px;
		border: 1px solid #ddd;
		padding: 4px;

	}

	.uploads-img img.add_imgs {
		border: 0;
		cursor: pointer;
	}
</style>
<div class="list-group uploads-img">
             	 {{#  layui.each(d.data,function(index, item){ }}
             	 <div class='list-group-item'><img src="{{item}}"><input type='hidden' value="{{item}}"/></div>
             		{{# }) }}
             	<img src="/style/img/img-add.png" class="add_imgs" data-sum={{d.sum||'1'}}>
			       </div>
			    <div style="color:#999"><br>图片可拖动排序,双击可删除图片</div>`;
var on={};
	obj.render=function(id,name,data=[],sum){
		
	if(!data){
	data=[];	
	}else{
	 if(data.indexOf(",") != -1 && data.indexOf("[") == -1){
		data=data.split(',');	 
	 }else{
	  data=JSON.parse(data);		 
	 }	
	
	}	
	function set_val(){
		let val=[];
		$(id).find("input").each(function(i,ele){
		val.push($(this).val());
		});
		$(id).next().val(val);
	}	
	laytpl(tpl).render({data:data,name:name,sum:sum},function(html){
	$(id).prepend(html);
	set_val();
	$(document).on('dblclick', id+' .uploads-img>.list-group-item', function() {
	  $(this).remove();
	  set_val();
	});
	console.log(id);
	let _id=id;
	$(document).off('click',id+' .add_imgs').on('click', id+' .add_imgs', function() {
	  var count=$(_id+" .list-group-item").length;
	  if(count>=sum){
	  	layer.msg("最多可以上传"+sum+"张图片");
	  	return false;
	  }
		var id=this.id;
		admin.popup({
			id: "LAY_adminupimages",
			title:"选择图片",
			area: ['1080px', '800px'],
			 btn: ['确定', '取消'],
			 btnAlign: 'c',
		yes: function(index, layero){
	    var imgs=$(".imgs>.on img");
	   if(imgs.length<=0){
	   layer.msg("请选择图片");
	   return false;
	   }
	    if(sum-count<imgs.length){
	  	layer.msg("最多可以选择"+Number(sum-count)+"张图片");
	  	return false;
	  }
	   for (i = 0; i < imgs.length; i++) { 
	   	var alt= imgs[i].alt;
	    $(".uploads-img").append("<div class=list-group-item ><img src="+alt+"><input type=hidden  value='"+alt+"'/></div>");
	    layer.close(index); 
	   }
	   set_val();
	  },
			success: function(layero,index) {
			layui.view(this.id).render('more_images',{index:index,id:id,count:sum-count,type:'goods'});
			}
		});
		return false;
	});	
		new Sortable($(id+">div")[0], {
		    animation: 150,
		    ghostClass: 'blue-background-class',
			onUpdate: function (evt) {
            set_val();
			},
		});
		});
	}
	//obj.on=on;
	//layui.link('mod/xedit.css');
exports('imgs', obj);
	});