<?php
require_once('./PHPMAILER/Exception.php');
require_once('./PHPMAILER/PHPMailer.php');
require_once('./PHPMAILER/SMTP.php');

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\SMTP;

function startHeaders() {
    header('Content-type:application/json;charset=utf-8');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
    header("Cache-Control: post-check=0, pre-check=0", false);
    header("Pragma: no-cache");
}

function getargs() {
    $cuerpo = json_decode(file_get_contents('php://input'),true);
    $cabecera = getallheaders();
    $urlArgs = $_REQUEST;
    if($cabecera == null){
       $cabecera = array();
    }
    if($cuerpo == null){
       $cuerpo = array();
    }
    if($urlArgs == null){
       $urlArgs = array();
    }
    $args = array_merge($cabecera, $cuerpo, $urlArgs);
    return $args;
}

function enviarMail($FromEmail, $FromAlias, $FromClave, $ReplyEmail, $ReplyAlias, $ToEmail, $ToAlias, $Mensaje, $Asunto, $Attchments) {
    $EstadoEnvio = false;
    try{
        $mail = new PHPMailer(true);
        $mail->isSMTP();
        $mail->Host = 'smtp.gmail.com';
        $mail->Port = 587;
        $mail->SMTPSecure = 'tls';
        $mail->SMTPAuth = true;
        $mail->Username = $FromEmail;
        $mail->Password = $FromClave;
        $mail->setFrom( $FromEmail, $FromAlias );
        $mail->addReplyTo( $ReplyEmail, $ReplyAlias );
        $mail->addAddress($ToEmail, $ToAlias);
        $mail->Subject = $Asunto;
        $mail->msgHTML($Mensaje);
        foreach($Attchments as $attachment) {
            $mail->addAttachment($attachment['name'], 'base64', $attachment['type']);
        }
        $EstadoEnvio = $mail->send();
    }catch (Exception $e) {
        $EstadoEnvio = "error";
    }
    return $EstadoEnvio;
}

startHeaders();
$args = getargs();

$FromEmail = $args['FromEmail'];
$FromAlias = $args['FromAlias'];
$FromClave = $args['FromClave'];
$ReplyEmail = $args['ReplyEmail'];
$ReplyAlias = $args['ReplyAlias'];
$ToEmail = $args['ToEmail'];
$ToAlias = $args['ToAlias'];
$Mensaje = $args['Mensaje'];
$Asunto = $args['Asunto'];
$Attchments = $args['Attchments'];

echo enviarMail($FromEmail, $FromAlias, $FromClave, $ReplyEmail, $ReplyAlias, $ToEmail, $ToAlias, $Mensaje, $Asunto, $Attchments);