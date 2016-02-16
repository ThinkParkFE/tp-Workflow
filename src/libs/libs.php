<?php
include "NotORM.php";
/**
 * Created by hejun on 15/9/28.
 */
class libs
{
    public function __construct()
    {
        $this->pdo = new PDO("sqlite:" . dirname(__FILE__) . "/../db/main.sqlite");
        $this->db = new NotORM($this->pdo);
//        $this->db->debug=1;
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
     * 验证邮箱地址
     * @param $email
     * @return bool
     */
    function validEmail($email)
    {
        $isValid = true;
        $atIndex = strrpos($email, "@");
        if (is_bool($atIndex) && !$atIndex) {
            $isValid = false;
        } else {
            $domain = substr($email, $atIndex + 1);
            $local = substr($email, 0, $atIndex);
            $localLen = strlen($local);
            $domainLen = strlen($domain);
            if ($localLen < 1 || $localLen > 64) {
                // local part length exceeded
                $isValid = false;
            } else if ($domainLen < 1 || $domainLen > 255) {
                // domain part length exceeded
                $isValid = false;
            } else if ($local[0] == '.' || $local[$localLen - 1] == '.') {
                // local part starts or ends with '.'
                $isValid = false;
            } else if (preg_match('/\\.\\./', $local)) {
                // local part has two consecutive dots
                $isValid = false;
            } else if (!preg_match('/^[A-Za-z0-9\\-\\.]+$/', $domain)) {
                // character not valid in domain part
                $isValid = false;
            } else if (preg_match('/\\.\\./', $domain)) {
                // domain part has two consecutive dots
                $isValid = false;
            } else if
            (!preg_match('/^(\\\\.|[A-Za-z0-9!#%&`_=\\/$\'*+?^{}|~.-])+$/',
                str_replace("\\\\", "", $local))
            ) {
                // character not valid in local part unless
                // local part is quoted
                if (!preg_match('/^"(\\\\"|[^"])+"$/',
                    str_replace("\\\\", "", $local))
                ) {
                    $isValid = false;
                }
            }
            if ($isValid && !(checkdnsrr($domain, "MX") || checkdnsrr($domain, "A"))) {
                // domain not found in DNS
                $isValid = false;
            }
        }
        return $isValid;
    }

    /**
     * gettime 获取系统时间
     * @return bool|string [统一系统时间]
     */
    public function gettime()
    {
        return date("Y-m-d H:i:s");
    }

    /**
     * get_real_ip  获取用户
     * @return string [ip地址]
     */
    public function get_real_ip()
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