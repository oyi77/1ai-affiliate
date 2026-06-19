<?php
declare(strict_types=1);
class Role
{
    private static $db;
    private static \OneAIAffiliate\Database\Connection $conn;
    protected array $permissionList = [];
    
    protected function __construct()
    {   
        try {
            $database = DB::getInstance();
            self::$db = $database->getConnection();
            self::$conn = new \OneAIAffiliate\Database\Connection(self::$db);
        } catch (Exception) {
            self::$db = false;
        }

        $this->permissionList = [];
    }
 
    public static function getRole($role_id)
    {
        $role = new Role();
        
        $mysql['role_id'] = self::$conn->escape((string) $role_id);
        $sql = "SELECT 2p.permission_description FROM role_permission AS 2rp INNER JOIN permissions AS 2p ON 2rp.permission_id = 2p.permission_id WHERE 2rp.role_id = '".$mysql['role_id']."'";
        $results = self::$conn->query($sql);
        
        while($row = $results->fetch_assoc())
        {
            $role->permissionList[$row["permission_description"]] = true;
        }

        return $role;
    }
 
    public function verifyPermission($permission)
    {
        return isset($this->permissionList[$permission]);
    }
}