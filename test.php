<?php

$text = <<<EOF
Hey @john_doe, have you seen the latest post by @maria-o’connor? I think it’s about the new features that @dev_team added last week.

Also, @éclairPâtissière and @smörgåsbord#1, I’ve tagged you both because we need your feedback on the upcoming event. @dj_🎧_night was also interested, but I’m not sure if he’s available.

By the way, @the_great_gatsby! What are your thoughts on the collaboration with @李小龙 (Bruce Lee)? It’s going to be an epic project!

Lastly, I’d like to shout out to @naïve_user! You did a great job on the presentation last week. And @user_1234, thanks for the quick response to the support ticket.
EOF;

function extractMentions($text) {
    preg_match_all("/@([^\s.,!?;:()]+)/", $text, $matches);
    return $matches[1];
}

$list = extractMentions($text);

foreach ($list as $item) {
    echo $item . '<br>';
}