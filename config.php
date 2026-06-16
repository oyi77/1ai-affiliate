<?php
declare(strict_types=1);
$dbname = 'prosper1ai_test';
$dbuser = 'affiliate';
$dbpass = 'testpass';
$dbhost = 'localhost';
$dbhostro = 'localhost';
$mchost = 'localhost';

class DB {
    private $_connection,$_connectionro;
    private static $_instance;
    public static function getInstance() {
        if(!self::$_instance) {
            self::$_instance = new self();
        }
        return self::$_instance;
    }
    private function __construct() {
        global $dbhost,$dbhostro,$dbuser,$dbpass,$dbname;
        $this->_connection = new mysqli($dbhost, $dbuser, $dbpass, $dbname);
        $this->_connectionro = new mysqli($dbhostro, $dbuser, $dbpass, $dbname);
    }
    private function __clone() { }
    public function getConnection() { return $this->_connection; }
    public function getConnectionro() { return $this->_connectionro; }
}

try {
    $database = DB::getInstance();
    $db = $database->getConnection();
    $dbro = $database->getConnectionro();
} catch (Exception) {
    $db = false;
    $dbro = false;
}
