<?php

declare(strict_types=1);
class SessionManager
{

	public $life_time;

	// PHP4-style constructor replaced with __construct for PHP 7+
	function __construct()
	{
		//$session_maxlifetime = get_cfg_var("session.gc_maxlifetime");
		$session_maxlifetime = 43200;
		$this->life_time = $session_maxlifetime;
		session_set_save_handler(
			$this->open(...),
			$this->close(...),
			$this->read(...),
			$this->write(...),
			$this->destroy(...),
			$this->gc(...)
		);
	}

	function open($save_path, $session_name)
	{

		global $sess_save_path;

		$sess_save_path = $save_path;

		// Don't need to do anything. Just return TRUE.

		return true;
	}

	function close()
	{

		return true;
	}

	function read($id)
	{
		$data = '';
		$db = DB::getInstance()->getConnection();
		$conn = new \OneAIAffiliate\Database\Connection($db);
		$id = $conn->escape($id);
		$sql = "SELECT session_data FROM sessions WHERE session_id = '$id' AND expires > UNIX_TIMESTAMP()";
		$rs = $conn->query($sql);
		if ($rs && $rs->num_rows > 0) {
			$row = $rs->fetch_assoc();
			$data = $row['session_data'];
		}
		return $data;
	}

	function write($id, $data)
	{
		$db = DB::getInstance()->getConnection();
		$conn = new \OneAIAffiliate\Database\Connection($db);
		$time = time() + $this->life_time;
		$id = $conn->escape($id);
		$data = $conn->escape($data);
		$sql = "REPLACE INTO sessions (session_id, session_data, expires) VALUES('$id', '$data', $time)";
		$conn->query($sql);
		return true;
	}

	function destroy($id)
	{
		$db = DB::getInstance()->getConnection();
		$conn = new \OneAIAffiliate\Database\Connection($db);
		$id = $conn->escape($id);
		$sql = "DELETE FROM sessions WHERE session_id = '$id'";
		$conn->query($sql);
		return true;
	}

	function gc()
	{
		$db = DB::getInstance()->getConnection();
		$conn = new \OneAIAffiliate\Database\Connection($db);
		$sql = 'DELETE FROM sessions WHERE expires < UNIX_TIMESTAMP()';
		$conn->query($sql);
		return true;
	}
}
