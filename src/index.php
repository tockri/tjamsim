<?php
require 'php/Page.php';
Page::head('Table of contents');
?>
<h1>Table of contents</h1>
<?php
Page::ls(__DIR__, basename(__FILE__));
?>



<?php
Page::foot();

