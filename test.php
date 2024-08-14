<?php

$files = [
    'italic' => [
        '900' => 'Lato-Black.woff2',
        '100' => 'Lato-Thin.woff2',
        '400' => 'Lato-Regular.woff2',
        '300' => 'Lato-Light.woff2',
        '700' => 'Lato-Bold.woff2'
    ],
    'normal' => [
        '100' => 'Lato-ThinItalic.woff2',
        '300' => 'Lato-LightItalic.woff2',
        '400' => 'Lato-Italic.woff2',
        '700' => 'Lato-BoldItalic.woff2',
        '900' => 'Lato-BlackItalic.woff2'
    ]
];

$serialize = serialize($files);

echo $serialize;