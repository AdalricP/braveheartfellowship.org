<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'ok' => false,
        'message' => 'Method not allowed.'
    ]);
    exit;
}

function clean_input(string $value): string
{
    $value = trim($value);
    $value = preg_replace("/[\r\n]+/", ' ', $value);
    return $value ?? '';
}

$applicationType = clean_input($_POST['application_type'] ?? '');
$name = clean_input($_POST['name'] ?? '');
$email = clean_input($_POST['email'] ?? '');
$referralCode = clean_input($_POST['referral_code'] ?? '');
$researchArea = clean_input($_POST['research_area'] ?? '');

if (!in_array($applicationType, ['fellowship', 'grant'], true)) {
    http_response_code(422);
    echo json_encode([
        'ok' => false,
        'message' => 'Invalid application type.'
    ]);
    exit;
}

if ($name === '' || $researchArea === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(422);
    echo json_encode([
        'ok' => false,
        'message' => 'Please complete all required fields with a valid email.'
    ]);
    exit;
}

$storageDir = __DIR__ . '/storage';
$csvPath = $storageDir . '/submissions.csv';

if (!is_dir($storageDir) && !mkdir($storageDir, 0755, true) && !is_dir($storageDir)) {
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'message' => 'Could not create storage directory.'
    ]);
    exit;
}

$isNewFile = !file_exists($csvPath);
$handle = fopen($csvPath, 'ab');

if ($handle === false) {
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'message' => 'Could not open submissions file.'
    ]);
    exit;
}

if (!flock($handle, LOCK_EX)) {
    fclose($handle);
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'message' => 'Could not lock submissions file.'
    ]);
    exit;
}

if ($isNewFile) {
    fputcsv($handle, [
        'submitted_at_utc',
        'application_type',
        'name',
        'email',
        'referral_code',
        'research_area'
    ]);
}

fputcsv($handle, [
    gmdate('c'),
    $applicationType,
    $name,
    $email,
    $referralCode,
    $researchArea
]);

fflush($handle);
flock($handle, LOCK_UN);
fclose($handle);

echo json_encode([
    'ok' => true,
    'message' => 'Application received.',
    'application_type' => $applicationType
]);
