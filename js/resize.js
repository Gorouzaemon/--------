$(window).on('load',function(){
    const width = $(window).width();
    $('.width span').text(width + 'px');
});
$(window).resize(function () {
    const width = $(window).width();
    $('.width span').text(width + 'px');
  });