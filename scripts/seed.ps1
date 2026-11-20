param(
  [string]$AdminEmail = "admin@nocas.rs",
  [string]$AdminPassword = "nocas123"
)

$api = "http://localhost:3000"
$json = "application/json"

function Get-Token($email, $password, $name, $role) {
  try {
    $body = @{ email = $email; password = $password; name = $name; role = $role } | ConvertTo-Json
    return (Invoke-RestMethod -Method Post -Uri "$api/auth/register" -ContentType $json -Body $body).accessToken
  } catch {
    $body = @{ email = $email; password = $password } | ConvertTo-Json
    return (Invoke-RestMethod -Method Post -Uri "$api/auth/login" -ContentType $json -Body $body).accessToken
  }
}

function Get-AuthHeader($token) {
  return @{ Authorization = "Bearer $token" }
}

$adminBody = @{ email = $AdminEmail; password = $AdminPassword } | ConvertTo-Json
$admin = Get-AuthHeader (Invoke-RestMethod -Method Post -Uri "$api/auth/login" -ContentType $json -Body $adminBody).accessToken
$owner = Get-AuthHeader (Get-Token "vlasnik@test.com" "test123" "Vlasnik" "OWNER")
$user = Get-AuthHeader (Get-Token "test@test.com" "test123" "Test" "USER")
Write-Host "Nalozi spremni: admin, vlasnik@test.com, test@test.com"

foreach ($name in @("Techno", "House", "Hip-hop", "Rock", "Latino")) {
  try {
    Invoke-RestMethod -Method Post -Uri "$api/genres" -ContentType $json -Headers $admin -Body (@{ name = $name } | ConvertTo-Json) | Out-Null
  } catch { }
}
$genres = Invoke-RestMethod -Uri "$api/genres"
function Get-GenreId($name) {
  return ($genres | Where-Object name -eq $name).id
}
Write-Host "Zanrovi spremni: $($genres.Count)"

function Get-VenueId($name, $address, $latitude, $longitude, $capacity) {
  $mine = Invoke-RestMethod -Uri "$api/venues/mine" -Headers $owner
  $existing = $mine | Where-Object name -eq $name
  if ($existing) {
    return $existing.id
  }
  $body = @{ name = $name; address = $address; latitude = $latitude; longitude = $longitude; capacity = $capacity } | ConvertTo-Json
  $venue = Invoke-RestMethod -Method Post -Uri "$api/venues" -ContentType $json -Headers $owner -Body $body
  Invoke-RestMethod -Method Patch -Uri "$api/venues/$($venue.id)/review" -ContentType $json -Headers $admin -Body '{"status":"APPROVED"}' | Out-Null
  return $venue.id
}

$bunker = Get-VenueId "Klub Bunker" "Kopitareva 7, Nis" 43.3209 21.8958 250
$havana = Get-VenueId "Bar Havana" "Vozdova 14, Nis" 43.3186 21.9006 120
$splav = Get-VenueId "Splav Talas" "Kej kneginje Ljubice, Nis" 43.3236 21.8980 400
Write-Host "Lokali spremni: Klub Bunker, Bar Havana, Splav Talas"

function New-ApprovedParty($title, $dayOffset, $time, $price, $venueId, $genreNames, $performers) {
  $hour, $minute = $time.Split(":")
  $start = (Get-Date).Date.AddDays($dayOffset).AddHours([int]$hour).AddMinutes([int]$minute)
  $body = @{
    title = $title
    startsAt = $start.ToString("yyyy-MM-ddTHH:mm:sszzz")
    price = $price
    venueId = $venueId
    genreIds = @($genreNames | ForEach-Object { Get-GenreId $_ })
    performers = $performers
  } | ConvertTo-Json
  $party = Invoke-RestMethod -Method Post -Uri "$api/parties" -ContentType $json -Headers $owner -Body $body
  Invoke-RestMethod -Method Patch -Uri "$api/parties/$($party.id)/review" -ContentType $json -Headers $admin -Body '{"status":"APPROVED"}' | Out-Null
  Write-Host "Zurka: $title ($($start.ToString('dd.MM. HH:mm')))"
  return $party.id
}

$past = New-ApprovedParty "Proslo vece" -7 "23:00" 300 $bunker @("Techno") "DJ Vuk"
$tonight = New-ApprovedParty "Techno podrum" 0 "23:00" 500 $bunker @("Techno") "DJ Vuk, Mila K"
New-ApprovedParty "Trap vece" 0 "22:30" 0 $havana @("Hip-hop") "MC Rale" | Out-Null
New-ApprovedParty "House na splavu" 0 "22:00" 600 $splav @("House") "DJ Lena" | Out-Null
New-ApprovedParty "Ex-Yu rock svirka" 1 "21:00" 0 $havana @("Rock") "Bend Druga smena" | Out-Null
New-ApprovedParty "Latino vece" 1 "22:00" 300 $splav @("Latino") "DJ Carlos" | Out-Null
New-ApprovedParty "Bunker vikend" 2 "23:30" 600 $bunker @("Techno", "House") "DJ Vuk, DJ Tasa" | Out-Null

Invoke-RestMethod -Method Post -Uri "$api/attendances/$past" -Headers $user | Out-Null
Invoke-RestMethod -Method Post -Uri "$api/attendances/$tonight" -Headers $user | Out-Null
try {
  Invoke-RestMethod -Method Post -Uri "$api/venues/$bunker/reviews" -ContentType $json -Headers $user -Body '{"rating":5,"comment":"Odlican zvuk"}' | Out-Null
} catch { }
Write-Host "Gotovo. test@test.com dolazi na 'Techno podrum' i ocenio je Klub Bunker."