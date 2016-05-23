//$("#div_item_list").append('<div class="col-md-3"><div class="item_list"></div></div>');
$.get("./content/index.json",function(result){
    if(result.item_list){
        for(var i=0;i<result.item_list.length;i++){
            $("#div_item_list").append('<div class="col-md-3"><div class="item_list"></div></div>');
        }
    }
});