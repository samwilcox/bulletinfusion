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
 * Bulletin Fusion specific EmailException.
 */
class EmailException extends \Exception {
    /**
     * The to email addresses.
     * @var array
     */
    private $toEmailAddresses = [];

    /**
     * The CC email addresses.
     * @var array
     */
    private $ccEmailAddresses = [];

    /**
     * The BCC email addresses.
     * @var array
     */
    private $bccEmailAddresses = [];

    /**
     * The collection of attachments.
     * @var array
     */
    private $attachments = [];

    /**
     * SMTP server response.
     * @var string
     */
    private $smtpResponse;

    /**
     * Additional context related to the email error.
     * @var array
     */
    private $context;

    /**
     * Constructor for EmailException.
     * @param string $message - The error message.
     * @param integer [$code=0] - The error code (optional).
     * @param array [$toEmailAddresses=[]] - Collection of to recipient emails.
     * @param array [$ccEmailAddresses=[]] - Collection of CC recipient emails.
     * @param array [$bccEmailAddresses=[]] - Collection of BCC recipient emails.
     * @param array [$attachments=[]] - Collection of attachments.
     * @param string [$smtpResponse=''] - SMTP server response.
     * @param array [$context=[]] - Additional context for the errror.
     * @param \Throwable [$previous=null] - The previous throwable for the exception chaining (optional).
     */
    public function __construct($message, $code = 0, array $toEmailAddresses = [], array $ccEmailAddresses = [], array $bccEmailAddresses = [], array $attachments = [], $smtpResponse = '', array $context = [], \Throwable $previous = null) {
        $this->toEmailAddresses = $toEmailAddresses;
        $this->ccEmailAddresses = $ccEmailAddresses;
        $this->bccEmailAddresses = $bccEmailAddresses;
        $this->attachments = $attachments;
        $this->smtpResponse = $smtpResponse;
        $this->context = $context;
        parent::__construct($message, $code, $previous);
    }

    /**
     * Get the collection of to email addresses.
     * @return array - Collection of to email addresses.
     */
    public function getToEmailAddresses() {
        return $this->toEmailAddresses;
    }

    /**
     * Get the collection of CC email addresses.
     * @return array - Collection of CC email addresses.
     */
    public function getCcEmailAddresses() {
        return $this->ccEmailAddresses;
    }

    /**
     * Get the collection of BCC email addresses.
     * @return array - Collection of BCC email addresses.
     */
    public function getBccEmailAddresses() {
        return $this->bccEmailAddresses;
    }

    /**
     * Get the collection of attachments.
     * @return array - Collection of attachments.
     */
    public function getAttachments() {
        return $this->attachments;
    }

    /**
     * Get the SMTP response.
     * @return string - SMTP response string.
     */
    public function getSmtpResponse() {
        return $this->smtpResponse;
    }

    /**
     * Get additional context for the error.
     * @return array - Additional context.
     */
    public function getContext() {
        return $this->context;
    }

    /**
     * String representation of the exception.
     * @return string - The string representation of the exception.
     */
    public function __toString() {
        $toEmailAddresses = \json_encode($this->toEmailAddresses);
        $ccEmailAddresses = \json_encode($this->ccEmailAddresses);
        $bccEmailAddresses = \json_encode($this->bccEmailAddresses);
        $attachments = \json_encode($this->attachments);
        $context = \json_encode($this->context);
        return __CLASS__ . ": [{$this->code}]: {$this->message} (To Email Addresses: {$toEmailAddresses}, CC Email Addresses: {$ccEmailAddresses}, BCC Email Addresses: {$bccEmailAddresses}, Attachments: {$attachments}, SMTP Response: {$this->smtpResponse}, Context: {$context})\n";
    }
}