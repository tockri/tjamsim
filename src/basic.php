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
<div class="measured">
    <div>
        <label>Elapsed Time(sec) : </label><span id="elapsed-time">0</span>
    </div>
    <div>
        <label>Finished Count : </label><span id="finished-count">0</span>
    </div>
    <div>
        <label>Flow Rate(finished per seconds) :</label><span id="flow-rate">0</span>
    </div>
</div>
<div id="stage"></div>


<?php
Page::foot();

