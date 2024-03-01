function pagetopanime(){
    var height=$(window).scrollTop();
    if(height >= 200){
        $('#page-top').removeClass('downmove');
        $('#page-top').addClass('upmove');
    } else{
        if($('#page-top').hasClass('upmove')){
            $('#page-top').removeClass('upmove');
            $('#page-top').addClass('downmove');
        }
    }
}
$(window).scroll(function(){
  pagetopanime();
});
$('#page-top').click(function(){
  $('html,body').animate({
   scrollTop:0
  },700);
});
