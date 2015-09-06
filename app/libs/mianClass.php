<?php
require '../../vendor/autoload.php';
include 'libsClass.php';
/**
 * Created by PhpStorm.
 * User: hejun
 * Date: 15/8/3
 * Time: 09:55
 */
class main extends main
{
    public function __construct()
    {
        $pdo = new PDO("sqlite:" . dirname(__FILE__) . "/../db/main.sqlite");
        $this->db = new NotORM($pdo);
        $this->db->debug = false;
    }

    public function doAction($method = '', $params = array())
    {
        if (method_exists($this, $method)) {
            call_user_func(array($this, $method), $params);
        } else {
            $this->response(400, '参数错误');
        }
    }
    /**
     * 获取系统时间
     * @return [date] [同意系统时间]
     */
    function gettime(){
        return date("Y-m-d H:i:s");
    }
    /**
     * 获取用户
     * @return [string] [ip地址]
     */
    function get_real_ip()
    {
        if (!empty($_SERVER["HTTP_CLIENT_IP"])) {
            $cip = $_SERVER["HTTP_CLIENT_IP"];
        } elseif (!empty($_SERVER["HTTP_X_FORWARDED_FOR"])) {
            $cip = $_SERVER["HTTP_X_FORWARDED_FOR"];
        } elseif (!empty($_SERVER["REMOTE_ADDR"])) {
            $cip = $_SERVER["REMOTE_ADDR"];
        } else {
            $cip = "Unknown";
        }
        return $cip;
    }

    /**
     * response 输出
     * @param $ret
     * @param $data
     */
    public function response($ret, $data)
    {
        $res = array();
        $res["ret"] = $ret;
        if ($ret == 200) {
            $res["data"] = $data;
        } else {
            $res["msg"] = $data;
        }
        header("Content-Type: application/json");
        die(json_encode($res));
    }
}