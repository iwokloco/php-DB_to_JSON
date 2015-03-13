
/*
formManager = new FormManager();
formManager.rows.push(new RowForm(null,"id",0,FM.HIDDEN));
formManager.rows.push(new RowForm("Categoría","id_categoria",0,FM.FK,"json_db.php?table=categoria&fsearch=nombre&fshow=nombre&"));
formManager.rows.push(new RowForm("Nombre subcategoría","nombre","",FM.TEXT));
formManager.generate("cin");
*/

var FM ={
	/*AJAX*/
	READY_STATE_UNINITIALIZED:0,
	READY_STATE_LOADING:1,
	READY_STATE_LOADED:2,
	READY_STATE_INTERACTIVE:3,
	READY_STATE_COMPLETE:4,
	http_request:null,
	/**/
	TEXT:0,
	FK:1,
	HIDDEN:2,
	json_item:null,
	json:null,
	form_for_send:null,
	table:null,
	bt_save:null,
	bt_new:null,
	current_id:-1,
	black:null,
	url_service:null,
	url_upload:null,
	msg_title_exists:null,
	msg_exists:null,
	instance:null,html:"",NEW:0,SET:1,
	DB_NEW:0,DB_GET:1,DB_SET:2,DB_REMOVE:3,DB_LIST:4,DB_NEW_COMPLEX:5,DB_GET_COMPLEX:6,DB_LIST_COMPLEX:7,DB_SELECT:8,DB_SET_COMPLEX:9
};
/*AJAX*/
FM.init_xhr = function(){
    if (window.XMLHttpRequest) {
        return new XMLHttpRequest();
    } else if (window.ActiveXObject) {
        return new ActiveXObject("Microsoft.XMLHTTP");
    }
}
FM.loadData = function(url,type,f){
	var hr = FM.http_request;
	hr = FM.init_xhr();
	if(hr){
		hr.onreadystatechange = function(){
			if(hr.readyState==FM.READY_STATE_COMPLETE){
				if(hr.status==200){
					f(hr.responseText);
				}
			}
		};
	}
	hr.open(type,url,false);
	hr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	hr.send(null);
}
FM.loadPOSTData = function(url,f,queryString){
	var hr = FM.http_request;
	hr = FM.init_xhr();
	if(hr){
		hr.onreadystatechange = function(){
			if(hr.readyState==FM.READY_STATE_COMPLETE){
				if(hr.status==200){
					f(hr.responseText);
				}
			}
		};
		hr.open("POST",url,false);
		hr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		hr.send(queryString);		
	}
}
FM.loadGETData = function(url,f){
	var hr = FM.http_request;
	hr = FM.init_xhr();
	if(hr){
		hr.onreadystatechange = function(){
			if(hr.readyState==FM.READY_STATE_COMPLETE){
				if(hr.status==200){
					f(hr.responseText);
				}
			}
		};
	}
	hr.open("GET",url,false);
	hr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	hr.send(null);
}
/*TABLE
Su constructor tiene un número de parámetros indefinidos 
Representan los nombres de las columnas de la tabla
El número de parámetros indicará cuantos campos tendrá una row!
Pero únicamente se mostrarán las columnas que sean String.
Las columnas null se ignorarán a la hora de dibujar la tabla.
*/		
FM.Table = function(){
	this.header = new Array();
	this.rows = new Array();
	if(arguments.length>0){
		for(var i=0;i<arguments.length;i++){
			this.header.push(arguments[i]);
		}
	}
	this.footer = null;
	this.widthColumns = new Array();
}
/* Pinta la tabla, únicamente apareceran las columnas cuyo header no sea null. */
FM.Table.prototype.paintIn = function(idDiv, idTable, style, css){
	var div = document.getElementById(idDiv);
	div.innerHTML="";
	var strstyle = style==null ? "" : " style='"+style+"'";
	var strclass = css==null ? "" : " class='"+css+"'";
	var table = "<table id='"+idTable+"'"+strstyle+strclass+">";
	table+= "<thead>";
	table+= "<tr>";
	for(var i=0;i<this.header.length;i++){
		if(this.header[i]!=null) table+="<th width='"+this.widthColumns[i]+"' rowspan='1' colspan='1'>"+this.header[i]+"</th>";
	}
	table+= "</tr>";
	table+= "</thead>";
	if(this.footer != null){
		table+= "<tfoot>";
		table+= this.footer;
		table+= "</tfoot>";
	}
	table+=	"<tbody>";
	for(var i=0;i<this.rows.length;i++){
		table+= "<tr>";
			for(var j=0;j<this.header.length;j++){
				if(this.header[j]!=null) table+= "<td>"+this.rows[i][j]+"</td>";
			}
		table+= "</tr>";	
	}
	table+=	"</tbody>";
	table+= "</table>";
	div.innerHTML = table;
}
/* Pueden llegarnos un número indeterminado de valores, ya que a priori desconocemos el número de columnas que tiene la tabla */
FM.Table.prototype.addRow = function(){
	var row = new Array();
	if(arguments.length>0){
		for(var i=0;i<arguments.length;i++){
			row.push(arguments[i]);
		}
	}
	this.rows.push(row);
}
/*FORM
Los argumentos son de tipo String. Corresponden a los ids de los inputs del formulario.
var f = new FM.Form("nombre","apellido","telefono");
*/
FM.Form = function(){
	this.ids = new Array();
	this.inputs = new Array();
	if(arguments.length>0){
		for(var i=0;i<arguments.length;i++){
			this.ids.push(arguments[i]);
			this.inputs.push(document.getElementById(arguments[i]));
		}
	}
	this.jsonFormulario = null;
}
/*f.loadFromArray(["Richard","Feynman","000000"]);*/
FM.Form.prototype.loadFromArray = function(values){
	for(var i=0;i<values.length;i++){
		if(values[i] == null || values[i].length==0){
			this.inputs[i].value = "";
		}else{
			this.inputs[i].value = values[i];
		}
		this.inputs[i].checked = values[i];
		if(this.inputs[i].type == 'select-one'){
			if(document.getElementById(this.ids[i]+values[i])==null) this.inputs[i].selectedIndex=0;
			else this.inputs[i].selectedIndex = document.getElementById(""+this.ids[i]+values[i]).index;
		} 
	}
}
/* eval("var json="+f.generateJSON()); */
FM.Form.prototype.generateJSON = function(){
	var jsonArrayFormulario = new Array();
	for(var i=0;i<this.ids.length;i++){
		if(this.inputs[i].type == 'select-one'){
			jsonArrayFormulario.push('"'+this.ids[i]+'":"'+this.inputs[i].options[this.inputs[i].selectedIndex].getAttribute('dbid')+'"');	
		}else{
			jsonArrayFormulario.push('"'+this.ids[i]+'":"'+this.inputs[i].value+'"');	
		}
	}
	
	this.jsonFormulario = "{"+jsonArrayFormulario.join()+"}";
	return this.jsonFormulario;
}
FM.Form.prototype.send = function(url, f){
	FM.loadPOSTData(url,f,"json="+encodeURIComponent(this.generateJSON()));
}

/*FORMMANAGER
json_form = {ids:["id","nombre","apellido","telefono"],
			values:[0,"Richard","Feynman","000000"],
			types:[FM.HIDDEN,FM.TEXT, FM.TEXT, FM.TEXT],
			labels:[null,"Nombre","Apellido","Teléfono"],
			urls:[null, null, null, null],
			url_get: null,
			url_set: null,
			url_new:null,
			f_get: null,
			f_set: null,
			f_new: null,
			url_init:null,
			f_init:null}
			
json_form = {
			idDiv:"";
			ids:["id","id_categoria","subcategoria"],
			types:[FM.HIDDEN, FM.FK, FM.TEXT],
			labels:[null, "Categoría", "Subcategoría"],
			urls:[null, "json_db.php?table=categoria&fsearch=nombre&fshow=nombre&", null]
			}			
			
1- Se crean los elementos del dom con esas id's.
2- Los campos de tipo FM.FK se rellenan con las peticiones ajax.
3- Si hay values, se "rellenan los campos".
4- Si hay url_init, se hace la petición ajax y se "rellenan los campos".

*/		
FM.FormManager = function(json){
	var self = this;
	this.json = json;
	this.json_form = {};
	this.rows = new Array();
	this.form = new FM.Form();
	this.div_c = (json.idDiv!=undefined)? document.getElementById(json.idDiv) : "fmC";	
	this.columns = "";
	
	if(json!=undefined){
/*		1- Se crean los elementos del dom con esas id's.
		2- Los campos de tipo FM.FK se rellenan con las peticiones ajax.
		3- Si hay values, se "rellenan los campos".		*/
		if(	json.ids!=undefined && json.values!=undefined && json.labels!=undefined && json.types!=undefined && json.urls!=undefined){
			for(var i=0;i<json.ids.length;i++){
				this.rows.push(new FM.RowForm(json.labels[i], json.ids[i], json.values[i], json.types[i], json.urls[i]));
				this.div_c.innerHTML+=this.rows[i].html;
				this.columns+='"'+json.ids[i]+'",';
			}
			this.columns = this.columns.substring(0,this.columns.length-1);
			for(var i=0;i<this.rows.length;i++){
				this.form.ids.push(this.rows[i].id);
				this.form.inputs.push(document.getElementById(this.rows[i].id));
			}
			
		}
	/*  4- Si hay url_init, se hace la petición ajax y se "rellenan los campos".*/
		this.initWithUrl();
		if(json.url_new!=undefined){
		}
	}
	
}

FM.FormManager.prototype.save = function(){
	FM.instance = this;
	if(this.json.url_new!=undefined){
		FM.loadPOSTData(this.json.url_new,
					function(r){
						eval("var rjson="+r);
						if(rjson==null){
							alert("El registro ya existe.");
						}else{
							var af = new Array();
							for(var i=0;i<FM.instance.json.ids.length;i++){
								eval("af.push(rjson."+FM.instance.json.ids[i]+")");
							}
							FM.instance.form.loadFromArray(af);
							FM.instance.json.f_new(r);
						}
					},"json="+encodeURIComponent(this.form.generateJSON()));
	}
}
FM.FormManager.prototype.update = function(){
	FM.instance = this;
	if(this.json.url_set!=undefined){
		FM.loadPOSTData(this.json.url_set,
						function(r){
							if(r=="success"){
								FM.instance.json.f_set(r);
							}else{
								alert("Fallo al actualizar el registro.");
							}
						},
						"json="+encodeURIComponent(this.form.generateJSON()));
	}
}
FM.FormManager.prototype.reset = function(){
	for(var i=0;i<this.json.ids.length;i++){
		this.form.inputs[i].value = this.json.values[i];
		this.form.inputs[i].checked = this.json.values[i];
		if(this.form.inputs[i].type == 'select-one'){
			this.form.inputs[i].selectedIndex = 0;
		} 
	}	
}
FM.FormManager.prototype.initWithUrl = function(){
	FM.instance = this;
	if(FM.instance.json.url_init!=undefined){
		FM.loadPOSTData(FM.instance.json.url_init,
						function(r){
							eval("FM.instance.json_form ="+r);
							var af = new Array();
							for(var i=0;i<FM.instance.json.ids.length;i++){
								eval("af.push(FM.instance.json_form."+FM.instance.json.ids[i]+")");
							}
							FM.instance.form.loadFromArray(af);
						},"json="+encodeURIComponent('{"columns":['+this.columns+']}'));
	}
}

FM.FormManager.prototype.generate = function(idDiv){/*DEPRECATED*/
	var div = document.getElementById(idDiv);
	for(var i=0;i<this.rows.length;i++) div.innerHTML+=this.rows[i].html;
}

/*ROWFORM*/
FM.RowForm = function(label, id, value, type, url_service){
	var self = this;
	this.label = label;
	this.id = id;
	this.value = value;
	this.type = type;
	this.url_service = url_service;
	this.html = " ";
	if(type == FM.HIDDEN){
		this.html="<input id='"+id+"' type='hidden' value='"+value+"'/>";
	}else{
		this.html = "<div id='row_"+id+"' class='rowform'>";
		this.html+="	<div class='rowlabelcol'>"+label+"</div>";
		switch(type){
			case FM.TEXT:
				this.html+="<div class='rowinputcol'><div><input id='"+id+"' type='text' class='in350yellow'/></div></div>";		
				break;
			case FM.FK:
				this.html+="<div class='rowinputcol'><div><select id='"+id+"' class='sel350'>";
				FM.loadData(this.url_service+"t=4","GET",function(r){
					eval("json="+r);
					for(var i=0;i<json.list.length;i++){
						self.html+="<option id='"+self.id+json.list[i].id+"' dbid='"+json.list[i].id+"'>"+json.list[i].nombre+"</option>";
					}					
				});							
				this.html+="</select></div></div>";
				break;
		}
		this.html+="</div>";	
	}
}	
//{idSel:"subcategoria",options:[{id:"0",dbid:"3",value:"X"}]};
FM.loadOptions = function(optSel){
	var html="";
	for(var i=0;i<optSel.options.length;i++){
		html+="<option id='"+optSel.idSel+optSel.options[i].dbid+"' dbid='"+optSel.options[i].dbid+"'>"+optSel.options[i].value+"</option>";
	}
	document.getElementById(optSel.idSel).innerHTML = html;
	document.getElementById(optSel.idSel).selectedIndex = 0;
}

/*IMAGELOADER
var img0 = new FM.ImageLoader("img0","i0",null,"width:100px;height:100px;","http://annawrites.com/blog/wp-content/uploads/2012/02/family-guy.jpg");
*/
FM.ImageLoader = function(idDiv, idImage, css, style, url){
	this.idDiv = idDiv;
	this.idImage = idImage;
	this.css = css;
	this.style = style;
	this.url = url;
}
/*img0.paint();*/
FM.ImageLoader.prototype.paint = function(){
	document.getElementById(this.idDiv).innerHTML="";
	var strstyle = this.style==null ? "" : " style='"+this.style+"'";
	var strclass = this.css==null ? "" : " class='"+this.css+"'";	
	var imageCode = "<img id='"+this.idImage+"'"+strstyle+strclass+" src='"+this.url+"'/>";
	document.getElementById(this.idDiv).innerHTML = imageCode;
}
/*
var json_bt_upload = {	idDivContainer:"bt",
						label:"Añadir Imagen",
						idDiv:"upimg",
						cssDiv:"saveimg",
						idLabel:"upimgtxt",
						cssLabel:"",
						idInput:"imgfile",
						cssInput:"btimg",
						urlUpload:"upload.php",
						nameInput:"images[]",
						method:function(r){alert("url = " + r);}
					};
*/
FM.BT_UploadImage = function(json){
	var self = this;
	this.idDivContainer = (json.idDivContainer==null)? "bt" : json.idDivContainer;
	this.label = (json.label==null)? "Añadir Imagen" : json.label;
	this.idDiv = (json.idDiv==null)? "upimg" : json.idDiv;
	this.cssDiv = (json.cssDiv==null)? "saveimg" : json.cssDiv;
	this.idLabel = (json.idLabel==null)? "upimgtxt" : json.idLabel;
	this.cssLabel = (json.cssLabel==null)? "" : json.cssLabel;
	this.idInput = (json.idInput==null)? "imgfile" : json.idInput;
	this.cssInput = (json.cssInput==null)? "btimg" : json.cssInput;
	this.urlUpload = (json.urlUpload==null)? "upload.php" : json.urlUpload;
	this.nameInput = (json.nameInput==null)? "images[]" : json.nameInput;
	this.method = (json.method==null)? function(r){alert(r);} : json.method;
	this.maxSize = (json.maxSize==null)? 1200 : json.maxSize;
	this.html="<div id='"+this.idDiv+"' class='"+this.cssDiv+"'>";
	this.html+="<span id='"+this.idLabel+"' class='"+this.cssLabel+"'>"+this.label+"</span>";
	this.html+="<input id='"+this.idInput+"' class='"+this.cssInput+"' type='file' multiple /></div>";
	
	var divContainer = document.getElementById(this.idDivContainer);
	divContainer.innerHTML = this.html;
	
	document.getElementById(this.idInput).addEventListener('change',function(event){
		var files = event.target.files;
		for(var i=0;i<files.length;i++){
			//alert(files.length + " " + files[i].type);
			if(files[i].type.match(/image.*/)){
				var reader = new FileReader();
				reader.onload = function(readerEvent){
					//alert("reader.onload");
					var image = new Image();
					image.onload = function(imageEvent){
						//alert("generando canvas");
						var canvas = document.createElement('canvas');
						var width = image.width;
						var height = image.height;
						if(width > height){
							if(width > self.maxSize){
								height *= self.maxSize / width;
								width = self.maxSize;
							}
						}else{
							if(height > self.maxSize){
								width *= self.maxSize / height;
								height = self.maxSize;
							}
						}
						canvas.width = width;
						canvas.height = height;
						canvas.getContext('2d').drawImage(image, 0, 0, width, height);
						
						FM.loadPOSTData(self.urlUpload,self.method,canvas.toDataURL('image/jpeg'));	
					}
					image.src = readerEvent.target.result;
				};
				reader.readAsDataURL(files[i]);
			}
		}
		event.target.value = '';//clear files
	});
}
///////////////////////
/*
idDiv: div que contendrá el botón de upload image
label: etiqueta del botón de upload*/
FM.addBTImageLoader = function(idDiv,label){
	var html = "<div id='upimg' class='saveimg'>";
	html+="<span id='upimgtxt'>"+lab+"</span>";
	html+="<input type='file' id='imgfile' name='images[]' multiple='multiple' class='btimg'/>";
	html+="</div>";
}
	
FM.loadUploadImages = function(){

}

/*{id,label,func,divClass,spanClass} */
FM.Button = function(json){
	return "<div id='"+json.id+"' class='"+json.divClass+"' onClick='"+json.func+";'><span class='"+json.spanClass+"'>"+json.label+"</span></div>";
}

/************************************/
//loadCSSSelectors("p_tinmueble", "p_tgestion", "p_poblacion");
function loadCSSSelectors(){
	if(arguments.length>0){
		for(var i=0;i<arguments.length;i++){
			eval("$('#"+arguments[i]+"').change(function(event){ $('#"+arguments[i]+"').css({'background-color':'#ffc'}); saved=false;});");
		}
	}			
}
//loadCSSInputs("p_tinmueble", "p_tgestion", "p_poblacion");
function loadCSSInputs(){
	if(arguments.length>0){
		for(var i=0;i<arguments.length;i++){
			eval("$('#"+arguments[i]+"').keydown(function(event){ $('#"+arguments[i]+"').css({'background-color':'#ffc'}); saved=false;});");
		}
	}
}

function removeById(id){
	$("#black").css('display', 'block');
	$("#dialog").css('display','block');
	$("#bt_yes").css('display','block');
	$("#bt_no").css('display','block');
	$("#bt_accept").css('display','none');
	$("#titdialog").html("Eliminar");
	$("#txtdialog").html("¿Estás seguro de que quieres eliminarlo?");				
	current_id = id;			
}
function hideDialog(){
	$('#black').css('display', 'none');
	$("#dialog").css('display','none');
}

var normalize = (function() {
  var from = "ÃÀÁÄÂÈÉËÊÌÍÏÎÒÓÖÔÙÚÜÛãàáäâèéëêìíïîòóöôùúüûÑñÇç",
      to   = "AAAAAEEEEIIIIOOOOUUUUaaaaaeeeeiiiioooouuuunncc",
      mapping = {};
 
  for(var i = 0, j = from.length; i < j; i++ )
      mapping[ from.charAt( i ) ] = to.charAt( i );
 
  return function( str ) {
      var ret = [];
      for( var i = 0, j = str.length; i < j; i++ ) {
          var c = str.charAt( i );
          if( mapping.hasOwnProperty( str.charAt( i ) ) )
              ret.push( mapping[ c ] );
          else
              ret.push( c );
      }
      return ret.join( '' );
  }
 
})();

function escapeRegExp(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}
function replaceAll(find, replace, str) {
  return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}
///////////////////////