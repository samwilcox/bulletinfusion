<?php

$blockData = (object) [
    'all' => (object) [
        'enabled' => true,
        'blocks' => (object) [
            'left' => [
                0 => 1
            ],
            'right' => null
        ]
    ],
    'pages' => (object) [
        'enabled' => false,
        'pages' => (object) [
            'Home' => (object) [
                'blocks' => (object) [
                    'left' => null,
                    'right' => null
                ]
            ] 
        ]
    ]
];

echo serialize($blockData);