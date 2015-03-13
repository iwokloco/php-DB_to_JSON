<?php  
	include("header.php");
	header('Content-Type: text/plain; charset=UTF-8');

	/*$table_name = "categoria";
	$field_for_search = "nombre";
	$field_for_show = "nombre";	*/
	
	$table_name = $_GET["table"];
	$field_for_search = $_GET["fsearch"];
	$field_for_show = $_GET["fshow"];	
	$field_id = (isset($_GET['fid']))? $_GET["fid"] : "id";
	$id = (isset($_GET['id']))? $_GET["id"] : "0";
	$condition = (isset($_GET['cstr']))? $_GET["cstr"] : "activo=1";
	
	$NEW = 0;
	$GET = 1;
	$SET = 2;
	$REMOVE = 3;
	$LIST = 4;
	$NEW_COMPLEX = 5;
	$GET_COMPLEX = 6;
	$LIST_COMPLEX = 7;
	$SELECT = 8;
	$SET_COMPLEX = 9;
	
	if(array_key_exists('t', $_GET)){
		switch($_GET["t"]){
			case $NEW:
				echo newItem($_POST["json"]);
				break;
			case $GET:
				echo getItem($_GET["id"]);
				break;
			case $SET:
				echo setItem($_POST["json"]);
				break;				
			case $REMOVE:
				echo removeItem($_GET["id"]);
				break;
			case $LIST:
				echo listItem();
				break;				
			case $NEW_COMPLEX:
				echo newComplexItem($_POST["json"]);
				break;
			case $GET_COMPLEX:
				echo getComplex($_POST["json"]);
				break;
			case $LIST_COMPLEX:
				echo listComplex($_POST["json"]);
				break;	
			case $SELECT:
				echo select($_POST["json"]);
				break;
			case $SET_COMPLEX:
				echo setComplex($_POST["json"]);
				break;
		}
		
		mysql_close($con);
	}	

/*
{
"sql":"select c.id as id_cat, c.nombre as categoria, s.id as id_scat, s.nombre as subcategoria from categoria c left join subcategoria s on c.id = s.id_categoria"
"columns":["id_cat","categoria","id_scat","subcategoria"]
}

*/
	function select($json){
		$obj = json_decode($json);
		$result = mysql_query($obj->{'sql'});
		$out = "{'list':[";
		if($result!=NULL){
			if(mysql_num_rows($result)>0){
				while($row=mysql_fetch_array($result)){
					$out .="{";
					foreach ($obj->{'columns'} as $index => $column){
						$out.="'".$column."':'".$row[$column]."',";
					}						
					$out = substr($out, 0, -1)."},";
				}
				$out = substr($out, 0, -1) . "]}";				
			}else{$out = $out . "]}";}
			mysql_free_result($result);
		}
		echo $out;			
	}
	
//"json="+encodeURIComponent('{"columns":["id", "nombre"]}')
	function listComplex($json){
		global $table_name,$field_for_show,$condition;
		$obj = json_decode($json);
		$query = "select ";
		foreach ($obj->{'columns'} as $index => $column){
			$query.=$column.",";
		}	
		$query = substr($query,0,-1)." from ".$table_name." where ".$condition." order by ".$field_for_show;
		$result = mysql_query($query);
		$out = "{'list':[";
		if($result!=NULL){
			if(mysql_num_rows($result)>0){
				while($row=mysql_fetch_array($result)){
					$out .="{";
					foreach ($obj->{'columns'} as $index => $column){
						$out.="'".$column."':'".$row[$column]."',";
					}						
					$out = substr($out, 0, -1)."},";
				}
				$out = substr($out, 0, -1) . "]}";				
			}else{$out = $out . "]}";}
			mysql_free_result($result);
		}
		echo $out;	
	}
	
//FM.loadPOSTData("json_db.php?t=6&table=categoria&fid=id&id=1",function(r){alert(r);},"json="+encodeURIComponent('{"columns":["id", "nombre"]}'));
	function getComplex($json){
		global $field_id,$id,$table_name;
		$obj = json_decode($json);
		$query = "select ";
		foreach ($obj->{'columns'} as $index => $column){
			$query.=$column.",";
		}			
		$query = substr($query,0,-1)." from ".$table_name." where ".$field_id."=".$id;
		$result = mysql_query($query);
		$out="null";
		if($result!=NULL && mysql_num_rows($result)>0){
			$row = mysql_fetch_array($result);
			$out ="{";
			foreach ($obj->{'columns'} as $index => $column){
				$out.="'".$column."':'".$row[$column]."',";
			}						
			$out = substr($out, 0, -1)."}";
		}
		mysql_free_result($result);
		return $out;				
	}	
//FM.loadPOSTData("json_db.php?t=5&table=subcategoria&fsearch=nombre",function(r){alert(r);},"json="+encodeURIComponent('{"id_categoria":"2","nombre":"Bombillas"}'));	
	function newComplexItem($json){
		global $field_for_search, $table_name;
		$obj = json_decode($json);
		if(getItemBySearchField($obj->$field_for_search)!="null"){
			return "null";
		}else{
			$query = "insert into ".$table_name." ";
			$fields = "(";
			$values =" values (";
			foreach($obj as $property => $value){
				$fields.=$property.",";
				$values.="'".$value."',";
			}
			$fields = substr($fields, 0, -1).")";
			$values = substr($values, 0, -1).")";
			$query.=$fields.$values;
			mysql_query($query);
			return getComplexItemBySearchField($obj->$field_for_search,$obj);
		}		
	}

/*FM.loadPOSTData("json_db.php?t="+FM.DB_SET_COMPLEX+"&table=subcategoria&fsearch=nombre&fid=id&id=",
					function(r){alert(r);},
					"json="+encodeURIComponent('{"id_categoria":"2","nombre":"Bombillas"}'));*/
//Este setComplex comprueba si ya existe un registro con ese nombre antes de hacer un update
/*	function setComplex($json){
		global $field_for_search, $table_name, $field_id, $id;
		$obj = json_decode($json);
		if(getItemBySearchField($obj->$field_for_search)!="null"){
			return "null";
		}else{
			$query = "update ".$table_name." set ";
			foreach($obj as $property => $value){
				$query.=$property."='".$value."',";
			}
			$query = substr($query,0,-1)." where ".$field_id."=".$id;
			mysql_query($query);
			echo "success";
		}	
	}*/
	function setComplex($json){
		global $table_name, $field_id, $id;
		$obj = json_decode($json);
		$query = "update ".$table_name." set ";
		foreach($obj as $property => $value){
			$query.=$property."='".$value."',";
		}
		$query = substr($query,0,-1)." where ".$field_id."=".$id;
		mysql_query($query);
		echo "success";
	}
	
	function getComplexItemBySearchField($val_field_for_search, $obj){
		global $table_name,$field_for_search,$field_id,$condition;
		$query = "select ".$field_id.",";
		foreach($obj as $property=>$value){
			$query.=$property.",";
		}
		$query = substr($query, 0, -1)." from ".$table_name." where ".$field_for_search."='".$val_field_for_search."' and ".$condition;
		$result = mysql_query($query);
		$out="null";
		if($result!=NULL && mysql_num_rows($result)>0){
			$row = mysql_fetch_array($result);
			$out ="{'".$field_id."':'".$row[$field_id]."',";
			foreach($obj as $property => $value){
				$out.="'".$property."':'".$row[$property]."',";
			}
			$out = substr($out, 0, -1)."}";
		}
		mysql_free_result($result);
		return $out;		
	}
	
	function newItem($json){//{'nombre':'Hospitalet'}
		$obj = json_decode($json);
		if(getItemBySearchField($obj->$GLOBALS['field_for_search'])!="null"){
			return "null";
		}else{
			mysql_query("insert into ".$GLOBALS['table_name']." (".$GLOBALS['field_for_search'].") values ('".$obj->{$GLOBALS['field_for_search']}."')");
			return getItemBySearchField($obj->{$GLOBALS['field_for_search']});
		}
	}
	
	function getItemBySearchField($val_field_for_search){//Hospitalet -> {'id':'1','nombre':'Hospitalet'}
		global $table_name, $field_for_search, $field_id;
		$result = mysql_query("select ".$field_id." from ".$table_name." where ".$field_for_search."='".$val_field_for_search."' and activo=1");
		//echo "select id from ".$GLOBALS['table_name']." where ".$GLOBALS['field_for_search']."='".$val_field_for_search."' and activo=1";
		$out="null";
		if($result!=NULL && mysql_num_rows($result)>0){
			$row = mysql_fetch_array($result);
			$out = "{'id':'$row[id]','".$field_for_search."':'".$val_field_for_search."'}";
		}
		mysql_free_result($result);
		return $out;
	}
	
	function getItem($id){// 1 -> {'id':'1','nombre':'Hospitalet'}
		global $field_for_show, $table_name;
		$result = mysql_query("select ".$field_for_show." from ".$table_name." where id=".$id." and activo=1");
		$out = "{}";
		if($result!=NULL && mysql_num_rows($result)>0){
			$row = mysql_fetch_array($result);
			$out = "{'id':'".$id."','".$field_for_show."':'".$row[$field_for_show]."'}";
		}
		mysql_free_result($result);
		return $out;			
	}
	
	function setItem($json){
		$obj = json_decode($json);
		if(getItemBySearchField($obj->$GLOBALS['field_for_search'])!="null"){		
			return "null";
		}else{
			mysql_query("update ".$GLOBALS['table_name']." set ".$GLOBALS['field_for_show']."='".$obj->$GLOBALS['field_for_show']."' where id=".$obj->{'id'});
			echo getItem($obj->{'id'});
		}
	}
	
	function removeItem($id){
		global $table_name,$id;
		mysql_query("update ".$table_name." set activo=0 where id=".$id);
	}
	
	function listItem(){
		global $field_for_show, $table_name;
		$result = mysql_query("select id,".$field_for_show." from ".$table_name." where activo=1 order by ".$field_for_show);
		$out = "{'list':[";
		if($result!=NULL){
			if(mysql_num_rows($result)>0){
				while($row=mysql_fetch_array($result)){
					$out .= "{'id':'$row[id]','".$field_for_show."':'".$row[$field_for_show]."'},";
				}
				$out = substr($out, 0, -1) . "]}";				
			}else{$out = $out . "]}";}
			mysql_free_result($result);
		}
		echo $out;	
	}	
?>