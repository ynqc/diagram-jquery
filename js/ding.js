var firstConHtml,conHtml,approvalHtml,copyHtml;
$(function(){
    //html模板加载
    firstConHtml=$("#branchFirstHtmlTemp").html();
    conHtml=$("#branchNodeHtmlTemp").html();
    approvalHtml=$("#approvalHtmlTemp").html();
    copyHtml=$("#copyHtmlTemp").html();
    
    initFun();

})

$(window).resize(function(){
     calcuBodyHeight();
})

function initFun(){
    //加号
    $(document).on('click','.btn',function(){
        var pos=$(this).offset();
        var divLeft,divTop;
        if($(window).width()-pos.left<260){
            divLeft=pos.left-$(this).width()-260
        }else{
            divLeft=pos.left+$(this).width()+20
        }
        if($(window).height()-pos.top<120){
            divTop=pos.top+$(this).height()-120
        }else{
            divTop=pos.top
        }
        
        $(".popover").css({
            left:divLeft,
            top:divTop
        }).show();
        var parent;
        if ($(this).closest(".node-wrap").length) {
            parent = $(this).closest(".node-wrap");
        } else if ($(this).closest(".condition-node").length) {
            parent = $(this).closest(".condition-node");
        } else {
            parent = $(this).closest(".branch-wrap");
        }
        popoverClick(parent);
    });

    //添加删除平级条件
    addDelBranch();
    //添加删除审批人 抄送人
    addDelNodeWrap();

    calcuBodyHeight();
    
    
     //弹窗确定按钮
    $("#btnSetSave").on("click",function(){
        saveData($("#hidElement").val());
    });
    
    //弹窗取消按钮
    $("#btnSetCancel").on("click",cancleSaveData);
    
    //放大
    $("#zoomOut").click(function(){
        zoomOut();
    })
    
    //缩小
    $("#zoomIn").on("click",function(){
        zoomIn();
    })
    
    zoomKeyCodeEvent();
    
    $(".switch_wrap input").on("change",function(){
        $(this).is(":checked")? $(this).siblings(".switch_label").attr("data-checked",true):
            $(this).siblings(".switch_label").attr("data-checked",false);
    })
    
    
}
function zoomOut(){
    var zoomTimes = parseFloat($("#addcontent").attr("value"));
    zoomTimes >= 1.5 ? zoomTimes = 1.5 : zoomTimes = (zoomTimes + 0.1).toFixed(1);
    $("#addcontent").attr("value", zoomTimes);
    $("#scalePercent").text(parseInt(zoomTimes*100)+"%");
    $("#content").css({"transform": "scale(" + zoomTimes + "," + zoomTimes + ")", "transform-origin": "0 0"});
}
function zoomIn(){
    var zoomTimes = parseFloat($("#addcontent").attr("value"));
    zoomTimes <= 0.5 ? zoomTimes = 0.5 : zoomTimes = (zoomTimes - 0.1).toFixed(1);
    $("#addcontent").attr("value", zoomTimes);
    $("#scalePercent").text(parseInt(zoomTimes*100)+"%");
    $("#content").css({"transform": "scale(" + zoomTimes + "," + zoomTimes + ")", "transform-origin": "0 0"});
}
//增加删除条件时 开始结束节点宽度与内容保持一致
function calculateNodeWrapWidth() {
    var arr=[];
    var contentWidth;
    if($("#content").children(".branch-wrap").length<=1){
        contentWidth = $("#content>.branch-wrap>.branch-box-wrap>.branch-box").width();
    }else{
        $("#content").children(".branch-wrap").each(function(){
            var _selfboxWidth=$(this).children(".branch-box-wrap").children(".branch-box").width();
            arr.push(_selfboxWidth);
        })
        contentWidth=Math.max.apply(null,arr);
    }
    if (contentWidth > $(window).width()) {
        $("#content>.node-wrap").width(contentWidth);
        $("#content>.branch-wrap").width(contentWidth);
    } else {
        $("#content>.node-wrap").width("100%");
        $("#content>.branch-wrap").width("100%");
    }
    
}
//弹框选择增加审批  抄送  条件
function popoverClick(parent){
    var $parent=$(parent);
    $("#approvalBtn").unbind('click').bind("click",function(){
        $parent.after($.format(approvalHtml,new Date().getTime()));
        calculateNodeWrapWidth();
        $(".popover").hide();
    })
    $("#copyBtn").unbind('click').bind("click",function(){
        $parent.after($.format(copyHtml,new Date().getTime()));
        calculateNodeWrapWidth();
        $(".popover").hide();
    })
    $('#branchBtn').unbind('click').bind("click",function(){
        var html="";
        var len=$parent.nextAll().length;
       for(var i=0;i<len;i++){
            if(!$parent.next().hasClass("end-node")&&!$parent.next().hasClass("top-right-cover-line")&&!$parent.next().hasClass("bottom-right-cover-line")){
                html+=$parent.next().prop("outerHTML");
                $parent.next().remove();
            }
        }
        $parent.after(firstConHtml);
        $parent.next().find(".col-box:first>.condition-node").after(html);
        $parent.next().find(".col-box:first>.condition-node").nextAll().width("auto");
        calculateNodeWrapWidth();
        $(".popover").hide();
        
    })
    
    $("#close").click(function(){
        $(".popover").hide();
    })
    
    $(document).on("click",function(e){
        e=e||event;
        if( $(e.target).closest("button").length==0){
            $(".popover").hide();
        }
    })
}

function saveData(_body){
   var checkedRadio=$(".audit_ul li").find("input[name=auditRule]:checked");
   if(checkedRadio.length){
       var checkedTxt=checkedRadio.next().text();
       $("#"+_body).find(".node-wrap-body-txt").text(checkedTxt);
   }
   
   cancleSaveData();
}

function cancleSaveData(){
    $(".drawerMask,.drawerDialogContainer").hide();
    $("#approveBox,#branchBox,#copyBox").hide();
}

//添加删除审批人抄送人
function addDelNodeWrap(){
    //审批人/抄送人选择
    $(document).on("click",".node-wrap-body",function(e){
        var  _selfId=$(e.target).closest(".node-wrap").attr("id");
        $("#hidElement").val(_selfId);
        $(".drawerMask,.drawerDialogContainer").show();
        $("#approveBox").show();
        $("#addcontentPop").height($(window).height()-$("#secondfooter").height());
        $(".drawerDialogContainer").width($(window).width()*0.4).animate({"right":"0"},'fast');
        
    });
    
    $(document).on("click","span[name=node-close]",function(){
        $(this).closest(".node-wrap").remove();
    })
}

//添加删除平级条件
function addDelBranch(){
    var lineAfterHtml='<div class="top-right-cover-line"></div><div class="bottom-right-cover-line"></div>';
    var lineBeforeHtml='<div class="top-left-cover-line"></div><div class="bottom-left-cover-line"></div>';
    $(document).on("click",".add-branch",function(){
       var _parent=$(this).parent(".branch-box");

       _parent.children(".col-box:last").children(".condition-node").children(".bottom-right-cover-line").remove();
       _parent.children(".col-box:last").children(".condition-node").children(".top-right-cover-line").remove();
      
       _parent.append(conHtml);//增加条件时排序
        calculateNodeWrapWidth();
    });
    
    
    $(document).on("click","span[name=judge-close]",function(){
        var orderNum=$(this).closest(".col-box").next().length;
        if(!orderNum){
            $(this).closest(".col-box").prev().children(".condition-node").append(lineAfterHtml);
        }
        if(!$(this).closest(".col-box").prev(":not(.add-branch)").length){
            $(this).closest(".col-box").next().children(".condition-node").append(lineBeforeHtml);
        }
        if($(this).closest(".branch-box").find(".col-box").length==1){
            $(this).closest(".branch-wrap").remove();
        }
        if($(this).closest(".branch-box").children(".col-box").length==2){
            $(this).closest(".col-box").siblings(".col-box").children(".condition-node").remove();
            var nodeWrapHtml=$(this).closest(".col-box").siblings(".col-box").html();
            $(this).closest(".branch-wrap").after(nodeWrapHtml).remove();
        }
        // 删除平级条件时 条件排序
        /*var nextAllColboxList=$(this).closest(".col-box").nextAll();
        $(nextAllColboxList).each(function(idx,item){
            var prevSort=parseInt($(item).children(".condition-node").attr("sort")-1);
            $(item).children(".condition-node").attr("sort",prevSort);
            $(item).children(".condition-node").find(".auto-judge-tit").text("条件"+prevSort);
        });*/
        $(this).closest(".col-box").remove();
        calculateNodeWrapWidth();
    })
    
    //条件名称设置
    $("#addcontent").on("click",".auto-judge-body",function(){
        var _selfBranch=$(this).find(".auto-judge-body-txt");
        $(".drawerMask,.drawerDialogContainer").show();
        $("#branchBox").show();
        $("#addcontentPop").height($(window).height()-$("#secondfooter").height());
        $(".drawerDialogContainer").width($(window).width()*0.4).animate({"right":"0"},'fast');
    })
    
}

function calcuBodyHeight(){
    $("#addcontent").width($(window).width()).height($(window).height());
}

//浏览器的ctrl+ common+-的缩放事件
function zoomKeyCodeEvent(){
    //ff:-173 +61   // mac win:-189 +187   //小键盘: -109 +107
    $(document).keydown(function (event) {
        if ((event.ctrlKey === true || event.metaKey === true)
            && (event.which === 61 || event.which === 107
                || event.which === 173 || event.which === 109
                || event.which === 187  || event.which === 189))
        {
            event.preventDefault();
        }
    });
    window.addEventListener("mousewheel", function(event){
        if(event.which === 0 && (event.ctrlKey === true || event.metaKey)){
            event.preventDefault();
        }
    }, { passive: false })

    //键盘 ctrl +/-号放大缩小
    $(document).keydown(function (event) {
        //缩小 - 109 189 173
        if ((event.ctrlKey === true || event.metaKey === true)
            && (event.which === 109 || event.which === 189 || event.which === 173)){
            zoomIn();
        }
        //放大 + 107 187 61
        if ((event.ctrlKey === true || event.metaKey === true)
            && (event.which === 107 || event.which === 187 || event.which === 161)){
            zoomOut();
        }
    });
    $(document).bind('mousewheel DOMMouseScroll', function (event) {
        if (event.ctrlKey === true || event.metaKey && event.originalEvent.wheelDelta) {
            if(event.originalEvent.wheelDelta>0){ //IE 谷歌
                zoomOut();
            }
            if(event.originalEvent.wheelDelta<0){
                zoomIn();
            }else if(event.originalEvent.detail){// ff
                if(event.originalEvent.detail>0){
                    zoomIn();
                }
                if(event.originalEvent.detail<0){
                    zoomOut();
                }
            }
        }
    });
}
//format  字符串格式化插件
$.format = function (source, params) {
    if (arguments.length == 1)
        return function () {
            var args = $.makeArray(arguments);
            args.unshift(source);
            return $.format.apply(this, args);
        };
    if (arguments.length > 2 && params.constructor != Array) {
        params = $.makeArray(arguments).slice(1);
    }
    if (params.constructor != Array) {
        params = [params];
    }
    $.each(params, function (i, n) {
        source = source.replace(new RegExp("\\{" + i + "\\}", "g"), n);
    });
    return source;
};

