<?php
/**
 * Created by PhpStorm.
 * User: hejun
 * Date: 15/9/26
 * Time: 12:00
 */
error_reporting(1);
date_default_timezone_set("PRC");
include 'mainClass.php';
//初始化数据
//.separator ","
//.import coupons.txt coupons
$main = new main();
$type = $_GET['action'];
$main->doAction($type, $_REQUEST);