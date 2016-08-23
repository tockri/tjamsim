<?php
require 'php/Page.php';
Page::useSimulator();
Page::useScript('basic/js/stage.js');
Page::head('Basic');
?>
<h1>Basic simulation</h1>
<div class="checkbox">
    <label>
        <input type="checkbox" name="" id="fast-car">
        Fast car exists
    </label>
</div>
<div id="stage"></div>


<?php
Page::foot();

