$(function () {
    var _tap = ("ontouchstart" in window) ? "tap" : "click";
    new mo.Landscape();
    new mo.PCPrompt({
        url: 'http://www.socialpark.com.cn/',
        title: 'social park',
        description: ' ',
        preview: 'http://www.socialpark.com.cn/assets/images/preview.jpg',
        prefix: 'pc',
        jump: function () {
            alert('请用移动端扫一扫二维码，进行浏览。');
            $("#pc_jump").hide();
        }
    });

    tp.wx.init({
        title: "social park",
        desc: "social park。",
        link: "http://www.socialpark.com.cn/",
        imgUrl: "http://www.socialpark.com.cn/favicon.ico"
    });



    //2016
    //tp.tongji(");

});
