<?php
require 'php/Page.php';
Page::head('目次');
?>
<h1>目次</h1>
<?php
Page::ls(__DIR__, basename(__FILE__));
?>



<?php
Page::foot();

