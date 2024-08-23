<?php

/**
 * BULLETIN FUSION
 * 
 * By Sam Wilcox <sam@bulletinfusion.com>
 * https://www.bulletinfusion.com
 * 
 * This software is released under the MIT license.
 * For further details, visit:
 * https://license.bulletinfusion.com
 */

namespace BulletinFusion\Exceptions;

// This file should not be accessed directly, only through the wrapper.
if (!defined('BF_RUNTIME') || BF_RUNTIME != true) {
    die('<h1>Bulletin Fusion Error</h1>This file cannot be accessed directly!');
}

/**
 * Bulletin Fusion specific InvalidPermissionsException.
 */
class InvalidPermissionsException extends \Exception {
    /**
     * Constructor for InvalidPermissionsException.
     * @param string $message - The error message.
     * @param integer [$code=0] - The error code (optional).
     * @param \Throwable [$previous=null] - The previous throwable for the exception chaining (optional).
     */
    public function __construct($message, $code = 0, \Throwable $previous = null) {
        parent::__construct($message, $code, $previous);
    }

    /**
     * String representation of the exception.
     * @return string - The string representation of the exception.
     */
    public function __toString() {
        return \sprintf(
            "InvalidPermissionsException [%d]: %s is in %s:%d\nStack trace:\n%s",
            $this->code,
            $this->message,
            $this->file,
            $this->line,
            $this->getTraceAsString()
        );
    }
}