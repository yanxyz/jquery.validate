<?php

header('Content-Type: text/html; charset=utf-8');

if (!empty($_GET['email'])) {
	sleep(2); // 延时模拟
	if ($_GET['email'] === 'admin@admin.com') {
		$arr = array ('available'=>false, 'msg'=>"此邮箱已经注册");
	} else {
		$arr = array ('available'=>true, 'msg'=>"此邮箱可以注册");
	}
	echo json_encode($arr);
}

?>