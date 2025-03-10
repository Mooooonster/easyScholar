let default_translateWhere = "google";
let default_translateKeycode = "84";
let default_translateColor = "#55aaff";

$(function () {
  $('[data-toggle="tooltip"]').tooltip();  // 生成工具提示
})

// translation.html
$(function(){
	let translateWhere ;
	let translateKeycode ;
	let translateColor ;
	
	chrome.storage.sync.get({"translateWhere": default_translateWhere, "translateKeycode": default_translateKeycode, "translateColor": default_translateColor}, function(items) {
		translateWhere = items.translateWhere;
		translateKeycode = items.translateKeycode;
		translateColor = items.translateColor;
		
		// 回显
		$("input[name=translateKeycode]").val(String.fromCharCode(translateKeycode) );
		$("input[name=translateColor]").val(translateColor) ;
		if(translateWhere == "google"){
			$("#googletranslate").prop("checked",true);
			$("#baidutranslate").prop("checked",false);
		}else if (translateWhere == "baidu"){
			$("#googletranslate").prop("checked",false);
			$("#baidutranslate").prop("checked",true);
		}
	});
	
})

$("#saveTranslateSetting").click(function(){
	let translateWhere = $("input[name=translateWhere]:checked").val();
	let translateKeycodeChar = $("input[name=translateKeycode]").val().toUpperCase();
	let keyCodeList = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];
	let translateKeycode = "84";
	if(translateKeycodeChar.length != 1){
		translateKeycodeChar = "T";
	}
	for(let i = 0; i < keyCodeList.length; i++){
		if(translateKeycodeChar == keyCodeList[i]){
			translateKeycode = 65+i + "";
		}
	}
	let translateColor = $("input[name=translateColor]").val();
	if(translateColor.indexOf("#") == -1 || translateColor.length != 7){
		translateColor = "#55aaff";
	}
	chrome.storage.sync.set({
			"translateWhere": translateWhere,
			"translateKeycode":translateKeycode,
			"translateColor":translateColor
		}, function() {
			setTimeout(function() {
				document.getElementById("saveTranslateSetting").innerHTML="保存该页面所有设置";
			}, 500);
			document.getElementById("saveTranslateSetting").innerHTML="Success!";
		});	
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse){
	if(request.action == "trans_baidu"){

		let row_data = request.data;
		if(row_data.length > 1500){
			return "当前选择的字符数为" + row_data.length + "，已经超过1500，请缩小范围选择。";
		}
		$.ajax({
		    url: 'http://47.115.128.78:7060/baidutranslate',
		    method: 'GET',
		    data: {
		        s: row_data,
		    },
		}).then(function(result){
			sendResponse(result);
		}, function(){
			sendResponse("服务暂时不可用，请稍后再试，若长时间未恢复，请及时和开发者联系：zhangxiangnan0906@outlook.com，或更换谷歌翻译接口");
		});
	}else if(request.action == "trans_google"){
		let row_data = request.data;
		let flag = 0;
		let tl2 ;
		let re=/[\u4E00-\u9FA5]/;
		
		if (re.test(row_data)){
			flag = 1;
		} 
		tl2 = (flag == 0)?"zh-CN" :"en"; 
		$.ajax({
		    url: 'https://translate.googleapis.com/translate_a/single',
		    method: 'GET',
		    data: {
		        client:"gtx",
				sl:"auto",
				tl: tl2,
				dt:"t",
				q:row_data
		    },
		}).then(function(result){
			let all_result = "";
			for(let i = 0; i < result[0].length; i++){
				all_result += result[0][i][0] ;
			}
			sendResponse(all_result);
		}, function(){
			sendResponse("服务暂时不可用，有可能被谷歌禁止，请等3小时后再试，若长时间未恢复，请及时和开发者联系：zhangxiangnan0906@outlook.com");
		});
	}
	return true;
});

// translation.html