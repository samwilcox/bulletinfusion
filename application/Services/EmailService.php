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

namespace BulletinFusion\Services;

// This file should not be accessed directly, only through the wrapper.
if (!defined('BF_RUNTIME') || BF_RUNTIME != true) {
    die('<h1>Bulletin Fusion Error</h1>This file cannot be accessed directly!');
}

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use BulletinFusion\Services\SettingsService;
use BulletinFusion\Services\FileService;
use BulletinFusion\Exceptions\EmailException;

/**
 * Provides email related services.
 */
class EmailService {
    /**
     * Singleton instance of this class.
     * @var EmailService
     */
    protected static $instance;

    /**
     * The from field.
     * @var string
     */
    private $from;

    /**
     * Name of the from email.
     * @var string
     */
    private $fromName;

    /**
     * Collection of email(s) to send to.
     * @var array
     */
    private $to = [];

    /**
     * Collection of carbon copy recipients.
     * @var array
     */
    private $cc = [];

    /**
     * Collection of blind carbon copy recipients.
     * @var array
     */
    private $bcc = [];

    /**
     * The email subject.
     * @var string
     */
    private $subject;

    /**
     * The HTML body.
     * @var string
     */
    private $bodyHTML;

    /**
     * The text body.
     * @var string
     */
    private $bodyText;

    /**
     * Collection of attachments.
     * @var array
     */
    private $attachments = [];

    /**
     * Get singleton instance of EmailService.
     * @return EmailService
     */
    public static function getInstance() {
        if (!self::$instance) self::$instance = new self;
        return self::$instance;
    }

    /**
     * Set the from email address.
     * @param string [$from=''] - Optional from email address (default: BB set email address).
     * @param string [$fromName=''] - Optional name for the from address.
     * @return void
     */
    public function setFrom($from = '', $fromName = '') {
        $this->from = $from;
        $this->fromName = $fromName;
    }

    /**
     * Adds an email address to the recipients collection.
     * @param string $email - The email address.
     * @return void
     */
    public function addTo($email) {
        $this->to[] = $email;
    }

    /**
     * Adds an email address to the carbon copy recipients collection.
     * @param string $email - The email address.
     * @return void
     */
    public function addCc($email) {
        $this->cc[] = $email;
    }

    /**
     * Adds an email address to the blind carbon copy recipients collection.
     * @param string $email - The email address.
     * @return void
     */
    public function addBcc($email) {
        $this->bcc[] = $email;
    }

    /**
     * Sets the email subject.
     * @param string $subject - The email subject string.
     * @return void
     */
    public function setSubject($subject) {
        $this->subject = $subject;
    }

    /**
     * Sets the body HTML.
     * @param string $bodyHTML - The HTML body.
     * @return void
     */
    public function setBodyHTML($bodyHTML) {
        $this->bodyHTML = $bodyHTML;
    }

    /**
     * Sets the body text.
     * @param string $bodyText - The text body.
     * @return void
     */
    public function setBodyText($bodyText) {
        $this->bodyText = $bodyText;
    }

    /**
     * Add an attachment.
     * @param string $filePath - Path to the file.
     * @return void
     */
    public function addAttachment($filePath) {
        $this->attachments[] = $filePath;
    }

    /**
     * Send the email.
     * @return void
     */
    public function send() {
        if (SettingsService::getInstance()->emailUseSMTP) {
            $this->sendViaSMTP();
        } else {
            $this->sendViaMail();
        }
    }

    /**
     * Sends email using PHP mail method.
     * @throws EmailException - Thrown on failure to send the email.
     * @return void
     */
    public function sendViaMail() {
        $boundary = \md5(\time());

        $headers = "From: {$this->fromName} <{$this->from}>\r\n";
        $headers .= "MIME-Version: 1.0\r\n";
        $headers .= "Content-Type: multipart/mixed; boundary=\"{$boundary}\"\r\n";
        
        if (!empty($this->cc)) {
            $headers .= "Cc: " . \implode(',', $this->cc) . "\r\n";
        }

        if (!empty($this->bcc)) {
            $headers .= "Bcc: " . \implode(',', $this->bcc) . "\r\n";
        }

        $message = "--{$boundary}\r\n";
        $message .= "Content-Type: multipart/alternative; boundary=\"alt-{$boundary}\"\r\n\r\n";

        $message .= "--alt-{$boundary}\r\n";
        $message .= "Content-Type: text/plain; charset=UTF-8\r\n";
        $message .= "Content-Transfer-Encoding: 7bit\r\n\r\n";
        $message .= $this->bodyText . "\r\n\r\n";

        $message .= "--alt-{$boundary}\r\n";
        $message .= "Content-Type: text/html; charset=UTF-8\r\n";
        $message .= "Content-Transfer-Encoding: 7bit\r\n\r\n";
        $message .= $this->bodyHTML . "\r\n\r\n";
        $message .= "--alt-{$boundary}--\r\n";

        foreach ($this->attachments as $filePath) {
            if (\file_exists($filePath)) {
                $fileName = \basename($filePath);
                $fileData = \chunk_split(\base64_encode(FileService::getInstance()->readFile($filePath)));

                $message .= "--{$boundary}\r\n";
                $message .= "Content-Type: application/octet-stream; name=\"{$fileName}\"\r\n";
                $message .= "Content-Transfer-Encoding: base64\r\n";
                $message .= "Content-Disposition: attachment; filename=\"{$fileName}\"\r\n\r\n";
                $message .= $fileData . "\r\n\r\n";
            }
        }

        $message .= "--{$boundary}--\r\n";

        if (!\mail(\implode(',', $this->to), $this->subject, $message, $headers)) {
            $this->reset();

            throw new EmailException(
                'Failed to send email via PHP mail method',
                0,
                $this->to,
                $this->cc,
                $this->bcc,
                $this->attachments
            );
        }

        $this->reset();
    }

    /**
     * Send email using SMTP method.
     * @throws EmailException - Thrown on failure to send the email.
     * @return void
     */
    public function sendViaSMTP() {
        $mail = new PHPMailer();
        
        $mail->isSMTP();
        $mail->Host = SettingsService::getInstance()->SMTPHost;
        $mail->SMTPAuth = SettingsService::getInstance()->SMTPAuthentication;
        $mail->Username = SettingsService::getInstance()->SMTPUsername;
        $mail->Password = SettingsService::getInstance()->SMTPPassword;
        $mail->SMTPSecure = SettingsService::getInstance()->SMTPSecureMethod;
        $mail->Port = SettingsService::getInstance()->SMTPPort;
        
        $mail->setFrom($this->from, $this->fromName);

        foreach ($this->to as $recipient) {
            $mail->addAddress($recipient);
        }

        foreach ($this->cc as $recipient) {
            $mail->addCC($recipient);
        }

        foreach ($this->bcc as $recipient) {
            $mail->addBCC($recipient);
        }

        $mail->isHTML(true);
        $mail->Subject = $this->subject;
        $mail->Body = $this->bodyHTML;
        $mail->AltBody = $this->bodyText;
        
        foreach ($this->attachments as $filePath) {
            $mail->addAttachment($filePath);
        }
        
        if (!$mail->send()) {
            $this->reset();
            echo 'here'; exit;
            throw new EmailException(
                'Failed to send email via SMTP method',
                0,
                $this->to,
                $this->cc,
                $this->bcc,
                $this->attachments,
                $mail->ErrorInfo
            );
        }

        $this->reset();
    }

    /**
     * Resets the class properties.
     * @return void
     */
    public function reset() {
        $this->from = '';
        $this->fromName = '';
        $this->to = [];
        $this->cc = [];
        $this->bcc = [];
        $this->subject = '';
        $this->bodyHTML = '';
        $this->bodyText = '';
        $this->attachments = [];
    }
}