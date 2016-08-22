<?php
require 'php/Page.php';
Page::useSimulator();
Page::useScript('basic/js/stage.js');
Page::head('基本');
?>
<h1>基本のシミュレーション</h1>
<div id="stage"></div>


<?php
Page::foot();

