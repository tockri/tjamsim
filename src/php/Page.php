<?php

class Page {
    private static $loadPixi = false;
    private static $scripts = [];
    private static $styles = [];

    static function useSimulator() {
        self::$loadPixi = true;
    }

    static function useScript($script) {
        self::$scripts[] = $script;
    }

    private static function echoScripts() {
        foreach(self::$scripts as $script) {
            echo "<script type=\"text/javascript\" src=\"{$script}\"></script>";
        }
    }

    static function useStyle($style) {
        self::$styles[] = $style;
    }

    private static function echoStyles() {
        foreach(self::$styles as $style) {
            echo "<link rel='stylesheet' href=\"{$style}\" />";
        }
    }

    static function head($title) {
        $script = '';
        if (self::$loadPixi) {
            $script = <<<END
<script src="https://code.jquery.com/jquery-3.1.0.slim.min.js" integrity="sha256-cRpWjoSOw5KcyIOaZNo4i6fZ9tKPhYYb6i5T9RSVJG8=" crossorigin="anonymous"></script>
<script type="text/javascript" src="js/lib/pixi.js"></script>
<script type="text/javascript" src="js/cloud-simulator.js"></script>
END;
        }
        echo <<<END
<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<link rel="shortcut icon" href="img/favicon.ico" type="image/vnd.microsoft.ico" />
<link href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">
<link rel="stylesheet" href="css/style.css" />
<title>{$title} | Traffic jam simulator</title>
{$script}
END;
        self::echoStyles();
        self::echoScripts();
        echo <<<END
</head>
<body>

<nav class="navbar navbar-inverse navbar-fixed-top">
  <div class="container">
    <div class="navbar-header">
      <a class="navbar-brand" href="/index.php">Traffic jam simulator</a>
    </div>
  </div>
</nav>

<div class="container">
END;
    }

    static function ls($dir, $except = '') {
        echo '<ul>';
        foreach(glob("{$dir}/*.php") as $path) {
            $fname = basename($path);
            if ($fname != $except) {
                echo "<li><a href='{$fname}'>{$fname}</a>";
            }
        }
        echo '</ul>';
    }

    static function foot() {
        echo <<<END
</div>
</body>
</html>
END;

    }
}