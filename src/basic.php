<?php
require 'php/Page.php';
Page::useSimulator();
Page::useScript('basic/js/stage.js');
Page::head('Basic');
?>
<h1>Basic simulation</h1>
<fieldset>
    <legend>Control</legend>
    <div class="form-group">
        <input type="checkbox" name="" id="fast-car">
        <label for="fast-car">
            Fast cars exists
        </label>
    </div>
</fieldset>
<div id="stage"></div>


<?php
Page::foot();

