<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SiteSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'site_name',
        'support_email',
        'currency_code',
        'allow_registration',
        'maintenance_mode',
        'report_footer',
        'logo_path',
        'favicon_path',
    ];

    protected $casts = [
        'allow_registration' => 'boolean',
        'maintenance_mode' => 'boolean',
    ];
}
