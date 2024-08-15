<?php

$blockData = (object) [
    'all' => (object) [
        'enabled' => false,
        'blocks' => (object) [
            'left' => null,
            'right' => null
        ]
    ],
    'pages' => (object) [
        'enabled' => true,
        'pages' => (object) [
            'Home' => (object) [
                'blocks' => (object) [
                    'left' => [
                        0 => 1,
                        1 => 6
                    ],
                    'right' => [
                        0 => 3,
                        1 => 9,
                        2 => 2
                    ]
                ]
            ] 
        ]
    ]
];

echo '<pre>';
var_dump($blockData);
echo '</pre>';